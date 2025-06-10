import React, { useMemo } from 'react';
import { ResponsiveBar, BarDatum } from '@nivo/bar'; // Correct import for BarDatum if it exists, or use a generic object type
import { Card, Typography, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { AttendanceRecord } from './types'; // Adjust path

interface AbsenceReasonChartProps {
  records: AttendanceRecord[];
  loading?: boolean;
}

const AbsenceReasonChart: React.FC<AbsenceReasonChartProps> = ({ records, loading }) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    const reasonCounts: { [reason: string]: number } = {};
    records.forEach(record => {
      if ((record.status === 'Absent' || record.status === 'Excused') && record.absenceReason) {
        reasonCounts[record.absenceReason] = (reasonCounts[record.absenceReason] || 0) + 1;
      }
    });

    // Transform to Nivo bar chart data format
    // Nivo typically expects an array of objects, where each object is a bar or a segment of a stacked/grouped bar.
    // For a simple bar chart of reasons, each reason is an object.
    return Object.entries(reasonCounts)
      .map(([reason, count]) => ({
        reason: t(`attendanceReasons.${reason.replace(/\s+/g, '')}`, reason), // Translate reason, remove spaces for key
        [t('attendanceDashboard.charts.absenceCount', 'Absences')]: count, // Use a translated key for the value
      }))
      .sort((a,b) => b[t('attendanceDashboard.charts.absenceCount', 'Absences')] - a[t('attendanceDashboard.charts.absenceCount', 'Absences')]); // Sort by count descending
  }, [records, t]);

  // The key for the values (e.g., 'Absences') needs to be consistent and known for the `keys` prop of ResponsiveBar
  const valueKey = t('attendanceDashboard.charts.absenceCount', 'Absences');


  if (loading) {
    return <Card title={t('attendanceDashboard.charts.absenceReasonTitle', 'Absence Reasons')} style={{ minHeight: 300 }} loading={true} />;
  }

  if (!loading && chartData.length === 0) {
    return (
        <Card title={t('attendanceDashboard.charts.absenceReasonTitle', 'Absence Reasons')} style={{ minHeight: 300 }}>
            <Empty description={t('common.noDataForChart', 'No absence data to display.')} />
        </Card>
    );
  }

  return (
    <Card title={t('attendanceDashboard.charts.absenceReasonTitle', 'Absence Reasons')} style={{ minHeight: 300 }}>
      <div style={{ height: 250 }}> {/* Adjust height for bar chart */}
        <ResponsiveBar
          data={chartData as BarDatum[]} // Cast if BarDatum is strict, or ensure chartData matches
          keys={[valueKey]} // The key that holds the numerical value for the bar
          indexBy="reason" // The key that holds the label for the bar (x-axis)
          margin={{ top: 10, right: 30, bottom: 80, left: 60 }} // Adjusted bottom margin for labels
          padding={0.3}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={{ scheme: 'nivo' }} // Or a specific color: { scheme: 'category10' } or {({ id, data }) => data[`${id}Color`]}
          defs={[
            // Optional: patterns for bars
          ]}
          fill={[
            // Optional: fill rules
          ]}
          borderColor={{
            from: 'color',
            modifiers: [['darker', 1.6]],
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -30, // Rotate labels if they overlap
            legend: t('attendanceDashboard.charts.reasonLegend', 'Reason'),
            legendPosition: 'middle',
            legendOffset: 65,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: t('attendanceDashboard.charts.countLegend', 'Number of Absences'),
            legendPosition: 'middle',
            legendOffset: -50,
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{
            from: 'color',
            modifiers: [['darker', 1.6]],
          }}
          legends={[]} // Disable default legends if not needed, or configure them
          animate={true}
          motionConfig="gentle"
          tooltip={({ id, value, indexValue }) => (
            <div style={{ padding: '5px 10px', background: 'white', border: '1px solid #ccc', borderRadius: '3px' }}>
                <strong>{indexValue}</strong>: {value}
            </div>
          )}
        />
      </div>
    </Card>
  );
};

export default React.memo(AbsenceReasonChart);
