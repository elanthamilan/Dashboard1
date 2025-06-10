export type ApplicationStatus =
  | 'Applied'
  | 'Shortlisted'
  | 'Interview Scheduled'
  | 'Offered'
  | 'Accepted'
  | 'Rejected'
  | 'Waitlisted'
  | 'Enrollment Confirmed'
  | 'Application Withdrawn';

export interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth: string; // ISO string
  nationality: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  address: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  applicationDate: string; // ISO string
  programId: string;
  programName: string; // e.g., "BSc Computer Science", "MBA"
  status: ApplicationStatus;
  previousEducation?: {
    institution: string;
    degree: string;
    graduationYear?: number;
    gpa?: number; // Simple GPA
  };
  applicationFee: {
    paid: boolean;
    amount?: number;
    paymentDate?: string; // ISO string
  };
  documents?: Array<{
    id: string;
    type: 'Transcript' | 'Resume/CV' | 'Reference Letter' | 'Essay' | 'Passport Copy' | 'Visa Document';
    fileName: string;
    uploadDate: string; // ISO string
    url?: string; // Mock URL
  }>;
  interview?: {
    date?: string; // ISO string
    time?: string;
    interviewer?: string;
    notes?: string;
    feedback?: 'Positive' | 'Neutral' | 'Negative';
  };
  visaDetails?: { // For international students
    visaType?: string;
    applicationStatus?: 'Not Started' | 'Submitted' | 'Approved' | 'Rejected';
    issueDate?: string; // ISO string
    expiryDate?: string; // ISO string
  };
  // For map feature
  originCoordinates?: {
    lat: number;
    lng: number;
  };
  // For funnel chart, could derive or add a specific stage field
  funnelStage: number; // e.g., 1: Applied, 2: Shortlisted, ... 5: Accepted
}
