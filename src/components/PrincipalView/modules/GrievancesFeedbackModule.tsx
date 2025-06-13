import React, { useEffect, useState } from 'react';
import { Typography, Breadcrumb, Card, Descriptions, Spin, List, Table, Tag, Statistic, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import { useGlobalFilters } from '../../../contexts/GlobalFilterContext';
import { useTranslation } from 'react-i18next';
import { HomeOutlined } from '@ant-design/icons';
import { fetchData } from '../../../utils/apiUtils';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;

const MODULE_KEY = 'grievances';

type GrievanceStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
type FeedbackCategory = 'Academic' | 'Administrative' | 'Facilities' | 'Other';

interface Grievance {
  id: string;
  submittedBy: string;
  dateSubmitted: string;
  category: string;
  description: string;
  status: GrievanceStatus;
  resolution?: string;
  dateResolved?: string;
}

interface Feedback {
  id: string;
  submittedBy: string;
  dateSubmitted: string;
  category: FeedbackCategory;
  comments: string;
  rating?: number;
}

interface GrievancesFeedbackStats {
  totalOpenGrievances?: number;
  avgResolutionTimeDays?: number;
  totalFeedbackReceived?: number;
  avgFeedbackRating?: number;
}

interface GrievancesFeedbackData {
  grievances?: Grievance[];
  feedback?: Feedback[];
  stats?: GrievancesFeedbackStats;
  message?: string;
}

const GrievancesFeedbackModule: React.FC = () => {
  const { t } = useTranslation();
  const filters = useGlobalFilters();

  const [grievancesData, setGrievancesData] = useState<GrievancesFeedbackData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGrievancesData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchData<GrievancesFeedbackData>('/principal-view/grievances-feedback');
        setGrievancesData(result);
      } catch (err: any) {
        console.error("Failed to fetch grievances & feedback data:", err);
        setError(err.message || 'Failed to fetch grievances & feedback data');
        // Fallback to minimal mock data
        setGrievancesData({
          message: "Mock data active for Grievances & Feedback due to API failure.",
          grievances: [
            { id: 'G001', submittedBy: 'Student123', dateSubmitted: '2023-10-01', category: 'Library', description: 'Not enough copies of core textbooks.', status: 'Open' },
            { id: 'G002', submittedBy: 'Faculty456', dateSubmitted: '2023-10-05', category: 'IT Support', description: 'Classroom projector malfunctioning.', status: 'In Progress' },
          ],
          feedback: [
            { id: 'F001', submittedBy: 'Student789', dateSubmitted: '2023-09-20', category: 'Academic', comments: 'The new course on AI is excellent!', rating: 5 },
          ],
          stats: { totalOpenGrievances: 1, avgResolutionTimeDays: 5, totalFeedbackReceived: 1, avgFeedbackRating: 5 }
        });
      } finally {
        setLoading(false);
      }
    };

    loadGrievancesData();
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

        {grievancesData?.message && (
          <Paragraph style={{ marginTop: '10px', fontStyle: 'italic' }}>{grievancesData.message}</Paragraph>
        )}

        {!loading && !error && grievancesData && (
          <>
            {grievancesData.stats && (
              <Card title={t(`module.${MODULE_KEY}.statsTitle`, "Summary Statistics")} style={{ marginBottom: 20 }}>
                <Row gutter={16}>
                  <Col span={6}><Statistic title={t(`module.${MODULE_KEY}.totalOpenGrievances`, "Open Grievances")} value={grievancesData.stats.totalOpenGrievances ?? 'N/A'} /></Col>
                  <Col span={6}><Statistic title={t(`module.${MODULE_KEY}.avgResolutionTime`, "Avg. Resolution Time (Days)")} value={grievancesData.stats.avgResolutionTimeDays ?? 'N/A'} /></Col>
                  <Col span={6}><Statistic title={t(`module.${MODULE_KEY}.totalFeedbackReceived`, "Feedback Received")} value={grievancesData.stats.totalFeedbackReceived ?? 'N/A'} /></Col>
                  <Col span={6}><Statistic title={t(`module.${MODULE_KEY}.avgFeedbackRating`, "Avg. Feedback Rating")} value={grievancesData.stats.avgFeedbackRating?.toFixed(1) ?? 'N/A'} suffix="/ 5" /></Col>
                </Row>
              </Card>
            )}

            {grievancesData.grievances && grievancesData.grievances.length > 0 && (
              <Card title={t(`module.${MODULE_KEY}.grievancesListTitle`, "Recent Grievances")} style={{ marginBottom: 20 }}>
                <Table
                  dataSource={grievancesData.grievances}
                  columns={[
                    { title: t('common.id', 'ID'), dataIndex: 'id', key: 'id', width: 80 },
                    { title: t('common.dateSubmitted', 'Date Submitted'), dataIndex: 'dateSubmitted', key: 'dateSubmitted', render: (date: string) => dayjs(date).format('YYYY-MM-DD') },
                    { title: t('common.category', 'Category'), dataIndex: 'category', key: 'category' },
                    { title: t('common.description', 'Description'), dataIndex: 'description', key: 'description' },
                    { title: t('common.status', 'Status'), dataIndex: 'status', key: 'status', render: (status: GrievanceStatus) => <Tag color={status === 'Open' ? 'red' : status === 'In Progress' ? 'orange' : 'green'}>{status}</Tag> },
                  ]}
                  rowKey="id"
                  pagination={{ pageSize: 3 }}
                />
              </Card>
            )}

            {grievancesData.feedback && grievancesData.feedback.length > 0 && (
              <Card title={t(`module.${MODULE_KEY}.feedbackListTitle`, "Recent Feedback")}>
                <List
                  itemLayout="horizontal"
                  dataSource={grievancesData.feedback}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        title={`${t('common.category', 'Category')}: ${item.category} (${t('common.rating', 'Rating')}: ${item.rating ?? 'N/A'}/5)`}
                        description={`${t('common.submittedOn', 'Submitted on')} ${dayjs(item.dateSubmitted).format('YYYY-MM-DD')}: "${item.comments}"`}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}
          </>
        )}
        {!loading && !error && !grievancesData?.grievances && !grievancesData?.feedback && !grievancesData?.stats && !grievancesData?.message && (
          <Paragraph>{t('common.noDataAvailable', "No grievances or feedback data available.")}</Paragraph>
        )}
      </div>
    </div>
  );
};

export default GrievancesFeedbackModule;
