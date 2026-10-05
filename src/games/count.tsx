import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { CountExercise } from '@/content/types';
import { useUnivers } from '@/univers/UniversProvider';
import { Prompt, Tile, type GameProps } from './shared';

/** Objet compté selon l'univers, pour que le jeu change d'habit */
const ITEM: Record<string, string> = {
  hero: '⚡',
  manga: '🌸',
  espace: '⭐',
  dino: '🥚',
  gaming: '💎',
  street: '🧢',
  enquete: '🔍',
};

/** Dénombrer : on touche les objets pour les marquer, puis on choisit le nombre */
export function CountGame({ exercise, onAnswer, done }: GameProps<CountExercise>) {
  const { univers } = useUnivers();
  const c = univers.colors;
  const emoji = ITEM[univers.id] ?? exercise.emoji;
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [picked, setPicked] = useState<number | null>(null);
  const cells = useMemo(() => Array.from({ length: exercise.answer }, (_, i) => i), [exercise.answer]);

  function toggle(i: number) {
    setMarked((m) => {
      const next = new Set(m);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <View style={styles.wrap}>
      <Prompt text={exercise.prompt} />
      <View style={[styles.grid, { backgroundColor: c.bg, borderRadius: univers.font.radius }]}>
        {cells.map((i) => (
          <Pressable key={i} accessibilityRole="button" accessibilityLabel={`Objet ${i + 1}`} disabled={done} onPress={() => toggle(i)} style={[styles.cell, { opacity: marked.has(i) ? 0.35 : 1 }]}>
            <Text style={styles.emoji}>{emoji}</Text>
            {marked.has(i) && <Text style={[styles.tick, { color: c.primary }]}>{[...marked].sort((a, b) => a - b).indexOf(i) + 1}</Text>}
          </Pressable>
        ))}
      </View>
      <View style={styles.options}>
        {exercise.options.map((n) => {
          let state: 'idle' | 'ok' | 'ko' | 'ghost' = 'idle';
          if (done) state = n === exercise.answer ? 'ok' : n === picked ? 'ko' : 'ghost';
          return (
            <Tile
              key={n}
              label={String(n)}
              big
              state={state}
              disabled={done}
              style={styles.opt}
              onPress={() => {
                setPicked(n);
                onAnswer(n === exercise.answer);
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8, justifyContent: 'center' },
  cell: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 30 },
  tick: { position: 'absolute', right: 2, top: 0, fontSize: 12, fontWeight: '800' },
  options: { flexDirection: 'row', gap: 10 },
  opt: { flex: 1 },
});
