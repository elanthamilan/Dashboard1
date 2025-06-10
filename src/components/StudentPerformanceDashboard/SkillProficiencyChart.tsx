import React, { useMemo } from 'react';
import { ResponsiveRadar } from '@nivo/radar';
import { Card, Typography, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { StudentAcademicRecord, SkillProficiency } from './types'; // Adjust path

interface SkillProficiencyChartProps {
  studentAcademicRecord: StudentAcademicRecord | null;
  loading?: boolean;
}

const SkillProficiencyChart: React.FC<SkillProficiencyChartProps> = ({ studentAcademicRecord, loading }) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    if (!studentAcademicRecord || !studentAcademicRecord.skillProficiencies || studentAcademicRecord.skillProficiencies.length === 0) {
      return [];
    }

    // Nivo Radar chart expects data in the format:
    // [ { "skill": "Skill Name", "Student A": proficiencyLevel, ... }, ... ]
    // For a single student, it's simpler:
    // [ { "skill": "Skill Name", "proficiency": proficiencyLevel }, ... ]
    // Or, if directly using the keys from the student's data:
    const dataForChart = studentAcademicRecord.skillProficiencies.map(skill => ({
      skill: skill.skillName,
      [t('studentPerformanceDashboard.charts.skills.studentSeriesName', 'Proficiency')]: skill.proficiencyLevel,
    }));

    // Nivo's ResponsiveRadar needs keys that match the dynamic part of the data objects.
    // Here, the dynamic key is the translated "Proficiency".
    return dataForChart;

  }, [studentAcademicRecord, t]);

  const proficiencyKey = t('studentPerformanceDashboard.charts.skills.studentSeriesName', 'Proficiency');


  if (loading) {
    return <Card title={t('studentPerformanceDashboard.charts.skills.title', 'Skill Proficiencies')} style={{ minHeight: 300 }} loading={true} />;
  }

  if (!studentAcademicRecord || chartData.length < 3) { // Radar chart typically needs at least 3 points to render meaningfully
     return (
        <Card title={t('studentPerformanceDashboard.charts.skills.title', 'Skill Proficiencies')} style={{ minHeight: 300 }}>
            <Empty description={t('common.noDataForChart', 'Not enough skill data for radar chart (minimum 3 skills needed).')} />
        </Card>
    );
  }

  return (
    <Card title={t('studentPerformanceDashboard.charts.skills.title', 'Skill Proficiencies')} style={{ minHeight: 300 }}>
      <div style={{ height: 250 }}> {/* Adjust height for radar chart */}
        <ResponsiveRadar
          data={chartData}
          keys={[proficiencyKey]} // Key holding the proficiency value
          indexBy="skill"      // Key holding the skill name (axis label)
          maxValue={100}       // Assuming proficiency is 0-100
          margin={{ top: 40, right: 60, bottom: 40, left: 60 }}
          curve="linearClosed"
          borderWidth={2}
          borderColor={{ from: 'color' }}
          gridLevels={5}
          gridShape="circular" // or 'linear'
          gridLabelOffset={15}
          dotSize={8}
          dotColor={{ theme: 'background' }}
          dotBorderWidth={2}
          dotBorderColor={{ from: 'color' }}
          enableDotLabel={true}
          dotLabel="value"
          dotLabelYOffset={-12}
          colors={{ scheme: 'nivo' }} // Or a specific color scheme
          fillOpacity={0.25}
          blendMode="multiply"
          animate={true}
          motionConfig="wobbly"
          isInteractive={true}
          legends={[
            {
              anchor: 'top-left',
              direction: 'column',
              translateX: -50,
              translateY: -40,
              itemWidth: 80,
              itemHeight: 20,
              itemTextColor: '#999',
              symbolSize: 12,
              symbolShape: 'circle',
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemTextColor: '#000',
                  },
                },
              ],
            },
          ]}
           tooltip={({ index, value, color }) => ( // Custom tooltip
              <div style={{ padding: '5px 10px', color, background: 'white', border: '1px solid #ccc', borderRadius: '3px' }}>
                  <strong>{index}:</strong> {value}%
              </div>
          )}
        />
      </div>
    </Card>
  );
};

export default React.memo(SkillProficiencyChart);
