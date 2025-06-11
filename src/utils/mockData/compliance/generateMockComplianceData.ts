import { faker } from '@faker-js/faker';
import {
    ComplianceItem, ComplianceStatus, AccreditationStatusSummary,
    AccreditingBody, AccreditationOverallStatus
} from '../../../types/academics'; // Adjust path if academics.ts is not in ../../types
import { Department } from '../../../types/departments'; // Corrected import path for Department
import dayjs from 'dayjs';

const complianceStatuses: ComplianceStatus[] = ['Compliant', 'Compliant', 'Compliant', 'Non-Compliant', 'In Progress', 'Pending Review', 'Compliant'];
const accreditingBodies: AccreditingBody[] = ['NAAC', 'NBA', 'UGC'];
const accreditationOverallStatuses: AccreditationOverallStatus[] = ['Accredited', 'Cycle Ongoing', 'Not Accredited', 'Accredited'];

export const generateMockComplianceItems = (
  departments: Department[],
  count: number = 30
): ComplianceItem[] => {
  const items: ComplianceItem[] = [];
  if (departments.length === 0 && count > 0) {
      // If no departments, create items without owner or skip
      // console.warn("Generating compliance items without department owners.");
  }

  for (let i = 0; i < count; i++) {
    const lastAuditDate = faker.date.past({ years: 2 });
    const status = faker.helpers.arrayElement(complianceStatuses);
    items.push({
      itemId: `COMPLIANCE-${String(i + 1).padStart(4, '0')}`,
      criterionId: `${faker.helpers.arrayElement(['NAAC', 'NBA', 'ISO'])}.${faker.number.int({min:1,max:7})}.${faker.number.int({min:1,max:5})}.${faker.number.int({min:1,max:10})}`,
      criterionName: faker.lorem.sentence(faker.number.int({min:4, max:8})),
      status: status,
      lastAuditDate: lastAuditDate.toISOString(),
      nextAuditDate: status !== 'Compliant' && status !== 'Not Assessed' ? dayjs(lastAuditDate).add(faker.number.int({min:3,max:12}), 'month').toISOString() : undefined,
      ownerDeptId: departments.length > 0 ? faker.helpers.arrayElement(departments).departmentId : undefined,
      evidenceDocUrl: faker.internet.url() + '/mockEvidence.pdf',
    });
  }
  return items;
};

export const generateMockAccreditationStatusSummary = (count: number = 1): AccreditationStatusSummary[] => {
    const summaries: AccreditationStatusSummary[] = [];
    for (let i=0; i<count; i++) {
        const body = faker.helpers.arrayElement(accreditingBodies);
        const overallStatus = faker.helpers.arrayElement(accreditationOverallStatuses);
        const lastCycleDate = faker.date.past({years: 3});
        let validFrom: string | undefined;
        let validUntil: string | undefined;

        if (overallStatus === 'Accredited') {
            validFrom = dayjs(lastCycleDate).add(faker.number.int({min:1, max:3}), 'month').toISOString();
            validUntil = dayjs(validFrom).add(faker.number.int({min:3, max:5}), 'year').toISOString();
        }

        summaries.push({
            accreditationId: `ACCRED-${body}-${String(i+1).padStart(2,'0')}`,
            body: body,
            overallStatus: overallStatus,
            validFrom: validFrom,
            validUntil: validUntil,
            lastCycleDate: lastCycleDate.toISOString(),
            nextMajorReviewCycle: dayjs(lastCycleDate).add(faker.number.int({min:4, max:7}), 'year').format('YYYY'),
            applicationStatus: overallStatus === 'Cycle Ongoing' ? faker.helpers.arrayElement(['Submitted', 'Queried', 'Visit Scheduled']) : undefined,
        });
    }
    return summaries;
};
