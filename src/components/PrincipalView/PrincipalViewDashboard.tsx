// src/components/PrincipalView/PrincipalViewDashboard.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Spin, Empty, Button, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Institution, AcademicYear, Degree, Program, Semester } from '../../types/hierarchy';
import { generateMockInstitutions } from '../../utils/mockData/academics/generateMockAcademicData';
import InstitutionDisplay from './InstitutionDisplay';
import AcademicYearList from './AcademicYearList';
import DegreeList from './DegreeList';
import ProgramList from './ProgramList';
import SemesterList from './SemesterList';
import StudentSummaryList from './StudentSummaryList';
import ComparisonModal, { ComparisonItem, ComparisonItemType } from './ComparisonModal'; // Updated import

const { Title } = Typography;

type ViewLevel = 'institution' | 'academic_year' | 'degree' | 'program' | 'semester' | 'student';

const PrincipalViewDashboard: React.FC = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<AcademicYear | null>(null);
  const [selectedDegree, setSelectedDegree] = useState<Degree | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewLevel, setViewLevel] = useState<ViewLevel>('institution');

  const [comparisonModalVisible, setComparisonModalVisible] = useState<boolean>(false);
  // Updated state for comparison items
  const [itemsToCompare, setItemsToCompare] = useState<ComparisonItem[]>([]);


  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const mockInstitutions = generateMockInstitutions(250, 3);
      setInstitutions(mockInstitutions);
      setLoading(false);
    }, 500);
  }, []);

  const resetSelections = (upToLevel: ViewLevel) => {
    if (upToLevel === 'institution') setSelectedInstitution(null);
    if (upToLevel <= 'academic_year') setSelectedAcademicYear(null);
    if (upToLevel <= 'degree') setSelectedDegree(null);
    if (upToLevel <= 'program') setSelectedProgram(null);
    if (upToLevel <= 'semester') setSelectedSemester(null);
  };

  const handleSelectInstitution = (institutionId: string) => {
    const institution = institutions.find(inst => inst.institutionId === institutionId);
    if (institution) {
      setSelectedInstitution(institution);
      resetSelections('academic_year');
      setViewLevel('academic_year');
    }
  };

  const handleSelectAcademicYear = (academicYearId: string) => {
    if (selectedInstitution) {
      const academicYear = selectedInstitution.academicYears.find(ay => ay.yearId === academicYearId);
      if (academicYear) {
        setSelectedAcademicYear(academicYear);
        resetSelections('degree');
        setViewLevel('degree');
      }
    }
  };

  const handleSelectDegree = (degreeId: string) => {
    if (selectedAcademicYear) {
      const degree = selectedAcademicYear.degrees.find(d => d.degreeId === degreeId);
      if (degree) {
        setSelectedDegree(degree);
        resetSelections('program');
        setViewLevel('program');
      }
    }
  };

  const handleSelectProgram = (programId: string) => {
    if (selectedDegree) {
      const program = selectedDegree.programs.find(p => p.programId === programId);
      if (program) {
        setSelectedProgram(program);
        resetSelections('semester');
        setViewLevel('semester');
      }
    }
  };

  const handleSelectSemester = (semesterId: string) => {
    if (selectedProgram) {
      const semester = selectedProgram.semesters.find(s => s.semesterId === semesterId);
      if (semester) {
        setSelectedSemester(semester);
        setViewLevel('student');
      }
    }
  };

  // Renamed and updated for generic items (specifically Programs)
  const handleOpenProgramComparisonModal = (programIds: string[]) => {
    if (selectedDegree) {
      const selectedPrograms = selectedDegree.programs.filter(p => programIds.includes(p.programId));
      const comparisonItems: ComparisonItem[] = selectedPrograms.map(p => ({
        id: p.programId,
        name: p.programName,
        type: 'Program',
        totalStudents: p.totalStudents,
        averageGPA: p.averageProgramGPA,
        attendancePercentage: p.avgAttendancePercentage,
        totalAbsences: p.totalProgramAbsences,
        feesPaidPercentage: p.avgFeesPaidPercentage,
        studentsWithOverdueFees: p.totalStudentsWithOverdueFees,
        applicants: p.applicants,
        acceptanceRate: p.acceptanceRate,
        enrolledCount: p.enrolledCount,
        atRiskStudents: p.atRiskStudents,
        requiredCredits: p.requiredCredits,
        graduationRate: p.graduationRate,
      }));
      setItemsToCompare(comparisonItems);
      setComparisonModalVisible(true);
    }
  };

  // New handler for Academic Year comparison
  const handleOpenAcademicYearComparisonModal = (academicYearIds: string[]) => {
    if (selectedInstitution) {
      const selectedAcademicYears = selectedInstitution.academicYears.filter(ay => academicYearIds.includes(ay.yearId));
      const comparisonItems: ComparisonItem[] = selectedAcademicYears.map(ay => ({
        id: ay.yearId,
        name: ay.yearName,
        type: 'AcademicYear',
        totalStudents: ay.totalStudents,
        averageGPA: ay.overallAverageGPA,
        attendancePercentage: ay.annualAttendancePercentage,
        totalAbsences: ay.totalAnnualAbsences,
        feesPaidPercentage: ay.annualFeesPaidPercentage,
        studentsWithOverdueFees: ay.totalStudentsWithOverdueFeesInYear,
        applicants: ay.totalAnnualApplicants,
        acceptanceRate: ay.avgAnnualAcceptanceRate,
        enrolledCount: ay.totalAnnualEnrolledCount,
        atRiskStudents: ay.totalAnnualAtRiskStudents,
      }));
      setItemsToCompare(comparisonItems);
      setComparisonModalVisible(true);
    }
  };

  // New handler for Degree comparison
  const handleOpenDegreeComparisonModal = (degreeIds: string[]) => {
    if (selectedAcademicYear) {
      const selectedDegrees = selectedAcademicYear.degrees.filter(d => degreeIds.includes(d.degreeId));
      const comparisonItems: ComparisonItem[] = selectedDegrees.map(d => ({
        id: d.degreeId,
        name: d.degreeName,
        type: 'Degree',
        totalStudents: d.totalStudents,
        averageGPA: d.averageDegreeGPA,
        attendancePercentage: d.avgAttendancePercentage,
        totalAbsences: d.totalDegreeAbsences,
        feesPaidPercentage: d.avgFeesPaidPercentage,
        studentsWithOverdueFees: d.totalStudentsWithOverdueFeesInDegree,
        applicants: d.totalApplicants,
        acceptanceRate: d.avgAcceptanceRate,
        enrolledCount: d.totalEnrolledCount,
        atRiskStudents: d.totalAtRiskStudents,
      }));
      setItemsToCompare(comparisonItems);
      setComparisonModalVisible(true);
    }
  };


  const handleCloseComparisonModal = () => {
    setComparisonModalVisible(false);
    setItemsToCompare([]); // Use updated setter
  };

  const breadcrumbItems = useMemo(() => {
    const items: { key: string; title: React.ReactNode; onClick?: () => void }[] = [{
        key: 'home',
        title: <HomeOutlined />,
        onClick: () => { resetSelections('institution'); setViewLevel('institution');}
    }];

    if (selectedInstitution) {
      items.push({
        key: 'institution',
        title: selectedInstitution.institutionName,
        onClick: viewLevel !== 'academic_year' ? () => { resetSelections('academic_year'); setViewLevel('academic_year'); } : undefined
      });
    }
    if (selectedAcademicYear) {
      items.push({
        key: 'academic_year',
        title: selectedAcademicYear.yearName,
        onClick: viewLevel !== 'degree' ? () => { resetSelections('degree'); setViewLevel('degree'); } : undefined
      });
    }
    if (selectedDegree) {
      items.push({
        key: 'degree',
        title: selectedDegree.degreeName,
        onClick: viewLevel !== 'program' ? () => { resetSelections('program'); setViewLevel('program'); } : undefined
      });
    }
    if (selectedProgram) {
      items.push({
        key: 'program',
        title: selectedProgram.programName,
        onClick: viewLevel !== 'semester' ? () => { resetSelections('semester'); setViewLevel('semester'); } : undefined
      });
    }
    if (selectedSemester && viewLevel === 'student') {
        items.push({ key: 'semester', title: selectedSemester.semesterName });
    }

    return items.map((item) => {
        return {
            title: item.onClick ? <a onClick={item.onClick}>{item.title}</a> : item.title,
            key: item.key,
        };
    });
  }, [selectedInstitution, selectedAcademicYear, selectedDegree, selectedProgram, selectedSemester, viewLevel]);


  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}><Spin size="large" tip="Loading Data..." /></div>;
  }

  let content;
  let currentDisplayTitle = "";

  if (viewLevel === 'institution') {
    currentDisplayTitle = "Institutions";
    if (institutions.length === 0 && !loading) {
      content = <Empty description="No institutions found." />;
    } else {
      content = institutions.map(inst => (
        <InstitutionDisplay key={inst.institutionId} institution={inst} onSelectInstitution={handleSelectInstitution} />
      ));
    }
  } else if (selectedInstitution && viewLevel === 'academic_year') {
    currentDisplayTitle = selectedInstitution.institutionName;
    content = (
      <AcademicYearList
        academicYears={selectedInstitution.academicYears}
        onSelectAcademicYear={handleSelectAcademicYear}
        onCompareAcademicYears={handleOpenAcademicYearComparisonModal} // Pass new handler
      />
    );
  } else if (selectedAcademicYear && viewLevel === 'degree') {
    currentDisplayTitle = selectedAcademicYear.yearName;
    content = (
      <DegreeList
        degrees={selectedAcademicYear.degrees}
        onSelectDegree={handleSelectDegree}
        onCompareDegrees={handleOpenDegreeComparisonModal} // Pass new handler
      />
    );
  } else if (selectedDegree && viewLevel === 'program') {
    currentDisplayTitle = selectedDegree.degreeName;
    content = (
      <ProgramList
        programs={selectedDegree.programs}
        onSelectProgram={handleSelectProgram}
        onComparePrograms={handleOpenProgramComparisonModal} // Ensure this uses the updated handler
        degreeName={selectedDegree.degreeName}
        academicYearName={selectedAcademicYear?.yearName}
      />
    );
  } else if (selectedProgram && viewLevel === 'semester') {
    currentDisplayTitle = selectedProgram.programName;
    content = <SemesterList semesters={selectedProgram.semesters} onSelectSemester={handleSelectSemester} />;
  } else if (selectedSemester && viewLevel === 'student') {
    currentDisplayTitle = selectedSemester.semesterName;
    content = <StudentSummaryList students={selectedSemester.students} />;
  }
  else {
     content = <Empty description="Data not available for current selection or path." />;
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: '0px' }}>Principal's Hierarchical View</Title>
      <div style={{ margin: "10px 0px"}}>
        <Breadcrumb items={breadcrumbItems} />
      </div>
      {viewLevel !== 'institution' && currentDisplayTitle && (
         <Title level={3} type="secondary" style={{marginTop: 0, marginBottom: "16px"}}>{currentDisplayTitle}</Title>
      )}
      {content}

      {/* Update ComparisonModal invocation */}
      {itemsToCompare.length > 0 && (
        <ComparisonModal
          open={comparisonModalVisible}
          items={itemsToCompare}
          onClose={handleCloseComparisonModal}
        />
      )}
    </div>
  );
};

export default PrincipalViewDashboard;
