import { createClient } from '@supabase/supabase-js';

import type { Lesson, Level } from './types';

/**
 * Lien avec le serveur Supabase. Les deux valeurs viennent du fichier .env
 * (EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY). La clé anon est
 * faite pour être dans l'appli ; la clé Anthropic, elle, reste sur le serveur.
 */
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const serverReady = Boolean(url && anonKey);

const supabase = serverReady ? createClient(url!, anonKey!, { auth: { persistSession: false } }) : null;

export type AnalyseResult = { lesson: Lesson; warning: string | null; dropped: number };

function isLesson(value: unknown): value is Lesson {
  if (typeof value !== 'object' || value === null) return false;
  const l = value as Record<string, unknown>;
  return typeof l.id === 'string' && typeof l.title === 'string' && Array.isArray(l.exercises) && l.exercises.length > 0;
}

/** Envoie la photo (base64) au serveur et reçoit une leçon jouable. La photo n'est pas conservée. */
export async function analysePhoto(image: string, mediaType: string, level: Level): Promise<AnalyseResult> {
  if (!supabase) throw new Error('Le serveur n\'est pas encore branché (fichier .env manquant).');
  const { data, error } = await supabase.functions.invoke('analyser-photo', { body: { image, mediaType, level } });
  if (error) {
    // Les erreurs métier (photo illisible...) arrivent avec un message JSON dans la réponse
    const res = (error as { context?: Response }).context;
    if (res && typeof res.json === 'function') {
      const payload = await res.json().catch(() => null);
      if (payload?.error) throw new Error(String(payload.error));
    }
    throw new Error('Le serveur n\'a pas répondu. Vérifie la connexion et réessaie.');
  }
  if (!data || !isLesson(data.lesson)) throw new Error('Réponse du serveur inattendue.');
  return { lesson: data.lesson, warning: data.warning ?? null, dropped: Number(data.dropped ?? 0) };
}
