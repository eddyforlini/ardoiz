import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Body, Screen, Title } from '@/components/ui';
import { UNIVERS_LIST, type Audience, type Univers } from '@/univers/univers';
import { useUnivers } from '@/univers/UniversProvider';

const GROUPS: { audience: Audience; label: string }[] = [
  { audience: 'petits', label: 'Pour les petits' },
  { audience: 'grands', label: 'Pour les grands' },
];

export default function UniversScreen() {
  const { univers: current, setUniversId } = useUnivers();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Body muted>
          Tout change d'habit : couleurs, Gribouille, nom des récompenses et ton des jeux. Le contenu de
          l'école ne bouge pas.
        </Body>
        {GROUPS.map((group) => (
          <View key={group.audience} style={styles.group}>
            <Title size="md">{group.label}</Title>
            {UNIVERS_LIST.filter((u) => u.audience === group.audience).map((u) => (
              <UniversCard
                key={u.id}
                univers={u}
                selected={u.id === current.id}
                onPress={() => {
                  setUniversId(u.id);
                  router.back();
                }}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

function UniversCard({ univers, selected, onPress }: { univers: Univers; selected: boolean; onPress: () => void }) {
  const c = univers.colors;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: c.bg,
          borderColor: selected ? c.sun : c.line,
          borderRadius: univers.font.radius,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <View style={[styles.swatch, { backgroundColor: c.primary }]}>
        <Preview univers={univers} />
      </View>
      <View style={styles.text}>
        <Text style={{ color: c.ink, fontSize: 20, fontWeight: univers.font.weight, letterSpacing: univers.font.letterSpacing }}>
          {univers.name}
        </Text>
        <Text style={{ color: c.soft, fontSize: 13 }}>{univers.tagline}</Text>
        <Text style={{ color: c.ink, fontSize: 12, fontWeight: '700' }}>
          {univers.currencySymbol} {univers.currency} · {univers.words.bravo}
        </Text>
      </View>
    </Pressable>
  );
}

/**
 * Le composant Gribouille lit l'univers courant ; ici on veut l'aperçu de
 * chaque univers, donc on dessine une version réduite avec les couleurs passées.
 */
function Preview({ univers }: { univers: Univers }) {
  return (
    <View style={{ backgroundColor: univers.colors.card, borderRadius: 999, padding: 2 }}>
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: univers.colors.ink, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: univers.colors.card, fontSize: 18, fontWeight: '800' }}>
          {univers.tone === 'ado' ? '¬‿¬' : '•‿•'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 18, paddingBottom: 40 },
  group: { gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderWidth: 3,
  },
  swatch: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
});
