// src/utils/exportUtils.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Program } from '../types/hierarchy'; // Ensure Program type is imported

export const downloadCSV = (data: any[], columns: {key: string, title: string}[], fileName: string) => {
  if (!data || data.length === 0) {
    console.warn("No data to export for CSV.");
    // Optionally, provide user feedback e.g., using Ant Design notification
    // notification.warning({ message: 'No data available to export.' });
    return;
  }

  const csvRows = [];
  // Add header row
  csvRows.push(columns.map(c => `"${c.title.replace(/"/g, '""')}"`).join(','));

  // Add data rows
  for (const row of data) {
    const values = columns.map(col => {
      let cellValue = row[col.key];
      if (cellValue === null || cellValue === undefined) {
        cellValue = "";
      } else if (typeof cellValue === 'number') {
        // Keep numbers as numbers, stringification with quotes will handle it
      } else {
        cellValue = String(cellValue).replace(/"/g, '""'); // Escape double quotes
      }
      return `"${cellValue}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  // Feature detection for download attribute
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    // Fallback for older browsers or environments where download attribute is not supported
    console.error("CSV download attribute not supported. Cannot initiate download.");
    // Consider an alternative, like opening in a new window (though this is less user-friendly for direct saving)
    // window.open('data:text/csv;charset=utf-8,' + encodeURIComponent(csvString));
    // Or, alert the user to manually copy data if possible, or that the feature isn't available.
    // notification.error({ message: 'CSV download not supported in this browser.' });
  }
};

export const downloadProgramSummaryPDF = (program: Program, degreeName?: string, academicYearName?: string) => {
  const doc = new jsPDF(); // Default is portrait, pica, a4. Options can be added.

  // Title
  doc.setFontSize(18);
  doc.text(`Program Summary: ${program.programName}`, 14, 22);

  let currentYPosition = 30; // Initial Y position for sub-titles

  if (degreeName) {
    doc.setFontSize(12);
    doc.text(`Degree: ${degreeName}`, 14, currentYPosition);
    currentYPosition += 7; // Increment Y position, giving a bit more space than 6
  }
  if (academicYearName) {
    doc.setFontSize(12);
    doc.text(`Academic Year: ${academicYearName}`, 14, currentYPosition);
    currentYPosition += 7; // Increment Y position
  }

  currentYPosition += 10; // Add some space before KPIs section title

  // Program KPIs
  doc.setFontSize(14); // Section title font size
  doc.text("Program KPIs", 14, currentYPosition);
  currentYPosition += 8; // Space after section title

  const programKpis = [
    { label: "Total Students:", value: program.totalStudents?.toString() ?? 'N/A' },
    { label: "Average GPA:", value: program.averageProgramGPA?.toFixed(2) ?? 'N/A' },
    { label: "Required Credits:", value: program.creditsRequired?.toString() ?? 'N/A' },
    { label: "Graduation Rate:", value: program.graduationRate !== undefined ? program.graduationRate.toFixed(1) + '%' : 'N/A' },
    { label: "Avg. Attendance:", value: program.avgAttendancePercentage !== undefined ? program.avgAttendancePercentage.toFixed(1) + '%' : 'N/A' },
    { label: "Total Absences:", value: program.totalProgramAbsences?.toString() ?? 'N/A' },
    { label: "Avg. Fees Paid:", value: program.avgFeesPaidPercentage !== undefined ? program.avgFeesPaidPercentage.toFixed(1) + '%' : 'N/A' },
    { label: "Students w/ Overdue Fees:", value: program.totalStudentsWithOverdueFees?.toString() ?? 'N/A' },
    { label: "Applicants:", value: program.applicants?.toString() ?? 'N/A' },
    { label: "Acceptance Rate:", value: program.acceptanceRate !== undefined ? program.acceptanceRate.toFixed(1) + '%' : 'N/A' },
    { label: "Enrolled Count:", value: program.enrolledCount?.toString() ?? 'N/A' },
    { label: "At-Risk Students:", value: program.atRiskStudents?.toString() ?? 'N/A' },
  ];

  doc.setFontSize(10); // KPI text font size
  programKpis.forEach(kpi => {
    if (currentYPosition > 280) { // Basic page break handling
      doc.addPage();
      currentYPosition = 20; // Reset Y for new page
      // Optionally re-draw headers or context if needed on new page
    }
    doc.text(`${kpi.label} ${kpi.value}`, 14, currentYPosition);
    currentYPosition += 7; // Increment Y for next line
  });

  currentYPosition += 10; // Add some space before Semesters section title

  // Semester Table section removed as program.semesters is not a valid property
  // If course data needs to be displayed, it should iterate program.courses (which is Course[])
  // and display relevant information. For this fix, the section is removed.

  // Filename
  // Ensure currentYPosition is updated if any other content is added before saving.
  // For now, it retains its value from after the KPIs.
  const fileName = `Program_Summary_${sanitizeFilename(program.programName)}.pdf`;

  doc.save(fileName);
};

export const sanitizeFilename = (name: string | undefined | null): string => {
  if (!name) return "";
  // Remove or replace characters not suitable for filenames
  // Keep it simple: replace whitespace with underscore, remove most non-alphanumeric except hyphen and underscore
  return name.replace(/\s+/g, '_').replace(/[^\w\-\.]/g, ''); // Allow dots for extensions if any part of name has it
};
