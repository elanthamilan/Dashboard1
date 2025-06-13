// src/types/academics.ts

// Grievance System Types
export type GrievanceStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type GrievancePriority = 'High' | 'Medium' | 'Low';
export type GrievanceCategory = 'Infrastructure' | 'Academic' | 'Examination' | 'Faculty' | 'Student Welfare' | 'Other';

export interface GrievanceTicket {
  ticketId: string;
  submittedByStudentId?: string;
  submittedByStaffId?: string;
  category: GrievanceCategory;
  title: string;
  description: string;
  status: GrievanceStatus;
  priority: GrievancePriority;
  submittedDate: string;
  lastUpdatedDate: string;
  resolvedDate?: string;
  assignedToStaffId?: string;
  resolutionDetails?: string;
  satisfactionRating?: 1 | 2 | 3 | 4 | 5;
  resolutionFeedbackComment?: string;
  mockSentiment?: 'Positive' | 'Neutral' | 'Negative';
}

// Re-evaluation System Types (existing)
export interface ReEvaluationRequest {
  requestId: string;
  studentId: string;
  courseId: string;
  courseName: string;
  originalGrade: string;
  requestedGrade?: string;
  newGrade?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  requestDate: string;
  resolutionDate?: string;
  reasonForRequest: string;
  commentsByEvaluator?: string;
}

// Compliance and Accreditation Types
export type ComplianceStatus = 'Compliant' | 'Non-Compliant' | 'In Progress' | 'Pending Review' | 'Not Assessed';
export type AccreditingBody = 'NAAC' | 'NBA' | 'UGC' | 'AICTE' | 'Other';
export type AccreditationOverallStatus = 'Accredited' | 'Not Accredited' | 'Cycle Ongoing' | 'Expired';

export interface ComplianceItem {
  itemId: string;
  criterionId: string;
  criterionName: string;
  description?: string;
  status: ComplianceStatus;
  lastAuditDate: string;
  nextAuditDate?: string;
  ownerDeptId?: string; // Links to Department.departmentId
  evidenceDocUrl?: string;
}

export interface AccreditationStatusSummary {
  accreditationId: string;
  body: AccreditingBody;
  overallStatus: AccreditationOverallStatus;
  validFrom?: string;
  validUntil?: string;
  lastCycleDate: string;
  nextMajorReviewCycle: string;
  applicationStatus?: 'Submitted' | 'Queried' | 'Visit Scheduled' | 'Awaiting Results';
}

// Faculty and Evaluation Types
export interface FacultyMember {
  memberId: string; // Changed from facultyId to memberId for clarity
  name: string; // Combined firstName and lastName for simplicity, or can be split if needed by UI
  departmentId: string; // Department they belong to
  departmentName?: string; // Denormalized
  designation: 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer' | 'Instructor' | 'Visiting Faculty';
  email?: string;
  phoneNumber?: string;
  officeLocation?: string;
  expertiseAreas: string[]; // Array of strings like "Machine Learning", "Quantum Physics"
  profileUrl?: string; // Link to their profile page

  // New fields for enhanced visualizations:
  dateOfBirth?: string; // YYYY-MM-DD
  age?: number; // Calculated from DOB
  gender?: 'Male' | 'Female' | 'Other' | 'PreferNotToSay';
  highestQualification?: 'PhD' | 'Masters' | 'Bachelors' | 'Postdoc' | 'Other Diploma';
  dateOfJoining?: string; // YYYY-MM-DD
  yearsOfService?: number; // Calculated from dateOfJoining
  publicationsCount?: number; // Total peer-reviewed publications
  isAdvisor?: boolean;
  adviseeCount?: number; // Number of students they are advising
  coursesTaughtLastAcademicYear?: Array<{ courseId: string; courseName: string; credits: number; termId: string }>; // More detailed
  teachingLoadCredits?: number; // Sum of credits from coursesTaught
  studentFeedbackAvgRating?: number; // e.g., on a scale of 1-5
  totalGrantAmount?: number; // Total research grant money secured
  awardsAndRecognitions?: Array<{awardName: string, year: number, awardedBy: string}>;
}

export interface FacultyEvaluation {
  evaluationId: string;
  facultyId: string; // Should be memberId if FacultyMember.memberId is used
  studentId: string; // Assuming evaluations are by students
  courseId?: string; // Evaluation could be general or course-specific
  termId?: string;
  rating: number; // e.g., 1-5 or 1-10
  comments?: string;
  submissionDate: string; // ISO Date
}

// LMS Activity Types
export type LmsActivityType = 'Login' | 'ResourceView' | 'ResourceDownload' | 'ForumPost' | 'ForumView' | 'QuizAttempt' | 'AssignmentSubmission';

export interface LmsActivity {
  activityId: string;
  studentId: string;
  activityType: LmsActivityType;
  timestamp: string; // ISO Date string
  courseId?: string; // Optional: if activity is course-specific
  resourceId?: string; // e.g., ID of the downloaded file or viewed page
  forumId?: string;
  postId?: string;
  quizId?: string;
  assignmentId?: string;
  durationMinutes?: number; // For activities like resource view or login session
}

// Research Project Types
export interface ResearchProject {
  projectId: string;
  title: string;
  principalInvestigatorId: string; // Should be memberId if FacultyMember.memberId is used
  principalInvestigatorName: string;
  departmentId?: string; // PI's department
  status: 'Ongoing' | 'Completed' | 'Submitted' | 'Published' | 'OnHold';
  startDate: string; // ISO Date
  endDate?: string; // ISO Date
  abstract?: string;
  fundingAmount?: number;
  fundingAgency?: string;
  publications?: Array<{ title: string; journal?: string; year?: number; doi?: string }>;
  teamMembers?: Array<{ facultyId?: string; studentId?: string; name: string; role: string }>; // facultyId here also should be memberId
}

// Student Academic Performance Types (These might need to align with hierarchy.ts versions)
export interface CourseEnrollment { // This is likely student-specific enrollment
  courseId: string;
  courseCode?: string;
  courseName: string;
  credits: number;
  grade?: {
    letterGrade: string;
    numericalScore?: number;
    points?: number;
  };
  semesterId: string;
  instructorName?: string; // Could use instructorId (memberId)
  comments?: string;
  lastUpdated?: string; // ISO Date
}

export interface StudentAcademicRecord { // This is student-specific record
  studentId: string;
  programId: string;
  programName?: string;
  requiredCreditsForDegree?: number;
  semesters: Array<{
    semesterId: string;
    semesterName: string;
    courses: CourseEnrollment[];
    semesterGpa?: number;
    semesterCreditsEarned?: number;
    deanList?: boolean;
  }>;
  cumulativeGpa?: number;
  totalCreditsEarned?: number;
  classRank?: number;
  major?: string;
  minor?: string;
  graduationDate?: string; // ISO Date
  honorsAndAwards?: string[];
}
