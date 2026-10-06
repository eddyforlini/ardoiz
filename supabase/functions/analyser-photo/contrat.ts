// Contrat partagé entre la fonction serveur (Deno) et le pont local
// (`scripts/pont-claude.mts`, Node) : ce que l'on demande à Claude, le schéma
// de sa réponse, et la vérification qui écarte les exercices incohérents.
// Aucune dépendance externe ici, pour que les deux environnements l'importent.

export const SYSTEM = `Tu transformes la photo d'une page d'école française (leçon, liste de mots, poésie, exercice, cahier) en une leçon jouable pour l'application Ardoiz. Tout est en français.

Règles :
- Le contenu est neutre et fidèle à la page : mêmes mots, mêmes vers, mêmes notions, même niveau. N'invente pas de contenu absent de la page, sauf les mauvaises propositions (distracteurs) et les explications.
- Une erreur n'est jamais grave : chaque exercice a une explication courte, concrète et encourageante.
- Varie les jeux : 5 à 8 exercices, du plus facile au plus difficile, jamais deux fois le même jeu à la suite.
- Jeux selon la page : poésie → order (vers dans l'ordre), blanks, choice (rimes), fix. Mots de dictée → scramble, flash, dictation, choice (bonne écriture), fix. Grammaire ou conjugaison → tapword, sort, sentence, truefalse, fix. Calcul → speed (6 à 10 calculs, 45 secondes, target 6), pairs, truefalse, count, fix. Numération → numberline (min, max, step cohérents, answer sur une graduation), choice (comparer), count, truefalse. Leçon ou lecture → truefalse, choice, blanks, sort, sentence.
- Pour blanks, les trous sont écrits {{mot}} dans text, avec 2 à 4 trous et 2 distracteurs.
- Pour fix, words contient la phrase avec une faute plausible de l'enfant à l'index wrongIndex, correct est le bon mot, distractors deux autres mauvaises écritures.
- Pour count, answer entre 4 et 15, numberOptions contient la réponse et deux voisins.
- Niveau : adapte la difficulté au niveau indiqué par le parent, sauf si la page montre clairement un autre niveau.
- Si la photo est illisible, floue, ou n'est pas une page scolaire, mets readable à false et explique dans warning, avec exercises vide.`;

export const KINDS = ['choice', 'truefalse', 'numberline', 'scramble', 'flash', 'order', 'blanks', 'speed', 'sort', 'tapword', 'sentence', 'dictation', 'count', 'pairs', 'fix'] as const;
export const SUBJECTS = ['maths', 'francais'] as const;
export const SOURCES = ['poesie', 'mots', 'lecon', 'calcul', 'numeration', 'grammaire', 'lecture'] as const;
export const LEVELS = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e'] as const;

/** Un exercice tel que Claude le renvoie : un `kind` et seulement les champs utiles à ce jeu, les autres à null */
export type RawExercise = {
  kind: (typeof KINDS)[number];
  explain: string;
  prompt: string | null;
  options: string[] | null;
  answerIndex: number | null;
  statement: string | null;
  answerBool: boolean | null;
  min: number | null;
  max: number | null;
  step: number | null;
  answerNumber: number | null;
  word: string | null;
  distractors: string[] | null;
  lines: string[] | null;
  text: string | null;
  items: { q: string; a: number }[] | null;
  seconds: number | null;
  target: number | null;
  boxes: string[] | null;
  sortItems: { word: string; box: number }[] | null;
  words: string[] | null;
  answerIndexes: number[] | null;
  sentence: string | null;
  emoji: string | null;
  numberOptions: number[] | null;
  pairs: { a: string; b: string }[] | null;
  wrongIndex: number | null;
  correct: string | null;
};

export type RawLesson = {
  title: string;
  subject: (typeof SUBJECTS)[number];
  source: (typeof SOURCES)[number];
  level: (typeof LEVELS)[number];
  notion: string;
  attendu: string | null;
  summary: string;
  minutes: number;
  exercises: RawExercise[];
  readable: boolean;
  warning: string | null;
};

const nullable = (type: string, description?: string) => ({ type: [type, 'null'], ...(description ? { description } : {}) });
const nullableList = (items: Record<string, unknown>, description?: string) => ({ type: ['array', 'null'], items, ...(description ? { description } : {}) });
const str = { type: 'string' };
const int = { type: 'integer' };

/**
 * Le même schéma que `LessonSchema` (zod) dans index.ts, en JSON Schema, pour
 * le mode headless de Claude Code (`--json-schema`). Garder les deux alignés.
 */
export const LESSON_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string', description: 'Titre court, comme le parent nommerait la leçon' },
    subject: { type: 'string', enum: [...SUBJECTS] },
    source: { type: 'string', enum: [...SOURCES], description: 'Type de page photographiée' },
    level: { type: 'string', enum: [...LEVELS] },
    notion: { type: 'string', description: 'La notion travaillée, en une ligne' },
    attendu: nullable('string', 'Attendu du programme officiel si tu le connais, sinon null'),
    summary: { type: 'string', description: "La leçon racontée à l'enfant en deux ou trois phrases simples" },
    minutes: int,
    exercises: {
      type: 'array',
      maxItems: 8,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          kind: { type: 'string', enum: [...KINDS] },
          explain: { type: 'string', description: 'Explication courte et bienveillante montrée après une erreur' },
          prompt: nullable('string', 'Consigne (choice, numberline, order, blanks, speed, sort, tapword, sentence, count, pairs, fix)'),
          options: nullableList(str, 'choice : 2 à 4 propositions'),
          answerIndex: nullable('integer', 'choice : index de la bonne proposition'),
          statement: nullable('string', 'truefalse : affirmation'),
          answerBool: nullable('boolean', 'truefalse : vrai ou faux'),
          min: nullable('integer'),
          max: nullable('integer'),
          step: nullable('integer'),
          answerNumber: nullable('integer', 'numberline ou count : réponse'),
          word: nullable('string', 'scramble, flash, dictation : le mot'),
          distractors: nullableList(str, 'flash, blanks, fix : mauvaises propositions'),
          lines: nullableList(str, 'order : lignes dans le bon ordre'),
          text: nullable('string', 'blanks : texte avec les trous notés {{mot}}, retours à la ligne autorisés'),
          items: nullableList({ type: 'object', additionalProperties: false, properties: { q: str, a: int }, required: ['q', 'a'] }, 'speed : calculs et résultats'),
          seconds: nullable('integer'),
          target: nullable('integer'),
          boxes: nullableList(str, 'sort : noms des boîtes'),
          sortItems: nullableList({ type: 'object', additionalProperties: false, properties: { word: str, box: int }, required: ['word', 'box'] }, 'sort : mot et index de boîte'),
          words: nullableList(str, 'tapword, sentence, fix : la phrase mot par mot'),
          answerIndexes: nullableList(int, 'tapword : index des mots à toucher'),
          sentence: nullable('string', 'dictation : phrase de contexte'),
          emoji: nullable('string', 'count : objet à compter (un emoji)'),
          numberOptions: nullableList(int, 'count : 3 nombres proposés dont la réponse'),
          pairs: nullableList({ type: 'object', additionalProperties: false, properties: { a: str, b: str }, required: ['a', 'b'] }, 'pairs : 4 à 6 paires'),
          wrongIndex: nullable('integer', 'fix : index du mot faux dans words'),
          correct: nullable('string', 'fix : la correction'),
        },
        required: ['kind', 'explain', 'prompt', 'options', 'answerIndex', 'statement', 'answerBool', 'min', 'max', 'step', 'answerNumber', 'word', 'distractors', 'lines', 'text', 'items', 'seconds', 'target', 'boxes', 'sortItems', 'words', 'answerIndexes', 'sentence', 'emoji', 'numberOptions', 'pairs', 'wrongIndex', 'correct'],
      },
    },
    readable: { type: 'boolean', description: "false si la photo est illisible ou n'est pas une page d'école" },
    warning: nullable('string', 'Ce que le parent doit vérifier, ou pourquoi la photo ne convient pas'),
  },
  required: ['title', 'subject', 'source', 'level', 'notion', 'attendu', 'summary', 'minutes', 'exercises', 'readable', 'warning'],
};

function clean(s: string | null | undefined): string {
  return (s ?? '').trim();
}

/** Passe du schéma plat au modèle de l'appli, en écartant les exercices incohérents */
export function normalize(e: RawExercise, index: number, lessonId: string): Record<string, unknown> | null {
  const id = `${lessonId}-${index + 1}`;
  const base = { id, explain: clean(e.explain) || undefined };
  switch (e.kind) {
    case 'choice': {
      const options = (e.options ?? []).map(clean).filter(Boolean);
      if (options.length < 2 || e.answerIndex == null || e.answerIndex < 0 || e.answerIndex >= options.length) return null;
      return { ...base, kind: 'choice', prompt: clean(e.prompt), options, answer: e.answerIndex };
    }
    case 'truefalse':
      if (!clean(e.statement) || e.answerBool == null) return null;
      return { ...base, kind: 'truefalse', statement: clean(e.statement), answer: e.answerBool };
    case 'numberline': {
      const { min, max, step, answerNumber: answer } = e;
      if (min == null || max == null || step == null || answer == null || step <= 0 || max <= min) return null;
      if (answer < min || answer > max || (answer - min) % step !== 0 || (max - min) / step > 20) return null;
      return { ...base, kind: 'numberline', prompt: clean(e.prompt) || `Place le nombre ${answer}`, min, max, step, answer };
    }
    case 'scramble': {
      const word = clean(e.word).toLowerCase();
      if (word.length < 3 || word.length > 12 || /\s/.test(word)) return null;
      return { ...base, kind: 'scramble', word };
    }
    case 'flash': {
      const word = clean(e.word);
      const distractors = (e.distractors ?? []).map(clean).filter((d) => d && d !== word);
      if (!word || distractors.length < 1) return null;
      return { ...base, kind: 'flash', word, distractors: distractors.slice(0, 3) };
    }
    case 'order': {
      const lines = (e.lines ?? []).map(clean).filter(Boolean);
      if (lines.length < 3 || lines.length > 6) return null;
      return { ...base, kind: 'order', prompt: clean(e.prompt) || 'Remets les lignes dans l\'ordre', lines };
    }
    case 'blanks': {
      const text = clean(e.text);
      const holes = text.match(/\{\{(.+?)\}\}/g) ?? [];
      if (holes.length < 1 || holes.length > 5) return null;
      return { ...base, kind: 'blanks', prompt: clean(e.prompt) || 'Complète le texte', text, distractors: (e.distractors ?? []).map(clean).filter(Boolean).slice(0, 4) };
    }
    case 'speed': {
      const items = (e.items ?? []).filter((it) => clean(it.q) && Number.isFinite(it.a));
      if (items.length < 4) return null;
      const seconds = e.seconds && e.seconds >= 20 ? Math.min(e.seconds, 90) : 45;
      const target = e.target && e.target > 0 ? Math.min(e.target, items.length) : Math.max(3, Math.floor(items.length * 0.6));
      return { ...base, kind: 'speed', prompt: clean(e.prompt) || 'Calcul éclair', items, seconds, target };
    }
    case 'sort': {
      const boxes = (e.boxes ?? []).map(clean).filter(Boolean);
      const items = (e.sortItems ?? []).filter((it) => clean(it.word) && it.box >= 0 && it.box < boxes.length);
      if (boxes.length < 2 || boxes.length > 3 || items.length < 4) return null;
      return { ...base, kind: 'sort', prompt: clean(e.prompt) || 'Range chaque mot dans la bonne boîte', boxes, items: items.slice(0, 8) };
    }
    case 'tapword': {
      const words = (e.words ?? []).map(clean).filter(Boolean);
      const answer = (e.answerIndexes ?? []).filter((i) => i >= 0 && i < words.length);
      if (words.length < 3 || answer.length < 1) return null;
      return { ...base, kind: 'tapword', prompt: clean(e.prompt) || 'Touche le bon mot', words, answer };
    }
    case 'sentence': {
      const words = (e.words ?? []).map(clean).filter(Boolean);
      if (words.length < 3 || words.length > 9) return null;
      return { ...base, kind: 'sentence', prompt: clean(e.prompt) || 'Remets la phrase dans l\'ordre', words };
    }
    case 'dictation': {
      const word = clean(e.word);
      if (!word) return null;
      return { ...base, kind: 'dictation', word, sentence: clean(e.sentence) || undefined };
    }
    case 'count': {
      const answer = e.answerNumber;
      if (answer == null || answer < 2 || answer > 20) return null;
      const options = [...new Set([...(e.numberOptions ?? []), answer])].filter((n) => n > 0).slice(0, 3);
      if (options.length < 2) return null;
      return { ...base, kind: 'count', prompt: clean(e.prompt) || 'Combien y a-t-il d\'objets ?', emoji: clean(e.emoji) || '🍎', answer, options: options.sort((a, b) => a - b) };
    }
    case 'pairs': {
      const pairs = (e.pairs ?? []).filter((p) => clean(p.a) && clean(p.b));
      if (pairs.length < 3) return null;
      return { ...base, kind: 'pairs', prompt: clean(e.prompt) || 'Retrouve les paires', pairs: pairs.slice(0, 6) };
    }
    case 'fix': {
      const words = (e.words ?? []).map(clean).filter(Boolean);
      const correct = clean(e.correct);
      if (words.length < 2 || e.wrongIndex == null || e.wrongIndex < 0 || e.wrongIndex >= words.length || !correct) return null;
      const distractors = (e.distractors ?? []).map(clean).filter((d) => d && d !== correct).slice(0, 2);
      return { ...base, kind: 'fix', prompt: clean(e.prompt) || 'Gribouille a fait une faute, corrige-le', words, wrongIndex: e.wrongIndex, correct, distractors };
    }
    default:
      return null;
  }
}

export type BuiltResponse = { status: number; body: Record<string, unknown> };

/**
 * De la réponse brute de Claude à la réponse HTTP : photo illisible (422),
 * trop peu d'exercices valides (422), ou la leçon prête (200). Même réponse
 * depuis la fonction serveur et depuis le pont local.
 */
export function buildResponse(raw: RawLesson): BuiltResponse {
  if (!raw.readable) return { status: 422, body: { error: clean(raw.warning) || 'La photo est illisible ou n\'est pas une page d\'école.' } };

  const id = `photo-${Date.now().toString(36)}`;
  const exercises = raw.exercises.map((e, i) => normalize(e, i, id)).filter((e) => e !== null);
  if (exercises.length < 3) return { status: 422, body: { error: 'Pas assez d\'exercices utilisables, réessaie avec une photo plus nette.' } };

  return {
    status: 200,
    body: {
      lesson: {
        id,
        title: clean(raw.title) || 'Leçon photographiée',
        subject: raw.subject,
        source: raw.source,
        level: raw.level,
        notion: clean(raw.notion),
        attendu: clean(raw.attendu) || undefined,
        summary: clean(raw.summary),
        minutes: Math.max(3, Math.min(12, raw.minutes || exercises.length)),
        exercises,
      },
      warning: clean(raw.warning) || null,
      dropped: raw.exercises.length - exercises.length,
    },
  };
}
