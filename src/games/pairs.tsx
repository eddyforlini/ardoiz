import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PairsExercise } from '@/content/types';
import { Body } from '@/components/ui';
import { useUnivers } from '@/univers/UniversProvider';
import { Prompt, shuffle, type GameProps } from './shared';

type CardT = { id: number; pair: number; text: string };

/** Memory : les cartes sont retournées, il faut retrouver les paires. Réussi si peu d'erreurs. */
export function PairsGame({ exercise, onAnswer, done }: GameProps<PairsExercise>) {
  const { univers } = useUnivers();
  const c = univers.colors;
  const cards = useMemo<CardT[]>(
    () => shuffle(exercise.pairs.flatMap((p, pair) => [{ id: pair * 2, pair, text: p.a }, { id: pair * 2 + 1, pair, text: p.b }])),
    [exercise],
  );
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<Set<number>>(new Set());
  const [misses, setMisses] = useState(0);
  const allowed = exercise.pairs.length;

  useEffect(() => {
    if (open.length !== 2) return;
    const [a, b] = open.map((id) => cards.find((k) => k.id === id)!);
    const t = setTimeout(() => {
      if (a.pair === b.pair) setFound((f) => new Set(f).add(a.pair));
      else setMisses((m) => m + 1);
      setOpen([]);
    }, a.pair === b.pair ? 300 : 900);
    return () => clearTimeout(t);
  }, [open, cards]);

  useEffect(() => {
    if (found.size === exercise.pairs.length && !done) onAnswer(misses <= allowed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [found]);

  function flip(id: number) {
    if (done || open.length === 2 || open.includes(id)) return;
    setOpen((o) => [...o, id]);
  }

  return (
    <View style={styles.wrap}>
      <Prompt text={exercise.prompt} />
      <View style={styles.grid}>
        {cards.map((k) => {
          const faceUp = open.includes(k.id) || found.has(k.pair);
          const isFound = found.has(k.pair);
          return (
            <Pressable
              key={k.id}
              accessibilityRole="button"
              accessibilityLabel={faceUp ? k.text : 'Carte retournée'}
              disabled={done || faceUp}
              onPress={() => flip(k.id)}
              style={[
                styles.card,
                {
                  backgroundColor: isFound ? c.okBg : faceUp ? c.card : c.primary,
                  borderColor: isFound ? c.ok : faceUp ? c.primary : c.primaryDark,
                  borderRadius: Math.max(10, univers.font.radius - 6),
                },
              ]}>
              <Text style={[styles.text, { color: isFound ? c.ok : faceUp ? c.ink : c.onPrimary, fontWeight: univers.font.weight }]}>
                {faceUp ? k.text : '?'}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Body muted style={styles.center}>
        {found.size} / {exercise.pairs.length} paires · {misses} essai{misses > 1 ? 's' : ''} raté{misses > 1 ? 's' : ''}
      </Body>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  card: { width: '30%', minHeight: 64, borderWidth: 2, borderBottomWidth: 4, alignItems: 'center', justifyContent: 'center', padding: 6 },
  text: { fontSize: 18, textAlign: 'center' },
  center: { textAlign: 'center' },
});
