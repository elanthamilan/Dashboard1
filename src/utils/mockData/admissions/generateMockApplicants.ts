import { Applicant, ApplicationStatus } from '../../../components/AdmissionsDashboard/types'; // Adjust path as needed
import { faker } from '@faker-js/faker'; // Needs @faker-js/faker to be installed

const programs = [
  { id: 'CS101', name: 'BSc Computer Science' },
  { id: 'MBA202', name: 'Master of Business Administration' },
  { id: 'ENG303', name: 'BEng Mechanical Engineering' },
  { id: 'ART404', name: 'MA Fine Arts' },
  { id: 'SCI505', name: 'PhD Quantum Physics' },
];

// Updated Application Statuses to match the new types
const applicationStatuses: ApplicationStatus[] = [
  'Applied',
  'Screened',
  'Interview Scheduled',
  'Interview Complete',
  'Offer Made',
  'Offer Accepted',
  'Offer Declined',
  'Enrollment Confirmed',
  'Application Withdrawn',
];

const documentTypes: Array<'Transcript' | 'Resume/CV' | 'Reference Letter' | 'Essay' | 'Passport Copy' | 'Visa Document'> = ['Transcript', 'Resume/CV', 'Reference Letter', 'Essay', 'Passport Copy'];

// Helper to get a realistic funnel stage based on the new statuses
const getFunnelStage = (status: ApplicationStatus): number => {
  switch (status) {
    case 'Applied': return 1;
    case 'Screened': return 2;
    case 'Interview Scheduled': return 3;
    case 'Interview Complete': return 4;
    case 'Offer Made': return 5;
    case 'Offer Accepted': return 6;
    case 'Enrollment Confirmed': return 7;
    // Offer Declined and Application Withdrawn are off-funnel states
    default: return 0;
  }
};

// Helper for coordinates (simple random for demo)
// Example: Coordinates around a central point (e.g., London)
const getRandomCoordinates = (): { lat: number; lng: number } => {
  return {
    lat: parseFloat(faker.location.latitude({ min: 40, max: 60 }).toFixed(6)), // Europe/North America
    lng: parseFloat(faker.location.longitude({ min: -10, max: 20 }).toFixed(6)), // Europe
  };
};

export const generateMockApplicant = (id: number): Applicant => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const program = faker.helpers.arrayElement(programs);
  const status = faker.helpers.arrayElement(applicationStatuses);
  const applicationDate = faker.date.past({ years: 1 });
  const hasInterview = ['Interview Scheduled', 'Offered', 'Accepted', 'Enrollment Confirmed'].includes(status) && Math.random() > 0.3;
  const isInternational = Math.random() > 0.7;

  return {
    id: `APP-${String(id).padStart(5, '0')}`,
    firstName,
    lastName,
    email: faker.internet.email({ firstName, lastName }),
    phoneNumber: faker.phone.number(),
    dateOfBirth: faker.date.birthdate({ min: 17, max: 45, mode: 'age' }).toISOString(),
    nationality: faker.location.country(),
    gender: faker.helpers.arrayElement(['Male', 'Female', 'Other', 'Prefer not to say']),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      postalCode: faker.location.zipCode(),
      country: faker.location.country(), // Could be different from nationality for residency
    },
    applicationDate: applicationDate.toISOString(),
    programId: program.id,
    programName: program.name,
    status,
    originCity: faker.location.city(), // New field
    originCountry: faker.location.country(), // New field (can be different from address.country or nationality for diversity)
    previousEducation: {
      institution: faker.company.name() + ' University',
      degree: faker.helpers.arrayElement(['BSc', 'BA', 'MSc', 'MA', 'High School Diploma']),
      graduationYear: faker.date.past({ years: 5 }).getFullYear(),
      gpa: parseFloat(faker.number.float({ min: 2.5, max: 4.0, precision: 0.1 }).toFixed(1)),
    },
    applicationFee: {
      paid: faker.datatype.boolean(0.9), // 90% paid
      amount: 50,
      paymentDate: faker.date.recent({ days: 30 }).toISOString(),
    },
    documents: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, (_, i) => ({
      id: faker.string.uuid(),
      type: faker.helpers.arrayElement(documentTypes),
      fileName: `${faker.lorem.word()}_${faker.system.commonFileName('pdf')}`,
      uploadDate: faker.date.between({ from: applicationDate, to: new Date() }).toISOString(),
      url: faker.internet.url(),
    })),
    interview: hasInterview ? {
      date: faker.date.future({ years: 0.1, refDate: applicationDate }).toISOString(),
      time: `${faker.number.int({ min: 9, max: 17 })}:00`,
      interviewer: faker.person.fullName(),
      notes: faker.lorem.sentence(),
      feedback: faker.helpers.arrayElement(['Positive', 'Neutral', 'Negative']),
    } : undefined,
    visaDetails: isInternational ? {
      visaType: 'Student Visa F-1',
      applicationStatus: faker.helpers.arrayElement(['Not Started', 'Submitted', 'Approved', 'Rejected']),
      issueDate: status === 'Offer Accepted' || status === 'Enrollment Confirmed' ? faker.date.recent({ days: 60 }).toISOString() : undefined,
      expiryDate: status === 'Offer Accepted' || status === 'Enrollment Confirmed' ? faker.date.future({ years: 3 }).toISOString() : undefined,
    } : undefined,
    originCoordinates: getRandomCoordinates(),
    funnelStage: getFunnelStage(status),
  };
};

export const generateMockApplicants = (count: number): Applicant[] => {
  return Array.from({ length: count }, (_, i) => generateMockApplicant(i + 1));
};

// New function to generate mock key deadlines
import { KeyDeadline } from '../../../components/AdmissionsDashboard/types'; // Import KeyDeadline
import dayjs from 'dayjs'; // For date manipulation

export const generateMockKeyDeadlines = (count: number): KeyDeadline[] => {
  const deadlines: KeyDeadline[] = [];
  const types: KeyDeadline['type'][] = ['Application', 'Interview', 'Decision', 'Enrollment'];
  let lastDate = dayjs(); // Start from today or a bit in the past

  for (let i = 0; i < count; i++) {
    const type = faker.helpers.arrayElement(types);
    lastDate = dayjs(faker.date.future({ refDate: lastDate.toDate(), years: 0.2 })); // Ensure dates progress somewhat logically

    deadlines.push({
      id: `DEADLINE-${String(i + 1).padStart(3, '0')}`,
      title: `${type} Deadline - ${faker.lorem.words(2)}`,
      date: lastDate.toISOString(),
      description: faker.lorem.sentence(),
      type: type,
    });
  }
  return deadlines.sort((a,b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()); // Sort by date
};
