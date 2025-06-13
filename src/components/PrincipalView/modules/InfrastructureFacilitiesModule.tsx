import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Breadcrumb, Card, Descriptions, Spin, List, Table, Tag, Statistic, Row, Col, Progress, Empty } from 'antd';
import { Link } from 'react-router-dom';
import { useGlobalFilters } from '../../../contexts/GlobalFilterContext';
import { useTranslation } from 'react-i18next';
import { HomeOutlined, PieChartOutlined, BarChartOutlined } from '@ant-design/icons';
import { fetchData } from '../../../utils/apiUtils';
import dayjs from 'dayjs';
import { Pie, Column, Bar, Line } from '@ant-design/plots'; // Added Line
import { faker } from '@faker-js/faker';

const { Title, Paragraph, Text } = Typography;

const MODULE_KEY = 'infrastructure';

// Interfaces (already confirmed to be up-to-date in previous steps)
type AssetStatus = 'Operational' | 'Under Maintenance' | 'Needs Repair' | 'Decommissioned';
type ResourceType = 'Classroom' | 'Lab' | 'Auditorium' | 'Meeting Room' | 'Equipment' | 'IT Server' | 'Network Gear';
type MaintenanceStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'On Hold';
type MaintenancePriority = 'High' | 'Medium' | 'Low';
type BuildingCondition = 'Good' | 'Fair' | 'Poor' | 'Under Renovation';

interface Building {
  id: string;
  name: string;
  totalRooms: number;
  capacity: number;
  condition: BuildingCondition;
  currentOccupancy?: number;
  capacityUtilization?: number;
  roomTypes?: Record<string, number>;
  spaceAllocations?: Array<{ departmentId: string; departmentName?: string; areaSqFt?: number; roomCount?: number }>;
  lastInspectionDate?: string;
}

interface Asset {
  id: string;
  name: string;
  type: string;
  location: string;
  purchaseDate: string;
  status: AssetStatus;
  lastMaintenanceDate?: string;
  warrantyExpiryDate?: string;
  initialCost?: number;
  departmentId?: string;
  departmentName?: string;
  expectedLifespanYears?: number;
  ageYears?: number;
}

interface MaintenanceRequest {
  id: string;
  assetId?: string;
  resourceName: string;
  reportedDate: string;
  issueDescription: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  assignedTo?: string;
  resolutionDate?: string;
  resolutionTimeDays?: number;
  cost?: number;
  notes?: string;
}

interface ResourceUtilization {
  resourceId: string;
  resourceName: string;
  resourceType: ResourceType;
  bookingsToday?: number;
  avgUtilizationRate?: number;
  totalBookedHoursLastWeek?: number;
  totalAvailableHoursLastWeek?: number;
  hourlyBookingCountsLast24h?: number[];
  peakBookingTime?: string;
  bookingConflictCountLastWeek?: number;
}

interface ITInfrastructureStatusItem {
    itemId: string;
    itemName: string;
    itemType: 'Server' | 'NetworkSwitch' | 'Router' | 'Firewall' | 'AccessPoint';
    status: 'Online' | 'Offline' | 'Degraded' | 'HighLoad';
    uptimePercentage?: number;
    lastIncidentDate?: string;
    avgResponseTimeMs?: number;
    activeConnections?: number;
}

interface InfrastructureStats {
  totalBuildings?: number;
  totalAssets?: number;
  activeMaintenanceRequests?: number;
  overallAssetCondition?: { good: number; fair: number; poor: number };
  buildingConditions?: Record<BuildingCondition, number>;
  avgAssetAgeYears?: number;
  assetsUnderWarrantyPercent?: number;
  totalMaintenanceCostLastMonth?: number;
  avgMaintenanceResolutionTimeDays?: number;
  itSystemAvailabilityPercent?: number;
}

interface InfrastructureData {
  buildings?: Building[];
  assets?: Asset[];
  maintenanceRequests?: MaintenanceRequest[];
  resourceUtilization?: ResourceUtilization[];
  itInfrastructureStatus?: ITInfrastructureStatusItem[];
  stats?: InfrastructureStats;
  message?: string;
}


const InfrastructureFacilitiesModule: React.FC = () => {
  const { t } = useTranslation();
  const filters = useGlobalFilters();

  const [infraData, setInfraData] = useState<InfrastructureData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInfraData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchData<InfrastructureData>('/principal-view/infrastructure');
        setInfraData(result);
      } catch (err: any) {
        console.error("Failed to fetch infrastructure data:", err);
        setError(err.message || 'Failed to fetch infrastructure data');

        // Fallback to comprehensive mock data (content from previous step, confirmed to be correct)
        const departmentNamesList = ['Computer Science', 'Physics', 'Library Services', 'Administration', 'Student Hostels'];
        const mockBuildings: Building[] = Array.from({length: faker.number.int({min:3, max:6})}, (_, i) => {
            const capacity = faker.number.int({min:200, max:1200});
            const currentOccupancy = faker.number.int({min: Math.floor(capacity*0.5), max: Math.floor(capacity*0.95) });
            return {
              id: `B00${i+1}`, name: `${faker.company.buzzNoun()} Block ${faker.string.alpha(1).toUpperCase()}`,
              totalRooms: faker.number.int({min:20, max:100}),
              capacity,
              condition: faker.helpers.arrayElement<BuildingCondition>(['Good', 'Fair', 'Poor', 'Under Renovation']),
              currentOccupancy,
              capacityUtilization: parseFloat(((currentOccupancy / capacity) * 100).toFixed(1)),
              roomTypes: { "Classroom": faker.number.int({min:10, max:30}), "Lab": faker.number.int({min:5, max:15}), "Office": faker.number.int({min:10, max:20})},
              spaceAllocations: Array.from({length:faker.number.int({min:1,max:3})}, () => ({ departmentId: `DEPT_${faker.string.alphanumeric(3)}`, departmentName: faker.helpers.arrayElement(departmentNamesList), areaSqFt: faker.number.int({min:2000, max:15000}), roomCount: faker.number.int({min:5,max:25})})),
              lastInspectionDate: dayjs(faker.date.past({years:1, refDate: dayjs().subtract(1,'month').toDate()})).format('YYYY-MM-DD'),
            };
        });

        const mockAssets: Asset[] = Array.from({length: faker.number.int({min:150, max:400})}, (_,i) => {
            const purchaseDate = dayjs(faker.date.past({years: faker.number.int({min:1, max:7})}));
            const expectedLifespanYears = faker.number.int({min:3, max:10});
            return {
                id: `A${String(i).padStart(4,'0')}`, name: `${faker.commerce.productAdjective()} ${faker.commerce.productMaterial()} ${faker.commerce.product()}`,
                type: faker.helpers.arrayElement<ResourceType>(['Equipment', 'Furniture', 'IT Server', 'Network Gear', 'Classroom AV', 'Lab Equipment']), // Corrected ResourceType usage
                location: `Building ${faker.helpers.arrayElement(mockBuildings).id} - Room ${faker.number.int({min:101,max:505})}`,
                purchaseDate: purchaseDate.format('YYYY-MM-DD'),
                status: faker.helpers.arrayElement<AssetStatus>(['Operational', 'Operational', 'Operational', 'Under Maintenance', 'Needs Repair', 'Decommissioned']),
                lastMaintenanceDate: dayjs(faker.date.recent({days:200, refDate: dayjs().subtract(10,'days').toDate()})).format('YYYY-MM-DD'),
                warrantyExpiryDate: purchaseDate.add(faker.number.int({min:1,max:3}), 'year').format('YYYY-MM-DD'),
                initialCost: parseFloat(faker.finance.amount({min:50, max:30000, dec:2})),
                departmentId: faker.helpers.arrayElement(['DEPT_IT', 'DEPT_ADMIN', 'DEPT_CS', 'DEPT_PHY', 'DEPT_LIB', 'DEPT_GEN_MAINT']),
                departmentName: faker.helpers.arrayElement(departmentNamesList),
                expectedLifespanYears,
                ageYears: dayjs().diff(purchaseDate, 'year'),
            };
        });

        const mockMaintenanceRequests: MaintenanceRequest[] = Array.from({length:faker.number.int({min:5, max:25})}, (_,i) => {
            const asset = faker.helpers.arrayElement(mockAssets.filter(a => a.status !== 'Decommissioned' && a.status !== 'Operational'));
            const reportedDate = dayjs(faker.date.recent({days: 60}));
            const status = faker.helpers.arrayElement<MaintenanceStatus>(['Open', 'In Progress', 'On Hold', 'Resolved', 'Closed']);
            const resolutionDate = (status === 'Resolved' || status === 'Closed') ? reportedDate.add(faker.number.int({min:1, max:20}), 'day') : undefined;
            return {
                id: `M${String(i).padStart(4,'0')}`, assetId: asset?.id, resourceName: asset?.name || faker.lorem.words(3),
                reportedDate: reportedDate.format('YYYY-MM-DD'),
                issueDescription: faker.lorem.sentence(faker.number.int({min:5, max:15})), status,
                priority: faker.helpers.arrayElement<MaintenancePriority>(['High', 'Medium', 'Low']),
                assignedTo: `Team ${faker.helpers.arrayElement(['Alpha', 'Bravo', 'Charlie'])} / ${faker.person.fullName()}`,
                resolutionDate: resolutionDate?.format('YYYY-MM-DD'),
                resolutionTimeDays: resolutionDate ? resolutionDate.diff(reportedDate, 'day') : undefined,
                cost: (status === 'Resolved' || status === 'Closed') ? parseFloat(faker.finance.amount({min:20, max:1200, dec:2})) : undefined,
                notes: Math.random() < 0.3 ? faker.lorem.paragraph(faker.number.int({min:1,max:2})) : undefined,
            };
        });

        const mockResourceUtilizations: ResourceUtilization[] = Array.from({length:faker.number.int({min:5, max:15})}, (_,i) => {
            const resourceType = faker.helpers.arrayElement<ResourceType>(['Classroom', 'Lab', 'Auditorium', 'Meeting Room']);
            return {
                resourceId: `RES-${String(i).padStart(3,'0')}`, resourceName: `${resourceType} ${faker.string.alphanumeric(3).toUpperCase()}`, resourceType,
                bookingsToday: faker.number.int({min:0, max:8}),
                avgUtilizationRate: faker.number.int({min:20,max:95}),
                totalBookedHoursLastWeek: faker.number.int({min:5, max:40}),
                totalAvailableHoursLastWeek: faker.helpers.arrayElement([20, 30, 40, 50]),
                hourlyBookingCountsLast24h: Array.from({length:24},()=>faker.number.int({min:0, max: (resourceType === 'Classroom' || resourceType === 'Lab' ? 1:0)})),
                peakBookingTime: `${faker.number.int({min:9,max:16})}:00-${faker.number.int({min:10,max:17})}:00`,
                bookingConflictCountLastWeek: faker.number.int({min:0, max:3}),
            };
        });

        const mockItInfraStatus: ITInfrastructureStatusItem[] = Array.from({length:faker.number.int({min:3,max:8})}, (_,i) => ({
            itemId:`ITM-${String(i).padStart(3,'0')}`,
            itemName: `${faker.helpers.arrayElement(['Primary','Backup','Departmental'])} ${faker.helpers.arrayElement(['Web Server', 'Database Server', 'Auth Server', 'Core Switch', 'Firewall Appliance', 'Wi-Fi Controller'])} ${faker.string.alpha(1).toUpperCase()}`,
            itemType: faker.helpers.arrayElement<'Server' | 'NetworkSwitch' | 'Router' | 'Firewall' | 'AccessPoint'>(['Server','NetworkSwitch','Router','Firewall','AccessPoint']),
            status: faker.helpers.arrayElement<'Online' | 'Offline' | 'Degraded' | 'HighLoad'>(['Online','Online','Online','Degraded','HighLoad', 'Offline']),
            uptimePercentage: faker.number.float({min:98.0, max:99.999, precision:3}),
            lastIncidentDate: dayjs(faker.date.recent(90)).format('YYYY-MM-DD'),
            avgResponseTimeMs:faker.number.int({min:5,max:500}),
            activeConnections:faker.number.int({min:10,max:2000})
        }));

        const buildingConditionsCalc = mockBuildings.reduce((acc, b) => { acc[b.condition] = (acc[b.condition] || 0) + 1; return acc; }, {} as Record<BuildingCondition, number>);
        const totalAssetAgeCalc = mockAssets.reduce((sum, asset) => sum + (asset.ageYears || 0), 0);
        const assetsUnderWarrantyCalc = mockAssets.filter(a => a.warrantyExpiryDate && dayjs().isBefore(dayjs(a.warrantyExpiryDate))).length;
        const maintenanceLastMonthList = mockMaintenanceRequests.filter(m => m.resolutionDate && dayjs(m.resolutionDate).isAfter(dayjs().subtract(30,'day')));
        const totalMaintenanceCostLastMonthCalc = maintenanceLastMonthList.reduce((sum,m)=> sum + (m.cost||0),0);
        const resolvedRequestsWithTimeList = mockMaintenanceRequests.filter(m => m.resolutionTimeDays !== undefined && m.resolutionTimeDays >=0);
        const avgMaintenanceResolutionTimeDaysCalc = resolvedRequestsWithTimeList.length > 0 ? parseFloat((resolvedRequestsWithTimeList.reduce((sum,m)=> sum + m.resolutionTimeDays!,0) / resolvedRequestsWithTimeList.length).toFixed(1)) : 0;
        const itAvailabilitySum = mockItInfraStatus.reduce((sum, itm) => sum + (itm.uptimePercentage || (itm.status === 'Online' ? 100: (itm.status === 'Offline' ? 0 : 80))),0);
        const itSystemAvailabilityPercentCalc = mockItInfraStatus.length > 0 ? parseFloat((itAvailabilitySum / mockItInfraStatus.length).toFixed(1)) : 100;

        setInfraData({
          message: "Mock data active for Infrastructure & Facilities due to API failure.",
          stats: {
            totalBuildings: mockBuildings.length,
            totalAssets: mockAssets.length,
            activeMaintenanceRequests: mockMaintenanceRequests.filter(m => m.status === 'Open' || m.status === 'In Progress' || m.status === 'On Hold').length,
            overallAssetCondition: mockAssets.reduce((acc, asset) => {
                if(asset.status === 'Operational') acc.good++;
                else if (asset.status === 'Under Maintenance' || asset.status === 'Needs Repair') acc.fair++;
                else if (asset.status === 'Decommissioned') {}
                else acc.poor++;
                return acc;
            }, {good:0, fair:0, poor:0}),
            buildingConditions: buildingConditionsCalc,
            avgAssetAgeYears: mockAssets.length > 0 ? parseFloat((totalAssetAgeCalc / mockAssets.length).toFixed(1)) : 0,
            assetsUnderWarrantyPercent: mockAssets.length > 0 ? parseFloat(((assetsUnderWarrantyCalc / mockAssets.length) * 100).toFixed(1)) : 0,
            totalMaintenanceCostLastMonth: parseFloat(totalMaintenanceCostLastMonthCalc.toFixed(2)),
            avgMaintenanceResolutionTimeDays: avgMaintenanceResolutionTimeDaysCalc,
            itSystemAvailabilityPercent: itSystemAvailabilityPercentCalc,
          },
          buildings: mockBuildings,
          assets: mockAssets,
          maintenanceRequests: mockMaintenanceRequests,
          resourceUtilization: mockResourceUtilizations,
          itInfrastructureStatus: mockItInfraStatus,
        });
      } finally {
        setLoading(false);
      }
    };
    loadInfraData();
  }, [t, filters.academicYear, filters.institutionId]); // Added filters dependency

  // New useMemo hooks for charts
  const buildingCapacityUtilizationData = useMemo(() => {
    if (!infraData?.buildings) return [];
    return infraData.buildings.flatMap(b => [
      { buildingName: b.name, type: t('common.capacity', 'Capacity'), value: b.capacity || 0 },
      { buildingName: b.name, type: t('common.occupancy', 'Current Occupancy'), value: b.currentOccupancy || 0 }
    ]);
  }, [infraData?.buildings, t]);

  const overallRoomTypesData = useMemo(() => {
    if (!infraData?.buildings) return [];
    const roomTypeCounts: Record<string, number> = {};
    infraData.buildings.forEach(b => {
      if (b.roomTypes) {
        Object.entries(b.roomTypes).forEach(([type, count]) => {
          roomTypeCounts[type] = (roomTypeCounts[type] || 0) + count;
        });
      }
    });
    return Object.entries(roomTypeCounts).map(([type, count]) => ({ type, count })).filter(item => item.count > 0).sort((a,b)=>b.count-a.count);
  }, [infraData?.buildings]);

  const buildingConditionChartData = useMemo(() => {
       if (infraData?.stats?.buildingConditions) {
           return Object.entries(infraData.stats.buildingConditions)
               .map(([condition, count]) => ({ condition, count: count as number }))
               .filter(item => item.count > 0);
       }
       if (!infraData?.buildings) return [];
       const counts = infraData.buildings.reduce((acc, b) => {
           acc[b.condition] = (acc[b.condition] || 0) + 1;
           return acc;
       }, {} as Record<BuildingCondition, number>);
       return Object.entries(counts).map(([condition, count]) => ({ condition, count })).filter(item => item.count > 0);
   }, [infraData?.stats?.buildingConditions, infraData?.buildings]);

  const spaceAllocationByDeptData = useMemo(() => {
       if (!infraData?.buildings) return [];
       const deptSpace: Record<string, { deptName: string, roomCount: number, areaSqFt: number }> = {};
       infraData.buildings.forEach(b => {
           b.spaceAllocations?.forEach(alloc => {
               const deptName = alloc.departmentName || alloc.departmentId || t('common.unknownDepartment', 'Unknown Dept.');
               if(!deptSpace[deptName]) deptSpace[deptName] = {deptName, roomCount:0, areaSqFt:0};
               deptSpace[deptName].roomCount += (alloc.roomCount || 0);
               deptSpace[deptName].areaSqFt += (alloc.areaSqFt || 0);
           });
       });
       return Object.values(deptSpace).map(data => ({
           departmentName: data.deptName,
           roomCount: data.roomCount,
       })).filter(item => item.roomCount > 0).sort((a,b)=>b.roomCount-a.roomCount);
   }, [infraData?.buildings, t]);

  const assetCountByTypeData = useMemo(() => {
    if (!infraData?.assets) return [];
    const typeCounts = infraData.assets.reduce((acc, asset) => {
      const type = asset.type || t('common.unknown', 'Unknown'); // Ensure 'common.unknown' is a valid t() key
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(typeCounts).map(([type, count]) => ({ type, count })).sort((a,b) => b.count - a.count);
  }, [infraData?.assets, t]);

  // Data for Asset Age Distribution (e.g., for 'Computer' and 'IT Server' types)
   const assetAgeDistributionData = useMemo(() => {
    if (!infraData?.assets) return [];
    const keyAssetTypes = ['Equipment', 'IT Server', 'Network Gear']; // Using types from mock data for better chance of match

    const distribution: Array<{ageBucket: string, count: number, type: string}> = [];
    keyAssetTypes.forEach(type => {
       const typeAssets = infraData.assets!.filter(a => a.type === type && a.ageYears !== undefined);
       const buckets: Record<string, number> = {'0-1yr':0, '1-2yr':0, '2-3yr':0, '3-5yr':0, '5+yr':0};
       typeAssets.forEach(a => {
           if(a.ageYears! <=1) buckets['0-1yr']++;
           else if (a.ageYears! <=2) buckets['1-2yr']++;
           else if (a.ageYears! <=3) buckets['2-3yr']++;
           else if (a.ageYears! <=5) buckets['3-5yr']++;
           else buckets['5+yr']++;
       });
       Object.entries(buckets).forEach(([ageBucket, count]) => {
           if(count > 0) distribution.push({ageBucket, count, type});
       });
    });
    return distribution;
  }, [infraData?.assets]);

  // Data for Assets Nearing Warranty Expiry (e.g., next 6 months)
  const assetsNearingWarrantyExpiryData = useMemo(() => {
    if (!infraData?.assets) return [];
    const today = dayjs();
    const next6Months = dayjs().add(6, 'month');
    return infraData.assets.filter(asset =>
      asset.warrantyExpiryDate &&
      dayjs(asset.warrantyExpiryDate).isAfter(today) &&
      dayjs(asset.warrantyExpiryDate).isBefore(next6Months)
    ).sort((a,b) => dayjs(a.warrantyExpiryDate).diff(dayjs(b.warrantyExpiryDate)));
  }, [infraData?.assets]);

  // Data for Total Asset Value by Department
  const assetValueByDeptData = useMemo(() => {
    if (!infraData?.assets) return [];
    const deptValues: Record<string, { departmentName: string, totalValue: number }> = {};
    infraData.assets.forEach(asset => {
      if (asset.initialCost && asset.departmentName) {
        if (!deptValues[asset.departmentName]) deptValues[asset.departmentName] = { departmentName: asset.departmentName, totalValue: 0 };
        deptValues[asset.departmentName].totalValue += asset.initialCost;
      }
    });
    return Object.values(deptValues).sort((a,b) => b.totalValue - a.totalValue);
  }, [infraData?.assets]);

  // Data for Maintenance Requests by Priority
  const maintenanceByPriorityData = useMemo(() => {
    if (!infraData?.maintenanceRequests) return [];
    const priorityCounts = infraData.maintenanceRequests.reduce((acc, req) => {
      acc[req.priority] = (acc[req.priority] || 0) + 1;
      return acc;
    }, {} as Record<MaintenancePriority, number>);
    return Object.entries(priorityCounts).map(([priority, count]) => ({ priority, count }));
  }, [infraData?.maintenanceRequests]);

  // Data for Average Resolution Time for Maintenance Requests (by Priority)
  const avgResolutionTimeByPriorityData = useMemo(() => {
    if (!infraData?.maintenanceRequests) return [];
    const priorityTimes: Record<string, { totalDays: number; count: number }> = {};
    infraData.maintenanceRequests.forEach(req => {
      if (req.status === 'Resolved' || req.status === 'Closed') {
        const days = req.resolutionTimeDays;
        if (typeof days === 'number' && days >=0) {
          if (!priorityTimes[req.priority]) priorityTimes[req.priority] = { totalDays: 0, count: 0 };
          priorityTimes[req.priority].totalDays += days;
          priorityTimes[req.priority].count++;
        }
      }
    });
    return Object.entries(priorityTimes).map(([priority, data]) => ({
      priority,
      avgDays: data.count > 0 ? parseFloat((data.totalDays / data.count).toFixed(1)) : 0,
    }));
  }, [infraData?.maintenanceRequests]);

  // Data for Trend of Maintenance Requests Created vs. Resolved (Monthly)
  const maintenanceTrendData = useMemo(() => {
    if (!infraData?.maintenanceRequests) return [];
    const monthlyTrends: Record<string, { created: number; resolved: number }> = {};
    // Get a range of months to ensure all months are represented, e.g., last 12 months
    const last12Months: string[] = [];
    for (let i = 11; i >= 0; i--) {
        last12Months.push(dayjs().subtract(i, 'month').format('YYYY-MM'));
    }

    last12Months.forEach(month => {
        monthlyTrends[month] = { created: 0, resolved: 0 };
    });

    infraData.maintenanceRequests.forEach(req => {
      const createdMonthYear = dayjs(req.reportedDate).format('YYYY-MM');
      if (monthlyTrends[createdMonthYear]) { // Only count if within our range
        monthlyTrends[createdMonthYear].created++;
      }

      if ((req.status === 'Resolved' || req.status === 'Closed') && req.resolutionDate) {
        const resolvedMonthYear = dayjs(req.resolutionDate).format('YYYY-MM');
        if (monthlyTrends[resolvedMonthYear]) { // Only count if within our range
          monthlyTrends[resolvedMonthYear].resolved++;
        }
      }
    });
    return Object.entries(monthlyTrends).flatMap(([monthYear, counts]) => [
      { monthYear, type: t('common.status.created', 'Created'), count: counts.created },
      { monthYear, type: t('common.status.resolved', 'Resolved'), count: counts.resolved },
    ]).sort((a,b) => a.monthYear.localeCompare(b.monthYear));
  }, [infraData?.maintenanceRequests, t]);

  // Data for Top 5 Asset Types with Most Maintenance Requests
  const topAssetTypesMaintenanceData = useMemo(() => {
    if (!infraData?.maintenanceRequests || !infraData.assets) return [];
    const typeCounts: Record<string, number> = {};
    infraData.maintenanceRequests.forEach(req => {
      const asset = infraData.assets!.find(a => a.id === req.assetId);
      if (asset && asset.type) { // Ensure asset.type is defined
        typeCounts[asset.type] = (typeCounts[asset.type] || 0) + 1;
      }
    });
    return Object.entries(typeCounts).map(([type, count]) => ({ type, count })).sort((a,b) => b.count - a.count).slice(0,5);
  }, [infraData?.maintenanceRequests, infraData?.assets]);

  // Render logic
  return (
    <div style={{ padding: '20px' }}>
      <Breadcrumb style={{ marginBottom: '20px' }}>
        <Breadcrumb.Item><Link to="/principal-view"><HomeOutlined /></Link></Breadcrumb.Item>
        <Breadcrumb.Item><Link to="/principal-view">{t('principalView.dashboardTitle', "Principal's Dashboard")}</Link></Breadcrumb.Item>
        <Breadcrumb.Item>{t(`module.${MODULE_KEY}.title`)}</Breadcrumb.Item>
      </Breadcrumb>
      <Title level={2}>{t(`module.${MODULE_KEY}.title`)}</Title>
      <Paragraph>{t(`module.${MODULE_KEY}.descriptionPlaceholder`)}</Paragraph>

      {/* Global Filters Card (can be un-commented if needed)
      <Card title={t('common.currentGlobalFilters', "Current Global Filters")} style={{ marginTop: 20, marginBottom: 20 }}>
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label={t('filters.academicYear', "Academic Year")}>{filters.academicYear || t('common.all', "All")}</Descriptions.Item>
          <Descriptions.Item label={t('filters.institution', "Institution")}>{filters.institutionId || t('common.all', "All")}</Descriptions.Item>
        </Descriptions>
      </Card>
      */}

      <div style={{ marginTop: '20px' }}>
        {loading && <Spin tip={t('common.loadingData', "Loading data...")} />}
        {error && <Paragraph type="danger">{t('common.errorLoadingData', "Error loading data:")} {error}</Paragraph>}
        {infraData?.message && (<Paragraph style={{ marginTop: '10px', fontStyle: 'italic' }}>{infraData.message}</Paragraph>)}

        {!loading && !error && infraData && (
          <>
            {infraData.stats && (
              <Card title={t(`module.${MODULE_KEY}.statsTitle`, "Overall Statistics")} style={{ marginBottom: 20 }}>
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={8} lg={6}><Statistic title={t(`module.${MODULE_KEY}.totalBuildings`, "Total Buildings")} value={infraData.stats.totalBuildings ?? 'N/A'} /></Col>
                  <Col xs={24} sm={12} md={8} lg={6}><Statistic title={t(`module.${MODULE_KEY}.totalAssets`, "Total Assets")} value={infraData.stats.totalAssets ?? 'N/A'} /></Col>
                  <Col xs={24} sm={12} md={8} lg={6}><Statistic title={t(`module.${MODULE_KEY}.activeMaintenance`, "Active Maintenance Req.")} value={infraData.stats.activeMaintenanceRequests ?? 'N/A'} /></Col>
                  <Col xs={24} sm={12} md={8} lg={6}><Statistic title={t('module.infrastructure.avgAssetAge', "Avg. Asset Age (Yrs)")} value={infraData.stats.avgAssetAgeYears ?? 'N/A'} /></Col>
                  <Col xs={24} sm={12} md={8} lg={6}><Statistic title={t('module.infrastructure.assetsWarranty', "Assets Under Warranty (%)")} value={infraData.stats.assetsUnderWarrantyPercent ?? 'N/A'} suffix="%" /></Col>
                  <Col xs={24} sm={12} md={8} lg={6}><Statistic title={t('module.infrastructure.maintenanceCostMtd', "Maint. Cost (Last Month)")} value={infraData.stats.totalMaintenanceCostLastMonth ?? 'N/A'} prefix={t('common.currencySymbol', '$')} /></Col>
                  <Col xs={24} sm={12} md={8} lg={6}><Statistic title={t('module.infrastructure.avgMaintResTime', "Avg. Maint. Res. Time (Days)")} value={infraData.stats.avgMaintenanceResolutionTimeDays ?? 'N/A'} /></Col>
                  <Col xs={24} sm={12} md={8} lg={6}><Statistic title={t('module.infrastructure.itSystemAvail', "IT System Availability (%)")} value={infraData.stats.itSystemAvailabilityPercent ?? 'N/A'} suffix="%" /></Col>
                </Row>
              </Card>
            )}

            {/* Existing Charts Row - Updated with specific chart implementations */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
              {infraData.stats?.overallAssetCondition && (
                <Col xs={24} md={12} lg={8}>
                  <Card title={t('module.infrastructure.assetOverallConditionTitle', "Overall Asset Condition")}>
                    <Pie
                      data={Object.entries(infraData.stats.overallAssetCondition).map(([k,v])=>({type:t(`assetStatus.${k}`,k), value: v as number})).filter(d=>d.value > 0)}
                      angleField="value" colorField="type" radius={0.8} legend={{position:'top'}}
                      label={{type:'inner', offset:'-30%', content:'{percentage}', style:{fill:'#fff'}}}
                      tooltip={{formatter:(d)=>({name:d.type, value: `${d.value} ${t('common.assets', 'Assets')}`})}}
                    />
                  </Card>
                </Col>
              )}
              {infraData.maintenanceRequests && (
                <Col xs={24} md={12} lg={8}>
                  <Card title={t('module.infrastructure.maintenanceStatusDistTitle', "Maintenance Request Status")}>
                    <Column
                      data={infraData.maintenanceRequests.reduce((acc, req) => {
                          const statusKey = req.status || t('common.unknown', 'Unknown');
                          const existing = acc.find(item => item.status === statusKey);
                          if (existing) existing.count++; else acc.push({ status: statusKey, count: 1 });
                          return acc;
                      }, [] as {status: string, count: number}[])}
                      xField="status" yField="count" seriesField="status" legend={false}
                      label={{position:'top'}} yAxis={{title:{text: t('common.requestCount', "Request Count")}}}
                    />
                  </Card>
                </Col>
              )}
               {infraData.stats?.buildingConditions && (
                <Col xs={24} md={12} lg={8}>
                  <Card title={t('module.infrastructure.bldgCondBreakdownTitle', "Building Condition Breakdown")}>
                    {buildingConditionChartData.length > 0 ? (
                      <Column data={buildingConditionChartData} xField="condition" yField="count" seriesField="condition" legend={false}
                              label={{position:'top'}} yAxis={{title:{text:t('common.numberOfBuildings',"No. of Buildings")}}}/>
                    ) : <Empty />}
                  </Card>
                </Col>
              )}
            </Row>

            {/* New Charts Sections */}
            <Title level={4} style={{ marginTop: '30px' }}>{t('module.infrastructure.buildingSpaceTitle', "Building & Space Utilization")}</Title>
            <Row gutter={[16, 16]} style={{ marginTop: '10px' }}>
              <Col xs={24} lg={12}>
                <Card title={t('module.infrastructure.bldgCapUtilTitle', "Building Capacity vs. Occupancy")}>
                  {buildingCapacityUtilizationData.length > 0 ? (
                    <Column data={buildingCapacityUtilizationData} xField="buildingName" yField="value" seriesField="type" isGroup={true} legend={{position:'top'}}
                            yAxis={{title:{text:t('common.count', "Count / Capacity")}}} xAxis={{label:{rotate:buildingCapacityUtilizationData.map(d=>d.buildingName).filter((v,i,a)=>a.indexOf(v)===i).length > 3 ? 30:0, autoEllipsis:true}}}/>
                  ) : <Empty />}
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title={t('module.infrastructure.roomTypesDistTitle', "Overall Room Types Distribution")}>
                  {overallRoomTypesData.length > 0 ? (
                    <Pie data={overallRoomTypesData} angleField="count" colorField="type" radius={0.8} legend={{position:'right', offsetY:0}}
                         label={{type:'inner', offset:'-30%', content:'{percentage}', style:{fill:'#fff'}}}
                         tooltip={{formatter:(d)=>({name:d.type, value:`${d.count} ${t('common.rooms','rooms')}`})}}/>
                  ) : <Empty />}
                </Card>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
              <Col xs={24} lg={12}> {/* Was Building Condition, moved up */} </Col>
              <Col xs={24} lg={12}>
                <Card title={t('module.infrastructure.spaceAllocDeptTitle', "Space Allocation by Department (Room Count)")}>
                  {spaceAllocationByDeptData.length > 0 ? (
                    <Column data={spaceAllocationByDeptData} xField="departmentName" yField="roomCount" seriesField="departmentName" legend={false}
                            label={{position:'top'}} yAxis={{title:{text:t('common.numberOfRooms',"No. of Rooms")}}}
                            xAxis={{label:{rotate:spaceAllocationByDeptData.length > 4 ? 45:0, autoHide:false, autoEllipsis:true}}}/>
                  ) : <Empty />}
                </Card>
              </Col>
            </Row>

            <Title level={4} style={{ marginTop: '30px' }}>{t('module.infrastructure.assetMgmtSummaryTitle', "Asset Management Summary")}</Title>
            <Row gutter={[16, 16]} style={{ marginTop: '10px' }}>
              <Col xs={24} lg={12}>
                <Card title={t('module.infrastructure.assetCountByTypeTitle', "Asset Count by Type")}>
                  {assetCountByTypeData.length > 0 ? (
                    <Bar data={assetCountByTypeData.slice(0,15)} xField="count" yField="type" seriesField="type" legend={false} barWidthRatio={0.7}
                         yAxis={{label:{autoEllipsis:true}}} xAxis={{title:{text:t('common.numberOfAssets',"No. of Assets")}}}
                         tooltip={{formatter:(d)=>({name:d.type, value:d.count})}} />
                  ) : <Empty />}
                </Card>
              </Col>
              {/* Placeholder for next asset chart like Age Distribution, NOW BEING ADDED */}
              <Col xs={24} lg={12}>
                <Card title={t('module.infrastructure.assetAgeDistTitle', "Asset Age Distribution (Key Types)")}>
                  {assetAgeDistributionData.length > 0 ? (
                    <Column data={assetAgeDistributionData} xField="ageBucket" yField="count" seriesField="type" isGroup={true} legend={{position:'top'}}
                            yAxis={{title:{text:t('common.numberOfAssets',"No. of Assets")}}} xAxis={{title:{text:t('common.ageYears',"Age (Years)")}}}/>
                  ) : <Empty />}
                </Card>
              </Col>
            </Row>
            <Row gutter={[16,16]} style={{ marginTop: '20px' }}>
              <Col xs={24} lg={12}>
                <Card title={t('module.infrastructure.assetValueByDeptTitle', "Total Asset Value by Department")}>
                  {assetValueByDeptData.length > 0 ? (
                    <Bar data={assetValueByDeptData} xField="totalValue" yField="departmentName" seriesField="departmentName" legend={false}
                         xAxis={{title:{text:t('common.totalValueUSD', "Total Value ($)")}, label:{formatter:(v)=>`$${Number(v/1000).toFixed(0)}k`}}}
                         yAxis={{label:{autoEllipsis:true}}} tooltip={{formatter:(d)=>({name:d.departmentName, value:`$${Number(d.totalValue).toLocaleString()}`})}}/>
                  ) : <Empty />}
                </Card>
              </Col>
            </Row>
            <Row style={{ marginTop: '20px' }}>
              <Col span={24}>
                 <Card title={t('module.infrastructure.assetsWarrantyExpiryTitle', "Assets Nearing Warranty Expiry (Next 6 Months)")}>
                     {assetsNearingWarrantyExpiryData.length > 0 ? (
                         <Table dataSource={assetsNearingWarrantyExpiryData} scroll={{x:'max-content'}} size="small" pagination={{pageSize:5}}
                             columns={[
                                 {title: t('common.assetName','Asset Name'), dataIndex:'name', key:'name', ellipsis:true, render: (text, record) => <Text style={{maxWidth: 200}} ellipsis={{tooltip: record.name}}>{record.name}</Text>},
                                 {title: t('common.type','Type'), dataIndex:'type', key:'type'},
                                 {title: t('common.location','Location'), dataIndex:'location', key:'location', ellipsis:true},
                                 {title: t('module.infrastructure.warrantyExpiryDate','Warranty Expiry'), dataIndex:'warrantyExpiryDate', key:'expiry', render:(d)=>dayjs(d).format('YYYY-MM-DD'), sorter:(a,b)=>dayjs(a.warrantyExpiryDate).diff(dayjs(b.warrantyExpiryDate))},
                             ]} rowKey="id" />
                     ) : <Empty description={t('common.noAssetsNearExpiry', "No assets nearing warranty expiry in the next 6 months.")} />}
                 </Card>
              </Col>
            </Row>

            <Title level={4} style={{ marginTop: '30px' }}>{t('module.infrastructure.maintenanceOpsTitle', "Maintenance Operations")}</Title>
            <Row gutter={[16, 16]} style={{ marginTop: '10px' }}>
              <Col xs={24} md={12} lg={8}>
                <Card title={t('module.infrastructure.maintenanceByPrioTitle', "Maintenance Requests by Priority")}>
                  {maintenanceByPriorityData.length > 0 ? (
                    <Column data={maintenanceByPriorityData} xField="priority" yField="count" seriesField="priority" legend={false} label={{position:'top'}}
                            yAxis={{title:{text:t('common.numberOfRequests',"No. of Requests")}}}/>
                  ) : <Empty />}
                </Card>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Card title={t('module.infrastructure.avgResTimeByPrioTitle', "Avg. Resolution Time by Priority (Days)")}>
                  {avgResolutionTimeByPriorityData.length > 0 ? (
                    <Column data={avgResolutionTimeByPriorityData} xField="priority" yField="avgDays" seriesField="priority" legend={false} label={{position:'top'}}
                            yAxis={{title:{text:t('common.averageDays',"Average Days")}}}/>
                  ) : <Empty />}
                </Card>
              </Col>
              <Col xs={24} md={24} lg={8}> {/*Full width on Med screens */}
                <Card title={t('module.infrastructure.topAssetsMaintenanceTitle', "Top 5 Asset Types by Maintenance Requests")}>
                  {topAssetTypesMaintenanceData.length > 0 ? (
                    <Bar data={topAssetTypesMaintenanceData} xField="count" yField="type" seriesField="type" legend={false} barWidthRatio={0.6}
                         yAxis={{label:{autoEllipsis:true}}} xAxis={{title:{text:t('common.numberOfRequests',"No. of Requests")}}}/>
                  ) : <Empty />}
                </Card>
              </Col>
            </Row>
            <Row style={{marginTop:'20px'}}>
             <Col span={24}>
                 <Card title={t('module.infrastructure.maintenanceTrendTitle', "Maintenance Request Trends (Monthly Created vs. Resolved)")}>
                     {maintenanceTrendData.length > 0 ? (
                         <Line data={maintenanceTrendData} xField="monthYear" yField="count" seriesField="type" legend={{position:'top'}} smooth={true}
                               yAxis={{title:{text:t('common.numberOfRequests',"No. of Requests")}}} xAxis={{title:{text:t('common.monthYear',"Month-Year")}, label:{rotate: maintenanceTrendData.length > 24 ? 45:0, autoHide:true, autoEllipsis:true}}}/>
                     ) : <Empty />}
                 </Card>
             </Col>
            </Row>

            {/* Existing Lists/Tables - These would be expanded in subsequent steps */}
            {infraData.buildings && infraData.buildings.length > 0 && ( <Card title={t(`module.${MODULE_KEY}.buildingsListTitle`, "Buildings")} style={{ marginBottom: 20, marginTop: 20 }}> {/* Placeholder for Buildings List/Table */} <Text>{t('common.detailedListHere', "Detailed list/table will be rendered here.")}</Text> </Card> )}
            {infraData.assets && infraData.assets.length > 0 && ( <Card title={t(`module.${MODULE_KEY}.assetsTableTitle`, "Assets Inventory")} style={{ marginBottom: 20 }}> {/* Placeholder for Assets Table */}  <Text>{t('common.detailedListHere', "Detailed list/table will be rendered here.")}</Text> </Card> )}
            {infraData.maintenanceRequests && infraData.maintenanceRequests.length > 0 && ( <Card title={t(`module.${MODULE_KEY}.maintenanceTableTitle`, "Maintenance Requests")} style={{ marginBottom: 20 }}> {/* Placeholder for Maintenance Table */} <Text>{t('common.detailedListHere', "Detailed list/table will be rendered here.")}</Text> </Card> )}
            {infraData.resourceUtilization && infraData.resourceUtilization.length > 0 && ( <Card title={t(`module.${MODULE_KEY}.utilizationTitle`, "Resource Utilization")} style={{ marginBottom: 20 }}> {/* Placeholder for Resource Utilization List */} <Text>{t('common.detailedListHere', "Detailed list/table will be rendered here.")}</Text> </Card> )}
            {infraData.itInfrastructureStatus && infraData.itInfrastructureStatus.length > 0 && ( <Card title={t(`module.${MODULE_KEY}.itStatusTitle`, "IT Infrastructure Status")} style={{ marginBottom: 20 }}> {/* Placeholder for IT Infra List */} <Text>{t('common.detailedListHere', "Detailed list/table will be rendered here.")}</Text> </Card> )}

          </>
        )}
        {!loading && !error && !infraData?.stats && !infraData?.message && ( <Empty description={t('common.noDataAvailable', "No infrastructure or facilities data available.")} /> )}
      </div>
    </div>
  );
};

export default InfrastructureFacilitiesModule;
