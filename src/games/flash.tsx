import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { FlashExercise } from '@/content/types';
import { speak } from '@/content/speech';
import { Body } from '@/components/ui';
import { useUnivers } from '@/univers/UniversProvider';
import { Prompt, Tile, shuffle, type GameProps } from './shared';

const SHOW_MS = 2500;

/** Mémo-flash : le mot s'affiche quelques secondes, puis il faut retrouver la bonne écriture */
export function FlashGame({ exercise, onAnswer, done }: GameProps<FlashExercise>) {
  const { univers } = useUnivers();
  const c = univers.colors;
  const [phase, setPhase] = useState<'show' | 'pick'>('show');
  const [picked, setPicked] = useState<string | null>(null);
  const options = useMemo(() => shuffle([exercise.word, ...exercise.distractors]), [exercise]);

  useEffect(() => {
    speak(exercise.word);
    const t = setTimeout(() => setPhase('pick'), SHOW_MS);
    return () => clearTimeout(t);
  }, [exercise.word]);

  if (phase === 'show') {
    return (
      <View style={styles.wrap}>
        <Prompt text="Regarde bien le mot, il va disparaître" />
        <Text style={[styles.flash, { color: c.primary, fontWeight: univers.font.weight }]}>{exercise.word}</Text>
        <Body muted style={styles.center}>Photographie-le dans ta tête.</Body>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Prompt text="Quelle était la bonne écriture ?" speakText={exercise.word} />
      <View style={styles.grid}>
        {options.map((opt) => {
          let state: 'idle' | 'ok' | 'ko' | 'ghost' = 'idle';
          if (done) {
            if (opt === exercise.word) state = 'ok';
            else if (opt === picked) state = 'ko';
            else state = 'ghost';
          }
          return (
            <Tile
              key={opt}
              label={opt}
              state={state}
              disabled={done}
              onPress={() => {
                setPicked(opt);
                onAnswer(opt === exercise.word);
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  flash: { fontSize: 40, textAlign: 'center', letterSpacing: 2, paddingVertical: 24 },
  center: { textAlign: 'center' },
  grid: { gap: 10 },
});
