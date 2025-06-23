import { faker } from '@faker-js/faker';
import { Alumnus, AlumniActivity, AlumniActivityType } from '../../../types/alumni'; // Adjust path if necessary
import { StudentSummary } from '../../../types/hierarchy';
import dayjs from 'dayjs';

export const generateMockAlumni = (
  graduatedStudents: StudentSummary[]
): Alumnus[] => {
  if (!graduatedStudents) return [];
  return graduatedStudents.map(student => ({
    studentId: student.studentId,
    graduationYear: student.expectedGraduationDate ? dayjs(student.expectedGraduationDate).year() : dayjs().year() - faker.number.int({min:1, max:5}),
    currentCity: faker.location.city(),
    currentCountry: faker.location.country(),
    currentEmployer: faker.company.name(),
    currentRole: faker.person.jobTitle(),
    geoCoordinates: { lat: faker.location.latitude(), lng: faker.location.longitude() }, // Removed parseFloat
  }));
};

const activityTypes: AlumniActivityType[] = ['EventAttended', 'DonationMade', 'MentorshipProvided', 'WebinarHosted', 'JobReferred', 'TalkDelivered', 'OtherContribution'];

export const generateMockAlumniActivities = (
  alumni: Alumnus[],
  activitiesPerAlumnusTarget: number = 2
): AlumniActivity[] => {
  const activities: AlumniActivity[] = [];
  let activityIdCounter = 1;
  if (!alumni || alumni.length === 0) return activities;

  alumni.forEach(alum => {
    const numActivities = faker.number.int({ min: 0, max: Math.floor(activitiesPerAlumnusTarget * 1.5) }); // Adjusted max to be less than 2*target for more variability
    for (let i = 0; i < numActivities; i++) {
      const activityType = faker.helpers.arrayElement(activityTypes);
      activities.push({
        activityId: `ALUMNI-ACT-${String(activityIdCounter++).padStart(5, '0')}`,
        alumnusId: alum.studentId,
        activityType: activityType,
        date: faker.date.past({ years: 3 }).toISOString(),
        description: activityType === 'DonationMade' ? `Donation of $${faker.number.int({min:25, max:500})}` :
                     activityType === 'MentorshipProvided' ? `Mentored ${faker.number.int({min:1, max:3})} students in ${faker.person.jobArea()}` :
                     activityType === 'WebinarHosted' ? `Hosted webinar on "${faker.lorem.words(3)}"` :
                     activityType === 'TalkDelivered' ? `Delivered a talk on "${faker.lorem.sentence(4)}"` :
                     faker.lorem.sentence(), // Default for EventAttended, OtherContribution, JobReferred
        value: activityType === 'DonationMade' ? faker.number.int({min:25, max:1000}) :
               activityType === 'MentorshipProvided' ? faker.number.int({min:1, max:5}) : undefined,
      });
    }
  });
  return activities;
};
