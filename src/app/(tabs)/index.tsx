import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Gribouille } from '@/components/gribouille';
import { Body, Button, Card, Chip, Screen, Title } from '@/components/ui';
import { useUnivers } from '@/univers/UniversProvider';

/**
 * Données d'exemple, en attendant le moteur d'exercices (étape 2) et le
 * pipeline photo (étape 3). Elles montrent à quoi ressemblera l'accueil.
 */
const SAMPLE = {
  prenom: 'Léa',
  serie: 4,
  monnaie: 120,
  mission: {
    matiere: 'Maths',
    notion: 'Les nombres jusqu\'à 100',
    source: 'Leçon photographiée hier',
    jeux: 4,
    minutes: 6,
  },
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

  return (
    <Screen>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.topbar}>
            <Chip>
              {univers.currencySymbol} {SAMPLE.monnaie} {univers.currency}
            </Chip>
            <Chip>🔥 {SAMPLE.serie} jours</Chip>
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

          <Card style={{ backgroundColor: c.primary, borderColor: c.primaryDark }}>
            <Body style={{ color: c.onPrimary, opacity: 0.9 }}>{univers.words.mission}</Body>
            <Title style={{ color: c.onPrimary }}>
              {SAMPLE.mission.matiere} · {SAMPLE.mission.notion}
            </Title>
            <Body style={{ color: c.onPrimary, opacity: 0.9 }}>
              {SAMPLE.mission.source} · {SAMPLE.mission.jeux} jeux · {SAMPLE.mission.minutes} min
            </Body>
            <Button label={ado ? 'Go' : 'C\'est parti !'} variant="sun" />
          </Card>

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

          <Body muted style={styles.note}>
            Données d'exemple. Les vraies missions arriveront avec la photo de la leçon.
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
  note: { textAlign: 'center', fontSize: 13 },
});
