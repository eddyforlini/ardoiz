import { Pressable, StyleSheet, Text, View, type ViewProps } from 'react-native';

import { Title } from '@/components/ui';
import { speak } from '@/content/speech';
import { useUnivers } from '@/univers/UniversProvider';

/** Ce que chaque jeu reçoit, et ce qu'il rend quand l'enfant a répondu */
export type GameProps<E> = {
  exercise: E;
  /** Appelé une seule fois, quand la réponse est connue */
  onAnswer: (correct: boolean) => void;
  /** Vrai après la réponse : le jeu se fige et montre la correction */
  done: boolean;
};

/** Consigne du jeu, avec le bouton pour l'entendre */
export function Prompt({ text, speakText }: { text: string; speakText?: string }) {
  const { univers } = useUnivers();
  return (
    <View style={styles.promptRow}>
      <Title style={styles.prompt}>{text}</Title>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Écouter la consigne"
        onPress={() => speak(speakText ?? text)}
        style={({ pressed }) => [
          styles.speaker,
          { backgroundColor: univers.colors.primaryTint, opacity: pressed ? 0.7 : 1 },
        ]}>
        <Text style={{ fontSize: 18 }}>🔊</Text>
      </Pressable>
    </View>
  );
}

/** Grosse case à toucher : option, mot, vers */
export function Tile({
  label,
  state = 'idle',
  onPress,
  disabled,
  big,
  style,
}: {
  label: string;
  state?: 'idle' | 'selected' | 'ok' | 'ko' | 'ghost';
  onPress?: () => void;
  disabled?: boolean;
  big?: boolean;
  style?: ViewProps['style'];
}) {
  const { univers } = useUnivers();
  const c = univers.colors;
  const palette =
    state === 'ok'
      ? { bg: c.okBg, fg: c.ok, border: c.ok }
      : state === 'ko'
        ? { bg: c.koBg, fg: c.ko, border: c.ko }
        : state === 'selected'
          ? { bg: c.primaryTint, fg: c.ink, border: c.primary }
          : { bg: c.card, fg: c.ink, border: c.line };
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderRadius: Math.max(10, univers.font.radius - 6),
          opacity: state === 'ghost' ? 0.25 : pressed ? 0.8 : 1,
          borderBottomWidth: pressed ? 2 : 4,
        },
        style,
      ]}>
      <Text
        style={{
          color: palette.fg,
          fontSize: big ? 26 : 17,
          fontWeight: univers.font.weight,
          letterSpacing: univers.font.letterSpacing,
          textAlign: 'center',
        }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Mélange stable d'un tableau, qui garantit un ordre différent de l'original quand c'est possible */
export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (arr.length > 1 && arr.every((v, i) => v === items[i])) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

const styles = StyleSheet.create({
  promptRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  prompt: { flex: 1 },
  speaker: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  tile: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
