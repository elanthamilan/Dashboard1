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
}

export interface Degree {
  degreeId: string;
  degreeName: string;
  programs: Program[];
  totalStudents?: number;
  averageDegreeGPA?: number;
}

export interface AcademicYear {
  yearId: string;
  yearName: string;
  startDate: string;
  endDate: string;
  degrees: Degree[];
  totalStudents?: number;
  overallAverageGPA?: number;
}

export interface Institution {
  institutionId: string;
  institutionName: string;
  academicYears: AcademicYear[];
  totalStudents?: number;
  overallAverageGPA?: number;
}
