// src/components/PrincipalView/DegreeList.tsx
import React from 'react';
import { List, Card, Statistic, Button, Row, Col, Typography } from 'antd';
import { Degree } from '../../types/hierarchy'; // Adjust path

const { Title } = Typography;

interface DegreeListProps {
  degrees: Degree[];
  onSelectDegree: (degreeId: string) => void;
}

const DegreeList: React.FC<DegreeListProps> = ({ degrees, onSelectDegree }) => {
  if (!degrees || degrees.length === 0) {
    return <p>No degrees available for this academic year.</p>;
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <Title level={4} style={{ marginBottom: '16px' }}>Degrees</Title>
      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 3 }}
        dataSource={degrees}
        renderItem={degree => (
          <List.Item>
            <Card title={degree.degreeName}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Total Students" value={degree.totalStudents} />
                </Col>
                <Col span={12}>
                  <Statistic title="Avg. GPA" value={degree.averageDegreeGPA?.toFixed(2) || 'N/A'} />
                </Col>
              </Row>
              <Button type="primary" style={{ marginTop: '20px' }} onClick={() => onSelectDegree(degree.degreeId)}>
                View Programs
              </Button>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default DegreeList;
