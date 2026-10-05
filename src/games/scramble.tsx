import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ScrambleExercise } from '@/content/types';
import { speak } from '@/content/speech';
import { useUnivers } from '@/univers/UniversProvider';
import { Prompt, Tile, shuffle, type GameProps } from './shared';

/** Lettres en vrac : le mot est dit à voix haute, on le reconstruit lettre par lettre */
export function ScrambleGame({ exercise, onAnswer, done }: GameProps<ScrambleExercise>) {
  const { univers } = useUnivers();
  const c = univers.colors;
  const letters = useMemo(
    () => shuffle(exercise.word.split('').map((ch, i) => ({ ch, id: i }))),
    [exercise.word],
  );
  const [used, setUsed] = useState<number[]>([]);

  useEffect(() => {
    speak(exercise.word);
  }, [exercise.word]);

  const built = used.map((id) => letters.find((l) => l.id === id)?.ch ?? '').join('');
  const full = used.length === exercise.word.length;

  useEffect(() => {
    if (full && !done) onAnswer(built === exercise.word);
    // onAnswer est stable pour la durée du jeu ; on ne veut réagir qu'au remplissage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full]);

  return (
    <View style={styles.wrap}>
      <Prompt text="Écoute le mot et remets les lettres dans l'ordre" speakText={exercise.word} />
      <View style={styles.answer}>
        {exercise.word.split('').map((_, i) => {
          const ch = built[i] ?? '';
          const color = done ? (built === exercise.word ? c.ok : c.ko) : c.ink;
          return (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={ch ? `Retirer ${ch}` : 'Case vide'}
              disabled={done || !ch}
              onPress={() => setUsed((u) => u.filter((_, j) => j !== i))}
              style={[styles.slot, { borderBottomColor: color }]}>
              <Text style={{ color, fontSize: 28, fontWeight: univers.font.weight }}>{ch}</Text>
            </Pressable>
          );
        })}
      </View>
      {done && built !== exercise.word && (
        <Text style={[styles.correction, { color: c.ok }]}>{exercise.word}</Text>
      )}
      <View style={styles.pool}>
        {letters.map((l) => (
          <Tile
            key={l.id}
            label={l.ch}
            big
            state={used.includes(l.id) ? 'ghost' : 'idle'}
            disabled={done || used.includes(l.id) || full}
            style={styles.letter}
            onPress={() => setUsed((u) => [...u, l.id])}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 18 },
  answer: { flexDirection: 'row', justifyContent: 'center', gap: 6, flexWrap: 'wrap' },
  slot: { width: 36, height: 46, borderBottomWidth: 4, alignItems: 'center', justifyContent: 'center' },
  correction: { textAlign: 'center', fontSize: 22, fontWeight: '800', letterSpacing: 2 },
  pool: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  letter: { width: 48, paddingHorizontal: 0 },
});
