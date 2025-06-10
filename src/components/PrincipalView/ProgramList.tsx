// src/components/PrincipalView/ProgramList.tsx
import React, { useState } from 'react';
import { List, Card, Statistic, Button, Row, Col, Typography, Checkbox } from 'antd';
import { Program } from '../../types/hierarchy';
import { downloadCSV } from '../../utils/exportUtils'; // Adjust path if necessary

// Title is not needed here as it's handled by the parent dashboard
// const { Title } = Typography;

interface ProgramListProps {
  programs: Program[];
  onSelectProgram: (programId: string) => void;
  onComparePrograms: (selectedProgramIds: string[]) => void;
  degreeName?: string; // Optional: for naming the report
  academicYearName?: string; // Optional: for naming the report
}

const ProgramList: React.FC<ProgramListProps> = ({ programs, onSelectProgram, onComparePrograms, degreeName, academicYearName }) => {
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

  const handleCheckboxChange = (programId: string, checked: boolean) => {
    setSelectedForComparison(prev =>
      checked ? [...prev, programId] : prev.filter(id => id !== programId)
    );
  };

  const handleCompareClick = () => {
    onComparePrograms(selectedForComparison);
  };

  const handleGenerateReport = () => {
    const columns = [
      { key: 'programId', title: 'Program ID' },
      { key: 'programName', title: 'Program Name' },
      { key: 'totalStudents', title: 'Total Students' },
      { key: 'averageProgramGPA', title: 'Average GPA' },
      { key: 'requiredCredits', title: 'Required Credits' },
      { key: 'graduationRate', title: 'Graduation Rate (%)' },
    ];

    // Transform data slightly for report
    const reportData = programs.map(p => ({
      ...p,
      averageProgramGPA: p.averageProgramGPA?.toFixed(2) || 'N/A',
      // Corrected: graduationRate is already a percentage value like 85.25
      // For CSV, we just want the number, e.g., "85" or "85.25"
      graduationRate: p.graduationRate ? p.graduationRate.toFixed(2) : 'N/A',
    }));

    let fileName = "programs_report";
    // Sanitize names for filename
    const sanitize = (name: string) => name.replace(/\s+/g, '_').replace(/[^\w-]/g, '');

    if (degreeName) fileName = `${sanitize(degreeName)}_programs_report`;
    if (academicYearName) fileName = `${sanitize(academicYearName)}_${fileName}`;

    downloadCSV(reportData, columns, fileName);
  };

  if (!programs || programs.length === 0) {
    return <p>No programs available for this degree.</p>;
  }

  const canCompare = selectedForComparison.length >= 2 && selectedForComparison.length <= 3;

  return (
    <div style={{ marginTop: '24px' }}>
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
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
        dataSource={programs}
        renderItem={program => (
          <List.Item>
            <Card
              title={program.programName}
              extra={<Checkbox
                        checked={selectedForComparison.includes(program.programId)}
                        onChange={(e) => handleCheckboxChange(program.programId, e.target.checked)}
                     />}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Total Students" value={program.totalStudents} />
                </Col>
                <Col span={12}>
                  <Statistic title="Avg. GPA" value={program.averageProgramGPA?.toFixed(2) || 'N/A'} />
                </Col>
              </Row>
               <Row gutter={16} style={{marginTop: '10px'}}>
                <Col span={12}>
                  <Statistic title="Required Credits" value={program.requiredCredits ?? 'N/A'} />
                </Col>
                 <Col span={12}>
                  <Statistic title="Graduation Rate" value={program.graduationRate !== undefined ? `${program.graduationRate.toFixed(0)}%` : 'N/A'} />
                </Col>
              </Row>

              {/* Attendance KPIs */}
              <Row gutter={16} style={{ marginTop: '10px' }}>
                <Col span={12}>
                  <Statistic
                    title="Avg. Attendance"
                    value={program.avgAttendancePercentage !== undefined ? program.avgAttendancePercentage.toFixed(1) : undefined}
                    suffix={program.avgAttendancePercentage !== undefined ? "%" : undefined}
                    formatter={program.avgAttendancePercentage === undefined ? () => <Typography.Text type="secondary" style={{fontSize: '1em'}}>N/A</Typography.Text> : undefined}
                  />
                </Col>
                <Col span={12}>
                  <Statistic title="Total Absences" value={program.totalProgramAbsences ?? 'N/A'} />
                </Col>
              </Row>

              {/* Billing KPIs */}
              <Row gutter={16} style={{ marginTop: '10px' }}>
                <Col span={12}>
                  <Statistic
                    title="Avg. Fees Paid"
                    value={program.avgFeesPaidPercentage !== undefined ? program.avgFeesPaidPercentage.toFixed(1) : undefined}
                    suffix={program.avgFeesPaidPercentage !== undefined ? "%" : undefined}
                    formatter={program.avgFeesPaidPercentage === undefined ? () => <Typography.Text type="secondary" style={{fontSize: '1em'}}>N/A</Typography.Text> : undefined}
                  />
                </Col>
                <Col span={12}>
                  <Statistic title="Overdue Fees (Students)" value={program.totalStudentsWithOverdueFees ?? 'N/A'} />
                </Col>
              </Row>

              {/* Admissions KPIs */}
              <Row gutter={16} style={{ marginTop: '10px' }}>
                <Col span={8}>
                  <Statistic title="Applicants" value={program.applicants ?? 'N/A'} />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Acceptance Rate"
                    value={program.acceptanceRate !== undefined ? program.acceptanceRate.toFixed(1) : undefined}
                    suffix={program.acceptanceRate !== undefined ? "%" : undefined}
                    formatter={program.acceptanceRate === undefined ? () => <Typography.Text type="secondary" style={{fontSize: '1em'}}>N/A</Typography.Text> : undefined}
                  />
                </Col>
                <Col span={8}>
                  <Statistic title="Enrolled" value={program.enrolledCount ?? 'N/A'} />
                </Col>
              </Row>

              {/* Student Risk and Grades */}
              <Row gutter={16} style={{ marginTop: '10px' }}>
                 <Col span={12}>
                  <Statistic title="At-Risk Students" value={program.atRiskStudents ?? 'N/A'} />
                </Col>
                <Col span={12}>
                  <Typography.Text strong style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)'}}>Grade Distribution</Typography.Text>
                  <Typography.Text style={{display: 'block', fontSize: '14px'}}>
                    {program.gradeDistribution
                      ? Object.entries(program.gradeDistribution).map(([grade, count]) => `${grade}:${count}`).join('; ')
                      : 'N/A'}
                  </Typography.Text>
                </Col>
              </Row>

              <Button
                type="primary"
                style={{ marginTop: '20px' }}
                onClick={() => onSelectProgram(program.programId)}
              >
                View Semesters
              </Button>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default ProgramList;
