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
    creditsRequired: 120,
    graduationRate: 85.5, // Ensure it has a decimal for toFixed(1) test
    totalProgramAbsences: 10,
    avgFeesPaidPercentage: 90,
    totalStudentsWithOverdueFees: 5,
    applicants: 200,
    acceptanceRate: 60,
    enrolledCount: 120,
    atRiskStudents: 5,
    gradeDistribution: { 'A': 30, 'B': 40, 'C': 5 },
    departmentId: 'dept01', // Added departmentId
    courses: [], // Added courses
    // semesters: [], // Removed as it's not part of Program type, courses are directly under Program
  },
  {
    programId: 'prog102',
    programName: 'Ph.D. Theoretical Mycology',
    degreeId: 'deg02',
    departmentId: 'dept02', // Added departmentId
    totalStudents: 15,
    averageProgramGPA: 3.9,
    avgAttendancePercentage: 98.1,
    creditsRequired: 60,
    graduationRate: 92.0,
    totalProgramAbsences: 2,
    avgFeesPaidPercentage: 99,
    totalStudentsWithOverdueFees: 0,
    applicants: 20,
    acceptanceRate: 50,
    enrolledCount: 10,
    atRiskStudents: 1,
    gradeDistribution: { 'A': 10, 'B': 5 },
    courses: [], // Added courses
    // semesters: [], // Removed as it's not part of Program type, courses are directly under Program
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
    expect(within(program1Card as HTMLElement).getByText(mockPrograms[0].totalStudents!.toString())).toBeVisible();
    expect(within(program1Card as HTMLElement).getByText(mockPrograms[0].averageProgramGPA!.toFixed(2))).toBeVisible();
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
    const pdfButton = within(program1CardBody as HTMLElement).getByRole('button', { name: /Export PDF Summary/i }) as HTMLElement;

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
    const viewSemestersButton = within(program1CardBody as HTMLElement).getByRole('button', { name: /View Semesters/i }) as HTMLElement;

    await user.click(viewSemestersButton);
    expect(mockOnSelectProgram).toHaveBeenCalledTimes(1);
    expect(mockOnSelectProgram).toHaveBeenCalledWith(mockPrograms[0].programId);
  });

  // New tests for visual cues for problematic programs
  describe('Visual Highlighting for Problematic Programs', () => {
    const problematicProgramById: Program = {
      ...mockPrograms[0],
      programId: 'PSY_BS', // Specific ID to trigger highlighting
      programName: 'B.Sc. Psychology (Problematic by ID)',
      // Other metrics are normal to isolate ID check
      averageProgramGPA: 3.0,
      graduationRate: 80,
      atRiskStudents: 5,
      totalStudents: 100,
    };

    const lowGpaProgram: Program = {
      ...mockPrograms[0],
      programId: 'prog_low_gpa',
      programName: 'B.Sc. Low GPA Studies',
      averageProgramGPA: 2.1, // Below 2.5 threshold
      graduationRate: 80,
      atRiskStudents: 5,
      totalStudents: 100,
    };

    const lowGradRateProgram: Program = {
      ...mockPrograms[0],
      programId: 'prog_low_grad',
      programName: 'B.Sc. Low Graduation Studies',
      averageProgramGPA: 3.0,
      graduationRate: 55, // Below 60% threshold
      atRiskStudents: 5,
      totalStudents: 100,
    };

    const highAtRiskProgram: Program = {
      ...mockPrograms[0],
      programId: 'prog_high_risk',
      programName: 'B.Sc. High At-Risk Studies',
      averageProgramGPA: 3.0,
      graduationRate: 80,
      atRiskStudents: 20, // 20% at-risk (threshold is >15%)
      totalStudents: 100,
    };

    const normalProgram: Program = { // Use a clearly non-problematic version
      ...mockPrograms[0],
      programId: 'prog_normal',
      programName: 'B.Sc. Normal Studies',
      averageProgramGPA: 3.5,
      graduationRate: 85,
      atRiskStudents: 5, // 5%
      totalStudents: 100,
    };

    const getProgramCard = (programName: string) => {
      const nameElement = screen.getByText(programName);
      const cardElement = nameElement.closest('.ant-card');
      expect(cardElement).toBeInTheDocument();
      return cardElement as HTMLElement;
    };

    test('should highlight program "PSY_BS" by ID', () => {
      render(<ProgramList programs={[problematicProgramById]} onSelectProgram={jest.fn()} onComparePrograms={jest.fn()} />);
      const card = getProgramCard(problematicProgramById.programName);
      const titleElement = within(card).getByText(problematicProgramById.programName).closest('.ant-card-head-title');
      expect(titleElement?.querySelector('.anticon-warning')).toBeInTheDocument();
      expect(card).toHaveStyle('border: 1.5px solid #f5222d');
      expect(card).toHaveStyle('background: #fff1f0');
    });

    test('should highlight program with low GPA', () => {
      render(<ProgramList programs={[lowGpaProgram]} onSelectProgram={jest.fn()} onComparePrograms={jest.fn()} />);
      const card = getProgramCard(lowGpaProgram.programName);
      const titleElement = within(card).getByText(lowGpaProgram.programName).closest('.ant-card-head-title');
      expect(titleElement?.querySelector('.anticon-warning')).toBeInTheDocument();
      expect(card).toHaveStyle('border: 1.5px solid #f5222d');
      expect(card).toHaveStyle('background: #fff1f0');

      // Check GPA statistic color
      // We find the statistic title, then go to its parent, then find the value part.
      const gpaStatTitle = within(card).getByText('Avg. GPA');
      const gpaStatValue = gpaStatTitle.closest('.ant-statistic')?.querySelector('.ant-statistic-content-value');
      expect(gpaStatValue).toHaveStyle('color: rgb(245, 34, 45)'); // #f5222d in rgb
    });

    test('should highlight program with low graduation rate', () => {
      render(<ProgramList programs={[lowGradRateProgram]} onSelectProgram={jest.fn()} onComparePrograms={jest.fn()} />);
      const card = getProgramCard(lowGradRateProgram.programName);
      const titleElement = within(card).getByText(lowGradRateProgram.programName).closest('.ant-card-head-title');
      expect(titleElement?.querySelector('.anticon-warning')).toBeInTheDocument();
      expect(card).toHaveStyle('border: 1.5px solid #f5222d');
      expect(card).toHaveStyle('background: #fff1f0');

      const gradRateStatTitle = within(card).getByText('Graduation Rate');
      const gradRateStatValue = gradRateStatTitle.closest('.ant-statistic')?.querySelector('.ant-statistic-content-value');
      expect(gradRateStatValue).toHaveStyle('color: rgb(245, 34, 45)'); // #f5222d in rgb
    });

    test('should highlight program with high at-risk percentage', () => {
      render(<ProgramList programs={[highAtRiskProgram]} onSelectProgram={jest.fn()} onComparePrograms={jest.fn()} />);
      const card = getProgramCard(highAtRiskProgram.programName);
      const titleElement = within(card).getByText(highAtRiskProgram.programName).closest('.ant-card-head-title');
      expect(titleElement?.querySelector('.anticon-warning')).toBeInTheDocument();
      expect(card).toHaveStyle('border: 1.5px solid #f5222d');
      expect(card).toHaveStyle('background: #fff1f0');

      const atRiskStatTitle = within(card).getByText('Total At-Risk Students');
      const atRiskStatValue = atRiskStatTitle.closest('.ant-statistic')?.querySelector('.ant-statistic-content-value');
      expect(atRiskStatValue).toHaveStyle('color: rgb(250, 173, 20)'); // #faad14 in rgb
    });

    test('should not highlight a normal program', () => {
      render(<ProgramList programs={[normalProgram]} onSelectProgram={jest.fn()} onComparePrograms={jest.fn()} />);
      const card = getProgramCard(normalProgram.programName);
      const titleElement = within(card).getByText(normalProgram.programName).closest('.ant-card-head-title');
      expect(titleElement?.querySelector('.anticon-warning')).not.toBeInTheDocument();
      // Check that problematic styles are NOT applied
      // Note: Default antd card may have a border, so check for specific problematic border or absence of it.
      // For background, it should not be #fff1f0. Default is transparent or white.
      expect(card.style.border).not.toBe('1.5px solid #f5222d');
      expect(card.style.background).not.toBe('rgb(255, 241, 240)'); // #fff1f0 in rgb

      const gpaStatTitle = within(card).getByText('Avg. GPA');
      const gpaStatValue = gpaStatTitle.closest('.ant-statistic')?.querySelector('.ant-statistic-content-value');
      expect(gpaStatValue).not.toHaveStyle('color: rgb(245, 34, 45)');

      const gradRateStatTitle = within(card).getByText('Graduation Rate');
      const gradRateStatValue = gradRateStatTitle.closest('.ant-statistic')?.querySelector('.ant-statistic-content-value');
      expect(gradRateStatValue).not.toHaveStyle('color: rgb(245, 34, 45)');

      const atRiskStatTitle = within(card).getByText('Total At-Risk Students');
      const atRiskStatValue = atRiskStatTitle.closest('.ant-statistic')?.querySelector('.ant-statistic-content-value');
      expect(atRiskStatValue).not.toHaveStyle('color: rgb(250, 173, 20)');
    });
  });
});
