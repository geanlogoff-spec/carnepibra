
export interface Installment {
  id: string;
  number: number;
  dueDate: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  pixPayload: string;
  paymentDate?: string;
}

export interface Customer {
  name: string;
  document: string;
  email?: string;
}

export interface MerchantSettings {
  name: string;
  pixKey: string;
  city: string;
}

export interface Carne {
  id: string;
  customer: Customer;
  title: string;
  totalAmount: number;
  installments: Installment[];
  createdAt: string;
}

export interface CarneFormData {
  customerName: string;
  customerDocument: string;
  title: string;
  totalAmount: number;
  installmentsCount: number;
  firstDueDate: string;
}
