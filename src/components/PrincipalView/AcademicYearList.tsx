// src/components/PrincipalView/AcademicYearList.tsx
import React from 'react';
import { List, Card, Statistic, Button, Row, Col, Typography } from 'antd';
import { AcademicYear } from '../../types/hierarchy'; // Adjust path

const { Title } = Typography;

interface AcademicYearListProps {
  academicYears: AcademicYear[];
  onSelectAcademicYear: (academicYearId: string) => void;
}

const AcademicYearList: React.FC<AcademicYearListProps> = ({ academicYears, onSelectAcademicYear }) => {
  if (!academicYears || academicYears.length === 0) {
    return <p>No academic years available for this institution.</p>;
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <Title level={4} style={{ marginBottom: '16px' }}>Academic Years</Title>
      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 3 }}
        dataSource={academicYears}
        renderItem={year => (
          <List.Item>
            <Card title={year.yearName}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Total Students" value={year.totalStudents} />
                </Col>
                <Col span={12}>
                  <Statistic title="Avg. GPA" value={year.overallAverageGPA?.toFixed(2) || 'N/A'} />
                </Col>
              </Row>

              {/* Attendance & Billing KPIs */}
              <Row gutter={16} style={{ marginTop: '10px' }}>
                <Col span={12}>
                  <Statistic
                    title="Avg. Attendance"
                    value={year.annualAttendancePercentage !== undefined ? year.annualAttendancePercentage.toFixed(1) : undefined}
                    suffix={year.annualAttendancePercentage !== undefined ? "%" : undefined}
                    formatter={year.annualAttendancePercentage === undefined ? () => <Typography.Text type="secondary" style={{fontSize: '1em'}}>N/A</Typography.Text> : undefined}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Avg. Fees Paid"
                    value={year.annualFeesPaidPercentage !== undefined ? year.annualFeesPaidPercentage.toFixed(1) : undefined}
                    suffix={year.annualFeesPaidPercentage !== undefined ? "%" : undefined}
                    formatter={year.annualFeesPaidPercentage === undefined ? () => <Typography.Text type="secondary" style={{fontSize: '1em'}}>N/A</Typography.Text> : undefined}
                  />
                </Col>
              </Row>

              {/* Admissions KPIs */}
              <Row gutter={16} style={{ marginTop: '10px' }}>
                <Col span={8}>
                  <Statistic title="Total Applicants" value={year.totalAnnualApplicants ?? 'N/A'} />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Avg. Acceptance Rate"
                    value={year.avgAnnualAcceptanceRate !== undefined ? year.avgAnnualAcceptanceRate.toFixed(1) : undefined}
                    suffix={year.avgAnnualAcceptanceRate !== undefined ? "%" : undefined}
                    formatter={year.avgAnnualAcceptanceRate === undefined ? () => <Typography.Text type="secondary" style={{fontSize: '1em'}}>N/A</Typography.Text> : undefined}
                  />
                </Col>
                <Col span={8}>
                  <Statistic title="Total Enrolled" value={year.totalAnnualEnrolledCount ?? 'N/A'} />
                </Col>
              </Row>

              {/* Student Risk and Grades */}
              <Row gutter={16} style={{ marginTop: '10px' }}>
                 <Col span={12}>
                  <Statistic title="Total At-Risk Students" value={year.totalAnnualAtRiskStudents ?? 'N/A'} />
                </Col>
                <Col span={12}>
                  <Typography.Text strong style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)'}}>Grade Distribution</Typography.Text>
                  <Typography.Text style={{display: 'block', fontSize: '14px'}}>
                    {year.annualGradeDistribution
                      ? Object.entries(year.annualGradeDistribution).map(([grade, count]) => `${grade}:${count}`).join('; ')
                      : 'N/A'}
                  </Typography.Text>
                </Col>
              </Row>

              <Button type="primary" style={{ marginTop: '20px' }} onClick={() => onSelectAcademicYear(year.yearId)}>
                View Degrees
              </Button>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default AcademicYearList;
