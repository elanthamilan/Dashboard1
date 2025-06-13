// In src/types/billing.ts

export type InvoiceStatus = 'Draft' | 'Pending' | 'Paid' | 'Overdue' | 'Cancelled' | 'Partial Payment'; // Expanded

export type PaymentMethod = 'Credit Card' | 'Bank Transfer' | 'Cash' | 'Online Wallet' | 'Cheque' | 'Other'; // Expanded

export interface FeeItem {
  feeItemId: string; // Unique ID for this specific instance of a fee on an invoice
  feeItemName: string; // e.g., "Tuition Fee - Fall 2023", "Hostel Charges - Sept"
  description?: string; // More details about the fee item
  category?: 'Academic' | 'Hostel' | 'Library' | 'Examination' | 'Activity' | 'Fine' | 'Miscellaneous'; // New: Categorization
  quantity: number;
  unitPrice: number;
  totalAmount: number; // quantity * unitPrice
}

export interface DiscountApplication {
  discountId?: string; // Optional ID of a predefined discount
  description: string; // e.g., "Early Bird Discount", "Sibling Discount"
  amount: number; // Amount of the discount
}

export interface ScholarshipApplication {
  scholarshipId?: string; // Optional ID of a predefined scholarship
  scholarshipName: string; // e.g., "Merit Scholarship", "Alumni Grant"
  amount: number; // Amount of scholarship applied to this invoice
}

export interface Invoice {
  invoiceId: string;
  studentId: string;
  studentName?: string; // Denormalized
  programId?: string; // For grouping/filtering
  programName?: string; // Denormalized
  issueDate: string; // ISO YYYY-MM-DD
  dueDate: string; // ISO YYYY-MM-DD
  paidDate?: string; // ISO YYYY-MM-DD, only if status is 'Paid' or 'Partial Payment' with full amount covered eventually
  items: FeeItem[];
  subTotal: number; // Sum of all item totalAmounts
  discountsApplied?: DiscountApplication[]; // New
  scholarshipsApplied?: ScholarshipApplication[]; // New
  taxAmount?: number; // Optional
  totalAmount: number; // subTotal - discounts - scholarships + tax
  amountPaid: number;
  outstandingAmount: number; // totalAmount - amountPaid
  status: InvoiceStatus;
  paymentDeadline?: string; // New: Could be different from dueDate for installment plans etc.
  cancelledDate?: string; // New
  cancellationReason?: string; // New
  terms?: string; // e.g., "Payment due in 30 days upon receipt." - New
  notes?: string;
}

export interface Payment {
  paymentId: string;
  invoiceId: string; // Link to the invoice
  studentId: string;
  paymentDate: string; // ISO YYYY-MM-DD
  amountPaid: number;
  method: PaymentMethod;
  transactionId?: string; // New
  referenceNumber?: string; // e.g., Cheque number
  processedBy?: string; // Staff ID
  notes?: string; // New
}
