import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Gribouille } from '@/components/gribouille';
import { Body, Card, Chip, Screen, Title } from '@/components/ui';
import { STAGES, STICKERS, STREAK_MILESTONES, missionsDone, stageFor } from '@/profile/progress';
import { useProgress } from '@/profile/ProgressProvider';
import { useUnivers } from '@/univers/UniversProvider';

/** Récompenses saines : autocollants, série, Gribouille qui grandit. Jamais d'achat. */
export default function RecompensesScreen() {
  const { univers } = useUnivers();
  const c = univers.colors;
  const { progress } = useProgress();
  const stage = stageFor(progress.xp);
  const nextMilestone = STREAK_MILESTONES.find((m) => m > progress.streak.count);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>

          <Card style={styles.hero}>
            <Gribouille size={90} mood={stage.index >= 2 ? 'fier' : 'content'} />
            <View style={styles.heroText}>
              <Title size="md">Gribouille {stage.stage.name}</Title>
              <Body muted>{stage.stage.description}</Body>
              <View style={[styles.bar, { backgroundColor: c.line }]}>
                <View style={[styles.barFill, { width: `${Math.round(stage.ratio * 100)}%`, backgroundColor: c.primary }]} />
              </View>
              <Body muted style={{ fontSize: 13 }}>
                {stage.next ? `${progress.xp} / ${stage.next.xp} XP pour devenir ${stage.next.name}` : 'Niveau maximum atteint !'}
              </Body>
            </View>
          </Card>

          <View style={styles.row}>
            <Chip>
              {univers.currencySymbol} {progress.coins} {univers.currency}
            </Chip>
            <Chip>🔥 {progress.streak.count}/7 jours</Chip>
            <Chip>🎯 {missionsDone(progress)} mission{missionsDone(progress) > 1 ? 's' : ''}</Chip>
          </View>

          <Card>
            <Title size="md">Mon rythme</Title>
            <Body muted>
              {progress.streak.count === 0
                ? 'Joue une mission aujourd\'hui : chaque jour de la semaine compte, et rien ne se perd si tu sautes un jour.'
                : nextMilestone
                  ? `${progress.streak.count} jour${progress.streak.count > 1 ? 's' : ''} sur 7. Encore ${nextMilestone - progress.streak.count} pour fêter ${nextMilestone} jours cette semaine.`
                  : '7 jours sur 7, quel rythme !'}
            </Body>
            <View style={styles.milestones}>
              {STREAK_MILESTONES.map((m) => {
                const reached = progress.streak.count >= m;
                return (
                  <View key={m} style={[styles.milestone, { backgroundColor: reached ? c.sun : c.bg, borderColor: reached ? c.sunDark : c.line }]}>
                    <Text style={{ fontWeight: '800', color: reached ? c.onSun : c.soft }}>{m}</Text>
                  </View>
                );
              })}
            </View>
          </Card>

          <Card>
            <Title size="md">
              Autocollants · {progress.stickers.length} / {STICKERS.length}
            </Title>
            <Body muted>Un {univers.words.coffre.toLowerCase()} à chaque mission terminée.</Body>
            <View style={styles.grid}>
              {STICKERS.map((s) => {
                const owned = progress.stickers.includes(s.id);
                return (
                  <View
                    key={s.id}
                    accessibilityLabel={owned ? s.name : 'Autocollant à gagner'}
                    style={[styles.sticker, { backgroundColor: owned ? c.card : c.bg, borderColor: owned ? c.primary : c.line, borderRadius: univers.font.radius }]}>
                    <Text style={[styles.stickerEmoji, { opacity: owned ? 1 : 0.2 }]}>{owned ? s.emoji : '❔'}</Text>
                    <Text style={[styles.stickerName, { color: owned ? c.ink : c.soft }]} numberOfLines={2}>
                      {owned ? s.name : '???'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>

          <Card>
            <Title size="md">Les étapes de Gribouille</Title>
            {STAGES.map((s, i) => (
              <View key={s.name} style={styles.stageRow}>
                <Text style={{ fontSize: 18 }}>{i <= stage.index ? '✅' : '⬜'}</Text>
                <Body bold={i === stage.index} muted={i > stage.index} style={{ flex: 1 }}>
                  {s.name} · {s.description}
                </Body>
                <Body muted style={{ fontSize: 13 }}>
                  {s.xp} XP
                </Body>
              </View>
            ))}
          </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroText: { flex: 1, gap: 4 },
  bar: { height: 10, borderRadius: 999, overflow: 'hidden', marginTop: 4 },
  barFill: { height: '100%', borderRadius: 999 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  milestones: { flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  milestone: { flex: 1, height: 40, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sticker: { width: '22%', flexGrow: 1, borderWidth: 2, padding: 6, alignItems: 'center', gap: 2 },
  stickerEmoji: { fontSize: 30 },
  stickerName: { fontSize: 11, textAlign: 'center', fontWeight: '600' },
  stageRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
