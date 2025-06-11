// src/components/PrincipalView/ProgramList.test.tsx
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProgramList from './ProgramList'; // Adjust path if necessary
import { Program } from '../../types/hierarchy'; // Adjust path if necessary
import '@testing-library/jest-dom';

// Mock export utilities
// Note: sanitizeFilename is also part of exportUtils, so we provide a mock for it too.
jest.mock('../../utils/exportUtils', () => ({
  downloadCSV: jest.fn(),
  downloadProgramSummaryPDF: jest.fn(),
  sanitizeFilename: jest.fn((name) => name ? name.replace(/\s+/g, '_').replace(/[^\w.-]/g, '') : ''),
}));

const mockPrograms: Program[] = [
  {
    programId: 'prog101',
    programName: 'B.Sc. Advanced Rocketry',
    degreeId: 'deg01',
    totalStudents: 75,
    averageProgramGPA: 3.8,
    avgAttendancePercentage: 95.2,
    requiredCredits: 120,
    graduationRate: 85.5, // Ensure it has a decimal for toFixed(1) test
    totalProgramAbsences: 10,
    avgFeesPaidPercentage: 90,
    totalStudentsWithOverdueFees: 5,
    applicants: 200,
    acceptanceRate: 60,
    enrolledCount: 120,
    atRiskStudents: 5,
    gradeDistribution: { 'A': 30, 'B': 40, 'C': 5 },
    semesters: [],
  },
  {
    programId: 'prog102',
    programName: 'Ph.D. Theoretical Mycology',
    degreeId: 'deg02',
    totalStudents: 15,
    averageProgramGPA: 3.9,
    avgAttendancePercentage: 98.1,
    requiredCredits: 60,
    graduationRate: 92.0,
    totalProgramAbsences: 2,
    avgFeesPaidPercentage: 99,
    totalStudentsWithOverdueFees: 0,
    applicants: 20,
    acceptanceRate: 50,
    enrolledCount: 10,
    atRiskStudents: 1,
    gradeDistribution: { 'A': 10, 'B': 5 },
    semesters: [],
  },
];

describe('ProgramList', () => {
  const mockOnSelectProgram = jest.fn();
  const mockOnComparePrograms = jest.fn();
  const testDegreeName = "Test Degree";
  const testAcademicYearName = "Test Year";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render a card for each program with its name and key KPIs', () => {
    render(
      <ProgramList
        programs={mockPrograms}
        onSelectProgram={mockOnSelectProgram}
        onComparePrograms={mockOnComparePrograms}
      />
    );

    expect(screen.getByText(mockPrograms[0].programName)).toBeVisible();
    expect(screen.getByText(mockPrograms[1].programName)).toBeVisible();

    const program1Card = screen.getByText(mockPrograms[0].programName).closest('.ant-card');
    expect(program1Card).not.toBeNull();
    expect(within(program1Card!).getByText(mockPrograms[0].totalStudents!.toString())).toBeVisible();
    expect(within(program1Card!).getByText(mockPrograms[0].averageProgramGPA!.toFixed(2))).toBeVisible();
  });

  it('should display "no programs" message when programs array is empty', () => {
    render(
      <ProgramList
        programs={[]}
        onSelectProgram={mockOnSelectProgram}
        onComparePrograms={mockOnComparePrograms}
      />
    );
    expect(screen.getByText('No programs available for this degree.')).toBeVisible();
  });

  it('should allow selecting programs for comparison and call onComparePrograms', async () => {
    const user = userEvent.setup();
    render(
      <ProgramList
        programs={mockPrograms}
        onSelectProgram={mockOnSelectProgram}
        onComparePrograms={mockOnComparePrograms}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);

    const compareButton = screen.getByRole('button', { name: /Compare Selected \(2\)/i });
    expect(compareButton).not.toBeDisabled();
    await user.click(compareButton);

    expect(mockOnComparePrograms).toHaveBeenCalledTimes(1);
    expect(mockOnComparePrograms).toHaveBeenCalledWith([mockPrograms[0].programId, mockPrograms[1].programId]);
  });

  it('should disable compare button if fewer than 2 programs are selected', async () => {
    const user = userEvent.setup();
    render(
      <ProgramList
        programs={mockPrograms}
        onSelectProgram={mockOnSelectProgram}
        onComparePrograms={mockOnComparePrograms}
      />
    );
    const compareButtonInitial = screen.getByRole('button', { name: /Compare Selected \(0\)/i });
    expect(compareButtonInitial).toBeDisabled();

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);
    const compareButtonOneSelected = screen.getByRole('button', { name: /Compare Selected \(1\)/i });
    expect(compareButtonOneSelected).toBeDisabled();
  });

  // Test for disabling compare button if more than 3 selected would require >3 mock programs.

  it('should call downloadCSV when "Generate Report (CSV)" button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ProgramList
        programs={mockPrograms}
        onSelectProgram={mockOnSelectProgram}
        onComparePrograms={mockOnComparePrograms}
        degreeName={testDegreeName}
        academicYearName={testAcademicYearName}
      />
    );
    const csvButton = screen.getByRole('button', { name: 'Generate Report (CSV)' });
    await user.click(csvButton);
    expect(require('../../utils/exportUtils').downloadCSV).toHaveBeenCalledTimes(1);
  });

  it('should call downloadProgramSummaryPDF when "Export PDF Summary" button is clicked on a program card', async () => {
    const user = userEvent.setup();
    render(
      <ProgramList
        programs={mockPrograms}
        onSelectProgram={mockOnSelectProgram}
        onComparePrograms={mockOnComparePrograms}
        degreeName={testDegreeName}
        academicYearName={testAcademicYearName}
      />
    );

    const program1CardBody = screen.getByText(mockPrograms[0].programName).closest('.ant-card')?.querySelector('.ant-card-body');
    expect(program1CardBody).not.toBeNull();
    const pdfButton = within(program1CardBody!).getByRole('button', { name: /Export PDF Summary/i });

    await user.click(pdfButton);
    expect(require('../../utils/exportUtils').downloadProgramSummaryPDF).toHaveBeenCalledTimes(1);
    expect(require('../../utils/exportUtils').downloadProgramSummaryPDF).toHaveBeenCalledWith(
      mockPrograms[0],
      testDegreeName,
      testAcademicYearName
    );
  });

  it('should call onSelectProgram when "View Semesters" button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ProgramList
        programs={mockPrograms}
        onSelectProgram={mockOnSelectProgram}
        onComparePrograms={mockOnComparePrograms}
      />
    );
    const program1CardBody = screen.getByText(mockPrograms[0].programName).closest('.ant-card')?.querySelector('.ant-card-body');
    expect(program1CardBody).not.toBeNull();
    const viewSemestersButton = within(program1CardBody!).getByRole('button', { name: /View Semesters/i });

    await user.click(viewSemestersButton);
    expect(mockOnSelectProgram).toHaveBeenCalledTimes(1);
    expect(mockOnSelectProgram).toHaveBeenCalledWith(mockPrograms[0].programId);
  });

});
