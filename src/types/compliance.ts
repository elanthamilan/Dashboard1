// src/types/compliance.ts
export type RiskStatus = 'Open' | 'Closed' | 'Mitigated' | 'High' | 'Medium' | 'Low' | 'Action Pending' | 'Monitoring';

export interface ComplianceTraining {
  id: string;
  name: string;
  description?: string;
  departmentNames: string[];
  completionRate?: number;
  assignedDate?: string;
  dueDate?: string;
  status?: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  // Potentially other fields like 'trainingProvider', 'hours'
}

export interface Risk {
  id: string;
  description: string;
  category: string; // e.g., 'Financial', 'Operational', 'Reputational', 'Compliance'
  status: RiskStatus;
  riskScore?: number; // Calculated (e.g., Likelihood * Impact)
  likelihood?: 1 | 2 | 3 | 4 | 5;
  impact?: 1 | 2 | 3 | 4 | 5;
  mitigationPlan?: string;
  ownerDepartmentId?: string;
  ownerDepartmentName?: string;
  identifiedDate?: string;
  lastReviewedDate?: string;
  nextReviewDate?: string;
}
