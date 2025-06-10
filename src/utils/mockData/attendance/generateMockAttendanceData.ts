import { faker } from '@faker-js/faker';
import { Student, SchoolClass, AttendanceStatus, AttendanceRecord } from '../../../components/AttendanceDashboard/types'; // Adjust path
import dayjs from 'dayjs';

const ABSENCE_REASONS = ['Illness', 'Family Emergency', 'Appointment', 'Transportation Issue', 'School Activity', 'Unexcused'];
const ATTENDANCE_STATUSES: AttendanceStatus[] = ['Present', 'Present', 'Present', 'Present', 'Present', 'Absent', 'Late', 'Excused']; // Skew towards 'Present'

export const generateMockStudents = (count: number): Student[] => {
  const students: Student[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    students.push({
      id: `STU-${String(i + 1).padStart(4, '0')}`,
      firstName,
      lastName,
      gradeLevel: faker.number.int({ min: 1, max: 12 }),
      homeroom: `HR-${faker.number.int({ min: 100, max: 120 })}`,
    });
  }
  return students;
};

export const generateMockClasses = (count: number): SchoolClass[] => {
  const subjects = ['Mathematics', 'Science', 'History', 'English', 'Art', 'Physical Education', 'Music', 'Geography'];
  const classes: SchoolClass[] = [];
  for (let i = 0; i < count; i++) {
    const subject = faker.helpers.arrayElement(subjects);
    classes.push({
      id: `CLS-${String(i + 1).padStart(3, '0')}`,
      name: `${subject} ${faker.number.int({min: 100, max: 400})}`,
      subject: subject,
      teacherId: `TCH-${faker.number.int({ min: 1, max: 20 })}`,
      period: `Period ${faker.number.int({ min: 1, max: 8 })}`
    });
  }
  return classes;
};

let recordIdCounter = 1;

export const generateMockAttendanceRecords = (students: Student[], classes: SchoolClass[], days: number): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const startDate = dayjs().subtract(days, 'day'); // Start from 'days' ago

  students.forEach(student => {
    // Each student attends 1 to 3 classes per day for simplicity in mock data
    const studentClasses = faker.helpers.arrayElements(classes, faker.number.int({ min: 1, max: 3 }));

    for (let i = 0; i < days; i++) {
      const currentDate = startDate.add(i, 'day');
      // Skip weekends for more realistic school attendance
      if (currentDate.day() === 0 || currentDate.day() === 6) { // Sunday or Saturday
        continue;
      }

      studentClasses.forEach(cls => {
        const status = faker.helpers.arrayElement(ATTENDANCE_STATUSES);
        let absenceReason: string | undefined = undefined;
        if (status === 'Absent' || status === 'Excused') {
          absenceReason = faker.helpers.arrayElement(ABSENCE_REASONS);
        }
        if (status === 'Late' && Math.random() < 0.3) { // Sometimes add a reason for being late
            absenceReason = faker.helpers.arrayElement(['Traffic', 'Overslept']);
        }


        records.push({
          id: `ATTREC-${String(recordIdCounter++).padStart(6, '0')}`,
          studentId: student.id,
          classId: cls.id,
          date: currentDate.toISOString(),
          status,
          absenceReason,
          notes: status === 'Absent' || status === 'Late' ? faker.lorem.sentence(3) : undefined,
          recordedBy: `USR-${faker.number.int({min:1, max:5})}`, // Mock user ID
          recordedAt: currentDate.add(faker.number.int({min:1, max:8}), 'hour').toISOString() // Mock record time
        });
      });
    }
  });
  return records;
};
