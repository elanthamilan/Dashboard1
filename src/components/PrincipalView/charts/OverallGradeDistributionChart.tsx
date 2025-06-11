import React, { useMemo } from 'react';
import { Bar } from '@ant-design/plots'; // Column chart is a type of Bar chart
import { Card, Spin, Typography, Empty } from 'antd';
import { useTranslation } from 'react-i18next';

interface GradeDistributionChartProps {
  gradeDistribution?: { [gradeCategory: string]: number };
  title: string;
  loading: boolean;
}

interface ChartDataType {
  grade: string;
  count: number;
}

// Define the desired order of grades
const GRADE_ORDER: Record<string, number> = {
    'A': 1, 'A+': 1, 'A-': 1, // Group all A's
    'B': 2, 'B+': 2, 'B-': 2, // Group all B's
    'C': 3, 'C+': 3, 'C-': 3, // Group all C's
    'D': 4, 'D+': 4,           // Group all D's
    'F': 5,
    'P': 6, // Pass
    'NP': 7, // No Pass
    'Other': 8, // Other non-standard grades
    'N/A': 9,
};


const OverallGradeDistributionChart: React.FC<GradeDistributionChartProps> = ({
  gradeDistribution,
  title,
  loading,
}) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    if (!gradeDistribution) {
      return [];
    }

    // The mock data for institutionGradeDistribution already sums up grades like 'A', 'B'.
    // If it were more granular (A+, A, A-), we would need to aggregate them here.
    // For now, assume it's already in the desired categories.
    const dataArray: ChartDataType[] = Object.entries(gradeDistribution).map(([grade, count]) => ({
      grade,
      count,
    }));

    // Sort the data based on the predefined GRADE_ORDER
    dataArray.sort((a, b) => {
        const orderA = GRADE_ORDER[a.grade.toUpperCase().replace(/[\+\-]/g, '')] || GRADE_ORDER[a.grade] || 99; // Fallback for unexpected grades
        const orderB = GRADE_ORDER[b.grade.toUpperCase().replace(/[\+\-]/g, '')] || GRADE_ORDER[b.grade] || 99;
        return orderA - orderB;
    });

    return dataArray;
  }, [gradeDistribution]);

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
          <Empty description={t('common.noDataAvailableForChart', 'No grade distribution data available.')} />
        </div>
      </Card>
    );
  }

  const config = {
    data: chartData,
    xField: 'grade', // Grade category on X-axis for a vertical bar chart
    yField: 'count',  // Count on Y-axis
    seriesField: 'grade', // Optional: color bars by grade category if desired
    height: 300,
    legend: {
        visible: false, // Legend might be redundant if X-axis labels are clear
    },
    label: {
      position: 'middle' as const,
      content: (item: ChartDataType) => `${item.count}`,
      style: { fill: '#fff' }, // White text on bars
      layout: [{ type: 'interval-adjust-position' }] as any[],
    },
    xAxis: {
      title: { text: t('charts.gradeCategoryAxisTitle', 'Grade Category') },
    },
    yAxis: {
      title: { text: t('charts.studentCountAxisTitle', 'Number of Students') },
      label: { formatter: (val: number) => Math.floor(val) === val ? val.toString() : '' }, // Show only integer ticks
      min: 0, // Ensure Y-axis starts at 0
    },
    tooltip: {
      formatter: (datum: ChartDataType) => ({
        name: datum.grade,
        value: `${datum.count} ${t('charts.students', 'Students')}`,
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

export default OverallGradeDistributionChart;
