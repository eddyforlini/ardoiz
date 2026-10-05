/**
 * Fabrique des exercices sans intelligence artificielle, à partir de ce que le
 * parent a tapé ou dicté : une liste de mots, une poésie. Des règles simples
 * suffisent pour la plupart des devoirs du primaire, et ça ne coûte rien.
 */
import type { Exercise, Lesson, Level } from './types';

export type WordInput = {
  word: string;
  /** Phrase d'exemple lue avec le mot, optionnelle */
  sentence?: string;
  /** Enregistrement du parent lisant le mot */
  audio?: string;
};

const VOWELS = 'aeiouyàâäéèêëîïôöùûüœ';

type Rule = [RegExp, string];

/** Fautes plausibles, dans l'ordre où on les essaie : sons mal écrits, lettres muettes, doubles consonnes */
const RULES: Rule[] = [
  [/(s|t|d|x|p)$/, ''],
  [/eau/, 'o'],
  [/au/, 'o'],
  [/ai/, 'è'],
  [/è/, 'ai'],
  [/é$/, 'er'],
  [/er$/, 'é'],
  [/ez$/, 'é'],
  [/ent$/, 'ant'],
  [/ant$/, 'ent'],
  [/ain/, 'in'],
  [/in(?![aeiouy])/, 'ain'],
  [/en(?![aeiouy])/, 'an'],
  [/an(?![aeiouy])/, 'en'],
  [/eux$/, 'eu'],
  [/eur$/, 'eure'],
  [/ph/, 'f'],
  [/gn/, 'ni'],
  [/oi/, 'oa'],
  [/qu/, 'k'],
  [/ou/, 'u'],
  [/s(?=[aeiouy])/, 'z'],
  [/j/, 'g'],
  [/ch/, 'sh'],
  [/c(?=[aou])/, 'k'],
  [/([lmnprst])\1/, '$1'],
  [/^h/, ''],
  [/y/, 'i'],
  [/ill/, 'iy'],
  [/(?<=[aeiouy])([lmnrst])(?=[aeiouy])/, '$1$1'],
];

/** Deux mauvaises écritures crédibles du mot (ou moins si le mot est trop court) */
export function misspellings(word: string, count = 2): string[] {
  const w = word.trim();
  const out: string[] = [];
  const push = (s: string) => {
    if (s.length >= 2 && s !== w && !out.includes(s)) out.push(s);
  };
  for (const [re, rep] of RULES) {
    if (out.length >= count) break;
    if (re.test(w)) push(w.replace(re, rep));
  }
  // En dernier recours : deux lettres voisines inversées, au milieu du mot
  for (let i = 1; i < w.length - 2 && out.length < count; i++) {
    if (w[i] !== w[i + 1] && w[i] !== ' ' && w[i + 1] !== ' ') push(w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2));
  }
  return out.slice(0, count);
}

function slug(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24);
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}

/** Liste de mots (dictée de la semaine, mots invariables, vocabulaire) */
export function wordsLesson(input: { title?: string; words: WordInput[]; level: Level }): Lesson {
  const words = input.words.map((w) => ({ ...w, word: w.word.trim() })).filter((w) => w.word.length > 0);
  const id = newId('mots');
  const exercises: Exercise[] = [];

  // Première passe : on apprend chaque mot (lettres en vrac ou mémo-flash)
  words.forEach((w, i) => {
    const simple = w.word.length <= 8 && !/[\s'’-]/.test(w.word);
    if (simple && i % 2 === 0) {
      exercises.push({ id: `${id}-scr-${i}`, kind: 'scramble', word: w.word, audio: w.audio, explain: `Ça s'écrit « ${w.word} ».` });
    } else {
      const d = misspellings(w.word);
      if (d.length >= 1) {
        exercises.push({ id: `${id}-flash-${i}`, kind: 'flash', word: w.word, distractors: d, audio: w.audio, explain: `Regarde bien : « ${w.word} ».` });
      } else {
        exercises.push({ id: `${id}-dict-a-${i}`, kind: 'dictation', word: w.word, sentence: w.sentence, audio: w.audio, explain: `Ça s'écrit « ${w.word} ».` });
      }
    }
  });

  // Deuxième passe : on se teste (bonne écriture ou dictée)
  words.forEach((w, i) => {
    const d = misspellings(w.word);
    if (i % 2 === 0 && d.length >= 2) {
      const options = [w.word, ...d];
      // La bonne réponse change de place d'un mot à l'autre
      const answer = i % 3;
      const rotated = [...options.slice(options.length - answer), ...options.slice(0, options.length - answer)];
      exercises.push({
        id: `${id}-choice-${i}`,
        kind: 'choice',
        prompt: 'Quelle est la bonne écriture ?',
        speak: w.word,
        options: rotated,
        answer: rotated.indexOf(w.word),
        audio: w.audio,
        explain: `La bonne écriture est « ${w.word} ».`,
      });
    } else {
      exercises.push({ id: `${id}-dict-${i}`, kind: 'dictation', word: w.word, sentence: w.sentence, audio: w.audio, explain: `Ça s'écrit « ${w.word} ».` });
    }
  });

  const list = words.map((w) => w.word).join(', ');
  return {
    id,
    title: input.title?.trim() || 'Mots de la semaine',
    subject: 'francais',
    source: 'mots',
    level: input.level,
    theme: 'orthographe',
    notion: 'Orthographier les mots de la dictée',
    attendu: 'Mémoriser l\'orthographe des mots fréquents et des mots invariables.',
    attenduId: input.level === 'CE1' ? 'ce1-ortho-mots' : undefined,
    summary: `${words.length} mot${words.length > 1 ? 's' : ''} à savoir écrire : ${list}.`,
    exercises: exercises.slice(0, 14),
    minutes: Math.max(3, Math.ceil(exercises.length * 0.6)),
  };
}

/** Dernier mot d'un vers, sans la ponctuation */
export function lastWord(line: string): string {
  const cleaned = line.replace(/[\s.,;:!?…»«"()\-—]+$/u, '');
  const parts = cleaned.split(/[\s'’]+/);
  return (parts[parts.length - 1] ?? '').replace(/^[«"(—-]+/u, '');
}

/** Fin sonore approximative d'un mot, pour repérer les rimes : dernière voyelle et ce qui suit */
export function rhymeKey(word: string): string {
  let w = word.toLowerCase().replace(/[^a-zàâäéèêëîïôöùûüœç]/g, '');
  w = w.replace(/s$/, '').replace(/e$/, '');
  const m = w.match(new RegExp(`[${VOWELS}]+[^${VOWELS}]*$`));
  return m ? m[0] : w;
}

function groupLines(lines: string[]): string[][] {
  const groups: string[][] = [];
  for (let i = 0; i < lines.length; i += 4) groups.push(lines.slice(i, i + 4));
  if (groups.length > 1 && groups[groups.length - 1].length === 1) {
    const last = groups.pop()!;
    groups[groups.length - 1].push(...last);
  }
  return groups;
}

/** Remplace le dernier mot du vers par un trou */
function holeLast(line: string): string {
  const w = lastWord(line);
  if (!w) return line;
  const idx = line.lastIndexOf(w);
  return idx < 0 ? line : `${line.slice(0, idx)}{{${w}}}${line.slice(idx + w.length)}`;
}

/** Poésie : vers dans l'ordre, vers à trous, rimes, vers en vrac, puis le poème qui s'efface */
export function poemLesson(input: { title: string; author?: string; lines: string[]; level: Level }): Lesson {
  const lines = input.lines.map((l) => l.trim()).filter((l) => l.length > 0);
  const id = newId(`poesie-${slug(input.title)}`);
  const groups = groupLines(lines);
  const endings = lines.map(lastWord).filter((w) => w.length > 2);
  const exercises: Exercise[] = [];

  groups.forEach((g, gi) => {
    const label = groups.length > 1 ? ` (vers ${gi * 4 + 1} à ${gi * 4 + g.length})` : '';
    const ownEndings = g.map(lastWord);
    const others = endings.filter((w) => !ownEndings.includes(w));
    const pick = (n: number) => others.filter((w, i) => others.indexOf(w) === i).slice(gi * 2, gi * 2 + n);

    if (g.length >= 3) {
      exercises.push({
        id: `${id}-order-${gi}`,
        kind: 'order',
        prompt: `Remets les vers dans l'ordre${label}`,
        lines: g,
        explain: 'Relis le poème à voix haute, puis recommence.',
      });
    }

    // Réciter la suite : on lit un vers, on dit le suivant, on vérifie
    if (g.length >= 2) {
      exercises.push({
        id: `${id}-card-${gi}`,
        kind: 'flashcard',
        prompt: 'Récite le vers qui vient après',
        front: g[0],
        back: g[1],
        explain: 'Relis les deux vers à voix haute, l\'un après l\'autre.',
      });
    }

    let distractors = pick(2);
    if (distractors.length < 2) {
      const extra = g.flatMap((l) => l.split(/[\s'’]+/)).filter((w) => w.length > 3 && !ownEndings.includes(w));
      distractors = [...distractors, ...extra].slice(0, 2);
    }
    exercises.push({
      id: `${id}-blanks-${gi}`,
      kind: 'blanks',
      prompt: `Complète la fin des vers${label}`,
      text: g.map(holeLast).join('\n'),
      distractors,
      explain: 'Les fins de vers riment souvent deux par deux : écoute le son.',
    });

    // Une rime à retrouver, quand deux fins de vers du groupe riment vraiment
    for (let a = 0; a < ownEndings.length; a++) {
      const wa = ownEndings[a];
      const b = ownEndings.findIndex((wb, j) => j !== a && wb !== wa && rhymeKey(wa) === rhymeKey(wb));
      if (!wa || b < 0) continue;
      const wrong = endings.filter((w) => w !== wa && rhymeKey(w) !== rhymeKey(wa)).slice(0, 2);
      if (wrong.length < 2) break;
      const options = [ownEndings[b], ...wrong];
      const answer = gi % 3;
      const rotated = [...options.slice(options.length - answer), ...options.slice(0, options.length - answer)];
      exercises.push({
        id: `${id}-rime-${gi}`,
        kind: 'choice',
        prompt: `Quel mot rime avec « ${wa} » ?`,
        options: rotated,
        answer: rotated.indexOf(ownEndings[b]),
        explain: `« ${wa} » et « ${ownEndings[b]} » finissent par le même son.`,
      });
      break;
    }

    // Un vers à reconstruire mot par mot
    const line = g.find((l) => {
      const n = l.split(/\s+/).length;
      return n >= 4 && n <= 8;
    });
    if (line && gi % 2 === 1) {
      exercises.push({
        id: `${id}-sentence-${gi}`,
        kind: 'sentence',
        prompt: 'Remets les mots du vers dans l\'ordre',
        words: line.split(/\s+/),
        explain: `Le vers est : « ${line} »`,
      });
    }
  });

  // Pour finir : le début du poème qui s'efface, premier et dernier mot de chaque vers
  if (exercises.length > 13) exercises.length = 13;
  const first = groups[0] ?? [];
  if (first.length >= 2) {
    const text = first
      .map((l) => {
        const holed = holeLast(l);
        const m = holed.match(/^([«"(—-]*)([^\s'’]+)(.*)$/u);
        return m && m[2].length > 2 && !holed.startsWith('{{') ? `${m[1]}{{${m[2]}}}${m[3]}` : holed;
      })
      .join('\n');
    exercises.push({
      id: `${id}-efface`,
      kind: 'blanks',
      prompt: 'Le poème qui s\'efface : complète',
      text,
      distractors: endings.filter((w) => !first.map(lastWord).includes(w)).slice(2, 4),
      explain: 'Récite le début à voix haute avant de compléter.',
    });
  }

  const authorPart = input.author?.trim() ? ` de ${input.author.trim()}` : '';
  return {
    id,
    title: input.title.trim() || 'Poésie',
    subject: 'francais',
    source: 'poesie',
    level: input.level,
    theme: 'poesie',
    notion: 'Mémoriser et réciter un poème',
    attendu: 'Dire pour être entendu et compris : mémoriser des textes.',
    attenduId: input.level === 'CE1' ? 'ce1-oral-memoriser' : undefined,
    summary: `« ${input.title.trim()} »${authorPart}, ${lines.length} vers à apprendre par cœur.`,
    exercises: exercises.slice(0, 14),
    minutes: Math.max(4, Math.ceil(exercises.length * 0.7)),
  };
}
