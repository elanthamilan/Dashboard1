import React, { useMemo } from 'react';
import { Line } from '@ant-design/plots';
import { Card, Spin, Typography, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { Applicant } from './types';
import dayjs from 'dayjs';

interface ApplicationTrendsChartProps {
  applicants: Applicant[];
  loading: boolean;
}

interface ChartDataType {
  date: string; // YYYY-MM
  count: number;
  type: 'Applications' | 'Enrollments';
}

const ApplicationTrendsChart: React.FC<ApplicationTrendsChartProps> = ({ applicants, loading }) => {
  const { t } = useTranslation();

  const processedData = useMemo(() => {
    if (loading || !applicants || applicants.length === 0) {
      return [];
    }

    const appCounts: Record<string, number> = {};
    const enrolledCounts: Record<string, number> = {};
    const allMonths = new Set<string>();

    applicants.forEach(applicant => {
      const monthYear = dayjs(applicant.applicationDate).format('YYYY-MM');
      allMonths.add(monthYear);
      appCounts[monthYear] = (appCounts[monthYear] || 0) + 1;

      if (applicant.status === 'Enrollment Confirmed') {
        enrolledCounts[monthYear] = (enrolledCounts[monthYear] || 0) + 1;
      }
    });

    const chartData: ChartDataType[] = [];
    const sortedMonths = Array.from(allMonths).sort((a,b) => dayjs(a, 'YYYY-MM').valueOf() - dayjs(b, 'YYYY-MM').valueOf());

    sortedMonths.forEach(month => {
      chartData.push({ date: month, count: appCounts[month] || 0, type: t('admissionsDashboard.charts.applicationTrends.applications', 'Applications') as 'Applications' });
      chartData.push({ date: month, count: enrolledCounts[month] || 0, type: t('admissionsDashboard.charts.applicationTrends.enrollments', 'Enrollments') as 'Enrollments' });
    });

    return chartData;

  }, [applicants, loading, t]);

  const chartTitle = t('admissionsDashboard.charts.applicationTrends.title', 'Application and Enrollment Trends');

  if (loading) {
    return (
      <Card title={chartTitle}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}><Spin /></div>
      </Card>
    );
  }

  if (processedData.length === 0) {
    return (
      <Card title={chartTitle}>
        <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Empty description={t('common.noDataAvailable', 'No application trend data available.')} />
        </div>
      </Card>
    );
  }

  const config = {
    data: processedData,
    xField: 'date',
    yField: 'count',
    seriesField: 'type',
    height: 300,
    smooth: true,
    xAxis: {
      title: { text: t('admissionsDashboard.charts.applicationTrends.monthYearAxis', 'Month/Year') },
      label: {
        formatter: (val: string) => dayjs(val, 'YYYY-MM').format('MMM YYYY'),
      },
    },
    yAxis: {
      title: { text: t('admissionsDashboard.charts.applicationTrends.countAxis', 'Count') },
      label: { formatter: (val: number) => Math.floor(val) === val ? val.toString() : '' }, // Show only integer ticks if possible
    },
    legend: {
      position: 'top-right' as const,
    },
    tooltip: {
      formatter: (datum: ChartDataType) => ({
        name: datum.type,
        value: `${datum.count} (${dayjs(datum.date, 'YYYY-MM').format('MMM YYYY')})`,
      }),
    },
    padding: 'auto' as const,
  };

  return (
    <Card title={chartTitle}>
      <Line {...config} />
    </Card>
  );
};

export default ApplicationTrendsChart;
