// src/components/PrincipalView/StudentSummaryList.tsx
import React from 'react';
import { Table, Typography } from 'antd';
import { StudentSummary } from '../../types/hierarchy'; // Adjust path
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface StudentSummaryListProps {
  students: StudentSummary[];
  // onSelectStudent?: (studentId: string) => void; // For future navigation to full student detail
}

const StudentSummaryList: React.FC<StudentSummaryListProps> = ({ students }) => {
  if (!students || students.length === 0) {
    return <p>No students to display for this selection.</p>;
  }

  const columns: ColumnsType<StudentSummary> = [
    { title: 'ID', dataIndex: 'studentId', key: 'studentId', width: 100, sorter: (a, b) => a.studentId.localeCompare(b.studentId) },
    { title: 'First Name', dataIndex: 'firstName', key: 'firstName', width: 150, sorter: (a, b) => a.firstName.localeCompare(b.firstName) },
    { title: 'Last Name', dataIndex: 'lastName', key: 'lastName', width: 150, sorter: (a, b) => a.lastName.localeCompare(b.lastName) },
    { title: 'Program', dataIndex: 'programName', key: 'programName', responsive: ['md'], sorter: (a, b) => a.programName.localeCompare(b.programName) },
    { title: 'GPA', dataIndex: 'cumulativeGPA', key: 'cumulativeGPA', width: 100, sorter: (a, b) => (a.cumulativeGPA || 0) - (b.cumulativeGPA || 0), render: (gpa?: number) => gpa?.toFixed(2) || 'N/A' },
    { title: 'Credits', dataIndex: 'totalCreditsEarned', key: 'totalCreditsEarned', width: 100, responsive: ['lg'], sorter: (a, b) => (a.totalCreditsEarned || 0) - (b.totalCreditsEarned || 0) },
    { title: 'Status', dataIndex: 'enrollmentStatus', key: 'enrollmentStatus', width: 120, responsive: ['sm'], filters: [
        { text: 'Active', value: 'Active'},
        { text: 'Inactive', value: 'Inactive'},
        { text: 'Graduated', value: 'Graduated'},
    ], onFilter: (value: React.Key | boolean, record) => record.enrollmentStatus === value}, // Ensure 'value' type matches antd expectation
    // Add more columns or actions (like a view button) if needed
  ];

  return (
    <div style={{ marginTop: '24px' }}>
      <Title level={4} style={{ marginBottom: '16px' }}>Students</Title>
      <Table
        dataSource={students}
        columns={columns}
        rowKey="studentId"
        scroll={{ x: true }} // For responsiveness on smaller screens
        pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
      />
    </div>
  );
};

export default StudentSummaryList;
