import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Button } from '@/components/ui';
import { speak } from '@/content/speech';
import type { FlashcardExercise } from '@/content/types';
import { useUnivers } from '@/univers/UniversProvider';
import { Prompt, type GameProps } from './shared';

/**
 * Carte mémoire auto-évaluée, comme Anki ou Quizlet : l'enfant lit le recto,
 * répond dans sa tête ou à voix haute, retourne la carte, puis dit s'il
 * savait. « Pas encore » renvoie la carte en fin de mission et la fait
 * revenir plus tôt. On fait confiance à l'enfant : c'est lui que ça aide.
 */
export function FlashcardGame({ exercise, onAnswer, done }: GameProps<FlashcardExercise>) {
  const { univers } = useUnivers();
  const c = univers.colors;
  const [flipped, setFlipped] = useState(false);

  return (
    <View style={styles.wrap}>
      <Prompt text={exercise.prompt} speakText={exercise.speak ?? `${exercise.prompt}. ${exercise.front}`} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={flipped ? 'Réponse' : 'Retourner la carte'}
        disabled={flipped}
        onPress={() => {
          setFlipped(true);
          speak(exercise.back);
        }}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: flipped ? c.card : c.primary,
            borderColor: flipped ? c.primary : c.primaryDark,
            borderRadius: univers.font.radius,
            opacity: pressed ? 0.85 : 1,
          },
        ]}>
        <Text style={[styles.small, { color: flipped ? c.soft : c.onPrimary }]}>{flipped ? exercise.front : 'Question'}</Text>
        <Text style={[styles.text, { color: flipped ? c.ink : c.onPrimary, fontWeight: univers.font.weight }]}>
          {flipped ? exercise.back : exercise.front}
        </Text>
        {!flipped && <Text style={[styles.small, { color: c.onPrimary }]}>Touche la carte pour voir la réponse</Text>}
      </Pressable>
      {flipped && !done && (
        <View style={styles.row}>
          <Button label="Pas encore" variant="ghost" style={styles.half} onPress={() => onAnswer(false)} />
          <Button label="Je savais !" variant="sun" style={styles.half} onPress={() => onAnswer(true)} />
        </View>
      )}
      {!flipped && <Body muted style={styles.center}>Réponds dans ta tête ou à voix haute, puis vérifie.</Body>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  card: { minHeight: 180, borderWidth: 2, borderBottomWidth: 6, padding: 20, alignItems: 'center', justifyContent: 'center', gap: 10 },
  small: { fontSize: 13, fontWeight: '700' },
  text: { fontSize: 24, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  center: { textAlign: 'center' },
});
