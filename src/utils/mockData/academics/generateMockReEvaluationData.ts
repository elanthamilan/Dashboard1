import { faker } from '@faker-js/faker';
import { ReEvaluationRequest } from '../../../types/academics';
import { StudentSummary } from '../../../types/hierarchy'; // Assuming CourseEnrollment is also in hierarchy or imported if separate
// If CourseEnrollment is not in hierarchy.ts, it needs its own import:
import { CourseEnrollment } from '../../../types/hierarchy'; // or '../components/StudentPerformanceDashboard/types' if that's where it lives
import dayjs from 'dayjs';

const gradeLetters = ['A', 'B+', 'B', 'C+', 'C', 'D', 'F'];

export const generateMockReEvaluationData = (
  students: StudentSummary[],
  allCourseEnrollmentTemplates: CourseEnrollment[],
  count: number = 50
): ReEvaluationRequest[] => {
  const requests: ReEvaluationRequest[] = [];
  if (students.length === 0 || allCourseEnrollmentTemplates.length === 0) {
    return requests;
  }

  for (let i = 0; i < count; i++) {
    const student = faker.helpers.arrayElement(students);
    // Ensure the course template has a grade, otherwise, mock one.
    let courseTemplate = faker.helpers.arrayElement(allCourseEnrollmentTemplates);
    if (!courseTemplate.grade?.letterGrade) {
        // Create a temporary course object with a mock grade if the template doesn't have one
        courseTemplate = {
            ...courseTemplate, // spread existing properties
            grade: { // add or overwrite grade
                letterGrade: faker.helpers.arrayElement(gradeLetters) as 'A'|'B+'|'B'|'C+'|'C'|'D'|'F', // Type assertion
                numericalScore: faker.number.int({min: 40, max: 100}), // Example score
                points: 0 // Points calculation would be complex here, set to 0 or look up
            }
        };
    }

    const requestDate = faker.date.past({ years: 1 });
    const status = faker.helpers.arrayElement<'Pending' | 'Approved' | 'Rejected' | 'Cancelled'>([
      'Pending', 'Pending', 'Approved', 'Approved', 'Rejected', 'Cancelled'
    ]);
    let resolutionDate: string | undefined = undefined;
    let newGrade: string | undefined = undefined;
    // This line is critical: Ensure courseTemplate.grade is defined before accessing letterGrade
    const originalGrade = courseTemplate.grade!.letterGrade; // Non-null assertion because we checked/created it

    if (status === 'Approved' || status === 'Rejected' || status === 'Cancelled') {
      resolutionDate = dayjs(faker.date.future({ refDate: requestDate, years: 0.2 })).toISOString();
      if (status === 'Approved') {
        newGrade = faker.helpers.arrayElement(gradeLetters.filter(g => g !== originalGrade));
        if (!newGrade && gradeLetters.length > 0 && originalGrade !== gradeLetters[0]) {
          newGrade = gradeLetters[0];
        } else if (!newGrade && gradeLetters.length > 1) {
          newGrade = gradeLetters[1]; // Fallback if originalGrade was the first one
        } else if (!newGrade && gradeLetters.length > 0) {
          newGrade = gradeLetters[0]; // Absolute fallback
        }
      }
    }

    requests.push({
      requestId: `REVAL-${String(i + 1).padStart(4, '0')}`,
      studentId: student.studentId,
      courseId: courseTemplate.courseId,
      courseName: courseTemplate.courseName,
      originalGrade: originalGrade,
      requestedGrade: status === 'Pending' ? faker.helpers.arrayElement(gradeLetters) : undefined,
      newGrade: newGrade,
      status: status,
      requestDate: requestDate.toISOString(),
      resolutionDate: resolutionDate,
      reasonForRequest: faker.lorem.sentence(),
      commentsByEvaluator: status !== 'Pending' ? faker.lorem.paragraph() : undefined,
    });
  }
  return requests;
};
