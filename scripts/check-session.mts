/**
 * Vérifie la composition d'une séance (src/content/session.ts) : paliers,
 * escalier du facile au difficile, échauffement, allègement après deux
 * erreurs, abandon de la production après trois, clôture sur une réussite.
 * Lancer : node --experimental-strip-types --no-warnings --import ./scripts/node-ts-loader.mjs scripts/check-session.mts
 */
import { buildQueue, dropHard, easeRemaining, levelOf, offeredIds, pickClosing, staircase, type Step } from '../src/content/session.ts';
import type { Exercise, Lesson } from '../src/content/types.ts';

const failures: string[] = [];
function expect(name: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`${ok ? 'ok ' : 'KO '} ${name} → ${JSON.stringify(got)}${ok ? '' : ` (attendu ${JSON.stringify(want)})`}`);
  if (!ok) failures.push(name);
}

const ex = (id: string, kind: Exercise['kind']): Exercise => ({ id, kind } as unknown as Exercise);
const lesson = {
  id: 'L', title: 'L', subject: 'maths', source: 'calcul', level: 'CE1', notion: '', summary: '', minutes: 5,
  exercises: [ex('d', 'dictation'), ex('c1', 'choice'), ex('b', 'blanks'), ex('t', 'truefalse'), ex('s', 'scramble'), ex('o', 'order')],
} as unknown as Lesson;
const acquired = [{ ...lesson, id: 'A', exercises: [ex('a-choice', 'choice'), ex('a-dict', 'dictation')] } as unknown as Lesson];

expect('paliers', ['choice', 'blanks', 'dictation'].map((k) => levelOf(k as Exercise['kind'])), [1, 2, 3]);
expect('escalier : facile → difficile, ordre conservé dans un palier', staircase(lesson.exercises).map((e) => e.id), ['c1', 't', 'b', 'o', 'd', 's']);

const queue = buildQueue(lesson, acquired, () => 0);
expect('échauffement : un jeu facile d\'une leçon acquise, puis la leçon', queue.map((s) => `${s.role}:${s.exercise.id}`), ['warmup:a-choice', 'lesson:c1', 'lesson:t', 'lesson:b', 'lesson:o', 'lesson:d', 'lesson:s']);
expect('sans leçon acquise : pas d\'échauffement', buildQueue(lesson, [], () => 0)[0].role, 'lesson');
expect('exercices comptés : ceux de la leçon seulement', offeredIds(queue).length, 6);

// Après deux erreurs d'affilée (position 2 = « t »), le plus facile de ce qui reste passe devant
const mixed: Step[] = [{ exercise: ex('x', 'choice'), role: 'lesson' }, { exercise: ex('y', 'scramble'), role: 'lesson' }, { exercise: ex('z', 'dictation'), role: 'lesson' }, { exercise: ex('w', 'truefalse'), role: 'lesson' }, { exercise: ex('x', 'choice'), role: 'retry' }];
expect('après deux erreurs : le facile restant passe devant, les secondes chances restent à la fin', easeRemaining(mixed, 1).map((s) => `${s.role}:${s.exercise.id}`), ['lesson:x', 'lesson:y', 'lesson:w', 'lesson:z', 'retry:x']);
expect('après trois erreurs : plus de production, les jeux à indices restent', dropHard(mixed, 1).map((s) => `${s.role}:${s.exercise.id}`), ['lesson:x', 'lesson:y', 'lesson:w', 'retry:x']);

// Clôture : le plus facile des exercices réussis du premier coup
expect('clôture : le jeu facile déjà réussi', pickClosing(queue, ['b', 't', 's'])?.id, 't');
expect('clôture impossible sans réussite', pickClosing(queue, []), undefined);

console.log(failures.length ? `${failures.length} problème(s)` : 'Séance valide');
process.exit(failures.length ? 1 : 0);
