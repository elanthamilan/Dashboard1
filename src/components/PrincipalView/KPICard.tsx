// src/components/PrincipalView/KPICard.tsx
import React from 'react';
import { Card, Typography, Tooltip, Statistic, Space } from 'antd'; // Added Space
import { ArrowUpOutlined, ArrowDownOutlined, LineOutlined } from '@ant-design/icons'; // Example trend icons
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

interface KPICardProps {
  titleKey: string; // Translation key for the title
  value: string | number;
  tooltipKey: string; // Translation key for the tooltip
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
  loading?: boolean;
  valueSuffix?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  titleKey,
  value,
  tooltipKey,
  icon,
  trend,
  onClick,
  loading = false,
  valueSuffix
}) => {
  const { t } = useTranslation();

  const trendIcon = trend === 'up' ? <ArrowUpOutlined style={{ color: 'green' }} /> :
                    trend === 'down' ? <ArrowDownOutlined style={{ color: 'red' }} /> :
                    trend === 'neutral' ? <LineOutlined style={{ color: 'grey' }} /> : null;

  const cardContent = (
    <Statistic
      title={icon ? <Space>{icon}{t(titleKey)}</Space> : t(titleKey)}
      value={value}
      loading={loading}
      precision={typeof value === 'number' && !Number.isInteger(value) ? 2 : 0}
      prefix={trendIcon}
      suffix={valueSuffix}
    />
  );

  return (
    <Tooltip title={t(tooltipKey) + (loading ? "" : ` - Last updated: ${new Date().toLocaleDateString()}` )}>
      <Card hoverable={!!onClick} onClick={onClick} style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
        {cardContent}
      </Card>
    </Tooltip>
  );
};

export default KPICard;
