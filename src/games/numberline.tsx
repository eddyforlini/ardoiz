import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { NumberlineExercise } from '@/content/types';
import { useUnivers } from '@/univers/UniversProvider';
import { Prompt, type GameProps } from './shared';

/** Ce qui atterrit sur la droite, selon l'univers */
const LANDER: Record<string, string> = {
  classique: '🎈',
  hero: '🦸',
  manga: '🌸',
  espace: '🚀',
  dino: '🦕',
  gaming: '👾',
  street: '🛹',
  enquete: '🔍',
};

/** Droite graduée : toucher la bonne graduation */
export function NumberlineGame({ exercise, onAnswer, done }: GameProps<NumberlineExercise>) {
  const { univers } = useUnivers();
  const c = univers.colors;
  const [picked, setPicked] = useState<number | null>(null);

  // Graduations calculées par index, pour que 0,1 + 0,1 + 0,1 fasse bien 0,3 (nombres décimaux du CM1)
  const decimals = (String(exercise.step).split('.')[1] ?? '').length;
  const count = Math.round((exercise.max - exercise.min) / exercise.step) + 1;
  const ticks = Array.from({ length: count }, (_, i) => Number((exercise.min + i * exercise.step).toFixed(decimals)));
  const landerIndex = picked === null ? 0 : ticks.indexOf(picked);
  const show = (v: number) => String(v).replace('.', ',');

  return (
    <View style={styles.wrap}>
      <Prompt text={exercise.prompt} />
      <View style={styles.area}>
        <Text style={[styles.lander, { left: `${(landerIndex / (count - 1)) * 100}%` }]}>{LANDER[univers.id] ?? '🎈'}</Text>
        <View style={[styles.axis, { backgroundColor: c.ink }]} />
        <View style={styles.ticks}>
          {ticks.map((v) => {
            const isPick = picked === v;
            const isAnswer = v === exercise.answer;
            const bg = done && isAnswer ? c.okBg : done && isPick ? c.koBg : isPick ? c.primaryTint : c.card;
            const border = done && isAnswer ? c.ok : done && isPick ? c.ko : isPick ? c.primary : c.ink;
            return (
              <View key={v} style={styles.tickCol}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Graduation ${show(v)}`}
                  disabled={done}
                  onPress={() => {
                    setPicked(v);
                    onAnswer(v === exercise.answer);
                  }}
                  style={[styles.tick, { backgroundColor: bg, borderColor: border }]}
                />
                <Text style={[styles.label, { color: c.ink, fontWeight: univers.font.weight }]}>
                  {ticks.indexOf(v) % 2 === 0 || count <= 6 ? show(v) : ''}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  area: { paddingTop: 54, paddingHorizontal: 12 },
  lander: { position: 'absolute', top: 0, fontSize: 36, marginLeft: -6 },
  axis: { height: 4, borderRadius: 2, position: 'absolute', left: 24, right: 24, top: 70 },
  ticks: { flexDirection: 'row', justifyContent: 'space-between' },
  tickCol: { alignItems: 'center', gap: 6, width: 30 },
  tick: { width: 28, height: 28, borderRadius: 14, borderWidth: 3 },
  label: { fontSize: 13, minHeight: 16 },
});
