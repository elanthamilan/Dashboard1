export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  gradeLevel?: number; // e.g., 9, 10, 11, 12 for K-12, or year for college
  homeroom?: string; // Optional: For K-12
  // Add any other relevant student details if needed for filtering/display
}

export interface SchoolClass {
  id: string;
  name: string; // e.g., "Math Grade 10 - Section A", "History 101"
  subject: string; // e.g., "Mathematics", "History"
  teacherId?: string; // Optional
  period?: string; // Optional: e.g., "Period 1", "9:00 AM - 10:00 AM"
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string; // ISO string for the date of attendance
  status: AttendanceStatus;
  absenceReason?: string; // e.g., "Illness", "Family Emergency", "Unexcused"
  notes?: string; // Any additional notes
  recordedBy?: string; // User ID or name of who recorded it (mock)
  recordedAt?: string; // ISO string timestamp
}
