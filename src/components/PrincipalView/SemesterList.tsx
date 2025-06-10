// src/components/PrincipalView/SemesterList.tsx
import React from 'react';
import { List, Card, Statistic, Button, Row, Col, Typography } from 'antd';
import { Semester } from '../../types/hierarchy'; // Adjust path

const { Title } = Typography;

interface SemesterListProps {
  semesters: Semester[];
  onSelectSemester: (semesterId: string) => void;
}

const SemesterList: React.FC<SemesterListProps> = ({ semesters, onSelectSemester }) => {
  if (!semesters || semesters.length === 0) {
    return <p>No semesters available for this program.</p>;
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <Title level={4} style={{ marginBottom: '16px' }}>Semesters</Title>
      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
        dataSource={semesters}
        renderItem={semester => (
          <List.Item>
            <Card title={semester.semesterName}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Total Students" value={semester.students?.length || 0} />
                </Col>
                <Col span={12}>
                  <Statistic title="Avg. GPA" value={semester.averageGPA?.toFixed(2) || 'N/A'} />
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: '10px' }}>
                <Col span={12}>
                   {/* Corrected passRate display */}
                   <Statistic title="Pass Rate" value={semester.passRate ? `${semester.passRate.toFixed(0)}%` : 'N/A'} />
                </Col>
                 {/* Add more semester specific stats if available */}
              </Row>
              <Button type="primary" style={{ marginTop: '20px' }} onClick={() => onSelectSemester(semester.semesterId)}>
                View Students
              </Button>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default SemesterList;
