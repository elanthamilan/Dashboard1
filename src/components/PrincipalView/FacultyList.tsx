import React, { useState, useMemo } from 'react';
import { List, Card, Statistic, Button, Row, Col, Typography, Checkbox, Empty, message } from 'antd';
import { Faculty } from '../../types/hierarchy'; // Assuming Faculty type is in hierarchy
import { downloadCSV } from '../../utils/exportUtils';

const { Text } = Typography;

interface FacultyListProps {
  faculties: Faculty[];
  onSelectFaculty: (id: string) => void;
  onCompareFaculties: (ids: string[]) => void;
  loading?: boolean;
  // Optional: Pass institution name for context if needed, or parent entity name
  // parentEntityName?: string;
}

const FacultyList: React.FC<FacultyListProps> = ({
  faculties,
  onSelectFaculty,
  onCompareFaculties,
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
      onCompareFaculties(selectedForCompare);
    } else {
      message.warning('Please select 2 or 3 faculties to compare.');
    }
  };

  const handleGenerateReport = () => {
    const columns = [
      { key: 'facultyId', title: 'ID' },
      { key: 'facultyName', title: 'Name' },
      { key: 'institutionId', title: 'Institution ID' },
      { key: 'totalStudents', title: 'Total Students' },
      { key: 'averageFacultyGPA', title: 'Average GPA' },
      { key: 'totalFacultyMembers', title: 'Total Faculty Members' },
      { key: 'researchProjectsCount', title: 'Research Projects' },
      // Add departments count to data
    ];
    const dataToExport = faculties.map(f => ({
      ...f,
      departmentsCount: f.departments?.length || 0,
      totalStudents: f.totalStudents || 0,
      averageFacultyGPA: f.averageFacultyGPA?.toFixed(2) || 'N/A',
      totalFacultyMembers: f.totalFacultyMembers || 0,
      researchProjectsCount: f.researchProjectsCount || 0,
    }));
    columns.splice(3,0, {key: 'departmentsCount', title: 'Departments Count'});


    downloadCSV(dataToExport, columns, 'faculties_report');
  };

  const compareButtonDisabled = useMemo(() => {
    return selectedForCompare.length < 2 || selectedForCompare.length > 3;
  }, [selectedForCompare]);

  if (loading) {
    return (
      <Card>
        <Text>Loading faculties...</Text>
      </Card>
    );
  }

  if (!faculties || faculties.length === 0) {
    return (
      <Card>
        <Empty description="No faculties available for this institution." />
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
        dataSource={faculties}
        renderItem={faculty => (
          <List.Item>
            <Card
              title={faculty.facultyName}
              actions={[
                <Button type="link" onClick={() => onSelectFaculty(faculty.facultyId)}>
                  View Departments
                </Button>,
              ]}
              extra={
                <Checkbox
                  onChange={e => handleCompareSelectionChange(faculty.facultyId, e.target.checked)}
                  checked={selectedForCompare.includes(faculty.facultyId)}
                />
              }
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Total Students" value={faculty.totalStudents ?? 'N/A'} />
                </Col>
                <Col span={12}>
                  <Statistic title="Average GPA" value={faculty.averageFacultyGPA?.toFixed(2) ?? 'N/A'} />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Total Departments" value={faculty.departments?.length ?? 0} />
                </Col>
                <Col span={12}>
                  <Statistic title="Faculty Members" value={faculty.totalFacultyMembers ?? 'N/A'} />
                </Col>
              </Row>
               <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Research Projects" value={faculty.researchProjectsCount ?? 'N/A'} />
                </Col>
                {/* Add more relevant KPIs if available in Faculty type */}
              </Row>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default React.memo(FacultyList);
