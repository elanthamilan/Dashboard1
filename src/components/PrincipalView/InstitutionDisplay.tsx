// src/components/PrincipalView/InstitutionDisplay.tsx
import React from 'react';
import { Card, Col, Row, Statistic, Typography, Button } from 'antd';
import { Institution } from '../../types/hierarchy'; // Adjust path as needed

const { Title } = Typography;

interface InstitutionDisplayProps {
  institution: Institution;
  onSelectInstitution: (institutionId: string) => void; // Callback to handle selection
}

const InstitutionDisplay: React.FC<InstitutionDisplayProps> = ({ institution, onSelectInstitution }) => {
  return (
    <Card title={<Title level={4}>{institution.institutionName}</Title>}>
      <Row gutter={16}>
        <Col span={12}>
          <Statistic title="Total Students" value={institution.totalStudents} />
        </Col>
        <Col span={12}>
          <Statistic title="Overall Average GPA" value={institution.overallAverageGPA?.toFixed(2) || 'N/A'} />
        </Col>
      </Row>

              {/* Attendance & Billing KPIs */}
              <Row gutter={16} style={{ marginTop: '10px' }}>
                <Col span={6}>
                  <Statistic
                    title="Avg. Attendance"
                    value={institution.institutionAttendancePercentage !== undefined ? institution.institutionAttendancePercentage.toFixed(1) : undefined}
                    suffix={institution.institutionAttendancePercentage !== undefined ? "%" : undefined}
                    formatter={institution.institutionAttendancePercentage === undefined ? () => <Typography.Text type="secondary" style={{fontSize: '1em'}}>N/A</Typography.Text> : undefined}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Total Absences"
                    value={institution.totalInstitutionAbsences ?? 'N/A'}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Avg. Fees Paid"
                    value={institution.institutionFeesPaidPercentage !== undefined ? institution.institutionFeesPaidPercentage.toFixed(1) : undefined}
                    suffix={institution.institutionFeesPaidPercentage !== undefined ? "%" : undefined}
                    formatter={institution.institutionFeesPaidPercentage === undefined ? () => <Typography.Text type="secondary" style={{fontSize: '1em'}}>N/A</Typography.Text> : undefined}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Students w/ Overdue Fees"
                    value={institution.totalStudentsWithOverdueFeesInInstitution ?? 'N/A'}
                  />
                </Col>
              </Row>

              {/* Admissions KPIs */}
              <Row gutter={16} style={{ marginTop: '10px' }}>
                <Col span={8}>
                  <Statistic title="Total Applicants" value={institution.totalInstitutionApplicants ?? 'N/A'} />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Avg. Acceptance Rate"
                    value={institution.avgInstitutionAcceptanceRate !== undefined ? institution.avgInstitutionAcceptanceRate.toFixed(1) : undefined}
                    suffix={institution.avgInstitutionAcceptanceRate !== undefined ? "%" : undefined}
                    formatter={institution.avgInstitutionAcceptanceRate === undefined ? () => <Typography.Text type="secondary" style={{fontSize: '1em'}}>N/A</Typography.Text> : undefined}
                  />
                </Col>
                <Col span={8}>
                  <Statistic title="Total Enrolled" value={institution.totalInstitutionEnrolledCount ?? 'N/A'} />
                </Col>
              </Row>

              {/* Student Risk and Grades */}
              <Row gutter={16} style={{ marginTop: '10px' }}>
                 <Col span={12}>
                  <Statistic title="Total At-Risk Students" value={institution.totalInstitutionAtRiskStudents ?? 'N/A'} />
                </Col>
                <Col span={12}>
                  <Typography.Text strong style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)'}}>Grade Distribution</Typography.Text>
                  <Typography.Text style={{display: 'block', fontSize: '14px'}}>
                    {institution.institutionGradeDistribution
                      ? Object.entries(institution.institutionGradeDistribution).map(([grade, count]) => `${grade}:${count}`).join('; ')
                      : 'N/A'}
                  </Typography.Text>
                </Col>
              </Row>

      <Button type="primary" style={{ marginTop: '20px' }} onClick={() => onSelectInstitution(institution.institutionId)}>
        View Academic Years
      </Button>
    </Card>
  );
};

export default InstitutionDisplay;
