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
import { ReEvaluationRequest } from '../../../types/academics';
import { generateMockReEvaluationData } from './generateMockReEvaluationData';
import { Department } from '../../../types/departments';


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
        programId: studentAcademicRecord.programId || 'UNDEF_PROG', // Default if not defined
        programName: studentAcademicRecord.programName || 'Undefined Program', // Default if not defined
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
    const attendanceKPIs = calculateAttendanceKPIs(studentIdsInSemester, allAttendanceRecords, term.startDate, term.endDate);
    const billingKPIs = calculateBillingKPIs(studentIdsInSemester, allInvoices); // Invoices are typically not semester-specific in the same way attendance is.
                                                                            // This will use all invoices for these students. Refine if invoices are term-linked.

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
        attendancePercentage: attendanceKPIs.percentage,
        totalAbsences: attendanceKPIs.totalAbsences,
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

    const programPlacementKPIs = calculatePlacementKPIs(programStudentIdsArray, programStudentSummaries, allPlacementRecords);

    const programGradeDistribution = calculateGradeDistribution(programStudentRecords);
    const programAtRiskStudents = countAtRiskStudents(programStudentRecords, programStudentIdsArray, allAttendanceRecords);

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
    const graduationRate = eligibleForGraduation > 0 ? parseFloat(((graduatedStudents / eligibleForGraduation) * 100).toFixed(2)) : faker.number.float({ min: 60, max: 95, multipleOf: 0.01 }); // precision: 2 changed to multipleOf: 0.01


    return {
        programId,
        programName,
        degreeId, // Degree type it awards
        departmentId, // Assigned department
        requiredCredits,
        semesters,
        totalStudents: programStudentSummaries.length,
        averageProgramGPA,
        graduationRate,
        placementRate: programPlacementKPIs.rate,
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
        atRiskStudents: programAtRiskStudents,
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
    departmentIdToAssign?: string // Optional: if programs under this degree should get a departmentId
): Degree => {
    const programsInDegreeData = degreeProgramMappings[degreeId] || [];
    if (programsInDegreeData.length === 0) {
        console.warn(`No program definitions found for degreeId: ${degreeId}.`);
    }

    const generatedPrograms: Program[] = programsInDegreeData.map(pInfo => {
        // When generating programs under a degree, they might not have a departmentId
        // unless the degree itself is tied to a single department.
        // For now, pass undefined for departmentId here.
        // Department assignment will happen when generating departments directly.
        return generateMockProgram(
            pInfo.programId,
            pInfo.programName,
            degreeId, // This program awards this degree type
            undefined, // departmentId - not assigned at degree generation level directly
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
    allAvailableTerms: Term[]
): AcademicYear => {
    const termsForThisYear = allAvailableTerms.filter(term => {
        const termStart = dayjs(term.startDate);
        return termStart.isAfter(dayjs(startDate).subtract(1, 'day')) && termStart.isBefore(dayjs(endDate).add(1, 'day'));
    });

    const degreesInYear: Degree[] = mockDegrees.map(degInfo => {
        return generateMockDegree(
            degInfo.degreeId,
            degInfo.degreeName,
            allStudents,
            allAcademicRecords,
            allAttendanceRecords,
            allInvoices,
            allApplicants,
            allPlacementRecords, // Pass down
            termsForThisYear
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
    numStudents: number = 250, // Default number of students for the institution
    numYears: number = 3, // Default number of academic years to generate
    numApplicantsPerProgram: number = 50 // For admissions data
): Institution[] => {
    // 1. Generate Base Data Sets (Institution-wide)
    const allStudents = generateMockStudents(numStudents); // Corrected: Use parameter `numStudents`
    const allAcademicRecords = generateMockAcademicRecords(allStudents);
    const institutionWideStudentSummaries = allAcademicRecords.map(ar =>
        generateMockStudentSummary(allStudents.find(s => s.id === ar.studentId)!, ar)
    );
    const institutionStudentIds = institutionWideStudentSummaries.map(s => s.studentId);
    const allPlacementRecords = generateMockPlacementData(institutionWideStudentSummaries);
    const allAttendanceRecords = generateMockAttendanceRecords(allStudents, [], numYears * 365);
    const allInvoices = generateMockInvoices(allStudents, 5);
    const estimatedTotalApplicants = numApplicantsPerProgram * programs.length; // Use actual programs length
    const allApplicants = generateMockApplicants(Math.max(estimatedTotalApplicants, numStudents));
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
    const oneMonthAgo = dayjs().subtract(1, 'month');
    const totalReEvaluationsLastMonth = allReEvaluationRequests.filter(r => dayjs(r.requestDate).isAfter(oneMonthAgo)).length;

    // 2. Generate Departments and Their Programs + Departmental KPIs
    const institutionDepartments: Department[] = [];
    const allProgramsGeneratedForDepartments: Program[] = [];

    departmentDefinitions.forEach(deptDef => {
        const programsInThisDepartmentConfig = programs.filter(p => deptDef.programIds.includes(p.id));
        const departmentProgramInstances: Program[] = [];

        programsInThisDepartmentConfig.forEach(progConfig => {
            // Determine relevant terms for this program (e.g., based on typical duration or all terms)
            // For simplicity, using allTermsAcrossYears, but could be refined
            const programInstance = generateMockProgram(
                progConfig.id,
                progConfig.name,
                // Infer degreeId - this mapping might need to be more robust or part of programConfig
                mockDegrees.find(d => degreeProgramMappings[d.degreeId]?.some(dp => dp.programId === progConfig.id))?.degreeId || "UNKNOWN_DEG",
                deptDef.departmentId, // Assign departmentId
                progConfig.requiredCredits,
                allStudents,
                allAcademicRecords,
                allAttendanceRecords,
                allInvoices,
                allApplicants,
                allPlacementRecords,
                allTermsAcrossYears
            );
            departmentProgramInstances.push(programInstance);
            allProgramsGeneratedForDepartments.push(programInstance);
        });

        const deptStudentSummaries = institutionWideStudentSummaries.filter(summary =>
            departmentProgramInstances.some(p => p.programId === summary.programId)
        );
        const deptStudentIds = deptStudentSummaries.map(s => s.studentId);

        let deptGpaSum = 0;
        deptStudentSummaries.forEach(s => { if (s.cumulativeGPA) deptGpaSum += s.cumulativeGPA; });
        const deptAverageGPA = deptStudentSummaries.length > 0 && deptStudentSummaries.filter(s => s.cumulativeGPA !== undefined).length > 0
            ? parseFloat((deptGpaSum / deptStudentSummaries.filter(s => s.cumulativeGPA !== undefined).length).toFixed(2))
            : undefined;

        const deptPlacementKPIs = calculatePlacementKPIs(deptStudentIds, deptStudentSummaries, allPlacementRecords);
        const deptMockStudentSatisfactionScore = faker.number.float({ min: 70, max: 95, multipleOf: 0.1 });

        let deptPerformanceScore = 0;
        const normalizedGPA = deptAverageGPA ? (deptAverageGPA / 4.0) * 100 : 0;
        const placementRate = deptPlacementKPIs.rate || 0;
        // Weights: GPA 40%, Placement 40%, Satisfaction 20%
        deptPerformanceScore = (normalizedGPA * 0.4) + (placementRate * 0.4) + (deptMockStudentSatisfactionScore * 0.2);

        institutionDepartments.push({
            departmentId: deptDef.departmentId,
            departmentName: deptDef.departmentName,
            programIds: departmentProgramInstances.map(p => p.programId),
            totalStudents: deptStudentSummaries.length,
            averageGPA: deptAverageGPA,
            placementRate: deptPlacementKPIs.rate,
            mockStudentSatisfactionScore: deptMockStudentSatisfactionScore,
            performanceScore: parseFloat(deptPerformanceScore.toFixed(2)),
        });
    });

    // 3. Generate Academic Years and Degrees (using programs generated under departments)
    // This part needs to be adapted to use `allProgramsGeneratedForDepartments`
    // For now, the existing AcademicYear/Degree generation will run, but programs might not link to these new depts.
    // This will be addressed by ensuring generateMockDegree and generateMockAcademicYear
    // correctly filter and use programs that now have departmentIds if that linkage is made.
    // The current `generateMockAcademicYear` and `generateMockDegree` will create a separate hierarchy
    // of programs that are NOT the same instances as those in `institutionDepartments`. This is a known issue
    // to be resolved by a deeper refactor of how programs are instantiated and passed around.
    // For this step, we focus on populating `institution.departments`.

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
                allTermsAcrossYears
            )
        );
    }

    const institutionPlacementKPIs = calculatePlacementKPIs(institutionStudentIds, institutionWideStudentSummaries, allPlacementRecords);

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
        institutionAttendancePercentage: instAttendancePercentage,
        totalInstitutionAbsences: instTotalAbsences,
        institutionFeesPaidPercentage: instFeesPaidPercentage,
        totalStudentsWithOverdueFeesInInstitution: instTotalStudentsWithOverdueFees,
        totalInstitutionApplicants: instTotalApplicants,
        avgInstitutionAcceptanceRate: instAvgAcceptanceRate,
        totalInstitutionEnrolledCount: instTotalEnrolled,
        institutionGradeDistribution: instGradeDistribution,
        totalInstitutionAtRiskStudents: instTotalAtRisk,
    };

    return [institution];
};

// Remove old export if generateMockAcademicRecords is now internal
// export const generateMockAcademicRecords = (students: Student[]): StudentAcademicRecord[] => {
//   return students.map((student, index) => generateMockStudentAcademicRecord(student, index));
// };
