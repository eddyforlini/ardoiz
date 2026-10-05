import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Body, Chip } from '@/components/ui';
import type { MatchExercise } from '@/content/types';
import { useUnivers } from '@/univers/UniversProvider';
import { Prompt, Tile, shuffle, type GameProps } from './shared';

const RECORDS_KEY = 'ardoiz.records';

async function loadRecord(id: string): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(RECORDS_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    return all[id] ?? null;
  } catch {
    return null;
  }
}

async function saveRecord(id: string, seconds: number) {
  try {
    const raw = await AsyncStorage.getItem(RECORDS_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    all[id] = seconds;
    await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(all));
  } catch {
    // Le record est un bonus, pas une donnée vitale
  }
}

/**
 * Paires chrono, comme le mode Associer de Quizlet : deux colonnes, on touche
 * un élément à gauche puis son partenaire à droite. Le chrono tourne, et on
 * se compare à son propre record, jamais à celui des autres.
 */
export function MatchGame({ exercise, onAnswer, done }: GameProps<MatchExercise>) {
  const { univers } = useUnivers();
  const c = univers.colors;
  const left = useMemo(() => shuffle(exercise.pairs.map((_, i) => i)), [exercise]);
  const right = useMemo(() => shuffle(exercise.pairs.map((_, i) => i)), [exercise]);
  const [picked, setPicked] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<number | null>(null);
  const [misses, setMisses] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [record, setRecord] = useState<number | null>(null);
  const [newRecord, setNewRecord] = useState(false);
  const start = useRef(0);
  const finished = matched.size === exercise.pairs.length;

  useEffect(() => {
    start.current = Date.now();
    loadRecord(exercise.id).then(setRecord);
  }, [exercise.id]);

  useEffect(() => {
    if (finished || done) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start.current) / 1000)), 250);
    return () => clearInterval(t);
  }, [finished, done]);

  useEffect(() => {
    if (!finished || done) return;
    const seconds = Math.max(1, Math.round((Date.now() - start.current) / 1000));
    if (record === null || seconds < record) {
      setNewRecord(true);
      setRecord(seconds);
      saveRecord(exercise.id, seconds);
    }
    onAnswer(seconds <= exercise.seconds && misses <= exercise.pairs.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  function tapRight(i: number) {
    if (picked === null || done) return;
    if (i === picked) {
      setMatched((m) => new Set(m).add(i));
      setPicked(null);
    } else {
      setWrong(i);
      setMisses((n) => n + 1);
      setTimeout(() => setWrong(null), 500);
    }
  }

  const left_ = exercise.seconds - elapsed;
  return (
    <View style={styles.wrap}>
      <Prompt text={exercise.prompt} />
      <View style={styles.row}>
        <Chip style={{ borderColor: left_ < 5 ? c.ko : c.line }}>⏱ {Math.max(0, left_)} s</Chip>
        {record !== null && <Chip>🏅 Record : {record} s</Chip>}
      </View>
      <View style={styles.columns}>
        <View style={styles.col}>
          {left.map((i) => (
            <Tile
              key={`a${i}`}
              label={exercise.pairs[i].a}
              state={matched.has(i) ? 'ok' : picked === i ? 'selected' : 'idle'}
              disabled={done || matched.has(i)}
              onPress={() => setPicked(i)}
            />
          ))}
        </View>
        <View style={styles.col}>
          {right.map((i) => (
            <Tile
              key={`b${i}`}
              label={exercise.pairs[i].b}
              state={matched.has(i) ? 'ok' : wrong === i ? 'ko' : 'idle'}
              disabled={done || matched.has(i) || picked === null}
              onPress={() => tapRight(i)}
            />
          ))}
        </View>
      </View>
      <Body muted style={styles.center}>
        {finished
          ? newRecord
            ? `Nouveau record : ${record} s !`
            : `Fini en ${elapsed} s.`
          : picked === null
            ? 'Touche un élément à gauche, puis son partenaire à droite.'
            : 'Et maintenant, son partenaire à droite.'}
      </Body>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  columns: { flexDirection: 'row', gap: 10 },
  col: { flex: 1, gap: 8 },
  center: { textAlign: 'center' },
});
