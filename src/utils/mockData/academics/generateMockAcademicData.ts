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
    StudentSummary,
    // Added new types
    Course,
    Section,
    Faculty,
    ParentInstitution
} from '../../../types/hierarchy';
// Import base data types and generators
// import { Student } from '../../../components/AttendanceDashboard/types'; // Removed duplicate
import { generateMockStudents } from '../attendance/generateMockAttendanceData';
import { AttendanceRecord } from '../../../components/AttendanceDashboard/types'; // Added
import { generateMockAttendanceRecords } from '../attendance/generateMockAttendanceData'; // Added
import { Invoice } from '../../../components/BillingDashboard/types'; // Added
import { generateMockInvoices } from '../billing/generateMockBillingData'; // Added
import { Applicant } from '../../../components/AdmissionsDashboard/types'; // Added
import { generateMockApplicants } from '../admissions/generateMockApplicants'; // Added
import { PlacementRecord } from '../../../types/placement';
import { generateMockPlacementData } from '../placements/generateMockPlacementData';
import {
    ReEvaluationRequest, GrievanceTicket,
    ComplianceItem, AccreditationStatusSummary, AccreditingBody,
    LmsActivity
} from '../../../types/academics';
import { Alumnus, AlumniActivity } from '../../../types/alumni'; // Corrected import for Alumni types
import { generateMockReEvaluationData } from './generateMockReEvaluationData';
import { generateMockGrievanceData } from '../grievances/generateMockGrievanceData';
import {
    generateMockComplianceItems,
    generateMockAccreditationStatusSummary
} from '../compliance/generateMockComplianceData';
import { Department } from '../../../types/departments';
import { FacultyMember, FacultyEvaluation } from '../../../types/academics'; // For Faculty Data
import { generateMockFacultyMembers, generateMockFacultyEvaluations } from '../faculty/generateMockFacultyData'; // For Faculty Data
import { generateMockLmsActivityData } from '../engagement/generateMockLmsActivityData'; // Added for LMS Data
import { generateMockAlumni, generateMockAlumniActivities } from '../alumni/generateMockAlumniData'; // Added for Alumni Data


import dayjs from 'dayjs';
// faker is already imported via the first line: import { faker } from '@faker-js/faker';

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
        instructorName: faker.person.fullName(), // Changed from instructor to instructorName
        instructorId: `INST-${faker.string.uuid()}`, // Added mock instructorId
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

export const generateMockStudentSummary = (student: Student, studentAcademicRecord: StudentAcademicRecord): StudentSummary & { attendanceRate?: number; atRiskStatus?: 'Low' | 'Medium' | 'High' | 'None' }=> {
    const attendanceRate = faker.number.float({ min: 70, max: 100, multipleOf: 0.1 }); // precision: 1 changed to multipleOf: 0.1
    let atRiskStatus: 'Low' | 'Medium' | 'High' | 'None' = 'None'; // Default to None or Low
    const gpa = studentAcademicRecord.cumulativeGPA;

    if (gpa !== undefined) { // Ensure GPA is defined before using it
        if (gpa < 2.0 || attendanceRate < 75) {
            atRiskStatus = 'High';
        } else if (gpa < 2.5 || attendanceRate < 85) {
            atRiskStatus = 'Medium';
        } else {
            atRiskStatus = 'Low';
        }
    } else {
        // If GPA is undefined, base risk on attendance or set to a default
        if (attendanceRate < 75) {
            atRiskStatus = 'High';
        } else if (attendanceRate < 85) {
            atRiskStatus = 'Medium';
        } else {
            atRiskStatus = 'Low'; // Or 'None' if preferred when GPA is unknown but attendance is good
        }
    }

    return {
        studentId: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        // programId: studentAcademicRecord.programId || 'UNDEF_PROG', // Removed as per new StudentSummary
        // programName: studentAcademicRecord.programName || 'Undefined Program', // Removed as per new StudentSummary
        cumulativeGPA: gpa,
        totalCreditsEarned: studentAcademicRecord.totalCreditsEarned,
        enrollmentStatus: getRandomEnrollmentStatus(),
        expectedGraduationDate: studentAcademicRecord.expectedGraduationDate,
        attendanceRate: attendanceRate,
        atRiskStatus: atRiskStatus,
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

// --- KPI Helper Functions ---

// Attendance KPIs
const calculateAttendanceKPIs = (
    studentIdsInContext: string[], // Students relevant to the current context (e.g., in a specific semester/program)
    attendanceRecords: AttendanceRecord[],
    contextStartDate?: string, // Optional: to filter records within a specific period (e.g., semester dates)
    contextEndDate?: string
): { percentage?: number; totalAbsences?: number } => {
    if (studentIdsInContext.length === 0) return { percentage: 100, totalAbsences: 0 };

    const relevantRecords = attendanceRecords.filter(r => {
        const studentMatch = studentIdsInContext.includes(r.studentId);
        if (!studentMatch) return false;
        if (contextStartDate && contextEndDate) {
            return dayjs(r.date).isBetween(dayjs(contextStartDate), dayjs(contextEndDate), null, '[]'); // '[]' includes start/end
        }
        return true;
    });

    const totalPossibleSessions = studentIdsInContext.length * (contextStartDate && contextEndDate ? dayjs(contextEndDate).diff(dayjs(contextStartDate), 'days') : 1); // Simplified: 1 session per day per student
    const absences = relevantRecords.filter(r => r.status === 'Absent' || r.status === 'Excused').length;

    // This is a very rough estimation of attendance percentage.
    // A more accurate calculation would need total scheduled sessions for these students in this context.
    // For mock data, if we assume each student has X expected sessions in the period:
    const estimatedTotalSessions = studentIdsInContext.length * 20; // Assume 20 sessions in a typical period for mock
    const attendancePercentage = estimatedTotalSessions > 0
        ? parseFloat(( ( (estimatedTotalSessions - absences) / estimatedTotalSessions) * 100).toFixed(2))
        : 100;

    return {
        percentage: Math.max(0, Math.min(100, attendancePercentage)), // Clamp between 0-100
        totalAbsences: absences,
    };
};

// Billing KPIs
const calculateBillingKPIs = (
    studentIdsInContext: string[],
    invoices: Invoice[]
): { feesPaidPercentage?: number; overdueCount?: number } => {
    if (studentIdsInContext.length === 0) return { feesPaidPercentage: 100, overdueCount: 0 };

    const relevantInvoices = invoices.filter(inv => studentIdsInContext.includes(inv.studentId) && inv.status !== 'Cancelled' && inv.status !== 'Draft');
    if (relevantInvoices.length === 0) return { feesPaidPercentage: 100, overdueCount: 0 };

    const totalAmountDue = relevantInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalAmountPaid = relevantInvoices
        .filter(inv => inv.status === 'Paid') // Consider only fully paid for simplicity, or sum actual payments if available
        .reduce((sum, inv) => sum + inv.totalAmount, 0);
        // More accurately, this should sum from actual Payment records if available and linked.
        // For now, using invoice status.

    const feesPaidPercentage = totalAmountDue > 0 ? parseFloat(((totalAmountPaid / totalAmountDue) * 100).toFixed(2)) : 100;
    const overdueCount = relevantInvoices.filter(inv => inv.status === 'Overdue').length;

    return {
        feesPaidPercentage: Math.min(100, feesPaidPercentage), // Can't be over 100%
        overdueCount,
    };
};

// Admission KPIs
const calculateAdmissionKPIs = (
    programApplicants: Applicant[] // Applicants specifically for this program
): { applicants: number; acceptanceRate?: number; enrolledCount?: number } => {
    if (!programApplicants || programApplicants.length === 0) {
        return { applicants: 0, acceptanceRate: 0, enrolledCount: 0 };
    }
    const totalApplicants = programApplicants.length;
    const offersMade = programApplicants.filter(a => ['Offer Made', 'Offer Accepted', 'Enrollment Confirmed'].includes(a.status)).length;
    const enrolled = programApplicants.filter(a => a.status === 'Enrollment Confirmed').length;
    // Acceptance rate: offers made / total applicants for this program
    const acceptanceRate = totalApplicants > 0 ? parseFloat(((offersMade / totalApplicants) * 100).toFixed(2)) : 0;

    return {
        applicants: totalApplicants,
        acceptanceRate,
        enrolledCount: enrolled,
    };
};

// Grade Distribution
const calculateGradeDistribution = (studentRecords: StudentAcademicRecord[]): { [gradeCategory: string]: number } => {
    const distribution: { [gradeCategory: string]: number } = { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0, 'Other': 0 };
    studentRecords.forEach(record => {
        record.terms.forEach(term => {
            term.courses.forEach(course => {
                if (course.grade) {
                    const letter = course.grade.letterGrade[0]; // Take first char (A+ -> A)
                    if (distribution[letter] !== undefined) {
                        distribution[letter]++;
                    } else if (course.grade.letterGrade === 'P' || course.grade.letterGrade === 'NP') {
                        distribution['Other']++;
                    }
                }
            });
        });
    });
    return distribution;
};

// At-Risk Students
const countAtRiskStudents = (
    studentRecords: StudentAcademicRecord[],
    studentIdsInContext: string[],
    attendanceRecords?: AttendanceRecord[], // Optional: add attendance criteria later
    minGpaThreshold: number = 2.0,
    maxAbsencesThreshold: number = 10 // Example threshold
): number => {
    let atRiskCount = 0;
    const relevantStudentRecords = studentRecords.filter(sr => studentIdsInContext.includes(sr.studentId));

    relevantStudentRecords.forEach(record => {
        if (record.cumulativeGPA !== undefined && record.cumulativeGPA < minGpaThreshold) {
            atRiskCount++;
            return; // Counted once for GPA
        }
        // TODO: Add attendance-based at-risk logic if attendanceRecords are provided and processed
        // For example, filter attendance for this student, sum absences, compare to maxAbsencesThreshold
    });
    return atRiskCount;
};

// Placement KPIs Helper
const calculatePlacementKPIs = (
  studentIdsInScope: string[],
  allStudentsInScopeSummaries: StudentSummary[],
  allPlacementRecords: PlacementRecord[]
): { rate?: number; avgPackage?: number; placedCount?: number; internshipCount?: number } => {
    const eligibleForPlacementSummaries = allStudentsInScopeSummaries.filter(
        s => studentIdsInScope.includes(s.studentId) &&
            s.enrollmentStatus === 'Graduated' &&
            s.expectedGraduationDate &&
            dayjs(s.expectedGraduationDate).isBefore(dayjs().add(3,'month'))
    );
    const eligibleStudentIdsForRateCalc = new Set(eligibleForPlacementSummaries.map(s => s.studentId));

    const relevantFullTimePlacements = allPlacementRecords.filter(
        p => eligibleStudentIdsForRateCalc.has(p.studentId) && p.placementType === 'FullTime'
    );
    const internedStudentIdsInScope = new Set(
        allPlacementRecords
            .filter(p => studentIdsInScope.includes(p.studentId) && p.placementType === 'Internship')
            .map(p => p.studentId)
    );
    const internshipCount = internedStudentIdsInScope.size;

    const placedStudentIdsForFullTime = new Set(relevantFullTimePlacements.map(p => p.studentId));
    const placedCount = placedStudentIdsForFullTime.size;

    const rate = eligibleForPlacementSummaries.length > 0
        ? parseFloat(((placedCount / eligibleForPlacementSummaries.length) * 100).toFixed(2))
        : 0;

    let totalPackage = 0;
    relevantFullTimePlacements.forEach(p => totalPackage += p.packageAmount);
    const avgPackage = placedCount > 0 ? parseFloat((totalPackage / placedCount).toFixed(0)) : undefined;

    return { rate, avgPackage, placedCount, internshipCount };
};


// --- New Hierarchical Mock Data Generation ---

// Helper to generate term details (used by new Semester)
const generateTermDetails = (termNumber: number, year: number, programId: string): { termId: string, termName: string, startDate: string, endDate: string } => {
    const isFall = termNumber % 2 === 0;
    // Make termId more unique if multiple programs have same year/season terms.
    // However, programId is not part of Term's ID in the types. For now, keep it simple.
    const termId = `${isFall ? 'FA' : 'SP'}${year}`;
    const termName = `${isFall ? 'Fall' : 'Spring'} ${year}`;
    return {
        termId,
        termName,
        startDate: dayjs(`${year}-${isFall ? '08' : '01'}-15`).toISOString(),
        endDate: dayjs(`${year}-${isFall ? '12' : '05'}-15`).toISOString(),
    };
};

// Helper to pick a subset of students
const pickRandomSubset = <T>(items: T[], maxCount: number): T[] => {
    if (!items || items.length === 0) return [];
    const count = faker.number.int({ min: Math.min(1, items.length), max: Math.min(maxCount, items.length) });
    return faker.helpers.arrayElements(items, count);
};


// New generator functions from bottom-up

const generateMockSections = (
    courseId: string,
    availableStudents: StudentSummary[],
    numSections: number = faker.number.int({ min: 1, max: 3 })
): Section[] => {
    const sections: Section[] = [];
    const courseStudents = pickRandomSubset(availableStudents, availableStudents.length); // All available for this course, sections will subdivide them
    let remainingStudents = [...courseStudents];

    for (let i = 0; i < numSections; i++) {
        const sectionId = `${courseId}-S${i + 1}`;
        const sectionName = `Section ${String.fromCharCode(65 + i)}`; // A, B, C

        const sectionStudentCount = Math.ceil(courseStudents.length / numSections);
        const studentsForSection = remainingStudents.splice(0, Math.min(sectionStudentCount, remainingStudents.length));

        if (studentsForSection.length === 0 && courseStudents.length > 0 && sections.length < numSections) {
            // If running out of students for later sections due to Math.ceil, assign from the course pool if any are left (or allow empty sections)
            // For mock data, it's okay if not perfectly distributed or some sections are smaller.
            // Or, ensure enough students were picked for the course initially.
        }

        sections.push({
            sectionId,
            sectionName,
            courseId,
            instructorName: faker.person.fullName(),
            schedule: `${faker.helpers.arrayElement(['Mon/Wed/Fri', 'Tue/Thu'])} ${faker.number.int({ min: 8, max: 15 })}-${faker.number.int({ min: 9, max: 17 })} AM/PM`,
            students: studentsForSection,
            studentCount: studentsForSection.length,
            averageAttendance: faker.number.float({ min: 70, max: 95, multipleOf: 0.5 }), // Mock KPI
            classroom: `Room ${faker.number.int({min: 101, max: 305})}`
        });
    }
    return sections;
};

const generateMockCourses = (
    semesterId: string,
    availableStudents: StudentSummary[], // Students available for this semester's courses
    numCourses: number = faker.number.int({ min: 3, max: 6 })
): Course[] => {
    const courses: Course[] = [];
    const subjectAreas = ['CS', 'MATH', 'ENG', 'HIST', 'SCI', 'ART'];

    for (let i = 0; i < numCourses; i++) {
        const subject = faker.helpers.arrayElement(subjectAreas);
        const courseNum = faker.number.int({ min: 101, max: 499 });
        const courseId = `${subject}${courseNum}-${semesterId}`;
        const courseName = `${faker.commerce.productName()} (${subject} ${courseNum})`;

        // Each course gets a subset of students available for the semester.
        // This means a student might be in multiple courses, which is realistic.
        const studentsForCourse = pickRandomSubset(availableStudents, availableStudents.length);

        const sections = generateMockSections(courseId, studentsForCourse);
        const totalEnrolledInCourse = sections.reduce((sum, sec) => sum + sec.studentCount!, 0);

        courses.push({
            courseId,
            courseName,
            semesterId,
            sections,
            courseCode: `${subject} ${courseNum}`,
            credits: faker.helpers.arrayElement([3, 4]),
            totalStudentsEnrolled: totalEnrolledInCourse,
            averageGrade: faker.number.float({ min: 65, max: 90, multipleOf: 0.5 }), // Mock KPI
            passRate: faker.number.float({ min: 70, max: 98, multipleOf: 0.5 }), // Mock KPI
            facultyCoordinatorId: `FAC-${faker.string.uuid().substring(0,8)}`
        });
    }
    return courses;
};

// --- SEMESTER ---
// Note: The existing `generateMockSemester` is tied to the old structure where Semester has `students: StudentSummary[]`
// and `courses: CourseEnrollment[]`. The new `Semester` type has `courses: Course[]` and no direct `students` field.
// We will create `generateMockNewSemester` for the new structure.

const generateMockNewSemester = (
    termDetails: { termId: string, termName: string, startDate: string, endDate: string },
    programId: string, // For context, though not directly part of Semester type model
    availableStudents: StudentSummary[], // Students available for this program's semester
    allAttendanceRecords: AttendanceRecord[],
    allInvoices: Invoice[]
): Semester => {
    // Students participating in this semester's courses
    // For simplicity, assume all students available to the program for this semester could take courses.
    // A more complex model might filter students based on their year/progress.
    const studentsForSemesterCourses = pickRandomSubset(availableStudents, availableStudents.length);

    const courses = generateMockCourses(termDetails.termId, studentsForSemesterCourses);

    // Aggregate student IDs from all sections in all courses for this semester for KPI calculation
    const studentIdsInSemesterCourses = new Set<string>();
    courses.forEach(course => {
        course.sections.forEach(section => {
            section.students.forEach(student => {
                studentIdsInSemesterCourses.add(student.studentId);
            });
        });
    });
    const uniqueStudentIdsArray = Array.from(studentIdsInSemesterCourses);

    // Calculate KPIs for the semester using students enrolled in its courses
    const attendanceKPIs = calculateAttendanceKPIs(uniqueStudentIdsArray, allAttendanceRecords, termDetails.startDate, termDetails.endDate);
    const billingKPIs = calculateBillingKPIs(uniqueStudentIdsArray, allInvoices);

    // Semester GPA and Pass Rate would ideally be calculated from the actual grades in the courses of this semester.
    // This is complex for mock data. We can mock them or use an average of student cumulative GPAs.
    let semesterGpaSum = 0;
    let studentsCountedForGpa = 0;
    availableStudents.filter(s => uniqueStudentIdsArray.includes(s.studentId)).forEach(student => {
        if (student.cumulativeGPA !== undefined) {
            semesterGpaSum += student.cumulativeGPA;
            studentsCountedForGpa++;
        }
    });
    const averageGPA = studentsCountedForGpa > 0 ? parseFloat((semesterGpaSum / studentsCountedForGpa).toFixed(2)) : undefined;

    const passingStudents = availableStudents.filter(s => uniqueStudentIdsArray.includes(s.studentId) && s.cumulativeGPA !== undefined && s.cumulativeGPA >= 2.0).length;
    const passRate = uniqueStudentIdsArray.length > 0 ? parseFloat(((passingStudents / uniqueStudentIdsArray.length) * 100).toFixed(2)) : undefined;


    return {
        ...termDetails, // termId, termName, startDate, endDate
        courses, // This is now Course[]
        // students field is removed from Semester type
        averageGPA, // Mocked or aggregated differently
        passRate,   // Mocked or aggregated differently
        attendancePercentage: attendanceKPIs.percentage,
        totalAbsences: attendanceKPIs.totalAbsences,
        feesPaidPercentage: billingKPIs.feesPaidPercentage,
        studentsWithOverdueFees: billingKPIs.overdueCount,
        totalCoursesOffered: courses.length,
    };
};


// Existing calculateSemesterAverageGPA and calculateSemesterPassRate are based on the old structure.
// They might need to be removed or adapted if a new way of calculating semester GPA/PassRate from Course grades is implemented.
// For now, generateMockNewSemester implements its own simple GPA/PassRate logic.

// Remove or comment out old functions that are being replaced or are no longer directly compatible
// export const generateMockSemester (this is the old one) ...

// --- PROGRAM ---
// The existing `generateMockProgram` needs to be updated to use `generateMockNewSemester`
// and to align with the new Program structure (no departmentId directly).

export const generateMockNewProgram = (
    programConfig: { programId: string, programName: string, requiredCredits: number },
    degreeId: string,
    // departmentId is no longer directly on Program, it's on Degree
    allStudentsInInstitution: Student[], // All students available for potential enrollment
    allAcademicRecordsInInstitution: StudentAcademicRecord[],
    allAttendanceRecords: AttendanceRecord[],
    allInvoices: Invoice[],
    allApplicants: Applicant[],
    allPlacementRecords: PlacementRecord[],
    numSemestersToGenerate: number = faker.number.int({min: 2, max: 6}) // e.g., 2 for a 1-year cert, 4 for 2-year, 8 for 4-year
): Program => {
    const { programId, programName, requiredCredits } = programConfig;

    // Filter academic records for this specific program to find relevant students
    const programStudentAcademicRecords = allAcademicRecordsInInstitution.filter(ar => ar.programId === programId);
    const programStudentIds = new Set(programStudentAcademicRecords.map(ar => ar.studentId));

    // Create StudentSummary objects for students in this program
    const programStudentSummaries = allStudentsInInstitution
        .filter(s => programStudentIds.has(s.id))
        .map(student => {
            const record = programStudentAcademicRecords.find(r => r.studentId === student.id);
            return generateMockStudentSummary(student, record!);
        });

    const semesters: Semester[] = [];
    const currentYear = dayjs().year();
    // Generate semesters sequentially (e.g., Fall 2023, Spring 2024, Fall 2024 ...)
    for (let i = 0; i < numSemestersToGenerate; i++) {
        const yearOffset = Math.floor(i / 2); // Increments every two semesters
        const termNumInYear = i % 2; // 0 for Fall-like, 1 for Spring-like

        const termDetails = generateTermDetails(termNumInYear, currentYear - Math.floor(numSemestersToGenerate/2) + yearOffset, programId);

        // Pass only students relevant to this program to the semester generation
        const activeStudentsForSemester = programStudentSummaries.filter(s => s.enrollmentStatus === 'Active');

        semesters.push(generateMockNewSemester(
            termDetails,
            programId,
            activeStudentsForSemester, // Students for this program
            allAttendanceRecords,
            allInvoices
        ));
    }

    const totalStudentsInProgram = programStudentSummaries.length;
    const programStudentIdsArray = Array.from(programStudentIds);

    // Aggregate KPIs for the Program (similar to old generateMockProgram)
    const programAttendanceKPIs = calculateAttendanceKPIs(programStudentIdsArray, allAttendanceRecords);
    const programBillingKPIs = calculateBillingKPIs(programStudentIdsArray, allInvoices);
    const applicantsForProgram = allApplicants.filter(app => app.programId === programId);
    const programAdmissionKPIs = calculateAdmissionKPIs(applicantsForProgram);
    const programPlacementKPIs = calculatePlacementKPIs(programStudentIdsArray, programStudentSummaries, allPlacementRecords);
    const programGradeDistribution = calculateGradeDistribution(programStudentAcademicRecords);
    const programAtRiskStudents = countAtRiskStudents(programStudentAcademicRecords, programStudentIdsArray);

    let sumOfGpas = 0;
    let studentsWithGpas = 0;
    programStudentSummaries.forEach(s => {
        if (s.cumulativeGPA !== undefined) {
            sumOfGpas += s.cumulativeGPA;
            studentsWithGpas++;
        }
    });
    const averageProgramGPA = studentsWithGpas > 0 ? parseFloat((sumOfGpas / studentsWithGpas).toFixed(2)) : undefined;

    const graduatedStudents = programStudentSummaries.filter(s => s.enrollmentStatus === 'Graduated').length;
    const eligibleForGraduation = programStudentSummaries.filter(s => s.totalCreditsEarned && s.totalCreditsEarned >= requiredCredits).length;
    let graduationRate = eligibleForGraduation > 0 ? parseFloat(((graduatedStudents / eligibleForGraduation) * 100).toFixed(2)) : faker.number.float({ min: 60, max: 95, multipleOf: 0.01 });

    const passingStudentsInProgram = programStudentSummaries.filter(s => s.cumulativeGPA !== undefined && s.cumulativeGPA >= 2.0).length;
    const programPassRate = totalStudentsInProgram > 0 ? parseFloat(((passingStudentsInProgram / totalStudentsInProgram) * 100).toFixed(2)) : 0;

    // DATA REALISM (can be kept or adapted)
    if (programId === "PSY_BS" && averageProgramGPA && programPlacementKPIs.rate) {
        // averageProgramGPA = parseFloat(Math.max(1.0, averageProgramGPA * 0.85).toFixed(2));
        // programPlacementKPIs.rate = parseFloat(Math.max(0, programPlacementKPIs.rate - 15).toFixed(2));
        // graduationRate = parseFloat(Math.max(30, graduationRate * 0.8).toFixed(2));
    }

    return {
        programId,
        programName,
        degreeId,
        // departmentId is removed
        requiredCredits,
        semesters, // Now uses NewSemester
        totalStudents: totalStudentsInProgram,
        averageProgramGPA,
        graduationRate,
        programPassRate,
        // KPIs from calculations
        placementRate: programPlacementKPIs.rate,
        averagePackage: programPlacementKPIs.avgPackage,
        totalPlacedStudents: programPlacementKPIs.placedCount,
        totalInternships: programPlacementKPIs.internshipCount,
        avgAttendancePercentage: programAttendanceKPIs.percentage, // Attendance is better at course/section level
        totalProgramAbsences: programAttendanceKPIs.totalAbsences, // Same as above
        avgFeesPaidPercentage: programBillingKPIs.feesPaidPercentage, // Fee status might be tracked differently
        totalStudentsWithOverdueFees: programBillingKPIs.overdueCount, // Same as above
        applicants: programAdmissionKPIs.applicants,
        acceptanceRate: programAdmissionKPIs.acceptanceRate,
        enrolledCount: programAdmissionKPIs.enrolledCount,
        gradeDistribution: programGradeDistribution, // Aggregated from course grades ideally
        atRiskStudents: programAtRiskStudents, // Identified based on course performance or overall status
    };
};

// Existing generateMockProgram should be replaced or removed.
// For now, let's assume generateMockNewProgram is the one to be used.

// --- DEGREE ---
// Update generateMockDegree to generateMockNewDegree
// It should include departmentId and use generateMockNewProgram

export const generateMockNewDegree = (
    degreeConfig: { degreeId: string, degreeName: string },
    departmentId: string,
    // Student-related data passed down from a higher level (e.g., Faculty or Institution)
    allStudentsInScope: Student[],
    allAcademicRecordsInScope: StudentAcademicRecord[],
    allAttendanceRecords: AttendanceRecord[],
    allInvoices: Invoice[],
    allApplicants: Applicant[],
    allPlacementRecords: PlacementRecord[]
): Degree => {
    const { degreeId, degreeName } = degreeConfig;
    const programsInDegreeConfig = degreeProgramMappings[degreeId] || [];

    const programs: Program[] = programsInDegreeConfig.map(pConfig => {
        // Students for this program are filtered from the scope passed to the Degree
        return generateMockNewProgram(
            pConfig,
            degreeId,
            allStudentsInScope,
            allAcademicRecordsInScope,
            allAttendanceRecords,
            allInvoices,
            allApplicants,
            allPlacementRecords,
            faker.number.int({ min: 4, max: 8 }) // Number of semesters for the program
        );
    });

    // Aggregate Student Summaries and IDs for the Degree from its programs
    const degreeStudentSummariesMap = new Map<string, StudentSummary>();
    programs.forEach(prog => {
        // Re-derive student summaries for this degree's programs from academic records in scope
        const programStudentRecords = allAcademicRecordsInScope.filter(ar => ar.programId === prog.programId);
        programStudentRecords.forEach(psr => {
            if (!degreeStudentSummariesMap.has(psr.studentId)) {
                 const student = allStudentsInScope.find(s => s.id === psr.studentId);
                 if(student) {
                    // Ensure generateMockStudentSummary is available and correctly typed
                    degreeStudentSummariesMap.set(psr.studentId, generateMockStudentSummary(student, psr));
                 }
            }
        });
    });
    const degreeStudentSummaries = Array.from(degreeStudentSummariesMap.values());
    const degreeStudentIds = degreeStudentSummaries.map(s => s.studentId);

    // Aggregate KPIs for the Degree (similar to old generateMockDegree but using new program structure)
    let totalStudentsInDegree = degreeStudentSummaries.length;
    let sumOfProgramGpas = 0;
    let totalStudentsForGpaCalc = 0;
    // ... other KPI aggregations ...

    programs.forEach(prog => {
        if (prog.averageProgramGPA !== undefined && prog.totalStudents) {
            sumOfProgramGpas += prog.averageProgramGPA * prog.totalStudents;
            totalStudentsForGpaCalc += prog.totalStudents;
        }
        // Aggregate other KPIs from prog similarly
    });

    const averageDegreeGPA = totalStudentsForGpaCalc > 0 ? parseFloat((sumOfProgramGpas / totalStudentsForGpaCalc).toFixed(2)) : undefined;
    const degreePlacementKPIs = calculatePlacementKPIs(degreeStudentIds, degreeStudentSummaries, allPlacementRecords);
    // Mock other KPIs or aggregate them properly
    const totalApplicants = programs.reduce((sum, p) => sum + (p.applicants || 0), 0);
    const totalEnrolledCount = programs.reduce((sum, p) => sum + (p.enrolledCount || 0), 0);
    // Simplified acceptance rate: total enrolled / total applicants for the degree
    const avgAcceptanceRate = totalApplicants > 0 ? parseFloat(((totalEnrolledCount / totalApplicants) * 100).toFixed(2)) : undefined;


    return {
        degreeId,
        degreeName,
        departmentId, // New field
        programs, // Contains new Program objects
        totalStudents: totalStudentsInDegree,
        averageDegreeGPA,
        // KPIs (some mocked, some aggregated)
        placementRate: degreePlacementKPIs.rate,
        averagePackage: degreePlacementKPIs.avgPackage,
        totalPlacedStudents: degreePlacementKPIs.placedCount,
        totalInternships: degreePlacementKPIs.internshipCount,
        totalApplicants,
        avgAcceptanceRate,
        totalEnrolledCount,
        // overallGradeDistribution, totalAtRiskStudents etc. should be aggregated from programs
        overallGradeDistribution: {}, // Placeholder
        totalAtRiskStudents: programs.reduce((sum, p) => sum + (p.atRiskStudents || 0), 0), // Example aggregation
        // Remove attendance/fee KPIs if they are too granular for Degree level now
    };
};


// --- DEPARTMENT ---
// Department type from: import { Department } from '../../../types/departments';
// Department type has: departmentId, departmentName, facultyId, degreeIds, KPIs.

// Predefined department configurations (can be expanded)
const departmentConfigs = [
    { departmentId: 'DEPT_STEM', departmentName: 'School of STEM', facultyId: '', degreeConfigs: [mockDegrees[0], mockDegrees[2]] }, // Bachelors, Doctorate for STEM
    { departmentId: 'DEPT_ARTS', departmentName: 'School of Arts & Humanities', facultyId: '', degreeConfigs: [mockDegrees[0], mockDegrees[1]] }, // Bachelors, Masters for ARTS
    { departmentId: 'DEPT_BUSINESS', departmentName: 'School of Business', facultyId: '', degreeConfigs: [mockDegrees[1]] } // Masters for Business
];

export const generateMockDepartments = (
    facultyId: string,
    // Student data scoped to the faculty
    allStudentsInFaculty: Student[],
    allAcademicRecordsInFaculty: StudentAcademicRecord[],
    allAttendanceRecords: AttendanceRecord[], // Full lists, will be filtered by student IDs
    allInvoices: Invoice[],
    allApplicants: Applicant[],
    allPlacementRecords: PlacementRecord[]
): Department[] => {
    const departments: Department[] = [];

    departmentConfigs.forEach(deptConfig => {
        // Assign facultyId to this department
        const currentDepartmentId = `${deptConfig.departmentId}-${facultyId.slice(-4)}`; // Make ID unique per faculty

        // Filter students for this department based on programs within degrees of this dept.
        // This is a bit tricky as programs are defined under degrees.
        // For mock data, we can assign a portion of faculty students to each department.
        // Or, more accurately, sum students from degrees generated for this department.

        const degrees: Degree[] = deptConfig.degreeConfigs.map(degConf => {
            // For each degree, we need to determine the relevant student subset.
            // Let's assume for now that students passed to generateMockNewDegree are filtered appropriately.
            // However, generateMockNewDegree itself filters students based on programs.
            // A simpler approach for department might be to assign a slice of faculty students.
            return generateMockNewDegree(
                degConf,
                currentDepartmentId,
                allStudentsInFaculty, // Pass all faculty students, degree/program will filter
                allAcademicRecordsInFaculty,
                allAttendanceRecords,
                allInvoices,
                allApplicants,
                allPlacementRecords
            );
        });

        const degreeIds = degrees.map(d => d.degreeId);

        // Aggregate students and KPIs for the department from its degrees
        let deptTotalStudents = 0;
        const deptStudentSummariesMap = new Map<string, StudentSummary>();
        degrees.forEach(degree => {
            degree.programs.forEach(prog => {
                const progStudentRecords = allAcademicRecordsInFaculty.filter(ar => ar.programId === prog.programId);
                progStudentRecords.forEach(psr => {
                    if (!deptStudentSummariesMap.has(psr.studentId)) {
                        const student = allStudentsInFaculty.find(s => s.id === psr.studentId);
                        if (student) {
                            deptStudentSummariesMap.set(psr.studentId, generateMockStudentSummary(student, psr));
                        }
                    }
                });
            });
        });
        const deptStudentSummaries = Array.from(deptStudentSummariesMap.values());
        deptTotalStudents = deptStudentSummaries.length;

        let deptGpaSum = 0;
        let studentsCountedForDeptGpa = 0;
        deptStudentSummaries.forEach(s => {
            if (s.cumulativeGPA !== undefined) {
                deptGpaSum += s.cumulativeGPA;
                studentsCountedForDeptGpa++;
            }
        });
        const departmentAverageGPA = studentsCountedForDeptGpa > 0 ? parseFloat((deptGpaSum / studentsCountedForDeptGpa).toFixed(2)) : undefined;

        const deptPlacementKPIs = calculatePlacementKPIs(deptStudentSummaries.map(s=>s.studentId), deptStudentSummaries, allPlacementRecords);

        departments.push({
            departmentId: currentDepartmentId,
            departmentName: deptConfig.departmentName,
            facultyId,
            degreeIds, // Changed from programIds to degreeIds
            totalStudents: deptTotalStudents,
            departmentAverageGPA, // Renamed for clarity from averageGPA
            departmentPlacementRate: deptPlacementKPIs.rate, // Renamed
            // departmentPassRate: // Calculate if needed
            // performanceScore, mockStudentSatisfactionScore can be added later
        });
    });

    return departments;
};

// --- FACULTY ---
export const generateMockFaculties = (
    institutionId: string,
    // Student data scoped to the institution
    allStudentsInInstitution: Student[],
    allAcademicRecordsInInstitution: StudentAcademicRecord[],
    allAttendanceRecords: AttendanceRecord[],
    allInvoices: Invoice[],
    allApplicants: Applicant[],
    allPlacementRecords: PlacementRecord[],
    numFaculties: number = faker.number.int({ min: 2, max: 4 })
): Faculty[] => {
    const faculties: Faculty[] = [];
    const facultyNames = ["Faculty of Engineering", "Faculty of Arts & Sciences", "Faculty of Business", "Faculty of Health Sciences", "Faculty of Design"];

    for (let i = 0; i < numFaculties; i++) {
        const facultyId = `FACULTY-${institutionId.slice(-4)}-${i + 1}`;
        const facultyName = faker.helpers.arrayElement(facultyNames.filter(fn => !faculties.find(f=>f.facultyName === fn))) || `${faker.company.bsBuzz()} Faculty`;

        // Distribute a portion of institution's students to this faculty.
        // This is a simplification. A real system would have explicit student-faculty enrollment.
        // For mock data, let's say each faculty gets a roughly equal share, with some overlap.
        const studentsForFaculty = pickRandomSubset(allStudentsInInstitution, Math.ceil(allStudentsInInstitution.length / numFaculties) + 5);
        const academicRecordsForFaculty = allAcademicRecordsInInstitution.filter(ar =>
            studentsForFaculty.some(s => s.id === ar.studentId)
        );

        const departments = generateMockDepartments(
            facultyId,
            studentsForFaculty,
            academicRecordsForFaculty,
            allAttendanceRecords,
            allInvoices,
            allApplicants,
            allPlacementRecords
        );

        let totalStudentsInFaculty = 0;
        let facultyGpaSum = 0;
        let studentsCountedForFacultyGpa = 0;

        const facultyStudentSummariesMap = new Map<string, StudentSummary>();
        departments.forEach(dept => {
            // To get students for faculty GPA, need to look into dept's degrees -> programs -> students
            // This is similar to how department aggregates students.
            // For now, we sum unique students from the initial distribution to faculty for KPI calculation.
        });

        studentsForFaculty.forEach(s => { // Use the initially distributed studentsForFaculty for KPIs
            const record = academicRecordsForFaculty.find(ar => ar.studentId === s.id);
            if (record) { // StudentSummary should be generated based on this record
                const summary = generateMockStudentSummary(s, record);
                if (!facultyStudentSummariesMap.has(summary.studentId)) {
                    facultyStudentSummariesMap.set(summary.studentId, summary);
                }
            }
        });
        const uniqueFacultyStudents = Array.from(facultyStudentSummariesMap.values());
        totalStudentsInFaculty = uniqueFacultyStudents.length;

        uniqueFacultyStudents.forEach(summary => {
            if (summary.cumulativeGPA !== undefined) {
                facultyGpaSum += summary.cumulativeGPA;
                studentsCountedForFacultyGpa++;
            }
        });

        const averageFacultyGPA = studentsCountedForFacultyGpa > 0 ? parseFloat((facultyGpaSum / studentsCountedForFacultyGpa).toFixed(2)) : undefined;

        faculties.push({
            facultyId,
            facultyName,
            institutionId,
            departments,
            totalStudents: totalStudentsInFaculty,
            averageFacultyGPA,
            totalFacultyMembers: faker.number.int({min: 20, max: 100}), // Mocked
            researchProjectsCount: faker.number.int({min: 5, max: 50}) // Mocked
        });
    }
    return faculties;
};


// --- INSTITUTION (Update) ---
export const generateMockNewInstitutions = ( // Renamed from generateMockInstitutions
    parentInstitutionId: string | undefined, // New optional parameter
    // numInstitutions: number = 1 // Typically generate one detailed institution per call now
    allStudentsForInstitution: Student[], // Students specifically for this institution
    numYears: number = 3, // For AcademicYear data, if generated
    numApplicantsPerProgramContext: number = 50 // Contextual, might be based on all programs
): Institution[] => { // Still returns array for flexibility, but usually one

    const allStudents = allStudentsForInstitution;
    const allAcademicRecords = generateMockAcademicRecords(allStudents);
    const institutionWideStudentSummaries = allAcademicRecords.map(ar =>
        generateMockStudentSummary(allStudents.find(s => s.id === ar.studentId)!, ar)
    );
    // const institutionStudentIds = institutionWideStudentSummaries.map(s => s.studentId); // Not directly used below

    // Other base data generation (LMS, Placement, Attendance, Invoices, etc.) remains largely the same
    const allLmsActivities = generateMockLmsActivityData(institutionWideStudentSummaries, 20, 60);
    const allPlacementRecords = generateMockPlacementData(institutionWideStudentSummaries);
    const allAttendanceRecords = generateMockAttendanceRecords(allStudents, [], numYears * 365);
    const allInvoices = generateMockInvoices(allStudents, 5, new Set());

    // Estimate total number of unique programs that will be generated across all faculties/departments/degrees
    // This is a rough estimate for applicant generation.
    let totalProgramTemplates = 0;
    departmentConfigs.forEach(dc => {
        dc.degreeConfigs.forEach(degC => {
            totalProgramTemplates += (degreeProgramMappings[degC.degreeId] || []).length;
        });
    });
    const allApplicants = generateMockApplicants(numApplicantsPerProgramContext * totalProgramTemplates);


    const institutionId = faker.string.uuid();
    const institutionName = `${faker.company.name()} University`;

    const faculties = generateMockFaculties(
        institutionId,
        allStudents,
        allAcademicRecords,
        allAttendanceRecords,
        allInvoices,
        allApplicants,
        allPlacementRecords,
        faker.number.int({min: 3, max: 5})
    );

    // Academic Years: This part is complex because programs are now deep within Faculties.
    // The old generateMockAcademicYear creates its own Degrees/Programs.
    // For a consistent new hierarchy, AcademicYear should source its structure from the
    // programs defined under Institution -> Faculty -> Dept -> Degree.
    // This requires either passing all programs up or carefully filtering.
    // For now, let's create an empty academicYears array or a simplified one.
    const academicYearsData: AcademicYear[] = []; // Placeholder for now.
    // To properly populate AcademicYears, one would need to:
    // 1. Collect all unique Degree instances from all Departments in all Faculties.
    // 2. For each AcademicYear, associate these Degrees.
    // This ensures that the Degrees and Programs in AcademicYears are the same instances.
    // This is a larger refactoring for generateMockAcademicYear itself.

    let instTotalStudents = 0;
    let instGpaSum = 0;
    let instStudentsForGpa = 0;

    faculties.forEach(faculty => {
        instTotalStudents += faculty.totalStudents || 0;
        if (faculty.averageFacultyGPA !== undefined && faculty.totalStudents) {
            instGpaSum += faculty.averageFacultyGPA * faculty.totalStudents;
            instStudentsForGpa += faculty.totalStudents;
        }
    });
    const overallAverageGPA = instStudentsForGpa > 0 ? parseFloat((instGpaSum / instStudentsForGpa).toFixed(2)) : undefined;

    // Simplified KPI generation for institution level - should be more comprehensive
    const institutionPlacementKPIs = calculatePlacementKPIs(institutionWideStudentSummaries.map(s=>s.studentId), institutionWideStudentSummaries, allPlacementRecords);
    const allReEvaluationRequests = generateMockReEvaluationData(institutionWideStudentSummaries, [], 100);
    const pendingReEvaluationsCount = allReEvaluationRequests.filter(r => r.status === 'Pending').length;
    const allGrievanceTickets = generateMockGrievanceData(institutionWideStudentSummaries, [], 75);
    const openGrievancesCount = allGrievanceTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
    // ... other KPIs from the original generateMockInstitutions
    const alumniSummaries = institutionWideStudentSummaries.filter(s => s.enrollmentStatus === 'Graduated');
    const allAlumni = generateMockAlumni(alumniSummaries);
    const allAlumniActivities = generateMockAlumniActivities(allAlumni, 2);


    const institution: Institution = {
        institutionId,
        institutionName,
        parentInstitutionId,
        faculties,
        academicYears: academicYearsData,
        totalStudents: instTotalStudents,
        overallAverageGPA,
        overallPlacementRate: institutionPlacementKPIs.rate,
        overallAveragePackage: institutionPlacementKPIs.avgPackage,
        overallTotalPlacedStudents: institutionPlacementKPIs.placedCount,
        overallTotalInternships: institutionPlacementKPIs.internshipCount,
        pendingReEvaluationsCount,
        openGrievancesCount,
        // Dummy values for other complex fields, to be properly aggregated/generated
        departments: undefined, // This should be removed from Institution type if faculties is primary
        totalReEvaluationsLastMonth: faker.number.int(20),
        avgGrievanceResolutionTimeDays: faker.number.int({min:1, max:30}),
        overallCompliancePercentage: faker.number.float({min:70, max:99, multipleOf: .1}),
        pendingComplianceItemsCount: faker.number.int(10),
        nextAccreditationReviewDate: dayjs().add(faker.number.int({min:1,max:5}), 'year').toISOString(),
        accreditationBody: { name: faker.company.name() + " Accreditation Board", code: faker.string.alphanumeric(3).toUpperCase()},
        complianceItems: [],
        accreditationStatuses: [],
        avgFacultyRating: faker.number.float({min:3.5, max:4.8, multipleOf: .1}),
        facultyEvaluationResponseRate: faker.number.float({min:60, max:90, multipleOf: .1}),
        facultyMembers: [], // Should be aggregated from faculties/departments
        facultyEvaluations: [], // Aggregated
        lmsLoginsLast30Days: faker.number.int(5000),
        lmsResourceDownloadsLast30Days: faker.number.int(10000),
        lmsForumPostsLast30Days: faker.number.int(1000),
        lmsActivities: allLmsActivities,
        alumni: allAlumni,
        alumniActivities: allAlumniActivities,
        alumniEngagementScore: faker.number.float({min:30,max:80, multipleOf: .1}),
        overallInternshipRate: institutionPlacementKPIs.internshipCount && instTotalStudents > 0 ? parseFloat(((institutionPlacementKPIs.internshipCount / instTotalStudents) * 100).toFixed(1)) : 0,
        totalCampusCompanies: faker.number.int({min:10, max:100}),
        allPlacementRecords: allPlacementRecords,
        allResearchProjects: [], // Aggregated
        overallCourseCompletionRate: faker.number.float({min:75, max:95, multipleOf: .1}),
        totalActiveResearchProjects: faker.number.int({min:10, max:100}),
        allGrievanceTickets: allGrievanceTickets,
        grievanceCSAT: faker.number.float({min:70,max:90, multipleOf: .1}),
        sentimentDistribution: { positive: 70, neutral: 20, negative: 10, total:100},
        // New KPI fields from Institution type
        institutionAttendancePercentage: faker.number.float({min:80,max:95,multipleOf: .1}),
        totalInstitutionAbsences: faker.number.int({min:100,max:1000}),
        institutionFeesPaidPercentage: faker.number.float({min:85,max:99,multipleOf: .1}),
        totalStudentsWithOverdueFeesInInstitution: faker.number.int({min:10,max:100}),
        totalInstitutionApplicants: allApplicants.length,
        avgInstitutionAcceptanceRate: faker.number.float({min:30,max:70,multipleOf: .1}),
        totalInstitutionEnrolledCount: institutionWideStudentSummaries.filter(s=>s.enrollmentStatus === 'Active').length,
        institutionGradeDistribution: {}, // aggregate
        totalInstitutionAtRiskStudents: institutionWideStudentSummaries.filter(s=>s.cumulativeGPA && s.cumulativeGPA < 2.0).length, // simplified
    };

    return [institution];
};


// --- PARENT INSTITUTION (New Top-Level Generator) ---
export const generateMockParentInstitutions = (
    numParentInstitutions: number = 1,
    numInstitutionsPerParent: number = faker.number.int({min:1, max:2}), // Reduced for manageability
    numStudentsPerInstitutionContext: number = 150 // Reduced for manageability
): ParentInstitution[] => {
    const parentInstitutions: ParentInstitution[] = [];

    for (let i = 0; i < numParentInstitutions; i++) {
        const parentId = `PARENT-${faker.string.uuid().substring(0,8)}`;
        const parentName = `${faker.company.name()} System`;

        const institutions: Institution[] = [];
        let totalStudentsInParent = 0;
        let parentGpaSum = 0;
        let studentsCountedForParentGpa = 0;

        for (let j = 0; j < numInstitutionsPerParent; j++) {
            const studentsForThisInstitution = generateMockStudents(numStudentsPerInstitutionContext);

            const generatedInstitutionArray = generateMockNewInstitutions(
                parentId,
                studentsForThisInstitution,
                3,
                30 // Reduced numApplicantsPerProgramContext
            );
            if (generatedInstitutionArray.length > 0) {
                const inst = generatedInstitutionArray[0];
                institutions.push(inst);
                totalStudentsInParent += inst.totalStudents || 0;
                if (inst.overallAverageGPA !== undefined && inst.totalStudents) {
                    parentGpaSum += inst.overallAverageGPA * inst.totalStudents;
                    studentsCountedForParentGpa += inst.totalStudents;
                }
            }
        }

        const overallAverageGPA = studentsCountedForParentGpa > 0 ? parseFloat((parentGpaSum / studentsCountedForParentGpa).toFixed(2)) : undefined;

        parentInstitutions.push({
            parentInstitutionId: parentId,
            parentInstitutionName: parentName,
            institutions,
            totalStudents: totalStudentsInParent,
            overallAverageGPA,
            totalFaculty: institutions.reduce((sum, inst) => sum + (inst.faculties?.reduce((s,f) => s + (f.totalFacultyMembers || 0),0) || 0),0),
            totalPrograms: institutions.reduce((sum, inst) => sum + (inst.faculties?.reduce((s,f) => s + (f.departments?.reduce((d_s, d) => d_s + d.degreeIds.length,0) ||0),0) || 0),0),
            overallPlacementRate: faker.number.float({min:60, max:90, multipleOf: .1}), // Mock
            totalResearchGrantsValue: faker.number.int({min:1000000, max: 50000000}) // Mock
        });
    }
    return parentInstitutions;
};


// Comment out or remove old generation functions that are superseded
// export const generateMockInstitutions = (...) // This is the old main function

// The old generateMockDegree, generateMockProgram, generateMockSemester might still be used by generateMockAcademicYear
// or other parts of the old structure. They need to be carefully phased out or adapted.
// For now, I've created new versions (generateMockNewDegree, etc.) and they are used by the new top-level generator.

// --- Original Helper Functions (calculateSemesterAverageGPA, etc.) ---
// These were defined before generateMockSemester and generateMockProgram.
// They might be incompatible or need adjustment for the new Course/Section structure if reused.
// For example, calculateSemesterAverageGPA took CourseEnrollment[], not Course[].
// The new generateMockNewSemester has its own GPA calculation for now.

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


export const generateMockSemester = (
    term: Term,
    studentsInProgramForSemester: StudentSummary[],
    allAttendanceRecords: AttendanceRecord[], // All attendance for the institution
    allInvoices: Invoice[] // All invoices for the institution
): Semester => {
    const semesterStudents = studentsInProgramForSemester;
    const studentIdsInSemester = semesterStudents.map(s => s.studentId);

    // Calculate new KPIs for the semester
    let attendanceKPIs = calculateAttendanceKPIs(studentIdsInSemester, allAttendanceRecords, term.startDate, term.endDate); // Made attendanceKPIs 'let'
    const billingKPIs = calculateBillingKPIs(studentIdsInSemester, allInvoices); // Invoices are typically not semester-specific in the same way attendance is.
                                                                            // This will use all invoices for these students. Refine if invoices are term-linked.

    // DATA REALISM: Simulate lower attendance for a specific term (e.g., Fall of the previous year)
    const currentYear = dayjs().year();
    const targetTermIdForLowerAttendance = `FA${currentYear - 1}`; // Example: FA2023 if current year is 2024
    let finalAttendancePercentage = attendanceKPIs.percentage;

    if (term.termId === targetTermIdForLowerAttendance && finalAttendancePercentage !== undefined) {
        const reducedAttendance = finalAttendancePercentage * 0.90; // Reduce by 10%
        finalAttendancePercentage = Math.max(60, parseFloat(reducedAttendance.toFixed(2))); // Ensure it doesn't go below 60%
        // Add a console log for debugging/verification if needed:
        // console.log(`INFO: Term ${term.termId} original attendance ${attendanceKPIs.percentage}%, modified to ${finalAttendancePercentage}%`);
    }

    return {
        termId: term.termId,
        termName: term.termName, // Corrected from semesterName to termName
        startDate: term.startDate,
        endDate: term.endDate,
        courses: term.courses,
        students: semesterStudents,
        averageGPA: calculateSemesterAverageGPA(semesterStudents, term.courses, term.termId),
        passRate: calculateSemesterPassRate(semesterStudents, term.courses, term.termId),
        // New KPIs
        attendancePercentage: finalAttendancePercentage, // Use potentially modified attendance
        totalAbsences: attendanceKPIs.totalAbsences, // Total absences remain based on original calculation for now
        feesPaidPercentage: billingKPIs.feesPaidPercentage,
        studentsWithOverdueFees: billingKPIs.overdueCount,
    };
};

export const generateMockProgram = (
    programId: string,
    programName: string,
    degreeId: string, // Retain for now, indicates the degree type this program awards
    departmentId: string | undefined, // Added: To link program to a department
    requiredCredits: number,
    allStudents: Student[], // Base list of all students in institution
    allAcademicRecords: StudentAcademicRecord[], // All academic records
    allAttendanceRecords: AttendanceRecord[],
    allInvoices: Invoice[],
    allApplicants: Applicant[],
    allPlacementRecords: PlacementRecord[],
    termsForProgram: Term[] // Terms relevant for this program's duration/semesters
): Program => {
    // Filter records specific to this program
    const programStudentRecords = allAcademicRecords.filter(ar => ar.programId === programId);
    const programStudentIdsSet = new Set(programStudentRecords.map(ar => ar.studentId));
    const programStudents = allStudents.filter(s => programStudentIdsSet.has(s.id));

    const programStudentSummaries = programStudents.map(student => {
        const record = programStudentRecords.find(r => r.studentId === student.id);
        return generateMockStudentSummary(student, record!);
    });

    const semesters = termsForProgram.map(term => {
        // Simplification: Assume all programStudentSummaries are relevant for every term of the program.
        // More realistic: Filter students based on their actual enrollment period for the term.
        // For example, only include students whose enrollmentStatus is 'Active' and whose
        // academic history suggests they were active in this specific term.
        const activeStudentsInSemester = programStudentSummaries.filter(s => s.enrollmentStatus === 'Active'); // Keep this simple filter for now
        return generateMockSemester(
            term,
            activeStudentsInSemester,
            allAttendanceRecords, // Pass down relevant slices or full lists
            allInvoices           // Pass down relevant slices or full lists
            );
    });

    const totalStudentsInProgram = programStudentSummaries.length;
    // const programStudentIds = programStudentSummaries.map(s => s.studentId); // Removed second declaration
    const programStudentIdsArray = Array.from(programStudentIdsSet);

    // Aggregate KPIs for the Program
    const programAttendanceKPIs = calculateAttendanceKPIs(programStudentIdsArray, allAttendanceRecords);
    const programBillingKPIs = calculateBillingKPIs(programStudentIdsArray, allInvoices);

    const applicantsForProgram = allApplicants.filter(app => app.programId === programId);
    const programAdmissionKPIs = calculateAdmissionKPIs(applicantsForProgram);

    let programPlacementKPIs = calculatePlacementKPIs(programStudentIdsArray, programStudentSummaries, allPlacementRecords); // Made let

    const programGradeDistribution = calculateGradeDistribution(programStudentRecords);
    let programAtRiskStudents = countAtRiskStudents(programStudentRecords, programStudentIdsArray, allAttendanceRecords); // Made let

    let sumOfGpas = 0;
    let studentsWithGpas = 0;
    programStudentSummaries.forEach(s => {
        if (s.cumulativeGPA !== undefined) {
            sumOfGpas += s.cumulativeGPA;
            studentsWithGpas++;
        }
    });
    let averageProgramGPA = studentsWithGpas > 0 ? parseFloat((sumOfGpas / studentsWithGpas).toFixed(2)) : undefined; // Made let

    // Mock graduation rate
    const graduatedStudents = programStudentSummaries.filter(s => s.enrollmentStatus === 'Graduated').length;
    const eligibleForGraduation = programStudentSummaries.filter(s => s.totalCreditsEarned && s.totalCreditsEarned >= requiredCredits).length;
    // Base graduation rate on those who have graduated out of those who were eligible or are still active.
    let graduationRate = eligibleForGraduation > 0 ? parseFloat(((graduatedStudents / eligibleForGraduation) * 100).toFixed(2)) : faker.number.float({ min: 60, max: 95, multipleOf: 0.01 }); // Made let

    const passingStudentsInProgram = programStudentSummaries.filter(s => s.cumulativeGPA !== undefined && s.cumulativeGPA >= 2.0).length;
    const programPassRate = totalStudentsInProgram > 0 ? parseFloat(((passingStudentsInProgram / totalStudentsInProgram) * 100).toFixed(2)) : 0;

    // DATA REALISM: Introduce issues for a "Problematic Program" (e.g., PSY_BS)
    if (programId === "PSY_BS") {
        // console.log(`INFO: Modifying stats for problematic program: ${programId}`);
        if (averageProgramGPA !== undefined) {
            averageProgramGPA = parseFloat(Math.max(1.0, averageProgramGPA * 0.85).toFixed(2)); // Lower GPA by 15%, ensure it's at least 1.0
        }
        if (programPlacementKPIs.rate !== undefined) {
            programPlacementKPIs.rate = parseFloat(Math.max(0, programPlacementKPIs.rate - 15).toFixed(2)); // Reduce placement rate by 15 points
        }
        // Increase at-risk students by a few, or a percentage
        const additionalAtRisk = Math.min(totalStudentsInProgram - programAtRiskStudents, faker.number.int({min: 3, max: Math.max(3, Math.floor(totalStudentsInProgram * 0.1))}) ); // Add 3-10% more at-risk students
        programAtRiskStudents += additionalAtRisk;

        // Optionally, slightly lower graduation rate too for this program
        graduationRate = parseFloat(Math.max(30, graduationRate * 0.8).toFixed(2)); // Reduce grad rate by 20%, floor at 30%
    }

    return {
        programId,
        programName,
        degreeId, // Degree type it awards
        departmentId, // Assigned department
        requiredCredits,
        semesters, // Now uses NewSemester
        totalStudents: totalStudentsInProgram,
        averageProgramGPA,
        graduationRate,
        programPassRate,
        // KPIs from calculations
        placementRate: programPlacementKPIs.rate,
        averagePackage: programPlacementKPIs.avgPackage,
        totalPlacedStudents: programPlacementKPIs.placedCount,
        totalInternships: programPlacementKPIs.internshipCount,
        avgAttendancePercentage: programAttendanceKPIs.percentage, // Attendance is better at course/section level
        totalProgramAbsences: programAttendanceKPIs.totalAbsences, // Same as above
        avgFeesPaidPercentage: programBillingKPIs.feesPaidPercentage, // Fee status might be tracked differently
        totalStudentsWithOverdueFees: programBillingKPIs.overdueCount, // Same as above
        applicants: programAdmissionKPIs.applicants,
        acceptanceRate: programAdmissionKPIs.acceptanceRate,
        enrolledCount: programAdmissionKPIs.enrolledCount,
        gradeDistribution: programGradeDistribution, // Aggregated from course grades ideally
        atRiskStudents: programAtRiskStudents, // Identified based on course performance or overall status
    };
};

// Existing generateMockProgram should be replaced or removed.
// For now, let's assume generateMockNewProgram is the one to be used.

// --- DEGREE ---
// Update generateMockDegree to generateMockNewDegree
// It should include departmentId and use generateMockNewProgram

export const generateMockNewDegree = (
    degreeConfig: { degreeId: string, degreeName: string },
    departmentId: string,
    // Student-related data passed down from a higher level (e.g., Faculty or Institution)
    allStudentsInScope: Student[],
    allAcademicRecordsInScope: StudentAcademicRecord[],
    allAttendanceRecords: AttendanceRecord[],
    allInvoices: Invoice[],
    allApplicants: Applicant[],
    allPlacementRecords: PlacementRecord[]
): Degree => {
    const { degreeId, degreeName } = degreeConfig;
    const programsInDegreeConfig = degreeProgramMappings[degreeId] || [];

    const programs: Program[] = programsInDegreeConfig.map(pConfig => {
        // Students for this program are filtered from the scope passed to the Degree
        return generateMockNewProgram(
            pConfig,
            degreeId,
            allStudentsInScope,
            allAcademicRecordsInScope,
            allAttendanceRecords,
            allInvoices,
            allApplicants,
            allPlacementRecords,
            faker.number.int({ min: 4, max: 8 }) // Number of semesters for the program
        );
    });

    // Aggregate Student Summaries and IDs for the Degree from its programs
    const degreeStudentSummariesMap = new Map<string, StudentSummary>();
    programs.forEach(prog => {
        // Re-derive student summaries for this degree's programs from academic records in scope
        const programStudentRecords = allAcademicRecordsInScope.filter(ar => ar.programId === prog.programId);
        programStudentRecords.forEach(psr => {
            if (!degreeStudentSummariesMap.has(psr.studentId)) {
                 const student = allStudentsInScope.find(s => s.id === psr.studentId);
                 if(student) {
                    // Ensure generateMockStudentSummary is available and correctly typed
                    degreeStudentSummariesMap.set(psr.studentId, generateMockStudentSummary(student, psr));
                 }
            }
        });
    });
    const degreeStudentSummaries = Array.from(degreeStudentSummariesMap.values());
    const degreeStudentIds = degreeStudentSummaries.map(s => s.studentId);

    // Aggregate KPIs for the Degree (similar to old generateMockDegree but using new program structure)
    let totalStudentsInDegree = degreeStudentSummaries.length;
    let sumOfProgramGpas = 0;
    let totalStudentsForGpaCalc = 0;
    // ... other KPI aggregations ...

    programs.forEach(prog => {
        if (prog.averageProgramGPA !== undefined && prog.totalStudents) {
            sumOfProgramGpas += prog.averageProgramGPA * prog.totalStudents;
            totalStudentsForGpaCalc += prog.totalStudents;
        }
        // Aggregate other KPIs from prog similarly
    });

    const averageDegreeGPA = totalStudentsForGpaCalc > 0 ? parseFloat((sumOfProgramGpas / totalStudentsForGpaCalc).toFixed(2)) : undefined;
    const degreePlacementKPIs = calculatePlacementKPIs(degreeStudentIds, degreeStudentSummaries, allPlacementRecords);
    // Mock other KPIs or aggregate them properly
    const totalApplicants = programs.reduce((sum, p) => sum + (p.applicants || 0), 0);
    const totalEnrolledCount = programs.reduce((sum, p) => sum + (p.enrolledCount || 0), 0);
    // Simplified acceptance rate: total enrolled / total applicants for the degree
    const avgAcceptanceRate = totalApplicants > 0 ? parseFloat(((totalEnrolledCount / totalApplicants) * 100).toFixed(2)) : undefined;


    return {
        degreeId,
        degreeName,
        departmentId, // New field
        programs, // Contains new Program objects
        totalStudents: totalStudentsInDegree,
        averageDegreeGPA,
        // KPIs (some mocked, some aggregated)
        placementRate: degreePlacementKPIs.rate,
        averagePackage: degreePlacementKPIs.avgPackage,
        totalPlacedStudents: degreePlacementKPIs.placedCount,
        totalInternships: degreePlacementKPIs.internshipCount,
        totalApplicants,
        avgAcceptanceRate,
        totalEnrolledCount,
        // overallGradeDistribution, totalAtRiskStudents etc. should be aggregated from programs
        overallGradeDistribution: {}, // Placeholder
        totalAtRiskStudents: programs.reduce((sum, p) => sum + (p.atRiskStudents || 0), 0), // Example aggregation
        // Remove attendance/fee KPIs if they are too granular for Degree level now
    };
};


// --- DEPARTMENT ---
// Department type from: import { Department } from '../../../types/departments';
// Department type has: departmentId, departmentName, facultyId, degreeIds, KPIs.

// Predefined department configurations (can be expanded)
const departmentConfigs = [
    { departmentId: 'DEPT_STEM', departmentName: 'School of STEM', facultyId: '', degreeConfigs: [mockDegrees[0], mockDegrees[2]] }, // Bachelors, Doctorate for STEM
    { departmentId: 'DEPT_ARTS', departmentName: 'School of Arts & Humanities', facultyId: '', degreeConfigs: [mockDegrees[0], mockDegrees[1]] }, // Bachelors, Masters for ARTS
    { departmentId: 'DEPT_BUSINESS', departmentName: 'School of Business', facultyId: '', degreeConfigs: [mockDegrees[1]] } // Masters for Business
];

export const generateMockDepartments = (
    facultyId: string,
    // Student data scoped to the faculty
    allStudentsInFaculty: Student[],
    allAcademicRecordsInFaculty: StudentAcademicRecord[],
    allAttendanceRecords: AttendanceRecord[], // Full lists, will be filtered by student IDs
    allInvoices: Invoice[],
    allApplicants: Applicant[],
    allPlacementRecords: PlacementRecord[]
): Department[] => {
    const departments: Department[] = [];

    departmentConfigs.forEach(deptConfig => {
        // Assign facultyId to this department
        const currentDepartmentId = `${deptConfig.departmentId}-${facultyId.slice(-4)}`; // Make ID unique per faculty

        // Filter students for this department based on programs within degrees of this dept.
        // This is a bit tricky as programs are defined under degrees.
        // For mock data, we can assign a portion of faculty students to each department.
        // Or, more accurately, sum students from degrees generated for this department.

        const degrees: Degree[] = deptConfig.degreeConfigs.map(degConf => {
            // For each degree, we need to determine the relevant student subset.
            // Let's assume for now that students passed to generateMockNewDegree are filtered appropriately.
            // However, generateMockNewDegree itself filters students based on programs.
            // A simpler approach for department might be to assign a slice of faculty students.
            return generateMockNewDegree(
                degConf,
                currentDepartmentId,
                allStudentsInFaculty, // Pass all faculty students, degree/program will filter
                allAcademicRecordsInFaculty,
                allAttendanceRecords,
                allInvoices,
                allApplicants,
                allPlacementRecords
            );
        });

        const degreeIds = degrees.map(d => d.degreeId);

        // Aggregate students and KPIs for the department from its degrees
        let deptTotalStudents = 0;
        const deptStudentSummariesMap = new Map<string, StudentSummary>();
        degrees.forEach(degree => {
            degree.programs.forEach(prog => {
                const progStudentRecords = allAcademicRecordsInFaculty.filter(ar => ar.programId === prog.programId);
                progStudentRecords.forEach(psr => {
                    if (!deptStudentSummariesMap.has(psr.studentId)) {
                        const student = allStudentsInFaculty.find(s => s.id === psr.studentId);
                        if (student) {
                            deptStudentSummariesMap.set(psr.studentId, generateMockStudentSummary(student, psr));
                        }
                    }
                });
            });
        });
        const deptStudentSummaries = Array.from(deptStudentSummariesMap.values());
        deptTotalStudents = deptStudentSummaries.length;

        let deptGpaSum = 0;
        let studentsCountedForDeptGpa = 0;
        deptStudentSummaries.forEach(s => {
            if (s.cumulativeGPA !== undefined) {
                deptGpaSum += s.cumulativeGPA;
                studentsCountedForDeptGpa++;
            }
        });
        const departmentAverageGPA = studentsCountedForDeptGpa > 0 ? parseFloat((deptGpaSum / studentsCountedForDeptGpa).toFixed(2)) : undefined;

        const deptPlacementKPIs = calculatePlacementKPIs(deptStudentSummaries.map(s=>s.studentId), deptStudentSummaries, allPlacementRecords);

        departments.push({
            departmentId: currentDepartmentId,
            departmentName: deptConfig.departmentName,
            facultyId,
            degreeIds, // Changed from programIds to degreeIds
            totalStudents: deptTotalStudents,
            departmentAverageGPA, // Renamed for clarity from averageGPA
            departmentPlacementRate: deptPlacementKPIs.rate, // Renamed
            // departmentPassRate: // Calculate if needed
            // performanceScore, mockStudentSatisfactionScore can be added later
        });
    });

    return departments;
};

// --- FACULTY ---
export const generateMockFaculties = (
    institutionId: string,
    // Student data scoped to the institution
    allStudentsInInstitution: Student[],
    allAcademicRecordsInInstitution: StudentAcademicRecord[],
    allAttendanceRecords: AttendanceRecord[],
    allInvoices: Invoice[],
    allApplicants: Applicant[],
    allPlacementRecords: PlacementRecord[],
    numFaculties: number = faker.number.int({ min: 2, max: 4 })
): Faculty[] => {
    const faculties: Faculty[] = [];
    const facultyNames = ["Faculty of Engineering", "Faculty of Arts & Sciences", "Faculty of Business", "Faculty of Health Sciences", "Faculty of Design"];

    for (let i = 0; i < numFaculties; i++) {
        const facultyId = `FACULTY-${institutionId.slice(-4)}-${i + 1}`;
        const facultyName = faker.helpers.arrayElement(facultyNames.filter(fn => !faculties.find(f=>f.facultyName === fn))) || `${faker.company.bsBuzz()} Faculty`;

        // Distribute a portion of institution's students to this faculty.
        // This is a simplification. A real system would have explicit student-faculty enrollment.
        // For mock data, let's say each faculty gets a roughly equal share, with some overlap.
        const studentsForFaculty = pickRandomSubset(allStudentsInInstitution, Math.ceil(allStudentsInInstitution.length / numFaculties) + 5);
        const academicRecordsForFaculty = allAcademicRecordsInInstitution.filter(ar =>
            studentsForFaculty.some(s => s.id === ar.studentId)
        );

        const departments = generateMockDepartments(
            facultyId,
            studentsForFaculty,
            academicRecordsForFaculty,
            allAttendanceRecords,
            allInvoices,
            allApplicants,
            allPlacementRecords
        );

        let totalStudentsInFaculty = 0;
        let facultyGpaSum = 0;
        let studentsCountedForFacultyGpa = 0;

        const facultyStudentSummariesMap = new Map<string, StudentSummary>();
        departments.forEach(dept => {
            // To get students for faculty GPA, need to look into dept's degrees -> programs -> students
            // This is similar to how department aggregates students.
            dept.degreeIds.forEach(degreeId => { // Assuming degreeIds are populated correctly
                const degree = mockDegrees.find(d => d.degreeId === degreeId); // Need full Degree objects from dept
                // This is insufficient; generateMockDepartments returns Department with degreeIds (string[])
                // It should ideally return Department with Degree[] or we need to reconstruct.
                // For now, let's sum up dept.totalStudents as a proxy.
            });
            // This is a simplification: sum of department totals might double count if students are in multiple depts (not typical)
            // A better way: aggregate unique students from the departments' student lists.
            // For now, let's use the studentsForFaculty list for KPI calculation for faculty level.
        });

        studentsForFaculty.forEach(s => {
            const record = academicRecordsForFaculty.find(ar => ar.studentId === s.id);
            if (record?.cumulativeGPA !== undefined) {
                facultyGpaSum += record.cumulativeGPA;
                studentsCountedForFacultyGpa++;
            }
        });
        totalStudentsInFaculty = studentsForFaculty.length; // Based on initial distribution

        const averageFacultyGPA = studentsCountedForFacultyGpa > 0 ? parseFloat((facultyGpaSum / studentsCountedForFacultyGpa).toFixed(2)) : undefined;

        faculties.push({
            facultyId,
            facultyName,
            institutionId,
            departments,
            totalStudents: totalStudentsInFaculty,
            averageFacultyGPA,
            totalFacultyMembers: faker.number.int({min: 20, max: 100}), // Mocked
            researchProjectsCount: faker.number.int({min: 5, max: 50}) // Mocked
        });
    }
    return faculties;
};


// --- INSTITUTION (Update) ---
export const generateMockNewInstitutions = ( // Renamed from generateMockInstitutions
    parentInstitutionId: string | undefined, // New optional parameter
    // numInstitutions: number = 1 // Typically generate one detailed institution per call now
    allStudentsForParentInst: Student[], // All students for the parent, to be used by this institution
    numYears: number = 3,
    numApplicantsPerProgram: number = 50
): Institution[] => { // Still returns array for flexibility, but usually one

    // For a single institution, all students passed are for this institution.
    const allStudents = allStudentsForParentInst;
    const allAcademicRecords = generateMockAcademicRecords(allStudents);
    const institutionWideStudentSummaries = allAcademicRecords.map(ar =>
        generateMockStudentSummary(allStudents.find(s => s.id === ar.studentId)!, ar)
    );
    const institutionStudentIds = institutionWideStudentSummaries.map(s => s.studentId);

    // Other base data generation (LMS, Placement, Attendance, Invoices, etc.) remains largely the same
    const allLmsActivities = generateMockLmsActivityData(institutionWideStudentSummaries, 20, 60);
    const allPlacementRecords = generateMockPlacementData(institutionWideStudentSummaries);
    const allAttendanceRecords = generateMockAttendanceRecords(allStudents, [], numYears * 365);
    const allInvoices = generateMockInvoices(allStudents, 5, new Set()); // Simplified overdue cohort for now
    const allApplicants = generateMockApplicants(numApplicantsPerProgram * programs.length); // `programs` is old global

    const institutionId = faker.string.uuid();
    const institutionName = `${faker.company.name()} University`;

    // Generate Faculties instead of Departments directly
    const faculties = generateMockFaculties(
        institutionId,
        allStudents,
        allAcademicRecords,
        allAttendanceRecords,
        allInvoices,
        allApplicants,
        allPlacementRecords,
        faker.number.int({min: 3, max: 5}) // Number of faculties per institution
    );

    // Academic Years generation needs to be reviewed.
    // The old generateMockAcademicYear creates Degrees -> Programs.
    // These programs should ideally be the same instances as those within Department -> Degree -> Program.
    // The new structure is Institution -> Faculty -> Department -> Degree -> Program.
    // AcademicYear might be a cross-cutting concern, e.g., showing all degrees offered in a year.
    // For now, let's keep AcademicYear generation but ensure data consistency if possible.
    // The challenge is linking programs from faculties/departments back into academic year views.

    // Simplified AcademicYears for now, focusing on the new Faculty structure.
    // A deeper refactor would be needed for AcademicYear to correctly reflect programs from the new hierarchy.
    const academicYearsData: AcademicYear[] = []; // Placeholder or generate with careful consideration

    // Aggregating KPIs for the institution from FACULTIES now
    let instTotalStudents = 0;
    let instGpaSum = 0;
    let instStudentsForGpa = 0;

    faculties.forEach(faculty => {
        // Sum students from faculties. Ensure unique count if a student could be in multiple (not typical).
        instTotalStudents += faculty.totalStudents || 0;
        if (faculty.averageFacultyGPA !== undefined && faculty.totalStudents) {
            instGpaSum += faculty.averageFacultyGPA * faculty.totalStudents;
            instStudentsForGpa += faculty.totalStudents;
        }
    });
    const overallAverageGPA = instStudentsForGpa > 0 ? parseFloat((instGpaSum / instStudentsForGpa).toFixed(2)) : undefined;

    // Other institution-wide KPIs (re-evaluation, grievances, compliance, etc.)
    // can be generated similarly to the old `generateMockInstitutions` function.
    // For brevity, these are omitted here but should be reintegrated.
    const allReEvaluationRequests = generateMockReEvaluationData(institutionWideStudentSummaries, [], 100); // CourseEnrollment part needs update
    const pendingReEvaluationsCount = allReEvaluationRequests.filter(r => r.status === 'Pending').length;
    const allGrievanceTickets = generateMockGrievanceData(institutionWideStudentSummaries, [], 75);
    const openGrievancesCount = allGrievanceTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
    // ... and so on for other KPIs ...

    const institution: Institution = {
        institutionId,
        institutionName,
        parentInstitutionId, // New field
        faculties, // New field, replaces departments
        academicYears: academicYearsData, // Needs careful integration
        totalStudents: instTotalStudents,
        overallAverageGPA,
        // Many other KPIs from the old generateMockInstitutions should be added back here
        // For example: placement, alumni, LMS, compliance, etc.
        // These would be aggregated from faculty/department data or generated for the institution.
        overallPlacementRate: faker.number.float({min:60,max:90, multipleOf: 0.1}), // Mock
        pendingReEvaluationsCount,
        openGrievancesCount,
        // ... other fields from the Institution type
    };

    return [institution]; // Return as an array
};


// --- PARENT INSTITUTION (New Top-Level Generator) ---
export const generateMockParentInstitutions = (
    numParentInstitutions: number = 1,
    numInstitutionsPerParent: number = faker.number.int({min:1, max:3}),
    numStudentsPerInstitution: number = 200 // Average number of students for each institution
): ParentInstitution[] => {
    const parentInstitutions: ParentInstitution[] = [];

    for (let i = 0; i < numParentInstitutions; i++) {
        const parentId = `PARENT-${faker.string.uuid().substring(0,8)}`;
        const parentName = `${faker.company.name()} System`;

        const institutions: Institution[] = [];
        let totalStudentsInParent = 0;
        let parentGpaSum = 0;
        let studentsCountedForParentGpa = 0;

        // Generate a pool of students for this ParentInstitution, then distribute.
        // Or, generate students per institution and aggregate. Let's do the latter for simplicity here.

        for (let j = 0; j < numInstitutionsPerParent; j++) {
            // Generate a distinct set of students for each institution under this parent
            const studentsForThisInstitution = generateMockStudents(numStudentsPerInstitution);

            const generatedInstitutionArray = generateMockNewInstitutions(
                parentId,
                studentsForThisInstitution, // Pass the specific students for this institution
                3, // numYears for academic data
                50 // numApplicantsPerProgram
            );
            if (generatedInstitutionArray.length > 0) {
                const inst = generatedInstitutionArray[0];
                institutions.push(inst);
                totalStudentsInParent += inst.totalStudents || 0;
                if (inst.overallAverageGPA !== undefined && inst.totalStudents) {
                    parentGpaSum += inst.overallAverageGPA * inst.totalStudents;
                    studentsCountedForParentGpa += inst.totalStudents;
                }
            }
        }

        const overallAverageGPA = studentsCountedForParentGpa > 0 ? parseFloat((parentGpaSum / studentsCountedForParentGpa).toFixed(2)) : undefined;

        parentInstitutions.push({
            parentInstitutionId: parentId,
            parentInstitutionName: parentName,
            institutions,
            totalStudents: totalStudentsInParent,
            overallAverageGPA,
            totalFaculty: institutions.reduce((sum, inst) => sum + (inst.faculties?.reduce((s,f) => s + (f.totalFacultyMembers || 0),0) || 0),0), // Example KPI
            totalPrograms: institutions.reduce((sum, inst) => sum + (inst.faculties?.reduce((s,f) => s + (f.departments?.reduce((d_s, d) => d_s + d.degreeIds.length,0) ||0),0) || 0),0), // Approximation
            // overallPlacementRate, totalResearchGrantsValue etc. can be aggregated or mocked
        });
    }
    return parentInstitutions;
};


// Comment out or remove old generation functions that are superseded
// export const generateMockInstitutions = (...) // This is the old one

// The old generateMockDegree, generateMockProgram, generateMockSemester might still be used by generateMockAcademicYear
// or other parts of the old structure. They need to be carefully phased out or adapted.
// For now, I've created new versions (generateMockNewDegree, etc.)

// --- Original Helper Functions (calculateSemesterAverageGPA, etc.) ---
// These were defined before generateMockSemester and generateMockProgram.
// They might be incompatible or need adjustment for the new Course/Section structure if reused.
// For example, calculateSemesterAverageGPA took CourseEnrollment[], not Course[].
// The new generateMockNewSemester has its own GPA calculation for now.

const calculateSemesterAverageGPA = (students: StudentSummary[], courses: CourseEnrollment[], termId: string): number | undefined => {
        averageProgramGPA, // Potentially modified
        graduationRate, // Potentially modified
        programPassRate,
        placementRate: programPlacementKPIs.rate, // Potentially modified
        averagePackage: programPlacementKPIs.avgPackage,
        totalPlacedStudents: programPlacementKPIs.placedCount,
        totalInternships: programPlacementKPIs.internshipCount,
        avgAttendancePercentage: programAttendanceKPIs.percentage,
        totalProgramAbsences: programAttendanceKPIs.totalAbsences,
        avgFeesPaidPercentage: programBillingKPIs.feesPaidPercentage,
        totalStudentsWithOverdueFees: programBillingKPIs.overdueCount,
        applicants: programAdmissionKPIs.applicants,
        acceptanceRate: programAdmissionKPIs.acceptanceRate,
        enrolledCount: programAdmissionKPIs.enrolledCount,
        gradeDistribution: programGradeDistribution,
        atRiskStudents: programAtRiskStudents, // Potentially modified
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
    allStudents: Student[], // Base list of all students
    allAcademicRecords: StudentAcademicRecord[], // All academic records
    allAttendanceRecords: AttendanceRecord[],
    allInvoices: Invoice[],
    allApplicants: Applicant[],
    allPlacementRecords: PlacementRecord[],
    availableTerms: Term[],
    // departmentIdToAssign?: string, // This parameter was not used and is being removed.
    existingPrograms?: Program[] // Added to use pre-generated programs for consistency
): Degree => {
    const programsInDegreeConfig = degreeProgramMappings[degreeId] || [];
    if (programsInDegreeConfig.length === 0) {
        console.warn(`No program definitions found for degreeId: ${degreeId}.`);
    }

    let generatedPrograms: Program[];

    if (existingPrograms) {
        // Filter from existing programs if provided.
        // This ensures that we use the program instances that may already be linked to departments.
        generatedPrograms = existingPrograms.filter(ep =>
            programsInDegreeConfig.some(pdc => pdc.programId === ep.programId)
        );

        // Optional: Check if all configured programs for the degree were found in existingPrograms.
        // This can help identify inconsistencies between degreeProgramMappings and departmentDefinitions.
        if (generatedPrograms.length !== programsInDegreeConfig.length) {
            // console.warn(`Degree ${degreeId}: Mismatch or missing programs. Configured: ${programsInDegreeConfig.length}, Found in existing: ${generatedPrograms.length}. Check programId consistency in mappings.`);
            // To handle missing programs, we could fall back to generating them,
            // but this might re-introduce the instance mismatch for those specific programs.
            // For now, we proceed with the programs found.
            const foundProgramIds = new Set(generatedPrograms.map(p => p.programId));
            const missingPrograms = programsInDegreeConfig.filter(pInfo => !foundProgramIds.has(pInfo.programId));
            if (missingPrograms.length > 0) {
                // console.warn(`Degree ${degreeId}: The following programs were configured but not found in existingPrograms: ${missingPrograms.map(p=>p.programId).join(', ')}`);
                // Fallback: Generate the missing ones to ensure the degree isn't empty if it shouldn't be.
                // This is a compromise to avoid breaking degree structures entirely if there's a config mismatch.
                const newlyGeneratedMissingPrograms = missingPrograms.map(pInfo => {
                    // console.log(`Generating fallback for missing program ${pInfo.programId} in degree ${degreeId}`);
                    return generateMockProgram(
                        pInfo.programId,
                        pInfo.programName,
                        degreeId,
                        undefined, // No departmentId if generated as fallback here
                        pInfo.requiredCredits,
                        allStudents, allAcademicRecords, allAttendanceRecords, allInvoices,
                        allApplicants, allPlacementRecords, availableTerms
                    );
                });
                generatedPrograms = [...generatedPrograms, ...newlyGeneratedMissingPrograms];
            }
        }
    } else {
        // Fallback to generating programs if not provided (maintains original behavior if new system isn't used)
        // console.warn(`Degree ${degreeId}: existingPrograms not provided. Generating new program instances. This may lead to program instance inconsistencies across hierarchy levels.`);
        generatedPrograms = programsInDegreeConfig.map(pInfo => {
            return generateMockProgram(
                pInfo.programId,
                pInfo.programName,
                degreeId, // This program awards this degree type
                undefined, // departmentId - not assigned at degree generation level directly at this stage
                pInfo.requiredCredits,
                allStudents,
                allAcademicRecords,
                allAttendanceRecords,
                allInvoices,
                allApplicants,
                allPlacementRecords,
                availableTerms
            );
        });
    }

    // Aggregate Student Summaries and IDs for the Degree
    const degreeStudentSummariesMap = new Map<string, StudentSummary>();
    generatedPrograms.forEach(prog => {
        // Need to get summaries from program's students, which are already summaries
        // This requires generateMockProgram to expose its student summaries or re-fetch them.
        // For now, let's re-filter from allAcademicRecords for students in this degree's programs
        const programStudentRecords = allAcademicRecords.filter(ar => prog.programId === ar.programId);
        programStudentRecords.forEach(psr => {
            if (!degreeStudentSummariesMap.has(psr.studentId)) {
                 const student = allStudents.find(s => s.id === psr.studentId);
                 if(student) {
                    degreeStudentSummariesMap.set(psr.studentId, generateMockStudentSummary(student, psr));
                 }
            }
        });
    });
    const degreeStudentSummaries = Array.from(degreeStudentSummariesMap.values());
    const degreeStudentIds = degreeStudentSummaries.map(s => s.studentId);

    // Aggregate KPIs for the Degree
    let totalStudentsInDegree = degreeStudentSummaries.length; // Use unique student count
    let totalDegreeAbsences = 0;
    let sumOfProgramAttendance = 0;
    let programsWithAttendance = 0; // Not used due to weighted average
    let totalStudentsWithOverdueFeesInDegree = 0;
    let sumOfProgramFeesPaid = 0;
    let programsWithFees = 0; // Not used
    let totalDegreeApplicants = 0;
    let sumOfProgramAcceptanceRates = 0;
    let programsWithAdmissions = 0; // Not used
    let totalDegreeEnrolled = 0;
    const overallGradeDistribution: { [key: string]: number } = {};
    let totalAtRiskInDegree = 0;
    let sumOfProgramGpas = 0;
    let totalStudentsForGpaCalculation = 0;
    let totalStudentsForAttendanceCalculation = 0;
    let totalStudentsForFeesCalculation = 0;
    let totalApplicantsForAcceptanceRateCalculation = 0;

    generatedPrograms.forEach(prog => {
        // totalStudentsInDegree is already set by unique student summaries length
        if (prog.averageProgramGPA !== undefined && prog.totalStudents) {
            sumOfProgramGpas += prog.averageProgramGPA * prog.totalStudents; // Weight by actual student count in program
            totalStudentsForGpaCalculation += prog.totalStudents;
        }
        if(prog.avgAttendancePercentage !== undefined && prog.totalStudents) {
            sumOfProgramAttendance += prog.avgAttendancePercentage * prog.totalStudents;
            totalStudentsForAttendanceCalculation += prog.totalStudents;
        }
        totalDegreeAbsences += prog.totalProgramAbsences || 0;
        if(prog.avgFeesPaidPercentage !== undefined && prog.totalStudents) {
            sumOfProgramFeesPaid += prog.avgFeesPaidPercentage * prog.totalStudents;
            totalStudentsForFeesCalculation += prog.totalStudents;
        }
        totalStudentsWithOverdueFeesInDegree += prog.totalStudentsWithOverdueFees || 0;
        totalDegreeApplicants += prog.applicants || 0;
        if(prog.acceptanceRate !== undefined && prog.applicants) {
            sumOfProgramAcceptanceRates += prog.acceptanceRate * prog.applicants;
            totalApplicantsForAcceptanceRateCalculation += prog.applicants;
        }
        totalDegreeEnrolled += prog.enrolledCount || 0;
        if(prog.gradeDistribution) {
            for(const grade in prog.gradeDistribution) {
                overallGradeDistribution[grade] = (overallGradeDistribution[grade] || 0) + prog.gradeDistribution[grade];
            }
        }
        totalAtRiskInDegree += prog.atRiskStudents || 0;
    });

    const degreePlacementKPIs = calculatePlacementKPIs(degreeStudentIds, degreeStudentSummaries, allPlacementRecords);

    const averageDegreeGPA = totalStudentsForGpaCalculation > 0 ? parseFloat((sumOfProgramGpas / totalStudentsForGpaCalculation).toFixed(2)) : undefined;
    const avgDegreeAttendance = totalStudentsForAttendanceCalculation > 0 ? parseFloat((sumOfProgramAttendance / totalStudentsForAttendanceCalculation).toFixed(2)) : undefined;
    const avgDegreeFeesPaid = totalStudentsForFeesCalculation > 0 ? parseFloat((sumOfProgramFeesPaid / totalStudentsForFeesCalculation).toFixed(2)) : undefined;
    const avgDegreeAcceptanceRate = totalApplicantsForAcceptanceRateCalculation > 0 ? parseFloat((sumOfProgramAcceptanceRates / totalApplicantsForAcceptanceRateCalculation).toFixed(2)) : undefined;

    return {
        degreeId,
        degreeName,
        programs: generatedPrograms,
        totalStudents: totalStudentsInDegree, // Updated based on unique summaries
        averageDegreeGPA,
        placementRate: degreePlacementKPIs.rate,
        averagePackage: degreePlacementKPIs.avgPackage,
        totalPlacedStudents: degreePlacementKPIs.placedCount,
        totalInternships: degreePlacementKPIs.internshipCount,
        avgAttendancePercentage: avgDegreeAttendance,
        totalDegreeAbsences,
        avgFeesPaidPercentage: avgDegreeFeesPaid,
        totalStudentsWithOverdueFeesInDegree,
        totalApplicants: totalDegreeApplicants,
        avgAcceptanceRate: avgDegreeAcceptanceRate,
        totalEnrolledCount: totalDegreeEnrolled,
        overallGradeDistribution,
        totalAtRiskStudents: totalAtRiskInDegree,
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
    startDate: string,
    endDate: string,
    allStudents: Student[],
    allAcademicRecords: StudentAcademicRecord[],
    allAttendanceRecords: AttendanceRecord[], // Added
    allInvoices: Invoice[], // Added
    allApplicants: Applicant[], // Added
    allPlacementRecords: PlacementRecord[], // Added
    allAvailableTerms: Term[],
    existingPrograms?: Program[] // Added to pass down pre-generated programs
): AcademicYear => {
    const termsForThisYear = allAvailableTerms.filter(term => {
        const termStart = dayjs(term.startDate);
        return termStart.isAfter(dayjs(startDate).subtract(1, 'day')) && termStart.isBefore(dayjs(endDate).add(1, 'day'));
    });

    const degreesInYear: Degree[] = mockDegrees.map(degInfo => {
        // Filter existingPrograms for the current degree if provided
        // These programs are already instantiated, potentially with department links.
        const programsForThisDegree = existingPrograms
            ? existingPrograms.filter(ep => degreeProgramMappings[degInfo.degreeId]?.some(dp => dp.programId === ep.programId))
            : undefined;

        return generateMockDegree(
            degInfo.degreeId,
            degInfo.degreeName,
            allStudents,
            allAcademicRecords,
            allAttendanceRecords,
            allInvoices,
            allApplicants,
            allPlacementRecords, // Pass down
            termsForThisYear,
            // departmentIdToAssign is removed from generateMockDegree
            programsForThisDegree // Pass filtered existing programs
        );
    }).filter(degree => degree.programs.length > 0);

    // Aggregate Student Summaries and IDs for the Academic Year
    const yearStudentSummariesMap = new Map<string, StudentSummary>();
    degreesInYear.forEach(deg => {
        // Assuming degree.programs[].semesters[].students are StudentSummary
        // This could be inefficient if many levels; better to pass summaries down or re-calc from records
        deg.programs.forEach(prog => {
            const programStudentRecords = allAcademicRecords.filter(ar => prog.programId === ar.programId);
            programStudentRecords.forEach(psr => {
                 if (!yearStudentSummariesMap.has(psr.studentId)) {
                    const student = allStudents.find(s => s.id === psr.studentId);
                    if(student) {
                        yearStudentSummariesMap.set(psr.studentId, generateMockStudentSummary(student, psr));
                    }
                }
            });
        });
    });
    const yearStudentSummaries = Array.from(yearStudentSummariesMap.values());
    const yearStudentIds = yearStudentSummaries.map(s => s.studentId);

    // Aggregate KPIs for the Academic Year
    let totalStudentsInYear = yearStudentSummaries.length; // Use unique student count
    let sumOfDegreeGpas = 0;
    let degreesWithGpas = 0;

    let annualAttendancePercentage = 0;
    let totalAnnualAbsences = 0;
    let annualFeesPaidPercentage = 0;
    let totalStudentsWithOverdueFeesInYear = 0;
    let totalAnnualApplicants = 0;
    let avgAnnualAcceptanceRate = 0;
    let totalAnnualEnrolledCount = 0;
    const annualGradeDistribution: { [key: string]: number } = {};
    let totalAnnualAtRiskStudents = 0;

    let weightedSumAttendance = 0;
    let totalStudentsForAttendance = 0;
    let weightedSumFeesPaid = 0;
    let totalStudentsForFees = 0;
    let weightedSumAcceptance = 0;
    let totalApplicantsForRate = 0;


    degreesInYear.forEach(deg => {
        // totalStudentsInYear is already set
        if (deg.averageDegreeGPA !== undefined && deg.totalStudents) {
            sumOfDegreeGpas += deg.averageDegreeGPA * deg.totalStudents; // Weight by actual student count in degree
            degreesWithGpas += deg.totalStudents;
        }
        if(deg.avgAttendancePercentage !== undefined && deg.totalStudents) {
            weightedSumAttendance += deg.avgAttendancePercentage * deg.totalStudents;
            totalStudentsForAttendance += deg.totalStudents;
        }
        totalAnnualAbsences += deg.totalDegreeAbsences || 0;
        if(deg.avgFeesPaidPercentage !== undefined && deg.totalStudents) {
            weightedSumFeesPaid += deg.avgFeesPaidPercentage * deg.totalStudents;
            totalStudentsForFees += deg.totalStudents;
        }
        totalStudentsWithOverdueFeesInYear += deg.totalStudentsWithOverdueFeesInDegree || 0;
        totalAnnualApplicants += deg.totalApplicants || 0;
        if(deg.avgAcceptanceRate !== undefined && deg.totalApplicants) {
            weightedSumAcceptance += deg.avgAcceptanceRate * deg.totalApplicants;
            totalApplicantsForRate += deg.totalApplicants;
        }
        totalAnnualEnrolledCount += deg.totalEnrolledCount || 0;
        if(deg.overallGradeDistribution) {
            for(const grade in deg.overallGradeDistribution) {
                annualGradeDistribution[grade] = (annualGradeDistribution[grade] || 0) + deg.overallGradeDistribution[grade];
            }
        }
        totalAnnualAtRiskStudents += deg.totalAtRiskStudents || 0;
    });

    const yearPlacementKPIs = calculatePlacementKPIs(yearStudentIds, yearStudentSummaries, allPlacementRecords);

    const overallAverageGPA = degreesWithGpas > 0 ? parseFloat((sumOfDegreeGpas / degreesWithGpas).toFixed(2)) : undefined;
    annualAttendancePercentage = totalStudentsForAttendance > 0 ? parseFloat((weightedSumAttendance / totalStudentsForAttendance).toFixed(2)) : 0;
    annualFeesPaidPercentage = totalStudentsForFees > 0 ? parseFloat((weightedSumFeesPaid / totalStudentsForFees).toFixed(2)) : 0;
    avgAnnualAcceptanceRate = totalApplicantsForRate > 0 ? parseFloat((weightedSumAcceptance / totalApplicantsForRate).toFixed(2)) : 0;

    return {
        yearId,
        yearName,
        startDate,
        endDate,
        degrees: degreesInYear,
        totalStudents: totalStudentsInYear, // Updated based on unique summaries
        overallAverageGPA,
        placementRate: yearPlacementKPIs.rate,
        averagePackage: yearPlacementKPIs.avgPackage,
        totalPlacedStudents: yearPlacementKPIs.placedCount,
        totalInternships: yearPlacementKPIs.internshipCount,
        annualAttendancePercentage,
        totalAnnualAbsences,
        annualFeesPaidPercentage,
        totalStudentsWithOverdueFeesInYear,
        totalAnnualApplicants,
        avgAnnualAcceptanceRate,
        totalAnnualEnrolledCount,
        annualGradeDistribution,
        totalAnnualAtRiskStudents,
    };
};

// Main function to generate the full institution hierarchy

// Static Department Definitions (can be moved to a config file later)
const departmentDefinitions = [
    { departmentId: 'DEPT_SCI_ENG', departmentName: 'School of Science & Engineering', programIds: ['CS_BS', 'CS_MS', 'CS_PHD'] },
    { departmentId: 'DEPT_ARTS_HUM', departmentName: 'School of Arts & Humanities', programIds: ['ENG_BA', 'ART_MFA', 'PSY_BS'] },
    { departmentId: 'DEPT_BUSINESS', departmentName: 'School of Business', programIds: ['MBA_GEN'] },
];


export const generateMockInstitutions = (
    allStudents: Student[], // Changed from numStudents
    numYears: number = 3, // Default number of academic years to generate
    numApplicantsPerProgram: number = 50 // For admissions data
): Institution[] => {
    // 1. Generate Base Data Sets (Institution-wide)
    // const allStudents = generateMockStudents(numStudents); // Removed: allStudents is now a parameter
    const allAcademicRecords = generateMockAcademicRecords(allStudents);
    const institutionWideStudentSummaries = allAcademicRecords.map(ar =>
        generateMockStudentSummary(allStudents.find(s => s.id === ar.studentId)!, ar)
    );
    const institutionStudentIds = institutionWideStudentSummaries.map(s => s.studentId);

    // Generate Alumni Data
    const graduatedStudentSummaries = institutionWideStudentSummaries.filter(s => s.enrollmentStatus === 'Graduated');
    const allAlumni = generateMockAlumni(graduatedStudentSummaries);
    const allAlumniActivities = generateMockAlumniActivities(allAlumni, 2); // Target 2 activities per alumnus

    // PERFORMANCE OPTIMIZATION: Reduced LMS activities per student
    const allLmsActivities = generateMockLmsActivityData(institutionWideStudentSummaries, 20, 60); // Target 20 activities/student (was 30)
    const allPlacementRecords = generateMockPlacementData(institutionWideStudentSummaries); // Generate placement records for all students, filter by eligibility later
    const allAttendanceRecords = generateMockAttendanceRecords(allStudents, [], numYears * 365);

    // DATA REALISM: Identify a cohort for increased overdue fees (e.g., students enrolled in the last year)
    const oneYearAgo = dayjs().subtract(1, 'year');
    const overdueCohortStudentIds = new Set<string>();
    allAcademicRecords.forEach(record => {
        if (dayjs(record.enrollmentDate).isAfter(oneYearAgo)) {
            overdueCohortStudentIds.add(record.studentId);
        }
    });
    // console.log(`INFO: Identified ${overdueCohortStudentIds.size} students for overdue fee cohort.`);

    const allInvoices = generateMockInvoices(allStudents, 5, overdueCohortStudentIds); // Pass cohort to invoice generation
    const estimatedTotalApplicants = numApplicantsPerProgram * programs.length; // Use actual programs length
    const allApplicants = generateMockApplicants(Math.max(estimatedTotalApplicants, allStudents.length)); // Use allStudents.length
    const institutionId = faker.string.uuid();
    const institutionName = `${faker.company.name()} University`;

    const academicYearsData: AcademicYear[] = []; // Renamed to avoid conflict with type
    const allTermsAcrossYears: Term[] = [];

    const currentCycleYear = dayjs().year();

    // Generate all terms for all relevant academic years first
    for (let i = 0; i < numYears; i++) {
        const year = currentCycleYear - numYears + 1 + i; // e.g., for numYears=2, current=2024 -> 2023, 2024
        // Fall term for this calendar year (starts the academic year)
        allTermsAcrossYears.push(generateMockTerm(0, year)); // Fall Term (e.g., Fall 2023)
        // Spring term for the next calendar year (part of the same academic year)
        allTermsAcrossYears.push(generateMockTerm(1, year + 1)); // Spring Term (e.g., Spring 2024)
    }

    const institutionWideCourseEnrollments: CourseEnrollment[] = allTermsAcrossYears.flatMap(term => term.courses);
    const allReEvaluationRequests = generateMockReEvaluationData(institutionWideStudentSummaries, institutionWideCourseEnrollments, 100);
    const pendingReEvaluationsCount = allReEvaluationRequests.filter(r => r.status === 'Pending').length;
    const thirtyDaysAgo = dayjs().subtract(30, 'days'); // For LMS activity filtering
    const totalReEvaluationsLastMonth = allReEvaluationRequests.filter(r => dayjs(r.requestDate).isAfter(thirtyDaysAgo)).length;

    // LMS Activity Counts for last 30 days
    const recentLmsActivities = allLmsActivities.filter(act => dayjs(act.timestamp).isAfter(thirtyDaysAgo));
    const lmsLoginsLast30Days = recentLmsActivities.filter(act => act.activityType === 'Login').length;
    const lmsResourceDownloadsLast30Days = recentLmsActivities.filter(act => act.activityType === 'ResourceDownload').length;
    const lmsForumPostsLast30Days = recentLmsActivities.filter(act => act.activityType === 'ForumPost').length;

    const mockStaffIds = ['STAFF001', 'STAFF002', 'STAFF003', 'STAFF004', 'STAFF005'];
    const allGrievanceTickets = generateMockGrievanceData(institutionWideStudentSummaries, mockStaffIds, 75);
    const openGrievancesCount = allGrievanceTickets.filter(
        t => t.status === 'Open' || t.status === 'In Progress'
    ).length;

    const resolvedGrievances = allGrievanceTickets.filter(
        t => (t.status === 'Resolved' || t.status === 'Closed') && t.resolvedDate && t.submittedDate
    );
    let totalResolutionDays = 0;
    resolvedGrievances.forEach(t => {
        totalResolutionDays += dayjs(t.resolvedDate).diff(dayjs(t.submittedDate), 'day');
    });
    const avgGrievanceResolutionTimeDays = resolvedGrievances.length > 0
        ? parseFloat((totalResolutionDays / resolvedGrievances.length).toFixed(1))
        : 0;

    // Moved department population before its use
    const institutionDepartments: Department[] = [];
    const allProgramsGeneratedForDepartments: Program[] = [];

    departmentDefinitions.forEach(deptDef => {
        const programsInThisDepartmentConfig = programs.filter(p => deptDef.programIds.includes(p.id)); // `programs` is old global
        const departmentProgramInstances: Program[] = [];

        // This section needs to use generateMockNewProgram and the new hierarchy
        // For now, this department generation is part of the OLD generateMockInstitutions
        // It will be superseded by generateMockFaculties -> generateMockDepartments
        // This block can be removed when generateMockInstitutions is fully replaced.

        // programsInThisDepartmentConfig.forEach(progConfig => {
        //     const programInstance = generateMockProgram( // OLD generateMockProgram
        //         progConfig.id,
        //         progConfig.name,
        //         mockDegrees.find(d => degreeProgramMappings[d.degreeId]?.some(dp => dp.programId === progConfig.id))?.degreeId || "UNKNOWN_DEG",
        //         deptDef.departmentId,
        //         progConfig.requiredCredits,
        //         allStudents,
        //         allAcademicRecords,
        //         allAttendanceRecords,
        //         allInvoices,
        //         allApplicants,
        //         allPlacementRecords,
        //         allTermsAcrossYears
        //     );
        //     departmentProgramInstances.push(programInstance);
        //     allProgramsGeneratedForDepartments.push(programInstance);
        // });
        // ... rest of old department logic ...
    });

    // This is part of the old generateMockInstitutions.
    // For the new structure, compliance items would be associated with the new Institution object.
    // const complianceItems = generateMockComplianceItems(institutionDepartments, 50); // institutionDepartments is from old structure
    const accreditationStatuses = generateMockAccreditationStatusSummary(2);

    const compliantItemsCount = complianceItems.filter(item => item.status === 'Compliant').length;
    const overallCompliancePercentage = complianceItems.length > 0
        ? parseFloat(((compliantItemsCount / complianceItems.length) * 100).toFixed(1))
        : 100;
    const pendingComplianceItemsCount = complianceItems.filter(
        item => item.status === 'In Progress' || item.status === 'Pending Review'
    ).length;

    let nextAccreditationReviewDate: string | undefined = undefined;
    let primaryAccreditationBody: AccreditingBody | undefined = undefined;

    if (accreditationStatuses.length > 0) {
        primaryAccreditationBody = accreditationStatuses[0].body;
        // Find the earliest future date from validUntil or nextMajorReviewCycle
        const futureDates: string[] = [];
        accreditationStatuses.forEach(as => {
            if (as.validUntil && dayjs(as.validUntil).isAfter(dayjs())) {
                futureDates.push(as.validUntil);
            }
            // Assuming nextMajorReviewCycle is a year, convert to a date for comparison
            const reviewCycleDate = dayjs(as.nextMajorReviewCycle, 'YYYY').endOf('year');
            if (reviewCycleDate.isAfter(dayjs())) {
                futureDates.push(reviewCycleDate.toISOString());
            }
        });
        if (futureDates.length > 0) {
            nextAccreditationReviewDate = futureDates.sort((a,b) => dayjs(a).valueOf() - dayjs(b).valueOf())[0];
        }
    }

    // 3. Generate Academic Years and Degrees (using programs generated under departments)
    // This part needs to be adapted to use `allProgramsGeneratedForDepartments`
    // For now, the existing AcademicYear/Degree generation will run, but programs might not link to these new depts.
    // This will be addressed by ensuring generateMockDegree and generateMockAcademicYear
    // correctly filter and use programs that now have departmentIds if that linkage is made.
    // The current `generateMockAcademicYear` and `generateMockDegree` will create a separate hierarchy
    // of programs that are NOT the same instances as those in `institutionDepartments`.
    // SOLUTION ATTEMPTED: `allProgramsGeneratedForDepartments` (which have department linkages)
    // are now passed down to `generateMockAcademicYear` and `generateMockDegree`.
    // This should ensure that programs within the academic hierarchy are the same instances
    // as those associated with departments, maintaining data consistency.

    // Generate Faculty Data
    // PERFORMANCE OPTIMIZATION: Reduced evaluations per faculty
    const allFacultyMembers = generateMockFacultyMembers(institutionDepartments, 7); // 7 faculty per dept
    const allFacultyEvaluations = generateMockFacultyEvaluations(allFacultyMembers, institutionWideStudentSummaries, 8); // Approx 8 evals per faculty (was 15)

    let avgFacultyRating: number | undefined = undefined;
    if (allFacultyEvaluations.length > 0) {
        const sumOfRatings = allFacultyEvaluations.reduce((acc, evalItem) => acc + evalItem.rating, 0);
        avgFacultyRating = parseFloat((sumOfRatings / allFacultyEvaluations.length).toFixed(1));
    }
    const facultyEvaluationResponseRate = parseFloat(faker.number.float({ min: 0.60, max: 0.85, precision: 0.01 }).toFixed(2)) * 100;


    for (let i = 0; i < numYears; i++) {
        const startYear = currentCycleYear - numYears + 1 + i;
        const endYear = startYear + 1;

        const yearId = `${startYear}-${endYear}`; // e.g., "2023-2024"
        const yearName = `Academic Year ${yearId}`;
        // Academic year typically starts mid-year (e.g., Aug) and ends mid-year (e.g., May/June)
        const startDate = dayjs(`${startYear}-08-15`).toISOString();
        const endDate = dayjs(`${endYear}-05-31`).toISOString();

        academicYearsData.push(
            generateMockAcademicYear(
                yearId,
                yearName,
                startDate,
                endDate,
                allStudents,
                allAcademicRecords,
                allAttendanceRecords,
                allInvoices,
                allApplicants,
                allPlacementRecords, // Pass down
                allTermsAcrossYears,
                allProgramsGeneratedForDepartments // Pass the programs linked with departments
            )
        );
    }

    const institutionPlacementKPIs = calculatePlacementKPIs(institutionStudentIds, institutionWideStudentSummaries, allPlacementRecords);

    // Calculate Alumni Engagement Score
    let alumniEngagementScore = 0;
    if (allAlumni.length > 0) {
        const totalActivities = allAlumniActivities.length;
        alumniEngagementScore = Math.min(100, (totalActivities / allAlumni.length) * 20); // Example: 5 activities per alumnus for 100 score
    }
    alumniEngagementScore = parseFloat(alumniEngagementScore.toFixed(1));

    // Calculate Overall Internship Rate
    // overallTotalInternships is count of students with internships from institutionPlacementKPIs
    let overallInternshipRate = 0;
    if (institutionWideStudentSummaries.length > 0 && institutionPlacementKPIs.internshipCount !== undefined) {
        overallInternshipRate = (institutionPlacementKPIs.internshipCount / institutionWideStudentSummaries.length) * 100;
    }
    overallInternshipRate = parseFloat(overallInternshipRate.toFixed(1));

    // Calculate Total Campus Companies
    const campusCompanyNames = new Set(allPlacementRecords.filter(p => p.campusDrive).map(p => p.companyName));
    const totalCampusCompanies = campusCompanyNames.size;

    // Aggregate Institution-Level KPIs from academicYearsData
    let instAttendancePercentage: number | undefined = 0;
    let instTotalAbsences = 0;
    let instFeesPaidPercentage: number | undefined = 0;
    let instTotalStudentsWithOverdueFees = 0;
    let instTotalApplicants = 0;
    let instAvgAcceptanceRate: number | undefined = 0;
    let instTotalEnrolled = 0;
    const instGradeDistribution: { [key: string]: number } = {};
    let instTotalAtRisk = 0;

    let weightedSumInstAttendance = 0;
    let totalStudentsForInstAttendance = 0; // Sum of students from years that have attendance data
    let weightedSumInstFeesPaid = 0;
    let totalStudentsForInstFees = 0; // Sum of students from years that have fee data
    let weightedSumInstAcceptance = 0;
    let totalApplicantsForInstRate = 0; // Sum of applicants from years that have acceptance data
    let sumOfAnnualGpas = 0;
    let totalStudentsForGpa = 0; // Sum of students from years that have GPA data

    academicYearsData.forEach(ay => {
        if(ay.annualAttendancePercentage !== undefined && ay.totalStudents) {
            weightedSumInstAttendance += ay.annualAttendancePercentage * ay.totalStudents;
            totalStudentsForInstAttendance += ay.totalStudents;
        }
        instTotalAbsences += ay.totalAnnualAbsences || 0;

        if(ay.annualFeesPaidPercentage !== undefined && ay.totalStudents) {
            weightedSumInstFeesPaid += ay.annualFeesPaidPercentage * ay.totalStudents;
            totalStudentsForInstFees += ay.totalStudents;
        }
        instTotalStudentsWithOverdueFees += ay.totalStudentsWithOverdueFeesInYear || 0;

        instTotalApplicants += ay.totalAnnualApplicants || 0;
        if(ay.avgAnnualAcceptanceRate !== undefined && ay.totalAnnualApplicants) {
            weightedSumInstAcceptance += ay.avgAnnualAcceptanceRate * ay.totalAnnualApplicants;
            totalApplicantsForInstRate += ay.totalAnnualApplicants;
        }
        instTotalEnrolled += ay.totalAnnualEnrolledCount || 0;

        if(ay.annualGradeDistribution) {
            for(const grade in ay.annualGradeDistribution) {
                instGradeDistribution[grade] = (instGradeDistribution[grade] || 0) + ay.annualGradeDistribution[grade];
            }
        }
        instTotalAtRisk += ay.totalAnnualAtRiskStudents || 0;

        if(ay.overallAverageGPA !== undefined && ay.totalStudents) {
            sumOfAnnualGpas += ay.overallAverageGPA * ay.totalStudents;
            totalStudentsForGpa += ay.totalStudents;
        }
    });

    instAttendancePercentage = totalStudentsForInstAttendance > 0 ? parseFloat((weightedSumInstAttendance / totalStudentsForInstAttendance).toFixed(2)) : undefined;
    instFeesPaidPercentage = totalStudentsForInstFees > 0 ? parseFloat((weightedSumInstFeesPaid / totalStudentsForInstFees).toFixed(2)) : undefined;
    instAvgAcceptanceRate = totalApplicantsForInstRate > 0 ? parseFloat((weightedSumInstAcceptance / totalApplicantsForInstRate).toFixed(2)) : undefined;
    const overallInstitutionGPA = totalStudentsForGpa > 0 ? parseFloat((sumOfAnnualGpas / totalStudentsForGpa).toFixed(2)) : undefined;

    const institution: Institution = {
        institutionId,
        institutionName,
        academicYears: academicYearsData,
        totalStudents: institutionWideStudentSummaries.length,
        overallAverageGPA: overallInstitutionGPA,
        overallPlacementRate: institutionPlacementKPIs.rate, // Institution-wide
        overallAveragePackage: institutionPlacementKPIs.avgPackage, // Institution-wide
        overallTotalPlacedStudents: institutionPlacementKPIs.placedCount, // Institution-wide
        overallTotalInternships: institutionPlacementKPIs.internshipCount, // Institution-wide
        departments: institutionDepartments, // Newly added departments
        pendingReEvaluationsCount: pendingReEvaluationsCount,
        totalReEvaluationsLastMonth: totalReEvaluationsLastMonth,
        openGrievancesCount: openGrievancesCount,
        avgGrievanceResolutionTimeDays: avgGrievanceResolutionTimeDays,
        overallCompliancePercentage: overallCompliancePercentage,
        pendingComplianceItemsCount: pendingComplianceItemsCount,
        nextAccreditationReviewDate: nextAccreditationReviewDate,
        accreditationBody: primaryAccreditationBody,
        complianceItems: complianceItems,
        accreditationStatuses: accreditationStatuses,
        avgFacultyRating: avgFacultyRating,
        facultyEvaluationResponseRate: facultyEvaluationResponseRate,
        facultyMembers: allFacultyMembers,
        facultyEvaluations: allFacultyEvaluations,
        institutionAttendancePercentage: instAttendancePercentage,
        totalInstitutionAbsences: instTotalAbsences,
        institutionFeesPaidPercentage: instFeesPaidPercentage,
        totalStudentsWithOverdueFeesInInstitution: instTotalStudentsWithOverdueFees,
        totalInstitutionApplicants: instTotalApplicants,
        avgInstitutionAcceptanceRate: instAvgAcceptanceRate,
        totalInstitutionEnrolledCount: instTotalEnrolled,
        institutionGradeDistribution: instGradeDistribution,
        totalInstitutionAtRiskStudents: instTotalAtRisk,
        // LMS Data
        lmsLoginsLast30Days,
        lmsResourceDownloadsLast30Days,
        lmsForumPostsLast30Days,
        lmsActivities: allLmsActivities,
        // Alumni and Enhanced Placement Data
        alumni: allAlumni,
        alumniActivities: allAlumniActivities,
        alumniEngagementScore,
        overallInternshipRate,
        totalCampusCompanies,
        allPlacementRecords: allPlacementRecords, // Add all placement records
    };

    return [institution];
};

// Remove old export if generateMockAcademicRecords is now internal
// export const generateMockAcademicRecords = (students: Student[]): StudentAcademicRecord[] => {
//   return students.map((student, index) => generateMockStudentAcademicRecord(student, index));
// };

// Make sure generateMockParentInstitutions is the primary export if it's the new entry point.
// The old generateMockInstitutions might be kept for compatibility or removed.
// For now, explicitly comment out the old generateMockInstitutions export if it exists.
// export const generateMockInstitutions = ... // This was the old one

// The new top-level export should be:
// export { generateMockParentInstitutions };
// However, tools might not support changing exports directly.
// The calling code will need to be updated to use generateMockParentInstitutions.
