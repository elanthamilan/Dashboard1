import React, { useEffect, useState } from 'react';
import { Typography, Breadcrumb, Card, Descriptions, Spin, List, Table, Tag, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import { useGlobalFilters } from '../../../contexts/GlobalFilterContext';
import { useTranslation } from 'react-i18next';
import { HomeOutlined, PieChartOutlined, BarChartOutlined } from '@ant-design/icons';
import { fetchData } from '../../../utils/apiUtils';
import { Department, FacultyMember, Program } from '../../../types/hierarchy';
import { Pie, Column } from '@ant-design/plots';

const { Title, Paragraph, Text } = Typography;

const MODULE_KEY = 'departmentFaculty';

interface DepartmentFacultyStats {
  totalDepartments?: number;
  totalFaculty?: number;
  avgFacultyStudentRatio?: number;
}

interface DepartmentFacultyData {
  departments?: Department[];
  facultyMembers?: FacultyMember[];
  programs?: Program[];
  stats?: DepartmentFacultyStats;
  message?: string;
}

const DepartmentFacultyModule: React.FC = () => {
  const { t } = useTranslation();
  const filters = useGlobalFilters();

  const [deptFacultyData, setDeptFacultyData] = useState<DepartmentFacultyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDeptFacultyData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchData<DepartmentFacultyData>('/principal-view/department-faculty');
        setDeptFacultyData(result);
      } catch (err: any) {
        console.error("Failed to fetch department & faculty data:", err);
        setError(err.message || 'Failed to fetch department & faculty data');
        // Fallback to minimal mock data
        setDeptFacultyData({
          message: "Mock data active for Department & Faculty due to API failure.",
          departments: [
            { departmentId: 'D001', departmentName: 'Computer Science', facultyId: 'F001', degreeIds: ['CS_BS', 'CS_MS'], headOfDepartment: { memberId: 'FM001', name: 'Dr. Ada Lovelace' }, facultyCount: 10, studentCount: 150 },
            { departmentId: 'D002', departmentName: 'Physics', facultyId: 'F002', degreeIds: ['PHY_BS'], headOfDepartment: { memberId: 'FM002', name: 'Dr. Albert Einstein' }, facultyCount: 8, studentCount: 120 }
          ],
          facultyMembers: [
            { memberId: 'FM001', name: 'Dr. Ada Lovelace', departmentId: 'D001', designation: 'Professor & HOD', email: 'ada@example.com', expertiseAreas: ['Algorithms', 'AI'] },
            { memberId: 'FM003', name: 'Dr. Charles Babbage', departmentId: 'D001', designation: 'Associate Professor', email: 'charles@example.com', expertiseAreas: ['Computer Architecture'] },
            { memberId: 'FM002', name: 'Dr. Albert Einstein', departmentId: 'D002', designation: 'Professor & HOD', email: 'albert@example.com', expertiseAreas: ['Relativity', 'Quantum Mechanics'] }
          ],
          stats: { totalDepartments: 2, totalFaculty: 3 }
        });
      } finally {
        setLoading(false);
      }
    };

    loadDeptFacultyData();
  }, []); // Empty dependency array to run once on mount

  return (
    <div style={{ padding: '20px' }}>
      <Breadcrumb style={{ marginBottom: '20px' }}>
        <Breadcrumb.Item>
          <Link to="/principal-view"><HomeOutlined /></Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/principal-view">{t('principalView.dashboardTitle', "Principal's Dashboard")}</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{t(`module.${MODULE_KEY}.title`)}</Breadcrumb.Item>
      </Breadcrumb>

      <Title level={2}>{t(`module.${MODULE_KEY}.title`)}</Title>
      <Paragraph>
        {t(`module.${MODULE_KEY}.descriptionPlaceholder`)}
      </Paragraph>

      <Card title={t('common.currentGlobalFilters', "Current Global Filters")} style={{ marginTop: 20, display: 'none' }}>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label={t('filters.academicYear', "Academic Year")}>
            <Text>{filters.academicYear || t('common.notSet', "Not Set")}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('filters.campus', "Campus")}>
            <Text>{filters.campus || t('common.notSet', "Not Set")}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('filters.degreeType', "Degree Type")}>
            <Text>{filters.degreeType || t('common.notSet', "Not Set")}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('filters.department', "Department")}>
            <Text>{filters.department || t('common.notSet', "Not Set")}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('filters.dateRange', "Date Range")}>
            <Text>{filters.dateRange ? `${filters.dateRange[0]} - ${filters.dateRange[1]}` : t('common.notSet', "Not Set")}</Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <div style={{ marginTop: '20px' }}>
        {loading && <Spin tip={t('common.loadingData', "Loading data...")} />}
        {error && <Paragraph type="danger">{t('common.errorLoadingData', "Error loading data:")} {error}</Paragraph>}

        {deptFacultyData?.message && (
          <Paragraph style={{ marginTop: '10px', fontStyle: 'italic' }}>{deptFacultyData.message}</Paragraph>
        )}

        {!loading && !error && deptFacultyData && (
          <>
            {deptFacultyData.stats && (
              <Card title={t(`module.${MODULE_KEY}.statsTitle`, "Overall Statistics")} style={{ marginBottom: 20 }}>
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label={t(`module.${MODULE_KEY}.totalDepartments`, "Total Departments")}>
                    {deptFacultyData.stats.totalDepartments ?? t('common.notAvailable', 'N/A')}
                  </Descriptions.Item>
                  <Descriptions.Item label={t(`module.${MODULE_KEY}.totalFaculty`, "Total Faculty Members")}>
                    {deptFacultyData.stats.totalFaculty ?? t('common.notAvailable', 'N/A')}
                  </Descriptions.Item>
                  {/* Add more stats as they become available */}
                </Descriptions>
              </Card>
            )}

            {/* Charts Section */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20, marginTop: 20 }}>
              {/* Faculty by Designation Pie Chart */}
              {deptFacultyData.facultyMembers && deptFacultyData.facultyMembers.length > 0 && (
                <Col xs={24} md={12}>
                  <Card title={<><PieChartOutlined /> {t(`module.${MODULE_KEY}.facultyByDesignationChartTitle`, "Faculty by Designation")}</>}>
                    <Pie
                      data={deptFacultyData.facultyMembers.reduce((acc, member) => {
                        const status = member.designation || t('common.unknown', 'Unknown');
                        const existing = acc.find(i => i.type === status);
                        if (existing) {
                          existing.value += 1;
                        } else {
                          acc.push({ type: status, value: 1 });
                        }
                        return acc;
                      }, [] as Array<{type: string, value: number}>)}
                      angleField="value"
                      colorField="type"
                      radius={0.8}
                      legend={{ position: 'bottom' }}
                      label={{
                        type: 'inner',
                        offset: '-30%',
                        content: '{value}',
                        style: { fill: '#fff', fontSize: 14 },
                      }}
                      tooltip={{
                          formatter: (datum) => ({ name: datum.type, value: datum.value + ' ' + t('common.members', 'members') }),
                      }}
                    />
                  </Card>
                </Col>
              )}

              {/* Faculty Count by Department Bar Chart */}
              {deptFacultyData.departments && deptFacultyData.departments.length > 0 && (
                <Col xs={24} md={12}>
                  <Card title={<><BarChartOutlined /> {t(`module.${MODULE_KEY}.facultyByDeptChartTitle`, "Faculty Count by Department")}</>}>
                    <Column
                      data={deptFacultyData.departments.map(dept => ({
                        departmentName: dept.departmentName,
                        facultyCount: dept.facultyCount || 0,
                      }))}
                      xField="departmentName"
                      yField="facultyCount"
                      seriesField="departmentName" // Optional: if you want different colors per department
                      legend={false} // Or configure as needed if seriesField is used meaningfully
                      label={{
                        position: 'middle', // Or 'top', 'bottom', 'left', 'right'
                        style: { fill: '#FFFFFF', opacity: 0.6 },
                      }}
                      xAxis={{ title: { text: t('module.academics.departmentName', "Department") } }}
                      yAxis={{ title: { text: t('module.academics.facultyCount', "Faculty Count") } }}
                      tooltip={{
                        formatter: (datum) => ({ name: datum.departmentName, value: datum.facultyCount + ' ' + t('common.facultyMembers', 'faculty members') }),
                      }}
                    />
                  </Card>
                </Col>
              )}
            </Row>

            {deptFacultyData.departments && deptFacultyData.departments.length > 0 && (
              <Card title={t(`module.${MODULE_KEY}.departmentsListTitle`, "Departments")} style={{ marginBottom: 20 }}>
                <List
                  itemLayout="horizontal"
                  dataSource={deptFacultyData.departments}
                  renderItem={dept => (
                    <List.Item>
                      <List.Item.Meta
                        title={dept.departmentName}
                        description={`${t('module.academics.headOfDepartment', "HOD")}: ${dept.headOfDepartment?.name || t('common.notAssigned', 'Not Assigned')}, ${t('module.academics.facultyCount', "Faculty")}: ${dept.facultyCount || 0}, ${t('module.academics.studentCount', "Students")}: ${dept.studentCount || 0}`}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {deptFacultyData.facultyMembers && deptFacultyData.facultyMembers.length > 0 && (
              <Card title={t(`module.${MODULE_KEY}.facultyListTitle`, "Faculty Members")}>
                <Table
                  dataSource={deptFacultyData.facultyMembers}
                  columns={[
                    { title: t('module.academics.facultyName', "Name"), dataIndex: 'name', key: 'name' },
                    { title: t('module.academics.departmentName', "Department"), dataIndex: 'departmentId', key: 'departmentId', render: (deptId) => deptFacultyData.departments?.find(d => d.departmentId === deptId)?.departmentName || deptId },
                    { title: t('module.academics.designation', "Designation"), dataIndex: 'designation', key: 'designation' },
                    { title: t('module.academics.expertiseAreas', "Expertise Areas"), dataIndex: 'expertiseAreas', key: 'expertiseAreas', render: (areas: string[]) => areas?.join(', ') },
                  ]}
                  rowKey="memberId"
                  pagination={{ pageSize: 5 }}
                />
              </Card>
            )}
          </>
        )}
        {!loading && !error && !deptFacultyData?.departments && !deptFacultyData?.facultyMembers && !deptFacultyData?.stats && !deptFacultyData?.message && (
          <Paragraph>{t('common.noDataAvailable', "No department or faculty data available.")}</Paragraph>
        )}
      </div>
    </div>
  );
};

export default DepartmentFacultyModule;
