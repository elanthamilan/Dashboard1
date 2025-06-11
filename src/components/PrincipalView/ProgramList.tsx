// src/components/PrincipalView/ProgramList.tsx
import React, { useState } from 'react';
import { List, Card, Statistic, Button, Row, Col, Typography, Checkbox, Tag } from 'antd'; // Added Tag
import { FilePdfOutlined, WarningOutlined } from '@ant-design/icons'; // Added WarningOutlined
import { Program } from '../../types/hierarchy';
import { downloadCSV, sanitizeFilename } from '../../utils/exportUtils'; // Updated import
import { downloadProgramSummaryPDF } from '../../utils/exportUtils'; // Added import

// Title is not needed here as it's handled by the parent dashboard
// const { Title } = Typography;

interface ProgramListProps {
  programs: Program[];
  onSelectProgram: (programId: string) => void;
  onComparePrograms: (selectedProgramIds: string[]) => void;
  degreeName?: string;
  academicYearName?: string;
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

  const handleGenerateCsvReport = () => { // Renamed to be specific
    const columns = [
      { key: 'programId', title: 'Program ID' },
      { key: 'programName', title: 'Program Name' },
      { key: 'totalStudents', title: 'Total Students' },
      { key: 'averageProgramGPA', title: 'Average GPA' },
      { key: 'requiredCredits', title: 'Required Credits' },
      { key: 'graduationRate', title: 'Graduation Rate (%)' },
      { key: 'avgAttendancePercentage', title: 'Avg. Attendance (%)' },
      { key: 'totalProgramAbsences', title: 'Total Absences' },
      { key: 'avgFeesPaidPercentage', title: 'Avg. Fees Paid (%)' },
      { key: 'totalStudentsWithOverdueFees', title: 'Students w/ Overdue Fees' },
      { key: 'applicants', title: 'Applicants' },
      { key: 'acceptanceRate', title: 'Acceptance Rate (%)' },
      { key: 'enrolledCount', title: 'Enrolled Count' },
      { key: 'atRiskStudents', title: 'At-Risk Students' },
    ];

    const reportData = programs.map(p => ({
      ...p,
      averageProgramGPA: p.averageProgramGPA?.toFixed(2) || 'N/A',
      graduationRate: p.graduationRate ? p.graduationRate.toFixed(1) : 'N/A', // Keep as percentage string
      avgAttendancePercentage: p.avgAttendancePercentage ? p.avgAttendancePercentage.toFixed(1) : 'N/A',
      avgFeesPaidPercentage: p.avgFeesPaidPercentage ? p.avgFeesPaidPercentage.toFixed(1) : 'N/A',
      acceptanceRate: p.acceptanceRate ? p.acceptanceRate.toFixed(1) : 'N/A',
      semesters: undefined, // Remove complex objects for CSV
      gradeDistribution: undefined, // Remove complex objects for CSV
    }));

    let fileName = "programs_report";
    // const sanitize = (name: string | undefined) => name?.replace(/\s+/g, '_').replace(/[^\w-]/g, '') || ''; // Removed local sanitize

    if (degreeName) fileName = `${sanitizeFilename(degreeName)}_programs_report`;
    if (academicYearName && degreeName) fileName = `${sanitizeFilename(academicYearName)}_${sanitizeFilename(degreeName)}_programs_report`;
    else if (academicYearName) fileName = `${sanitizeFilename(academicYearName)}_programs_report`;


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
          <Button onClick={handleGenerateCsvReport} type="default"> {/* Changed handler name */}
            Generate Report (CSV)
          </Button>
        </Col>
      </Row>
      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
        dataSource={programs}
        renderItem={program => {
          // Define conditions for highlighting
          const isProblemProgramById = program.programId === "PSY_BS";
          const isLowGpa = program.averageProgramGPA !== undefined && program.averageProgramGPA < 2.5;
          const isLowGraduationRate = program.graduationRate !== undefined && program.graduationRate < 60;
          const highAtRiskPercentage = program.atRiskStudents !== undefined && program.totalStudents > 0 && (program.atRiskStudents / program.totalStudents) * 100 > 15;

          const needsAttention = isProblemProgramById || isLowGpa || isLowGraduationRate || highAtRiskPercentage;

          let cardStyle: React.CSSProperties = {};
          let titlePrefix: React.ReactNode = null;

          if (needsAttention) {
            cardStyle = { border: '1.5px solid #f5222d', background: '#fff1f0' }; // Red border and light red background
            titlePrefix = <WarningOutlined style={{ color: '#f5222d', marginRight: '8px' }} />;
          }

          return (
            <List.Item>
              <Card
                title={<>{titlePrefix}{program.programName}</>}
                style={cardStyle}
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
                    <Statistic
                      title="Avg. GPA"
                      value={program.averageProgramGPA?.toFixed(2) || 'N/A'}
                      valueStyle={isLowGpa ? { color: '#f5222d' } : {}}
                    />
                  </Col>
                </Row>
                <Row gutter={16} style={{marginTop: '10px'}}>
                  <Col span={12}>
                    <Statistic title="Required Credits" value={program.requiredCredits ?? 'N/A'} />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Graduation Rate"
                      value={program.graduationRate !== undefined ? `${program.graduationRate.toFixed(1)}%` : 'N/A'}
                      valueStyle={isLowGraduationRate ? { color: '#f5222d' } : {}}
                    />
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
                  <Statistic
                    title="Total At-Risk Students"
                    value={program.atRiskStudents ?? 'N/A'}
                    valueStyle={highAtRiskPercentage ? { color: '#faad14' } : {}} // Orange for high at-risk
                  />
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

              <Row gutter={8} style={{ marginTop: '20px' }} align="middle">
                <Col>
                  <Button
                    type="primary"
                    onClick={() => onSelectProgram(program.programId)}
                  >
                    View Semesters
                  </Button>
                </Col>
                <Col>
                  <Button
                    type="default"
                    icon={<FilePdfOutlined />}
                    onClick={() => downloadProgramSummaryPDF(program, degreeName, academicYearName)}
                    style={{ marginLeft: '8px' }}
                  >
                    Export PDF Summary
                  </Button>
                </Col>
              </Row>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default React.memo(ProgramList);
