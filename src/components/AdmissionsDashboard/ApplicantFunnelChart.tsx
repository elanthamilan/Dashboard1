import React from 'react';
import { ResponsiveFunnel, FunnelDatum } from '@nivo/funnel';
import { Card, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { Applicant } from './types'; // Assuming types.ts is in the same folder or ../types

interface ApplicantFunnelChartProps {
  data: Applicant[];
  loading?: boolean;
}

const ApplicantFunnelChart: React.FC<ApplicantFunnelChartProps> = ({ data, loading }) => {
  const { t } = useTranslation();

  // Define funnel stages based on ApplicationStatus and funnelStage property
  const funnelStages = [
    { id: 'applied', value: 0, label: t('admissionsDashboard.funnel.applied', 'Applied') },
    { id: 'shortlisted', value: 0, label: t('admissionsDashboard.funnel.shortlisted', 'Shortlisted') },
    { id: 'interview', value: 0, label: t('admissionsDashboard.funnel.interview', 'Interview Scheduled') },
    { id: 'offered', value: 0, label: t('admissionsDashboard.funnel.offered', 'Offered') },
    { id: 'accepted', value: 0, label: t('admissionsDashboard.funnel.accepted', 'Accepted') },
    { id: 'confirmed', value: 0, label: t('admissionsDashboard.funnel.confirmed', 'Enrollment Confirmed') },
  ];

  // Process applicant data to count occurrences for each funnel stage
  const processedData: FunnelDatum[] = funnelStages.map(stageConfig => {
    let count = 0;
    switch (stageConfig.id) {
      case 'applied':
        count = data.filter(a => a.funnelStage >= 1).length;
        break;
      case 'shortlisted':
        count = data.filter(a => a.funnelStage >= 2).length;
        break;
      case 'interview':
        count = data.filter(a => a.funnelStage >= 3).length;
        break;
      case 'offered':
        count = data.filter(a => a.funnelStage >= 4).length;
        break;
      case 'accepted':
        count = data.filter(a => a.funnelStage >= 5).length;
        break;
      case 'confirmed':
        count = data.filter(a => a.funnelStage >= 6).length;
        break;
      default:
        count = 0;
    }
    return {
      id: stageConfig.id,
      value: count,
      label: stageConfig.label,
    };
  }).filter(d => d.value > 0); // Only include stages with data

  if (loading) {
    return <Card title={t('admissionsDashboard.funnel.title', 'Applicant Funnel')} style={{ height: 400 }} loading={true} />;
  }

  if (processedData.length === 0 && !loading) {
    return (
        <Card title={t('admissionsDashboard.funnel.title', 'Applicant Funnel')} style={{ height: 400 }}>
            <Typography.Text>{t('common.noData', 'No data available for the funnel chart.')}</Typography.Text>
        </Card>
    );
  }

  return (
    <Card title={t('admissionsDashboard.funnel.title', 'Applicant Funnel')} style={{ height: 400 }}>
      <ResponsiveFunnel
        data={processedData}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        shapeBlending={0.35}
        valueFormat=">-.0s" // Format numbers (e.g., 1.2k)
        colors={{ scheme: 'spectral' }}
        borderWidth={20}
        labelColor={{
            from: 'color',
            modifiers: [['darker', 3]],
        }}
        beforeSeparatorLength={100}
        beforeSeparatorOffset={20}
        afterSeparatorLength={100}
        afterSeparatorOffset={20}
        currentPartSizeExtension={10}
        currentBorderWidth={40}
        motionConfig="wobbly"
      />
    </Card>
  );
};

export default ApplicantFunnelChart;
