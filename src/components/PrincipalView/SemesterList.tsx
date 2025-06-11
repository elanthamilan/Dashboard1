// src/components/PrincipalView/SemesterList.tsx
import React from 'react';
import { List, Card, Statistic, Button, Row, Col, Typography } from 'antd';
import { Semester } from '../../types/hierarchy'; // Adjust path
import { downloadCSV } from '../../utils/exportUtils'; // Added import

const { Title } = Typography;

interface SemesterListProps {
  semesters: Semester[];
  onSelectSemester: (semesterId: string) => void;
  // programName?: string; // Omitted for this subtask
  // semesterName?: string; // Omitted for this subtask (as this list shows multiple semesters)
}

const SemesterList: React.FC<SemesterListProps> = ({ semesters, onSelectSemester }) => {
  if (!semesters || semesters.length === 0) {
    return <p>No semesters available for this program.</p>;
  }

  const handleGenerateReport = () => {
    const columns = [
      { key: 'semesterName', title: 'Semester Name' },
      { key: 'studentId', title: 'Student ID' },
      { key: 'firstName', title: 'First Name' },
      { key: 'lastName', title: 'Last Name' },
      { key: 'programName', title: 'Program Name (Student)' },
      { key: 'cumulativeGPA', title: 'Cumulative GPA' },
      { key: 'totalCreditsEarned', title: 'Credits Earned' },
      { key: 'enrollmentStatus', title: 'Enrollment Status' },
    ];

    const reportData: any[] = []; // Initialize as any[] to allow flexible object structure
    for (const semester of semesters) {
      if (semester.students && semester.students.length > 0) {
        for (const student of semester.students) {
          reportData.push({
            semesterName: semester.termName,
            studentId: student.studentId,
            firstName: student.firstName,
            lastName: student.lastName,
            programName: student.programName, // This is student.programName from StudentSummary
            cumulativeGPA: student.cumulativeGPA?.toFixed(2) || 'N/A',
            totalCreditsEarned: student.totalCreditsEarned ?? 'N/A',
            enrollmentStatus: student.enrollmentStatus || 'N/A',
          });
        }
      }
    }

    // No specific handling for reportData.length === 0 here,
    // downloadCSV might handle it or show a warning.
    // An Ant Design notification could be added here if desired.

    const fileName = "semesters_student_summary_report";

    downloadCSV(reportData, columns, fileName);
  };


  return (
    <div style={{ marginTop: '24px' }}>
      <Title level={4} style={{ marginBottom: '16px' }}>Semesters</Title>
      <Row justify="end" style={{ marginBottom: '16px' }}>
        <Col>
          <Button onClick={handleGenerateReport} type="default">
            Generate Student Summary Report (CSV)
          </Button>
        </Col>
      </Row>
      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
        dataSource={semesters}
        renderItem={semester => (
          <List.Item>
            <Card title={semester.termName}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Total Students" value={semester.students?.length || 0} />
                </Col>
                <Col span={12}>
                  <Statistic title="Avg. GPA" value={semester.averageGPA?.toFixed(2) || 'N/A'} />
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: '10px' }}>
                <Col span={12}>
                   <Statistic title="Pass Rate" value={semester.passRate !== undefined ? `${semester.passRate.toFixed(0)}%` : 'N/A'} />
                </Col>
                {/* Placeholder for other academic stats if any */}
              </Row>
              {/* Attendance KPIs */}
              <Row gutter={16} style={{ marginTop: '10px' }}>
                <Col span={12}>
                  <Statistic
                    title="Attendance"
                    value={semester.attendancePercentage !== undefined ? semester.attendancePercentage.toFixed(1) : undefined}
                    suffix={semester.attendancePercentage !== undefined ? "%" : undefined}
                    formatter={semester.attendancePercentage === undefined ? () => <Typography.Text type="secondary" style={{fontSize: '1em'}}>N/A</Typography.Text> : undefined}
                  />
                </Col>
                <Col span={12}>
                  <Statistic title="Total Absences" value={semester.totalAbsences ?? 'N/A'} />
                </Col>
              </Row>
              {/* Billing KPIs */}
              <Row gutter={16} style={{ marginTop: '10px' }}>
                <Col span={12}>
                  <Statistic
                    title="Fees Paid"
                    value={semester.feesPaidPercentage !== undefined ? semester.feesPaidPercentage.toFixed(1) : undefined}
                    suffix={semester.feesPaidPercentage !== undefined ? "%" : undefined}
                    formatter={semester.feesPaidPercentage === undefined ? () => <Typography.Text type="secondary" style={{fontSize: '1em'}}>N/A</Typography.Text> : undefined}
                  />
                </Col>
                <Col span={12}>
                  <Statistic title="Overdue Fees (Students)" value={semester.studentsWithOverdueFees ?? 'N/A'} />
                </Col>
              </Row>
              <Button type="primary" style={{ marginTop: '20px' }} onClick={() => onSelectSemester(semester.termId)}>
                View Students
              </Button>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default SemesterList;
