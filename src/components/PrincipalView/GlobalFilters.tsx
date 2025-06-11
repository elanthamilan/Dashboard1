// src/components/PrincipalView/GlobalFilters.tsx
import React from 'react';
import { Row, Col, Select, DatePicker, Typography, Space, Button } from 'antd'; // Added Button
import { useTranslation } from 'react-i18next';
import { useGlobalFilters } from '../../contexts/GlobalFilterContext'; // Import context hook

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

// Placeholder data - this will be replaced by actual data or props later
const mockAcademicYears = [
  { id: '2023-2024', name: 'Academic Year 2023-2024' },
  { id: '2022-2023', name: 'Academic Year 2022-2023' },
];

const mockCampuses = [
  { id: 'main', name: 'Main Campus' },
  { id: 'satellite', name: 'Satellite Campus (Mocked)' },
];

const mockDegreeTypes = [
  { id: 'bachelors', name: 'Bachelor\'s Degrees' },
  { id: 'masters', name: 'Master\'s Degrees' },
];

const mockDepartments = [
  { id: 'cs', name: 'Computer Science (Mocked)' },
  { id: 'eng', name: 'Engineering (Mocked)' },
];

const GlobalFilters: React.FC = () => {
  const { t } = useTranslation();
  const {
    academicYear, campus, degreeType, department, dateRange,
    setAcademicYear, setCampus, setDegreeType, setDepartment, setDateRange, clearFilters
  } = useGlobalFilters(); // Use context

  // Helper to convert null to undefined for Select components
  const selectValue = (value: string | null) => value === null ? undefined : value;

  return (
    <div style={{ padding: '16px', border: '1px solid #f0f0f0', marginBottom: '20px', borderRadius: '8px' }}>
      <Row gutter={[16, 16]} align="bottom">
        <Col xs={24} sm={12} md={8} lg={4}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>{t('filters.academicYear')}</Text>
            <Select
              value={selectValue(academicYear)}
              style={{ width: '100%' }}
              placeholder={t('filters.selectAcademicYear')}
              onChange={(value) => setAcademicYear(value || null)}
              allowClear
            >
              {mockAcademicYears.map(year => (
                <Option key={year.id} value={year.id}>{year.name}</Option>
              ))}
            </Select>
          </Space>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>{t('filters.campus')}</Text>
            <Select
              value={selectValue(campus)}
              style={{ width: '100%' }}
              placeholder={t('filters.selectCampus')}
              onChange={(value) => setCampus(value || null)}
              allowClear
            >
              {mockCampuses.map(c => (
                <Option key={c.id} value={c.id}>{c.name}</Option>
              ))}
            </Select>
          </Space>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>{t('filters.degreeType')}</Text>
            <Select
              value={selectValue(degreeType)}
              style={{ width: '100%' }}
              placeholder={t('filters.selectDegreeType')}
              onChange={(value) => setDegreeType(value || null)}
              allowClear
            >
              {mockDegreeTypes.map(d => (
                <Option key={d.id} value={d.id}>{d.name}</Option>
              ))}
            </Select>
          </Space>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>{t('filters.department')}</Text>
            <Select
              value={selectValue(department)}
              style={{ width: '100%' }}
              placeholder={t('filters.selectDepartment')}
              onChange={(value) => setDepartment(value || null)}
              allowClear
            >
              {mockDepartments.map(dept => (
                <Option key={dept.id} value={dept.id}>{dept.name}</Option>
              ))}
            </Select>
          </Space>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}> {/* Adjusted lg span */}
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>{t('filters.dateRange')}</Text>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates, dateStrings) => setDateRange(dates ? [dateStrings[0], dateStrings[1]] : null)}
              // value (controlled) can be added if needed, requires conversion from string array to Dayjs array
            />
          </Space>
        </Col>
        <Col xs={24} sm={12} md={8} lg={2}> {/* Adjusted lg span */}
            <Button onClick={clearFilters} style={{ width: '100%' }}>
              {t('filters.clear')}
            </Button>
        </Col>
      </Row>
    </div>
  );
};

export default GlobalFilters;
