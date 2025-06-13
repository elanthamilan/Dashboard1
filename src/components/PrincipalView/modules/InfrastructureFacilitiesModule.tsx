import React, { useEffect, useState } from 'react';
import { Typography, Breadcrumb, Card, Descriptions, Spin, List, Table, Tag, Statistic, Row, Col, Progress, Empty } from 'antd';
import { Link } from 'react-router-dom';
import { useGlobalFilters } from '../../../contexts/GlobalFilterContext';
import { useTranslation } from 'react-i18next';
import { HomeOutlined, PieChartOutlined, BarChartOutlined } from '@ant-design/icons';
import { fetchData } from '../../../utils/apiUtils';
import dayjs from 'dayjs';
import { Pie, Column } from '@ant-design/plots';


const { Title, Paragraph, Text } = Typography;

const MODULE_KEY = 'infrastructure';

type AssetStatus = 'Operational' | 'Under Maintenance' | 'Needs Repair' | 'Decommissioned';
type ResourceType = 'Classroom' | 'Lab' | 'Auditorium' | 'Meeting Room' | 'Equipment';
type MaintenanceStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
type MaintenancePriority = 'High' | 'Medium' | 'Low';

interface Building {
  id: string;
  name: string;
  totalRooms: number;
  capacity: number;
  condition: 'Good' | 'Fair' | 'Poor';
}

interface Asset {
  id: string;
  name: string;
  type: string;
  location: string;
  purchaseDate: string;
  status: AssetStatus;
  lastMaintenanceDate?: string;
}

interface MaintenanceRequest {
  id: string;
  assetId?: string;
  resourceName: string;
  reportedDate: string;
  issueDescription: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
}

interface ResourceUtilization {
  resourceId: string;
  resourceName: string;
  resourceType: ResourceType;
  bookingsToday?: number;
  avgUtilizationRate?: number;
}

interface InfrastructureStats {
  totalBuildings?: number;
  totalAssets?: number;
  activeMaintenanceRequests?: number;
  overallAssetCondition?: { good: number; fair: number; poor: number };
}

interface InfrastructureData {
  buildings?: Building[];
  assets?: Asset[];
  maintenanceRequests?: MaintenanceRequest[];
  resourceUtilization?: ResourceUtilization[];
  stats?: InfrastructureStats;
  message?: string;
}


const InfrastructureFacilitiesModule: React.FC = () => {
  const { t } = useTranslation();
  const filters = useGlobalFilters();

  const [infraData, setInfraData] = useState<InfrastructureData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInfraData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchData<InfrastructureData>('/principal-view/infrastructure');
        setInfraData(result);
      } catch (err: any) {
        console.error("Failed to fetch infrastructure data:", err);
        setError(err.message || 'Failed to fetch infrastructure data');
        // Fallback to comprehensive mock data
        setInfraData({
          message: "Mock data active for Infrastructure & Facilities due to API failure.",
          stats: { totalBuildings: 5, totalAssets: 350, activeMaintenanceRequests: 3, overallAssetCondition: { good: 250, fair: 80, poor: 20 } },
          buildings: [
            { id: 'B001', name: 'Main Academic Block', totalRooms: 50, capacity: 1000, condition: 'Good' },
            { id: 'B002', name: 'Science Wing', totalRooms: 30, capacity: 400, condition: 'Fair' },
          ],
          assets: [
            { id: 'A001', name: 'CompLabPC01', type: 'Computer', location: 'Lab 101', purchaseDate: '2022-01-15', status: 'Operational', lastMaintenanceDate: '2023-12-01' },
            { id: 'A002', name: 'Auditorium Projector', type: 'Projector', location: 'Main Auditorium', purchaseDate: '2021-06-20', status: 'Under Maintenance' },
            { id: 'A003', name: 'Library Server', type: 'Server', location: 'Library IT Room', purchaseDate: '2020-03-10', status: 'Needs Repair' },
          ],
          maintenanceRequests: [
            { id: 'M001', resourceName: 'Auditorium Projector', reportedDate: '2024-03-10', issueDescription: 'Projector lamp is dim.', status: 'In Progress', priority: 'High' },
            { id: 'M002', resourceName: 'Library Server', reportedDate: '2024-03-12', issueDescription: 'Server unresponsive.', status: 'Open', priority: 'High' },
            { id: 'M003', resourceName: 'Classroom 203 AC', reportedDate: '2024-03-11', issueDescription: 'AC not cooling.', status: 'Resolved', priority: 'Medium' },
          ],
          resourceUtilization: [
              { resourceId: 'R101', resourceName: 'Physics Lab', resourceType: 'Lab', bookingsToday: 3, avgUtilizationRate: 60 },
              { resourceId: 'R102', resourceName: 'Seminar Hall A', resourceType: 'Auditorium', bookingsToday: 2, avgUtilizationRate: 80 },
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    loadInfraData();
  }, []);

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

        {infraData?.message && (
          <Paragraph style={{ marginTop: '10px', fontStyle: 'italic' }}>{infraData.message}</Paragraph>
        )}

        {!loading && !error && infraData && (
          <>
            {/* Stats Section */}
            {infraData.stats && (
              <Card title={t(`module.${MODULE_KEY}.statsTitle`, "Overall Statistics")} style={{ marginBottom: 20 }}>
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={8} lg={6}><Statistic title={t(`module.${MODULE_KEY}.totalBuildings`, "Total Buildings")} value={infraData.stats.totalBuildings ?? 'N/A'} /></Col>
                  <Col xs={24} sm={12} md={8} lg={6}><Statistic title={t(`module.${MODULE_KEY}.totalAssets`, "Total Assets")} value={infraData.stats.totalAssets ?? 'N/A'} /></Col>
                  <Col xs={24} sm={12} md={8} lg={6}><Statistic title={t(`module.${MODULE_KEY}.activeMaintenance`, "Active Maintenance Req.")} value={infraData.stats.activeMaintenanceRequests ?? 'N/A'} /></Col>
                </Row>
              </Card>
            )}

            {/* Charts Section */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
              {infraData.stats?.overallAssetCondition && (
                <Col xs={24} md={12}>
                  <Card title={<><PieChartOutlined /> {t(`module.${MODULE_KEY}.assetConditionChartTitle`, "Asset Condition Overview")}</>}>
                    <Pie data={[
                        { type: t('common.good', 'Good'), value: infraData.stats.overallAssetCondition.good },
                        { type: t('common.fair', 'Fair'), value: infraData.stats.overallAssetCondition.fair },
                        { type: t('common.poor', 'Poor'), value: infraData.stats.overallAssetCondition.poor },
                      ]} angleField="value" colorField="type" radius={0.8} legend={{position:'bottom'}}
                      label={{ type: 'inner', offset: '-30%', content: '{value}', style:{fill: '#fff'} }} />
                  </Card>
                </Col>
              )}
              {infraData.maintenanceRequests && (
                   <Col xs={24} md={12}>
                      <Card title={<><BarChartOutlined /> {t(`module.${MODULE_KEY}.maintenanceStatusChartTitle`, "Maintenance Requests by Status")}</>}>
                      <Column data={Object.entries(infraData.maintenanceRequests.reduce((acc, req) => { acc[req.status] = (acc[req.status] || 0) + 1; return acc; }, {} as Record<MaintenanceStatus, number>)).map(([status, count]) => ({status, count}))}
                          xField="status" yField="count" seriesField="status" legend={false}
                          label={{ position: 'middle', style: { fill: '#FFFFFF', opacity: 0.6 } }} />
                      </Card>
                   </Col>
              )}
            </Row>

            {/* Buildings List */}
            {infraData.buildings && infraData.buildings.length > 0 && (
              <Card title={t(`module.${MODULE_KEY}.buildingsListTitle`, "Buildings")} style={{ marginBottom: 20 }}>
                <List
                  itemLayout="horizontal"
                  dataSource={infraData.buildings}
                  renderItem={b => (
                    <List.Item>
                      <List.Item.Meta
                        title={b.name}
                        description={`${t('module.common.rooms', 'Rooms')}: ${b.totalRooms}, ${t('module.common.capacity', 'Capacity')}: ${b.capacity}, ${t('module.common.condition', 'Condition')}: ${b.condition}`}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {/* Assets Table */}
            {infraData.assets && infraData.assets.length > 0 && (
              <Card title={t(`module.${MODULE_KEY}.assetsTableTitle`, "Assets Inventory")} style={{ marginBottom: 20 }}>
                <Table
                  dataSource={infraData.assets}
                  columns={[
                    { title: t('common.name', 'Name'), dataIndex: 'name', key: 'name', sorter: (a,b) => a.name.localeCompare(b.name) },
                    { title: t('common.type', 'Type'), dataIndex: 'type', key: 'type', sorter: (a,b) => a.type.localeCompare(b.type) },
                    { title: t('common.location', 'Location'), dataIndex: 'location', key: 'location' },
                    { title: t('common.status', 'Status'), dataIndex: 'status', key: 'status', render: (status: AssetStatus) => <Tag color={status === 'Operational' ? 'green' : status === 'Under Maintenance' ? 'orange' : status === 'Needs Repair' ? 'red' : 'default'}>{status}</Tag> },
                    { title: t('common.purchaseDate', 'Purchase Date'), dataIndex: 'purchaseDate', key: 'purchaseDate', render: (date:string) => dayjs(date).format('YYYY-MM-DD')},
                  ]}
                  rowKey="id" pagination={{ pageSize: 5 }} scroll={{ x: 'max-content' }}
                />
              </Card>
            )}

            {/* Maintenance Requests Table */}
            {infraData.maintenanceRequests && infraData.maintenanceRequests.length > 0 && (
              <Card title={t(`module.${MODULE_KEY}.maintenanceTableTitle`, "Maintenance Requests")} style={{ marginBottom: 20 }}>
                <Table
                  dataSource={infraData.maintenanceRequests}
                  columns={[
                    { title: t('common.resource', 'Resource'), dataIndex: 'resourceName', key: 'resourceName' },
                    { title: t('common.issue', 'Issue'), dataIndex: 'issueDescription', key: 'issueDescription', ellipsis: true },
                    { title: t('common.priority', 'Priority'), dataIndex: 'priority', key: 'priority', render: (p: MaintenancePriority) => <Tag color={p === 'High' ? 'red' : p === 'Medium' ? 'orange' : 'blue'}>{p}</Tag>},
                    { title: t('common.status', 'Status'), dataIndex: 'status', key: 'status', render: (s: MaintenanceStatus) => <Tag color={s === 'Open' ? 'magenta' : s === 'In Progress' ? 'processing' : s === 'Resolved' ? 'success' : 'default'}>{s}</Tag>},
                    { title: t('common.reportedDate', 'Reported'), dataIndex: 'reportedDate', key: 'reportedDate', render: (date:string) => dayjs(date).format('YYYY-MM-DD')},
                  ]}
                  rowKey="id" pagination={{ pageSize: 5 }} scroll={{ x: 'max-content' }}
                />
              </Card>
            )}

            {/* Resource Utilization */}
            {infraData.resourceUtilization && infraData.resourceUtilization.length > 0 && (
               <Card title={t(`module.${MODULE_KEY}.utilizationTitle`, "Resource Utilization")} style={{ marginBottom: 20 }}>
                  <List
                      grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
                      dataSource={infraData.resourceUtilization}
                      renderItem={item => (
                          <List.Item>
                              <Card title={item.resourceName} size="small">
                                  <p>{t('common.type', 'Type')}: {item.resourceType}</p>
                                  <p>{t('module.common.bookingsToday', 'Bookings Today')}: {item.bookingsToday ?? 'N/A'}</p>
                                  {item.avgUtilizationRate !== undefined && (
                                    <>
                                      <Text>{t('module.common.avgUtilization', 'Avg. Utilization')}: </Text>
                                      <Progress percent={item.avgUtilizationRate} size="small" />
                                    </>
                                  )}
                              </Card>
                          </List.Item>
                      )}
                  />
               </Card>
            )}
          </>
        )}
        {!loading && !error && !infraData?.stats && !infraData?.buildings?.length && !infraData?.assets?.length && !infraData?.maintenanceRequests?.length && !infraData?.message && (
           <Empty description={t('common.noDataAvailable', "No infrastructure or facilities data available.")} />
        )}
      </div>
    </div>
  );
};

export default InfrastructureFacilitiesModule;
