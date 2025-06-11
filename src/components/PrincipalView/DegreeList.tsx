// src/components/PrincipalView/DegreeList.tsx
import React, { useState } from 'react';
import { List, Card, Statistic, Button, Row, Col, Typography, Checkbox } from 'antd';
import { Degree } from '../../types/hierarchy'; // Adjust path
import { downloadCSV } from '../../utils/exportUtils'; // Added import

const { Title } = Typography;

interface DegreeListProps {
  degrees: Degree[];
  onSelectDegree: (degreeId: string) => void;
  onCompareDegrees: (selectedDegreeIds: string[]) => void;
}

const DegreeList: React.FC<DegreeListProps> = ({ degrees, onSelectDegree, onCompareDegrees }) => {
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

  if (!degrees || degrees.length === 0) {
    return <p>No degrees available for this academic year.</p>;
  }

  const handleCheckboxChange = (degreeId: string, checked: boolean) => {
    setSelectedForComparison(prev =>
      checked ? [...prev, degreeId] : prev.filter(id => id !== degreeId)
    );
  };

  const handleCompareClick = () => {
    onCompareDegrees(selectedForComparison);
  };

  const handleGenerateReport = () => {
    const columns = [
      { key: 'degreeId', title: 'Degree ID' },
      { key: 'degreeName', title: 'Degree Name' },
      { key: 'totalStudents', title: 'Total Students' },
      { key: 'averageDegreeGPA', title: 'Avg. GPA' },
      { key: 'avgAttendancePercentage', title: 'Avg. Attendance (%)' },
      { key: 'totalDegreeAbsences', title: 'Total Absences' },
      { key: 'avgFeesPaidPercentage', title: 'Avg. Fees Paid (%)' },
      { key: 'totalStudentsWithOverdueFeesInDegree', title: 'Students w/ Overdue Fees' },
      { key: 'totalApplicants', title: 'Total Applicants' },
      { key: 'avgAcceptanceRate', title: 'Avg. Acceptance Rate (%)' },
      { key: 'totalEnrolledCount', title: 'Total Enrolled' },
      { key: 'totalAtRiskStudents', title: 'At-Risk Students' },
      // overallGradeDistribution is omitted for CSV simplicity for now.
    ];

    const reportData = degrees.map(d => ({
      ...d,
      averageDegreeGPA: d.averageDegreeGPA?.toFixed(2) || 'N/A',
      avgAttendancePercentage: d.avgAttendancePercentage?.toFixed(1) || 'N/A',
      avgFeesPaidPercentage: d.avgFeesPaidPercentage?.toFixed(1) || 'N/A',
      avgAcceptanceRate: d.avgAcceptanceRate?.toFixed(1) || 'N/A',
      programs: undefined, // Ensure 'programs' array is not directly included
      overallGradeDistribution: undefined, // Explicitly remove or flatten if needed
    }));

    const fileName = "degrees_report";

    downloadCSV(reportData, columns, fileName);
  };

  const canCompare = selectedForComparison.length >= 2 && selectedForComparison.length <= 3;

  return (
    <div style={{ marginTop: '24px' }}>
      <Title level={4} style={{ marginBottom: '16px' }}>Degrees</Title>

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
        dataSource={degrees}
        renderItem={degree => (
          <List.Item>
            <Card
              title={degree.degreeName}
              extra={<Checkbox
                       checked={selectedForComparison.includes(degree.degreeId)}
                       onChange={(e) => handleCheckboxChange(degree.degreeId, e.target.checked)}
                     />}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Total Students" value={degree.totalStudents} />
                </Col>
                <Col span={12}>
                  <Statistic title="Avg. GPA" value={degree.averageDegreeGPA?.toFixed(2) || 'N/A'} />
                </Col>
              </Row>

              {/* Attendance & Billing KPIs */}
              <Row gutter={16} style={{ marginTop: '10px' }}>
                <Col span={6}>
                  <Statistic
                    title="Avg. Attendance"
                    value={degree.avgAttendancePercentage !== undefined ? degree.avgAttendancePercentage.toFixed(1) : undefined}
                    suffix={degree.avgAttendancePercentage !== undefined ? "%" : undefined}
                    formatter={degree.avgAttendancePercentage === undefined ? () => <Typography.Text type="secondary" style={{fontSize: '1em'}}>N/A</Typography.Text> : undefined}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Total Absences"
                    value={degree.totalDegreeAbsences ?? 'N/A'}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Avg. Fees Paid"
                    value={degree.avgFeesPaidPercentage !== undefined ? degree.avgFeesPaidPercentage.toFixed(1) : undefined}
                    suffix={degree.avgFeesPaidPercentage !== undefined ? "%" : undefined}
                    formatter={degree.avgFeesPaidPercentage === undefined ? () => <Typography.Text type="secondary" style={{fontSize: '1em'}}>N/A</Typography.Text> : undefined}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Students w/ Overdue Fees"
                    value={degree.totalStudentsWithOverdueFeesInDegree ?? 'N/A'}
                  />
                </Col>
              </Row>

              {/* Admissions KPIs */}
              <Row gutter={16} style={{ marginTop: '10px' }}>
                <Col span={8}>
                  <Statistic title="Total Applicants" value={degree.totalApplicants ?? 'N/A'} />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Avg. Acceptance Rate"
                    value={degree.avgAcceptanceRate !== undefined ? degree.avgAcceptanceRate.toFixed(1) : undefined}
                    suffix={degree.avgAcceptanceRate !== undefined ? "%" : undefined}
                    formatter={degree.avgAcceptanceRate === undefined ? () => <Typography.Text type="secondary" style={{fontSize: '1em'}}>N/A</Typography.Text> : undefined}
                  />
                </Col>
                <Col span={8}>
                  <Statistic title="Total Enrolled" value={degree.totalEnrolledCount ?? 'N/A'} />
                </Col>
              </Row>

              {/* Student Risk and Grades */}
              <Row gutter={16} style={{ marginTop: '10px' }}>
                 <Col span={12}>
                  <Statistic title="Total At-Risk Students" value={degree.totalAtRiskStudents ?? 'N/A'} />
                </Col>
                <Col span={12}>
                  <Typography.Text strong style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)'}}>Grade Distribution</Typography.Text>
                  <Typography.Text style={{display: 'block', fontSize: '14px'}}>
                    {degree.overallGradeDistribution
                      ? Object.entries(degree.overallGradeDistribution).map(([grade, count]) => `${grade}:${count}`).join('; ')
                      : 'N/A'}
                  </Typography.Text>
                </Col>
              </Row>

              <Button type="primary" style={{ marginTop: '20px' }} onClick={() => onSelectDegree(degree.degreeId)}>
                View Programs
              </Button>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default DegreeList;
