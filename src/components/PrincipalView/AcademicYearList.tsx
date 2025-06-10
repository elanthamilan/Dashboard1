// src/components/PrincipalView/AcademicYearList.tsx
import React from 'react';
import { List, Card, Statistic, Button, Row, Col, Typography } from 'antd';
import { AcademicYear } from '../../types/hierarchy'; // Adjust path

const { Title } = Typography;

interface AcademicYearListProps {
  academicYears: AcademicYear[];
  onSelectAcademicYear: (academicYearId: string) => void;
}

const AcademicYearList: React.FC<AcademicYearListProps> = ({ academicYears, onSelectAcademicYear }) => {
  if (!academicYears || academicYears.length === 0) {
    return <p>No academic years available for this institution.</p>;
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <Title level={4} style={{ marginBottom: '16px' }}>Academic Years</Title>
      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 3 }}
        dataSource={academicYears}
        renderItem={year => (
          <List.Item>
            <Card title={year.yearName}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Total Students" value={year.totalStudents} />
                </Col>
                <Col span={12}>
                  <Statistic title="Avg. GPA" value={year.overallAverageGPA?.toFixed(2) || 'N/A'} />
                </Col>
              </Row>
              <Button type="primary" style={{ marginTop: '20px' }} onClick={() => onSelectAcademicYear(year.yearId)}>
                View Degrees
              </Button>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default AcademicYearList;
