import React from 'react';
import { Card, Timeline, Typography, Tag } from 'antd';
import { Card, Timeline, Typography, Tag, Spin, Empty } from 'antd'; // Added Spin, Empty
import { ClockCircleOutlined, FileDoneOutlined, ScheduleOutlined, CheckCircleOutlined, NotificationOutlined } from '@ant-design/icons'; // Added more icons
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { KeyDeadline } from './types'; // Import the correct KeyDeadline type

interface KeyDeadlinesTimelineProps {
  deadlines: KeyDeadline[];
  loading: boolean;
}

// Function to determine status dynamically and icon/color based on type
const getDeadlineVisuals = (deadline: KeyDeadline): { status: 'upcoming' | 'past' | 'today'; color: string; icon?: React.ReactNode } => {
    const today = dayjs().startOf('day');
    const deadlineDate = dayjs(deadline.date).startOf('day');
    let status: 'upcoming' | 'past' | 'today';
    let color = 'blue'; // Default for upcoming
    let icon: React.ReactNode | undefined = undefined;

    if (deadlineDate.isBefore(today)) {
        status = 'past';
        color = 'red';
        icon = <ClockCircleOutlined />;
    } else if (deadlineDate.isSame(today)) {
        status = 'today';
        color = 'orange';
    } else {
        status = 'upcoming';
    }

    // Customize color/icon based on deadline.type
    switch (deadline.type) {
        case 'Application':
            icon = icon || <FileDoneOutlined />; // Use past icon if past, otherwise this
            if (status === 'upcoming') color = 'geekblue';
            break;
        case 'Interview':
            icon = icon || <ScheduleOutlined />;
            if (status === 'upcoming') color = 'cyan';
            break;
        case 'Decision':
            icon = icon || <NotificationOutlined />;
            if (status === 'upcoming') color = 'purple';
            break;
        case 'Enrollment':
            icon = icon || <CheckCircleOutlined />;
            if (status === 'upcoming') color = 'green';
            break;
        default:
            icon = icon || <ClockCircleOutlined />; // Default icon
    }

    return { status, color, icon };
};


const KeyDeadlinesTimeline: React.FC<KeyDeadlinesTimelineProps> = ({ deadlines, loading }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Card title={t('admissionsDashboard.deadlines.title', 'Key Deadlines')} style={{ minHeight: 300 }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Spin />
        </div>
      </Card>
    );
  }

  if (!deadlines || deadlines.length === 0) {
    return (
      <Card title={t('admissionsDashboard.deadlines.title', 'Key Deadlines')} style={{ minHeight: 300 }}>
        <Empty description={t('common.noData', 'No deadlines to display.')} />
      </Card>
    );
  }

  const sortedDeadlines = [...deadlines] // Create a new array before sorting
    .map(d => ({ ...d, visuals: getDeadlineVisuals(d) }))
    .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());


  return (
    <Card title={t('admissionsDashboard.deadlines.title', 'Key Deadlines')} style={{ minHeight: 300 }}>
      <Timeline mode="left" style={{ marginTop: '20px', paddingLeft: '5px' }}>
        {sortedDeadlines.map(deadline => {
          return (
            <Timeline.Item
              key={deadline.id}
              label={dayjs(deadline.date).format('MMM DD, YYYY')}
              color={deadline.visuals.color}
              dot={deadline.visuals.icon}
            >
              <Typography.Text strong>{deadline.title}</Typography.Text> {/* Use direct title */}
              {deadline.description && ( // Use direct description
                <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {deadline.description}
                </Typography.Paragraph>
              )}
               {deadline.visuals.status === 'today' && <Tag color={deadline.visuals.color}>{t('common.status.today', 'Today')}</Tag>}
               {deadline.visuals.status === 'upcoming' && dayjs(deadline.date).diff(dayjs(), 'day') <= 7 && dayjs(deadline.date).diff(dayjs(), 'day') >=0 && <Tag color={deadline.visuals.color}>{t('common.status.soon', 'Soon')}</Tag>}
               {deadline.visuals.status === 'past' && <Tag color={deadline.visuals.color}>{t('common.status.past', 'Past')}</Tag>}
            </Timeline.Item>
          );
        })}
      </Timeline>
    </Card>
  );
};

export default KeyDeadlinesTimeline;
