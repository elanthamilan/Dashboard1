// src/components/PrincipalView/InstitutionDisplay.tsx
import React from 'react';
import { Card, Col, Row, Statistic, Typography, Button } from 'antd';
import { Institution } from '../../types/hierarchy'; // Adjust path as needed

const { Title } = Typography;

interface InstitutionDisplayProps {
  institution: Institution;
  onSelectInstitution: (institutionId: string) => void; // Callback to handle selection
}

const InstitutionDisplay: React.FC<InstitutionDisplayProps> = ({ institution, onSelectInstitution }) => {
  return (
    <Card title={<Title level={4}>{institution.institutionName}</Title>}>
      <Row gutter={16}>
        <Col span={12}>
          <Statistic title="Total Students" value={institution.totalStudents} />
        </Col>
        <Col span={12}>
          <Statistic title="Overall Average GPA" value={institution.overallAverageGPA?.toFixed(2) || 'N/A'} />
        </Col>
      </Row>
      <Button type="primary" style={{ marginTop: '20px' }} onClick={() => onSelectInstitution(institution.institutionId)}>
        View Academic Years
      </Button>
    </Card>
  );
};

export default InstitutionDisplay;
