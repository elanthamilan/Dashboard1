// src/types/attendance.ts
export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused' | 'Holiday'; // Added Holiday

export interface AttendanceRecord {
  id: string; // Unique record ID
  studentId: string;
  studentName?: string; // Denormalized
  classId?: string; // Renamed from courseId for clarity if 'class' refers to a specific session/section
  className?: string; // Denormalized name of the class/session
  courseId?: string; // ID of the parent course
  courseName?: string; // Denormalized name of the parent course
  date: string; // ISO date string (YYYY-MM-DD)
  dayOfWeek?: string; // e.g., "Monday", "Tuesday" - New
  status: AttendanceStatus;
  absenceReason?: string; // e.g., Sick, Family Emergency, etc. - More varied reasons needed
  notes?: string; // Any additional notes by instructor or student
  entryTime?: string; // e.g., "09:05" if late
  exitTime?: string;  // e.g., "15:50"
  verifiedBy?: string; // ID of faculty who verified (if applicable)
}

// SchoolClass and Student interfaces that might have been here previously
// are assumed to be primarily managed in src/types/hierarchy.ts if needed elsewhere.
// If they are solely for attendance mock data generation context and not shared,
// they would be defined in the mock data file itself or here if this is their sole definition point.
// For this task, we assume they are either in hierarchy.ts or will be handled in the mock generator.
