import React, { useEffect, useState } from 'react';
import { Typography, Breadcrumb, Card, Descriptions, Spin, Row, Col, Table, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { useGlobalFilters } from '../../../contexts/GlobalFilterContext';
import { useTranslation } from 'react-i18next';
import { HomeOutlined, PieChartOutlined } from '@ant-design/icons';
import { fetchData } from '../../../utils/apiUtils';
import dayjs from 'dayjs';
import { Pie } from '@ant-design/plots';

const { Title, Paragraph, Text } = Typography;

const MODULE_KEY = 'compliance';

interface ComplianceData {
  message?: string;
  lastAuditDate?: string;
  upcomingAudits?: Array<{ date: string; type: string; authority: string; }>;
  complianceStatus?: Array<{ area: string; status: 'Compliant' | 'Non-Compliant' | 'Pending'; details: string; }>;
}

const ComplianceAccreditationModule: React.FC = () => {
  const { t } = useTranslation();
  const filters = useGlobalFilters();

  const [data, setData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComplianceData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchData<ComplianceData>('/principal-view/compliance');
        setData(result);
      } catch (err: any) {
        console.error("Failed to fetch compliance data:", err);
        setError(err.message || 'Failed to fetch compliance data');
        // Optionally, set some minimal mock data for structure if API fails
        setData({
            message: "Mock data active due to API failure.",
            lastAuditDate: "2023-05-15",
            upcomingAudits: [
                {date: "2024-09-01", type: "ISO 9001 Audit", authority: "QAS International"},
                {date: "2024-10-15", type: "Financial Compliance Review", authority: "Internal Audit Team"},
                {date: "2024-11-20", type: "Data Security Assessment", authority: "CyberSec Corp"}
            ],
            complianceStatus: [
                {area: "Data Privacy (GDPR)", status: "Compliant", details: "All systems meet GDPR requirements. Last review: 2023-12-01."},
                {area: "Financial Reporting Standards", status: "Compliant", details: "Quarterly audits passed without issues."},
                {area: "Website Accessibility (WCAG 2.1 AA)", status: "Pending", details: "Accessibility review scheduled for Q3 2024. Current report shows partial compliance."},
                {area: "Environmental Safety Regulations", status: "Non-Compliant", details: "Corrective actions required for chemical waste disposal. Deadline: 2024-08-15."},
                {area: "IT Infrastructure Security", status: "Compliant", details: "Regular penetration tests conducted. No major vulnerabilities found."}
            ]
        });
      } finally {
        setLoading(false);
      }
    };

    loadComplianceData();
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

        {data?.message && (
          <Paragraph style={{ marginTop: '10px', fontStyle: 'italic' }}>{data.message}</Paragraph>
        )}

        {!loading && !error && data && (
          <>
            <Card title={t(`module.${MODULE_KEY}.summaryTitle`, "Compliance Summary")} style={{ marginBottom: 20 }}>
                <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label={t(`module.${MODULE_KEY}.lastAuditDate`, "Last Audit Date")}>
                        {data.lastAuditDate ? dayjs(data.lastAuditDate).format('YYYY-MM-DD') : t('common.notAvailable', 'N/A')}
                    </Descriptions.Item>
                    {/* Other singular summary items can be added here */}
                </Descriptions>
            </Card>

            {data.complianceStatus && data.complianceStatus.length > 0 && (
              <Row style={{ marginTop: 20 }}>
                <Col span={24}>
                  <Card title={<><PieChartOutlined /> {t(`module.${MODULE_KEY}.complianceStatusChartTitle`, "Compliance Status Overview")}</>}>
                    <Pie
                      data={data.complianceStatus.reduce((acc, item) => {
                        const existing = acc.find(i => i.type === item.status);
                        if (existing) {
                          existing.value += 1;
                        } else {
                          acc.push({ type: item.status, value: 1 });
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
                          formatter: (datum) => {
                            return { name: datum.type, value: datum.value + ' ' + t('common.items', 'items') };
                          },
                      }}
                    />
                  </Card>
                </Col>
              </Row>
            )}

            {data.complianceStatus && data.complianceStatus.length > 0 && (
              <Card title={t(`module.${MODULE_KEY}.complianceStatusTableTitle`, "Detailed Compliance Status")} style={{ marginTop: 20 }}>
                <Table
                  dataSource={data.complianceStatus}
                  columns={[
                    { title: t('common.area', 'Area'), dataIndex: 'area', key: 'area', sorter: (a,b) => a.area.localeCompare(b.area) },
                    {
                      title: t('common.status', 'Status'),
                      dataIndex: 'status',
                      key: 'status',
                      render: (status: 'Compliant' | 'Non-Compliant' | 'Pending') => {
                        let color;
                        if (status === 'Compliant') color = 'success';
                        else if (status === 'Non-Compliant') color = 'error';
                        else if (status === 'Pending') color = 'warning';
                        return <Tag color={color}>{status}</Tag>;
                      },
                      filters: [
                        { text: 'Compliant', value: 'Compliant' },
                        { text: 'Non-Compliant', value: 'Non-Compliant' },
                        { text: 'Pending', value: 'Pending' },
                      ],
                      onFilter: (value, record) => record.status === value,
                    },
                    { title: t('common.details', 'Details'), dataIndex: 'details', key: 'details', ellipsis: true },
                  ]}
                  rowKey="area"
                  pagination={{ pageSize: 5 }}
                  scroll={{ x: 'max-content' }}
                />
              </Card>
            )}

            {data.upcomingAudits && data.upcomingAudits.length > 0 && (
                <Card title={t(`module.${MODULE_KEY}.upcomingAuditsTableTitle`, "Upcoming Audits Schedule")} style={{ marginTop: 20 }}>
                    <Table
                        dataSource={data.upcomingAudits}
                        columns={[
                            { title: t('common.date', 'Date'), dataIndex: 'date', key: 'date', render: (text: string) => dayjs(text).format('YYYY-MM-DD'), sorter: (a,b) => dayjs(a.date).unix() - dayjs(b.date).unix() },
                            { title: t('common.type', 'Type'), dataIndex: 'type', key: 'type', sorter: (a,b) => a.type.localeCompare(b.type) },
                            { title: t('common.authority', 'Authority'), dataIndex: 'authority', key: 'authority', sorter: (a,b) => a.authority.localeCompare(b.authority) },
                        ]}
                        rowKey={(record, index) => record.date + (record.type || index)}
                        pagination={{ pageSize: 3 }}
                        scroll={{ x: 'max-content' }}
                    />
                </Card>
            )}
          </>
        )}
        {!loading && !error && !data?.complianceStatus && !data?.message && (
          <Paragraph>{t('common.noDataAvailable', "No compliance data available.")}</Paragraph>
        )}
      </div>
    </div>
  );
};

export default ComplianceAccreditationModule;
