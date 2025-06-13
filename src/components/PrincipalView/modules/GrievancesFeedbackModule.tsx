import React, { useEffect, useState } from 'react';
import { Typography, Breadcrumb, Card, Descriptions, Spin, List, Table, Tag, Statistic, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import { useGlobalFilters } from '../../../contexts/GlobalFilterContext';
import { useTranslation } from 'react-i18next';
import { HomeOutlined, PieChartOutlined, BarChartOutlined } from '@ant-design/icons';
import { fetchData } from '../../../utils/apiUtils';
import dayjs from 'dayjs';
import { Pie, Column, Bar, Line, Donut } from '@ant-design/plots'; // Added Donut
import { Empty } from 'antd';

const { Title, Paragraph, Text } = Typography;

const MODULE_KEY = 'grievances';

// Updated Interfaces from prompt
type GrievanceStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Re-opened'; // Added Re-opened
type FeedbackCategory = 'Academic' | 'Administrative' | 'Facilities' | 'Faculty' | 'Student Life' | 'Other'; // Expanded
type ComplainantType = 'Student' | 'Faculty' | 'Staff' | 'Parent' | 'Anonymous';
type FeedbackSentiment = 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
type GrievancePriority = 'High' | 'Medium' | 'Low';

interface Grievance {
  id: string;
  submittedBy: string; // User ID or name
  dateSubmitted: string; // YYYY-MM-DD
  category: string; // Free text or predefined list from a config
  description: string;
  status: GrievanceStatus;
  resolution?: string;
  dateResolved?: string; // YYYY-MM-DD
  // New fields:
  complainantType?: ComplainantType;
  departmentId?: string; // Department grievance relates to OR complainant's department
  departmentName?: string; // Denormalized
  priority?: GrievancePriority;
  resolutionTimeDays?: number; // Calculated: dateResolved - dateSubmitted
  reOpenedCount?: number; // Default 0
  slaDays?: number; // Target resolution days for this type/priority
  lastUpdated?: string; // YYYY-MM-DD HH:mm
}

interface Feedback {
  id: string;
  submittedBy: string; // User ID or name
  dateSubmitted: string; // YYYY-MM-DD
  category: FeedbackCategory;
  comments: string;
  rating?: number; // e.g., 1-5 stars
  // New fields:
  sentiment?: FeedbackSentiment;
  departmentId?: string; // Department feedback relates to
  departmentName?: string; // Denormalized
  keywords?: string[]; // Array of relevant keywords/tags
  isAnonymous?: boolean; // if submittedBy is 'Anonymous'
}

interface GrievancesFeedbackStats {
  totalOpenGrievances?: number;
  avgResolutionTimeDays?: number; // Overall
  totalFeedbackReceived?: number;
  avgFeedbackRating?: number;
  // New fields:
  totalReopenedGrievances?: number;
  avgResolutionTimeByCategory?: Record<string, number>; // Key: category name
  avgResolutionTimeByPriority?: Record<GrievancePriority, number>; // Key: priority
  feedbackSentimentCounts?: Record<FeedbackSentiment, number>;
  grievancesMetSLAMount?: number; // Count of grievances met SLA
  grievancesMissedSLAMount?: number; // Count of grievances missed SLA
  grievanceCountByComplainantType?: Record<ComplainantType, number>;
}

interface GrievancesFeedbackData { // Main state type
  grievances?: Grievance[];
  feedback?: Feedback[];
  stats?: GrievancesFeedbackStats;
  message?: string;
}

const GrievancesFeedbackModule: React.FC = () => {
  const { t } = useTranslation();
  const filters = useGlobalFilters();

  const [grievancesData, setGrievancesData] = useState<GrievancesFeedbackData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGrievancesData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchData<GrievancesFeedbackData>('/principal-view/grievances-feedback');
        setGrievancesData(result);
      } catch (err: any) {
        console.warn("Falling back to mock data for GrievancesFeedbackModule due to API error:", err);
        setError(err.message || t('errors.failedToFetchGrievancesData', 'Failed to fetch grievances & feedback data'));

        const F = await import('@faker-js/faker'); // Dynamic import for faker
        const {faker} = F;
        // dayjs is already imported globally

        const mockGrievancesList: Grievance[] = [];
        const numGrievances = faker.number.int({ min: 15, max: 40 });
        const grievanceCategories = ['Library', 'IT Support', 'Canteen', 'Hostel', 'Academics', 'Admin Office', 'Examinations', 'Sports Facility'];
        const departments = [
            { id: 'CSCI', name: t('common.departments.computerScience', 'Computer Science')},
            { id: 'PHYS', name: t('common.departments.physics', 'Physics')},
            { id: 'LIB', name: t('common.departments.library', 'Library Services')},
            { id: 'ADMIN', name: t('common.departments.generalAdmin', 'General Administration')},
            { id: 'HOSTEL', name: t('common.departments.hostel', 'Hostel Management')}
        ];
        const complainantTypes: ComplainantType[] = ['Student', 'Faculty', 'Staff', 'Parent', 'Anonymous'];
        const grievanceStatuses: GrievanceStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed', 'Re-opened'];
        const priorities: GrievancePriority[] = ['High', 'Medium', 'Low'];

        for (let i = 0; i < numGrievances; i++) {
            const dateSubmitted = dayjs(faker.date.past({ years: 1 }));
            const status = faker.helpers.arrayElement(grievanceStatuses);
            const priority = faker.helpers.arrayElement(priorities);
            let dateResolved: dayjs.Dayjs | undefined;
            let resolutionTimeDays: number | undefined;

            if (status === 'Resolved' || status === 'Closed' || (status === 'Re-opened' && Math.random() < 0.8)) { // 80% of re-opened were previously resolved
                dateResolved = dateSubmitted.add(faker.number.int({ min: 1, max: 30 }), 'day');
                resolutionTimeDays = dateResolved.diff(dateSubmitted, 'day');
            }
            const dept = faker.helpers.arrayElement(departments);
            const reOpenedCount = status === 'Re-opened' ? faker.number.int({min:1, max:2}) : (Math.random() < 0.1 ? 1 : 0);

            mockGrievancesList.push({
                id: `G${faker.string.uuid().substring(0,4)}`,
                submittedBy: `User${faker.number.int({min:100,max:500})}`,
                dateSubmitted: dateSubmitted.format('YYYY-MM-DD'),
                category: faker.helpers.arrayElement(grievanceCategories),
                description: faker.lorem.sentence(faker.number.int({min: 8, max: 20})),
                status,
                resolution: (status === 'Resolved' || status === 'Closed') ? faker.lorem.sentence(faker.number.int({min:5, max:15})) : undefined,
                dateResolved: dateResolved?.format('YYYY-MM-DD'),
                complainantType: faker.helpers.arrayElement(complainantTypes),
                departmentId: dept.id,
                departmentName: dept.name,
                priority,
                resolutionTimeDays,
                reOpenedCount: reOpenedCount,
                slaDays: priority === 'High' ? 3 : priority === 'Medium' ? 7 : 15,
                lastUpdated: dayjs(dateResolved || dateSubmitted).add(faker.number.int({min:0,max:10}), 'day').format('YYYY-MM-DD HH:mm'),
            });
        }

        const mockFeedbackList: Feedback[] = [];
        const numFeedback = faker.number.int({ min: 10, max: 30 });
        const feedbackCats: FeedbackCategory[] = ['Academic', 'Administrative', 'Facilities', 'Faculty', 'Student Life', 'Other'];
        const sentiments: FeedbackSentiment[] = ['Positive', 'Negative', 'Neutral', 'Mixed'];

        for (let i = 0; i < numFeedback; i++) {
            const dept = faker.helpers.arrayElement(departments);
            const isAnon = Math.random() < 0.1;
            mockFeedbackList.push({
                id: `F${faker.string.uuid().substring(0,4)}`,
                submittedBy: isAnon ? 'Anonymous' : `User${faker.number.int({min:100,max:500})}`,
                dateSubmitted: dayjs(faker.date.past({ years: 1 })).format('YYYY-MM-DD'),
                category: faker.helpers.arrayElement(feedbackCats),
                comments: faker.lorem.paragraph(faker.number.int({min:1, max:3})),
                rating: faker.number.int({ min: 1, max: 5 }),
                sentiment: faker.helpers.arrayElement(sentiments),
                departmentId: dept.id,
                departmentName: dept.name,
                keywords: faker.helpers.arrayElements(faker.lorem.words(10).split(' '), faker.number.int({min:2,max:5})),
                isAnonymous: isAnon,
            });
        }

        // Calculate Stats
        const calculatedStats: GrievancesFeedbackStats = {
            totalOpenGrievances: mockGrievancesList.filter(g => g.status === 'Open' || g.status === 'In Progress' || g.status === 'Re-opened').length,
            totalFeedbackReceived: mockFeedbackList.length,
            totalReopenedGrievances: mockGrievancesList.reduce((sum,g) => sum + (g.reOpenedCount || 0), 0),
            feedbackSentimentCounts: mockFeedbackList.reduce((acc, f) => {
                const sent = f.sentiment || 'Neutral';
                acc[sent] = (acc[sent] || 0) + 1;
                return acc;
            }, {} as Record<FeedbackSentiment,number>),
            grievanceCountByComplainantType: mockGrievancesList.reduce((acc,g)=>{
                const type = g.complainantType || 'Anonymous';
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, {} as Record<ComplainantType, number>),
            avgResolutionTimeDays: 0, // Calculated below
            avgFeedbackRating: 0, // Calculated below
            avgResolutionTimeByCategory: {},
            avgResolutionTimeByPriority: {},
            grievancesMetSLAMount: 0,
            grievancesMissedSLAMount: 0,
        };

        const resolvedGrievances = mockGrievancesList.filter(g => g.resolutionTimeDays !== undefined && g.resolutionTimeDays !== null);
        if (resolvedGrievances.length > 0) {
            calculatedStats.avgResolutionTimeDays = parseFloat((resolvedGrievances.reduce((sum, g) => sum + g.resolutionTimeDays!, 0) / resolvedGrievances.length).toFixed(1));
        }

        const ratedFeedback = mockFeedbackList.filter(f => f.rating !== undefined && f.rating !== null);
        if (ratedFeedback.length > 0) {
            calculatedStats.avgFeedbackRating = parseFloat((ratedFeedback.reduce((sum, f) => sum + f.rating!, 0) / ratedFeedback.length).toFixed(1));
        }

        const resTimeByCategory: Record<string, { sum: number, count: number}> = {};
        const resTimeByPriority: Record<string, { sum: number, count: number}> = {};

        resolvedGrievances.forEach(g => {
            // By Category
            if(g.category) {
                if(!resTimeByCategory[g.category]) resTimeByCategory[g.category] = {sum:0, count:0};
                resTimeByCategory[g.category].sum += g.resolutionTimeDays!;
                resTimeByCategory[g.category].count++;
            }
            // By Priority
            if(g.priority) {
                if(!resTimeByPriority[g.priority]) resTimeByPriority[g.priority] = {sum:0, count:0};
                resTimeByPriority[g.priority].sum += g.resolutionTimeDays!;
                resTimeByPriority[g.priority].count++;
            }
            // SLA
            if (g.slaDays !== undefined) {
                if (g.resolutionTimeDays! <= g.slaDays) {
                    calculatedStats.grievancesMetSLAMount = (calculatedStats.grievancesMetSLAMount || 0) + 1;
                } else {
                    calculatedStats.grievancesMissedSLAMount = (calculatedStats.grievancesMissedSLAMount || 0) + 1;
                }
            }
        });

        for(const cat in resTimeByCategory){
            calculatedStats.avgResolutionTimeByCategory![cat] = parseFloat((resTimeByCategory[cat].sum / resTimeByCategory[cat].count).toFixed(1));
        }
        for(const prio in resTimeByPriority){
            calculatedStats.avgResolutionTimeByPriority![prio as GrievancePriority] = parseFloat((resTimeByPriority[prio].sum / resTimeByPriority[prio].count).toFixed(1));
        }

        setGrievancesData({
            message: t('errors.mockDataActiveGrievances', "Mock data active for Grievances & Feedback due to API failure."),
            grievances: mockGrievancesList,
            feedback: mockFeedbackList,
            stats: calculatedStats
        });
      } finally {
        setLoading(false);
      }
    };

    loadGrievancesData();
  }, [filters.academicYear, filters.institutionId]); // Added filters dependency from previous step, ensuring it's kept

  // --- Existing useMemo hooks if any would be here ---

  // Data for Grievances by Category (Bar Chart)
  const grievancesByCategoryChartData = React.useMemo(() => {
    if (!grievancesData?.grievances) return [];
    const categoryCounts = grievancesData.grievances.reduce((acc, g) => {
      const category = g.category || t('common.unknownCategory', 'Uncategorized');
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(categoryCounts).map(([category, count]) => ({ category, count })).sort((a,b) => b.count - a.count);
  }, [grievancesData?.grievances, t]);

  // Data for Trend of Grievances Lodged Over Time (Monthly)
  const grievancesTrendData = React.useMemo(() => {
    if (!grievancesData?.grievances) return [];
    const monthlyCounts: Record<string, number> = {}; // YYYY-MM -> Count
    grievancesData.grievances.forEach(g => {
      const monthYear = dayjs(g.dateSubmitted).format('YYYY-MM');
      monthlyCounts[monthYear] = (monthlyCounts[monthYear] || 0) + 1;
    });
    // Ensure we have data for the last 12 months, even if count is 0
    const last12Months: {monthYear: string, count: number}[] = [];
    for (let i = 11; i >= 0; i--) {
        const month = dayjs().subtract(i, 'month').format('YYYY-MM');
        last12Months.push({ monthYear: month, count: monthlyCounts[month] || 0 });
    }
    return last12Months;
  }, [grievancesData?.grievances]);

  // Data for Average Resolution Time by Category (using pre-calculated stats if available)
  const avgResTimeByCategoryChartData = React.useMemo(() => {
    if (!grievancesData?.stats?.avgResolutionTimeByCategory) return [];
    return Object.entries(grievancesData.stats.avgResolutionTimeByCategory)
      .map(([category, avgDays]) => ({ category, avgDays }))
      .sort((a,b) => b.avgDays - a.avgDays);
  }, [grievancesData?.stats?.avgResolutionTimeByCategory]);

  // Data for Average Resolution Time by Priority (using pre-calculated stats if available)
  const avgResTimeByPriorityChartData = React.useMemo(() => {
    if (!grievancesData?.stats?.avgResolutionTimeByPriority) return [];
    const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 } as Record<GrievancePriority, number>;
    return Object.entries(grievancesData.stats.avgResolutionTimeByPriority)
      .map(([priority, avgDays]) => ({ priority: priority as GrievancePriority, avgDays }))
      .sort((a,b) => (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99) );
  }, [grievancesData?.stats?.avgResolutionTimeByPriority]);

  // Data for Grievances by Complainant Type (using pre-calculated stats if available)
  const grievancesByComplainantTypeChartData = React.useMemo(() => {
    if (!grievancesData?.stats?.grievanceCountByComplainantType) return [];
    return Object.entries(grievancesData.stats.grievanceCountByComplainantType)
      .map(([type, count]) => ({ type, count: count as number })) // ensure count is number
      .filter(item => item.count > 0)
      .sort((a,b) => b.count - a.count);
  }, [grievancesData?.stats?.grievanceCountByComplainantType]);

  // Data for Open Grievances by Age
  const openGrievancesByAgeData = React.useMemo(() => {
    if (!grievancesData?.grievances) return [];
    const today = dayjs();
    const ageBuckets: Record<string, number> = {
      [t('common.ageBuckets.d0_7', "0-7 Days")]: 0,
      [t('common.ageBuckets.d8_15', "8-15 Days")]: 0,
      [t('common.ageBuckets.d16_30', "16-30 Days")]: 0,
      [t('common.ageBuckets.d30plus', "30+ Days")]: 0,
    };
    grievancesData.grievances.forEach(g => {
      if (g.status === 'Open' || g.status === 'In Progress' || g.status === 'Re-opened') {
        const ageDays = today.diff(dayjs(g.dateSubmitted), 'day');
        if (ageDays <= 7) ageBuckets[t('common.ageBuckets.d0_7', "0-7 Days")]++;
        else if (ageDays <= 15) ageBuckets[t('common.ageBuckets.d8_15', "8-15 Days")]++;
        else if (ageDays <= 30) ageBuckets[t('common.ageBuckets.d16_30', "16-30 Days")]++;
        else ageBuckets[t('common.ageBuckets.d30plus', "30+ Days")]++;
      }
    });
    return Object.entries(ageBuckets).map(([ageBucket, count]) => ({ ageBucket, count })).filter(item => item.count > 0);
  }, [grievancesData?.grievances, t]);

  // --- Deeper Feedback Analysis ---
  const feedbackByCategoryChartData = React.useMemo(() => {
    if (!grievancesData?.feedback) return [];
    const categoryCounts = grievancesData.feedback.reduce((acc, f) => {
      const category = f.category || t('common.unknownCategory', 'Uncategorized');
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(categoryCounts).map(([category, count]) => ({ category, count })).sort((a,b) => b.count - a.count);
  }, [grievancesData?.feedback, t]);

  const feedbackSentimentChartData = React.useMemo(() => {
    if (!grievancesData?.feedback) return [];
    if (grievancesData.stats?.feedbackSentimentCounts) {
        return Object.entries(grievancesData.stats.feedbackSentimentCounts)
           .map(([sentiment, count]) => ({ sentiment, count: count as number })) // Ensure count is number
           .filter(item => item.count > 0);
    }
    const sentimentCounts = grievancesData.feedback.reduce((acc, f) => {
      const sentiment = f.sentiment || t('common.sentiments.unknown', 'Unknown');
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(sentimentCounts).map(([sentiment, count]) => ({ sentiment, count })).filter(item => item.count > 0);
  }, [grievancesData?.feedback, grievancesData?.stats?.feedbackSentimentCounts, t]);

  const feedbackTrendData = React.useMemo(() => {
    if (!grievancesData?.feedback) return [];
    const monthlyCounts: Record<string, number> = {};
    // Ensure we have data for the last 12 months for feedback trend as well
    const last12MonthsMap: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
        const month = dayjs().subtract(i, 'month').format('YYYY-MM');
        last12MonthsMap[month] = 0;
    }
    grievancesData.feedback.forEach(f => {
      const monthYear = dayjs(f.dateSubmitted).format('YYYY-MM');
      if(last12MonthsMap.hasOwnProperty(monthYear)) { // Only count if in the last 12 months
        last12MonthsMap[monthYear] = (last12MonthsMap[monthYear] || 0) + 1;
      }
    });
    return Object.entries(last12MonthsMap)
      .map(([monthYear, count]) => ({ monthYear, count }))
      .sort((a, b) => a.monthYear.localeCompare(b.monthYear));
  }, [grievancesData?.feedback]);

  const avgFeedbackRatingByCategoryData = React.useMemo(() => {
    if (!grievancesData?.feedback) return [];
    const categoryRatings: Record<string, { totalRating: number; count: number }> = {};
    grievancesData.feedback.forEach(f => {
      if (f.rating !== undefined && f.rating !== null) {
        const category = f.category || t('common.unknownCategory', 'Uncategorized');
        if (!categoryRatings[category]) categoryRatings[category] = { totalRating: 0, count: 0 };
        categoryRatings[category].totalRating += f.rating;
        categoryRatings[category].count++;
      }
    });
    return Object.entries(categoryRatings)
      .map(([category, data]) => ({ category, avgRating: data.count > 0 ? parseFloat((data.totalRating / data.count).toFixed(1)) : 0 }))
      .filter(item => item.avgRating > 0)
      .sort((a,b) => b.avgRating - a.avgRating);
  }, [grievancesData?.feedback, t]);

  const topFeedbackKeywordsData = React.useMemo(() => {
    if (!grievancesData?.feedback) return [];
    const keywordCounts: Record<string, number> = {};
    grievancesData.feedback.forEach(f => {
      (f.keywords || []).forEach(kw => {
        keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
      });
    });
    return Object.entries(keywordCounts)
       .map(([keyword, count]) => ({ keyword, count }))
       .sort((a,b) => b.count - a.count)
       .slice(0, 10);
  }, [grievancesData?.feedback]);

  // --- Status Tracking & Cross-Analysis ---
  const grievanceSlaPerformance = React.useMemo(() => {
       if (!grievancesData?.stats || grievancesData.stats.grievancesMetSLAMount === undefined || grievancesData.stats.grievancesMissedSLAMount === undefined) {
           if(!grievancesData?.grievances) return { metSLA: 0, missedSLA: 0, totalResolvedWithSLA: 0, metRate:0, dataForChart:[] };
           let met = 0;
           let missed = 0;
           grievancesData.grievances.forEach(g => {
               if (g.status === 'Resolved' || g.status === 'Closed') {
                   if (g.resolutionTimeDays !== undefined && g.slaDays !== undefined) {
                       if (g.resolutionTimeDays <= g.slaDays) met++;
                       else missed++;
                   }
               }
           });
           const totalWithSla = met + missed;
           return {
               metSLA: met,
               missedSLA: missed,
               totalResolvedWithSLA: totalWithSla,
               metRate: totalWithSla > 0 ? parseFloat(((met / totalWithSla) * 100).toFixed(1)) : 0,
               dataForChart: [
                   {type: t('common.sla.met', 'Met SLA'), count: met},
                   {type: t('common.sla.missed', 'Missed SLA'), count: missed}
               ].filter(item => item.count > 0)
           };
       }
       const met = grievancesData.stats.grievancesMetSLAMount;
       const missed = grievancesData.stats.grievancesMissedSLAMount;
       const totalWithSla = met + missed;
       return {
           metSLA: met,
           missedSLA: missed,
           totalResolvedWithSLA: totalWithSla,
           metRate: totalWithSla > 0 ? parseFloat(((met / totalWithSla) * 100).toFixed(1)) : 0,
           dataForChart: [
               {type: t('common.sla.met', 'Met SLA'), count: met},
               {type: t('common.sla.missed', 'Missed SLA'), count: missed}
           ].filter(item => item.count > 0)
       };
   }, [grievancesData?.stats, grievancesData?.grievances, t]);

  const grievancesByDepartmentChartData = React.useMemo(() => {
    if (!grievancesData?.grievances) return [];
    const deptCounts = grievancesData.grievances.reduce((acc, g) => {
      const dept = g.departmentName || t('common.unknownDepartment', 'Unknown Dept.');
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(deptCounts).map(([departmentName, count]) => ({ departmentName, count })).sort((a,b) => b.count - a.count);
  }, [grievancesData?.grievances, t]);

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
          <Descriptions.Item label={t('filters.academicYear', "Academic Year")}>
            <Text>{filters.academicYear || t('common.notSet', "Not Set")}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('filters.campus', "Campus")}>
            <Text>{filters.campus || t('common.notSet', "Not Set")}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('filters.degreeType', "Degree Type")}>
            <Text>{filters.degreeType || t('common.notSet', "Not Set")}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('filters.department', "Department")}>
            <Text>{filters.department || t('common.notSet', "Not Set")}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('filters.dateRange', "Date Range")}>
            <Text>{filters.dateRange ? `${filters.dateRange[0]} - ${filters.dateRange[1]}` : t('common.notSet', "Not Set")}</Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <div style={{ marginTop: '20px' }}>
        {loading && <Spin tip={t('common.loadingData', "Loading data...")} />}
        {error && <Paragraph type="danger">{t('common.errorLoadingData', "Error loading data:")} {error}</Paragraph>}

        {grievancesData?.message && (
          <Paragraph style={{ marginTop: '10px', fontStyle: 'italic' }}>{grievancesData.message}</Paragraph>
        )}

        {!loading && !error && grievancesData && (
          <>
            {grievancesData.stats && (
              <Card title={t(`module.${MODULE_KEY}.statsTitle`, "Summary Statistics")} style={{ marginBottom: 20 }}>
                <Row gutter={[16, 8]}> {/* Adjusted gutter for potentially more items */}
                  <Col xs={12} sm={12} md={8} lg={6} xl={4}><Statistic title={t(`module.${MODULE_KEY}.totalOpenGrievances`, "Open Grievances")} value={grievancesData.stats.totalOpenGrievances ?? 'N/A'} /></Col>
                  <Col xs={12} sm={12} md={8} lg={6} xl={4}><Statistic title={t(`module.${MODULE_KEY}.avgResolutionTime`, "Avg. Resolution Time (Days)")} value={grievancesData.stats.avgResolutionTimeDays ?? 'N/A'} precision={1} /></Col>
                  <Col xs={12} sm={12} md={8} lg={6} xl={4}><Statistic title={t(`module.${MODULE_KEY}.totalFeedbackReceived`, "Feedback Received")} value={grievancesData.stats.totalFeedbackReceived ?? 'N/A'} /></Col>
                  <Col xs={12} sm={12} md={8} lg={6} xl={4}><Statistic title={t(`module.${MODULE_KEY}.avgFeedbackRating`, "Avg. Feedback Rating")} value={grievancesData.stats.avgFeedbackRating?.toFixed(1) ?? 'N/A'} suffix="/ 5" /></Col>
                  <Col xs={12} sm={12} md={8} lg={6} xl={4}><Statistic title={t(`module.${MODULE_KEY}.totalReopened`, "Total Re-opened")} value={grievancesData.stats.totalReopenedGrievances ?? 0} /></Col>
                  <Col xs={12} sm={12} md={8} lg={6} xl={4}><Statistic title={t(`module.${MODULE_KEY}.slaMet`, "SLA Met")} value={grievancesData.stats.grievancesMetSLAMount ?? 0} /></Col>
                   {/* Consider adding SLA Missed if space allows or if it's a key KPI */}
                </Row>
              </Card>
            )}

            {/* Existing Charts Section - Grievances by Status & Feedback Rating Dist. */}
            {/* This section can be kept or removed if new charts below are preferred */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20, marginTop: 20 }}>
              {grievancesData.grievances && grievancesData.grievances.length > 0 && (
                <Col xs={24} md={12}>
                  <Card title={<><PieChartOutlined /> {t(`module.${MODULE_KEY}.grievancesByStatusChartTitle`, "Grievances by Status")}</>}>
                    <Pie
                      data={grievancesData.grievances.reduce((acc, grievance) => {
                        const status = grievance.status || t('common.unknown', 'Unknown');
                        const existing = acc.find(i => i.type === status);
                        if (existing) {
                          existing.value += 1;
                        } else {
                          acc.push({ type: status, value: 1 });
                        }
                        return acc;
                      }, [] as Array<{type: GrievanceStatus | string, value: number}>)} // Ensure type allows for 'Unknown'
                      angleField="value"
                      colorField="type"
                      radius={0.8}
                      legend={{ position: 'bottom' }}
                      label={{
                        type: 'inner',
                        offset: '-30%',
                        content: '{value}',
                        style: { fill: '#fff', fontSize: 14 },
                      }}
                      tooltip={{
                          formatter: (datum) => ({ name: datum.type, value: datum.value + ' ' + t('common.grievances', 'grievances') }),
                      }}
                    />
                  </Card>
                </Col>
              )}

              {/* Feedback Rating Distribution Bar Chart */}
              {grievancesData.feedback && grievancesData.feedback.length > 0 && (
                <Col xs={24} md={12}>
                  <Card title={<><BarChartOutlined /> {t(`module.${MODULE_KEY}.feedbackRatingChartTitle`, "Feedback Rating Distribution")}</>}>
                    <Column
                      data={grievancesData.feedback.reduce((acc, item) => {
                        const rating = item.rating === undefined ? t('common.notRated', 'Not Rated') : item.rating.toString();
                        const existing = acc.find(r => r.rating === rating);
                        if (existing) {
                          existing.count += 1;
                        } else {
                          acc.push({ rating: rating, count: 1 });
                        }
                        return acc;
                      }, [] as Array<{rating: string, count: number}>).sort((a,b) => a.rating.localeCompare(b.rating))}
                      xField="rating"
                      yField="count"
                      // seriesField="rating" // Not needed if colors are default or handled by xField
                      legend={false}
                      label={{
                        position: 'middle',
                        style: { fill: '#FFFFFF', opacity: 0.6 },
                      }}
                      xAxis={{ title: { text: t('common.rating', "Rating") } }}
                      yAxis={{ title: { text: t('common.count', "Count") } }}
                      tooltip={{
                        formatter: (datum) => ({ name: `${t('common.rating', "Rating")} ${datum.rating}`, value: datum.count + ' ' + t('common.feedbackItems', 'feedback items') }),
                      }}
                    />
                  </Card>
                </Col>
              )}
            </Row>

            {/* New Deeper Feedback Analysis Section */}
            <Title level={4} style={{ marginTop: '30px' }}>{t('module.grievances.detailedFeedbackAnalysisTitle', "Detailed Feedback Analysis")}</Title>
            <Row gutter={[16, 16]} style={{ marginTop: '10px' }}>
              <Col xs={24} lg={12} xl={8}>
                <Card title={t('module.grievances.feedbackByCatTitle', "Feedback by Category")}>
                  {feedbackByCategoryChartData.length > 0 ? (
                    <Bar data={feedbackByCategoryChartData} xField="count" yField="category" seriesField="category" legend={false}
                         barWidthRatio={0.7} yAxis={{label:{autoEllipsis:true}}} xAxis={{title:{text:t('common.count',"Count")}}}/>
                  ) : <Empty />}
                </Card>
              </Col>
              <Col xs={24} lg={12} xl={8}>
                <Card title={t('module.grievances.feedbackSentimentTitle', "Feedback Sentiment Analysis")}>
                  {feedbackSentimentChartData.length > 0 ? (
                    <Pie data={feedbackSentimentChartData} angleField="count" colorField="sentiment" radius={0.8} legend={{position:'bottom'}}
                         label={{type:'inner', offset:'-30%', content:'{percentage}', style:{fill:'#fff'}}}
                         tooltip={{formatter:(d)=>({name:d.sentiment, value:`${d.count} (${(d.percent * 100).toFixed(1)}%)`})}} />
                  ) : <Empty />}
                </Card>
              </Col>
              <Col xs={24} lg={24} xl={8}> {/* Full width on large, third on XL */}
                <Card title={t('module.grievances.feedbackTrendTitle', "Feedback Submissions Over Time (Monthly)")}>
                  {feedbackTrendData.length > 0 ? (
                    <Line data={feedbackTrendData} xField="monthYear" yField="count"
                          yAxis={{title:{text:t('common.numberOfFeedback',"No. of Feedback")}}}
                          xAxis={{title:{text:t('common.monthYear',"Month-Year")}}} point={{size:3}} smooth/>
                  ) : <Empty />}
                </Card>
              </Col>
             </Row>
             <Row gutter={[16,16]} style={{marginTop:'20px'}}>
                 <Col xs={24} lg={12}>
                     <Card title={t('module.grievances.avgFeedbackRatingCatTitle', "Average Feedback Rating by Category")}>
                         {avgFeedbackRatingByCategoryData.length > 0 ? (
                         <Column data={avgFeedbackRatingByCategoryData} xField="category" yField="avgRating" seriesField="category" legend={false}
                                 label={{position:'top'}} yAxis={{title:{text:t('common.avgRating',"Avg. Rating (1-5)")}, min:0, max:5}}
                                 xAxis={{label:{rotate:avgFeedbackRatingByCategoryData.length > 3 ? 30:0, autoEllipsis:true}}}/>
                         ) : <Empty />}
                     </Card>
                 </Col>
                 <Col xs={24} lg={12}>
                     <Card title={t('module.grievances.topFeedbackKeywordsTitle', "Top 10 Feedback Keywords/Themes")}>
                         {topFeedbackKeywordsData.length > 0 ? (
                         <Bar data={topFeedbackKeywordsData} xField="count" yField="keyword" seriesField="keyword" legend={false}
                                 barWidthRatio={0.7} yAxis={{label:{autoEllipsis:true}}} xAxis={{title:{text:t('common.frequency',"Frequency")}}}/>
                         ) : <Empty />}
                     </Card>
                 </Col>
             </Row>

            {/* New Status Tracking & Cross-Analysis Section */}
            <Title level={4} style={{ marginTop: '30px' }}>{t('module.grievances.statusCrossAnalysisTitle', "SLA Performance & Departmental Grievances")}</Title>
            <Row gutter={[16, 16]} style={{ marginTop: '10px' }}>
              <Col xs={24} md={12} lg={8}>
                 <Card title={t('module.grievances.slaPerformanceTitle', "Grievance SLA Performance")}>
                     <Row gutter={8} align="middle" justify="center" style={{marginBottom:10}}>
                         <Col><Statistic title={t('common.sla.metRate', "Met SLA Rate")} value={grievanceSlaPerformance.metRate} suffix="%" precision={1}/></Col>
                         <Col><Statistic title={t('common.sla.totalResolvedWithSLA', "Total Resolved (with SLA)")} value={grievanceSlaPerformance.totalResolvedWithSLA} /></Col>
                     </Row>
                     {grievanceSlaPerformance.dataForChart.reduce((sum,item)=>sum+item.count,0) > 0 ? (
                         <Donut data={grievanceSlaPerformance.dataForChart} angleField="count" colorField="type"
                             innerRadius={0.6} legend={{position:'bottom'}}
                             tooltip={{formatter:(d)=>({name:d.type, value:d.count})}}
                             label={{type:'inner', offset:'-50%', content:'{value}', style:{fill:'#fff'}}} />
                     ) : <Empty description={t('common.noSlaData', 'No SLA data for resolved grievances.')} />}
                 </Card>
              </Col>
              <Col xs={24} md={12} lg={16}>
                <Card title={t('module.grievances.byDepartmentTitle', "Grievances by Department")}>
                  {grievancesByDepartmentChartData.length > 0 ? (
                    <Column data={grievancesByDepartmentChartData} xField="departmentName" yField="count" seriesField="departmentName" legend={false}
                            label={{position:'top'}} yAxis={{title:{text:t('common.numberOfGrievances',"No. of Grievances")}}}
                            xAxis={{label:{rotate:grievancesByDepartmentChartData.length > 4 ? 30:0, autoEllipsis:true}}}/>
                  ) : <Empty />}
                </Card>
              </Col>
            </Row>


            {/* Existing Tables and Lists */}
            {grievancesData.grievances && grievancesData.grievances.length > 0 && (
              <Card title={t(`module.${MODULE_KEY}.grievancesListTitle`, "Recent Grievances")} style={{ marginBottom: 20, marginTop: 20 }}>
                <Table
                  dataSource={grievancesData.grievances}
                  columns={[
                    { title: t('common.id', 'ID'), dataIndex: 'id', key: 'id', width: 80 },
                    { title: t('common.dateSubmitted', 'Date Submitted'), dataIndex: 'dateSubmitted', key: 'dateSubmitted', render: (date: string) => dayjs(date).format('YYYY-MM-DD') },
                    { title: t('common.category', 'Category'), dataIndex: 'category', key: 'category' },
                    { title: t('common.description', 'Description'), dataIndex: 'description', key: 'description' },
                    { title: t('common.status', 'Status'), dataIndex: 'status', key: 'status', render: (status: GrievanceStatus) => <Tag color={status === 'Open' ? 'red' : status === 'In Progress' ? 'orange' : 'green'}>{status}</Tag> },
                  ]}
                  rowKey="id"
                  pagination={{ pageSize: 3 }}
                />
              </Card>
            )}

            {grievancesData.feedback && grievancesData.feedback.length > 0 && (
              <Card title={t(`module.${MODULE_KEY}.feedbackListTitle`, "Recent Feedback")} style={{marginTop: 20}}>
                <List
                  itemLayout="horizontal"
                  dataSource={grievancesData.feedback}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        title={`${t('common.category', 'Category')}: ${item.category} (${t('common.rating', 'Rating')}: ${item.rating ?? 'N/A'}/5)`}
                        description={`${t('common.submittedOn', 'Submitted on')} ${dayjs(item.dateSubmitted).format('YYYY-MM-DD')}: "${item.comments}"`}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}
          </>
        )}
        {!loading && !error && !grievancesData?.grievances && !grievancesData?.feedback && !grievancesData?.stats && !grievancesData?.message && (
          <Paragraph>{t('common.noDataAvailable', "No grievances or feedback data available.")}</Paragraph>
        )}
      </div>
    </div>
  );
};

export default GrievancesFeedbackModule;
