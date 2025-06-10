import React, { useMemo } from 'react'; // Added useMemo
import { ResponsiveCalendar, CalendarDatum, CalendarTooltipProps } from '@nivo/calendar';
import { Card, Typography, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { AttendanceRecord, AttendanceStatus } from './types'; // Adjust path
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);


interface AttendanceCalendarHeatmapProps {
  records: AttendanceRecord[];
  loading?: boolean;
  year?: number; // Optional: to focus on a specific year, defaults to current
}

// Function to determine color based on attendance density/status
// This is a simple example; more sophisticated logic could be used
// const getDayColor = (count: number, statusCounts: { [key in AttendanceStatus]?: number }): string => {
//   if (count === 0) return '#eeeeee'; // No records
//   if ((statusCounts.Absent || 0) > 0) return '#ff7875'; // Red for any absence
//   if ((statusCounts.Late || 0) > 0) return '#ffc069'; // Orange for any late
//   if ((statusCounts.Excused || 0) > 0) return '#d3f8be'; // Light green for excused
//   if ((statusCounts.Present || 0) > 0 && (statusCounts.Present || 0) >= (count / 2) ) return '#95de64'; // Green for mostly present
//   return '#bae0ff'; // Default blueish for mixed or sparse data
// };

const AttendanceCalendarHeatmap: React.FC<AttendanceCalendarHeatmapProps> = ({ records, loading, year }) => {
  const { t } = useTranslation();
  const currentYear = year || dayjs().year();

  // Define the custom datum type
  interface CustomCalendarDatum extends CalendarDatum {
    present: number;
    absent: number;
    late: number;
    excused: number;
  }

  // Process records for the Nivo Calendar
  const calendarData = useMemo((): CustomCalendarDatum[] => { // Ensure this returns CustomCalendarDatum[]
    const dailyData: { [date: string]: { value: number; statuses: { [key in AttendanceStatus]?: number } } } = {};

    records.forEach(record => {
      const dateStr = dayjs(record.date).format('YYYY-MM-DD');
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = { value: 0, statuses: {} };
      }
      dailyData[dateStr].value += 1; // Count of records per day
      dailyData[dateStr].statuses[record.status] = (dailyData[dateStr].statuses[record.status] || 0) + 1;
    });

    return Object.entries(dailyData).map(([date, data]) => ({
      day: date,
      value: data.value, // Total records for the day
      // Custom data for tooltip or coloring
      absent: data.statuses.Absent || 0,
      present: data.statuses.Present || 0,
      late: data.statuses.Late || 0,
      excused: data.statuses.Excused || 0,
    }));
  }, [records]);


  if (loading) {
    return <Card title={t('attendanceDashboard.calendar.title', 'Attendance Calendar')} style={{ minHeight: 300 }} loading={true} />;
  }

  if (!loading && calendarData.length === 0) {
    return (
        <Card title={t('attendanceDashboard.calendar.title', 'Attendance Calendar')} style={{ minHeight: 300 }}>
            <Empty description={t('common.noDataForChart', 'No attendance data to display for the selected period.')} />
        </Card>
    );
  }

  // Determine date range for the calendar
  const fromDate = `${currentYear}-01-01`;
  const toDate = `${currentYear}-12-31`;

  // Filter calendarData to only include entries within the fromDate and toDate range
  const yearSpecificCalendarData = calendarData.filter(d => dayjs(d.day).isBetween(fromDate, toDate, 'day', '[]'));


  return (
    <Card title={t('attendanceDashboard.calendar.title', 'Attendance Calendar')} style={{ minHeight: 300 /* Approx height */ }}>
      <div style={{ height: 250 /* Adjust height for calendar */ }}>
        <ResponsiveCalendar
          data={yearSpecificCalendarData as CustomCalendarDatum[]} // Cast data to CustomCalendarDatum[]
          from={fromDate}
          to={toDate}
          emptyColor="#eeeeee"
          colors={[ '#95de64', '#d3f8be', '#ffc069', '#ff7875', '#bae0ff' ]} // Green (Present), Light Green (Excused), Orange (Late), Red (Absent), Blue (Mixed)
          // colorScale={{ // Alternative: custom color scale logic
          //   type: 'threshold',
          //   domain: [1, 2, 3, 4], // Example thresholds for 'badness'
          //   colors: ['#61cdbb', '#97e3d5', '#f47560', '#e8c1a0'],
          // }}
          margin={{ top: 30, right: 30, bottom: 0, left: 30 }}
          yearSpacing={40}
          monthBorderColor="#ffffff"
          dayBorderWidth={2}
          dayBorderColor="#ffffff"
          legends={[
            {
              anchor: 'bottom-right',
              direction: 'row',
              translateY: 36,
              itemCount: 4, // Or 5 if you want to show 'mixed'
              itemWidth: 42,
              itemHeight: 36,
              itemsSpacing: 14,
              itemDirection: 'right-to-left',
            },
          ]}
          tooltip={(props: CalendarTooltipProps) => {
            // Nivo passes an object conforming to CalendarTooltipProps.
            // Our custom fields (present, absent, etc.) are mixed into this object at runtime.
            // So, we cast props to a type that includes both CalendarTooltipProps and our custom fields.
            const extendedProps = props as CalendarTooltipProps & {
              // These are fields from our CustomCalendarDatum that are not formally in CalendarTooltipProps
              present: number;
              absent: number;
              late: number;
              excused: number;
            };
            return (
              <div style={{ padding: '5px 10px', background: 'white', border: '1px solid #ccc', borderRadius: '3px' }}>
                <strong>{dayjs(extendedProps.day).format('MMMM D, YYYY')}</strong><br />
                {t('attendanceDashboard.calendar.tooltip.totalRecords', 'Total Records')}: {extendedProps.value}<br />
                {extendedProps.present > 0 && <>{t('attendanceDashboard.calendar.tooltip.present', 'Present')}: {extendedProps.present}<br /></>}
                {extendedProps.absent > 0 && <>{t('attendanceDashboard.calendar.tooltip.absent', 'Absent')}: {extendedProps.absent}<br /></>}
                {extendedProps.late > 0 && <>{t('attendanceDashboard.calendar.tooltip.late', 'Late')}: {extendedProps.late}<br /></>}
                {extendedProps.excused > 0 && <>{t('attendanceDashboard.calendar.tooltip.excused', 'Excused')}: {extendedProps.excused}<br /></>}
              </div>
            );
          }}
        />
      </div>
    </Card>
  );
};

// memoize for performance if records prop changes frequently
export default React.memo(AttendanceCalendarHeatmap);
