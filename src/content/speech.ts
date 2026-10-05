import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';

/**
 * Ardoiz parle : lecture à voix haute avec la voix du téléphone.
 * Tout texte affiché à l'enfant doit pouvoir passer par ici.
 */
export function speak(text: string) {
  stopPlayer();
  Speech.stop();
  Speech.speak(text, { language: 'fr-FR', rate: 0.9 });
}

export function stopSpeaking() {
  stopPlayer();
  Speech.stop();
}

let player: AudioPlayer | null = null;

function stopPlayer() {
  if (!player) return;
  try {
    player.pause();
    player.remove();
  } catch {
    // Le lecteur peut déjà être libéré.
  }
  player = null;
}

/**
 * Dit un mot : la voix du parent si elle a été enregistrée, sinon la voix de synthèse.
 * Si l'enregistrement ne se lit pas (fichier disparu, web), on retombe sur la synthèse.
 */
export function sayWord(text: string, audio?: string) {
  if (!audio) {
    speak(text);
    return;
  }
  try {
    stopSpeaking();
    player = createAudioPlayer({ uri: audio });
    player.play();
  } catch {
    speak(text);
  }
}
