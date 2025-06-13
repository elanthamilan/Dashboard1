import React, { useMemo } from 'react';
import { Scatter } from '@ant-design/plots';
import { Card, Spin, Typography, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { StudentAcademicRecord } from '../../../types/hierarchy';
import { AttendanceRecord, Student } from '../../../types/attendance';

interface AttendanceGradeScatterPlotProps {
  academicRecords: StudentAcademicRecord[];
  attendanceRecords: AttendanceRecord[];
  students: Student[]; // For student names
  title: string;
  loading: boolean;
}

interface PlotDataType {
  studentId: string;
  studentName: string;
  attendancePercentage: number;
  cumulativeGPA: number;
}

const AttendanceGradeScatterPlot: React.FC<AttendanceGradeScatterPlotProps> = ({
  academicRecords,
  attendanceRecords,
  students,
  title,
  loading,
}) => {
  const { t } = useTranslation();

  const studentNameMap = useMemo(() => {
    const map = new Map<string, string>();
    students.forEach(student => {
      map.set(student.id, `${student.firstName} ${student.lastName}`);
    });
    return map;
  }, [students]);

  const plotData = useMemo(() => {
    if (!academicRecords || !attendanceRecords || !students) {
      return [];
    }

    const attendanceByStudent: Record<string, { presentOrLate: number; relevantSessions: number }> = {};

    attendanceRecords.forEach(record => {
      if (!attendanceByStudent[record.studentId]) {
        attendanceByStudent[record.studentId] = { presentOrLate: 0, relevantSessions: 0 };
      }
      // Only count Present, Late, Absent towards relevant sessions for rate calculation
      // Excused are excluded from this particular rate.
      if (record.status === 'Present' || record.status === 'Late') {
        attendanceByStudent[record.studentId].presentOrLate++;
        attendanceByStudent[record.studentId].relevantSessions++;
      } else if (record.status === 'Absent') {
        attendanceByStudent[record.studentId].relevantSessions++;
      }
    });

    const dataPoints: PlotDataType[] = [];
    academicRecords.forEach(ar => {
      const studentAttData = attendanceByStudent[ar.studentId];
      let attendancePercentage: number | null = null; // Use null for filterable undefined state

      if (studentAttData && studentAttData.relevantSessions > 0) {
        attendancePercentage = parseFloat(((studentAttData.presentOrLate / studentAttData.relevantSessions) * 100).toFixed(1));
      }

      // Ensure GPA is a number and attendance was calculable
      if (ar.cumulativeGPA !== undefined && ar.cumulativeGPA !== null && !isNaN(ar.cumulativeGPA) &&
          attendancePercentage !== null && !isNaN(attendancePercentage)) {
        dataPoints.push({
          studentId: ar.studentId,
          studentName: studentNameMap.get(ar.studentId) || ar.studentId,
          attendancePercentage: attendancePercentage,
          cumulativeGPA: ar.cumulativeGPA,
        });
      }
    });
    return dataPoints;
  }, [academicRecords, attendanceRecords, students, studentNameMap]);

  if (loading) {
    return (
      <Card title={title}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}><Spin /></div>
      </Card>
    );
  }

  if (plotData.length === 0) {
    return (
      <Card title={title}>
        <div style={{ height: 350, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Empty description={t('common.noDataAvailableForChart', 'No data available for this chart.')} />
        </div>
      </Card>
    );
  }

  const config = {
    data: plotData,
    xField: 'attendancePercentage',
    yField: 'cumulativeGPA',
    shape: 'circle',
    size: 4,
    height: 350,
    xAxis: {
      title: { text: t('charts.attendanceAxisTitle', 'Attendance Percentage (%)') },
      min: 0,
      max: 100,
      label: { formatter: (val: number) => `${val}%` },
    },
    yAxis: {
      title: { text: t('charts.gpaAxisTitle', 'Cumulative GPA') },
      min: 0,
      max: 4.0,
      label: { formatter: (val: number) => val.toFixed(1) },
    },
    tooltip: {
      formatter: (datum: PlotDataType) => ({
        name: datum.studentName,
        value: `Attendance: ${datum.attendancePercentage}%, GPA: ${datum.cumulativeGPA.toFixed(2)}`,
      }),
    },
    padding: 'auto' as const,
  };

  return (
    <Card title={title}>
      <Scatter {...config} />
    </Card>
  );
};

export default AttendanceGradeScatterPlot;
