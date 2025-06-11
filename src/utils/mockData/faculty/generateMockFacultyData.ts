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

// Added ResearchProject to imports for academics.ts
import { ResearchProject } from '../../../types/academics';

export const generateMockResearchProjects = (
  facultyMembers: FacultyMember[],
  projectsPerFacultyMemberTarget: number = 1, // Avg projects per faculty, some might have 0
  students?: StudentSummary[] // Optional: for adding student team members
): ResearchProject[] => {
  const projects: ResearchProject[] = [];
  let projectIdCounter = 1;
  if (!facultyMembers || facultyMembers.length === 0) return projects;

  const projectStatuses: ResearchProject['status'][] = ['Ongoing', 'Completed', 'Submitted', 'Published', 'OnHold'];
  const fundingAgencies = ['National Science Foundation', 'Ministry of Education', 'Industry Partner X', 'Internal Grant', 'Self-Funded'];

  facultyMembers.forEach(faculty => {
    // Not all faculty will have projects
    if (faker.datatype.boolean(0.6)) { // 60% chance a faculty member has projects
      const numProjects = faker.number.int({ min: 1, max: Math.floor(projectsPerFacultyMemberTarget * 1.5) });
      for (let i = 0; i < numProjects; i++) {
        const startDate = faker.date.past({ years: 3 });
        const status = faker.helpers.arrayElement(projectStatuses);
        const endDate = (status === 'Completed' || status === 'Published') ? faker.date.between({from: startDate, to: new Date()}) :
                        (status === 'Ongoing' || status === 'Submitted') ? faker.date.future({years:2, refDate: startDate}) : undefined;

        const publications = (status === 'Published' || (status === 'Completed' && faker.datatype.boolean()))
          ? Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => ({
              title: faker.lorem.sentence(5),
              journal: faker.datatype.boolean() ? `${faker.lorem.words(2)} Journal` : undefined,
              year: dayjs(endDate || new Date()).year() - faker.number.int({min:0, max:2}),
              doi: faker.datatype.boolean() ? `10.1000/${faker.string.alphanumeric(6)}` : undefined,
            }))
          : [];

        const teamMembers: ResearchProject['teamMembers'] = [];
        // Add PI
        teamMembers.push({ facultyId: faculty.facultyId, name: `${faculty.firstName} ${faculty.lastName}`, role: 'Principal Investigator'});
        // Add other faculty
        if (facultyMembers.length > 1 && faker.datatype.boolean(0.3)) {
            const otherFaculty = faker.helpers.arrayElement(facultyMembers.filter(fm => fm.facultyId !== faculty.facultyId));
            if(otherFaculty) teamMembers.push({ facultyId: otherFaculty.facultyId, name: `${otherFaculty.firstName} ${otherFaculty.lastName}`, role: 'Co-Investigator'});
        }
        // Add students
        if (students && students.length > 0 && faker.datatype.boolean(0.5)) {
            const numStudents = faker.number.int({min:1, max:3});
            for(let k=0; k<numStudents; k++){
                const student = faker.helpers.arrayElement(students);
                teamMembers.push({ studentId: student.studentId, name: `${student.firstName} ${student.lastName}`, role: 'Research Assistant'});
            }
        }

        projects.push({
          projectId: `PROJ-${String(projectIdCounter++).padStart(4, '0')}`,
          title: faker.lorem.sentence(faker.number.int({min:5, max:12})),
          principalInvestigatorId: faculty.facultyId,
          principalInvestigatorName: `${faculty.firstName} ${faculty.lastName}`,
          departmentId: faculty.departmentId,
          status,
          startDate: startDate.toISOString(),
          endDate: endDate?.toISOString(),
          abstract: faker.lorem.paragraphs(faker.number.int({min:1, max:2})),
          fundingAmount: faker.datatype.boolean() ? faker.number.int({ min: 5000, max: 200000 }) : undefined,
          fundingAgency: faker.datatype.boolean() ? faker.helpers.arrayElement(fundingAgencies) : undefined,
          publications,
          teamMembers,
        });
      }
    }
  });
  return projects;
};
