// src/components/AdmissionsDashboard/index.ts
export { default as AdmissionsDashboard } from './AdmissionsDashboard';
export { default as ApplicantFunnelChart } from './ApplicantFunnelChart';
export { default as KeyDeadlinesTimeline } from './KeyDeadlinesTimeline';
export { default as ApplicantTable } from './ApplicantTable';
export { default as ApplicantDetailModal } from './ApplicantDetailModal';
export { default as NewApplicationForm } from './NewApplicationForm';
// KpiCard is currently defined within AdmissionsDashboard.tsx, so not exported here unless refactored.
// types.ts is also not typically exported from an index.ts meant for components,
// but rather imported directly from its path or a dedicated types index file.
