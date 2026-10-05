import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { SortExercise } from '@/content/types';
import { Body, Button } from '@/components/ui';
import { useUnivers } from '@/univers/UniversProvider';
import { Prompt, Tile, shuffle, type GameProps } from './shared';

/** Trier : on touche un mot, puis la boîte où il va. On vérifie à la fin. */
export function SortGame({ exercise, onAnswer, done }: GameProps<SortExercise>) {
  const { univers } = useUnivers();
  const c = univers.colors;
  const items = useMemo(() => shuffle(exercise.items.map((it, id) => ({ ...it, id }))), [exercise]);
  const [placed, setPlaced] = useState<Record<number, number>>({});
  const [active, setActive] = useState<number | null>(null);
  const remaining = items.filter((it) => placed[it.id] === undefined);
  const full = remaining.length === 0;

  function drop(box: number) {
    if (active === null) return;
    setPlaced((p) => ({ ...p, [active]: box }));
    setActive(null);
  }

  return (
    <View style={styles.wrap}>
      <Prompt text={exercise.prompt} />
      <View style={styles.boxes}>
        {exercise.boxes.map((label, box) => (
          <Pressable
            key={box}
            accessibilityRole="button"
            accessibilityLabel={`Boîte ${label}`}
            disabled={done || active === null}
            onPress={() => drop(box)}
            style={[
              styles.box,
              {
                borderColor: active !== null ? c.primary : c.line,
                backgroundColor: active !== null ? c.primaryTint : c.card,
                borderRadius: univers.font.radius,
              },
            ]}>
            <Text style={[styles.boxTitle, { color: c.primary, fontWeight: univers.font.weight }]}>{label}</Text>
            <View style={styles.boxWords}>
              {items
                .filter((it) => placed[it.id] === box)
                .map((it) => {
                  const good = done && it.box === box;
                  const bad = done && it.box !== box;
                  return (
                    <Pressable
                      key={it.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Retirer ${it.word}`}
                      disabled={done || active !== null}
                      onPress={() =>
                        setPlaced((p) => {
                          const next = { ...p };
                          delete next[it.id];
                          return next;
                        })
                      }
                      style={[
                        styles.chip,
                        {
                          backgroundColor: good ? c.okBg : bad ? c.koBg : c.bg,
                          borderColor: good ? c.ok : bad ? c.ko : c.line,
                        },
                      ]}>
                      <Text style={{ color: good ? c.ok : bad ? c.ko : c.ink, fontWeight: '700' }}>
                        {it.word}
                        {bad ? ` → ${exercise.boxes[it.box]}` : ''}
                      </Text>
                    </Pressable>
                  );
                })}
            </View>
          </Pressable>
        ))}
      </View>
      {remaining.length > 0 ? (
        <>
          <Body muted style={styles.center}>
            {active === null ? 'Touche un mot, puis sa boîte.' : 'Maintenant, touche la boîte.'}
          </Body>
          <View style={styles.pool}>
            {remaining.map((it) => (
              <Tile key={it.id} label={it.word} state={active === it.id ? 'selected' : 'idle'} disabled={done} onPress={() => setActive(active === it.id ? null : it.id)} />
            ))}
          </View>
        </>
      ) : (
        !done && <Button label="Vérifier" disabled={!full} onPress={() => onAnswer(items.every((it) => placed[it.id] === it.box))} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  boxes: { flexDirection: 'row', gap: 10 },
  box: { flex: 1, minHeight: 120, borderWidth: 2, borderStyle: 'dashed', padding: 8, gap: 6 },
  boxTitle: { fontSize: 15, textAlign: 'center' },
  boxWords: { gap: 4 },
  chip: { borderWidth: 1.5, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8 },
  center: { textAlign: 'center' },
  pool: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
});
