// src/components/PrincipalView/ComparisonModal.test.tsx
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event'; // For simulating user interactions like close
import ComparisonModal, { ComparisonItem, ComparisonItemType } from './ComparisonModal'; // Adjust path if necessary
import '@testing-library/jest-dom'; // For extended matchers like .toBeVisible()

const mockProgramItems: ComparisonItem[] = [
  {
    id: 'prog1',
    name: 'B.Sc. Computer Science',
    type: 'Program',
    totalStudents: 120,
    averageGPA: 3.5,
    attendancePercentage: 92.5,
    requiredCredits: 120,
    graduationRate: 85,
    // Adding other optional fields that might be rendered as N/A if not present in other items
    totalAbsences: 10,
    feesPaidPercentage: 95,
    studentsWithOverdueFees: 5,
    applicants: 150,
    acceptanceRate: 60,
    enrolledCount: 90,
    atRiskStudents: 12,
  },
  {
    id: 'prog2',
    name: 'B.A. English',
    type: 'Program',
    totalStudents: 80,
    averageGPA: 3.2,
    attendancePercentage: 90.1,
    requiredCredits: 110,
    graduationRate: 88,
    // Adding other optional fields
    totalAbsences: 15,
    feesPaidPercentage: 92,
    studentsWithOverdueFees: 8,
    applicants: 100,
    acceptanceRate: 70,
    enrolledCount: 70,
    atRiskStudents: 7,
  },
];

const mockDegreeItems: ComparisonItem[] = [
  {
    id: 'deg1',
    name: 'Bachelors Degrees',
    type: 'Degree',
    totalStudents: 500,
    averageGPA: 3.3,
    attendancePercentage: 88.0,
    // Explicitly undefined for some optional fields to test N/A rendering
    totalAbsences: undefined,
    feesPaidPercentage: undefined,
    studentsWithOverdueFees: undefined,
    applicants: 200,
    acceptanceRate: undefined,
    enrolledCount: 150,
    atRiskStudents: undefined,
  },
];

describe('ComparisonModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should render correctly with title when visible (open) is true', () => {
    render(<ComparisonModal visible={true} items={mockProgramItems} onClose={mockOnClose} />);
    expect(screen.getByText('Comparison View')).toBeVisible();
  });

  it('should not render visible content when visible (open) is false', () => {
    // AntD Modal when not visible is typically not in the DOM or display:none.
    // queryByText will return null if not found, which is expected.
    render(<ComparisonModal visible={false} items={mockProgramItems} onClose={mockOnClose} />);
    expect(screen.queryByText('Comparison View')).not.toBeInTheDocument();
  });


  it('should display common KPIs for program items', () => {
    render(<ComparisonModal visible={true} items={mockProgramItems} onClose={mockOnClose} />);
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'Total Students' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'Average GPA' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'Avg. Attendance (%)' })).toBeVisible();

    expect(screen.getByText(mockProgramItems[0].name)).toBeVisible();
    expect(screen.getByText(mockProgramItems[0].totalStudents!.toString())).toBeVisible();
    expect(screen.getByText(mockProgramItems[0].averageGPA!.toFixed(2))).toBeVisible();
    expect(screen.getByText(mockProgramItems[0].attendancePercentage!.toFixed(1) + '%')).toBeVisible();
  });

  it('should display program-specific columns (Required Credits, Graduation Rate) for Program type items', () => {
    render(<ComparisonModal visible={true} items={mockProgramItems} onClose={mockOnClose} />);
    expect(screen.getByRole('columnheader', { name: 'Required Credits' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'Graduation Rate (%)' })).toBeVisible();

    expect(screen.getByText(mockProgramItems[0].requiredCredits!.toString())).toBeVisible();
    expect(screen.getByText(mockProgramItems[0].graduationRate!.toFixed(1) + '%')).toBeVisible();
  });

  it('should NOT display program-specific columns for non-Program type items (e.g., Degree)', () => {
    render(<ComparisonModal visible={true} items={mockDegreeItems} onClose={mockOnClose} />);
    expect(screen.queryByRole('columnheader', { name: 'Required Credits' })).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Graduation Rate (%)' })).not.toBeInTheDocument();

    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    expect(screen.getByText(mockDegreeItems[0].name)).toBeVisible();
  });

  it('should call onClose when the Ant Design close button (x) is clicked', async () => {
    render(<ComparisonModal visible={true} items={mockProgramItems} onClose={mockOnClose} />);
    const closeButton = screen.getByLabelText('Close', { selector: 'button' }); // AntD modal close button has aria-label="Close"
    await userEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should render N/A for undefined optional common KPIs for Degree items', () => {
    render(<ComparisonModal visible={true} items={mockDegreeItems} onClose={mockOnClose} />);

    const degreeRow = screen.getByText(mockDegreeItems[0].name).closest('tr');
    expect(degreeRow).not.toBeNull();

    // Check for N/A for fields that were explicitly undefined in mockDegreeItems[0]
    // Example: totalAbsences, feesPaidPercentage, studentsWithOverdueFees, acceptanceRate, atRiskStudents
    // The exact number of N/A cells depends on how many undefined values are rendered.
    // Assuming 'Total Absences' column exists and its value for mockDegreeItems[0] is undefined
    const cellsInDegreeRow = within(degreeRow!).getAllByRole('cell');

    // Find the column index for 'Total Absences'
    const headers = screen.getAllByRole('columnheader');
    const totalAbsencesHeaderIndex = headers.findIndex(header => header.textContent === 'Total Absences');

    // Check if the cell at that index contains 'N/A'
    if (totalAbsencesHeaderIndex !== -1) {
         // cellsInDegreeRow includes antd's selection checkbox cell if any, adjust index if needed
         // For simplicity, let's assume cellsInDegreeRow[0] is name, and subsequent cells match headers
         // This might need adjustment based on actual table structure from AntD
        expect(cellsInDegreeRow[totalAbsencesHeaderIndex].textContent).toBe('N/A');
    } else {
        throw new Error("Could not find 'Total Absences' column header to verify N/A rendering.");
    }

    // A more general check if specific column finding is tricky:
    const nACells = within(degreeRow!).queryAllByText('N/A');
    expect(nACells.length).toBeGreaterThanOrEqual(1); // At least one N/A for the undefined fields
  });

});
