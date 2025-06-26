// src/components/common/Scorecard.tsx
import React from 'react';
import { Card, Statistic, Spin, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';
import type { StatisticProps } from 'antd';
import { useTranslation } from 'react-i18next';

// Assuming DashboardKpiDataItem is imported from types/hierarchy or defined here if common
// For this subtask, let's assume it's imported or its structure is known:
// interface DashboardKpiDataItem {
//   value: number;
//   previousValue?: number;
//   changePercent?: number;
//   unit?: '%' | '$' | '' | 'days';
//   lowerIsBetter?: boolean;
// }

import { DashboardKpiDataItem } from '../../types/hierarchy'; // Adjust path if necessary

interface ScorecardProps {
  title: string;
  kpiData: DashboardKpiDataItem | undefined; // Main data item
  icon?: React.ReactNode; // Main icon for the stat
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

const { Text } = Typography;

const Scorecard: React.FC<ScorecardProps> = ({
  title,
  kpiData,
  icon,
  loading,
  onClick,
  className,
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Card className={className} bordered={false} bodyStyle={{padding: '16px', minHeight: '120px', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Spin />
      </Card>
    );
  }

  if (!kpiData) {
    return (
      <Card className={className} bordered={false} bodyStyle={{padding: '16px', minHeight: '120px'}}>
        <Statistic title={title} value={t('common.notAvailableShort', "N/A")} />
      </Card>
    );
  }

  const { value, previousValue, changePercent, unit, lowerIsBetter } = kpiData;
  const hasTrend = typeof previousValue === 'number' && typeof changePercent === 'number';

  let trendDirection: 'up' | 'down' | 'neutral' = 'neutral';
  if (changePercent && changePercent > 0) trendDirection = 'up';
  if (changePercent && changePercent < 0) trendDirection = 'down';

  let trendColor = 'grey'; // Neutral
  if (trendDirection === 'up') {
    trendColor = lowerIsBetter ? 'red' : 'green';
  } else if (trendDirection === 'down') {
    trendColor = lowerIsBetter ? 'green' : 'red';
  }

  const trendIcon = trendDirection === 'up' ? <ArrowUpOutlined /> : trendDirection === 'down' ? <ArrowDownOutlined /> : <MinusOutlined style={{fontSize:'10px'}}/>;

  // Determine precision for value and previousValue
  const valuePrecision = Number.isInteger(value) && unit !== '$' && unit !== '%' ? 0 : (unit === '%' ? 1 : 2);
  const prevValuePrecision = previousValue && Number.isInteger(previousValue) && unit !== '$' && unit !== '%' ? 0 : (unit === '%' ? 1 : 2);


  const formattedValue = unit === '$' ? `${value.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:0})}` :
                         unit === '%' ? `${value.toFixed(valuePrecision)}` :
                         unit === 'days' ? `${value.toFixed(0)}` :
                         Number.isInteger(value) ? value.toLocaleString() : value.toFixed(valuePrecision);

  const valuePrefix = unit === '$' ? t('common.currencySymbol', '$') : undefined; // Use t function for currency symbol
  const valueSuffix = unit === '%' ? '%' : unit === 'days' ? ` ${t('common.days','days')}`: '';


  return (
    <Card
        hoverable={!!onClick}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default', minHeight: '120px' }} // Ensure consistent height
        className={className}
        bordered={false}
        bodyStyle={{padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%'}}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text style={{ fontSize: '13px', color: '#595959', marginBottom: '8px', display:'block', whiteSpace:'normal', lineHeight:'1.3' }}>{title}</Text>
          {icon && <span style={{ fontSize: '20px', color: '#8c8c8c' }}>{icon}</span>}
        </div>
        <Statistic
          value={formattedValue}
          precision={0} // Already handled by formattedValue
          prefix={valuePrefix}
          suffix={valueSuffix}
          valueStyle={{ fontSize: '24px', fontWeight: 500, color: '#262626' }}
        />
      </div>
      {hasTrend && (
        <div style={{ marginTop: 8, fontSize: '12px', display:'flex', alignItems:'center' }}>
          <Text style={{ color: trendColor, marginRight: 4, display:'flex', alignItems:'center' }}>
            {trendIcon} {changePercent?.toFixed(1)}%
          </Text>
          <Text type="secondary" style={{fontSize:'12px'}}>{t('common.vsPreviousPeriod', "vs. previous period")}</Text>
        </div>
      )}
       {!hasTrend && (<div style={{height: '26px', marginTop:8}}></div>) /* Placeholder for consistent height */}
    </Card>
  );
};

export default Scorecard;
