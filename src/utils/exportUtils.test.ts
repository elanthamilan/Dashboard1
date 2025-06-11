// src/utils/exportUtils.test.ts
import { sanitizeFilename } from './exportUtils';

describe('sanitizeFilename', () => {
  it('should replace spaces with underscores', () => {
    expect(sanitizeFilename("file name with spaces")).toBe("file_name_with_spaces");
  });

  it('should remove special characters not allowed in filenames', () => {
    // Based on the regex [^\w\-\.], these characters should be removed: *, ?, <, >
    expect(sanitizeFilename("file*name?with<special>chars")).toBe("filenamewithspecialchars");
  });

  it('should allow hyphens and underscores', () => {
    expect(sanitizeFilename("file_name-with-hyphens_and_underscores")).toBe("file_name-with-hyphens_and_underscores");
  });

  it('should handle empty strings', () => {
    expect(sanitizeFilename("")).toBe("");
  });

  it('should handle null or undefined input by returning an empty string', () => {
    expect(sanitizeFilename(null)).toBe("");
    expect(sanitizeFilename(undefined)).toBe("");
  });

  it('should allow dots', () => {
    expect(sanitizeFilename("filename.with.dots.txt")).toBe("filename.with.dots.txt");
  });

  it('should handle mixed case by preserving it', () => {
    expect(sanitizeFilename("FileNameWithMixedCase")).toBe("FileNameWithMixedCase");
  });

  it('should remove leading/trailing problematic characters if regex handles it', () => {
    // Current regex [^\w\-\.] will remove these
    expect(sanitizeFilename("*leading_and_trailing_chars*")).toBe("leading_and_trailing_chars");
    expect(sanitizeFilename("!another-example!")).toBe("another-example");
  });

  it('should handle a mix of allowed and disallowed characters', () => {
    expect(sanitizeFilename("My Report (Version 2.0).docx")).toBe("My_Report_Version_2.0.docx");
  });

  it('should handle strings that are already sanitized', () => {
    expect(sanitizeFilename("already_sanitized-123.pdf")).toBe("already_sanitized-123.pdf");
  });

  it('should handle names with just dots and numbers correctly', () => {
    expect(sanitizeFilename("1.2.3.report")).toBe("1.2.3.report");
  });

   it('should handle names with unicode characters (current regex removes them)', () => {
    expect(sanitizeFilename("Résumé_Français.pdf")).toBe("Rsum_Franais.pdf"); // Current regex removes é and ç
  });
});
