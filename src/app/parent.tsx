import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ParentGate } from '@/components/parent-gate';
import { Body, Button, Card, Chip, Screen, Title } from '@/components/ui';
import { useLessons } from '@/content/LessonsProvider';
import { SUBJECT_LABEL, type Lesson } from '@/content/types';
import { GAME_LABEL } from '@/games';
import { useProfile } from '@/profile/ProfileProvider';
import { MASTERY_STATE, PIEGES_FIXED_NEEDED, masteryState, missionsDone } from '@/profile/progress';
import { useProgress } from '@/profile/ProgressProvider';
import { useUnivers } from '@/univers/UniversProvider';

/** Résumé d'un exercice pour le parent : l'énoncé ou le mot, selon le jeu */
function describe(exerciseId: string, all: Lesson[]): { title: string; lesson: string; game: string } | null {
  for (const l of all) {
    const e = l.exercises.find((x) => x.id === exerciseId);
    if (!e) continue;
    const title =
      'word' in e ? `Le mot « ${e.word} »` : 'statement' in e ? e.statement : 'prompt' in e ? e.prompt : l.title;
    return { title, lesson: `${SUBJECT_LABEL[l.subject]} · ${l.title}`, game: GAME_LABEL[e.kind] };
  }
  return null;
}

/**
 * Espace parent, derrière un petit calcul : ajouter une leçon, choisir le
 * niveau, voir où en est l'enfant, ses pièges, et les réglages. Les comptes
 * viendront avec Supabase.
 */
export default function ParentScreen() {
  const { univers } = useUnivers();
  const c = univers.colors;
  const { level } = useProfile();
  const { progress, reset } = useProgress();
  const { lessons, custom, removeLesson } = useLessons();
  const [confirm, setConfirm] = useState(false);
  const errors = Object.entries(progress.errors).sort((a, b) => b[1].count - a[1].count);
  const lessonsPlayed = Object.keys(progress.mastery).length;
  const played = lessons.filter((l) => progress.mastery[l.id]);
  const acquired = played.filter((l) => masteryState(progress, l.id) === 'done').length;
  // Ce qui piège le plus : la leçon qui revient le plus souvent dans le journal des erreurs (décision 23 : pas de score global, une erreur type, une action)
  const trapCounts = new Map<string, number>();
  for (const e of Object.values(progress.errors)) trapCounts.set(e.lessonId, (trapCounts.get(e.lessonId) ?? 0) + e.count);
  const trapId = [...trapCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const trap = trapId ? lessons.find((l) => l.id === trapId[0]) : undefined;

  return (
    <ParentGate>
      <Screen>
        <ScrollView contentContainerStyle={styles.content}>
          <Card>
            <Title size="md">Ajouter la leçon du soir</Title>
            <Body muted>La photo est lue puis oubliée. Les mots tapés et la poésie n'ont pas besoin d'internet.</Body>
            <Button label="📷 Photographier une leçon" variant="sun" onPress={() => router.push('/photo')} />
            <Button label="✍️ Taper ou coller le texte" onPress={() => router.push('/ajouter')} />
            <View style={styles.row}>
              <Body muted>Classe de l'enfant :</Body>
              <Link href="/niveau" asChild>
                <Button label={`${level} ▾`} variant="ghost" />
              </Link>
            </View>
          </Card>

          <Card>
            <Title size="md">Cette semaine</Title>
            <View style={styles.row}>
              <Chip>🎯 {missionsDone(progress)} mission{missionsDone(progress) > 1 ? 's' : ''}</Chip>
              <Chip>🔥 {progress.streak.count}/7 jours</Chip>
              <Chip>📚 {lessonsPlayed} leçon{lessonsPlayed > 1 ? 's' : ''} en {level}</Chip>
            </View>
            <Body muted>
              {lessonsPlayed === 0
                ? 'Aucune mission jouée pour l\'instant.'
                : `${acquired} leçon${acquired > 1 ? 's' : ''} acquise${acquired > 1 ? 's' : ''}, ${played.length - acquired} en cours. Une leçon est acquise après trois réussites à des jours différents ; elle revient à J+1, J+3, J+7, J+14 puis J+30, et dès le lendemain après une mission ratée.`}
            </Body>
            {trap && trapId && (
              <Body muted>
                Ce qui piège le plus : « {trap.title} » ({trapId[1]} erreur{trapId[1] > 1 ? 's' : ''}). Une idée : relisez cette leçon avec lui cinq minutes avant la prochaine mission.
              </Body>
            )}
            <Button label={`🎓 Le programme de ${level}, attendu par attendu`} variant="ghost" onPress={() => router.push('/programme')} />
          </Card>

          <Card>
            <Title size="md">Suivi par leçon</Title>
            {lessonsPlayed === 0 && <Body muted>Les leçons jouées apparaîtront ici avec leur niveau de maîtrise.</Body>}
            {lessons.filter((l) => progress.mastery[l.id]).map((l) => {
              const m = progress.mastery[l.id];
              const state = masteryState(progress, l.id);
              const status = MASTERY_STATE[state].label;
              const color = state === 'done' ? c.ok : c.primary;
              return (
                <View key={l.id} style={[styles.line, { borderColor: c.line }]}>
                  <View style={styles.grow}>
                    <Body bold>{l.title}</Body>
                    <Body muted style={styles.small}>
                      {SUBJECT_LABEL[l.subject]} · {m.plays} fois · prochaine révision le {m.due.slice(8)}/{m.due.slice(5, 7)}
                    </Body>
                  </View>
                  <Chip style={{ borderColor: color }}>
                    {MASTERY_STATE[state].glyph} {status}
                  </Chip>
                </View>
              );
            })}
          </Card>

          <Card>
            <Title size="md">Mes pièges · {errors.length}</Title>
            <Body muted>
              Les questions ratées au premier essai. Elles sortent du journal après {PIEGES_FIXED_NEEDED} réussites.
            </Body>
            {errors.map(([id, e]) => {
              const d = describe(id, lessons);
              if (!d) return null;
              return (
                <View key={id} style={[styles.line, { borderColor: c.line }]}>
                  <View style={styles.grow}>
                    <Body bold>{d.title}</Body>
                    <Body muted style={styles.small}>
                      {d.lesson} · {d.game}
                    </Body>
                  </View>
                  <Chip>
                    {e.count}× raté · {e.fixed}/{PIEGES_FIXED_NEEDED}
                  </Chip>
                </View>
              );
            })}
          </Card>

          <Card>
            <Title size="md">Leçons photographiées · {custom.length}</Title>
            {custom.length === 0 && <Body muted>Les leçons photographiées ou tapées apparaîtront ici.</Body>}
            {custom.map((l) => (
              <View key={l.id} style={[styles.line, { borderColor: c.line }]}>
                <View style={styles.grow}>
                  <Body bold>{l.title}</Body>
                  <Body muted style={styles.small}>
                    {SUBJECT_LABEL[l.subject]} · {l.level} · {l.exercises.length} jeux
                  </Body>
                </View>
                <Button label="Retirer" variant="ghost" onPress={() => removeLesson(l.id)} />
              </View>
            ))}
          </Card>

          <Card>
            <Title size="md">Réglages</Title>
            <Body muted>
              Comptes, plusieurs enfants, temps d'écran, mode dys et rapport hebdomadaire arriveront avec l'étape 6.
            </Body>
            {confirm ? (
              <View style={styles.row}>
                <Button label="Oui, tout effacer" onPress={() => {
                  reset();
                  setConfirm(false);
                }} />
                <Button label="Annuler" variant="ghost" onPress={() => setConfirm(false)} />
              </View>
            ) : (
              <Button label="Remettre les progrès à zéro" variant="ghost" onPress={() => setConfirm(true)} />
            )}
          </Card>
        </ScrollView>
      </Screen>
    </ParentGate>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderTopWidth: 1 },
  grow: { flex: 1 },
  small: { fontSize: 13 },
});
