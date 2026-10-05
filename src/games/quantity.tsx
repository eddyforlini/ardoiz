import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Button } from '@/components/ui';
import type { QuantityExercise } from '@/content/types';
import { useUnivers } from '@/univers/UniversProvider';
import { Prompt, type GameProps } from './shared';

/**
 * Manipulation de quantités, comme les cubes et les barres de la classe :
 * l'enfant pose des barres de dix et des cubes pour fabriquer le nombre
 * demandé. Il voit le nombre qu'il a construit, et valide quand il pense
 * y être.
 */
export function QuantityGame({ exercise, onAnswer, done }: GameProps<QuantityExercise>) {
  const { univers } = useUnivers();
  const c = univers.colors;
  const [tens, setTens] = useState(0);
  const [units, setUnits] = useState(0);
  const value = tens * 10 + units;
  const ok = value === exercise.target;

  return (
    <View style={styles.wrap}>
      <Prompt text={exercise.prompt} />
      <View style={[styles.board, { backgroundColor: c.bg, borderColor: c.line, borderRadius: univers.font.radius }]}>
        <View style={styles.pile}>
          {Array.from({ length: tens }, (_, i) => (
            <Pressable key={`t${i}`} accessibilityRole="button" accessibilityLabel="Retirer une barre de dix" disabled={done} onPress={() => setTens((n) => n - 1)}>
              <View style={[styles.bar, { backgroundColor: c.primary, borderColor: c.primaryDark }]}>
                {Array.from({ length: 10 }, (_, j) => (
                  <View key={j} style={[styles.notch, { borderColor: c.onPrimary }]} />
                ))}
              </View>
            </Pressable>
          ))}
        </View>
        <View style={styles.pile}>
          {Array.from({ length: units }, (_, i) => (
            <Pressable key={`u${i}`} accessibilityRole="button" accessibilityLabel="Retirer un cube" disabled={done} onPress={() => setUnits((n) => n - 1)}>
              <View style={[styles.cube, { backgroundColor: c.sun, borderColor: c.sunDark }]} />
            </Pressable>
          ))}
        </View>
        {tens + units === 0 && <Body muted style={styles.center}>Le plateau est vide.</Body>}
      </View>
      <Text style={[styles.value, { color: done ? (ok ? c.ok : c.ko) : c.ink }]}>
        {tens} dizaine{tens > 1 ? 's' : ''} et {units} unité{units > 1 ? 's' : ''} = {value}
      </Text>
      <View style={styles.row}>
        {exercise.tens && <Button label="+ barre de 10" style={styles.half} disabled={done || tens >= 9} onPress={() => setTens((n) => n + 1)} />}
        <Button label="+ cube" variant="sun" style={styles.half} disabled={done || units >= 19} onPress={() => setUnits((n) => n + 1)} />
      </View>
      <Button label="C'est bon !" variant="ghost" disabled={done || tens + units === 0} onPress={() => onAnswer(ok)} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  board: { minHeight: 150, borderWidth: 2, padding: 10, gap: 8, justifyContent: 'center' },
  pile: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  bar: { width: 110, height: 22, borderWidth: 2, borderRadius: 4, flexDirection: 'row' },
  notch: { flex: 1, borderRightWidth: 1 },
  cube: { width: 22, height: 22, borderWidth: 2, borderRadius: 4 },
  value: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  center: { textAlign: 'center' },
});
