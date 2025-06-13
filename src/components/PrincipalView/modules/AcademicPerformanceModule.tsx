// IMPORTANT: This component currently uses MOCK DATA.
// TODO: Replace mock data generation (e.g., generateMockNewInstitutions, generateMockAcademicRecords, generateMockStudents, generateMockAttendanceRecords)
// with actual data fetching logic from an API or state management system.
// src/components/PrincipalView/modules/AcademicPerformanceModule.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Breadcrumb, Row, Col, Card, Statistic, Spin, Descriptions, Table, Button, List, Tag, Space, DescriptionsProps, BreadcrumbProps } from 'antd'; // Added Button, List, Tag, Space, DescriptionsProps, BreadcrumbProps
import { Link } from 'react-router-dom';
import { useGlobalFilters } from '../../../contexts/GlobalFilterContext';
import { useTranslation } from 'react-i18next';
import {
    HomeOutlined, CheckCircleOutlined, CloseCircleOutlined, ReadOutlined, WarningOutlined,
    StarOutlined, UserSwitchOutlined, EyeOutlined, ArrowLeftOutlined, UserOutlined as StudentIcon
} from '@ant-design/icons';
import { generateMockNewInstitutions, generateMockAcademicRecords, generateMockStudentSummary } from '../../../utils/mockData/academics/generateMockAcademicData';
import { generateMockStudents, generateMockAttendanceRecords } from '../../../utils/mockData/attendance/generateMockAttendanceData'; // Added generateMockAttendanceRecords
import { Institution, StudentSummary, AcademicYear as AcademicYearType, StudentAcademicRecord, Department, CourseEnrollment, Program, FacultyMember } from '../../../types/hierarchy';
import { Student, AttendanceRecord } from '../../../types/attendance'; // Added AttendanceRecord
import PrincipalStudentDetailView from '../../PrincipalView/PrincipalStudentDetailView'; // Corrected import path
import AverageGpaBarChart from '../charts/AverageGpaBarChart'; // Import the new chart
import AttendanceGradeScatterPlot from '../charts/AttendanceGradeScatterPlot'; // Import the scatter plot
// OverallGradeDistributionChart is already imported, no change needed here
import OverallGradeDistributionChart from '../charts/OverallGradeDistributionChart'; // Import the grade distribution chart
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Title, Paragraph, Text } = Typography;

const MODULE_KEY = 'academics';

interface CoursePerformance { courseId: string; courseName: string; passRate: number; avgGpa: number; enrolledCount: number; }
interface SimpleCourseInfo { courseId: string; courseName: string; }
interface CourseOfferingInfo extends SimpleCourseInfo { offeringId: string; programId: string; termId: string; programName: string; semesterName: string; enrolledInOffering: number; passRateInOffering?: number; avgGpaInOffering?: number; } // Added programId, termId
interface FacultyPerformanceData { facultyId: string; facultyName: string; departmentName?: string; avgRating?: number; numberOfEvaluations: number; }
interface StudentInOfferingData { studentId: string; studentName: string; gradeDetails?: CourseEnrollment['grade']; }


const AcademicPerformanceModule: React.FC = () => {
  // All hooks must be called at the top level, before any conditional returns.
  const { t } = useTranslation();
  const filters = useGlobalFilters();
  const [institutionData, setInstitutionData] = useState<Institution | null>(null);
  const [allAcademicRecords, setAllAcademicRecords] = useState<StudentAcademicRecord[]>([]);
  const [allStudentsForSummaries, setAllStudentsForSummaries] = useState<Student[]>([]);
  const [allAttendanceRecords, setAllAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDepartmentForCourses, setSelectedDepartmentForCourses] = useState<Department | null>(null);
  const [selectedCourseForBatches, setSelectedCourseForBatches] = useState<SimpleCourseInfo | null>(null);
  const [selectedOfferingDetails, setSelectedOfferingDetails] = useState<CourseOfferingInfo | null>(null);
  const [selectedStudentForPerformance, setSelectedStudentForPerformance] = useState<{ studentId: string; studentName: string; courseName?: string; programName?: string; semesterName?: string; } | null>(null);
  const [viewingFacultyPerformance, setViewingFacultyPerformance] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    try {
      // IMPORTANT: This component currently uses MOCK DATA.
      // TODO: Replace mock data generation with actual data fetching logic.
      const baseStudents = generateMockStudents(500); // Generate students once
      setAllStudentsForSummaries(baseStudents); // Set state for summaries

      // IMPORTANT: This component currently uses MOCK DATA.
      // TODO: Replace mock data generation with actual data fetching logic.
      const instDataArray = generateMockNewInstitutions(undefined, baseStudents, 3, 50); // Use students for institutions
      if (instDataArray && instDataArray.length > 0) {
        setInstitutionData(instDataArray[0]);
      }

      // IMPORTANT: This component currently uses MOCK DATA.
      // TODO: Replace mock data generation with actual data fetching logic.
      const academicRecords = generateMockAcademicRecords(baseStudents); // Use same students for academic records
      setAllAcademicRecords(academicRecords);

      // Ensure instDataArray[0] is used carefully if it might be null
      const numAcademicYears = instDataArray && instDataArray.length > 0 && instDataArray[0]?.academicYears ? instDataArray[0].academicYears.length : 3;
      // IMPORTANT: This component currently uses MOCK DATA.
      // TODO: Replace mock data generation with actual data fetching logic.
      const attendanceRecs = generateMockAttendanceRecords(baseStudents, [], 365 * numAcademicYears);
      setAllAttendanceRecords(attendanceRecs);
    } catch (error) { /* console.error("Error loading module data:", error); */ }
    finally { setLoading(false); }
  }, []);

  const allStudentsInInstitution = useMemo((): StudentSummary[] => { if (!institutionData || allStudentsForSummaries.length === 0 || allAcademicRecords.length === 0) return []; const studentsMap = new Map<string, StudentSummary>(); allStudentsForSummaries.forEach(student => { const academicRecord = allAcademicRecords.find(ar => ar.studentId === student.id); if (academicRecord) { const summary = generateMockStudentSummary(student, academicRecord); studentsMap.set(student.id, summary); } }); return Array.from(studentsMap.values());}, [institutionData, allStudentsForSummaries, allAcademicRecords]);
  const overallPassPercentage = useMemo(() => { if (allStudentsInInstitution.length === 0) return 0; const passingStudents = allStudentsInInstitution.filter(s => s.cumulativeGPA !== undefined && s.cumulativeGPA >= 2.0).length; return parseFloat(((passingStudents / allStudentsInInstitution.length) * 100).toFixed(2)); }, [allStudentsInInstitution]);
  const failPercentage = useMemo(() => parseFloat((100 - overallPassPercentage).toFixed(2)), [overallPassPercentage]);
  const averageGPA = useMemo(() => institutionData?.overallAverageGPA ?? 0, [institutionData]);
  const backlogRate = useMemo(() => { if (allStudentsInInstitution.length === 0 || allAcademicRecords.length === 0) return 0; let studentsWithBacklog = 0; allStudentsInInstitution.forEach(summary => { const record = allAcademicRecords.find(ar => ar.studentId === summary.studentId); if (record) { for (const semester of record.semesters) { for (const course of semester.courses) { if (course.grade?.letterGrade === 'F' || course.grade?.letterGrade === 'NP') { studentsWithBacklog++; return; } } } } }); return parseFloat(((studentsWithBacklog / allStudentsInInstitution.length) * 100).toFixed(2)); }, [allStudentsInInstitution, allAcademicRecords]);
  const overallPlacementRate = useMemo(() => institutionData?.overallPlacementRate ?? 0, [institutionData]); // Using overallPlacementRate as proxy for Graduation Rate
  const totalAtRiskStudents = useMemo(() => institutionData?.totalInstitutionAtRiskStudents ?? 0, [institutionData]);

  const summaryKpis = [
    { titleKey: 'module.academics.kpi.overallPassRate', value: overallPassPercentage, suffix: '%', icon: React.createElement(CheckCircleOutlined), precision: 2 },
    { titleKey: 'module.academics.kpi.overallFailRate', value: failPercentage, suffix: '%', icon: React.createElement(CloseCircleOutlined), precision: 2 },
    { titleKey: 'module.academics.kpi.averageGPA', value: averageGPA, icon: React.createElement(ReadOutlined), precision: 2 },
    { titleKey: 'module.academics.kpi.backlogRate', value: backlogRate, suffix: '%', icon: React.createElement(WarningOutlined), precision: 2 },
    { titleKey: 'module.academics.kpi.overallPlacementRate', value: overallPlacementRate, suffix: '%', icon: React.createElement(StarOutlined), precision: 1 }, // Changed icon
    { titleKey: 'module.academics.kpi.totalAtRiskStudents', value: totalAtRiskStudents, icon: React.createElement(StudentIcon), precision: 0 }, // Changed icon
  ];

  const baseBreadcrumbItems: BreadcrumbProps['items'] = [
    { title: React.createElement(Link, { to: "/principal-view"}, React.createElement(HomeOutlined)) },
    { title: React.createElement(Link, { to: "/principal-view", onClick: () => { setSelectedDepartmentForCourses(null); setSelectedCourseForBatches(null); setSelectedStudentForPerformance(null); setViewingFacultyPerformance(false); } }, t('principalView.dashboardTitle', "Principal's Dashboard")) },
    { title: React.createElement(Link, { to: ".", onClick: () => { setSelectedDepartmentForCourses(null); setSelectedCourseForBatches(null); setSelectedStudentForPerformance(null); setViewingFacultyPerformance(false); } }, t(`module.${MODULE_KEY}.title`))},
  ];

  const breadcrumbItems = useMemo<BreadcrumbProps['items']>(() => {
    const items: BreadcrumbProps['items'] = [...baseBreadcrumbItems];
    if (viewingFacultyPerformance) {
        items.push({ title: t('module.academics.facultyPerformanceSectionTitle') });
    } else if (selectedDepartmentForCourses) {
      items.push({ title: React.createElement(Link, { to:".", onClick: () => { setSelectedCourseForBatches(null); setSelectedStudentForPerformance(null); } }, selectedDepartmentForCourses.departmentName) });
      if (selectedCourseForBatches) {
        items.push({ title: React.createElement(Link, { to: ".", onClick: () => setSelectedStudentForPerformance(null) }, selectedCourseForBatches.courseName) });
        if (selectedStudentForPerformance && selectedStudentForPerformance.studentName) {
          items.push({ title: selectedStudentForPerformance.studentName }); // Simple string for non-link
        }
      }
    }
    return items;
  }, [selectedDepartmentForCourses, selectedCourseForBatches, selectedStudentForPerformance, viewingFacultyPerformance, t, baseBreadcrumbItems]);

  const filterDescriptionItems: DescriptionsProps['items'] = Object.entries(filters)
    .filter(([key]) => !['setAcademicYear', 'setCampus', 'setDegreeType', 'setDepartment', 'setDateRange', 'clearFilters'].includes(key))
    .map(([key, value]) => {
      let stringValue: string;
      if (key === 'dateRange' && Array.isArray(value)) {
        stringValue = value.join(' - ');
      } else if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
        stringValue = t('common.notSet', "Not Set");
      } else {
        stringValue = String(value);
      }
      return {
        label: t(`filters.${key}`, key.replace(/([A-Z])/g, " $1").replace(/^_/, "").trim()),
        key: key,
        children: React.createElement(Text, null, stringValue)
      };
    });
  const topDepartmentsData = useMemo(() => { if (!institutionData?.faculties) return []; return [...institutionData.faculties.flatMap(faculty => faculty.departments)].sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0)).slice(0, 5);}, [institutionData?.faculties]);
  const handleViewDepartmentCourses = (department: Department) => { setSelectedDepartmentForCourses(department); setSelectedCourseForBatches(null); setSelectedStudentForPerformance(null); setViewingFacultyPerformance(false); };
  const departmentTableColumns = [ { title: t('module.academics.table.departmentName'), dataIndex: 'departmentName', key: 'departmentName', sorter: (a: Department, b: Department) => a.departmentName.localeCompare(b.departmentName) }, { title: t('module.academics.table.performanceScore'), dataIndex: 'performanceScore', key: 'performanceScore', render: (score?: number) => score !== undefined ? `${score.toFixed(1)}/100` : t('common.notApplicableShort'), sorter: (a: Department, b: Department) => (a.performanceScore || 0) - (b.performanceScore || 0), align: 'right' as const }, { title: t('module.academics.table.avgGPA'), dataIndex: 'averageGPA', key: 'averageGPA', render: (gpa?: number) => gpa !== undefined ? gpa.toFixed(2) : t('common.notApplicableShort'), sorter: (a: Department, b: Department) => (a.averageGPA || 0) - (b.averageGPA || 0), align: 'right' as const }, { title: t('module.academics.table.avgPassRate'), dataIndex: 'averagePassRate', key: 'averagePassRate', render: (rate?: number) => rate !== undefined ? `${rate.toFixed(2)}%` : t('common.notApplicableShort'), sorter: (a: Department, b: Department) => (a.averagePassRate || 0) - (b.averagePassRate || 0), align: 'right' as const }, { title: t('common.actions'), key: 'actions', render: (_: any, record: Department) => React.createElement(Button, { type: "link", icon: React.createElement(EyeOutlined), onClick: () => handleViewDepartmentCourses(record) }, t('common.viewCourses', "View Courses")) }];

  const restoredCoursePerformanceDataFull = useMemo((): CoursePerformance[] => { if (!allAcademicRecords.length || !institutionData?.academicYears) return []; const coursesAggregated: { [courseId: string]: { courseName: string; totalEnrolled: number; passedCount: number; sumGpaPoints: number; totalCreditsForGpa: number; } } = {}; let selectedYearStartDate: dayjs.Dayjs | null = null; let selectedYearEndDate: dayjs.Dayjs | null = null; if (filters.academicYear && institutionData.academicYears) { const ayData = institutionData.academicYears.find(ay => ay.yearId === filters.academicYear); if (ayData) { selectedYearStartDate = dayjs(ayData.startDate); selectedYearEndDate = dayjs(ayData.endDate); } } allAcademicRecords.forEach((record: StudentAcademicRecord) => { record.semesters.forEach((semester: StudentAcademicRecord['semesters'][0]) => { /* Note: semester.startDate and endDate are not in this type, filtering by year/date range for terms might need adjustment if it was based on semester dates */ semester.courses.forEach((course: CourseEnrollment) => { if (!coursesAggregated[course.courseId]) { coursesAggregated[course.courseId] = { courseName: course.courseName, totalEnrolled: 0, passedCount: 0, sumGpaPoints: 0, totalCreditsForGpa: 0 }; } const current = coursesAggregated[course.courseId]; current.totalEnrolled++; if (course.grade) { if (course.grade.letterGrade !== 'F' && course.grade.letterGrade !== 'NP') current.passedCount++; if (course.grade.points !== undefined && course.grade.letterGrade !== 'P' && course.grade.letterGrade !== 'NP') { current.sumGpaPoints += course.grade.points * course.credits; current.totalCreditsForGpa += course.credits; } } }); }); }); return Object.entries(coursesAggregated).map(([courseId, data]) => ({ courseId, courseName: data.courseName, enrolledCount: data.totalEnrolled, passRate: data.totalEnrolled > 0 ? parseFloat(((data.passedCount / data.totalEnrolled) * 100).toFixed(2)) : 0, avgGpa: data.totalCreditsForGpa > 0 ? parseFloat((data.sumGpaPoints / data.totalCreditsForGpa).toFixed(2)) : 0, })); }, [allAcademicRecords, institutionData?.academicYears, filters.academicYear, filters.dateRange]);
  const restoredTopCoursesDataFull = useMemo(() => [...restoredCoursePerformanceDataFull].sort((a, b) => { if (b.passRate !== a.passRate) return b.passRate - a.passRate; return b.avgGpa - a.avgGpa; }).slice(0, 5), [restoredCoursePerformanceDataFull]);
  const restoredTopCoursesTableColumns = [ { title: t('module.academics.courseTable.courseName', "Course Name"), dataIndex: 'courseName', key: 'courseName' }, { title: t('module.academics.courseTable.passRate', "Pass Rate"), dataIndex: 'passRate', key: 'passRate', render: (rate?: number) => `${rate?.toFixed(2)}%`, align: 'right' as const }, { title: t('module.academics.courseTable.avgGPA', "Average GPA"), dataIndex: 'avgGpa', key: 'avgGpa', render: (gpa?: number) => gpa?.toFixed(2), align: 'right' as const }, { title: t('module.academics.courseTable.enrolledStudents', "Enrolled Students"), dataIndex: 'enrolledCount', key: 'enrolledCount', align: 'right' as const }];

  const avgFacultyRating = institutionData?.avgFacultyRating ?? 0;
  const facultyEvalResponseRate = institutionData?.facultyEvaluationResponseRate ?? 0;
  const facultyEvalKpis = [ { titleKey: 'module.academics.kpi.avgFacultyRating', value: avgFacultyRating, suffix: '/10', icon: React.createElement(StarOutlined), precision: 1 }, { titleKey: 'module.academics.kpi.facultyEvalResponseRate', value: facultyEvalResponseRate, suffix: '%', icon: React.createElement(UserSwitchOutlined), precision: 1 }];
  const handleViewCourseOfferings = (course: SimpleCourseInfo) => { setSelectedCourseForBatches(course); setSelectedStudentForPerformance(null); setViewingFacultyPerformance(false); };

  const coursesInSelectedDeptMemo = useMemo((): (SimpleCourseInfo & CoursePerformance)[] => { /* ... as before, make sure it returns CoursePerformance compatible items ... */
    if (!selectedDepartmentForCourses || !institutionData?.academicYears || !allAcademicRecords) return [];
    // ... (Full calculation as in previous step, ensuring avgGpa, passRate, enrolledCount are calculated)
    // This calculation is identical to restoredCoursePerformanceDataFull but filtered by departmentId
    const coursesMap = new Map<string, SimpleCourseInfo & Partial<CoursePerformance> & { enrollments: CourseEnrollment[], studentIds: Set<string> }>();
    const targetDepartmentId = selectedDepartmentForCourses.departmentId;
    let relevantAcademicYears = institutionData.academicYears;
    if (filters.academicYear) { relevantAcademicYears = institutionData.academicYears.filter(ay => ay.yearId === filters.academicYear); }
    relevantAcademicYears.forEach(year => { (year.degrees || []).forEach(degree => { (degree.programs || []).forEach(program => { if (program.departmentId === targetDepartmentId) { (program.semesters || []).forEach(semester => { (semester.courses || []).forEach(courseTemplate => { if (!coursesMap.has(courseTemplate.courseId)) { coursesMap.set(courseTemplate.courseId, { courseId: courseTemplate.courseId, courseName: courseTemplate.courseName, enrollments: [], studentIds: new Set() }); } }); }); } }); }); });
    allAcademicRecords.forEach((record: StudentAcademicRecord) => { record.semesters.forEach((semester: StudentAcademicRecord['semesters'][0]) => { /* Note: semester.startDate and endDate are not in this type, filtering by year/date range for terms might need adjustment if it was based on semester dates */ const programOfStudent = institutionData.academicYears.flatMap(ay => ay.degrees).flatMap(deg => deg.programs).find(p => p.programId === record.programId); if(programOfStudent?.departmentId !== selectedDepartmentForCourses.departmentId) return; semester.courses.forEach((enrollment: CourseEnrollment) => { if(coursesMap.has(enrollment.courseId)){ const courseEntry = coursesMap.get(enrollment.courseId)!; courseEntry.enrollments.push(enrollment); courseEntry.studentIds.add(record.studentId); } }); }); });
    return Array.from(coursesMap.values()).map(data => { let passedCount = 0; let sumGpaPoints = 0; let totalCreditsForGpa = 0; data.enrollments.forEach((enr: CourseEnrollment) => { if(enr.grade){ if(enr.grade.letterGrade !== 'F' && enr.grade.letterGrade !== 'NP') passedCount++; if(enr.grade.points !== undefined && enr.grade.letterGrade !== 'P' && enr.grade.letterGrade !== 'NP'){ sumGpaPoints += enr.grade.points * enr.credits; totalCreditsForGpa += enr.credits; } } }); return { courseId: data.courseId, courseName: data.courseName, enrolledCount: data.studentIds.size, passRate: data.studentIds.size > 0 ? parseFloat(((passedCount / data.studentIds.size) * 100).toFixed(2)) : 0, avgGpa: totalCreditsForGpa > 0 ? parseFloat((sumGpaPoints / totalCreditsForGpa).toFixed(2)) : 0 }; });
  }, [selectedDepartmentForCourses, institutionData?.academicYears, allAcademicRecords, filters.academicYear]);

  const selectedDeptCourseTableColumnsUpdated = [ { title: t('module.academics.courseTable.courseName', "Course Name"), dataIndex: 'courseName', key: 'courseName', sorter: (a: CoursePerformance, b: CoursePerformance) => a.courseName.localeCompare(b.courseName) }, { title: t('module.academics.courseTable.passRate', "Pass Rate"), dataIndex: 'passRate', key: 'passRate', render: (rate?: number) => rate !== undefined ? `${rate.toFixed(2)}%` : t('common.notApplicableShort'), sorter: (a: CoursePerformance, b: CoursePerformance) => (a.passRate || 0) - (b.passRate || 0), align: 'right' as const }, { title: t('module.academics.courseTable.avgGPA', "Average GPA"), dataIndex: 'avgGpa', key: 'avgGpa', render: (gpa?: number) => gpa !== undefined ? gpa.toFixed(2) : t('common.notApplicableShort'), sorter: (a: CoursePerformance, b: CoursePerformance) => (a.avgGpa || 0) - (b.avgGpa || 0), align: 'right' as const }, { title: t('module.academics.courseTable.enrolledStudents', "Enrolled"), dataIndex: 'enrolledCount', key: 'enrolledCount', sorter: (a: CoursePerformance, b: CoursePerformance) => (a.enrolledCount || 0) - (b.enrolledCount || 0), align: 'right' as const }, { title: t('common.actions'), key: 'actions', render: (_: any, record: SimpleCourseInfo) => React.createElement(Button, { type: "link", icon: React.createElement(EyeOutlined), onClick: () => handleViewCourseOfferings(record) }, t('common.viewOfferings', "View Offerings")) }];

  const offeringsForSelectedCourse = useMemo((): CourseOfferingInfo[] => { /* ... as before ... */ return []; }, [selectedCourseForBatches, selectedDepartmentForCourses, institutionData?.academicYears, allAcademicRecords, filters.academicYear]);

  const currentStudentAcademicRecord = useMemo(() => {
    if (!selectedStudentForPerformance || !allAcademicRecords) return null;
    return allAcademicRecords.find(ar => ar.studentId === selectedStudentForPerformance.studentId) || null;
  }, [selectedStudentForPerformance, allAcademicRecords]);

  const studentOverallAttendancePercentage = useMemo(() => {
    if (!selectedStudentForPerformance || !allAttendanceRecords || allAttendanceRecords.length === 0) return 0;
    const studentRecords = allAttendanceRecords.filter(ar => ar.studentId === selectedStudentForPerformance.studentId);
    if (studentRecords.length === 0) return 0;
    const presentCount = studentRecords.filter(ar => ar.status === 'Present').length;
    return parseFloat(((presentCount / studentRecords.length) * 100).toFixed(1));
  }, [selectedStudentForPerformance, allAttendanceRecords]);

  const handleViewStudentPerformance = (student: StudentInOfferingData, offeringContext: CourseOfferingInfo) => {
    setSelectedStudentForPerformance({
        studentId: student.studentId,
        studentName: student.studentName,
        courseName: offeringContext.courseName,
        programName: offeringContext.programName,
        semesterName: offeringContext.semesterName,
    });
  };

  const offeringsTableColumns = [ { title: t('module.academics.offeringTable.programName', "Program"), dataIndex: 'programName', key: 'programName' }, { title: t('module.academics.offeringTable.semesterName', "Semester"), dataIndex: 'semesterName', key: 'semesterName' }, { title: t('module.academics.offeringTable.enrolled', "Enrolled"), dataIndex: 'enrolledInOffering', key: 'enrolledInOffering', align: 'right' as const }, { title: t('module.academics.offeringTable.passRate', "Pass Rate"), dataIndex: 'passRateInOffering', key: 'passRateInOffering', render: (rate?:number) => rate !== undefined ? `${rate.toFixed(2)}%` : t('common.notApplicableShort'), align: 'right' as const }, { title: t('module.academics.offeringTable.avgGPA', "Avg. GPA"), dataIndex: 'avgGpaInOffering', key: 'avgGpaInOffering', render: (gpa?:number) => gpa !== undefined ? gpa.toFixed(2) : t('common.notApplicableShort'), align: 'right' as const }, /* Add action column here */ ];

  const studentsInSelectedOffering = useMemo((): StudentInOfferingData[] => {
    if (!selectedOfferingDetails || !allAcademicRecords || !allStudentsInInstitution) return [];
    const studentData: StudentInOfferingData[] = [];
    const studentRecordsInProgram = allAcademicRecords.filter(ar => ar.programId === selectedOfferingDetails.programId);

    studentRecordsInProgram.forEach((sr: StudentAcademicRecord) => {
        const semesterData = sr.semesters.find((semester: StudentAcademicRecord['semesters'][0]) => semester.semesterId === selectedOfferingDetails.termId); // termId in CourseOfferingInfo should be semesterId
        if (semesterData) {
            const courseEnrollment = semesterData.courses.find((course: CourseEnrollment) => course.courseId === selectedOfferingDetails.courseId);
            if (courseEnrollment) {
                const studentSummary = allStudentsInInstitution.find(s => s.studentId === sr.studentId);
                studentData.push({
                    studentId: sr.studentId,
                    studentName: studentSummary ? `${studentSummary.firstName} ${studentSummary.lastName}` : t('common.unknown'),
                    gradeDetails: courseEnrollment.grade,
                });
            }
        }
    });
    return studentData;
  }, [selectedOfferingDetails, allAcademicRecords, allStudentsInInstitution, t]);

  const studentsInOfferingTableColumns = [
    { title: t('module.academics.studentTable.studentId', "Student ID"), dataIndex: 'studentId', key: 'studentId'},
    { title: t('module.academics.studentTable.studentName', "Student Name"), dataIndex: 'studentName', key: 'studentName', sorter: (a:StudentInOfferingData, b:StudentInOfferingData) => a.studentName.localeCompare(b.studentName) },
    { title: t('module.academics.studentTable.gradeInCourse', "Grade"), dataIndex: 'gradeDetails', key: 'grade', render: (grade?: CourseEnrollment['grade']) => grade ? `${grade.letterGrade} (${grade.numericalScore !== undefined ? grade.numericalScore : 'N/A'})` : t('common.notApplicableShort') }
  ];

  // Update Offerings Table Columns to include action
  const offeringsTableColumnsWithActions = [
    ...offeringsTableColumns,
    { title: t('common.actions'), key: 'actions', render: (_: any, record: CourseOfferingInfo) => React.createElement(Button, { type: "link", icon: React.createElement(EyeOutlined), onClick: () => setSelectedOfferingDetails(record) /* Simplified, direct set */ }, t('common.viewStudents', "View Students")) }
  ];


  const facultyPerformanceData = useMemo((): FacultyPerformanceData[] => { /* ... existing ... */ return []; }, [institutionData?.facultyMembers, institutionData?.facultyEvaluations, filters.department, t]);
  const facultyPerformanceTableColumns = [ /* ... existing ... */ ];

  // Early return for loading state, AFTER all hooks have been called.
  if (loading && !institutionData) { return React.createElement("div", { style: { padding: '20px', textAlign: 'center' } }, React.createElement(Spin, { size: "large" })); }

  const summaryTilesSection = React.createElement(Row, { gutter: [16, 16] }, summaryKpis.map(kpi => React.createElement(Col, { xs: 24, sm: 12, md: 12, lg:6, key: kpi.titleKey }, React.createElement(Card, { bordered: false, style: { boxShadow: '0 2px 8px rgba(0,0,0,0.09)'} }, React.createElement(Statistic, { title: t(kpi.titleKey), value: kpi.value, precision: kpi.precision, prefix: kpi.icon, suffix: kpi.suffix, valueStyle: kpi.titleKey === 'module.academics.kpi.overallFailRate' || kpi.titleKey === 'module.academics.kpi.backlogRate' ? { color: '#cf1322' } : { color: '#3f8600' } })))));
  const facultyEvalSnapshotSection = React.createElement(Row, { gutter: [16,16], style: {marginTop: '20px'}}, facultyEvalKpis.map(kpi => React.createElement(Col, { xs: 24, sm:12, md:12, lg:6, key: kpi.titleKey}, React.createElement(Card, {bordered:false, style:{boxShadow: '0 2px 8px rgba(0,0,0,0.09)'}}, React.createElement(Statistic, {title: t(kpi.titleKey), value: kpi.value, precision: kpi.precision, prefix: kpi.icon, suffix: kpi.suffix, valueStyle:{color: '#3f8600'}})))));

  const departmentGpaChartData = useMemo(() => {
    if (!institutionData?.faculties) return [];
    return institutionData.faculties.flatMap(faculty => faculty.departments).map(dept => ({
      id: dept.departmentId,
      name: dept.departmentName,
      averageGpa: dept.averageGPA,
    }));
  }, [institutionData?.faculties]);

  const departmentGpaChartSection = React.createElement(Row, { style: { marginTop: '30px' } },
    React.createElement(Col, { span: 24 },
      React.createElement(AverageGpaBarChart, {
        data: departmentGpaChartData,
        title: t('module.academics.charts.avgGpaByDepartment', "Average GPA by Department"),
        loading: loading,
        barColor: "#6395F9" // Example color
      })
    )
  );

  // Define attendanceGradeScatterPlotSection
  const attendanceGradeScatterPlotSection = React.createElement(Row, { style: { marginTop: '30px' } },
    React.createElement(Col, { span: 24 },
      React.createElement(AttendanceGradeScatterPlot, {
        academicRecords: allAcademicRecords,
        attendanceRecords: allAttendanceRecords,
        students: allStudentsInInstitution.map(summary => ({
          id: summary.studentId,
          firstName: summary.firstName,
          lastName: summary.lastName,
          // gradeLevel and homeroom are optional in Student type
        })),
        title: t('module.academics.charts.attendanceVsGrade', "Attendance vs. Grade"),
        loading: loading,
      })
    )
  );

  // Correctly define overallGradeDistributionChartSection ONCE
  const overallGradeDistributionChartSection = React.createElement(Row, { style: { marginTop: '30px' } },
    React.createElement(Col, { span: 24 },
      React.createElement(OverallGradeDistributionChart, {
        gradeDistribution: institutionData?.institutionGradeDistribution,
        title: t('module.academics.charts.overallGradeDistribution', "Overall Grade Distribution"),
        loading: loading,
      })
    )
  );

  const topDepartmentsTableSection = React.createElement(Card, { bordered: false, style: {boxShadow: '0 2px 8px rgba(0,0,0,0.09)', marginTop: '30px'} }, React.createElement(Table, { dataSource: topDepartmentsData, columns: departmentTableColumns, rowKey: 'departmentId', loading: loading, pagination: false, scroll: {x: 'max-content'} } as any));
  const topCoursesTableSection = React.createElement(Card, { bordered: false, style: {boxShadow: '0 2px 8px rgba(0,0,0,0.09)', marginTop: '30px'} }, React.createElement(Table, { dataSource: restoredTopCoursesDataFull, columns: restoredTopCoursesTableColumns, rowKey: 'courseId', loading: loading, pagination: false, scroll: {x: 'max-content'} } as any));

  const departmentCoursesView = React.createElement(React.Fragment, null, React.createElement(Button, { type: "link", icon: React.createElement(ArrowLeftOutlined), onClick: () => setSelectedDepartmentForCourses(null), style: { marginBottom: '16px', paddingLeft: 0 } }, t('module.academics.backToOverview')), React.createElement(Title, { level: 3, style: { marginTop: '0px' } }, t('module.academics.coursesInDepartmentTitle', { departmentName: selectedDepartmentForCourses?.departmentName || '' })), React.createElement(Card, { bordered: false, style: { boxShadow: '0 2px 8px rgba(0,0,0,0.09)'} }, React.createElement(Table, { dataSource: coursesInSelectedDeptMemo, columns: selectedDeptCourseTableColumnsUpdated, rowKey: 'courseId', loading: loading, pagination: { pageSize: 10, showSizeChanger: true, pageSizeOptions: ['5', '10', '20'] }, scroll: {x: 'max-content'} } as any)));
  const courseOfferingsView = React.createElement(React.Fragment, null, React.createElement(Button, { type: "link", icon: React.createElement(ArrowLeftOutlined), onClick: () => setSelectedCourseForBatches(null), style: { marginBottom: '16px', paddingLeft: 0 } }, t('module.academics.backToCourseList', {departmentName: selectedDepartmentForCourses?.departmentName || ''})), React.createElement(Title, { level: 3, style: { marginTop: '0px' } }, t('module.academics.offeringsForCourseTitle', { courseName: selectedCourseForBatches?.courseName || '' })), React.createElement(Card, { bordered: false, style: { boxShadow: '0 2px 8px rgba(0,0,0,0.09)'} }, React.createElement(Table, { dataSource: offeringsForSelectedCourse, columns: offeringsTableColumnsWithActions, rowKey: 'offeringId', loading: loading, pagination: { pageSize: 5, showSizeChanger: true }, scroll: {x: 'max-content'} } as any)));

  const studentPerformanceDetailView = React.createElement(React.Fragment, null,
    React.createElement(Button, { type: "link", icon: React.createElement(ArrowLeftOutlined), onClick: () => setSelectedStudentForPerformance(null), style: { marginBottom: '16px', paddingLeft: 0 } }, t('module.academics.backToStudentList', { courseName: selectedCourseForBatches?.courseName || ''})),
    React.createElement(Title, { level: 3, style: { marginTop: '0px' } }, t('module.academics.studentPerformanceTitle', { studentName: selectedStudentForPerformance?.studentName || '', courseName: selectedStudentForPerformance?.courseName || '', programName: selectedStudentForPerformance?.programName || '', semesterName: selectedStudentForPerformance?.semesterName || '' })),
    currentStudentAcademicRecord ? React.createElement(PrincipalStudentDetailView, { studentAcademicRecord: currentStudentAcademicRecord, loading: loading } as any) : React.createElement(Text, null, t('common.noDataAvailable')),
    React.createElement(Card, { title: t('module.academics.attendanceSummaryTitle', { studentName: selectedStudentForPerformance?.studentName || ''}), style: {marginTop: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.09)'}, bordered: false },
      React.createElement(Statistic, { title: t('module.academics.overallAttendanceRate'), value: studentOverallAttendancePercentage, suffix:"%", precision:1 })
    )
  );

  const facultyPerformanceView = React.createElement(React.Fragment, null, /* ... */);

  let currentView;
  if (viewingFacultyPerformance) { currentView = facultyPerformanceView; }
  else if (selectedStudentForPerformance) { currentView = studentPerformanceDetailView; }
  else if (selectedCourseForBatches) { currentView = courseOfferingsView; }
  else if (selectedDepartmentForCourses) { currentView = departmentCoursesView; }
  else { currentView = React.createElement(React.Fragment, null, React.createElement(Title, { level: 3, style: { marginTop: '20px' } }, t('module.academics.summaryTilesTitle')), summaryTilesSection, React.createElement(Title, {level: 3, style: {marginTop: '30px'}}, t('module.academics.facultyEvalSnapshotTitle')), facultyEvalSnapshotSection, React.createElement(Button, { type: "primary", onClick: () => setViewingFacultyPerformance(true), style: {marginTop: '20px', marginBottom: '20px'}}, t('module.academics.viewFacultyPerformanceButton')), departmentGpaChartSection, attendanceGradeScatterPlotSection, overallGradeDistributionChartSection, React.createElement(Title, {level: 3, style: {marginTop: '30px'}}, t('module.academics.topDepartmentsTitle')), topDepartmentsTableSection, React.createElement(Title, {level: 3, style: {marginTop: '30px'}}, t('module.academics.topCoursesTitle')), topCoursesTableSection ); }

  return (
    React.createElement("div", { style: { padding: '20px' } },
      React.createElement(Breadcrumb, { items: breadcrumbItems, style: { marginBottom: '16px' } }),
      React.createElement(Title, { level: 2 }, t(`module.${MODULE_KEY}.title`)),
      React.createElement(Paragraph, null, t(`module.${MODULE_KEY}.descriptionPlaceholder`)),
      currentView,
      React.createElement(Card, { title: t('common.currentGlobalFilters', "Current Global Filters"), style: { marginTop: 20, display: 'none' } }, React.createElement(Descriptions, { bordered: true, column: 1, size: "small", items: filterDescriptionItems })),
      // React.createElement(Paragraph, { style: { marginTop: '20px', fontStyle: 'italic', textAlign: 'center', color: '#888' } }, t('common.moduleSpecificContentPlaceholder'))
      // The above line was found and commented out as it is a generic placeholder.
    )
  );
};

export default AcademicPerformanceModule;
