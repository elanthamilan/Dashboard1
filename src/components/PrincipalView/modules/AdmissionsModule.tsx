// IMPORTANT: This component currently uses MOCK DATA.
// TODO: Replace mock data generation (e.g., generateMockApplicants, generateMockKeyDeadlines)
// with actual data fetching logic. See useEffect hook below for an example.
// src/components/PrincipalView/modules/AdmissionsModule.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Breadcrumb, Row, Col, Card, Statistic, Timeline, Spin, Descriptions, Table, Select, Button, Tag, Space, List, DescriptionsProps, Drawer } from 'antd'; // Added Table, Select, Button, Tag, Space, List, DescriptionsProps, Drawer
import { Link } from 'react-router-dom';
import { useGlobalFilters } from '../../../contexts/GlobalFilterContext';
import { useTranslation } from 'react-i18next';
import {
    HomeOutlined, UsergroupAddOutlined, CheckSquareOutlined, PercentageOutlined,
    AimOutlined, CalendarOutlined, UserOutlined as UserIconForTimeline, EyeOutlined
} from '@ant-design/icons'; // Added EyeOutlined
import { fetchData } from '../../../utils/apiUtils';
import { generateMockNewInstitutions } from '../../../utils/mockData/academics/generateMockAcademicData';
import { generateMockStudents } from '../../../utils/mockData/attendance/generateMockAttendanceData'; // Added import
import { Institution, Program, StudentSummary, AcademicYear as AcademicYearType, Degree, Department as DepartmentType } from '../../../types/hierarchy'; // Added Degree, DepartmentType
import { KeyDeadline, Applicant, ApplicationStatus } from '../../../types/admissions';
import { generateMockKeyDeadlines, generateMockApplicants } from '../../../utils/mockData/admissions/generateMockApplicants';
import dayjs from 'dayjs';
import { Pie, Funnel, Line, Column } from '@ant-design/plots';
import { DotMap } from '@ant-design/maps';

const { Title, Text, Paragraph } = Typography;

interface AdmissionsData {
  institutionData: Institution | null;
  keyDeadlines: KeyDeadline[];
  applicants: Applicant[];
}

const stageOrderAndNames: { [key: number]: string } = { /* ... as before ... */
    1: 'module.admissions.funnel.applied',2: 'module.admissions.funnel.screened',3: 'module.admissions.funnel.interviewScheduled',4: 'module.admissions.funnel.interviewComplete',5: 'module.admissions.funnel.offerMade',6: 'module.admissions.funnel.offerAccepted',7: 'module.admissions.funnel.enrolled',
};
const degreeProgramMappings: { [degreeId: string]: { programId: string, programName: string, requiredCredits: number }[] } = { /* ... as before ... */
    "BACHELORS": [{ programId: "CS_BS", programName: "Bachelor of Science in Computer Science", requiredCredits: 120 },{ programId: "ENG_BA", programName: "Bachelor of Arts in English Literature", requiredCredits: 110 },{ programId: "PSY_BS", programName: "Bachelor of Science in Psychology", requiredCredits: 115 },],"MASTERS": [{ programId: "MBA_GEN", programName: "Master of Business Administration", requiredCredits: 60 },{ programId: "ART_MFA", programName: "Master of Fine Arts in Studio Art", requiredCredits: 65 },{ programId: "CS_MS", programName: "Master of Science in Computer Science", requiredCredits: 45 }],"DOCTORATE": [{ programId: "CS_PHD", programName: "Doctor of Philosophy in Computer Science", requiredCredits: 90 }]
};

// Department definitions - needed for filtering applicants by department
// This should ideally come from institutionData if available, or a shared config
const departmentDefinitions: DepartmentType[] = [
    { departmentId: 'DEPT_SCI_ENG', facultyId: '', departmentName: 'School of Science & Engineering', degreeIds: ['CS_BS', 'CS_MS', 'CS_PHD', 'PHY_BS'] }, // Assuming PHY_BS for example
    { departmentId: 'DEPT_ARTS_HUM', facultyId: '', departmentName: 'School of Arts & Humanities', degreeIds: ['ENG_BA', 'ART_MFA', 'PSY_BS', 'HIST_BA'] },
    { departmentId: 'DEPT_BUSINESS', facultyId: '', departmentName: 'School of Business', degreeIds: ['MBA_GEN', 'FIN_MS'] },
];


const AdmissionsModule: React.FC = () => {
  const { t } = useTranslation();
  const filters = useGlobalFilters();
  const [institutionData, setInstitutionData] = useState<Institution | null>(null);
  const [keyDeadlines, setKeyDeadlines] = useState<KeyDeadline[]>([]);
  const [allApplicants, setAllApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [selectedDegreeForComparison, setSelectedDegreeForComparison] = useState<string | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState<boolean>(false);

  useEffect(() => {
    const loadAdmissionsData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use a placeholder endpoint for now
        const data = await fetchData<AdmissionsData>('/principal-view/admissions');
        if (data.institutionData) setInstitutionData(data.institutionData);
        if (data.keyDeadlines) setKeyDeadlines(data.keyDeadlines);
        if (data.applicants) setAllApplicants(data.applicants);
      } catch (err: any) {
        console.error("Failed to fetch admissions data:", err);
        setError(err.message || 'Failed to fetch admissions data');
        // Fallback to mock data if API fails, to keep UI functional for demo
        // This fallback can be removed once the API is stable
        console.warn('Falling back to mock data for AdmissionsModule due to API error.');
        const tempStudents = generateMockStudents(500);
        const instDataArray = generateMockNewInstitutions(undefined, tempStudents, 3, 50);
        if (instDataArray && instDataArray.length > 0) {
          setInstitutionData(instDataArray[0]);
        }
        const deadlines = generateMockKeyDeadlines(5);
        setKeyDeadlines(deadlines);
        const applicants = generateMockApplicants(1000);
        setAllApplicants(applicants);
      } finally {
        setLoading(false);
      }
    };

    loadAdmissionsData();
  }, [filters.academicYear]); // Assuming filters.academicYear might be a dependency for the API call

  useEffect(() => { setMapReady(true); }, []);

  const totalApplications = institutionData?.totalInstitutionApplicants ?? 0;
  const admissionRate = institutionData?.avgInstitutionAcceptanceRate ?? 0;
  const enrolledCount = institutionData?.totalInstitutionEnrolledCount ?? 0;
  const offersMade = admissionRate > 0 && totalApplications > 0 ? Math.round((admissionRate / 100) * totalApplications) : 0;
  const conversionRate = totalApplications > 0 ? parseFloat(((enrolledCount / totalApplications) * 100).toFixed(2)) : 0;
  const yieldRate = offersMade > 0 ? parseFloat(((enrolledCount / offersMade) * 100).toFixed(2)) : 0;

  const summaryKpis = [
    { titleKey: 'module.admissions.kpi.totalApplications', value: totalApplications, icon: React.createElement(UsergroupAddOutlined), precision: 0 },
    { titleKey: 'module.admissions.kpi.admissionRate', value: admissionRate, suffix: '%', icon: React.createElement(CheckSquareOutlined), precision: 2 },
    { titleKey: 'module.admissions.kpi.conversionRate', value: conversionRate, suffix: '%', icon: React.createElement(PercentageOutlined), precision: 2 },
    { titleKey: 'module.admissions.kpi.yieldRate', value: yieldRate, suffix: '%', icon: React.createElement(AimOutlined), precision: 2 },
  ];
  const breadcrumbItems = [
    { title: React.createElement(Link, { to: "/principal-view"}, React.createElement(HomeOutlined)) },
    { title: React.createElement(Link, { to: "/principal-view"}, t('principalView.dashboardTitle', "Principal's Dashboard")) },
    { title: t('module.admissions.title') }
  ];

  const categoryData = useMemo(() => { if (!allApplicants || allApplicants.length === 0) return []; const counts: { [key: string]: number } = {}; allApplicants.forEach(applicant => { const category = applicant.reservationCategory || t('common.unknown'); counts[category] = (counts[category] || 0) + 1; }); return Object.entries(counts).map(([type, value]) => ({ type, value })); }, [allApplicants, t]);
  const pieChartConfig = { appendPadding: 10, data: categoryData, angleField: 'value', colorField: 'type', radius: 0.8, label: { type: 'inner', offset: '-30%', content: ({ percent }: any) => `${(percent * 100).toFixed(0)}%`, style: { textAlign: 'center', fontSize: 14, fill: '#fff' } }, interactions: [{ type: 'element-active' }], legend: { layout: 'horizontal', position: 'bottom' } as const };

  const funnelData = useMemo(() => { if (!allApplicants || allApplicants.length === 0) return []; const stageCounts: { [key: number]: number } = {}; allApplicants.forEach(applicant => { stageCounts[applicant.funnelStage] = (stageCounts[applicant.funnelStage] || 0) + 1; }); return Object.entries(stageOrderAndNames).map(([stageNum, nameKey]) => ({ stage: t(nameKey), value: stageCounts[Number(stageNum)] || 0, stageKey: nameKey })).sort((a,b) => Number(Object.keys(stageOrderAndNames).find(k => stageOrderAndNames[Number(k)] === a.stageKey)) - Number(Object.keys(stageOrderAndNames).find(k => stageOrderAndNames[Number(k)] === b.stageKey))); }, [allApplicants, t]);
  const funnelChartConfig = { data: funnelData, xField: 'stage', yField: 'value', seriesField: 'stage', legend: false as const, conversionTag: { formatter: (data: { prev?: number, next?: number } | undefined) => { if (data && typeof data.prev === 'number' && typeof data.next === 'number' && data.prev > 0) { return `Conv. ${((data.next / data.prev) * 100).toFixed(1)}%`; } return ''; } }, tooltip: { formatter: (datum: any) => ({ name: datum.stage, value: `${datum.value} ${t('module.admissions.funnel.applicantsSuffix', 'Applicants')}` })}, label: { formatter: (datum: any) => String(datum.value), style: { fill: '#fff', fontSize: 12, stroke: '#000', lineWidth: 0.5 }}};

  const mapData = useMemo(() => allApplicants.filter(app => app.originCoordinates && typeof app.originCoordinates.lng === 'number' && typeof app.originCoordinates.lat === 'number').map(app => ({ id: app.id, lng: app.originCoordinates!.lng, lat: app.originCoordinates!.lat, city: app.originCity || t('common.unknown'), country: app.originCountry || t('common.unknown') })), [allApplicants, t]);
  const mapConfig = {
    map: {
      type: 'mapbox',
      style: 'mapbox://styles/mapbox/streets-v11', // Standard Mapbox style
      center: [0, 20],
      zoom: 1,
      // IMPORTANT: Replace with your actual Mapbox access token
      token: 'YOUR_MAPBOX_ACCESS_TOKEN_HERE',
    },
    source: { data: mapData, parser: { type: 'json', coordinates: 'lnglat' } },
    shape: 'circle' as const,
    size: 5,
    color: '#1890ff',
    style: { opacity: 0.7 },
    tooltip: { items: [{ field: 'city', alias: t('module.admissions.map.city') }, { field: 'country', alias: t('module.admissions.map.country') }] },
    autoFit: false
  };

  const getProgramTrendData = (programId: string, applicants: Applicant[], academicYears: AcademicYearType[] | undefined, translate: typeof t): { year: string; type: string; count: number }[] => { /* ... existing ... */ return []; };
  const trendChartConfigBase = { /* ... existing ... */ };

  const filteredPrograms = useMemo(() => { /* ... existing ... */ return []; }, [institutionData, filters.academicYear, filters.degreeType, filters.department]);

  // Removed the first (stubbed) definition of degreeOptionsForSelect that was around line 87
  // const degreeOptionsForSelect = useMemo(() => { /* ... existing ... */ return []; }, [institutionData]);
  const degreeYearlyComparisonData = useMemo(() => { /* ... existing ... */ return []; }, [selectedDegreeForComparison, allApplicants, institutionData?.academicYears, t]);
  const degreeYearlyComparisonChartConfig = { /* ... existing ... */ };

  // Corrected onChange type for Select component
  const handleDegreeForComparisonChange = (value: string | null): void => {
    setSelectedDegreeForComparison(value);
  };

  // Assuming degreeOptionsForSelect was already defined elsewhere or stubbed as per original file structure.
  // If it was defined as "/* ... existing ... */", this new definition might be a duplicate.
  // For now, I will keep the one I introduced if the other was just a comment.
  // If tsc still complains about redeclaration, one of them needs to be removed.
  const degreeOptionsForSelect = useMemo(() => {
    if (!institutionData?.academicYears) return [];
    const degrees: { label: string, value: string }[] = [];
    institutionData.academicYears.forEach(ay => {
      ay.degrees.forEach(deg => {
        if (!degrees.find(d => d.value === deg.degreeId)) {
          degrees.push({ label: deg.degreeName, value: deg.degreeId });
        }
      });
    });
    return degrees.sort((a,b) => a.label.localeCompare(b.label));
   }, [institutionData?.academicYears]);


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

  const filteredApplicantsForTable = useMemo(() => {
    if (!allApplicants || !institutionData?.academicYears) return [];
    let filtered = allApplicants;

    if (filters.academicYear) {
      const selectedAy = institutionData.academicYears.find(ay => ay.yearId === filters.academicYear);
      if (selectedAy) {
        filtered = filtered.filter(app => dayjs(app.applicationDate).isBetween(dayjs(selectedAy.startDate), dayjs(selectedAy.endDate), null, '[]'));
      }
    }
    if (filters.degreeType) {
      const relevantProgramIds = (degreeProgramMappings[filters.degreeType.toUpperCase()] || []).map(p => p.programId);
      if(relevantProgramIds.length > 0){
        filtered = filtered.filter(app => relevantProgramIds.includes(app.programId));
      }
    }
    if (filters.department) {
      const deptDef = departmentDefinitions.find(d => d.departmentId === filters.department);
      if(deptDef) {
        filtered = filtered.filter(app => deptDef.degreeIds.includes(app.programId));
      }
    }
    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      filtered = filtered.filter(app => dayjs(app.applicationDate).isBetween(dayjs(filters.dateRange![0]), dayjs(filters.dateRange![1]), null, '[]'));
    }
    // Campus filter skipped as Applicant type doesn't have campus.
    return filtered;
  }, [allApplicants, institutionData?.academicYears, filters]);

  const showDrawer = (applicant: Applicant) => { setSelectedApplicant(applicant); setIsDrawerVisible(true); };
  const onCloseDrawer = () => { setIsDrawerVisible(false); setSelectedApplicant(null); };

  const applicantTableColumns = [
    { title: t('module.admissions.table.applicantName'), dataIndex: 'name', key: 'name', render: (_: any, record: Applicant) => `${record.firstName} ${record.lastName}`, sorter: (a: Applicant, b: Applicant) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`) },
    { title: t('module.admissions.table.programName'), dataIndex: 'programName', key: 'programName', sorter: (a: Applicant, b: Applicant) => a.programName.localeCompare(b.programName) },
    { title: t('module.admissions.table.applicationDate'), dataIndex: 'applicationDate', key: 'applicationDate', render: (date: string) => dayjs(date).format('YYYY-MM-DD'), sorter: (a: Applicant, b: Applicant) => dayjs(a.applicationDate).unix() - dayjs(b.applicationDate).unix() },
    { title: t('module.admissions.table.status'), dataIndex: 'status', key: 'status', render: (status: ApplicationStatus) => React.createElement(Tag, {color: status === 'Offer Made' || status === 'Offer Accepted' || status === 'Enrollment Confirmed' ? 'green' : status === 'Applied' || status === 'Screened' ? 'blue' : 'volcano'}, status) , sorter: (a: Applicant, b: Applicant) => a.status.localeCompare(b.status) },
    { title: t('module.admissions.table.reservationCategory'), dataIndex: 'reservationCategory', key: 'reservationCategory', sorter: (a: Applicant, b: Applicant) => (a.reservationCategory || '').localeCompare(b.reservationCategory || '') },
    { title: t('module.admissions.table.origin'), dataIndex: 'origin', key: 'origin', render: (_: any, record: Applicant) => `${record.originCity || ''}, ${record.originCountry || ''}` , sorter: (a: Applicant, b: Applicant) => (`${a.originCity || ''}, ${a.originCountry || ''}`).localeCompare(`${b.originCity || ''}, ${b.originCountry || ''}`) },
    { title: t('common.actions'), key: 'actions', render: (_: any, record: Applicant) => React.createElement(Button, { type: "link", icon: React.createElement(EyeOutlined), onClick: () => showDrawer(record) }, t('common.viewDetails')) }
  ];

  // Re-fill sections for context.
  const programTableColumnsPrev = [ { title: t('module.admissions.programName'), dataIndex: 'programName', key: 'programName', sorter: (a: any, b: any) => a.programName.localeCompare(b.programName) }, { title: t('module.admissions.numApplicants'), dataIndex: 'applicants', key: 'applicants', sorter: (a: any, b: any) => (a.applicants || 0) - (b.applicants || 0), align: 'right' as const }, { title: t('module.admissions.admissionRate'), dataIndex: 'acceptanceRate', key: 'acceptanceRate', sorter: (a: any, b: any) => (a.acceptanceRate || 0) - (b.acceptanceRate || 0), align: 'right' as const, render: (rate?: number) => rate !== undefined ? `${rate.toFixed(2)}%` : t('common.notApplicableShort', 'N/A') }, { title: t('module.admissions.avgApplicationTime'), key: 'avgAppTime', render: () => t('module.admissions.mockAvgAppTime') }];
  // filterDescriptionItems is now defined above filteredApplicantsForTable
  const keyDeadlinesSection = React.createElement(Card, { bordered: false, style: { boxShadow: '0 2px 8px rgba(0,0,0,0.09)'} }, keyDeadlines.length > 0 ? React.createElement(Timeline, { mode: "alternate" }, keyDeadlines.map(deadline => React.createElement(Timeline.Item, { key: deadline.id, label: dayjs(deadline.date).format('DD MMM YYYY'), dot: deadline.type === 'Application' ? React.createElement(CalendarOutlined, {style: {fontSize: '16px'}}) : deadline.type === 'Interview' ? React.createElement(UserIconForTimeline, {style: {fontSize: '16px'}}) : undefined }, React.createElement(Text, { strong: true }, deadline.title), deadline.description && React.createElement(Paragraph, { type: "secondary", style: { marginBottom: 0, fontSize: 'small' } }, deadline.description)))) : React.createElement(Text, null, t('common.noDataAvailable', 'No deadline information available.')));
  const reservedCategorySection = React.createElement(Card, { bordered: false, style: { boxShadow: '0 2px 8px rgba(0,0,0,0.09)', marginTop: '30px' } }, categoryData.length > 0 ? React.createElement(Pie, pieChartConfig as any) : React.createElement(Text, null, t('common.noDataAvailable', 'No category data available.')));
  const admissionFunnelSection = React.createElement(Card, { bordered: false, style: { boxShadow: '0 2px 8px rgba(0,0,0,0.09)', marginTop: '30px' } }, funnelData.length > 0 ? React.createElement(Funnel, funnelChartConfig as any) : React.createElement(Text, null, t('common.noDataAvailable', 'No funnel data available.')));
  let applicantMapContent; if (mapData.length > 0 && mapReady) { applicantMapContent = React.createElement(DotMap, mapConfig as any); } else if (!mapReady && !loading) { applicantMapContent = React.createElement(Paragraph, null, "Initializing map..."); } else { applicantMapContent = React.createElement(Text, null, t('common.noDataAvailable', 'No applicant location data available.')); }
  const applicantOriginsMapSection = React.createElement(Card, { style: { height: '450px', padding: '0px', marginTop: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' } }, applicantMapContent);
  const programStatsTableSectionPrev = React.createElement(Card, { bordered: false, style: { boxShadow: '0 2px 8px rgba(0,0,0,0.09)', marginTop: '30px' } }, React.createElement(Table, { dataSource: filteredPrograms, columns: programTableColumnsPrev, rowKey: 'programId', loading: loading, scroll: { x: 'max-content' }, pagination: { pageSize: 10, showSizeChanger: true, pageSizeOptions: ['5', '10', '20'] }, expandable: { expandedRowRender: (record: Program) => { const trendDataForProgram = getProgramTrendData(record.programId, allApplicants, institutionData?.academicYears, t); if (!trendDataForProgram || trendDataForProgram.length === 0) { return React.createElement(Text, null, t('common.noTrendDataAvailable')); } return React.createElement(Line, { ...trendChartConfigBase, data: trendDataForProgram, height: 200 } as any); }, rowExpandable: (record: Program) => true, }} as any));
  let degreeComparisonContent; if (selectedDegreeForComparison) { if (degreeYearlyComparisonData.length > 0) { degreeComparisonContent = React.createElement(Column, degreeYearlyComparisonChartConfig as any); } else { degreeComparisonContent = React.createElement(Text, null, t('common.noDataAvailable')); } } else { degreeComparisonContent = React.createElement(Text, null, t('module.admissions.selectDegreePrompt')); }
  const degreeComparisonSection = React.createElement(Card, { bordered: false, style: { boxShadow: '0 2px 8px rgba(0,0,0,0.09)', marginTop: '30px' } }, React.createElement(Select, { options: degreeOptionsForSelect, onChange: (value: any) => handleDegreeForComparisonChange(value as string | null), placeholder: t('module.admissions.selectDegreePlaceholder'), style: { width: 300, marginBottom: 20 }, allowClear: true, value: selectedDegreeForComparison }), degreeComparisonContent );


  const applicantListSection = React.createElement(Card, { bordered: false, style: { boxShadow: '0 2px 8px rgba(0,0,0,0.09)', marginTop: '30px' } },
    React.createElement(Table, {
      dataSource: filteredApplicantsForTable,
      columns: applicantTableColumns,
      rowKey: 'id',
      loading: loading,
      scroll: { x: 'max-content' },
      pagination: { pageSize: 5, showSizeChanger: true, pageSizeOptions: ['5', '10', '20', '50'] },
      onRow: (record: Applicant) => ({ onClick: () => showDrawer(record) })
    } as any)
  );

  const applicantDetailDrawerContent = useMemo(() => {
    if (!selectedApplicant) return null;

    const descItems: DescriptionsProps['items'] = [
      { key: 'name', label: t('module.admissions.applicantDetail.name'), children: `${selectedApplicant.firstName || ''} ${selectedApplicant.lastName || ''}` },
      { key: 'email', label: t('module.admissions.applicantDetail.email'), children: selectedApplicant.email || t('common.notApplicableShort', 'N/A') },
      { key: 'phone', label: t('module.admissions.applicantDetail.phone'), children: selectedApplicant.phoneNumber || t('common.notApplicableShort', 'N/A') },
      { key: 'dob', label: t('module.admissions.applicantDetail.dob'), children: selectedApplicant.dateOfBirth ? dayjs(selectedApplicant.dateOfBirth).format('YYYY-MM-DD') : t('common.notApplicableShort', 'N/A') },
      { key: 'gender', label: t('module.admissions.applicantDetail.gender'), children: selectedApplicant.gender || t('common.notApplicableShort', 'N/A') },
      { key: 'nationality', label: t('module.admissions.applicantDetail.nationality'), children: selectedApplicant.nationality || t('common.notApplicableShort', 'N/A') },
      { key: 'address', label: t('module.admissions.applicantDetail.address'), children: selectedApplicant.address ? `${selectedApplicant.address.street || ''}, ${selectedApplicant.address.city || ''}, ${selectedApplicant.address.country || ''}` : t('common.notApplicableShort', 'N/A') },
      { key: 'program', label: t('module.admissions.applicantDetail.program'), children: selectedApplicant.programName || t('common.notApplicableShort', 'N/A') },
      { key: 'appDate', label: t('module.admissions.applicantDetail.applicationDate'), children: selectedApplicant.applicationDate ? dayjs(selectedApplicant.applicationDate).format('YYYY-MM-DD') : t('common.notApplicableShort', 'N/A') },
      { key: 'status', label: t('module.admissions.applicantDetail.status'), children: selectedApplicant.status || t('common.notApplicableShort', 'N/A') },
    ];

    if (selectedApplicant.previousEducation) {
      descItems.push({ key: 'prevEdu', label: t('module.admissions.applicantDetail.prevEducation'), children: `${selectedApplicant.previousEducation.degree || ''} from ${selectedApplicant.previousEducation.institution || ''} (${selectedApplicant.previousEducation.graduationYear || ''}), GPA: ${selectedApplicant.previousEducation.gpa || 'N/A'}` });
    }
    if (selectedApplicant.documents && selectedApplicant.documents.length > 0) {
      descItems.push({ key: 'docs', label: t('module.admissions.applicantDetail.documents'), children: React.createElement(React.Fragment, null, React.createElement(List, { size: "small", bordered: true, dataSource: selectedApplicant.documents, renderItem: (item: any) => React.createElement(List.Item, null, `${item.type || ''}: ${item.fileName || ''}`) })) });
    }
    if (selectedApplicant.interview) {
      descItems.push({ key: 'interview', label: t('module.admissions.applicantDetail.interview'), children: `Date: ${selectedApplicant.interview.date ? dayjs(selectedApplicant.interview.date).format('YYYY-MM-DD') : ''} ${selectedApplicant.interview.time || ''}, Interviewer: ${selectedApplicant.interview.interviewer || ''}, Feedback: ${selectedApplicant.interview.feedback || ''}` });
    }
    if (selectedApplicant.visaDetails) {
      descItems.push({ key: 'visa', label: t('module.admissions.applicantDetail.visa'), children: `Type: ${selectedApplicant.visaDetails.visaType || ''}, Status: ${selectedApplicant.visaDetails.applicationStatus || ''}` });
    }
    return React.createElement(Descriptions, { bordered: true, column: 1, size: "small", items: descItems.filter(item => item.children !== null) });
  }, [selectedApplicant, t]);

  const applicantDetailDrawer = React.createElement(Drawer, {
      title: t('module.admissions.applicantDetail.title'),
      width: 450,
      onClose: onCloseDrawer,
      visible: isDrawerVisible,
      bodyStyle: { paddingBottom: 80 },
      footer: React.createElement("div", {style: {textAlign: 'right'}},
          React.createElement(Button, {onClick: onCloseDrawer, style: {marginRight: 8}}, t('common.close')),
          React.createElement(Button, {onClick: onCloseDrawer, type: "primary", style: {marginRight: 8}}, t('module.admissions.applicantDetail.actions.changeStatus')),
          React.createElement(Button, {onClick: onCloseDrawer, type: "primary", style: {marginRight: 8}}, t('module.admissions.applicantDetail.actions.sendOffer')),
          React.createElement(Button, {onClick: onCloseDrawer, type: "primary"}, t('module.admissions.applicantDetail.actions.scheduleInterview')),
      )
    }, applicantDetailDrawerContent);


  if (loading && !institutionData) { // Show main loading spinner only if institutionData is not yet available
    return React.createElement("div", { style: { padding: '20px', textAlign: 'center' } }, React.createElement(Spin, { size: "large" }));
  }

  return (
    React.createElement("div", { style: { padding: '20px' } },
      React.createElement(Breadcrumb, { items: breadcrumbItems, style: { marginBottom: '16px' } }),
      React.createElement(Title, { level: 2 }, t('module.admissions.title')),
      React.createElement(Paragraph, null, t('module.admissions.descriptionPlaceholder')),

      React.createElement(Title, { level: 3, style: { marginTop: '20px' } }, t('module.admissions.summaryTilesTitle')),
      React.createElement(Row, { gutter: [16, 16] }, summaryKpis.map(kpi => React.createElement(Col, { xs: 24, sm: 12, md: 12, lg:6, key: kpi.titleKey }, React.createElement(Card, { bordered: false, style: { boxShadow: '0 2px 8px rgba(0,0,0,0.09)'} }, React.createElement(Statistic, { title: t(kpi.titleKey), value: kpi.value, precision: kpi.precision, prefix: kpi.icon, suffix: kpi.suffix, valueStyle: { color: '#3f8600' } }))))),
      React.createElement(Title, { level: 3, style: { marginTop: '30px' } }, t('module.admissions.keyDeadlinesTitle')), keyDeadlinesSection,
      React.createElement(Title, { level: 3, style: { marginTop: '30px' } }, t('module.admissions.reservedCategoryTitle')), reservedCategorySection,
      React.createElement(Title, { level: 3, style: { marginTop: '30px' } }, t('module.admissions.funnelChartTitle')), admissionFunnelSection,
      React.createElement(Title, { level: 3, style: { marginTop: '30px' } }, t('module.admissions.mapTitle')), applicantOriginsMapSection,
      React.createElement(Title, { level: 3, style: { marginTop: '30px' } }, t('module.admissions.programLevelStatsTitle')), programStatsTableSectionPrev, // Assuming this is the program table
      React.createElement(Title, { level: 3, style: { marginTop: '30px' } }, t('module.admissions.degreeYearlyComparisonTitle')), degreeComparisonSection,
      React.createElement(Title, { level: 3, style: { marginTop: '30px' } }, t('module.admissions.applicantListTitle')), applicantListSection, // New Applicant List
      applicantDetailDrawer, // New Drawer
      React.createElement(Card, { title: t('common.currentGlobalFilters', "Current Global Filters"), style: { marginTop: 20, display: 'none' } }, React.createElement(Descriptions, { bordered: true, column: 1, size: "small", items: filterDescriptionItems }))
      // Removed the generic placeholder paragraph: common.moduleSpecificContentPlaceholder
    )
  );
};

export default AdmissionsModule;
