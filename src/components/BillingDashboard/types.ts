export interface FeeItem {
  feeItemId: string;
  description: string;
  amount: number;
  category?: string; // Optional: For categorizing revenue sources like Tuition, Fees, Other
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Unpaid' | 'Overdue' | 'Cancelled';

export interface Invoice {
  invoiceId: string;
  studentId: string;
  programId?: string; // Optional, as student might not always be in a specific program or it might be general fees
  issueDate: string; // ISO string
  dueDate: string; // ISO string
  paidDate?: string; // ISO string, only if status is 'Paid'
  totalAmount: number;
  status: InvoiceStatus;
  items: FeeItem[];
}

export type PaymentMethod = 'Credit Card' | 'Bank Transfer' | 'PayPal' | 'Check' | 'Cash';

export interface Payment {
  paymentId: string;
  invoiceId: string;
  studentId: string;
  paymentDate: string; // ISO string
  amountPaid: number;
  method: PaymentMethod;
  transactionId?: string; // Optional, e.g., for card or PayPal transactions
}
