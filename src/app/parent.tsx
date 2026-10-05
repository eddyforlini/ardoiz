import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ParentGate } from '@/components/parent-gate';
import { Body, Button, Card, Chip, Screen, Title } from '@/components/ui';
import { useLessons } from '@/content/LessonsProvider';
import { SUBJECT_LABEL, type Lesson } from '@/content/types';
import { GAME_LABEL } from '@/games';
import { useProfile } from '@/profile/ProfileProvider';
import { PIEGES_FIXED_NEEDED, missionsDone } from '@/profile/progress';
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
  const avg = lessonsPlayed ? Math.round(Object.values(progress.mastery).reduce((n, m) => n + m.best, 0) / lessonsPlayed) : 0;

  return (
    <ParentGate>
      <Screen>
        <ScrollView contentContainerStyle={styles.content}>
          <Card>
            <Title size="md">Ajouter la leçon du soir</Title>
            <Body muted>La photo est lue puis oubliée. Les mots tapés et la poésie n'ont pas besoin d'internet.</Body>
            <Button label="📷 Photographier une leçon" variant="sun" onPress={() => router.push('/photo')} />
            <Button label="✍️ Taper les mots ou la poésie" onPress={() => router.push('/ajouter')} />
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
              <Chip>🔥 {progress.streak.count} jour{progress.streak.count > 1 ? 's' : ''}</Chip>
              <Chip>📚 {lessonsPlayed} leçon{lessonsPlayed > 1 ? 's' : ''} en {level}</Chip>
            </View>
            <Body muted>
              {lessonsPlayed === 0
                ? 'Aucune mission jouée pour l\'instant.'
                : `Maîtrise moyenne des leçons jouées : ${avg} %. Chaque leçon revient à J+1, J+3 puis J+7 après une réussite.`}
            </Body>
          </Card>

          <Card>
            <Title size="md">Suivi par leçon</Title>
            {lessonsPlayed === 0 && <Body muted>Les leçons jouées apparaîtront ici avec leur niveau de maîtrise.</Body>}
            {lessons.filter((l) => progress.mastery[l.id]).map((l) => {
              const m = progress.mastery[l.id];
              const status = m.best >= 80 ? 'Acquis' : m.best >= 50 ? 'En cours' : 'À retravailler';
              const color = m.best >= 80 ? c.ok : m.best >= 50 ? c.primary : c.ko;
              return (
                <View key={l.id} style={[styles.line, { borderColor: c.line }]}>
                  <View style={styles.grow}>
                    <Body bold>{l.title}</Body>
                    <Body muted style={styles.small}>
                      {SUBJECT_LABEL[l.subject]} · {m.plays} fois · prochaine révision le {m.due.slice(8)}/{m.due.slice(5, 7)}
                    </Body>
                  </View>
                  <Chip style={{ borderColor: color }}>
                    {status} {m.best} %
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
