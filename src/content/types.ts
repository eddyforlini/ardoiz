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

type Base = {
  id: string;
  /** Explication courte montrée après une erreur */
  explain?: string;
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

export type Exercise =
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
  /** Attendu officiel du programme, cité tel quel */
  attendu?: string;
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
