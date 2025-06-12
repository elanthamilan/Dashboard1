import React, { useState, useMemo } from 'react';
import { List, Card, Statistic, Button, Row, Col, Typography, Checkbox, Empty, message } from 'antd';
import { Department } from '../../types/departments'; // Correct import path
import { downloadCSV } from '../../utils/exportUtils';

const { Text } = Typography;

interface DepartmentListProps {
  departments: Department[];
  onSelectDepartment: (id: string) => void;
  onCompareDepartments: (ids: string[]) => void;
  loading?: boolean;
  // Optional: Pass faculty name for context
  // facultyName?: string;
}

const DepartmentList: React.FC<DepartmentListProps> = ({
  departments,
  onSelectDepartment,
  onCompareDepartments,
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
      onCompareDepartments(selectedForCompare);
    } else {
      message.warning('Please select 2 or 3 departments to compare.');
    }
  };

  const handleGenerateReport = () => {
    const columns = [
      { key: 'departmentId', title: 'ID' },
      { key: 'departmentName', title: 'Name' },
      { key: 'facultyId', title: 'Faculty ID' },
      { key: 'totalStudents', title: 'Total Students' },
      { key: 'departmentAverageGPA', title: 'Average GPA' },
      { key: 'departmentPlacementRate', title: 'Placement Rate (%)' },
      { key: 'departmentPassRate', title: 'Pass Rate (%)' },
      // Add degrees count to data
    ];
    const dataToExport = departments.map(d => ({
      ...d,
      degreeIdsCount: d.degreeIds?.length || 0,
      totalStudents: d.totalStudents || 0,
      departmentAverageGPA: d.departmentAverageGPA?.toFixed(2) || 'N/A',
      departmentPlacementRate: d.departmentPlacementRate?.toFixed(1) || 'N/A',
      departmentPassRate: d.departmentPassRate?.toFixed(1) || 'N/A',
    }));
    columns.splice(3,0, {key: 'degreeIdsCount', title: 'Degrees Count'});


    downloadCSV(dataToExport, columns, 'departments_report');
  };

  const compareButtonDisabled = useMemo(() => {
    return selectedForCompare.length < 2 || selectedForCompare.length > 3;
  }, [selectedForCompare]);

  if (loading) {
    return (
      <Card>
        <Text>Loading departments...</Text>
      </Card>
    );
  }

  if (!departments || departments.length === 0) {
    return (
      <Card>
        <Empty description="No departments available for this faculty." />
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
        dataSource={departments}
        renderItem={dept => (
          <List.Item>
            <Card
              title={dept.departmentName}
              actions={[
                <Button type="link" onClick={() => onSelectDepartment(dept.departmentId)}>
                  View Degrees
                </Button>,
              ]}
              extra={
                <Checkbox
                  onChange={e => handleCompareSelectionChange(dept.departmentId, e.target.checked)}
                  checked={selectedForCompare.includes(dept.departmentId)}
                />
              }
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Total Students" value={dept.totalStudents ?? 'N/A'} />
                </Col>
                <Col span={12}>
                  <Statistic title="Average GPA" value={dept.departmentAverageGPA?.toFixed(2) ?? 'N/A'} />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Total Degrees" value={dept.degreeIds?.length ?? 0} />
                </Col>
                <Col span={12}>
                  <Statistic title="Placement Rate" value={dept.departmentPlacementRate ? `${dept.departmentPlacementRate.toFixed(1)}%` : 'N/A'} />
                </Col>
              </Row>
               <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Pass Rate" value={dept.departmentPassRate ? `${dept.departmentPassRate.toFixed(1)}%` : 'N/A'} />
                </Col>
                {/* Add more relevant KPIs if available in Department type */}
              </Row>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default React.memo(DepartmentList);
