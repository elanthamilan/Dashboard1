import React, { useEffect, useState } from 'react';
import { Typography, Breadcrumb, Card, Descriptions, Spin } from 'antd';
import { Link } from 'react-router-dom';
import { useGlobalFilters } from '../../../contexts/GlobalFilterContext';
import { useTranslation } from 'react-i18next';
import { HomeOutlined } from '@ant-design/icons';
import { fetchData } from '../../../utils/apiUtils';
import dayjs from 'dayjs';

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
          upcomingAudits: [{date: "2024-09-01", type: "ISO 9001", authority: "QAS International"}],
          complianceStatus: [{area: "Data Privacy", status: "Compliant", details: "All systems meet GDPR requirements."}]
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
        {!loading && !error && data && (
          <Descriptions bordered column={1} title={t(`module.${MODULE_KEY}.summaryTitle`, "Compliance Summary")}>
            <Descriptions.Item label={t(`module.${MODULE_KEY}.lastAuditDate`, "Last Audit Date")}>
              {data.lastAuditDate ? dayjs(data.lastAuditDate).format('YYYY-MM-DD') : t('common.notAvailable', 'N/A')}
            </Descriptions.Item>
            <Descriptions.Item label={t(`module.${MODULE_KEY}.upcomingAudits`, "Upcoming Audits")}>
              {data.upcomingAudits && data.upcomingAudits.length > 0 ? (
                <ul>
                  {data.upcomingAudits.map((audit, index) => (
                    <li key={index}>{`${audit.type} by ${audit.authority} on ${dayjs(audit.date).format('YYYY-MM-DD')}`}</li>
                  ))}
                </ul>
              ) : t('common.noUpcomingAudits', 'No upcoming audits scheduled.')}
            </Descriptions.Item>
            {/* Add more Descriptions.Item for other fields in ComplianceData as needed */}
          </Descriptions>
        )}
        {!loading && !error && !data && (
          <Paragraph>{t('common.noDataAvailable', "No compliance data available.")}</Paragraph>
        )}
      </div>
    </div>
  );
};

export default ComplianceAccreditationModule;
