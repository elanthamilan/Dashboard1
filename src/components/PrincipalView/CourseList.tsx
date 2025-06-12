import React, { useState, useMemo } from 'react';
import { List, Card, Statistic, Button, Row, Col, Typography, Checkbox, Empty, message } from 'antd';
import { Course } from '../../types/hierarchy';
import { downloadCSV } from '../../utils/exportUtils';

const { Text } = Typography;

interface CourseListProps {
  courses: Course[];
  onSelectCourse: (id: string) => void;
  onCompareCourses: (ids: string[]) => void;
  loading?: boolean;
  // Optional: Pass semester/program name for context
  // parentEntityName?: string;
}

const CourseList: React.FC<CourseListProps> = ({
  courses,
  onSelectCourse,
  onCompareCourses,
  loading,
}) => {
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const handleCompareSelectionChange = (id: string, checked: boolean) => {
    setSelectedForCompare(prev =>
      checked ? [...prev, id] : prev.filter(item => item !== id)
    );
  };

  const handleCompare = () => {
    if (selectedForCompare.length >= 2 && selectedForCompare.length <= 3) {
      onCompareCourses(selectedForCompare);
    } else {
      message.warning('Please select 2 or 3 courses to compare.');
    }
  };

  const handleGenerateReport = () => {
    const columns = [
      { key: 'courseId', title: 'ID' },
      { key: 'courseName', title: 'Name' },
      { key: 'courseCode', title: 'Code' },
      { key: 'credits', title: 'Credits' },
      { key: 'semesterId', title: 'Semester ID' },
      { key: 'totalStudentsEnrolled', title: 'Total Students' },
      { key: 'averageGrade', title: 'Average Grade' },
      { key: 'passRate', title: 'Pass Rate (%)' },
      // Add sections count to data
    ];
    const dataToExport = courses.map(c => ({
      ...c,
      sectionsCount: c.sections?.length || 0,
      credits: c.credits || 'N/A',
      totalStudentsEnrolled: c.totalStudentsEnrolled || 0,
      averageGrade: c.averageGrade?.toFixed(1) || 'N/A',
      passRate: c.passRate?.toFixed(1) || 'N/A',
    }));
    columns.splice(5,0, {key: 'sectionsCount', title: 'Sections Count'});


    downloadCSV(dataToExport, columns, 'courses_report');
  };

  const compareButtonDisabled = useMemo(() => {
    return selectedForCompare.length < 2 || selectedForCompare.length > 3;
  }, [selectedForCompare]);

  if (loading) {
    return (
      <Card>
        <Text>Loading courses...</Text>
      </Card>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <Card>
        <Empty description="No courses available for this semester/program." />
      </Card>
    );
  }

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col>
          <Button type="primary" onClick={handleCompare} disabled={compareButtonDisabled}>
            Compare Selected ({selectedForCompare.length})
          </Button>
        </Col>
        <Col>
          <Button onClick={handleGenerateReport}>
            Generate Report (CSV)
          </Button>
        </Col>
      </Row>
      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }} // Adjusted grid for more info
        dataSource={courses}
        renderItem={course => (
          <List.Item>
            <Card
              title={`${course.courseName} (${course.courseCode || 'N/A'})`}
              actions={[
                <Button type="link" onClick={() => onSelectCourse(course.courseId)}>
                  View Sections
                </Button>,
              ]}
              extra={
                <Checkbox
                  onChange={e => handleCompareSelectionChange(course.courseId, e.target.checked)}
                  checked={selectedForCompare.includes(course.courseId)}
                />
              }
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Total Students" value={course.totalStudentsEnrolled ?? 'N/A'} />
                </Col>
                <Col span={12}>
                  <Statistic title="Credits" value={course.credits ?? 'N/A'} />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Average Grade" value={course.averageGrade?.toFixed(1) ?? 'N/A'} />
                </Col>
                <Col span={12}>
                  <Statistic title="Pass Rate" value={course.passRate ? `${course.passRate.toFixed(1)}%` : 'N/A'} />
                </Col>
              </Row>
               <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Sections" value={course.sections?.length ?? 0} />
                </Col>
                {/* Add more relevant KPIs if available in Course type */}
              </Row>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default React.memo(CourseList);
