import React, { useEffect, useState } from 'react';
import { Typography, Breadcrumb, Card, Descriptions, Spin, List, Button, Form, Input, InputNumber, DatePicker, Select, Empty, Table, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import { useGlobalFilters } from '../../../contexts/GlobalFilterContext';
import { useTranslation } from 'react-i18next';
import { HomeOutlined } from '@ant-design/icons';
import { fetchData } from '../../../utils/apiUtils';
import dayjs from 'dayjs';
import { Pie, Column, Line } from '@ant-design/plots'; // Added Pie, Column, Line

const { Title, Paragraph, Text } = Typography;

const MODULE_KEY = 'customReports';

interface ReportParameter {
  id: string;
  name: string;
  type: 'date' | 'text' | 'number' | 'select' | 'daterange';
  options?: Array<{ label: string; value: string | number }>;
  defaultValue?: string | number | [string, string];
  required?: boolean;
}

interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  parameters: ReportParameter[];
}

interface TabularReportData {
  columns: Array<{ title: string; dataIndex: string; key: string; sorter?: boolean | object; render?: (text: any, record: any, index: number) => React.ReactNode; }>;
  rows: Array<Record<string, any>>;
}

interface ChartReportData {
  type: 'Bar' | 'Line' | 'Pie' | 'Column';
  config: any;
}

interface GeneratedReport {
  reportDefinitionId: string;
  title: string;
  generatedAt: string;
  parametersUsed?: Record<string, any>;
  content: Array<{type: 'table', data: TabularReportData} | {type: 'chart', data: ChartReportData}>;
}

interface CustomReportModuleState {
  availableReports: ReportDefinition[];
  selectedReportDefinition: ReportDefinition | null;
  reportParameters: Record<string, any>;
  generatingReport: boolean;
  generatedReport: GeneratedReport | null;
  message?: string;
  error?: string | null; // Added error to moduleState for generation errors
}

const CustomReportsModule: React.FC = () => {
  const { t } = useTranslation();
  const filters = useGlobalFilters();

  const [moduleState, setModuleState] = useState<CustomReportModuleState>({
    availableReports: [],
    selectedReportDefinition: null,
    reportParameters: {},
    generatingReport: false,
    generatedReport: null,
    message: undefined,
    error: null,
  });
  const [loading, setLoading] = useState<boolean>(true); // For initial list load
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null); // Separate error for initial load

  const handleReportSelect = (reportDef: ReportDefinition | null) => {
    if (reportDef) {
      const initialParams: Record<string, any> = {};
      reportDef.parameters.forEach(p => {
        if (p.defaultValue !== undefined) {
          initialParams[p.id] = p.defaultValue;
        } else if (p.type === 'daterange') {
          initialParams[p.id] = [null, null];
        } else {
          initialParams[p.id] = undefined;
        }
      });
      setModuleState(prev => ({
        ...prev,
        selectedReportDefinition: reportDef,
        reportParameters: initialParams,
        generatedReport: null,
        generatingReport: false,
        error: null, // Clear errors when selecting a new report
      }));
    } else {
      setModuleState(prev => ({
        ...prev,
        selectedReportDefinition: null,
        reportParameters: {},
        generatedReport: null,
        generatingReport: false,
        error: null,
      }));
    }
  };

  const handleParameterChange = (paramId: string, value: any) => {
    setModuleState(prev => ({
      ...prev,
      reportParameters: {
        ...prev.reportParameters,
        [paramId]: value,
      },
    }));
  };

  const handleGenerateReport = async () => {
    if (!moduleState.selectedReportDefinition) return;

    setModuleState(prev => ({
      ...prev,
      generatingReport: true,
      generatedReport: null,
      error: null,
    }));

    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const reportDef = moduleState.selectedReportDefinition;
      const params = moduleState.reportParameters;
      let generatedContent: Array<{type: 'table', data: TabularReportData} | {type: 'chart', data: ChartReportData}> = [];

      if (reportDef.id === 'rep1') {
        generatedContent.push({
          type: 'table',
          data: {
            columns: [
              { title: t('common.program', 'Program'), dataIndex: 'programName', key: 'programName' },
              { title: t('common.status', 'Status'), dataIndex: 'status', key: 'status' },
              { title: t('common.count', 'Count'), dataIndex: 'count', key: 'count', sorter: (a,b) => a.count - b.count },
            ],
            rows: [
              { key: '1', programName: 'B.S. Computer Science', status: params.status === 'ENR' ? 'Enrolled' : 'Dropped', count: params.status === 'ENR' ? Math.floor(Math.random() * 100) + 50 : Math.floor(Math.random() * 20) },
              { key: '2', programName: 'Master of Business Admin', status: params.status === 'ENR' ? 'Enrolled' : 'Dropped', count: params.status === 'ENR' ? Math.floor(Math.random() * 50) + 20 : Math.floor(Math.random() * 10) },
            ].filter(r => params.academicYear ? true : false),
          }
        });
        generatedContent.push({
          type: 'chart',
          data: {
            type: 'Column',
            config: {
              data: generatedContent[0].data.rows.map(r => ({ type: r.programName, value: r.count })),
              xField: 'type',
              yField: 'value',
              seriesField: 'type',
              isGroup: true,
              columnStyle: { radiusTopLeft: 10, radiusTopRight: 10 },
              meta: { type: { alias: t('common.program','Program') }, value: { alias: t('common.count','Count') } },
            }
          }
        });
      } else if (reportDef.id === 'rep2') {
        generatedContent.push({
          type: 'table',
          data: {
            columns: [
              { title: t('common.category', 'Category'), dataIndex: 'category', key: 'category' },
              { title: t('common.amount', 'Amount'), dataIndex: 'amount', key: 'amount', render: (val) => `$${Number(val).toLocaleString()}` },
            ],
            rows: [
              { key: '1', category: 'Tuition Fees Collected', amount: Math.floor(Math.random() * 50000) + 20000 },
              { key: '2', category: 'Hostel Fees Collected', amount: Math.floor(Math.random() * 20000) + 5000 },
              { key: '3', category: 'Outstanding Fees', amount: Math.floor(Math.random() * 10000) + 1000 },
            ],
          }
        });
         generatedContent.push({
          type: 'chart',
          data: {
              type: 'Pie',
              config: {
                  data: generatedContent[0].data.rows.filter(r => r.category !== 'Outstanding Fees').map(r => ({ type: r.category, value: r.amount })),
                  angleField: 'value',
                  colorField: 'type',
                  radius: 0.75,
                  label: { type: 'inner', offset: '-50%', content: '{value:$.2s}', style:{textAlign:'center', fontSize:12, fill:'#fff'}},
                  legend: {position: 'bottom'},
                  tooltip: { formatter: (datum) => ({ name: datum.type, value: `$${Number(datum.value).toLocaleString()}` }) }
              }
          }
        });
      } else {
          generatedContent.push({type: 'table', data: {columns:[], rows:[{key:'1', message: t('common.noDataForReport', 'No data generation logic for this mock report.')}]}})
      }

      const newGeneratedReport: GeneratedReport = {
        reportDefinitionId: reportDef.id,
        title: `${reportDef.name} (${t('common.generated', 'Generated')}: ${dayjs().format('YYYY-MM-DD HH:mm')})`,
        generatedAt: dayjs().toISOString(),
        parametersUsed: params,
        content: generatedContent,
      };

      setModuleState(prev => ({ ...prev, generatedReport: newGeneratedReport, generatingReport: false }));

    } catch (e: any) {
      console.error("Error generating mock report:", e);
      setModuleState(prev => ({ ...prev, error: e.message || "Failed to generate report", generatingReport: false }));
    }
  };

  useEffect(() => {
    const loadAvailableReports = async () => {
      setLoading(true);
      setInitialLoadError(null);
      setModuleState(prev => ({ ...prev, generatingReport: false, generatedReport: null, selectedReportDefinition: null, reportParameters: {}, error: null }));

      try {
        const result = await fetchData<{ availableReports?: ReportDefinition[]; message?: string }>('/principal-view/custom-reports');
        setModuleState(prev => ({
          ...prev,
          availableReports: result.availableReports || [],
          message: result.message,
        }));
      } catch (err: any) {
        console.error("Failed to fetch available reports:", err);
        setInitialLoadError(err.message || 'Failed to fetch available reports');
        setModuleState(prev => ({
          ...prev,
          message: "Mock data active for Custom Reports (available list) due to API failure.",
          availableReports: [
            {
              id: 'rep1', name: "Student Enrollment by Program",
              description: "Shows student enrollment numbers for each program.",
              parameters: [
                { id: 'academicYear', name: "Academic Year", type: "select", required: true, options: [{label: "2022-2023", value:"2022-2023"}, {label: "2023-2024", value:"2023-2024"}], defaultValue: "2023-2024" },
                { id: 'status', name: "Enrollment Status", type: "select", options: [{label:"Enrolled", value:"ENR"}, {label:"Dropped", value:"DRP"}], defaultValue: "ENR" }
              ]
            },
            {
              id: 'rep2', name: "Fee Collection Summary (Date Range)",
              description: "Summary of fees collected within a specific date range.",
              parameters: [
                { id: 'dateRange', name: "Date Range", type: "daterange", required: true, defaultValue: [dayjs().subtract(30, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')] }
              ]
            }
          ],
        }));
      } finally {
        setLoading(false);
      }
    };

    loadAvailableReports();
  }, [t]);

  return (
    <div style={{ padding: '20px' }}>
      <Breadcrumb style={{ marginBottom: '20px' }}>
        <Breadcrumb.Item>
          <Link to="/principal-view"><HomeOutlined /></Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/principal-view">{t('principalView.dashboardTitle', "Principal's Dashboard")}</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{t(`module.${MODULE_KEY}.title`)}</Breadcrumb.Item>
      </Breadcrumb>

      <Title level={2}>{t(`module.${MODULE_KEY}.title`)}</Title>
      <Paragraph>
        {t(`module.${MODULE_KEY}.descriptionPlaceholder`)}
      </Paragraph>

      <Card title={t('common.currentGlobalFilters', "Current Global Filters")} style={{ marginTop: 20, display: 'none' }}>
        <Descriptions bordered column={1} size="small">
          {/* ... Filter descriptions ... */}
        </Descriptions>
      </Card>

      <div style={{ marginTop: '20px' }}>
        {loading && <Spin tip={t('common.loadingData', "Loading data...")} />}
        {initialLoadError && !loading && <Paragraph type="danger">{t('common.errorLoadingData', "Error loading data:")} {initialLoadError}</Paragraph>}

        {moduleState.message && (
          <Paragraph style={{ marginTop: '10px', fontStyle: 'italic' }}>{moduleState.message}</Paragraph>
        )}

        {!moduleState.selectedReportDefinition && !loading && !initialLoadError && moduleState.availableReports && moduleState.availableReports.length > 0 && (
            <Card title={t(`module.${MODULE_KEY}.availableReportsTitle`, "Available Reports")}>
                <List
                  itemLayout="horizontal"
                  dataSource={moduleState.availableReports}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <Button type="primary" onClick={() => handleReportSelect(item)}>
                          {t('common.configureAndRun', "Configure & Run")}
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={item.name}
                        description={item.description}
                      />
                    </List.Item>
                  )}
                />
            </Card>
        )}
        {!moduleState.selectedReportDefinition && !loading && !initialLoadError && (!moduleState.availableReports || moduleState.availableReports.length === 0) && !moduleState.message && (
            <Empty description={t('common.noReportsAvailable', "No reports available to configure.")} />
        )}

        {moduleState.selectedReportDefinition && !moduleState.generatingReport && !moduleState.generatedReport && (
          <Card
            title={`${t('common.configureReport', "Configure Report")}: ${moduleState.selectedReportDefinition.name}`}
            style={{ marginTop: 20 }}
            extra={
              <Button onClick={() => handleReportSelect(null)}>
                {t('common.backToList', "Back to Report List")}
              </Button>
            }
          >
            <Form layout="vertical">
              {moduleState.selectedReportDefinition.parameters.map(param => {
                let inputNode: React.ReactNode;
                const currentValue = moduleState.reportParameters[param.id];
                switch (param.type) {
                  case 'text':
                    inputNode = <Input value={currentValue} onChange={e => handleParameterChange(param.id, e.target.value)} />;
                    break;
                  case 'number':
                    inputNode = <InputNumber style={{ width: '100%' }} value={currentValue} onChange={value => handleParameterChange(param.id, value)} />;
                    break;
                  case 'date':
                    inputNode = <DatePicker style={{ width: '100%' }} value={currentValue ? dayjs(currentValue) : null} onChange={(date, dateString) => handleParameterChange(param.id, dateString)} />;
                    break;
                  case 'daterange':
                    const rangeValue: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [
                        currentValue && currentValue[0] ? dayjs(currentValue[0]) : null,
                        currentValue && currentValue[1] ? dayjs(currentValue[1]) : null
                    ];
                    inputNode = <DatePicker.RangePicker style={{ width: '100%' }} value={rangeValue} onChange={(dates, dateStrings) => handleParameterChange(param.id, dateStrings)} />;
                    break;
                  case 'select':
                    inputNode = (
                      <Select style={{ width: '100%' }} value={currentValue} onChange={value => handleParameterChange(param.id, value)} placeholder={`${t('common.select', "Select")} ${param.name}`}>
                        {param.options?.map(opt => <Select.Option key={opt.value.toString()} value={opt.value}>{opt.label}</Select.Option>)}
                      </Select>
                    );
                    break;
                  default:
                    inputNode = <Text type="warning">{t('common.unsupportedParamType', "Unsupported parameter type")}</Text>;
                }
                return (
                  <Form.Item key={param.id} label={param.name} required={param.required}>
                    {inputNode}
                  </Form.Item>
                );
              })}
              <Form.Item>
                <Button type="primary" loading={moduleState.generatingReport} onClick={handleGenerateReport}>
                  {t('common.generateReport', "Generate Report")}
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={() => handleReportSelect(moduleState.selectedReportDefinition)}>
                  {t('common.resetParameters', "Reset Parameters")}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        )}

        {moduleState.generatingReport && (
          <div style={{textAlign: 'center', marginTop: 20}}><Spin size="large" tip={t('common.generatingReportTip', "Generating report...")} /></div>
        )}

        {moduleState.error && !moduleState.generatingReport && (
             <Alert message={t('common.errorGeneratingReport', "Error Generating Report")} description={moduleState.error} type="error" showIcon style={{marginTop: 20}}/>
        )}

        {moduleState.generatedReport && !moduleState.generatingReport && (
          <Card
            title={moduleState.generatedReport.title}
            style={{ marginTop: 20 }}
            extra={
              <Button onClick={() => setModuleState(prev => ({ ...prev, generatedReport: null }))}>
                {t('common.clearReport', "Clear Report")}
              </Button>
            }
          >
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 20 }}>
              <Descriptions.Item label={t('common.reportGeneratedAt', "Generated At")}>{dayjs(moduleState.generatedReport.generatedAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
              {moduleState.generatedReport.parametersUsed && Object.keys(moduleState.generatedReport.parametersUsed).length > 0 && (
                <Descriptions.Item label={t('common.parametersUsed', "Parameters Used")}>
                  <ul>
                    {Object.entries(moduleState.generatedReport.parametersUsed).map(([key, value]) => {
                      const paramDef = moduleState.selectedReportDefinition?.parameters.find(p => p.id === key);
                      let displayValue = Array.isArray(value) ? value.join(' - ') : value?.toString();
                      if (paramDef?.type === 'select' && paramDef.options) {
                        const selectedOpt = paramDef.options.find(opt => opt.value === value);
                        displayValue = selectedOpt ? selectedOpt.label : value?.toString();
                      }
                      return <li key={key}><strong>{paramDef?.name || key}:</strong> {displayValue || t('common.notSet', 'Not Set')}</li>;
                    })}
                  </ul>
                </Descriptions.Item>
              )}
            </Descriptions>

            {moduleState.generatedReport.content.map((contentBlock, index) => {
              if (contentBlock.type === 'table') {
                return (
                  <div key={`content-${index}`} style={{ marginBottom: 20 }}>
                    <Table
                      columns={contentBlock.data.columns}
                      dataSource={contentBlock.data.rows}
                      rowKey="key"
                      pagination={{ pageSize: 5, hideOnSinglePage: true }}
                      bordered
                      size="small"
                    />
                  </div>
                );
              } else if (contentBlock.type === 'chart') {
                const ChartComponent = ({ type, config }: ChartReportData) => {
                  switch (type) {
                    case 'Pie': return <Pie {...config} />;
                    case 'Column': return <Column {...config} />;
                    case 'Line': return <Line {...config} />;
                    default: return <Text type="warning">{t('common.unsupportedChartType', 'Unsupported chart type')}</Text>;
                  }
                };
                return (
                  <div key={`content-${index}`} style={{ marginBottom: 20, padding: '20px', border: '1px solid #f0f0f0' }}>
                    <ChartComponent type={contentBlock.data.type} config={contentBlock.data.config} />
                  </div>
                );
              }
              return null;
            })}
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomReportsModule;
