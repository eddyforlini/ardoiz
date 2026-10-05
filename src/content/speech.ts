import * as Speech from 'expo-speech';

/**
 * Ardoiz parle : lecture à voix haute avec la voix du téléphone.
 * Tout texte affiché à l'enfant doit pouvoir passer par ici.
 */
export function speak(text: string) {
  Speech.stop();
  Speech.speak(text, { language: 'fr-FR', rate: 0.9 });
}

export function stopSpeaking() {
  Speech.stop();
}
