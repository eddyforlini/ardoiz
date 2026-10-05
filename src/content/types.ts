/**
 * Modèle de contenu scolaire. Tout ici est neutre : aucune couleur, aucun
 * univers, aucune mise en scène. L'univers habille au moment de l'affichage.
 */

export type Subject = 'maths' | 'francais';

/** Type de page photographiée, qui décide des jeux proposés */
export type SourceKind = 'poesie' | 'mots' | 'lecon' | 'calcul' | 'numeration' | 'grammaire' | 'lecture';

export type Level = 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2' | '6e' | '5e' | '4e' | '3e';

/** Tous les niveaux, dans l'ordre de l'école */
export const LEVELS: Level[] = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e'];

export const LEVEL_GROUPS: { label: string; levels: Level[] }[] = [
  { label: 'École élémentaire', levels: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'] },
  { label: 'Collège', levels: ['6e', '5e', '4e', '3e'] },
];

export function isLevel(value: unknown): value is Level {
  return typeof value === 'string' && (LEVELS as string[]).includes(value);
}

/** Thème : le rayon de la bibliothèque où le parent retrouve la leçon */
export type Theme =
  | 'nombres'
  | 'calcul'
  | 'grandeurs'
  | 'geometrie'
  | 'orthographe'
  | 'grammaire'
  | 'conjugaison'
  | 'vocabulaire'
  | 'lecture'
  | 'poesie'
  | 'autre';

export const THEMES: Record<Subject, { id: Theme; label: string; emoji: string }[]> = {
  maths: [
    { id: 'nombres', label: 'Nombres', emoji: '🔢' },
    { id: 'calcul', label: 'Calcul', emoji: '➕' },
    { id: 'grandeurs', label: 'Grandeurs et mesures', emoji: '📏' },
    { id: 'geometrie', label: 'Géométrie', emoji: '📐' },
    { id: 'autre', label: 'Autres leçons', emoji: '📘' },
  ],
  francais: [
    { id: 'orthographe', label: 'Orthographe et dictée', emoji: '✏️' },
    { id: 'grammaire', label: 'Grammaire', emoji: '🧩' },
    { id: 'conjugaison', label: 'Conjugaison', emoji: '⏳' },
    { id: 'vocabulaire', label: 'Vocabulaire', emoji: '💬' },
    { id: 'lecture', label: 'Lecture', emoji: '📖' },
    { id: 'poesie', label: 'Poésie', emoji: '🎭' },
    { id: 'autre', label: 'Autres leçons', emoji: '📕' },
  ],
};

export function themeLabel(subject: Subject, theme: Theme) {
  return THEMES[subject].find((t) => t.id === theme) ?? THEMES[subject][THEMES[subject].length - 1];
}

type Base = {
  id: string;
  /** Explication courte montrée après une erreur */
  explain?: string;
  /** Enregistrement du parent lisant le mot (adresse d'un fichier sur le téléphone), à la place de la voix de synthèse */
  audio?: string;
};

/** Question à choix : comparer, bonne orthographe, vrai ou faux, chasse aux rimes */
export type ChoiceExercise = Base & {
  kind: 'choice';
  prompt: string;
  options: string[];
  /** Index de la bonne réponse dans options */
  answer: number;
  /** Texte lu à voix haute si différent du prompt (par exemple le mot à reconnaître) */
  speak?: string;
};

/** Placer un nombre sur une droite graduée */
export type NumberlineExercise = Base & {
  kind: 'numberline';
  prompt: string;
  min: number;
  max: number;
  step: number;
  answer: number;
};

/** Lettres en vrac : reconstituer un mot dit à voix haute */
export type ScrambleExercise = Base & {
  kind: 'scramble';
  word: string;
};

/** Mémo-flash : le mot apparaît puis disparaît, il faut retrouver la bonne écriture */
export type FlashExercise = Base & {
  kind: 'flash';
  word: string;
  /** Mauvaises écritures proposées à côté de la bonne */
  distractors: string[];
};

/** Remettre des lignes dans l'ordre (vers d'un poème, étapes d'une histoire) */
export type OrderExercise = Base & {
  kind: 'order';
  prompt: string;
  lines: string[];
};

/** Texte à trous : les trous sont notés {{mot}} dans le texte */
export type BlanksExercise = Base & {
  kind: 'blanks';
  prompt: string;
  text: string;
  /** Mots en plus pour brouiller les pistes */
  distractors: string[];
};

/** Calcul éclair : le plus de bonnes réponses avant la fin du temps */
export type SpeedExercise = Base & {
  kind: 'speed';
  prompt: string;
  items: { q: string; a: number }[];
  seconds: number;
  /** Nombre de bonnes réponses pour réussir l'exercice */
  target: number;
};

/** Vrai ou faux : une affirmation, deux boutons, un petit chrono */
export type TrueFalseExercise = Base & {
  kind: 'truefalse';
  statement: string;
  answer: boolean;
};

/** Trier : chaque mot va dans la bonne boîte */
export type SortExercise = Base & {
  kind: 'sort';
  prompt: string;
  boxes: string[];
  /** Mot et index de la boîte où il doit aller */
  items: { word: string; box: number }[];
};

/** Toucher le bon mot dans une phrase (le verbe, le sujet, le nom...) */
export type TapWordExercise = Base & {
  kind: 'tapword';
  prompt: string;
  words: string[];
  /** Index des mots à toucher dans words */
  answer: number[];
};

/** Phrase à reconstruire : remettre les mots dans l'ordre */
export type SentenceExercise = Base & {
  kind: 'sentence';
  prompt: string;
  words: string[];
};

/** Dictée : on entend le mot, on l'écrit au clavier */
export type DictationExercise = Base & {
  kind: 'dictation';
  word: string;
  /** Phrase lue pour donner le contexte, optionnelle */
  sentence?: string;
};

/** Dénombrer : compter les objets affichés */
export type CountExercise = Base & {
  kind: 'count';
  prompt: string;
  /** Objet affiché (un emoji), remplacé par l'univers quand il en a un */
  emoji: string;
  answer: number;
  options: number[];
};

/** Memory : retrouver les paires (calcul et résultat, mot et définition...) */
export type PairsExercise = Base & {
  kind: 'pairs';
  prompt: string;
  pairs: { a: string; b: string }[];
};

/** Corrige Gribouille : il a écrit une bêtise, on touche le mot faux puis on choisit la correction */
export type FixExercise = Base & {
  kind: 'fix';
  prompt: string;
  /** Ce que Gribouille a écrit, mot par mot, avec l'erreur dedans */
  words: string[];
  /** Index du mot faux */
  wrongIndex: number;
  /** Corrections proposées, la bonne est `correct` */
  correct: string;
  distractors: string[];
};

/** Carte recto-verso auto-évaluée : la question, puis la réponse, et l'enfant dit s'il savait */
export type FlashcardExercise = Base & {
  kind: 'flashcard';
  prompt: string;
  front: string;
  back: string;
  /** Texte lu à la place du recto, si besoin */
  speak?: string;
};

/** Paires chrono : relier chaque élément de gauche à son élément de droite avant la fin du temps */
export type MatchExercise = Base & {
  kind: 'match';
  prompt: string;
  pairs: { a: string; b: string }[];
  /** Temps accordé, en secondes */
  seconds: number;
};

/** Manipuler des quantités : construire un nombre avec des barres de dix et des cubes */
export type QuantityExercise = Base & {
  kind: 'quantity';
  prompt: string;
  target: number;
  /** Vrai pour proposer des barres de dix en plus des unités */
  tens: boolean;
};

export type Exercise =
  | FlashcardExercise
  | MatchExercise
  | QuantityExercise
  | FixExercise
  | ChoiceExercise
  | TrueFalseExercise
  | SortExercise
  | TapWordExercise
  | SentenceExercise
  | DictationExercise
  | CountExercise
  | PairsExercise
  | NumberlineExercise
  | ScrambleExercise
  | FlashExercise
  | OrderExercise
  | BlanksExercise
  | SpeedExercise;

export type ExerciseKind = Exercise['kind'];

/** Une leçon telle qu'elle sortira de la photo : le contenu, puis les exercices construits dessus */
export type Lesson = {
  id: string;
  title: string;
  subject: Subject;
  source: SourceKind;
  level: Level;
  /** Notion rattachée au programme */
  notion: string;
  /** Rayon de la bibliothèque ; déduit de la source et de la notion s'il manque (voir themeOf) */
  theme?: Theme;
  /** Attendu officiel du programme, cité tel quel */
  attendu?: string;
  /** Identifiant de l'attendu dans src/content/programme.ts, quand on le connaît */
  attenduId?: string;
  /** Pour l'écran de découverte : la leçon en quelques lignes */
  summary: string;
  exercises: Exercise[];
  /** Durée annoncée, en minutes */
  minutes: number;
};

export const SUBJECT_LABEL: Record<Subject, string> = {
  maths: 'Maths',
  francais: 'Français',
};

export const SOURCE_LABEL: Record<SourceKind, string> = {
  poesie: 'Poésie',
  mots: 'Mots de dictée',
  lecon: 'Leçon',
  calcul: 'Calcul',
  numeration: 'Numération',
  grammaire: 'Grammaire',
  lecture: 'Lecture',
};

/** Trouve le thème d'une leçon, même ancienne ou venue de la photo sans thème explicite */
export function themeOf(l: Lesson): Theme {
  if (l.theme) return l.theme;
  const n = `${l.notion} ${l.title}`.toLowerCase();
  if (l.subject === 'maths') {
    if (l.source === 'calcul' || /calcul|addition|soustraction|multiplication|table|division/.test(n)) return 'calcul';
    if (/géom|figure|droite|angle|carré|triangle|symétrie|solide/.test(n)) return 'geometrie';
    if (/mesur|longueur|masse|heure|monnaie|grandeur|durée|litre/.test(n)) return 'grandeurs';
    if (l.source === 'numeration' || /nombre|numération|compar|ranger|dizaine|unité|fraction|décimal/.test(n)) return 'nombres';
    return 'autre';
  }
  if (l.source === 'poesie' || /poème|poésie|réciter/.test(n)) return 'poesie';
  if (l.source === 'mots' || /orthograph|dictée|mots invariables|accord/.test(n)) return 'orthographe';
  if (/conjug|présent|futur|imparfait|passé composé|temps du verbe/.test(n)) return 'conjugaison';
  if (l.source === 'grammaire' || /gramm|verbe|sujet|nom|adjectif|phrase|déterminant|pronom/.test(n)) return 'grammaire';
  if (/vocab|synonyme|contraire|famille de mots|sens/.test(n)) return 'vocabulaire';
  if (l.source === 'lecture' || /lecture|lire|texte|compréhension/.test(n)) return 'lecture';
  return 'autre';
}
