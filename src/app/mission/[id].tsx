import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Gribouille } from '@/components/gribouille';
import { Body, Button, Card, Chip, Screen, Title } from '@/components/ui';
import { findLesson } from '@/content/bank-ce1';
import { speak, stopSpeaking } from '@/content/speech';
import type { Exercise } from '@/content/types';
import { SUBJECT_LABEL } from '@/content/types';
import { GAME_LABEL, Game } from '@/games';
import { COINS_PER_GOOD, QUEST_REWARD, type MissionReward } from '@/profile/progress';
import { useProgress } from '@/profile/ProgressProvider';
import { useUnivers } from '@/univers/UniversProvider';

type Step = { exercise: Exercise; retry: boolean };

/**
 * Déroulé d'une mission : un exercice après l'autre, feedback après chaque
 * réponse, les exercices ratés reviennent une fois en fin de mission
 * (règle produit 5 : l'erreur n'est pas grave, on a une seconde chance).
 */
export default function MissionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = findLesson(id);
  const { univers } = useUnivers();
  const c = univers.colors;
  const { recordMission } = useProgress();

  const [queue, setQueue] = useState<Step[]>(() =>
    (lesson?.exercises ?? []).map((exercise) => ({ exercise, retry: false })),
  );
  const [position, setPosition] = useState(0);
  const [intro, setIntro] = useState(true);
  const [result, setResult] = useState<boolean | null>(null);
  const [good, setGood] = useState(0);
  const [firstTryErrors, setFirstTryErrors] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const finished = position >= queue.length && queue.length > 0;
  const step = queue[position];
  const played = useMemo(() => new Set(queue.slice(0, position).map((s) => s.exercise.kind)), [queue, position]);
  const [reward, setReward] = useState<MissionReward | null>(null);
  const [chestOpen, setChestOpen] = useState(false);


  if (!lesson) {
    return (
      <Screen>
        <SafeAreaView style={styles.safe}>
          <View style={styles.center}>
            <Gribouille size={110} mood="curieux" />
            <Title>Mission introuvable</Title>
            <Button label="Retour à l'accueil" onPress={() => router.replace('/')} />
          </View>
        </SafeAreaView>
      </Screen>
    );
  }

  function answer(correct: boolean) {
    if (result !== null) return;
    setResult(correct);
    if (correct) {
      setGood((g) => g + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      speak(univers.tone === 'ado' ? 'Bien joué.' : 'Bravo !');
    } else {
      if (!step.retry) setFirstTryErrors((e) => e + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      if (step.exercise.explain) speak(step.exercise.explain);
    }
  }

  function next() {
    stopSpeaking();
    const retryNeeded = result === false && !step.retry;
    if (retryNeeded) setQueue((q) => [...q, { exercise: step.exercise, retry: true }]);
    const last = !retryNeeded && position + 1 >= queue.length;
    if (last && lesson && !reward) {
      // Fin de mission : on enregistre une seule fois et on garde ce qui est gagné pour l'écran de fin
      setReward(
        recordMission({
          lessonId: lesson.id,
          good,
          total: lesson.exercises.length,
          firstTryErrors,
          kinds: [...new Set(queue.map((q) => q.exercise.kind))],
        }),
      );
    }
    setResult(null);
    setAttempt((a) => a + 1);
    setPosition((p) => p + 1);
  }

  function quit() {
    stopSpeaking();
    router.replace('/');
  }

  if (intro) {
    return (
      <Screen>
        <SafeAreaView style={styles.safe}>
          <View style={styles.header}>
            <Pressable accessibilityRole="button" accessibilityLabel="Quitter la mission" onPress={quit} hitSlop={12}>
              <Text style={[styles.close, { color: c.soft }]}>✕</Text>
            </Pressable>
            <Body muted>{univers.words.mission}</Body>
          </View>
          <ScrollView contentContainerStyle={styles.endContent}>
            <View style={styles.mascot}>
              <Gribouille size={120} mood="curieux" />
            </View>
            <Body muted style={styles.centerText}>
              {SUBJECT_LABEL[lesson.subject]} · {lesson.level}
            </Body>
            <Title size="xl" style={styles.centerText}>
              {lesson.title}
            </Title>
            <Card>
              <View style={styles.feedbackRow}>
                <Body style={styles.feedbackText}>{lesson.summary}</Body>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Écouter la leçon"
                  onPress={() => speak(lesson.summary)}
                  style={[styles.speaker, { backgroundColor: c.primaryTint }]}>
                  <Text style={{ fontSize: 20 }}>🔊</Text>
                </Pressable>
              </View>
            </Card>
            <Body muted style={styles.centerText}>
              {lesson.exercises.length} jeux · environ {lesson.minutes} min
            </Body>
            <Button
              label={univers.tone === 'ado' ? 'Go' : 'Commencer'}
              variant="sun"
              onPress={() => {
                stopSpeaking();
                setIntro(false);
              }}
            />
          </ScrollView>
        </SafeAreaView>
      </Screen>
    );
  }

  if (finished) {
    const perfect = firstTryErrors === 0;
    const ado = univers.tone === 'ado';
    return (
      <Screen>
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.endContent}>
            <Text style={styles.party}>{CELEBRATION[univers.celebration]}</Text>
            <View style={styles.mascot}>
              <Gribouille size={140} mood="fier" />
            </View>
            <Title size="xl" style={styles.centerText}>
              {univers.words.bravo}
            </Title>
            <Body style={styles.centerText}>
              {perfect
                ? ado
                  ? 'Sans faute. Rien à redire.'
                  : 'Tout juste du premier coup, quelle championne !'
                : ado
                  ? `${firstTryErrors} raté${firstTryErrors > 1 ? 's' : ''} au premier essai, mais rattrapé${firstTryErrors > 1 ? 's' : ''}.`
                  : 'Tu as corrigé tes erreurs, c\'est comme ça qu\'on apprend !'}
            </Body>

            <Card style={styles.stats}>
              <View style={styles.statRow}>
                <Body muted>Bonnes réponses</Body>
                <Body bold>
                  {good} / {queue.length}
                </Body>
              </View>
              <View style={styles.statRow}>
                <Body muted>Jeux joués</Body>
                <Body bold style={styles.statValue}>
                  {[...played].map((k) => GAME_LABEL[k]).join(', ')}
                </Body>
              </View>
              {reward && (
                <View style={styles.statRow}>
                  <Body muted>Gagné</Body>
                  <Chip style={{ backgroundColor: c.sun, borderColor: c.sunDark }}>
                    {univers.currencySymbol} +{reward.coins} {univers.currency}
                  </Chip>
                </View>
              )}
              {perfect && (
                <Body style={{ color: c.ok }} bold>
                  Bonus sans faute compris !
                </Body>
              )}
              {reward && reward.streak > 0 && (
                <Body bold>
                  🔥 Série : {reward.streak} jour{reward.streak > 1 ? 's' : ''}
                </Body>
              )}
              {reward?.questsCompleted.map((q) => (
                <Body key={q.id} style={{ color: c.ok }} bold>
                  Quête réussie : {q.label} (+{QUEST_REWARD})
                </Body>
              ))}
              {reward?.stageUp && (
                <Body style={{ color: c.primary }} bold>
                  Gribouille grandit : il est maintenant {reward.stageUp} !
                </Body>
              )}
            </Card>

            {reward?.sticker && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={chestOpen ? reward.sticker.name : `Ouvrir le ${univers.words.coffre}`}
                onPress={() => {
                  setChestOpen(true);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                }}
                style={[styles.chest, { backgroundColor: chestOpen ? c.okBg : c.sun, borderColor: chestOpen ? c.ok : c.sunDark, borderRadius: univers.font.radius }]}>
                {chestOpen ? (
                  <>
                    <Text style={styles.chestEmoji}>{reward.sticker.emoji}</Text>
                    <Title size="md" style={styles.centerText}>
                      {reward.sticker.name}
                    </Title>
                    <Body muted style={styles.centerText}>Nouvel autocollant dans tes récompenses.</Body>
                  </>
                ) : (
                  <>
                    <Text style={styles.chestEmoji}>🎁</Text>
                    <Title size="md" style={{ color: c.onSun }}>
                      Touche pour ouvrir ton {univers.words.coffre.toLowerCase()}
                    </Title>
                  </>
                )}
              </Pressable>
            )}

            <Card>
              <Body muted>{SUBJECT_LABEL[lesson.subject]} · à retenir</Body>
              <Body>{lesson.summary}</Body>
              {reward && <Body muted>Gribouille te la reproposera le {formatDay(reward.due)}.</Body>}
            </Card>

            <Button label={univers.words.encore} variant="sun" onPress={() => router.replace(`/mission/${lesson.id}`)} />
            <Button label="Retour à l'accueil" variant="ghost" onPress={quit} />
          </ScrollView>
        </SafeAreaView>
      </Screen>
    );
  }

  const progress = Math.min(1, position / Math.max(1, queue.length));

  return (
    <Screen>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Quitter la mission" onPress={quit} hitSlop={12}>
            <Text style={[styles.close, { color: c.soft }]}>✕</Text>
          </Pressable>
          <View style={[styles.bar, { backgroundColor: c.line }]}>
            <View style={[styles.barFill, { width: `${progress * 100}%`, backgroundColor: c.primary }]} />
          </View>
          <Chip>
            {univers.currencySymbol} {good * COINS_PER_GOOD}
          </Chip>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.topline}>
            <Body muted>
              {SUBJECT_LABEL[lesson.subject]} · {GAME_LABEL[step.exercise.kind]}
            </Body>
            {step.retry && <Chip style={{ backgroundColor: c.primaryTint }}>Seconde chance</Chip>}
          </View>

          <Card>
            <Game key={`${step.exercise.id}-${attempt}`} exercise={step.exercise} onAnswer={answer} done={result !== null} />
          </Card>

          {result !== null && (
            <Card style={{ backgroundColor: result ? c.okBg : c.koBg, borderColor: result ? c.ok : c.ko }}>
              <View style={styles.feedbackRow}>
                <Gribouille size={64} mood={result ? 'fier' : 'curieux'} />
                <View style={styles.feedbackText}>
                  <Title size="md" style={{ color: result ? c.ok : c.ko }}>
                    {result ? univers.words.bravo : 'Pas tout à fait'}
                  </Title>
                  {!result && step.exercise.explain && <Body>{step.exercise.explain}</Body>}
                  {!result && !step.retry && <Body muted>On la refera à la fin de la mission.</Body>}
                </View>
              </View>
              <Button label={position + 1 >= queue.length && !(result === false && !step.retry) ? 'Voir le résultat' : 'Continuer'} onPress={next} />
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

/** 2026-10-08 → 8/10 */
function formatDay(day: string): string {
  const [, m, d] = day.split('-');
  return `${Number(d)}/${Number(m)}`;
}

/** Petit effet de fête de l'écran de fin, un par univers. Les animations viendront plus tard. */
const CELEBRATION: Record<string, string> = {
  confettis: '🎉 🎊 🎉',
  pow: '💥 POW 💥',
  petales: '🌸 🌸 🌸',
  etoiles: '✨ 🚀 ✨',
  feuilles: '🌿 🦖 🌿',
  xp: '⚡ +XP ⚡',
  spray: '🎨 💨 🎨',
  tampon: '🔎 ✔ 🔎',
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  centerText: { textAlign: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  close: { fontSize: 22, fontWeight: '700', paddingHorizontal: 4 },
  bar: { flex: 1, height: 12, borderRadius: 999, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999 },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  topline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feedbackRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  feedbackText: { flex: 1, gap: 4 },
  endContent: { padding: 20, gap: 14, alignItems: 'stretch', paddingBottom: 40 },
  party: { fontSize: 28, textAlign: 'center' },
  mascot: { alignItems: 'center' },
  speaker: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  stats: { gap: 10 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  statValue: { flex: 1, textAlign: 'right' },
  chest: { borderWidth: 2, borderBottomWidth: 6, padding: 16, alignItems: 'center', gap: 6 },
  chestEmoji: { fontSize: 56 },
});
