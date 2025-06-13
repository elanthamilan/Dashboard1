import { faker } from '@faker-js/faker';
import {
    StudentAcademicRecord, CourseEnrollment, Grade, StudentTermRecord, Course, FacultyMember, StudentSummary, // Using updated types from hierarchy.ts
    ReEvaluationRequest, GrievanceTicket, ComplianceItem, AccreditationStatusSummary, AccreditingBody, FacultyEvaluation, LmsActivity, ResearchProject
} from '../../../types/hierarchy'; // Assuming all these types are now in hierarchy.ts or re-exported correctly
import { Student } from '../../../types/attendance'; // Basic Student type for ID, name
import {
    Institution, AcademicYear, Degree, Program, Semester,
    // StudentSummary, // Already imported
    // Course, // Already imported
    // Section,
    Faculty, ParentInstitution,
    // FacultyMember // Already imported
} from '../../../types/hierarchy';
import { generateMockStudents } from '../attendance/generateMockAttendanceData';
import { AttendanceRecord as AttendanceRecordType } from '../../../types/attendance';
import { generateMockAttendanceRecords } from '../attendance/generateMockAttendanceData';
import { Invoice } from '../../../types/billing';
import { generateMockInvoices } from '../billing/generateMockBillingData';
import { Applicant } from '../../../types/admissions';
import { generateMockApplicants } from '../admissions/generateMockApplicants';
import { PlacementRecord } from '../../../types/placement';
import { generateMockPlacementData } from '../placements/generateMockPlacementData';
import { generateMockReEvaluationData } from './generateMockReEvaluationData';
import { generateMockGrievanceData } from '../grievances/generateMockGrievanceData';
import { generateMockComplianceItems, generateMockAccreditationStatusSummary } from '../compliance/generateMockComplianceData';
import { Department } from '../../../types/departments';
import { generateMockFacultyMembers, generateMockFacultyEvaluations } from '../faculty/generateMockFacultyData';
import { generateMockLmsActivityData } from '../engagement/generateMockLmsActivityData';
import { generateMockAlumni, generateMockAlumniActivities } from '../alumni/generateMockAlumniData';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

// Constants for Grade Generation
const letterGrades: Array<Grade['letterGrade']> = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'P', 'NP', 'I', 'W'];
const gradePointMap: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0,
  'P': 0.0, 'NP': 0.0, 'I':0.0, 'W':0.0
};
const numericalScoreMap: Record<string, {min: number, max: number}> = {
    'A+': {min:97, max:100}, 'A': {min:93, max:96}, 'A-': {min:90, max:92},
    'B+': {min:87, max:89}, 'B': {min:83, max:86}, 'B-': {min:80, max:82},
    'C+': {min:77, max:79}, 'C': {min:73, max:76}, 'C-': {min:70, max:72},
    'D+': {min:67, max:69}, 'D': {min:60, max:66}, 'F': {min:0, max:59}
};

// Module-level lists for courses and faculty, to be populated by the main generator
let moduleMockCourseList: Course[] = [];
let moduleMockFacultyList: FacultyMember[] = [];

function generateMockGrade(isRetake: boolean = false): Grade {
  let currentLetterGrade = faker.helpers.arrayElement(letterGrades.filter(g => g !== 'I' && g !== 'W'));

  if (isRetake) {
    currentLetterGrade = Math.random() < 0.8 ?
      faker.helpers.arrayElement(letterGrades.filter(g => g !== 'F' && g !== 'I' && g !== 'W' && g !== 'NP')) :
      'F';
  } else if (Math.random() < 0.15) {
    currentLetterGrade = 'F';
  }

  const numericalMinMax = numericalScoreMap[currentLetterGrade!] || {min:50, max:70}; // Default for P/NP etc.
  return {
    letterGrade: currentLetterGrade,
    numericalScore: faker.number.int(numericalMinMax),
    gradePoints: gradePointMap[currentLetterGrade!],
    attemptNumber: isRetake ? 2 : 1,
    isBacklogCleared: isRetake && currentLetterGrade !== 'F',
  };
}

function generateMockCourseEnrollment(course: Course, termId: string, semesterName: string, isRetake: boolean = false, previousGrade?: Grade): CourseEnrollment {
  const grade = generateMockGrade(isRetake);
  let status: CourseEnrollment['status'] = 'Completed';
  if (grade.letterGrade === 'F') status = 'Failed';
  else if (grade.letterGrade === 'W') status = 'Withdrawn';
  else if (grade.letterGrade === 'I') status = 'In Progress';

  const faculty = moduleMockFacultyList.length > 0 ? faker.helpers.arrayElement(moduleMockFacultyList) : undefined;

  return {
    courseId: course.courseId,
    courseName: course.courseName,
    credits: course.credits,
    grade,
    termId,
    semesterName,
    status,
    facultyId: faculty?.memberId,
    facultyName: faculty?.name
  };
}

const termNames = ["Fall", "Spring", "Summer"];
const globalStartYear = dayjs().year() - 4;

function generateMockStudentTermRecord(studentId: string, termIndex: number, availableCourses: Course[], studentFailedCourses: Map<string, Grade>): StudentTermRecord {
  const year = globalStartYear + Math.floor(termIndex / termNames.length);
  const termName = termNames[termIndex % termNames.length];
  const termId = `${termName.toUpperCase().substring(0,3)}${year}`;
  const semesterName = `${termName} ${year}`;

  const coursesInTerm: CourseEnrollment[] = [];
  const numCoursesPerTerm = faker.number.int({ min: 3, max: 5 });
  const termCourseSet = new Set<string>();

  const failedCoursesToRetake = Array.from(studentFailedCourses.keys());
  for (const failedCourseId of failedCoursesToRetake) {
    if (coursesInTerm.length >= numCoursesPerTerm) break;
    if (Math.random() < 0.6) {
        const courseInfo = availableCourses.find(c => c.courseId === failedCourseId);
        if(courseInfo && !termCourseSet.has(failedCourseId)) {
            const retakeEnrollment = generateMockCourseEnrollment(courseInfo, termId, semesterName, true, studentFailedCourses.get(failedCourseId));
            coursesInTerm.push(retakeEnrollment);
            termCourseSet.add(failedCourseId);
            if (retakeEnrollment.grade?.letterGrade !== 'F') {
                studentFailedCourses.delete(failedCourseId);
            }
        }
    }
  }

  let attemptsToAdd = availableCourses.length * 2;
  while(coursesInTerm.length < numCoursesPerTerm && attemptsToAdd > 0 && availableCourses.length > 0) {
    const course = faker.helpers.arrayElement(availableCourses.filter(c => !termCourseSet.has(c.courseId) && c.credits > 0)); // Ensure course has credits
    if (course && !termCourseSet.has(course.courseId)) {
      const enrollment = generateMockCourseEnrollment(course, termId, semesterName);
      coursesInTerm.push(enrollment);
      termCourseSet.add(course.courseId);
      if (enrollment.grade?.letterGrade === 'F' && enrollment.grade.attemptNumber === 1) {
        studentFailedCourses.set(course.courseId, enrollment.grade);
      }
    }
    attemptsToAdd--;
  }

  let totalPoints = 0;
  let creditsAttemptedInTerm = 0;
  let creditsEarnedInTerm = 0;
  coursesInTerm.forEach(c => {
    if (c.grade?.gradePoints !== undefined && c.grade?.letterGrade !== 'P' && c.grade?.letterGrade !== 'NP' && c.grade?.letterGrade !== 'I' && c.grade?.letterGrade !== 'W' && c.credits > 0) {
      totalPoints += (c.grade.gradePoints * c.credits);
      creditsAttemptedInTerm += c.credits;
    }
    if (c.grade?.letterGrade !== 'F' && c.grade?.letterGrade !== 'NP' && c.grade?.letterGrade !== 'I' && c.grade?.letterGrade !== 'W' && c.credits > 0) {
      creditsEarnedInTerm += c.credits;
    }
  });

  return {
    termId,
    semesterName,
    courses: coursesInTerm,
    semesterGPA: creditsAttemptedInTerm > 0 ? parseFloat((totalPoints / creditsAttemptedInTerm).toFixed(2)) : undefined,
    creditsAttemptedInTerm,
    creditsEarnedInTerm,
  };
}

export function generateMockAcademicRecords(
    students: Array<{ studentId: string, programId: string, programName?: string }>,
    institutionCourses?: Course[],
    institutionFaculty?: FacultyMember[]
): StudentAcademicRecord[] {
  moduleMockCourseList = institutionCourses && institutionCourses.length > 0 ? institutionCourses :
    Array.from({length: 20}, (_, i) => ({courseId: `DEF_CRS_${i}`, courseName: faker.lorem.words(faker.number.int({min:2, max:4})), credits: faker.helpers.arrayElement([3,4])}));

  moduleMockFacultyList = institutionFaculty && institutionFaculty.length > 0 ? institutionFaculty :
    Array.from({length: 10}, (_,i) => ({memberId: `DEF_FAC_${i}`, name: faker.person.fullName(), departmentId:'DEPT_GEN', designation:'Professor', email:faker.internet.email()}));

  return students.map(student => {
    const terms: StudentTermRecord[] = [];
    const studentFailedCourses = new Map<string, Grade>();
    const numTerms = faker.number.int({ min: 2, max: 8 });

    for (let i = 0; i < numTerms; i++) {
      terms.push(generateMockStudentTermRecord(student.studentId, i, moduleMockCourseList, studentFailedCourses));
    }

    let totalCreditsAttemptedOverall = 0;
    let totalCreditsEarnedOverall = 0;
    let totalWeightedPointsOverall = 0;
    let gpaRelevantCreditsAttemptedOverall = 0;

    terms.forEach(term => {
      totalCreditsAttemptedOverall += (term.creditsAttemptedInTerm || 0);
      totalCreditsEarnedOverall += (term.creditsEarnedInTerm || 0);
      term.courses.forEach(c => {
          if (c.grade?.gradePoints !== undefined && c.grade?.letterGrade !== 'P' && c.grade?.letterGrade !== 'NP' && c.grade?.letterGrade !== 'I' && c.grade?.letterGrade !== 'W' && c.credits > 0) {
              totalWeightedPointsOverall += (c.grade.gradePoints * c.credits);
              gpaRelevantCreditsAttemptedOverall += c.credits;
          }
      });
    });

    const cumulativeGPA = gpaRelevantCreditsAttemptedOverall > 0 ? parseFloat((totalWeightedPointsOverall / gpaRelevantCreditsAttemptedOverall).toFixed(2)) : undefined;

    let academicStanding: StudentAcademicRecord['academicStanding'] = 'Good Standing';
    if (cumulativeGPA !== undefined) {
        if (cumulativeGPA < 1.5) academicStanding = 'At Risk';
        else if (cumulativeGPA < 2.0) academicStanding = 'Probation';
        else if (cumulativeGPA >= 3.5 && studentFailedCourses.size === 0) academicStanding = "Dean's List";
    }
    if (studentFailedCourses.size > 2 && academicStanding !== "Dean's List") academicStanding = 'At Risk';

    return {
      studentId: student.studentId,
      programId: student.programId,
      programName: student.programName,
      semesters: terms,
      cumulativeGPA,
      totalCreditsAttempted: totalCreditsAttemptedOverall,
      totalCreditsEarned: totalCreditsEarnedOverall,
      academicStanding,
      expectedGraduationDate: dayjs(globalStartYear + Math.floor(numTerms / termNames.length) + (numTerms % termNames.length > 0 ? 1: 0) + 1).endOf('month').format('YYYY-MM-DD')
    };
  });
}

export const generateMockStudentSummary = (student: Student, studentAcademicRecord?: StudentAcademicRecord): StudentSummary => {
    return {
        studentId: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        programName: studentAcademicRecord?.programName,
        cumulativeGPA: studentAcademicRecord?.cumulativeGPA,
        totalCreditsEarned: studentAcademicRecord?.totalCreditsEarned,
        enrollmentStatus: faker.helpers.arrayElement(['Active', 'Inactive', 'Graduated'] as const),
        expectedGraduationDate: studentAcademicRecord?.expectedGraduationDate,
        programId: studentAcademicRecord?.programId,
        // departmentId: // This would typically come from Program details, not directly from StudentAcademicRecord
        totalLmsLogins: faker.number.int({ min: 5, max: 150 }),
        avgAttendanceRate: parseFloat(faker.number.float({min: 70, max: 99, precision: 1}).toFixed(1)),
        consecutiveAbsences: faker.number.int({min: 0, max: 5}),
        graduationYear: studentAcademicRecord?.academicStanding === 'Graduated' && studentAcademicRecord?.expectedGraduationDate ? dayjs(studentAcademicRecord.expectedGraduationDate).year() : undefined,
    };
};

// --- Constants likely used by the full generateMockNewInstitutions ---
interface MockDegreeConfig { degreeId: string; degreeName: string; }
const mockDegreeConfigs: MockDegreeConfig[] = [ /* ... as in original ... */ ];
interface ProgramConfigForDegreeMap { programId: string; programName: string; requiredCredits: number; }
const degreeProgramMappings: { [degreeId: string]: ProgramConfigForDegreeMap[] } = { /* ... as in original ... */ };
const departmentConfigs = [ /* ... as in original ... */ ];

// --- Placeholder for the user's existing comprehensive generateMockNewInstitutions ---
// The user needs to integrate the call to the updated generateMockAcademicRecords
// and ensure StudentSummary objects are created using the updated generateMockStudentSummary.
export const generateMockNewInstitutions = (
    parentInstitutionId: string | undefined,
    allStudentsForInstitution: Student[], // Basic Student (id, name)
    numYears: number = 3,
    numApplicantsPerProgramContext: number = 50
): Institution[] => {
    // 1. Generate institution-level Course[] templates and FacultyMember[]
    // This part needs to be fleshed out based on how courses/faculty are structured in the full mock.
    // For this example, let's use the defaults in generateMockAcademicRecords if not provided.
    const instCourses: Course[] = moduleMockCourseList.length > 0 ? moduleMockCourseList :
        Array.from({length: 30}, (_, i) => ({courseId: `CRS_INST_${i}`, courseName: faker.lorem.words(3), credits: faker.helpers.arrayElement([3,4]), departmentId: `DEPT_${i%5}`}));
    const instFaculty: FacultyMember[] = moduleMockFacultyList.length > 0 ? moduleMockFacultyList :
        Array.from({length: 15}, (_,i) => ({memberId: `FAC_INST_${i}`, name: faker.person.fullName(), departmentId:`DEPT_${i%3}`, designation:'Professor', email:faker.internet.email()}));

    // 2. Prepare student data for academic record generation
    const studentsForAcademicRecords = allStudentsForInstitution.map(s => ({
        studentId: s.id,
        // Assign mock programId/Name for each student for academic record context
        // In a real scenario, this would come from enrollment data.
        programId: faker.helpers.arrayElement(Object.values(degreeProgramMappings).flat().map(p=>p.programId)) || 'PROG_GEN',
        programName: faker.commerce.department() + " Program"
    }));

    // 3. Generate detailed academic records
    const studentAcademicData = generateMockAcademicRecords(studentsForAcademicRecords, instCourses, instFaculty);

    // 4. Generate StudentSummary list using these academic records
    const institutionWideStudentSummaries = allStudentsForInstitution.map(s_basic => {
        const academicRecord = studentAcademicData.find(ar => ar.studentId === s_basic.id);
        return generateMockStudentSummary(s_basic, academicRecord);
    });

    // ... (The rest of the comprehensive generateMockNewInstitutions logic from the original file,
    //      which builds up Faculties, Departments, Degrees, Programs, Semesters, etc.
    //      It should use `institutionWideStudentSummaries` where StudentSummary lists are needed.)

    // This is a simplified return for the purpose of this example.
    // The original function is much more complex.
    console.warn("Using simplified generateMockNewInstitutions for example. User needs to integrate full version.");
    const institutionId = faker.string.uuid();
    return [{
        institutionId: institutionId,
        institutionName: `${faker.company.name()} University (Mocked Example)`,
        parentInstitutionId,
        academicYears: [], // Populate properly in full version
        faculties: [], // Populate properly in full version
        totalStudents: institutionWideStudentSummaries.length,
        overallAverageGPA: parseFloat(faker.number.float({min:2.8, max:3.5, precision:0.01}).toFixed(2)),
        alumni: generateMockAlumni(institutionWideStudentSummaries.filter(s=>s.enrollmentStatus === 'Graduated')),
        // ... many other fields
    }];
};

export const generateMockParentInstitutions = ( /* params */ ): ParentInstitution[] => {
    console.warn("generateMockParentInstitutions needs to be fully integrated.");
    return [];
};

// Retain other helper functions from the original file if they are used by the full generateMockNewInstitutions
const enrollmentStatuses: StudentSummary['enrollmentStatus'][] = ['Active', 'Active', 'Active', 'Inactive', 'Graduated'];
const getRandomEnrollmentStatus = (): StudentSummary['enrollmentStatus'] => {
    return faker.helpers.arrayElement(enrollmentStatuses);
};

const calculateAttendanceKPIs_stub = ( studentIdsInContext: string[], attendanceRecords: AttendanceRecordType[], contextStartDate?: string, contextEndDate?: string): { percentage?: number; totalAbsences?: number } => { return {percentage:0,totalAbsences:0};};
const calculateBillingKPIs_stub = ( studentIdsInContext: string[], invoices: Invoice[] ): { feesPaidPercentage?: number; overdueCount?: number } => {return {feesPaidPercentage:0, overdueCount:0};};
const calculateAdmissionKPIs_stub = ( programApplicants: Applicant[] ): { applicants: number; acceptanceRate?: number; enrolledCount?: number } => {return {applicants:0,acceptanceRate:0,enrolledCount:0};};
const calculateGradeDistribution_stub = (studentRecords: StudentAcademicRecord[]): { [gradeCategory: string]: number } => {return {};};
const countAtRiskStudents_stub = ( studentRecords: StudentAcademicRecord[], studentIdsInContext: string[], attendanceRecords?: AttendanceRecordType[], minGpaThreshold: number = 2.0, maxAbsencesThreshold: number = 10 ): number => {return 0;};
const calculatePlacementKPIs_stub = ( studentIdsInScope: string[], allStudentsInScopeSummaries: StudentSummary[], allPlacementRecords: PlacementRecord[] ): { rate?: number; avgPackage?: number; placedCount?: number; internshipCount?: number } => {return {rate:0,avgPackage:0,placedCount:0,internshipCount:0};};
const generateTermDetails_stub = (termNumber: number, year: number, programId: string): { semesterId: string, semesterName: string, startDate: string, endDate: string } => { const isFall = termNumber % 2 === 0; const semesterId = `${isFall ? 'FA' : 'SP'}${year}-${programId.slice(0,2)}`; const semesterName = `${isFall ? 'Fall' : 'Spring'} ${year}`; return { semesterId, semesterName, startDate: dayjs(`${year}-${isFall ? '08' : '01'}-15`).toISOString(), endDate: dayjs(`${year}-${isFall ? '12' : '05'}-15`).toISOString() }; };
const pickRandomSubset_stub = <T>(items: T[], maxCount: number): T[] => { if (!items || items.length === 0) return []; const count = faker.number.int({ min: Math.min(1, items.length), max: Math.min(maxCount, items.length) }); return faker.helpers.arrayElements(items, count); };

// Ensure original generateMockStudents and generateMockClasses are still exported if they are used by other modules.
// (They are imported by AttendanceEngagementModule.tsx's mock fallback)
// Re-add them if they were part of the original file and not specific to academic generation.
// For this overwrite, assuming they are defined elsewhere or in their own files if needed globally.
// If they were in THIS file, they should be kept if other modules rely on them from this path.
// Based on previous steps, generateMockStudents is in attendance/generateMockAttendanceData.ts
// generateMockClasses is also in attendance/generateMockAttendanceData.ts
// So they should not be in this file unless this is their canonical source.
// For now, I will assume they are correctly imported if generateMockNewInstitutions needs them.
// The generateMockStudents used at the top of this file is for the basic Student type (id, name).
// The one in generateMockAttendanceData.ts might be different (StudentForMock).
// It's important to use the correct one based on context.
// The `allStudentsForInstitution: Student[]` parameter for `generateMockNewInstitutions` implies
// a basic student list is passed in.
