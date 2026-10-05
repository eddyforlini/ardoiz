import type { Exercise } from '@/content/types';
import { BlanksGame } from './blanks';
import { ChoiceGame } from './choice';
import { FlashGame } from './flash';
import { NumberlineGame } from './numberline';
import { OrderGame } from './order';
import { ScrambleGame } from './scramble';
import { SpeedGame } from './speed';
import type { GameProps } from './shared';

/** Choisit le jeu qui correspond à l'exercice. Un seul endroit à compléter pour chaque nouveau jeu. */
export function Game(props: GameProps<Exercise>) {
  const { exercise } = props;
  switch (exercise.kind) {
    case 'choice':
      return <ChoiceGame {...props} exercise={exercise} />;
    case 'numberline':
      return <NumberlineGame {...props} exercise={exercise} />;
    case 'scramble':
      return <ScrambleGame {...props} exercise={exercise} />;
    case 'flash':
      return <FlashGame {...props} exercise={exercise} />;
    case 'order':
      return <OrderGame {...props} exercise={exercise} />;
    case 'blanks':
      return <BlanksGame {...props} exercise={exercise} />;
    case 'speed':
      return <SpeedGame {...props} exercise={exercise} />;
  }
}

/** Nom du jeu, pour l'écran de fin et les quêtes */
export const GAME_LABEL: Record<Exercise['kind'], string> = {
  choice: 'Bonne réponse',
  numberline: 'Droite graduée',
  scramble: 'Lettres en vrac',
  flash: 'Mémo-flash',
  order: 'Vers dans l\'ordre',
  blanks: 'Mots manquants',
  speed: 'Calcul éclair',
};
