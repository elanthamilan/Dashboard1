import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';
import { Invoice, Payment, FeeItem, InvoiceStatus, PaymentMethod, DiscountApplication, ScholarshipApplication } from '../../../types/billing'; // Ensure path
import { StudentSummary } from '../../../types/hierarchy'; // For student info

const invoiceStatuses: InvoiceStatus[] = ['Pending', 'Paid', 'Overdue', 'Cancelled', 'Partial Payment', 'Draft'];
const paymentMethods: PaymentMethod[] = ['Credit Card', 'Bank Transfer', 'Online Wallet', 'Cheque', 'Cash', 'Other'];
const feeCategories: FeeItem['category'][] = ['Academic', 'Hostel', 'Library', 'Examination', 'Activity', 'Fine', 'Miscellaneous'];

const generateMockFeeItems = (count: number): FeeItem[] => {
  const items: FeeItem[] = [];
  for (let i = 0; i < count; i++) {
    const quantity = faker.number.int({ min: 1, max: 2 }); // Usually 1, sometimes more for things like exam retakes
    const unitPrice = parseFloat(faker.finance.amount({ min: 20, max: 1500, dec: 2 }));
    const category = faker.helpers.arrayElement(feeCategories);
    let feeItemName = `${faker.commerce.productName()} Fee`;
    if (category === 'Academic') feeItemName = `${faker.helpers.arrayElement(['Spring', 'Fall', 'Summer'])} ${dayjs().year() - faker.number.int({min:0, max:2})} ${faker.helpers.arrayElement(['Tuition', 'Module Fee', 'Resource Fee'])}`;
    else if (category === 'Hostel') feeItemName = `Hostel Charges - ${faker.date.month()}`;
    else if (category === 'Examination') feeItemName = `${faker.helpers.arrayElement(['Mid-term', 'Final', 'Retake'])} Exam Fee`;
    else if (category === 'Library') feeItemName = faker.helpers.arrayElement(['Late Return Fine', 'Book Replacement Fee']);


    items.push({
      feeItemId: faker.string.uuid(),
      feeItemName,
      category,
      quantity,
      unitPrice,
      totalAmount: parseFloat((quantity * unitPrice).toFixed(2)),
      description: faker.lorem.sentence(faker.number.int({ min: 3, max: 8 }))
    });
  }
  return items;
};

export function generateMockInvoices(students: StudentSummary[], numInvoicesPerStudentMax: number = 3): Invoice[] {
  const invoices: Invoice[] = [];
  let invoiceIdCounter = 1;

  students.forEach(student => {
    const numInvoices = faker.number.int({ min: 1, max: numInvoicesPerStudentMax });
    for (let i = 0; i < numInvoices; i++) {
      const issueDate = dayjs(faker.date.past({ years: 1, refDate: dayjs().subtract(i * 4, 'month').toDate() }));
      const dueDate = issueDate.add(faker.number.int({ min: 15, max: 30 }), 'days');
      let status = faker.helpers.arrayElement(invoiceStatuses);

      const items = generateMockFeeItems(faker.number.int({ min: 1, max: 4 }));
      const subTotal = items.reduce((sum, item) => sum + item.totalAmount, 0);

      let discountsApplied: DiscountApplication[] | undefined = undefined;
      let scholarshipsApplied: ScholarshipApplication[] | undefined = undefined;
      let currentTotal = subTotal;

      if (Math.random() < 0.25) { // 25% chance of discount
        const discountAmount = parseFloat(faker.finance.amount({ min: 10, max: Math.max(20,currentTotal * 0.10), dec: 2 }));
        discountsApplied = [{ discountId: faker.string.uuid(), description: "Early Bird Discount", amount: discountAmount }];
        currentTotal -= discountAmount;
      }
      if (Math.random() < 0.15) { // 15% chance of scholarship
        const scholarshipAmount = parseFloat(faker.finance.amount({ min: 50, max: Math.max(100, currentTotal * 0.25), dec: 2 }));
        scholarshipsApplied = [{ scholarshipId: faker.string.uuid(), scholarshipName: "Merit Scholarship", amount: scholarshipAmount }];
        currentTotal -= scholarshipAmount;
      }

      const taxRate = 0.05; // 5% tax example
      const taxAmount = Math.random() < 0.5 ? parseFloat((currentTotal * taxRate).toFixed(2)) : undefined;
      if(taxAmount) currentTotal += taxAmount;

      const finalTotal = Math.max(0, parseFloat(currentTotal.toFixed(2)));

      let amountPaid = 0;
      let paidDate: string | undefined = undefined;
      let outstandingAmount = finalTotal;

      // Adjust status based on dates and payments
      if (status !== 'Cancelled' && status !== 'Draft') {
        if (dayjs().isAfter(dueDate) && finalTotal > 0) {
            status = 'Overdue'; // If past due and not fully paid (or draft/cancelled), it's Overdue
        }
      }

      if (status === 'Paid') {
        amountPaid = finalTotal;
        paidDate = dayjs(dueDate).subtract(faker.number.int({ min: 0, max: 10 }), 'days').format('YYYY-MM-DD');
        outstandingAmount = 0;
      } else if (status === 'Partial Payment') {
        amountPaid = parseFloat(faker.finance.amount({ min: 1, max: Math.max(1, finalTotal * 0.8), dec: 2 }));
        paidDate = dayjs(dueDate).add(faker.number.int({ min: -5, max: 5 }), 'days').format('YYYY-MM-DD');
        outstandingAmount = parseFloat((finalTotal - amountPaid).toFixed(2));
        if(outstandingAmount < 0.01) { // If very small amount remaining, mark as paid
            outstandingAmount = 0;
            amountPaid = finalTotal;
            status = 'Paid';
        } else if (dayjs().isAfter(dueDate)) {
            status = 'Overdue'; // A partial payment can still be overdue
        }

      } else if (status === 'Overdue') {
        if(Math.random() < 0.3) {
            amountPaid = parseFloat(faker.finance.amount({ min: 1, max: Math.max(1, finalTotal * 0.5), dec: 2 }));
            outstandingAmount = parseFloat((finalTotal - amountPaid).toFixed(2));
        } else {
            amountPaid = 0;
            outstandingAmount = finalTotal;
        }
      } else if (status === 'Pending' || status === 'Draft'){
         amountPaid = 0;
         outstandingAmount = finalTotal;
      } else if (status === 'Cancelled'){
         amountPaid = 0;
         outstandingAmount = 0;
      }

      const invoice: Invoice = {
        invoiceId: `INV-${String(invoiceIdCounter++).padStart(5, '0')}`,
        studentId: student.studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        programId: student.programId,
        programName: student.programName,
        issueDate: issueDate.format('YYYY-MM-DD'),
        dueDate: dueDate.format('YYYY-MM-DD'),
        paidDate,
        items,
        subTotal: parseFloat(subTotal.toFixed(2)),
        discountsApplied,
        scholarshipsApplied,
        taxAmount,
        totalAmount: finalTotal,
        amountPaid: parseFloat(amountPaid.toFixed(2)),
        outstandingAmount: parseFloat(outstandingAmount.toFixed(2)),
        status: status,
        paymentDeadline: status !== 'Paid' && status !== 'Cancelled' ? dueDate.add(faker.number.int({min:0, max:7}), 'days').format('YYYY-MM-DD') : undefined,
        cancelledDate: status === 'Cancelled' ? issueDate.add(faker.number.int({min:1, max:10}), 'days').format('YYYY-MM-DD') : undefined,
        cancellationReason: status === 'Cancelled' ? faker.lorem.sentence(faker.number.int({min:3, max:7})) : undefined,
        terms: "Standard payment terms: Net 30 days. Late fees may apply.",
        notes: Math.random() < 0.15 ? faker.lorem.paragraph(1) : undefined,
      };
      invoices.push(invoice);
    }
  });
  return invoices;
}

export function generateMockPayments(invoices: Invoice[]): Payment[] {
  const payments: Payment[] = [];
  let paymentIdCounter = 1;

  invoices.forEach(invoice => {
    if (invoice.amountPaid > 0) { // Generate payments if there's an amount paid
        let amountToCoverByPayments = invoice.amountPaid;
        // For simplicity, create one payment record for Paid or Partial, but could be multiple for partial
        const numPaymentsForThisInvoice = (invoice.status === 'Partial Payment' && Math.random() > 0.6 && amountToCoverByPayments > 20) ? 2 : 1;

        for(let i=0; i < numPaymentsForThisInvoice; i++){
            if(amountToCoverByPayments <= 0.01) break;

            const paymentAmount = (i === numPaymentsForThisInvoice -1)
                                  ? amountToCoverByPayments
                                  : parseFloat(faker.finance.amount({min:1, max: amountToCoverByPayments * 0.7, dec:2}));

            amountToCoverByPayments -= paymentAmount;
            amountToCoverByPayments = parseFloat(amountToCoverByPayments.toFixed(2));

            // Payment date should be on or before invoice.paidDate if it exists, or around dueDate for partials.
            let baseDateForPayment = invoice.paidDate ? dayjs(invoice.paidDate) : dayjs(invoice.dueDate);
            // If it's a partial payment that made it overdue, payment could be after due date
            if (invoice.status === 'Overdue' && invoice.amountPaid > 0) {
                baseDateForPayment = dayjs(invoice.dueDate).add(faker.number.int({min:1, max:15}), 'day');
            }
            // If multiple payments, stagger them slightly before the final paidDate or around due date
            const paymentDate = baseDateForPayment.subtract( (numPaymentsForThisInvoice - 1 - i) * faker.number.int({min:1, max:5}), 'days' );


            payments.push({
                paymentId: `PAY-${String(paymentIdCounter++).padStart(6, '0')}`,
                invoiceId: invoice.invoiceId,
                studentId: invoice.studentId,
                paymentDate: paymentDate.format('YYYY-MM-DD'),
                amountPaid: parseFloat(paymentAmount.toFixed(2)),
                method: faker.helpers.arrayElement(paymentMethods),
                transactionId: faker.string.alphanumeric(12).toUpperCase(),
                referenceNumber: Math.random() < 0.4 ? `CHEQUE-${faker.string.numeric(6)}` : undefined,
                processedBy: `STAFF-${faker.string.alphanumeric(3).toUpperCase()}`,
                notes: Math.random() < 0.15 ? faker.lorem.sentence(faker.number.int({min:2, max:5})) : undefined,
            });
        }
    }
  });
  return payments;
}
