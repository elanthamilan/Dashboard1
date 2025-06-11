// src/types/placement.ts
export interface PlacementRecord {
  placementId: string;
  studentId: string;
  programId: string;
  companyName: string;
  jobTitle: string;
  packageAmount: number;
  placementDate: string;
  placementType: 'Internship' | 'FullTime';
  campusDrive: boolean;
}
