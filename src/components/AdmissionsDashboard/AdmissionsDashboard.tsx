import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { Layout, Row, Col, Card, Typography, Spin, Statistic, Button, message } from 'antd'; // Added Button, message
import { PlusOutlined } from '@ant-design/icons'; // For New Application button icon
import { useTranslation } from 'react-i18next';
import { Applicant, ApplicationStatus } from './types';
import NewApplicationForm from './NewApplicationForm'; // Import the new component
import { generateMockApplicants } from '../../utils/mockData/admissions/generateMockApplicants';
import ApplicantFunnelChart from './ApplicantFunnelChart'; // Import the new component
import KeyDeadlinesTimeline from './KeyDeadlinesTimeline'; // Import the new component
import ApplicantTable from './ApplicantTable'; // Import the new component
import ApplicantDetailModal from './ApplicantDetailModal'; // Import the new component


// Placeholders for components from other steps remain the same for now
const ApplicantOriginMapPlaceholder: React.FC = () => <Card style={{marginTop: '16px'}}><Typography.Text>Applicant Origin Map Placeholder</Typography.Text></Card>;

// Updated KpiCard to use Ant Design Statistic
const KpiCard: React.FC<{ title: string; value: string | number; precision?: number; suffix?: string; loading?: boolean }> = ({ title, value, precision, suffix, loading }) => (
  <Col xs={24} sm={12} md={8} lg={6}>
    <Card>
      <Statistic title={title} value={value} precision={precision} suffix={suffix} loading={loading} />
    </Card>
  </Col>
);

const { Content } = Layout;
const { Title } = Typography;

const ADMISSIONS_DATA_COUNT = 500; // Defined constant for mock data size

const AdmissionsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isNewAppFormVisible, setIsNewAppFormVisible] = useState(false);

  const handleOpenNewAppForm = () => {
    setIsNewAppFormVisible(true);
  };

  const handleCloseNewAppForm = () => {
    setIsNewAppFormVisible(false);
  };

  const handleAddApplicant = (newApplicant: Applicant) => {
    setApplicants(prevApplicants => [newApplicant, ...prevApplicants]); // Add to the beginning of the list
    // Optionally, re-sort or re-filter if your table depends on a specific order not handled by adding to front
    message.success(t('admissionsDashboard.messages.applicationAdded', 'New application added successfully!'));
  };

  const handleViewDetails = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setIsDetailModalVisible(true);
    // console.log('View details for:', applicant); // Placeholder for modal
  };

  const handleCloseDetailModal = () => {
      setIsDetailModalVisible(false);
      setSelectedApplicant(null);
  };

  useEffect(() => {
    setLoading(true);
    const mockData = generateMockApplicants(ADMISSIONS_DATA_COUNT);
    setApplicants(mockData);
    setLoading(false);
  }, []);

  // Calculate KPIs using useMemo for efficiency
  const kpiData = useMemo(() => {
    if (applicants.length === 0) {
      return {
        totalApplicants: 0,
        shortlistedCount: 0,
        offersMadeCount: 0,
        acceptedCount: 0,
        conversionRate: 0, // Accepted / Total Applied
      };
    }

    const totalApplicants = applicants.length;
    const shortlistedCount = applicants.filter(a =>
      ['Shortlisted', 'Interview Scheduled', 'Offered', 'Accepted', 'Enrollment Confirmed'].includes(a.status)
    ).length;
    const offersMadeCount = applicants.filter(a =>
      ['Offered', 'Accepted', 'Enrollment Confirmed'].includes(a.status)
    ).length;
    const acceptedCount = applicants.filter(a =>
      ['Accepted', 'Enrollment Confirmed'].includes(a.status)
    ).length;

    // Base conversion on 'Applied' vs 'Accepted' or 'Enrollment Confirmed'
    // For this, we need to know how many were initially 'Applied'. Assuming all in dataset were initially applied.
    const conversionRate = totalApplicants > 0 ? (acceptedCount / totalApplicants) * 100 : 0;

    // Placeholder for Avg Processing Time - requires more specific date logic
    // For now, mock it or leave it out.
    // const avgProcessingTime = ...;

    return {
      totalApplicants,
      shortlistedCount,
      offersMadeCount,
      acceptedCount, // Added for clarity, used in conversion rate
      conversionRate,
    };
  }, [applicants]);

  if (loading && applicants.length === 0) { // Ensure loading state is true only when initially loading
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Content style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>{t('admissionsDashboard.title')}</Title>

      <Row style={{ marginBottom: '24px' }}>
          <Col>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenNewAppForm}>
                  {t('admissionsDashboard.actions.newApplication', 'New Application')}
              </Button>
          </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <KpiCard
          title={t('admissionsDashboard.kpi.totalApplicants', 'Total Applicants')}
          value={kpiData.totalApplicants}
          loading={loading}
        />
        <KpiCard
          title={t('admissionsDashboard.kpi.shortlisted', 'Shortlisted')}
          value={kpiData.shortlistedCount}
          loading={loading}
        />
        <KpiCard
          title={t('admissionsDashboard.kpi.offersMade', 'Offers Made')}
          value={kpiData.offersMadeCount}
          loading={loading}
        />
        <KpiCard
          title={t('admissionsDashboard.kpi.conversionRate', 'Conversion Rate')}
          value={kpiData.conversionRate}
          precision={1}
          suffix="%"
          loading={loading}
        />
      </Row>

      {/* Charts and Table Section (Placeholders remain) */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={8}>
          <ApplicantFunnelChart data={applicants} loading={loading} />
        </Col>
        <Col xs={24} md={12} lg={8}>
          <KeyDeadlinesTimeline loading={loading} />
        </Col>
        <Col xs={24} md={12} lg={8}>
          <ApplicantOriginMapPlaceholder />
        </Col>
      </Row>

      <Row style={{ marginTop: '24px' }}>
        <Col span={24}>
          <ApplicantTable applicants={applicants} loading={loading} onViewDetails={handleViewDetails} />
        </Col>
      </Row>
      {/* Add Modal placeholder or actual modal call here - next step */}
      {selectedApplicant && isDetailModalVisible && (
          <ApplicantDetailModal
              applicant={selectedApplicant}
              visible={isDetailModalVisible}
              onClose={handleCloseDetailModal}
          />
      )}
      <NewApplicationForm
          visible={isNewAppFormVisible}
          onClose={handleCloseNewAppForm}
          onAddApplicant={handleAddApplicant}
      />
    </Content>
  );
};

export default AdmissionsDashboard;
