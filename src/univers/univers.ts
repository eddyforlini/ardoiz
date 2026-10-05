/**
 * Les huit univers d'Ardoiz. Un univers est un habillage : il ne change jamais
 * le contenu scolaire, seulement l'apparence, le vocabulaire et le ton.
 */

export type UniversId =
  | 'classique'
  | 'hero'
  | 'manga'
  | 'espace'
  | 'dino'
  | 'gaming'
  | 'street'
  | 'enquete';

export type Audience = 'petits' | 'grands';

export type UniversColors = {
  /** Fond de l'écran */
  bg: string;
  /** Fond des cartes */
  card: string;
  /** Texte principal */
  ink: string;
  /** Texte secondaire */
  soft: string;
  /** Bordures */
  line: string;
  /** Couleur principale (boutons, accents) */
  primary: string;
  /** Ombre portée du bouton principal */
  primaryDark: string;
  /** Texte sur la couleur principale */
  onPrimary: string;
  /** Teinte claire de la couleur principale */
  primaryTint: string;
  /** Couleur de la monnaie et des étoiles */
  sun: string;
  sunDark: string;
  onSun: string;
  /** Réussite */
  ok: string;
  okBg: string;
  /** Erreur (douce) */
  ko: string;
  koBg: string;
};

export type Univers = {
  id: UniversId;
  name: string;
  audience: Audience;
  /** Une ligne pour le sélecteur d'univers */
  tagline: string;
  colors: UniversColors;
  /** Nom de la monnaie, au pluriel */
  currency: string;
  /** Symbole simple de la monnaie, en attendant les vraies icônes */
  currencySymbol: string;
  /** Costume de Gribouille (voir le composant Gribouille) */
  costume: 'none' | 'cape' | 'bandeau' | 'casque' | 'crete' | 'manette' | 'casquette' | 'loupe';
  /** Effet de fête après une mission */
  celebration: 'confettis' | 'pow' | 'petales' | 'etoiles' | 'feuilles' | 'xp' | 'spray' | 'tampon';
  /** Ton des textes : les grands ont des messages plus courts, moins enfantins */
  tone: 'enfant' | 'ado';
  /** Mots de l'univers, utilisés pour habiller les écrans */
  words: {
    mission: string;
    bravo: string;
    encore: string;
    monde: string;
    coffre: string;
  };
  /** Style de police : on reste sur les polices du téléphone pour le squelette */
  font: {
    weight: '600' | '700' | '800' | '900';
    letterSpacing: number;
    radius: number;
  };
};

export const UNIVERS: Record<UniversId, Univers> = {
  classique: {
    id: 'classique',
    name: 'Classique',
    audience: 'petits',
    tagline: "Le cahier d'école, en couleurs",
    colors: {
      bg: '#f4f7ff', card: '#ffffff', ink: '#1b2a6b', soft: '#5d6a99', line: '#dfe5f5',
      primary: '#2f5bea', primaryDark: '#1f43bd', onPrimary: '#ffffff', primaryTint: '#eaf0ff',
      sun: '#ffc531', sunDark: '#e0a400', onSun: '#3b2a00',
      ok: '#0f6a48', okBg: '#d9f5e8', ko: '#a12a22', koBg: '#fde3e1',
    },
    currency: 'étoiles',
    currencySymbol: '★',
    costume: 'none',
    celebration: 'confettis',
    tone: 'enfant',
    words: { mission: 'Mission du jour', bravo: 'Bravo !', encore: 'Encore une ?', monde: 'Mon village', coffre: 'Coffre' },
    font: { weight: '800', letterSpacing: 0, radius: 20 },
  },
  hero: {
    id: 'hero',
    name: 'Super-héros',
    audience: 'petits',
    tagline: 'Cape, pouvoirs et grosses onomatopées',
    colors: {
      bg: '#fff4d6', card: '#ffffff', ink: '#14142b', soft: '#4b4b6b', line: '#14142b',
      primary: '#e62e2e', primaryDark: '#14142b', onPrimary: '#ffffff', primaryTint: '#ffe1dc',
      sun: '#ffd400', sunDark: '#14142b', onSun: '#14142b',
      ok: '#0f6a48', okBg: '#d9f5e8', ko: '#a12a22', koBg: '#fde3e1',
    },
    currency: 'éclairs',
    currencySymbol: '⚡',
    costume: 'cape',
    celebration: 'pow',
    tone: 'enfant',
    words: { mission: 'Mission héroïque', bravo: 'POW !', encore: 'Un autre méchant ?', monde: 'Ma ville à sauver', coffre: 'Coffre-fort' },
    font: { weight: '900', letterSpacing: 1, radius: 10 },
  },
  manga: {
    id: 'manga',
    name: 'Manga',
    audience: 'petits',
    tagline: 'Pétales, grands yeux et énergie',
    colors: {
      bg: '#fff2f7', card: '#ffffff', ink: '#2a1630', soft: '#7a5a80', line: '#f6c9dd',
      primary: '#ff4f9a', primaryDark: '#c92c72', onPrimary: '#ffffff', primaryTint: '#ffe1ee',
      sun: '#ffd166', sunDark: '#e0a830', onSun: '#3b2a00',
      ok: '#0f6a48', okBg: '#d9f5e8', ko: '#a12a22', koBg: '#fde3e1',
    },
    currency: 'pétales',
    currencySymbol: '✿',
    costume: 'bandeau',
    celebration: 'petales',
    tone: 'enfant',
    words: { mission: 'Épisode du jour', bravo: 'Sugoi !', encore: 'Épisode suivant ?', monde: 'Mon dojo', coffre: 'Coffre' },
    font: { weight: '800', letterSpacing: 0, radius: 24 },
  },
  espace: {
    id: 'espace',
    name: 'Espace',
    audience: 'petits',
    tagline: 'Fusées, planètes et cristaux',
    colors: {
      bg: '#0d1030', card: '#1a1f4d', ink: '#eef0ff', soft: '#a9b0e0', line: '#2f3678',
      primary: '#7b5cff', primaryDark: '#4f33cc', onPrimary: '#ffffff', primaryTint: '#2a2470',
      sun: '#ffcc4d', sunDark: '#c99620', onSun: '#3b2a00',
      ok: '#b8fff2', okBg: '#0f4b46', ko: '#ffd0d7', koBg: '#561a2a',
    },
    currency: 'cristaux',
    currencySymbol: '◆',
    costume: 'casque',
    celebration: 'etoiles',
    tone: 'enfant',
    words: { mission: 'Mission spatiale', bravo: 'Décollage réussi !', encore: 'Prochaine planète ?', monde: 'Ma base sur Mars', coffre: 'Capsule' },
    font: { weight: '700', letterSpacing: 1, radius: 20 },
  },
  dino: {
    id: 'dino',
    name: 'Dinosaures',
    audience: 'petits',
    tagline: 'Jungle, fossiles et gros rugissements',
    colors: {
      bg: '#eef6df', card: '#fffdf3', ink: '#2d3a1a', soft: '#66704f', line: '#d4e3b8',
      primary: '#4f9d2d', primaryDark: '#357019', onPrimary: '#ffffff', primaryTint: '#e2f1d2',
      sun: '#ffb627', sunDark: '#c9850d', onSun: '#3b2a00',
      ok: '#0f6a48', okBg: '#d9f5e8', ko: '#a12a22', koBg: '#fde3e1',
    },
    currency: 'ambres',
    currencySymbol: '●',
    costume: 'crete',
    celebration: 'feuilles',
    tone: 'enfant',
    words: { mission: 'Expédition du jour', bravo: 'Raaah !', encore: 'On creuse encore ?', monde: 'Mon île aux dinos', coffre: 'Œuf' },
    font: { weight: '800', letterSpacing: 0.5, radius: 18 },
  },
  gaming: {
    id: 'gaming',
    name: 'Gaming',
    audience: 'grands',
    tagline: 'Néons, XP et combos',
    colors: {
      bg: '#0b0f1a', card: '#141a2e', ink: '#e8f1ff', soft: '#8ea0c8', line: '#263252',
      primary: '#00e5a0', primaryDark: '#00a072', onPrimary: '#0b0f1a', primaryTint: '#10362e',
      sun: '#ffe14d', sunDark: '#b39a1a', onSun: '#0b0f1a',
      ok: '#9fffd9', okBg: '#0d3b2f', ko: '#ffc2cf', koBg: '#4a1323',
    },
    currency: 'XP',
    currencySymbol: '▲',
    costume: 'manette',
    celebration: 'xp',
    tone: 'ado',
    words: { mission: 'Quête du jour', bravo: 'GG', encore: 'Next ?', monde: 'Ma base', coffre: 'Loot' },
    font: { weight: '800', letterSpacing: 1.5, radius: 6 },
  },
  street: {
    id: 'street',
    name: 'Street',
    audience: 'grands',
    tagline: 'Graff, skate et bombes de peinture',
    colors: {
      bg: '#e9e7e1', card: '#ffffff', ink: '#161616', soft: '#5c5c5c', line: '#d3d0c7',
      primary: '#ff5a1f', primaryDark: '#b33a0c', onPrimary: '#ffffff', primaryTint: '#ffe3d6',
      sun: '#c6ff00', sunDark: '#8fb800', onSun: '#161616',
      ok: '#0f6a48', okBg: '#d9f5e8', ko: '#a12a22', koBg: '#fde3e1',
    },
    currency: 'bombes',
    currencySymbol: '◉',
    costume: 'casquette',
    celebration: 'spray',
    tone: 'ado',
    words: { mission: 'Session du jour', bravo: 'Propre.', encore: 'Encore un run ?', monde: 'Mon spot', coffre: 'Sac' },
    font: { weight: '900', letterSpacing: 0.5, radius: 6 },
  },
  enquete: {
    id: 'enquete',
    name: 'Enquête',
    audience: 'grands',
    tagline: 'Indices, dossiers et tampons rouges',
    colors: {
      bg: '#efe4cc', card: '#fffaf0', ink: '#2b2118', soft: '#6e5f4c', line: '#d9c9a8',
      primary: '#8b1e1e', primaryDark: '#5c1010', onPrimary: '#ffffff', primaryTint: '#f3dcd6',
      sun: '#e0b84a', sunDark: '#a8842a', onSun: '#2b2118',
      ok: '#0f6a48', okBg: '#d9f5e8', ko: '#a12a22', koBg: '#fde3e1',
    },
    currency: 'indices',
    currencySymbol: '✚',
    costume: 'loupe',
    celebration: 'tampon',
    tone: 'ado',
    words: { mission: 'Affaire du jour', bravo: 'Affaire classée.', encore: 'Dossier suivant ?', monde: 'Mon bureau', coffre: 'Dossier scellé' },
    font: { weight: '700', letterSpacing: 1, radius: 6 },
  },
};

export const UNIVERS_LIST: Univers[] = Object.values(UNIVERS);

export const DEFAULT_UNIVERS: UniversId = 'classique';

export function isUniversId(value: unknown): value is UniversId {
  return typeof value === 'string' && value in UNIVERS;
}
