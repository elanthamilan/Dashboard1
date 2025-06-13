import { faker } from '@faker-js/faker';
import {
    StudentAcademicRecord, CourseEnrollment // Term, Grade, SkillProficiency, K12StandardMastery, OnlineLearningProgress might need to be moved or redefined
} from '../../../../types/academics'; // Updated path
import { Student, AttendanceRecord as AttendanceRecordType } from '../../../../types/attendance'; // Updated path, added Alias for local AttendanceRecord
import {
    Institution,
    AcademicYear,
    Degree,
    Program,
    Semester,
    StudentSummary,
    Course,
    Section,
    Faculty,
    ParentInstitution
} from '../../../types/hierarchy';
import { generateMockStudents } from '../attendance/generateMockAttendanceData';
// import { AttendanceRecord } from '../../../components/AttendanceDashboard/types'; // Replaced by alias
import { generateMockAttendanceRecords } from '../attendance/generateMockAttendanceData';
import { Invoice } from '../../../../types/billing'; // Updated path
import { generateMockInvoices } from '../billing/generateMockBillingData';
import { Applicant } from '../../../../types/admissions'; // Updated path
import { generateMockApplicants } from '../admissions/generateMockApplicants';
import { PlacementRecord } from '../../../types/placement';
import { generateMockPlacementData } from '../placements/generateMockPlacementData';
import {
    ReEvaluationRequest, GrievanceTicket,
    ComplianceItem, AccreditationStatusSummary, AccreditingBody,
    LmsActivity
} from '../../../types/academics';
import { Alumnus, AlumniActivity } from '../../../types/alumni';
import { generateMockReEvaluationData } from './generateMockReEvaluationData';
import { generateMockGrievanceData } from '../grievances/generateMockGrievanceData';
import {
    generateMockComplianceItems,
    generateMockAccreditationStatusSummary
} from '../compliance/generateMockComplianceData';
import { Department } from '../../../types/departments';
import { FacultyMember, FacultyEvaluation } from '../../../types/academics';
import { generateMockFacultyMembers, generateMockFacultyEvaluations } from '../faculty/generateMockFacultyData';
import { generateMockLmsActivityData } from '../engagement/generateMockLmsActivityData';
import { generateMockAlumni, generateMockAlumniActivities } from '../alumni/generateMockAlumniData';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

interface MockDegreeConfig { degreeId: string; degreeName: string; }
const mockDegreeConfigs: MockDegreeConfig[] = [
    { degreeId: "BACHELORS", degreeName: "Bachelor's Degrees" },
    { degreeId: "MASTERS", degreeName: "Master's Degrees" },
    { degreeId: "DOCTORATE", degreeName: "Doctorate Degrees" },
];

interface ProgramConfigForDegreeMap {
    programId: string;
    programName: string;
    requiredCredits: number;
}

const degreeProgramMappings: { [degreeId: string]: ProgramConfigForDegreeMap[] } = {
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

const departmentConfigs = [
    { departmentId: 'DEPT_STEM', departmentName: 'School of STEM', facultyId: '', degreeConfigs: [mockDegreeConfigs[0], mockDegreeConfigs[2]] },
    { departmentId: 'DEPT_ARTS', departmentName: 'School of Arts & Humanities', facultyId: '', degreeConfigs: [mockDegreeConfigs[0], mockDegreeConfigs[1]] },
    { departmentId: 'DEPT_BUSINESS', departmentName: 'School of Business', facultyId: '', degreeConfigs: [mockDegreeConfigs[1]] }
];

// Define a simplified local type for grade letters if not directly importing a complex Grade type
type SimpleGradeLetter = 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'D' | 'F' | 'P' | 'NP';
const letterGrades: SimpleGradeLetter[] = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F', 'P', 'NP'];

const gradeToPoints = (letterGrade: SimpleGradeLetter): number => {
    const mapping: { [key in SimpleGradeLetter]: number } = {
        'A': 4.0, 'A-': 3.7, // Assuming A+ is not used or maps to A
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D': 1.0, // Assuming D+ maps to D or is not used
        'F': 0.0,
        'P': 0.0, // Pass/No Pass typically don't contribute to GPA points
        'NP': 0.0,
    };
    return mapping[letterGrade] || 0;
};

const generateMockCourseEnrollment = (semesterId: string): CourseEnrollment => {
    const subject = faker.helpers.arrayElement(['CS', 'MA', 'EN', 'PH', 'HI', 'EC']);
    const courseNum = faker.number.int({ min: 100, max: 499 });
    const letterGrade = faker.helpers.arrayElement(letterGrades);
    const numericalScore = letterGrade === 'F' ? faker.number.int({min: 0, max: 59}) : faker.number.int({min: 60, max: 100});

    return {
        courseId: `${subject}${courseNum}-${semesterId}`,
        courseCode: `${subject} ${courseNum}`,
        courseName: faker.lorem.words(3).split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        credits: faker.helpers.arrayElement([3, 4]),
        instructorName: faker.person.fullName(),
        // instructorId is not in CourseEnrollment type from academics.ts
        grade: {
            letterGrade,
            numericalScore,
            points: gradeToPoints(letterGrade),
        },
        semesterId, // Added this field as it's in the type
        comments: Math.random() > 0.7 ? faker.lorem.sentence() : undefined,
        lastUpdated: faker.date.recent({days: 90}).toISOString(),
    };
};

// Renamed from generateMockTerm and updated to match StudentAcademicRecord.semesters structure
const generateMockSemesterForRecord = (semesterNumber: number, year: number, programId: string): StudentAcademicRecord['semesters'][0] => {
    const isFall = semesterNumber % 2 === 0;
    // Ensure semesterId is unique and possibly includes program context if needed for global uniqueness
    const semesterId = `${isFall ? 'FA' : 'SP'}${year}-${programId.substring(0,3)}-${faker.string.alphanumeric(3)}`;
    const semesterName = `${isFall ? 'Fall' : 'Spring'} ${year}`;
    const courses = Array.from({ length: faker.number.int({ min: 3, max: 5 }) }, () => generateMockCourseEnrollment(semesterId));

    let totalPoints = 0;
    let totalCreditsForGpa = 0;
    let semesterCreditsEarned = 0;

    courses.forEach((c: CourseEnrollment) => { // Explicit type
        if (c.grade && c.grade.points !== undefined && c.grade.letterGrade !== 'P' && c.grade.letterGrade !== 'NP') {
            totalPoints += c.grade.points * c.credits;
            totalCreditsForGpa += c.credits;
        }
        if (c.grade && c.grade.letterGrade !== 'F' && c.grade.letterGrade !== 'NP') { // Assuming F and NP are failing grades
            semesterCreditsEarned += c.credits;
        }
    });
    const semesterGpa = totalCreditsForGpa > 0 ? parseFloat((totalPoints / totalCreditsForGpa).toFixed(2)) : undefined;

    return {
        semesterId,
        semesterName,
        courses,
        semesterGpa,
        semesterCreditsEarned,
        deanList: semesterGpa !== undefined && semesterGpa >= 3.5 && semesterCreditsEarned >=12, // Example Dean's List logic
    };
};

const programs = [
    { id: "CS_BS", name: "Bachelor of Science in Computer Science", requiredCredits: 120 },
    { id: "ENG_BA", name: "Bachelor of Arts in English Literature", requiredCredits: 110 },
    { id: "MBA_GEN", name: "Master of Business Administration", requiredCredits: 60 },
    { id: "PSY_BS", name: "Bachelor of Science in Psychology", requiredCredits: 115 },
    { id: "ART_MFA", name: "Master of Fine Arts in Studio Art", requiredCredits: 65 },
];

const enrollmentStatuses: StudentSummary['enrollmentStatus'][] = ['Active', 'Active', 'Active', 'Inactive', 'Graduated'];

const getRandomEnrollmentStatus = (): StudentSummary['enrollmentStatus'] => {
    return faker.helpers.arrayElement(enrollmentStatuses);
};

export const generateMockStudentSummary = (student: Student, studentAcademicRecord: StudentAcademicRecord): StudentSummary & { attendanceRate?: number; atRiskStatus?: 'Low' | 'Medium' | 'High' | 'None' }=> {
    const attendanceRate = faker.number.float({ min: 70, max: 100, multipleOf: 0.1 });
    let atRiskStatus: 'Low' | 'Medium' | 'High' | 'None' = 'None';
    const gpa = studentAcademicRecord.cumulativeGPA;

    if (gpa !== undefined) {
        if (gpa < 2.0 || attendanceRate < 75) {
            atRiskStatus = 'High';
        } else if (gpa < 2.5 || attendanceRate < 85) {
            atRiskStatus = 'Medium';
        } else {
            atRiskStatus = 'Low';
        }
    } else {
        if (attendanceRate < 75) {
            atRiskStatus = 'High';
        } else if (attendanceRate < 85) {
            atRiskStatus = 'Medium';
        } else {
            atRiskStatus = 'Low';
        }
    }

    return {
        studentId: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        cumulativeGPA: gpa,
        totalCreditsEarned: studentAcademicRecord.totalCreditsEarned,
        enrollmentStatus: getRandomEnrollmentStatus(),
        expectedGraduationDate: studentAcademicRecord.expectedGraduationDate,
        attendanceRate: attendanceRate,
        atRiskStatus: atRiskStatus,
    };
};

export const generateMockStudentAcademicRecord = (student: Student, studentIndex: number): StudentAcademicRecord => {
    const selectedProgram = faker.helpers.arrayElement(programs);
    const semesters: StudentAcademicRecord['semesters'] = [];
    const currentYear = dayjs().year();
    const yearsOfStudy = faker.number.int({ min: 1, max: 4 });

    for (let y = 0; y < yearsOfStudy; y++) {
        // Pass programId to generateMockSemesterForRecord for unique semesterId generation
        semesters.push(generateMockSemesterForRecord(0, currentYear - yearsOfStudy + y + 1, selectedProgram.id));
        semesters.push(generateMockSemesterForRecord(1, currentYear - yearsOfStudy + y + 1, selectedProgram.id));
    }

    let cumulativeGpa = 0;
    let totalCreditsEarned = 0;
    let totalWeightedPoints = 0;
    let totalCreditsAttemptedForGpa = 0;

    semesters.forEach((semester: StudentAcademicRecord['semesters'][0]) => { // Explicit type
        semester.courses.forEach((course: CourseEnrollment) => { // Explicit type
            if (course.grade && course.grade.points !== undefined && course.grade.letterGrade !== 'F' && course.grade.letterGrade !== 'NP') {
                 // Only add to earned credits if passed
                 if (course.grade.letterGrade !== 'F' && course.grade.letterGrade !== 'NP') { // Assuming F and NP are failing
                    totalCreditsEarned += course.credits;
                 }
            }
            if (course.grade && course.grade.points !== undefined && course.grade.letterGrade !== 'P' && course.grade.letterGrade !== 'NP') {
                totalWeightedPoints += course.grade.points * course.credits;
                totalCreditsAttemptedForGpa += course.credits;
            }
        });
    });
    cumulativeGpa = totalCreditsAttemptedForGpa > 0 ? parseFloat((totalWeightedPoints / totalCreditsAttemptedForGpa).toFixed(2)) : 0;


    return {
        studentId: student.id,
        programId: selectedProgram.id,
        programName: selectedProgram.name,
        requiredCreditsForDegree: selectedProgram.requiredCredits, // Added in previous step
        semesters,
        cumulativeGpa: cumulativeGpa, // Corrected property name from cumulativeGPA
        totalCreditsEarned,
        // The following fields are not in the new StudentAcademicRecord from academics.ts, so they are removed:
        // enrollmentDate, expectedGraduationDate, skillProficiencies, k12StandardsMastery, onlineLearningProgress
        // Adding optional fields from the new type:
        major: selectedProgram.name, // Example, can be more specific
        minor: Math.random() > 0.8 ? faker.lorem.words(2) : undefined,
        graduationDate: enrollmentStatuses[studentIndex % enrollmentStatuses.length] === 'Graduated' ? faker.date.past({years: 1}).toISOString() : undefined,
        honorsAndAwards: Math.random() > 0.7 ? [faker.lorem.sentence(4), faker.lorem.sentence(5)] : undefined,
        classRank: Math.random() > 0.6 ? faker.number.int({min: 1, max: 100}) : undefined,
    };
};

export const generateMockAcademicRecords = (students: Student[]): StudentAcademicRecord[] => {
  return students.map((student, index) => generateMockStudentAcademicRecord(student, index));
};

const calculateAttendanceKPIs = ( studentIdsInContext: string[], attendanceRecords: AttendanceRecordType[], contextStartDate?: string, contextEndDate?: string): { percentage?: number; totalAbsences?: number } => { if (studentIdsInContext.length === 0) return { percentage: 100, totalAbsences: 0 }; const relevantRecords = attendanceRecords.filter(r => { const studentMatch = studentIdsInContext.includes(r.studentId); if (!studentMatch) return false; if (contextStartDate && contextEndDate) { return dayjs(r.date).isBetween(dayjs(contextStartDate), dayjs(contextEndDate), null, '[]'); } return true; }); const absences = relevantRecords.filter(r => r.status === 'Absent' || r.status === 'Excused').length; const estimatedTotalSessions = studentIdsInContext.length * 20; const attendancePercentage = estimatedTotalSessions > 0 ? parseFloat(( ( (estimatedTotalSessions - absences) / estimatedTotalSessions) * 100).toFixed(2)) : 100; return { percentage: Math.max(0, Math.min(100, attendancePercentage)), totalAbsences: absences }; };
const calculateBillingKPIs = ( studentIdsInContext: string[], invoices: Invoice[] ): { feesPaidPercentage?: number; overdueCount?: number } => { if (studentIdsInContext.length === 0) return { feesPaidPercentage: 100, overdueCount: 0 }; const relevantInvoices = invoices.filter(inv => studentIdsInContext.includes(inv.studentId) && inv.status !== 'Cancelled' && inv.status !== 'Draft'); if (relevantInvoices.length === 0) return { feesPaidPercentage: 100, overdueCount: 0 }; const totalAmountDue = relevantInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0); const totalAmountPaid = relevantInvoices .filter(inv => inv.status === 'Paid') .reduce((sum, inv) => sum + inv.totalAmount, 0); const feesPaidPercentage = totalAmountDue > 0 ? parseFloat(((totalAmountPaid / totalAmountDue) * 100).toFixed(2)) : 100; const overdueCount = relevantInvoices.filter(inv => inv.status === 'Overdue').length; return { feesPaidPercentage: Math.min(100, feesPaidPercentage), overdueCount }; };
const calculateAdmissionKPIs = ( programApplicants: Applicant[] ): { applicants: number; acceptanceRate?: number; enrolledCount?: number } => { if (!programApplicants || programApplicants.length === 0) { return { applicants: 0, acceptanceRate: 0, enrolledCount: 0 }; } const totalApplicants = programApplicants.length; const offersMade = programApplicants.filter(a => ['Offer Made', 'Offer Accepted', 'Enrollment Confirmed'].includes(a.status)).length; const enrolled = programApplicants.filter(a => a.status === 'Enrollment Confirmed').length; const acceptanceRate = totalApplicants > 0 ? parseFloat(((offersMade / totalApplicants) * 100).toFixed(2)) : 0; return { applicants: totalApplicants, acceptanceRate, enrolledCount: enrolled }; };
const calculateGradeDistribution = (studentRecords: StudentAcademicRecord[]): { [gradeCategory: string]: number } => { const distribution: { [gradeCategory: string]: number } = { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0, 'Other': 0 }; studentRecords.forEach(record => { record.semesters.forEach(semester => { semester.courses.forEach(course => { if (course.grade) { const letter = course.grade.letterGrade[0]; if (distribution[letter] !== undefined) { distribution[letter]++; } else if (course.grade.letterGrade === 'P' || course.grade.letterGrade === 'NP') { distribution['Other']++; } } }); }); }); return distribution; };
const countAtRiskStudents = ( studentRecords: StudentAcademicRecord[], studentIdsInContext: string[], attendanceRecords?: AttendanceRecordType[], minGpaThreshold: number = 2.0, maxAbsencesThreshold: number = 10 ): number => { let atRiskCount = 0; const relevantStudentRecords = studentRecords.filter(sr => studentIdsInContext.includes(sr.studentId)); relevantStudentRecords.forEach(record => { if (record.cumulativeGpa !== undefined && record.cumulativeGpa < minGpaThreshold) { atRiskCount++; return; } }); return atRiskCount; };
const calculatePlacementKPIs = ( studentIdsInScope: string[], allStudentsInScopeSummaries: StudentSummary[], allPlacementRecords: PlacementRecord[] ): { rate?: number; avgPackage?: number; placedCount?: number; internshipCount?: number } => { const eligibleForPlacementSummaries = allStudentsInScopeSummaries.filter( s => studentIdsInScope.includes(s.studentId) && s.enrollmentStatus === 'Graduated' && s.expectedGraduationDate && dayjs(s.expectedGraduationDate).isBefore(dayjs().add(3,'month')) ); const eligibleStudentIdsForRateCalc = new Set(eligibleForPlacementSummaries.map(s => s.studentId)); const relevantFullTimePlacements = allPlacementRecords.filter( p => eligibleStudentIdsForRateCalc.has(p.studentId) && p.placementType === 'FullTime' ); const internedStudentIdsInScope = new Set( allPlacementRecords .filter(p => studentIdsInScope.includes(p.studentId) && p.placementType === 'Internship') .map(p => p.studentId) ); const internshipCount = internedStudentIdsInScope.size; const placedStudentIdsForFullTime = new Set(relevantFullTimePlacements.map(p => p.studentId)); const placedCount = placedStudentIdsForFullTime.size; const rate = eligibleForPlacementSummaries.length > 0 ? parseFloat(((placedCount / eligibleForPlacementSummaries.length) * 100).toFixed(2)) : 0; let totalPackage = 0; relevantFullTimePlacements.forEach(p => totalPackage += p.packageAmount); const avgPackage = placedCount > 0 ? parseFloat((totalPackage / placedCount).toFixed(0)) : undefined; return { rate, avgPackage, placedCount, internshipCount }; };
// Assuming Term is replaced by Semester concept from hierarchy.ts or redefined in academics.ts
const generateTermDetails = (termNumber: number, year: number, programId: string): { semesterId: string, semesterName: string, startDate: string, endDate: string } => { const isFall = termNumber % 2 === 0; const semesterId = `${isFall ? 'FA' : 'SP'}${year}-${programId.slice(0,2)}`; const semesterName = `${isFall ? 'Fall' : 'Spring'} ${year}`; return { semesterId, semesterName, startDate: dayjs(`${year}-${isFall ? '08' : '01'}-15`).toISOString(), endDate: dayjs(`${year}-${isFall ? '12' : '05'}-15`).toISOString() }; };
const pickRandomSubset = <T>(items: T[], maxCount: number): T[] => { if (!items || items.length === 0) return []; const count = faker.number.int({ min: Math.min(1, items.length), max: Math.min(maxCount, items.length) }); return faker.helpers.arrayElements(items, count); };

const generateMockSections = ( courseId: string, availableStudents: StudentSummary[], numSections: number = faker.number.int({ min: 1, max: 3 }) ): Section[] => { const sections: Section[] = []; const courseStudents = pickRandomSubset(availableStudents, availableStudents.length); const remainingStudents = [...courseStudents]; for (let i = 0; i < numSections; i++) { const sectionId = `${courseId}-S${i + 1}`; const sectionName = `Section ${String.fromCharCode(65 + i)}`; const sectionStudentCount = Math.ceil(courseStudents.length / numSections); const studentsForSection = remainingStudents.splice(0, Math.min(sectionStudentCount, remainingStudents.length)); sections.push({ sectionId, sectionName, courseId, instructorName: faker.person.fullName(), schedule: `${faker.helpers.arrayElement(['Mon/Wed/Fri', 'Tue/Thu'])} ${faker.number.int({ min: 8, max: 15 })}-${faker.number.int({ min: 9, max: 17 })} AM/PM`, students: studentsForSection, studentCount: studentsForSection.length, averageAttendance: faker.number.float({ min: 70, max: 95, multipleOf: 0.5 }), classroom: `Room ${faker.number.int({min: 101, max: 305})}` }); } return sections; };
const generateMockCourses = ( semesterId: string, availableStudents: StudentSummary[], numCourses: number = faker.number.int({ min: 3, max: 6 }) ): Course[] => { const courses: Course[] = []; const subjectAreas = ['CS', 'MATH', 'ENG', 'HIST', 'SCI', 'ART']; for (let i = 0; i < numCourses; i++) { const subject = faker.helpers.arrayElement(subjectAreas); const courseNum = faker.number.int({ min: 101, max: 499 }); const courseId = `${subject}${courseNum}-${semesterId}`; const courseName = `${faker.commerce.productName()} (${subject} ${courseNum})`; const studentsForCourse = pickRandomSubset(availableStudents, availableStudents.length); const sections = generateMockSections(courseId, studentsForCourse); const totalEnrolledInCourse = sections.reduce((sum, sec) => sum + sec.studentCount!, 0); courses.push({ courseId, courseName, semesterId, sections, courseCode: `${subject} ${courseNum}`, credits: faker.helpers.arrayElement([3, 4]), totalStudentsEnrolled: totalEnrolledInCourse, averageGrade: faker.number.float({ min: 65, max: 90, multipleOf: 0.5 }), passRate: faker.number.float({ min: 70, max: 98, multipleOf: 0.5 }), facultyCoordinatorId: `FAC-${faker.string.uuid().substring(0,8)}` }); } return courses; };
const generateMockNewSemester = ( termDetails: { termId: string, termName: string, startDate: string, endDate: string }, programId: string, availableStudents: StudentSummary[], allAttendanceRecords: AttendanceRecord[], allInvoices: Invoice[] ): Semester => { const studentsForSemesterCourses = pickRandomSubset(availableStudents, availableStudents.length); const courses = generateMockCourses(termDetails.termId, studentsForSemesterCourses); const studentIdsInSemesterCourses = new Set<string>(); courses.forEach(course => { course.sections.forEach(section => { section.students.forEach(student => { studentIdsInSemesterCourses.add(student.studentId); }); }); }); const uniqueStudentIdsArray = Array.from(studentIdsInSemesterCourses); const attendanceKPIs = calculateAttendanceKPIs(uniqueStudentIdsArray, allAttendanceRecords, termDetails.startDate, termDetails.endDate); const billingKPIs = calculateBillingKPIs(uniqueStudentIdsArray, allInvoices); let semesterGpaSum = 0; let studentsCountedForGpa = 0; availableStudents.filter(s => uniqueStudentIdsArray.includes(s.studentId)).forEach(student => { if (student.cumulativeGPA !== undefined) { semesterGpaSum += student.cumulativeGPA; studentsCountedForGpa++; } }); const averageGPA = studentsCountedForGpa > 0 ? parseFloat((semesterGpaSum / studentsCountedForGpa).toFixed(2)) : undefined; const passingStudents = availableStudents.filter(s => uniqueStudentIdsArray.includes(s.studentId) && s.cumulativeGPA !== undefined && s.cumulativeGPA >= 2.0).length; const passRate = uniqueStudentIdsArray.length > 0 ? parseFloat(((passingStudents / uniqueStudentIdsArray.length) * 100).toFixed(2)) : undefined; const semesterStudentSummaries = availableStudents.filter(s => uniqueStudentIdsArray.includes(s.studentId)); return { semesterId: termDetails.termId, semesterName: termDetails.termName, startDate: termDetails.startDate, endDate: termDetails.endDate, courses, students: semesterStudentSummaries, averageGPA, passRate, attendancePercentage: attendanceKPIs.percentage, totalAbsences: attendanceKPIs.totalAbsences, feesPaidPercentage: billingKPIs.feesPaidPercentage, studentsWithOverdueFees: billingKPIs.overdueCount, totalCoursesOffered: courses.length, }; };
export const generateMockNewProgram = ( programConfig: { programId: string, programName: string, requiredCredits: number }, degreeId: string, allStudentsInInstitution: Student[], allAcademicRecordsInInstitution: StudentAcademicRecord[], allAttendanceRecords: AttendanceRecord[], allInvoices: Invoice[], allApplicants: Applicant[], allPlacementRecords: PlacementRecord[], numSemestersToGenerate: number = faker.number.int({min: 2, max: 6}) ): Program => { const { programId, programName, requiredCredits } = programConfig; const programStudentAcademicRecords = allAcademicRecordsInInstitution.filter(ar => ar.programId === programId); const programStudentIds = new Set(programStudentAcademicRecords.map(ar => ar.studentId)); const programStudentSummaries = allStudentsInInstitution .filter(s => programStudentIds.has(s.id)) .map(student => { const record = programStudentAcademicRecords.find(r => r.studentId === student.id); return generateMockStudentSummary(student, record!); }); const semesters: Semester[] = []; const currentYear = dayjs().year(); for (let i = 0; i < numSemestersToGenerate; i++) { const yearOffset = Math.floor(i / 2); const termNumInYear = i % 2; const termDetails = generateTermDetails(termNumInYear, currentYear - Math.floor(numSemestersToGenerate/2) + yearOffset, programId); const activeStudentsForSemester = programStudentSummaries.filter(s => s.enrollmentStatus === 'Active'); semesters.push(generateMockNewSemester( termDetails, programId, activeStudentsForSemester, allAttendanceRecords, allInvoices )); } const totalStudentsInProgram = programStudentSummaries.length; const programStudentIdsArray = Array.from(programStudentIds); const programAttendanceKPIs = calculateAttendanceKPIs(programStudentIdsArray, allAttendanceRecords); const programBillingKPIs = calculateBillingKPIs(programStudentIdsArray, allInvoices); const applicantsForProgram = allApplicants.filter(app => app.programId === programId); const programAdmissionKPIs = calculateAdmissionKPIs(applicantsForProgram); const programPlacementKPIs = calculatePlacementKPIs(programStudentIdsArray, programStudentSummaries, allPlacementRecords); const programGradeDistribution = calculateGradeDistribution(programStudentAcademicRecords); const programAtRiskStudents = countAtRiskStudents(programStudentAcademicRecords, programStudentIdsArray); let sumOfGpas = 0; let studentsWithGpas = 0; programStudentSummaries.forEach(s => { if (s.cumulativeGPA !== undefined) { sumOfGpas += s.cumulativeGPA; studentsWithGpas++; } }); const averageProgramGPA = studentsWithGpas > 0 ? parseFloat((sumOfGpas / studentsWithGpas).toFixed(2)) : undefined; const graduatedStudents = programStudentSummaries.filter(s => s.enrollmentStatus === 'Graduated').length; const eligibleForGraduation = programStudentSummaries.filter(s => s.totalCreditsEarned && s.totalCreditsEarned >= requiredCredits).length; const graduationRate = eligibleForGraduation > 0 ? parseFloat(((graduatedStudents / eligibleForGraduation) * 100).toFixed(2)) : faker.number.float({ min: 60, max: 95, multipleOf: 0.01 }); const passingStudentsInProgram = programStudentSummaries.filter(s => s.cumulativeGPA !== undefined && s.cumulativeGPA >= 2.0).length; const programPassRate = totalStudentsInProgram > 0 ? parseFloat(((passingStudentsInProgram / totalStudentsInProgram) * 100).toFixed(2)) : 0; return { programId, programName, degreeId, departmentId: undefined, requiredCredits, semesters, totalStudents: totalStudentsInProgram, averageProgramGPA, graduationRate, programPassRate, placementRate: programPlacementKPIs.rate, averagePackage: programPlacementKPIs.avgPackage, totalPlacedStudents: programPlacementKPIs.placedCount, totalInternships: programPlacementKPIs.internshipCount, avgAttendancePercentage: programAttendanceKPIs.percentage, totalProgramAbsences: programAttendanceKPIs.totalAbsences, avgFeesPaidPercentage: programBillingKPIs.feesPaidPercentage, totalStudentsWithOverdueFees: programBillingKPIs.overdueCount, applicants: programAdmissionKPIs.applicants, acceptanceRate: programAdmissionKPIs.acceptanceRate, enrolledCount: programAdmissionKPIs.enrolledCount, gradeDistribution: programGradeDistribution, atRiskStudents: programAtRiskStudents, }; };
export const generateMockNewDegree = ( degreeConfig: { degreeId: string, degreeName: string }, departmentId: string, allStudentsInScope: Student[], allAcademicRecordsInScope: StudentAcademicRecord[], allAttendanceRecords: AttendanceRecord[], allInvoices: Invoice[], allApplicants: Applicant[], allPlacementRecords: PlacementRecord[] ): Degree => { const { degreeId, degreeName } = degreeConfig; const programsInDegreeConfig = degreeProgramMappings[degreeId] || []; const programs: Program[] = programsInDegreeConfig.map((pConfig: ProgramConfigForDegreeMap) => { return generateMockNewProgram( pConfig, degreeId, allStudentsInScope, allAcademicRecordsInScope, allAttendanceRecords, allInvoices, allApplicants, allPlacementRecords, faker.number.int({ min: 4, max: 8 }) ); }); const degreeStudentSummariesMap = new Map<string, StudentSummary>(); programs.forEach(prog => { const programStudentRecords = allAcademicRecordsInScope.filter(ar => ar.programId === prog.programId); programStudentRecords.forEach(psr => { if (!degreeStudentSummariesMap.has(psr.studentId)) { const student = allStudentsInScope.find(s => s.id === psr.studentId); if(student) { degreeStudentSummariesMap.set(psr.studentId, generateMockStudentSummary(student, psr)); } } }); }); const degreeStudentSummaries = Array.from(degreeStudentSummariesMap.values()); const degreeStudentIds = degreeStudentSummaries.map(s => s.studentId); const totalStudentsInDegree = degreeStudentSummaries.length; let sumOfProgramGpas = 0; let totalStudentsForGpaCalc = 0; programs.forEach(prog => { if (prog.averageProgramGPA !== undefined && prog.totalStudents) { sumOfProgramGpas += prog.averageProgramGPA * prog.totalStudents; totalStudentsForGpaCalc += prog.totalStudents; } }); const averageDegreeGPA = totalStudentsForGpaCalc > 0 ? parseFloat((sumOfProgramGpas / totalStudentsForGpaCalc).toFixed(2)) : undefined; const degreePlacementKPIs = calculatePlacementKPIs(degreeStudentIds, degreeStudentSummaries, allPlacementRecords); const totalApplicants = programs.reduce((sum, p) => sum + (p.applicants || 0), 0); const totalEnrolledCount = programs.reduce((sum, p) => sum + (p.enrolledCount || 0), 0); const avgAcceptanceRate = totalApplicants > 0 ? parseFloat(((totalEnrolledCount / totalApplicants) * 100).toFixed(2)) : undefined; let totalDegreeAbsences = 0; let sumProgramAttendance = 0; let totalStudentsForAttendance = 0; let sumProgramFeesPaid = 0; let totalStudentsForFees = 0; let totalStudentsWithOverdueFeesInDegree = 0; programs.forEach(prog => { if (prog.avgAttendancePercentage !== undefined && prog.totalStudents) { sumProgramAttendance += prog.avgAttendancePercentage * prog.totalStudents; totalStudentsForAttendance += prog.totalStudents; } totalDegreeAbsences += prog.totalProgramAbsences || 0; if (prog.avgFeesPaidPercentage !== undefined && prog.totalStudents) { sumProgramFeesPaid += prog.avgFeesPaidPercentage * prog.totalStudents; totalStudentsForFees += prog.totalStudents; } totalStudentsWithOverdueFeesInDegree += prog.totalStudentsWithOverdueFees || 0; }); const avgAttendancePercentage = totalStudentsForAttendance > 0 ? parseFloat((sumProgramAttendance / totalStudentsForAttendance).toFixed(2)) : undefined; const avgFeesPaidPercentage = totalStudentsForFees > 0 ? parseFloat((sumProgramFeesPaid / totalStudentsForFees).toFixed(2)) : undefined; return { degreeId, degreeName, departmentId, programs, totalStudents: totalStudentsInDegree, averageDegreeGPA, avgAttendancePercentage, totalDegreeAbsences, avgFeesPaidPercentage, totalStudentsWithOverdueFeesInDegree, placementRate: degreePlacementKPIs.rate, averagePackage: degreePlacementKPIs.avgPackage, totalPlacedStudents: degreePlacementKPIs.placedCount, totalInternships: degreePlacementKPIs.internshipCount, totalApplicants, avgAcceptanceRate, totalEnrolledCount, overallGradeDistribution: {}, totalAtRiskStudents: programs.reduce((sum, p) => sum + (p.atRiskStudents || 0), 0), }; };
export const generateMockDepartments = ( facultyId: string, allStudentsInFaculty: Student[], allAcademicRecordsInFaculty: StudentAcademicRecord[], allAttendanceRecords: AttendanceRecord[], allInvoices: Invoice[], allApplicants: Applicant[], allPlacementRecords: PlacementRecord[] ): Department[] => { const departments: Department[] = []; departmentConfigs.forEach(deptConfig => { const currentDepartmentId = `${deptConfig.departmentId}-${facultyId.slice(-4)}`; const degrees: Degree[] = deptConfig.degreeConfigs.map(degConf => { return generateMockNewDegree( degConf, currentDepartmentId, allStudentsInFaculty, allAcademicRecordsInFaculty, allAttendanceRecords, allInvoices, allApplicants, allPlacementRecords ); }); const degreeIds = degrees.map(d => d.degreeId); let deptTotalStudents = 0; const deptStudentSummariesMap = new Map<string, StudentSummary>(); degrees.forEach(degree => { degree.programs.forEach(prog => { const progStudentRecords = allAcademicRecordsInFaculty.filter(ar => ar.programId === prog.programId); progStudentRecords.forEach(psr => { if (!deptStudentSummariesMap.has(psr.studentId)) { const student = allStudentsInFaculty.find(s => s.id === psr.studentId); if (student) { deptStudentSummariesMap.set(psr.studentId, generateMockStudentSummary(student, psr)); } } }); }); }); const deptStudentSummaries = Array.from(deptStudentSummariesMap.values()); deptTotalStudents = deptStudentSummaries.length; let deptGpaSum = 0; let studentsCountedForDeptGpa = 0; deptStudentSummaries.forEach(s => { if (s.cumulativeGPA !== undefined) { deptGpaSum += s.cumulativeGPA; studentsCountedForDeptGpa++; } }); const departmentAverageGPA = studentsCountedForDeptGpa > 0 ? parseFloat((deptGpaSum / studentsCountedForDeptGpa).toFixed(2)) : undefined; const deptPlacementKPIs = calculatePlacementKPIs(deptStudentSummaries.map(s=>s.studentId), deptStudentSummaries, allPlacementRecords); departments.push({ departmentId: currentDepartmentId, departmentName: deptConfig.departmentName, facultyId, degreeIds, totalStudents: deptTotalStudents, departmentAverageGPA, departmentPlacementRate: deptPlacementKPIs.rate }); }); return departments; };
export const generateMockFaculties = ( institutionId: string, allStudentsInInstitution: Student[], allAcademicRecordsInInstitution: StudentAcademicRecord[], allAttendanceRecords: AttendanceRecord[], allInvoices: Invoice[], allApplicants: Applicant[], allPlacementRecords: PlacementRecord[], numFaculties: number = faker.number.int({ min: 2, max: 4 }) ): Faculty[] => { const faculties: Faculty[] = []; const facultyNames = ["Faculty of Engineering", "Faculty of Arts & Sciences", "Faculty of Business", "Faculty of Health Sciences", "Faculty of Design"]; for (let i = 0; i < numFaculties; i++) { const facultyId = `FACULTY-${institutionId.slice(-4)}-${i + 1}`; const facultyName = faker.helpers.arrayElement(facultyNames.filter(fn => !faculties.find(f=>f.facultyName === fn))) || `${faker.company.bsBuzz()} Faculty`; const studentsForFaculty = pickRandomSubset(allStudentsInInstitution, Math.ceil(allStudentsInInstitution.length / numFaculties) + 5); const academicRecordsForFaculty = allAcademicRecordsInInstitution.filter(ar => studentsForFaculty.some(s => s.id === ar.studentId) ); const departments = generateMockDepartments( facultyId, studentsForFaculty, academicRecordsForFaculty, allAttendanceRecords, allInvoices, allApplicants, allPlacementRecords ); let totalStudentsInFaculty = 0; let facultyGpaSum = 0; let studentsCountedForFacultyGpa = 0; const facultyStudentSummariesMap = new Map<string, StudentSummary>(); departments.forEach(dept => { }); studentsForFaculty.forEach(s => { const record = academicRecordsForFaculty.find(ar => ar.studentId === s.id); if (record) { const summary = generateMockStudentSummary(s, record); if (!facultyStudentSummariesMap.has(summary.studentId)) { facultyStudentSummariesMap.set(summary.studentId, summary); } } }); const uniqueFacultyStudents = Array.from(facultyStudentSummariesMap.values()); totalStudentsInFaculty = uniqueFacultyStudents.length; uniqueFacultyStudents.forEach(summary => { if (summary.cumulativeGPA !== undefined) { facultyGpaSum += summary.cumulativeGPA; studentsCountedForFacultyGpa++; } }); const averageFacultyGPA = studentsCountedForFacultyGpa > 0 ? parseFloat((facultyGpaSum / studentsCountedForFacultyGpa).toFixed(2)) : undefined; faculties.push({ facultyId, facultyName, institutionId, departments, totalStudents: totalStudentsInFaculty, averageFacultyGPA, totalFacultyMembers: faker.number.int({min: 20, max: 100}), researchProjectsCount: faker.number.int({min: 5, max: 50}) }); } return faculties; };
export const generateMockNewInstitutions = ( parentInstitutionId: string | undefined, allStudentsForInstitution: Student[], numYears: number = 3, numApplicantsPerProgramContext: number = 50 ): Institution[] => { const allStudents = allStudentsForInstitution; const allAcademicRecords = generateMockAcademicRecords(allStudents); const institutionWideStudentSummaries = allAcademicRecords.map(ar => generateMockStudentSummary(allStudents.find(s => s.id === ar.studentId)!, ar) ); const allLmsActivities = generateMockLmsActivityData(institutionWideStudentSummaries, 20, 60); const allPlacementRecords = generateMockPlacementData(institutionWideStudentSummaries); const allAttendanceRecords = generateMockAttendanceRecords(allStudents, [], numYears * 365); const allInvoices = generateMockInvoices(allStudents, 5, new Set()); let totalProgramTemplates = 0; departmentConfigs.forEach(dc => { dc.degreeConfigs.forEach(degC => { totalProgramTemplates += (degreeProgramMappings[degC.degreeId] || []).length; }); }); const allApplicants = generateMockApplicants(numApplicantsPerProgramContext * totalProgramTemplates); const institutionId = faker.string.uuid(); const institutionName = `${faker.company.name()} University`; const faculties = generateMockFaculties( institutionId, allStudents, allAcademicRecords, allAttendanceRecords, allInvoices, allApplicants, allPlacementRecords, faker.number.int({min: 3, max: 5}) ); const allDepartmentsForInstitution = faculties.flatMap(f => f.departments); const institutionFacultyMembers = generateMockFacultyMembers(allDepartmentsForInstitution, faker.number.int({ min: 50, max: 200 })); const institutionFacultyEvaluations = generateMockFacultyEvaluations(institutionFacultyMembers, institutionWideStudentSummaries, faker.number.int({ min: 1, max: 3 })); const academicYearsData: AcademicYear[] = []; let instTotalStudents = 0; let instGpaSum = 0; let instStudentsForGpa = 0; faculties.forEach(faculty => { instTotalStudents += faculty.totalStudents || 0; if (faculty.averageFacultyGPA !== undefined && faculty.totalStudents) { instGpaSum += faculty.averageFacultyGPA * faculty.totalStudents; instStudentsForGpa += faculty.totalStudents; } }); const overallAverageGPA = instStudentsForGpa > 0 ? parseFloat((instGpaSum / instStudentsForGpa).toFixed(2)) : undefined; const institutionPlacementKPIs = calculatePlacementKPIs(institutionWideStudentSummaries.map(s=>s.studentId), institutionWideStudentSummaries, allPlacementRecords); const allReEvaluationRequests = generateMockReEvaluationData(institutionWideStudentSummaries, [], 100); const pendingReEvaluationsCount = allReEvaluationRequests.filter(r => r.status === 'Pending').length; const allGrievanceTickets = generateMockGrievanceData(institutionWideStudentSummaries, [], 75); const openGrievancesCount = allGrievanceTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length; const complianceItems = generateMockComplianceItems(allDepartmentsForInstitution, 50); const accreditationStatuses = generateMockAccreditationStatusSummary(2); const overallCompliancePercentage = complianceItems.length > 0 ? parseFloat(((complianceItems.filter(item => item.status === 'Compliant').length / complianceItems.length) * 100).toFixed(1)) : 100; const pendingComplianceItemsCount = complianceItems.filter( item => item.status === 'In Progress' || item.status === 'Pending Review' ).length; let nextAccreditationReviewDate: string | undefined = undefined; let primaryAccreditationBody: AccreditingBody | undefined = undefined; if (accreditationStatuses.length > 0) { primaryAccreditationBody = accreditationStatuses[0].body; const futureDates: string[] = []; accreditationStatuses.forEach(as => { if (as.validUntil && dayjs(as.validUntil).isAfter(dayjs())) futureDates.push(as.validUntil); const reviewCycleDate = dayjs(as.nextMajorReviewCycle, 'YYYY').endOf('year'); if (reviewCycleDate.isAfter(dayjs())) futureDates.push(reviewCycleDate.toISOString()); }); if (futureDates.length > 0) nextAccreditationReviewDate = futureDates.sort((a,b) => dayjs(a).valueOf() - dayjs(b).valueOf())[0]; } const alumniSummaries = institutionWideStudentSummaries.filter(s => s.enrollmentStatus === 'Graduated'); const allAlumni = generateMockAlumni(alumniSummaries); const allAlumniActivities = generateMockAlumniActivities(allAlumni, 2); let aggInstAttendancePercentage: number | undefined = 0; let aggInstTotalAbsences = 0; let aggInstFeesPaidPercentage: number | undefined = 0; let aggInstTotalStudentsWithOverdueFees = 0; let aggInstTotalApplicants = 0; let aggInstAvgAcceptanceRate: number | undefined = 0; let aggInstTotalEnrolled = 0; const aggInstGradeDistribution: { [key: string]: number } = {}; let aggInstTotalAtRisk = 0; let weightedSumInstAttendance = 0; let totalStudentsForInstAttendance = 0; let weightedSumInstFeesPaid = 0; let totalStudentsForInstFees = 0; let weightedSumInstAcceptance = 0; let totalApplicantsForInstRate = 0; academicYearsData.forEach(ay => { if (ay.annualAttendancePercentage !== undefined && ay.totalStudents) { weightedSumInstAttendance += ay.annualAttendancePercentage * ay.totalStudents; totalStudentsForInstAttendance += ay.totalStudents; } aggInstTotalAbsences += ay.totalAnnualAbsences || 0; if (ay.annualFeesPaidPercentage !== undefined && ay.totalStudents) { weightedSumInstFeesPaid += ay.annualFeesPaidPercentage * ay.totalStudents; totalStudentsForInstFees += ay.totalStudents; } aggInstTotalStudentsWithOverdueFees += ay.totalStudentsWithOverdueFeesInYear || 0; aggInstTotalApplicants += ay.totalAnnualApplicants || 0; if (ay.avgAnnualAcceptanceRate !== undefined && ay.totalAnnualApplicants) { weightedSumInstAcceptance += ay.avgAnnualAcceptanceRate * ay.totalAnnualApplicants; totalApplicantsForInstRate += ay.totalAnnualApplicants; } aggInstTotalEnrolled += ay.totalAnnualEnrolledCount || 0; if (ay.annualGradeDistribution) { for (const grade in ay.annualGradeDistribution) { aggInstGradeDistribution[grade] = (aggInstGradeDistribution[grade] || 0) + ay.annualGradeDistribution[grade]; } } aggInstTotalAtRisk += ay.totalAnnualAtRiskStudents || 0; }); aggInstAttendancePercentage = totalStudentsForInstAttendance > 0 ? parseFloat((weightedSumInstAttendance / totalStudentsForInstAttendance).toFixed(2)) : undefined; aggInstFeesPaidPercentage = totalStudentsForInstFees > 0 ? parseFloat((weightedSumInstFeesPaid / totalStudentsForInstFees).toFixed(2)) : undefined; aggInstAvgAcceptanceRate = totalApplicantsForInstRate > 0 ? parseFloat((weightedSumInstAcceptance / totalApplicantsForInstRate).toFixed(2)) : undefined; const institution: Institution = { institutionId, institutionName, parentInstitutionId, faculties, academicYears: academicYearsData, totalStudents: instTotalStudents, overallAverageGPA, overallPlacementRate: institutionPlacementKPIs.rate, overallAveragePackage: institutionPlacementKPIs.avgPackage, overallTotalPlacedStudents: institutionPlacementKPIs.placedCount, overallTotalInternships: institutionPlacementKPIs.internshipCount, pendingReEvaluationsCount, openGrievancesCount, totalReEvaluationsLastMonth: faker.number.int(20), avgGrievanceResolutionTimeDays: faker.number.int({min:1, max:30}), overallCompliancePercentage: overallCompliancePercentage, pendingComplianceItemsCount: pendingComplianceItemsCount, nextAccreditationReviewDate: nextAccreditationReviewDate, accreditationBody: primaryAccreditationBody, complianceItems: complianceItems, accreditationStatuses: accreditationStatuses, avgFacultyRating: faker.number.float({min:3.5, max:4.8, multipleOf: .1}), facultyEvaluationResponseRate: faker.number.float({min:60, max:90, multipleOf: .1}), facultyMembers: institutionFacultyMembers, facultyEvaluations: institutionFacultyEvaluations, lmsLoginsLast30Days: faker.number.int(5000), lmsResourceDownloadsLast30Days: faker.number.int(10000), lmsForumPostsLast30Days: faker.number.int(1000), lmsActivities: allLmsActivities, alumni: allAlumni, alumniActivities: allAlumniActivities, alumniEngagementScore: faker.number.float({min:30,max:80, multipleOf: .1}), overallInternshipRate: institutionPlacementKPIs.internshipCount && instTotalStudents > 0 ? parseFloat(((institutionPlacementKPIs.internshipCount / instTotalStudents) * 100).toFixed(1)) : 0, totalCampusCompanies: faker.number.int({min:10, max:100}), allPlacementRecords: allPlacementRecords, allResearchProjects: [], overallCourseCompletionRate: faker.number.float({min:75, max:95, multipleOf: .1}), totalActiveResearchProjects: faker.number.int({min:10, max:100}), allGrievanceTickets: allGrievanceTickets, grievanceCSAT: faker.number.float({min:70,max:90, multipleOf: .1}), sentimentDistribution: { positive: 70, neutral: 20, negative: 10, total:100}, institutionAttendancePercentage: aggInstAttendancePercentage, totalInstitutionAbsences: aggInstTotalAbsences, institutionFeesPaidPercentage: aggInstFeesPaidPercentage, totalStudentsWithOverdueFeesInInstitution: aggInstTotalStudentsWithOverdueFees, totalInstitutionApplicants: aggInstTotalApplicants, avgInstitutionAcceptanceRate: aggInstAvgAcceptanceRate, totalInstitutionEnrolledCount: aggInstTotalEnrolled, institutionGradeDistribution: aggInstGradeDistribution, totalInstitutionAtRiskStudents: aggInstTotalAtRisk, }; return [institution]; };
export const generateMockParentInstitutions = ( numParentInstitutions: number = 1, numInstitutionsPerParent: number = faker.number.int({min:1, max:2}), numStudentsPerInstitutionContext: number = 150 ): ParentInstitution[] => { const parentInstitutions: ParentInstitution[] = []; for (let i = 0; i < numParentInstitutions; i++) { const parentId = `PARENT-${faker.string.uuid().substring(0,8)}`; const parentName = `${faker.company.name()} System`; const institutions: Institution[] = []; let totalStudentsInParent = 0; let parentGpaSum = 0; let studentsCountedForParentGpa = 0; for (let j = 0; j < numInstitutionsPerParent; j++) { const studentsForThisInstitution = generateMockStudents(numStudentsPerInstitutionContext); const generatedInstitutionArray = generateMockNewInstitutions( parentId, studentsForThisInstitution, 3, 30 ); if (generatedInstitutionArray.length > 0) { const inst = generatedInstitutionArray[0]; institutions.push(inst); totalStudentsInParent += inst.totalStudents || 0; if (inst.overallAverageGPA !== undefined && inst.totalStudents) { parentGpaSum += inst.overallAverageGPA * inst.totalStudents; studentsCountedForParentGpa += inst.totalStudents; } } } const overallAverageGPA = studentsCountedForParentGpa > 0 ? parseFloat((parentGpaSum / studentsCountedForParentGpa).toFixed(2)) : undefined; parentInstitutions.push({ parentInstitutionId: parentId, parentInstitutionName: parentName, institutions, totalStudents: totalStudentsInParent, overallAverageGPA, totalFaculty: institutions.reduce((sum, inst) => sum + (inst.faculties?.reduce((s,f) => s + (f.totalFacultyMembers || 0),0) || 0),0), totalPrograms: institutions.reduce((sum, inst) => sum + (inst.faculties?.reduce((s,f) => s + (f.departments?.reduce((d_s, d) => d_s + d.degreeIds.length,0) ||0),0) || 0),0), overallPlacementRate: faker.number.float({min:60, max:90, multipleOf: .1}), totalResearchGrantsValue: faker.number.int({min:1000000, max: 50000000}) }); } return parentInstitutions; };

// End of "Golden Version"
// All legacy/duplicated functions below this point should have been removed by the overwrite.
// The TS1010 error was likely caused by an unterminated comment from a previous attempt to remove code.
// This version ensures all comments are properly structured or code is entirely included/excluded.
