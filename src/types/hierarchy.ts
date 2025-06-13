// src/types/hierarchy.ts
import { PlacementRecord } from './placement';
// Re-evaluate which of these are truly needed if types are defined locally or if they need updating in academics.ts
import {
    // StudentAcademicRecord as AcademicRecordFromAcademics, // Alias if using a distinct local version
    // CourseEnrollment as CourseEnrollmentFromAcademics, // Alias
    ReEvaluationRequest, GrievanceTicket,
    ComplianceItem, AccreditationStatusSummary, AccreditingBody,
    FacultyMember, FacultyEvaluation, LmsActivity, ResearchProject,
} from './academics';
import { Department } from './departments';
import { Alumnus, AlumniActivity } from './alumni';

export type { Department } from './departments';
export type {
    ReEvaluationRequest, GrievanceTicket,
    ComplianceItem, AccreditationStatusSummary, AccreditingBody,
    FacultyMember, FacultyEvaluation, LmsActivity, ResearchProject,
    // StudentAcademicRecord, CourseEnrollment // Avoid re-exporting if defining locally below with changes
} from './academics';


// New/Updated Academic Structure Types:
export interface Grade {
  letterGrade?: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'F' | 'P' | 'NP' | 'I' | 'W';
  numericalScore?: number; // 0-100
  gradePoints?: number;
  attemptNumber?: number;
  isBacklogCleared?: boolean;
}

export interface CourseEnrollment {
  courseId: string; // Refers to Course.courseId
  courseName: string; // Denormalized from Course
  credits: number; // Denormalized from Course
  grade?: Grade;
  termId: string; // e.g., "FALL2023", "SPR2024" - New
  semesterName?: string; // Denormalized, e.g., "Fall 2023 Semester" - New
  status?: 'Enrolled' | 'Completed' | 'Withdrawn' | 'Failed' | 'In Progress'; // New
  facultyId?: string;
  facultyName?: string;
}

export interface StudentTermRecord {
  termId: string;
  semesterName?: string;
  courses: CourseEnrollment[];
  semesterGPA?: number;
  creditsAttemptedInTerm?: number;
  creditsEarnedInTerm?: number;
  rankInProgram?: number;
  rankInClass?: number;
}

export interface StudentAcademicRecord {
  studentId: string;
  programId: string;
  programName?: string;
  semesters: StudentTermRecord[]; // Changed from StudentSemesterRecord
  cumulativeGPA?: number;
  totalCreditsAttempted?: number; // New
  totalCreditsEarned?: number; // New
  academicStanding?: 'Good Standing' | 'Probation' | 'Suspended' | "Dean's List" | 'At Risk'; // New
  expectedGraduationDate?: string; // ISO Date
  major?: string;
  minor?: string;
}

// This is the course definition/template
export interface Course {
  courseId: string;
  courseName: string;
  credits: number;
  description?: string;
  departmentId?: string; // Crucial for linking to department
  facultyIds?: string[]; // Optional: faculty capable of teaching it
  courseCode?: string; // Existing from file
}


// Existing Hierarchy Types (ensure they are compatible or update as needed)
export interface ParentInstitution {
  parentInstitutionId: string;
  parentInstitutionName: string;
  institutions: Institution[];
  totalStudents?: number;
  overallAverageGPA?: number;
  totalFaculty?: number;
  totalPrograms?: number;
  overallPlacementRate?: number;
  totalResearchGrantsValue?: number;
}

export interface Faculty { // This represents a faculty/school, e.g., Faculty of Engineering
  facultyId: string;
  facultyName: string;
  institutionId: string;
  departments: Department[]; // Departments are under a Faculty
  totalStudents?: number;
  averageFacultyGPA?: number; // GPA of students in this Faculty
  totalFacultyMembers?: number; // Count of academic staff
  researchProjectsCount?: number;
}

// Section might represent specific offerings of a course in a term/semester.
export interface Section {
  sectionId: string;
  sectionName: string;
  courseId: string; // Links to the Course template
  termId: string; // Links to StudentTermRecord.termId
  instructorName?: string;
  schedule?: string;
  students: StudentSummary[];
  averageAttendance?: number;
  studentCount?: number;
  classroom?: string;
}

export interface StudentSummary {
  studentId: string;
  firstName: string;
  lastName: string;
  programName?: string;
  cumulativeGPA?: number;
  totalCreditsEarned?: number; // Already present from prompt
  enrollmentStatus?: 'Active' | 'Inactive' | 'Graduated';
  expectedGraduationDate?: string;
  programId?: string;
  departmentId?: string;
  totalLmsLogins?: number;
  avgAttendanceRate?: number;
  consecutiveAbsences?: number;
  graduationYear?: number; // Added for placement trend calculation
}

export interface SchoolClass {
    id: string;
    name: string;
    subject?: string;
    // Potential other fields: instructorId, schedule, room, courseId (if this is a section of a course)
}

export interface Semester { // Represents a term within a Program
  semesterId: string; // Could be same as termId used in StudentTermRecord
  semesterName: string;
  startDate: string;
  endDate: string;
  students?: StudentSummary[]; // Students active in this program during this semester
  courses: Course[]; // List of course *templates* offered by the program in this semester context
  averageGPA?: number; // Avg GPA of students in this program for this semester's courses
  passRate?: number; // Pass rate for courses taken by program students this semester
  attendancePercentage?: number;
  totalAbsences?: number;
  feesPaidPercentage?: number;
  studentsWithOverdueFees?: number;
  totalCoursesOffered?: number; // Count of distinct course templates
}

export interface Program {
  programId: string;
  programName: string;
  degreeId: string; // Links to Degree.degreeId
  departmentId: string; // Crucial for linking to department
  description?: string;
  durationYears?: number;
  creditsRequired?: number; // Was requiredCredits
  courses: Course[]; // List of course templates for this program
  // semesters: Semester[]; // This was for program structure, but usually holds student enrollment data.
                         // Program structure is better defined by its typical courses.
                         // If Semester[] here was meant for student term records, it's better associated with StudentAcademicRecord.

  // New / ensure present for Department calculations:
  totalStudentsEnrolled?: number; // Total current students in this program. This needs to be calculated from student enrollment data.

  // Existing fields, ensure still relevant or map to new structure
  totalStudents?: number; // Potentially redundant with totalStudentsEnrolled, prefer totalStudentsEnrolled for active count
  averageProgramGPA?: number; // Overall GPA of all students ever in this program - this is fine
  graduationRate?: number;
  // KPIs (can be aggregated or specific snapshots)
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
  programPassRate?: number;
  // semesters field from original file is removed in favor of a more direct Course[] list for program structure.
  // Student enrollment data is typically handled via StudentAcademicRecord which has StudentTermRecord[].
}

export interface Degree {
  degreeId: string;
  degreeName: string;
  departmentId: string;
  programs: Program[];
  totalStudents?: number;
  averageDegreeGPA?: number;
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
  parentInstitutionId?: string;
  academicYears: AcademicYear[];
  faculties: Faculty[];
  totalStudents?: number;
  overallAverageGPA?: number;
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
  lmsLoginsLast30Days?: number;
  lmsResourceDownloadsLast30Days?: number;
  lmsForumPostsLast30Days?: number;
  lmsActivities?: LmsActivity[];
  alumni?: Alumnus[];
  alumniActivities?: AlumniActivity[];
  alumniEngagementScore?: number;
  overallInternshipRate?: number;
  totalCampusCompanies?: number;
  allPlacementRecords?: PlacementRecord[];
  allResearchProjects?: ResearchProject[];
  overallCourseCompletionRate?: number;
  totalActiveResearchProjects?: number;
  allGrievanceTickets?: GrievanceTicket[];
  grievanceCSAT?: number;
  sentimentDistribution?: { positive: number; neutral: number; negative: number; total: number };
  totalInternshipsMock?: number; // Added for placement module mock data
}
