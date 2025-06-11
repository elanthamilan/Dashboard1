/**
 * Returns the week number and year for a given date.
 * Example: For a date in the 23rd week of 2023, it returns "W23 2023".
 * @param date - The input date.
 * @returns A string representing the week number and year.
 */
export const getWeekNumberWithYear = (date: Date): string => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil((((d.valueOf() - yearStart.valueOf()) / 86400000) + 1) / 7);
  return `W${weekNo} ${d.getUTCFullYear()}`;
};

/**
 * Determines the academic year ID from a given date.
 * Assumes the academic year starts in August.
 * Example: A date in September 2023 or February 2024 belongs to "AY2023-2024".
 * @param date - The input date.
 * @returns A string representing the academic year ID (e.g., "AY2023-2024").
 */
export const getAcademicYearIdFromDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed (January is 0, August is 7)

  // If the month is August or later, it's the start of a new academic year.
  // Otherwise, it's part of the academic year that started in the previous calendar year.
  if (month >= 7) { // August or later
    return `AY${year}-${year + 1}`;
  } else { // July or earlier
    return `AY${year - 1}-${year}`;
  }
};
