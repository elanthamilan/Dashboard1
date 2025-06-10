import React, { useState, useMemo } from 'react';
import { Table, Input, Select, Button, Tag, Space, DatePicker, Tooltip, Row, Col } from 'antd';
import { Applicant, ApplicationStatus } from './types'; // Adjust path as needed
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { FilterValue, SorterResult } from 'antd/es/table/interface';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { EyeOutlined, FilterOutlined } from '@ant-design/icons'; // For view details button

const { Search } = Input;
const { RangePicker } = DatePicker;

interface ApplicantTableProps {
  applicants: Applicant[];
  loading?: boolean;
  onViewDetails: (applicant: Applicant) => void; // Callback to open detail modal
}

// Helper for status colors
const getStatusColor = (status: ApplicationStatus): string => {
  switch (status) {
    case 'Accepted':
    case 'Enrollment Confirmed':
      return 'green';
    case 'Offered':
      return 'cyan';
    case 'Interview Scheduled':
      return 'blue';
    case 'Shortlisted':
      return 'geekblue';
    case 'Applied':
      return 'processing';
    case 'Rejected':
      return 'error';
    case 'Waitlisted':
      return 'warning';
    case 'Application Withdrawn':
      return 'default';
    default:
      return 'default';
  }
};

const applicationStatusesForFilter: ApplicationStatus[] = [
  'Applied', 'Shortlisted', 'Interview Scheduled', 'Offered', 'Accepted', 'Rejected', 'Waitlisted', 'Enrollment Confirmed', 'Application Withdrawn'
];


const ApplicantTable: React.FC<ApplicantTableProps> = ({ applicants, loading, onViewDetails }) => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<ApplicationStatus[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  const [tableParams, setTableParams] = useState<{
    pagination: TablePaginationConfig;
    sorter?: SorterResult<Applicant> | SorterResult<Applicant>[];
  }>({
    pagination: {
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '50', '100'],
    },
  });

  const filteredApplicants = useMemo(() => {
    let filtered = [...applicants];

    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      filtered = filtered.filter(app =>
        app.firstName.toLowerCase().includes(lowerSearchText) ||
        app.lastName.toLowerCase().includes(lowerSearchText) ||
        app.programName.toLowerCase().includes(lowerSearchText) ||
        app.id.toLowerCase().includes(lowerSearchText)
      );
    }

    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(app => selectedStatuses.includes(app.status));
    }

    if (dateRange && dateRange[0] && dateRange[1]) {
        const [startDate, endDate] = dateRange;
        filtered = filtered.filter(app => {
            const appDate = dayjs(app.applicationDate);
            return appDate.isBetween(startDate, endDate, 'day', '[]'); // '[]' includes start and end date
        });
    }

    return filtered;
  }, [applicants, searchText, selectedStatuses, dateRange]);

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>, // We are using external filters, so this might not be used directly
    sorter: SorterResult<Applicant> | SorterResult<Applicant>[],
  ) => {
    setTableParams({
      pagination,
      sorter,
    });
  };


  const columns: ColumnsType<Applicant> = [
    {
      title: t('admissionsTable.columns.applicantId', 'Applicant ID'),
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id.localeCompare(b.id),
      width: 150,
    },
    {
      title: t('admissionsTable.columns.name', 'Name'),
      dataIndex: 'firstName', // Will render using custom render function
      key: 'name',
      sorter: (a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
      render: (_, record) => `${record.firstName} ${record.lastName}`,
      ellipsis: true,
    },
    {
      title: t('admissionsTable.columns.program', 'Program'),
      dataIndex: 'programName',
      key: 'programName',
      sorter: (a, b) => a.programName.localeCompare(b.programName),
      ellipsis: true,
    },
    {
      title: t('admissionsTable.columns.status', 'Status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: ApplicationStatus) => (
        <Tag color={getStatusColor(status)}>{t(`applicationStatus.${status}`, status)}</Tag>
      ),
      sorter: (a, b) => a.status.localeCompare(b.status),
      width: 180,
    },
    {
      title: t('admissionsTable.columns.applicationDate', 'Application Date'),
      dataIndex: 'applicationDate',
      key: 'applicationDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
      sorter: (a, b) => dayjs(a.applicationDate).unix() - dayjs(b.applicationDate).unix(),
      width: 150,
    },
    {
      title: t('admissionsTable.columns.actions', 'Actions'),
      key: 'actions',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <Tooltip title={t('admissionsTable.actions.viewDetails', 'View Details')}>
          <Button icon={<EyeOutlined />} onClick={() => onViewDetails(record)} size="small" />
        </Tooltip>
      ),
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Row gutter={[16,16]} align="middle">
            <Col xs={24} sm={12} md={8} lg={6}>
                <Search
                    placeholder={t('admissionsTable.filters.searchPlaceholder', 'Search by Name, Program, ID...')}
                    onSearch={value => setSearchText(value)}
                    onChange={e => setSearchText(e.target.value)}
                    allowClear
                    style={{ width: '100%' }}
                />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                    mode="multiple"
                    allowClear
                    style={{ width: '100%' }}
                    placeholder={t('admissionsTable.filters.statusPlaceholder', 'Filter by Status')}
                    onChange={setSelectedStatuses}
                    options={applicationStatusesForFilter.map(status => ({
                        label: t(`applicationStatus.${status}`, status),
                        value: status,
                    }))}
                    maxTagCount="responsive"
                />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
                 <RangePicker
                    style={{ width: '100%' }}
                    onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null)}
                    format="YYYY-MM-DD"
                />
            </Col>
             <Col xs={24} sm={12} md={8} lg={6} style={{textAlign: 'right'}}>
                <Button icon={<FilterOutlined />} onClick={() => { /* Could open advanced filter modal */ }}>
                    {t('admissionsTable.filters.advancedFilters', 'Filters')}
                </Button>
            </Col>
        </Row>
      <Table
        columns={columns}
        dataSource={filteredApplicants}
        loading={loading}
        rowKey="id"
        pagination={{...tableParams.pagination, total: filteredApplicants.length}}
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }} // For responsiveness
        size="middle"
      />
    </Space>
  );
};

export default ApplicantTable;
