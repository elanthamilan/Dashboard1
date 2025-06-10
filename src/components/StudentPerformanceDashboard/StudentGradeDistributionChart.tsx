import React, { useMemo } from 'react';
import { ResponsiveBar, BarDatum } from '@nivo/bar';
import { Card, Typography, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { StudentAcademicRecord, Grade as GradeType } from './types'; // Renamed Grade to GradeType to avoid conflict

interface StudentGradeDistributionChartProps {
  studentAcademicRecord: StudentAcademicRecord | null;
  loading?: boolean;
}

const StudentGradeDistributionChart: React.FC<StudentGradeDistributionChartProps> = ({ studentAcademicRecord, loading }) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    if (!studentAcademicRecord || !studentAcademicRecord.terms) {
      return [];
    }

    const gradeCounts: { [grade: string]: number } = {};
    const gradeOrder: Array<GradeType['letterGrade']> = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'P', 'NP'];

    gradeOrder.forEach(g => gradeCounts[g] = 0); // Initialize all possible grades with 0

    studentAcademicRecord.terms.forEach(term => {
      term.courses.forEach(course => {
        if (course.grade && course.grade.letterGrade) {
          gradeCounts[course.grade.letterGrade] = (gradeCounts[course.grade.letterGrade] || 0) + 1;
        }
      });
    });

    const valueKey = t('studentPerformanceDashboard.charts.gradeDist.count', 'Count');

    return gradeOrder
      .map(grade => ({
        grade: grade, // Keep original grade for sorting/filtering if needed
        // gradeLabel: t(`grades.${grade}`, grade), // For translated grade labels if needed on axis
        [valueKey]: gradeCounts[grade],
      }))
      .filter(d => d[valueKey] > 0); // Only show grades the student actually has
      // Or, to show all grades on X-axis even if count is 0:
      // .map(grade => ({ grade: grade, [valueKey]: gradeCounts[grade] }));

  }, [studentAcademicRecord, t]);

  const dataKey = t('studentPerformanceDashboard.charts.gradeDist.count', 'Count');


  if (loading) {
    return <Card title={t('studentPerformanceDashboard.charts.gradeDist.title', "Student's Grade Distribution")} style={{ minHeight: 300 }} loading={true} />;
  }

  if (!studentAcademicRecord || chartData.length === 0) {
     return (
        <Card title={t('studentPerformanceDashboard.charts.gradeDist.title', "Student's Grade Distribution")} style={{ minHeight: 300 }}>
            <Empty description={t('common.noDataForChart', 'No grade data available for this student.')} />
        </Card>
    );
  }

  return (
    <Card title={t('studentPerformanceDashboard.charts.gradeDist.title', "Student's Grade Distribution")} style={{ minHeight: 300 }}>
      <div style={{ height: 250 }}>
        <ResponsiveBar
          data={chartData as BarDatum[]}
          keys={[dataKey]}
          indexBy="grade"
          margin={{ top: 10, right: 30, bottom: 50, left: 60 }}
          padding={0.3}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={{ scheme: 'category10' }} // Different color scheme
          borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0, // Grades are short, no rotation needed
            legend: t('studentPerformanceDashboard.charts.gradeDist.gradeLegend', 'Grade'),
            legendPosition: 'middle',
            legendOffset: 40,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: t('studentPerformanceDashboard.charts.gradeDist.countLegend', 'Number of Courses'),
            legendPosition: 'middle',
            legendOffset: -50,
            tickValues: Object.values(chartData.reduce((acc, curr) => ({...acc, [curr[dataKey]]:true}), {})).length > 5 ? 5 : undefined, // Show at most 5 ticks or auto for integers
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
          legends={[]}
          animate={true}
          motionConfig="stiff"
          tooltip={({ id, value, indexValue }) => ( // id here will be the 'dataKey'
            <div style={{ padding: '5px 10px', background: 'white', border: '1px solid #ccc', borderRadius: '3px' }}>
                <strong>{t('studentPerformanceDashboard.charts.gradeDist.gradeLegend', 'Grade')} {indexValue}</strong>: {value} {t('studentPerformanceDashboard.charts.gradeDist.courses', 'courses')}
            </div>
          )}
        />
      </div>
    </Card>
  );
};

export default React.memo(StudentGradeDistributionChart);
