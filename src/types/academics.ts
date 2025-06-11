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
