import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { isLevel, type Level } from '@/content/types';

const STORAGE_KEY = 'ardoiz.niveau';
const DEFAULT_LEVEL: Level = 'CE1';

/**
 * Profil de l'enfant : pour l'instant le niveau scolaire, enregistré sur le
 * téléphone. Le prénom, les récompenses et le compte parent viendront avec
 * Supabase (étape 3).
 */
type ProfileContextValue = {
  level: Level;
  setLevel: (level: Level) => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [level, setLevelState] = useState<Level>(DEFAULT_LEVEL);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (!cancelled && isLevel(saved)) setLevelState(saved);
      })
      .catch(() => {
        // Pas de niveau enregistré : on garde le niveau par défaut.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setLevel = useCallback((next: Level) => {
    setLevelState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      // L'enregistrement peut échouer sans gêner la séance en cours.
    });
  }, []);

  const value = useMemo(() => ({ level, setLevel }), [level, setLevel]);
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile doit être utilisé sous ProfileProvider');
  return ctx;
}
