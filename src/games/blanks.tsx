import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { BlanksExercise } from '@/content/types';
import { Button } from '@/components/ui';
import { useUnivers } from '@/univers/UniversProvider';
import { Prompt, Tile, shuffle, type GameProps } from './shared';

type Token = { kind: 'text'; value: string } | { kind: 'blank'; index: number; answer: string } | { kind: 'break' };

/** Découpe le texte en mots, trous ({{mot}}) et retours à la ligne */
function tokenize(text: string): { tokens: Token[]; answers: string[] } {
  const tokens: Token[] = [];
  const answers: string[] = [];
  const re = /\{\{(.+?)\}\}|\n/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) tokens.push({ kind: 'text', value: text.slice(last, m.index) });
    if (m[0] === '\n') tokens.push({ kind: 'break' });
    else {
      tokens.push({ kind: 'blank', index: answers.length, answer: m[1] });
      answers.push(m[1]);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) tokens.push({ kind: 'text', value: text.slice(last) });
  return { tokens, answers };
}

/** Mots manquants : toucher un trou, puis un mot de la réserve */
export function BlanksGame({ exercise, onAnswer, done }: GameProps<BlanksExercise>) {
  const { univers } = useUnivers();
  const c = univers.colors;
  const { tokens, answers } = useMemo(() => tokenize(exercise.text), [exercise.text]);
  const bank = useMemo(() => shuffle([...answers, ...exercise.distractors]), [answers, exercise.distractors]);
  const [filled, setFilled] = useState<(string | null)[]>(() => answers.map(() => null));
  const [active, setActive] = useState(0);

  const full = filled.every((f) => f !== null);
  const speakText = exercise.text.replace(/\{\{(.+?)\}\}/g, '$1').replace(/\n/g, '. ');

  function place(word: string) {
    const next = [...filled];
    next[active] = word;
    setFilled(next);
    const nextEmpty = next.findIndex((f, i) => f === null && i > active);
    setActive(nextEmpty === -1 ? next.findIndex((f) => f === null) : nextEmpty);
  }

  return (
    <View style={styles.wrap}>
      <Prompt text={exercise.prompt} speakText={speakText} />
      <View style={styles.text}>
        {tokens.map((t, i) => {
          if (t.kind === 'break') return <View key={i} style={styles.break} />;
          if (t.kind === 'text')
            return (
              <Text key={i} style={[styles.word, { color: c.ink }]}>
                {t.value}
              </Text>
            );
          const value = filled[t.index];
          const good = done && value === t.answer;
          const bad = done && value !== t.answer;
          const isActive = !done && active === t.index;
          return (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={value ? `Trou ${t.index + 1} : ${value}` : `Trou ${t.index + 1} vide`}
              disabled={done}
              onPress={() => {
                if (value) {
                  const next = [...filled];
                  next[t.index] = null;
                  setFilled(next);
                }
                setActive(t.index);
              }}
              style={[
                styles.blank,
                {
                  borderBottomColor: good ? c.ok : bad ? c.ko : isActive ? c.primary : c.line,
                  backgroundColor: good ? c.okBg : bad ? c.koBg : value ? c.primaryTint : 'transparent',
                },
              ]}>
              <Text style={[styles.word, { color: good ? c.ok : bad ? c.ko : c.primary, fontWeight: '800' }]}>
                {value ?? (bad ? '' : ' ')}
                {bad ? ` ${t.answer}` : ''}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.bank}>
        {bank.map((w, i) => (
          <Tile
            key={`${w}-${i}`}
            label={w}
            state={filled.includes(w) ? 'ghost' : 'idle'}
            disabled={done || filled.includes(w) || full}
            onPress={() => place(w)}
          />
        ))}
      </View>
      {!done && (
        <Button
          label="Vérifier"
          disabled={!full}
          onPress={() => onAnswer(filled.every((f, i) => f === answers[i]))}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  text: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', rowGap: 10 },
  break: { width: '100%', height: 0 },
  word: { fontSize: 18, lineHeight: 30 },
  blank: { minWidth: 80, borderBottomWidth: 3, paddingHorizontal: 6, borderRadius: 6 },
  bank: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
});
