// src/types/admissions.ts

export type ApplicationStatus =
  | 'Applied'
  | 'Screened'
  | 'Interview Scheduled'
  | 'Interview Complete'
  | 'Offer Made'
  | 'Offer Accepted'
  | 'Enrollment Confirmed'
  | 'Rejected'
  | 'Withdrawn' // Retained from original, prompt had it
  | 'Waitlisted'; // Retained from original

export interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'PreferNotToSay';
  age?: number;
  nationality?: string;
  address?: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  programId: string;
  programName: string;
  applicationDate: string; // ISO date string
  status: ApplicationStatus;
  funnelStage: number;

  applicationSource?: 'Website' | 'Referral' | 'Education Fair' | 'Social Media' | 'Agent' | 'Other';
  funnelStageDates?: Partial<Record<ApplicationStatus | 'Applied', string>>;

  previousEducation?: {
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    graduationYear: number;
    gpa?: number;
  };

  profilePictureUrl?: string;
  documents?: Array<{
    documentId: string;
    fileName: string;
    documentType: 'Resume' | 'Transcript' | 'Essay' | 'RecommendationLetter' | 'Other';
    uploadDate: string; // ISO date string
    url: string;
  }>;
  interview?: {
    interviewId: string;
    date: string; // ISO date string
    time: string; // e.g., "14:00"
    interviewerIds: string[];
    interviewerNames?: string[];
    feedback?: string;
    score?: number; // 1-5 or 1-10
  };
  notes?: string;
  reservationCategory?: string;
  originCity?: string;
  originCountry?: string;
  originCoordinates?: { lat: number; lng: number };
  visaDetails?: {
    visaType: string;
    applicationStatus: 'Not Started' | 'Applied' | 'Approved' | 'Rejected';
    issueDate?: string;
    expiryDate?: string;
  };
  // Fields from original file that are not in the prompt's new definition but might be useful to keep or were overlooked
  hasScholarship?: boolean;
  applicationFeeStatus?: 'Paid' | 'Waived' | 'Pending';
  lastUpdated?: string; // Present in original, not in prompt; maybe remove if funnelStageDates covers it
}

export interface KeyDeadline {
  id: string;
  title: string;
  date: string; // ISO Date string
  type: 'Application' | 'Interview' | 'Decision' | 'Enrollment' | 'Orientation';
  description?: string;
}
