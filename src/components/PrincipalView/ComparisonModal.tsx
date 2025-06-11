// src/components/PrincipalView/ComparisonModal.tsx
import React from 'react';
import { Modal, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

// Define ComparisonItemType and ComparisonItem
export type ComparisonItemType = 'Program' | 'Degree' | 'AcademicYear' | 'Institution';

export interface ComparisonItem {
  id: string;
  name: string;
  type: ComparisonItemType;
  totalStudents?: number;
  // GPA-like fields
  averageGPA?: number; // Will hold averageProgramGPA, averageDegreeGPA, overallAverageGPA, etc.
  // Attendance-like fields
  attendancePercentage?: number; // Will hold avgAttendancePercentage, annualAttendancePercentage, etc.
  totalAbsences?: number;
  // Billing-like fields
  feesPaidPercentage?: number; // Will hold avgFeesPaidPercentage, annualFeesPaidPercentage, etc.
  studentsWithOverdueFees?: number;
  // Admission-like fields (common subset)
  applicants?: number;
  acceptanceRate?: number;
  enrolledCount?: number;
  // Program specific (optional)
  requiredCredits?: number;
  graduationRate?: number;
  // Risk & Grade distribution (optional)
  atRiskStudents?: number;
  // gradeDistribution?: { [gradeCategory: string]: number }; // Maybe too complex for now
}

interface ComparisonModalProps {
  open: boolean; // Changed from visible to open
  items: ComparisonItem[];
  onClose: () => void;
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ open, items, onClose }) => { // Changed from visible to open
  if (items.length === 0 && open) { // Changed from visible to open
    onClose();
    return null;
  }
  if (items.length === 0) {
      return null;
  }

  // Prepare data for table
  const dataSource = items.map(item => ({ ...item, key: item.id }));

  const columns: ColumnsType<ComparisonItem & { key: string }> = [
    { title: 'Name', dataIndex: 'name', key: 'name', fixed: 'left', width: 200 },
    {
      title: 'Total Students',
      dataIndex: 'totalStudents',
      key: 'totalStudents',
      align: 'right',
      width: 120,
      render: (val?: number) => val ?? 'N/A'
    },
    {
      title: 'Average GPA',
      dataIndex: 'averageGPA',
      key: 'averageGPA',
      align: 'right',
      width: 120,
      render: (gpa?: number) => gpa?.toFixed(2) || 'N/A'
    },
    {
      title: 'Avg. Attendance (%)',
      dataIndex: 'attendancePercentage',
      key: 'attendancePercentage',
      align: 'right',
      width: 150,
      render: (val?: number) => val !== undefined ? `${val.toFixed(1)}%` : 'N/A'
    },
    {
      title: 'Total Absences',
      dataIndex: 'totalAbsences',
      key: 'totalAbsences',
      align: 'right',
      width: 130,
      render: (val?: number) => val ?? 'N/A'
    },
    {
      title: 'Avg. Fees Paid (%)',
      dataIndex: 'feesPaidPercentage',
      key: 'feesPaidPercentage',
      align: 'right',
      width: 150,
      render: (val?: number) => val !== undefined ? `${val.toFixed(1)}%` : 'N/A'
    },
    {
      title: 'Students w/ Overdue Fees',
      dataIndex: 'studentsWithOverdueFees',
      key: 'studentsWithOverdueFees',
      align: 'right',
      width: 180,
      render: (val?: number) => val ?? 'N/A'
    },
    {
      title: 'Applicants',
      dataIndex: 'applicants',
      key: 'applicants',
      align: 'right',
      width: 120,
      render: (val?: number) => val ?? 'N/A'
    },
    {
      title: 'Acceptance Rate (%)',
      dataIndex: 'acceptanceRate',
      key: 'acceptanceRate',
      align: 'right',
      width: 150,
      render: (val?: number) => val !== undefined ? `${val.toFixed(1)}%` : 'N/A'
    },
    {
      title: 'Enrolled Count',
      dataIndex: 'enrolledCount',
      key: 'enrolledCount',
      align: 'right',
      width: 130,
      render: (val?: number) => val ?? 'N/A'
    },
    {
      title: 'At-Risk Students',
      dataIndex: 'atRiskStudents',
      key: 'atRiskStudents',
      align: 'right',
      width: 130,
      render: (val?: number) => val ?? 'N/A'
    },
  ];

  const itemType = items.length > 0 ? items[0].type : undefined;

  if (itemType === 'Program') {
    columns.push({
      title: 'Required Credits',
      dataIndex: 'requiredCredits',
      key: 'requiredCredits',
      align: 'right',
      width: 130,
      render: (val?: number) => val ?? 'N/A'
    });
    columns.push({
      title: 'Graduation Rate (%)',
      dataIndex: 'graduationRate',
      key: 'graduationRate',
      align: 'right',
      width: 150,
      render: (rate?: number) => rate !== undefined ? `${rate.toFixed(1)}%` : 'N/A'
    });
  }

  return (
    <Modal
      title={<Title level={4}>Comparison View</Title>}
      open={open} // Changed from visible to open
      onCancel={onClose}
      footer={null}
      width={1200} // Adjusted width for more columns
    >
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        scroll={{ x: true }} // Enable horizontal scroll
        size="small"
      />
    </Modal>
  );
};

export default ComparisonModal;
