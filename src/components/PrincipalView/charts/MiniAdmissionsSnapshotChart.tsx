import React, { useMemo } from 'react';
import { Bar } from '@ant-design/plots';
import { Card, Spin, Typography, Empty } from 'antd';
import { useTranslation } from 'react-i18next';

interface MiniAdmissionsSnapshotChartProps {
  applicants?: number;
  enrolled?: number;
  acceptanceRate?: number; // Percentage e.g. 60 for 60%
  title: string;
  loading: boolean;
}

interface ChartDataType {
  stage: string;
  count: number;
}

const MiniAdmissionsSnapshotChart: React.FC<MiniAdmissionsSnapshotChartProps> = ({
  applicants,
  enrolled,
  acceptanceRate,
  title,
  loading,
}) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    const data: ChartDataType[] = [];

    if (applicants === undefined || enrolled === undefined) { // Acceptance rate is optional for this chart
        return [];
    }

    data.push({ stage: t('admissions.kpi.applicants', 'Applicants'), count: applicants });

    let offersMadeCount = 0;
    if (applicants !== undefined && acceptanceRate !== undefined && acceptanceRate > 0) {
      offersMadeCount = Math.round(applicants * (acceptanceRate / 100));
      data.push({ stage: t('admissions.kpi.offersMadeShort', 'Offers'), count: offersMadeCount });
    }

    data.push({ stage: t('admissions.kpi.enrolledShort', 'Enrolled'), count: enrolled });

    // Filter out stages with zero count if not the first stage (Applicants)
    return data.filter((item, index) => item.count > 0 || index === 0);

  }, [applicants, enrolled, acceptanceRate, t]);

  if (loading) {
    return (
      <Card title={title} size="small">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}><Spin /></div>
      </Card>
    );
  }

  if (chartData.length <= 1 && chartData[0]?.count === 0) { // Show empty if only 'Applicants: 0' or completely empty
    return (
      <Card title={title} size="small">
        <div style={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Empty description={t('common.noDataAvailableForChart', 'No admissions data available.')} />
        </div>
      </Card>
    );
  }

  const config = {
    data: chartData,
    xField: 'stage',
    yField: 'count',
    seriesField: 'stage',
    height: 250,
    legend: { visible: false },
    color: ['#5B8FF9', '#5AD8A6', '#5D7092'], // Example: Applicants, Offers, Enrolled
    label: {
      position: 'middle' as const,
      content: (item: ChartDataType) => `${item.count}`,
      style: { fill: '#fff', fontSize: 10 },
      layout: [{ type: 'interval-adjust-position' }] as any[],
    },
    xAxis: {
      title: { text: null },
      label: { style: {fontSize: 10} }
    },
    yAxis: {
      title: { text: t('charts.countAxisTitle', 'Count'), style: {fontSize: 10} },
      label: { formatter: (val: number) => Math.floor(val).toString(), style: {fontSize: 10} }, // Ensure integer labels
      min: 0,
    },
    tooltip: {
      formatter: (datum: ChartDataType) => ({
        name: datum.stage,
        value: `${datum.count}`,
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

export default MiniAdmissionsSnapshotChart;
