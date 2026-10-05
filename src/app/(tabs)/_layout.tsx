import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { useUnivers } from '@/univers/UniversProvider';

type TabDef = { name: string; title: string; glyph: string };

/** Six onglets. Les glyphes sont provisoires. */
const TABS: TabDef[] = [
  { name: 'index', title: 'Accueil', glyph: '⌂' },
  { name: 'lecons', title: 'Leçons', glyph: '▤' },
  { name: 'photo', title: 'Photo', glyph: '◎' },
  { name: 'monde', title: 'Monde', glyph: '⚑' },
  { name: 'recompenses', title: 'Récompenses', glyph: '★' },
  { name: 'parent', title: 'Parent', glyph: '☺' },
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
