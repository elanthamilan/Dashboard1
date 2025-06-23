// In src/utils/mockData/admissions/generateMockApplicants.ts
import { faker } from '@faker-js/faker';
import { Applicant, ApplicationStatus, KeyDeadline } from '../../../types/admissions'; // Updated path
import dayjs from 'dayjs';

const applicationStatuses: ApplicationStatus[] = [
  'Applied', 'Screened', 'Interview Scheduled', 'Interview Complete',
  'Offer Made', 'Offer Accepted', 'Enrollment Confirmed', 'Rejected', 'Withdrawn'
];

// Define a clear order for funnel stage dates and funnelStage calculation
const funnelOrder: ApplicationStatus[] = [
  'Applied', 'Screened', 'Interview Scheduled', 'Interview Complete',
  'Offer Made', 'Offer Accepted', 'Enrollment Confirmed'
];

// reservationCategories can be kept if still needed by other parts or for variety in Applicant type
const reservationCategories: Applicant['reservationCategory'][] = ['General', 'OBC', 'SC', 'ST', 'EWS', 'Other'];


export const generateMockApplicant = (id: number, programs: Array<{ programId: string; programName: string }>): Applicant => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = faker.internet.email({ firstName, lastName });
  const dob = dayjs(faker.date.birthdate({ min: 17, max: 35, mode: 'age' }));
  const applicationDate = dayjs(faker.date.past({ years: 1 }));

  // Determine status first, as it influences other fields like funnelStageDates and interview
  const randomStatusIndex = faker.number.int({ min: 0, max: applicationStatuses.length - 1 });
  const status = applicationStatuses[randomStatusIndex];

  const program = faker.helpers.arrayElement(programs);

  const gender = faker.helpers.arrayElement(['Male', 'Female', 'Other', 'PreferNotToSay'] as const);
  const age = dayjs().diff(dob, 'year');
  const nationality = faker.location.country();
  const applicationSource = faker.helpers.arrayElement(['Website', 'Referral', 'Education Fair', 'Social Media', 'Agent', 'Other'] as const);

  const funnelStageDates: Partial<Record<ApplicationStatus | 'Applied', string>> = {};
  let lastStageDate = applicationDate;
  const currentStatusIndexInFunnel = funnelOrder.indexOf(status);

  funnelStageDates['Applied'] = applicationDate.toISOString();

  if (currentStatusIndexInFunnel !== -1) {
    for (let i = 1; i <= currentStatusIndexInFunnel; i++) {
      const stage = funnelOrder[i];
      lastStageDate = dayjs(lastStageDate).add(faker.number.int({ min: 1, max: 10 }), 'day');
      funnelStageDates[stage] = lastStageDate.toISOString();
    }
  } else if (status === 'Rejected' || status === 'Withdrawn') {
    if (Math.random() > 0.3) {
        const screenedDate = dayjs(applicationDate).add(faker.number.int({min:1, max:5}), 'day');
        funnelStageDates['Screened'] = screenedDate.toISOString();
        lastStageDate = screenedDate; // Update lastStageDate for potential interview scheduling before rejection
    }
  }

  const shouldHaveInterview = status === 'Interview Scheduled' ||
                             status === 'Interview Complete' ||
                             status === 'Offer Made' ||
                             status === 'Offer Accepted' ||
                             status === 'Enrollment Confirmed' ||
                             // Allow for interviews even if eventually rejected/withdrawn, if they passed 'Screened'
                             ((status === 'Rejected' || status === 'Withdrawn') && !!funnelStageDates['Screened'] && Math.random() > 0.2);


  return {
    id: `APP-${String(id).padStart(4, '0')}`,
    firstName,
    lastName,
    email,
    phoneNumber: faker.phone.number(),
    dateOfBirth: dob.toISOString(),
    gender,
    age,
    nationality,
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      postalCode: faker.location.zipCode(),
      country: nationality,
    },
    programId: program.programId,
    programName: program.programName,
    applicationDate: applicationDate.toISOString(),
    status,
    funnelStage: currentStatusIndexInFunnel !== -1 ? currentStatusIndexInFunnel + 1 : funnelOrder.length + 1,

    applicationSource,
    funnelStageDates,

    previousEducation: {
      institution: `${faker.location.city()} ${faker.helpers.arrayElement(['University', 'College', 'High School', 'Institute'])}`,
      degree: faker.helpers.arrayElement(['Bachelor of Science', 'Bachelor of Arts', 'MBA', 'High School Diploma', 'Master of Engineering']),
      fieldOfStudy: faker.person.jobArea(),
      graduationYear: applicationDate.year() - faker.number.int({ min: 0, max: 5 }),
      gpa: parseFloat(faker.number.float({ min: 2.0, max: 4.0, precision: 0.1 }).toFixed(1)),
    },

    profilePictureUrl: faker.image.avatar(),
    originCity: faker.location.city(),
    originCountry: nationality,
    originCoordinates: {
        lat: parseFloat(faker.location.latitude().toString()),
        lng: parseFloat(faker.location.longitude().toString())
    },
    reservationCategory: faker.helpers.arrayElement(reservationCategories),

    documents: Math.random() > 0.3 ? Array.from({length: faker.number.int({min:1, max:3})}, () => ({
        documentId: faker.string.uuid(),
        fileName: `${lastName}_${faker.lorem.word()}.pdf`,
        documentType: faker.helpers.arrayElement(['Resume', 'Transcript', 'Essay', 'RecommendationLetter', 'Other'] as const),
        uploadDate: applicationDate.toISOString(),
        url: faker.internet.url()
    })) : [],

    interview: shouldHaveInterview ? {
        interviewId: faker.string.uuid(),
        date: dayjs(funnelStageDates['Interview Scheduled'] || funnelStageDates['Screened'] || applicationDate).add(faker.number.int({min: 2, max: 7}), 'day').toISOString(),
        time: `${faker.number.int({min:9, max:17})}:00`,
        interviewerIds: [faker.string.alphanumeric(5)],
        interviewerNames: [faker.person.fullName()],
        feedback: (status === 'Interview Complete' || status === 'Offer Made' || status === 'Offer Accepted' || status === 'Enrollment Confirmed' || status === 'Rejected' || status === 'Withdrawn') && Math.random() > 0.2 ? faker.lorem.paragraph() : undefined,
        score: (status === 'Interview Complete' || status === 'Offer Made' || status === 'Offer Accepted' || status === 'Enrollment Confirmed' || status === 'Rejected' || status === 'Withdrawn') && Math.random() > 0.2 ? faker.number.int({min:1, max:5}) : undefined,
    } : undefined,
    visaDetails: nationality !== 'India' ? { // Example: Assume 'India' is domestic
        visaType: 'Student Visa',
        applicationStatus: faker.helpers.arrayElement(['Not Started' , 'Applied', 'Approved', 'Rejected'] as const),
        issueDate: (status === 'Offer Accepted' || status === 'Enrollment Confirmed') && Math.random() > 0.5 ? dayjs(lastStageDate).add(1, 'month').toISOString() : undefined,
        expiryDate: (status === 'Offer Accepted' || status === 'Enrollment Confirmed') && Math.random() > 0.5 ? dayjs(lastStageDate).add(3, 'year').toISOString() : undefined,
    } : undefined,
    hasScholarship: faker.datatype.boolean(0.2),
    applicationFeeStatus: faker.helpers.arrayElement(['Paid', 'Waived', 'Pending'] as const),
    notes: Math.random() > 0.7 ? faker.lorem.sentence() : undefined,
    lastUpdated: dayjs().toISOString() // Added from original type, not in prompt, but useful
  };
};

export const generateMockApplicants = (
  count: number,
  programsData?: Array<{ programId: string; programName: string }>
): Applicant[] => {
  const defaultProgs = programsData && programsData.length > 0 ? programsData : [
    { programId: 'CS_BS_DEFAULT', programName: 'B.S. Computer Science (Default)' },
    { programId: 'MBA_GEN_DEFAULT', programName: 'Master of Business Administration (Default)' },
  ];
  return Array.from({ length: count }, (_, i) => generateMockApplicant(i + 1, defaultProgs));
};

export const generateMockKeyDeadlines = (count: number): KeyDeadline[] => {
  const deadlines: KeyDeadline[] = [];
  const types: KeyDeadline['type'][] = ['Application', 'Interview', 'Decision', 'Enrollment', 'Orientation'];
  let lastDate = dayjs();

  for (let i = 0; i < count; i++) {
    const type = faker.helpers.arrayElement(types);
    // Ensure dates are somewhat logical and in the future or near past for deadlines
    if (i === 0) { // First deadline can be soon
        lastDate = dayjs(faker.date.soon({ days: 30, refDate: dayjs().subtract(10, 'days').toDate()}));
    } else { // Subsequent deadlines further out
        lastDate = dayjs(faker.date.future({ refDate: lastDate.toDate(), years: 0.3 }));
    }

    deadlines.push({
      id: `DEADLINE-${String(i + 1).padStart(3, '0')}`,
      title: `${type} Deadline - ${faker.commerce.productName()}`, // More varied title
      date: lastDate.toISOString(),
      description: faker.lorem.sentence(),
      type: type,
    });
  }
  return deadlines.sort((a,b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
};
