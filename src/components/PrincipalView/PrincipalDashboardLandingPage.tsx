// src/components/PrincipalView/PrincipalDashboardLandingPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Divider, Row, Col, Spin } from 'antd';
import GlobalFilters from './GlobalFilters';
import KPICard from './KPICard';
import {
    UserOutlined, DollarCircleOutlined, CheckCircleOutlined, UserDeleteOutlined,
    SolutionOutlined, RiseOutlined // Added RiseOutlined for Placement
} from '@ant-design/icons';
import { useGlobalFilters } from '../../contexts/GlobalFilterContext';
import { generateMockInstitutions } from '../../utils/mockData/academics/generateMockAcademicData';
import { Institution, StudentSummary } from '../../types/hierarchy';

const { Title, Text, Paragraph } = Typography;

const PrincipalDashboardLandingPage: React.FC = () => {
  const filters = useGlobalFilters();
  const [institutionData, setInstitutionData] = useState<Institution | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    try {
      const data = generateMockInstitutions(500, 3, 50);
      if (data && data.length > 0) {
        setInstitutionData(data[0]);
      } else {
        setInstitutionData(null);
        console.error("No institution data generated.");
      }
    } catch (error) {
      console.error("Error generating institution data:", error);
      setInstitutionData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const allStudentsInInstitution = useMemo((): StudentSummary[] => {
    if (!institutionData) return [];
    const students: StudentSummary[] = [];
    institutionData.academicYears.forEach(year => {
      year.degrees.forEach(degree => {
        degree.programs.forEach(program => {
          program.semesters.forEach(semester => {
            // Ensure students within a semester are part of the list
            // If semester.students is already populated with StudentSummary, this is fine
            students.push(...semester.students);
          });
        });
      });
    });
    const uniqueStudentsMap = new Map<string, StudentSummary>();
    students.forEach(s => {
        if (s && s.studentId && !uniqueStudentsMap.has(s.studentId)) { // Check if studentId is defined
            uniqueStudentsMap.set(s.studentId, s);
        }
    });
    return Array.from(uniqueStudentsMap.values());
  }, [institutionData]);

  const dropoutRate = useMemo(() => {
    if (!institutionData || allStudentsInInstitution.length === 0) return 0;
    const inactiveStudents = allStudentsInInstitution.filter(
      student => student.enrollmentStatus === 'Inactive'
    ).length;
    const graduatedStudents = allStudentsInInstitution.filter(
      student => student.enrollmentStatus === 'Graduated'
    ).length;
    const potentialBase = allStudentsInInstitution.length - graduatedStudents;
    if (potentialBase === 0) return 0;
    const calculatedRate = (inactiveStudents / potentialBase) * 100;
    return parseFloat(calculatedRate.toFixed(2));
  }, [institutionData, allStudentsInInstitution]);

  const academicPassRate = useMemo(() => {
    if (!institutionData || allStudentsInInstitution.length === 0) return 0;
    const passingStudents = allStudentsInInstitution.filter(
      student => student.cumulativeGPA !== undefined && student.cumulativeGPA >= 2.0
    ).length;
    const calculatedRate = (passingStudents / allStudentsInInstitution.length) * 100;
    return parseFloat(calculatedRate.toFixed(2));
  }, [institutionData, allStudentsInInstitution]);

  const totalEnrollments = institutionData?.totalInstitutionEnrolledCount ?? 0;
  const feeCollectionPercentage = institutionData?.institutionFeesPaidPercentage ?? 0;
  const averageAttendancePercentage = institutionData?.institutionAttendancePercentage ?? 0;
  const placementSuccessRate = institutionData?.overallPlacementRate ?? 0;
  // const averagePackage = institutionData?.overallAveragePackage ?? 0; // For tooltip or secondary display

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Principal's Bird’s-Eye Dashboard</Title>
      <Paragraph>High-level institutional health at a glance, with interactive KPI cards that reveal deeper modules.</Paragraph>

      <GlobalFilters />

      <Divider />
      <Title level={3} style={{ marginTop: '20px' }}>Institutional KPIs</Title>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>
      ) : institutionData ? (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <KPICard
              titleKey="kpi.totalEnrollments.title"
              value={totalEnrollments}
              tooltipKey="kpi.totalEnrollments.tooltip"
              icon={<UserOutlined />}
              onClick={() => console.log('Total Enrollments Clicked')}
              loading={loading}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <KPICard
              titleKey="kpi.dropoutRate.title"
              value={dropoutRate}
              valueSuffix="%"
              tooltipKey="kpi.dropoutRate.tooltip"
              icon={<UserDeleteOutlined />}
              onClick={() => console.log('Dropout Rate Clicked')}
              loading={loading}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <KPICard
              titleKey="kpi.academicPassRate.title"
              value={academicPassRate}
              valueSuffix="%"
              tooltipKey="kpi.academicPassRate.tooltip"
              icon={<SolutionOutlined />}
              onClick={() => console.log('Academic Pass Rate Clicked')}
              loading={loading}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <KPICard
              titleKey="kpi.placementSuccessRate.title"
              value={placementSuccessRate}
              valueSuffix="%"
              tooltipKey="kpi.placementSuccessRate.tooltip"
              // Example: Tooltip could include avg package:
              // tooltipText={`${t('kpi.placementSuccessRate.tooltip')} Avg Pkg: ${averagePackage > 0 ? (averagePackage/100000).toFixed(1) + 'LPA' : 'N/A'}`}
              icon={<RiseOutlined />}
              onClick={() => console.log('Placement Success Rate Clicked')}
              loading={loading}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <KPICard
              titleKey="kpi.feeCollection.title"
              value={feeCollectionPercentage}
              valueSuffix="%"
              tooltipKey="kpi.feeCollection.tooltip"
              icon={<DollarCircleOutlined />}
              onClick={() => console.log('Fee Collection Clicked')}
              loading={loading}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <KPICard
              titleKey="kpi.avgAttendance.title"
              value={averageAttendancePercentage}
              valueSuffix="%"
              tooltipKey="kpi.avgAttendance.tooltip"
              icon={<CheckCircleOutlined />}
              onClick={() => console.log('Average Attendance Clicked')}
              loading={loading}
            />
          </Col>
          {/* Remaining KPI cards will be added here */}
        </Row>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Text>No data available to display KPIs.</Text>
        </div>
      )}

      {/* Optional: Display selected filters for verification */}
      <div style={{ marginTop: '20px', padding: '10px', background: '#f9f9f9' }}>
        <Title level={4}>Current Filter State (for debugging):</Title>
        <Text>Academic Year: {filters.academicYear || 'Not set'}</Text><br />
        <Text>Campus: {filters.campus || 'Not set'}</Text><br />
        <Text>Degree Type: {filters.degreeType || 'Not set'}</Text><br />
        <Text>Department: {filters.department || 'Not set'}</Text><br />
        <Text>Date Range: {filters.dateRange ? `${filters.dateRange[0]} - ${filters.dateRange[1]}` : 'Not set'}</Text>
      </div>
    </div>
  );
};

export default PrincipalDashboardLandingPage;
