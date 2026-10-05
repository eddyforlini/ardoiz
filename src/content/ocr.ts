import { Platform } from 'react-native';

/**
 * Lecture du texte d'une photo sur le téléphone, sans serveur : le module
 * ML Kit (Apple et Google) est gratuit et hors ligne. Il n'existe pas dans
 * Expo Go : il faut une « dev build » (voir docs/dev-build.md). Tant qu'il
 * n'est pas là, la fonction le dit et le parent peut coller le texte.
 */
type Recognizer = { recognize: (uri: string) => Promise<{ text: string }> };

function load(): Recognizer | null {
  if (Platform.OS === 'web') return null;
  try {
    // Chargement tardif : le paquet peut être absent de la build (Expo Go)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@react-native-ml-kit/text-recognition') as { default?: Recognizer } & Recognizer;
    return mod.default ?? mod;
  } catch {
    return null;
  }
}

const recognizer = load();

export const ocrAvailable = recognizer !== null;

/** Le texte lu sur la photo, lignes dans l'ordre de la page. Vide si rien n'est lisible. */
export async function readText(uri: string): Promise<string> {
  if (!recognizer) throw new Error('La lecture du texte n\'est pas disponible dans cette version de l\'appli.');
  const result = await recognizer.recognize(uri);
  return (result.text ?? '').trim();
}
