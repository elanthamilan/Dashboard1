// src/types/billing.ts

export type InvoiceStatus =
  | 'Draft'
  | 'Sent'
  | 'Paid'
  | 'Overdue'
  | 'Cancelled'
  | 'Partial' // For partially paid invoices
  | 'Pending Approval'; // If there's a workflow

export interface FeeItem {
  feeItemId: string;
  description: string;
  amount: number;
  quantity: number;
  category?: string; // e.g., Tuition, Lab Fee, Library Fine
  glCode?: string; // General Ledger code for accounting
}

export interface Invoice {
  invoiceId: string;
  studentId: string; // Links to Student.id or StudentSummary.studentId
  programId?: string; // Links to Program.programId
  semesterId?: string; // Links to Semester.semesterId
  issueDate: string; // ISO Date string
  dueDate: string; // ISO Date string
  paidDate?: string; // ISO Date string, if fully paid
  totalAmount: number;
  outstandingAmount: number;
  status: InvoiceStatus;
  items: FeeItem[];
  campusId?: string; // If billing is campus-specific
  notes?: string;
  paymentInstructions?: string;
  lateFeePolicy?: string;
  discountAmount?: number; // If any discount applied
  scholarshipAmount?: number; // If scholarship covers part of it
}

export type PaymentMethod =
  | 'Credit Card'
  | 'Bank Transfer'
  | 'Cash'
  | 'Check'
  | 'Online Portal' // More generic than PayPal
  | 'Mobile Payment'
  | 'Scholarship/Grant' // If it's a form of payment
  | 'Other';

export interface Payment {
  paymentId: string;
  invoiceId: string; // Links to Invoice.invoiceId
  studentId?: string; // Denormalized for easier lookup, links to Student.id
  paymentDate: string; // ISO Date string
  amountPaid: number;
  method: PaymentMethod;
  transactionId?: string; // For online payments or bank transfers
  referenceNumber?: string; // For checks or other manual methods
  processedBy?: string; // Staff ID or name
  notes?: string;
  isRefund?: boolean; // To mark if this is a refund transaction
  refundForPaymentId?: string; // If it's a refund, links to original payment
}
