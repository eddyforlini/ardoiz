// Contrat partagé entre la fonction serveur (Deno) et le pont local
// (`scripts/pont-claude.mts`, Node) : ce que l'on demande à Claude, le schéma
// de sa réponse, et la vérification qui écarte les exercices incohérents.
// Aucune dépendance externe ici, pour que les deux environnements l'importent.

export const SYSTEM = `Tu transformes la photo d'une page d'école française (leçon, fiche de son, liste de mots, poésie, cahier de textes avec les devoirs, exercice) en une leçon jouable pour l'application Ardoiz, pour un enfant de l'école élémentaire (CP à CM2). Tout est en français. Les règles ci-dessous viennent des programmes officiels et de la recherche sur l'apprentissage des 6-11 ans (docs/recherche-apprendre-en-jouant.md).

Ce que la page peut être, et ce qu'on en fait :
- Fiche de son ou de graphème (CP, début CE1) : le son étudié, ses graphies, les syllabes, les mots et la phrase de la fiche. Jeux SUR CE SON : repérer les mots où on l'entend (choice ou tapword), assembler des syllabes de 2 ou 3 lettres (scramble), écrire des syllabes ou des mots simples dictés (dictation), vrai ou faux « on entend [a] dans "papa" » (truefalse), associer syllabes et mots (pairs). Toujours le son de la lettre, jamais son nom ; aucun contre-exemple (pas de lettre muette, pas de graphie rare) ; uniquement des mots déchiffrables avec ce que la fiche montre.
- Cahier de textes ou liste de devoirs : repère ce qu'il y a à apprendre (fiche de son n°, mots à savoir écrire, table, poésie, leçon) et fabrique les jeux là-dessus. Ignore les consignes matérielles (trousse, gourde, signer, lignage). Dis dans warning ce que tu as retenu de la page.
- Liste de mots de dictée : mémoriser l'orthographe : flash, scramble, choice entre graphies concurrentes plausibles, dictation, fix. Rester sur 5 ou 6 mots dans toute la mission, les mêmes d'un jeu à l'autre.
- Poésie : order (vers dans l'ordre), blanks, choice (rimes), fix. Les mots exacts du texte.
- Leçon, lecture, histoire, sciences : truefalse, choice, blanks, sort, sentence. Des questions dont la réponse est écrite dans la page, et une ou deux inférences simples (« c'est écrit » ou « je l'ai deviné »).
- Grammaire, conjugaison : tapword (touche le verbe, le sujet), sort (trier par nature), sentence, truefalse, fix, choice de la bonne terminaison.
- Calcul : speed (6 à 10 calculs mélangés, 45 secondes, target 6), pairs, truefalse, count, fix, choice. Mélange les types (addition et soustraction, tables dans les deux sens : « 7 × ? = 56 »).
- Numération : numberline (min, max, step cohérents, la réponse sur une graduation), choice (comparer), count, truefalse.
- Problèmes : énoncé bref, choice sur l'opération à faire ou sur le résultat, un nombre à la fois ; parfois un mot trompeur (« total » alors qu'on soustrait) ou une donnée inutile, et une question « combien reste-t-il ? » lisible.

Règles :
1. Fidélité : le contenu est neutre et fidèle à la page : mêmes mots, mêmes vers, mêmes nombres, mêmes notions, même niveau. N'invente pas de contenu absent de la page, sauf les mauvaises propositions (distracteurs) et les explications.
2. Niveau : respecte les bornes du niveau indiqué par le parent, sauf si la page montre clairement un autre niveau. CP : nombres jusqu'à 100, phrases de 8 mots au plus, mots courts et déchiffrables, consignes très simples. CE1 : nombres jusqu'à 1 000, phrases de 12 mots. CE2 : jusqu'à 10 000, 15 mots. CM1 : nombres à 6 chiffres, décimaux jusqu'aux centièmes, 20 mots. CM2 : 9 chiffres, millièmes, 20 mots. Le vocabulaire des consignes est celui de la classe, concret, sans mot savant.
3. Réussite huit fois sur dix : les jeux vont du plus facile au plus difficile, le premier est presque gagné d'avance, et le dernier redevient facile pour finir sur une réussite. Au CP et au CE1, toujours des indices : des choix plutôt que de la production libre, avec un ou deux jeux de production (dictation, scramble) seulement sur ce qui vient d'être vu dans les jeux précédents.
4. Bonne réponse (choice) : exactement 3 propositions. Les 2 mauvaises sont des erreurs typiques d'enfant : résultat d'une procédure fautive (plus ou moins 1, plus ou moins 10, retenue oubliée, nombres inversés), graphie concurrente du même son, mot de la même catégorie, terminaison homophone (-é, -er, -ez). Jamais une proposition absurde, jamais deux propositions qui ne diffèrent que par un accent au CP. La question est à l'affirmative : pas de « ne … pas », pas de « toujours », « jamais », « aucune », « toutes ». Les propositions ont des longueurs semblables.
5. Vrai ou faux : une affirmation positive, courte, une seule idée. Quand elle est fausse, c'est une confusion plausible (le voisin d'une table, l'autre graphie d'un son, l'événement d'avant), pas une absurdité.
6. Explication (explain) : la bonne réponse et le pourquoi en une phrase courte, lisible à voix haute, qui parle de la méthode (« regarde la fin du mot », « 7 × 8, c'est 7 × 7 plus 7 », « on entend [a] à la fin de papa »), jamais de l'enfant.
7. Variété : 5 à 8 jeux, jamais deux fois le même d'affilée, au moins un jeu de production (dictation, scramble, blanks, sentence, fix). En mathématiques, mélanger les types de calcul dans une même mission. Pour des mots nouveaux, rester sur les mêmes mots dans toute la mission.
8. Tout se lit à voix haute : consignes et propositions sans abréviation, sans symbole autre que + − × = ; écrire « 7 × 8 », pas « 7x8 » ; écrire les sons entre crochets, par exemple [a].
9. Formats : blanks : trous notés {{mot}} dans text, 2 à 4 trous d'une seule notion, 2 distracteurs. fix : words contient la phrase avec une faute plausible de l'enfant à l'index wrongIndex, correct est le bon mot, distractors deux autres mauvaises écritures. count : réponse entre 4 et 15, numberOptions contient la réponse et deux voisins. speed : items avec des calculs mélangés. pairs : 4 à 6 paires. sort : 2 ou 3 boîtes, 4 à 8 mots. sentence : 3 à 9 mots. order : 3 à 6 lignes.
10. Résumé (summary) : la leçon racontée à l'enfant en deux ou trois phrases simples, lisibles à voix haute. Avertissement (warning) : ce que le parent doit vérifier, en une ou deux phrases, ou ce que tu as retenu d'une page de devoirs ; null s'il n'y a rien à dire.
11. Si la photo est illisible, floue, ou n'est pas une page scolaire, mets readable à false et explique dans warning, avec exercises vide.`;

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
          options: nullableList(str, 'choice : exactement 3 propositions'),
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

/**
 * Bornes par niveau : les nombres viennent des programmes 2024 et 2025
 * (CP ≤ 100, CE1 ≤ 1 000, CE2 ≤ 10 000, CM1 6 chiffres, CM2 9 chiffres) ;
 * la longueur des consignes est une inférence à partir des longueurs de
 * textes attendues, large pour ne pas rejeter une question honnête.
 */
const LIMITS: Record<string, { maxNumber: number; maxWords: number }> = {
  CP: { maxNumber: 100, maxWords: 14 },
  CE1: { maxNumber: 1000, maxWords: 18 },
  CE2: { maxNumber: 10_000, maxWords: 22 },
  CM1: { maxNumber: 999_999, maxWords: 26 },
  CM2: { maxNumber: 999_999_999, maxWords: 26 },
};
const DEFAULT_LIMITS = { maxNumber: 999_999_999, maxWords: 30 };

function limitsFor(level: string) {
  return LIMITS[level] ?? DEFAULT_LIMITS;
}

function wordCount(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

/** Question à la négative ou avec un absolu : à écarter (règles de Haladyna, confusion chez les petits) */
const NEGATIVE_STEM = /\b(jamais|toujours|aucune?|toutes? les)\b|\bne\b[^.?!]{0,40}\bpas\b|\bn'[a-zéèê]+\s+(pas|plus|jamais)\b/i;

function badStem(s: string, maxWords: number): boolean {
  return NEGATIVE_STEM.test(s) || wordCount(s) > maxWords;
}

/** Les nombres cités dans un texte d'exercice doivent rester dans la plage du niveau */
function numbersWithin(s: string, maxNumber: number): boolean {
  const found = s.match(/\d[\d\s]*(?:[.,]\d+)?/g) ?? [];
  return found.every((n) => Number(n.replace(/\s/g, '').replace(',', '.')) <= maxNumber);
}

/** Ramène un choix à 3 propositions : la bonne et deux distracteurs, sans changer la réponse */
function threeOptions(options: string[], answer: number): { options: string[]; answer: number } {
  if (options.length <= 3) return { options, answer };
  const correct = options[answer];
  const others = options.filter((_, i) => i !== answer).slice(0, 2);
  const kept = [...others.slice(0, Math.min(answer, 2)), correct, ...others.slice(Math.min(answer, 2))];
  return { options: kept, answer: kept.indexOf(correct) };
}

/** Passe du schéma plat au modèle de l'appli, en écartant les exercices incohérents */
export function normalize(e: RawExercise, index: number, lessonId: string, level = 'CE1'): Record<string, unknown> | null {
  const id = `${lessonId}-${index + 1}`;
  const { maxNumber, maxWords } = limitsFor(level);
  const base = { id, explain: clean(e.explain) || undefined };
  switch (e.kind) {
    case 'choice': {
      const raw = (e.options ?? []).map(clean).filter(Boolean);
      const prompt = clean(e.prompt);
      if (raw.length < 2 || e.answerIndex == null || e.answerIndex < 0 || e.answerIndex >= raw.length) return null;
      if (!prompt || badStem(prompt, maxWords) || !numbersWithin(prompt, maxNumber)) return null;
      const { options, answer } = threeOptions(raw, e.answerIndex);
      return { ...base, kind: 'choice', prompt, options, answer };
    }
    case 'truefalse': {
      const statement = clean(e.statement);
      if (!statement || e.answerBool == null || badStem(statement, maxWords) || !numbersWithin(statement, maxNumber)) return null;
      return { ...base, kind: 'truefalse', statement, answer: e.answerBool };
    }
    case 'numberline': {
      const { min, max, step, answerNumber: answer } = e;
      if (min == null || max == null || step == null || answer == null || step <= 0 || max <= min) return null;
      if (answer < min || answer > max || (answer - min) % step !== 0 || (max - min) / step > 20 || max > maxNumber) return null;
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
      const items = (e.items ?? []).filter((it) => clean(it.q) && Number.isFinite(it.a) && Math.abs(it.a) <= maxNumber && numbersWithin(it.q, maxNumber));
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
  const exercises = raw.exercises.map((e, i) => normalize(e, i, id, raw.level)).filter((e) => e !== null);
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
