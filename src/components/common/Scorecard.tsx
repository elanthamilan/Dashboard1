// src/components/common/Scorecard.tsx
import React from 'react';
import { Card, Statistic, Spin } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'; // Example icons for trend
import type { StatisticProps } from 'antd';

interface ScorecardProps {
  title: string;
  value: string | number;
  prefix?: React.ReactNode;
  suffix?: string;
  icon?: React.ReactNode; // Main icon for the stat
  statusColor?: string; // For valueStyle e.g., 'green', 'red'
  loading?: boolean;
  onClick?: () => void;
  trend?: { // Optional trend indicator
    value: number; // e.g., percentage change
    direction: 'up' | 'down' | 'neutral';
    description?: string; // e.g., "vs last month"
  };
  valueStyle?: StatisticProps['valueStyle'];
  className?: string;
}

const Scorecard: React.FC<ScorecardProps> = ({
  title,
  value,
  prefix,
  suffix,
  icon,
  statusColor,
  loading,
  onClick,
  trend,
  valueStyle,
  className
}) => {
  const determinedValueStyle: StatisticProps['valueStyle'] = { ...valueStyle };
  if (statusColor) {
    determinedValueStyle.color = statusColor;
  }

  const trendIcon = trend?.direction === 'up' ? <ArrowUpOutlined /> : trend?.direction === 'down' ? <ArrowDownOutlined /> : null;

  return (
    <Card
        hoverable={!!onClick}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
        className={className}
        bordered={false}
        bodyStyle={{padding: '16px'}} // Slightly less padding for scorecards
    >
      {loading ? (
        <div style={{ textAlign: 'center', minHeight: '100px', display:'flex', alignItems:'center', justifyContent:'center' }}><Spin /></div>
      ) : (
        <>
          <Statistic
            title={
                <div style={{display:'flex', alignItems:'center', gap:'8px', whiteSpace:'normal', lineHeight:'1.2'}}>
                    {icon && <span style={{fontSize:'18px', color: '#888'}}>{icon}</span>}
                    <span style={{fontSize:'12px', color:'#595959'}}>{title}</span>
                </div>
            }
            value={value}
            precision={typeof value === 'number' && !Number.isInteger(value) ? 2 : 0} // Auto precision for floats
            prefix={prefix}
            suffix={suffix}
            valueStyle={determinedValueStyle}
          />
          {trend && (
            <div style={{ marginTop: 8, fontSize: '12px', color: trend.direction === 'up' ? 'green' : trend.direction === 'down' ? 'red' : 'gray' }}>
              {trendIcon} {trend.value}{trend.description ? ` ${trend.description}` : '%'}
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default Scorecard;
