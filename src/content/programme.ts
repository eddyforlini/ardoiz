import type { Lesson, Level, Subject, Theme } from './types';

/**
 * Le programme officiel, attendu par attendu, tel que le parent peut le lire
 * dans les repères de fin d'année de l'Éducation nationale. C'est la carte
 * que personne ne montre : chaque leçon jouée se rattache à un attendu, et
 * le parent voit en une page où en est son enfant par rapport à l'école.
 *
 * CP et CE1 sont renseignés ; les autres niveaux suivront la même forme. Les formulations sont raccourcies pour tenir sur un téléphone.
 */
export type Attendu = {
  id: string;
  level: Level;
  subject: Subject;
  theme: Theme;
  /** L'attendu, en une phrase lisible par un parent */
  text: string;
  /** Mots qui rattachent une leçon photographiée à cet attendu (sur la notion et le titre) */
  keywords: RegExp;
};

export const PROGRAMME: Attendu[] = [
  // CP, maths
  { id: 'cp-nb-lire', level: 'CP', subject: 'maths', theme: 'nombres', text: 'Lire, écrire et nommer les nombres jusqu\'à 100.', keywords: /nombres? jusqu|lire les nombres|écrire les nombres|cent\b/i },
  { id: 'cp-nb-denombrer', level: 'CP', subject: 'maths', theme: 'nombres', text: 'Dénombrer une collection, comparer et ranger des nombres jusqu\'à 100.', keywords: /compt|dénombr|compar|ranger|plus grand|plus petit/i },
  { id: 'cp-nb-dizaines', level: 'CP', subject: 'maths', theme: 'nombres', text: 'Comprendre les dizaines et les unités, décomposer un nombre à deux chiffres.', keywords: /dizaine|unité|décompos|numération/i },
  { id: 'cp-nb-suite', level: 'CP', subject: 'maths', theme: 'nombres', text: 'Compter de 1 en 1, de 2 en 2, de 5 en 5 et de 10 en 10 ; se repérer sur la file numérique.', keywords: /suite|de 2 en 2|de 5 en 5|de 10 en 10|file numérique|droite graduée|avant|après/i },
  { id: 'cp-calc-add', level: 'CP', subject: 'maths', theme: 'calcul', text: 'Additionner et soustraire de petits nombres, connaître les compléments à 10.', keywords: /addition|soustraction|ajouter|enlever|complément|plus|moins/i },
  { id: 'cp-calc-doubles', level: 'CP', subject: 'maths', theme: 'calcul', text: 'Connaître les doubles jusqu\'à 10 + 10 et calculer en ligne jusqu\'à 100.', keywords: /double|moitié|calcul en ligne|calcul mental/i },
  { id: 'cp-calc-problemes', level: 'CP', subject: 'maths', theme: 'calcul', text: 'Résoudre des problèmes simples d\'ajout, de retrait et de partage.', keywords: /problème|énoncé|partage|combien/i },
  { id: 'cp-gm-longueurs', level: 'CP', subject: 'maths', theme: 'grandeurs', text: 'Comparer et mesurer des longueurs avec une règle, en centimètres.', keywords: /longueur|centimètre|mesur|règle|plus long|plus court/i },
  { id: 'cp-gm-temps', level: 'CP', subject: 'maths', theme: 'grandeurs', text: 'Se repérer dans la journée, la semaine, le mois ; lire les heures pleines.', keywords: /heure|jour|semaine|mois|calendrier|horloge|matin|soir/i },
  { id: 'cp-gm-monnaie', level: 'CP', subject: 'maths', theme: 'grandeurs', text: 'Reconnaître les pièces et les billets, composer une somme en euros.', keywords: /monnaie|euro|pièce|billet|prix/i },
  { id: 'cp-geo-formes', level: 'CP', subject: 'maths', theme: 'geometrie', text: 'Reconnaître le carré, le rectangle, le triangle, le rond, le cube et la boule.', keywords: /carré|rectangle|triangle|rond|cercle|cube|boule|forme|solide/i },
  { id: 'cp-geo-espace', level: 'CP', subject: 'maths', theme: 'geometrie', text: 'Se repérer dans l\'espace : devant, derrière, dessus, dessous, gauche, droite ; se déplacer sur un quadrillage.', keywords: /repér|devant|derrière|gauche|droite|dessus|dessous|quadrillage/i },
  // CP, français
  { id: 'cp-lect-sons', level: 'CP', subject: 'francais', theme: 'lecture', text: 'Connaître les correspondances entre les lettres et les sons, lire des syllabes et des mots simples.', keywords: /syllabe|son\b|sons|lettre|décod|lire des mots|combinatoire/i },
  { id: 'cp-lect-mots', level: 'CP', subject: 'francais', theme: 'lecture', text: 'Lire des mots fréquents et des phrases courtes, comprendre ce qu\'on lit.', keywords: /mots? (outils?|fréquents?)|phrase|compréhension|comprendre|texte/i },
  { id: 'cp-oral-memoriser', level: 'CP', subject: 'francais', theme: 'poesie', text: 'Mémoriser et réciter une comptine ou un petit poème.', keywords: /poème|poésie|comptine|récit|mémoris/i },
  { id: 'cp-ortho-sons', level: 'CP', subject: 'francais', theme: 'orthographe', text: 'Écrire des syllabes et des mots simples en respectant les sons (a, i, o, u, é, ou, on, an, in).', keywords: /écrire les sons|encod|dictée de syllabes|\b(ou|on|an|in|oi)\b/i },
  { id: 'cp-ortho-mots', level: 'CP', subject: 'francais', theme: 'orthographe', text: 'Orthographier les mots outils et les mots de la classe appris par cœur.', keywords: /mots? (outils?|de la semaine|invariable)|dictée|orthograph/i },
  { id: 'cp-gram-phrase', level: 'CP', subject: 'francais', theme: 'grammaire', text: 'Reconnaître une phrase : majuscule, point, ordre des mots.', keywords: /phrase|majuscule|point|ordre des mots/i },
  { id: 'cp-gram-nom', level: 'CP', subject: 'francais', theme: 'grammaire', text: 'Distinguer le nom et le verbe, un et des, le et les, fille et garçon.', keywords: /\bnom\b|verbe|déterminant|singulier|pluriel|masculin|féminin/i },
  { id: 'cp-conj-present', level: 'CP', subject: 'francais', theme: 'conjugaison', text: 'Comprendre que le verbe change avec je, tu, il ; utiliser être et avoir à l\'oral et à l\'écrit.', keywords: /conjug|présent|je|tu|il|être|avoir/i },
  { id: 'cp-voc-mots', level: 'CP', subject: 'francais', theme: 'vocabulaire', text: 'Ranger des mots par catégorie, trouver des contraires simples, utiliser le vocabulaire de l\'école et de la maison.', keywords: /vocab|catégorie|contraire|famille|mots de/i },
  { id: 'cp-voc-alphabet', level: 'CP', subject: 'francais', theme: 'vocabulaire', text: 'Connaître l\'alphabet dans l\'ordre, en lettres majuscules et minuscules.', keywords: /alphab|majuscule|minuscule|lettres/i },
  // Maths, nombres
  { id: 'ce1-nb-lire', level: 'CE1', subject: 'maths', theme: 'nombres', text: 'Lire, écrire et nommer les nombres jusqu\'à 1 000.', keywords: /nombres? jusqu|lire les nombres|écrire les nombres|mille|1 ?000/i },
  { id: 'ce1-nb-comparer', level: 'CE1', subject: 'maths', theme: 'nombres', text: 'Comparer, ranger et encadrer les nombres ; les placer sur une droite graduée.', keywords: /compar|ranger|encadr|droite graduée|ordre croissant/i },
  { id: 'ce1-nb-dizaines', level: 'CE1', subject: 'maths', theme: 'nombres', text: 'Comprendre les dizaines, les centaines et les unités, et décomposer un nombre.', keywords: /dizaine|centaine|unité|décompos|numération/i },
  { id: 'ce1-nb-pairs', level: 'CE1', subject: 'maths', theme: 'nombres', text: 'Reconnaître les nombres pairs et impairs, les doubles et les moitiés.', keywords: /pair|impair|double|moitié/i },
  // Maths, calcul
  { id: 'ce1-calc-add', level: 'CE1', subject: 'maths', theme: 'calcul', text: 'Additionner et soustraire mentalement et en posant l\'opération.', keywords: /addition|soustraction|ajouter|retirer|somme|différence|poser/i },
  { id: 'ce1-calc-tables', level: 'CE1', subject: 'maths', theme: 'calcul', text: 'Connaître les tables de multiplication de 2, 3, 4 et 5.', keywords: /table|multipli/i },
  { id: 'ce1-calc-problemes', level: 'CE1', subject: 'maths', theme: 'calcul', text: 'Résoudre des problèmes en une ou deux étapes avec les quatre opérations.', keywords: /problème|énoncé|partage|combien/i },
  // Maths, grandeurs et mesures
  { id: 'ce1-gm-longueurs', level: 'CE1', subject: 'maths', theme: 'grandeurs', text: 'Mesurer et comparer des longueurs en centimètres et en mètres.', keywords: /longueur|centimètre|mètre|mesur|règle/i },
  { id: 'ce1-gm-masses', level: 'CE1', subject: 'maths', theme: 'grandeurs', text: 'Comparer des masses et des contenances (gramme, kilogramme, litre).', keywords: /masse|gramme|kilo|contenance|litre|balance/i },
  { id: 'ce1-gm-heure', level: 'CE1', subject: 'maths', theme: 'grandeurs', text: 'Lire l\'heure et utiliser les durées (jours, heures, minutes).', keywords: /heure|durée|horloge|minute|calendrier/i },
  { id: 'ce1-gm-monnaie', level: 'CE1', subject: 'maths', theme: 'grandeurs', text: 'Utiliser la monnaie : euros et centimes, rendre la monnaie.', keywords: /monnaie|euro|centime|prix|pièce/i },
  // Maths, espace et géométrie
  { id: 'ce1-geo-figures', level: 'CE1', subject: 'maths', theme: 'geometrie', text: 'Reconnaître et décrire le carré, le rectangle, le triangle et le cercle.', keywords: /carré|rectangle|triangle|cercle|figure|polygone|côté|sommet/i },
  { id: 'ce1-geo-tracer', level: 'CE1', subject: 'maths', theme: 'geometrie', text: 'Tracer avec la règle et l\'équerre, repérer un angle droit, reproduire sur quadrillage.', keywords: /tracer|équerre|angle droit|quadrillage|reproduire|segment/i },
  { id: 'ce1-geo-solides', level: 'CE1', subject: 'maths', theme: 'geometrie', text: 'Reconnaître le cube, le pavé, la boule, et se repérer dans l\'espace.', keywords: /cube|pavé|boule|solide|repér|plan|droite|gauche/i },
  // Français, lecture et oral
  { id: 'ce1-lect-fluide', level: 'CE1', subject: 'francais', theme: 'lecture', text: 'Lire à voix haute un texte adapté de façon fluide, en respectant la ponctuation.', keywords: /lire à voix|fluen|lecture à voix|ponctuation/i },
  { id: 'ce1-lect-comprendre', level: 'CE1', subject: 'francais', theme: 'lecture', text: 'Comprendre un texte lu seul : personnages, lieux, ordre des événements.', keywords: /compréhension|comprendre|texte|histoire|personnage/i },
  { id: 'ce1-oral-memoriser', level: 'CE1', subject: 'francais', theme: 'poesie', text: 'Mémoriser et réciter un poème ou un texte court avec expression.', keywords: /poème|poésie|récit|mémoris/i },
  // Français, orthographe
  { id: 'ce1-ortho-mots', level: 'CE1', subject: 'francais', theme: 'orthographe', text: 'Orthographier les mots fréquents et les mots invariables appris.', keywords: /mots? (de la semaine|invariable|fréquent)|dictée|orthograph/i },
  { id: 'ce1-ortho-sons', level: 'CE1', subject: 'francais', theme: 'orthographe', text: 'Écrire correctement les sons complexes (ou, on, an, in, oi, eau, ch, gn...).', keywords: /son |sons|graphie|phonème|\b(ou|on|an|in|oi|eau|ch|gn)\b/i },
  { id: 'ce1-ortho-accords', level: 'CE1', subject: 'francais', theme: 'orthographe', text: 'Faire les accords dans le groupe nominal (le, la, les ; singulier, pluriel) et entre le sujet et le verbe.', keywords: /accord|pluriel|singulier|féminin|masculin|marque du/i },
  // Français, grammaire
  { id: 'ce1-gram-phrase', level: 'CE1', subject: 'francais', theme: 'grammaire', text: 'Reconnaître la phrase, sa ponctuation, et les formes affirmative, négative, interrogative.', keywords: /phrase|négati|interrogati|affirmati|majuscule|point/i },
  { id: 'ce1-gram-verbe-sujet', level: 'CE1', subject: 'francais', theme: 'grammaire', text: 'Identifier le verbe et son sujet dans une phrase simple.', keywords: /verbe|sujet/i },
  { id: 'ce1-gram-nom', level: 'CE1', subject: 'francais', theme: 'grammaire', text: 'Reconnaître le nom, le déterminant, l\'adjectif et le pronom.', keywords: /\bnom\b|déterminant|adjectif|pronom|groupe nominal/i },
  // Français, conjugaison
  { id: 'ce1-conj-present', level: 'CE1', subject: 'francais', theme: 'conjugaison', text: 'Conjuguer au présent les verbes en -er, être, avoir, aller, faire, dire, venir.', keywords: /présent|conjug|être|avoir|aller/i },
  { id: 'ce1-conj-futur', level: 'CE1', subject: 'francais', theme: 'conjugaison', text: 'Conjuguer au futur et à l\'imparfait les verbes en -er, être et avoir.', keywords: /futur|imparfait/i },
  // Français, vocabulaire
  { id: 'ce1-voc-sens', level: 'CE1', subject: 'francais', theme: 'vocabulaire', text: 'Trouver des synonymes, des contraires, des mots de la même famille.', keywords: /synonyme|contraire|famille de mots|antonyme/i },
  { id: 'ce1-voc-ordre', level: 'CE1', subject: 'francais', theme: 'vocabulaire', text: 'Ranger des mots dans l\'ordre alphabétique et chercher dans le dictionnaire.', keywords: /alphab|dictionnaire/i },
];

/** Les attendus d'un niveau, dans l'ordre du programme */
export function attendusFor(level: Level): Attendu[] {
  return PROGRAMME.filter((a) => a.level === level);
}

/** Niveaux dont le programme est renseigné */
export function hasProgramme(level: Level): boolean {
  return PROGRAMME.some((a) => a.level === level);
}

/**
 * L'attendu auquel une leçon se rattache : celui qu'elle nomme, sinon le
 * premier de son niveau et de son thème dont les mots-clés correspondent,
 * sinon le premier de son thème.
 */
export function attenduOf(l: Lesson): Attendu | null {
  const own = l.attenduId && PROGRAMME.find((a) => a.id === l.attenduId);
  if (own) return own;
  const candidates = PROGRAMME.filter((a) => a.level === l.level && a.subject === l.subject);
  if (!candidates.length) return null;
  const text = `${l.notion} ${l.title} ${l.attendu ?? ''}`;
  const theme = l.theme;
  const byTheme = theme ? candidates.filter((a) => a.theme === theme) : candidates;
  return byTheme.find((a) => a.keywords.test(text)) ?? candidates.find((a) => a.keywords.test(text)) ?? byTheme[0] ?? null;
}
