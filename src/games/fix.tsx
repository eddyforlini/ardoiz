import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { FixExercise } from '@/content/types';
import { Gribouille } from '@/components/gribouille';
import { Body } from '@/components/ui';
import { useUnivers } from '@/univers/UniversProvider';
import { Prompt, Tile, shuffle, type GameProps } from './shared';

/**
 * Corrige Gribouille : la mascotte a fait une faute, l'enfant tient le stylo
 * rouge. D'abord trouver le mot faux, puis choisir la bonne correction.
 */
export function FixGame({ exercise, onAnswer, done }: GameProps<FixExercise>) {
  const { univers } = useUnivers();
  const c = univers.colors;
  const [tapped, setTapped] = useState<number | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const options = useMemo(() => shuffle([exercise.correct, ...exercise.distractors]), [exercise]);
  const found = tapped === exercise.wrongIndex;

  function tap(i: number) {
    if (done || found) return;
    setTapped(i);
    if (i !== exercise.wrongIndex) onAnswer(false);
  }

  return (
    <View style={styles.wrap}>
      <Prompt text={exercise.prompt} speakText={`${exercise.prompt}. ${exercise.words.join(' ')}`} />
      <View style={styles.row}>
        <Gribouille size={64} mood={done ? (picked === exercise.correct ? 'content' : 'curieux') : 'curieux'} />
        <View style={[styles.paper, { backgroundColor: c.card, borderColor: c.line }]}>
          <View style={styles.words}>
            {exercise.words.map((w, i) => {
              const isWrong = i === exercise.wrongIndex;
              const show = done || found;
              const bg = show && isWrong ? c.koBg : tapped === i && !isWrong ? c.koBg : 'transparent';
              const border = show && isWrong ? c.ko : tapped === i && !isWrong ? c.ko : 'transparent';
              return (
                <Pressable key={i} accessibilityRole="button" disabled={done || found} onPress={() => tap(i)} style={[styles.word, { backgroundColor: bg, borderColor: border }]}>
                  <Text style={[styles.wordText, { color: c.ink, textDecorationLine: show && isWrong ? 'line-through' : 'none' }]}>{w}</Text>
                  {done && isWrong && <Text style={[styles.fixed, { color: c.ok }]}>{exercise.correct}</Text>}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {!found && !done && <Body muted style={styles.center}>Touche le mot où Gribouille s'est trompé.</Body>}
      {tapped !== null && !found && done && (
        <Body style={[styles.center, { color: c.ko }]}>Ce n'était pas celui-là : regarde le mot barré.</Body>
      )}

      {(found || done) && (
        <>
          <Body bold style={styles.center}>
            {found && !done ? 'Bien vu ! Par quoi le remplacer ?' : ''}
          </Body>
          <View style={styles.options}>
            {options.map((o) => {
              let state: 'idle' | 'ok' | 'ko' | 'ghost' = 'idle';
              if (done) state = o === exercise.correct ? 'ok' : o === picked ? 'ko' : 'ghost';
              return (
                <Tile
                  key={o}
                  label={o}
                  state={state}
                  disabled={done}
                  onPress={() => {
                    setPicked(o);
                    onAnswer(o === exercise.correct);
                  }}
                />
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  paper: { flex: 1, borderWidth: 2, borderRadius: 12, padding: 10 },
  words: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, alignItems: 'flex-end' },
  word: { borderWidth: 2, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 4, alignItems: 'center' },
  wordText: { fontSize: 20 },
  fixed: { fontSize: 14, fontWeight: '800' },
  center: { textAlign: 'center' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
});
