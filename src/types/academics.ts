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
  facultyId: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string;
  departmentName?: string; // Added for convenience
  // other fields like designation, office, etc. can be added later
}

export interface FacultyEvaluation {
  evaluationId: string;
  facultyId: string;
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
  principalInvestigatorId: string;
  principalInvestigatorName: string;
  departmentId?: string; // PI's department
  status: 'Ongoing' | 'Completed' | 'Submitted' | 'Published' | 'OnHold';
  startDate: string; // ISO Date
  endDate?: string; // ISO Date
  abstract?: string;
  fundingAmount?: number;
  fundingAgency?: string;
  publications?: Array<{ title: string; journal?: string; year?: number; doi?: string }>;
  teamMembers?: Array<{ facultyId?: string; studentId?: string; name: string; role: string }>;
}
