// src/components/PrincipalView/PrincipalStudentDetailView.test.tsx
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import PrincipalStudentDetailView from './PrincipalStudentDetailView'; // Adjust path if necessary
import { StudentAcademicRecord } from '../../types/hierarchy'; // Adjusted path
import '@testing-library/jest-dom';

// Mock child components
jest.mock('../../components/StudentPerformanceDashboard/GpaTrendChart', () => () => <div data-testid="gpa-trend-chart-mock">GPA Trend Chart</div>);
jest.mock('../../components/StudentPerformanceDashboard/SkillProficiencyChart', () => () => <div data-testid="skill-proficiency-chart-mock">Skill Proficiency Chart</div>);
jest.mock('../../components/StudentPerformanceDashboard/StudentGradeDistributionChart', () => () => <div data-testid="grade-distribution-chart-mock">Grade Distribution Chart</div>);
jest.mock('../../components/StudentPerformanceDashboard/DegreeCompletionProgress', () => () => <div data-testid="degree-completion-mock">Degree Completion Progress</div>);
jest.mock('../../components/StudentPerformanceDashboard/StudentGradeGrid', () => () => <div data-testid="student-grade-grid-mock">Student Grade Grid</div>);

const mockStudentRecord: StudentAcademicRecord = {
  studentId: 's123',
  programId: 'prog1', // Added programId as it's often part of the type
  programName: 'B.Sc. Computer Science',
  enrollmentDate: new Date().toISOString(), // Added enrollmentDate
  expectedGraduationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 4)).toISOString(), // Added expectedGraduationDate
  cumulativeGPA: 3.75,
  totalCreditsEarned: 90,
  requiredCreditsForDegree: 120,
  semesters: [ // Changed from terms to semesters
    { termId: 'T1', semesterName: 'Fall 2023', courses: [] }, // Adjusted to match StudentTermRecord
    { termId: 'T2', semesterName: 'Spring 2024', courses: [] },
  ],
  // skillProficiencies: [{ skillName: 'Programming', proficiencyLevel: 80, lastAssessed: new Date().toISOString() }], // Commented out as it's not in StudentAcademicRecord
  // Other fields can be minimal or undefined if not directly rendered by PrincipalStudentDetailView's own logic
  // k12StandardsMastery: [], // Removed, not in type
  // onlineLearningProgress: [], // Removed, not in type
};

describe('PrincipalStudentDetailView', () => {
  it('should display loading spinner when loading is true', () => {
    render(<PrincipalStudentDetailView studentAcademicRecord={null} loading={true} />);
    expect(screen.getByRole('spin')).toBeVisible();
    expect(screen.getByText('Loading student details...')).toBeVisible();
  });

  it('should display "no academic record" message when studentAcademicRecord is null and not loading', () => {
    render(<PrincipalStudentDetailView studentAcademicRecord={null} loading={false} />);
    expect(screen.getByText('No academic record found for this student.')).toBeVisible();
  });

  it('should render KPIs correctly when data is provided', () => {
    render(<PrincipalStudentDetailView studentAcademicRecord={mockStudentRecord} loading={false} />);
    // Check for KPI titles (from the local KpiCard definition)
    expect(screen.getByText('Cumulative GPA')).toBeVisible();
    // Check for KPI values
    expect(screen.getByText(mockStudentRecord.cumulativeGPA!.toFixed(2))).toBeVisible();
    expect(screen.getByText(mockStudentRecord.totalCreditsEarned!.toString())).toBeVisible();
    expect(screen.getByText(mockStudentRecord.requiredCreditsForDegree!.toString())).toBeVisible();
  });

  it('should render chart and grid sections with titles when data is provided', () => {
    render(<PrincipalStudentDetailView studentAcademicRecord={mockStudentRecord} loading={false} />);
    // Check for Card titles that wrap the mocked charts/grid
    expect(screen.getByText('GPA Trend')).toBeVisible();
    expect(screen.getByTestId('gpa-trend-chart-mock')).toBeVisible();

    expect(screen.getByText('Skill Proficiency')).toBeVisible();
    expect(screen.getByTestId('skill-proficiency-chart-mock')).toBeVisible();

    expect(screen.getByText('Grade Distribution')).toBeVisible();
    expect(screen.getByTestId('grade-distribution-chart-mock')).toBeVisible();

    expect(screen.getByText('Degree Completion Progress')).toBeVisible();
    expect(screen.getByTestId('degree-completion-mock')).toBeVisible();

    expect(screen.getByText('Course Grades')).toBeVisible();
    expect(screen.getByTestId('student-grade-grid-mock')).toBeVisible();
  });

  it('should render N/A (or placeholder) for optional KPIs if they are undefined in the record', () => {
    const recordWithMissingOptionalKPI: StudentAcademicRecord = {
      ...mockStudentRecord,
      cumulativeGPA: undefined, // Make GPA undefined
    };
    render(<PrincipalStudentDetailView studentAcademicRecord={recordWithMissingOptionalKPI} loading={false} />);

    // The local KpiCard in PrincipalStudentDetailView uses `studentAcademicRecord.cumulativeGPA ?? "-"`
    // So, it should render "-" when cumulativeGPA is undefined.
    // We need to find the specific KpiCard. Let's assume there's only one "-" shown for KPIs in this state.
    // Or, more robustly, find the "Cumulative GPA" card and check its content.
    const kpiCards = screen.getAllByRole('figure'); // AntD Statistic renders as <div role="figure">
    let gpaValueRendered = '';
    kpiCards.forEach(card => {
        const titleElement = within(card).queryByText('Cumulative GPA');
        if (titleElement) {
            const valueElement = within(card).queryByText('-'); // Looking for the specific '-'
            if(valueElement) gpaValueRendered = '-';

            // For Ant Design v5, Statistic values are often in a .ant-statistic-content-value
            const antValueElement = card.querySelector('.ant-statistic-content-value');
            if (antValueElement?.textContent === '-') {
                 gpaValueRendered = '-';
            } else if (antValueElement?.textContent === '--') { // AntD might render '--' for undefined number
                 gpaValueRendered = '--';
            }
        }
    });
    expect(['-', '--']).toContain(gpaValueRendered); // Check if it's either our custom "-" or AntD's "--"
  });

});
