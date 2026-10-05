import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { TrueFalseExercise } from '@/content/types';
import { Body } from '@/components/ui';
import { useUnivers } from '@/univers/UniversProvider';
import { Prompt, Tile, type GameProps } from './shared';

const SECONDS = 8;

/** Vrai ou faux chrono : il faut se décider vite, mais le temps écoulé n'est pas une faute */
export function TrueFalseGame({ exercise, onAnswer, done }: GameProps<TrueFalseExercise>) {
  const { univers } = useUnivers();
  const c = univers.colors;
  const [left, setLeft] = useState(SECONDS);
  const [picked, setPicked] = useState<boolean | null>(null);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [done]);

  function pick(value: boolean) {
    setPicked(value);
    onAnswer(value === exercise.answer);
  }

  function state(value: boolean): 'idle' | 'ok' | 'ko' | 'ghost' {
    if (!done) return 'idle';
    if (value === exercise.answer) return 'ok';
    return value === picked ? 'ko' : 'ghost';
  }

  return (
    <View style={styles.wrap}>
      <Prompt text="Vrai ou faux ?" speakText={exercise.statement} />
      <View style={[styles.timer, { backgroundColor: c.line }]}>
        <View style={[styles.timerFill, { width: `${(left / SECONDS) * 100}%`, backgroundColor: left <= 2 ? c.ko : c.sun }]} />
      </View>
      <Text style={[styles.statement, { color: c.ink, fontWeight: univers.font.weight }]}>{exercise.statement}</Text>
      {left === 0 && !done && <Body muted style={styles.center}>Le temps est écoulé, mais tu peux encore répondre.</Body>}
      <View style={styles.row}>
        <Tile label="Vrai" big state={state(true)} disabled={done} style={styles.half} onPress={() => pick(true)} />
        <Tile label="Faux" big state={state(false)} disabled={done} style={styles.half} onPress={() => pick(false)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  timer: { height: 10, borderRadius: 99, overflow: 'hidden' },
  timerFill: { height: '100%', borderRadius: 99 },
  statement: { fontSize: 24, lineHeight: 32, textAlign: 'center', paddingVertical: 10 },
  center: { textAlign: 'center' },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
});
