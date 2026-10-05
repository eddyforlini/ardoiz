import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder } from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Gribouille } from '@/components/gribouille';
import { Body, Button, Card, Chip, Screen } from '@/components/ui';
import { poemLesson, wordsLesson } from '@/content/generate';
import { useLessons } from '@/content/LessonsProvider';
import { searchPoems, type Poem } from '@/content/poems';
import { LEVELS, type Level } from '@/content/types';
import { sayWord } from '@/content/speech';
import { GAME_LABEL } from '@/games';
import { useProfile } from '@/profile/ProfileProvider';
import { useUnivers } from '@/univers/UniversProvider';

type Mode = 'mots' | 'poesie';

/** Découpe ce que le parent a tapé : une ligne ou une virgule par mot */
function parseWords(raw: string): string[] {
  const seen = new Set<string>();
  return raw
    .split(/[\n,;]+/)
    .map((w) => w.trim().replace(/^[-•·\d.)\s]+/, ''))
    .filter((w) => w.length > 0 && !seen.has(w) && seen.add(w));
}

const canRecord = Platform.OS !== 'web';

/**
 * Sans photo ni serveur : le parent tape (ou dicte) les mots de la semaine,
 * ou retrouve la poésie par son titre. Les jeux sont fabriqués par des règles,
 * sur le téléphone. Le parent peut enregistrer sa voix pour chaque mot.
 */
export default function AjouterScreen() {
  const { univers } = useUnivers();
  const c = univers.colors;
  const { level: profileLevel } = useProfile();
  const { addLesson } = useLessons();
  const [mode, setMode] = useState<Mode>('mots');
  const [level, setLevel] = useState<Level>(profileLevel);

  // Mots
  const [wordsTitle, setWordsTitle] = useState('');
  const [rawWords, setRawWords] = useState('');
  const [audios, setAudios] = useState<Record<string, string>>({});
  const words = useMemo(() => parseWords(rawWords), [rawWords]);

  // Poésie
  const [query, setQuery] = useState('');
  const [poemTitle, setPoemTitle] = useState('');
  const [poemAuthor, setPoemAuthor] = useState('');
  const [rawLines, setRawLines] = useState('');
  const lines = useMemo(() => rawLines.split('\n').map((l) => l.trim()).filter(Boolean), [rawLines]);
  const results = useMemo(() => (query.trim().length >= 2 ? searchPoems(query).slice(0, 6) : []), [query]);

  // Enregistrement de la voix du parent
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [recording, setRecording] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  async function toggleRecord(word: string) {
    try {
      if (recording === word) {
        await recorder.stop();
        setRecording(null);
        if (recorder.uri) {
          const dir = Paths.document;
          const name = `voix-${Date.now().toString(36)}.m4a`;
          const dest = new File(dir, name);
          await new File(recorder.uri).copy(dest);
          setAudios((a) => ({ ...a, [word]: dest.uri }));
        }
        return;
      }
      if (recording) {
        await recorder.stop();
        setRecording(null);
      }
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        setMicError('Ardoiz a besoin du micro pour enregistrer ta voix.');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setRecording(word);
    } catch (err) {
      setRecording(null);
      setMicError(err instanceof Error ? err.message : 'L\'enregistrement a raté.');
    }
  }

  function removeAudio(word: string) {
    setAudios((a) => {
      const next = { ...a };
      delete next[word];
      return next;
    });
  }

  const lesson = useMemo(() => {
    if (mode === 'mots') {
      if (words.length < 2) return null;
      return wordsLesson({ title: wordsTitle, words: words.map((word) => ({ word, audio: audios[word] })), level });
    }
    if (lines.length < 2) return null;
    return poemLesson({ title: poemTitle || 'Poésie', author: poemAuthor, lines, level });
  }, [mode, words, wordsTitle, audios, lines, poemTitle, poemAuthor, level]);

  function pickPoem(p: Poem) {
    setPoemTitle(p.title);
    setPoemAuthor(p.author);
    setRawLines(p.lines.join('\n'));
    setQuery('');
  }

  function validate() {
    if (!lesson) return;
    addLesson(lesson);
    router.replace(`/mission/${lesson.id}`);
  }

  const inputStyle = [styles.input, { color: c.ink, borderColor: c.line, backgroundColor: c.card, borderRadius: univers.font.radius }];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hello}>
          <Gribouille size={72} mood="curieux" />
          <Card style={styles.bubble}>
            <Body>Pas besoin de photo : tape les mots ou retrouve la poésie, je fabrique les jeux tout de suite, sans rien envoyer nulle part.</Body>
          </Card>
        </View>

        <View style={styles.modes}>
          {(
            [
              ['mots', 'Mots de dictée'],
              ['poesie', 'Poésie'],
            ] as [Mode, string][]
          ).map(([m, label]) => (
            <Pressable
              key={m}
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === m }}
              onPress={() => setMode(m)}
              style={[styles.modeBtn, { borderColor: mode === m ? c.primary : c.line, backgroundColor: mode === m ? c.primaryTint : c.card, borderRadius: univers.font.radius }]}>
              <Body bold style={{ color: mode === m ? c.primary : c.soft }}>{label}</Body>
            </Pressable>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.levels}>
          {LEVELS.map((lv) => {
            const selected = lv === level;
            return (
              <Pressable
                key={lv}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`Niveau ${lv}`}
                onPress={() => setLevel(lv)}
                style={[styles.level, { borderColor: selected ? c.primary : c.line, backgroundColor: selected ? c.primary : c.card, borderRadius: univers.font.radius }]}>
                <Body bold style={{ color: selected ? c.onPrimary : c.soft }}>{lv}</Body>
              </Pressable>
            );
          })}
        </ScrollView>

        {mode === 'mots' && (
          <>
            <TextInput value={wordsTitle} onChangeText={setWordsTitle} placeholder="Titre (Mots de la semaine)" placeholderTextColor={c.soft} style={inputStyle} accessibilityLabel="Titre de la liste" />
            <TextInput
              value={rawWords}
              onChangeText={setRawWords}
              placeholder={'Un mot par ligne\ntoujours\nbeaucoup\nmaison'}
              placeholderTextColor={c.soft}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              style={[...inputStyle, styles.multiline]}
              accessibilityLabel="Les mots de la dictée"
            />
            {words.length > 0 && (
              <Card>
                <Body muted>
                  {words.length} mot{words.length > 1 ? 's' : ''}
                  {canRecord ? '. Touche le micro pour enregistrer ta voix : ton enfant t\'entendra pendant la dictée.' : '.'}
                </Body>
                {words.map((w) => {
                  const has = Boolean(audios[w]);
                  const live = recording === w;
                  return (
                    <View key={w} style={styles.wordRow}>
                      <Body bold style={styles.wordText}>{w}</Body>
                      {canRecord && (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={live ? `Arrêter l'enregistrement de ${w}` : `Enregistrer ${w}`}
                          onPress={() => toggleRecord(w)}
                          style={[styles.mic, { backgroundColor: live ? c.koBg : has ? c.okBg : c.primaryTint, borderColor: live ? c.ko : has ? c.ok : c.primary }]}>
                          <Text style={{ fontSize: 18 }}>{live ? '⏹' : '🎙'}</Text>
                        </Pressable>
                      )}
                      {has && (
                        <>
                          <Pressable accessibilityRole="button" accessibilityLabel={`Écouter ${w}`} onPress={() => sayWord(w, audios[w])} style={[styles.mic, { backgroundColor: c.okBg, borderColor: c.ok }]}>
                            <Text style={{ fontSize: 18 }}>▶️</Text>
                          </Pressable>
                          <Pressable accessibilityRole="button" accessibilityLabel={`Supprimer l'enregistrement de ${w}`} onPress={() => removeAudio(w)} style={[styles.mic, { backgroundColor: c.card, borderColor: c.line }]}>
                            <Text style={{ fontSize: 16, color: c.soft }}>✕</Text>
                          </Pressable>
                        </>
                      )}
                    </View>
                  );
                })}
                {micError && <Body style={{ color: c.ko }}>{micError}</Body>}
              </Card>
            )}
          </>
        )}

        {mode === 'poesie' && (
          <>
            <TextInput value={query} onChangeText={setQuery} placeholder="Chercher par titre ou auteur (Corbeau, Verlaine...)" placeholderTextColor={c.soft} style={inputStyle} accessibilityLabel="Chercher une poésie" />
            {results.length > 0 && (
              <Card>
                {results.map((p) => (
                  <Pressable key={p.id} accessibilityRole="button" onPress={() => pickPoem(p)} style={[styles.result, { borderColor: c.line }]}>
                    <Body bold>{p.title}</Body>
                    <Body muted>
                      {p.author} · {p.hint} · {p.lines.length} vers
                    </Body>
                  </Pressable>
                ))}
              </Card>
            )}
            {query.trim().length >= 2 && results.length === 0 && (
              <Card>
                <Body muted>Je ne l'ai pas dans ma liste (seuls les poèmes libres de droits y sont). Tape les vers ci-dessous, ou prends la page en photo.</Body>
              </Card>
            )}
            <TextInput value={poemTitle} onChangeText={setPoemTitle} placeholder="Titre de la poésie" placeholderTextColor={c.soft} style={inputStyle} accessibilityLabel="Titre de la poésie" />
            <TextInput value={poemAuthor} onChangeText={setPoemAuthor} placeholder="Auteur (facultatif)" placeholderTextColor={c.soft} style={inputStyle} accessibilityLabel="Auteur" />
            <TextInput
              value={rawLines}
              onChangeText={setRawLines}
              placeholder={'Un vers par ligne'}
              placeholderTextColor={c.soft}
              multiline
              autoCorrect={false}
              style={[...inputStyle, styles.multiline, styles.tall]}
              accessibilityLabel="Les vers de la poésie"
            />
            {lines.length > 0 && <Body muted>{lines.length} vers. Astuce : 8 à 12 vers par séance, le reste la fois d'après.</Body>}
          </>
        )}

        {lesson && (
          <Card>
            <Body muted>
              {lesson.exercises.length} jeux · environ {lesson.minutes} min · niveau {level}
            </Body>
            <View style={styles.chips}>
              {lesson.exercises.map((e) => (
                <Chip key={e.id}>{GAME_LABEL[e.kind]}</Chip>
              ))}
            </View>
          </Card>
        )}

        <Button label="Valider et jouer" variant="sun" disabled={!lesson} onPress={validate} />
        <Button label="Annuler" variant="ghost" onPress={() => router.back()} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  hello: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bubble: { flex: 1 },
  modes: { flexDirection: 'row', gap: 8 },
  levels: { gap: 6, paddingVertical: 2 },
  level: { minWidth: 52, alignItems: 'center', borderWidth: 2, paddingVertical: 6, paddingHorizontal: 8 },
  modeBtn: { flex: 1, borderWidth: 2, paddingVertical: 10, alignItems: 'center' },
  input: { borderWidth: 2, paddingVertical: 10, paddingHorizontal: 14, fontSize: 16 },
  multiline: { minHeight: 110, textAlignVertical: 'top' },
  tall: { minHeight: 180 },
  wordRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  wordText: { flex: 1, fontSize: 17 },
  mic: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  result: { paddingVertical: 8, borderBottomWidth: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
