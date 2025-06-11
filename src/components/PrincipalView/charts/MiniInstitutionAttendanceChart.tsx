import React, { useMemo } from 'react';
import { Bar } from '@ant-design/plots';
import { Card, Spin, Typography, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { AcademicYear } from '../../../types/hierarchy';

interface MiniInstitutionAttendanceChartProps {
  academicYears: AcademicYear[];
  title: string;
  loading: boolean;
}

interface ChartDataType {
  yearName: string;
  attendancePercentage?: number;
}

const MiniInstitutionAttendanceChart: React.FC<MiniInstitutionAttendanceChartProps> = ({
  academicYears,
  title,
  loading,
}) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    if (!academicYears) return [];
    return academicYears
      .map(ay => ({
        yearName: ay.yearName,
        // Ensure undefined is handled, and value is capped at 100 if mock data exceeds it
        attendancePercentage: ay.annualAttendancePercentage !== undefined
                                ? Math.min(100, parseFloat(ay.annualAttendancePercentage.toFixed(1)))
                                : undefined,
      }))
      .filter(item => item.attendancePercentage !== undefined) // Only include years with data
      .sort((a,b) => a.yearName.localeCompare(b.yearName)); // Sort by year name
  }, [academicYears]);

  if (loading) {
    return (
      <Card title={title} size="small">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}><Spin /></div>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card title={title} size="small">
        <div style={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Empty description={t('common.noDataAvailableForChart', 'No attendance data available.')} />
        </div>
      </Card>
    );
  }

  const config = {
    data: chartData,
    xField: 'yearName',
    yField: 'attendancePercentage',
    seriesField: 'yearName', // Color by year for visual distinction, or remove for single color
    height: 250,
    legend: { visible: false },
    color: ['#5B8FF9', '#5AD8A6', '#5D7092', '#F6BD16', '#E86452'], // Example color palette
    label: {
      position: 'middle' as const,
      content: (item: ChartDataType) => item.attendancePercentage ? `${item.attendancePercentage.toFixed(1)}%` : '',
      style: { fill: '#fff', fontSize: 10 },
      layout: [{ type: 'interval-adjust-position' }] as any[],
    },
    xAxis: {
      title: { text: null }, // t('charts.academicYearAxisTitle', 'Academic Year') - null for mini chart
      label: { autoHide: false, autoRotate: true, style: {fontSize: 10} },
    },
    yAxis: {
      title: { text: t('charts.attendanceRateAxisShort', 'Attendance (%)'), style: {fontSize: 10} },
      label: { formatter: (val: number) => `${val}%`, style: {fontSize: 10} },
      min: 0,
      max: 100,
    },
    tooltip: {
      formatter: (datum: ChartDataType) => ({
        name: datum.yearName,
        value: `${datum.attendancePercentage?.toFixed(1)}% ${t('charts.attendance', 'Attendance')}`,
      }),
    },
    padding: 'auto' as const,
  };

  return (
    <Card title={title} size="small">
      <Bar {...config} />
    </Card>
  );
};

export default MiniInstitutionAttendanceChart;
