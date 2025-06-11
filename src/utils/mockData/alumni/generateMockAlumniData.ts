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
    geoCoordinates: { lat: parseFloat(faker.location.latitude()), lng: parseFloat(faker.location.longitude()) },
  }));
};

const activityTypes: AlumniActivityType[] = ['EventAttended', 'DonationMade', 'MentorshipProvided', 'WebinarJoined', 'StoryShared'];

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
        description: activityType === 'EventAttended' ? `Attended: ${faker.company.catchPhrase()}` :
                     activityType === 'MentorshipProvided' ? `Mentored on: ${faker.hacker.noun()}` :
                     activityType === 'StoryShared' ? `Shared story: "${faker.lorem.sentence(5)}"`:
                     activityType === 'WebinarJoined' ? `Joined webinar: "${faker.lorem.words(3)}"` : faker.lorem.sentence(),
        value: activityType === 'DonationMade' ? faker.number.int({min:25, max:1000}) : // Adjusted min donation
               activityType === 'MentorshipProvided' ? faker.number.int({min:1, max:5}) : undefined,
      });
    }
  });
  return activities;
};
