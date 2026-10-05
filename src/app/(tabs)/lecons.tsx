import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, Card, Chip, Screen, Title } from '@/components/ui';
import { useLessons } from '@/content/LessonsProvider';
import { fold } from '@/content/poems';
import { LEVELS, SOURCE_LABEL, SUBJECT_LABEL, THEMES, themeOf, type Lesson, type Level, type Subject } from '@/content/types';
import { useProfile } from '@/profile/ProfileProvider';
import { MASTERY_STATE, lessonHint, masteryState } from '@/profile/progress';
import { useProgress } from '@/profile/ProgressProvider';
import { useUnivers } from '@/univers/UniversProvider';

type SubjectFilter = Subject | 'tout';

/**
 * La bibliothèque : toutes les leçons, rangées par niveau, puis matière, puis
 * thème. Le parent choisit le niveau en haut, la matière juste dessous, et
 * retrouve chaque leçon dans son rayon. La recherche passe par-dessus tout ça.
 */
export default function LeconsScreen() {
  const { univers } = useUnivers();
  const c = univers.colors;
  const { level: profileLevel } = useProfile();
  const { progress } = useProgress();
  const { lessons, custom } = useLessons();
  const [level, setLevel] = useState<Level>(profileLevel);
  const [subject, setSubject] = useState<SubjectFilter>('tout');
  const [query, setQuery] = useState('');
  const customIds = useMemo(() => new Set(custom.map((l) => l.id)), [custom]);

  const searching = query.trim().length >= 2;
  const visible = useMemo(() => {
    if (searching) {
      const q = fold(query);
      return lessons.filter((l) => fold(`${l.title} ${l.notion} ${l.summary}`).includes(q));
    }
    return lessons.filter((l) => l.level === level && (subject === 'tout' || l.subject === subject));
  }, [lessons, searching, query, level, subject]);

  const countFor = (lv: Level) => lessons.filter((l) => l.level === lv).length;

  /** Sections : matière puis thème, dans l'ordre des rayons */
  const sections = useMemo(() => {
    const out: { key: string; subject: Subject; label: string; emoji: string; items: Lesson[] }[] = [];
    for (const s of ['maths', 'francais'] as Subject[]) {
      for (const t of THEMES[s]) {
        const items = visible.filter((l) => l.subject === s && themeOf(l) === t.id);
        if (items.length) out.push({ key: `${s}-${t.id}`, subject: s, label: t.label, emoji: t.emoji, items });
      }
    }
    return out;
  }, [visible]);

  const inputStyle = [styles.search, { color: c.ink, borderColor: c.line, backgroundColor: c.card, borderRadius: univers.font.radius }];

  return (
    <Screen>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.row}>
            <Title size="xl" style={styles.grow}>
              Leçons
            </Title>
            <Pressable accessibilityRole="button" accessibilityLabel="Voir le programme" onPress={() => router.push('/programme')}>
              <Chip>🎓 Programme ›</Chip>
            </Pressable>
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Chercher une leçon (tables, dictée, poésie...)"
            placeholderTextColor={c.soft}
            style={inputStyle}
            accessibilityLabel="Chercher une leçon"
            autoCorrect={false}
          />

          {!searching && (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.levels}>
                {LEVELS.map((lv) => {
                  const selected = lv === level;
                  const n = countFor(lv);
                  return (
                    <Pressable
                      key={lv}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={`Niveau ${lv}, ${n} leçon${n > 1 ? 's' : ''}`}
                      onPress={() => setLevel(lv)}
                      style={[
                        styles.level,
                        { borderColor: selected ? c.primary : c.line, backgroundColor: selected ? c.primary : c.card, borderRadius: univers.font.radius },
                      ]}>
                      <Body bold style={{ color: selected ? c.onPrimary : n ? c.ink : c.soft }}>
                        {lv}
                      </Body>
                      <Body style={{ color: selected ? c.onPrimary : c.soft, fontSize: 12 }}>{n}</Body>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={styles.subjects}>
                {(
                  [
                    ['tout', 'Tout'],
                    ['maths', SUBJECT_LABEL.maths],
                    ['francais', SUBJECT_LABEL.francais],
                  ] as [SubjectFilter, string][]
                ).map(([id, label]) => {
                  const selected = subject === id;
                  return (
                    <Pressable
                      key={id}
                      accessibilityRole="tab"
                      accessibilityState={{ selected }}
                      onPress={() => setSubject(id)}
                      style={[styles.subject, { borderColor: selected ? c.primary : c.line, backgroundColor: selected ? c.primaryTint : c.card, borderRadius: univers.font.radius }]}>
                      <Body bold style={{ color: selected ? c.primary : c.soft }}>{label}</Body>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {sections.length === 0 && (
            <Card>
              <Title size="md">{searching ? 'Rien trouvé' : `Rien en ${level} pour le moment`}</Title>
              <Body muted>
                {searching
                  ? 'Essaie un autre mot, ou ajoute la leçon toi-même.'
                  : 'Photographie une leçon ou tape les mots de la dictée : la mission se range ici toute seule.'}
              </Body>
              <Button label="📷 Photographier une leçon" variant="sun" onPress={() => router.push('/photo')} />
              <Button label="✍️ Taper les mots ou la poésie" variant="ghost" onPress={() => router.push('/ajouter')} />
            </Card>
          )}

          {sections.map((sec) => (
            <Card key={sec.key}>
              <View style={styles.row}>
                <Title size="md">
                  {sec.emoji} {sec.label}
                </Title>
                <Chip>{SUBJECT_LABEL[sec.subject]}</Chip>
              </View>
              {sec.items.map((l) => {
                const hint = lessonHint(progress, l.id);
                const state = masteryState(progress, l.id);
                const stateColor = state === 'done' ? c.ok : state === 'progress' ? c.primary : c.soft;
                return (
                  <Pressable
                    key={l.id}
                    accessibilityRole="button"
                    onPress={() => router.push(`/mission/${l.id}`)}
                    style={({ pressed }) => [styles.lesson, { borderColor: c.line, opacity: pressed ? 0.7 : 1 }]}>
                    <View style={styles.grow}>
                      <Body bold>{l.title}</Body>
                      <Body muted style={styles.small}>
                        {searching ? `${l.level} · ` : ''}
                        {SOURCE_LABEL[l.source]} · {l.exercises.length} jeux · {l.minutes} min
                        {customIds.has(l.id) ? ' · ajoutée par toi' : ''}
                      </Body>
                      {hint && (
                        <Body style={[styles.small, { color: c.primary }]} bold>
                          {hint}
                        </Body>
                      )}
                    </View>
                    <Chip style={{ borderColor: stateColor }}>
                      <Body style={{ color: stateColor, fontSize: 13 }} bold>
                        {MASTERY_STATE[state].glyph} {MASTERY_STATE[state].label}
                      </Body>
                    </Chip>
                    <Body style={{ color: c.primary }} bold>
                      ›
                    </Body>
                  </Pressable>
                );
              })}
            </Card>
          ))}

          {sections.length > 0 && (
            <View style={styles.actions}>
              <Button label="📷 Photographier une leçon" variant="ghost" onPress={() => router.push('/photo')} />
              <Button label="✍️ Taper les mots ou la poésie" variant="ghost" onPress={() => router.push('/ajouter')} />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  search: { borderWidth: 2, paddingVertical: 10, paddingHorizontal: 14, fontSize: 16 },
  levels: { gap: 6, paddingVertical: 2 },
  level: { minWidth: 56, alignItems: 'center', borderWidth: 2, paddingVertical: 6, paddingHorizontal: 8 },
  subjects: { flexDirection: 'row', gap: 8 },
  subject: { flex: 1, borderWidth: 2, paddingVertical: 8, alignItems: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  lesson: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1 },
  grow: { flex: 1 },
  small: { fontSize: 13 },
  actions: { gap: 4 },
});
