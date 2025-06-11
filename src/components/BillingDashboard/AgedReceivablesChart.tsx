import React, { useMemo } from 'react';
import { Bar } from '@ant-design/plots';
import { Card, Spin, Typography, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { Invoice, Payment } from './types'; // Assuming types are in ./types or adjust path
import dayjs from 'dayjs';

interface AgedReceivablesChartProps {
  invoices: Invoice[];
  payments: Payment[]; // All payments to calculate outstanding amounts
  loading: boolean;
}

interface ChartData {
  ageBucket: string;
  totalOutstanding: number;
}

const AgedReceivablesChart: React.FC<AgedReceivablesChartProps> = ({ invoices, payments, loading }) => {
  const { t } = useTranslation();

  const processedData = useMemo(() => {
    if (loading || !invoices || !payments) {
      return [];
    }

    const paymentsMap = new Map<string, number>();
    payments.forEach(payment => {
      paymentsMap.set(payment.invoiceId, (paymentsMap.get(payment.invoiceId) || 0) + payment.amount);
    });

    const BUCKETS = {
      '0-30 Days': { min: 0, max: 30, total: 0 },
      '31-60 Days': { min: 31, max: 60, total: 0 },
      '61-90 Days': { min: 61, max: 90, total: 0 },
      '91+ Days': { min: 91, max: Infinity, total: 0 },
    };

    invoices.forEach(invoice => {
      if (invoice.status === 'Paid') return; // Only interested in unpaid/overdue

      const totalPaid = paymentsMap.get(invoice.id) || 0;
      const outstandingAmount = invoice.totalAmount - totalPaid;

      if (outstandingAmount <= 0) return;

      const daysPastDue = dayjs().diff(dayjs(invoice.dueDate), 'day');
      if (daysPastDue < 0) return; // Due date is in the future or today, not past due

      for (const bucketName in BUCKETS) {
        const bucket = BUCKETS[bucketName as keyof typeof BUCKETS];
        if (daysPastDue >= bucket.min && daysPastDue <= bucket.max) {
          bucket.total += outstandingAmount;
          break;
        }
      }
    });

    return Object.entries(BUCKETS).map(([ageBucket, data]) => ({
        ageBucket,
        totalOutstanding: parseFloat(data.total.toFixed(2)), // Keep two decimal places for currency
      })).filter(item => item.totalOutstanding > 0); // Only show buckets with money

  }, [invoices, payments, loading]);

  if (loading) {
    return (
      <Card title={t('billingDashboard.charts.agedReceivablesTitle', 'Aged Accounts Receivable')}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}><Spin /></div>
      </Card>
    );
  }

  if (processedData.length === 0) {
    return (
      <Card title={t('billingDashboard.charts.agedReceivablesTitle', 'Aged Accounts Receivable')}>
        <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Empty description={t('common.noDataAvailable', 'No data available')} />
        </div>
      </Card>
    );
  }

  const chartConfig = {
    data: processedData,
    xField: 'totalOutstanding',
    yField: 'ageBucket',
    seriesField: 'ageBucket', // Color by bucket
    isStack: false,
    height: 300,
    legend: {
        position: 'top-right' as const,
        visible: false, // Y-axis labels are clear enough
    },
    barStyle: {
      // fill: can be set or let Ant Charts theme handle it
    },
    label: {
      position: 'middle' as const,
      content: (item: ChartData) => `${item.totalOutstanding.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`, // Format as currency, no decimals for space
      style: {
        fill: '#fff',
      },
      layout: [{ type: 'interval-adjust-position' }] as any[],
    },
    xAxis: {
      title: { text: t('billingDashboard.charts.totalOutstandingAxis', 'Total Outstanding Amount') },
      label: {
        formatter: (val: string) => {
            const num = parseFloat(val);
            if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
            if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
            return `${num.toFixed(0)}`;
        }
      },
    },
    yAxis: {
      title: { text: t('billingDashboard.charts.ageBucketAxis', 'Age Bucket') },
    },
    tooltip: {
      formatter: (datum: ChartData) => ({
        name: datum.ageBucket,
        value: `${t('billingDashboard.charts.totalOutstanding', 'Outstanding')}: ${datum.totalOutstanding.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}`, // Example currency formatting
      }),
    },
    padding: 'auto' as const,
  };

  return (
    <Card title={t('billingDashboard.charts.agedReceivablesTitle', 'Aged Accounts Receivable')}>
      <Bar {...chartConfig} />
    </Card>
  );
};

export default AgedReceivablesChart;
