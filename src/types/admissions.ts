// src/types/admissions.ts

export type ApplicationStatus =
  | 'Applied'
  | 'Screened'
  | 'Interview Scheduled'
  | 'Interview Complete' // Added as per usage in AdmissionsModule
  | 'Offer Made'
  | 'Offer Accepted'
  | 'Enrollment Confirmed'
  | 'Rejected'
  | 'Waitlisted'
  | 'Application Withdrawn'; // Added as per usage in en.json

export interface ApplicantAddress { // Added based on usage in AdmissionsModule
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface ApplicantPreviousEducation { // Added based on usage in AdmissionsModule
  institution?: string;
  degree?: string;
  graduationYear?: number;
  gpa?: number;
}

export interface ApplicantDocument { // Added based on usage in AdmissionsModule
  documentId?: string;
  fileName?: string;
  type?: string; // e.g., Transcript, Recommendation, SOP
  uploadDate?: string; // ISO Date
  url?: string;
}

export interface ApplicantInterview { // Added based on usage in AdmissionsModule
  interviewId?: string;
  date?: string; // ISO Date
  time?: string;
  interviewer?: string;
  feedback?: string;
  notes?: string;
}

export interface ApplicantVisaDetails { // Added based on usage in AdmissionsModule
  visaType?: string;
  applicationStatus?: string; // e.g., Submitted, Approved, Denied
  issueDate?: string; // ISO Date
  expiryDate?: string; // ISO Date
}


export interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string; // ISO Date
  gender?: string;
  nationality?: string;
  address?: ApplicantAddress; // Using the new interface
  applicationDate: string; // ISO Date
  programId: string; // Links to Program.programId in hierarchy.ts
  programName?: string; // Denormalized for convenience
  status: ApplicationStatus;
  funnelStage: number; // e.g., 1 for Applied, 7 for Enrolled (align with stageOrderAndNames in AdmissionsModule)
  previousEducation?: ApplicantPreviousEducation; // Using the new interface
  documents?: ApplicantDocument[]; // Using the new interface
  interview?: ApplicantInterview; // Using the new interface
  visaDetails?: ApplicantVisaDetails; // Using the new interface
  reservationCategory?: string; // e.g., General, SC/ST, OBC, EWS
  source?: string; // e.g., Online, Referral, Agent
  notes?: string;
  lastUpdated: string; // ISO Date
  // Fields from mockData/admissions/generateMockApplicants.ts
  originCity?: string;
  originCountry?: string;
  originCoordinates?: { lat: number; lng: number };
  hasScholarship?: boolean;
  applicationFeeStatus?: 'Paid' | 'Waived' | 'Pending';
}

export interface KeyDeadline {
  id: string;
  title: string;
  date: string; // ISO Date string
  type: 'Application' | 'Interview' | 'Decision' | 'Enrollment' | 'Orientation'; // Expanded based on common usage
  description?: string;
}
