import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import type { UniversId } from '@/univers/univers';
import {
  EMPTY_PROGRESS,
  applyMission,
  buyPlot as buyPlotPure,
  refreshDay,
  type MissionResult,
  type MissionReward,
  type Progress,
} from './progress';

const STORAGE_KEY = 'ardoiz.progress';

type ProgressContextValue = {
  progress: Progress;
  recordMission: (result: MissionResult) => MissionReward;
  buyPlot: (universId: UniversId, index: number) => void;
  /** Pour l'espace parent : tout remettre à zéro */
  reset: () => void;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

function isProgress(value: unknown): value is Progress {
  return typeof value === 'object' && value !== null && 'coins' in value && 'mastery' in value;
}

/** Garde le progrès en mémoire et sur le téléphone. Supabase prendra le relais plus tard. */
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  // Dernière valeur connue, pour que recordMission lise l'état à jour sans dépendre du rendu
  const latest = useRef<Progress>(EMPTY_PROGRESS);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        const parsed: unknown = JSON.parse(raw);
        if (isProgress(parsed)) {
          const loaded = refreshDay({ ...EMPTY_PROGRESS, ...parsed });
          latest.current = loaded;
          setProgress(loaded);
        }
      })
      .catch(() => {
        // Rien d'enregistré ou données illisibles : on repart de zéro.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback((next: Progress) => {
    latest.current = next;
    setProgress(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {
      // L'enregistrement peut échouer sans gêner la séance en cours.
    });
  }, []);

  const recordMission = useCallback(
    (result: MissionResult) => {
      const { progress: next, reward } = applyMission(latest.current, result);
      save(next);
      return reward;
    },
    [save],
  );

  const buyPlot = useCallback((universId: UniversId, index: number) => save(buyPlotPure(latest.current, universId, index)), [save]);
  const reset = useCallback(() => save(EMPTY_PROGRESS), [save]);

  const value = useMemo(() => ({ progress, recordMission, buyPlot, reset }), [progress, recordMission, buyPlot, reset]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress doit être utilisé sous ProgressProvider');
  return ctx;
}
