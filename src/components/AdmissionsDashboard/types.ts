export type ApplicationStatus =
  | 'Applied'
  | 'Screened' // New
  | 'Interview Scheduled'
  | 'Interview Complete' // New
  | 'Offer Made' // New (replaces 'Offered')
  | 'Offer Accepted' // New (replaces 'Accepted')
  | 'Offer Declined' // New
  | 'Enrollment Confirmed'
  | 'Application Withdrawn'
  // 'Shortlisted', 'Rejected', 'Waitlisted' can be considered implied by other statuses or handled differently
  // For example, 'Rejected' could be a final status after any stage.
  // 'Waitlisted' could be a specific status. Let's keep it simple for now and remove them if covered by funnel.
  // Let's refine to keep distinct funnel points, 'Rejected' and 'Waitlisted' can be separate considerations or final states.
  // For this exercise, I will stick to the list provided in the prompt.
  // Re-evaluating based on prompt: 'Rejected' and 'Waitlisted' were not in the new list.
  // 'Offered' became 'Offer Made', 'Accepted' became 'Offer Accepted'.
  ;

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
  originCity?: string; // New
  originCountry?: string; // New
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

export interface KeyDeadline {
  id: string;
  title: string;
  date: string; // ISO string
  description?: string;
  type: 'Application' | 'Interview' | 'Decision' | 'Enrollment';
}
