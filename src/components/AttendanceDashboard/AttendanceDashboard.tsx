import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Row, Col, Card, Typography, Spin, Select, DatePicker, Tag, Button, Statistic, Space } from 'antd'; // Added Space
import { useTranslation } from 'react-i18next';
import { Student, SchoolClass, AttendanceRecord, AttendanceStatus } from './types';
import { generateMockStudents, generateMockClasses, generateMockAttendanceRecords } from '../../utils/mockData/attendance/generateMockAttendanceData';
import { FilterOutlined, CloseCircleOutlined, PlusOutlined, WarningOutlined, UserOutlined } from '@ant-design/icons'; // Added CloseCircleOutlined, PlusOutlined, WarningOutlined, UserOutlined
import { message, List, Avatar, Empty } from 'antd'; // For success/error messages, List, Avatar, Empty
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import MarkAttendanceForm from './MarkAttendanceForm'; // Import the new component
import isBetween from 'dayjs/plugin/isBetween'; // Import isBetween plugin
dayjs.extend(isToday);
dayjs.extend(isBetween); // Extend dayjs with isBetween
import AttendanceCalendarHeatmap from './AttendanceCalendarHeatmap'; // Import the new component
import AbsenceReasonChart from './AbsenceReasonChart'; // Import the new component
// import WeeklyAttendanceTrendChart from './WeeklyAttendanceTrendChart'; // Removing this
import CourseAbsenceRateChart from './CourseAbsenceRateChart'; // Import the new chart
import DailyAttendanceTrendChart from './DailyAttendanceTrendChart'; // Import the new daily trend chart
import ChronicAbsenteeismTable from './ChronicAbsenteeismTable'; // Import the new table
import AttendanceLogTable from './AttendanceLogTable'; // Import the new component
// KpiCard and Placeholders for other components remain the same
const KpiCard: React.FC<{ title: string; value: string | number; precision?: number; suffix?: string; loading?: boolean }> = ({ title, value, precision, suffix, loading }) => (
  <Col xs={24} sm={12} md={8} lg={6} xl={6}>
    <Card><Statistic title={title} value={value} precision={precision} suffix={suffix} loading={loading} /></Card>
  </Col>
);
// const AttendanceCalendarHeatmapPlaceholder: React.FC = () => <Card style={{marginTop: '16px', minHeight: 300}}><Typography.Text>Attendance Calendar Heatmap Placeholder</Typography.Text></Card>;
// const AbsenceReasonChartPlaceholder: React.FC = () => <Card style={{marginTop: '16px', minHeight: 300}}><Typography.Text>Absence Reason Bar Chart Placeholder</Typography.Text></Card>;
// const WeeklyAttendanceTrendChartPlaceholder: React.FC = () => <Card style={{marginTop: '16px', minHeight: 300}}><Typography.Text>Weekly Attendance Trend Line Chart Placeholder</Typography.Text></Card>;
// const AttendanceLogTablePlaceholder: React.FC = () => <Card style={{marginTop: '16px'}}><Typography.Text>Attendance Log Table Placeholder</Typography.Text></Card>;
// const IrregularAttendanceAlertsPlaceholder: React.FC = () => <Card style={{marginTop: '16px'}}><Typography.Text>Irregular Attendance Alerts Placeholder</Typography.Text></Card>;


const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const MOCK_STUDENT_COUNT = 300;
const MOCK_CLASS_COUNT = 10;
const MOCK_ATTENDANCE_DAYS = 365;

const AttendanceDashboard: React.FC = () => {
  const { t } = useTranslation();
  // Raw data states
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allSchoolClasses, setAllSchoolClasses] = useState<SchoolClass[]>([]);
  const [allAttendanceRecords, setAllAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isMarkAttendanceFormVisible, setIsMarkAttendanceFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  // Filter states
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(undefined);
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);
  const [selectedDateRange, setSelectedDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>([dayjs().subtract(89, 'days').startOf('day'), dayjs().endOf('day')]);

  useEffect(() => {
    setLoading(true);
    const mockStudents = generateMockStudents(MOCK_STUDENT_COUNT);
    const mockClasses = generateMockClasses(MOCK_CLASS_COUNT);
    const mockAttendanceRecords = generateMockAttendanceRecords(mockStudents, mockClasses, MOCK_ATTENDANCE_DAYS);

    setAllStudents(mockStudents);
    setAllSchoolClasses(mockClasses);
    setAllAttendanceRecords(mockAttendanceRecords);
    setLoading(false);
  }, []);

  // Filtered data - this will be passed to charts and table
  const filteredAttendanceRecords = useMemo(() => {
    let records = [...allAttendanceRecords];
    if (selectedStudentId) {
      records = records.filter(r => r.studentId === selectedStudentId);
    }
    if (selectedClassId) {
      records = records.filter(r => r.classId === selectedClassId);
    }
    if (selectedDateRange && selectedDateRange[0] && selectedDateRange[1]) {
      const [startDate, endDate] = selectedDateRange;
      records = records.filter(r => dayjs(r.date).isBetween(startDate, endDate, 'day', '[]'));
    }
    return records;
  }, [allAttendanceRecords, selectedStudentId, selectedClassId, selectedDateRange]);

  // KPIs should now use filteredAttendanceRecords or allAttendanceRecords based on desired scope
  // For simplicity, let's assume KPIs are global for now (using allAttendanceRecords)
  // If KPIs should react to filters, change dependency in kpiData to filteredAttendanceRecords
  const kpiData = useMemo(() => {
    const recordsToProcess = allAttendanceRecords; // Change to filteredAttendanceRecords if KPIs should be dynamic
    if (recordsToProcess.length === 0 && !loading) { // ensure we don't show 0 if still loading initial data
      return { overallAttendanceRate: 0, absencesToday: 0, lateToday: 0, excusedToday: 0, studentsWithHighAbsencesThisMonth: 0 };
    }

    let totalPresent = 0;
    let totalLate = 0;
    let totalAbsent = 0;
    let absencesToday = 0;
    let lateToday = 0;
    let excusedToday = 0;

    recordsToProcess.forEach(record => {
      const isTodayRecord = dayjs(record.date).isToday();
      switch (record.status) {
        case 'Present':
          totalPresent++;
          break;
        case 'Late':
          totalLate++;
          if (isTodayRecord) {
            lateToday++;
          }
          break;
        case 'Absent':
          totalAbsent++;
          if (isTodayRecord) {
            absencesToday++;
          }
          break;
        case 'Excused':
          if (isTodayRecord) {
            excusedToday++;
          }
          break;
        default:
          break;
      }
    });

    const relevantForRate = totalPresent + totalLate + totalAbsent;
    const overallAttendanceRate = relevantForRate > 0 ? ((totalPresent + totalLate) / relevantForRate) * 100 : 0;

    // Calculate students with high absences this month
    const currentMonthStart = dayjs().startOf('month');
    const currentMonthEnd = dayjs().endOf('month');
    const absencesThisMonthByStudent: { [studentId: string]: number } = {};

    recordsToProcess.forEach(record => {
      if (
        record.status === 'Absent' &&
        dayjs(record.date).isBetween(currentMonthStart, currentMonthEnd, 'day', '[]')
      ) {
        absencesThisMonthByStudent[record.studentId] = (absencesThisMonthByStudent[record.studentId] || 0) + 1;
      }
    });

    let studentsWithHighAbsencesThisMonth = 0;
    for (const studentId in absencesThisMonthByStudent) {
      if (absencesThisMonthByStudent[studentId] > 5) {
        studentsWithHighAbsencesThisMonth++;
      }
    }

    return {
      overallAttendanceRate,
      absencesToday,
      lateToday,
      excusedToday,
      studentsWithHighAbsencesThisMonth,
    };
  }, [allAttendanceRecords, loading]); // Changed dependency

  const handleClearFilters = () => {
    setSelectedStudentId(undefined);
    setSelectedClassId(undefined);
    setSelectedDateRange(null);
  };

  // Functions to remove individual filters
  const removeStudentFilter = () => setSelectedStudentId(undefined);
  const removeClassFilter = () => setSelectedClassId(undefined);
  const removeDateRangeFilter = () => setSelectedDateRange(null);

  const getStudentName = (studentId: string) => allStudents.find(s => s.id === studentId);
  const getClassName = (classId: string) => allSchoolClasses.find(c => c.id === classId);

  const handleOpenMarkAttendanceForm = (recordToEdit?: AttendanceRecord) => {
    setEditingRecord(recordToEdit || null);
    setIsMarkAttendanceFormVisible(true);
  };

  const handleCloseMarkAttendanceForm = () => {
    setIsMarkAttendanceFormVisible(false);
    setEditingRecord(null); // Clear editing record when form closes
  };

  const handleSaveAttendance = (recordToSave: AttendanceRecord) => {
    setAllAttendanceRecords(prevRecords => {
      const existingIndex = prevRecords.findIndex(r => r.id === recordToSave.id);
      if (existingIndex > -1) {
        // Update existing record
        const updatedRecords = [...prevRecords];
        updatedRecords[existingIndex] = recordToSave;
        message.success(t('attendanceDashboard.messages.recordUpdated', 'Attendance record updated.'));
        return updatedRecords;
      } else {
        // Add new record
        message.success(t('attendanceDashboard.messages.recordAdded', 'New attendance record added.'));
        return [recordToSave, ...prevRecords]; // Add to beginning or sort as needed
      }
    });
    // Note: If KPIs/Charts depend on filteredAttendanceRecords, and that doesn't re-calculate
    // automatically when allAttendanceRecords changes, you might need to trigger a refresh.
    // However, useMemo for filteredAttendanceRecords with allAttendanceRecords in dependency array should handle this.
  };

  // Update the existing handleEditRecord to use the new handler
  const handleEditRecord = (record: AttendanceRecord) => {
      handleOpenMarkAttendanceForm(record);
  };

  // Removed irregularAttendanceAlerts useMemo hook as it's being replaced by ChronicAbsenteeismTable

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
  }

  return (
    <Content style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>{t('attendanceDashboard.title')}</Title>

      <Row gutter={[16,16]} style={{ marginBottom: 24 }} justify="space-between" align="middle">
        <Col>
            {/* Placeholder for any summary text or additional global actions */}
        </Col>
        <Col>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenMarkAttendanceForm()}
            >
                {t('attendanceDashboard.actions.markAttendance', 'Mark Attendance')}
            </Button>
        </Col>
      </Row>

      {/* KPI Section (using kpiData as defined) */}
       <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <KpiCard title={t('attendanceDashboard.kpi.overallAttendanceRate')} value={kpiData.overallAttendanceRate} precision={1} suffix="%" loading={loading && allAttendanceRecords.length === 0} />
        <KpiCard title={t('attendanceDashboard.kpi.absencesToday')} value={kpiData.absencesToday} loading={loading && allAttendanceRecords.length === 0} />
        <KpiCard title={t('attendanceDashboard.kpi.lateToday')} value={kpiData.lateToday} loading={loading && allAttendanceRecords.length === 0} />
        <KpiCard title={t('attendanceDashboard.kpi.excusedToday')} value={kpiData.excusedToday} loading={loading && allAttendanceRecords.length === 0} />
        <KpiCard title={t('attendanceDashboard.kpi.studentsWithHighAbsencesThisMonth', 'Students >5 Absences (Month)')} value={kpiData.studentsWithHighAbsencesThisMonth} loading={loading && allAttendanceRecords.length === 0} />
      </Row>

      {/* Filters Section */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} sm={12} md={6}>
            <Text>{t('attendanceDashboard.filters.student')}:</Text>
            <Select
              allowClear
              showSearch
              optionFilterProp="children"
              placeholder={t('attendanceDashboard.filters.selectStudent')}
              style={{ width: '100%' }}
              onChange={value => setSelectedStudentId(value)}
              value={selectedStudentId}
              filterOption={(input, option) => String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
            >
              {allStudents.map(s => <Option key={s.id} value={s.id}>{`${s.firstName} ${s.lastName}`}</Option>)}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text>{t('attendanceDashboard.filters.class')}:</Text>
            <Select
              allowClear
              showSearch
              optionFilterProp="children"
              placeholder={t('attendanceDashboard.filters.selectClass')}
              style={{ width: '100%' }}
              onChange={value => setSelectedClassId(value)}
              value={selectedClassId}
              filterOption={(input, option) => String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
            >
              {allSchoolClasses.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Text>{t('attendanceDashboard.filters.dateRange')}:</Text>
            <RangePicker
                style={{ width: '100%' }}
                onChange={dates => setSelectedDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null)}
                value={selectedDateRange}
                format="YYYY-MM-DD"
            />
          </Col>
          <Col xs={24} sm={12} md={4} style={{display: 'flex', alignItems: 'flex-end'}}>
             <Button icon={<FilterOutlined />} style={{width: '100%'}} onClick={handleClearFilters} danger>
                {t('attendanceDashboard.filters.clearFiltersButton', 'Clear Filters')}
             </Button>
          </Col>
        </Row>
        <div style={{marginTop: 16}}>
            <Text strong>{t('attendanceDashboard.filters.activeFilters', 'Active Filters')}: </Text>
            <Space wrap>
                {selectedStudentId && <Tag closable onClose={removeStudentFilter} icon={<CloseCircleOutlined />}>{t('attendanceDashboard.filters.studentTag', 'Student')}: {getStudentName(selectedStudentId)?.firstName} {getStudentName(selectedStudentId)?.lastName}</Tag>}
                {selectedClassId && <Tag closable onClose={removeClassFilter} icon={<CloseCircleOutlined />}>{t('attendanceDashboard.filters.classTag', 'Class')}: {getClassName(selectedClassId)?.name}</Tag>}
                {selectedDateRange && selectedDateRange[0] && selectedDateRange[1] && (
                    <Tag closable onClose={removeDateRangeFilter} icon={<CloseCircleOutlined />}>
                        {t('attendanceDashboard.filters.dateRangeTag', 'Dates')}: {selectedDateRange[0].format('YYYY-MM-DD')} - {selectedDateRange[1].format('YYYY-MM-DD')}
                    </Tag>
                )}
                {!(selectedStudentId || selectedClassId || (selectedDateRange && selectedDateRange[0])) && <Text type="secondary">{t('common.none', 'None')}</Text>}
            </Space>
        </div>
      </Card>

      {/* Charts and Table Section - Pass filteredAttendanceRecords to these components */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
            <AttendanceCalendarHeatmap records={filteredAttendanceRecords} loading={loading} />
             <Row gutter={[16,16]} style={{marginTop: 16}}>
                <Col xs={24} sm={24} md={12} lg={8}>
                    <AbsenceReasonChart records={filteredAttendanceRecords} loading={loading} />
                </Col>
                <Col xs={24} sm={24} md={12} lg={8}>
                    <CourseAbsenceRateChart records={filteredAttendanceRecords} schoolClasses={allSchoolClasses} loading={loading} />
                </Col>
                <Col xs={24} sm={24} md={12} lg={8}>
                    <DailyAttendanceTrendChart records={filteredAttendanceRecords} loading={loading} />
                </Col>
             </Row>
        </Col>
        <Col xs={24} lg={8}>
          <ChronicAbsenteeismTable
            records={filteredAttendanceRecords}
            students={allStudents}
            loading={loading}
          />
        </Col>
      </Row>

      <Row style={{ marginTop: '24px' }}>
        <Col span={24}>
          <AttendanceLogTable
              records={filteredAttendanceRecords}
              students={allStudents}
              schoolClasses={allSchoolClasses}
              loading={loading}
              onEditRecord={handleEditRecord}
          />
        </Col>
      </Row>
      {/* Placeholder for MarkAttendanceForm modal */}
      <MarkAttendanceForm
          visible={isMarkAttendanceFormVisible}
          onClose={handleCloseMarkAttendanceForm}
          onSave={handleSaveAttendance}
          students={allStudents}
          schoolClasses={allSchoolClasses}
          initialRecord={editingRecord}
      />
    </Content>
  );
};

export default AttendanceDashboard;
