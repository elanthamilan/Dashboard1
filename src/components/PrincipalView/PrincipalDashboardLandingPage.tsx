// IMPORTANT: This component currently uses MOCK DATA.
// TODO: Replace mock data generation (generateMockNewInstitutions, generateMockStudents)
// with actual data fetching logic from an API or state management system.
// src/components/PrincipalView/PrincipalDashboardLandingPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Divider, Row, Col, Spin } from 'antd';
import GlobalFilters from './GlobalFilters';
import KPICard from './KPICard';
import {
    UserOutlined, DollarCircleOutlined, CheckCircleOutlined, UserDeleteOutlined,
    SolutionOutlined, RiseOutlined, FileTextOutlined, TeamOutlined, AlertOutlined, SafetyCertificateOutlined
} from '@ant-design/icons';
import { useGlobalFilters } from '../../contexts/GlobalFilterContext';
import { generateMockNewInstitutions } from '../../utils/mockData/academics/generateMockAcademicData';
import { generateMockStudents } from '../../utils/mockData/attendance/generateMockAttendanceData'; // Added import
import { Institution, StudentSummary, Department } from '../../types/hierarchy'; // Added Department
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import dayjs from 'dayjs'; // Import dayjs for date formatting

const { Title, Text, Paragraph } = Typography;

const PrincipalDashboardLandingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate(); // Initialize navigate
  const filters = useGlobalFilters();
  const [institutionData, setInstitutionData] = useState<Institution | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    try {
      // IMPORTANT: This component currently uses MOCK DATA.
      // TODO: Replace mock data generation with actual data fetching logic.
      const tempStudents = generateMockStudents(500);
      const data = generateMockNewInstitutions(undefined, tempStudents, 3, 50);
      if (data && data.length > 0) {
        setInstitutionData(data[0]);
      } else {
        setInstitutionData(null);
        // console.error("No institution data generated.");
      }
    } catch (error) {
      // console.error("Error generating institution data:", error);
      setInstitutionData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const allStudentsInInstitution = useMemo((): StudentSummary[] => {
    if (!institutionData) return [];
    const studentsMap = new Map<string, StudentSummary>();
    institutionData.academicYears.forEach(year => {
      year.degrees.forEach(degree => {
        degree.programs.forEach(program => {
          program.semesters.forEach(semester => {
            if (semester.students) {
                semester.students.forEach((s: StudentSummary) => {
                    if(s && s.studentId && !studentsMap.has(s.studentId)) {
                         studentsMap.set(s.studentId,s);
                    }
                });
            }
          });
        });
      });
    });
    return Array.from(studentsMap.values());
  }, [institutionData]);

  const dropoutRate = useMemo(() => {
    if (!institutionData || allStudentsInInstitution.length === 0) return 0;
    const inactiveStudents = allStudentsInInstitution.filter(
      student => student.enrollmentStatus === 'Inactive'
    ).length;
    const graduatedStudents = allStudentsInInstitution.filter(
      student => student.enrollmentStatus === 'Graduated'
    ).length;
    const potentialBase = allStudentsInInstitution.length - graduatedStudents;
    if (potentialBase <= 0) return 0;
    const calculatedRate = (inactiveStudents / potentialBase) * 100;
    return parseFloat(calculatedRate.toFixed(2));
  }, [institutionData, allStudentsInInstitution]);

  const academicPassRate = useMemo(() => {
    if (!institutionData || allStudentsInInstitution.length === 0) return 0;
    const passingStudents = allStudentsInInstitution.filter(
      student => student.cumulativeGPA !== undefined && student.cumulativeGPA >= 2.0
    ).length;
    if (allStudentsInInstitution.length === 0) return 0;
    const calculatedRate = (passingStudents / allStudentsInInstitution.length) * 100;
    return parseFloat(calculatedRate.toFixed(2));
  }, [institutionData, allStudentsInInstitution]);

  const totalEnrollments = institutionData?.totalInstitutionEnrolledCount ?? 0;
  const feeCollectionPercentage = institutionData?.institutionFeesPaidPercentage ?? 0;
  const averageAttendancePercentage = institutionData?.institutionAttendancePercentage ?? 0;
  const placementSuccessRate = institutionData?.overallPlacementRate ?? 0;
  const pendingReEvaluations = institutionData?.pendingReEvaluationsCount ?? 0;

  const departmentScores = institutionData?.faculties?.flatMap(faculty => faculty.departments).map(dept => dept.performanceScore).filter(score => score !== undefined) as number[];
  const avgDeptPerfScore = departmentScores && departmentScores.length > 0
    ? parseFloat((departmentScores.reduce((sum, score) => sum + score, 0) / departmentScores.length).toFixed(1))
    : 0;

  const openGrievances = institutionData?.openGrievancesCount ?? 0;
  const compliancePercentage = institutionData?.overallCompliancePercentage ?? 0;

  const complianceTooltipText = `${t('kpi.complianceStatus.tooltip')} ${institutionData?.nextAccreditationReviewDate ? `${t('kpi.complianceStatus.nextReview')}: ${dayjs(institutionData.nextAccreditationReviewDate).format('MMM YYYY')}` : '(' + t('kpi.complianceStatus.nextReviewMissing') + ')'}`;

  const finalColProps = { xs:12, sm:12, md:8, lg:4, xl:4};

  return (
    React.createElement("div", { style: { padding: '20px' } },
      React.createElement(Title, { level: 2 }, t('dashboard.title')),
      React.createElement(Paragraph, null, t('dashboard.subtitle')),
      React.createElement(GlobalFilters, null),
      React.createElement(Divider, null),
      React.createElement(Title, { level: 3, style: { marginTop: '20px' } }, t('dashboard.kpiSectionTitle')),
      loading ? (
        React.createElement("div", { style: { textAlign: 'center', padding: '50px' } }, React.createElement(Spin, { size: "large" }))
      ) : institutionData ? (
        React.createElement(Row, { gutter: [16, 24] },
          React.createElement(Col, finalColProps,
            React.createElement(KPICard, { titleKey: "kpi.totalEnrollments.title", value: totalEnrollments, tooltipKey: "kpi.totalEnrollments.tooltip", icon: React.createElement(UserOutlined), loading: loading, onClick: () => navigate('admissions') })
          ),
          React.createElement(Col, finalColProps,
            React.createElement(KPICard, { titleKey: "kpi.dropoutRate.title", value: dropoutRate, valueSuffix: "%", tooltipKey: "kpi.dropoutRate.tooltip", icon: React.createElement(UserDeleteOutlined), loading: loading, onClick: () => navigate('admissions') })
          ),
          React.createElement(Col, finalColProps,
            React.createElement(KPICard, { titleKey: "kpi.academicPassRate.title", value: academicPassRate, valueSuffix: "%", tooltipKey: "kpi.academicPassRate.tooltip", icon: React.createElement(SolutionOutlined), loading: loading, onClick: () => navigate('academic-performance') })
          ),
          React.createElement(Col, finalColProps,
            React.createElement(KPICard, { titleKey: "kpi.reEvaluationTrends.title", value: pendingReEvaluations, tooltipKey: "kpi.reEvaluationTrends.tooltip", icon: React.createElement(FileTextOutlined), loading: loading, onClick: () => navigate('academic-performance') })
          ),
          React.createElement(Col, finalColProps,
            React.createElement(KPICard, { titleKey: "kpi.placementSuccessRate.title", value: placementSuccessRate, valueSuffix: "%", tooltipKey: "kpi.placementSuccessRate.tooltip", icon: React.createElement(RiseOutlined), loading: loading, onClick: () => navigate('placement-alumni') })
          ),
          React.createElement(Col, finalColProps,
            React.createElement(KPICard, { titleKey: "kpi.feeCollection.title", value: feeCollectionPercentage, valueSuffix: "%", tooltipKey: "kpi.feeCollection.tooltip", icon: React.createElement(DollarCircleOutlined), loading: loading, onClick: () => navigate('billing-fee-collection') })
          ),
          React.createElement(Col, finalColProps,
            React.createElement(KPICard, { titleKey: "kpi.avgAttendance.title", value: averageAttendancePercentage, valueSuffix: "%", tooltipKey: "kpi.avgAttendance.tooltip", icon: React.createElement(CheckCircleOutlined), loading: loading, onClick: () => navigate('attendance-engagement') })
          ),
          React.createElement(Col, finalColProps,
            React.createElement(KPICard, { titleKey: "kpi.deptPerformance.title", value: avgDeptPerfScore, valueSuffix: "/100", tooltipKey: "kpi.deptPerformance.tooltip", icon: React.createElement(TeamOutlined), loading: loading, onClick: () => navigate('department-faculty') })
          ),
          React.createElement(Col, finalColProps,
            React.createElement(KPICard, { titleKey: "kpi.openGrievances.title", value: openGrievances, tooltipKey: "kpi.openGrievances.tooltip", icon: React.createElement(AlertOutlined), loading: loading, onClick: () => navigate('grievances-feedback') })
          ),
          React.createElement(Col, finalColProps,
            React.createElement(KPICard, { titleKey: "kpi.complianceStatus.title", value: compliancePercentage, valueSuffix: "%", tooltipText: complianceTooltipText, icon: React.createElement(SafetyCertificateOutlined), loading: loading, onClick: () => navigate('compliance-accreditation') })
          )
        )
      ) : (
        React.createElement("div", { style: { textAlign: 'center', padding: '50px' } }, React.createElement(Text, null, t('dashboard.noDataKpis')))
      ),
      React.createElement("div", { style: { marginTop: '20px', padding: '10px', background: '#f9f9f9', display: 'none' } },
        React.createElement(Title, { level: 4 }, "Current Filter State (for debugging):"),
        React.createElement(Text, null, "Academic Year: ", filters.academicYear || 'Not set'), React.createElement("br"),
        React.createElement(Text, null, "Campus: ", filters.campus || 'Not set'), React.createElement("br"),
        React.createElement(Text, null, "Degree Type: ", filters.degreeType || 'Not set'), React.createElement("br"),
        React.createElement(Text, null, "Department: ", filters.department || 'Not set'), React.createElement("br"),
        React.createElement(Text, null, "Date Range: ", filters.dateRange ? `${filters.dateRange[0]} - ${filters.dateRange[1]}` : 'Not set')
      )
    )
  );
};

export default PrincipalDashboardLandingPage;
