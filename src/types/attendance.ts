// src/types/attendance.ts

export type AttendanceStatus =
  | 'Present'
  | 'Absent'
  | 'Late'
  | 'Excused'
  | 'Holiday'
  | 'Cancelled'; // Added as per en.json

export interface AttendanceRecord {
  id: string;
  studentId: string; // Links to Student.id or StudentSummary.studentId
  classId?: string; // Links to SchoolClass.id - Optional if attendance is general
  courseId?: string; // Added, as it's often used for attendance context
  date: string; // ISO Date string
  status: AttendanceStatus;
  reason?: string; // For 'Absent', 'Late', 'Excused'
  notes?: string;
  verifiedBy?: string; // Staff ID or name
  entryTime?: string; // Time of marking, if relevant
  exitTime?: string; // If tracking in/out for sessions
}

export interface SchoolClass {
  id: string;
  name: string; // e.g., "Mathematics 101 - Section A"
  courseId?: string; // Links to Course.courseId in hierarchy.ts
  courseName?: string; // Denormalized
  instructorId?: string; // Links to FacultyMember.facultyId
  instructorName?: string; // Denormalized
  subject?: string;
  schedule?: string; // e.g., "MWF 10:00-11:00"
  room?: string;
  termId?: string; // Links to Semester.semesterId or a general term structure
  academicYearId?: string; // Links to AcademicYear.yearId
  studentIds?: string[]; // List of student IDs enrolled
}

// Student type for attendance context.
// This can be aligned or merged with StudentSummary from hierarchy.ts later if needed.
// For now, it serves the specific needs of attendance record generation/display.
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  gradeLevel?: string; // e.g., "10th Grade", "Freshman"
  homeroom?: string; // Or section, advisory group, etc.
  programId?: string; // Useful for filtering students
  // Other fields like email, contact can be added if needed for attendance communication
}
