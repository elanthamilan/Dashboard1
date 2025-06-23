// src/utils/mockData/placements/generateMockPlacementData.ts
import { faker } from '@faker-js/faker';
import { PlacementRecord } from '../../../types/placement';
import { StudentSummary } from '../../../types/hierarchy';
import dayjs from 'dayjs';

export const generateMockPlacementData = (
  students: StudentSummary[],
  placementRateTarget: number = 0.75,
  avgPackageBase: number = 500000,
  internshipRateTarget: number = 0.4
): PlacementRecord[] => {
  const placementRecords: PlacementRecord[] = [];
  let placementIdCounter = 1;

  const eligibleStudents = students.filter(
    s => s.enrollmentStatus === 'Graduated' &&
         s.expectedGraduationDate &&
         dayjs(s.expectedGraduationDate).isBefore(dayjs().add(3, 'month'))
  );

  const studentsToPlaceCount = Math.floor(eligibleStudents.length * placementRateTarget);
  const shuffledEligibleStudents = faker.helpers.shuffle(eligibleStudents);

  for (let i = 0; i < studentsToPlaceCount; i++) {
    const student = shuffledEligibleStudents[i];
    const gotInternship = Math.random() < internshipRateTarget;

    if (gotInternship) {
      placementRecords.push({
        placementId: `PLACE-INT-${String(placementIdCounter++).padStart(5, '0')}`,
        studentId: student.studentId,
        programId: 'PROG_MOCK_PLACEHOLDER', // Placeholder Program ID
        companyName: faker.company.name(),
        jobTitle: `Intern - ${faker.person.jobTitle()}`,
        packageDetails: parseFloat(faker.finance.amount({ min: 15000, max: 60000, dec: 0 })), // Renamed packageAmount to packageDetails
        placementDate: dayjs(faker.date.past({ years: 1, refDate: student.expectedGraduationDate })).toISOString(),
        placementType: 'Internship',
        campusDrive: faker.datatype.boolean(0.7),
      });
    }

    placementRecords.push({
      placementId: `PLACE-FT-${String(placementIdCounter++).padStart(5, '0')}`,
      studentId: student.studentId,
      programId: 'PROG_MOCK_PLACEHOLDER', // Placeholder Program ID
      companyName: faker.company.name(),
      jobTitle: faker.person.jobTitle(),
      packageDetails: parseFloat(faker.finance.amount({ min: avgPackageBase * 0.5, max: avgPackageBase * 2.2, dec: 0 })), // Renamed packageAmount to packageDetails
      placementDate: dayjs(faker.date.between({
        from: dayjs(student.expectedGraduationDate!).subtract(1, 'month').toDate(),
        to: dayjs(student.expectedGraduationDate!).add(6, 'months').toDate()
      })).toISOString(),
      placementType: 'FullTime',
      campusDrive: faker.datatype.boolean(0.8),
    });
  }
  return placementRecords;
};
