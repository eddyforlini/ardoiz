import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Gribouille } from '@/components/gribouille';
import { Body, Button, Card, Chip, Screen, Title } from '@/components/ui';
import { PLOTS, missionsDone, plotStatus, stageFor } from '@/profile/progress';
import { useProgress } from '@/profile/ProgressProvider';
import { useUnivers } from '@/univers/UniversProvider';

/** Décor des parcelles construites, par univers */
const BUILT: Record<string, string[]> = {
  classique: ['🏡', '🥕', '📚', '🎠', '🔭', '🏰'],
  hero: ['🏚️', '🥊', '🧪', '🗼', '✈️', '🏢'],
  manga: ['🎋', '🍜', '🥋', '⛩️', '🌸', '🐉'],
  espace: ['🛸', '🌱', '🔬', '📡', '🚀', '🛰️'],
  dino: ['🪺', '🐸', '🦴', '🌋', '🌿', '🥚'],
  gaming: ['🕹️', '🔧', '🖥️', '⚔️', '🌀', '👾'],
  street: ['🎨', '🛹', '🎧', '🏀', '🛼', '🌆'],
  enquete: ['🗄️', '📁', '🔬', '🕶️', '🗺️', '🕵️'],
};

/** Le monde à construire : six parcelles par univers, payées avec la monnaie gagnée en jouant */
export default function MondeScreen() {
  const { univers } = useUnivers();
  const c = univers.colors;
  const { progress, buyPlot } = useProgress();
  const plots = PLOTS[univers.id];
  const owned = progress.plots[univers.id] ?? [];
  const stage = stageFor(progress.xp);
  const done = missionsDone(progress);

  return (
    <Screen>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.row}>
            <Title size="xl" style={{ flex: 1 }}>
              {univers.words.monde}
            </Title>
            <Chip>
              {univers.currencySymbol} {progress.coins}
            </Chip>
          </View>
          <Body muted>
            {owned.length === 0
              ? `Gagne des ${univers.currency} en jouant, puis construis ton premier bâtiment.`
              : `${owned.length} / ${plots.length} bâtiments construits. Chaque univers a son propre monde.`}
          </Body>

          <View style={[styles.land, { backgroundColor: c.primaryTint, borderColor: c.line, borderRadius: univers.font.radius }]}>
            <View style={styles.landRow}>
              {plots.map((_, i) => (
                <Text key={i} style={[styles.landItem, { opacity: owned.includes(i) ? 1 : 0.15 }]}>
                  {owned.includes(i) ? BUILT[univers.id][i] : '▫️'}
                </Text>
              ))}
            </View>
            <View style={styles.mascot}>
              <Gribouille size={80} mood={owned.length >= 3 ? 'fier' : 'content'} />
              <Body muted style={{ fontSize: 13 }}>
                Gribouille {stage.stage.name}
              </Body>
            </View>
          </View>

          <Card>
            {plots.map((plot, i) => {
              const status = plotStatus(progress, univers.id, i);
              const canBuy = status === 'ok';
              return (
                <View key={plot.name} style={[styles.plot, { borderColor: c.line }]}>
                  <Text style={styles.plotEmoji}>{status === 'owned' ? BUILT[univers.id][i] : '🔒'}</Text>
                  <View style={{ flex: 1 }}>
                    <Body bold>{plot.name}</Body>
                    <Body muted style={{ fontSize: 13 }}>
                      {status === 'owned'
                        ? 'Construit'
                        : status === 'missions'
                          ? `S'ouvre après ${plot.missions} missions (${done} faite${done > 1 ? 's' : ''})`
                          : `${univers.currencySymbol} ${plot.cost} ${univers.currency}`}
                    </Body>
                  </View>
                  {status !== 'owned' && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Construire ${plot.name}`}
                      disabled={!canBuy}
                      onPress={() => {
                        buyPlot(univers.id, i);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                      }}
                      style={[styles.buy, { backgroundColor: canBuy ? c.sun : c.bg, borderColor: canBuy ? c.sunDark : c.line, opacity: canBuy ? 1 : 0.6 }]}>
                      <Text style={{ fontWeight: '800', color: canBuy ? c.onSun : c.soft }}>{canBuy ? 'Construire' : status === 'coins' ? `${plot.cost - progress.coins} de plus` : 'Bientôt'}</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </Card>

          <Button label="⭐ Mes autocollants et ma série" variant="ghost" onPress={() => router.push('/recompenses')} />

          <Body muted style={styles.note}>
            Le Codex des notions et les événements de saison arriveront ensuite.
          </Body>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  land: { borderWidth: 2, padding: 12, gap: 8 },
  landRow: { flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap' },
  landItem: { fontSize: 38 },
  mascot: { alignItems: 'center', gap: 2 },
  plot: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1 },
  plotEmoji: { fontSize: 28, width: 36, textAlign: 'center' },
  buy: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 2, borderBottomWidth: 4 },
  note: { textAlign: 'center', fontSize: 13 },
});
