import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { useUnivers } from '@/univers/UniversProvider';

type TabDef = { name: string; title: string; glyph: string };

/**
 * Trois onglets pour l'enfant, comme chez Khan Kids ou Smartick : jouer,
 * son monde, ses leçons. La photo et l'espace parent sont derrière un
 * verrou, hors de la barre. Les glyphes sont provisoires.
 */
const TABS: TabDef[] = [
  { name: 'index', title: 'Jouer', glyph: '▶' },
  { name: 'monde', title: 'Mon monde', glyph: '⚑' },
  { name: 'lecons', title: 'Mes leçons', glyph: '▤' },
];

export default function TabsLayout() {
  const { univers } = useUnivers();
  const c = univers.colors;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.soft,
        tabBarStyle: { backgroundColor: c.card, borderTopColor: c.line, borderTopWidth: 2 },
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
        sceneStyle: { backgroundColor: c.bg },
      }}>
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22, lineHeight: 26 }}>{tab.glyph}</Text>,
          }}
        />
      ))}
    </Tabs>
  );
}
