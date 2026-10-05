import { useState, type ReactNode } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Body, Button, Card, Screen, Title } from '@/components/ui';
import { useUnivers } from '@/univers/UniversProvider';

/** Une fois le calcul réussi, l'espace parent reste ouvert dix minutes */
const UNLOCK_MINUTES = 10;
let unlockedUntil = 0;

function makeQuestion() {
  const a = 3 + Math.floor(Math.random() * 7);
  const b = 3 + Math.floor(Math.random() * 7);
  return { text: `${a} × ${b}`, answer: a * b };
}

/**
 * Petit verrou devant les écrans réservés aux parents : une multiplication,
 * comme chez Lingokids ou Khan Kids. Ce n'est pas une sécurité, c'est une
 * porte que l'enfant ne pousse pas par hasard.
 */
export function ParentGate({ children }: { children: ReactNode }) {
  const { univers } = useUnivers();
  const c = univers.colors;
  const [open, setOpen] = useState(() => Date.now() < unlockedUntil);
  const [question, setQuestion] = useState(makeQuestion);
  const [value, setValue] = useState('');
  const [wrong, setWrong] = useState(false);

  if (open) return <>{children}</>;

  function check() {
    if (Number(value.trim()) === question.answer) {
      unlockedUntil = Date.now() + UNLOCK_MINUTES * 60 * 1000;
      setOpen(true);
    } else {
      setWrong(true);
      setValue('');
      setQuestion(makeQuestion());
    }
  }

  return (
    <Screen>
      <View style={styles.center}>
        <Card style={styles.card}>
          <Title size="md">Espace réservé aux parents</Title>
          <Body muted>Pour entrer, combien font {question.text} ?</Body>
          <TextInput
            value={value}
            onChangeText={(t) => {
              setValue(t);
              setWrong(false);
            }}
            onSubmitEditing={check}
            keyboardType="number-pad"
            autoFocus
            accessibilityLabel="Réponse"
            style={[styles.input, { color: c.ink, borderColor: wrong ? c.ko : c.line, backgroundColor: c.bg, borderRadius: univers.font.radius }]}
          />
          {wrong && <Body style={{ color: c.ko }}>Ce n'est pas ça. Essaie avec le nouveau calcul.</Body>}
          <Button label="Entrer" onPress={check} disabled={!value.trim()} />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', padding: 16 },
  card: { gap: 10 },
  input: { borderWidth: 2, paddingHorizontal: 14, paddingVertical: 10, fontSize: 22, fontWeight: '700', textAlign: 'center' },
});
