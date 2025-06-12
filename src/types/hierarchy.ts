import { Term, CourseEnrollment, StudentAcademicRecord } from '../components/StudentPerformanceDashboard/types'; // StudentAcademicRecord might be used by StudentSummary or similar
import { PlacementRecord } from './placement';
import {
    ReEvaluationRequest, GrievanceTicket,
    ComplianceItem, AccreditationStatusSummary, AccreditingBody,
    FacultyMember, FacultyEvaluation, LmsActivity, ResearchProject
} from './academics';
import { Department } from './departments'; // Will use the updated Department definition
import { Alumnus, AlumniActivity } from './alumni';

// Forward declaration for types used by ParentInstitution
export type { Term, CourseEnrollment, StudentAcademicRecord } from '../components/StudentPerformanceDashboard/types';
export type { Department } from './departments';
export type {
    ReEvaluationRequest, GrievanceTicket,
    ComplianceItem, AccreditationStatusSummary, AccreditingBody,
    FacultyMember, FacultyEvaluation, LmsActivity, ResearchProject
} from './academics';

// New Type: ParentInstitution
export interface ParentInstitution {
  parentInstitutionId: string;
  parentInstitutionName: string;
  institutions: Institution[];
  totalStudents?: number;
  overallAverageGPA?: number;
  // Add other aggregated KPIs as needed
  totalFaculty?: number;
  totalPrograms?: number;
  overallPlacementRate?: number;
  totalResearchGrantsValue?: number;
}

// New Type: Faculty
export interface Faculty {
  facultyId: string;
  facultyName: string;
  institutionId: string;
  departments: Department[];
  totalStudents?: number;
  averageFacultyGPA?: number;
  totalFacultyMembers?: number;
  researchProjectsCount?: number;
}

// New Type: Course
export interface Course {
  courseId: string;
  courseName: string;
  semesterId: string; // or termId
  sections: Section[];
  courseCode?: string;
  credits?: number;
  averageGrade?: number;
  passRate?: number;
  totalStudentsEnrolled?: number;
  facultyCoordinatorId?: string; // Optional: Link to a faculty member
}

// New Type: Section
export interface Section {
  sectionId: string;
  sectionName: string; // e.g., "Section A", "Batch 1"
  courseId: string;
  instructorName?: string; // Could be instructorId linking to FacultyMember
  schedule?: string; // e.g., "Mon/Wed/Fri 9-10 AM"
  students: StudentSummary[]; // List of students in this section
  averageAttendance?: number;
  studentCount?: number;
  classroom?: string; // Optional: Classroom location
}

export interface StudentSummary {
  studentId: string;
  firstName: string;
  lastName: string;
  programName?: string;
  // programId: string; // Student might not be directly tied to a single program in this summary view
  // programName: string; // Student might be in multiple sections of different courses
  cumulativeGPA?: number;
  totalCreditsEarned?: number;
  enrollmentStatus?: 'Active' | 'Inactive' | 'Graduated';
  expectedGraduationDate?: string;
  // sectionId?: string; // If a student summary is specific to a section
}

export interface Semester {
  semesterId: string; // Added semesterId as Term is removed
  semesterName: string; // Added semesterName as Term is removed
  startDate: string; // Added startDate as Term is removed
  endDate: string; // Added endDate as Term is removed
  students?: StudentSummary[];
  courses: Course[]; // Semester now has Courses
  averageGPA?: number;
  passRate?: number;
  // New KPIs for Semester
  attendancePercentage?: number;
  totalAbsences?: number;
  feesPaidPercentage?: number;
  studentsWithOverdueFees?: number;
  totalCoursesOffered?: number;
}

export interface Program {
  programId: string;
  programName: string;
  degreeId: string;
  departmentId?: string;
  // departmentId?: string; // Removed, Program is under Degree which is under Department
  requiredCredits?: number;
  semesters: Semester[]; // Program still has Semesters
  totalStudents?: number;
  averageProgramGPA?: number;
  graduationRate?: number;
  avgAttendancePercentage?: number;
  totalProgramAbsences?: number;
  avgFeesPaidPercentage?: number;
  totalStudentsWithOverdueFees?: number;
  // KPIs for Program
  // avgAttendancePercentage?: number; // Attendance is more granular (Course/Section/Student)
  // totalProgramAbsences?: number; // Attendance is more granular
  // avgFeesPaidPercentage?: number; // Fees might be tracked differently
  // totalStudentsWithOverdueFees?: number; // Fees might be tracked differently
  applicants?: number;
  acceptanceRate?: number;
  enrolledCount?: number;
  gradeDistribution?: { [gradeCategory: string]: number }; // Could be aggregated from courses
  atRiskStudents?: number; // Could be identified based on course performance
  placementRate?: number;
  averagePackage?: number;
  totalPlacedStudents?: number;
  totalInternships?: number;
  programPassRate?: number; // Percentage of students in the program with GPA >= 2.0 (or relevant pass criteria)
}

export interface Degree {
  degreeId: string;
  degreeName: string;
  departmentId: string; // Degree is under a Department
  programs: Program[];
  totalStudents?: number;
  averageDegreeGPA?: number;
  avgAttendancePercentage?: number;
  totalDegreeAbsences?: number;
  avgFeesPaidPercentage?: number;
  totalStudentsWithOverdueFeesInDegree?: number;
  // KPIs for Degree (Aggregated from Programs)
  // avgAttendancePercentage?: number; // More granular
  // totalDegreeAbsences?: number; // More granular
  // avgFeesPaidPercentage?: number; // Potentially
  // totalStudentsWithOverdueFeesInDegree?: number; // Potentially
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
  degrees: Degree[]; // This remains, assuming AcademicYear is a temporal slice across degrees
  totalStudents?: number;
  overallAverageGPA?: number;
  annualAttendancePercentage?: number;
  totalAnnualAbsences?: number;
  annualFeesPaidPercentage?: number;
  totalStudentsWithOverdueFeesInYear?: number;
  // KPIs for AcademicYear (Aggregated from Degrees)
  // annualAttendancePercentage?: number;
  // totalAnnualAbsences?: number;
  // annualFeesPaidPercentage?: number;
  // totalStudentsWithOverdueFeesInYear?: number;
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
  parentInstitutionId?: string; // Optional: Link to parent system
  academicYears: AcademicYear[]; // This might change if Faculties become the primary container under Institution
  faculties: Faculty[]; // Changed from departments
  totalStudents?: number;
  overallAverageGPA?: number;
  institutionAttendancePercentage?: number;
  totalInstitutionAbsences?: number;
  institutionFeesPaidPercentage?: number;
  totalStudentsWithOverdueFeesInInstitution?: number;
  // KPIs for Institution (Aggregated)
  // institutionAttendancePercentage?: number;
  // totalInstitutionAbsences?: number;
  // institutionFeesPaidPercentage?: number;
  // totalStudentsWithOverdueFeesInInstitution?: number;
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
  // departments?: Department[]; // Replaced by faculties
  openGrievancesCount?: number;
  avgGrievanceResolutionTimeDays?: number;
  overallCompliancePercentage?: number;
  pendingComplianceItemsCount?: number;
  nextAccreditationReviewDate?: string;
  accreditationBody?: AccreditingBody; // Consider if this should be at ParentInstitution level too
  complianceItems?: ComplianceItem[];
  accreditationStatuses?: AccreditationStatusSummary[];
  avgFacultyRating?: number; // This might be better aggregated at Faculty level
  facultyEvaluationResponseRate?: number; // Or Faculty level
  facultyMembers?: FacultyMember[]; // Could be linked at Faculty/Department level primarily
  facultyEvaluations?: FacultyEvaluation[]; // Or Faculty level
  // LMS Engagement Metrics (Potentially aggregated or specific to institution services)
  lmsLoginsLast30Days?: number;
  lmsResourceDownloadsLast30Days?: number;
  lmsForumPostsLast30Days?: number;
  lmsActivities?: LmsActivity[];
  // Alumni and Enhanced Placement Metrics
  alumni?: Alumnus[];
  alumniActivities?: AlumniActivity[];
  alumniEngagementScore?: number;
  overallInternshipRate?: number;
  totalCampusCompanies?: number;
  allPlacementRecords?: PlacementRecord[];
  // Faculty & Research Metrics (some might move to Faculty/Department)
  allResearchProjects?: ResearchProject[]; // Aggregated
  // avgTeachingHoursDelivered?: number; // Better at Faculty/Department
  overallCourseCompletionRate?: number; // Aggregated from courses
  totalActiveResearchProjects?: number; // Aggregated
  // Grievance Metrics
  allGrievanceTickets?: GrievanceTicket[];
  grievanceCSAT?: number;
  sentimentDistribution?: { positive: number; neutral: number; negative: number; total: number };
}

// Ensure all new types are exported if not already done by defining them with 'export interface'
// export type { ParentInstitution, Faculty, Course, Section }; // Already exported
