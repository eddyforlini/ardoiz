import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { TapWordExercise } from '@/content/types';
import { Body, Button } from '@/components/ui';
import { useUnivers } from '@/univers/UniversProvider';
import { Prompt, type GameProps } from './shared';

/** Toucher le bon mot : le verbe, le sujet, le nom... dans une phrase */
export function TapWordGame({ exercise, onAnswer, done }: GameProps<TapWordExercise>) {
  const { univers } = useUnivers();
  const c = univers.colors;
  const [selected, setSelected] = useState<number[]>([]);
  const several = exercise.answer.length > 1;

  function toggle(i: number) {
    if (several) setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));
    else {
      setSelected([i]);
      onAnswer(exercise.answer.includes(i));
    }
  }

  function check() {
    const ok = selected.length === exercise.answer.length && selected.every((i) => exercise.answer.includes(i));
    onAnswer(ok);
  }

  return (
    <View style={styles.wrap}>
      <Prompt text={exercise.prompt} speakText={`${exercise.prompt}. ${exercise.words.join(' ')}`} />
      <View style={styles.sentence}>
        {exercise.words.map((w, i) => {
          const isAnswer = exercise.answer.includes(i);
          const isSel = selected.includes(i);
          const bg = done ? (isAnswer ? c.okBg : isSel ? c.koBg : 'transparent') : isSel ? c.primaryTint : 'transparent';
          const border = done ? (isAnswer ? c.ok : isSel ? c.ko : 'transparent') : isSel ? c.primary : 'transparent';
          return (
            <Pressable
              key={i}
              accessibilityRole="button"
              disabled={done}
              onPress={() => toggle(i)}
              style={[styles.word, { backgroundColor: bg, borderColor: border }]}>
              <Text style={[styles.wordText, { color: c.ink, fontWeight: isSel || (done && isAnswer) ? '800' : '500' }]}>{w}</Text>
            </Pressable>
          );
        })}
      </View>
      {several && !done && (
        <>
          <Body muted style={styles.center}>Touche tous les bons mots, puis vérifie.</Body>
          <Button label="Vérifier" disabled={selected.length === 0} onPress={check} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  sentence: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  word: { borderWidth: 2, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10 },
  wordText: { fontSize: 22 },
  center: { textAlign: 'center' },
});
