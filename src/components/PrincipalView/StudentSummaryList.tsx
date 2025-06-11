// src/components/PrincipalView/StudentSummaryList.tsx
import React from 'react';
import { Table, Typography, Tag, Button, Tooltip } from 'antd'; // Added Tooltip
import { WarningFilled } from '@ant-design/icons';
import { StudentSummary } from '../../types/hierarchy';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface StudentSummaryListProps {
  students: StudentSummary[];
  onSelectStudent: (studentId: string) => void;
}

// Define a more specific type for the student data expected by this component now
interface StudentSummaryWithDetails extends StudentSummary {
  attendanceRate?: number;
  atRiskStatus?: 'Low' | 'Medium' | 'High' | 'None';
}


const StudentSummaryList: React.FC<StudentSummaryListProps> = ({ students, onSelectStudent }) => {
  if (!students || students.length === 0) {
    return <p>No students to display for this selection.</p>;
  }

  const columns: ColumnsType<StudentSummaryWithDetails> = [
    { title: 'ID', dataIndex: 'studentId', key: 'studentId', width: 100, sorter: (a, b) => a.studentId.localeCompare(b.studentId) },
    { title: 'First Name', dataIndex: 'firstName', key: 'firstName', width: 150, sorter: (a, b) => a.firstName.localeCompare(b.firstName) },
    { title: 'Last Name', dataIndex: 'lastName', key: 'lastName', width: 150, sorter: (a, b) => a.lastName.localeCompare(b.lastName) },
    { title: 'Program', dataIndex: 'programName', key: 'programName', responsive: ['md'], sorter: (a, b) => a.programName.localeCompare(b.programName) },
    { title: 'GPA', dataIndex: 'cumulativeGPA', key: 'cumulativeGPA', width: 100, sorter: (a, b) => (a.cumulativeGPA || 0) - (b.cumulativeGPA || 0), render: (gpa?: number) => gpa?.toFixed(2) || 'N/A' },
    {
      title: 'Attendance (%)',
      dataIndex: 'attendanceRate',
      key: 'attendanceRate',
      width: 120,
      responsive: ['md'],
      render: (rate?: number) => rate !== undefined ? rate.toFixed(1) + '%' : 'N/A',
      sorter: (a, b) => (a.attendanceRate || 0) - (b.attendanceRate || 0)
    },
    {
      title: 'Risk Status',
      dataIndex: 'atRiskStatus',
      key: 'atRiskStatus',
      width: 120,
      responsive: ['sm'],
      render: (status?: StudentSummaryWithDetails['atRiskStatus'], record: StudentSummaryWithDetails) => {
        const tooltipTitle = "Student's assessed risk level. High or Medium may indicate a need for support based on GPA or attendance.";
        let tagContent;

        switch (status) {
          case 'High':
            tagContent = <Tag color="red" icon={<WarningFilled />}>{status}</Tag>;
            break;
          case 'Medium':
            tagContent = <Tag color="orange" icon={<WarningFilled />}>{status}</Tag>;
            break;
          case 'Low':
            tagContent = <Tag color="green">{status}</Tag>;
            break;
          case 'None':
          default: // Handles undefined or 'None'
            tagContent = <Tag color="green">{status || 'Low'}</Tag>; // Default to 'Low' if status is undefined or 'None'
            break;
        }
        return <Tooltip title={tooltipTitle}>{tagContent}</Tooltip>;
      },
      sorter: (a, b) => (a.atRiskStatus || '').localeCompare(b.atRiskStatus || ''),
      filters: [
        { text: 'Low', value: 'Low'},
        { text: 'Medium', value: 'Medium'},
        { text: 'High', value: 'High'},
        { text: 'None', value: 'None'}
      ],
      onFilter: (value: React.Key | boolean, record) => record.atRiskStatus === value,
    },
    { title: 'Credits', dataIndex: 'totalCreditsEarned', key: 'totalCreditsEarned', width: 100, responsive: ['lg'], sorter: (a, b) => (a.totalCreditsEarned || 0) - (b.totalCreditsEarned || 0) },
    {
      title: 'Status',
      dataIndex: 'enrollmentStatus',
      key: 'enrollmentStatus',
      width: 120,
      responsive: ['sm'],
      filters: [
        { text: 'Active', value: 'Active'},
        { text: 'Inactive', value: 'Inactive'},
        { text: 'Graduated', value: 'Graduated'},
      ],
      onFilter: (value: React.Key | boolean, record) => record.enrollmentStatus === value
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_: any, record: StudentSummaryWithDetails) => (
        <Button type="link" onClick={() => onSelectStudent?.(record.studentId)}>
          View Details
        </Button>
      ),
    }
  ];

  return (
    <div style={{ marginTop: '24px' }}>
      <Title level={4} style={{ marginBottom: '16px' }}>Students</Title>
      <Table
        dataSource={students as StudentSummaryWithDetails[]}
        columns={columns}
        rowKey="studentId"
        scroll={{ x: true }}
        pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
      />
    </div>
  );
};

export default StudentSummaryList;
