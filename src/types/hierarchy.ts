import { Term, CourseEnrollment, StudentAcademicRecord } from '../components/StudentPerformanceDashboard/types';
import { PlacementRecord } from './placement';
import {
    ReEvaluationRequest, GrievanceTicket,
    ComplianceItem, AccreditationStatusSummary, AccreditingBody,
    FacultyMember, FacultyEvaluation, LmsActivity, ResearchProject // Added ResearchProject
} from './academics';
import { Department } from './departments';
import { Alumnus, AlumniActivity } from './alumni';

export type { Department } from './departments';
export type { Term, CourseEnrollment, StudentAcademicRecord } from '../components/StudentPerformanceDashboard/types';
export type {
    ReEvaluationRequest, GrievanceTicket,
    ComplianceItem, AccreditationStatusSummary, AccreditingBody,
    FacultyMember, FacultyEvaluation, LmsActivity, ResearchProject
} from './academics';

export interface StudentSummary {
  studentId: string;
  firstName: string;
  lastName: string;
  programId: string;
  programName: string;
  cumulativeGPA?: number;
  totalCreditsEarned?: number;
  enrollmentStatus?: 'Active' | 'Inactive' | 'Graduated';
  expectedGraduationDate?: string;
}

export interface Semester extends Term {
  students: StudentSummary[];
  averageGPA?: number;
  passRate?: number;
  // New KPIs for Semester
  attendancePercentage?: number;
  totalAbsences?: number;
  feesPaidPercentage?: number;
  studentsWithOverdueFees?: number;
}

export interface Program {
  programId: string;
  programName: string;
  degreeId: string; // This might become optional or change if a Program is primarily linked to a Department
  departmentId?: string; // Program now belongs to a department
  requiredCredits?: number;
  semesters: Semester[];
  totalStudents?: number;
  averageProgramGPA?: number;
  graduationRate?: number;
  // New KPIs for Program
  avgAttendancePercentage?: number;
  totalProgramAbsences?: number;
  avgFeesPaidPercentage?: number;
  totalStudentsWithOverdueFees?: number;
  applicants?: number;
  acceptanceRate?: number;
  enrolledCount?: number;
  gradeDistribution?: { [gradeCategory: string]: number };
  atRiskStudents?: number;
  placementRate?: number;
  averagePackage?: number;
  totalPlacedStudents?: number;
  totalInternships?: number;
  programPassRate?: number; // Percentage of students in the program with GPA >= 2.0
}

export interface Degree {
  degreeId: string;
  degreeName: string;
  programs: Program[];
  totalStudents?: number;
  averageDegreeGPA?: number;
  // New KPIs for Degree (Aggregated from Programs)
  avgAttendancePercentage?: number;
  totalDegreeAbsences?: number;
  avgFeesPaidPercentage?: number;
  totalStudentsWithOverdueFeesInDegree?: number;
  totalApplicants?: number;
  avgAcceptanceRate?: number;
  totalEnrolledCount?: number;
  overallGradeDistribution?: { [gradeCategory: string]: number };
  totalAtRiskStudents?: number;
  placementRate?: number;
  averagePackage?: number;
  totalPlacedStudents?: number;
  totalInternships?: number;
}

export interface AcademicYear {
  yearId: string;
  yearName: string;
  startDate: string;
  endDate: string;
  degrees: Degree[];
  totalStudents?: number;
  overallAverageGPA?: number;
  // New KPIs for AcademicYear (Aggregated from Degrees)
  annualAttendancePercentage?: number;
  totalAnnualAbsences?: number;
  annualFeesPaidPercentage?: number;
  totalStudentsWithOverdueFeesInYear?: number;
  totalAnnualApplicants?: number;
  avgAnnualAcceptanceRate?: number;
  totalAnnualEnrolledCount?: number;
  annualGradeDistribution?: { [gradeCategory: string]: number };
  totalAnnualAtRiskStudents?: number;
  placementRate?: number;
  averagePackage?: number;
  totalPlacedStudents?: number;
  totalInternships?: number;
}

export interface Institution {
  institutionId: string;
  institutionName: string;
  academicYears: AcademicYear[];
  totalStudents?: number;
  overallAverageGPA?: number;
  // New KPIs for Institution (Aggregated from AcademicYears)
  institutionAttendancePercentage?: number;
  totalInstitutionAbsences?: number;
  institutionFeesPaidPercentage?: number;
  totalStudentsWithOverdueFeesInInstitution?: number;
  totalInstitutionApplicants?: number;
  avgInstitutionAcceptanceRate?: number;
  totalInstitutionEnrolledCount?: number;
  institutionGradeDistribution?: { [gradeCategory: string]: number };
  totalInstitutionAtRiskStudents?: number;
  overallPlacementRate?: number;
  overallAveragePackage?: number;
  overallTotalPlacedStudents?: number;
  overallTotalInternships?: number;
  pendingReEvaluationsCount?: number;
  totalReEvaluationsLastMonth?: number;
  departments?: Department[]; // Institution has a list of departments
  openGrievancesCount?: number;
  avgGrievanceResolutionTimeDays?: number;
  overallCompliancePercentage?: number;
  pendingComplianceItemsCount?: number;
  nextAccreditationReviewDate?: string;
  accreditationBody?: AccreditingBody;
  complianceItems?: ComplianceItem[];
  accreditationStatuses?: AccreditationStatusSummary[];
  avgFacultyRating?: number;
  facultyEvaluationResponseRate?: number;
  facultyMembers?: FacultyMember[];
  facultyEvaluations?: FacultyEvaluation[];
  // LMS Engagement Metrics
  lmsLoginsLast30Days?: number;
  lmsResourceDownloadsLast30Days?: number;
  lmsForumPostsLast30Days?: number;
  lmsActivities?: LmsActivity[]; // Optional: to store all raw activities for the institution
  // Alumni and Enhanced Placement Metrics
  alumni?: Alumnus[];
  alumniActivities?: AlumniActivity[];
  alumniEngagementScore?: number; // A calculated score e.g. 0-100
  overallInternshipRate?: number;
  totalCampusCompanies?: number;
  allPlacementRecords?: PlacementRecord[]; // Add all placement records for detailed analysis
  // Faculty & Research Metrics
  allResearchProjects?: ResearchProject[];
  avgTeachingHoursDelivered?: number;
  overallCourseCompletionRate?: number;
  totalActiveResearchProjects?: number;
  // Grievance Metrics
  allGrievanceTickets?: GrievanceTicket[];
  grievanceCSAT?: number; // Percentage
  sentimentDistribution?: { positive: number; neutral: number; negative: number; total: number };
}
