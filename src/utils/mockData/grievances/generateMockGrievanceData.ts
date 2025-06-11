import { faker } from '@faker-js/faker';
import { GrievanceTicket, GrievanceStatus, GrievancePriority, GrievanceCategory } from '../../../types/academics'; // Adjust if academics.ts is elsewhere
import { StudentSummary } from '../../../types/hierarchy';
import dayjs from 'dayjs';

const grievanceCategories: GrievanceCategory[] = ['Infrastructure', 'Academic', 'Examination', 'Faculty', 'Student Welfare', 'Other'];
const grievanceStatuses: GrievanceStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed', 'Open', 'In Progress'];
const grievancePriorities: GrievancePriority[] = ['High', 'Medium', 'Low', 'Medium'];

export const generateMockGrievanceData = (
  students: StudentSummary[],
  staffIds: string[],
  count: number = 75
): GrievanceTicket[] => {
  const tickets: GrievanceTicket[] = [];
  if (students.length === 0 && staffIds.length === 0 && count > 0) {
    // If no students and no staff, cannot create meaningful grievances tied to individuals.
    // Depending on requirements, could create generic grievances not tied to anyone,
    // but the current model has submittedByStudentId or submittedByStaffId.
    console.warn("Cannot generate specific grievance data without students or staff IDs.");
    return tickets;
  }

  for (let i = 0; i < count; i++) {
    const submittedDate = faker.date.past({ years: 1 });
    const status = faker.helpers.arrayElement(grievanceStatuses);

    let resolvedDate: string | undefined = undefined;
    let resolutionDetails: string | undefined = undefined;
    // Ensure lastUpdatedDate is after submittedDate
    const lastUpdatedDate = dayjs(faker.date.between({from: submittedDate, to: new Date()})).toISOString();

    if (status === 'Resolved' || status === 'Closed') {
      // Ensure resolvedDate is between submittedDate and lastUpdatedDate
      resolvedDate = dayjs(faker.date.between({ from: submittedDate, to: lastUpdatedDate })).toISOString();
      resolutionDetails = faker.lorem.paragraph();
    }

    const submittedByStudent = faker.datatype.boolean(0.7); // 70% chance submitted by student
    const canSubmitByStudent = students.length > 0;
    const canSubmitOrAssignToStaff = staffIds.length > 0;

    let finalSubmittedByStudentId: string | undefined = undefined;
    let finalSubmittedByStaffId: string | undefined = undefined;

    if (submittedByStudent && canSubmitByStudent) {
        finalSubmittedByStudentId = faker.helpers.arrayElement(students).studentId;
    } else if (!submittedByStudent && canSubmitOrAssignToStaff) {
        finalSubmittedByStaffId = faker.helpers.arrayElement(staffIds);
    } else if (canSubmitByStudent) { // Fallback if staff cannot submit but student can
        finalSubmittedByStudentId = faker.helpers.arrayElement(students).studentId;
    } else if (canSubmitOrAssignToStaff) { // Fallback if student cannot submit but staff can
        finalSubmittedByStaffId = faker.helpers.arrayElement(staffIds);
    }
    // If neither, both will be undefined, which is allowed by the type.

    tickets.push({
      ticketId: `GRV-${String(i + 1).padStart(5, '0')}`,
      submittedByStudentId: finalSubmittedByStudentId,
      submittedByStaffId: finalSubmittedByStaffId,
      category: faker.helpers.arrayElement(grievanceCategories),
      title: faker.lorem.words(faker.number.int({min: 3, max: 7})).split(' ').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' '),
      description: faker.lorem.paragraphs(faker.number.int({min:1, max:2})),
      status: status,
      priority: faker.helpers.arrayElement(grievancePriorities),
      submittedDate: submittedDate.toISOString(),
      lastUpdatedDate: lastUpdatedDate,
      resolvedDate: resolvedDate,
      assignedToStaffId: status !== 'Closed' && status !== 'Resolved' && canSubmitOrAssignToStaff ? faker.helpers.arrayElement(staffIds) : undefined,
      resolutionDetails: resolutionDetails,
    });
  }
  return tickets;
};
