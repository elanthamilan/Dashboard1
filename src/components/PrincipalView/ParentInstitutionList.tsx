import React, { useState, useMemo } from 'react';
import { List, Card, Statistic, Button, Row, Col, Typography, Checkbox, Empty, message } from 'antd';
import { ParentInstitution } from '../../types/hierarchy';
import { downloadCSV } from '../../utils/exportUtils';

const { Title, Text } = Typography;

interface ParentInstitutionListProps {
  parentInstitutions: ParentInstitution[];
  onSelectParentInstitution: (id: string) => void;
  onCompareParentInstitutions: (ids: string[]) => void;
  loading?: boolean;
}

const ParentInstitutionList: React.FC<ParentInstitutionListProps> = ({
  parentInstitutions,
  onSelectParentInstitution,
  onCompareParentInstitutions,
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
      onCompareParentInstitutions(selectedForCompare);
    } else {
      message.warning('Please select 2 or 3 parent institutions to compare.');
    }
  };

  const handleGenerateReport = () => {
    const columns = [
      { key: 'parentInstitutionId', title: 'ID' },
      { key: 'parentInstitutionName', title: 'Name' },
      { key: 'totalStudents', title: 'Total Students' },
      { key: 'overallAverageGPA', title: 'Overall Avg. GPA' },
      { key: 'totalFaculty', title: 'Total Faculty' },
      { key: 'totalPrograms', title: 'Total Programs (Approx)' },
      { key: 'overallPlacementRate', title: 'Overall Placement Rate (%)' },
      { key: 'totalResearchGrantsValue', title: 'Total Research Grants Value' },
    ];
    // Add institutions count to data
    const dataToExport = parentInstitutions.map(pi => ({
        ...pi,
        institutionsCount: pi.institutions?.length || 0,
        totalStudents: pi.totalStudents || 0,
        overallAverageGPA: pi.overallAverageGPA?.toFixed(2) || 'N/A',
        totalFaculty: pi.totalFaculty || 0,
        totalPrograms: pi.totalPrograms || 0,
        overallPlacementRate: pi.overallPlacementRate?.toFixed(1) || 'N/A',
        totalResearchGrantsValue: pi.totalResearchGrantsValue || 0,
    }));
    columns.splice(2,0, {key: 'institutionsCount', title: 'Institutions Count'})

    downloadCSV(dataToExport, columns, 'parent_institutions_report');
  };

  const compareButtonDisabled = useMemo(() => {
    return selectedForCompare.length < 2 || selectedForCompare.length > 3;
  }, [selectedForCompare]);

  if (loading) {
    return (
      <Card>
        <Text>Loading parent institutions...</Text>
      </Card>
    );
  }

  if (!parentInstitutions || parentInstitutions.length === 0) {
    return (
      <Card>
        <Empty description="No parent institutions available." />
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
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 3 }}
        dataSource={parentInstitutions}
        renderItem={pi => (
          <List.Item>
            <Card
              title={pi.parentInstitutionName}
              actions={[
                <Button type="link" onClick={() => onSelectParentInstitution(pi.parentInstitutionId)}>
                  View Institutions
                </Button>,
              ]}
              extra={
                <Checkbox
                  onChange={e => handleCompareSelectionChange(pi.parentInstitutionId, e.target.checked)}
                  checked={selectedForCompare.includes(pi.parentInstitutionId)}
                />
              }
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Total Students" value={pi.totalStudents ?? 'N/A'} />
                </Col>
                <Col span={12}>
                  <Statistic title="Overall Avg. GPA" value={pi.overallAverageGPA?.toFixed(2) ?? 'N/A'} />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Total Institutions" value={pi.institutions?.length ?? 0} />
                </Col>
                 <Col span={12}>
                  <Statistic title="Total Faculty" value={pi.totalFaculty ?? 'N/A'} />
                </Col>
              </Row>
               <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Total Programs (Approx)" value={pi.totalPrograms ?? 'N/A'} />
                </Col>
                 <Col span={12}>
                  <Statistic title="Placement Rate" value={pi.overallPlacementRate ? `${pi.overallPlacementRate.toFixed(1)}%` : 'N/A'} />
                </Col>
              </Row>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default React.memo(ParentInstitutionList);
