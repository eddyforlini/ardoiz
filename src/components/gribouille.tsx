import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import { useUnivers } from '@/univers/UniversProvider';

type Props = {
  size?: number;
  /** Humeur affichée : change les yeux et la bouche */
  mood?: 'content' | 'fier' | 'curieux' | 'endormi';
};

/**
 * Gribouille, la mascotte : une tache d'encre ronde avec des yeux.
 * Le costume dépend de l'univers courant. Dessin provisoire, à remplacer par
 * une animation Rive ou Lottie quand le style final sera arrêté.
 */
export function Gribouille({ size = 120, mood = 'content' }: Props) {
  const { univers } = useUnivers();
  const c = univers.colors;
  const ado = univers.tone === 'ado';

  const eyeOpen = mood !== 'endormi';
  const eyeHeight = ado ? 5 : 8;
  const mouth =
    mood === 'fier'
      ? 'M40 70 Q60 84 80 70'
      : mood === 'curieux'
        ? 'M52 72 Q60 78 68 72'
        : mood === 'endormi'
          ? 'M48 74 Q60 70 72 74'
          : 'M44 68 Q60 80 76 68';

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" accessibilityLabel="Gribouille">
      {/* Cape de super-héros, derrière le corps */}
      {univers.costume === 'cape' && (
        <Path d="M30 60 L14 112 L60 96 L106 112 L90 60 Z" fill={c.primary} />
      )}

      {/* Corps : une tache d'encre */}
      <Path
        d="M60 14 C86 10 108 30 104 58 C100 86 88 108 60 106 C32 108 18 86 16 58 C14 30 34 18 60 14 Z"
        fill={c.ink}
      />
      <Circle cx="92" cy="36" r="6" fill={c.ink} />
      <Circle cx="24" cy="84" r="5" fill={c.ink} />

      {/* Yeux */}
      {eyeOpen ? (
        <>
          <Ellipse cx="46" cy="52" rx="9" ry={eyeHeight + 2} fill={c.card} />
          <Ellipse cx="74" cy="52" rx="9" ry={eyeHeight + 2} fill={c.card} />
          <Circle cx="48" cy="54" r="4" fill={c.ink} />
          <Circle cx="76" cy="54" r="4" fill={c.ink} />
          {ado && (
            <>
              <Rect x="36" y="42" width="20" height="7" fill={c.ink} />
              <Rect x="64" y="42" width="20" height="7" fill={c.ink} />
            </>
          )}
        </>
      ) : (
        <>
          <Path d="M38 52 Q46 58 54 52" stroke={c.card} strokeWidth="3" fill="none" />
          <Path d="M66 52 Q74 58 82 52" stroke={c.card} strokeWidth="3" fill="none" />
        </>
      )}

      {/* Bouche */}
      <Path d={mouth} stroke={c.card} strokeWidth="3.5" fill="none" strokeLinecap="round" />

      {/* Joues, pour les petits */}
      {!ado && (
        <>
          <Circle cx="34" cy="66" r="5" fill={c.primary} opacity="0.5" />
          <Circle cx="86" cy="66" r="5" fill={c.primary} opacity="0.5" />
        </>
      )}

      {/* Costumes */}
      {univers.costume === 'bandeau' && (
        <>
          <Rect x="22" y="30" width="76" height="9" rx="4" fill={c.primary} />
          <Path d="M98 30 L112 22 L108 40 Z" fill={c.primary} />
        </>
      )}
      {univers.costume === 'casque' && (
        <Ellipse cx="60" cy="56" rx="50" ry="46" fill={c.primaryTint} opacity="0.35" stroke={c.primary} strokeWidth="3" />
      )}
      {univers.costume === 'crete' && (
        <Path d="M36 22 L44 8 L52 20 L60 6 L68 20 L76 8 L84 22 Z" fill={c.primary} />
      )}
      {univers.costume === 'manette' && (
        <>
          <Rect x="38" y="86" width="44" height="18" rx="9" fill={c.primary} />
          <Circle cx="72" cy="93" r="3" fill={c.card} />
          <Circle cx="78" cy="97" r="3" fill={c.card} />
          <Rect x="44" y="92" width="10" height="3" fill={c.card} />
          <Rect x="47.5" y="88.5" width="3" height="10" fill={c.card} />
        </>
      )}
      {univers.costume === 'casquette' && (
        <>
          <Path d="M26 34 Q60 6 94 34 Z" fill={c.primary} />
          <Rect x="60" y="30" width="50" height="7" rx="3" fill={c.primary} />
        </>
      )}
      {univers.costume === 'loupe' && (
        <>
          <Circle cx="94" cy="86" r="12" fill={c.card} opacity="0.6" stroke={c.primary} strokeWidth="4" />
          <Path d="M103 95 L114 108" stroke={c.primary} strokeWidth="5" strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}
