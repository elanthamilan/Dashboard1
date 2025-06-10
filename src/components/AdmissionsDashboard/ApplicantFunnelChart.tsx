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

  // Define funnel stages based on the new ApplicationStatus mapping to funnelStage
  // The `funnelStage` on Applicant data is now:
  // 1: Applied, 2: Screened, 3: Interview Scheduled, 4: Interview Complete,
  // 5: Offer Made, 6: Offer Accepted, 7: Enrollment Confirmed
  const funnelChartStages = [
    { id: 'applied', minFunnelStage: 1, label: t('admissionsDashboard.funnel.applied', 'Applied') },
    { id: 'screened', minFunnelStage: 2, label: t('admissionsDashboard.funnel.screened', 'Screened') },
    // For the chart, 'Interview Scheduled' and 'Interview Complete' might be grouped or shown sequentially.
    // Let's represent the start of the interview process.
    { id: 'interview_scheduled', minFunnelStage: 3, label: t('admissionsDashboard.funnel.interviewScheduled', 'Interview Scheduled') },
    // 'Interview Complete' (stage 4) could be another step if desired, or this implies they passed it.
    { id: 'offer_made', minFunnelStage: 5, label: t('admissionsDashboard.funnel.offerMade', 'Offer Made') },
    { id: 'offer_accepted', minFunnelStage: 6, label: t('admissionsDashboard.funnel.offerAccepted', 'Offer Accepted') },
    { id: 'confirmed', minFunnelStage: 7, label: t('admissionsDashboard.funnel.confirmed', 'Enrollment Confirmed') },
  ];

  // Process applicant data to count occurrences for each funnel stage
  // Nivo funnel chart expects data where each stage's value is the count of items AT OR BEYOND that stage.
  const processedData: FunnelDatum[] = funnelChartStages.map(stageConfig => {
    const count = data.filter(applicant => applicant.funnelStage >= stageConfig.minFunnelStage).length;
    return {
      id: stageConfig.id,
      value: count,
      label: stageConfig.label,
    };
  }).filter(d => d.value > 0); // Only include stages that have applicants

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
