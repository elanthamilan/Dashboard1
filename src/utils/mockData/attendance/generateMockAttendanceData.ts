import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';
import { AttendanceRecord, AttendanceStatus } from '../../../types/attendance'; // Ensure path
import { SchoolClass, StudentSummary } // Assuming StudentSummary might be used to get student names for denormalization if needed later
    from '../../../types/hierarchy'; // Ensure path

// For generateMockStudents, if it's still needed elsewhere, otherwise it can be removed if student objects are sourced from academic mock data.
export interface StudentForMock { // Renamed to avoid conflict if types/hierarchy.ts also has Student
  id: string;
  firstName: string;
  lastName: string;
  gradeLevel?: number;
  homeroom?: string;
}

const absenceReasons = ['Sick leave', 'Family emergency', 'Appointment', 'Technical issues', 'Transportation delay', 'Personal reasons', 'University event', 'Not specified'];
const allStatuses: AttendanceStatus[] = ['Present', 'Present', 'Present', 'Absent', 'Late', 'Excused', 'Present']; // Skewed towards present

export function generateMockStudents(count: number): StudentForMock[] {
  const students: StudentForMock[] = [];
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
}

export const generateMockClasses = (count: number): SchoolClass[] => {
  const subjects = ['Mathematics', 'Science', 'History', 'English', 'Art', 'Physical Education', 'Music', 'Geography', 'Computer Lab', 'Physics Lab'];
  const classes: SchoolClass[] = [];
  for (let i = 0; i < count; i++) {
    const subject = faker.helpers.arrayElement(subjects);
    classes.push({
      id: `CLS-${String(i + 1).padStart(3, '0')}`,
      name: `${subject} ${faker.number.int({min: 100, max: 400})}`, // Matches SchoolClass 'name'
      subject: subject, // Matches SchoolClass 'subject'
      // Other SchoolClass fields can be added here if needed by other parts of the application
    });
  }
  return classes;
};


export function generateMockAttendanceRecords(
    studentIds: string[],
    classes: SchoolClass[],
    numDays: number,
    startDate: string = dayjs().subtract(numDays, 'days').format('YYYY-MM-DD')
): AttendanceRecord[] {
    const records: AttendanceRecord[] = [];
    let recordIdCounter = 1;
    const studentsWithConsecutiveAbsences = new Set<string>();

    if (studentIds.length > 0) { // Ensure there are students before trying to pick from them
        for(let i=0; i< Math.min(3, Math.floor(studentIds.length / 5) + 1) ; i++){ // ensure at least 1 if students < 15
            studentsWithConsecutiveAbsences.add(faker.helpers.arrayElement(studentIds));
        }
    }


    studentIds.forEach(studentId => {
        let consecutiveAbsenceCount = 0;
        let lastStatus: AttendanceStatus | null = null;

        for (let i = 0; i < numDays; i++) {
            const recordDate = dayjs(startDate).add(i, 'days');
            const dayOfWeek = recordDate.format('dddd');

            if (dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday') {
                 // Records for Holiday status on Weekends
                records.push({
                    id: `REC-${recordIdCounter++}`,
                    studentId,
                    date: recordDate.format('YYYY-MM-DD'),
                    status: 'Holiday',
                    dayOfWeek,
                    // classId, className, courseId, courseName might be undefined for a general holiday
                });
                lastStatus = 'Holiday';
                consecutiveAbsenceCount = 0;
                continue;
            }

            if (Math.random() < 0.02 && dayOfWeek !== 'Saturday' && dayOfWeek !== 'Sunday') {
                 records.push({
                    id: `REC-${recordIdCounter++}`,
                    studentId,
                    date: recordDate.format('YYYY-MM-DD'),
                    status: 'Holiday',
                    dayOfWeek,
                    absenceReason: 'Public Holiday'
                });
                 lastStatus = 'Holiday';
                 consecutiveAbsenceCount = 0;
                 continue;
            }

            // Each student attends 1 to 2 classes per day for mock data simplicity
            const numClassesToday = faker.number.int({min: 1, max: Math.min(2, classes.length) });
            const todaysClasses = faker.helpers.arrayElements(classes, numClassesToday);

            for (const chosenClass of todaysClasses) {
                let currentStatus: AttendanceStatus;

                if (studentsWithConsecutiveAbsences.has(studentId) && consecutiveAbsenceCount < faker.number.int({min:3, max:5}) && (lastStatus === 'Absent' || lastStatus === null || Math.random() < 0.6)) {
                    currentStatus = 'Absent';
                    consecutiveAbsenceCount++;
                } else {
                    currentStatus = faker.helpers.arrayElement(allStatuses);
                    if(lastStatus === 'Absent' && currentStatus !== 'Absent') consecutiveAbsenceCount = 0;
                    else if (currentStatus === 'Absent') consecutiveAbsenceCount++; else consecutiveAbsenceCount = 0;
                }

                lastStatus = currentStatus;

                const record: AttendanceRecord = {
                    id: `REC-${recordIdCounter++}`,
                    studentId,
                    classId: chosenClass.id,
                    className: chosenClass.name,
                    courseId: chosenClass.id, // Assuming classId can double as courseId for this mock structure
                    courseName: chosenClass.name, // Or map to a more general course name if available
                    date: recordDate.format('YYYY-MM-DD'),
                    dayOfWeek,
                    status: currentStatus,
                    absenceReason: currentStatus === 'Absent' || currentStatus === 'Excused' ? faker.helpers.arrayElement(absenceReasons) : undefined,
                    notes: Math.random() < 0.1 ? faker.lorem.sentence(3) : undefined,
                    entryTime: currentStatus === 'Late' ? `09:${faker.number.int({min:5,max:30}).toString().padStart(2,'0')}` : (currentStatus === 'Present' ? `08:${faker.number.int({min:45,max:59}).toString().padStart(2,'0')}`: undefined),
                    exitTime: currentStatus === 'Present' || currentStatus === 'Late' ? `15:${faker.number.int({min:30,max:59}).toString().padStart(2,'0')}` : undefined,
                    verifiedBy: Math.random() < 0.2 ? `FACULTY-${faker.string.alphanumeric({length: 3, casing:'upper'})}` : undefined,
                };
                records.push(record);
            }
        }
    });
    return records;
}
