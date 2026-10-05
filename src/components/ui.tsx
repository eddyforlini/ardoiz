import { Pressable, StyleSheet, Text, View, type PressableProps, type TextProps, type ViewProps } from 'react-native';

import { useUnivers } from '@/univers/UniversProvider';

/** Fond d'écran de l'univers courant */
export function Screen({ style, ...rest }: ViewProps) {
  const { univers } = useUnivers();
  return <View style={[styles.screen, { backgroundColor: univers.colors.bg }, style]} {...rest} />;
}

/** Carte sur fond de l'univers */
export function Card({ style, ...rest }: ViewProps) {
  const { univers } = useUnivers();
  const bordered = univers.id === 'hero';
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: univers.colors.card,
          borderColor: univers.colors.line,
          borderWidth: bordered ? 3 : 1,
          borderRadius: univers.font.radius,
        },
        style,
      ]}
      {...rest}
    />
  );
}

type TitleProps = TextProps & { size?: 'xl' | 'lg' | 'md' };

/** Titre dans la police et la couleur de l'univers */
export function Title({ style, size = 'lg', ...rest }: TitleProps) {
  const { univers } = useUnivers();
  const fontSize = size === 'xl' ? 30 : size === 'lg' ? 22 : 17;
  return (
    <Text
      style={[
        {
          color: univers.colors.ink,
          fontSize,
          lineHeight: fontSize * 1.2,
          fontWeight: univers.font.weight,
          letterSpacing: univers.font.letterSpacing,
          textTransform: univers.id === 'hero' || univers.id === 'gaming' ? 'uppercase' : 'none',
        },
        style,
      ]}
      {...rest}
    />
  );
}

type BodyProps = TextProps & { muted?: boolean; bold?: boolean };

export function Body({ style, muted, bold, ...rest }: BodyProps) {
  const { univers } = useUnivers();
  return (
    <Text
      style={[
        styles.body,
        { color: muted ? univers.colors.soft : univers.colors.ink, fontWeight: bold ? '700' : '500' },
        style,
      ]}
      {...rest}
    />
  );
}

type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: 'primary' | 'sun' | 'ghost';
};

/** Gros bouton à ombre portée, comme dans le prototype */
export function Button({ label, variant = 'primary', style, ...rest }: ButtonProps) {
  const { univers } = useUnivers();
  const c = univers.colors;
  const palette =
    variant === 'sun'
      ? { bg: c.sun, fg: c.onSun, shadow: c.sunDark }
      : variant === 'ghost'
        ? { bg: c.card, fg: c.primary, shadow: c.line }
        : { bg: c.primary, fg: c.onPrimary, shadow: c.primaryDark };
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: palette.bg,
          borderRadius: Math.max(10, univers.font.radius - 4),
          borderBottomWidth: pressed ? 1 : 5,
          borderBottomColor: palette.shadow,
          marginTop: pressed ? 4 : 0,
          borderWidth: univers.id === 'hero' ? 3 : 0,
          borderColor: c.line,
        },
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
      {...rest}>
      <Text
        style={{
          color: palette.fg,
          fontSize: 17,
          fontWeight: univers.font.weight,
          letterSpacing: Math.max(0.3, univers.font.letterSpacing),
        }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Petite pastille (monnaie, série, étiquette) */
export function Chip({ children, style, ...rest }: ViewProps) {
  const { univers } = useUnivers();
  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: univers.colors.card, borderColor: univers.colors.line },
        style,
      ]}
      {...rest}>
      <Text style={{ color: univers.colors.ink, fontWeight: '700', fontSize: 14 }}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  card: { padding: 14, gap: 8 },
  body: { fontSize: 15, lineHeight: 21 },
  button: {
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1.5,
  },
});
