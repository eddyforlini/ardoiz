import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ChoiceExercise } from '@/content/types';
import { Prompt, Tile, type GameProps } from './shared';

/** Question à choix : une réponse, vérification immédiate */
export function ChoiceGame({ exercise, onAnswer, done }: GameProps<ChoiceExercise>) {
  const [picked, setPicked] = useState<number | null>(null);
  const short = exercise.options.every((o) => o.length <= 4);

  return (
    <View style={styles.wrap}>
      <Prompt text={exercise.prompt} speakText={exercise.speak ? `${exercise.prompt} ${exercise.speak}` : undefined} />
      <View style={[styles.grid, short && styles.gridRow]}>
        {exercise.options.map((opt, i) => {
          let state: 'idle' | 'ok' | 'ko' | 'ghost' = 'idle';
          if (done) {
            if (i === exercise.answer) state = 'ok';
            else if (i === picked) state = 'ko';
            else state = 'ghost';
          }
          return (
            <Tile
              key={opt}
              label={opt}
              big={short}
              state={state}
              disabled={done}
              style={short ? styles.half : undefined}
              onPress={() => {
                setPicked(i);
                onAnswer(i === exercise.answer);
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
  grid: { gap: 10 },
  gridRow: { flexDirection: 'row', flexWrap: 'wrap' },
  half: { flexGrow: 1, flexBasis: '40%' },
});
