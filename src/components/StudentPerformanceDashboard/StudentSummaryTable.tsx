import React, { useMemo } from 'react';
import { Table, Typography, Tag, Tooltip, Button } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { Student } from '../../components/AttendanceDashboard/types'; // Shared Student type
import { StudentAcademicRecord } from './types';
import { EyeOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface StudentSummaryTableProps {
  students: Student[];
  academicRecords: StudentAcademicRecord[];
  loading?: boolean;
  onSelectStudent: (studentId: string) => void;
  selectedStudentId?: string;
}

interface StudentSummaryData {
    key: string; // studentId
    studentId: string;
    name: string;
    programName?: string;
    cumulativeGPA?: number;
    totalCreditsEarned?: number;
    overallProgress?: number; // Mocked for now, e.g., creditsEarned / requiredCredits
}


const StudentSummaryTable: React.FC<StudentSummaryTableProps> = ({
    students,
    academicRecords,
    loading,
    onSelectStudent,
    selectedStudentId
}) => {
  const { t } = useTranslation();

  const dataSource = useMemo(() => {
    return students.map(student => {
      const academicRecord = academicRecords.find(ar => ar.studentId === student.id);
      let overallProgress = 0;
      if (academicRecord && academicRecord.totalCreditsEarned && academicRecord.requiredCreditsForDegree) {
          overallProgress = Math.min(100, Math.round((academicRecord.totalCreditsEarned / academicRecord.requiredCreditsForDegree) * 100));
      }

      return {
        key: student.id,
        studentId: student.id,
        name: `${student.firstName} ${student.lastName}`,
        programName: academicRecord?.programName || t('common.notEnrolled', 'N/A'),
        cumulativeGPA: academicRecord?.cumulativeGPA,
        totalCreditsEarned: academicRecord?.totalCreditsEarned,
        overallProgress: overallProgress, // Will be displayed as a percentage
      };
    });
  }, [students, academicRecords, t]);

  const columns: ColumnsType<StudentSummaryData> = [
    {
      title: t('studentSummaryTable.columns.name', 'Name'),
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      ellipsis: true,
    },
    {
      title: t('studentSummaryTable.columns.program', 'Program'),
      dataIndex: 'programName',
      key: 'programName',
      sorter: (a, b) => (a.programName || '').localeCompare(b.programName || ''),
      ellipsis: true,
    },
    {
      title: t('studentSummaryTable.columns.gpa', 'Cum. GPA'),
      dataIndex: 'cumulativeGPA',
      key: 'gpa',
      align: 'right',
      sorter: (a, b) => (a.cumulativeGPA || 0) - (b.cumulativeGPA || 0),
      render: (gpa?: number) => gpa ? gpa.toFixed(2) : <Text type="secondary">{t('common.notApplicableShort', 'N/A')}</Text>,
    },
    {
      title: t('studentSummaryTable.columns.credits', 'Credits Earned'),
      dataIndex: 'totalCreditsEarned',
      key: 'credits',
      align: 'right',
      sorter: (a, b) => (a.totalCreditsEarned || 0) - (b.totalCreditsEarned || 0),
      render: (credits?: number) => credits ?? <Text type="secondary">{t('common.notApplicableShort', 'N/A')}</Text>,
    },
    {
        title: t('studentSummaryTable.columns.progress', 'Progress'),
        dataIndex: 'overallProgress',
        key: 'progress',
        align: 'center',
        sorter: (a, b) => (a.overallProgress || 0) - (b.overallProgress || 0),
        render: (progress?: number) => progress ? <Tag color={progress > 75 ? 'green' : progress > 40 ? 'blue' : 'orange'}>{progress}%</Tag> : <Text type="secondary">{t('common.notApplicableShort', 'N/A')}</Text>,
    },
    {
      title: t('studentSummaryTable.columns.actions', 'Actions'),
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Tooltip title={t('studentSummaryTable.actions.viewDetails', 'View Student Dashboard')}>
          <Button
            icon={<EyeOutlined />}
            onClick={() => onSelectStudent(record.studentId)}
            size="small"
            type={selectedStudentId === record.studentId ? "primary" : "default"}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      rowKey="key"
      pagination={{ pageSize: 5, showSizeChanger: true, pageSizeOptions: ['5', '10', '20'] }}
      scroll={{ x: 'max-content' }}
      size="middle"
      title={() => <Typography.Title level={4}>{t('studentSummaryTable.title', 'Student Academic Summaries')}</Typography.Title>}
    />
  );
};

export default React.memo(StudentSummaryTable);
