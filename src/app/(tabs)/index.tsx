import { Link, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Gribouille } from '@/components/gribouille';
import { Body, Button, Card, Chip, Screen, Title } from '@/components/ui';
import { LESSONS } from '@/content/bank-ce1';
import { SUBJECT_LABEL } from '@/content/types';
import { useProfile } from '@/profile/ProfileProvider';
import { useUnivers } from '@/univers/UniversProvider';

/**
 * Données d'exemple, en attendant le moteur d'exercices (étape 2) et le
 * pipeline photo (étape 3). Elles montrent à quoi ressemblera l'accueil.
 */
const SAMPLE = {
  prenom: 'Léa',
  serie: 4,
  monnaie: 120,
  prochainControle: { quoi: 'Dictée', dans: 3, pret: 70 },
  quetes: [
    { label: '5 bonnes réponses', fait: 3, total: 5 },
    { label: 'Un jeu à la voix', fait: 0, total: 1 },
    { label: 'Finir la mission du jour', fait: 0, total: 1 },
  ],
};

export default function HomeScreen() {
  const { univers } = useUnivers();
  const c = univers.colors;
  const ado = univers.tone === 'ado';
  const { level } = useProfile();
  const lessons = LESSONS.filter((l) => l.level === level);
  const mission = lessons[0];

  return (
    <Screen>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.topbar}>
            <Chip>
              {univers.currencySymbol} {SAMPLE.monnaie} {univers.currency}
            </Chip>
            <Chip>🔥 {SAMPLE.serie} jours</Chip>
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
                {ado ? 'Une quête t\'attend.' : 'Prête pour ta mission ?'}
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
                {level} · {mission.exercises.length} jeux · {mission.minutes} min
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
              <Chip>prête à {SAMPLE.prochainControle.pret} %</Chip>
            </View>
            <View style={[styles.bar, { backgroundColor: c.line }]}>
              <View style={[styles.barFill, { width: `${SAMPLE.prochainControle.pret}%`, backgroundColor: c.primary }]} />
            </View>
            <Body muted>Un plan jour par jour jusqu'au contrôle, construit depuis la photo.</Body>
          </Card>

          <Card>
            <Title size="md">Quêtes du jour</Title>
            {SAMPLE.quetes.map((q) => {
              const done = q.fait >= q.total;
              return (
                <View key={q.label} style={styles.row}>
                  <Body muted={done} style={done ? styles.strike : undefined}>
                    {q.label}
                  </Body>
                  <Body muted>
                    {q.fait}/{q.total}
                  </Body>
                </View>
              );
            })}
          </Card>

          <Card>
            <Title size="md">Leçons à réviser en {level}</Title>
            {lessons.length === 0 && <Body muted>Aucune leçon pour ce niveau pour le moment.</Body>}
            {lessons.map((l) => (
              <Pressable
                key={l.id}
                accessibilityRole="button"
                onPress={() => router.push(`/mission/${l.id}`)}
                style={({ pressed }) => [styles.lesson, { borderColor: c.line, opacity: pressed ? 0.7 : 1 }]}>
                <View style={styles.bubble}>
                  <Body bold>{l.title}</Body>
                  <Body muted>
                    {SUBJECT_LABEL[l.subject]} · {l.exercises.length} jeux · {l.minutes} min
                  </Body>
                </View>
                <Body style={{ color: c.primary }} bold>
                  ›
                </Body>
              </Pressable>
            ))}
          </Card>

          <Body muted style={styles.note}>
            Leçons d'exemple. Les vraies missions arriveront avec la photo de la leçon.
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
