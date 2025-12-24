-- ============================================
-- CarnêPIB.RA - Supabase Database Schema
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLES
-- ============================================

-- Users table (extends Supabase Auth)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    company_name VARCHAR(255),
    pix_key VARCHAR(255),
    city VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE public.customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    document VARCHAR(20), -- CPF or CNPJ
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Carnes table
CREATE TABLE public.carnes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount > 0),
    installments_count INTEGER NOT NULL CHECK (installments_count > 0 AND installments_count <= 60),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Installments table
CREATE TABLE public.installments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    carne_id UUID REFERENCES public.carnes(id) ON DELETE CASCADE NOT NULL,
    number INTEGER NOT NULL CHECK (number > 0),
    due_date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    pix_payload TEXT NOT NULL,
    pix_txid VARCHAR(50),
    payment_date TIMESTAMP WITH TIME ZONE,
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(carne_id, number)
);

-- Payment history/audit table
CREATE TABLE public.payment_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    installment_id UUID REFERENCES public.installments(id) ON DELETE CASCADE NOT NULL,
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by UUID REFERENCES public.profiles(id),
    change_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table (for merchant/user settings)
CREATE TABLE public.user_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================

-- Customers indexes
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_customers_document ON public.customers(document);
CREATE INDEX idx_customers_email ON public.customers(email);

-- Carnes indexes
CREATE INDEX idx_carnes_user_id ON public.carnes(user_id);
CREATE INDEX idx_carnes_customer_id ON public.carnes(customer_id);
CREATE INDEX idx_carnes_status ON public.carnes(status);
CREATE INDEX idx_carnes_created_at ON public.carnes(created_at DESC);

-- Installments indexes
CREATE INDEX idx_installments_carne_id ON public.installments(carne_id);
CREATE INDEX idx_installments_status ON public.installments(status);
CREATE INDEX idx_installments_due_date ON public.installments(due_date);
CREATE INDEX idx_installments_payment_date ON public.installments(payment_date);

-- Payment history indexes
CREATE INDEX idx_payment_history_installment_id ON public.payment_history(installment_id);
CREATE INDEX idx_payment_history_created_at ON public.payment_history(created_at DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to mark overdue installments
CREATE OR REPLACE FUNCTION mark_overdue_installments()
RETURNS void AS $$
BEGIN
    UPDATE public.installments
    SET status = 'overdue'
    WHERE status = 'pending'
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate carne statistics
CREATE OR REPLACE FUNCTION get_carne_stats(carne_uuid UUID)
RETURNS TABLE(
    total_paid DECIMAL,
    total_pending DECIMAL,
    paid_count INTEGER,
    pending_count INTEGER,
    overdue_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total_paid,
        COALESCE(SUM(CASE WHEN status IN ('pending', 'overdue') THEN amount ELSE 0 END), 0) as total_pending,
        COUNT(CASE WHEN status = 'paid' THEN 1 END)::INTEGER as paid_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END)::INTEGER as pending_count,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END)::INTEGER as overdue_count
    FROM public.installments
    WHERE carne_id = carne_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get user dashboard stats
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(user_uuid UUID)
RETURNS TABLE(
    total_carnes INTEGER,
    active_carnes INTEGER,
    total_receivable DECIMAL,
    total_received DECIMAL,
    pending_installments INTEGER,
    overdue_installments INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT c.id)::INTEGER as total_carnes,
        COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END)::INTEGER as active_carnes,
        COALESCE(SUM(CASE WHEN i.status IN ('pending', 'overdue') THEN i.amount ELSE 0 END), 0) as total_receivable,
        COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END), 0) as total_received,
        COUNT(CASE WHEN i.status = 'pending' THEN 1 END)::INTEGER as pending_installments,
        COUNT(CASE WHEN i.status = 'overdue' THEN 1 END)::INTEGER as overdue_installments
    FROM public.carnes c
    LEFT JOIN public.installments i ON c.id = i.carne_id
    WHERE c.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carnes_updated_at BEFORE UPDATE ON public.carnes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_installments_updated_at BEFORE UPDATE ON public.installments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to log payment status changes
CREATE OR REPLACE FUNCTION log_payment_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.payment_history (installment_id, previous_status, new_status)
        VALUES (NEW.id, OLD.status, NEW.status);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_installment_status_change
    AFTER UPDATE ON public.installments
    FOR EACH ROW
    EXECUTE FUNCTION log_payment_status_change();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carnes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Customers policies
CREATE POLICY "Users can view own customers"
    ON public.customers FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers"
    ON public.customers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers"
    ON public.customers FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers"
    ON public.customers FOR DELETE
    USING (auth.uid() = user_id);

-- Carnes policies
CREATE POLICY "Users can view own carnes"
    ON public.carnes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own carnes"
    ON public.carnes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own carnes"
    ON public.carnes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own carnes"
    ON public.carnes FOR DELETE
    USING (auth.uid() = user_id);

-- Installments policies
CREATE POLICY "Users can view own installments"
    ON public.installments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.carnes
            WHERE carnes.id = installments.carne_id
            AND carnes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own installments"
    ON public.installments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.carnes
            WHERE carnes.id = installments.carne_id
            AND carnes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own installments"
    ON public.installments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.carnes
            WHERE carnes.id = installments.carne_id
            AND carnes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own installments"
    ON public.installments FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.carnes
            WHERE carnes.id = installments.carne_id
            AND carnes.user_id = auth.uid()
        )
    );

-- Payment history policies (read-only for users)
CREATE POLICY "Users can view own payment history"
    ON public.payment_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.installments i
            JOIN public.carnes c ON i.carne_id = c.id
            WHERE i.id = payment_history.installment_id
            AND c.user_id = auth.uid()
        )
    );

-- User settings policies
CREATE POLICY "Users can view own settings"
    ON public.user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
    ON public.user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
    ON public.user_settings FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- INITIAL DATA / SETUP
-- ============================================

-- Create a function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, email, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    
    INSERT INTO public.user_settings (user_id, settings)
    VALUES (NEW.id, '{}'::jsonb);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- VIEWS for easier querying
-- ============================================

-- View for carnes with customer info
CREATE OR REPLACE VIEW carnes_with_customers AS
SELECT
    c.*,
    cust.name as customer_name,
    cust.document as customer_document,
    cust.email as customer_email,
    cust.phone as customer_phone
FROM public.carnes c
JOIN public.customers cust ON c.customer_id = cust.id;

-- View for installments with carne and customer info
CREATE OR REPLACE VIEW installments_full AS
SELECT
    i.*,
    c.title as carne_title,
    c.total_amount as carne_total,
    c.status as carne_status,
    cust.name as customer_name,
    cust.document as customer_document
FROM public.installments i
JOIN public.carnes c ON i.carne_id = c.id
JOIN public.customers cust ON c.customer_id = cust.id;

-- ============================================
-- SCHEDULED JOBS (to be configured in Supabase Dashboard)
-- ============================================

-- Run daily to mark overdue installments
-- SELECT cron.schedule('mark-overdue-installments', '0 1 * * *', 'SELECT mark_overdue_installments()');

-- ============================================
-- COMMENTS for documentation
-- ============================================

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase Auth';
COMMENT ON TABLE public.customers IS 'Customers who receive carnes';
COMMENT ON TABLE public.carnes IS 'Payment booklets (carnes) with multiple installments';
COMMENT ON TABLE public.installments IS 'Individual payment installments';
COMMENT ON TABLE public.payment_history IS 'Audit log of payment status changes';
COMMENT ON TABLE public.user_settings IS 'User-specific settings and preferences';

-- ============================================
-- GRANTS (if needed for specific roles)
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant privileges on all tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant privileges on sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- END OF SCHEMA
-- ============================================
