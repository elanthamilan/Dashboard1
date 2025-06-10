import React, { useMemo } from 'react';
import { ResponsiveLine } from '@nivo/line'; // Remove Serie from import
import { Card, Typography, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { AttendanceRecord } from './types'; // Adjust path
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear'; // For grouping by week
import isoWeek from 'dayjs/plugin/isoWeek'; // For consistent week numbering
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);


interface WeeklyAttendanceTrendChartProps {
  records: AttendanceRecord[];
  loading?: boolean;
}

const NUM_WEEKS_TO_DISPLAY = 8; // Display trend for the last 8 weeks

// Define Serie type inline for Nivo Line
// Nivo expects: { id: string; data: { x: string | number; y: number | null }[] }
type Serie = {
  id: string;
  data: { x: string | number; y: number | null }[];
};

const WeeklyAttendanceTrendChart: React.FC<WeeklyAttendanceTrendChartProps> = ({ records, loading }) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    const weeklyData: { [weekYear: string]: { present: number; late: number; absent: number; total: number } } = {};
    const today = dayjs();
    // Filter records for the last NUM_WEEKS_TO_DISPLAY weeks from the most recent record date, or today if no records
    const mostRecentRecordDate = records.length > 0 ? dayjs(records.reduce((max, r) => dayjs(r.date).isAfter(max) ? r.date : max, records[0].date)) : today;
    const startDateCutoff = mostRecentRecordDate.subtract(NUM_WEEKS_TO_DISPLAY -1, 'week').startOf('isoWeek');


    records.forEach(record => {
      const recordDate = dayjs(record.date);
      if (!recordDate.isBefore(startDateCutoff)) { // Only include records within the desired window
        const weekYear = `${recordDate.isoWeek()}-${recordDate.year()}`; // Format: "WW-YYYY"
        if (!weeklyData[weekYear]) {
          weeklyData[weekYear] = { present: 0, late: 0, absent: 0, total: 0 };
        }
        if (record.status === 'Present') weeklyData[weekYear].present++;
        if (record.status === 'Late') weeklyData[weekYear].late++;
        if (record.status === 'Absent') weeklyData[weekYear].absent++;
        // Total relevant for rate calculation (Present, Late, Absent)
        if (['Present', 'Late', 'Absent'].includes(record.status)) {
            weeklyData[weekYear].total++;
        }
      }
    });

    const trendSeries: Serie[] = [
      {
        id: t('attendanceDashboard.charts.trendPresentRate', 'Present Rate (%)'),
        data: [],
      },
      // Optional: Add series for Absent Rate if desired
      // {
      //   id: t('attendanceDashboard.charts.trendAbsentRate', 'Absent Rate (%)'),
      //   data: [],
      // },
    ];

    // Sort weeks for chronological order in the chart
    const sortedWeeks = Object.keys(weeklyData).sort((a, b) => {
        const [wa, ya] = a.split('-').map(Number);
        const [wb, yb] = b.split('-').map(Number);
        if (ya !== yb) return ya - yb;
        return wa - wb;
    });

    // Take only the last NUM_WEEKS_TO_DISPLAY from the sorted list if more exist
    const finalWeeks = sortedWeeks.slice(-NUM_WEEKS_TO_DISPLAY);


    finalWeeks.forEach(weekYear => {
      const data = weeklyData[weekYear];
      const presentRate = data.total > 0 ? ((data.present + data.late) / data.total) * 100 : 0;
      // const absentRate = data.total > 0 ? (data.absent / data.total) * 100 : 0;

      const weekLabel = `W${weekYear.split('-')[0]}`; // Short label "W##"

      (trendSeries[0].data as { x: string; y: number }[]).push({ x: weekLabel, y: parseFloat(presentRate.toFixed(1)) });
      // (trendSeries[1].data as { x: string; y: number }[]).push({ x: weekLabel, y: parseFloat(absentRate.toFixed(1)) });
    });

    return trendSeries.filter(series => series.data.length > 0); // Return only series with data
  }, [records, t]);


  if (loading) {
    return <Card title={t('attendanceDashboard.charts.weeklyTrendTitle', 'Weekly Attendance Trend')} style={{ minHeight: 300 }} loading={true} />;
  }

  if (!loading && chartData.every(series => series.data.length === 0)) {
     return (
        <Card title={t('attendanceDashboard.charts.weeklyTrendTitle', 'Weekly Attendance Trend')} style={{ minHeight: 300 }}>
            <Empty description={t('common.noDataForChart', 'Not enough data for weekly trend.')} />
        </Card>
    );
  }

  return (
    <Card title={t('attendanceDashboard.charts.weeklyTrendTitle', 'Weekly Attendance Trend')} style={{ minHeight: 300 }}>
      <div style={{ height: 250 }}> {/* Adjust height for line chart */}
        <ResponsiveLine
          data={chartData}
          margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
          xScale={{ type: 'point' }}
          yScale={{
            type: 'linear',
            min: 0, // Start y-axis at 0
            max: 100, // End y-axis at 100 for percentage
            stacked: false,
            reverse: false,
          }}
          yFormat=".1f" // Format y-axis values as numbers with 1 decimal place
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: t('attendanceDashboard.charts.weekLegend', 'Week'),
            legendOffset: 46,
            legendPosition: 'middle',
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: t('attendanceDashboard.charts.rateLegend', 'Attendance Rate (%)'),
            legendOffset: -50,
            legendPosition: 'middle',
            format: value => `${value}%`, // Add % to tick values
          }}
          pointSize={10}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          pointLabelYOffset={-12}
          useMesh={true}
          legends={[]} // Disable default legends, or customize if multiple lines
          curve="monotoneX" // Smoothen the line
          enableArea={true} // Optional: fill area under line
          areaOpacity={0.1}
          tooltip={({ point }) => {
            return (
                <div style={{ padding: '5px 10px', background: 'white', border: '1px solid #ccc', borderRadius: '3px' }}>
                    <strong>{t('attendanceDashboard.charts.weekLegend', 'Week')} {point.data.xFormatted}</strong><br />
                    {point.seriesId}: {point.data.yFormatted}
                </div>
            )
          }}
        />
      </div>
    </Card>
  );
};

export default React.memo(WeeklyAttendanceTrendChart);
