import { Term, CourseEnrollment } from '../components/StudentPerformanceDashboard/types';

export interface StudentSummary {
  studentId: string;
  firstName: string;
  lastName: string;
  programId: string;
  programName: string;
  cumulativeGPA?: number;
  totalCreditsEarned?: number;
  enrollmentStatus?: 'Active' | 'Inactive' | 'Graduated';
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
  degreeId: string;
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
}
