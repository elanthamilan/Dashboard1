// src/utils/exportUtils.ts
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
