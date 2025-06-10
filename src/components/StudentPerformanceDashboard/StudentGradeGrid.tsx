import React, { useState, useMemo, useEffect } from 'react';
import { Table, Form, Input, Select, InputNumber, Button, Popconfirm, Typography, Tag, Tooltip, Card } from 'antd';
import { ColumnType, ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { StudentAcademicRecord, Term, CourseEnrollment, Grade } from './types'; // Adjust path
import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: keyof CourseEnrollmentDisplayItem | 'grade.letterGrade' | 'grade.numericalScore';
  title: any;
  inputType: 'number' | 'text' | 'select';
  record: CourseEnrollmentDisplayItem;
  index: number;
  children: React.ReactNode;
  selectOptions?: Array<{label: string, value: string | number}>;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  selectOptions,
  ...restProps
}) => {
  const { t } = useTranslation();
  let inputNode: React.ReactNode = null;
  if (inputType === 'number') {
    inputNode = <InputNumber min={0} max={100} style={{width: '100%'}} placeholder={t('studentGradeGrid.placeholders.score', '0-100')} />;
  } else if (inputType === 'select' && selectOptions) {
    inputNode = (
        <Select style={{width: '100%'}} placeholder={t('studentGradeGrid.placeholders.grade', 'Select Grade')}>
            {selectOptions.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
        </Select>
    );
  } else {
    inputNode = <Input placeholder={t('studentGradeGrid.placeholders.comments', 'Enter comments')} />;
  }

  // For nested paths like 'grade.letterGrade'
  const fieldName = dataIndex.includes('.') ? dataIndex.split('.') as [string, string] : dataIndex;

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item name={fieldName} style={{ margin: 0 }}
                   rules={dataIndex === 'grade.letterGrade' ? [{ required: true, message: t('common.validations.requiredField')}] : []}>
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

// Helper to assign grade points (simplified) - can be moved to a shared util
const gradeToPoints = (letterGrade: Grade['letterGrade']): number => {
    const mapping: { [key in Grade['letterGrade']]: number } = {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0, 'P': 0.0, 'NP': 0.0,
    };
    return mapping[letterGrade] || 0;
};
const letterGradeOptions: Array<{label: string, value: Grade['letterGrade']}> =
    ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'P', 'NP'].map(g => ({label: g, value: g as Grade['letterGrade']}));


interface CourseEnrollmentDisplayItem extends CourseEnrollment {
  key: string; // termId + courseId for unique key
  termName: string;
}

interface StudentGradeGridProps {
  studentAcademicRecord: StudentAcademicRecord | null;
  loading?: boolean;
  onGradeUpdate: (studentId: string, termId: string, courseId: string, updatedGradeDetails: Partial<Grade>, comments?: string) => void; // Callback for mock update
}

const StudentGradeGrid: React.FC<StudentGradeGridProps> = ({ studentAcademicRecord, loading, onGradeUpdate }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record: CourseEnrollmentDisplayItem) => record.key === editingKey;

  const edit = (record: Partial<CourseEnrollmentDisplayItem> & { key: React.Key }) => {
    form.setFieldsValue({
        ...record,
        'grade.letterGrade': record.grade?.letterGrade,
        'grade.numericalScore': record.grade?.numericalScore,
        // comments are directly on record
    });
    setEditingKey(record.key as string);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as any; // Cast to any to handle nested paths
      const [termId, courseId] = (key as string).split('|'); // Assuming key is "termId|courseId"

      const updatedGradeDetails: Partial<Grade> = {};
      if(row['grade.letterGrade']) {
        updatedGradeDetails.letterGrade = row['grade.letterGrade'];
        updatedGradeDetails.points = gradeToPoints(row['grade.letterGrade']); // Recalculate points
      }
      if(row['grade.numericalScore'] !== undefined) {
        updatedGradeDetails.numericalScore = row['grade.numericalScore'];
      }

      onGradeUpdate(studentAcademicRecord!.studentId, termId, courseId, updatedGradeDetails, row.comments);
      setEditingKey('');
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };


  const dataSource = useMemo(() => {
    if (!studentAcademicRecord) return [];
    const data: CourseEnrollmentDisplayItem[] = [];
    studentAcademicRecord.terms.forEach(term => {
      term.courses.forEach(course => {
        data.push({
          ...course,
          key: `${term.termId}|${course.courseId}`, // Unique key for editing
          termName: term.termName,
        });
      });
    });
    // Sort by term first (desc), then by course name (asc)
    return data.sort((a,b) => {
        if (a.termName > b.termName) return -1;
        if (a.termName < b.termName) return 1;
        return a.courseName.localeCompare(b.courseName);
    });
  }, [studentAcademicRecord]);


  // Custom column type to include 'editable'
  interface EditableColumnType<T> extends ColumnType<T> {
    editable?: boolean;
    // Align with AntD's DataIndex more closely for compatibility, allowing string keys or string arrays for paths.
    dataIndex?: (keyof T & string) | string[];
  }

  const columns: EditableColumnType<CourseEnrollmentDisplayItem>[] = [
    { title: t('studentGradeGrid.columns.term', 'Term'), dataIndex: 'termName', key: 'termName', width: 150, fixed: 'left', ellipsis: true },
    { title: t('studentGradeGrid.columns.courseCode', 'Course Code'), dataIndex: 'courseCode', key: 'courseCode', width: 120, ellipsis: true },
    { title: t('studentGradeGrid.columns.courseName', 'Course Name'), dataIndex: 'courseName', key: 'courseName', width: 200, ellipsis: true },
    { title: t('studentGradeGrid.columns.credits', 'Credits'), dataIndex: 'credits', key: 'credits', align: 'right', width: 80 },
    {
      title: t('studentGradeGrid.columns.letterGrade', 'Grade'),
      dataIndex: ['grade', 'letterGrade'], // Path for antd table
      key: 'letterGrade',
      width: 100,
      align: 'center',
      editable: true,
      render: (grade?: Grade['letterGrade']) => grade ? <Tag color={grade.startsWith("A") ? "success" : grade.startsWith("B") ? "processing" : grade.startsWith("C") ? "warning" : "error"}>{grade}</Tag> : '-',
    },
    {
      title: t('studentGradeGrid.columns.score', 'Score (%)'),
      dataIndex: ['grade', 'numericalScore'],
      key: 'score',
      width: 100,
      align: 'right',
      editable: true,
      render: (score?: number) => score ?? '-',
    },
    { title: t('studentGradeGrid.columns.instructor', 'Instructor'), dataIndex: 'instructor', key: 'instructor', width: 150, ellipsis: true, render: (text) => text || '-' },
    { title: t('studentGradeGrid.columns.comments', 'Comments'), dataIndex: 'comments', key: 'comments', width: 200, editable: true, ellipsis: true, render: (text) => text || '-' },
    {
      title: t('studentGradeGrid.columns.actions', 'Actions'),
      key: 'actions',
      align: 'center',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button onClick={() => save(record.key)} type="primary" size="small" icon={<CheckOutlined />} style={{ marginRight: 8 }} />
            <Popconfirm title={t('common.actions.sureToCancel', "Sure to cancel?")} onConfirm={cancel}>
              <Button size="small" icon={<CloseOutlined />} danger />
            </Popconfirm>
          </span>
        ) : (
          <Tooltip title={t('studentGradeGrid.actions.editGrade', "Edit Grade/Comments")}>
            <Button type="dashed" onClick={() => edit(record)} icon={<EditOutlined />} size="small" disabled={editingKey !== ''} />
          </Tooltip>
        );
      },
    },
  ];

  const mergedColumns = columns.map(col => {
    if (!col.editable) {
      return col;
    }
    // Helper to stringify dataIndex for consumption by EditableCell which expects a string path
    const getDataIndexPathString = (dataIndex: EditableColumnType<CourseEnrollmentDisplayItem>['dataIndex']): keyof CourseEnrollmentDisplayItem | 'grade.letterGrade' | 'grade.numericalScore' => {
        if (Array.isArray(dataIndex)) {
            return dataIndex.join('.') as 'grade.letterGrade' | 'grade.numericalScore'; // Assuming specific nested paths
        }
        return dataIndex as keyof CourseEnrollmentDisplayItem;
    };

    const currentDataIndexStr = getDataIndexPathString(col.dataIndex);

    return {
      ...col,
      onCell: (record: CourseEnrollmentDisplayItem) => ({
        record,
        inputType: currentDataIndexStr === 'grade.numericalScore' ? 'number'
                   : currentDataIndexStr === 'grade.letterGrade' ? 'select'
                   : 'text',
        dataIndex: currentDataIndexStr,
        title: col.title,
        editing: isEditing(record),
        selectOptions: currentDataIndexStr === 'grade.letterGrade' ? letterGradeOptions : undefined,
      }),
    };
  });


  return (
    <Card title={t('studentGradeGrid.title', "Student Grade Grid")}>
      <Form form={form} component={false}>
        <Table
          components={{ body: { cell: EditableCell } }}
          columns={mergedColumns as ColumnsType<CourseEnrollmentDisplayItem>}
          dataSource={dataSource}
          loading={loading}
          rowKey="key"
          pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', 'All'] }} // 'All' needs custom logic or high number
          scroll={{ x: 1300 }} // Ensure horizontal scroll for many columns
          size="middle"
          bordered
        />
      </Form>
    </Card>
  );
};

export default React.memo(StudentGradeGrid);
