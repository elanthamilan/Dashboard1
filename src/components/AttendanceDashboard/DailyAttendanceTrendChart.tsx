import React from 'react';
import { Line } from '@ant-design/plots';
import { Spin, Typography, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { AttendanceRecord } from './types';
import dayjs from 'dayjs';

interface DailyAttendanceTrendChartProps {
  records: AttendanceRecord[];
  loading: boolean;
}

const DailyAttendanceTrendChart: React.FC<DailyAttendanceTrendChartProps> = ({ records, loading }) => {
  const { t } = useTranslation();

  const data = React.useMemo(() => {
    if (!records || records.length === 0) {
      return [];
    }

    const dailyStats: { [date: string]: { presentOrLate: number; totalRelevant: number } } = {};

    records.forEach(record => {
      const dateStr = dayjs(record.date).format('YYYY-MM-DD');
      if (!dailyStats[dateStr]) {
        dailyStats[dateStr] = { presentOrLate: 0, totalRelevant: 0 };
      }

      if (record.status === 'Present' || record.status === 'Late') {
        dailyStats[dateStr].presentOrLate++;
        dailyStats[dateStr].totalRelevant++;
      } else if (record.status === 'Absent') {
        dailyStats[dateStr].totalRelevant++;
      }
      // 'Excused' records are not counted for this rate calculation
    });

    return Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        rate: stats.totalRelevant > 0 ? (stats.presentOrLate / stats.totalRelevant) * 100 : 0,
      }))
      .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()); // Sort by date ascending
  }, [records]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}><Spin /></div>;
  }

  if (data.length === 0) {
    return (
      <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Empty description={t('common.noDataAvailable', 'No data available')} />
      </div>
    );
  }

  const chartConfig = {
    data,
    xField: 'date',
    yField: 'rate',
    height: 300,
    smooth: true,
    xAxis: {
      title: { text: t('attendanceDashboard.charts.dateAxis', 'Date') },
      label: {
        formatter: (val: string) => dayjs(val).format('MMM DD'), // Format date for readability
      },
      tickCount: data.length > 30 ? 10 : undefined, // Adjust tick count for many data points
    },
    yAxis: {
      title: { text: t('attendanceDashboard.charts.attendanceRateAxis', 'Attendance Rate (%)') },
      label: {
        formatter: (val: string) => `${parseFloat(val).toFixed(0)}%`,
      },
      min: 0,
      max: 100,
    },
    tooltip: {
      formatter: (datum: any) => ({
        name: t('attendanceDashboard.charts.dailyAttendanceRate', 'Daily Rate'),
        value: `${datum.rate.toFixed(1)}% on ${dayjs(datum.date).format('MMM DD, YYYY')}`,
      }),
    },
    point: {
      size: 3,
      shape: 'circle',
    },
    padding: 'auto' as const,
  };

  return (
    <div>
      <Typography.Title level={4} style={{ marginBottom: 20, textAlign: 'center' }}>
        {t('attendanceDashboard.charts.dailyAttendanceTrendTitle', 'Average Daily Attendance Rate')}
      </Typography.Title>
      <Line {...chartConfig} />
    </div>
  );
};

export default DailyAttendanceTrendChart;
