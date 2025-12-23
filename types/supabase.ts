/**
 * Supabase TypeScript Database Types
 * Generated based on the database schema
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    username: string
                    email: string
                    full_name: string | null
                    company_name: string | null
                    pix_key: string | null
                    city: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    username: string
                    email: string
                    full_name?: string | null
                    company_name?: string | null
                    pix_key?: string | null
                    city?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    username?: string
                    email?: string
                    full_name?: string | null
                    company_name?: string | null
                    pix_key?: string | null
                    city?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            customers: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    document: string | null
                    email: string | null
                    phone: string | null
                    address: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    document?: string | null
                    email?: string | null
                    phone?: string | null
                    address?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    document?: string | null
                    email?: string | null
                    phone?: string | null
                    address?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            carnes: {
                Row: {
                    id: string
                    user_id: string
                    customer_id: string
                    title: string
                    description: string | null
                    total_amount: number
                    installments_count: number
                    status: 'active' | 'completed' | 'cancelled'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    customer_id: string
                    title: string
                    description?: string | null
                    total_amount: number
                    installments_count: number
                    status?: 'active' | 'completed' | 'cancelled'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    customer_id?: string
                    title?: string
                    description?: string | null
                    total_amount?: number
                    installments_count?: number
                    status?: 'active' | 'completed' | 'cancelled'
                    created_at?: string
                    updated_at?: string
                }
            }
            installments: {
                Row: {
                    id: string
                    carne_id: string
                    number: number
                    due_date: string
                    amount: number
                    status: 'pending' | 'paid' | 'overdue' | 'cancelled'
                    pix_payload: string
                    pix_txid: string | null
                    payment_date: string | null
                    payment_method: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    carne_id: string
                    number: number
                    due_date: string
                    amount: number
                    status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
                    pix_payload: string
                    pix_txid?: string | null
                    payment_date?: string | null
                    payment_method?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    carne_id?: string
                    number?: number
                    due_date?: string
                    amount?: number
                    status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
                    pix_payload?: string
                    pix_txid?: string | null
                    payment_date?: string | null
                    payment_method?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            payment_history: {
                Row: {
                    id: string
                    installment_id: string
                    previous_status: string | null
                    new_status: string
                    changed_by: string | null
                    change_reason: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    installment_id: string
                    previous_status?: string | null
                    new_status: string
                    changed_by?: string | null
                    change_reason?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    installment_id?: string
                    previous_status?: string | null
                    new_status?: string
                    changed_by?: string | null
                    change_reason?: string | null
                    created_at?: string
                }
            }
            user_settings: {
                Row: {
                    id: string
                    user_id: string
                    settings: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    settings?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    settings?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            carnes_with_customers: {
                Row: {
                    id: string | null
                    user_id: string | null
                    customer_id: string | null
                    title: string | null
                    description: string | null
                    total_amount: number | null
                    installments_count: number | null
                    status: string | null
                    created_at: string | null
                    updated_at: string | null
                    customer_name: string | null
                    customer_document: string | null
                    customer_email: string | null
                    customer_phone: string | null
                }
            }
            installments_full: {
                Row: {
                    id: string | null
                    carne_id: string | null
                    number: number | null
                    due_date: string | null
                    amount: number | null
                    status: string | null
                    pix_payload: string | null
                    pix_txid: string | null
                    payment_date: string | null
                    payment_method: string | null
                    notes: string | null
                    created_at: string | null
                    updated_at: string | null
                    carne_title: string | null
                    carne_total: number | null
                    carne_status: string | null
                    customer_name: string | null
                    customer_document: string | null
                }
            }
        }
        Functions: {
            get_carne_stats: {
                Args: { carne_uuid: string }
                Returns: {
                    total_paid: number
                    total_pending: number
                    paid_count: number
                    pending_count: number
                    overdue_count: number
                }[]
            }
            get_user_dashboard_stats: {
                Args: { user_uuid: string }
                Returns: {
                    total_carnes: number
                    active_carnes: number
                    total_receivable: number
                    total_received: number
                    pending_installments: number
                    overdue_installments: number
                }[]
            }
            mark_overdue_installments: {
                Args: Record<PropertyKey, never>
                Returns: void
            }
        }
        Enums: {
            [_ in never]: never
        }
    }
}
