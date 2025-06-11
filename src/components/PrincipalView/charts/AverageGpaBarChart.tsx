import React from 'react';
import { Bar } from '@ant-design/plots';
import { Card, Spin, Typography, Empty } from 'antd';
import { useTranslation } from 'react-i18next';

interface GpaChartDataItem {
  id: string;
  name: string;
  averageGpa?: number;
}

interface AverageGpaBarChartProps {
  data: GpaChartDataItem[];
  title: string;
  loading: boolean;
  barColor?: string; // Optional: to customize bar color
}

const AverageGpaBarChart: React.FC<AverageGpaBarChartProps> = ({ data, title, loading, barColor }) => {
  const { t } = useTranslation();

  const chartData = data
    .filter(item => item.averageGpa !== undefined && item.averageGpa !== null && !isNaN(item.averageGpa))
    .map(item => ({
      ...item,
      averageGpa: Number(item.averageGpa!.toFixed(2)), // Ensure 2 decimal places for display consistency
    }))
    .sort((a,b) => b.averageGpa! - a.averageGpa!); // Sort descending by GPA

  if (loading) {
    return (
      <Card title={title}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}><Spin /></div>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card title={title}>
        <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Empty description={t('common.noDataAvailableForChart', 'No data available for this chart.')} />
        </div>
      </Card>
    );
  }

  const config = {
    data: chartData,
    xField: 'averageGpa', // Value on X-axis for horizontal bar chart
    yField: 'name',       // Category on Y-axis
    height: Math.max(300, chartData.length * 40), // Dynamic height based on number of bars
    minBarWidth: 20,
    maxBarWidth: 30,
    seriesField: 'name', // Each bar can be colored by its name if needed, or remove for single color
    color: barColor ? barColor : undefined, // Apply custom color if provided
    legend: {
        position: 'top-right' as const,
        visible: false, // Usually not needed if yField labels are clear and seriesField is 'name'
    },
    barStyle: {
      // fill: barColor || '#5B8FF9', // Default or custom color
    },
    label: {
      position: 'middle' as const,
      content: (item: { averageGpa?: number }) => item.averageGpa?.toFixed(2),
      style: { fill: '#fff' },
      layout: [{ type: 'interval-adjust-position' }] as any[],
    },
    xAxis: {
      title: { text: t('charts.gpaAxisTitle', 'Average GPA') },
      label: { formatter: (val: number) => val.toFixed(2) },
      min: 0,
      max: 4.0, // Standard GPA scale
    },
    yAxis: {
      title: { text: null }, // No title for y-axis if names are clear
      label: {
        autoHide: false, // Try to show all labels
        autoRotate: false, // Avoid rotation if possible
        formatter: (text: string) => text.length > 25 ? text.substring(0,22) + '...' : text, // Truncate long names
      }
    },
    tooltip: {
      formatter: (datum: GpaChartDataItem) => ({
        name: datum.name,
        value: `${t('charts.averageGpa', 'Average GPA')}: ${datum.averageGpa?.toFixed(2)}`,
      }),
    },
    padding: 'auto' as const,
  };

  return (
    <Card title={title}>
      <Bar {...config} />
    </Card>
  );
};

export default AverageGpaBarChart;
