import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { DEFAULT_UNIVERS, UNIVERS, isUniversId, type Univers, type UniversId } from './univers';

const STORAGE_KEY = 'ardoiz.univers';

type UniversContextValue = {
  univers: Univers;
  setUniversId: (id: UniversId) => void;
  /** Vrai tant que le choix enregistré n'a pas été relu */
  loading: boolean;
};

const UniversContext = createContext<UniversContextValue | null>(null);

export function UniversProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<UniversId>(DEFAULT_UNIVERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (!cancelled && isUniversId(saved)) setId(saved);
      })
      .catch(() => {
        // Pas de choix enregistré : on garde l'univers par défaut.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setUniversId = useCallback((next: UniversId) => {
    setId(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      // L'enregistrement peut échouer sans gêner la séance en cours.
    });
  }, []);

  const value = useMemo(
    () => ({ univers: UNIVERS[id], setUniversId, loading }),
    [id, setUniversId, loading],
  );

  return <UniversContext.Provider value={value}>{children}</UniversContext.Provider>;
}

export function useUnivers(): UniversContextValue {
  const ctx = useContext(UniversContext);
  if (!ctx) throw new Error('useUnivers doit être utilisé sous UniversProvider');
  return ctx;
}
