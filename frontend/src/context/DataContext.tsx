import { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import {
  sampleSchools as initialSchools,
  sampleVerificationHistory as initialHistory,
  type School,
  type VerificationHistory,
} from '@/data/rwandaSchools';
import { getSchoolStats } from '@/data/rwandaSchools';

interface DataContextValue {
  schools: School[];
  verificationHistory: VerificationHistory[];
  stats: ReturnType<typeof getSchoolStats>;
  updateSchool: (id: string, updates: Partial<School>) => void;
  addVerificationHistory: (entry: Omit<VerificationHistory, 'id'>) => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [verificationHistory, setVerificationHistory] =
    useState<VerificationHistory[]>(initialHistory);

  const stats = useMemo(() => getSchoolStats(schools), [schools]);

  const updateSchool = (id: string, updates: Partial<School>) => {
    setSchools((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const addVerificationHistory = (entry: Omit<VerificationHistory, 'id'>) => {
    setVerificationHistory((prev) => [
      ...prev,
      {
        ...entry,
        id: `VH-${String(prev.length + 1).padStart(3, '0')}`,
      },
    ]);
  };

  return (
    <DataContext.Provider
      value={{
        schools,
        verificationHistory,
        stats,
        updateSchool,
        addVerificationHistory,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within a DataProvider');
  }
  return ctx;
}

