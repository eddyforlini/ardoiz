import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { SpeedExercise } from '@/content/types';
import { Body } from '@/components/ui';
import { useUnivers } from '@/univers/UniversProvider';
import { Prompt, Tile, shuffle, type GameProps } from './shared';

/** Trois réponses proposées : la bonne et deux voisines plausibles */
function makeOptions(answer: number): number[] {
  const set = new Set<number>([answer]);
  const deltas = shuffle([-10, -1, 1, 2, 10, -2, 5]);
  for (const d of deltas) {
    if (set.size >= 3) break;
    if (answer + d >= 0) set.add(answer + d);
  }
  return shuffle([...set]);
}

/** Calcul éclair : enchaîner les calculs avant la fin du temps, avec combos */
export function SpeedGame({ exercise, onAnswer, done }: GameProps<SpeedExercise>) {
  const { univers } = useUnivers();
  const c = univers.colors;
  const items = useMemo(() => shuffle(exercise.items), [exercise]);
  const [index, setIndex] = useState(0);
  const [good, setGood] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [left, setLeft] = useState(exercise.seconds);
  const [flash, setFlash] = useState<'ok' | 'ko' | null>(null);
  const finished = useRef(false);
  const options = useMemo(() => (index < items.length ? makeOptions(items[index].a) : []), [index, items]);

  function finish(score: number) {
    if (finished.current) return;
    finished.current = true;
    onAnswer(score >= exercise.target);
  }

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [done]);

  useEffect(() => {
    if (left === 0) finish(good);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  function pick(value: number) {
    if (done || finished.current) return;
    const ok = value === items[index].a;
    const nextGood = ok ? good + 1 : good;
    const nextCombo = ok ? combo + 1 : 0;
    setGood(nextGood);
    setCombo(nextCombo);
    setBest((b) => Math.max(b, nextCombo));
    setFlash(ok ? 'ok' : 'ko');
    setTimeout(() => setFlash(null), 250);
    if (index + 1 >= items.length) finish(nextGood);
    else setIndex(index + 1);
  }

  const current = items[index];
  const over = done || index >= items.length;

  return (
    <View style={styles.wrap}>
      <Prompt text={exercise.prompt} />
      <View style={[styles.timer, { backgroundColor: c.line }]}>
        {/* Le temps qui passe, sans alarme rouge : la précision d'abord, la vitesse contre soi-même (décision 17) */}
        <View style={[styles.timerFill, { width: `${(left / exercise.seconds) * 100}%`, backgroundColor: c.sun }]} />
      </View>
      <View style={styles.row}>
        <Body bold>
          {good} / {exercise.target} bonnes réponses
        </Body>
        <Body bold style={{ color: c.primary }}>
          {combo >= 2 ? `Combo ×${combo} !` : ' '}
        </Body>
      </View>
      {over ? (
        <Body style={styles.center}>
          Terminé : {good} bonnes réponses, meilleur combo ×{best}.
        </Body>
      ) : (
        <>
          <Text
            style={[
              styles.question,
              { color: flash === 'ok' ? c.ok : flash === 'ko' ? c.ko : c.ink, fontWeight: univers.font.weight },
            ]}>
            {current.q} = ?
          </Text>
          <View style={styles.options}>
            {options.map((o) => (
              <Tile key={o} label={String(o)} big style={styles.opt} onPress={() => pick(o)} />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  timer: { height: 10, borderRadius: 99, overflow: 'hidden' },
  timerFill: { height: '100%', borderRadius: 99 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  question: { fontSize: 40, textAlign: 'center', paddingVertical: 12, fontVariant: ['tabular-nums'] },
  options: { flexDirection: 'row', gap: 10 },
  opt: { flex: 1 },
  center: { textAlign: 'center' },
});
