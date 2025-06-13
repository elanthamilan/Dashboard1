import React, { useEffect, useState } from 'react';
import { Typography, Breadcrumb, Card, Descriptions, Spin, List, Button } from 'antd';
import { Link } from 'react-router-dom';
import { useGlobalFilters } from '../../../contexts/GlobalFilterContext';
import { useTranslation } from 'react-i18next';
import { HomeOutlined } from '@ant-design/icons';
import { fetchData } from '../../../utils/apiUtils';
import dayjs from 'dayjs'; // Although not used in this snippet, good for future date handling

const { Title, Paragraph, Text } = Typography;

const MODULE_KEY = 'customReports';

interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  parameters: Array<{ name: string; type: 'date' | 'text' | 'number' | 'select'; options?: string[] }>;
}

interface GeneratedReport {
  title: string;
  generatedAt: string;
  data: any; // Placeholder for actual report data structure
}

interface CustomReportData {
  availableReports?: ReportDefinition[];
  currentReport?: GeneratedReport | null;
  message?: string;
}

const CustomReportsModule: React.FC = () => {
  const { t } = useTranslation();
  const filters = useGlobalFilters();

  const [reportData, setReportData] = useState<CustomReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // const [selectedReportId, setSelectedReportId] = useState<string | null>(null); // For future use

  useEffect(() => {
    const loadCustomReportData = async () => {
      setLoading(true);
      setError(null);
      try {
        // This initial fetch might just get available reports or a default report
        const result = await fetchData<CustomReportData>('/principal-view/custom-reports');
        setReportData(result);
      } catch (err: any) {
        console.error("Failed to fetch custom reports data:", err);
        setError(err.message || 'Failed to fetch custom reports data');
        // Fallback to minimal mock data
        setReportData({
          message: "Mock data active for Custom Reports due to API failure.",
          availableReports: [
            { id: 'rep1', name: "Student Enrollment by Program", description: "Shows student enrollment numbers for each program.", parameters: [{name: "Academic Year", type: "select", options: ["2022-2023", "2023-2024"]}] },
            { id: 'rep2', name: "Fee Collection Summary", description: "Summary of fees collected within a date range.", parameters: [{name: "Start Date", type: "date"}, {name: "End Date", type: "date"}] }
          ],
          currentReport: null
        });
      } finally {
        setLoading(false);
      }
    };

    loadCustomReportData();
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
        {!loading && !error && reportData && reportData.availableReports && (
          <Card title={t(`module.${MODULE_KEY}.availableReportsTitle`, "Available Reports")}>
            <List
              itemLayout="horizontal"
              dataSource={reportData.availableReports}
              renderItem={item => (
                <List.Item
                  actions={[<Button type="primary" onClick={() => alert(t('common.notImplemented', 'Not implemented yet: Generate report ') + item.name)}>{t('common.generateReport', "Generate")}</Button>]}
                >
                  <List.Item.Meta
                    title={item.name}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        )}
        {!loading && !error && reportData && reportData.message && (
          <Paragraph style={{ marginTop: '10px' }}>{reportData.message}</Paragraph>
        )}
        {!loading && !error && !reportData?.availableReports && !reportData?.message && (
          <Paragraph>{t('common.noDataAvailable', "No custom reports data available.")}</Paragraph>
        )}
      </div>
    </div>
  );
};

export default CustomReportsModule;
