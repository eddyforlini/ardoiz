import type { UniversId } from '@/univers/univers';

/**
 * Progrès de l'enfant : monnaie, série, maîtrise des leçons, autocollants,
 * parcelles du monde. Tout est calculé ici en fonctions pures, le
 * ProgressProvider se charge de l'enregistrer.
 */

export type Mastery = {
  /** Meilleur score, en pourcentage de bonnes réponses au premier essai */
  best: number;
  plays: number;
  lastDay: string;
  /** Jour de la prochaine révision (J+1, J+3, J+7) */
  due: string;
};

/** Un exercice raté au premier essai, à retravailler. Il disparaît après deux réussites. */
export type ErrorEntry = { lessonId: string; count: number; fixed: number; lastDay: string };

export type Progress = {
  coins: number;
  xp: number;
  streak: { count: number; lastDay: string | null };
  mastery: Record<string, Mastery>;
  stickers: string[];
  plots: Partial<Record<UniversId, number[]>>;
  errors: Record<string, ErrorEntry>;
  today: { day: string; good: number; missions: number; kinds: string[]; claimed: string[] };
};

export const EMPTY_PROGRESS: Progress = {
  coins: 0,
  xp: 0,
  streak: { count: 0, lastDay: null },
  mastery: {},
  stickers: [],
  plots: {},
  errors: {},
  today: { day: '', good: 0, missions: 0, kinds: [], claimed: [] },
};

/** Identifiant de la mission faite des erreurs de l'enfant */
export const PIEGES_ID = 'mes-pieges';
export const PIEGES_FIXED_NEEDED = 2;

export const COINS_PER_GOOD = 10;
export const COINS_PERFECT = 20;
export const XP_PER_GOOD = 10;
export const XP_PER_MISSION = 20;
export const QUEST_REWARD = 15;

/** Étapes de Gribouille, par XP */
export const STAGES = [
  { name: 'Bébé', xp: 0, description: 'Il découvre tout.' },
  { name: 'Petit', xp: 100, description: 'Il tient debout tout seul.' },
  { name: 'Grand', xp: 400, description: 'Il connaît plein de choses.' },
  { name: 'Légende', xp: 1000, description: 'On raconte ses exploits.' },
];

export function stageFor(xp: number) {
  let index = 0;
  STAGES.forEach((s, i) => {
    if (xp >= s.xp) index = i;
  });
  const stage = STAGES[index];
  const next = STAGES[index + 1];
  const ratio = next ? (xp - stage.xp) / (next.xp - stage.xp) : 1;
  return { index, stage, next, ratio };
}

/** Autocollants, dans l'ordre où on les gagne. Personnages maison uniquement. */
export const STICKERS: { id: string; emoji: string; name: string }[] = [
  { id: 'crayon', emoji: '✏️', name: 'Crayon doré' },
  { id: 'etoile', emoji: '⭐', name: 'Première étoile' },
  { id: 'cartable', emoji: '🎒', name: 'Cartable magique' },
  { id: 'livre', emoji: '📖', name: 'Livre ouvert' },
  { id: 'fusee', emoji: '🚀', name: 'Fusée des nombres' },
  { id: 'plume', emoji: '🪶', name: 'Plume du poète' },
  { id: 'trophee', emoji: '🏆', name: 'Trophée sans faute' },
  { id: 'cle', emoji: '🗝️', name: 'Clé des mots' },
  { id: 'boussole', emoji: '🧭', name: 'Boussole des leçons' },
  { id: 'eclair', emoji: '⚡', name: 'Éclair du calcul' },
  { id: 'couronne', emoji: '👑', name: 'Couronne de la dictée' },
  { id: 'arc', emoji: '🌈', name: 'Arc-en-ciel' },
  { id: 'loupe', emoji: '🔍', name: 'Loupe curieuse' },
  { id: 'cerf', emoji: '🪁', name: 'Cerf-volant' },
  { id: 'medaille', emoji: '🏅', name: 'Médaille des 7 jours' },
  { id: 'gribouille', emoji: '🎨', name: 'Gribouille en or' },
];

/** Paliers de la série, fêtés sur l'écran des récompenses */
export const STREAK_MILESTONES = [3, 7, 14, 30, 100];

export type Plot = { name: string; cost: number; /** Missions terminées nécessaires, en plus du prix */ missions?: number };

/** Six parcelles par univers, du moins cher au plus cher */
export const PLOTS: Record<UniversId, Plot[]> = {
  classique: [
    { name: 'Cabane', cost: 50 },
    { name: 'Potager', cost: 100 },
    { name: 'Bibliothèque', cost: 150, missions: 3 },
    { name: 'Manège', cost: 200 },
    { name: 'Observatoire', cost: 300, missions: 6 },
    { name: 'Château', cost: 400, missions: 10 },
  ],
  hero: [
    { name: 'Repaire', cost: 50 },
    { name: 'Salle d\'entraînement', cost: 100 },
    { name: 'Labo secret', cost: 150, missions: 3 },
    { name: 'Tour de guet', cost: 200 },
    { name: 'Hangar à jet', cost: 300, missions: 6 },
    { name: 'Quartier général', cost: 400, missions: 10 },
  ],
  manga: [
    { name: 'Jardin zen', cost: 50 },
    { name: 'Stand de ramen', cost: 100 },
    { name: 'Dojo', cost: 150, missions: 3 },
    { name: 'Temple', cost: 200 },
    { name: 'Cerisier géant', cost: 300, missions: 6 },
    { name: 'Tour du dragon', cost: 400, missions: 10 },
  ],
  espace: [
    { name: 'Capsule', cost: 50 },
    { name: 'Serre', cost: 100 },
    { name: 'Laboratoire', cost: 150, missions: 3 },
    { name: 'Antenne', cost: 200 },
    { name: 'Rampe de lancement', cost: 300, missions: 6 },
    { name: 'Station orbitale', cost: 400, missions: 10 },
  ],
  dino: [
    { name: 'Nid', cost: 50 },
    { name: 'Mare', cost: 100 },
    { name: 'Grotte aux fossiles', cost: 150, missions: 3 },
    { name: 'Volcan', cost: 200 },
    { name: 'Forêt de fougères', cost: 300, missions: 6 },
    { name: 'Île aux œufs', cost: 400, missions: 10 },
  ],
  gaming: [
    { name: 'Spawn', cost: 50 },
    { name: 'Atelier', cost: 100 },
    { name: 'Serveur', cost: 150, missions: 3 },
    { name: 'Arène', cost: 200 },
    { name: 'Portail', cost: 300, missions: 6 },
    { name: 'Boss room', cost: 400, missions: 10 },
  ],
  street: [
    { name: 'Mur à graff', cost: 50 },
    { name: 'Rampe', cost: 100 },
    { name: 'Studio', cost: 150, missions: 3 },
    { name: 'Terrain', cost: 200 },
    { name: 'Skatepark', cost: 300, missions: 6 },
    { name: 'Rooftop', cost: 400, missions: 10 },
  ],
  enquete: [
    { name: 'Bureau', cost: 50 },
    { name: 'Archives', cost: 100 },
    { name: 'Labo d\'indices', cost: 150, missions: 3 },
    { name: 'Planque', cost: 200 },
    { name: 'Salle des cartes', cost: 300, missions: 6 },
    { name: 'Agence', cost: 400, missions: 10 },
  ],
};

export type Quest = { id: string; label: string; total: number; done: (p: Progress) => number };

export const QUESTS: Quest[] = [
  { id: 'good5', label: '5 bonnes réponses', total: 5, done: (p) => p.today.good },
  { id: 'mission', label: 'Finir une mission', total: 1, done: (p) => p.today.missions },
  { id: 'kinds3', label: 'Jouer à 3 jeux différents', total: 3, done: (p) => p.today.kinds.length },
];

/** Clé du jour, en heure locale : 2026-10-05 */
export function dayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + n));
}

function daysBetween(a: string, b: string): number {
  const [y1, m1, d1] = a.split('-').map(Number);
  const [y2, m2, d2] = b.split('-').map(Number);
  return Math.round((new Date(y2, m2 - 1, d2).getTime() - new Date(y1, m1 - 1, d1).getTime()) / 86400000);
}

/** Remet les compteurs du jour à zéro si la date a changé */
export function refreshDay(p: Progress, today = dayKey()): Progress {
  if (p.today.day === today) return p;
  return { ...p, today: { day: today, good: 0, missions: 0, kinds: [], claimed: [] } };
}

export function missionsDone(p: Progress): number {
  return Object.values(p.mastery).reduce((n, m) => n + m.plays, 0);
}

export type MissionResult = {
  lessonId: string;
  good: number;
  total: number;
  firstTryErrors: number;
  kinds: string[];
  /** Exercices ratés au premier essai */
  wrongIds: string[];
  /** Exercices réussis au premier essai */
  rightIds: string[];
};

export type MissionReward = {
  coins: number;
  xp: number;
  sticker: (typeof STICKERS)[number] | null;
  questsCompleted: Quest[];
  streak: number;
  stageUp: string | null;
  due: string;
};

/** Applique une mission terminée au progrès, et dit ce que l'enfant a gagné */
export function applyMission(before: Progress, r: MissionResult, today = dayKey()): { progress: Progress; reward: MissionReward } {
  const p = refreshDay(before, today);
  const perfect = r.firstTryErrors === 0;
  const score = Math.round(((r.total - r.firstTryErrors) / Math.max(1, r.total)) * 100);

  // Série : un jour de plus si on a joué hier, inchangée si déjà joué aujourd'hui, sinon on repart à 1 (avec un joker d'un jour)
  let streak = p.streak.count;
  if (p.streak.lastDay !== today) {
    const gap = p.streak.lastDay ? daysBetween(p.streak.lastDay, today) : 99;
    streak = gap <= 2 ? streak + 1 : 1;
  }

  // Révision espacée
  const prev = p.mastery[r.lessonId];
  const plays = (prev?.plays ?? 0) + 1;
  const interval = score < 60 ? 1 : plays === 1 ? 1 : plays === 2 ? 3 : 7;
  const due = addDays(today, interval);
  const mastery: Mastery = { best: Math.max(prev?.best ?? 0, score), plays, lastDay: today, due };

  const coins = r.good * COINS_PER_GOOD + (perfect ? COINS_PERFECT : 0);
  const xp = r.good * XP_PER_GOOD + XP_PER_MISSION;
  const stageUp = stageFor(p.xp + xp).index > stageFor(p.xp).index ? stageFor(p.xp + xp).stage.name : null;

  const sticker = STICKERS.find((s) => !p.stickers.includes(s.id)) ?? null;

  // Journal des pièges : les erreurs entrent, deux réussites de suite les font sortir
  const errors = { ...p.errors };
  for (const id of r.wrongIds) {
    const e = errors[id];
    errors[id] = { lessonId: e?.lessonId ?? r.lessonId, count: (e?.count ?? 0) + 1, fixed: 0, lastDay: today };
  }
  for (const id of r.rightIds) {
    const e = errors[id];
    if (!e) continue;
    if (e.fixed + 1 >= PIEGES_FIXED_NEEDED) delete errors[id];
    else errors[id] = { ...e, fixed: e.fixed + 1 };
  }

  const todayNext = {
    ...p.today,
    good: p.today.good + r.good,
    missions: p.today.missions + 1,
    kinds: [...new Set([...p.today.kinds, ...r.kinds])],
  };
  let next: Progress = {
    ...p,
    coins: p.coins + coins,
    xp: p.xp + xp,
    streak: { count: streak, lastDay: today },
    mastery: r.lessonId === PIEGES_ID ? p.mastery : { ...p.mastery, [r.lessonId]: mastery },
    errors,
    stickers: sticker ? [...p.stickers, sticker.id] : p.stickers,
    today: todayNext,
  };

  const questsCompleted = QUESTS.filter((q) => q.done(next) >= q.total && !next.today.claimed.includes(q.id));
  if (questsCompleted.length) {
    next = {
      ...next,
      coins: next.coins + questsCompleted.length * QUEST_REWARD,
      today: { ...next.today, claimed: [...next.today.claimed, ...questsCompleted.map((q) => q.id)] },
    };
  }

  return { progress: next, reward: { coins: next.coins - p.coins, xp, sticker, questsCompleted, streak, stageUp, due } };
}

/** Peut-on acheter cette parcelle ? Renvoie la raison sinon. */
export function plotStatus(p: Progress, universId: UniversId, index: number): 'owned' | 'ok' | 'coins' | 'missions' {
  const plot = PLOTS[universId][index];
  if ((p.plots[universId] ?? []).includes(index)) return 'owned';
  if (plot.missions && missionsDone(p) < plot.missions) return 'missions';
  if (p.coins < plot.cost) return 'coins';
  return 'ok';
}

export function buyPlot(p: Progress, universId: UniversId, index: number): Progress {
  if (plotStatus(p, universId, index) !== 'ok') return p;
  return {
    ...p,
    coins: p.coins - PLOTS[universId][index].cost,
    plots: { ...p.plots, [universId]: [...(p.plots[universId] ?? []), index] },
  };
}

/** Choisit la mission du jour : d'abord ce qui est à réviser, puis ce qu'on n'a jamais joué */
export function pickMission<T extends { id: string }>(p: Progress, lessons: T[], today = dayKey()): T | undefined {
  const due = lessons.filter((l) => p.mastery[l.id] && p.mastery[l.id].due <= today);
  if (due.length) return due.sort((a, b) => p.mastery[a.id].due.localeCompare(p.mastery[b.id].due))[0];
  const fresh = lessons.find((l) => !p.mastery[l.id]);
  if (fresh) return fresh;
  return [...lessons].sort((a, b) => p.mastery[a.id].due.localeCompare(p.mastery[b.id].due))[0];
}

/** Texte court sur l'état d'une leçon pour la liste de l'accueil */
export function lessonHint(p: Progress, lessonId: string, today = dayKey()): string | null {
  const m = p.mastery[lessonId];
  if (!m) return null;
  if (m.due <= today) return 'À réviser aujourd\'hui';
  const d = daysBetween(today, m.due);
  return `Maîtrise ${m.best} % · retour dans ${d} jour${d > 1 ? 's' : ''}`;
}
