import React, { useMemo } from 'react';
import { Table, Typography, Spin, Empty, Card } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { AttendanceRecord, Student } from './types'; // Assuming types are in the same folder or adjust path

interface ChronicAbsenteeismTableProps {
  records: AttendanceRecord[];
  students: Student[];
  loading: boolean;
}

interface ChronicAbsenteeismData {
  key: string; // studentId
  studentName: string;
  absences: number;
  scheduledDays: number;
  absenceRate: number;
}

const ChronicAbsenteeismTable: React.FC<ChronicAbsenteeismTableProps> = ({ records, students, loading }) => {
  const { t } = useTranslation();

  const studentMap = useMemo(() => new Map(students.map(s => [s.id, `${s.firstName} ${s.lastName}`])), [students]);

  const chronicAbsenteeismData = useMemo(() => {
    if (!records || records.length === 0 || !students || students.length === 0) {
      return [];
    }

    const studentStats: { [studentId: string]: { absences: number; presentLates: number } } = {};

    records.forEach(record => {
      if (!studentStats[record.studentId]) {
        studentStats[record.studentId] = { absences: 0, presentLates: 0 };
      }

      if (record.status === 'Absent') {
        studentStats[record.studentId].absences++;
      } else if (record.status === 'Present' || record.status === 'Late') {
        studentStats[record.studentId].presentLates++;
      }
      // 'Excused' records are intentionally excluded from this calculation
    });

    const absenteeismList: ChronicAbsenteeismData[] = [];
    for (const studentId in studentStats) {
      const stats = studentStats[studentId];
      const totalScheduledRecords = stats.absences + stats.presentLates;
      if (totalScheduledRecords > 0) {
        const absenceRate = (stats.absences / totalScheduledRecords) * 100;
        if (absenceRate >= 10) {
          absenteeismList.push({
            key: studentId,
            studentName: studentMap.get(studentId) || studentId,
            absences: stats.absences,
            scheduledDays: totalScheduledRecords,
            absenceRate: parseFloat(absenceRate.toFixed(1)), // Keep one decimal place
          });
        }
      }
    }
    return absenteeismList.sort((a, b) => b.absenceRate - a.absenceRate); // Sort by rate descending
  }, [records, students, studentMap]);

  const columns: ColumnsType<ChronicAbsenteeismData> = [
    {
      title: t('chronicAbsenteeismTable.columns.studentName', 'Student Name'),
      dataIndex: 'studentName',
      key: 'studentName',
      sorter: (a, b) => a.studentName.localeCompare(b.studentName),
      ellipsis: true,
    },
    {
      title: t('chronicAbsenteeismTable.columns.absences', 'Absences'),
      dataIndex: 'absences',
      key: 'absences',
      sorter: (a, b) => a.absences - b.absences,
      width: 120,
      align: 'right',
    },
    {
      title: t('chronicAbsenteeismTable.columns.scheduledDays', 'Scheduled Days (Filtered)'),
      dataIndex: 'scheduledDays',
      key: 'scheduledDays',
      sorter: (a, b) => a.scheduledDays - b.scheduledDays,
      width: 180,
      align: 'right',
    },
    {
      title: t('chronicAbsenteeismTable.columns.absenceRate', 'Absence Rate (%)'),
      dataIndex: 'absenceRate',
      key: 'absenceRate',
      sorter: (a, b) => a.absenceRate - b.absenceRate,
      render: (rate: number) => `${rate}%`,
      width: 150,
      align: 'right',
    },
  ];

  if (loading) {
    return (
        <Card title={t('chronicAbsenteeismTable.title', 'Chronic Absenteeism List (>= 10% Absence Rate)')}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}><Spin /></div>
        </Card>
    );
  }

  return (
    <Card title={t('chronicAbsenteeismTable.title', 'Chronic Absenteeism List (>= 10% Absence Rate)')}>
      {chronicAbsenteeismData.length === 0 ? (
        <Empty description={t('chronicAbsenteeismTable.noData', 'No chronically absent students found for the selected filters.')} style={{height: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}/>
      ) : (
        <Table
          columns={columns}
          dataSource={chronicAbsenteeismData}
          rowKey="key"
          pagination={{ pageSize: 5, showSizeChanger: true, pageSizeOptions: ['5', '10', '20'] }}
          scroll={{ x: 'max-content' }}
          size="middle"
        />
      )}
    </Card>
  );
};

export default ChronicAbsenteeismTable;
