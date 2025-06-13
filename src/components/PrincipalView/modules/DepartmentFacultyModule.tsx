import React, { useEffect, useState, useMemo } from 'react'; // Added useMemo
import { Typography, Breadcrumb, Card, Descriptions, Spin, List, Table, Tag, Row, Col, Statistic } from 'antd'; // Added Statistic
import { Link } from 'react-router-dom';
import { useGlobalFilters } from '../../../contexts/GlobalFilterContext';
import { useTranslation } from 'react-i18next';
import { HomeOutlined, PieChartOutlined, BarChartOutlined } from '@ant-design/icons';
import { fetchData } from '../../../utils/apiUtils';
import { Department } from '../../../types/departments'; // Ensure Department is from its source
import { FacultyMember } from '../../../types/academics'; // Ensure FacultyMember is from its source
import { Program } from '../../../types/hierarchy'; // Program might be okay from hierarchy if it's just used for type, not detailed structure here
import { Pie, Column, Bar } from '@ant-design/plots'; // Added Bar
import { Empty } from 'antd'; // Added Empty

const { Title, Paragraph, Text } = Typography;

const MODULE_KEY = 'departmentFaculty';

interface DepartmentFacultyStats {
  totalDepartments?: number;
  totalFaculty?: number;
  avgFacultyStudentRatio?: number;
}

interface DepartmentFacultyData {
  departments?: Department[];
  facultyMembers?: FacultyMember[];
  programs?: Program[];
  stats?: DepartmentFacultyStats;
  message?: string;
}

const DepartmentFacultyModule: React.FC = () => {
  const { t } = useTranslation();
  const filters = useGlobalFilters();

  const [deptFacultyData, setDeptFacultyData] = useState<DepartmentFacultyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDeptFacultyData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchData<DepartmentFacultyData>('/principal-view/department-faculty');
        setDeptFacultyData(result);
      } catch (err: any) {
        console.warn('Falling back to mock data for DepartmentFacultyModule due to API error:', err);
        setError(err.message || t('errors.failedToFetchDeptFacultyData', 'Failed to fetch department & faculty data'));

        const F = await import('@faker-js/faker'); // Dynamic import for faker
        const {faker} = F;
        const dayjs = (await import('dayjs')).default;


        const createMockDepartments = (): Department[] => {
          const deptNames = [
            t('common.departments.computerScience', 'Computer Science'),
            t('common.departments.physics', 'Physics'),
            t('common.departments.mathematics', 'Mathematics'),
            t('common.departments.electricalEngineering', 'Electrical Engineering')
          ];
          return deptNames.slice(0, faker.number.int({min:2, max:4})).map((name, index) => ({
            departmentId: `DPT_${index + 1}`,
            departmentName: name,
            facultyId: `FAC_SCHOOL_${index % 2 + 1}`, // Belongs to one of 2 schools
            headOfDepartment: { memberId: `FM_${index + 1}_HOD`, name: faker.person.fullName(), email: faker.internet.email() },
            facultyCount: 0, // Will be updated later
            totalStudentsEnrolled: faker.number.int({ min: 100, max: 500 }),
            numberOfCoursesOffered: faker.number.int({ min: 15, max: 40 }),
            numberOfPrograms: faker.number.int({ min: 2, max: 5 }),
            budgetAllocated: faker.number.int({ min: 500000, max: 4000000 }),
            budgetSpent: faker.number.int({ min: 400000, max: 3800000 }), // ensure less than allocated
            researchOutputScore: faker.number.int({ min: 60, max: 95 }),
            industryCollaborationScore: faker.number.int({ min: 50, max: 90 }),
          }));
        };

        const mockDepartments = createMockDepartments();
        const mockFacultyMembers: FacultyMember[] = [];

        const designations: FacultyMember['designation'][] = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'];
        const qualifications: FacultyMember['highestQualification'][] = ['PhD', 'Masters', 'PhD', 'Postdoc'];
        const genders: FacultyMember['gender'][] = ['Male', 'Female', 'Other', 'PreferNotToSay'];

        mockDepartments.forEach(dept => {
          const numFaculty = faker.number.int({ min: 8, max: 15 });
          dept.facultyCount = numFaculty; // Update faculty count in department object

          for (let i = 0; i < numFaculty; i++) {
            const dob = dayjs(faker.date.birthdate({ min: 28, max: 65, mode: 'age' }));
            // Ensure joining date is after 25 years of age and not in the future
            const minJoinYear = dob.add(25, 'year').year();
            const maxJoinYear = dayjs().year();
            const joinYear = faker.number.int({ min: minJoinYear, max: maxJoinYear });
            const doj = dayjs(faker.date.past({ years: dayjs().year() - joinYear , refDate: `${joinYear}-01-01`}));


            const coursesTaught: Array<{ courseId: string; courseName: string; credits: number; termId: string }> = [];
            const numCourses = faker.number.int({min:1, max:3});
            for(let j=0; j<numCourses; j++) {
                coursesTaught.push({
                    courseId: `${dept.departmentId.substring(0,3).toUpperCase()}${faker.number.int({min:100,max:499})}`,
                    courseName: faker.lorem.words(faker.number.int({min:2,max:4})),
                    credits: faker.helpers.arrayElement([2,3,4]),
                    termId: `FALL${dayjs().year()-1}`
                });
            }
            const teachingLoad = coursesTaught.reduce((sum,c)=>sum+c.credits,0);

            const awards = [];
            if (Math.random() < 0.2) { // 20% chance of having an award
                awards.push({
                    awardName: `${faker.lorem.words(2)} Excellence Award`,
                    year: faker.number.int({min: dayjs().year() -10, max: dayjs().year()-1}),
                    awardedBy: faker.company.name()
                });
            }

            const isAdvisor = faker.datatype.boolean(0.7); // 70% are advisors

            mockFacultyMembers.push({
              memberId: `FM_${dept.departmentId}_${i}`,
              name: faker.person.fullName(),
              departmentId: dept.departmentId,
              departmentName: dept.departmentName,
              designation: faker.helpers.arrayElement(designations),
              email: faker.internet.email(),
              expertiseAreas: faker.helpers.arrayElements(Array.from({length:10}, () => faker.lorem.words(2)), faker.number.int({min:1,max:4})),
              dateOfBirth: dob.format('YYYY-MM-DD'),
              age: dayjs().diff(dob, 'year'),
              gender: faker.helpers.arrayElement(genders),
              highestQualification: faker.helpers.arrayElement(qualifications),
              dateOfJoining: doj.format('YYYY-MM-DD'),
              yearsOfService: dayjs().diff(doj, 'year'),
              publicationsCount: faker.number.int({ min: 0, max: 75 }),
              isAdvisor: isAdvisor,
              adviseeCount: isAdvisor ? faker.number.int({ min: 3, max: 12 }) : 0,
              coursesTaughtLastAcademicYear: coursesTaught,
              teachingLoadCredits: teachingLoad,
              studentFeedbackAvgRating: parseFloat(faker.number.float({ min: 3.0, max: 4.9, precision: 1 }).toFixed(1)),
              totalGrantAmount: faker.datatype.boolean(0.4) ? faker.number.int({ min: 5000, max: 250000 }) : 0,
              awardsAndRecognitions: awards,
              // Optional fields can be added if needed: phoneNumber, officeLocation, profileUrl
            });
          }
        });

        // Calculate stats based on generated mock data
        const calculatedStats: DepartmentFacultyStats = {
            totalDepartments: mockDepartments.length,
            totalFaculty: mockFacultyMembers.length,
            // avgFacultyStudentRatio: Calculate if needed, requires total students for the whole institution
        };

        setDeptFacultyData({
          message: t('errors.mockDataActiveDeptFaculty', "Mock data active for Department & Faculty due to API failure."),
          departments: mockDepartments,
          facultyMembers: mockFacultyMembers,
          stats: calculatedStats,
          // programs: can be left undefined or mocked minimally if not directly used by top-level stats
        });
      } finally {
        setLoading(false);
      }
    };

    loadDeptFacultyData();
  }, [filters.academicYear, filters.institutionId]); // Added global filters as dependencies

  // --- Department Overview Data ---
  const programsPerDepartmentData = React.useMemo(() => {
    if (!deptFacultyData?.departments) return [];
    return deptFacultyData.departments.map(d => ({
      departmentName: d.departmentName,
      count: d.numberOfPrograms || 0,
    })).filter(d => d.count > 0).sort((a,b) => b.count - a.count);
  }, [deptFacultyData?.departments]);

  const coursesPerDepartmentData = React.useMemo(() => {
    if (!deptFacultyData?.departments) return [];
    return deptFacultyData.departments.map(d => ({
      departmentName: d.departmentName,
      count: d.numberOfCoursesOffered || 0,
    })).filter(d => d.count > 0).sort((a,b) => b.count - a.count);
  }, [deptFacultyData?.departments]);

  const studentEnrollmentPerDeptData = React.useMemo(() => {
    if (!deptFacultyData?.departments) return [];
    return deptFacultyData.departments.map(d => ({
      departmentName: d.departmentName,
      count: d.totalStudentsEnrolled || 0,
    })).filter(d => d.count > 0).sort((a,b) => b.count - a.count);
  }, [deptFacultyData?.departments]);

  // --- Faculty Demographics Data ---
  const facultyByAgeGroupData = React.useMemo(() => {
    if (!deptFacultyData?.facultyMembers) return [];
    const ageBuckets: Record<string, number> = {
      [t('common.ageBucketsFaculty.lt30', "< 30")]:0, [t('common.ageBucketsFaculty.30_39', "30-39")]:0,
      [t('common.ageBucketsFaculty.40_49', "40-49")]:0, [t('common.ageBucketsFaculty.50_59', "50-59")]:0,
      [t('common.ageBucketsFaculty.gte60', "60+")]:0, [t('common.unknown', 'Unknown')]:0,
    };
    deptFacultyData.facultyMembers.forEach(fm => {
      const age = fm.age;
      if (age === undefined || age === null) ageBuckets[t('common.unknown', 'Unknown')]++;
      else if (age < 30) ageBuckets[t('common.ageBucketsFaculty.lt30', "< 30")]++;
      else if (age <= 39) ageBuckets[t('common.ageBucketsFaculty.30_39', "30-39")]++;
      else if (age <= 49) ageBuckets[t('common.ageBucketsFaculty.40_49', "40-49")]++;
      else if (age <= 59) ageBuckets[t('common.ageBucketsFaculty.50_59', "50-59")]++;
      else ageBuckets[t('common.ageBucketsFaculty.gte60', "60+")]++;
    });
    return Object.entries(ageBuckets).map(([ageGroup, count]) => ({ ageGroup, count })).filter(item => item.count > 0);
  }, [deptFacultyData?.facultyMembers, t]);

  const facultyByGenderData = React.useMemo(() => {
    if (!deptFacultyData?.facultyMembers) return [];
    const counts = deptFacultyData.facultyMembers.reduce((acc, fm) => {
      const gender = fm.gender || t('common.unknown', 'Unknown');
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([type, value]) => ({ type, value })).filter(item => item.value > 0);
  }, [deptFacultyData?.facultyMembers, t]);

  const facultyByHighestQualificationData = React.useMemo(() => {
    if (!deptFacultyData?.facultyMembers) return [];
    const counts = deptFacultyData.facultyMembers.reduce((acc, fm) => {
      const qual = fm.highestQualification || t('common.other', 'Other');
      acc[qual] = (acc[qual] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([qualification, count]) => ({ qualification, count })).sort((a,b)=>b.count-a.count);
  }, [deptFacultyData?.facultyMembers, t]);

  const facultyByYearsOfServiceData = React.useMemo(() => {
    if (!deptFacultyData?.facultyMembers) return [];
    const serviceBuckets: Record<string, number> = {
      [t('common.serviceYearsBuckets.lt5', "0-4 Years")]:0, [t('common.serviceYearsBuckets.5_9', "5-9 Years")]:0,
      [t('common.serviceYearsBuckets.10_14', "10-14 Years")]:0, [t('common.serviceYearsBuckets.15_19', "15-19 Years")]:0,
      [t('common.serviceYearsBuckets.gte20', "20+ Years")]:0, [t('common.unknown', 'Unknown')]:0,
    };
    deptFacultyData.facultyMembers.forEach(fm => {
      const years = fm.yearsOfService;
      if (years === undefined || years === null) serviceBuckets[t('common.unknown', 'Unknown')]++;
      else if (years < 5) serviceBuckets[t('common.serviceYearsBuckets.lt5', "0-4 Years")]++;
      else if (years <= 9) serviceBuckets[t('common.serviceYearsBuckets.5_9', "5-9 Years")]++;
      else if (years <= 14) serviceBuckets[t('common.serviceYearsBuckets.10_14', "10-14 Years")]++;
      else if (years <= 19) serviceBuckets[t('common.serviceYearsBuckets.15_19', "15-19 Years")]++;
      else serviceBuckets[t('common.serviceYearsBuckets.gte20', "20+ Years")]++;
    });
    return Object.entries(serviceBuckets).map(([serviceRange, count]) => ({ serviceRange, count })).filter(item => item.count > 0);
  }, [deptFacultyData?.facultyMembers, t]);

  // --- Faculty Workload & Allocation ---
  const studentFacultyRatioPerDeptData = React.useMemo(() => {
    if (!deptFacultyData?.departments) return [];
    return deptFacultyData.departments.map(d => ({
      departmentName: d.departmentName,
      ratio: (d.facultyCount && d.facultyCount > 0 && d.totalStudentsEnrolled) ? parseFloat((d.totalStudentsEnrolled / d.facultyCount).toFixed(1)) : 0,
    })).filter(d => d.ratio > 0).sort((a,b) => a.ratio - b.ratio);
  }, [deptFacultyData?.departments]);

  const teachingLoadDistributionData = React.useMemo(() => {
    if (!deptFacultyData?.facultyMembers) return [];
    const loadBuckets: Record<string, number> = {
      [t('module.departmentFaculty.loadBuckets.lt5', "< 5 Credits")]:0,
      [t('module.departmentFaculty.loadBuckets.5_8', "5-8 Credits")]:0,
      [t('module.departmentFaculty.loadBuckets.9_12', "9-12 Credits")]:0,
      [t('module.departmentFaculty.loadBuckets.gt12', "> 12 Credits")]:0,
      [t('common.unknown', 'Unknown')]:0,
    };
    deptFacultyData.facultyMembers.forEach(fm => {
      const load = fm.teachingLoadCredits;
      if (load === undefined || load === null) loadBuckets[t('common.unknown', 'Unknown')]++;
      else if (load < 5) loadBuckets[t('module.departmentFaculty.loadBuckets.lt5', "< 5 Credits")]++;
      else if (load <= 8) loadBuckets[t('module.departmentFaculty.loadBuckets.5_8', "5-8 Credits")]++;
      else if (load <= 12) loadBuckets[t('module.departmentFaculty.loadBuckets.9_12', "9-12 Credits")]++;
      else loadBuckets[t('module.departmentFaculty.loadBuckets.gt12', "> 12 Credits")]++;
    });
    return Object.entries(loadBuckets).map(([loadRange, count]) => ({ loadRange, count })).filter(item => item.count > 0);
  }, [deptFacultyData?.facultyMembers, t]);

  const advisoryLoadStats = React.useMemo(() => {
    if (!deptFacultyData?.facultyMembers || deptFacultyData.facultyMembers.length === 0) return { advisorPercentage: 0, avgAdviseeCount: 0, advisorDistribution: [] };
    const advisors = deptFacultyData.facultyMembers.filter(fm => fm.isAdvisor === true);
    const advisorPercentage = (advisors.length / deptFacultyData.facultyMembers.length) * 100;
    const totalAdvisees = advisors.reduce((sum, fm) => sum + (fm.adviseeCount || 0), 0);
    const avgAdviseeCount = advisors.length > 0 ? totalAdvisees / advisors.length : 0;

    const advisorDistribution = [
        {type: t('module.departmentFaculty.advisors', 'Advisors'), value: advisors.length},
        {type: t('module.departmentFaculty.nonAdvisors', 'Non-Advisors'), value: deptFacultyData.facultyMembers.length - advisors.length}
    ].filter(item => item.value > 0);

    return {
      advisorPercentage: parseFloat(advisorPercentage.toFixed(1)),
      avgAdviseeCount: parseFloat(avgAdviseeCount.toFixed(1)),
      advisorDistribution
    };
  }, [deptFacultyData?.facultyMembers, t]);

  // --- Faculty Performance & Recognition ---
  const topFacultyByFeedbackData = React.useMemo(() => {
    if (!deptFacultyData?.facultyMembers) return [];
    return deptFacultyData.facultyMembers
      .filter(fm => fm.studentFeedbackAvgRating !== undefined && fm.studentFeedbackAvgRating !== null)
      .map(fm => ({ name: fm.name, rating: fm.studentFeedbackAvgRating! , departmentName: fm.departmentName}))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10); // Top 10
  }, [deptFacultyData?.facultyMembers]);

  const researchGrantsPerDeptData = React.useMemo(() => {
    if (!deptFacultyData?.departments || !deptFacultyData?.facultyMembers) return [];
    const deptGrants: Record<string, number> = {};
    deptFacultyData.facultyMembers.forEach(fm => {
      if (fm.departmentId && fm.totalGrantAmount) {
        const dept = deptFacultyData.departments!.find(d => d.departmentId === fm.departmentId);
        if (dept) {
           const deptName = dept.departmentName || dept.departmentId;
           deptGrants[deptName] = (deptGrants[deptName] || 0) + fm.totalGrantAmount;
        }
      }
    });
    return Object.entries(deptGrants).map(([departmentName, totalGrants]) => ({ departmentName, totalGrants }))
       .filter(item => item.totalGrants > 0)
       .sort((a,b) => b.totalGrants - a.totalGrants);
  }, [deptFacultyData?.departments, deptFacultyData?.facultyMembers]);

  const recentAwardsData = React.useMemo(() => {
       if (!deptFacultyData?.facultyMembers) return [];
       return deptFacultyData.facultyMembers.flatMap(fm =>
           (fm.awardsAndRecognitions || []).map(award => ({
               facultyName: fm.name,
               departmentName: fm.departmentName,
               awardName: award.awardName,
               year: award.year,
               awardedBy: award.awardedBy
           }))
       ).sort((a,b) => b.year - a.year).slice(0,10);
  }, [deptFacultyData?.facultyMembers]);

  // --- Faculty Specialization & Expertise ---
  const topNExpertiseAreas = 10;
  const facultyByExpertiseData = React.useMemo(() => {
    if (!deptFacultyData?.facultyMembers) return [];
    const expertiseCounts: Record<string, number> = {};
    deptFacultyData.facultyMembers.forEach(fm => {
      (fm.expertiseAreas || []).forEach(area => {
        expertiseCounts[area] = (expertiseCounts[area] || 0) + 1;
      });
    });
    return Object.entries(expertiseCounts)
       .map(([expertise, count]) => ({ expertise, count }))
       .sort((a, b) => b.count - a.count)
       .slice(0, topNExpertiseAreas);
  }, [deptFacultyData?.facultyMembers]);


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

        {deptFacultyData?.message && (
          <Paragraph style={{ marginTop: '10px', fontStyle: 'italic' }}>{deptFacultyData.message}</Paragraph>
        )}

        {!loading && !error && deptFacultyData && (
          <>
            {deptFacultyData.stats && (
              <Card title={t(`module.${MODULE_KEY}.statsTitle`, "Overall Statistics")} style={{ marginBottom: 20 }}>
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label={t(`module.${MODULE_KEY}.totalDepartments`, "Total Departments")}>
                    {deptFacultyData.stats.totalDepartments ?? t('common.notAvailable', 'N/A')}
                  </Descriptions.Item>
                  <Descriptions.Item label={t(`module.${MODULE_KEY}.totalFaculty`, "Total Faculty Members")}>
                    {deptFacultyData.stats.totalFaculty ?? t('common.notAvailable', 'N/A')}
                  </Descriptions.Item>
                  {/* Add more stats as they become available */}
                </Descriptions>
              </Card>
            )}

            {/* Charts Section */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20, marginTop: 20 }}>
              {/* Faculty by Designation Pie Chart */}
              {deptFacultyData.facultyMembers && deptFacultyData.facultyMembers.length > 0 && (
                <Col xs={24} md={12}>
                  <Card title={<><PieChartOutlined /> {t(`module.${MODULE_KEY}.facultyByDesignationChartTitle`, "Faculty by Designation")}</>}>
                    <Pie
                      data={deptFacultyData.facultyMembers.reduce((acc, member) => {
                        const status = member.designation || t('common.unknown', 'Unknown');
                        const existing = acc.find(i => i.type === status);
                        if (existing) {
                          existing.value += 1;
                        } else {
                          acc.push({ type: status, value: 1 });
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
                          formatter: (datum) => ({ name: datum.type, value: datum.value + ' ' + t('common.members', 'members') }),
                      }}
                    />
                  </Card>
                </Col>
              )}

              {/* Faculty Count by Department Bar Chart */}
              {deptFacultyData.departments && deptFacultyData.departments.length > 0 && (
                <Col xs={24} md={12}>
                  <Card title={<><BarChartOutlined /> {t(`module.${MODULE_KEY}.facultyByDeptChartTitle`, "Faculty Count by Department")}</>}>
                    <Column
                      data={deptFacultyData.departments.map(dept => ({
                        departmentName: dept.departmentName,
                        facultyCount: dept.facultyCount || 0,
                      }))}
                      xField="departmentName"
                      yField="facultyCount"
                      seriesField="departmentName" // Optional: if you want different colors per department
                      legend={false} // Or configure as needed if seriesField is used meaningfully
                      label={{
                        position: 'middle', // Or 'top', 'bottom', 'left', 'right'
                        style: { fill: '#FFFFFF', opacity: 0.6 },
                      }}
                      xAxis={{ title: { text: t('module.academics.departmentName', "Department") } }}
                      yAxis={{ title: { text: t('module.academics.facultyCount', "Faculty Count") } }}
                      tooltip={{
                        formatter: (datum) => ({ name: datum.departmentName, value: datum.facultyCount + ' ' + t('common.facultyMembers', 'faculty members') }),
                      }}
                    />
                  </Card>
                </Col>
              )}
            </Row>

            {/* Department Structure & Enrollment Section */}
            <Title level={4} style={{ marginTop: '30px' }}>{t('module.departmentFaculty.deptStructureTitle', "Department Structure & Enrollment")}</Title>
            <Row gutter={[16, 16]} style={{ marginTop: '10px' }}>
              <Col xs={24} md={12} lg={8}>
                <Card title={t('module.departmentFaculty.programsPerDeptTitle', "Programs per Department")}>
                  {programsPerDepartmentData.length > 0 ? (
                    <Column data={programsPerDepartmentData} xField="departmentName" yField="count" seriesField="departmentName" legend={false}
                            label={{position:'top'}} yAxis={{title:{text:t('common.numberOfPrograms',"No. of Programs")}}}
                            xAxis={{label:{rotate:programsPerDepartmentData.length > 2 ? 30:0, autoEllipsis:true}}}/>
                  ) : <Empty />}
                </Card>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Card title={t('module.departmentFaculty.coursesPerDeptTitle', "Courses Offered per Department")}>
                  {coursesPerDepartmentData.length > 0 ? (
                    <Column data={coursesPerDepartmentData} xField="departmentName" yField="count" seriesField="departmentName" legend={false}
                            label={{position:'top'}} yAxis={{title:{text:t('common.numberOfCourses',"No. of Courses")}}}
                            xAxis={{label:{rotate:coursesPerDepartmentData.length > 2 ? 30:0, autoEllipsis:true}}}/>
                  ) : <Empty />}
                </Card>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Card title={t('module.departmentFaculty.enrollmentPerDeptTitle', "Student Enrollment per Department")}>
                  {studentEnrollmentPerDeptData.length > 0 ? (
                    <Column data={studentEnrollmentPerDeptData} xField="departmentName" yField="count" seriesField="departmentName" legend={false}
                            label={{position:'top'}} yAxis={{title:{text:t('common.numberOfStudents',"No. of Students")}}}
                            xAxis={{label:{rotate:studentEnrollmentPerDeptData.length > 2 ? 30:0, autoEllipsis:true}}}/>
                  ) : <Empty />}
                </Card>
              </Col>
            </Row>

            {/* Faculty Demographics Section */}
            <Title level={4} style={{ marginTop: '30px' }}>{t('module.departmentFaculty.facultyDemographicsTitle', "Faculty Demographics")}</Title>
            <Row gutter={[16, 16]} style={{ marginTop: '10px' }}>
              <Col xs={24} md={12} lg={6}>
                <Card title={t('module.departmentFaculty.facultyGenderTitle', "Faculty by Gender")}>
                  {facultyByGenderData.length > 0 ? (
                    <Pie data={facultyByGenderData} angleField="value" colorField="type" radius={0.8} legend={{position:'bottom'}}
                         label={{type:'inner', offset:'-30%', content:'{percentage}', style:{fill:'#fff'}}}
                         tooltip={{formatter:(d)=>({name:d.type, value:`${d.value} (${(d.percent * 100).toFixed(1)}%)`})}} />
                  ) : <Empty />}
                </Card>
              </Col>
              <Col xs={24} md={12} lg={9}>
                <Card title={t('module.departmentFaculty.facultyAgeGroupTitle', "Faculty by Age Group")}>
                  {facultyByAgeGroupData.length > 0 ? (
                    <Column data={facultyByAgeGroupData} xField="ageGroup" yField="count" seriesField="ageGroup" legend={false}
                            label={{position:'top'}} yAxis={{title:{text:t('common.numberOfFaculty',"No. of Faculty")}}}/>
                  ) : <Empty />}
                </Card>
              </Col>
              <Col xs={24} md={12} lg={9}>
                <Card title={t('module.departmentFaculty.facultyQualificationTitle', "Faculty by Highest Qualification")}>
                  {facultyByHighestQualificationData.length > 0 ? (
                    <Bar data={facultyByHighestQualificationData} xField="count" yField="qualification" seriesField="qualification" legend={false}
                         barWidthRatio={0.6} yAxis={{label:{autoEllipsis:true}}} xAxis={{title:{text:t('common.numberOfFaculty',"No. of Faculty")}}}/>
                  ) : <Empty />}
                </Card>
              </Col>
             </Row>
             <Row gutter={[16,16]} style={{marginTop: '20px'}}>
               <Col xs={24} md={12} lg={12}>
                <Card title={t('module.departmentFaculty.facultyServiceYearsTitle', "Faculty by Years of Service")}>
                  {facultyByYearsOfServiceData.length > 0 ? (
                    <Column data={facultyByYearsOfServiceData} xField="serviceRange" yField="count" seriesField="serviceRange" legend={false}
                            label={{position:'top'}} yAxis={{title:{text:t('common.numberOfFaculty',"No. of Faculty")}}}/>
                  ) : <Empty />}
                </Card>
              </Col>
            </Row>

            {/* Faculty Workload & Allocation Section */}
            <Title level={4} style={{ marginTop: '30px' }}>{t('module.departmentFaculty.facultyWorkloadAllocTitle', "Faculty Workload & Allocation")}</Title>
            <Row gutter={[16, 16]} style={{ marginTop: '10px' }}>
              <Col xs={24} md={12} lg={8}>
                <Card title={t('module.departmentFaculty.studFacRatioDeptTitle', "Student-to-Faculty Ratio per Dept.")}>
                  {studentFacultyRatioPerDeptData.length > 0 ? (
                    <Column data={studentFacultyRatioPerDeptData} xField="departmentName" yField="ratio" seriesField="departmentName" legend={false}
                            label={{position:'top'}} yAxis={{title:{text:t('common.ratio', "Ratio (Students/Faculty)")}}}
                            xAxis={{label:{rotate:studentFacultyRatioPerDeptData.length > 2 ? 30:0, autoEllipsis:true}}}/>
                  ) : <Empty />}
                </Card>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Card title={t('module.departmentFaculty.teachingLoadDistTitle', "Teaching Load Distribution (Credits)")}>
                  {teachingLoadDistributionData.length > 0 ? (
                    <Column data={teachingLoadDistributionData} xField="loadRange" yField="count" seriesField="loadRange" legend={false}
                            label={{position:'top'}} yAxis={{title:{text:t('common.numberOfFaculty',"No. of Faculty")}}}/>
                  ) : <Empty />}
                </Card>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Card title={t('module.departmentFaculty.advisoryLoadTitle', "Advisory Load")}>
                   <Row gutter={8}>
                     <Col span={12}><Statistic title={t('module.departmentFaculty.advisorPercentage', "% Faculty as Advisors")} value={advisoryLoadStats.advisorPercentage} suffix="%" precision={1} /></Col>
                     <Col span={12}><Statistic title={t('module.departmentFaculty.avgAdviseeCount', "Avg. Advisees per Advisor")} value={advisoryLoadStats.avgAdviseeCount} precision={1} /></Col>
                   </Row>
                  {advisoryLoadStats.advisorDistribution.length > 0 ? (
                    <Pie data={advisoryLoadStats.advisorDistribution} angleField="value" colorField="type" radius={0.7} legend={{position:'bottom'}}
                         innerRadius={0.5} label={{type:'inner', offset:'-50%', content:'{value}', style:{fill:'#fff'}}} />
                  ) : <Empty />}
                </Card>
              </Col>
            </Row>

            {/* Faculty Performance & Recognition Section */}
            <Title level={4} style={{ marginTop: '30px' }}>{t('module.departmentFaculty.facultyPerfRecogTitle', "Faculty Performance & Recognition")}</Title>
            <Row gutter={[16, 16]} style={{ marginTop: '10px' }}>
              <Col xs={24} lg={12}>
                <Card title={t('module.departmentFaculty.topFacultyFeedbackTitle', "Top 10 Faculty by Student Feedback")}>
                  {topFacultyByFeedbackData.length > 0 ? (
                    <Bar data={topFacultyByFeedbackData} xField="rating" yField="name" seriesField="name" legend={false}
                         barWidthRatio={0.6} xAxis={{title:{text:t('common.avgRating',"Avg. Rating (1-5)")}, min:0, max:5}}
                         yAxis={{label:{autoEllipsis:true}}} tooltip={{formatter:(d)=>({name:d.name, value:`${d.rating}/5 (${d.departmentName || ''})`})}}/>
                  ) : <Empty />}
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title={t('module.departmentFaculty.researchGrantsDeptTitle', "Research Grants per Department")}>
                  {researchGrantsPerDeptData.length > 0 ? (
                    <Column data={researchGrantsPerDeptData} xField="departmentName" yField="totalGrants" seriesField="departmentName" legend={false}
                            label={{position:'top', formatter:(d)=>`$${(d.totalGrants/1000).toFixed(0)}k`}}
                            yAxis={{title:{text:t('common.totalGrantAmount',"Total Grant Amount ($)")}, label:{formatter:(v)=>`$${Number(v/1000000).toFixed(1)}M`}}}
                            xAxis={{label:{rotate:researchGrantsPerDeptData.length > 2 ? 30:0, autoEllipsis:true}}}/>
                  ) : <Empty />}
                </Card>
              </Col>
             </Row>
             <Row style={{marginTop:'20px'}}>
                 <Col span={24}>
                     <Card title={t('module.departmentFaculty.recentAwardsTitle', "Recent Faculty Awards & Recognitions (Top 10)")}>
                         {recentAwardsData.length > 0 ? (
                             <Table dataSource={recentAwardsData} pagination={{pageSize:5, size:'small'}} size="small" scroll={{x:'max-content'}}
                                 columns={[
                                     {title: t('common.facultyName','Faculty Name'), dataIndex:'facultyName', key:'fname', ellipsis:true},
                                     {title: t('common.department','Department'), dataIndex:'departmentName', key:'dname', ellipsis:true},
                                     {title: t('common.award','Award'), dataIndex:'awardName', key:'aname', ellipsis:true},
                                     {title: t('common.year','Year'), dataIndex:'year', key:'year', align:'center'},
                                     {title: t('common.awardedBy','Awarded By'), dataIndex:'awardedBy', key:'aby', ellipsis:true},
                                 ]} rowKey={(r,i)=>`${r.facultyName}-${r.awardName}-${i}`} />
                         ) : <Empty description={t('common.noAwardsData', "No recent awards data available.")} />}
                     </Card>
                 </Col>
             </Row>

            {/* Faculty Specialization & Expertise Section */}
            <Title level={4} style={{ marginTop: '30px' }}>{t('module.departmentFaculty.facultyExpertiseTitle', "Faculty Specialization & Expertise")}</Title>
            <Row gutter={[16, 16]} style={{ marginTop: '10px' }}>
              <Col span={24}> {/* Full width for this one */}
                <Card title={t('module.departmentFaculty.topExpertiseAreasTitle', "Top {n} Faculty Expertise Areas", {n:topNExpertiseAreas})}>
                  {facultyByExpertiseData.length > 0 ? (
                    <Bar data={facultyByExpertiseData} xField="count" yField="expertise" seriesField="expertise" legend={false}
                         barWidthRatio={0.7} yAxis={{label:{autoEllipsis:true}}} xAxis={{title:{text:t('common.numberOfFaculty',"No. of Faculty with this Expertise")}}}/>
                  ) : <Empty />}
                </Card>
              </Col>
            </Row>

            {/* Existing Tables - ensure they are still relevant or update/remove */}
            {deptFacultyData.departments && deptFacultyData.departments.length > 0 && (
              <Card title={t(`module.${MODULE_KEY}.departmentsListTitle`, "Departments")} style={{ marginBottom: 20, marginTop:30 }}>
                <List
                  itemLayout="horizontal"
                  dataSource={deptFacultyData.departments}
                  renderItem={dept => (
                    <List.Item>
                      <List.Item.Meta
                        title={dept.departmentName}
                        description={`${t('module.academics.headOfDepartment', "HOD")}: ${dept.headOfDepartment?.name || t('common.notAssigned', 'Not Assigned')}, ${t('module.academics.facultyCount', "Faculty")}: ${dept.facultyCount || 0}, ${t('module.academics.studentCount', "Students")}: ${dept.studentCount || 0}`}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {deptFacultyData.facultyMembers && deptFacultyData.facultyMembers.length > 0 && (
              <Card title={t(`module.${MODULE_KEY}.facultyListTitle`, "Faculty Members")}>
                <Table
                  dataSource={deptFacultyData.facultyMembers}
                  columns={[
                    { title: t('module.academics.facultyName', "Name"), dataIndex: 'name', key: 'name' },
                    { title: t('module.academics.departmentName', "Department"), dataIndex: 'departmentId', key: 'departmentId', render: (deptId) => deptFacultyData.departments?.find(d => d.departmentId === deptId)?.departmentName || deptId },
                    { title: t('module.academics.designation', "Designation"), dataIndex: 'designation', key: 'designation' },
                    { title: t('module.academics.expertiseAreas', "Expertise Areas"), dataIndex: 'expertiseAreas', key: 'expertiseAreas', render: (areas: string[]) => areas?.join(', ') },
                  ]}
                  rowKey="memberId"
                  pagination={{ pageSize: 5 }}
                />
              </Card>
            )}
          </>
        )}
        {!loading && !error && !deptFacultyData?.departments && !deptFacultyData?.facultyMembers && !deptFacultyData?.stats && !deptFacultyData?.message && (
          <Paragraph>{t('common.noDataAvailable', "No department or faculty data available.")}</Paragraph>
        )}
      </div>
    </div>
  );
};

export default DepartmentFacultyModule;
