import type { Lesson, Level, Subject, Theme } from './types';

/**
 * Le programme officiel, attendu par attendu, tel que le parent peut le lire
 * dans les repères de fin d'année de l'Éducation nationale. C'est la carte
 * que personne ne montre : chaque leçon jouée se rattache à un attendu, et
 * le parent voit en une page où en est son enfant par rapport à l'école.
 *
 * CP, CE1, CE2 et CM1 sont renseignés ; les autres niveaux suivront la même forme. Les formulations sont raccourcies pour tenir sur un téléphone.
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
  // CE2, maths
  { id: 'ce2-nb-lire', level: 'CE2', subject: 'maths', theme: 'nombres', text: 'Lire, écrire, nommer et décomposer les nombres jusqu\'à 10 000.', keywords: /nombres? jusqu|10 ?000|dix mille|mille|unités de mille|décompos/i },
  { id: 'ce2-nb-comparer', level: 'CE2', subject: 'maths', theme: 'nombres', text: 'Comparer, ranger, encadrer et placer les nombres jusqu\'à 10 000 sur une droite graduée.', keywords: /compar|ranger|encadr|droite graduée|ordre croissant|intercal/i },
  { id: 'ce2-nb-fractions', level: 'CE2', subject: 'maths', theme: 'nombres', text: 'Comprendre les fractions simples : la moitié, le tiers, le quart, trois quarts.', keywords: /fraction|moitié|tiers|quart|demi/i },
  { id: 'ce2-calc-add', level: 'CE2', subject: 'maths', theme: 'calcul', text: 'Additionner et soustraire des nombres jusqu\'à 10 000, en ligne et en colonnes, avec retenue.', keywords: /addition|soustraction|retenue|poser|somme|différence/i },
  { id: 'ce2-calc-tables', level: 'CE2', subject: 'maths', theme: 'calcul', text: 'Connaître les tables de multiplication de 2 à 9 et multiplier par 10 et 100.', keywords: /table|multipli|fois|par 10|par 100/i },
  { id: 'ce2-calc-multiplication', level: 'CE2', subject: 'maths', theme: 'calcul', text: 'Poser une multiplication à un chiffre, calculer le double, le triple, la moitié.', keywords: /multiplication posée|poser une multiplication|double|triple|moitié/i },
  { id: 'ce2-calc-division', level: 'CE2', subject: 'maths', theme: 'calcul', text: 'Partager et grouper : approcher la division, avec ou sans reste.', keywords: /division|partag|group|reste|diviser/i },
  { id: 'ce2-calc-problemes', level: 'CE2', subject: 'maths', theme: 'calcul', text: 'Résoudre des problèmes à deux étapes avec les quatre opérations.', keywords: /problème|énoncé|combien|étapes/i },
  { id: 'ce2-gm-longueurs', level: 'CE2', subject: 'maths', theme: 'grandeurs', text: 'Mesurer et convertir des longueurs : millimètre, centimètre, mètre, kilomètre.', keywords: /longueur|millimètre|centimètre|mètre|kilomètre|convertir|mesur/i },
  { id: 'ce2-gm-masses', level: 'CE2', subject: 'maths', theme: 'grandeurs', text: 'Mesurer des masses et des contenances : gramme, kilogramme, centilitre, litre.', keywords: /masse|gramme|kilo|contenance|litre|centilitre|balance/i },
  { id: 'ce2-gm-heure', level: 'CE2', subject: 'maths', theme: 'grandeurs', text: 'Lire l\'heure à la minute près, calculer des durées, utiliser le calendrier.', keywords: /heure|durée|minute|seconde|calendrier|horloge/i },
  { id: 'ce2-gm-monnaie', level: 'CE2', subject: 'maths', theme: 'grandeurs', text: 'Calculer avec la monnaie, euros et centimes, et rendre la monnaie.', keywords: /monnaie|euro|centime|prix|rendre/i },
  { id: 'ce2-geo-figures', level: 'CE2', subject: 'maths', theme: 'geometrie', text: 'Décrire et tracer carré, rectangle, triangle rectangle et cercle ; reconnaître un angle droit.', keywords: /carré|rectangle|triangle|cercle|angle droit|polygone|côté|sommet|compas/i },
  { id: 'ce2-geo-symetrie', level: 'CE2', subject: 'maths', theme: 'geometrie', text: 'Reconnaître et compléter une figure symétrique, tracer un axe de symétrie.', keywords: /symétri|axe|miroir|plier/i },
  { id: 'ce2-geo-solides', level: 'CE2', subject: 'maths', theme: 'geometrie', text: 'Décrire cube, pavé, pyramide, cylindre : faces, arêtes, sommets ; se repérer sur un plan.', keywords: /cube|pavé|pyramide|cylindre|solide|arête|face|plan|repér/i },
  // CE2, français
  { id: 'ce2-lect-fluide', level: 'CE2', subject: 'francais', theme: 'lecture', text: 'Lire à voix haute avec fluidité et expression, en respectant la ponctuation et les liaisons.', keywords: /lire à voix|fluen|lecture à voix|ponctuation|liaison/i },
  { id: 'ce2-lect-comprendre', level: 'CE2', subject: 'francais', theme: 'lecture', text: 'Comprendre un texte : personnages, lieux, chronologie, ce qui n\'est pas écrit mais qu\'on devine.', keywords: /compréhension|comprendre|texte|histoire|personnage|inférence/i },
  { id: 'ce2-oral-memoriser', level: 'CE2', subject: 'francais', theme: 'poesie', text: 'Mémoriser et dire un poème avec expression, en respectant les vers et les rimes.', keywords: /poème|poésie|récit|mémoris|strophe|rime/i },
  { id: 'ce2-ortho-mots', level: 'CE2', subject: 'francais', theme: 'orthographe', text: 'Orthographier les mots fréquents et les mots invariables, et les homophones a/à, et/est, on/ont, son/sont.', keywords: /mots? (de la semaine|invariable|fréquent)|dictée|orthograph|homophone|a\/à|et\/est|on\/ont|son\/sont/i },
  { id: 'ce2-ortho-accords', level: 'CE2', subject: 'francais', theme: 'orthographe', text: 'Accorder dans le groupe nominal (genre et nombre, pluriels en -x) et le verbe avec son sujet.', keywords: /accord|pluriel|singulier|féminin|masculin|genre|nombre/i },
  { id: 'ce2-ortho-lettres', level: 'CE2', subject: 'francais', theme: 'orthographe', text: 'Écrire les lettres muettes, le m devant m, b, p, et les valeurs des lettres c, g, s.', keywords: /lettre muette|lettre finale|devant m b p|\bc\b|\bg\b|\bs\b|valeur/i },
  { id: 'ce2-gram-phrase', level: 'CE2', subject: 'francais', theme: 'grammaire', text: 'Reconnaître les types et formes de phrases, la ponctuation, et le groupe nominal.', keywords: /phrase|négati|interrogati|exclamati|ponctuation|groupe nominal/i },
  { id: 'ce2-gram-fonctions', level: 'CE2', subject: 'francais', theme: 'grammaire', text: 'Identifier le sujet, le verbe et les compléments ; reconnaître le nom, le déterminant, l\'adjectif, le pronom.', keywords: /sujet|verbe|complément|\bnom\b|déterminant|adjectif|pronom|fonction/i },
  { id: 'ce2-conj-present', level: 'CE2', subject: 'francais', theme: 'conjugaison', text: 'Conjuguer au présent les verbes en -er, -ir (finir), être, avoir, aller, faire, dire, venir, pouvoir, vouloir, prendre.', keywords: /présent|conjug|finir|pouvoir|vouloir|prendre/i },
  { id: 'ce2-conj-passe', level: 'CE2', subject: 'francais', theme: 'conjugaison', text: 'Conjuguer à l\'imparfait, au futur et au passé composé les verbes fréquents.', keywords: /imparfait|futur|passé composé|auxiliaire|participe/i },
  { id: 'ce2-voc-sens', level: 'CE2', subject: 'francais', theme: 'vocabulaire', text: 'Utiliser synonymes, contraires, familles de mots, préfixes et suffixes, sens propre et sens figuré.', keywords: /synonyme|contraire|famille de mots|préfixe|suffixe|sens propre|sens figuré|polysém/i },
  { id: 'ce2-voc-dictionnaire', level: 'CE2', subject: 'francais', theme: 'vocabulaire', text: 'Chercher un mot dans le dictionnaire et comprendre un article : nature, définitions, exemples.', keywords: /alphab|dictionnaire|définition|article/i },
  // CM1, maths
  { id: 'cm1-nb-grands', level: 'CM1', subject: 'maths', theme: 'nombres', text: 'Lire, écrire, nommer et décomposer les grands nombres jusqu\'au million (classes des unités et des mille).', keywords: /grands? nombres?|million|classe des mille|nombres? jusqu|décompos/i },
  { id: 'cm1-nb-comparer', level: 'CM1', subject: 'maths', theme: 'nombres', text: 'Comparer, ranger, encadrer et arrondir les grands nombres ; les placer sur une droite graduée.', keywords: /compar|ranger|encadr|arrondi|droite graduée|ordre croissant/i },
  { id: 'cm1-nb-fractions', level: 'CM1', subject: 'maths', theme: 'nombres', text: 'Lire, écrire et comparer des fractions simples (demi, tiers, quart, dixième) ; les placer sur une droite graduée.', keywords: /fraction|numérateur|dénominateur|demi|tiers|quart|dixième/i },
  { id: 'cm1-nb-decimaux', level: 'CM1', subject: 'maths', theme: 'nombres', text: 'Comprendre les nombres décimaux : dixièmes, centièmes, écriture à virgule et fraction décimale.', keywords: /décima|virgule|dixième|centième|fraction décimale/i },
  { id: 'cm1-calc-mental', level: 'CM1', subject: 'maths', theme: 'calcul', text: 'Calculer mentalement : tables jusqu\'à 9, multiplier et diviser par 10, 100, 1 000, doubles, moitiés, compléments à 100 et 1 000.', keywords: /calcul mental|table|par 10|par 100|par 1 ?000|double|moitié|complément/i },
  { id: 'cm1-calc-operations', level: 'CM1', subject: 'maths', theme: 'calcul', text: 'Poser une addition et une soustraction de grands nombres et de nombres décimaux.', keywords: /addition|soustraction|retenue|poser|somme|différence/i },
  { id: 'cm1-calc-multiplication', level: 'CM1', subject: 'maths', theme: 'calcul', text: 'Poser une multiplication à deux chiffres au multiplicateur.', keywords: /multiplication posée|poser une multiplication|multipli|produit/i },
  { id: 'cm1-calc-division', level: 'CM1', subject: 'maths', theme: 'calcul', text: 'Poser une division euclidienne à un chiffre au diviseur : quotient et reste.', keywords: /division|diviser|quotient|reste|euclidienne|dividende|diviseur/i },
  { id: 'cm1-calc-problemes', level: 'CM1', subject: 'maths', theme: 'calcul', text: 'Résoudre des problèmes à plusieurs étapes et des problèmes de proportionnalité simple (recette, prix, vitesse).', keywords: /problème|énoncé|étapes|proportionnalité|recette|tableau/i },
  { id: 'cm1-gm-longueurs', level: 'CM1', subject: 'maths', theme: 'grandeurs', text: 'Convertir des longueurs du millimètre au kilomètre et calculer le périmètre d\'un carré et d\'un rectangle.', keywords: /longueur|millimètre|centimètre|décimètre|mètre|kilomètre|convertir|périmètre/i },
  { id: 'cm1-gm-masses', level: 'CM1', subject: 'maths', theme: 'grandeurs', text: 'Convertir des masses (g, kg, tonne) et des contenances (mL, cL, dL, L).', keywords: /masse|gramme|kilo|tonne|contenance|litre|centilitre|décilitre|millilitre/i },
  { id: 'cm1-gm-durees', level: 'CM1', subject: 'maths', theme: 'grandeurs', text: 'Convertir et calculer des durées (secondes, minutes, heures, jours) ; lire un horaire.', keywords: /durée|heure|minute|seconde|horaire|calendrier|siècle|année/i },
  { id: 'cm1-gm-aires', level: 'CM1', subject: 'maths', theme: 'grandeurs', text: 'Comparer et mesurer des aires en comptant des carreaux ; distinguer aire et périmètre.', keywords: /aire|surface|carreau|cm²|périmètre/i },
  { id: 'cm1-gm-angles', level: 'CM1', subject: 'maths', theme: 'grandeurs', text: 'Comparer des angles ; reconnaître un angle droit, aigu ou obtus avec l\'équerre.', keywords: /angle|aigu|obtus|droit|équerre/i },
  { id: 'cm1-geo-figures', level: 'CM1', subject: 'maths', theme: 'geometrie', text: 'Reconnaître droites perpendiculaires et parallèles ; décrire et tracer polygones, triangles et quadrilatères particuliers, cercle.', keywords: /perpendiculaire|parallèle|polygone|quadrilatère|losange|triangle|isocèle|équilatéral|cercle|rayon|diamètre|construction/i },
  { id: 'cm1-geo-symetrie', level: 'CM1', subject: 'maths', theme: 'geometrie', text: 'Compléter une figure par symétrie axiale sur quadrillage ; trouver les axes de symétrie d\'une figure.', keywords: /symétri|axe|miroir|plier/i },
  { id: 'cm1-geo-solides', level: 'CM1', subject: 'maths', theme: 'geometrie', text: 'Décrire cube, pavé, prisme, pyramide, cylindre, cône et boule ; reconnaître le patron d\'un cube.', keywords: /cube|pavé|prisme|pyramide|cylindre|cône|boule|solide|patron|arête|face/i },
  { id: 'cm1-geo-reperage', level: 'CM1', subject: 'maths', theme: 'geometrie', text: 'Se repérer et se déplacer sur un plan, une carte ou un quadrillage avec des coordonnées.', keywords: /repér|plan|carte|quadrillage|coordonnée|déplacement|échelle/i },
  // CM1, français
  { id: 'cm1-lect-fluide', level: 'CM1', subject: 'francais', theme: 'lecture', text: 'Lire à voix haute avec fluidité et expression un texte d\'une page, en respectant la ponctuation.', keywords: /lire à voix|fluen|lecture à voix|ponctuation|liaison/i },
  { id: 'cm1-lect-comprendre', level: 'CM1', subject: 'francais', theme: 'lecture', text: 'Comprendre un récit et un texte documentaire : personnages, intentions, informations explicites et implicites.', keywords: /compréhension|comprendre|texte|récit|documentaire|personnage|inférence|implicite/i },
  { id: 'cm1-oral-memoriser', level: 'CM1', subject: 'francais', theme: 'poesie', text: 'Mémoriser et dire un poème ou une fable avec expression, en comprenant son sens.', keywords: /poème|poésie|fable|récit|mémoris|strophe|rime|vers/i },
  { id: 'cm1-ecrit-rediger', level: 'CM1', subject: 'francais', theme: 'grammaire', text: 'Écrire un texte d\'une dizaine de lignes bien construit : organisation, connecteurs, ponctuation, relecture.', keywords: /rédaction|rédiger|écrire un texte|production d.écrit|connecteur|paragraphe/i },
  { id: 'cm1-ortho-mots', level: 'CM1', subject: 'francais', theme: 'orthographe', text: 'Orthographier les mots fréquents et les homophones ou/où, ce/se, ces/ses, c\'est/s\'est, mes/mais, la/là.', keywords: /mots? (de la semaine|invariable|fréquent)|dictée|orthograph|homophone|ou\/où|ce\/se|ces\/ses|c.est\/s.est|mes\/mais/i },
  { id: 'cm1-ortho-accords', level: 'CM1', subject: 'francais', theme: 'orthographe', text: 'Accorder dans le groupe nominal, le verbe avec son sujet, et le participe passé employé avec être.', keywords: /accord|pluriel|singulier|féminin|masculin|genre|nombre|participe passé/i },
  { id: 'cm1-ortho-lettres', level: 'CM1', subject: 'francais', theme: 'orthographe', text: 'Trouver la lettre finale muette grâce aux mots de la même famille ; écrire les mots en -ail, -eil, -euil, et les consonnes doubles.', keywords: /lettre muette|lettre finale|famille|-ail|-eil|-euil|consonne double|double consonne/i },
  { id: 'cm1-gram-phrase', level: 'CM1', subject: 'francais', theme: 'grammaire', text: 'Distinguer phrase simple et phrase complexe, types et formes de phrases, ponctuation du dialogue.', keywords: /phrase simple|phrase complexe|types? de phrase|négati|interrogati|exclamati|ponctuation|dialogue/i },
  { id: 'cm1-gram-fonctions', level: 'CM1', subject: 'francais', theme: 'grammaire', text: 'Identifier le sujet, le verbe, les compléments d\'objet et les compléments circonstanciels de lieu, de temps, de manière.', keywords: /sujet|verbe|complément d.objet|COD|COI|circonstanciel|fonction/i },
  { id: 'cm1-gram-classes', level: 'CM1', subject: 'francais', theme: 'grammaire', text: 'Reconnaître les classes de mots : nom, déterminant, adjectif, pronom, verbe, adverbe, préposition.', keywords: /classe|nature|\bnom\b|déterminant|adjectif|pronom|adverbe|préposition/i },
  { id: 'cm1-conj-present', level: 'CM1', subject: 'francais', theme: 'conjugaison', text: 'Conjuguer au présent les verbes des 1er et 2e groupes et les verbes fréquents du 3e groupe.', keywords: /présent|conjug|groupe|finir|pouvoir|vouloir|prendre|voir/i },
  { id: 'cm1-conj-imparfait-futur', level: 'CM1', subject: 'francais', theme: 'conjugaison', text: 'Conjuguer à l\'imparfait et au futur les verbes étudiés.', keywords: /imparfait|futur/i },
  { id: 'cm1-conj-passe', level: 'CM1', subject: 'francais', theme: 'conjugaison', text: 'Conjuguer au passé composé et reconnaître le passé simple à la 3e personne dans un récit.', keywords: /passé composé|passé simple|auxiliaire|participe|temps du passé/i },
  { id: 'cm1-voc-sens', level: 'CM1', subject: 'francais', theme: 'vocabulaire', text: 'Utiliser synonymes, antonymes, mots de sens voisin, sens propre et figuré, niveaux de langue.', keywords: /synonyme|antonyme|contraire|sens propre|sens figuré|polysém|niveau de langue|registre/i },
  { id: 'cm1-voc-familles', level: 'CM1', subject: 'francais', theme: 'vocabulaire', text: 'Construire des familles de mots avec radical, préfixes et suffixes ; utiliser le dictionnaire.', keywords: /famille de mots|radical|préfixe|suffixe|dictionnaire|définition/i },
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
  // CE1, maths
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
  // CE1, français
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
