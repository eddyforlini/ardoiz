import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Body, Chip, Screen, Title } from '@/components/ui';
import { useLessons } from '@/content/LessonsProvider';
import { LEVEL_GROUPS, type Level } from '@/content/types';
import { useProfile } from '@/profile/ProfileProvider';
import { useUnivers } from '@/univers/UniversProvider';

/** Choix du niveau scolaire. Les leçons de l'accueil suivent ce choix. */
export default function NiveauScreen() {
  const { level: current, setLevel } = useProfile();
  const { univers } = useUnivers();
  const c = univers.colors;
  const { lessons } = useLessons();

  function count(level: Level) {
    return lessons.filter((l) => l.level === level).length;
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Body muted>
          Le niveau choisit les leçons proposées. Pour l'instant seules des leçons de CE1 sont prêtes ; les
          autres niveaux se rempliront avec les photos de leçons.
        </Body>
        {LEVEL_GROUPS.map((group) => (
          <View key={group.label} style={styles.group}>
            <Title size="md">{group.label}</Title>
            <View style={styles.grid}>
              {group.levels.map((level) => {
                const selected = level === current;
                const n = count(level);
                return (
                  <Pressable
                    key={level}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      setLevel(level);
                      router.back();
                    }}
                    style={({ pressed }) => [
                      styles.tile,
                      {
                        backgroundColor: selected ? c.primary : c.card,
                        borderColor: selected ? c.primaryDark : c.line,
                        borderRadius: univers.font.radius,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}>
                    <Title size="lg" style={{ color: selected ? c.onPrimary : c.ink }}>
                      {level}
                    </Title>
                    {n > 0 ? (
                      <Chip style={{ backgroundColor: c.sun, borderColor: c.sunDark }}>
                        {n} leçon{n > 1 ? 's' : ''}
                      </Chip>
                    ) : (
                      <Body muted style={{ color: selected ? c.onPrimary : c.soft, fontSize: 12 }}>
                        bientôt
                      </Body>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 18, paddingBottom: 40 },
  group: { gap: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '30%', flexGrow: 1, minHeight: 84, borderWidth: 2, padding: 10, gap: 6, alignItems: 'center', justifyContent: 'center' },
});
