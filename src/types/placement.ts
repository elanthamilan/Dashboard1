// In src/types/placement.ts
export interface PlacementRecord {
  placementId: string;
  studentId: string;
  programId?: string; // From StudentSummary/AcademicRecord
  companyName: string;
  jobTitle: string;
  packageDetails: number; // Annual package in local currency units (e.g., 700000 for 7 LPA)
  placementDate: string; // ISO YYYY-MM-DD
  sector?: string; // e.g., IT, Finance, Manufacturing, Consulting

  // New fields for enhanced visualizations
  companyTier?: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Startup' | 'Mass Recruiter' | 'Other'; // New
  offerType?: 'Full-time' | 'Internship' | 'PPO'; // New (Pre-Placement Offer)
  isAcceptedOffer?: boolean; // New - If student received multiple offers, which one was accepted. Default true if only one.
  numberOfOffersReceivedByStudent?: number; // New - Total offers this student got this season
  timeToPlacementDays?: number; // New - Days from graduation (or other benchmark) to placementDate
  salaryBreakdown?: Array<{component: string, amount: number, componentType: 'Fixed' | 'Variable' | 'Stock'}>; // New - Detailed breakdown
}
