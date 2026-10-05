import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Card, Screen, Title } from '@/components/ui';

type Props = {
  title: string;
  intro: string;
  /** Ce que l'écran contiendra, pour que le squelette raconte déjà l'appli */
  bullets: string[];
  step: string;
};

/** Écran d'attente pour une partie de l'appli pas encore construite */
export function PlaceholderScreen({ title, intro, bullets, step }: Props) {
  return (
    <Screen>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Title size="xl">{title}</Title>
          <Body muted>{intro}</Body>
          <Card>
            {bullets.map((b) => (
              <Body key={b}>• {b}</Body>
            ))}
          </Card>
          <Body muted>Prévu à l'étape {step} de la feuille de route.</Body>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
});
