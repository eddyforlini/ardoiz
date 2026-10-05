import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Body, Button, Card, Chip, Screen, Title } from '@/components/ui';
import { useLessons } from '@/content/LessonsProvider';
import { attenduOf, attendusFor, hasProgramme, type Attendu } from '@/content/programme';
import { SUBJECT_LABEL, THEMES, type Subject } from '@/content/types';
import { useProfile } from '@/profile/ProfileProvider';
import { MASTERY_STATE, bestState, type MasteryState } from '@/profile/progress';
import { useProgress } from '@/profile/ProgressProvider';
import { useUnivers } from '@/univers/UniversProvider';

/**
 * Le programme officiel du niveau, attendu par attendu, avec l'état de
 * chacun : à découvrir, en cours, acquis. Le parent voit en une page où en
 * est son enfant par rapport à ce que l'école attend en fin d'année.
 */
export default function ProgrammeScreen() {
  const { univers } = useUnivers();
  const c = univers.colors;
  const { level } = useProfile();
  const { progress } = useProgress();
  const { lessons } = useLessons();

  const attendus = attendusFor(level);
  const byAttendu = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const l of lessons) {
      if (l.level !== level) continue;
      const a = attenduOf(l);
      if (!a) continue;
      map.set(a.id, [...(map.get(a.id) ?? []), l.id]);
    }
    return map;
  }, [lessons, level]);

  const stateOf = (a: Attendu): MasteryState | 'none' => {
    const ids = byAttendu.get(a.id);
    return ids?.length ? bestState(progress, ids) : 'none';
  };
  const counts = attendus.reduce(
    (acc, a) => {
      acc[stateOf(a)] += 1;
      return acc;
    },
    { none: 0, new: 0, progress: 0, done: 0 } as Record<MasteryState | 'none', number>,
  );
  const colorOf = (s: MasteryState | 'none') => (s === 'done' ? c.ok : s === 'progress' ? c.primary : c.soft);

  if (!hasProgramme(level)) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.content}>
          <Card>
            <Title size="md">Le programme de {level} arrive</Title>
            <Body muted>
              Les attendus de fin d'année de {level} seront ajoutés avec les leçons de ce niveau. En attendant, les
              leçons photographiées se rangent déjà par matière et par thème.
            </Body>
            <Button label="Voir les leçons" variant="ghost" onPress={() => router.push('/lecons')} />
          </Card>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Title size="md">Fin de {level} : {attendus.length} attendus</Title>
          <Body muted>
            Ce que l'école attend en fin d'année, d'après les repères officiels. Chaque leçon jouée fait avancer un attendu.
          </Body>
          <View style={styles.row}>
            <Chip style={{ borderColor: c.ok }}>● {counts.done} acquis</Chip>
            <Chip style={{ borderColor: c.primary }}>◐ {counts.progress} en cours</Chip>
            <Chip>○ {counts.new} à découvrir</Chip>
            <Chip>{counts.none} sans leçon</Chip>
          </View>
        </Card>

        {(['maths', 'francais'] as Subject[]).map((subject) => (
          <View key={subject} style={styles.subject}>
            <Title size="lg">{SUBJECT_LABEL[subject]}</Title>
            {THEMES[subject].map((t) => {
              const items = attendus.filter((a) => a.subject === subject && a.theme === t.id);
              if (!items.length) return null;
              return (
                <Card key={t.id}>
                  <Title size="md">
                    {t.emoji} {t.label}
                  </Title>
                  {items.map((a) => {
                    const s = stateOf(a);
                    const ids = byAttendu.get(a.id) ?? [];
                    const first = ids[0];
                    const row = (
                      <View style={[styles.line, { borderColor: c.line }]}>
                        <Body style={[styles.glyph, { color: colorOf(s) }]}>{s === 'none' ? '·' : MASTERY_STATE[s].glyph}</Body>
                        <View style={styles.grow}>
                          <Body>{a.text}</Body>
                          <Body muted style={styles.small}>
                            {s === 'none'
                              ? 'Pas encore de leçon : photographie-la quand elle arrive.'
                              : `${MASTERY_STATE[s].label} · ${ids.length} leçon${ids.length > 1 ? 's' : ''}`}
                          </Body>
                        </View>
                        {first && (
                          <Body style={{ color: c.primary }} bold>
                            ›
                          </Body>
                        )}
                      </View>
                    );
                    return first ? (
                      <Pressable key={a.id} accessibilityRole="button" accessibilityLabel={a.text} onPress={() => router.push(`/mission/${first}`)}>
                        {row}
                      </Pressable>
                    ) : (
                      <View key={a.id}>{row}</View>
                    );
                  })}
                </Card>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  subject: { gap: 10 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1 },
  glyph: { fontSize: 20, width: 22, textAlign: 'center' },
  grow: { flex: 1 },
  small: { fontSize: 13 },
});
