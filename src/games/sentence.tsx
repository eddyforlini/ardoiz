import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { SentenceExercise } from '@/content/types';
import { Body } from '@/components/ui';
import { useUnivers } from '@/univers/UniversProvider';
import { Prompt, Tile, shuffle, type GameProps } from './shared';

/** Phrase à reconstruire : les mots en vrac, à toucher dans l'ordre */
export function SentenceGame({ exercise, onAnswer, done }: GameProps<SentenceExercise>) {
  const { univers } = useUnivers();
  const c = univers.colors;
  const pool = useMemo(() => shuffle(exercise.words.map((text, id) => ({ text, id }))), [exercise]);
  const [chosen, setChosen] = useState<number[]>([]);
  const full = chosen.length === exercise.words.length;
  const correct = full && chosen.every((id, i) => id === i);

  useEffect(() => {
    if (full && !done) onAnswer(correct);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full]);

  return (
    <View style={styles.wrap}>
      <Prompt text={exercise.prompt} speakText={`${exercise.prompt}. ${exercise.words.join(' ')}`} />
      <View
        style={[
          styles.line,
          {
            borderColor: done ? (correct ? c.ok : c.ko) : c.line,
            backgroundColor: done ? (correct ? c.okBg : c.koBg) : c.card,
            borderRadius: univers.font.radius,
          },
        ]}>
        {chosen.length === 0 && <Body muted>Touche les mots dans l'ordre.</Body>}
        {chosen.map((id, i) => (
          <Text
            key={i}
            onPress={done ? undefined : () => setChosen((ch) => ch.filter((_, j) => j !== i))}
            style={[styles.word, { color: done ? (correct ? c.ok : c.ko) : c.ink, fontWeight: '700' }]}>
            {exercise.words[id]}
          </Text>
        ))}
      </View>
      {done && !correct && (
        <Body style={{ color: c.ok }} bold>
          {exercise.words.join(' ')}
        </Body>
      )}
      <View style={styles.pool}>
        {pool.map((w) => (
          <Tile key={w.id} label={w.text} state={chosen.includes(w.id) ? 'ghost' : 'idle'} disabled={done || chosen.includes(w.id) || full} onPress={() => setChosen((ch) => [...ch, w.id])} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  line: { minHeight: 56, borderWidth: 2, padding: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  word: { fontSize: 20 },
  pool: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
});
