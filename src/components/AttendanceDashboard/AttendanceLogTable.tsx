import React, { useState, useMemo } from 'react';
import { Table, Input, Select, Button, Tag, DatePicker, Tooltip, Typography } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { FilterValue, SorterResult } from 'antd/es/table/interface';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { AttendanceRecord, AttendanceStatus, Student, SchoolClass } from './types'; // Adjust path
import { EyeOutlined } from '@ant-design/icons'; // Or EditOutlined if editing is planned

const { Search } = Input;
const { Option } = Select;

interface AttendanceLogTableProps {
  records: AttendanceRecord[];
  students: Student[]; // For mapping studentId to name
  schoolClasses: SchoolClass[]; // For mapping classId to name
  loading?: boolean;
  onViewDetails?: (record: AttendanceRecord) => void; // Optional: if a detail view is needed
  onEditRecord?: (record: AttendanceRecord) => void; // For "Mark Attendance" form prefill
}

const getStatusColor = (status: AttendanceStatus): string => {
  switch (status) {
    case 'Present': return 'success';
    case 'Late': return 'warning';
    case 'Absent': return 'error';
    case 'Excused': return 'blue';
    default: return 'default';
  }
};

const attendanceStatusesForFilter: AttendanceStatus[] = ['Present', 'Absent', 'Late', 'Excused'];

const AttendanceLogTable: React.FC<AttendanceLogTableProps> = ({
  records,
  students,
  schoolClasses,
  loading,
  onViewDetails, // Not implemented in this step, but good for future
  onEditRecord
}) => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus[]>([]);
  // Date filter for the table itself, distinct from dashboard-level date filter if needed
  const [tableDateFilter, setTableDateFilter] = useState<dayjs.Dayjs | null>(null);

  const studentMap = useMemo(() => new Map(students.map(s => [s.id, `${s.firstName} ${s.lastName}`])), [students]);
  const classMap = useMemo(() => new Map(schoolClasses.map(c => [c.id, c.name])), [schoolClasses]);


  const [tableParams, setTableParams] = useState<{
    pagination: TablePaginationConfig;
    sorter?: SorterResult<AttendanceRecord> | SorterResult<AttendanceRecord>[];
  }>({
    pagination: {
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '50', '100'],
    },
  });

  const processedAndFilteredRecords = useMemo(() => {
    let filtered = [...records];

    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      filtered = filtered.filter(rec => {
        const studentName = studentMap.get(rec.studentId)?.toLowerCase() || '';
        const className = classMap.get(rec.classId)?.toLowerCase() || '';
        return studentName.includes(lowerSearchText) || className.includes(lowerSearchText);
      });
    }

    if (statusFilter.length > 0) {
      filtered = filtered.filter(rec => statusFilter.includes(rec.status));
    }

    if (tableDateFilter) {
        filtered = filtered.filter(rec => dayjs(rec.date).isSame(tableDateFilter, 'day'));
    }

    return filtered;
  }, [records, searchText, statusFilter, tableDateFilter, studentMap, classMap]);

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>, // AntD built-in filters, not used here as we have external
    sorter: SorterResult<AttendanceRecord> | SorterResult<AttendanceRecord>[],
  ) => {
    setTableParams({
      pagination,
      sorter,
    });
  };

  const columns: ColumnsType<AttendanceRecord> = [
    {
      title: t('attendanceLogTable.columns.date', 'Date'),
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      width: 120,
    },
    {
      title: t('attendanceLogTable.columns.studentName', 'Student Name'),
      dataIndex: 'studentId',
      key: 'studentName',
      render: (studentId: string) => studentMap.get(studentId) || studentId,
      sorter: (a, b) => (studentMap.get(a.studentId) || '').localeCompare(studentMap.get(b.studentId) || ''),
      ellipsis: true,
    },
    {
      title: t('attendanceLogTable.columns.className', 'Class/Course'),
      dataIndex: 'classId',
      key: 'className',
      render: (classId: string) => classMap.get(classId) || classId,
      sorter: (a, b) => (classMap.get(a.classId) || '').localeCompare(classMap.get(b.classId) || ''),
      ellipsis: true,
    },
    {
      title: t('attendanceLogTable.columns.status', 'Status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: AttendanceStatus) => (
        <Tag color={getStatusColor(status)}>{t(`attendanceStatus.${status}`, status)}</Tag>
      ),
      sorter: (a, b) => a.status.localeCompare(b.status),
      width: 120,
    },
    {
      title: t('attendanceLogTable.columns.reason', 'Reason'),
      dataIndex: 'absenceReason',
      key: 'reason',
      render: (reason?: string) => reason ? t(`attendanceReasons.${reason.replace(/\s+/g, '')}`, reason) : <Typography.Text type="secondary">{t('common.notApplicable', 'N/A')}</Typography.Text>,
      ellipsis: true,
    },
    {
      title: t('attendanceLogTable.columns.notes', 'Notes'),
      dataIndex: 'notes',
      key: 'notes',
      render: (notes?: string) => notes || '',
      ellipsis: true,
    },
    {
      title: t('attendanceLogTable.columns.actions', 'Actions'),
      key: 'actions',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <Tooltip title={t('attendanceLogTable.actions.editRecord', 'Edit Record')}>
          <Button icon={<EyeOutlined />} onClick={() => onEditRecord && onEditRecord(record)} size="small" />
        </Tooltip>
      ),
    },
  ];

  return (
    <Card title={t('attendanceLogTable.title', 'Attendance Log')}>
        <Row gutter={[16,16]} style={{marginBottom: 16}}>
            <Col xs={24} sm={12} md={8}>
                <Search
                    placeholder={t('attendanceLogTable.filters.searchPlaceholder', 'Search Student/Class...')}
                    onSearch={value => setSearchText(value)}
                    onChange={e => setSearchText(e.target.value)}
                    allowClear
                />
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Select
                    mode="multiple"
                    allowClear
                    style={{ width: '100%' }}
                    placeholder={t('attendanceLogTable.filters.statusPlaceholder', 'Filter by Status')}
                    onChange={setStatusFilter}
                    options={attendanceStatusesForFilter.map(status => ({
                        label: t(`attendanceStatus.${status}`, status),
                        value: status,
                    }))}
                    maxTagCount="responsive"
                />
            </Col>
            <Col xs={24} sm={12} md={6}>
                <DatePicker
                    style={{ width: '100%' }}
                    placeholder={t('attendanceLogTable.filters.datePlaceholder', 'Filter by Date')}
                    onChange={date => setTableDateFilter(date)}
                    format="YYYY-MM-DD"
                    allowClear
                />
            </Col>
        </Row>
      <Table
        columns={columns}
        dataSource={processedAndFilteredRecords}
        loading={loading}
        rowKey="id"
        pagination={{...tableParams.pagination, total: processedAndFilteredRecords.length}}
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }}
        size="middle"
      />
    </Card>
  );
};

export default React.memo(AttendanceLogTable);
