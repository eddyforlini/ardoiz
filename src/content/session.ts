import type { Exercise, Lesson } from './types';

/**
 * Composition d'une séance (docs/recherche-apprendre-en-jouant.md,
 * décisions 2, 3 et 8) : du facile au difficile, un échauffement gagné
 * d'avance, un escalier qui redescend après deux erreurs d'affilée et
 * quitte la production après trois, et une fin sur une réussite.
 * Fonctions pures, testées par scripts/check-session.mts.
 */

/** Palier d'un jeu : 1 reconnaître avec des indices, 2 compléter ou trier, 3 produire */
export function levelOf(kind: Exercise['kind']): 1 | 2 | 3 {
  switch (kind) {
    case 'choice':
    case 'truefalse':
    case 'count':
    case 'flashcard':
    case 'quantity':
    case 'match':
    case 'pairs':
      return 1;
    case 'blanks':
    case 'sort':
    case 'tapword':
    case 'numberline':
    case 'order':
    case 'flash':
      return 2;
    case 'scramble':
    case 'dictation':
    case 'sentence':
    case 'fix':
    case 'speed':
      return 3;
  }
}

/**
 * Rôle d'une étape : l'échauffement et la clôture ne comptent pas dans le
 * score, la seconde chance rejoue un exercice raté.
 */
export type StepRole = 'warmup' | 'lesson' | 'retry' | 'closing';
export type Step = { exercise: Exercise; role: StepRole };

/** Du facile au difficile, sans défaire l'ordre de la leçon à l'intérieur d'un palier */
export function staircase(exercises: Exercise[]): Exercise[] {
  return exercises
    .map((e, i) => ({ e, i }))
    .sort((a, b) => levelOf(a.e.kind) - levelOf(b.e.kind) || a.i - b.i)
    .map((x) => x.e);
}

/** L'échauffement : un jeu du palier 1 pris dans une leçon acquise, autre que celle du jour */
export function pickWarmup(lesson: Lesson, acquired: Lesson[], rng: () => number = Math.random): Exercise | undefined {
  const pool = acquired.filter((l) => l.id !== lesson.id).flatMap((l) => l.exercises.filter((e) => levelOf(e.kind) === 1));
  if (!pool.length) return undefined;
  return pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))];
}

export function buildQueue(lesson: Lesson, acquired: Lesson[], rng: () => number = Math.random): Step[] {
  const steps: Step[] = [];
  const warmup = pickWarmup(lesson, acquired, rng);
  if (warmup) steps.push({ exercise: warmup, role: 'warmup' });
  for (const exercise of staircase(lesson.exercises)) steps.push({ exercise, role: 'lesson' });
  return steps;
}

/** Après deux erreurs d'affilée : le plus facile de ce qui reste passe devant, le reste de la file ne bouge pas */
export function easeRemaining(queue: Step[], position: number): Step[] {
  const head = queue.slice(0, position + 1);
  const rest = queue.slice(position + 1);
  const lessonRest = rest.filter((s) => s.role === 'lesson');
  const others = rest.filter((s) => s.role !== 'lesson');
  const eased = lessonRest
    .map((s, i) => ({ s, i }))
    .sort((a, b) => levelOf(a.s.exercise.kind) - levelOf(b.s.exercise.kind) || a.i - b.i)
    .map((x) => x.s);
  return [...head, ...eased, ...others];
}

/** Après trois erreurs d'affilée : on quitte la production pour cette séance, on garde les jeux à indices */
export function dropHard(queue: Step[], position: number): Step[] {
  const head = queue.slice(0, position + 1);
  const rest = queue.slice(position + 1).filter((s) => s.role !== 'lesson' || levelOf(s.exercise.kind) < 3);
  return [...head, ...rest];
}

/** Pour finir sur une réussite : le jeu le plus facile déjà réussi du premier coup, rejoué en clôture */
export function pickClosing(queue: Step[], rightIds: string[]): Exercise | undefined {
  const candidates = queue.filter((s) => s.role === 'lesson' && rightIds.includes(s.exercise.id)).map((s) => s.exercise);
  return staircase(candidates)[0];
}

/** Les exercices de la leçon réellement proposés, pour le score */
export function offeredIds(queue: Step[]): string[] {
  return queue.filter((s) => s.role === 'lesson').map((s) => s.exercise.id);
}
