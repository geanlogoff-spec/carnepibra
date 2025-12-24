export interface Customer {
    id?: string;
    name: string;
    document?: string;
    email?: string;
    phone?: string;
    address?: string;
}

export interface Installment {
    id: string;
    number: number;
    dueDate: string;
    amount: number;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    pixPayload: string;
    paymentDate?: string;
}

export interface Carne {
    id: string;
    customer: Customer;
    title: string;
    totalAmount: number;
    installments: Installment[];
    createdAt: string;
}

export interface MerchantSettings {
    name: string;
    city: string;
    pixKey: string;
    logoUrl?: string;
}
