import type { Lesson } from './types';

/**
 * Banque de départ, CE1. Trois leçons qui couvrent les trois types de photo
 * les plus fréquents : une leçon de maths, une poésie, une liste de mots.
 * Quand le pipeline photo existera, les leçons viendront de là ; cette banque
 * restera pour le parcours sans photo.
 */

const NOMBRES_100: Lesson = {
  id: 'maths-nombres-100',
  title: "Les nombres jusqu'à 100",
  subject: 'maths',
  source: 'numeration',
  level: 'CE1',
  notion: 'Comparer, ranger et repérer les nombres jusqu\'à 100',
  attendu: 'Comprendre et utiliser des nombres entiers pour dénombrer, ordonner, repérer, comparer.',
  summary:
    'Dans un nombre à deux chiffres, le chiffre de gauche compte les dizaines et celui de droite les unités. Pour comparer deux nombres, on regarde d\'abord les dizaines.',
  minutes: 6,
  exercises: [
    {
      id: 'n100-cmp-1',
      kind: 'choice',
      prompt: 'Quel est le plus grand ?',
      options: ['47', '74'],
      answer: 1,
      explain: '74 a 7 dizaines, 47 n\'en a que 4. Plus de dizaines, plus grand.',
    },
    {
      id: 'n100-line-1',
      kind: 'numberline',
      prompt: 'Place le nombre 50',
      min: 0,
      max: 100,
      step: 10,
      answer: 50,
      explain: '50, c\'est 5 dizaines : juste au milieu entre 0 et 100.',
    },
    {
      id: 'n100-cmp-2',
      kind: 'choice',
      prompt: 'Combien de dizaines dans 83 ?',
      options: ['3', '8', '83'],
      answer: 1,
      explain: 'Dans 83, le 8 est à gauche : ce sont les dizaines. Le 3 compte les unités.',
    },
    {
      id: 'n100-line-2',
      kind: 'numberline',
      prompt: 'Place le nombre 80',
      min: 0,
      max: 100,
      step: 10,
      answer: 80,
      explain: '80, c\'est 8 dizaines : deux graduations avant 100.',
    },
    {
      id: 'n100-cmp-3',
      kind: 'choice',
      prompt: 'Range du plus petit au plus grand',
      options: ['36, 63, 39', '36, 39, 63', '63, 39, 36'],
      answer: 1,
      explain: '36 et 39 ont 3 dizaines, 63 en a 6. Entre 36 et 39, on compare les unités : 6 puis 9.',
    },
    {
      id: 'n100-speed',
      kind: 'speed',
      prompt: 'Calcul éclair : additions',
      seconds: 45,
      target: 6,
      items: [
        { q: '20 + 30', a: 50 },
        { q: '45 + 5', a: 50 },
        { q: '60 + 7', a: 67 },
        { q: '38 + 2', a: 40 },
        { q: '10 + 15', a: 25 },
        { q: '50 + 25', a: 75 },
        { q: '33 + 6', a: 39 },
        { q: '70 + 20', a: 90 },
        { q: '9 + 9', a: 18 },
        { q: '41 + 10', a: 51 },
        { q: '25 + 25', a: 50 },
        { q: '80 + 8', a: 88 },
      ],
    },
  ],
};

const CIGALE: Lesson = {
  id: 'poesie-cigale',
  title: 'La Cigale et la Fourmi',
  subject: 'francais',
  source: 'poesie',
  level: 'CE1',
  notion: 'Mémoriser et réciter un poème',
  attendu: 'Dire pour être entendu et compris : mémoriser des textes.',
  summary:
    'Une fable de Jean de La Fontaine. La cigale a chanté tout l\'été, et quand l\'hiver arrive, elle n\'a plus rien à manger. Les huit premiers vers, à savoir par cœur.',
  minutes: 7,
  exercises: [
    {
      id: 'cig-order-1',
      kind: 'order',
      prompt: 'Remets les quatre premiers vers dans l\'ordre',
      lines: [
        'La Cigale, ayant chanté',
        'Tout l\'été,',
        'Se trouva fort dépourvue',
        'Quand la bise fut venue :',
      ],
      explain: 'La cigale chante tout l\'été, puis se retrouve sans rien quand le vent froid arrive.',
    },
    {
      id: 'cig-blanks-1',
      kind: 'blanks',
      prompt: 'Complète les vers',
      text: 'Pas un seul petit {{morceau}}\nDe mouche ou de {{vermisseau}}.\nElle alla crier {{famine}}\nChez la Fourmi sa voisine,',
      distractors: ['fromage', 'cuisine'],
      explain: 'Morceau rime avec vermisseau, famine rime avec voisine.',
    },
    {
      id: 'cig-rime',
      kind: 'choice',
      prompt: 'Quel mot rime avec « venue » ?',
      options: ['dépourvue', 'chanté', 'voisine'],
      answer: 0,
      explain: 'Venue et dépourvue finissent toutes les deux par le son « ue ».',
    },
    {
      id: 'cig-order-2',
      kind: 'order',
      prompt: 'Remets les vers 5 à 8 dans l\'ordre',
      lines: [
        'Pas un seul petit morceau',
        'De mouche ou de vermisseau.',
        'Elle alla crier famine',
        'Chez la Fourmi sa voisine,',
      ],
      explain: 'D\'abord ce qui manque (le morceau de mouche), puis ce qu\'elle fait (crier famine chez la fourmi).',
    },
    {
      id: 'cig-blanks-2',
      kind: 'blanks',
      prompt: 'Le poème qui s\'efface : complète',
      text: 'La {{Cigale}}, ayant {{chanté}}\nTout l\'{{été}},\nSe trouva fort {{dépourvue}}\nQuand la {{bise}} fut venue :',
      distractors: ['Fourmi', 'hiver', 'pluie'],
      explain: 'Relis le poème en entier une fois à voix haute, puis recommence.',
    },
  ],
};

const MOTS_SEMAINE: Lesson = {
  id: 'mots-semaine-3',
  title: 'Mots de la semaine',
  subject: 'francais',
  source: 'mots',
  level: 'CE1',
  notion: 'Orthographier les mots invariables et les mots fréquents',
  attendu: 'Mémoriser l\'orthographe des mots fréquents et des mots invariables.',
  summary:
    'Sept mots à savoir écrire pour la dictée de vendredi : toujours, beaucoup, maison, jardin, chemin, oiseau, souvent.',
  minutes: 6,
  exercises: [
    { id: 'mot-scr-1', kind: 'scramble', word: 'maison', explain: 'mai-son : on entend « mai » puis « son ».' },
    {
      id: 'mot-flash-1',
      kind: 'flash',
      word: 'toujours',
      distractors: ['toujour', 'toujoures'],
      explain: 'Toujours finit toujours par un s, même s\'il ne s\'entend pas.',
    },
    { id: 'mot-scr-2', kind: 'scramble', word: 'oiseau', explain: 'oi-seau : le son « o » de la fin s\'écrit « eau ».' },
    {
      id: 'mot-choice-1',
      kind: 'choice',
      prompt: 'Quelle est la bonne écriture ?',
      speak: 'beaucoup',
      options: ['bocou', 'beaucoup', 'beaucou'],
      answer: 1,
      explain: 'Beau-coup : « beau » comme dans un beau jardin, et un p muet à la fin.',
    },
    {
      id: 'mot-flash-2',
      kind: 'flash',
      word: 'chemin',
      distractors: ['chemain', 'chemen'],
      explain: 'Le son « in » de chemin s\'écrit i-n.',
    },
    { id: 'mot-scr-3', kind: 'scramble', word: 'jardin', explain: 'jar-din : le son « in » s\'écrit i-n, comme dans chemin.' },
    {
      id: 'mot-flash-3',
      kind: 'flash',
      word: 'souvent',
      distractors: ['souvant', 'souven'],
      explain: 'Souvent finit par « ent », avec un t muet.',
    },
  ],
};

export const LESSONS: Lesson[] = [NOMBRES_100, CIGALE, MOTS_SEMAINE];

export function findLesson(id: string | undefined): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
