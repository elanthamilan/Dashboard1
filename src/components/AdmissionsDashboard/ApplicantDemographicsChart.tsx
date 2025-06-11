import React, { useState, useMemo } from 'react';
import { Pie } from '@ant-design/plots'; // Using Pie for a Donut chart configuration
import { Card, Spin, Typography, Empty, Radio } from 'antd';
import { useTranslation } from 'react-i18next';
import { Applicant } from './types';

interface ApplicantDemographicsChartProps {
  applicants: Applicant[];
  loading: boolean;
}

type DemographicView = 'program' | 'gender' | 'location';

interface ChartDataType {
  type: string; // Category value (e.g., program name, gender, location type)
  value: number; // Count
}

const IN_STATE_COUNTRY = "United States"; // Define the In-State country

const ApplicantDemographicsChart: React.FC<ApplicantDemographicsChartProps> = ({ applicants, loading }) => {
  const { t } = useTranslation();
  const [selectedDemographic, setSelectedDemographic] = useState<DemographicView>('program');

  const demographicDisplayNames: Record<DemographicView, string> = {
    program: t('admissionsDashboard.charts.demographics.program', 'Program'),
    gender: t('admissionsDashboard.charts.demographics.gender', 'Gender'),
    location: t('admissionsDashboard.charts.demographics.location', 'Location (In-State/Out-of-State)'),
  };

  const processedData = useMemo(() => {
    if (loading || !applicants) {
      return [];
    }

    const enrolledApplicants = applicants.filter(app => app.status === 'Enrollment Confirmed');
    if (enrolledApplicants.length === 0) {
      return [];
    }

    const counts: Record<string, number> = {};

    enrolledApplicants.forEach(applicant => {
      let key: string;
      switch (selectedDemographic) {
        case 'program':
          key = applicant.programName || t('common.notSpecified', 'N/A');
          break;
        case 'gender':
          key = applicant.gender || t('common.notSpecified', 'N/A');
          break;
        case 'location':
          key = applicant.address?.country === IN_STATE_COUNTRY ?
                t('admissionsDashboard.charts.demographics.inState', 'In-State') :
                t('admissionsDashboard.charts.demographics.outOfState', 'Out-of-State');
          break;
        default:
          key = t('common.unknown', 'Unknown');
      }
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([type, value]) => ({ type, value }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

  }, [applicants, loading, selectedDemographic, t]);

  const chartTitle = t('admissionsDashboard.charts.demographics.title', 'Enrolled Student Demographics: By {{demographic}}', {
    demographic: demographicDisplayNames[selectedDemographic]
  });

  const totalEnrolledForCurrentView = useMemo(() => processedData.reduce((sum, item) => sum + item.value, 0), [processedData]);

  if (loading) {
    return (
      <Card title={chartTitle}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}><Spin /></div>
      </Card>
    );
  }

  const config = {
    appendPadding: 10,
    data: processedData,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.6,
    height: 350, // Adjusted height
    legend: {
      position: 'top-right' as const,
      layout: 'vertical' as const,
      offsetX: -20,
    },
    label: {
      type: 'inner',
      offset: '-50%',
      content: ({ percent }: any) => `${(percent * 100).toFixed(0)}%`,
      style: { textAlign: 'center', fontSize: 12, fill: '#fff' },
    },
    interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
    statistic: {
      title: {
        offsetY: -8, // Adjusted
        formatter: () => demographicDisplayNames[selectedDemographic],
        style: { fontSize: '14px', color: '#555', textAlign: 'center' } // Ensure title is centered
      },
      content: {
        offsetY: 8, // Adjusted
        style: { fontSize: '22px', fontWeight: 'bold', textAlign: 'center' }, // Ensure content is centered
        formatter: () => totalEnrolledForCurrentView.toLocaleString(),
      },
    },
    tooltip: {
      formatter: (datum: ChartDataType) => ({
        name: datum.type,
        value: `${datum.value} ${t('admissionsDashboard.charts.demographics.students', 'Students')}`,
      }),
    },
  };

  return (
    <Card
        title={chartTitle}
        extra={
            <Radio.Group
                value={selectedDemographic}
                onChange={e => setSelectedDemographic(e.target.value)}
                size="small"
            >
                <Radio.Button value="program">{demographicDisplayNames.program.split('(')[0].trim()}</Radio.Button>
                <Radio.Button value="gender">{demographicDisplayNames.gender.split('(')[0].trim()}</Radio.Button>
                <Radio.Button value="location">{demographicDisplayNames.location.split('(')[0].trim()}</Radio.Button>
            </Radio.Group>
        }
    >
      {processedData.length === 0 ? (
        <div style={{ height: 350, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Empty description={t('common.noDataAvailableForCategory', 'No enrolled student data available for this demographic.')} />
        </div>
      ) : (
        <Pie {...config} />
      )}
    </Card>
  );
};

export default ApplicantDemographicsChart;
