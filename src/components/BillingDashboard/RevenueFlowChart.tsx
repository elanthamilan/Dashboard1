import React, { useMemo } from 'react';
import { Waterfall } from '@ant-design/plots';
import { Card, Spin, Typography, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { Invoice, FeeItem } from './types'; // Assuming types are in ./types or adjust path

interface RevenueFlowChartProps {
  invoices: Invoice[];
  loading: boolean;
}

interface WaterfallData {
  type: string;
  value: number;
  isTotal?: boolean;
}

const RevenueFlowChart: React.FC<RevenueFlowChartProps> = ({ invoices, loading }) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    if (loading || !invoices) {
      return [];
    }

    let totalGrossRevenue = 0;
    let totalScholarshipsAndWaivers = 0;

    invoices.forEach(invoice => {
      if (invoice.status === 'Cancelled') { // Exclude cancelled invoices from revenue flow
        return;
      }
      invoice.items.forEach(item => {
        if (item.amount > 0) {
          totalGrossRevenue += item.amount;
        } else if (item.amount < 0) {
          totalScholarshipsAndWaivers += Math.abs(item.amount);
        }
      });
    });

    totalGrossRevenue = parseFloat(totalGrossRevenue.toFixed(2));
    totalScholarshipsAndWaivers = parseFloat(totalScholarshipsAndWaivers.toFixed(2));
    const netExpectedRevenue = parseFloat((totalGrossRevenue - totalScholarshipsAndWaivers).toFixed(2));

    if (totalGrossRevenue === 0 && totalScholarshipsAndWaivers === 0) {
        return []; // No data to display
    }

    const data: WaterfallData[] = [
      { type: t('billingDashboard.charts.revenueFlow.totalBilled', 'Total Billed'), value: totalGrossRevenue },
      { type: t('billingDashboard.charts.revenueFlow.scholarshipsWaivers', 'Scholarships & Waivers'), value: -totalScholarshipsAndWaivers },
      { type: t('billingDashboard.charts.revenueFlow.netExpected', 'Net Expected Revenue'), value: netExpectedRevenue, isTotal: true },
    ];

    return data;

  }, [invoices, loading, t]);

  if (loading) {
    return (
      <Card title={t('billingDashboard.charts.revenueFlowTitle', 'Revenue Flow Analysis')}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}><Spin /></div>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card title={t('billingDashboard.charts.revenueFlowTitle', 'Revenue Flow Analysis')}>
        <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Empty description={t('common.noDataAvailable', 'No data available for revenue flow.')} />
        </div>
      </Card>
    );
  }

  const config = {
    data: chartData,
    xField: 'type',
    yField: 'value',
    isTotal: (datum: WaterfallData) => datum.isTotal ?? false,
    height: 300,
    title: {
      text: t('billingDashboard.charts.revenueFlowTitle', 'Revenue Flow Analysis'),
      style: { fontSize: 16, textAlign: 'center' as const }, // Ensure title is centered
      visible: false, // Card title is used instead
    },
    meta: {
      value: {
        formatter: (v: number) => `${(v / 1000).toFixed(0)}K`, // Format as K for thousands
      },
    },
    label: {
        formatter: (datum: WaterfallData) => {
            return `${(datum.value / 1000).toFixed(0)}K`;
        },
        style: {
            fontSize: 10, // Smaller font size for labels on bars
            // fill: can be conditional based on value if needed
        },
        // layout: [{ type: 'interval-adjust-position' }], // Not directly available, manage via style/formatter
    },
    total: {
      label: t('billingDashboard.charts.revenueFlow.totalLabel', 'Total'),
      style: {
        fill: '#333', // Color for the total label
      },
    },
    leaderLine: {
      style: {
        lineWidth: 1,
        stroke: '#8c8c8c',
        lineDash: [4, 2],
      },
    },
    tooltip: {
        formatter: (datum: WaterfallData) => ({
          name: datum.type,
          value: datum.value.toLocaleString(undefined, {style: 'currency', currency: 'USD' }), // Example USD formatting
        }),
    },
    padding: 'auto' as const,
  };

  return (
    <Card title={t('billingDashboard.charts.revenueFlowTitle', 'Revenue Flow Analysis')}>
        <Waterfall {...config} />
    </Card>
  );
};

export default RevenueFlowChart;
