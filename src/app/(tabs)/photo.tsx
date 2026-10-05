import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Gribouille } from '@/components/gribouille';
import { Body, Button, Card, Chip, Screen, Title } from '@/components/ui';
import { analysePhoto, serverReady, type AnalyseResult } from '@/content/api';
import { useLessons } from '@/content/LessonsProvider';
import { SOURCE_LABEL, SUBJECT_LABEL } from '@/content/types';
import { GAME_LABEL } from '@/games';
import { useProfile } from '@/profile/ProfileProvider';
import { useUnivers } from '@/univers/UniversProvider';

type State =
  | { step: 'idle' }
  | { step: 'analysing'; uri: string }
  | { step: 'preview'; uri: string; result: AnalyseResult }
  | { step: 'error'; uri: string | null; message: string };

/** Réduit la photo (1280 px de large, JPEG) : assez pour lire une page, léger à envoyer */
async function shrink(uri: string): Promise<{ base64: string; uri: string }> {
  const ref = await ImageManipulator.manipulate(uri).resize({ width: 1280 }).renderAsync();
  const out = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.8, base64: true });
  if (!out.base64) throw new Error('Impossible de préparer la photo.');
  return { base64: out.base64, uri: out.uri };
}

/**
 * Photo de la leçon : le parent prend la page en photo, Claude (côté serveur)
 * en fait une leçon neutre, le parent vérifie et valide. La photo n'est ni
 * enregistrée sur le téléphone ni gardée sur le serveur.
 */
export default function PhotoScreen() {
  const { univers } = useUnivers();
  const c = univers.colors;
  const { level } = useProfile();
  const { addLesson } = useLessons();
  const [state, setState] = useState<State>({ step: 'idle' });

  async function run(pick: () => Promise<ImagePicker.ImagePickerResult>) {
    try {
      const picked = await pick();
      if (picked.canceled || !picked.assets[0]) return;
      const { base64, uri } = await shrink(picked.assets[0].uri);
      setState({ step: 'analysing', uri });
      const result = await analysePhoto(base64, 'image/jpeg', level);
      setState({ step: 'preview', uri, result });
    } catch (err) {
      setState({ step: 'error', uri: null, message: err instanceof Error ? err.message : 'Quelque chose a raté.' });
    }
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setState({ step: 'error', uri: null, message: 'Ardoiz a besoin de l\'appareil photo pour lire la leçon.' });
      return;
    }
    await run(() => ImagePicker.launchCameraAsync({ quality: 0.9 }));
  }

  async function chooseFromLibrary() {
    await run(() => ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 }));
  }

  function validate(result: AnalyseResult) {
    addLesson(result.lesson);
    setState({ step: 'idle' });
    router.push(`/mission/${result.lesson.id}`);
  }

  return (
    <Screen>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Title size="xl">Photo de la leçon</Title>

          {!serverReady && (
            <Card style={{ borderColor: c.sunDark, backgroundColor: c.sun }}>
              <Body style={{ color: c.onSun }} bold>
                Le serveur n'est pas encore branché.
              </Body>
              <Body style={{ color: c.onSun }}>
                Crée un fichier .env à partir de .env.example avec l'adresse Supabase et la clé anon, puis relance l'appli.
              </Body>
            </Card>
          )}

          {state.step === 'idle' && (
            <>
              <View style={styles.hello}>
                <Gribouille size={80} mood="curieux" />
                <Card style={styles.bubble}>
                  <Body>Prends la leçon en photo, ou tape les mots de la dictée et la poésie : je fabrique les jeux, tu vérifies, et c'est parti.</Body>
                </Card>
              </View>
              <Button label="📷 Prendre la page en photo" variant="sun" onPress={takePhoto} disabled={!serverReady} />
              <Button label="Choisir dans la galerie" variant="ghost" onPress={chooseFromLibrary} disabled={!serverReady} />
              <Button label="✍️ Taper les mots ou la poésie" onPress={() => router.push('/ajouter')} />
              <Card>
                <Body muted>Pour une bonne lecture : page bien à plat, lumière du jour, toute la page dans le cadre.</Body>
                <Body muted>Niveau en cours : {level}. Change-le sur l'accueil si besoin.</Body>
                <Body muted>La photo est lue puis oubliée : elle n'est enregistrée nulle part.</Body>
              </Card>
            </>
          )}

          {state.step === 'analysing' && (
            <Card style={styles.center}>
              <Image source={{ uri: state.uri }} style={styles.thumb} resizeMode="cover" />
              <ActivityIndicator size="large" color={c.primary} />
              <Body bold>Gribouille lit la page...</Body>
              <Body muted style={styles.centerText}>Une vingtaine de secondes, le temps de fabriquer les jeux.</Body>
            </Card>
          )}

          {state.step === 'error' && (
            <>
              <Card style={{ borderColor: c.ko, backgroundColor: c.koBg }}>
                <Body bold style={{ color: c.ko }}>
                  Ça n'a pas marché
                </Body>
                <Body>{state.message}</Body>
              </Card>
              <Button label="Réessayer" onPress={() => setState({ step: 'idle' })} />
            </>
          )}

          {state.step === 'preview' && (
            <>
              <View style={styles.previewRow}>
                <Image source={{ uri: state.uri }} style={styles.thumbSmall} resizeMode="cover" />
                <View style={styles.bubble}>
                  <Body muted>
                    {SUBJECT_LABEL[state.result.lesson.subject]} · {SOURCE_LABEL[state.result.lesson.source]} · {state.result.lesson.level}
                  </Body>
                  <Title size="md">{state.result.lesson.title}</Title>
                </View>
              </View>

              <Card>
                <Body muted>Ce que Gribouille a compris</Body>
                <Body>{state.result.lesson.summary}</Body>
                <Body muted>Notion : {state.result.lesson.notion}</Body>
              </Card>

              {(state.result.warning || state.result.dropped > 0) && (
                <Card style={{ borderColor: c.sunDark }}>
                  <Body bold>À vérifier</Body>
                  {state.result.warning && <Body>{state.result.warning}</Body>}
                  {state.result.dropped > 0 && (
                    <Body muted>
                      {state.result.dropped} exercice{state.result.dropped > 1 ? 's' : ''} écarté{state.result.dropped > 1 ? 's' : ''} parce qu'incomplet{state.result.dropped > 1 ? 's' : ''}.
                    </Body>
                  )}
                </Card>
              )}

              <Card>
                <Body muted>
                  {state.result.lesson.exercises.length} jeux · environ {state.result.lesson.minutes} min
                </Body>
                <View style={styles.chips}>
                  {state.result.lesson.exercises.map((e) => (
                    <Chip key={e.id}>{GAME_LABEL[e.kind]}</Chip>
                  ))}
                </View>
                {state.result.lesson.exercises.map((e, i) => (
                  <Body key={e.id} muted style={styles.small}>
                    {i + 1}. {describe(e)}
                  </Body>
                ))}
              </Card>

              <Button label="Valider et jouer" variant="sun" onPress={() => validate(state.result)} />
              <Button label="Reprendre la photo" variant="ghost" onPress={() => setState({ step: 'idle' })} />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

/** Une ligne par exercice pour que le parent voie ce qui sera demandé */
function describe(e: { kind: string; [key: string]: unknown }): string {
  if ('statement' in e) return String(e.statement);
  if ('word' in e) return `Le mot « ${String(e.word)} »`;
  if ('prompt' in e) return String(e.prompt);
  return GAME_LABEL[e.kind as keyof typeof GAME_LABEL];
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  hello: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bubble: { flex: 1 },
  center: { alignItems: 'center', gap: 12 },
  centerText: { textAlign: 'center' },
  thumb: { width: 160, height: 200, borderRadius: 12 },
  thumbSmall: { width: 72, height: 90, borderRadius: 10 },
  previewRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  small: { fontSize: 13 },
});
