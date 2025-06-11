// src/components/PrincipalView/PrincipalViewDashboard.tsx
import React, { useEffect, useState, useMemo, useCallback } from 'react'; // Added useCallback
import { Typography, Spin, Empty, Button, Breadcrumb, Row, Col } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Institution, AcademicYear, Degree, Program, Semester, StudentSummary } from '../../types/hierarchy';
import { StudentAcademicRecord } from '../../components/StudentPerformanceDashboard/types'; // Added import
import { generateMockInstitutions, generateMockAcademicRecords } from '../../utils/mockData/academics/generateMockAcademicData'; // generateMockStudentSummary removed if not used directly
import { generateMockStudents } from '../../utils/mockData/attendance/generateMockAttendanceData';
import { Student } from '../../components/AttendanceDashboard/types';
import InstitutionDisplay from './InstitutionDisplay';
import AcademicYearList from './AcademicYearList';
import DegreeList from './DegreeList';
import ProgramList from './ProgramList';
import SemesterList from './SemesterList';
import StudentSummaryList from './StudentSummaryList';
import PrincipalStudentDetailView from './PrincipalStudentDetailView'; // Added import
import ComparisonModal, { ComparisonItem } from './ComparisonModal';
import { downloadCSV } from '../../utils/exportUtils';

const { Title } = Typography;

type ViewLevel = 'institution' | 'academic_year' | 'degree' | 'program' | 'semester' | 'student' | 'student_detail';

interface ComparisonModalProps {
  items: ComparisonItem[];
  onClose: () => void;
  open: boolean;
}

const PrincipalViewDashboard: React.FC = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<AcademicYear | null>(null);
  const [selectedDegree, setSelectedDegree] = useState<Degree | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedStudentIdForDetail, setSelectedStudentIdForDetail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewLevel, setViewLevel] = useState<ViewLevel>('institution');

  const [comparisonModalVisible, setComparisonModalVisible] = useState<boolean>(false);
  const [itemsToCompare, setItemsToCompare] = useState<ComparisonItem[]>([]);

  const [currentStudentAcademicRecord, setCurrentStudentAcademicRecord] = useState<StudentAcademicRecord | null>(null); // New state
  const [studentDetailLoading, setStudentDetailLoading] = useState<boolean>(false); // New state

  // Memoize all students and their academic records to avoid re-generating on every render
  // This is still mock data generation, but more efficient than doing it in the useEffect.
  const allMockStudents = useMemo(() => generateMockStudents(300), []); // Increased student count slightly
  const allMockAcademicRecords = useMemo(() => generateMockAcademicRecords(allMockStudents), [allMockStudents]);


  useEffect(() => {
    setLoading(true);
    // Use the memoized records for initializing institutions to ensure consistency
    const mockInstitutions = generateMockInstitutions(allMockStudents, 3, 50);
    setInstitutions(mockInstitutions);
    setLoading(false);
  }, [allMockStudents, allMockAcademicRecords]);


  useEffect(() => {
    if (selectedStudentIdForDetail && viewLevel === 'student_detail') {
      setStudentDetailLoading(true);
      // Simulate fetching data
      setTimeout(() => {
        const record = allMockAcademicRecords.find(r => r.studentId === selectedStudentIdForDetail);
        setCurrentStudentAcademicRecord(record || null);
        setStudentDetailLoading(false);
      }, 300); // Reduced timeout for faster mock load
    } else {
      setCurrentStudentAcademicRecord(null);
    }
  }, [selectedStudentIdForDetail, viewLevel, allMockAcademicRecords]);

  const resetSelections = (upToLevel: ViewLevel) => {
    if (upToLevel === 'institution') setSelectedInstitution(null);
    if (upToLevel <= 'academic_year') setSelectedAcademicYear(null);
    if (upToLevel <= 'degree') setSelectedDegree(null);
    if (upToLevel <= 'program') setSelectedProgram(null);
    if (upToLevel <= 'semester') {
        setSelectedSemester(null);
        setSelectedStudentIdForDetail(null);
        setCurrentStudentAcademicRecord(null); // Clear student record
    }
    if (upToLevel <= 'student') {
        setSelectedStudentIdForDetail(null);
        setCurrentStudentAcademicRecord(null); // Clear student record
    }
  };

  // Memoize callback functions to prevent unnecessary re-renders of child components
  const handleSelectInstitution = useCallback((institutionId: string) => {
    const institution = institutions.find(inst => inst.institutionId === institutionId);
    if (institution) {
      setSelectedInstitution(institution);
      resetSelections('academic_year');
      setViewLevel('academic_year');
    }
  }, [institutions]); // resetSelections and setSelectedInstitution/setViewLevel are stable

  const handleSelectAcademicYear = useCallback((academicYearId: string) => {
    if (selectedInstitution) {
      const academicYear = selectedInstitution.academicYears.find(ay => ay.yearId === academicYearId);
      if (academicYear) {
        setSelectedAcademicYear(academicYear);
        resetSelections('degree');
        setViewLevel('degree');
      }
    }
  }, [selectedInstitution]);

  const handleSelectDegree = useCallback((degreeId: string) => {
    if (selectedAcademicYear) {
      const degree = selectedAcademicYear.degrees.find(d => d.degreeId === degreeId);
      if (degree) {
        setSelectedDegree(degree);
        resetSelections('program');
        setViewLevel('program');
      }
    }
  }, [selectedAcademicYear]);

  const handleSelectProgram = useCallback((programId: string) => {
    if (selectedDegree) {
      const program = selectedDegree.programs.find(p => p.programId === programId);
      if (program) {
        setSelectedProgram(program);
        resetSelections('semester');
        setViewLevel('semester');
      }
    }
  }, [selectedDegree]);

  const handleSelectSemester = useCallback((semesterId: string) => {
    if (selectedProgram) {
      const semester = selectedProgram.semesters.find(s => s.termId === semesterId);
      if (semester) {
        setSelectedSemester(semester);
        resetSelections('student');
        setViewLevel('student');
      }
    }
  }, [selectedProgram]);

  const handleSelectStudentForDetail = useCallback((studentId: string) => {
    setSelectedStudentIdForDetail(studentId);
    setViewLevel('student_detail');
  }, []); // setSelectedStudentIdForDetail and setViewLevel are stable

  const handleOpenProgramComparisonModal = useCallback((programIds: string[]) => {
    if (selectedDegree) {
      const selectedPrograms = selectedDegree.programs.filter(p => programIds.includes(p.programId));
      const comparisonItems: ComparisonItem[] = selectedPrograms.map(p => ({
        id: p.programId, name: p.programName, type: 'Program',
        totalStudents: p.totalStudents, averageGPA: p.averageProgramGPA,
        attendancePercentage: p.avgAttendancePercentage, totalAbsences: p.totalProgramAbsences,
        feesPaidPercentage: p.avgFeesPaidPercentage, studentsWithOverdueFees: p.totalStudentsWithOverdueFees,
        applicants: p.applicants, acceptanceRate: p.acceptanceRate, enrolledCount: p.enrolledCount,
        atRiskStudents: p.atRiskStudents, requiredCredits: p.requiredCredits, graduationRate: p.graduationRate,
      }));
      setItemsToCompare(comparisonItems);
      setComparisonModalVisible(true);
    }
  }, [selectedDegree]);

  const handleOpenAcademicYearComparisonModal = useCallback((academicYearIds: string[]) => {
    if (selectedInstitution) {
      const selectedAcademicYears = selectedInstitution.academicYears.filter(ay => academicYearIds.includes(ay.yearId));
      const comparisonItems: ComparisonItem[] = selectedAcademicYears.map(ay => ({
        id: ay.yearId, name: ay.yearName, type: 'AcademicYear',
        totalStudents: ay.totalStudents, averageGPA: ay.overallAverageGPA,
        attendancePercentage: ay.annualAttendancePercentage, totalAbsences: ay.totalAnnualAbsences,
        feesPaidPercentage: ay.annualFeesPaidPercentage, studentsWithOverdueFees: ay.totalStudentsWithOverdueFeesInYear,
        applicants: ay.totalAnnualApplicants, acceptanceRate: ay.avgAnnualAcceptanceRate, enrolledCount: ay.totalAnnualEnrolledCount,
        atRiskStudents: ay.totalAnnualAtRiskStudents,
      }));
      setItemsToCompare(comparisonItems);
      setComparisonModalVisible(true);
    }
  }, [selectedInstitution]);

  const handleOpenDegreeComparisonModal = useCallback((degreeIds: string[]) => {
    if (selectedAcademicYear) {
      const selectedDegrees = selectedAcademicYear.degrees.filter(d => degreeIds.includes(d.degreeId));
      const comparisonItems: ComparisonItem[] = selectedDegrees.map(d => ({
        id: d.degreeId, name: d.degreeName, type: 'Degree',
        totalStudents: d.totalStudents, averageGPA: d.averageDegreeGPA,
        attendancePercentage: d.avgAttendancePercentage, totalAbsences: d.totalDegreeAbsences,
        feesPaidPercentage: d.avgFeesPaidPercentage, studentsWithOverdueFees: d.totalStudentsWithOverdueFeesInDegree,
        applicants: d.totalApplicants, acceptanceRate: d.avgAcceptanceRate, enrolledCount: d.totalEnrolledCount,
        atRiskStudents: d.totalAtRiskStudents,
      }));
      setItemsToCompare(comparisonItems);
      setComparisonModalVisible(true);
    }
  }, [selectedAcademicYear]);

  const handleCloseComparisonModal = useCallback(() => {
    setComparisonModalVisible(false);
    setItemsToCompare([]);
  }, []); // setComparisonModalVisible and setItemsToCompare are stable

  const handleGenerateInstitutionsReport = useCallback(() => {
    if (!institutions || institutions.length === 0) {
      console.warn("No institutions to export."); return;
    }
    const columns = [
      { key: 'institutionId', title: 'Institution ID' }, { key: 'institutionName', title: 'Institution Name' },
      { key: 'totalStudents', title: 'Total Students' }, { key: 'overallAverageGPA', title: 'Overall Avg. GPA' },
      { key: 'institutionAttendancePercentage', title: 'Avg. Attendance (%)' }, { key: 'totalInstitutionAbsences', title: 'Total Absences' },
      { key: 'institutionFeesPaidPercentage', title: 'Avg. Fees Paid (%)' }, { key: 'totalStudentsWithOverdueFeesInInstitution', title: 'Students w/ Overdue Fees' },
      { key: 'totalInstitutionApplicants', title: 'Total Applicants' }, { key: 'avgInstitutionAcceptanceRate', title: 'Avg. Acceptance Rate (%)' },
      { key: 'totalInstitutionEnrolledCount', title: 'Total Enrolled' }, { key: 'totalInstitutionAtRiskStudents', title: 'At-Risk Students' },
    ];
    const reportData = institutions.map(inst => ({
      institutionId: inst.institutionId, institutionName: inst.institutionName,
      totalStudents: inst.totalStudents ?? 'N/A', overallAverageGPA: inst.overallAverageGPA?.toFixed(2) || 'N/A',
      institutionAttendancePercentage: inst.institutionAttendancePercentage?.toFixed(1) || 'N/A', totalInstitutionAbsences: inst.totalInstitutionAbsences ?? 'N/A',
      institutionFeesPaidPercentage: inst.institutionFeesPaidPercentage?.toFixed(1) || 'N/A', totalStudentsWithOverdueFeesInInstitution: inst.totalStudentsWithOverdueFeesInInstitution ?? 'N/A',
      totalInstitutionApplicants: inst.totalInstitutionApplicants ?? 'N/A', avgInstitutionAcceptanceRate: inst.avgInstitutionAcceptanceRate?.toFixed(1) || 'N/A',
      totalInstitutionEnrolledCount: inst.totalInstitutionEnrolledCount ?? 'N/A', totalInstitutionAtRiskStudents: inst.totalInstitutionAtRiskStudents ?? 'N/A',
    }));
    downloadCSV(reportData, columns, "institutions_report");
  }, [institutions]);

  const breadcrumbItems = useMemo(() => {
    const items: { key: string; title: React.ReactNode; onClick?: () => void }[] = [{
        key: 'home', title: <HomeOutlined />,
        onClick: () => { resetSelections('institution'); setViewLevel('institution');}
    }];
    if (selectedInstitution) {
      items.push({ key: 'institution', title: selectedInstitution.institutionName,
        onClick: viewLevel !== 'academic_year' ? () => { resetSelections('academic_year'); setViewLevel('academic_year'); } : undefined });
    }
    if (selectedAcademicYear) {
      items.push({ key: 'academic_year', title: selectedAcademicYear.yearName,
        onClick: viewLevel !== 'degree' ? () => { resetSelections('degree'); setViewLevel('degree'); } : undefined });
    }
    if (selectedDegree) {
      items.push({ key: 'degree', title: selectedDegree.degreeName,
        onClick: viewLevel !== 'program' ? () => { resetSelections('program'); setViewLevel('program'); } : undefined });
    }
    if (selectedProgram) {
      items.push({ key: 'program', title: selectedProgram.programName,
        onClick: viewLevel !== 'semester' ? () => { resetSelections('semester'); setViewLevel('semester'); } : undefined });
    }
    if (selectedSemester) {
        if (viewLevel === 'student' || viewLevel === 'student_detail') {
            items.push({ key: 'semester', title: selectedSemester.termName,
                onClick: viewLevel === 'student_detail' ? () => { setViewLevel('student'); setSelectedStudentIdForDetail(null); setCurrentStudentAcademicRecord(null); } : undefined });
        }
    }
    // NOTE: The extra brace that was here is now removed by this diff.
    // The 'if (selectedSemester)' block is correctly closed by the brace on the line above.
    if (selectedStudentIdForDetail && viewLevel === 'student_detail') {
        const studentDetails = currentStudentAcademicRecord ? allMockStudents.find((s: Student) => s.id === currentStudentAcademicRecord.studentId) : null;
        const studentNameString = studentDetails ? `${studentDetails.firstName || ''} ${studentDetails.lastName || ''}`.trim() : selectedStudentIdForDetail;
        items.push({ key: 'student_detail', title: `Student: ${studentNameString || 'N/A'}` });
    }
    return items.map((item) => ({ title: item.onClick ? <a onClick={item.onClick}>{item.title}</a> : item.title, key: item.key }));
  }, [selectedInstitution, selectedAcademicYear, selectedDegree, selectedProgram, selectedSemester, selectedStudentIdForDetail, viewLevel, currentStudentAcademicRecord, allMockStudents]);


  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}><Spin size="large" tip="Loading Data..." /></div>;
  }

  let content;
  let currentDisplayTitle = "";

  if (viewLevel === 'institution') {
    currentDisplayTitle = "Institutions";
    content = institutions.map((inst: Institution) => ( <InstitutionDisplay key={inst.institutionId} institution={inst} onSelectInstitution={handleSelectInstitution} /> ));
    if (institutions.length === 0 && !loading) { content = <Empty description="No institutions found." />; }
  } else if (selectedInstitution && viewLevel === 'academic_year') {
    currentDisplayTitle = selectedInstitution.institutionName;
    content = ( <AcademicYearList academicYears={selectedInstitution.academicYears} onSelectAcademicYear={handleSelectAcademicYear} onCompareAcademicYears={handleOpenAcademicYearComparisonModal} /> );
  } else if (selectedAcademicYear && viewLevel === 'degree') {
    currentDisplayTitle = selectedAcademicYear.yearName;
    content = ( <DegreeList degrees={selectedAcademicYear.degrees} onSelectDegree={handleSelectDegree} onCompareDegrees={handleOpenDegreeComparisonModal} /> );
  } else if (selectedDegree && viewLevel === 'program') {
    currentDisplayTitle = selectedDegree.degreeName;
    content = ( <ProgramList programs={selectedDegree.programs} onSelectProgram={handleSelectProgram} onComparePrograms={handleOpenProgramComparisonModal} degreeName={selectedDegree.degreeName} academicYearName={selectedAcademicYear?.yearName} /> );
  } else if (selectedProgram && viewLevel === 'semester') {
    currentDisplayTitle = selectedProgram.programName;
    content = <SemesterList semesters={selectedProgram.semesters} onSelectSemester={handleSelectSemester} />;
  } else if (selectedSemester && viewLevel === 'student') {
    currentDisplayTitle = selectedSemester.termName;
    content = <StudentSummaryList students={selectedSemester.students} onSelectStudent={handleSelectStudentForDetail} />;
  } else if (selectedStudentIdForDetail && viewLevel === 'student_detail') {
    const studentDetails = currentStudentAcademicRecord ? allMockStudents.find((s: Student) => s.id === currentStudentAcademicRecord.studentId) : null;
    const studentDisplayName = studentDetails ? `${studentDetails.firstName || ''} ${studentDetails.lastName || ''}`.trim() : selectedStudentIdForDetail;
    currentDisplayTitle = `Details for ${studentDisplayName || 'N/A'}`;
    content = ( <PrincipalStudentDetailView studentAcademicRecord={currentStudentAcademicRecord} loading={studentDetailLoading} /> );
  }
  else {
     content = <Empty description="Data not available for current selection or path." />;
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: '0px' }}>Principal's Hierarchical View</Title>
      <div style={{ margin: "10px 0px"}}> <Breadcrumb items={breadcrumbItems} /> </div>
      {viewLevel === 'institution' && institutions.length > 0 && (
        <Row justify="end" style={{ marginTop: '10px', marginBottom: '20px' }}>
          <Col> <Button onClick={handleGenerateInstitutionsReport} type="default"> Generate Institutions Report (CSV) </Button> </Col>
        </Row>
      )}
      {viewLevel !== 'institution' && currentDisplayTitle && (
         <Title level={3} type="secondary" style={{marginTop: 0, marginBottom: "16px"}}>{currentDisplayTitle}</Title>
      )}
      {content}
      {itemsToCompare.length > 0 && (
        <ComparisonModal open={comparisonModalVisible} items={itemsToCompare} onClose={handleCloseComparisonModal} />
      )}
    </div>
  );
};

export default PrincipalViewDashboard;
