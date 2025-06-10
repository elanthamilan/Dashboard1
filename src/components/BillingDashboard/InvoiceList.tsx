import React from 'react';
import { Table, Tag, Button, Typography, Empty, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { Invoice, InvoiceStatus } from './types'; // Assuming types.ts is in the same directory
import { Student } from '../AttendanceDashboard/types'; // To get student names
import { useTranslation } from 'react-i18next'; // Optional

const { Text } = Typography;

interface InvoiceListProps {
  invoices: Invoice[];
  students: Student[]; // For looking up student names
  loading: boolean;
  onViewInvoiceDetails?: (invoiceId: string) => void; // Optional action
}

// Helper to get student name
const getStudentName = (studentId: string, students: Student[]): string => {
  const student = students.find(s => s.id === studentId);
  return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
};

// Tag colors for different statuses
const statusColors: Record<InvoiceStatus, string> = {
  Draft: 'default',
  Sent: 'processing', // or 'blue'
  Paid: 'success',
  Unpaid: 'warning',
  Overdue: 'error',
  Cancelled: 'default',
};

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, students, loading, onViewInvoiceDetails }) => {
  const { t } = useTranslation(); // Optional

  const columns: ColumnsType<Invoice> = [
    {
      title: t('billingDashboard.invoiceList.invoiceId', 'Invoice ID'),
      dataIndex: 'invoiceId',
      key: 'invoiceId',
      sorter: (a, b) => a.invoiceId.localeCompare(b.invoiceId),
    },
    {
      title: t('billingDashboard.invoiceList.studentName', 'Student Name'),
      dataIndex: 'studentId',
      key: 'studentName',
      render: (studentId: string) => getStudentName(studentId, students),
      sorter: (a, b) => getStudentName(a.studentId, students).localeCompare(getStudentName(b.studentId, students)),
    },
    {
      title: t('billingDashboard.invoiceList.issueDate', 'Issue Date'),
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
      sorter: (a, b) => dayjs(a.issueDate).unix() - dayjs(b.issueDate).unix(),
    },
    {
      title: t('billingDashboard.invoiceList.dueDate', 'Due Date'),
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
      sorter: (a, b) => dayjs(a.dueDate).unix() - dayjs(b.dueDate).unix(),
    },
    {
      title: t('billingDashboard.invoiceList.totalAmount', 'Total Amount'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right',
      render: (amount: number) => `${t('currencySymbol', '$')}${amount.toFixed(2)}`,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: t('billingDashboard.invoiceList.status', 'Status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: InvoiceStatus) => (
        <Tag color={statusColors[status] || 'default'}>{status}</Tag>
      ),
      filters: Object.keys(statusColors).map(statusKey => ({
        text: statusKey,
        value: statusKey,
      })),
      onFilter: (value, record) => record.status === value,
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
  ];

  if (onViewInvoiceDetails) {
    columns.push({
      title: t('common.actions', 'Actions'),
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Button type="link" onClick={() => onViewInvoiceDetails(record.invoiceId)}>
          {t('common.viewDetails', 'View Details')}
        </Button>
      ),
    });
  }

  if (loading) {
      return <Spin style={{display: 'block', marginTop: '20px'}} />;
  }

  if (invoices.length === 0 && !loading) {
      return <Empty description={t('billingDashboard.invoiceList.noInvoices', 'No invoices to display.')} style={{marginTop: '20px'}}/>;
  }

  return (
    <Table
      columns={columns}
      dataSource={invoices}
      rowKey="invoiceId"
      loading={loading}
      pagination={{ pageSize: 10, showSizeChanger: true }}
      scroll={{ x: true }} // For responsiveness
      style={{ marginTop: '24px' }}
    />
  );
};

export default InvoiceList;
