import React, { useMemo } from 'react';
import { ResponsiveLine, Serie } from '@nivo/line';
import { Card, Typography, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { StudentAcademicRecord, Term } from './types'; // Adjust path
import dayjs from 'dayjs'; // For sorting terms if needed, though termId might be sortable

interface GpaTrendChartProps {
  studentAcademicRecord: StudentAcademicRecord | null; // Corrected prop name from academicRecord
  loading?: boolean;
}

const GpaTrendChart: React.FC<GpaTrendChartProps> = ({ studentAcademicRecord, loading }) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    if (!studentAcademicRecord || !studentAcademicRecord.terms || studentAcademicRecord.terms.length === 0) {
      return [];
    }

    // Sort terms chronologically if not already sorted.
    // Assuming termId like "FA2022", "SP2023" can be sorted reasonably for now,
    // or use startDate if available and reliable.
    const sortedTerms = [...studentAcademicRecord.terms].sort((a, b) => {
        // Simple sort: SP comes before FA for same year, then by year.
        const yearA = parseInt(a.termId.slice(-4));
        const yearB = parseInt(b.termId.slice(-4));
        if (yearA !== yearB) return yearA - yearB;
        // For the same year, Spring (SP) should come before Fall (FA)
        if (a.termId.startsWith('SP') && b.termId.startsWith('FA')) return -1;
        if (a.termId.startsWith('FA') && b.termId.startsWith('SP')) return 1;
        return 0; // Should not happen if termIds are unique and follow pattern
    });


    const gpaData: { x: string; y: number | null }[] = sortedTerms.map(term => ({
      x: term.termName, // Use termName for x-axis labels (e.g., "Fall 2022")
      y: term.termGPA !== undefined ? term.termGPA : null, // Handle cases where GPA might be null/undefined
    }));

    if (gpaData.every(d => d.y === null)) return []; // No valid GPA data to plot

    return [{
      id: t('studentPerformanceDashboard.charts.gpaTrend.seriesName', 'Term GPA'),
      data: gpaData,
    }] as Serie[]; // Cast to Serie[] for Nivo
  }, [studentAcademicRecord, t]);


  if (loading) {
    return <Card title={t('studentPerformanceDashboard.charts.gpaTrend.title', 'GPA Trend')} style={{ minHeight: 300 }} loading={true} />;
  }

  if (!studentAcademicRecord || chartData.length === 0 || chartData.every(s => s.data.length === 0)) {
     return (
        <Card title={t('studentPerformanceDashboard.charts.gpaTrend.title', 'GPA Trend')} style={{ minHeight: 300 }}>
            <Empty description={t('common.noDataForChart', 'No GPA data available for trend chart.')} />
        </Card>
    );
  }

  return (
    <Card title={t('studentPerformanceDashboard.charts.gpaTrend.title', 'GPA Trend')} style={{ minHeight: 300 }}>
      <div style={{ height: 250 }}> {/* Adjust height for line chart */}
        <ResponsiveLine
          data={chartData}
          margin={{ top: 20, right: 30, bottom: 80, left: 60 }} // Increased bottom margin for term names
          xScale={{ type: 'point' }}
          yScale={{
            type: 'linear',
            min: 0.0, // GPA typically 0-4
            max: 4.0, // Adjust if GPA scale is different (e.g. 5.0)
            stacked: false,
            reverse: false,
          }}
          yFormat=" >-.2f" // Format y-axis values to 2 decimal places
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -30, // Rotate term names if they overlap
            legend: t('studentPerformanceDashboard.charts.gpaTrend.termLegend', 'Term'),
            legendOffset: 70, // Adjusted offset
            legendPosition: 'middle',
          }}
          axisLeft={{
            orient: 'left',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: t('studentPerformanceDashboard.charts.gpaTrend.gpaLegend', 'GPA'),
            legendOffset: -45,
            legendPosition: 'middle',
            format: value => value.toFixed(1), // Format axis ticks to 1 decimal
          }}
          pointSize={10}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          pointLabelYOffset={-12}
          useMesh={true}
          legends={[]} // No legend needed for a single line
          curve="monotoneX"
          enableArea={true}
          areaOpacity={0.1}
          tooltip={({ point }) => {
            return (
                <div style={{ padding: '5px 10px', background: 'white', border: '1px solid #ccc', borderRadius: '3px' }}>
                    <strong>{point.data.xFormatted}</strong><br />
                    {t('studentPerformanceDashboard.charts.gpaTrend.gpaLabel', 'GPA')}: {point.data.y !== null ? point.data.yFormatted : t('common.notApplicableShort', 'N/A')}
                </div>
            )
          }}
          // Handle null data points by not connecting them or showing gaps
          // Nivo line chart handles nulls by default by creating gaps in the line.
        />
      </div>
    </Card>
  );
};

export default React.memo(GpaTrendChart);
