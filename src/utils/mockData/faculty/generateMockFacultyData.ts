// src/utils/mockData/faculty/generateMockFacultyData.ts
import { faker } from '@faker-js/faker';
import { FacultyMember, FacultyEvaluation } from '../../../types/academics'; // Path to academics.ts
import { Department } from '../../../types/departments'; // Corrected path to departments.ts
import { StudentSummary } from '../../../types/hierarchy';
// import { CourseEnrollment } from '../../../types/hierarchy'; // If using courses for eval context (not used in this version)

export const generateMockFacultyMembers = (
  departments: Department[], // Expecting Department objects which include departmentId and departmentName
  facultyPerDept: number = 5
): FacultyMember[] => {
  const faculty: FacultyMember[] = [];
  let facultyIdCounter = 1;
  if (!departments || departments.length === 0) return faculty;

  departments.forEach(dept => {
    for (let i = 0; i < facultyPerDept; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      faculty.push({
        facultyId: `FAC-${String(facultyIdCounter++).padStart(4, '0')}`,
        firstName,
        lastName,
        email: faker.internet.email({firstName, lastName}),
        departmentId: dept.departmentId,
        departmentName: dept.departmentName, // departmentName is on Department type
      });
    }
  });
  return faculty;
};

export const generateMockFacultyEvaluations = (
  facultyMembers: FacultyMember[],
  students: StudentSummary[],
  // courses: CourseEnrollment[], // Optional, if evaluations are course-specific (not used in this version)
  evalsPerFacultyMemberTarget: number = 10 // Target number of evaluations per faculty
): FacultyEvaluation[] => {
  const evaluations: FacultyEvaluation[] = [];
  let evalIdCounter = 1;
  if (!facultyMembers || facultyMembers.length === 0 || !students || students.length === 0) return evaluations;

  facultyMembers.forEach(faculty => {
    const numEvals = faker.number.int({ min: Math.floor(evalsPerFacultyMemberTarget * 0.5), max: Math.ceil(evalsPerFacultyMemberTarget * 1.5) });
    for (let i = 0; i < numEvals; i++) {
      if (students.length === 0) break; // Should not happen if students array is not empty initially
      const student = faker.helpers.arrayElement(students);
      // const course = courses.length > 0 ? faker.helpers.arrayElement(courses) : undefined;

      evaluations.push({
        evaluationId: `EVAL-${String(evalIdCounter++).padStart(5, '0')}`,
        facultyId: faculty.facultyId,
        studentId: student.studentId,
        // courseId: course?.courseId, // Example if course specific
        // termId: course?.termId,    // Example if course specific
        rating: faker.number.int({ min: 3, max: 10 }), // Assuming 1-10 scale, skewed positive
        comments: faker.datatype.boolean(0.6) ? faker.lorem.paragraph() : undefined,
        submissionDate: faker.date.past({ years: 1 }).toISOString(),
      });
    }
  });
  return evaluations;
};
