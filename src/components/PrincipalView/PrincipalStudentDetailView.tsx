import React from 'react';
import { StudentAcademicRecord } from '../../components/StudentPerformanceDashboard/types'; // Adjusted path
import { Row, Col, Card, Typography, Spin, Statistic } from 'antd';
import GpaTrendChart from '../../components/StudentPerformanceDashboard/GpaTrendChart';
import SkillProficiencyChart from '../../components/StudentPerformanceDashboard/SkillProficiencyChart';
import StudentGradeDistributionChart from '../../components/StudentPerformanceDashboard/StudentGradeDistributionChart';
import DegreeCompletionProgress from '../../components/StudentPerformanceDashboard/DegreeCompletionProgress';
import StudentGradeGrid from '../../components/StudentPerformanceDashboard/StudentGradeGrid';

const { Title } = Typography;

interface PrincipalStudentDetailViewProps {
  studentAcademicRecord: StudentAcademicRecord | null;
  loading?: boolean;
}

// Simplified KpiCard for this view
const KpiCard: React.FC<{ title: string; value: string | number; precision?: number; suffix?: string; loading?: boolean }> = ({ title, value, precision, suffix, loading }) => (
  <Col xs={24} sm={12} md={8} lg={6} xl={6} style={{ marginBottom: '16px' }}>
    <Card loading={loading}>
      <Statistic title={title} value={value} precision={precision} suffix={suffix} />
    </Card>
  </Col>
);

const PrincipalStudentDetailView: React.FC<PrincipalStudentDetailViewProps> = ({ studentAcademicRecord, loading }) => {
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}><Spin size="large" tip="Loading student details..." /></div>;
  }
  if (!studentAcademicRecord) {
    return <Card><Typography.Text>No academic record found for this student.</Typography.Text></Card>;
  }

  const studentKpiData = {
    cumulativeGPA: studentAcademicRecord.cumulativeGPA ?? "-",
    totalCreditsEarned: studentAcademicRecord.totalCreditsEarned ?? "-",
    requiredCreditsForDegree: studentAcademicRecord.requiredCreditsForDegree ?? "-",
  };

  return (
    <div style={{ padding: '20px' }}> {/* Added padding to the main div */}
      {/* KPIs Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <KpiCard title="Cumulative GPA" value={studentKpiData.cumulativeGPA} precision={2} loading={loading} />
        <KpiCard title="Total Credits Earned" value={studentKpiData.totalCreditsEarned} loading={loading} />
        <KpiCard title="Required Credits for Degree" value={studentKpiData.requiredCreditsForDegree} loading={loading} />
      </Row>

      {/* Charts Row 1 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="GPA Trend" loading={loading}>
            <GpaTrendChart studentAcademicRecord={studentAcademicRecord} loading={loading} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Skill Proficiency" loading={loading}>
            <SkillProficiencyChart studentAcademicRecord={studentAcademicRecord} loading={loading} />
          </Card>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Grade Distribution" loading={loading}>
            <StudentGradeDistributionChart studentAcademicRecord={studentAcademicRecord} loading={loading} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Degree Completion Progress" loading={loading}>
            <DegreeCompletionProgress studentAcademicRecord={studentAcademicRecord} loading={loading} />
          </Card>
        </Col>
      </Row>

      {/* Student Grade Grid */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Course Grades" loading={loading}>
            {/* Assuming onGradeUpdate is not critical for read-only principal view */}
            <StudentGradeGrid studentAcademicRecord={studentAcademicRecord} loading={loading} onGradeUpdate={() => { console.log("Grade update N/A in Principal View"); }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
export default React.memo(PrincipalStudentDetailView);
