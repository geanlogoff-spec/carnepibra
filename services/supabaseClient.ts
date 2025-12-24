
/**
 * Supabase Client Configuration
 * 
 * This file sets up the Supabase client for authentication and database operations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Supabase configuration from environment variables
// IMPORTANTE: Na Vercel, certifique-se de adicionar estas variáveis nas configurações do projeto!
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Exportar a verificação para uso em outros lugares
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
    console.error('⚠️ Supabase URL or Anon Key NOT FOUND. Please configure VITE_SUPABASE_URL in your environment variables.');
}

// Create Supabase client safely
// Se não houver configuração, cria um cliente "dummy" que não vai quebrar o import, 
// mas métodos falharão graciosamente ou app deve checar isSupabaseConfigured
export const supabase: SupabaseClient<Database> = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: window.localStorage,
            storageKey: 'carnepibra-auth-token',
        },
        db: {
            schema: 'public'
        },
        global: {
            headers: {
                'x-application-name': 'CarnePIBRA'
            }
        }
    })
    : {} as any; // Fallback temporário para evitar White Screen of Death na inicialização

// Auth helpers
export const auth = {
    /**
     * Sign up a new user
     */
    async signUp(email: string, password: string, metadata?: { username?: string; full_name?: string }) {
        if (!isSupabaseConfigured) throw new Error("Supabase não configurado. Verifique as variáveis de ambiente.");
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
                emailRedirectTo: `${window.location.origin}/auth/callback`
            }
        });

        if (error) throw error;
        return data;
    },

    /**
     * Sign in with email and password
     */
    async signIn(email: string, password: string) {
        if (!isSupabaseConfigured) throw new Error("Supabase não configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return data;
    },

    /**
     * Sign out current user
     */
    async signOut() {
        if (!isSupabaseConfigured) return;
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    /**
     * Get current user session
     */
    async getSession() {
        if (!isSupabaseConfigured) return null;
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
    },

    /**
     * Get current user
     */
    async getUser() {
        if (!isSupabaseConfigured) return null;
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        return data.user;
    },

    /**
     * Reset password
     */
    async resetPassword(email: string) {
        if (!isSupabaseConfigured) throw new Error("Supabase não configurado.");
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`
        });

        if (error) throw error;
    },

    /**
     * Update password
     */
    async updatePassword(newPassword: string) {
        if (!isSupabaseConfigured) throw new Error("Supabase não configurado.");
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;
    }
};

// Database helpers
export const db = {
    /**
     * Get user profile
     */
    async getProfile(userId: string) {
        if (!isSupabaseConfigured) return null;
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Update user profile
     */
    async updateProfile(userId: string, updates: Partial<Database['public']['Tables']['profiles']['Update']>) {
        if (!isSupabaseConfigured) throw new Error("Supabase não configurado.");
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Get all customers for a user
     */
    async getCustomers(userId: string) {
        if (!isSupabaseConfigured) return [];
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('user_id', userId)
            .order('name');

        if (error) throw error;
        return data;
    },

    /**
     * Create a new customer
     */
    async createCustomer(customer: Database['public']['Tables']['customers']['Insert']) {
        if (!isSupabaseConfigured) throw new Error("Supabase não configurado.");
        const { data, error } = await supabase
            .from('customers')
            .insert(customer)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Update a customer
     */
    async updateCustomer(customerId: string, updates: Partial<Database['public']['Tables']['customers']['Update']>) {
        if (!isSupabaseConfigured) throw new Error("Supabase não configurado.");
        const { data, error } = await supabase
            .from('customers')
            .update(updates)
            .eq('id', customerId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Delete a customer
     */
    async deleteCustomer(customerId: string) {
        if (!isSupabaseConfigured) throw new Error("Supabase não configurado.");
        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', customerId);

        if (error) throw error;
    },

    /**
     * Get all carnes for a user
     */
    async getCarnes(userId: string) {
        if (!isSupabaseConfigured) return [];
        const { data, error } = await supabase
            .from('carnes')
            .select(`
        *,
        customer:customers(*),
        installments(*)
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // ADMIN: Buscar TODOS os carnês da plataforma
    async getAllCarnesAdmin() {
        if (!isSupabaseConfigured) return [];
        const { data, error } = await supabase
            .from('carnes')
            .select(`
        *,
        customer:customers(*),
        installments(*)
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // ADMIN: Buscar TODOS os clientes
    async getAllCustomersAdmin() {
        if (!isSupabaseConfigured) return [];
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .order('name');

        if (error) throw error;
        return data;
    },

    /**
     * Get a specific carne with all details
     */
    async getCarne(carneId: string) {
        const { data, error } = await supabase
            .from('carnes')
            .select(`
        *,
        customer:customers(*),
        installments(*)
      `)
            .eq('id', carneId)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Create a new carne with installments
     */
    async createCarne(
        carne: Database['public']['Tables']['carnes']['Insert'],
        installments: Database['public']['Tables']['installments']['Insert'][]
    ) {
        // Insert carne
        const { data: carneData, error: carneError } = await supabase
            .from('carnes')
            .insert(carne)
            .select()
            .single();

        if (carneError) throw carneError;

        // Insert installments
        const installmentsWithCarneId = installments.map(inst => ({
            ...inst,
            carne_id: carneData.id
        }));

        const { data: installmentsData, error: installmentsError } = await supabase
            .from('installments')
            .insert(installmentsWithCarneId)
            .select();

        if (installmentsError) throw installmentsError;

        return { carne: carneData, installments: installmentsData };
    },

    /**
     * Update installment status
     */
    async updateInstallmentStatus(
        installmentId: string,
        status: 'pending' | 'paid' | 'overdue' | 'cancelled',
        paymentDate?: string
    ) {
        const { data, error } = await supabase
            .from('installments')
            .update({
                status,
                payment_date: paymentDate || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', installmentId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Delete a carne (cascades to installments)
     */
    async deleteCarne(carneId: string) {
        const { error } = await supabase
            .from('carnes')
            .delete()
            .eq('id', carneId);

        if (error) throw error;
    },

    /**
     * Get dashboard statistics
     */
    async getDashboardStats(userId: string) {
        const { data, error } = await supabase
            .rpc('get_user_dashboard_stats', { user_uuid: userId });

        if (error) throw error;
        return data[0];
    },

    /**
     * Get user settings
     */
    async getSettings(userId: string) {
        const { data, error } = await supabase
            .from('user_settings')
            .select('settings')
            .eq('user_id', userId)
            .single();

        if (error) {
            // If settings don't exist, create them
            if (error.code === 'PGRST116') {
                return await this.createSettings(userId, {});
            }
            throw error;
        }
        return data.settings;
    },

    /**
     * Create user settings
     */
    async createSettings(userId: string, settings: any) {
        const { data, error } = await supabase
            .from('user_settings')
            .insert({ user_id: userId, settings })
            .select('settings')
            .single();

        if (error) throw error;
        return data.settings;
    },

    /**
     * Update user settings
     */
    async updateSettings(userId: string, settings: any) {
        const { data, error } = await supabase
            .from('user_settings')
            .update({ settings })
            .eq('user_id', userId)
            .select('settings')
            .single();

        if (error) throw error;
        return data.settings;
    }
};

// Realtime subscriptions helper
export const realtime = {
    /**
     * Subscribe to installments changes
     */
    subscribeToInstallments(userId: string, callback: (payload: any) => void) {
        return supabase
            .channel('installments-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'installments',
                    filter: `carne_id=in.(select id from carnes where user_id=${userId})`
                },
                callback
            )
            .subscribe();
    }
};

export default supabase;
