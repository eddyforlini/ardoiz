import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { DictationExercise } from '@/content/types';
import { sayWord, speak } from '@/content/speech';
import { Body, Button } from '@/components/ui';
import { useUnivers } from '@/univers/UniversProvider';
import { Prompt, type GameProps } from './shared';

/** Compare sans tenir compte des majuscules ni des espaces autour */
function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Dictée : on entend le mot (et sa phrase), on l'écrit au clavier */
export function DictationGame({ exercise, onAnswer, done }: GameProps<DictationExercise>) {
  const { univers } = useUnivers();
  const c = univers.colors;
  const [value, setValue] = useState('');
  const sentence = exercise.sentence ? `${exercise.word}. ${exercise.sentence}` : exercise.word;

  useEffect(() => {
    // La voix du parent dit le mot seul ; la phrase d'exemple reste en synthèse
    if (exercise.audio) sayWord(exercise.word, exercise.audio);
    else speak(sentence);
  }, [sentence, exercise.word, exercise.audio]);

  const correct = normalize(value) === normalize(exercise.word);

  return (
    <View style={styles.wrap}>
      <Prompt text="Écris le mot que tu entends" speakText={sentence} />
      <Pressable accessibilityRole="button" accessibilityLabel="Réécouter le mot" onPress={() => sayWord(exercise.word, exercise.audio)} style={[styles.replay, { backgroundColor: c.primaryTint }]}>
        <Text style={{ fontSize: 28 }}>🔊</Text>
        <Body bold style={{ color: c.primary }}>Réécouter</Body>
      </Pressable>
      <TextInput
        value={value}
        onChangeText={setValue}
        editable={!done}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        placeholder="..."
        placeholderTextColor={c.soft}
        accessibilityLabel="Le mot dicté"
        onSubmitEditing={() => value.trim() && onAnswer(correct)}
        style={[
          styles.input,
          {
            color: done ? (correct ? c.ok : c.ko) : c.ink,
            borderColor: done ? (correct ? c.ok : c.ko) : c.primary,
            backgroundColor: done ? (correct ? c.okBg : c.koBg) : c.card,
            borderRadius: univers.font.radius,
          },
        ]}
      />
      {done && !correct && (
        <Body style={styles.center}>
          Ça s'écrit : <Text style={{ color: c.ok, fontWeight: '800', fontSize: 20 }}>{exercise.word}</Text>
        </Body>
      )}
      {!done && <Button label="Vérifier" disabled={!value.trim()} onPress={() => onAnswer(correct)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  replay: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 99 },
  input: { borderWidth: 2, paddingVertical: 14, paddingHorizontal: 16, fontSize: 26, textAlign: 'center', fontWeight: '700' },
  center: { textAlign: 'center' },
});
