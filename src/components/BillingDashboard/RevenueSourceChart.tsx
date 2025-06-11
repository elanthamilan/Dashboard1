import React, { useMemo } from 'react';
import { Pie } from '@ant-design/plots'; // Using Pie for a Donut chart configuration
import { Card, Spin, Typography, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { Invoice, FeeItem } from './types'; // Assuming types are in ./types or adjust path

interface RevenueSourceChartProps {
  invoices: Invoice[];
  loading: boolean;
}

interface ChartData {
  type: string; // Category name
  value: number; // Total amount for this category
}

const RevenueSourceChart: React.FC<RevenueSourceChartProps> = ({ invoices, loading }) => {
  const { t } = useTranslation();

  const processedData = useMemo(() => {
    if (loading || !invoices) {
      return [];
    }

    const revenueByCategory: { [category: string]: number } = {};

    invoices.forEach(invoice => {
      if (invoice.status === 'Cancelled') {
        return; // Exclude cancelled invoices
      }
      invoice.items.forEach(item => {
        if (item.amount > 0) { // Only consider positive amounts as revenue sources
          const category = item.category || t('billingDashboard.charts.revenueSource.otherRevenue', 'Other Revenue');
          revenueByCategory[category] = (revenueByCategory[category] || 0) + item.amount;
        }
      });
    });

    return Object.entries(revenueByCategory)
      .map(([type, value]) => ({
        type,
        value: parseFloat(value.toFixed(2)),
      }))
      .filter(item => item.value > 0) // Ensure only categories with actual revenue are shown
      .sort((a,b) => b.value - a.value); // Sort by value descending for better readability

  }, [invoices, loading, t]);

  if (loading) {
    return (
      <Card title={t('billingDashboard.charts.revenueSourceTitle', 'Revenue by Source')}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}><Spin /></div>
      </Card>
    );
  }

  if (processedData.length === 0) {
    return (
      <Card title={t('billingDashboard.charts.revenueSourceTitle', 'Revenue by Source')}>
        <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Empty description={t('common.noDataAvailable', 'No revenue data available.')} />
        </div>
      </Card>
    );
  }

  const config = {
    appendPadding: 10,
    data: processedData,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.6, // This makes it a Donut chart
    height: 300,
    legend: {
      position: 'top-right' as const, // Or 'right', 'left', 'bottom'
      layout: 'vertical' as const, // if position is right or left
      offsetX: -10, // Adjust as needed
    },
    label: {
      type: 'inner',
      offset: '-50%',
      content: ({ percent }: any) => `${(percent * 100).toFixed(0)}%`,
      style: {
        textAlign: 'center',
        fontSize: 12, // Adjusted font size
        fill: '#fff',
      },
    },
    interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
    statistic: { // Content in the center of the donut
      title: {
        offsetY: -4,
        formatter: () => t('billingDashboard.charts.revenueSource.totalRevenue', 'Total Revenue'),
        style: { fontSize: '14px', color: '#333' }
      },
      content: {
        offsetY: 4,
        style: { fontSize: '20px', fontWeight: 'bold' },
        formatter: (datum: any, data: any[]) => { // datum is undefined when no element is active
          const total = data.reduce((sum, item) => sum + item.value, 0);
          return total.toLocaleString(undefined, {style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
        },
      },
    },
    tooltip: {
        formatter: (datum: ChartData) => ({
          name: datum.type,
          value: datum.value.toLocaleString(undefined, {style: 'currency', currency: 'USD' }),
        }),
    },
  };

  return (
    <Card title={t('billingDashboard.charts.revenueSourceTitle', 'Revenue by Source')}>
        <Pie {...config} />
    </Card>
  );
};

export default RevenueSourceChart;
