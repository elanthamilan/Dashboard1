export interface Grade {
  letterGrade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'F' | 'P' | 'NP'; // P=Pass, NP=No Pass
  numericalScore?: number; // 0-100
  points?: number; // Grade points, e.g., A=4.0, B=3.0
}

export interface CourseEnrollment {
  courseId: string;
  courseCode: string; // e.g., "CS101", "MATH203"
  courseName: string;
  credits: number; // e.g., 3, 4
  instructor?: string;
  grade?: Grade;
  comments?: string;
}

export interface Term {
  termId: string; // e.g., "FA2022", "SP2023"
  termName: string; // e.g., "Fall 2022", "Spring 2023"
  startDate?: string; // ISO string
  endDate?: string; // ISO string
  courses: CourseEnrollment[];
  termGPA?: number;
}

export interface SkillProficiency {
  skillName: string; // e.g., "Critical Thinking", "Python Programming", "Calculus I"
  proficiencyLevel: number; // 0-100 percentage, or a scale like 1-5
  lastAssessed?: string; // ISO string
}

export interface K12StandardMastery {
  standardId: string; // e.g., "Math.Content.HSG.SRT.A.1"
  standardName: string; // Short description of the standard
  masteryStatus: 'Not Assessed' | 'Beginning' | 'Approaching' | 'Met' | 'Exceeded';
  lastAssessedDate?: string; // ISO string
}

export interface OnlineLearningProgress {
    courseName: string;
    moduleId: string;
    moduleName: string;
    progressPercent: number; // 0-100
    lastActivityDate?: string; // ISO string
}

export interface StudentAcademicRecord {
  studentId: string; // Links to a general Student ID (from Attendance or a global list)
  programId?: string;
  programName?: string; // e.g., "Bachelor of Science in Computer Science"
  enrollmentDate?: string; // ISO string
  expectedGraduationDate?: string; // ISO string
  terms: Term[];
  cumulativeGPA?: number;
  totalCreditsEarned?: number;
  skillProficiencies?: SkillProficiency[];
  k12StandardsMastery?: K12StandardMastery[];
  onlineLearningProgress?: OnlineLearningProgress[];
  // For Degree Completion Progress
  requiredCreditsForDegree?: number;
}
