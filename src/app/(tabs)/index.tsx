import { Link, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Gribouille } from '@/components/gribouille';
import { Body, Button, Card, Chip, Screen, Title } from '@/components/ui';
import { useLessons } from '@/content/LessonsProvider';
import { SUBJECT_LABEL, themeLabel, themeOf } from '@/content/types';
import { useProfile } from '@/profile/ProfileProvider';
import { PIEGES_ID, QUESTS, lessonHint, pickMission, stageFor } from '@/profile/progress';
import { useProgress } from '@/profile/ProgressProvider';
import { useUnivers } from '@/univers/UniversProvider';

/** Prénom et contrôle d'exemple, en attendant le compte parent (étape 3) et la photo de l'agenda */
const SAMPLE = {
  prenom: 'Léa',
  prochainControle: { quoi: 'Dictée', dans: 3, lessonId: 'mots-semaine-3' },
};

export default function HomeScreen() {
  const { univers } = useUnivers();
  const c = univers.colors;
  const ado = univers.tone === 'ado';
  const { level } = useProfile();
  const { progress } = useProgress();
  const { lessons: allLessons } = useLessons();
  const lessons = allLessons.filter((l) => l.level === level);
  const mission = pickMission(progress, lessons);
  // Les trois leçons les plus pressées : celles à revoir d'abord, puis les jamais jouées
  const toReview = [...lessons]
    .sort((a, b) => {
      const ma = progress.mastery[a.id];
      const mb = progress.mastery[b.id];
      if (ma && mb) return ma.due.localeCompare(mb.due);
      if (ma) return -1;
      if (mb) return 1;
      return 0;
    })
    .slice(0, 3);
  const stage = stageFor(progress.xp);
  const ready = progress.mastery[SAMPLE.prochainControle.lessonId]?.best ?? 0;
  const pieges = Object.keys(progress.errors).length;
  const missionDone = mission && progress.mastery[mission.id] && progress.mastery[mission.id].lastDay === progress.today.day && progress.today.missions > 0;

  return (
    <Screen>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.topbar}>
            <Chip>
              {univers.currencySymbol} {progress.coins} {univers.currency}
            </Chip>
            <Chip>🔥 {progress.streak.count} jour{progress.streak.count > 1 ? 's' : ''}</Chip>
            <Link href="/niveau" asChild>
              <Pressable accessibilityRole="button" accessibilityLabel="Changer de niveau">
                <Chip>{level} ▾</Chip>
              </Pressable>
            </Link>
            <Link href="/univers" asChild>
              <Pressable accessibilityRole="button" accessibilityLabel="Changer d'univers">
                <Chip>{univers.name} ▾</Chip>
              </Pressable>
            </Link>
          </View>

          <View style={styles.hello}>
            <Gribouille size={96} mood="content" />
            <Card style={styles.bubble}>
              <Body bold>
                {ado ? `Yo ${SAMPLE.prenom}.` : `Coucou ${SAMPLE.prenom} !`}{' '}
                {missionDone
                  ? ado
                    ? 'Mission du jour faite. Encore une ?'
                    : 'Mission du jour réussie ! On en refait une ?'
                  : ado
                    ? 'Une quête t\'attend.'
                    : 'Prête pour ta mission ?'}
              </Body>
              <Body muted>
                Gribouille {stage.stage.name}
                {stage.next ? ` · ${Math.round(stage.ratio * 100)} % vers ${stage.next.name}` : ''}
              </Body>
            </Card>
          </View>

          {mission ? (
            <Card style={{ backgroundColor: c.primary, borderColor: c.primaryDark }}>
              <Body style={{ color: c.onPrimary, opacity: 0.9 }}>{univers.words.mission}</Body>
              <Title style={{ color: c.onPrimary }}>
                {SUBJECT_LABEL[mission.subject]} · {mission.title}
              </Title>
              <Body style={{ color: c.onPrimary, opacity: 0.9 }}>
                {lessonHint(progress, mission.id) ?? 'Nouvelle leçon'} · {mission.exercises.length} jeux · {mission.minutes} min
              </Body>
              <Button label={ado ? 'Go' : 'C\'est parti !'} variant="sun" onPress={() => router.push(`/mission/${mission.id}`)} />
            </Card>
          ) : (
            <Card style={{ backgroundColor: c.primary, borderColor: c.primaryDark }}>
              <Body style={{ color: c.onPrimary, opacity: 0.9 }}>{univers.words.mission}</Body>
              <Title style={{ color: c.onPrimary }}>Pas encore de leçon en {level}</Title>
              <Body style={{ color: c.onPrimary, opacity: 0.9 }}>
                Photographie une leçon pour créer la première mission, ou choisis un autre niveau.
              </Body>
              <Link href="/niveau" asChild>
                <Button label="Changer de niveau" variant="sun" />
              </Link>
            </Card>
          )}

          <Card>
            <View style={styles.row}>
              <Title size="md">
                {SAMPLE.prochainControle.quoi} dans {SAMPLE.prochainControle.dans} jours
              </Title>
              <Chip>prête à {ready} %</Chip>
            </View>
            <View style={[styles.bar, { backgroundColor: c.line }]}>
              <View style={[styles.barFill, { width: `${ready}%`, backgroundColor: c.primary }]} />
            </View>
            <Body muted>
              {ready === 0
                ? 'Joue la mission « Mots de la semaine » pour faire monter la jauge.'
                : ready < 80
                  ? 'Encore une ou deux missions et la dictée est dans la poche.'
                  : 'Prête ! Une dernière révision la veille et c\'est gagné.'}
            </Body>
          </Card>

          {pieges > 0 && (
            <Card style={{ borderColor: c.sunDark, backgroundColor: c.sun }}>
              <View style={styles.row}>
                <View style={styles.bubble}>
                  <Title size="md" style={{ color: c.onSun }}>
                    Mes pièges
                  </Title>
                  <Body style={{ color: c.onSun }}>
                    {pieges} question{pieges > 1 ? 's' : ''} t'{pieges > 1 ? 'ont' : 'a'} piégé. Déjoue-{pieges > 1 ? 'les' : 'la'} deux fois pour {pieges > 1 ? 'les' : 'la'} faire disparaître.
                  </Body>
                </View>
                <Button label="Déjouer" variant="primary" onPress={() => router.push(`/mission/${PIEGES_ID}`)} />
              </View>
            </Card>
          )}

          <Card>
            <Title size="md">Quêtes du jour</Title>
            {QUESTS.map((q) => {
              const fait = Math.min(q.total, q.done(progress));
              const done = fait >= q.total;
              return (
                <View key={q.id} style={styles.row}>
                  <Body muted={done} style={done ? styles.strike : undefined}>
                    {done ? '✓ ' : ''}
                    {q.label}
                  </Body>
                  <Body muted>
                    {fait}/{q.total}
                  </Body>
                </View>
              );
            })}
          </Card>

          <Card>
            <View style={styles.row}>
              <Title size="md">À réviser en {level}</Title>
              <Pressable accessibilityRole="button" accessibilityLabel="Voir toutes les leçons" onPress={() => router.push('/lecons')}>
                <Chip>Toutes ›</Chip>
              </Pressable>
            </View>
            {lessons.length === 0 && <Body muted>Aucune leçon pour ce niveau pour le moment.</Body>}
            {toReview.map((l) => (
              <Pressable
                key={l.id}
                accessibilityRole="button"
                onPress={() => router.push(`/mission/${l.id}`)}
                style={({ pressed }) => [styles.lesson, { borderColor: c.line, opacity: pressed ? 0.7 : 1 }]}>
                <View style={styles.bubble}>
                  <Body bold>{l.title}</Body>
                  <Body muted>
                    {SUBJECT_LABEL[l.subject]} · {themeLabel(l.subject, themeOf(l)).label} · {l.minutes} min
                  </Body>
                  {lessonHint(progress, l.id) && (
                    <Body style={{ color: c.primary, fontSize: 13 }} bold>
                      {lessonHint(progress, l.id)}
                    </Body>
                  )}
                </View>
                <Body style={{ color: c.primary }} bold>
                  ›
                </Body>
              </Pressable>
            ))}
            {lessons.length > toReview.length && (
              <Button label={`Les ${lessons.length} leçons de ${level}`} variant="ghost" onPress={() => router.push('/lecons')} />
            )}
          </Card>

          <Body muted style={styles.note}>
            Ajoute les vraies leçons de la semaine depuis l'onglet Photo.
          </Body>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  topbar: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  hello: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bubble: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  bar: { height: 12, borderRadius: 999, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999 },
  strike: { textDecorationLine: 'line-through' },
  lesson: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1 },
  note: { textAlign: 'center', fontSize: 13 },
});
