import { faker } from '@faker-js/faker';
import {
    StudentAcademicRecord, Term, CourseEnrollment, Grade, SkillProficiency, K12StandardMastery, OnlineLearningProgress
} from '../../../components/StudentPerformanceDashboard/types'; // Adjust path
import { Student } from '../../../components/AttendanceDashboard/types'; // Assuming we use student IDs from existing students
import dayjs from 'dayjs';

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
];

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
