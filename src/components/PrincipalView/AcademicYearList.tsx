// src/components/PrincipalView/AcademicYearList.tsx
import React, { useState } from 'react';
import { List, Card, Statistic, Button, Row, Col, Typography, Checkbox } from 'antd';
import { AcademicYear } from '../../types/hierarchy'; // Adjust path
import { downloadCSV } from '../../utils/exportUtils'; // Added import

const { Title } = Typography;

interface AcademicYearListProps {
  academicYears: AcademicYear[];
  onSelectAcademicYear: (academicYearId: string) => void;
  onCompareAcademicYears: (selectedYearIds: string[]) => void;
  // institutionName?: string; // Decided to omit for this subtask
}

const AcademicYearList: React.FC<AcademicYearListProps> = ({ academicYears, onSelectAcademicYear, onCompareAcademicYears }) => {
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

  if (!academicYears || academicYears.length === 0) {
    return <p>No academic years available for this institution.</p>;
  }

  const handleCheckboxChange = (yearId: string, checked: boolean) => {
    setSelectedForComparison(prev =>
      checked ? [...prev, yearId] : prev.filter(id => id !== yearId)
    );
  };

  const handleCompareClick = () => {
    onCompareAcademicYears(selectedForComparison);
  };

  const handleGenerateReport = () => {
    const columns = [
      { key: 'yearId', title: 'Year ID' },
      { key: 'yearName', title: 'Year Name' },
      { key: 'totalStudents', title: 'Total Students' },
      { key: 'overallAverageGPA', title: 'Avg. GPA' },
      { key: 'annualAttendancePercentage', title: 'Avg. Attendance (%)' },
      { key: 'totalAnnualAbsences', title: 'Total Absences' },
      { key: 'annualFeesPaidPercentage', title: 'Avg. Fees Paid (%)' },
      { key: 'totalStudentsWithOverdueFeesInYear', title: 'Students w/ Overdue Fees' },
      { key: 'totalAnnualApplicants', title: 'Total Applicants' },
      { key: 'avgAnnualAcceptanceRate', title: 'Avg. Acceptance Rate (%)' },
      { key: 'totalAnnualEnrolledCount', title: 'Total Enrolled' },
      { key: 'totalAnnualAtRiskStudents', title: 'At-Risk Students' },
      // Grade distribution omitted for simplicity in CSV
    ];

    const reportData = academicYears.map(ay => ({
      ...ay,
      overallAverageGPA: ay.overallAverageGPA?.toFixed(2) || 'N/A',
      annualAttendancePercentage: ay.annualAttendancePercentage?.toFixed(1) || 'N/A',
      annualFeesPaidPercentage: ay.annualFeesPaidPercentage?.toFixed(1) || 'N/A',
      avgAnnualAcceptanceRate: ay.avgAnnualAcceptanceRate?.toFixed(1) || 'N/A',
      // Ensure other potentially complex objects are handled if necessary,
      // though most top-level AcademicYear fields are primitive or simple numbers/strings.
      // For example, 'degrees' is an array of objects and would be [object Object] if not handled.
      // For this report, we are primarily concerned with the direct KPIs of the AcademicYear itself.
      // If degree-specific data were needed, the report structure would be more complex.
      degrees: undefined, // Explicitly remove to avoid [object Object]
      annualGradeDistribution: undefined, // Explicitly remove or flatten if needed
    }));

    const fileName = "academic_years_report"; // Simplified filename

    downloadCSV(reportData, columns, fileName);
  };

  const canCompare = selectedForComparison.length >= 2 && selectedForComparison.length <= 3;

  return (
    <div style={{ marginTop: '24px' }}>
      <Title level={4} style={{ marginBottom: '16px' }}>Academic Years</Title>

      <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
        <Col>
          <Button onClick={handleCompareClick} type="primary" disabled={!canCompare} ghost>
            Compare Selected ({selectedForComparison.length})
          </Button>
        </Col>
        <Col>
          <Button onClick={handleGenerateReport} type="default">
            Generate Report (CSV)
          </Button>
        </Col>
      </Row>

      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 3 }}
        dataSource={academicYears}
        renderItem={year => (
          <List.Item>
            <Card
              title={year.yearName}
              extra={<Checkbox
                       checked={selectedForComparison.includes(year.yearId)}
                       onChange={(e) => handleCheckboxChange(year.yearId, e.target.checked)}
                     />}
            >
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
                <Col span={6}>
                  <Statistic
                    title="Avg. Attendance"
                    value={year.annualAttendancePercentage !== undefined ? year.annualAttendancePercentage.toFixed(1) : undefined}
                    suffix={year.annualAttendancePercentage !== undefined ? "%" : undefined}
                    formatter={year.annualAttendancePercentage === undefined ? () => <Typography.Text type="secondary" style={{fontSize: '1em'}}>N/A</Typography.Text> : undefined}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Total Absences"
                    value={year.totalAnnualAbsences ?? 'N/A'}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Avg. Fees Paid"
                    value={year.annualFeesPaidPercentage !== undefined ? year.annualFeesPaidPercentage.toFixed(1) : undefined}
                    suffix={year.annualFeesPaidPercentage !== undefined ? "%" : undefined}
                    formatter={year.annualFeesPaidPercentage === undefined ? () => <Typography.Text type="secondary" style={{fontSize: '1em'}}>N/A</Typography.Text> : undefined}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Students w/ Overdue Fees"
                    value={year.totalStudentsWithOverdueFeesInYear ?? 'N/A'}
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
