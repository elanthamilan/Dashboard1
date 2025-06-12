import React, { useState, useMemo } from 'react';
import { List, Card, Statistic, Button, Row, Col, Typography, Checkbox, Empty, message } from 'antd';
import { Section, StudentSummary } from '../../types/hierarchy'; // StudentSummary might be needed if displaying students directly
import { downloadCSV } from '../../utils/exportUtils';

const { Text } = Typography;

interface SectionListProps {
  sections: Section[];
  onSelectSection: (sectionId: string) => void; // Callback to view details or students for the section
  onCompareSections: (ids: string[]) => void;
  loading?: boolean;
  // Optional: Pass course name for context
  // courseName?: string;
}

const SectionList: React.FC<SectionListProps> = ({
  sections,
  onSelectSection,
  onCompareSections,
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
      onCompareSections(selectedForCompare);
    } else {
      message.warning('Please select 2 or 3 sections to compare.');
    }
  };

  const handleGenerateReport = () => {
    const columns = [
      { key: 'sectionId', title: 'ID' },
      { key: 'sectionName', title: 'Name' },
      { key: 'courseId', title: 'Course ID' },
      { key: 'instructorName', title: 'Instructor' },
      { key: 'schedule', title: 'Schedule' },
      { key: 'studentCount', title: 'Student Count' },
      { key: 'averageAttendance', title: 'Avg. Attendance (%)' },
      { key: 'classroom', title: 'Classroom'}
    ];
    const dataToExport = sections.map(s => ({
      ...s,
      instructorName: s.instructorName || 'N/A',
      schedule: s.schedule || 'N/A',
      studentCount: s.studentCount || s.students?.length || 0,
      averageAttendance: s.averageAttendance?.toFixed(1) || 'N/A',
      classroom: s.classroom || 'N/A',
    }));

    downloadCSV(dataToExport, columns, 'sections_report');
  };

  const compareButtonDisabled = useMemo(() => {
    return selectedForCompare.length < 2 || selectedForCompare.length > 3;
  }, [selectedForCompare]);

  if (loading) {
    return (
      <Card>
        <Text>Loading sections...</Text>
      </Card>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <Card>
        <Empty description="No sections available for this course." />
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
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
        dataSource={sections}
        renderItem={section => (
          <List.Item>
            <Card
              title={section.sectionName}
              actions={[
                // The onSelectSection callback will be handled by PrincipalViewDashboard
                // to potentially show a list of students in that section.
                <Button type="link" onClick={() => onSelectSection(section.sectionId)}>
                  View Students
                </Button>,
              ]}
              extra={
                <Checkbox
                  onChange={e => handleCompareSelectionChange(section.sectionId, e.target.checked)}
                  checked={selectedForCompare.includes(section.sectionId)}
                />
              }
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Student Count" value={section.studentCount ?? section.students?.length ?? 'N/A'} />
                </Col>
                <Col span={12}>
                  <Statistic title="Avg. Attendance" value={section.averageAttendance ? `${section.averageAttendance.toFixed(1)}%` : 'N/A'} />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Instructor" value={section.instructorName ?? 'N/A'} />
                </Col>
                <Col span={12}>
                  <Statistic title="Classroom" value={section.classroom ?? 'N/A'} />
                </Col>
              </Row>
               <Row gutter={16}>
                <Col span={24}>
                  <Statistic title="Schedule" value={section.schedule ?? 'N/A'} valueStyle={{fontSize: '1em'}}/>
                </Col>
              </Row>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default React.memo(SectionList);
