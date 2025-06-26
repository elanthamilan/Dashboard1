// src/types/departments.ts

// Corresponds to Faculty in hierarchy.ts (e.g. "School of Engineering")
// For simplicity, if there's a direct "Faculty" entity that groups departments,
// its ID would be facultyId.
export interface Department {
  departmentId: string;
  departmentName: string;
  facultyId: string; // ID of the faculty (e.g., "School of Engineering") it belongs to
  headOfDepartment?: { memberId: string; name: string; email?: string; };
  // degreeIds: string[]; // Removed as per prompt comment: "if programs are directly under department, this might not be needed"
                        // We will link Programs to Departments via Program.departmentId
  degreeIds?: string[]; // Added back as optional for DepartmentList.tsx compatibility

  // Fields from previous mock/display or general utility
  facultyCount?: number;
  studentCount?: number; // This might be the same as totalStudentsEnrolled, let's use totalStudentsEnrolled for consistency
  totalStudents?: number; // Added for DepartmentList.tsx compatibility (alias for totalStudentsEnrolled)
  averageGPA?: number; // Department-wide average GPA
  departmentAverageGPA?: number; // Added for DepartmentList.tsx compatibility (alias for averageGPA)
  averagePassRate?: number; // Department-wide average pass rate
  departmentPassRate?: number; // Added for DepartmentList.tsx compatibility (alias for averagePassRate)
  departmentPlacementRate?: number; // Added for DepartmentList.tsx
  performanceScore?: number; // Example from existing table, can be a calculated or assigned score

  // New fields for enhanced visualizations:
  totalStudentsEnrolled?: number; // Sum of students in all programs of this dept
  numberOfCoursesOffered?: number; // Count of unique courses offered by this dept (courses directly linked to this dept)
  numberOfPrograms?: number; // Count of programs within this dept (programs directly linked to this dept)
  budgetAllocated?: number;
  budgetSpent?: number;
  researchOutputScore?: number; // Example new metric (e.g., based on publications, grants)
  industryCollaborationScore?: number; // Example new metric (e.g., based on joint projects, internships)
}
