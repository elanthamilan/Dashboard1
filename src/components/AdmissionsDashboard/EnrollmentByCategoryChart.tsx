import React, { useState, useMemo } from 'react';
import { Bar } from '@ant-design/plots';
import { Card, Spin, Typography, Empty, Select, Radio } from 'antd';
import { useTranslation } from 'react-i18next';
import { Applicant } from './types';

interface EnrollmentByCategoryChartProps {
  applicants: Applicant[];
  loading: boolean;
}

type CategoryView = 'programName' | 'gender' | 'reservationCategory';

interface ChartDataType {
  categoryValue: string;
  count: number;
}

const EnrollmentByCategoryChart: React.FC<EnrollmentByCategoryChartProps> = ({ applicants, loading }) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<CategoryView>('programName');

  const categoryDisplayNames: Record<CategoryView, string> = {
    programName: t('admissionsDashboard.charts.enrollmentByCategory.program', 'Program'),
    gender: t('admissionsDashboard.charts.enrollmentByCategory.gender', 'Gender'),
    reservationCategory: t('admissionsDashboard.charts.enrollmentByCategory.reservation', 'Reservation Category'),
  };

  const processedData = useMemo(() => {
    if (loading || !applicants) {
      return [];
    }

    const enrolledApplicants = applicants.filter(app => app.status === 'Enrollment Confirmed');
    if (enrolledApplicants.length === 0) {
      return [];
    }

    const counts: Record<string, number> = {};

    enrolledApplicants.forEach(applicant => {
      let key: string | undefined;
      switch (selectedCategory) {
        case 'programName':
          key = applicant.programName || t('common.notSpecified', 'N/A');
          break;
        case 'gender':
          key = applicant.gender || t('common.notSpecified', 'N/A');
          break;
        case 'reservationCategory':
          key = applicant.reservationCategory || t('common.notSpecified', 'N/A');
          break;
        default:
          key = t('common.unknown', 'Unknown');
      }
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([categoryValue, count]) => ({ categoryValue, count }))
      .sort((a, b) => b.count - a.count); // Sort by count descending

  }, [applicants, loading, selectedCategory, t]);

  const chartTitle = t('admissionsDashboard.charts.enrollmentByCategory.title', 'Enrollment by {{category}}', {
    category: categoryDisplayNames[selectedCategory]
  });

  if (loading) {
    return (
      <Card title={chartTitle}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}><Spin /></div>
      </Card>
    );
  }

  const config = {
    data: processedData,
    xField: 'count',
    yField: 'categoryValue',
    seriesField: 'categoryValue', // Optional: if you want different colors per bar explicitly
    height: 350, // Adjusted height to accommodate selector
    legend: {
        position: 'top-right' as const,
        visible: false, // Usually not needed if yField labels are clear
    },
    barStyle: {
        // fill: can be set or let Ant Charts theme handle it
    },
    label: {
        position: 'middle' as const, // 'left', 'middle', 'right'
        content: (item: ChartDataType) => `${item.count}`,
        style: { fill: '#fff' },
        layout: [{ type: 'interval-adjust-position' }] as any[],
    },
    xAxis: {
      title: { text: t('admissionsDashboard.charts.enrollmentByCategory.countAxis', 'Number of Students') },
      label: { formatter: (val: number) => Math.floor(val) === val ? val.toString() : '' }, // Show only integer ticks
    },
    yAxis: {
      title: { text: categoryDisplayNames[selectedCategory] },
    },
    tooltip: {
      formatter: (datum: ChartDataType) => ({
        name: datum.categoryValue,
        value: `${datum.count} ${t('admissionsDashboard.charts.enrollmentByCategory.students', 'Students')}`,
      }),
    },
    padding: 'auto' as const,
  };

  return (
    <Card
        title={chartTitle}
        extra={
            <Radio.Group
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                size="small"
            >
                <Radio.Button value="programName">{categoryDisplayNames.programName}</Radio.Button>
                <Radio.Button value="gender">{categoryDisplayNames.gender}</Radio.Button>
                <Radio.Button value="reservationCategory">{categoryDisplayNames.reservationCategory}</Radio.Button>
            </Radio.Group>
        }
    >
      {processedData.length === 0 ? (
        <div style={{ height: 350, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Empty description={t('common.noDataAvailableForCategory', 'No enrollment data available for this category.')} />
        </div>
      ) : (
        <Bar {...config} />
      )}
    </Card>
  );
};

export default EnrollmentByCategoryChart;
