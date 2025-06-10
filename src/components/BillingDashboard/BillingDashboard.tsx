import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Typography, Row, Col, Spin } from 'antd';
import { useTranslation } from 'react-i18next';

import { Invoice, Payment } from './types';
import { Student } from '../AttendanceDashboard/types'; // Adjust path as needed

import { generateMockStudents } from '../../utils/mockData/attendance/generateMockAttendanceData'; // Adjust path
import { generateMockInvoices, generateMockPayments } from '../../utils/mockData/billing/generateMockBillingData'; // Adjust path

import BillingSummaryKPIs from './BillingSummaryKPIs';
import InvoiceList from './InvoiceList';

const { Content } = Layout;
const { Title } = Typography;

const NUM_STUDENTS_FOR_BILLING = 50; // Define how many students to generate for billing data
const MAX_INVOICES_PER_STUDENT = 3;

const BillingDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [students, setStudents] = useState<Student[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    // Simulate API call or data generation
    setTimeout(() => {
      const mockStudents = generateMockStudents(NUM_STUDENTS_FOR_BILLING);
      const mockInvoices = generateMockInvoices(mockStudents, MAX_INVOICES_PER_STUDENT);
      const mockPayments = generateMockPayments(mockInvoices);

      setStudents(mockStudents);
      setInvoices(mockInvoices);
      setPayments(mockPayments);
      setLoading(false);
    }, 1000); // Simulate delay
  }, []);

  // Example handler for viewing invoice details (can be expanded later)
  const handleViewInvoiceDetails = (invoiceId: string) => {
    console.log("View details for invoice:", invoiceId);
    // Here you would typically show a modal or navigate to an invoice detail page
  };

  return (
    <Content style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>
        {t('billingDashboard.title', 'Billing Dashboard')}
      </Title>

      {loading && invoices.length === 0 ? ( // Show top-level spinner only on initial full load
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}>
          <Spin size="large" tip={t('common.loadingData', 'Loading Billing Data...')} />
        </div>
      ) : (
        <>
          <BillingSummaryKPIs invoices={invoices} payments={payments} loading={loading} />
          <InvoiceList
            invoices={invoices}
            students={students}
            loading={loading}
            onViewInvoiceDetails={handleViewInvoiceDetails}
          />
          {/* Future components like PaymentList or OverdueInvoiceAlerts can be added here */}
        </>
      )}
    </Content>
  );
};

export default BillingDashboard;
