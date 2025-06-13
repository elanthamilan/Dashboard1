import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Breadcrumb, Card, Descriptions, Spin, Row, Col, Table, Tag, Statistic, Empty } from 'antd';
import { Link } from 'react-router-dom';
import { useGlobalFilters } from '../../../contexts/GlobalFilterContext';
import { useTranslation } from 'react-i18next';
import {
    HomeOutlined, PieChartOutlined, CheckCircleOutlined, WarningOutlined,
    ScheduleOutlined, FieldTimeOutlined, FileProtectOutlined
} from '@ant-design/icons';
import { fetchData } from '../../../utils/apiUtils';
import dayjs from 'dayjs';
import { Pie, Column, Line, Bar, Gauge, Donut } from '@ant-design/plots'; // Added Donut

const { Title, Paragraph, Text } = Typography;

const MODULE_KEY = 'compliance';

// Updated Interfaces from prompt
// import dayjs from 'dayjs'; // Already imported at the top
// import { t } from 'i18next'; // Assuming t is available via useTranslation hook later

type ComplianceCurrentStatus = 'Compliant' | 'Non-Compliant' | 'Pending Review' | 'Action Required' | 'Under Observation';
interface ComplianceStatusItem {
  id: string;
  area: string;
  regulationStandard: string;
  status: ComplianceCurrentStatus;
  details?: string;
  lastAssessedDate: string;
  nextReviewDate?: string;
  ownerDepartmentId?: string;
  ownerDepartmentName?: string;
  evidenceLinks?: Array<{name: string, url: string}>;
  nonComplianceDetails?: {
    issueId: string;
    description: string;
    severity: 'Critical' | 'Major' | 'Minor';
    actionPlan?: string;
    actionDueDate?: string;
    responsiblePerson?: string;
  };
}

type AuditStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Pending Closure' | 'Cancelled';
type AuditFindingSeverity = 'Critical' | 'Major' | 'Minor' | 'Observation';
interface AuditFinding {
  findingId: string;
  description: string;
  clauseReference?: string;
  severity: AuditFindingSeverity;
  status: 'Open' | 'Remediating' | 'Closed' | 'Verified';
  responsibleDepartmentId?: string;
  responsibleDepartmentName?: string;
  dueDate?: string;
  resolutionDate?: string;
  resolutionTimeDays?: number;
}
interface AuditRecord {
  id: string;
  auditName: string;
  auditType: 'Internal' | 'External';
  standardAudited: string;
  startDate: string;
  endDate?: string;
  plannedEndDate?: string; // For on-time calculation
  auditorName?: string;
  status: AuditStatus;
  findings?: AuditFinding[];
  reportLink?: string;
  onTimeCompletion?: boolean;
}

type PolicyStatus = 'Draft' | 'Active' | 'Needs Review' | 'Archived' | 'Expired';
interface PolicyDocument {
  id: string;
  title: string;
  category: string;
  version: string;
  effectiveDate: string;
  lastReviewedDate: string;
  nextReviewDate: string;
  status: PolicyStatus;
  ownerDepartmentId?: string;
  ownerDepartmentName?: string;
}

interface ComplianceStats {
    overallComplianceScore?: number;
    activeNonComplianceIssues?: number;
    auditsScheduled?: number;
    auditsInProgress?: number;
    auditsCompleted?: number;
    auditsCompletedOnSchedulePercent?: number;
    avgTimeToCloseAuditFindingsDays?: number;
    totalAuditFindings?: number;
    openAuditFindings?: number;
    policiesTotal?: number;
    policiesDueForReviewCount?: number;
    nonComplianceBySeverity?: Record<AuditFindingSeverity | 'N/A', number>;
    auditFindingsByStatus?: Record<AuditFinding['status'], number>;
}
interface ComplianceData { // Main state for the module
  complianceItems?: ComplianceStatusItem[];
  allAudits?: AuditRecord[];
  policies?: PolicyDocument[];
  message?: string;
  stats?: ComplianceStats;
}

const ComplianceAccreditationModule: React.FC = () => {
  const { t } = useTranslation();
  const filters = useGlobalFilters();

  const [data, setData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComplianceData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchData<ComplianceData>('/principal-view/compliance');
        setData(result);
      } catch (err: any) {
        console.warn("Falling back to mock data for ComplianceAccreditationModule due to API error:", err);
        setError(err.message || t('errors.failedToFetchComplianceData', 'Failed to fetch compliance data'));

        const F = await import('@faker-js/faker'); // Dynamic import for faker
        const {faker} = F;
        // dayjs is already imported globally

        const mockDepartments = [
            {id: 'DEPT_ACAD', name: t('common.departments.academicAffairs', 'Academic Affairs')},
            {id: 'DEPT_ADMIN', name: t('common.departments.administration', 'Administration')},
            {id: 'DEPT_IT', name: t('common.departments.itServices', 'IT Services')},
            {id: 'DEPT_FIN', name: t('common.departments.finance', 'Finance')},
        ];

        const mockComplianceItemsList: ComplianceStatusItem[] = [];
        const complianceAreas = ["Data Privacy & Security", "Financial Reporting Accuracy", "Student Safety Protocols", "Academic Program Accreditation", "Research Ethics", "Environmental Compliance"];
        const regulationStandards = ["GDPR", "ISO 27001", "University Policy XYZ", "NAAC Criterion A", "UGC Guidelines", "Local Env. Act"];
        for (let i = 0; i < 15; i++) {
            const status = faker.helpers.arrayElement<ComplianceCurrentStatus>(['Compliant', 'Compliant', 'Compliant', 'Non-Compliant', 'Pending Review', 'Action Required', 'Under Observation']);
            const dept = faker.helpers.arrayElement(mockDepartments);
            let nonComplianceDetails: ComplianceStatusItem['nonComplianceDetails'];
            if (status === 'Non-Compliant' || status === 'Action Required') {
                nonComplianceDetails = {
                    issueId: `ISS-${faker.string.alphanumeric(5)}`,
                    description: faker.lorem.sentence(),
                    severity: faker.helpers.arrayElement(['Critical', 'Major', 'Minor']),
                    actionPlan: faker.lorem.paragraph(1),
                    actionDueDate: dayjs(faker.date.soon({days:90})).format('YYYY-MM-DD'),
                    responsiblePerson: faker.person.fullName(),
                };
            }
            mockComplianceItemsList.push({
                id: `CI-${i}`,
                area: faker.helpers.arrayElement(complianceAreas),
                regulationStandard: faker.helpers.arrayElement(regulationStandards),
                status,
                details: faker.lorem.sentence(),
                lastAssessedDate: dayjs(faker.date.past({years:1})).format('YYYY-MM-DD'),
                nextReviewDate: status !== 'Compliant' ? dayjs(faker.date.soon({days:180})).format('YYYY-MM-DD') : undefined,
                ownerDepartmentId: dept.id,
                ownerDepartmentName: dept.name,
                evidenceLinks: Math.random() < 0.5 ? [{name: 'Evidence Doc', url: faker.internet.url()}] : [],
                nonComplianceDetails
            });
        }

        const mockAuditRecords: AuditRecord[] = [];
        const auditStatuses: AuditStatus[] = ['Scheduled', 'In Progress', 'Completed', 'Pending Closure', 'Cancelled'];
        const findingSeverities: AuditFindingSeverity[] = ['Critical', 'Major', 'Minor', 'Observation'];
        const findingStatuses: AuditFinding['status'][] = ['Open', 'Remediating', 'Closed', 'Verified'];

        for (let i = 0; i < 10; i++) {
            const status = faker.helpers.arrayElement(auditStatuses);
            const startDate = dayjs(faker.date.between({from: dayjs().subtract(1, 'year').toDate(), to: dayjs().add(3,'month').toDate()}));
            const plannedEndDate = startDate.add(faker.number.int({min:5, max:15}), 'day');
            let endDate: dayjs.Dayjs | undefined;
            let onTimeCompletion: boolean | undefined;

            if (status === 'Completed' || status === 'Pending Closure') {
                endDate = startDate.add(faker.number.int({min:3, max:20}), 'day');
                onTimeCompletion = endDate.isSameOrBefore(plannedEndDate);
            }

            const auditFindings: AuditFinding[] = [];
            if (status === 'Completed' || status === 'In Progress' || status === 'Pending Closure') {
                for (let j = 0; j < faker.number.int({min:0, max:8}); j++) {
                    const findingStatus = faker.helpers.arrayElement(findingStatuses);
                    const fDept = faker.helpers.arrayElement(mockDepartments);
                    let resolutionDateAudit: dayjs.Dayjs | undefined;
                    let resolutionTimeDaysAudit: number | undefined;
                    const fDueDate = dayjs(faker.date.soon({days:60, refDate: endDate?.isValid() ? endDate.toDate() : startDate.toDate() }));

                    if(findingStatus === 'Closed' || findingStatus === 'Verified'){
                        resolutionDateAudit = dayjs(faker.date.between({from: startDate.toDate(), to: dayjs().add(10,'day').toDate()}));
                        if(resolutionDateAudit.isAfter(fDueDate)) resolutionDateAudit = fDueDate.subtract(faker.number.int({min:1,max:5}), 'day');
                        resolutionTimeDaysAudit = resolutionDateAudit.diff(startDate.add(j*2,'day'), 'day');
                    }
                    auditFindings.push({
                        findingId: `AF-${i}-${j}`,
                        description: faker.lorem.sentence(8),
                        clauseReference: `${faker.helpers.arrayElement(regulationStandards)}:${faker.number.int({min:1,max:10})}.${faker.number.int({min:1,max:5})}`,
                        severity: faker.helpers.arrayElement(findingSeverities),
                        status: findingStatus,
                        responsibleDepartmentId: fDept.id,
                        responsibleDepartmentName: fDept.name,
                        dueDate: fDueDate.format('YYYY-MM-DD'),
                        resolutionDate: resolutionDateAudit?.format('YYYY-MM-DD'),
                        resolutionTimeDays: resolutionTimeDaysAudit
                    });
                }
            }
            mockAuditRecords.push({
                id: `AU-${i}`,
                auditName: `${faker.helpers.arrayElement(['Annual', 'Mid-term', 'Special'])} ${faker.helpers.arrayElement(regulationStandards)} Audit`,
                auditType: faker.helpers.arrayElement(['Internal', 'External']),
                standardAudited: faker.helpers.arrayElement(regulationStandards),
                startDate: startDate.format('YYYY-MM-DD'),
                endDate: endDate?.format('YYYY-MM-DD'),
                plannedEndDate: plannedEndDate.format('YYYY-MM-DD'),
                auditorName: status !== 'Scheduled' ? (Math.random() < 0.7 ? faker.person.fullName() : faker.company.name()) : undefined,
                status,
                findings: auditFindings,
                reportLink: status === 'Completed' || status === 'Pending Closure' ? faker.internet.url() : undefined,
                onTimeCompletion
            });
        }

        const mockPolicyDocuments: PolicyDocument[] = [];
        const policyCategories = ['Academic Integrity', 'HR Management', 'IT Security', 'Campus Safety', 'Financial Procedures'];
        const policyStatuses: PolicyStatus[] = ['Draft', 'Active', 'Needs Review', 'Archived', 'Expired'];
        for (let i = 0; i < 20; i++) {
            const effectiveDate = dayjs(faker.date.past({years:3}));
            const lastReviewedDate = dayjs(faker.date.between({from: effectiveDate.toDate(), to: dayjs().toDate()}));
            const nextReviewDate = lastReviewedDate.add(faker.number.int({min:6, max:24}), 'month');
            const dept = faker.helpers.arrayElement(mockDepartments);
            mockPolicyDocuments.push({
                id: `POL-${i}`,
                title: `${faker.commerce.productAdjective()} ${faker.helpers.arrayElement(policyCategories)} Policy`,
                category: faker.helpers.arrayElement(policyCategories),
                version: `${faker.number.int({min:1,max:5})}.${faker.number.int({min:0,max:9})}`,
                effectiveDate: effectiveDate.format('YYYY-MM-DD'),
                lastReviewedDate: lastReviewedDate.format('YYYY-MM-DD'),
                nextReviewDate: nextReviewDate.format('YYYY-MM-DD'),
                status: faker.helpers.arrayElement(policyStatuses),
                ownerDepartmentId: dept.id,
                ownerDepartmentName: dept.name,
            });
        }

        const calculatedStats: ComplianceStats = {};
        const totalCompliantItems = mockComplianceItemsList.filter(item => item.status === 'Compliant').length;
        calculatedStats.overallComplianceScore = mockComplianceItemsList.length > 0 ? parseFloat(((totalCompliantItems / mockComplianceItemsList.length) * 100).toFixed(1)) : 100;

        const openAuditFindingsCount = mockAuditRecords.flatMap(a => a.findings || []).filter(f => f.status === 'Open' || f.status === 'Remediating').length;
        calculatedStats.activeNonComplianceIssues = mockComplianceItemsList.filter(item => item.status === 'Non-Compliant' || item.status === 'Action Required').length + openAuditFindingsCount;

        calculatedStats.auditsScheduled = mockAuditRecords.filter(a => a.status === 'Scheduled').length;
        calculatedStats.auditsInProgress = mockAuditRecords.filter(a => a.status === 'In Progress').length;
        calculatedStats.auditsCompleted = mockAuditRecords.filter(a => a.status === 'Completed' || a.status === 'Pending Closure').length;

        const completedAuditsWithOnTimeFlag = mockAuditRecords.filter(a => (a.status === 'Completed' || a.status === 'Pending Closure') && a.onTimeCompletion !== undefined);
        calculatedStats.auditsCompletedOnSchedulePercent = completedAuditsWithOnTimeFlag.length > 0 ?
            parseFloat(((completedAuditsWithOnTimeFlag.filter(a => a.onTimeCompletion).length / completedAuditsWithOnTimeFlag.length) * 100).toFixed(1)) : 100;

        const resolvedAuditFindings = mockAuditRecords.flatMap(a => a.findings || []).filter(f => f.resolutionTimeDays !== undefined && f.resolutionTimeDays >= 0);
        calculatedStats.avgTimeToCloseAuditFindingsDays = resolvedAuditFindings.length > 0 ?
            parseFloat((resolvedAuditFindings.reduce((sum, f) => sum + f.resolutionTimeDays!, 0) / resolvedAuditFindings.length).toFixed(1)) : 0;

        calculatedStats.totalAuditFindings = mockAuditRecords.reduce((sum,a) => sum + (a.findings?.length || 0), 0);
        calculatedStats.openAuditFindings = openAuditFindingsCount;

        calculatedStats.policiesTotal = mockPolicyDocuments.length;
        calculatedStats.policiesDueForReviewCount = mockPolicyDocuments.filter(p => p.status === 'Needs Review' || (p.status==='Active' && dayjs(p.nextReviewDate).isBefore(dayjs().add(3,'month')))).length;

        calculatedStats.nonComplianceBySeverity = mockComplianceItemsList.reduce((acc, item) => {
            const severity = item.nonComplianceDetails?.severity || 'N/A'; // Use 'N/A' if no nonComplianceDetails or severity
            acc[severity] = (acc[severity] || 0) + 1;
            return acc;
        }, {} as Record<AuditFindingSeverity | 'N/A', number>);

        calculatedStats.auditFindingsByStatus = mockAuditRecords.flatMap(a => a.findings || []).reduce((acc, finding) => {
            acc[finding.status] = (acc[finding.status] || 0) + 1;
            return acc;
        }, {} as Record<AuditFinding['status'], number>);

        setData({
          message: t('common.mockDataActive', "Mock data active due to API failure for Compliance."),
          complianceItems: mockComplianceItemsList,
          allAudits: mockAuditRecords,
          policies: mockPolicyDocuments,
          stats: calculatedStats
        });
      } finally {
        setLoading(false);
      }
    };

    loadComplianceData();
  }, [filters.academicYear, filters.institutionId]); // Added filters dependency

  // --- useMemo Hooks for Chart Data ---

  // Data for Compliance Status by Regulation/Standard
  const complianceByRegulationData = useMemo(() => {
    if (!data?.complianceItems) return [];
    const regData: Record<string, Record<ComplianceCurrentStatus | string, number>> = {};
    data.complianceItems.forEach(item => {
      const reg = item.regulationStandard || t('common.unknown', 'Unknown');
      if (!regData[reg]) regData[reg] = {};
      regData[reg][item.status] = (regData[reg][item.status] || 0) + 1;
    });
    return Object.entries(regData).flatMap(([regulation, statuses]) =>
      Object.entries(statuses).map(([status, count]) => ({ regulation, status, count }))
    ).filter(item => item.count > 0);
  }, [data?.complianceItems, t]);

  // Data for Trend of Active Non-Compliance Issues (Mocked Trend)
  const activeNonComplianceTrendData = useMemo(() => {
    const trend: Array<{monthYear: string, count: number}> = [];
    if(data?.stats?.activeNonComplianceIssues !== undefined){
        // For mock purposes, create a simple trend for the last 6 months around the current active issues
        const F = faker; // Assuming faker might be available if mock data was generated
        for (let i = 5; i >= 0; i--) {
            trend.push({
                monthYear: dayjs().subtract(i,'month').format('YYYY-MM'),
                // Fluctuate around the current number of active issues for mock trend
                count: Math.max(0, (data.stats.activeNonComplianceIssues || 0) + (F?.number.int({min:-3, max:3}) ?? 0) )
            });
        }
    } else if (data?.complianceItems) { // Fallback if stats.activeNonComplianceIssues is not there
        // This would be a very simplified view, just plotting current non-compliant items over time if they had a 'resolvedDate'
        // For now, relying on the mock stats approach or an empty array.
        // A proper historical trend requires more data than usually available in current state snapshots.
    }
    return trend;
  }, [data?.complianceItems, data?.stats?.activeNonComplianceIssues, t]);


  // Data for Non-Compliance Issues by Department
  const nonComplianceByDeptData = useMemo(() => {
    if (!data?.complianceItems) return [];
    const deptCounts: Record<string, number> = {};
    data.complianceItems.forEach(item => {
      if (item.status === 'Non-Compliant' || item.status === 'Action Required') {
        const dept = item.ownerDepartmentName || t('common.unknownDepartment', 'Unknown Dept.');
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
      }
    });
    return Object.entries(deptCounts).map(([departmentName, count]) => ({ departmentName, count })).filter(item => item.count > 0).sort((a,b) => b.count - a.count);
  }, [data?.complianceItems, t]);

  // Data for Non-Compliance by Severity (from stats or calculated)
  const nonComplianceBySeverityChartData = useMemo(() => {
       if (data?.stats?.nonComplianceBySeverity) {
           return Object.entries(data.stats.nonComplianceBySeverity)
               .map(([severity, count]) => ({ severity: severity as AuditFindingSeverity | 'N/A', count: count as number }))
               .filter(item => item.count > 0 && item.severity !== 'N/A');
       }
       if (!data?.complianceItems) return [];
       const severityCounts: Record<string, number> = {};
       data.complianceItems.forEach(item => {
           if (item.nonComplianceDetails?.severity) {
               severityCounts[item.nonComplianceDetails.severity] = (severityCounts[item.nonComplianceDetails.severity] || 0) + 1;
           }
       });
       return Object.entries(severityCounts).map(([severity, count]) => ({ severity, count })).filter(item => item.count > 0);
   }, [data?.stats?.nonComplianceBySeverity, data?.complianceItems]);

  // --- Audit Management & Tracking ---
  const auditsByStatusData = useMemo(() => {
    if (!data?.allAudits) return [];
    if (data.stats?.auditsScheduled !== undefined && data.stats?.auditsInProgress !== undefined && data.stats?.auditsCompleted !== undefined) {
       const auditStatusesForChart: {type: AuditStatus | string, count: number}[] = [];
       if(data.stats.auditsScheduled > 0) auditStatusesForChart.push({type: t('auditStatus.Scheduled', 'Scheduled'), count: data.stats.auditsScheduled});
       if(data.stats.auditsInProgress > 0) auditStatusesForChart.push({type: t('auditStatus.InProgress', 'In Progress'), count: data.stats.auditsInProgress});
       if(data.stats.auditsCompleted > 0) auditStatusesForChart.push({type: t('auditStatus.Completed', 'Completed'), count: data.stats.auditsCompleted});
       const otherCounts = data.allAudits.reduce((acc, audit) => {
           if (audit.status === 'Pending Closure' || audit.status === 'Cancelled') {
               const statusLabel = t(`auditStatus.${audit.status.replace(/\s+/g, '')}`, audit.status);
               acc[statusLabel] = (acc[statusLabel] || 0) + 1;
           }
           return acc;
       }, {} as Record<string, number>);
       Object.entries(otherCounts).forEach(([type,count])=> auditStatusesForChart.push({type, count}));
       return auditStatusesForChart.filter(s => s.count > 0);
    }
    const statusCounts = data.allAudits.reduce((acc, audit) => {
      const statusLabel = t(`auditStatus.${audit.status.replace(/\s+/g, '')}`, audit.status);
      acc[statusLabel] = (acc[statusLabel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(statusCounts).map(([type, count]) => ({ type, count })).filter(item => item.count > 0);
  }, [data?.allAudits, data?.stats, t]);

  const auditFindingsBySeverityData = useMemo(() => {
       if (!data?.allAudits) return [];
       const severityCounts: Record<AuditFindingSeverity, number> = { 'Critical':0, 'Major':0, 'Minor':0, 'Observation':0 };
       data.allAudits.forEach(audit => {
           (audit.findings || []).forEach(finding => {
               severityCounts[finding.severity] = (severityCounts[finding.severity] || 0) + 1;
           });
       });
       return Object.entries(severityCounts).map(([severity, count]) => ({ severity: severity as AuditFindingSeverity, count })).filter(item => item.count > 0);
   }, [data?.allAudits]);

  const auditFindingsTrendData = useMemo(() => {
    if (!data?.allAudits) return [];
    const monthlyCounts: Record<string, number> = {};
    const last12MonthsMap: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
        const month = dayjs().subtract(i, 'month').format('YYYY-MM');
        last12MonthsMap[month] = 0;
    }
    data.allAudits.forEach(audit => {
      if (audit.status === 'Completed' || audit.status === 'Pending Closure') {
        const monthYear = dayjs(audit.startDate).format('YYYY-MM');
        if(last12MonthsMap.hasOwnProperty(monthYear)){
            last12MonthsMap[monthYear] = (last12MonthsMap[monthYear] || 0) + (audit.findings?.length || 0);
        }
      }
    });
    return Object.entries(last12MonthsMap)
      .map(([monthYear, count]) => ({ monthYear, count }))
      .sort((a, b) => a.monthYear.localeCompare(b.monthYear));
  }, [data?.allAudits]);

  const avgFindingClosureBySeverityData = useMemo(() => {
    if (!data?.allAudits) return [];
    const severityTimes: Record<string, { totalDays: number; count: number }> = {};
    data.allAudits.forEach(audit => {
      (audit.findings || []).forEach(finding => {
        if ((finding.status === 'Closed' || finding.status === 'Verified') && finding.resolutionTimeDays !== undefined && finding.resolutionTimeDays >=0) {
          if (!severityTimes[finding.severity]) severityTimes[finding.severity] = { totalDays: 0, count: 0 };
          severityTimes[finding.severity].totalDays += finding.resolutionTimeDays;
          severityTimes[finding.severity].count++;
        }
      });
    });
    return Object.entries(severityTimes).map(([severity, data]) => ({
      severity,
      avgDays: data.count > 0 ? parseFloat((data.totalDays / data.count).toFixed(1)) : 0,
    })).filter(item => item.avgDays > 0);
  }, [data?.allAudits]);

  const deptsWithOpenAuditFindingsData = useMemo(() => {
    if (!data?.allAudits) return [];
    const deptOpenFindings: Record<string, number> = {};
    data.allAudits.forEach(audit => {
      (audit.findings || []).forEach(finding => {
        if ((finding.status === 'Open' || finding.status === 'Remediating') && finding.responsibleDepartmentName) {
          deptOpenFindings[finding.responsibleDepartmentName] = (deptOpenFindings[finding.responsibleDepartmentName] || 0) + 1;
        }
      });
    });
    return Object.entries(deptOpenFindings).map(([departmentName, count]) => ({ departmentName, count }))
       .filter(item => item.count > 0)
       .sort((a,b) => b.count-a.count);
  }, [data?.allAudits]);

  // --- Policy & Document Management ---
  const policyReviewStatusData = useMemo(() => {
    if (!data?.policies) return [];
    const today = dayjs();
    const statusCounts: Record<string, number> = {
       [t('policyStatus.Active', 'Active & Current')]: 0,
       [t('policyStatus.NeedsReviewSoon', 'Needs Review (Soon)')]: 0,
       [t('policyStatus.OverdueReview', 'Overdue for Review')]: 0,
       [t('policyStatus.Draft', 'Draft')]:0,
       [t('policyStatus.ArchivedExpired', 'Archived/Expired')]:0,
    };
    data.policies.forEach(p => {
       if (p.status === 'Active') {
           const nextReview = dayjs(p.nextReviewDate);
           if (nextReview.isBefore(today)) statusCounts[t('policyStatus.OverdueReview', 'Overdue for Review')]++;
           else if (nextReview.isBefore(today.add(3,'month'))) statusCounts[t('policyStatus.NeedsReviewSoon', 'Needs Review (Soon)')]++;
           else statusCounts[t('policyStatus.Active', 'Active & Current')]++;
       } else if (p.status === 'Needs Review') {
           statusCounts[t('policyStatus.NeedsReviewSoon', 'Needs Review (Soon)')]++;
       } else if (p.status === 'Draft') {
           statusCounts[t('policyStatus.Draft', 'Draft')]++;
       } else if (p.status === 'Archived' || p.status === 'Expired') {
           statusCounts[t('policyStatus.ArchivedExpired', 'Archived/Expired')]++;
       }
    });
    return Object.entries(statusCounts).map(([type, count]) => ({ type, count })).filter(item => item.count > 0);
  }, [data?.policies, t]);

  const policiesByCategoryData = useMemo(() => {
    if (!data?.policies) return [];
    const categoryCounts = data.policies.reduce((acc, p) => {
      const cat = p.category || t('common.unknownCategory', 'Uncategorized');
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(categoryCounts).map(([category, count]) => ({ category, count })).sort((a,b) => b.count - a.count);
  }, [data?.policies, t]);

  const policiesDueForReviewTableData = useMemo(() => {
    if (!data?.policies) return [];
    const today = dayjs();
    const next3Months = today.add(3, 'month');
    return data.policies.filter(p =>
      (p.status === 'Active' || p.status === 'Needs Review') &&
      dayjs(p.nextReviewDate).isBetween(today, next3Months, null, '[]')
    ).sort((a,b) => dayjs(a.nextReviewDate).diff(dayjs(b.nextReviewDate)));
  }, [data?.policies]);

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

        {data?.message && (
          <Paragraph style={{ marginTop: '10px', fontStyle: 'italic' }}>{data.message}</Paragraph>
        )}

        {!loading && !error && data && (
          <>
            {/* Overall Compliance KPIs Row */}
            {data.stats && (
                 <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                     <Col xs={12} sm={12} md={8} lg={4} xl={5}> {/* Adjusted xl for 5 items */}
                         <Card size="small">
                             <Statistic
                                 title={t('module.compliance.kpi.overallScore', "Overall Compliance Score")}
                                 value={data.stats.overallComplianceScore !== undefined ? data.stats.overallComplianceScore : undefined}
                                 precision={1}
                                 valueRender={() => data.stats?.overallComplianceScore !== undefined ?
                                     <Gauge percent={(data.stats.overallComplianceScore)/100} range={{color:['l(0) 0:#cf1322 1:#3f8600']}} style={{height:80, marginTop:5}} /> : <Text>{t('common.notAvailable','N/A')}</Text>}
                             />
                         </Card>
                     </Col>
                     <Col xs={12} sm={12} md={8} lg={5} xl={4}><Card size="small"><Statistic title={t('module.compliance.kpi.activeNonCompliance', "Active Non-Compliance")} value={data.stats.activeNonComplianceIssues ?? 'N/A'} prefix={<WarningOutlined style={{color: data.stats.activeNonComplianceIssues && data.stats.activeNonComplianceIssues > 0 ? 'red' : 'inherit' }}/>} /></Card></Col>
                     <Col xs={12} sm={12} md={8} lg={5} xl={5}><Card size="small"><Statistic title={t('module.compliance.kpi.auditsOnSchedule', "Audits On Schedule")} value={data.stats.auditsCompletedOnSchedulePercent} suffix="%" precision={1} prefix={<ScheduleOutlined/>} /></Card></Col>
                     <Col xs={12} sm={12} md={8} lg={5} xl={5}><Card size="small"><Statistic title={t('module.compliance.kpi.avgFindingCloseTime', "Avg. Audit Finding Closure (Days)")} value={data.stats.avgTimeToCloseAuditFindingsDays} precision={1} prefix={<FieldTimeOutlined/>} /></Card></Col>
                     <Col xs={12} sm={12} md={8} lg={5} xl={5}><Card size="small"><Statistic title={t('module.compliance.kpi.policiesForReview', "Policies Due for Review")} value={data.stats.policiesDueForReviewCount ?? 'N/A'} prefix={<FileProtectOutlined/>} /></Card></Col>
                 </Row>
            )}

            {/* Existing Summary Card (Last Audit Date can be removed or integrated if KPIs cover it) */}
            {/* For now, let's comment it out as KPIs provide more comprehensive summary */}
            {/*
            <Card title={t(`module.${MODULE_KEY}.summaryTitle`, "Compliance Summary")} style={{ marginBottom: 20 }}>
                <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label={t(`module.${MODULE_KEY}.lastAuditDate`, "Last Audit Date")}>
                        {data.stats?.lastAuditDate ? dayjs(data.stats.lastAuditDate).format('YYYY-MM-DD') : t('common.notAvailable', 'N/A')}
                    </Descriptions.Item>
                </Descriptions>
            </Card>
            */}

            {/* Existing Compliance Status Overview Pie Chart - can be kept or removed if new charts are better */}
            {data.complianceItems && data.complianceItems.length > 0 && (
              <Row gutter={[16,16]} style={{ marginTop: 20 }}>
                 <Col xs={24} md={12} lg={8}>
                  <Card title={<><PieChartOutlined /> {t(`module.${MODULE_KEY}.complianceStatusChartTitle`, "Compliance Items by Status")}</>}>
                    <Pie
                      data={data.complianceStatus.reduce((acc, item) => {
                        const existing = acc.find(i => i.type === item.status);
                        if (existing) {
                          existing.value += 1;
                        } else {
                          acc.push({ type: item.status, value: 1 });
                        }
                        return acc;
                      }, [] as Array<{type: string, value: number}>)}
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
                          formatter: (datum) => {
                            return { name: datum.type, value: datum.value + ' ' + t('common.items', 'items') };
                          },
                      }}
                    />
                  </Card>
                </Col>
              </Row>
            )}

            {data.complianceStatus && data.complianceStatus.length > 0 && (
              <Card title={t(`module.${MODULE_KEY}.complianceStatusTableTitle`, "Detailed Compliance Status")} style={{ marginTop: 20 }}>
                <Table
                  dataSource={data.complianceStatus}
                  columns={[
                    { title: t('common.area', 'Area'), dataIndex: 'area', key: 'area', sorter: (a,b) => a.area.localeCompare(b.area) },
                    {
                      title: t('common.status', 'Status'),
                      dataIndex: 'status',
                      key: 'status',
                      render: (status: 'Compliant' | 'Non-Compliant' | 'Pending') => {
                        let color;
                        if (status === 'Compliant') color = 'success';
                        else if (status === 'Non-Compliant') color = 'error';
                        else if (status === 'Pending') color = 'warning';
                        return <Tag color={color}>{status}</Tag>;
                      },
                      filters: [
                        { text: 'Compliant', value: 'Compliant' },
                        { text: 'Non-Compliant', value: 'Non-Compliant' },
                        { text: 'Pending', value: 'Pending' },
                      ],
                      onFilter: (value, record) => record.status === value,
                    },
                    { title: t('common.details', 'Details'), dataIndex: 'details', key: 'details', ellipsis: true },
                  ]}
                  rowKey="id" // Changed from area to id assuming id is unique for ComplianceStatusItem
                  pagination={{ pageSize: 5 }}
                  scroll={{ x: 'max-content' }}
                />
              </Card>
            )}

            {/* New Compliance Analysis Section */}
            <Title level={4} style={{ marginTop: '30px' }}>{t('module.compliance.complianceAnalysisTitle', "Compliance Analysis")}</Title>
            <Row gutter={[16, 16]} style={{ marginTop: '10px' }}>
              <Col xs={24} lg={16}>
                <Card title={t('module.compliance.statusByRegulationTitle', "Compliance Status by Regulation/Standard")}>
                  {complianceByRegulationData.length > 0 ? (
                    <Column data={complianceByRegulationData} xField="regulation" yField="count" seriesField="status" isGroup={true} legend={{position:'top'}}
                            yAxis={{title:{text:t('common.itemCount',"No. of Items")}}} xAxis={{label:{rotate:complianceByRegulationData.map(d=>d.regulation).filter((v,i,a)=>a.indexOf(v)===i).length > 3 ? 30:0, autoEllipsis:true}}}/>
                  ) : <Empty />}
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title={t('module.compliance.nonComplianceSeverityTitle', "Non-Compliance by Severity")}>
                  {nonComplianceBySeverityChartData.length > 0 ? (
                    <Pie data={nonComplianceBySeverityChartData} angleField="count" colorField="severity" radius={0.8} legend={{position:'bottom'}}
                         label={{type:'inner', offset:'-30%', content:'{value}', style:{fill:'#fff'}}}
                         tooltip={{formatter:(d)=>({name:d.severity, value:`${d.count} ${t('common.issues','issues')}`})}} />
                  ) : <Empty />}
                </Card>
              </Col>
            </Row>
            <Row gutter={[16,16]} style={{marginTop:'20px'}}>
             <Col xs={24} lg={12}>
                 <Card title={t('module.compliance.activeNonComplianceTrendTitle', "Trend of Active Non-Compliance Issues (Mocked)")}>
                     {activeNonComplianceTrendData.length > 0 ? (
                     <Line data={activeNonComplianceTrendData} xField="monthYear" yField="count"
                             yAxis={{title:{text:t('common.itemCount',"No. of Active Issues")}}} xAxis={{title:{text:t('common.monthYear',"Month-Year")}}}/>
                     ) : <Empty />}
                 </Card>
             </Col>
             <Col xs={24} lg={12}>
                 <Card title={t('module.compliance.nonComplianceByDeptTitle', "Non-Compliance Issues by Department")}>
                     {nonComplianceByDeptData.length > 0 ? (
                     <Bar data={nonComplianceByDeptData} xField="count" yField="departmentName" seriesField="departmentName" legend={false}
                             barWidthRatio={0.7} yAxis={{label:{autoEllipsis:true}}} xAxis={{title:{text:t('common.itemCount',"No. of Issues")}}}/>
                     ) : <Empty />}
                 </Card>
             </Col>
            </Row>

            {/* Audit Management & Tracking Section */}
            <Title level={4} style={{ marginTop: '30px' }}>{t('module.compliance.auditMgmtTitle', "Audit Management & Tracking")}</Title>
            <Row gutter={[16, 16]} style={{ marginTop: '10px' }}>
              <Col xs={24} md={12} lg={8}>
                <Card title={t('module.compliance.auditsByStatusTitle', "Audits by Status")}>
                  {auditsByStatusData.length > 0 ? (
                    <Pie data={auditsByStatusData} angleField="count" colorField="type" radius={0.8} legend={{position:'bottom'}}
                         label={{type:'inner', offset:'-30%', content:'{value}', style:{fill:'#fff'}}}
                         tooltip={{formatter:(d)=>({name:d.type, value:`${d.count} ${t('common.audits','audits')}`})}} />
                  ) : <Empty />}
                </Card>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Card title={t('module.compliance.auditFindingsSeverityTitle', "Overall Audit Findings by Severity")}>
                  {auditFindingsBySeverityData.length > 0 ? (
                    <Pie data={auditFindingsBySeverityData} angleField="count" colorField="severity" radius={0.8} legend={{position:'bottom'}}
                         label={{type:'inner', offset:'-30%', content:'{value}', style:{fill:'#fff'}}}
                         tooltip={{formatter:(d)=>({name:d.severity, value:`${d.count} ${t('common.findings','findings')}`})}} />
                  ) : <Empty />}
                </Card>
              </Col>
              <Col xs={24} md={24} lg={8}>
                <Card title={t('module.compliance.auditFindingsTrendTitle', "Audit Findings Trend (Monthly from Completed Audits)")}>
                  {auditFindingsTrendData.length > 0 ? (
                    <Line data={auditFindingsTrendData} xField="monthYear" yField="count"
                          yAxis={{title:{text:t('common.numberOfFindings',"No. of Findings")}}}
                          xAxis={{title:{text:t('common.monthYear',"Month-Year")}}} point={{size:3}}/>
                  ) : <Empty />}
                </Card>
              </Col>
             </Row>
             <Row gutter={[16,16]} style={{marginTop:'20px'}}>
                 <Col xs={24} lg={12}>
                     <Card title={t('module.compliance.avgFindingClosureSeverityTitle', "Avg. Finding Closure Time by Severity (Days)")}>
                         {avgFindingClosureBySeverityData.length > 0 ? (
                         <Column data={avgFindingClosureBySeverityData} xField="severity" yField="avgDays" seriesField="severity" legend={false}
                                 label={{position:'top'}} yAxis={{title:{text:t('common.averageDays',"Avg. Days")}}}/>
                         ) : <Empty />}
                     </Card>
                 </Col>
                 <Col xs={24} lg={12}>
                     <Card title={t('module.compliance.deptsOpenAuditFindingsTitle', "Departments with Most Open Audit Findings")}>
                         {deptsWithOpenAuditFindingsData.length > 0 ? (
                         <Bar data={deptsWithOpenAuditFindingsData.slice(0,10)} xField="count" yField="departmentName" seriesField="departmentName" legend={false}
                                 barWidthRatio={0.7} yAxis={{label:{autoEllipsis:true}}} xAxis={{title:{text:t('common.openFindings',"Open Findings")}}}/>
                         ) : <Empty />}
                     </Card>
                 </Col>
             </Row>

            {/* Policy & Document Management Section */}
            <Title level={4} style={{ marginTop: '30px' }}>{t('module.compliance.policyDocMgmtTitle', "Policy & Document Management")}</Title>
            <Row gutter={[16, 16]} style={{ marginTop: '10px' }}>
              <Col xs={24} md={12} lg={8}>
                <Card title={t('module.compliance.policyReviewStatusTitle', "Policy Review Status")}>
                  {policyReviewStatusData.length > 0 ? (
                    <Donut data={policyReviewStatusData} angleField="count" colorField="type" innerRadius={0.6} radius={0.85} legend={{position:'bottom'}}
                           label={{type:'outer', content: '{name}\n{value} ({percentage})'}}
                           tooltip={{formatter:(d)=>({name:d.type, value:`${d.count} ${t('common.policies','policies')}`})}} />
                  ) : <Empty />}
                </Card>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Card title={t('module.compliance.policiesByCatTitle', "Policies by Category")}>
                  {policiesByCategoryData.length > 0 ? (
                    <Bar data={policiesByCategoryData} xField="count" yField="category" seriesField="category" legend={false}
                         barWidthRatio={0.7} yAxis={{label:{autoEllipsis:true}}} xAxis={{title:{text:t('common.numberOfPolicies',"No. of Policies")}}}/>
                  ) : <Empty />}
                </Card>
              </Col>
              <Col xs={24} md={24} lg={8}> {/* Full width on Med screens */}
                <Card title={t('module.compliance.policiesDueReviewTitle', "Policies Due for Review (Next 3 Months)")}>
                  {policiesDueForReviewTableData.length > 0 ? (
                    <Table dataSource={policiesDueForReviewTableData} scroll={{x:'max-content'}} size="small" pagination={{pageSize:5}}
                           columns={[
                             {title:t('common.title','Title'), dataIndex:'title', key:'title', ellipsis:true, sorter:(a,b)=>a.title.localeCompare(b.title)},
                             {title:t('common.category','Category'), dataIndex:'category', key:'cat'},
                             {title:t('common.nextReviewDate','Next Review'), dataIndex:'nextReviewDate', key:'nrd', render:(d)=>dayjs(d).format('YYYY-MM-DD'), sorter:(a,b)=>dayjs(a.nextReviewDate).diff(dayjs(b.nextReviewDate))},
                             {title:t('common.ownerDepartment','Owner Dept'), dataIndex:'ownerDepartmentName', key:'owner', ellipsis:true},
                           ]} rowKey="id" />
                  ) : <Empty description={t('common.noPoliciesDueSoon', "No policies due for review soon.")} />}
                </Card>
              </Col>
            </Row>

            {/* Upcoming Audits Table - This was part of the original file, check if still needed or if covered by new audit charts */}
            {/* For now, let's assume it's still useful for a quick list of active/scheduled audits. */}
            {data.allAudits && data.allAudits.filter(a => a.status === 'Scheduled' || a.status === 'In Progress').length > 0 && (
                 <Card title={t(`module.${MODULE_KEY}.upcomingAuditsTableTitle`, "Upcoming & In-Progress Audits")} style={{ marginTop: 20 }}>
                     <Table
                         dataSource={data.allAudits.filter(a => a.status === 'Scheduled' || a.status === 'In Progress')}
                        columns={[
                            { title: t('common.date', 'Date'), dataIndex: 'date', key: 'date', render: (text: string) => dayjs(text).format('YYYY-MM-DD'), sorter: (a,b) => dayjs(a.date).unix() - dayjs(b.date).unix() },
                            { title: t('common.type', 'Type'), dataIndex: 'type', key: 'type', sorter: (a,b) => a.type.localeCompare(b.type) },
                            { title: t('common.authority', 'Authority'), dataIndex: 'authority', key: 'authority', sorter: (a,b) => a.authority.localeCompare(b.authority) },
                        ]}
                        rowKey={(record, index) => record.date + (record.type || index)}
                        pagination={{ pageSize: 3 }}
                        scroll={{ x: 'max-content' }}
                    />
                </Card>
            )}
          </>
        )}
        {!loading && !error && !data?.complianceStatus && !data?.message && (
          <Paragraph>{t('common.noDataAvailable', "No compliance data available.")}</Paragraph>
        )}
      </div>
    </div>
  );
};

export default ComplianceAccreditationModule;
