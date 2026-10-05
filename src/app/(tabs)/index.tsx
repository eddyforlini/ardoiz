import { Link, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Gribouille } from '@/components/gribouille';
import { Body, Button, Card, Chip, Screen, Title } from '@/components/ui';
import { useLessons } from '@/content/LessonsProvider';
import { SUBJECT_LABEL } from '@/content/types';
import { useProfile } from '@/profile/ProfileProvider';
import { PIEGES_ID, QUESTS, missionReason, pickMission, stageFor } from '@/profile/progress';
import { useProgress } from '@/profile/ProgressProvider';
import { useUnivers } from '@/univers/UniversProvider';

/** Prénom d'exemple, en attendant le compte parent */
const SAMPLE = { prenom: 'Léa' };

/**
 * L'accueil de l'enfant : Gribouille, un seul gros bouton pour jouer, les
 * quêtes du jour. Tout le reste (leçons, photo, réglages) est ailleurs,
 * comme dans les applis qui marchent le mieux chez les petits.
 */
export default function HomeScreen() {
  const { univers } = useUnivers();
  const c = univers.colors;
  const ado = univers.tone === 'ado';
  const { level } = useProfile();
  const { progress } = useProgress();
  const { lessons: allLessons } = useLessons();
  const lessons = allLessons.filter((l) => l.level === level);
  const mission = pickMission(progress, lessons);
  const stage = stageFor(progress.xp);
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
            <Link href="/univers" asChild>
              <Pressable accessibilityRole="button" accessibilityLabel="Changer d'univers">
                <Chip>{univers.name} ▾</Chip>
              </Pressable>
            </Link>
            <View style={styles.spacer} />
            <Link href="/parent" asChild>
              <Pressable accessibilityRole="button" accessibilityLabel="Espace parent">
                <Chip>Parents</Chip>
              </Pressable>
            </Link>
          </View>

          <View style={styles.hello}>
            <Gribouille size={110} mood={missionDone ? 'fier' : 'content'} />
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
              <Body style={{ color: c.onPrimary }}>{missionReason(progress, mission.id)}</Body>
              <Body style={{ color: c.onPrimary, opacity: 0.9 }}>
                {mission.exercises.length} jeux · {mission.minutes} min
              </Body>
              <Button label={ado ? 'Go' : 'Jouer !'} variant="sun" style={styles.big} onPress={() => router.push(`/mission/${mission.id}`)} />
            </Card>
          ) : (
            <Card style={{ backgroundColor: c.primary, borderColor: c.primaryDark }}>
              <Body style={{ color: c.onPrimary, opacity: 0.9 }}>{univers.words.mission}</Body>
              <Title style={{ color: c.onPrimary }}>Pas encore de leçon en {level}</Title>
              <Body style={{ color: c.onPrimary, opacity: 0.9 }}>
                Demande à un parent de photographier une leçon ou de taper les mots de la dictée.
              </Body>
              <Link href="/parent" asChild>
                <Button label="Espace parent" variant="sun" />
              </Link>
            </Card>
          )}

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

          {lessons.length > 1 && (
            <Button label={`Choisir une autre leçon de ${level}`} variant="ghost" onPress={() => router.push('/lecons')} />
          )}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  topbar: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  spacer: { flex: 1 },
  hello: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bubble: { flex: 1 },
  big: { paddingVertical: 18, alignItems: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  strike: { textDecorationLine: 'line-through' },
});
