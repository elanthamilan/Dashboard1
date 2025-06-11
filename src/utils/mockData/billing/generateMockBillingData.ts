import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';
import { Student } from '../../../components/AttendanceDashboard/types'; // Adjust path if needed
import { FeeItem, Invoice, InvoiceStatus, Payment, PaymentMethod } from '../../../components/BillingDashboard/types'; // Adjust path if needed

const commonFeeDescriptions = [
  "Tuition Fee", "Registration Fee", "Library Fee", "Lab Usage Fee",
  "Technology Fee", "Student Activity Fee", "Exam Fee", "Graduation Fee",
  "Late Payment Surcharge", "Transcript Request Fee"
];

const paymentMethods: PaymentMethod[] = ['Credit Card', 'Bank Transfer', 'PayPal', 'Check', 'Cash'];
const invoiceStatuses: InvoiceStatus[] = ['Paid', 'Unpaid', 'Overdue', 'Sent', 'Draft']; // Skew towards actionable statuses

export const generateMockFeeItems = (count: number): FeeItem[] => {
  const feeItems: FeeItem[] = [];
  const usedDescriptions = new Set<string>();

  for (let i = 0; i < count; i++) {
    let description = faker.helpers.arrayElement(commonFeeDescriptions);
    // Ensure somewhat unique descriptions if count is small enough
    if (count <= commonFeeDescriptions.length) {
      while (usedDescriptions.has(description)) {
        description = faker.helpers.arrayElement(commonFeeDescriptions);
      }
      usedDescriptions.add(description);
    } else { // If more items than predefined, add a suffix
        description = `${description} - ${faker.lorem.word()}`;
    }

    feeItems.push({
      feeItemId: `FEE-${String(i + 1).padStart(4, '0')}`,
      description,
      amount: parseFloat(faker.finance.amount({ min: 20, max: 2000, dec: 2 })),
    });
  }
  return feeItems;
};

let invoiceIdCounter = 1;
const allGeneratedFeeItems = generateMockFeeItems(20); // Generate a pool of fee items

export const generateMockInvoices = (
  students: Student[],
  countPerStudentMax: number,
  overdueCohortStudentIds?: Set<string> // Added for data realism
): Invoice[] => {
  const invoices: Invoice[] = [];

  students.forEach(student => {
    const numberOfInvoices = faker.number.int({ min: 1, max: countPerStudentMax });
    for (let i = 0; i < numberOfInvoices; i++) {
      const issueDate = dayjs(faker.date.past({ years: 2 }));
      const dueDate = issueDate.add(faker.number.int({min: 15, max: 45}), 'day');
      const status = faker.helpers.arrayElement(invoiceStatuses);

      let paidDate: string | undefined = undefined;
      if (status === 'Paid') {
        paidDate = dayjs(faker.date.between({ from: issueDate.toDate(), to: dueDate.add(10, 'day').toDate() })).toISOString();
      }

      // Ensure overdue status is logical
      let finalStatus = status;
      const isPastDue = dayjs().isAfter(dueDate);

      if (status !== 'Paid' && status !== 'Draft' && status !== 'Cancelled' && isPastDue) {
        finalStatus = 'Overdue';
      }

      // DATA REALISM: Increase likelihood of overdue invoices for a specific cohort
      if (overdueCohortStudentIds?.has(student.id) &&
          isPastDue &&
          (finalStatus === 'Unpaid' || finalStatus === 'Sent')) {
        if (Math.random() < 0.7) { // 70% chance to make it overdue for this cohort if it's past due and unpaid/sent
            finalStatus = 'Overdue';
            // console.log(`INFO: Forcing overdue for cohort student ${student.id}, invoice INV-${invoiceIdCounter}`);
        }
      }

      if (finalStatus === 'Draft' && Math.random() < 0.3) { // Some drafts get cancelled
          finalStatus = 'Cancelled';
      }


      const itemsForThisInvoice = faker.helpers.arrayElements(allGeneratedFeeItems, faker.number.int({ min: 1, max: 5 }));
      const totalAmount = itemsForThisInvoice.reduce((sum, item) => sum + item.amount, 0);

      invoices.push({
        invoiceId: `INV-${String(invoiceIdCounter++).padStart(6, '0')}`,
        studentId: student.id,
        programId: student.homeroom, // Using homeroom as a proxy for programId if available on student
        issueDate: issueDate.toISOString(),
        dueDate: dueDate.toISOString(),
        paidDate,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        status: finalStatus,
        items: itemsForThisInvoice,
      });
    }
  });
  return invoices;
};

let paymentIdCounter = 1;

export const generateMockPayments = (invoices: Invoice[]): Payment[] => {
  const payments: Payment[] = [];

  invoices.forEach(invoice => {
    // Generate payments for a subset of 'Paid' invoices and potentially some 'Unpaid' or 'Overdue' (partial payments)
    if (invoice.status === 'Paid' || (invoice.status === 'Unpaid' && Math.random() < 0.3) || (invoice.status === 'Overdue' && Math.random() < 0.2)) {
      const isPartialPayment = invoice.status !== 'Paid' && Math.random() < 0.5;
      const amountPaid = isPartialPayment
        ? parseFloat(faker.finance.amount({ min: 1, max: invoice.totalAmount * 0.8, dec: 2 }))
        : invoice.totalAmount;

      let paymentDateSource = invoice.issueDate;
      if (invoice.status === 'Paid' && invoice.paidDate) {
        paymentDateSource = invoice.paidDate; // Payment date should be on or before paidDate
      }

      const paymentDate = dayjs(faker.date.recent({ days: 10, refDate: paymentDateSource })).toISOString();
      const method = faker.helpers.arrayElement(paymentMethods);

      payments.push({
        paymentId: `PAY-${String(paymentIdCounter++).padStart(7, '0')}`,
        invoiceId: invoice.invoiceId,
        studentId: invoice.studentId,
        paymentDate,
        amountPaid,
        method,
        transactionId: (method === 'Credit Card' || method === 'PayPal') ? faker.string.alphanumeric(16).toUpperCase() : undefined,
      });
    }
  });
  return payments;
};
