// In src/types/alumni.ts
export type AlumniActivityType = 'EventAttended' | 'DonationMade' | 'MentorshipProvided' | 'WebinarHosted' | 'JobReferred' | 'TalkDelivered' | 'OtherContribution';

export interface Alumnus {
  studentId: string; // Links to student record
  graduationYear: number;
  programId?: string; // Program graduated from
  programName?: string; // Denormalized

  currentEmployer?: string;
  currentRole?: string;
  industry?: string; // e.g., Technology, Healthcare, Finance
  city?: string; // New - Current city of residence/work
  country?: string; // Current country
  geoCoordinates?: { lat: number; lng: number }; // For map visualizations

  contactEmail?: string; // Masked or official alumni portal email
  linkedInProfile?: string; // URL

  // New fields for engagement and contribution
  isMentor?: boolean; // New - Actively mentoring current students
  totalDonations?: number; // New - Lifetime or cumulative donations
  eventsAttendedLastYear?: number; // New - Count of official alumni events attended
  engagementScore?: number; // New - Calculated score based on activities (0-100)
}

export interface AlumniActivity {
  activityId: string;
  alumnusId: string; // Links to Alumnus.studentId
  activityType: AlumniActivityType;
  date: string; // ISO YYYY-MM-DD
  description: string;
  value?: number | string; // e.g., Donation amount, Event ID, Hours mentored
  location?: string; // If event-specific
  notes?: string;
}
