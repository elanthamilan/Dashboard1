import React, { useEffect, useState } from 'react';
import { Typography, Breadcrumb, Card, Descriptions, Spin, List, Button, Form, Input, InputNumber, DatePicker, Select, Empty, Table, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import { useGlobalFilters } from '../../../contexts/GlobalFilterContext';
import { useTranslation } from 'react-i18next';
import { HomeOutlined } from '@ant-design/icons';
import { fetchData } from '../../../utils/apiUtils';
import dayjs from 'dayjs';
import { Pie, Column, Line } from '@ant-design/plots'; // Added Pie, Column, Line

const { Title, Paragraph, Text } = Typography;

const MODULE_KEY = 'customReports';

interface ReportParameter {
  id: string;
  name: string;
  type: 'date' | 'text' | 'number' | 'select' | 'daterange';
  options?: Array<{ label: string; value: string | number }>;
  defaultValue?: string | number | [string, string];
  required?: boolean;
}

interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  parameters: ReportParameter[];
}

interface TabularReportData {
  columns: Array<{ title: string; dataIndex: string; key: string; sorter?: boolean | object; render?: (text: any, record: any, index: number) => React.ReactNode; }>;
  rows: Array<Record<string, any>>;
}

interface ChartReportData {
  type: 'Bar' | 'Line' | 'Pie' | 'Column';
  config: any;
}

interface GeneratedReport {
  reportDefinitionId: string;
  title: string;
  generatedAt: string;
  parametersUsed?: Record<string, any>;
  content: Array<{type: 'table', data: TabularReportData} | {type: 'chart', data: ChartReportData}>;
}

interface CustomReportModuleState {
  availableReports: ReportDefinition[];
  selectedReportDefinition: ReportDefinition | null;
  reportParameters: Record<string, any>;
  generatingReport: boolean;
  generatedReport: GeneratedReport | null;
  message?: string;
  error?: string | null; // Added error to moduleState for generation errors
}

const CustomReportsModule: React.FC = () => {
  const { t } = useTranslation();
  const filters = useGlobalFilters();

  const [moduleState, setModuleState] = useState<CustomReportModuleState>({
    availableReports: [],
    selectedReportDefinition: null,
    reportParameters: {},
    generatingReport: false,
    generatedReport: null,
    message: undefined,
    error: null,
  });
  const [loading, setLoading] = useState<boolean>(true); // For initial list load
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null); // Separate error for initial load

  const handleReportSelect = (reportDef: ReportDefinition | null) => {
    if (reportDef) {
      const initialParams: Record<string, any> = {};
      reportDef.parameters.forEach(p => {
        if (p.defaultValue !== undefined) {
          initialParams[p.id] = p.defaultValue;
        } else if (p.type === 'daterange') {
          initialParams[p.id] = [null, null];
        } else {
          initialParams[p.id] = undefined;
        }
      });
      setModuleState(prev => ({
        ...prev,
        selectedReportDefinition: reportDef,
        reportParameters: initialParams,
        generatedReport: null,
        generatingReport: false,
        error: null, // Clear errors when selecting a new report
      }));
    } else {
      setModuleState(prev => ({
        ...prev,
        selectedReportDefinition: null,
        reportParameters: {},
        generatedReport: null,
        generatingReport: false,
        error: null,
      }));
    }
  };

  const handleParameterChange = (paramId: string, value: any) => {
    setModuleState(prev => ({
      ...prev,
      reportParameters: {
        ...prev.reportParameters,
        [paramId]: value,
      },
    }));
  };

  const handleGenerateReport = async () => {
    if (!moduleState.selectedReportDefinition) return;

    setModuleState(prev => ({
      ...prev,
      generatingReport: true,
      generatedReport: null,
      error: null,
    }));

    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

    // Make faker available
    const F = await import('@faker-js/faker');
    const { faker } = F;

    // Mock selectable options if not available from a broader context (for report parameter defaults)
    const mockDepartmentsForSelect = [
        { label: t('common.departments.computerScience', 'Computer Science'), value: 'DEPT_CS' },
        { label: t('common.departments.physics', 'Physics'), value: 'DEPT_PHY' },
        { label: t('common.departments.mathematics', 'Mathematics'), value: 'DEPT_MATH' },
    ];
    const mockCoursesForSelect = [
        { label: t('courses.cs101', 'CS101 - Intro to Programming'), value: 'CRS_CS101' },
        { label: t('courses.phy202', 'PHY202 - Quantum Mechanics'), value: 'CRS_PHY202' },
        { label: t('courses.math301', 'MATH301 - Advanced Calculus'), value: 'CRS_MATH301' },
    ];


    try {
      const reportDef = moduleState.selectedReportDefinition;
      const params = moduleState.reportParameters;
      let generatedContent: Array<{type: 'table', data: TabularReportData, title?:string} | {type: 'chart', data: ChartReportData, title?:string}> = [];

      if (reportDef.id === 'rep1') {
        generatedContent.push({
          type: 'table',
          data: {
            columns: [
              { title: t('common.program', 'Program'), dataIndex: 'programName', key: 'programName' },
              { title: t('common.status', 'Status'), dataIndex: 'status', key: 'status' },
              { title: t('common.count', 'Count'), dataIndex: 'count', key: 'count', sorter: (a,b) => a.count - b.count },
            ],
            rows: [
              { key: '1', programName: 'B.S. Computer Science', status: params.status === 'ENR' ? 'Enrolled' : 'Dropped', count: params.status === 'ENR' ? Math.floor(Math.random() * 100) + 50 : Math.floor(Math.random() * 20) },
              { key: '2', programName: 'Master of Business Admin', status: params.status === 'ENR' ? 'Enrolled' : 'Dropped', count: params.status === 'ENR' ? Math.floor(Math.random() * 50) + 20 : Math.floor(Math.random() * 10) },
            ].filter(r => params.academicYear ? true : false),
          }
        });
        generatedContent.push({
          type: 'chart',
          data: {
            type: 'Column',
            config: {
              data: generatedContent[0].data.rows.map(r => ({ type: r.programName, value: r.count })),
              xField: 'type',
              yField: 'value',
              seriesField: 'type',
              isGroup: true,
              columnStyle: { radiusTopLeft: 10, radiusTopRight: 10 },
              meta: { type: { alias: t('common.program','Program') }, value: { alias: t('common.count','Count') } },
            }
          }
        });
      } else if (reportDef.id === 'rep2') {
        generatedContent.push({
          type: 'table',
          data: {
            columns: [
              { title: t('common.category', 'Category'), dataIndex: 'category', key: 'category' },
              { title: t('common.amount', 'Amount'), dataIndex: 'amount', key: 'amount', render: (val) => `$${Number(val).toLocaleString()}` },
            ],
            rows: [
              { key: '1', category: 'Tuition Fees Collected', amount: Math.floor(Math.random() * 50000) + 20000 },
              { key: '2', category: 'Hostel Fees Collected', amount: Math.floor(Math.random() * 20000) + 5000 },
              { key: '3', category: 'Outstanding Fees', amount: Math.floor(Math.random() * 10000) + 1000 },
            ],
          }
        });
         generatedContent.push({
          type: 'chart',
          data: {
              type: 'Pie',
              config: {
                  data: generatedContent[0].data.rows.filter(r => r.category !== 'Outstanding Fees').map(r => ({ type: r.category, value: r.amount })),
                  angleField: 'value',
                  colorField: 'type',
                  radius: 0.75,
                  label: { type: 'inner', offset: '-50%', content: '{value:$.2s}', style:{textAlign:'center', fontSize:12, fill:'#fff'}},
                  legend: {position: 'bottom'},
                  tooltip: { formatter: (datum) => ({ name: datum.type, value: `$${Number(datum.value).toLocaleString()}` }) }
              }
          },
          title: t('reportTitles.feeCollectionBreakdown', "Fee Collection Breakdown")
        });
      } else if (reportDef.id === 'rep3') { // Faculty Workload Summary by Department
        const deptParam = params.departmentId || mockDepartmentsForSelect[0]?.value || 'DEPT_CS';
        const deptName = mockDepartmentsForSelect.find(d=>d.value === deptParam)?.label || 'Selected Department';

        const facultyForDept: any[] = [];
        const designations = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'];
        const teachingLoadBuckets = ['<5 Credits', '5-8 Credits', '9-12 Credits', '>12 Credits'];
        for(let i=0; i<faker.number.int({min:5, max:15}); i++){
            facultyForDept.push({
                key: `fac${i}`,
                name: faker.person.fullName(),
                designation: faker.helpers.arrayElement(designations),
                teachingLoadCredits: faker.number.int({min:3, max:15}),
                adviseeCount: faker.number.int({min:0, max:10}),
                publicationsCount: faker.number.int({min:0, max:20})
            });
        }

        generatedContent.push({
            type: 'table',
            data: {
                columns: [
                    { title: t('common.facultyName', "Faculty Name"), dataIndex: 'name', key: 'name' },
                    { title: t('common.designation', "Designation"), dataIndex: 'designation', key: 'designation' },
                    { title: t('common.teachingLoad', "Teaching Load (Credits)"), dataIndex: 'teachingLoadCredits', key: 'load', align:'right' },
                    { title: t('common.advisees', "Advisees"), dataIndex: 'adviseeCount', key: 'advisees', align:'right' },
                    { title: t('common.publications', "Publications"), dataIndex: 'publicationsCount', key: 'pubs', align:'right' },
                ],
                rows: facultyForDept,
            },
            title: t('reportTitles.facultyWorkloadInDept', "Faculty Workload in {deptName}", {deptName})
        });
        generatedContent.push({
            type: 'chart',
            data: {
                type: 'Pie',
                config: {
                    data: facultyForDept.reduce((acc, fac) => {
                        const des = acc.find(d => d.type === fac.designation);
                        if(des) des.value++; else acc.push({type: fac.designation, value: 1});
                        return acc;
                    }, [] as {type:string, value:number}[]),
                    angleField: 'value', colorField: 'type', radius: 0.7, legend: {position:'bottom'},
                    label: { type: 'inner', offset: '-30%', content: '{percentage}', style:{fill:'#fff'} },
                    tooltip: { formatter: (d:any) => ({name:d.type, value: d.value}) }
                }
            },
            title: t('reportTitles.designationDistribution', "Designation Distribution in {deptName}", {deptName})
        });
         generatedContent.push({
            type: 'chart',
            data: {
                type: 'Column',
                config: {
                    data: facultyForDept.reduce((acc, fac) => {
                        let bucket = teachingLoadBuckets[3];
                        if(fac.teachingLoadCredits < 5) bucket = teachingLoadBuckets[0];
                        else if (fac.teachingLoadCredits <= 8) bucket = teachingLoadBuckets[1];
                        else if (fac.teachingLoadCredits <= 12) bucket = teachingLoadBuckets[2];
                        const b = acc.find(d => d.type === bucket);
                        if(b) b.value++; else acc.push({type: bucket, value: 1});
                        return acc;
                    }, [] as {type:string, value:number}[]),
                    xField: 'type', yField: 'value', seriesField:'type', legend:false,
                    yAxis: {title: {text: t('common.numberOfFaculty', "No. of Faculty")}},
                    xAxis: {title: {text: t('common.teachingLoad', "Teaching Load (Credits)")}}
                }
            },
            title: t('reportTitles.teachingLoadDistribution', "Teaching Load Distribution in {deptName}", {deptName})
        });
    } else if (reportDef.id === 'rep4') { // Course Performance Overview
        const courseParam = params.courseId || mockCoursesForSelect[0]?.value || 'CRS_101';
        const courseName = mockCoursesForSelect.find(c=>c.value === courseParam)?.label || 'Selected Course';

        generatedContent.push({
            type: 'table',
            data: {
                columns: [ {title: t('common.metric','Metric'), dataIndex:'metric', key:'metric'}, {title:t('common.value','Value'), dataIndex:'value', key:'value'} ],
                rows: [
                    {key:'1', metric: t('common.totalEnrolled', "Total Enrolled (All Time)"), value: faker.number.int({min:50, max:300})},
                    {key:'2', metric: t('common.avgGradePoints', "Average Grade (Points)"), value: faker.number.float({min:2.5, max:3.8, precision:2}).toFixed(2)},
                    {key:'3', metric: t('common.passRatePercent', "Overall Pass Rate (%)"), value: `${faker.number.int({min:70, max:95})}%`},
                ]
            },
            title: t('reportTitles.keyStatsForCourse', "Key Stats for {courseName}", {courseName})
        });
        const grades = ['A','B','C','D','F','W'];
        generatedContent.push({
            type: 'chart',
            data: {
                type: 'Column',
                config: {
                    data: grades.map(g => ({grade:g, count: faker.number.int({min:5, max:50})})),
                    xField: 'grade', yField: 'count', seriesField:'grade', legend:false,
                    yAxis: {title: {text: t('common.numberOfStudents', "No. of Students")}},
                    xAxis: {title: {text: t('common.grade', "Grade")}}
                }
            },
            title: t('reportTitles.gradeDistributionForCourse', "Grade Distribution for {courseName}", {courseName})
        });
        const terms = ["FA22", "SP23", "FA23", "SP24"];
        generatedContent.push({
            type: 'chart',
            data: {
                type: 'Line',
                config: {
                    data: terms.map(term => ({term, avgGrade: faker.number.float({min:2.2, max:3.9, precision:2})})),
                    xField: 'term', yField: 'avgGrade', seriesField:'term', legend:false, point:{size:4},
                    yAxis: {title: {text: t('common.avgGradePoints', "Avg. Grade (Points)")}, min:0, max:4.0},
                    xAxis: {title: {text: t('common.term', "Term/Semester")}}
                }
            },
            title: t('reportTitles.avgGradeTrendForCourse', "Avg. Grade Trend for {courseName}", {courseName})
        });
    } else if (reportDef.id === 'rep5') { // Attendance Hotspots (Weekly)
        const weekParam = params.weekSelector ? dayjs(params.weekSelector).format("YYYY-[W]WW") : dayjs().format("YYYY-[W]WW");
        const programsOrCourses = Array.from({length:faker.number.int({min:5,max:10})}, (_,i) => ({
            key: `poc${i}`,
            name: `${faker.helpers.arrayElement(["Prog:", "Course:"])} ${faker.commerce.department()} ${faker.number.int({min:100,max:400})}`,
            avgAttendance: faker.number.int({min:40, max:75}),
            totalAbsences: faker.number.int({min:10, max:50}),
            totalLates: faker.number.int({min:5, max:25}),
        })).sort((a,b)=> a.avgAttendance - b.avgAttendance);

        generatedContent.push({
            type: 'table',
            data: {
                columns: [
                    { title: t('common.programCourse', "Program/Course"), dataIndex: 'name', key: 'name' },
                    { title: t('common.avgAttendancePercent', "Avg. Attendance (%)"), dataIndex: 'avgAttendance', key: 'att', render: (v:any) => `${v}%`, align:'right' },
                    { title: t('common.totalAbsences', "Total Absences"), dataIndex: 'totalAbsences', key: 'abs', align:'right' },
                    { title: t('common.totalLates', "Total Lates"), dataIndex: 'totalLates', key: 'lates', align:'right' },
                ],
                rows: programsOrCourses.slice(0,5),
            },
            title: t('reportTitles.topAttendanceHotspots', "Top Attendance Hotspots (Lowest Avg Attendance) for Week {weekParam}", {weekParam})
        });
        const days = [t('common.daysShort.mon',"Mon"), t('common.daysShort.tue',"Tue"), t('common.daysShort.wed',"Wed"), t('common.daysShort.thu',"Thu"), t('common.daysShort.fri',"Fri")];
        generatedContent.push({
            type: 'chart',
            data: {
                type: 'Column',
                config: {
                    data: days.map(day => ({day, absences: faker.number.int({min:5,max:30})})),
                    xField: 'day', yField: 'absences', seriesField:'day', legend:false,
                    yAxis: {title: {text: t('common.totalAbsences', "Total Absences for Week {weekParam}", {weekParam})}},
                }
            },
            title: t('reportTitles.absencesByDayOfWeek', "Absences by Day of Week for {weekParam}", {weekParam})
        });
    } else if (reportDef.id === 'rep6') { // Active Grievances Summary
        const grievanceCategories = ['Library', 'IT Support', 'Canteen', 'Hostel', 'Academics'];
        const priorities = ['High', 'Medium', 'Low'];
        generatedContent.push({
            type: 'table',
            data: {
                columns: [ {title: t('common.metric','Metric'), dataIndex:'metric', key:'metric'}, {title:t('common.value','Value'), dataIndex:'value', key:'value'} ],
                rows: [
                    {key:'1', metric: t('common.totalOpenGrievances', "Total Open Grievances"), value: faker.number.int({min:5, max:25})},
                    {key:'2', metric: t('common.avgAgeOpenGrievances', "Avg. Age of Open Grievances (Days)"), value: faker.number.int({min:3, max:20})},
                    {key:'3', metric: t('common.highPriorityOpen', "High Priority Open"), value: faker.number.int({min:1, max:5})},
                ]
            },
             title: t('reportTitles.activeGrievancesSummary', "Active Grievances Summary")
        });
        generatedContent.push({
            type: 'chart',
            data: {
                type: 'Bar',
                config: {
                    data: grievanceCategories.map(cat => ({category:cat, count: faker.number.int({min:1, max:10})})).sort((a,b)=>b.count-a.count),
                    xField: 'count', yField: 'category', seriesField:'category', legend:false,
                    yAxis:{label:{autoEllipsis:true}},
                    xAxis: {title: {text: t('common.numberOfGrievances', "No. of Open Grievances")}}
                }
            },
            title: t('reportTitles.openGrievancesByCategory', "Open Grievances by Category")
        });
        generatedContent.push({
            type: 'table',
            data: {
                columns: [
                    { title: t('common.grievanceId', "Grievance ID"), dataIndex: 'id', key: 'id' },
                    { title: t('common.category', "Category"), dataIndex: 'category', key: 'category' },
                    { title: t('common.submittedDate', "Submitted"), dataIndex: 'date', key: 'date' },
                    { title: t('common.ageDays', "Age (Days)"), dataIndex: 'age', key: 'age', align:'right' },
                    { title: t('common.priority', "Priority"), dataIndex: 'priority', key: 'priority' },
                ],
                rows: Array.from({length:5}, (_,i)=>({
                    key:`old${i}`, id:`G-${faker.string.alphanumeric(4)}`, category: faker.helpers.arrayElement(grievanceCategories),
                    date: dayjs(faker.date.recent(30)).format('YYYY-MM-DD'), age:faker.number.int({min:15,max:45}),
                    priority: faker.helpers.arrayElement(priorities)
                })).sort((a,b)=>b.age-a.age),
            },
            title: t('reportTitles.oldestOpenGrievances', "Oldest Open Grievances (Top 5)")
        });
      } else {
          generatedContent.push({type: 'table', data: {columns:[], rows:[{key:'1', message: t('common.noDataForReport', 'No data generation logic for this mock report.')}]}})
      }

      const newGeneratedReport: GeneratedReport = {
        reportDefinitionId: reportDef.id,
        title: `${reportDef.name} (${t('common.generated', 'Generated')}: ${dayjs().format('YYYY-MM-DD HH:mm')})`,
        generatedAt: dayjs().toISOString(),
        parametersUsed: params,
        content: generatedContent,
      };

      setModuleState(prev => ({ ...prev, generatedReport: newGeneratedReport, generatingReport: false }));

    } catch (e: any) {
      console.error("Error generating mock report:", e);
      setModuleState(prev => ({ ...prev, error: e.message || "Failed to generate report", generatingReport: false }));
    }
  };

  useEffect(() => {
    const loadAvailableReports = async () => {
      setLoading(true);
      setInitialLoadError(null);
      setModuleState(prev => ({ ...prev, generatingReport: false, generatedReport: null, selectedReportDefinition: null, reportParameters: {}, error: null }));

      try {
        const result = await fetchData<{ availableReports?: ReportDefinition[]; message?: string }>('/principal-view/custom-reports');
        setModuleState(prev => ({
          ...prev,
          availableReports: result.availableReports || [],
          message: result.message,
        }));
      } catch (err: any) {
        console.error("Failed to fetch available reports:", err);
        setInitialLoadError(err.message || 'Failed to fetch available reports');

        // For parameter options, if needed here:
        const mockDepartmentsForParamOptions = [
            { label: t('common.departments.computerScience', 'Computer Science'), value: 'DEPT_CS' },
            { label: t('common.departments.physics', 'Physics'), value: 'DEPT_PHY' },
            { label: t('common.departments.mathematics', 'Mathematics'), value: 'DEPT_MATH' },
        ];
        const mockCoursesForParamOptions = [
            { label: t('common.courses.introCS', 'CS101 - Intro to Computer Science'), value: 'CRS_CS101' },
            { label: t('common.courses.calculus1', 'MA101 - Calculus I'), value: 'CRS_MA101' },
            { label: t('common.courses.physics1', 'PHY101 - Mechanics'), value: 'CRS_PHY101' },
        ];

        setModuleState(prev => ({
          ...prev,
          message: "Mock data active for Custom Reports (available list) due to API failure.",
          availableReports: [
            {
              id: 'rep1', name: t('reportDefinitions.rep1.name', "Student Enrollment by Program"),
              description: t('reportDefinitions.rep1.desc', "Shows student enrollment numbers for each program, filterable by academic year and enrollment status."),
              parameters: [
                { id: 'academicYear', name: t('params.academicYear', "Academic Year"), type: "select", required: true, options: [{label: "2022-2023", value:"2022-2023"}, {label: "2023-2024", value:"2023-2024"}], defaultValue: "2023-2024" },
                { id: 'status', name: t('params.enrollmentStatus', "Enrollment Status"), type: "select", options: [{label: t('status.enrolled', "Enrolled"), value:"ENR"}, {label: t('status.dropped', "Dropped"), value:"DRP"}], defaultValue: "ENR" }
              ]
            },
            {
              id: 'rep2', name: t('reportDefinitions.rep2.name', "Fee Collection Summary (Date Range)"),
              description: t('reportDefinitions.rep2.desc', "Summary of fees collected within a specific date range."),
              parameters: [
                { id: 'dateRange', name: t('params.dateRange', "Date Range"), type: "daterange", required: true, defaultValue: [dayjs().subtract(30, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')] }
              ]
            },
            // New Report Definitions:
            {
              id: 'rep3', name: t('reportDefinitions.rep3.name', "Faculty Workload Summary by Department"),
              description: t('reportDefinitions.rep3.desc', "Provides a summary of faculty workload (teaching load, advisee count, publications) for a selected department."),
              parameters: [
                { id: 'departmentId', name: t('params.department', "Department"), type: 'select', required: true, options: mockDepartmentsForParamOptions, defaultValue: mockDepartmentsForParamOptions[0]?.value }
              ]
            },
            {
              id: 'rep4', name: t('reportDefinitions.rep4.name', "Course Performance Overview"),
              description: t('reportDefinitions.rep4.desc', "Shows detailed academic performance (stats, grade distribution, trend) for a selected course."),
              parameters: [
                { id: 'courseId', name: t('params.course', "Course"), type: 'select', required: true, options: mockCoursesForParamOptions, defaultValue: mockCoursesForParamOptions[0]?.value }
              ]
            },
            {
              id: 'rep5', name: t('reportDefinitions.rep5.name', "Attendance Hotspots (Weekly)"),
              description: t('reportDefinitions.rep5.desc', "Identifies programs or courses with the lowest attendance rates for a selected week."),
              parameters: [
                { id: 'weekSelector', name: t('params.selectWeek', "Select any day of the target week"), type: 'date', required: true, defaultValue: dayjs().format('YYYY-MM-DD') }
              ]
            },
            {
              id: 'rep6', name: t('reportDefinitions.rep6.name', "Active Grievances Summary"),
              description: t('reportDefinitions.rep6.desc', "Summary of currently open/in-progress grievances, including oldest items and breakdown by category."),
              parameters: [] // Parameterless for now
            }
          ],
        }));
      } finally {
        setLoading(false);
      }
    };

    loadAvailableReports();
  }, [t]);

  return (
    <div style={{ padding: '20px' }}>
      <Breadcrumb style={{ marginBottom: '20px' }}>
        <Breadcrumb.Item>
          <Link to="/principal-view"><HomeOutlined /></Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/principal-view">{t('principalView.dashboardTitle', "Principal's Dashboard")}</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{t(`module.${MODULE_KEY}.title`)}</Breadcrumb.Item>
      </Breadcrumb>

      <Title level={2}>{t(`module.${MODULE_KEY}.title`)}</Title>
      <Paragraph>
        {t(`module.${MODULE_KEY}.descriptionPlaceholder`)}
      </Paragraph>

      <Card title={t('common.currentGlobalFilters', "Current Global Filters")} style={{ marginTop: 20, display: 'none' }}>
        <Descriptions bordered column={1} size="small">
          {/* ... Filter descriptions ... */}
        </Descriptions>
      </Card>

      <div style={{ marginTop: '20px' }}>
        {loading && <Spin tip={t('common.loadingData', "Loading data...")} />}
        {initialLoadError && !loading && <Paragraph type="danger">{t('common.errorLoadingData', "Error loading data:")} {initialLoadError}</Paragraph>}

        {moduleState.message && (
          <Paragraph style={{ marginTop: '10px', fontStyle: 'italic' }}>{moduleState.message}</Paragraph>
        )}

        {!moduleState.selectedReportDefinition && !loading && !initialLoadError && moduleState.availableReports && moduleState.availableReports.length > 0 && (
            <Card title={t(`module.${MODULE_KEY}.availableReportsTitle`, "Available Reports")}>
                <List
                  itemLayout="horizontal"
                  dataSource={moduleState.availableReports}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <Button type="primary" onClick={() => handleReportSelect(item)}>
                          {t('common.configureAndRun', "Configure & Run")}
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={item.name}
                        description={item.description}
                      />
                    </List.Item>
                  )}
                />
            </Card>
        )}
        {!moduleState.selectedReportDefinition && !loading && !initialLoadError && (!moduleState.availableReports || moduleState.availableReports.length === 0) && !moduleState.message && (
            <Empty description={t('common.noReportsAvailable', "No reports available to configure.")} />
        )}

        {moduleState.selectedReportDefinition && !moduleState.generatingReport && !moduleState.generatedReport && (
          <Card
            title={`${t('common.configureReport', "Configure Report")}: ${moduleState.selectedReportDefinition.name}`}
            style={{ marginTop: 20 }}
            extra={
              <Button onClick={() => handleReportSelect(null)}>
                {t('common.backToList', "Back to Report List")}
              </Button>
            }
          >
            <Form layout="vertical">
              {moduleState.selectedReportDefinition.parameters.map(param => {
                let inputNode: React.ReactNode;
                const currentValue = moduleState.reportParameters[param.id];
                switch (param.type) {
                  case 'text':
                    inputNode = <Input value={currentValue} onChange={e => handleParameterChange(param.id, e.target.value)} />;
                    break;
                  case 'number':
                    inputNode = <InputNumber style={{ width: '100%' }} value={currentValue} onChange={value => handleParameterChange(param.id, value)} />;
                    break;
                  case 'date':
                    inputNode = <DatePicker style={{ width: '100%' }} value={currentValue ? dayjs(currentValue) : null} onChange={(date, dateString) => handleParameterChange(param.id, dateString)} />;
                    break;
                  case 'daterange':
                    const rangeValue: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [
                        currentValue && currentValue[0] ? dayjs(currentValue[0]) : null,
                        currentValue && currentValue[1] ? dayjs(currentValue[1]) : null
                    ];
                    inputNode = <DatePicker.RangePicker style={{ width: '100%' }} value={rangeValue} onChange={(dates, dateStrings) => handleParameterChange(param.id, dateStrings)} />;
                    break;
                  case 'select':
                    inputNode = (
                      <Select style={{ width: '100%' }} value={currentValue} onChange={value => handleParameterChange(param.id, value)} placeholder={`${t('common.select', "Select")} ${param.name}`}>
                        {param.options?.map(opt => <Select.Option key={opt.value.toString()} value={opt.value}>{opt.label}</Select.Option>)}
                      </Select>
                    );
                    break;
                  default:
                    inputNode = <Text type="warning">{t('common.unsupportedParamType', "Unsupported parameter type")}</Text>;
                }
                return (
                  <Form.Item key={param.id} label={param.name} required={param.required}>
                    {inputNode}
                  </Form.Item>
                );
              })}
              <Form.Item>
                <Button type="primary" loading={moduleState.generatingReport} onClick={handleGenerateReport}>
                  {t('common.generateReport', "Generate Report")}
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={() => handleReportSelect(moduleState.selectedReportDefinition)}>
                  {t('common.resetParameters', "Reset Parameters")}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        )}

        {moduleState.generatingReport && (
          <div style={{textAlign: 'center', marginTop: 20}}><Spin size="large" tip={t('common.generatingReportTip', "Generating report...")} /></div>
        )}

        {moduleState.error && !moduleState.generatingReport && (
             <Alert message={t('common.errorGeneratingReport', "Error Generating Report")} description={moduleState.error} type="error" showIcon style={{marginTop: 20}}/>
        )}

        {moduleState.generatedReport && !moduleState.generatingReport && (
          <Card
            title={moduleState.generatedReport.title}
            style={{ marginTop: 20 }}
            extra={
              <Button onClick={() => setModuleState(prev => ({ ...prev, generatedReport: null }))}>
                {t('common.clearReport', "Clear Report")}
              </Button>
            }
          >
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 20 }}>
              <Descriptions.Item label={t('common.reportGeneratedAt', "Generated At")}>{dayjs(moduleState.generatedReport.generatedAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
              {moduleState.generatedReport.parametersUsed && Object.keys(moduleState.generatedReport.parametersUsed).length > 0 && (
                <Descriptions.Item label={t('common.parametersUsed', "Parameters Used")}>
                  <ul>
                    {Object.entries(moduleState.generatedReport.parametersUsed).map(([key, value]) => {
                      const paramDef = moduleState.selectedReportDefinition?.parameters.find(p => p.id === key);
                      let displayValue = Array.isArray(value) ? value.join(' - ') : value?.toString();
                      if (paramDef?.type === 'select' && paramDef.options) {
                        const selectedOpt = paramDef.options.find(opt => opt.value === value);
                        displayValue = selectedOpt ? selectedOpt.label : value?.toString();
                      }
                      return <li key={key}><strong>{paramDef?.name || key}:</strong> {displayValue || t('common.notSet', 'Not Set')}</li>;
                    })}
                  </ul>
                </Descriptions.Item>
              )}
            </Descriptions>

            {moduleState.generatedReport.content.map((contentBlock, index) => {
              if (contentBlock.type === 'table') {
                return (
                  <div key={`content-${index}`} style={{ marginBottom: 20 }}>
                    <Table
                      columns={contentBlock.data.columns}
                      dataSource={contentBlock.data.rows}
                      rowKey="key"
                      pagination={{ pageSize: 5, hideOnSinglePage: true }}
                      bordered
                      size="small"
                    />
                  </div>
                );
              } else if (contentBlock.type === 'chart') {
                const ChartComponent = ({ type, config }: ChartReportData) => {
                  switch (type) {
                    case 'Pie': return <Pie {...config} />;
                    case 'Column': return <Column {...config} />;
                    case 'Line': return <Line {...config} />;
                    case 'Bar': return <Bar {...config} />; // Added Bar
                    default: return <Text type="warning">{t('common.unsupportedChartType', 'Unsupported chart type')}</Text>;
                  }
                };
                const blockTitle = (contentBlock as any).title; // Access the title if it exists
                return (
                  <div key={`content-${index}`} style={{ marginBottom: 20 }}>
                    {blockTitle && <Title level={5} style={{marginBottom:10}}>{blockTitle}</Title>}
                    <div style={{padding: blockTitle ? '20px 0 0 0': '0', border: blockTitle ? 'none' : '1px solid #f0f0f0' }}> {/* No border if title is there, assume card-like */}
                      <ChartComponent type={contentBlock.data.type} config={contentBlock.data.config} />
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomReportsModule;
