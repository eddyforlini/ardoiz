/**
 * Modèle de contenu scolaire. Tout ici est neutre : aucune couleur, aucun
 * univers, aucune mise en scène. L'univers habille au moment de l'affichage.
 */

export type Subject = 'maths' | 'francais';

/** Type de page photographiée, qui décide des jeux proposés */
export type SourceKind = 'poesie' | 'mots' | 'lecon' | 'calcul' | 'numeration' | 'grammaire';

export type Level = 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2';

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

export type Exercise =
  | ChoiceExercise
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
};
