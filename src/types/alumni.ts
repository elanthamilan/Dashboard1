// src/types/alumni.ts
export interface Alumnus {
  studentId: string; // Links to StudentSummary.studentId
  graduationYear: number;
  currentCity?: string;
  currentCountry?: string;
  currentEmployer?: string;
  currentRole?: string;
  geoCoordinates?: { lat: number; lng: number };
  // Add other fields like contact, interests if needed later
}

export type AlumniActivityType = 'EventAttended' | 'DonationMade' | 'MentorshipProvided' | 'WebinarJoined' | 'StoryShared';

export interface AlumniActivity {
  activityId: string;
  alumnusId: string; // Links to Alumnus.studentId
  activityType: AlumniActivityType;
  date: string; // ISO Date string
  description?: string; // e.g., Event name, Mentorship topic
  value?: number; // e.g., Donation amount, Mentorship hours
}
