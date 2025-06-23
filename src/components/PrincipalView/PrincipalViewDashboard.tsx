// src/components/PrincipalView/PrincipalViewDashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, DatePicker, Spin, Empty, Typography, Breadcrumb, Alert, Checkbox, Space } from 'antd'; // Added Checkbox, Space
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  UserOutlined, SolutionOutlined, TeamOutlined, DollarCircleOutlined, ScheduleOutlined,
  BarChartOutlined, PieChartOutlined, LineChartOutlined, HomeOutlined, WarningOutlined, CheckCircleOutlined, IssuesCloseOutlined, PercentageOutlined, FileProtectOutlined, FieldTimeOutlined, GiftOutlined
} from '@ant-design/icons'; // Added GiftOutlined
import Scorecard from '../../common/Scorecard';
import type { Institution, DashboardSummary, DashboardKpiData, DashboardKpiDataItem, EnrollmentTrendItem, FeeSummaryChartItem, AttendanceGPAOverviewItem, OpenGrievancesByCategoryItem } from '../../types/hierarchy'; // Corrected path
import dayjs from 'dayjs';

// Import chart components from Ant Design Plots
import { Line, Pie, Column, Scatter } from '@ant-design/plots'; // Added Scatter


const { Title, Paragraph, Text } = Typography;
const { RangePicker } = DatePicker;

interface PrincipalViewDashboardProps {
  institutionData: Institution | null;
  loading?: boolean;
  error?: string | null;
}

const PrincipalViewDashboard: React.FC<PrincipalViewDashboardProps> = ({
  institutionData,
  loading: institutionDataLoading,
  error: institutionDataError
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [comparePeriod, setComparePeriod] = useState<boolean>(false); // New state for comparison mode
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  useEffect(() => {
    setIsLoading(true);
    setErrorMessage(null);
    if (institutionDataLoading) {
      setIsLoading(true);
    } else if (institutionDataError) {
      setErrorMessage(institutionDataError);
      setIsLoading(false);
    } else if (institutionData && institutionData.dashboardSummary) {
      setDashboardSummary(institutionData.dashboardSummary);
      setIsLoading(false);
    } else if (institutionData && !institutionData.dashboardSummary) {
      setErrorMessage(t('dashboard.error.noSummary', "Dashboard summary data is not available."));
      setIsLoading(false);
    } else {
      // No institution data at all but not explicitly loading or error from prop means it might not have been passed
      setErrorMessage(t('dashboard.error.noInstitutionData', "Institution data not provided."));
      setIsLoading(false);
    }
  }, [institutionData, institutionDataLoading, institutionDataError, t]);

  const kpis = dashboardSummary?.kpis;

   const enrollmentTrendChartData = useMemo(() => {
    if (!dashboardSummary?.enrollmentTrend) return [];
    const baseTrend: EnrollmentTrendItem[] = dashboardSummary.enrollmentTrend;

    let currentPeriodData: Array<EnrollmentTrendItem & { category?: string }> = [];
    let previousPeriodData: Array<EnrollmentTrendItem & { category?: string }> = [];

    if (dateRange && dateRange[0] && dateRange[1]) {
        const currentStartDate = dateRange[0].startOf('month');
        const currentEndDate = dateRange[1].endOf('month');

        currentPeriodData = baseTrend.filter((item: EnrollmentTrendItem) => {
            const itemDate = dayjs(item.monthYear + "-01");
            return itemDate.isSameOrAfter(currentStartDate) && itemDate.isSameOrBefore(currentEndDate);
        }).map((item: EnrollmentTrendItem) => ({ ...item, category: t('dashboard.trends.currentPeriod', "Current Period") }));

        if (comparePeriod) {
            const periodDurationDays = currentEndDate.diff(currentStartDate, 'day') + 1;
            // Ensure previousEndDate is calculated correctly even if currentStartDate is the beginning of a month
            const previousEndDate = currentStartDate.subtract(1, 'day').endOf('month');
            const previousStartDate = previousEndDate.clone().subtract(periodDurationDays -1, 'day').startOf('month');

            previousPeriodData = baseTrend.filter((item: EnrollmentTrendItem) => {
                const itemDate = dayjs(item.monthYear + "-01");
                return itemDate.isSameOrAfter(previousStartDate) && itemDate.isSameOrBefore(previousEndDate);
            }).map((item: EnrollmentTrendItem) => ({
                ...item,
                // For simpler X-axis display, keep original monthYear. Tooltip/legend will differentiate.
                category: t('dashboard.trends.previousPeriod', "Previous Period")
            }));
            return [...currentPeriodData, ...previousPeriodData].sort((a,b) => a.monthYear.localeCompare(b.monthYear) || (a.category || "").localeCompare(b.category || ""));
        }
        return currentPeriodData;
    }
    // If no dateRange, return all base data, categorized. Comparison makes less sense without a primary range.
    return baseTrend.map((item: EnrollmentTrendItem) => ({ ...item, category: t('dashboard.trends.currentPeriod', "Current Period") }));
}, [dashboardSummary, dateRange, comparePeriod, t]);

   const feeSummaryChartData = useMemo((): FeeSummaryChartItem[] => dashboardSummary?.feeSummaryCurrentPeriod || [], [dashboardSummary]);
   const attendanceGPAChartData = useMemo((): AttendanceGPAOverviewItem[] => dashboardSummary?.attendanceGPAOverview || [], [dashboardSummary]);
   const openGrievancesChartData = useMemo((): OpenGrievancesByCategoryItem[] => dashboardSummary?.openGrievancesByCategory || [], [dashboardSummary]);


  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spin size="large" tip={t('common.loadingData', "Loading dashboard...")}/></div>;
  }

  if (errorMessage) {
    return <Alert message={t('common.errorOccurred', "An Error Occurred")} description={errorMessage} type="error" showIcon style={{margin: 20}}/>;
  }

  if (!dashboardSummary || !kpis) {
    return (
        <div style={{ padding: 20, textAlign:'center' }}>
            <Empty description={t('dashboard.error.noData', "No dashboard data available to display. Please check data sources or configuration.")} />
        </div>
    );
  }

  const kpiMetaMap: Record<keyof DashboardKpiData, { icon: React.ReactNode; path?: string; titleKeySuffix: string; defaultTitle: string }> = {
    totalActiveStudents: { icon: <TeamOutlined />, path: '/principal-view/students', titleKeySuffix: 'totalActiveStudents', defaultTitle: "Total Active Students" },
    avgAttendancePercentLast30Days: { icon: <ScheduleOutlined />, path: '/principal-view/attendance', titleKeySuffix: 'avgAttendancePercentLast30Days', defaultTitle: "Avg Attendance (Last 30d)" },
    avgAcademicPassPercentLastSemester: { icon: <CheckCircleOutlined />, path: '/principal-view/academics', titleKeySuffix: 'avgAcademicPassPercentLastSemester', defaultTitle: "Avg Acad. Pass Rate (Last Sem)" },
    totalOutstandingFees: { icon: <DollarCircleOutlined />, path: '/principal-view/billing', titleKeySuffix: 'totalOutstandingFees', defaultTitle: "Total Outstanding Fees" },
    activeHighPriorityGrievances: { icon: <WarningOutlined />, path: '/principal-view/grievances', titleKeySuffix: 'activeHighPriorityGrievances', defaultTitle: "Active High Prio Grievances" },
    overallComplianceItemsCompliantPercent: { icon: <FileProtectOutlined />, path: '/principal-view/compliance', titleKeySuffix: 'overallComplianceItemsCompliantPercent', defaultTitle: "Overall Compliance %" },
    avgTimeToPlacement: { icon: <FieldTimeOutlined />, path: '/principal-view/placements', titleKeySuffix: 'avgTimeToPlacement', defaultTitle: "Avg. Time to Placement" },
    totalAlumniDonations: { icon: <GiftOutlined />, path: '/principal-view/alumni', titleKeySuffix: 'totalAlumniDonations', defaultTitle: "Total Alumni Donations" },
  };


  return (
    <div style={{ padding: '20px' }}>
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item><Link to="/principal-view"><HomeOutlined /></Link></Breadcrumb.Item>
        <Breadcrumb.Item>{t('principalView.dashboardTitle', "Principal's Dashboard")}</Breadcrumb.Item>
      </Breadcrumb>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <Title level={2} style={{ margin: 0 }}>{t('dashboard.mainTitle', "Institution Overview")}</Title>
        <Space wrap>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates && dates[0] && dates[1] ? [dates[0], dates[1]] : null)}
          />
          <Checkbox checked={comparePeriod} onChange={(e) => setComparePeriod(e.target.checked)}>
            {t('dashboard.comparePeriod', "Compare to previous period")}
          </Checkbox>
        </Space>
      </div>

      {/* KPI Scorecards Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {Object.entries(kpis).map(([key, kpiDataItem]) => {
            const meta = kpiMetaMap[key as keyof DashboardKpiData];
            if (!meta) {
                console.warn(`Metadata not found for KPI key: ${key}`);
                return null;
            }
            // Type assertion as kpiDataItem is known to be DashboardKpiDataItem here
            const typedKpiDataItem = kpiDataItem as DashboardKpiDataItem;

            return (
                <Col xs={12} sm={12} md={8} lg={6} xl={4} key={key} style={{ flexGrow: 1 }}> {/* Adjusted xs to 12 to fit more on small screens */}
                <Scorecard
                    title={t(`dashboard.kpi.${meta.titleKeySuffix}`, meta.defaultTitle)}
                    kpiData={typedKpiDataItem}
                    icon={meta.icon}
                    loading={isLoading} // This correctly uses the dashboard's overall loading state for KPIs
                    onClick={meta.path ? () => navigate(meta.path!) : undefined}
                />
                </Col>
            );
        })}
      </Row>

      {/* Main Charts Row 1 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} lg={16}>
          <Card title={t('dashboard.charts.enrollmentTrend', "Student Enrollment Trend (Monthly)")}>
            {enrollmentTrendChartData.length > 0 ?
                <Line
                  data={enrollmentTrendChartData}
                  xField="monthYear"
                  yField="studentCount"
                  seriesField={comparePeriod && dateRange && dateRange[0] && dateRange[1] ? "category" : undefined}
                  color={comparePeriod && dateRange && dateRange[0] && dateRange[1] ? ['#3674E7', '#FFAA00'] : '#3674E7'}
                  height={300}
                  xAxis={{title:{text:t('common.monthYear','Month-Year')}}}
                  yAxis={{title:{text:t('common.numberOfStudents','No. of Students')}}}
                  lineStyle={{ lineWidth: 2 }}
                  point={{
                    size: 4,
                    shape: 'circle',
                    style: {
                      fill: 'white',
                      stroke: '#3674E7',
                      lineWidth: 2,
                    },
                  }}
                  area={comparePeriod && dateRange && dateRange[0] && dateRange[1] ? undefined : { // Area fill only for single series mode
                    style: {
                      fill: 'l(270) 0:#ffffff 1:#3674E7',
                      fillOpacity: 0.3,
                    },
                  }}
                  smooth={true}
                  legend={comparePeriod && dateRange && dateRange[0] && dateRange[1] ? { position: 'top-right' } : false}
                /> : <Empty />}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={t('dashboard.charts.feeSummary', "Fee Collection Summary")}>
            {feeSummaryChartData.length > 0 ?
                <Column data={feeSummaryChartData} xField="category" yField="amount" seriesField="category" isGroup={false} legend={{position:'bottom'}} height={300} label={{position:'top', formatter:(d: { category: string; amount: number })=>`${t('common.currencySymbol','$')}${(d.amount/1000).toFixed(0)}k`}} yAxis={{label:{formatter:(v: number | string)=>`${t('common.currencySymbol','$')}${(Number(v)/1000).toFixed(0)}k`}}}/> : <Empty />}
          </Card>
        </Col>
      </Row>

      {/* Main Charts Row 2 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={t('dashboard.charts.attendanceGPA', "Attendance vs. GPA Overview (by Dept/Program)")}>
            {attendanceGPAChartData.length > 0 ?
                <Scatter
                    data={attendanceGPAChartData}
                    xField="avgAttendance"
                    yField="avgGPA"
                    colorField="entityName"
                    sizeField={attendanceGPAChartData[0]?.studentCount !== undefined ? "studentCount" : undefined}
                    size={attendanceGPAChartData[0]?.studentCount !== undefined ? [4, 25] : 6}
                    shape="circle"
                    legend={attendanceGPAChartData.length < 8 ? {position:'right', offsetY:0} : false}
                    xAxis={{
                        title: { text: t('dashboard.charts.avgAttendancePercent', "Avg. Attendance (%)") },
                        min: 0, max: 100, label: {formatter: (v: number | string) => `${v}%`}
                    }}
                    yAxis={{
                        title: { text: t('dashboard.charts.avgGPA', "Avg. GPA") },
                        min: 0, max: 4.0, // Assuming a 4.0 GPA scale, adjust if different
                        tickInterval: 0.5
                    }}
                    tooltip={{
                        fields: ['entityName', 'avgAttendance', 'avgGPA', 'studentCount'],
                        formatter: (datum: AttendanceGPAOverviewItem) => ({
                            name: datum.entityName,
                            value: `${t('dashboard.charts.attendanceShort', "Att")}: ${datum.avgAttendance}%, ${t('dashboard.charts.gpaShort', "GPA")}: ${datum.avgGPA}` +
                                   (datum.studentCount ? ` (${datum.studentCount} ${t('common.students','students')})` : '')
                        })
                    }}
                    height={300}
                />
                : <Empty />}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={t('dashboard.charts.openGrievances', "Open Grievances by Category")}>
            {openGrievancesChartData.length > 0 ?
                <Pie data={openGrievancesChartData} angleField="count" colorField="category" radius={0.8} legend={{position:'right', offsetY:0}} height={300} label={{type:'inner', offset:'-30%', content:'{percentage}', style:{fill:'#fff'}}} tooltip={{formatter:(d: { category: string; count: number })=>({name:d.category, value:`${d.count} ${t('common.grievances','grievances')}`})}} /> : <Empty />}
          </Card>
        </Col>
      </Row>
       <Paragraph style={{ marginTop: 20, color: '#888', textAlign: 'center' }}>
         {t('common.lastRefreshed', "Last refreshed:")} {dashboardSummary.lastRefreshed ? dayjs(dashboardSummary.lastRefreshed).format('YYYY-MM-DD HH:mm:ss') : t('common.notAvailableShort', 'N/A')}
      </Paragraph>
    </div>
  );
};

export default PrincipalViewDashboard;
