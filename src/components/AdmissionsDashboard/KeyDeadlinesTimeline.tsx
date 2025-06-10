import React from 'react';
import { Card, Timeline, Typography, Tag } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs'; // Ensure dayjs is available

interface Deadline {
  id: string;
  date: string; // ISO string
  titleKey: string; // Translation key for title
  descriptionKey?: string; // Translation key for description
  status?: 'upcoming' | 'past' | 'today';
  color?: string; // Ant Design color for the dot
}

// Mock deadlines data
const mockDeadlines: Deadline[] = [
  {
    id: 'app-close',
    date: dayjs().subtract(10, 'day').toISOString(), // Example: 10 days ago
    titleKey: 'admissionsDashboard.deadlines.applicationClose',
    descriptionKey: 'admissionsDashboard.deadlines.applicationCloseDesc',
    status: 'past',
    color: 'red',
  },
  {
    id: 'interview-start',
    date: dayjs().add(5, 'day').toISOString(), // Example: 5 days from now
    titleKey: 'admissionsDashboard.deadlines.interviewPeriodStart',
    status: 'upcoming',
    color: 'blue',
  },
  {
    id: 'interview-end',
    date: dayjs().add(15, 'day').toISOString(), // Example: 15 days from now
    titleKey: 'admissionsDashboard.deadlines.interviewPeriodEnd',
    status: 'upcoming',
    color: 'blue',
  },
  {
    id: 'offer-release',
    date: dayjs().add(30, 'day').toISOString(), // Example: 30 days from now
    titleKey: 'admissionsDashboard.deadlines.offerRelease',
    descriptionKey: 'admissionsDashboard.deadlines.offerReleaseDesc',
    status: 'upcoming',
    color: 'green',
  },
   {
    id: 'orientation-day',
    date: dayjs().add(2, 'day').toISOString(),
    titleKey: 'admissionsDashboard.deadlines.orientationDay',
    status: 'upcoming',
    color: 'purple',
  },
];

// Function to determine status dynamically (optional enhancement, for now using predefined)
const getDeadlineStatus = (date: string): { status: 'upcoming' | 'past' | 'today', color: string } => {
    const today = dayjs().startOf('day');
    const deadlineDate = dayjs(date).startOf('day');
    if (deadlineDate.isBefore(today)) return { status: 'past', color: 'red' };
    if (deadlineDate.isSame(today)) return { status: 'today', color: 'orange' };
    return { status: 'upcoming', color: 'blue' };
};


const KeyDeadlinesTimeline: React.FC<{ loading?: boolean }> = ({ loading }) => {
  const { t } = useTranslation();

  const sortedDeadlines = mockDeadlines.map(d => {
      const dynamicStatus = getDeadlineStatus(d.date);
      return {...d, status: dynamicStatus.status, color: d.color || dynamicStatus.color };
  }).sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());


  if (loading) {
    return <Card title={t('admissionsDashboard.deadlines.title', 'Key Deadlines')} style={{ minHeight: 300 }} loading={true} />;
  }

  return (
    <Card title={t('admissionsDashboard.deadlines.title', 'Key Deadlines')} style={{ minHeight: 300 /* Match Funnel Chart height approx */ }}>
      {sortedDeadlines.length === 0 ? (
        <Typography.Text>{t('common.noData', 'No deadlines to display.')}</Typography.Text>
      ) : (
        <Timeline mode="left" style={{ marginTop: '20px', paddingLeft: '5px' }}>
          {sortedDeadlines.map(deadline => {
            const isPast = deadline.status === 'past';
            return (
              <Timeline.Item
                key={deadline.id}
                label={dayjs(deadline.date).format('MMM DD, YYYY')}
                color={deadline.color}
                dot={isPast ? <ClockCircleOutlined /> : undefined}
              >
                <Typography.Text strong>{t(deadline.titleKey)}</Typography.Text>
                {deadline.descriptionKey && (
                  <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    {t(deadline.descriptionKey)}
                  </Typography.Paragraph>
                )}
                 {deadline.status === 'today' && <Tag color="orange">{t('common.status.today', 'Today')}</Tag>}
                 {deadline.status === 'upcoming' && dayjs(deadline.date).diff(dayjs(), 'day') <=7 &&  <Tag color="geekblue">{t('common.status.soon', 'Soon')}</Tag>}
              </Timeline.Item>
            );
          })}
        </Timeline>
      )}
    </Card>
  );
};

export default KeyDeadlinesTimeline;
