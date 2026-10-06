import { LESSONS } from './bank';
import { lastWord, poemLesson, rhymeKey, wordsLesson } from './generate';
import { POEMS, fold } from './poems';
import { PROGRAMME, type Attendu } from './programme';
import type { Exercise, Lesson, Level } from './types';

/**
 * Du texte à la mission, sans intelligence artificielle. Le texte vient de
 * la photo lue sur le téléphone, ou du parent qui le colle. On reconnaît ce
 * que c'est (calculs, poésie, liste de mots, leçon connue) et on fabrique
 * les jeux par règles, ou on retrouve la leçon déjà prête dans la banque.
 */
export type Recognition =
  | { kind: 'bank'; lesson: Lesson; why: string }
  | { kind: 'generated'; lesson: Lesson; why: string }
  | { kind: 'unknown'; attendu: Attendu | null; nearest: Lesson[]; why: string };

type Op = { a: number; b: number; op: '+' | '-' | '×'; result: number };

const OP_RE = /(\d{1,3})[ \t]*([+\-−×x*:])[ \t]*(\d{1,3})(?:[ \t]*=[ \t]*(\d{1,4}))?/g;

/** Les calculs trouvés dans le texte, avec leur résultat recalculé */
export function findOperations(text: string): Op[] {
  const ops: Op[] = [];
  for (const m of text.matchAll(OP_RE)) {
    const a = Number(m[1]);
    const b = Number(m[3]);
    const sym = m[2];
    if (sym === ':') continue;
    const op: Op['op'] = sym === '+' ? '+' : sym === '-' || sym === '−' ? '-' : '×';
    const result = op === '+' ? a + b : op === '-' ? a - b : a * b;
    if (result < 0 || result > 1000) continue;
    if (!ops.some((o) => o.a === a && o.b === b && o.op === op)) ops.push({ a, b, op, result });
  }
  return ops;
}

function label(o: Op): string {
  return `${o.a} ${o.op} ${o.b}`;
}

function pickOptions(correct: number, pool: number[]): number[] {
  const set = new Set<number>([correct]);
  const near = [correct + 1, correct - 1, correct + 10, correct - 10, correct + 2, ...pool];
  for (const n of near) {
    if (set.size >= 3) break;
    if (n >= 0 && n !== correct) set.add(n);
  }
  const arr = [...set];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function calcAttendu(level: Level, ops: Op[]): string | undefined {
  const mult = ops.some((o) => o.op === '×');
  if (level === 'CP') return 'cp-calc-add';
  if (level === 'CE1') return mult ? 'ce1-calc-tables' : 'ce1-calc-add';
  return undefined;
}

/** Une page de calculs devient une mission : paires, bonne réponse, vrai ou faux, Gribouille à corriger, calcul éclair */
export function calcLesson(input: { ops: Op[]; level: Level; title?: string }): Lesson {
  const ops = input.ops.slice(0, 16);
  const id = `calc-${Date.now().toString(36)}`;
  const results = ops.map((o) => o.result);
  const exercises: Exercise[] = [];

  ops.slice(0, 3).forEach((o, i) => {
    const options = pickOptions(o.result, results);
    exercises.push({
      id: `${id}-choice-${i}`,
      kind: 'choice',
      prompt: `Combien font ${label(o)} ?`,
      options: options.map(String),
      answer: options.indexOf(o.result),
      explain: `${label(o)} = ${o.result}.`,
    });
  });

  if (ops.length >= 4) {
    const uniq = ops.filter((o, i) => ops.findIndex((p) => p.result === o.result) === i).slice(0, 5);
    if (uniq.length >= 3) {
      exercises.push({
        id: `${id}-match`,
        kind: 'match',
        prompt: 'Relie chaque calcul à son résultat avant la fin du chrono',
        seconds: 15 + uniq.length * 7,
        pairs: uniq.map((o) => ({ a: label(o), b: String(o.result) })),
        explain: 'Bats ton record la prochaine fois.',
      });
    }
  }

  ops.slice(3, 5).forEach((o, i) => {
    const wrong = i === 0;
    const shown = wrong ? o.result + (o.result > 5 ? -1 : 1) : o.result;
    exercises.push({
      id: `${id}-tf-${i}`,
      kind: 'truefalse',
      statement: `${label(o)} = ${shown}`,
      answer: !wrong,
      explain: `${label(o)} = ${o.result}.`,
    });
  });

  const fixOp = ops[5] ?? ops[0];
  const wrongResult = fixOp.result + (fixOp.result >= 10 ? 10 : 1);
  exercises.push({
    id: `${id}-fix`,
    kind: 'fix',
    prompt: 'Gribouille s\'est trompé dans son calcul, corrige-le',
    words: [String(fixOp.a), fixOp.op, String(fixOp.b), '=', String(wrongResult)],
    wrongIndex: 4,
    correct: String(fixOp.result),
    distractors: [String(wrongResult), String(fixOp.result + 2)].filter((d) => d !== String(fixOp.result)).slice(0, 2),
    explain: `${label(fixOp)} = ${fixOp.result}.`,
  });

  if (ops.length >= 5) {
    exercises.push({
      id: `${id}-speed`,
      kind: 'speed',
      prompt: 'Calcul éclair',
      seconds: Math.max(30, ops.length * 6),
      target: Math.min(ops.length, Math.max(3, Math.floor(ops.length * 0.6))),
      items: ops.map((o) => ({ q: label(o), a: o.result })),
      explain: 'Pas grave : on y revient demain, ça rentre en répétant.',
    });
  }

  exercises.push({
    id: `${id}-card`,
    kind: 'flashcard',
    prompt: 'Dis le résultat, puis vérifie',
    front: label(ops[ops.length - 1]),
    back: String(ops[ops.length - 1].result),
    explain: `${label(ops[ops.length - 1])} = ${ops[ops.length - 1].result}.`,
  });

  // Un titre précis seulement quand toute la page est du même type, sinon « Mes calculs »
  const only = (op: Op['op']) => ops.every((o) => o.op === op);
  const title = input.title?.trim() || (only('×') ? 'Mes multiplications' : only('+') ? 'Mes additions' : only('-') ? 'Mes soustractions' : 'Mes calculs');
  return {
    id,
    title,
    subject: 'maths',
    source: 'calcul',
    level: input.level,
    notion: `${ops.length} calculs de la leçon`,
    theme: 'calcul',
    attenduId: calcAttendu(input.level, ops),
    summary: `${ops.length} calculs à savoir faire, comme ${label(ops[0])} = ${ops[0].result}.`,
    exercises,
    minutes: Math.max(4, Math.ceil(exercises.length * 0.7)),
  };
}

/** Les lignes utiles du texte, sans les vides ni les numéros d'exercice */
function cleanLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*(\d+[.)]|[-•*])\s*/, '').trim())
    .filter((l) => l.length > 0);
}

/** Vrai quand les lignes ressemblent à des vers : courtes, sans chiffres, avec des rimes */
function looksLikePoem(lines: string[]): boolean {
  if (lines.length < 4) return false;
  const short = lines.filter((l) => l.split(/\s+/).length <= 12 && !/\d/.test(l)).length;
  if (short < lines.length * 0.8) return false;
  const keys = lines.map((l) => rhymeKey(lastWord(l))).filter((k) => k.length > 0);
  const counts = new Map<string, number>();
  keys.forEach((k) => counts.set(k, (counts.get(k) ?? 0) + 1));
  const rhymed = [...counts.values()].filter((n) => n >= 2).reduce((a, b) => a + b, 0);
  return rhymed >= Math.max(2, keys.length * 0.4);
}

/** Vrai quand le texte est une liste de mots : beaucoup d'éléments d'un ou deux mots */
function looksLikeWordList(lines: string[]): string[] | null {
  const items = lines.flatMap((l) => l.split(/[,;]+/)).map((w) => w.trim()).filter((w) => w.length > 1);
  if (items.length < 4) return null;
  const shortItems = items.filter((w) => w.split(/\s+/).length <= 2 && !/\d/.test(w));
  return shortItems.length >= items.length * 0.8 ? shortItems.slice(0, 20) : null;
}

const STOP = new Set('le la les un une des de du et est en a au aux ce ces cette dans sur pour par avec que qui ne pas il elle on nous vous ils elles je tu son sa ses mon ma mes ton ta tes leur leurs ou où'.split(' '));

function tokens(s: string): Set<string> {
  return new Set(fold(s).split(' ').filter((w) => w.length > 2 && !STOP.has(w)));
}

/** Score de ressemblance entre le texte et une leçon de la banque */
function scoreLesson(text: Set<string>, l: Lesson): number {
  const hay = tokens(`${l.title} ${l.notion} ${l.summary} ${l.attendu ?? ''}`);
  let hits = 0;
  hay.forEach((w) => {
    if (text.has(w)) hits += 1;
  });
  return hits;
}

export function analyseText(raw: string, level: Level, title?: string): Recognition {
  const text = raw.trim();
  const lines = cleanLines(text);
  if (!lines.length) return { kind: 'unknown', attendu: null, nearest: [], why: 'Le texte est vide.' };

  // 1. Une poésie connue, retrouvée par son titre ou son premier vers
  const first = fold(lines[0]);
  const known = POEMS.find((p) => fold(p.title) === first || fold(p.lines[0]) === first || (title && fold(p.title) === fold(title)));
  if (known) {
    return { kind: 'generated', lesson: poemLesson({ title: known.title, author: known.author, lines: known.lines, level }), why: `C'est « ${known.title} », je connais le texte exact.` };
  }

  // 2. Des calculs
  const ops = findOperations(text);
  if (ops.length >= 3 && ops.length * 6 >= text.replace(/\s/g, '').length / 4) {
    return { kind: 'generated', lesson: calcLesson({ ops, level, title }), why: `${ops.length} calculs repérés.` };
  }

  // 3. Un poème ou une comptine
  if (looksLikePoem(lines)) {
    return { kind: 'generated', lesson: poemLesson({ title: title?.trim() || 'Ma poésie', lines, level }), why: 'Des vers qui riment : une poésie.' };
  }

  // 4. Une liste de mots
  const words = looksLikeWordList(lines);
  if (words) {
    return { kind: 'generated', lesson: wordsLesson({ title: title?.trim() || undefined, words: words.map((word) => ({ word })), level }), why: `${words.length} mots à apprendre.` };
  }

  // 5. Une leçon déjà dans la banque, au même niveau d'abord
  const toks = tokens(text);
  const ranked = LESSONS.map((l) => ({ l, s: scoreLesson(toks, l) + (l.level === level ? 1 : 0) }))
    .filter((x) => x.s >= 3)
    .sort((a, b) => b.s - a.s);
  if (ranked.length && ranked[0].s >= 4) {
    return { kind: 'bank', lesson: ranked[0].l, why: `Ça ressemble à la leçon « ${ranked[0].l.title} », déjà prête.` };
  }

  // 6. Au moins l'attendu du programme, pour ranger la leçon
  const attendu = PROGRAMME.filter((a) => a.level === level).find((a) => a.keywords.test(text)) ?? null;
  return { kind: 'unknown', attendu, nearest: ranked.slice(0, 3).map((x) => x.l), why: attendu ? `Je reconnais le thème « ${attendu.text} » mais pas d'exercices à fabriquer.` : 'Je ne reconnais pas cette leçon.' };
}
