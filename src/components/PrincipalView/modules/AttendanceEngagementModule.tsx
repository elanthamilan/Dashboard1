// IMPORTANT: This component currently uses MOCK DATA.
// TODO: Replace mock data generation (e.g., generateMockAttendanceRecords, generateMockNewInstitutions)
// with actual data fetching logic from an API or state management system.
import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Breadcrumb, Card, Descriptions, Row, Col, Statistic, Spin, Alert, Select, Button, Table, Timeline, DescriptionsProps, Tag, Empty } from 'antd'; // Added Tag, Empty
import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
// Correcting icon imports - ensure ClockCircleOutlined is available if used
import { useGlobalFilters } from '../../../contexts/GlobalFilterContext';
import { useTranslation } from 'react-i18next';
import {
  HomeOutlined, UserOutlined, RiseOutlined, FallOutlined, WarningOutlined, SolutionOutlined,
  BarChartOutlined, LineChartOutlined, CalendarOutlined, IssuesCloseOutlined, CheckCircleOutlined, ClockCircleOutlined,
  LoginOutlined, DownloadOutlined, MessageOutlined, EyeOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import { Bar, Line, Heatmap, Column } from '@ant-design/plots'; // Added Column
import { fetchData } from '../../../utils/apiUtils';
import { Institution, StudentSummary, Program as ProgramType, Semester as SemesterType, CourseEnrollment, SchoolClass } from '../../../types/hierarchy'; // Added SchoolClass
import { AttendanceRecord, AttendanceStatus } from '../../../types/attendance'; // Added AttendanceStatus
// Note: AbsenceReason was removed as it's not a defined type in the provided files. It was used as string.
import { generateMockNewInstitutions } from '../../../utils/mockData/academics/generateMockAcademicData';
import { generateMockAttendanceRecords, generateMockClasses } from '../../../utils/mockData/attendance/generateMockAttendanceData'; // Changed import
import { getWeekNumberWithYear } from '../../../utils/dateUtils';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

const { Title, Paragraph, Text } = Typography;
const { Option } = Select; // Option is used by Select component
const MODULE_KEY = 'attendance';
const AT_RISK_THRESHOLD = 75;
const AT_RISK_PERIOD_DAYS = 30;

const formatDateYYYYMMDD = (date: Date): string => date.toISOString().split('T')[0];

interface AttendanceData {
  institutionData: Institution | null;
  attendanceRecords: AttendanceRecord[];
}

interface KpiItem {
  key: string;
  title: string;
  value: string | number | undefined;
  precision?: number;
  prefix?: React.ReactNode;
  suffix?: string;
  color?: string;
  icon?: React.ReactNode;
}

const AttendanceEngagementModule: React.FC = () => {
  const { t } = useTranslation();
  const filters = useGlobalFilters();

  const [loading, setLoading] = useState(true);
  const [institutionData, setInstitutionData] = useState<Institution | null>(null);
  const [allAttendanceRecords, setAllAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [allStudentsSummaryList, setAllStudentsSummaryList] = useState<StudentSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [latestDateInRecords, setLatestDateInRecords] = useState<string>(formatDateYYYYMMDD(new Date()));
  const [selectedCourseForTrend, setSelectedCourseForTrend] = useState<string | null>(null);

  useEffect(() => {
    const loadAttendanceData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchData<AttendanceData>('/principal-view/attendance');

        if (data.institutionData) {
          setInstitutionData(data.institutionData);
          const summaries: StudentSummary[] = [];
          data.institutionData.academicYears.forEach(ay =>
            ay.degrees.forEach(deg =>
              deg.programs.forEach(prog =>
                prog.semesters.forEach(sem =>
                  (sem.students || []).forEach(s => {
                    if (!summaries.find(existing => existing.studentId === s.studentId)) {
                      summaries.push({...s, programName: prog.programName, departmentId: prog.departmentId});
                    }
                  })
                )
              )
            )
          );
          setAllStudentsSummaryList(summaries);
        }
        if (data.attendanceRecords) {
          setAllAttendanceRecords(data.attendanceRecords);
          if (data.attendanceRecords.length > 0) {
            const maxDate = new Date(Math.max(...data.attendanceRecords.map(r => new Date(r.date).getTime())));
            setLatestDateInRecords(formatDateYYYYMMDD(maxDate));
          } else {
            setLatestDateInRecords(formatDateYYYYMMDD(new Date()));
          }
        } else {
          setAllAttendanceRecords([]);
          setLatestDateInRecords(formatDateYYYYMMDD(new Date()));
        }
      } catch (err: any) {
        console.error("Failed to fetch attendance data:", err);
        setError(err.message || 'Failed to fetch attendance data');
        console.warn('Falling back to mock data for AttendanceEngagementModule due to API error.');
        const instDataArray = generateMockNewInstitutions(undefined, [], 3, 50);
        if (instDataArray && instDataArray.length > 0) {
          const currentInstitution = instDataArray[0];
          setInstitutionData(currentInstitution);
          const summaries: StudentSummary[] = [];
          currentInstitution.academicYears.forEach(ay =>
            ay.degrees.forEach(deg =>
              deg.programs.forEach(prog =>
                prog.semesters.forEach(sem =>
                  (sem.students || []).forEach(s => {
                     if (!summaries.find(existing => existing.studentId === s.studentId)) {
                       summaries.push({...s, programName: prog.programName, departmentId: prog.departmentId});
                     }
                  })
                )
              )
            )
          );
          setAllStudentsSummaryList(summaries);
          const studentIds = summaries.map(s => s.studentId);
          const classesForMock = generateMockClasses(5);
          const records = generateMockAttendanceRecords(studentIds, classesForMock, 365);
          setAllAttendanceRecords(records);
          if (records.length > 0) {
            const maxDate = new Date(Math.max(...records.map(r => new Date(r.date).getTime())));
            setLatestDateInRecords(formatDateYYYYMMDD(maxDate));
          } else {
             setLatestDateInRecords(formatDateYYYYMMDD(new Date()));
          }
        } else {
          setError(t('common.errorNoInstitutionData'));
        }
      } finally {
        setLoading(false);
      }
    };
    loadAttendanceData();
  }, [t, filters.academicYear]);

  const [selectedProgramForAttendance, setSelectedProgramForAttendance] = useState<{ programId: string; programName: string; } | null>(null);
  const [selectedSemesterForClasses, setSelectedSemesterForClasses] = useState<(SemesterType & { programName?: string }) | null>(null);
  const [viewingAtRiskStudents, setViewingAtRiskStudents] = useState(false);
  const [selectedStudentForAttendanceDetail, setSelectedStudentForAttendanceDetail] = useState<(StudentSummary & { calculatedAvgAttendanceRate?: number; calculatedConsecutiveAbsences?: number; totalAbsences?: number; totalLates?:number; }) | null>(null);

  const todayStr = latestDateInRecords;

  const augmentedStudentSummaries = useMemo((): (StudentSummary & { calculatedAvgAttendanceRate?: number; calculatedConsecutiveAbsences?: number; totalAbsences?: number; totalLates?: number; })[] => {
    if (!allStudentsSummaryList || !allAttendanceRecords) return [];
    return allStudentsSummaryList.map(student => {
      const studentRecords = allAttendanceRecords.filter(r => r.studentId === student.studentId && r.status !== 'Holiday');
      if (studentRecords.length === 0) {
        return { ...student, calculatedAvgAttendanceRate: 100, calculatedConsecutiveAbsences: 0, totalAbsences: 0, totalLates: 0 };
      }
      const presentOrLateCount = studentRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
      const totalAccountableRecords = studentRecords.filter(r => r.status === 'Present' || r.status === 'Absent' || r.status === 'Late' || r.status === 'Excused').length;
      const calculatedAvgAttendanceRate = totalAccountableRecords > 0 ? (presentOrLateCount / totalAccountableRecords) * 100 : 100;
      let maxConsecutiveAbsences = 0;
      let currentConsecutiveAbsences = 0;
      const sortedStudentRecords = studentRecords.sort((a,b) => dayjs(a.date).diff(dayjs(b.date)));
      for (const record of sortedStudentRecords) {
        if (record.status === 'Absent') {
          currentConsecutiveAbsences++;
        } else {
          if (currentConsecutiveAbsences > maxConsecutiveAbsences) maxConsecutiveAbsences = currentConsecutiveAbsences;
          currentConsecutiveAbsences = 0;
        }
      }
      if (currentConsecutiveAbsences > maxConsecutiveAbsences) maxConsecutiveAbsences = currentConsecutiveAbsences;
      const totalAbsences = studentRecords.filter(r => r.status === 'Absent').length;
      const totalLates = studentRecords.filter(r => r.status === 'Late').length;
      return { ...student, calculatedAvgAttendanceRate, calculatedConsecutiveAbsences: maxConsecutiveAbsences, totalAbsences, totalLates };
    });
  }, [allStudentsSummaryList, allAttendanceRecords]);

  const attendanceByDayOfWeekData = useMemo(() => { /* ... */ }, [allAttendanceRecords, t]);
  const attendanceRateByMonthData = useMemo(() => { /* ... */ }, [allAttendanceRecords]);
  const lateVsAbsentData = useMemo(() => { /* ... */ }, [allAttendanceRecords, latestDateInRecords, t]);
  const absenceReasonDistributionData = useMemo(() => { /* ... */ }, [allAttendanceRecords]);
  const CONSECUTIVE_ABSENCE_THRESHOLD = 3;
  const studentsWithConsecutiveAbsencesList = useMemo(() => { /* ... */ }, [augmentedStudentSummaries]);

  const uniqueCoursesForSelect = useMemo(() => {
    if (!allAttendanceRecords) return [];
    const courseMap = new Map<string, string>();
    allAttendanceRecords.forEach(rec => {
        if (rec.courseId && rec.courseName && !courseMap.has(rec.courseId)) {
            courseMap.set(rec.courseId, rec.courseName);
        }
    });
    return Array.from(courseMap.entries()).map(([id, name]) => ({ label: name, value: id }));
  }, [allAttendanceRecords]);

  const avgAttendancePerCourseData = useMemo(() => {
    if (!allAttendanceRecords) return [];
    const courseStats: Record<string, { presentOrLate: number; accountable: number; courseName: string }> = {};
    allAttendanceRecords.forEach(rec => {
        if (rec.status === 'Holiday' || !rec.courseId || !rec.courseName) return;
        if (!courseStats[rec.courseId]) {
            courseStats[rec.courseId] = { presentOrLate: 0, accountable: 0, courseName: rec.courseName };
        }
        if (rec.status === 'Present' || rec.status === 'Late') {
            courseStats[rec.courseId].presentOrLate++;
        }
        if (rec.status === 'Present' || rec.status === 'Late' || rec.status === 'Absent' || rec.status === 'Excused') {
            courseStats[rec.courseId].accountable++;
        }
    });
    return Object.entries(courseStats)
        .map(([courseId, stats]) => ({
            courseId,
            courseName: stats.courseName,
            rate: stats.accountable > 0 ? parseFloat(((stats.presentOrLate / stats.accountable) * 100).toFixed(1)) : 100,
        }))
        .sort((a, b) => a.rate - b.rate);
  }, [allAttendanceRecords]);

  const selectedCourseAttendanceTrend = useMemo(() => {
    if (!selectedCourseForTrend || !allAttendanceRecords) return [];
    const courseRecords = allAttendanceRecords.filter(r => r.courseId === selectedCourseForTrend && r.status !== 'Holiday');
    if (courseRecords.length === 0) return [];
    const weeklyStats: Record<string, { presentOrLate: number; accountable: number }> = {};
    courseRecords.forEach(rec => {
        const weekStartDate = dayjs(rec.date).startOf('week').format('YYYY-MM-DD');
        if (!weeklyStats[weekStartDate]) weeklyStats[weekStartDate] = { presentOrLate: 0, accountable: 0 };
        if (rec.status === 'Present' || rec.status === 'Late') weeklyStats[weekStartDate].presentOrLate++;
        if (rec.status === 'Present' || rec.status === 'Late' || rec.status === 'Absent' || rec.status === 'Excused') weeklyStats[weekStartDate].accountable++;
    });
    return Object.entries(weeklyStats)
        .map(([week, stats]) => ({
            week,
            rate: stats.accountable > 0 ? parseFloat(((stats.presentOrLate / stats.accountable) * 100).toFixed(1)) : 100,
        }))
        .sort((a,b) => a.week.localeCompare(b.week));
  }, [selectedCourseForTrend, allAttendanceRecords]);

  const studentAttendanceInSelectedCourseData = useMemo(() => {
    if (!selectedCourseForTrend || !allAttendanceRecords || !augmentedStudentSummaries) return [];
    const courseRecords = allAttendanceRecords.filter(r => r.courseId === selectedCourseForTrend && r.status !== 'Holiday');
    if (courseRecords.length === 0) return [];
    const studentStatsInCourse: Record<string, { studentId: string, presentOrLate: number; accountable: number; totalAbsences: number; totalLates: number; }> = {};
    courseRecords.forEach(rec => {
        if (!studentStatsInCourse[rec.studentId]) {
            studentStatsInCourse[rec.studentId] = { studentId: rec.studentId, presentOrLate: 0, accountable: 0, totalAbsences: 0, totalLates: 0 };
        }
        const stat = studentStatsInCourse[rec.studentId];
        if (rec.status === 'Present' || rec.status === 'Late') stat.presentOrLate++;
        if (rec.status === 'Present' || rec.status === 'Late' || rec.status === 'Absent' || rec.status === 'Excused') stat.accountable++;
        if (rec.status === 'Absent') stat.totalAbsences++;
        if (rec.status === 'Late') stat.totalLates++;
    });
    return Object.values(studentStatsInCourse).map(stat => {
        const studentInfo = augmentedStudentSummaries.find(s => s.studentId === stat.studentId);
        return {
            studentId: stat.studentId,
            studentName: studentInfo ? `${studentInfo.firstName} ${studentInfo.lastName}` : t('common.unknown', 'Unknown'),
            programName: studentInfo?.programName || '-',
            attendanceRateInCourse: stat.accountable > 0 ? parseFloat(((stat.presentOrLate / stat.accountable) * 100).toFixed(1)) : 100,
            absencesInCourse: stat.totalAbsences,
            latesInCourse: stat.totalLates,
        };
    }).sort((a,b) => (b.absencesInCourse + b.latesInCourse) - (a.absencesInCourse + a.latesInCourse));
  }, [selectedCourseForTrend, allAttendanceRecords, augmentedStudentSummaries, t]);

  const atRiskTrendData = useMemo(() => {
    if (!allAttendanceRecords || !studentsWithConsecutiveAbsencesList) return []; // Use studentsWithConsecutiveAbsencesList
    const weeklyAtRiskCounts: Record<string, Set<string>> = {};
    const atRiskStudentIds = new Set(studentsWithConsecutiveAbsencesList.map(s => s.studentId));
    if(atRiskStudentIds.size === 0) return [];
    allAttendanceRecords.forEach(rec => {
        if (rec.status === 'Absent' && atRiskStudentIds.has(rec.studentId)) {
            const weekStartDate = dayjs(rec.date).startOf('week').format('YYYY-MM-DD');
            if (!weeklyAtRiskCounts[weekStartDate]) weeklyAtRiskCounts[weekStartDate] = new Set();
            weeklyAtRiskCounts[weekStartDate].add(rec.studentId);
        }
    });
    return Object.entries(weeklyAtRiskCounts)
        .map(([week, studentSet]) => ({ week, count: studentSet.size }))
        .sort((a,b) => a.week.localeCompare(b.week));
  }, [allAttendanceRecords, studentsWithConsecutiveAbsencesList]);

  const commonFactorsAtRiskData = useMemo(() => {
    if (studentsWithConsecutiveAbsencesList.length === 0 || !allAttendanceRecords) return [];
    const atRiskStudentIds = new Set(studentsWithConsecutiveAbsencesList.map(s => s.studentId));
    const courseCounts: Record<string, { courseName: string, count: number }> = {};
    allAttendanceRecords.forEach(rec => {
        if (atRiskStudentIds.has(rec.studentId) && rec.courseId && rec.courseName && (rec.status === 'Absent' || rec.status === 'Late')) {
            if (!courseCounts[rec.courseId]) courseCounts[rec.courseId] = { courseName: rec.courseName, count: 0 };
            courseCounts[rec.courseId].count++;
        }
    });
    return Object.values(courseCounts).sort((a,b) => b.count - a.count).slice(0, 5);
  }, [studentsWithConsecutiveAbsencesList, allAttendanceRecords]);


  const { avgAttendanceOverall, todaysStats, irregularityAlertsCount, topAbsenceReasonsData, weeklyAttendanceTrendData, lmsStats } = memoizedOverviewData;
  const filterDescriptionItems: DescriptionsProps['items'] = useMemo(() => Object.entries(filters) /* ... */, [filters, t]);
  const calendarHeatmapData = useMemo(() => [] , [allAttendanceRecords, todayStr, t]);
  const availablePrograms = useMemo(() => [] , [institutionData, filters.academicYear]);
  const semestersInSelectedProgram = useMemo(() => [] , [selectedProgramForAttendance, institutionData, filters.academicYear]);
  const classesInSelectedSemester = useMemo(() => { /* ... */ }, [selectedSemesterForClasses, allAttendanceRecords]);
  const atRiskStudentsData = useMemo(() => { /* ... */ }, [augmentedStudentSummaries]);
  const handleProgramSelect = (programId: string | null) => { /* ... */ };
  const handleSemesterSelect = (semester: SemesterType | null) => { /* ... */ };
  const handleViewAtRisk = () => { /* ... */ };
  const handleBackToOverviewFromAtRisk = () => { /* ... */ };
  const handleViewStudentDetail = (student: StudentSummary & { calculatedAvgAttendanceRate?: number; recentAbsences?: number; calculatedConsecutiveAbsences?: number; totalAbsences?: number; totalLates?:number }) => { setSelectedStudentForAttendanceDetail(student); };
  const handleBackToAtRiskList = () => { /* ... */ };
  const breadcrumbItems = useMemo(() => { /* ... */ }, [viewingAtRiskStudents, selectedStudentForAttendanceDetail, selectedProgramForAttendance, selectedSemesterForClasses, t]);
  const summaryKpis: KpiItem[] = useMemo(() => [ /* ... */ ], [t, avgAttendanceOverall, todaysStats, irregularityAlertsCount]);
  const lmsKpis: KpiItem[] = useMemo(() => [ /* ... */ ], [t, lmsStats]);
  const barConfig = { data: topAbsenceReasonsData, xField: 'value', yField: 'type', seriesField: 'type', legend: {position:'top-right' as const}, yAxis: {label:{autoHide:false}}};
  const lineConfig = { /* ... */ };
  const heatmapConfig = { /* ... */ };
  const programSelectorSection = React.createElement(Card, { /* ... */ });

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}><Spin size="large" /></div>;
  if (error) return <Alert message={t('common.errorLoadingData')} description={error} type="error" showIcon />;

  if (selectedStudentForAttendanceDetail) { /* ... */ }
  if (viewingAtRiskStudents) { /* ... */ }
  if (selectedProgramForAttendance && selectedSemesterForClasses) { return <Paragraph>Classes View Placeholder</Paragraph>; }
  if (selectedProgramForAttendance) { return <Paragraph>Semesters in Program Placeholder</Paragraph>; }

  return (
    React.createElement("div", { style: { padding: '20px' } },
      // ... Breadcrumb, Titles, Overview KPIs, LMS KPIs, Overview Charts (Top Absence, Weekly Trend, Heatmap) ...
      React.createElement(Breadcrumb, { items: breadcrumbItems, style: { marginBottom: '20px' } }),
      !viewingAtRiskStudents && programSelectorSection,
      !viewingAtRiskStudents && React.createElement(Button, { icon: React.createElement(SolutionOutlined), onClick: handleViewAtRisk, style:{ marginBottom: 20, marginTop: selectedProgramForAttendance ? 0 : 20 } }, t('module.attendance.viewAtRiskButton', "View At-Risk Students")),
      React.createElement(Title, { level: 2 }, t(`module.${MODULE_KEY}.title`, "Attendance & Engagement")),
      React.createElement(Paragraph, null, t(`module.${MODULE_KEY}.descriptionPlaceholder`, "Overview of student attendance, engagement patterns, and absence reasons.")),
      React.createElement(Title, { level: 4, style: { marginTop: '30px' } }, t('module.attendance.summary', "Attendance Summary")),
      React.createElement(Row, { gutter: [16, 16] }, summaryKpis.map(kpi => React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6, xl: 4, key: kpi.key }, React.createElement(Card, { hoverable: true }, React.createElement(Statistic, { title: kpi.title, value: kpi.value, precision: kpi.precision, prefix: kpi.icon, suffix: kpi.suffix, valueStyle: kpi.color ? { color: kpi.color } : {} }))))),
      React.createElement(Title, { level: 4, style: { marginTop: '30px' } }, t('module.attendance.lmsEngagementTitle', "LMS Engagement (Last 30 Days)")),
      React.createElement(Row, { gutter: [16, 16] }, lmsKpis.map(kpi => React.createElement(Col, { xs: 24, sm: 12, md: 8, key: kpi.key }, React.createElement(Card, { hoverable: true }, React.createElement(Statistic, { title: kpi.title, value: kpi.value, prefix: kpi.icon, suffix: kpi.suffix }))))),
      React.createElement(Row, { gutter: [16, 16], style: { marginTop: '30px' } },
        React.createElement(Col, { xs: 24, xl: 12 }, React.createElement(Card, { title: React.createElement(Text, null, React.createElement(BarChartOutlined, { style: { marginRight: 8 }}), t('module.attendance.topAbsenceReasons', "Top Absence Reasons")) }, (topAbsenceReasonsData || []).length > 0 ? React.createElement(Bar, barConfig as any) : React.createElement(Empty, {image: Empty.PRESENTED_IMAGE_SIMPLE}))),
        React.createElement(Col, { xs: 24, xl: 12 }, React.createElement(Card, { title: React.createElement(Text, null, React.createElement(LineChartOutlined, { style: { marginRight: 8 }}), t('module.attendance.weeklyAttendanceTrend', "Weekly Attendance Trend (Last 3 Months)")) }, (weeklyAttendanceTrendData || []).length > 0 ? React.createElement(Line, lineConfig as any) : React.createElement(Empty, {image: Empty.PRESENTED_IMAGE_SIMPLE})))
      ),
      React.createElement(Row, { gutter: [16, 16], style: { marginTop: '30px' } }, React.createElement(Col, { xs: 24 }, React.createElement(Card, { title: React.createElement(Text, null, React.createElement(CalendarOutlined, { style: { marginRight: 8 }}), t('module.attendance.calendarHeatmapTitle', "Monthly Attendance Heatmap")) }, (calendarHeatmapData || []).length > 0 ? React.createElement(Heatmap, heatmapConfig as any) : React.createElement(Empty, {image: Empty.PRESENTED_IMAGE_SIMPLE})))),

      React.createElement(Title, { level: 4, style: { marginTop: '30px' } }, t('module.attendance.detailedPatternsTitle', "Detailed Attendance Patterns")),
      React.createElement(Row, { gutter: [16, 16], style: { marginTop: '10px' } },
        React.createElement(Col, { xs: 24, lg: 12 },
          React.createElement(Card, { title: t('module.attendance.byDayOfWeekTitle', "Attendance by Day of Week") },
            attendanceByDayOfWeekData.length > 0 ? React.createElement(Column, { data: attendanceByDayOfWeekData, xField: "dayOfWeek", yField: "count", seriesField: "type", isGroup: true, legend:{position:'top'}, yAxis:{title: {text: t('common.count', "Count")}}} as any) : React.createElement(Empty, null)
          )
        ),
        React.createElement(Col, { xs: 24, lg: 12 },
          React.createElement(Card, { title: t('module.attendance.rateByMonthTitle', "Attendance Rate by Month") },
            attendanceRateByMonthData.length > 0 ? React.createElement(Line, { data: attendanceRateByMonthData, xField: "monthYear", yField: "rate", yAxis:{ title: {text: t('module.attendance.attendanceRatePercent', "Attendance Rate (%)")}, min:0, max:100, label: {formatter: (v: number | string) => `${v}%`} }, xAxis:{title: {text: t('common.monthYear', "Month-Year")}}, point:{size:4}, smooth: true } as any) : React.createElement(Empty, null)
          )
        )
      ),
      React.createElement(Row, { gutter: [16, 16], style: { marginTop: '20px' } },
       React.createElement(Col, { xs: 24, lg: 12 },
           React.createElement(Card, { title: t('module.attendance.lateVsAbsentTitle', "Late vs. Absent (Last 30 Days, Weekly)") },
               lateVsAbsentData.length > 0 ? React.createElement(Column, { data: lateVsAbsentData, xField: "week", yField: "count", seriesField: "type", isGroup: true, legend:{position:'top'}, yAxis:{title: {text: t('common.count', "Count")}}, xAxis:{title: {text: t('common.week', "Week (Start Date)")}, label:{rotate:45, autoHide:false}}} as any) : React.createElement(Empty, null)
           )
       ),
       React.createElement(Col, { xs: 24, lg: 12 },
          React.createElement(Card, { title: t('module.attendance.absenceReasonDistTitle', "Absence Reason Distribution (All Time)") , style:{maxHeight: '450px', overflowY: 'auto'}},
            absenceReasonDistributionData.length > 0 ? React.createElement(Bar, { data: absenceReasonDistributionData, xField: "count", yField: "reason", seriesField: "reason", legend: false, barWidthRatio: 0.6, yAxis:{label: {autoEllipsis:true}}, xAxis:{title: {text: t('common.count', "Frequency")}}} as any) : React.createElement(Empty, null)
          )
        )
      ),
      React.createElement(Row, { style: { marginTop: '20px' } },
           React.createElement(Col, { span: 24 },
               React.createElement(Card, { title: t('module.attendance.consecutiveAbsencesTitle', "Students with {threshold}+ Consecutive Absences", {threshold: CONSECUTIVE_ABSENCE_THRESHOLD}) },
                   studentsWithConsecutiveAbsencesList.length > 0 ? React.createElement(Table, { dataSource: studentsWithConsecutiveAbsencesList, columns: [ { title: t('common.studentName', 'Student Name'), render: (_:any, rec: StudentSummary & { calculatedConsecutiveAbsences?: number; calculatedAvgAttendanceRate?: number; }) => `${rec.firstName} ${rec.lastName}` }, { title: t('common.program', 'Program'), dataIndex: 'programName', key: 'programName' }, { title: t('module.attendance.consecutiveAbsences', 'Consecutive Absences'), dataIndex: 'calculatedConsecutiveAbsences', key: 'consecutiveAbsences', align: 'right', sorter:(a: StudentSummary & { calculatedConsecutiveAbsences?: number },b: StudentSummary & { calculatedConsecutiveAbsences?: number })=>(a.calculatedConsecutiveAbsences||0)-(b.calculatedConsecutiveAbsences||0) }, { title: t('module.attendance.avgAttendanceRate', 'Avg. Attendance'), dataIndex: 'calculatedAvgAttendanceRate', key: 'avgAttendance', render: (val?:number) => val !== undefined ? `${val.toFixed(1)}%` : 'N/A', align:'right', sorter:(a: StudentSummary & { calculatedAvgAttendanceRate?: number },b: StudentSummary & { calculatedAvgAttendanceRate?: number })=>(a.calculatedAvgAttendanceRate||0)-(b.calculatedAvgAttendanceRate||0) }, ], rowKey: "studentId", pagination: { pageSize: 5 }, size: "small" } as any) : React.createElement(Empty, {description: t('common.noStudentsMeetCriteria', "No students currently meet this criteria.")})
               )
           )
      ),

      // New Course/Class Specific Attendance Section
      React.createElement(Title, { level: 4, style: { marginTop: '30px' } }, t('module.attendance.courseSpecificTitle', "Course-Specific Attendance")),
      React.createElement(Row, { gutter: [16, 16], style: { marginTop: '10px' } },
        React.createElement(Col, { xs: 24, lg: 12 },
          React.createElement(Card, { title: t('module.attendance.avgAttendancePerCourseTitle', "Avg. Attendance Rate per Course (Lowest First)") },
            avgAttendancePerCourseData.length > 0 ? React.createElement(Bar, { data: avgAttendancePerCourseData.slice(0,10), xField: "rate", yField: "courseName", seriesField: "courseName", legend: false, barWidthRatio: 0.7, yAxis:{label:{autoEllipsis:true}}, xAxis:{min:0, max:100, title:{text: t('module.attendance.attendanceRatePercent', "Attendance Rate (%)")}, label: {formatter: (v: string | number)=>`${v}%`} }, tooltip:{formatter: (datum: { courseName: string; rate: number; }) => ({name: datum.courseName, value: `${datum.rate}%`})}} as any) : React.createElement(Empty, null)
          )
        ),
        React.createElement(Col, { xs: 24, lg: 12 },
          React.createElement(Card, { title: t('module.attendance.trendForSelectedCourseTitle', "Attendance Trend for Selected Course") },
            React.createElement(Select, { style: { width: '100%', marginBottom: '10px' }, placeholder: t('common.selectCourse', "Select a Course"), onChange: (value: string | null) => setSelectedCourseForTrend(value), allowClear: true, showSearch: true, optionFilterProp: "label", value: selectedCourseForTrend, options: uniqueCoursesForSelect }),
            selectedCourseForTrend && selectedCourseAttendanceTrend.length > 0 ? React.createElement(Line, { data: selectedCourseAttendanceTrend, xField: "week", yField: "rate", yAxis: { title: {text: t('module.attendance.attendanceRatePercent', "Attendance Rate (%)")}, min:0, max:100, label: {formatter: (v: string | number) => `${v}%`} }, xAxis:{title: {text: t('common.week', "Week (Start Date)")}}} as any) : React.createElement(Empty, { description: selectedCourseForTrend ? t('common.noDataAvailableForChart', 'No data for this course') : t('common.pleaseSelectCourse', 'Please select a course to see its trend.') })
          )
        )
      ),
      selectedCourseForTrend && React.createElement(Row, {style:{marginTop:'10px'}},
         React.createElement(Col, {span:24},
             React.createElement(Card, {title: t('module.attendance.studentAttendanceInCourseTitle', "Student Attendance in {courseName}", {courseName: uniqueCoursesForSelect.find(c=>c.value === selectedCourseForTrend)?.label || ''})},
                 studentAttendanceInSelectedCourseData.length > 0 ? React.createElement(Table, { dataSource: studentAttendanceInSelectedCourseData, columns: [ {title: t('common.studentName', 'Student Name'), dataIndex: 'studentName', key:'name'}, {title: t('common.program', 'Program'), dataIndex: 'programName', key:'prog'}, {title: t('module.attendance.attendanceRateInCourse', 'Attendance (%)'), dataIndex: 'attendanceRateInCourse', key:'rate', render:(r:number)=>`${r}%`, sorter:(a: { attendanceRateInCourse: number },b: { attendanceRateInCourse: number })=>a.attendanceRateInCourse-b.attendanceRateInCourse, align:'right'}, {title: t('module.attendance.absencesInCourse', 'Absences'), dataIndex: 'absencesInCourse', key:'abs', sorter:(a: { absencesInCourse: number },b: { absencesInCourse: number })=>a.absencesInCourse-b.absencesInCourse, align:'right'}, {title: t('module.attendance.latesInCourse', 'Lates'), dataIndex: 'latesInCourse', key:'late', sorter:(a: { latesInCourse: number },b: { latesInCourse: number })=>a.latesInCourse-b.latesInCourse, align:'right'}, ], rowKey:"studentId", pagination:{pageSize:5}, size:"small"}as any) : React.createElement(Empty, null)
             )
         )
      ),

      React.createElement(Title, { level: 4, style: { marginTop: '30px' } }, t('module.attendance.atRiskAnalysisTitle', "At-Risk Student Analysis")),
      React.createElement(Row, { gutter: [16, 16], style: { marginTop: '10px' } },
        React.createElement(Col, { xs: 24, lg: 12 },
          React.createElement(Card, { title: t('module.attendance.atRiskTrendTitle', "Trend of At-Risk Students (Weekly)") },
            atRiskTrendData.length > 0 ? React.createElement(Line, { data: atRiskTrendData, xField: "week", yField: "count", yAxis:{title: {text: t('common.countAtRisk', "Number of At-Risk Students")}}, xAxis:{title: {text: t('common.week', "Week (Start Date)")}}} as any) : React.createElement(Empty, { description: t('common.noTrendDataAvailable', "No trend data available for at-risk students.") })
          )
        ),
        React.createElement(Col, { xs: 24, lg: 12 },
          React.createElement(Card, { title: t('module.attendance.commonFactorsAtRiskTitle', "Top Courses with Absences/Lates by At-Risk Students") },
            commonFactorsAtRiskData.length > 0 ? React.createElement(Bar, { data: commonFactorsAtRiskData, xField: "count", yField: "courseName", seriesField: "courseName", legend: false, barWidthRatio: 0.6, yAxis:{label:{autoEllipsis:true}}, xAxis:{title: {text: t('common.countIssues', "No. of Absences/Lates from At-Risk Students")}}} as any) : React.createElement(Empty, { description: t('common.noCommonFactorsIdentified', "No common course factors identified for at-risk students.") })
          )
        )
      ),

      React.createElement(Card, { title: t('common.currentGlobalFilters', "Current Global Filters"), style: { marginTop: 30 } }, React.createElement(Descriptions, { bordered: true, column: 1, size: 'small', items: filterDescriptionItems }))
    )
  );
};

export default AttendanceEngagementModule;
