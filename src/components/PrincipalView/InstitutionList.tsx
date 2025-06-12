import React, { useState, useMemo } from 'react';
import { List, Card, Statistic, Button, Row, Col, Typography, Checkbox, Empty, message } from 'antd';
import { Institution } from '../../types/hierarchy';
import { downloadCSV } from '../../utils/exportUtils';

const { Text } = Typography;

interface InstitutionListProps {
  institutions: Institution[];
  onSelectInstitution: (id: string) => void;
  onCompareInstitutions: (ids: string[]) => void;
  loading?: boolean;
  parentInstitutionName?: string; // Optional: for context
}

const InstitutionList: React.FC<InstitutionListProps> = ({
  institutions,
  onSelectInstitution,
  onCompareInstitutions,
  loading,
  parentInstitutionName,
}) => {
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const handleCompareSelectionChange = (id: string, checked: boolean) => {
    setSelectedForCompare(prev =>
      checked ? [...prev, id] : prev.filter(item => item !== id)
    );
  };

  const handleCompare = () => {
    if (selectedForCompare.length >= 2 && selectedForCompare.length <= 3) {
      onCompareInstitutions(selectedForCompare);
    } else {
      message.warning('Please select 2 or 3 institutions to compare.');
    }
  };

  const handleGenerateReport = () => {
    const columns = [
      { key: 'institutionId', title: 'ID' },
      { key: 'institutionName', title: 'Name' },
      { key: 'totalStudents', title: 'Total Students' },
      { key: 'overallAverageGPA', title: 'Overall Avg. GPA' },
      { key: 'facultiesCount', title: 'Faculties' },
      { key: 'academicYearsCount', title: 'Academic Years' },
      { key: 'overallPlacementRate', title: 'Placement Rate (%)' },
      // Add more KPIs as needed from Institution type
    ];
    const dataToExport = institutions.map(inst => ({
      ...inst,
      facultiesCount: inst.faculties?.length || 0,
      academicYearsCount: inst.academicYears?.length || 0,
      totalStudents: inst.totalStudents || 0,
      overallAverageGPA: inst.overallAverageGPA?.toFixed(2) || 'N/A',
      overallPlacementRate: inst.overallPlacementRate?.toFixed(1) || 'N/A',
    }));

    downloadCSV(dataToExport, columns, `institutions_report${parentInstitutionName ? '_for_' + parentInstitutionName : ''}`);
  };

  const compareButtonDisabled = useMemo(() => {
    return selectedForCompare.length < 2 || selectedForCompare.length > 3;
  }, [selectedForCompare]);

  if (loading) {
    return (
      <Card>
        <Text>Loading institutions...</Text>
      </Card>
    );
  }

  if (!institutions || institutions.length === 0) {
    return (
      <Card>
        <Empty description={`No institutions available${parentInstitutionName ? ' for ' + parentInstitutionName : ''}.`} />
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
        dataSource={institutions}
        renderItem={inst => (
          <List.Item>
            <Card
              title={inst.institutionName}
              actions={[
                <Button type="link" onClick={() => onSelectInstitution(inst.institutionId)}>
                  View Details {/* Or "View Academic Years" / "View Faculties" depending on next step */}
                </Button>,
              ]}
              extra={
                <Checkbox
                  onChange={e => handleCompareSelectionChange(inst.institutionId, e.target.checked)}
                  checked={selectedForCompare.includes(inst.institutionId)}
                />
              }
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Total Students" value={inst.totalStudents ?? 'N/A'} />
                </Col>
                <Col span={12}>
                  <Statistic title="Avg. GPA" value={inst.overallAverageGPA?.toFixed(2) ?? 'N/A'} />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Faculties" value={inst.faculties?.length ?? 0} />
                </Col>
                <Col span={12}>
                  <Statistic title="Placement Rate" value={inst.overallPlacementRate ? `${inst.overallPlacementRate.toFixed(1)}%` : 'N/A'} />
                </Col>
              </Row>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default React.memo(InstitutionList);
