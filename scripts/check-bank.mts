/**
 * Vérifie la banque de leçons : identifiants uniques, réponses dans les
 * options, indices valides, attendus connus, variété des jeux.
 * Lancer : node --experimental-strip-types --no-warnings scripts/check-bank.mts [fichier...]
 */
import { PROGRAMME } from '../src/content/programme.ts';
import type { Exercise, Lesson } from '../src/content/types.ts';

const files = process.argv.slice(2).length ? process.argv.slice(2) : ['../src/content/bank-ce1.ts'];
const errors: string[] = [];
const ids = new Set<string>();
let lessons = 0;
let exercises = 0;

function err(l: Lesson, e: Exercise | null, msg: string) {
  errors.push(`${l.id}${e ? ' / ' + e.id : ''} : ${msg}`);
}

function checkExercise(l: Lesson, e: Exercise) {
  if (ids.has(e.id)) err(l, e, 'identifiant en double');
  ids.add(e.id);
  switch (e.kind) {
    case 'choice':
      if (e.options.length < 2) err(l, e, 'moins de deux options');
      if (e.answer < 0 || e.answer >= e.options.length) err(l, e, 'answer hors des options');
      if (new Set(e.options).size !== e.options.length) err(l, e, 'options en double');
      break;
    case 'numberline':
      if (e.answer < e.min || e.answer > e.max) err(l, e, 'answer hors de la droite');
      if (Math.abs(Math.round((e.answer - e.min) / e.step) * e.step - (e.answer - e.min)) > 1e-9) err(l, e, 'answer pas sur une graduation');
      break;
    case 'scramble':
    case 'dictation':
      if (e.word.trim().length < 2) err(l, e, 'mot trop court');
      break;
    case 'flash':
      if (e.distractors.includes(e.word)) err(l, e, 'le bon mot est dans les distracteurs');
      if (e.distractors.length < 1) err(l, e, 'pas de distracteur');
      break;
    case 'order':
      if (e.lines.length < 3) err(l, e, 'moins de trois lignes');
      break;
    case 'blanks': {
      const holes = [...e.text.matchAll(/\{\{([^}]+)\}\}/g)].map((m) => m[1]);
      if (!holes.length) err(l, e, 'aucun trou {{...}}');
      if (e.distractors.some((d) => holes.includes(d))) err(l, e, 'un distracteur est une bonne réponse');
      break;
    }
    case 'speed':
      if (e.items.length < e.target) err(l, e, 'moins de calculs que la cible');
      if (e.seconds < 15) err(l, e, 'chrono trop court');
      break;
    case 'truefalse':
      break;
    case 'sort':
      if (e.boxes.length < 2) err(l, e, 'moins de deux boîtes');
      e.items.forEach((it) => {
        if (it.box < 0 || it.box >= e.boxes.length) err(l, e, `boîte invalide pour « ${it.word} »`);
      });
      break;
    case 'tapword':
      if (!e.answer.length) err(l, e, 'aucun mot à toucher');
      e.answer.forEach((i) => {
        if (i < 0 || i >= e.words.length) err(l, e, 'index de mot invalide');
      });
      break;
    case 'sentence':
      if (e.words.length < 3) err(l, e, 'phrase trop courte');
      break;
    case 'count':
      if (!e.options.includes(e.answer)) err(l, e, 'answer absent des options');
      if (e.answer < 1 || e.answer > 30) err(l, e, 'trop d\'objets à compter');
      break;
    case 'pairs':
      if (e.pairs.length < 3 || e.pairs.length > 6) err(l, e, 'entre 3 et 6 paires');
      break;
    case 'match':
      if (e.pairs.length < 3 || e.pairs.length > 6) err(l, e, 'entre 3 et 6 paires');
      if (new Set(e.pairs.map((p) => p.b)).size !== e.pairs.length) err(l, e, 'deux paires ont la même réponse');
      break;
    case 'fix':
      if (e.wrongIndex < 0 || e.wrongIndex >= e.words.length) err(l, e, 'wrongIndex invalide');
      if (e.words[e.wrongIndex] === e.correct) err(l, e, 'le mot faux est déjà correct');
      if (e.distractors.includes(e.correct)) err(l, e, 'la correction est dans les distracteurs');
      break;
    case 'quantity':
      if (e.target < 1 || e.target > 99) err(l, e, 'target hors de 1 à 99');
      if (!e.tens && e.target > 19) err(l, e, 'sans barres de dix, target au plus 19');
      break;
    case 'flashcard':
      if (!e.front.trim() || !e.back.trim()) err(l, e, 'carte vide');
      break;
  }
}

for (const f of files) {
  const mod = await import(f.startsWith('/') ? f : `../${f.replace(/^\.\.\//, '')}`);
  const list: Lesson[] = mod.LESSONS ?? mod.default;
  if (!Array.isArray(list)) {
    errors.push(`${f} : pas de tableau LESSONS`);
    continue;
  }
  for (const l of list) {
    lessons += 1;
    if (ids.has(l.id)) errors.push(`${l.id} : identifiant de leçon en double`);
    ids.add(l.id);
    if (!l.attenduId) err(l, null, 'attenduId manquant');
    else if (!PROGRAMME.some((a) => a.id === l.attenduId)) err(l, null, `attendu inconnu ${l.attenduId}`);
    if (l.exercises.length < 5 || l.exercises.length > 12) err(l, null, `${l.exercises.length} exercices (5 à 12 attendus)`);
    if (new Set(l.exercises.map((e) => e.kind)).size < 3) err(l, null, 'moins de trois jeux différents');
    if (!l.summary.trim()) err(l, null, 'résumé vide');
    exercises += l.exercises.length;
    l.exercises.forEach((e) => checkExercise(l, e));
  }
}

console.log(`${lessons} leçons, ${exercises} exercices`);
if (errors.length) {
  console.log(errors.join('\n'));
  process.exit(1);
}
console.log('Banque valide.');
