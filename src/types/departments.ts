// src/types/departments.ts
export interface Department {
  departmentId: string;
  departmentName: string;
  programIds: string[]; // List of Program IDs belonging to this department
  performanceScore?: number;
  averageGPA?: number; // Aggregated from programs in this department
  placementRate?: number; // Aggregated from programs in this department
  averagePassRate?: number; // Aggregated pass rate from programs in this department
  mockStudentSatisfactionScore?: number; // Aggregated or direct mock for the department
  totalStudents?: number; // Total students in this department
  // We can add more specific aggregated KPIs if needed later
  // e.g., totalPlacedStudentsInDept, totalInternshipsInDept
}
