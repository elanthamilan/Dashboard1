import { faker } from '@faker-js/faker';
import {
    StudentAcademicRecord, Term, CourseEnrollment, Grade, SkillProficiency, K12StandardMastery, OnlineLearningProgress
} from '../../../components/StudentPerformanceDashboard/types';
import { Student } from '../../../components/AttendanceDashboard/types';
import {
    Institution,
    AcademicYear,
    Degree,
    Program,
    Semester,
    StudentSummary
} from '../../../types/hierarchy'; // Path to the new hierarchy types
import { generateMockStudents } from '../attendance/generateMockAttendanceData'; // To get student list

import dayjs from 'dayjs';
import { faker } from '@faker-js/faker'; // faker was used but not explicitly imported at the top

// Helper to assign grade points (simplified)
const gradeToPoints = (letterGrade: Grade['letterGrade']): number => {
    const mapping: { [key in Grade['letterGrade']]: number } = {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0, 'F': 0.0,
        'P': 0.0, 'NP': 0.0, // Pass/No Pass usually don't count towards GPA
    };
    return mapping[letterGrade] || 0;
};

const letterGrades: Grade['letterGrade'][] = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'F']; // Skewed for demo

const generateMockCourseEnrollment = (termId: string): CourseEnrollment => {
    const subject = faker.helpers.arrayElement(['CS', 'MA', 'EN', 'PH', 'HI', 'EC']);
    const courseNum = faker.number.int({ min: 100, max: 499 });
    const letterGrade = faker.helpers.arrayElement(letterGrades);
    const numericalScore = letterGrade === 'F' ? faker.number.int({min: 0, max: 59}) : faker.number.int({min: 60, max: 100});

    return {
        courseId: `${subject}${courseNum}-${termId}`,
        courseCode: `${subject} ${courseNum}`,
        courseName: faker.lorem.words(3).split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), // Title Case
        credits: faker.helpers.arrayElement([3, 4]),
        instructor: faker.person.fullName(),
        grade: {
            letterGrade,
            numericalScore,
            points: gradeToPoints(letterGrade),
        },
        comments: Math.random() > 0.7 ? faker.lorem.sentence() : undefined,
    };
};

const generateMockTerm = (termNumber: number, year: number): Term => {
    const isFall = termNumber % 2 === 0;
    const termId = `${isFall ? 'FA' : 'SP'}${year}`;
    const termName = `${isFall ? 'Fall' : 'Spring'} ${year}`;
    const courses = Array.from({ length: faker.number.int({ min: 3, max: 5 }) }, () => generateMockCourseEnrollment(termId));

    let totalPoints = 0;
    let totalCreditsForGpa = 0;
    courses.forEach(c => {
        if (c.grade && c.grade.points !== undefined && c.grade.letterGrade !== 'P' && c.grade.letterGrade !== 'NP') {
            totalPoints += c.grade.points * c.credits;
            totalCreditsForGpa += c.credits;
        }
    });
    const termGPA = totalCreditsForGpa > 0 ? parseFloat((totalPoints / totalCreditsForGpa).toFixed(2)) : undefined;

    return {
        termId,
        termName,
        startDate: dayjs(`${year}-${isFall ? '08' : '01'}-15`).toISOString(),
        endDate: dayjs(`${year}-${isFall ? '12' : '05'}-15`).toISOString(),
        courses,
        termGPA,
    };
};

const programs = [
    { id: "CS_BS", name: "Bachelor of Science in Computer Science", requiredCredits: 120 },
    { id: "ENG_BA", name: "Bachelor of Arts in English Literature", requiredCredits: 110 },
    { id: "MBA_GEN", name: "Master of Business Administration", requiredCredits: 60 },
    { id: "PSY_BS", name: "Bachelor of Science in Psychology", requiredCredits: 115 },
    { id: "ART_MFA", name: "Master of Fine Arts in Studio Art", requiredCredits: 65 },
];

// Enrollment Statuses
const enrollmentStatuses: StudentSummary['enrollmentStatus'][] = ['Active', 'Active', 'Active', 'Inactive', 'Graduated'];

// Helper to get a random enrollment status
const getRandomEnrollmentStatus = (): StudentSummary['enrollmentStatus'] => {
    return faker.helpers.arrayElement(enrollmentStatuses);
};

export const generateMockStudentSummary = (student: Student, studentAcademicRecord: StudentAcademicRecord): StudentSummary => {
    return {
        studentId: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        programId: studentAcademicRecord.programId || 'UNDEF_PROG', // Default if not defined
        programName: studentAcademicRecord.programName || 'Undefined Program', // Default if not defined
        cumulativeGPA: studentAcademicRecord.cumulativeGPA,
        totalCreditsEarned: studentAcademicRecord.totalCreditsEarned,
        enrollmentStatus: getRandomEnrollmentStatus(),
    };
};

export const generateMockStudentAcademicRecord = (student: Student, studentIndex: number): StudentAcademicRecord => {
    const terms: Term[] = [];
    const currentYear = dayjs().year();
    // Simulate 1 to 4 years of study
    const yearsOfStudy = faker.number.int({ min: 1, max: 4 });
    for (let y = 0; y < yearsOfStudy; y++) {
        terms.push(generateMockTerm(0, currentYear - yearsOfStudy + y + 1)); // Fall
        terms.push(generateMockTerm(1, currentYear - yearsOfStudy + y + 1)); // Spring
    }

    let cumulativeGpa = 0;
    let totalCreditsEarned = 0;
    let totalWeightedPoints = 0;
    let totalCreditsAttemptedForGpa = 0;

    terms.forEach(term => {
        term.courses.forEach(course => {
            if (course.grade && course.grade.points !== undefined && course.grade.letterGrade !== 'F' && course.grade.letterGrade !== 'NP') {
                totalCreditsEarned += course.credits;
            }
            if (course.grade && course.grade.points !== undefined && course.grade.letterGrade !== 'P' && course.grade.letterGrade !== 'NP') {
                totalWeightedPoints += course.grade.points * course.credits;
                totalCreditsAttemptedForGpa += course.credits;
            }
        });
    });
    cumulativeGpa = totalCreditsAttemptedForGpa > 0 ? parseFloat((totalWeightedPoints / totalCreditsAttemptedForGpa).toFixed(2)) : 0;

    const selectedProgram = faker.helpers.arrayElement(programs);

    return {
        studentId: student.id,
        programId: selectedProgram.id,
        programName: selectedProgram.name,
        requiredCreditsForDegree: selectedProgram.requiredCredits,
        enrollmentDate: dayjs(terms[0]?.startDate).subtract(1, 'month').toISOString(),
        expectedGraduationDate: dayjs(terms[terms.length -1]?.endDate).add(1, 'year').toISOString(), // Mock
        terms,
        cumulativeGPA: cumulativeGpa,
        totalCreditsEarned,
        skillProficiencies: Array.from({ length: faker.number.int({ min: 3, max: 6 }) }, () => ({
            skillName: faker.lorem.words(faker.number.int({min: 1, max: 3})).split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            proficiencyLevel: faker.number.int({ min: 40, max: 100 }),
            lastAssessed: faker.date.recent({ days: 180 }).toISOString(),
        })),
        k12StandardsMastery: student.gradeLevel && student.gradeLevel <=12 ? Array.from({length: faker.number.int({min:2, max:5})}, () => ({
            standardId: `K12.MA.${student.gradeLevel}.${faker.string.alphanumeric(3).toUpperCase()}`,
            standardName: faker.lorem.sentence(5),
            masteryStatus: faker.helpers.arrayElement(['Not Assessed', 'Beginning', 'Approaching', 'Met', 'Exceeded']),
            lastAssessedDate: faker.date.recent({days: 90}).toISOString()
        })) : [],
        onlineLearningProgress: Math.random() > 0.5 ? Array.from({length: faker.number.int({min:1, max:2})}, () => ({
            courseName: `Online ${faker.lorem.word()}`,
            moduleId: faker.string.uuid(),
            moduleName: `Module ${faker.number.int({min:1, max:5})}: ${faker.lorem.words(2)}`,
            progressPercent: faker.number.int({min:10, max:100}),
            lastActivityDate: faker.date.recent({days: 30}).toISOString()
        })) : [],
    };
};

export const generateMockAcademicRecords = (students: Student[]): StudentAcademicRecord[] => {
  return students.map((student, index) => generateMockStudentAcademicRecord(student, index));
};

// --- New Hierarchical Mock Data Generation ---

const calculateSemesterAverageGPA = (students: StudentSummary[], courses: CourseEnrollment[], termId: string): number | undefined => {
    let totalGpaPoints = 0;
    let studentsWithGpa = 0;

    students.forEach(student => {
        // This is a simplification. In reality, you'd look up the student's actual grades for this specific term's courses.
        // For mock data, we can use the student's cumulative GPA as a proxy, or generate mock term GPAs for students.
        // Let's assume student.cumulativeGPA is somewhat representative for this mock scenario or we need a more complex setup.
        // A more accurate mock would involve each student having a specific GPA for *each* semester.
        // For now, let's use a simplified approach: if a student is in the semester, we check their overall GPA.
        // This isn't accurate for "semester GPA" but is a starting point for mock data.
        // A better way: The StudentAcademicRecord contains terms, each with a termGPA.
        // We'd need to pass the full StudentAcademicRecord[] here and find the specific student's record,
        // then find this specific term's GPA.

        // Simpler (less accurate) mock:
        if (student.cumulativeGPA !== undefined) {
            totalGpaPoints += student.cumulativeGPA;
            studentsWithGpa++;
        }
    });

    return studentsWithGpa > 0 ? parseFloat((totalGpaPoints / studentsWithGpa).toFixed(2)) : undefined;
};

const calculateSemesterPassRate = (students: StudentSummary[], courses: CourseEnrollment[], termId: string): number | undefined => {
    if (students.length === 0) return undefined;
    // This is also a simplification. "Passing" a semester isn't standard. "Pass rate" usually applies to courses.
    // Let's define "pass rate" for the semester as the percentage of students who have a GPA >= 2.0 for this semester.
    // Again, using cumulativeGPA as a proxy for term performance for simplicity in mocking.
    const passingStudents = students.filter(s => s.cumulativeGPA !== undefined && s.cumulativeGPA >= 2.0).length;
    return parseFloat(((passingStudents / students.length) * 100).toFixed(2));
};


export const generateMockSemester = (term: Term, studentsInProgramForSemester: StudentSummary[]): Semester => {
    // For now, assume all studentsInProgramForSemester are active in this semester.
    // A more complex logic could filter based on enrollment dates, status, etc.
    const semesterStudents = studentsInProgramForSemester;

    return {
        semesterId: term.termId,
        semesterName: term.termName,
        startDate: term.startDate,
        endDate: term.endDate,
        courses: term.courses, // Courses offered in the term, not student-specific enrollments here
        students: semesterStudents,
        averageGPA: calculateSemesterAverageGPA(semesterStudents, term.courses, term.termId),
        passRate: calculateSemesterPassRate(semesterStudents, term.courses, term.termId),
    };
};

export const generateMockProgram = (
    programId: string,
    programName: string,
    degreeId: string,
    requiredCredits: number,
    allStudents: Student[], // All students in the institution
    allAcademicRecords: StudentAcademicRecord[], // All records
    termsForProgram: Term[] // Pre-filtered terms relevant to this program's timeline or structure
): Program => {
    const programStudentRecords = allAcademicRecords.filter(ar => ar.programId === programId);
    const programStudentIds = new Set(programStudentRecords.map(ar => ar.studentId));
    const programStudents = allStudents.filter(s => programStudentIds.has(s.id));

    const programStudentSummaries = programStudents.map(student => {
        const record = programStudentRecords.find(r => r.studentId === student.id);
        return generateMockStudentSummary(student, record!); // record should exist due to filter
    });

    const semesters = termsForProgram.map(term => {
        // Simplification: Assume all programStudentSummaries are relevant for every term of the program.
        // More realistic: Filter students based on their actual enrollment period for the term.
        // For example, only include students whose enrollmentStatus is 'Active' and whose
        // academic history suggests they were active in this specific term.
        const activeStudentsInSemester = programStudentSummaries.filter(s => s.enrollmentStatus === 'Active');
        return generateMockSemester(term, activeStudentsInSemester);
    });

    const totalStudentsInProgram = programStudentSummaries.length;

    let sumOfGpas = 0;
    let studentsWithGpas = 0;
    programStudentSummaries.forEach(s => {
        if (s.cumulativeGPA !== undefined) {
            sumOfGpas += s.cumulativeGPA;
            studentsWithGpas++;
        }
    });
    const averageProgramGPA = studentsWithGpas > 0 ? parseFloat((sumOfGpas / studentsWithGpas).toFixed(2)) : undefined;

    // Mock graduation rate
    const graduatedStudents = programStudentSummaries.filter(s => s.enrollmentStatus === 'Graduated').length;
    const eligibleForGraduation = programStudentSummaries.filter(s => s.totalCreditsEarned && s.totalCreditsEarned >= requiredCredits).length;
    // Base graduation rate on those who have graduated out of those who were eligible or are still active.
    const graduationRate = eligibleForGraduation > 0 ? parseFloat(((graduatedStudents / eligibleForGraduation) * 100).toFixed(2)) : faker.number.float({ min: 60, max: 95, precision: 2 });


    return {
        programId,
        programName,
        degreeId,
        requiredCredits,
        semesters,
        totalStudents: totalStudentsInProgram,
        averageProgramGPA,
        graduationRate,
    };
};

// Predefined mock program structures for degrees
// This could be expanded or made more dynamic
const degreeProgramMappings: { [degreeId: string]: { programId: string, programName: string, requiredCredits: number }[] } = {
    "BACHELORS": [
        { programId: "CS_BS", programName: "Bachelor of Science in Computer Science", requiredCredits: 120 },
        { programId: "ENG_BA", programName: "Bachelor of Arts in English Literature", requiredCredits: 110 },
        { programId: "PSY_BS", programName: "Bachelor of Science in Psychology", requiredCredits: 115 },
    ],
    "MASTERS": [
        { programId: "MBA_GEN", programName: "Master of Business Administration", requiredCredits: 60 },
        { programId: "ART_MFA", programName: "Master of Fine Arts in Studio Art", requiredCredits: 65 },
        { programId: "CS_MS", programName: "Master of Science in Computer Science", requiredCredits: 45 }
    ],
    "DOCTORATE": [
        { programId: "CS_PHD", programName: "Doctor of Philosophy in Computer Science", requiredCredits: 90 },
    ]
};


export const generateMockDegree = (
    degreeId: string,
    degreeName: string,
    allStudents: Student[],
    allAcademicRecords: StudentAcademicRecord[],
    availableTerms: Term[] // All terms that could potentially be part of programs in this degree
): Degree => {
    const programsInDegreeData = degreeProgramMappings[degreeId] || [];
    if (programsInDegreeData.length === 0) {
        console.warn(`No program definitions found for degreeId: ${degreeId}.`);
    }

    const generatedPrograms: Program[] = programsInDegreeData.map(pInfo => {
        // Simplification: Assume all `availableTerms` are potentially relevant for every program.
        // A more complex setup might filter terms based on typical program duration or start/end dates.
        return generateMockProgram(
            pInfo.programId,
            pInfo.programName,
            degreeId,
            pInfo.requiredCredits,
            allStudents,
            allAcademicRecords,
            availableTerms
        );
    });

    let totalStudentsInDegree = 0;
    let sumOfProgramGpas = 0;
    let programsWithGpas = 0;

    generatedPrograms.forEach(prog => {
        if (prog.totalStudents) {
            totalStudentsInDegree += prog.totalStudents;
        }
        if (prog.averageProgramGPA !== undefined) {
            // Weight by number of students in program for a more accurate average
            sumOfProgramGpas += prog.averageProgramGPA * (prog.totalStudents || 1);
            programsWithGpas += (prog.totalStudents || 1);
        }
    });

    const averageDegreeGPA = programsWithGpas > 0 ? parseFloat((sumOfProgramGpas / programsWithGpas).toFixed(2)) : undefined;

    return {
        degreeId,
        degreeName,
        programs: generatedPrograms,
        totalStudents: totalStudentsInDegree,
        averageDegreeGPA,
    };
};

// Mock Degree definitions
const mockDegrees = [
    { degreeId: "BACHELORS", degreeName: "Bachelor's Degrees" },
    { degreeId: "MASTERS", degreeName: "Master's Degrees" },
    { degreeId: "DOCTORATE", degreeName: "Doctorate Degrees" },
];

export const generateMockAcademicYear = (
    yearId: string, // e.g., "2022-2023"
    yearName: string, // e.g., "Academic Year 2022-2023"
    startDate: string, // ISO String
    endDate: string, // ISO String
    allStudents: Student[],
    allAcademicRecords: StudentAcademicRecord[],
    allAvailableTerms: Term[] // All terms generated for the institution
): AcademicYear => {
    // Filter terms that fall within this academic year
    const termsForThisYear = allAvailableTerms.filter(term => {
        const termStart = dayjs(term.startDate);
        return termStart.isAfter(dayjs(startDate).subtract(1, 'day')) && termStart.isBefore(dayjs(endDate).add(1, 'day'));
    });

    const degreesInYear: Degree[] = mockDegrees.map(degInfo => {
        // Pass only the terms relevant to this academic year down to degree generation
        return generateMockDegree(
            degInfo.degreeId,
            degInfo.degreeName,
            allStudents,
            allAcademicRecords,
            termsForThisYear
        );
    }).filter(degree => degree.programs.length > 0); // Only include degrees that ended up with programs

    let totalStudentsInYear = 0;
    let sumOfDegreeGpas = 0;
    let degreesWithGpasWeighted = 0;

    degreesInYear.forEach(deg => {
        if (deg.totalStudents) {
            totalStudentsInYear += deg.totalStudents;
        }
        if (deg.averageDegreeGPA !== undefined && deg.totalStudents && deg.totalStudents > 0) {
            sumOfDegreeGpas += deg.averageDegreeGPA * deg.totalStudents;
            degreesWithGpasWeighted += deg.totalStudents;
        }
    });

    const overallAverageGPA = degreesWithGpasWeighted > 0 ? parseFloat((sumOfDegreeGpas / degreesWithGpasWeighted).toFixed(2)) : undefined;

    return {
        yearId,
        yearName,
        startDate,
        endDate,
        degrees: degreesInYear,
        totalStudents: totalStudentsInYear,
        overallAverageGPA,
    };
};

// Main function to generate the full institution hierarchy
export const generateMockInstitutions = (
    numStudents: number = 100, // Default number of students for the institution
    numYears: number = 2 // Default number of academic years to generate
): Institution[] => {
    const students = generateMockStudents(numStudents);
    const academicRecords = generateMockAcademicRecords(students); // Generate full records first

    const institutionId = faker.string.uuid();
    const institutionName = `${faker.company.name()} University`;

    const academicYears: AcademicYear[] = [];
    const allTermsAcrossYears: Term[] = [];

    const currentCycleYear = dayjs().year(); // e.g. 2024

    // Generate all terms for all relevant academic years first
    for (let i = 0; i < numYears; i++) {
        const year = currentCycleYear - numYears + 1 + i; // e.g., for numYears=2, current=2024 -> 2023, 2024
        // Fall term for this calendar year (starts the academic year)
        allTermsAcrossYears.push(generateMockTerm(0, year)); // Fall Term (e.g., Fall 2023)
        // Spring term for the next calendar year (part of the same academic year)
        allTermsAcrossYears.push(generateMockTerm(1, year + 1)); // Spring Term (e.g., Spring 2024)
    }


    for (let i = 0; i < numYears; i++) {
        const startYear = currentCycleYear - numYears + 1 + i; // e.g., 2023 for first iteration if current is 2024 & numYears = 2
        const endYear = startYear + 1; // e.g., 2024

        const yearId = `${startYear}-${endYear}`; // e.g., "2023-2024"
        const yearName = `Academic Year ${yearId}`;
        // Academic year typically starts mid-year (e.g., Aug) and ends mid-year (e.g., May/June)
        const startDate = dayjs(`${startYear}-08-15`).toISOString();
        const endDate = dayjs(`${endYear}-05-31`).toISOString();

        academicYears.push(
            generateMockAcademicYear(
                yearId,
                yearName,
                startDate,
                endDate,
                students,
                academicRecords,
                allTermsAcrossYears // Provide all terms, filtering happens in generateMockAcademicYear
            )
        );
    }

    let totalInstitutionStudents = 0;
    let sumOfAnnualGpas = 0;
    let yearsWithGpasWeighted = 0;

    academicYears.forEach(ay => {
        // Total students should ideally be unique students across years,
        // but for this structure, it's the sum of active students per year view.
        // A true unique count would require more complex student tracking across years.
        // For now, sum of year totals gives a sense of activity volume.
        if (ay.totalStudents) {
             // This will double count students if they are in multiple years.
             // A more accurate way would be to use students.length if all students are part of the institution.
             // However, the hierarchy asks for totalStudents at each level.
             // Let's use the highest total student count from any academic year as a proxy for peak enrollment.
             // Or, even better, just use the initial `numStudents` as the institution's total student body size.
        }
        if (ay.overallAverageGPA !== undefined && ay.totalStudents && ay.totalStudents > 0) {
            sumOfAnnualGpas += ay.overallAverageGPA * ay.totalStudents;
            yearsWithGpasWeighted += ay.totalStudents;
        }
    });

    // For institution total students, it's likely best to use the initial number of students generated.
    totalInstitutionStudents = students.length;

    const overallInstitutionGPA = yearsWithGpasWeighted > 0 ? parseFloat((sumOfAnnualGpas / yearsWithGpasWeighted).toFixed(2)) : undefined;

    const institution: Institution = {
        institutionId,
        institutionName,
        academicYears,
        totalStudents: totalInstitutionStudents,
        overallAverageGPA: overallInstitutionGPA,
    };

    return [institution]; // Returns an array as per the type, even if it's a single institution
};

// Remove old export if generateMockAcademicRecords is now internal
// export const generateMockAcademicRecords = (students: Student[]): StudentAcademicRecord[] => {
//   return students.map((student, index) => generateMockStudentAcademicRecord(student, index));
// };
