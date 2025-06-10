// src/components/PrincipalView/PrincipalViewDashboard.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Spin, Empty, Button, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Institution, AcademicYear, Degree, Program, Semester, StudentSummary } from '../../types/hierarchy';
import { generateMockInstitutions } from '../../utils/mockData/academics/generateMockAcademicData';
import InstitutionDisplay from './InstitutionDisplay';
import AcademicYearList from './AcademicYearList';
import DegreeList from './DegreeList';
import ProgramList from './ProgramList';
import SemesterList from './SemesterList';
import StudentSummaryList from './StudentSummaryList';
import ComparisonModal from './ComparisonModal';

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
  const [programsToCompare, setProgramsToCompare] = useState<Program[]>([]);


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

  const handleOpenComparisonModal = (programIds: string[]) => {
    if (selectedDegree) {
      const selected = selectedDegree.programs.filter(p => programIds.includes(p.programId));
      setProgramsToCompare(selected);
      setComparisonModalVisible(true);
    }
  };

  const handleCloseComparisonModal = () => {
    setComparisonModalVisible(false);
    setProgramsToCompare([]);
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
    content = <AcademicYearList academicYears={selectedInstitution.academicYears} onSelectAcademicYear={handleSelectAcademicYear} />;
  } else if (selectedAcademicYear && viewLevel === 'degree') {
    currentDisplayTitle = selectedAcademicYear.yearName;
    content = <DegreeList degrees={selectedAcademicYear.degrees} onSelectDegree={handleSelectDegree} />;
  } else if (selectedDegree && viewLevel === 'program') {
    currentDisplayTitle = selectedDegree.degreeName;
    content = (
      <ProgramList
        programs={selectedDegree.programs}
        onSelectProgram={handleSelectProgram}
        onComparePrograms={handleOpenComparisonModal}
        degreeName={selectedDegree.degreeName} // Pass degree name
        academicYearName={selectedAcademicYear?.yearName} // Pass academic year name
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

      {programsToCompare.length > 0 && (
        <ComparisonModal
          visible={comparisonModalVisible} // Antd v4/v5: 'open' is preferred for v5
          // open={comparisonModalVisible} // Use this if Antd version is 5+
          programs={programsToCompare}
          onClose={handleCloseComparisonModal}
        />
      )}
    </div>
  );
};

export default PrincipalViewDashboard;
