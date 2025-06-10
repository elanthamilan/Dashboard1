import React from 'react';
import { Row, Col, Card, Statistic, Spin } from 'antd';
import { Invoice, Payment } from './types'; // Assuming types.ts is in the same directory
import { useTranslation } from 'react-i18next'; // Optional, for i18n

interface BillingSummaryKPIsProps {
  invoices: Invoice[];
  payments: Payment[];
  loading: boolean;
}

const BillingSummaryKPIs: React.FC<BillingSummaryKPIsProps> = ({ invoices, payments, loading }) => {
  const { t } = useTranslation(); // Optional

  const totalAmountInvoiced = invoices
    .filter(inv => inv.status !== 'Cancelled') // Exclude cancelled invoices from total invoiced
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const totalAmountPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);

  const totalAmountOutstanding = totalAmountInvoiced - totalAmountPaid;

  const numberOfOverdueInvoices = invoices.filter(inv => inv.status === 'Overdue').length;

  const kpiCardStyle = { marginBottom: '16px' }; // Consistent spacing

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
      <Col xs={24} sm={12} md={6}>
        <Card style={kpiCardStyle}>
          <Statistic
            title={t('billingDashboard.kpi.totalInvoiced', 'Total Invoiced')}
            value={totalAmountInvoiced}
            precision={2}
            prefix={t('currencySymbol', '$')} // Example currency symbol
            loading={loading}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={kpiCardStyle}>
          <Statistic
            title={t('billingDashboard.kpi.totalPaid', 'Total Paid')}
            value={totalAmountPaid}
            precision={2}
            prefix={t('currencySymbol', '$')}
            loading={loading}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={kpiCardStyle}>
          <Statistic
            title={t('billingDashboard.kpi.totalOutstanding', 'Total Outstanding')}
            value={totalAmountOutstanding >= 0 ? totalAmountOutstanding : 0} // Ensure not negative
            precision={2}
            prefix={t('currencySymbol', '$')}
            loading={loading}
            valueStyle={totalAmountOutstanding > 0 ? { color: '#cf1322' } : {}} // Red if outstanding
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={kpiCardStyle}>
          <Statistic
            title={t('billingDashboard.kpi.overdueInvoices', 'Overdue Invoices')}
            value={numberOfOverdueInvoices}
            loading={loading}
            valueStyle={numberOfOverdueInvoices > 0 ? { color: '#faad14' } : {}} // Orange if overdue
          />
        </Card>
      </Col>
    </Row>
  );
};

export default BillingSummaryKPIs;
