import React, { useMemo } from 'react';
import { Card, Progress, Typography, Empty, Row, Col, Statistic } from 'antd';
import { useTranslation } from 'react-i18next';
import { StudentAcademicRecord } from './types'; // Adjust path
import { AimOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface DegreeCompletionProgressProps {
  studentAcademicRecord: StudentAcademicRecord | null;
  loading?: boolean;
}

const DegreeCompletionProgress: React.FC<DegreeCompletionProgressProps> = ({ studentAcademicRecord, loading }) => {
  const { t } = useTranslation();

  const progressData = useMemo(() => {
    if (!studentAcademicRecord || typeof studentAcademicRecord.totalCreditsEarned !== 'number' || typeof studentAcademicRecord.requiredCreditsForDegree !== 'number') {
      return null;
    }

    const { totalCreditsEarned, requiredCreditsForDegree } = studentAcademicRecord;

    if (requiredCreditsForDegree <= 0) return null; // Avoid division by zero or meaningless progress

    const percent = Math.min(100, Math.round((totalCreditsEarned / requiredCreditsForDegree) * 100));
    const status = percent === 100 ? 'success' : 'normal'; // 'active' or 'exception' could also be used

    return {
      percent,
      status,
      totalCreditsEarned,
      requiredCreditsForDegree,
      creditsRemaining: Math.max(0, requiredCreditsForDegree - totalCreditsEarned),
    };
  }, [studentAcademicRecord]);


  if (loading) {
    return <Card title={t('studentPerformanceDashboard.progress.title', 'Degree Completion Progress')} style={{ minHeight: 200 }} loading={true} />; // Adjusted minHeight
  }

  if (!progressData) {
     return (
        <Card title={t('studentPerformanceDashboard.progress.title', 'Degree Completion Progress')} style={{ minHeight: 200 }}>
            <Empty description={t('common.noDataAvailable', 'Degree progress data not available for this student.')} />
        </Card>
    );
  }

  return (
    <Card
        title={t('studentPerformanceDashboard.progress.title', 'Degree Completion Progress')}
        style={{ minHeight: 200 }}
        styles={{ header: { borderBottom: 0 } }} // Optional: remove border under title for cleaner look
    >
      <Row gutter={[16,16]} align="middle" justify="center" style={{textAlign: 'center'}}>
        <Col span={24}>
            <Progress
                type="dashboard" // or "circle" or "line"
                percent={progressData.percent}
                status={progressData.status as ('success' | 'normal' | 'active' | 'exception')}
                size={120} // Adjust size of dashboard/circle - REPLACED width with size
                format={(percent) => (
                    <div style={{textAlign: 'center'}}>
                        <Text style={{fontSize: '24px', fontWeight: 'bold'}}>{`${percent}%`}</Text><br/>
                        <Text type="secondary" style={{fontSize: '12px'}}>
                            {progressData.status === 'success' ?
                                <><CheckCircleOutlined /> {t('studentPerformanceDashboard.progress.completed', 'Completed')}</> :
                                <><AimOutlined /> {t('studentPerformanceDashboard.progress.inProgress', 'In Progress')}</>
                            }
                        </Text>
                    </div>
                )}
            />
        </Col>
        <Col span={24} style={{marginTop: 16}}>
             <Title level={5}>{studentAcademicRecord?.programName || t('common.unknownProgram', 'Unknown Program')}</Title>
        </Col>
        <Col xs={12} sm={8}>
            <Statistic
                title={t('studentPerformanceDashboard.progress.creditsEarned', 'Credits Earned')}
                value={progressData.totalCreditsEarned}
            />
        </Col>
         <Col xs={12} sm={8}>
            <Statistic
                title={t('studentPerformanceDashboard.progress.creditsRequired', 'Credits Required')}
                value={progressData.requiredCreditsForDegree}
            />
        </Col>
        <Col xs={24} sm={8}>
             <Statistic
                title={t('studentPerformanceDashboard.progress.creditsRemaining', 'Credits Remaining')}
                value={progressData.creditsRemaining}
                valueStyle={progressData.creditsRemaining === 0 ? {color: '#52c41a'} : {}} // Green if 0 remaining
            />
        </Col>
      </Row>
    </Card>
  );
};

export default React.memo(DegreeCompletionProgress);
