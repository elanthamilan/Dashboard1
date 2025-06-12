// src/types/departments.ts
export interface Department {
  departmentId: string;
  departmentName: string;
  facultyId: string; // Added facultyId
  degreeIds: string[]; // Changed programIds to degreeIds
  performanceScore?: number;
  averageGPA?: number; // Aggregated from programs in this department
  placementRate?: number; // Aggregated from programs in this department
  averagePassRate?: number; // Aggregated pass rate from programs in this department
  mockStudentSatisfactionScore?: number; // Aggregated or direct mock for the department
  totalStudents?: number; // Total students in this department
  // KPIs similar to Program (example)
  departmentAverageGPA?: number; // Renamed for clarity
  departmentPlacementRate?: number; // Renamed for clarity
  departmentPassRate?: number; // Renamed for clarity
  // We can add more specific aggregated KPIs if needed later
  // e.g., totalPlacedStudentsInDept, totalInternshipsInDept
}
