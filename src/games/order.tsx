import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { OrderExercise } from '@/content/types';
import { Body } from '@/components/ui';
import { useUnivers } from '@/univers/UniversProvider';
import { Prompt, Tile, shuffle, type GameProps } from './shared';

/** Vers dans l'ordre : on touche les lignes dans le bon ordre */
export function OrderGame({ exercise, onAnswer, done }: GameProps<OrderExercise>) {
  const { univers } = useUnivers();
  const c = univers.colors;
  const pool = useMemo(() => shuffle(exercise.lines.map((text, id) => ({ text, id }))), [exercise]);
  const [chosen, setChosen] = useState<number[]>([]);
  const full = chosen.length === exercise.lines.length;
  const correct = full && chosen.every((id, i) => id === i);

  useEffect(() => {
    if (full && !done) onAnswer(correct);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full]);

  return (
    <View style={styles.wrap}>
      <Prompt text={exercise.prompt} speakText={`${exercise.prompt}. ${exercise.lines.join('. ')}`} />
      <View style={styles.slots}>
        {exercise.lines.map((_, i) => {
          const id = chosen[i];
          const text = id === undefined ? '' : exercise.lines[id];
          const good = done && id === i;
          const bad = done && id !== undefined && id !== i;
          return (
            <View
              key={i}
              style={[
                styles.slot,
                {
                  borderColor: good ? c.ok : bad ? c.ko : text ? c.primary : c.line,
                  backgroundColor: good ? c.okBg : bad ? c.koBg : text ? c.primaryTint : 'transparent',
                  borderStyle: text ? 'solid' : 'dashed',
                },
              ]}>
              <Text style={[styles.num, { color: c.soft }]}>{i + 1}</Text>
              <Body bold style={styles.slotText} onPress={done || !text ? undefined : () => setChosen((ch) => ch.filter((_, j) => j !== i))}>
                {text}
              </Body>
            </View>
          );
        })}
      </View>
      {done && !correct && (
        <View style={[styles.fix, { backgroundColor: c.okBg }]}>
          {exercise.lines.map((l, i) => (
            <Body key={i} style={{ color: c.ok }}>
              {i + 1}. {l}
            </Body>
          ))}
        </View>
      )}
      <View style={styles.pool}>
        {pool.map((l) => (
          <Tile
            key={l.id}
            label={l.text}
            state={chosen.includes(l.id) ? 'ghost' : 'idle'}
            disabled={done || chosen.includes(l.id) || full}
            style={styles.line}
            onPress={() => setChosen((ch) => [...ch, l.id])}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  slots: { gap: 6 },
  slot: { minHeight: 42, borderWidth: 2, borderRadius: 10, paddingVertical: 8, paddingLeft: 34, paddingRight: 10, justifyContent: 'center' },
  num: { position: 'absolute', left: 12, top: 10, fontSize: 12, fontWeight: '700' },
  slotText: { minHeight: 20 },
  fix: { borderRadius: 10, padding: 10, gap: 2 },
  pool: { gap: 8 },
  line: { alignItems: 'flex-start' },
});
