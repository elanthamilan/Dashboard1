import React from 'react';
import { Bar } from '@ant-design/plots';
import { Spin, Typography, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { AttendanceRecord, SchoolClass } from './types';
import dayjs from 'dayjs';

interface CourseAbsenceRateChartProps {
  records: AttendanceRecord[];
  schoolClasses: SchoolClass[];
  loading: boolean;
}

const CourseAbsenceRateChart: React.FC<CourseAbsenceRateChartProps> = ({ records, schoolClasses, loading }) => {
  const { t } = useTranslation();

  const data = React.useMemo(() => {
    if (!records || records.length === 0 || !schoolClasses || schoolClasses.length === 0) {
      return [];
    }

    const subjectStats: { [subject: string]: { absences: number; totalRelevant: number } } = {};

    records.forEach(record => {
      const schoolClass = schoolClasses.find(sc => sc.id === record.classId);
      if (!schoolClass) return; // Should not happen if data is consistent

      const subject = schoolClass.subject;
      if (!subjectStats[subject]) {
        subjectStats[subject] = { absences: 0, totalRelevant: 0 };
      }

      if (record.status === 'Absent') {
        subjectStats[subject].absences++;
        subjectStats[subject].totalRelevant++;
      } else if (record.status === 'Present' || record.status === 'Late') {
        subjectStats[subject].totalRelevant++;
      }
      // 'Excused' records are not counted in totalRelevant for absence rate calculation
    });

    return Object.entries(subjectStats)
      .map(([subject, stats]) => ({
        subject,
        absenceRate: stats.totalRelevant > 0 ? (stats.absences / stats.totalRelevant) * 100 : 0,
      }))
      .sort((a, b) => b.absenceRate - a.absenceRate); // Sort by rate descending
  }, [records, schoolClasses]);

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
    xField: 'absenceRate',
    yField: 'subject',
    seriesField: 'subject', // To get different colors for different subjects, though not strictly necessary for this chart
    height: 300, // Adjust as needed
    isStack: false, // Ensure bars are not stacked if only one series
    legend: {
        position: 'top-right' as const,
        visible: false, // Legend might be redundant if Y-axis labels are clear
    },
    barStyle: {
        // fill: '#5B8FF9', // Example: set a specific color or use theme default
    },
    label: {
      position: 'middle' as const, // 'left', 'middle', 'right'
      layout: [{ type: 'interval-adjust-position' }],
      content: (item: any) => `${item.absenceRate.toFixed(1)}%`, // Show percentage on bars
      style: {
        fill: '#fff', // Text color on bars
      },
    },
    xAxis: {
      title: { text: t('attendanceDashboard.charts.absenceRateAxis', 'Absence Rate (%)') },
      label: {
        formatter: (val: string) => `${parseFloat(val).toFixed(0)}%`,
      },
    },
    yAxis: {
      title: { text: t('attendanceDashboard.charts.subjectAxis', 'Subject') },
    },
    tooltip: {
      formatter: (datum: any) => ({
        name: datum.subject,
        value: `${datum.absenceRate.toFixed(1)}% (${t('attendanceDashboard.charts.absences', 'Absences')}: ${
          records.filter(r => schoolClasses.find(sc => sc.id === r.classId)?.subject === datum.subject && r.status === 'Absent').length
        })`,
      }),
    },
    padding: 'auto' as const,
    appendPadding: [0, 0, 0, 0], // Adjust padding if needed
  };

  return (
    <div>
      <Typography.Title level={4} style={{ marginBottom: 20, textAlign: 'center' }}>
        {t('attendanceDashboard.charts.courseAbsenceRateTitle', 'Absence Rate by Subject')}
      </Typography.Title>
      <Bar {...chartConfig} />
    </div>
  );
};

export default CourseAbsenceRateChart;
