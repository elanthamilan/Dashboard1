// src/components/PrincipalView/PrincipalViewDashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, DatePicker, Spin, Empty, Typography, Breadcrumb, Alert } from 'antd';
import { Link, useNavigate } from 'react-router-dom'; // Assuming react-router-dom for navigation
import { useTranslation } from 'react-i18next';
import {
  UserOutlined, SolutionOutlined, TeamOutlined, DollarCircleOutlined, ScheduleOutlined,
  BarChartOutlined, PieChartOutlined, LineChartOutlined, HomeOutlined, WarningOutlined, CheckCircleOutlined, IssuesCloseOutlined, PercentageOutlined, FileProtectOutlined, FieldTimeOutlined
} from '@ant-design/icons';
import Scorecard from '../../common/Scorecard'; // Adjust path as needed
import type { Institution, DashboardSummary, DashboardKpiData, EnrollmentTrendItem, FeeSummaryChartItem, AttendanceGPAOverviewItem, OpenGrievancesByCategoryItem } from '../../../types/hierarchy'; // Adjust path
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

   const enrollmentTrendChartData = useMemo((): EnrollmentTrendItem[] => {
     if (!dashboardSummary?.enrollmentTrend) return [];

     if (dateRange && dateRange[0] && dateRange[1]) {
       const startDate = dateRange[0].startOf('month'); // Normalize to start of month
       const endDate = dateRange[1].endOf('month');   // Normalize to end of month

       return dashboardSummary.enrollmentTrend.filter(item => {
         const itemDate = dayjs(item.monthYear + "-01"); // Convert "YYYY-MM" to a dayjs object
         // Check if itemDate is between startDate and endDate (inclusive)
         return (itemDate.isSame(startDate) || itemDate.isAfter(startDate)) &&
                (itemDate.isSame(endDate) || itemDate.isBefore(endDate));
       });
     }
     return dashboardSummary.enrollmentTrend; // Return all if no date range selected
   }, [dashboardSummary, dateRange]);

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

  const scorecardKpis = [
    { titleKey: 'totalActiveStudents', value: kpis.totalActiveStudents, icon: <TeamOutlined />, onClick: () => navigate('/principal-view/students') }, // General student list/overview
    { titleKey: 'avgAttendancePercentLast30Days', value: kpis.avgAttendancePercentLast30Days, suffix: '%', icon: <ScheduleOutlined />, onClick: () => navigate('/principal-view/attendance'), statusColor: (kpis.avgAttendancePercentLast30Days || 0) < 80 ? '#faad14' : undefined },
    { titleKey: 'avgAcademicPassPercentLastSemester', value: kpis.avgAcademicPassPercentLastSemester, suffix: '%', icon: <CheckCircleOutlined />, onClick: () => navigate('/principal-view/academics'), statusColor: (kpis.avgAcademicPassPercentLastSemester || 0) < 70 ? '#faad14' : undefined },
    { titleKey: 'totalOutstandingFees', value: kpis.totalOutstandingFees, prefix: t('common.currencySymbol','$'), icon: <DollarCircleOutlined />, onClick: () => navigate('/principal-view/billing'), statusColor: (kpis.totalOutstandingFees || 0) > 100000 ? '#cf1322' : undefined }, // Example threshold
    { titleKey: 'activeHighPriorityGrievances', value: kpis.activeHighPriorityGrievances, icon: <WarningOutlined />, onClick: () => navigate('/principal-view/grievances'), statusColor: (kpis.activeHighPriorityGrievances || 0) > 0 ? '#cf1322' : undefined },
    { titleKey: 'overallComplianceItemsCompliantPercent', value: kpis.overallComplianceItemsCompliantPercent, suffix: '%', icon: <FileProtectOutlined />, onClick: () => navigate('/principal-view/compliance'), statusColor: (kpis.overallComplianceItemsCompliantPercent || 0) < 90 ? '#faad14' : undefined },
  ];


  return (
    <div style={{ padding: '20px' }}>
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item><Link to="/principal-view"><HomeOutlined /></Link></Breadcrumb.Item>
        <Breadcrumb.Item>{t('principalView.dashboardTitle', "Principal's Dashboard")}</Breadcrumb.Item>
      </Breadcrumb>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <Title level={2} style={{ margin: 0 }}>{t('dashboard.mainTitle', "Institution Overview")}</Title>
        <RangePicker onChange={(dates) => setDateRange(dates)} />
      </div>

      {/* KPI Scorecards Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {scorecardKpis.map(kpiItem => (
          <Col xs={24} sm={12} md={8} lg={6} xl={4} key={kpiItem.titleKey} style={{ flexGrow: 1}}> {/* Added flexGrow */}
            <Scorecard
              title={t(`dashboard.kpi.${kpiItem.titleKey}`, kpiItem.titleKey.replace(/([A-Z]+)/g, ' $1').replace(/^ /, ''))} // Improved fallback title generation
              value={kpiItem.value ?? t('common.notAvailableShort', 'N/A')}
              icon={kpiItem.icon}
              prefix={kpiItem.prefix}
              suffix={kpiItem.suffix}
              loading={isLoading} // This should ideally be institutionDataLoading
              onClick={kpiItem.onClick}
              statusColor={kpiItem.statusColor}
            />
          </Col>
        ))}
      </Row>

      {/* Main Charts Row 1 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} lg={16}>
          <Card title={t('dashboard.charts.enrollmentTrend', "Student Enrollment Trend (Monthly)")}>
            {enrollmentTrendChartData.length > 0 ?
                <Line data={enrollmentTrendChartData} xField="monthYear" yField="studentCount" height={300} xAxis={{title:{text:t('common.monthYear','Month-Year')}}} yAxis={{title:{text:t('common.numberOfStudents','No. of Students')}}} /> : <Empty />}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={t('dashboard.charts.feeSummary', "Fee Collection Summary")}>
            {feeSummaryChartData.length > 0 ?
                <Column data={feeSummaryChartData} xField="category" yField="amount" seriesField="category" isGroup={false} legend={{position:'bottom'}} height={300} label={{position:'top', formatter:(d)=>`${t('common.currencySymbol','$')}${(d.amount/1000).toFixed(0)}k`}} yAxis={{label:{formatter:(v)=>`${t('common.currencySymbol','$')}${(Number(v)/1000).toFixed(0)}k`}}}/> : <Empty />}
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
                        min: 0, max: 100, label: {formatter: (v) => `${v}%`}
                    }}
                    yAxis={{
                        title: { text: t('dashboard.charts.avgGPA', "Avg. GPA") },
                        min: 0, max: 4.0, // Assuming a 4.0 GPA scale, adjust if different
                        tickInterval: 0.5
                    }}
                    tooltip={{
                        fields: ['entityName', 'avgAttendance', 'avgGPA', 'studentCount'],
                        formatter: (datum) => ({
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
                <Pie data={openGrievancesChartData} angleField="count" colorField="category" radius={0.8} legend={{position:'right', offsetY:0}} height={300} label={{type:'inner', offset:'-30%', content:'{percentage}', style:{fill:'#fff'}}} tooltip={{formatter:(d)=>({name:d.category, value:`${d.count} ${t('common.grievances','grievances')}`})}} /> : <Empty />}
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
