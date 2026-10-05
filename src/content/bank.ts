import { LESSONS as CE1 } from './bank-ce1';
import { LESSONS as CE1_FRANCAIS } from './bank-ce1-francais';
import { LESSONS as CE1_MATHS } from './bank-ce1-maths';
import type { Lesson } from './types';

/**
 * Toute la banque, niveau par niveau. Un fichier par niveau et par matière
 * pour que chacun reste lisible ; les niveaux suivants s'ajoutent ici.
 */
export const LESSONS: Lesson[] = [...CE1, ...CE1_MATHS, ...CE1_FRANCAIS];
