// src/contexts/GlobalFilterContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface GlobalFilterState {
  academicYear: string | null;
  campus: string | null;
  degreeType: string | null;
  department: string | null;
  dateRange: [string, string] | null;
  programId: string | null; // Added programId
}

interface GlobalFilterContextType extends GlobalFilterState {
  setAcademicYear: (year: string | null) => void;
  setCampus: (campus: string | null) => void;
  setDegreeType: (degree: string | null) => void;
  setDepartment: (dept: string | null) => void;
  setProgramId: (programId: string | null) => void; // Added setProgramId
  setDateRange: (range: [string, string] | null) => void;
  clearFilters: () => void;
}

const GlobalFilterContext = createContext<GlobalFilterContextType | undefined>(undefined);

export const GlobalFilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [academicYear, setAcademicYear] = useState<string | null>(null);
  const [campus, setCampus] = useState<string | null>(null); // Mocked
  const [degreeType, setDegreeType] = useState<string | null>(null);
  const [department, setDepartment] = useState<string | null>(null); // Mocked
  const [programId, setProgramId] = useState<string | null>(null); // Added programId state
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const clearFilters = () => {
    setAcademicYear(null);
    setCampus(null);
    setDegreeType(null);
    setDepartment(null);
    setProgramId(null); // Clear programId
    setDateRange(null);
  };

  return (
    <GlobalFilterContext.Provider
      value={{
        academicYear,
        campus,
        degreeType,
        department,
        programId, // Provide programId
        dateRange,
        setAcademicYear,
        setCampus,
        setDegreeType,
        setDepartment,
        setProgramId, // Provide setProgramId
        setDateRange,
        clearFilters,
      }}
    >
      {children}
    </GlobalFilterContext.Provider>
  );
};

export const useGlobalFilters = (): GlobalFilterContextType => {
  const context = useContext(GlobalFilterContext);
  if (!context) {
    throw new Error('useGlobalFilters must be used within a GlobalFilterProvider');
  }
  return context;
};
