// src/components/PrincipalView/ComparisonModal.tsx
import React from 'react';
import { Modal, Table, Typography } from 'antd';
import { Program } from '../../types/hierarchy'; // Adjust path
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface ComparisonModalProps {
  visible: boolean;
  programs: Program[];
  onClose: () => void;
}

interface ComparisonDataRow extends Program {
  key: string; // Required for Table
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ visible, programs, onClose }) => {
  if (programs.length === 0 && visible) { // Check visible to avoid rendering an empty modal briefly
    // This case should ideally be handled by not showing the modal if programs is empty,
    // but as a safeguard:
    onClose(); // Close it if it was somehow opened with no programs
    return null;
  }
  if (programs.length === 0) {
      return null;
  }


  // Prepare data for table
  const dataSource: ComparisonDataRow[] = programs.map(p => ({ ...p, key: p.programId }));

  const columns: ColumnsType<ComparisonDataRow> = [
    { title: 'Program Name', dataIndex: 'programName', key: 'programName', fixed: 'left', width: 250 },
    { title: 'Total Students', dataIndex: 'totalStudents', key: 'totalStudents', align: 'right', width: 120 },
    { title: 'Average GPA', dataIndex: 'averageProgramGPA', key: 'averageProgramGPA', align: 'right', width: 120, render: (gpa?: number) => gpa?.toFixed(2) || 'N/A' },
    { title: 'Required Credits', dataIndex: 'requiredCredits', key: 'requiredCredits', align: 'right', width: 130, render: (val?: number) => val || 'N/A' },
    {
      title: 'Graduation Rate',
      dataIndex: 'graduationRate',
      key: 'graduationRate',
      align: 'right',
      width: 130,
      // Corrected graduationRate display: program.graduationRate is already a percentage value
      render: (rate?: number) => rate ? `${rate.toFixed(0)}%` : 'N/A'
    },
  ];

  return (
    <Modal
      title={<Title level={4}>Program Comparison</Title>}
      open={visible} // Changed from 'visible' to 'open' for Antd v5+
      onCancel={onClose}
      footer={null} // No OK/Cancel buttons, just close
      width={800} // Wider modal for table
    >
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false} // No pagination needed for a few items
        scroll={{ x: true }}
        size="small"
      />
    </Modal>
  );
};

export default ComparisonModal;
