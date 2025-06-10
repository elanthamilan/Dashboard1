import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Row, Col, Card, Typography, Spin, Select, Button, Statistic } from 'antd'; // Import Statistic
import { useTranslation } from 'react-i18next';
import { Student } from '../../components/AttendanceDashboard/types';
import { StudentAcademicRecord } from './types';
import { generateMockStudents } from '../../utils/mockData/attendance/generateMockAttendanceData';
import { generateMockAcademicRecords } from '../../utils/mockData/academics/generateMockAcademicData';
import { UserSwitchOutlined } from '@ant-design/icons';
import StudentSummaryTable from './StudentSummaryTable'; // Import the new component

// Placeholders for charts and grid remain
// const StudentSummaryTablePlaceholder: React.FC = () => <Card style={{marginTop: '16px'}}><Typography.Text>Student Summary Table Placeholder</Typography.Text></Card>;
import GpaTrendChart from './GpaTrendChart'; // Import the new component
import SkillProficiencyChart from './SkillProficiencyChart'; // Import the new component
import StudentGradeDistributionChart from './StudentGradeDistributionChart'; // Import the new component
import DegreeCompletionProgress from './DegreeCompletionProgress'; // Import the new component
const StudentGradeGridPlaceholder: React.FC = () => <Card style={{marginTop: '16px'}}><Typography.Text>Student Grade Grid Placeholder</Typography.Text></Card>;


// KpiCard component using Ant Design Statistic
const KpiCard: React.FC<{ title: string; value: string | number; precision?: number; suffix?: string; loading?: boolean }> = ({ title, value, precision, suffix, loading }) => (
  <Col xs={24} sm={12} md={8} lg={6} xl={6}>
    <Card loading={loading}> {/* Card itself can also show loading state */}
      <Statistic title={title} value={value} precision={precision} suffix={suffix} />
    </Card>
  </Col>
);

const { Content } = Layout;
const { Title } = Typography; // Text might not be used directly here anymore
const { Option } = Select;

const MOCK_STUDENT_COUNT = 50;

const StudentPerformanceDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [academicRecords, setAcademicRecords] = useState<StudentAcademicRecord[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingStudentData, setLoadingStudentData] = useState<boolean>(false);


  useEffect(() => {
    setLoading(true);
    const mockStudents = generateMockStudents(MOCK_STUDENT_COUNT);
    setAllStudents(mockStudents);
    const mockAcademicRecords = generateMockAcademicRecords(mockStudents);
    setAcademicRecords(mockAcademicRecords);

    if (mockStudents.length > 0 && !selectedStudentId) { // Only auto-select if no student is selected yet
        setSelectedStudentId(mockStudents[0].id);
    }
    setLoading(false);
  }, []); // Removed selectedStudentId from dependency array to prevent re-running this on student change

  const selectedStudentRecord = useMemo(() => {
    if (!selectedStudentId) return null;
    // Simulate a slight delay for fetching/processing student specific data if needed
    // setLoadingStudentData(true); // This would need to be handled carefully with useEffect
    const record = academicRecords.find(r => r.studentId === selectedStudentId) || null;
    // setLoadingStudentData(false);
    return record;
  }, [selectedStudentId, academicRecords]);

  const handleStudentChange = (studentId: string) => {
    setLoadingStudentData(true); // Indicate loading for student-specific part
    setSelectedStudentId(studentId);
    // Simulate data processing delay for the new student
    setTimeout(() => setLoadingStudentData(false), 200); // Short delay
  };

  // Calculate derived KPI values for the selected student
  const studentKpiData = useMemo(() => {
    if (!selectedStudentRecord) {
      return {
        cumulativeGPA: "-",
        totalCreditsEarned: "-",
        coursesPassedCount: "-",
        // Attendance rate would require linking to attendance data, mock for now or use a placeholder
        attendanceRate: "-%",
      };
    }

    let coursesPassedCount = 0;
    selectedStudentRecord.terms.forEach(term => {
        term.courses.forEach(course => {
            if(course.grade && (course.grade.letterGrade.startsWith('A') || course.grade.letterGrade.startsWith('B') || course.grade.letterGrade.startsWith('C') || course.grade.letterGrade === 'P')) {
                coursesPassedCount++;
            }
        });
    });

    return {
      cumulativeGPA: selectedStudentRecord.cumulativeGPA ?? "-",
      totalCreditsEarned: selectedStudentRecord.totalCreditsEarned ?? "-",
      coursesPassedCount: coursesPassedCount,
      attendanceRate: "92%", // Placeholder - requires attendance data integration
    };
  }, [selectedStudentRecord]);


  if (loading) { // Initial dashboard loading
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
  }

  const studentDisplayName = selectedStudentRecord ?
    `${allStudents.find(s=>s.id === selectedStudentRecord.studentId)?.firstName || ''} ${allStudents.find(s=>s.id === selectedStudentRecord.studentId)?.lastName || ''}`
    : t('studentPerformanceDashboard.noStudentSelected', 'No Student Selected');

  return (
    <Content style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2}>{t('studentPerformanceDashboard.title')}: {selectedStudentId ? studentDisplayName : ''}</Title>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            showSearch
            style={{ width: '100%' }}
            placeholder={t('studentPerformanceDashboard.selectStudentPlaceholder')}
            value={selectedStudentId}
            onChange={handleStudentChange}
            optionFilterProp="children"
            filterOption={(input, option) => (option?.children as unknown as string ?? '').toLowerCase().includes(input.toLowerCase())}
            suffixIcon={<UserSwitchOutlined />}
            loading={loading} // General loading for student list
          >
            {allStudents.map(student => (
              <Option key={student.id} value={student.id}>
                {`${student.firstName} ${student.lastName} (ID: ${student.id})`}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <KpiCard title={t('studentPerformanceDashboard.kpi.cumulativeGpa')} value={studentKpiData.cumulativeGPA} loading={loadingStudentData} precision={2} />
        <KpiCard title={t('studentPerformanceDashboard.kpi.creditsEarned')} value={studentKpiData.totalCreditsEarned} loading={loadingStudentData} />
        <KpiCard title={t('studentPerformanceDashboard.kpi.coursesPassed')} value={studentKpiData.coursesPassedCount} loading={loadingStudentData}/>
        <KpiCard title={t('studentPerformanceDashboard.kpi.attendanceRate')} value={studentKpiData.attendanceRate} loading={loadingStudentData}/>
      </Row>

      <Row style={{ marginTop: '24px' }}>
        <Col span={24}>
            <StudentSummaryTable
                students={allStudents}
                academicRecords={academicRecords}
                loading={loading} // Or a more specific loading state if available
                onSelectStudent={handleStudentChange} // This will update the main dashboard's selected student
                selectedStudentId={selectedStudentId}
            />
        </Col>
      </Row>

      {!selectedStudentId && !loading && (
        <Card style={{textAlign: 'center', padding: '50px'}}>
            <Typography.Title level={4}>{t('studentPerformanceDashboard.pleaseSelectStudent')}</Typography.Title>
        </Card>
      )}
      {selectedStudentId && !selectedStudentRecord && !loading && !loadingStudentData && (
         <Card style={{textAlign: 'center', padding: '50px'}}>
            <Typography.Title level={4}>{t('studentPerformanceDashboard.noDataForStudent')}</Typography.Title>
        </Card>
      )}

      {selectedStudentRecord && !loadingStudentData && (
        <>
          {/* ... Chart and Grid Placeholders ... */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}> {/* GPA Trend takes more width */}
                <GpaTrendChart studentAcademicRecord={selectedStudentRecord} loading={loadingStudentData} />
            </Col>
            <Col xs={24} lg={12}> {/* Skill Proficiency */}
                <SkillProficiencyChart studentAcademicRecord={selectedStudentRecord} loading={loadingStudentData} />
            </Col>
        </Row>
        <Row gutter={[16, 16]} style={{marginTop: 16}}>
            <Col xs={24} lg={12}> {/* Grade Distribution */}
                <StudentGradeDistributionChart studentAcademicRecord={selectedStudentRecord} loading={loadingStudentData} />
            </Col>
            <Col xs={24} lg={12}> {/* Degree Progress */}
                <DegreeCompletionProgress studentAcademicRecord={selectedStudentRecord} loading={loadingStudentData} />
            </Col>
        </Row>
          <Row style={{ marginTop: '24px' }}><Col span={24}><StudentGradeGridPlaceholder /></Col></Row>
          <Row style={{ marginTop: '24px' }}><Col><Button type="primary">{t('studentPerformanceDashboard.actions.generateTranscript')}</Button></Col></Row>
        </>
      )}
      {(loadingStudentData && selectedStudentId) && <div style={{textAlign: 'center', padding: '50px'}}><Spin tip={t('common.loadingStudentData', 'Loading student data...')} /></div>}

    </Content>
  );
};

export default StudentPerformanceDashboard;
