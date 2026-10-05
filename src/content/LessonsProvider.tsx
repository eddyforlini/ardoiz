import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { LESSONS } from './bank';
import type { Lesson } from './types';

const STORAGE_KEY = 'ardoiz.lessons';

/**
 * Toutes les leçons jouables : la banque de départ, plus celles créées à
 * partir des photos, enregistrées sur le téléphone. Supabase prendra le
 * relais pour les comptes et la classe partagée.
 */
type LessonsContextValue = {
  lessons: Lesson[];
  /** Leçons venues des photos uniquement */
  custom: Lesson[];
  findLesson: (id: string | undefined) => Lesson | undefined;
  addLesson: (lesson: Lesson) => void;
  removeLesson: (id: string) => void;
};

const LessonsContext = createContext<LessonsContextValue | null>(null);

function isLessonList(value: unknown): value is Lesson[] {
  return Array.isArray(value) && value.every((l) => l && typeof l.id === 'string' && Array.isArray(l.exercises));
}

export function LessonsProvider({ children }: { children: ReactNode }) {
  const [custom, setCustom] = useState<Lesson[]>([]);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        const parsed: unknown = JSON.parse(raw);
        if (isLessonList(parsed)) setCustom(parsed);
      })
      .catch(() => {
        // Rien d'enregistré : seulement la banque de départ.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback((next: Lesson[]) => {
    setCustom(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {
      // L'enregistrement peut échouer sans gêner la séance en cours.
    });
  }, []);

  const addLesson = useCallback(
    (lesson: Lesson) => save([lesson, ...custom.filter((l) => l.id !== lesson.id)]),
    [custom, save],
  );
  const removeLesson = useCallback((id: string) => save(custom.filter((l) => l.id !== id)), [custom, save]);

  const value = useMemo(() => {
    const lessons = [...custom, ...LESSONS];
    return {
      lessons,
      custom,
      findLesson: (id: string | undefined) => lessons.find((l) => l.id === id),
      addLesson,
      removeLesson,
    };
  }, [custom, addLesson, removeLesson]);

  return <LessonsContext.Provider value={value}>{children}</LessonsContext.Provider>;
}

export function useLessons(): LessonsContextValue {
  const ctx = useContext(LessonsContext);
  if (!ctx) throw new Error('useLessons doit être utilisé sous LessonsProvider');
  return ctx;
}
