import React from 'react';
import { Card, Col, Row, Typography, Button } from 'antd';
import { Institution, AcademicYear } from '../../types/hierarchy'; // Adjust path as needed
import { useTranslation } from 'react-i18next';
import KPICard from '../KPICard'; // Assuming KPICard is in the parent directory
import OverallGradeDistributionChart from './charts/OverallGradeDistributionChart';
import MiniInstitutionAttendanceChart from './charts/MiniInstitutionAttendanceChart';
import MiniAdmissionsSnapshotChart from './charts/MiniAdmissionsSnapshotChart';
import { UserOutlined, SolutionOutlined, RiseOutlined, FallOutlined, AlertOutlined, IssuesCloseOutlined } from '@ant-design/icons'; // Example icons

const { Title } = Typography;

interface InstitutionOverviewDisplayProps {
  institution: Institution;
  onNavigateToAcademicYears: () => void;
  loading?: boolean; // Add loading prop for consistency if data fetching is simulated here
}

const InstitutionOverviewDisplay: React.FC<InstitutionOverviewDisplayProps> = ({ institution, onNavigateToAcademicYears, loading = false }) => {
  const { t } = useTranslation();

  const kpis = [
    { titleKey: 'kpi.totalStudents', value: institution.totalStudents ?? 'N/A', icon: <UserOutlined /> },
    { titleKey: 'kpi.overallAverageGPA', value: institution.overallAverageGPA?.toFixed(2) ?? 'N/A', icon: <SolutionOutlined /> },
    { titleKey: 'kpi.overallPlacementRate', value: institution.overallPlacementRate, suffix: '%', precision: 1, icon: <RiseOutlined /> },
    { titleKey: 'kpi.totalAtRiskStudents', value: institution.totalInstitutionAtRiskStudents ?? 'N/A', icon: <AlertOutlined /> },
    { titleKey: 'kpi.studentsWithOverdueFees', value: institution.totalStudentsWithOverdueFeesInInstitution ?? 'N/A', icon: <FallOutlined /> },
    { titleKey: 'kpi.openGrievances', value: institution.openGrievancesCount ?? 'N/A', icon: <IssuesCloseOutlined /> },
  ];

  const admissionsChartData = {
    applicants: institution.totalInstitutionApplicants,
    enrolled: institution.totalInstitutionEnrolledCount,
    acceptanceRate: institution.avgInstitutionAcceptanceRate,
  };

  return (
    <div style={{padding: '24px'}}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            {institution.institutionName} - {t('principalView.institutionOverview.dashboardTitle', 'Overview Dashboard')}
          </Title>
        </Col>
        <Col>
          <Button type="primary" onClick={onNavigateToAcademicYears}>
            {t('principalView.institutionOverview.viewAcademicYears', 'View Academic Years')}
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {kpis.map(kpi => (
          <Col xs={24} sm={12} md={8} lg={4} key={kpi.titleKey}>
            <KPICard
              titleKey={`principalView.institutionOverview.${kpi.titleKey}`}
              value={kpi.value}
              icon={kpi.icon}
              loading={loading}
              valueSuffix={kpi.suffix}
              // precision for KPICard is handled internally based on value type
            />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12} lg={8}>
          <OverallGradeDistributionChart
            gradeDistribution={institution.institutionGradeDistribution}
            title={t('principalView.charts.overallGradeDistribution', 'Overall Grade Distribution')}
            loading={loading}
          />
        </Col>
        <Col xs={24} md={12} lg={8}>
          <MiniInstitutionAttendanceChart
            academicYears={institution.academicYears || []}
            title={t('principalView.charts.annualAttendanceTrend', 'Annual Attendance Trend')}
            loading={loading}
          />
        </Col>
        <Col xs={24} md={12} lg={8}>
          <MiniAdmissionsSnapshotChart
            applicants={admissionsChartData.applicants}
            enrolled={admissionsChartData.enrolled}
            acceptanceRate={admissionsChartData.acceptanceRate}
            title={t('principalView.charts.admissionsSnapshot', 'Admissions Snapshot')}
            loading={loading}
          />
        </Col>
      </Row>
    </div>
  );
};

export default InstitutionOverviewDisplay;
