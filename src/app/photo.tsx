import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';

import { Gribouille } from '@/components/gribouille';
import { ParentGate } from '@/components/parent-gate';
import { Body, Button, Card, Chip, Screen, Title } from '@/components/ui';
import { analysePhoto, serverReady, type AnalyseResult } from '@/content/api';
import { ocrAvailable, readText } from '@/content/ocr';
import { analyseText } from '@/content/recognize';
import { useLessons } from '@/content/LessonsProvider';
import { SOURCE_LABEL, SUBJECT_LABEL } from '@/content/types';
import { GAME_LABEL } from '@/games';
import { useProfile } from '@/profile/ProfileProvider';
import { useUnivers } from '@/univers/UniversProvider';

type State =
  | { step: 'idle' }
  | { step: 'analysing'; uri: string; remote: boolean }
  /** base64 gardé tant qu'une lecture complète sur le serveur reste possible, pour le bouton « Pas la bonne leçon ? » */
  | { step: 'preview'; uri: string; result: Result; base64?: string; readText?: string }
  | { step: 'error'; uri: string | null; message: string; readText?: string };

/** Réduit la photo (1280 px de large, JPEG) : assez pour lire une page, léger à envoyer */
async function shrink(uri: string): Promise<{ base64: string; uri: string }> {
  const ref = await ImageManipulator.manipulate(uri).resize({ width: 1280 }).renderAsync();
  const out = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.8, base64: true });
  if (!out.base64) throw new Error('Impossible de préparer la photo.');
  return { base64: out.base64, uri: out.uri };
}

type Result = AnalyseResult & { fromBank?: boolean };

const canRead = ocrAvailable || serverReady;

/**
 * Photo de la leçon : le texte est lu sur le téléphone (ML Kit, hors ligne),
 * puis reconnu par règles : calculs, poésie, liste de mots, ou leçon déjà
 * dans la banque. Claude côté serveur n'intervient qu'en dernier recours,
 * si le serveur est branché. La photo n'est ni enregistrée ni envoyée
 * quand la lecture se fait sur place.
 */
/** Ce que le téléphone a lu sur la page : le parent voit sur quoi Gribouille s'est appuyé */
function ReadText({ text }: { text: string }) {
  const shown = text.length > 700 ? `${text.slice(0, 700)}…` : text;
  return (
    <Card>
      <Body muted>Texte lu sur la page</Body>
      <Body muted style={styles.small}>{shown || '(rien de lisible)'}</Body>
    </Card>
  );
}

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
      setState({ step: 'analysing', uri, remote: !ocrAvailable });
      if (ocrAvailable) {
        const text = await readText(uri);
        // Avec le serveur, pas de rattachement par ressemblance : une vraie page se lit mieux en entier
        const r = analyseText(text, level, undefined, { allowSimilar: !serverReady });
        if (r.kind !== 'unknown') {
          setState({
            step: 'preview',
            uri,
            result: { lesson: r.lesson, warning: r.why, dropped: 0, fromBank: r.kind === 'bank' },
            base64: serverReady ? base64 : undefined,
            readText: text,
          });
          return;
        }
        if (!serverReady) {
          setState({ step: 'error', uri: null, message: `${r.why} Recopie le texte dans « Taper les mots ou la poésie », onglet « Texte de la leçon ».`, readText: text });
          return;
        }
      }
      await sendToServer(uri, base64);
    } catch (err) {
      setState({ step: 'error', uri: null, message: err instanceof Error ? err.message : 'Quelque chose a raté.' });
    }
  }

  /** Lecture complète sur le serveur : quand les règles n'ont rien reconnu, ou que le parent dit que ce n'est pas la bonne leçon */
  async function sendToServer(uri: string, base64: string) {
    setState({ step: 'analysing', uri, remote: true });
    try {
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

  function validate(result: Result) {
    if (!result.fromBank) addLesson(result.lesson);
    setState({ step: 'idle' });
    router.push(`/mission/${result.lesson.id}`);
  }

  return (
    <ParentGate>
      <Screen>
        <ScrollView contentContainerStyle={styles.content}>

          {!canRead && (
            <Card style={{ borderColor: c.sunDark, backgroundColor: c.sun }}>
              <Body style={{ color: c.onSun }} bold>
                La lecture des photos n'est pas disponible dans cette version.
              </Body>
              <Body style={{ color: c.onSun }}>
                Elle demande une version installée de l'appli (voir docs/dev-build.md), pas Expo Go. En attendant, tape ou colle le texte de la leçon : les jeux se fabriquent pareil.
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
              <Button label="📷 Prendre la page en photo" variant="sun" onPress={takePhoto} disabled={!canRead} />
              <Button label="Choisir dans la galerie" variant="ghost" onPress={chooseFromLibrary} disabled={!canRead} />
              <Button label="✍️ Taper ou coller le texte" onPress={() => router.push('/ajouter')} />
              <Card>
                <Body muted>Pour une bonne lecture : page bien à plat, lumière du jour, toute la page dans le cadre.</Body>
                <Body muted>Niveau en cours : {level}. Change-le dans l'espace parent si besoin.</Body>
                <Body muted>
                  {ocrAvailable
                    ? 'La photo est lue sur le téléphone, puis oubliée : rien n\'est envoyé.'
                    : 'La photo est lue puis oubliée : elle n\'est enregistrée nulle part.'}
                </Body>
              </Card>
            </>
          )}

          {state.step === 'analysing' && (
            <Card style={styles.center}>
              <Image source={{ uri: state.uri }} style={styles.thumb} resizeMode="cover" />
              <ActivityIndicator size="large" color={c.primary} />
              <Body bold>Gribouille lit la page...</Body>
              <Body muted style={styles.centerText}>
                {state.remote ? 'Une trentaine de secondes : la page part au serveur, qui fabrique les jeux puis l\'oublie.' : 'Quelques secondes, tout se passe sur le téléphone.'}
              </Body>
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
              {state.readText && <ReadText text={state.readText} />}
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
              {state.base64 && (
                <>
                  <Button label="Pas la bonne leçon ? Envoyer la photo" variant="ghost" onPress={() => sendToServer(state.uri, state.base64!)} />
                  <Body muted style={styles.centerText}>
                    La page sera lue entièrement sur le serveur, puis oubliée.
                  </Body>
                </>
              )}
              {state.readText && <ReadText text={state.readText} />}
            </>
          )}
        </ScrollView>
      </Screen>
    </ParentGate>
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
