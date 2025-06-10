import React from 'react';
import { Modal, Tabs, Descriptions, Tag, Typography, List, Avatar, Empty, Card, Row, Col, Button } from 'antd';
import { Applicant, ApplicationStatus } from './types'; // Adjust path as needed
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { UserOutlined, FileTextOutlined, CalendarOutlined, SolutionOutlined, GlobalOutlined, CheckCircleOutlined, CloseCircleOutlined, IssuesCloseOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;

interface ApplicantDetailModalProps {
  applicant: Applicant | null;
  visible: boolean;
  onClose: () => void;
}

// Helper for status colors (can be imported from ApplicantTable or a shared util if desired)
const getStatusColor = (status: ApplicationStatus): string => {
  switch (status) {
    case 'Accepted': case 'Enrollment Confirmed': return 'green';
    case 'Offered': return 'cyan';
    case 'Interview Scheduled': return 'blue';
    case 'Shortlisted': return 'geekblue';
    case 'Applied': return 'processing';
    case 'Rejected': return 'error';
    case 'Waitlisted': return 'warning';
    case 'Application Withdrawn': return 'default';
    default: return 'default';
  }
};

const ApplicantDetailModal: React.FC<ApplicantDetailModalProps> = ({ applicant, visible, onClose }) => {
  const { t } = useTranslation();

  if (!applicant) {
    return null;
  }

  return (
    <Modal
      title={<>{t('applicantDetailModal.title', 'Applicant Details')}: <Text strong>{`${applicant.firstName} ${applicant.lastName}`}</Text> (<Tag color={getStatusColor(applicant.status)}>{t(`applicationStatus.${applicant.status}`, applicant.status)}</Tag>)</>}
      visible={visible}
      onCancel={onClose}
      footer={null} // No OK/Cancel buttons, just close
      width={800} // Wider modal for more content
      destroyOnClose // Reset state when closed
    >
      <Tabs defaultActiveKey="personal">
        <TabPane tab={<><UserOutlined /> {t('applicantDetailModal.tabs.personal', 'Personal')}</>} key="personal">
          <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 1, md: 1, sm: 1, xs: 1 }} layout="vertical">
            <Descriptions.Item label={t('applicantDetailModal.personal.fullName', 'Full Name')}>{`${applicant.firstName} ${applicant.lastName}`}</Descriptions.Item>
            <Descriptions.Item label={t('applicantDetailModal.personal.email', 'Email')}>{applicant.email}</Descriptions.Item>
            <Descriptions.Item label={t('applicantDetailModal.personal.phone', 'Phone')}>{applicant.phoneNumber || t('common.notProvided', 'N/A')}</Descriptions.Item>
            <Descriptions.Item label={t('applicantDetailModal.personal.dob', 'Date of Birth')}>{dayjs(applicant.dateOfBirth).format('MMMM D, YYYY')}</Descriptions.Item>
            <Descriptions.Item label={t('applicantDetailModal.personal.gender', 'Gender')}>{applicant.gender}</Descriptions.Item>
            <Descriptions.Item label={t('applicantDetailModal.personal.nationality', 'Nationality')}>{applicant.nationality}</Descriptions.Item>
            <Descriptions.Item label={t('applicantDetailModal.personal.address', 'Address')} span={2}>
              {`${applicant.address.street}, ${applicant.address.city}, ${applicant.address.state ? applicant.address.state + ', ' : ''}${applicant.address.postalCode}, ${applicant.address.country}`}
            </Descriptions.Item>
            <Descriptions.Item label={t('applicantDetailModal.personal.program', 'Applied Program')}>{applicant.programName}</Descriptions.Item>
            <Descriptions.Item label={t('applicantDetailModal.personal.applicationDate', 'Application Date')}>{dayjs(applicant.applicationDate).format('MMMM D, YYYY')}</Descriptions.Item>
            {applicant.previousEducation && (
                <>
                    <Descriptions.Item label={t('applicantDetailModal.personal.prevInstitution', 'Previous Institution')}>{applicant.previousEducation.institution}</Descriptions.Item>
                    <Descriptions.Item label={t('applicantDetailModal.personal.prevDegree', 'Previous Degree')}>{applicant.previousEducation.degree} ({applicant.previousEducation.gpa ? `GPA: ${applicant.previousEducation.gpa}` : ''})</Descriptions.Item>
                </>
            )}
            <Descriptions.Item label={t('applicantDetailModal.personal.feeStatus', 'Application Fee')}>
                <Tag color={applicant.applicationFee.paid ? 'green' : 'red'}>
                    {applicant.applicationFee.paid ? t('applicantDetailModal.personal.feePaid', 'Paid') : t('applicantDetailModal.personal.feeUnpaid', 'Unpaid')}
                </Tag>
                {applicant.applicationFee.amount && ` (${applicant.applicationFee.amount} USD)`}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>

        <TabPane tab={<><FileTextOutlined /> {t('applicantDetailModal.tabs.documents', 'Documents')}</>} key="documents">
          {applicant.documents && applicant.documents.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={applicant.documents}
              renderItem={doc => (
                <List.Item
                  actions={[<a key="list-download" href={doc.url || '#'} target="_blank" rel="noopener noreferrer">{t('common.actions.download', 'Download')}</a>]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<FileTextOutlined />} />}
                    title={<a href={doc.url || '#'} target="_blank" rel="noopener noreferrer">{doc.fileName}</a>}
                    description={`${t('applicantDetailModal.documents.type', 'Type')}: ${doc.type} | ${t('applicantDetailModal.documents.uploaded', 'Uploaded')}: ${dayjs(doc.uploadDate).format('YYYY-MM-DD')}`}
                  />
                </List.Item>
              )}
            />
          ) : <Empty description={t('applicantDetailModal.documents.noDocuments', 'No documents uploaded.')} />}
          {/* Mock "Upload" button - non-functional for now */}
          <Button style={{marginTop: 16}} type="dashed">{t('applicantDetailModal.documents.uploadButton', 'Upload Document (Mock)')}</Button>
        </TabPane>

        <TabPane tab={<><CalendarOutlined /> {t('applicantDetailModal.tabs.interview', 'Interview')}</>} key="interview">
          {applicant.interview ? (
            <Descriptions bordered column={1} layout="vertical">
              <Descriptions.Item label={t('applicantDetailModal.interview.date', 'Date')}>{dayjs(applicant.interview.date).format('MMMM D, YYYY')} at {applicant.interview.time}</Descriptions.Item>
              <Descriptions.Item label={t('applicantDetailModal.interview.interviewer', 'Interviewer')}>{applicant.interview.interviewer}</Descriptions.Item>
              <Descriptions.Item label={t('applicantDetailModal.interview.notes', 'Notes')}>{applicant.interview.notes || t('common.notProvided', 'N/A')}</Descriptions.Item>
              <Descriptions.Item label={t('applicantDetailModal.interview.feedback', 'Feedback')}>
                <Tag color={applicant.interview.feedback === 'Positive' ? 'success' : applicant.interview.feedback === 'Negative' ? 'error' : 'default'}>
                    {applicant.interview.feedback || t('common.notProvided', 'N/A')}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          ) : <Empty description={t('applicantDetailModal.interview.noInterview', 'No interview scheduled or details available.')} />}
        </TabPane>

        {applicant.nationality !== applicant.address.country && applicant.visaDetails && ( // Heuristic for international student
             <TabPane tab={<><GlobalOutlined /> {t('applicantDetailModal.tabs.visa', 'Visa')}</>} key="visa">
                 {applicant.visaDetails ? (
                    <Descriptions bordered column={1} layout="vertical">
                        <Descriptions.Item label={t('applicantDetailModal.visa.type', 'Visa Type')}>{applicant.visaDetails.visaType || t('common.notProvided', 'N/A')}</Descriptions.Item>
                        <Descriptions.Item label={t('applicantDetailModal.visa.status', 'Application Status')}>
                            <Tag color={
                                applicant.visaDetails.applicationStatus === 'Approved' ? 'success' :
                                applicant.visaDetails.applicationStatus === 'Rejected' ? 'error' :
                                applicant.visaDetails.applicationStatus === 'Submitted' ? 'processing' : 'default'
                            }>
                                {applicant.visaDetails.applicationStatus || t('common.notProvided', 'N/A')}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label={t('applicantDetailModal.visa.issueDate', 'Issue Date')}>{applicant.visaDetails.issueDate ? dayjs(applicant.visaDetails.issueDate).format('MMMM D, YYYY') : t('common.notProvided', 'N/A')}</Descriptions.Item>
                        <Descriptions.Item label={t('applicantDetailModal.visa.expiryDate', 'Expiry Date')}>{applicant.visaDetails.expiryDate ? dayjs(applicant.visaDetails.expiryDate).format('MMMM D, YYYY') : t('common.notProvided', 'N/A')}</Descriptions.Item>
                    </Descriptions>
                 ) : <Empty description={t('applicantDetailModal.visa.noDetails', 'No visa details available.')} />}
             </TabPane>
        )}

        {/* Mock Status Change Section */}
        <TabPane tab={<><SolutionOutlined /> {t('applicantDetailModal.tabs.statusActions', 'Status & Actions')}</>} key="statusActions">
            <Card title={t('applicantDetailModal.statusActions.currentStatus', 'Current Status')}>
                <Tag icon={ applicant.status === 'Accepted' || applicant.status === 'Enrollment Confirmed' ? <CheckCircleOutlined/> : applicant.status === 'Rejected' ? <CloseCircleOutlined/> : <IssuesCloseOutlined />}
                     color={getStatusColor(applicant.status)} style={{fontSize: '16px', padding: '5px 10px'}}>
                    {t(`applicationStatus.${applicant.status}`, applicant.status)}
                </Tag>
            </Card>
            <Card title={t('applicantDetailModal.statusActions.changeStatusTitle', 'Change Applicant Status (Mock)')} style={{marginTop: 16}}>
                <Paragraph>{t('applicantDetailModal.statusActions.changeStatusDesc', "This section would allow authorized users to change the applicant's status, triggering workflows.")}</Paragraph>
                <Button type="primary" style={{marginRight: 8}}>{t('applicantDetailModal.statusActions.acceptButton', 'Mark as Accepted (Mock)')}</Button>
                <Button danger>{t('applicantDetailModal.statusActions.rejectButton', 'Mark as Rejected (Mock)')}</Button>
            </Card>
        </TabPane>

      </Tabs>
    </Modal>
  );
};

export default ApplicantDetailModal;
