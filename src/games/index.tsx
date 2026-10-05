import type { Exercise } from '@/content/types';
import { BlanksGame } from './blanks';
import { ChoiceGame } from './choice';
import { CountGame } from './count';
import { DictationGame } from './dictation';
import { FixGame } from './fix';
import { FlashGame } from './flash';
import { FlashcardGame } from './flashcard';
import { MatchGame } from './match';
import { NumberlineGame } from './numberline';
import { OrderGame } from './order';
import { PairsGame } from './pairs';
import { QuantityGame } from './quantity';
import { ScrambleGame } from './scramble';
import { SentenceGame } from './sentence';
import { SortGame } from './sort';
import { SpeedGame } from './speed';
import { TapWordGame } from './tapword';
import { TrueFalseGame } from './truefalse';
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
    case 'truefalse':
      return <TrueFalseGame {...props} exercise={exercise} />;
    case 'sort':
      return <SortGame {...props} exercise={exercise} />;
    case 'tapword':
      return <TapWordGame {...props} exercise={exercise} />;
    case 'sentence':
      return <SentenceGame {...props} exercise={exercise} />;
    case 'dictation':
      return <DictationGame {...props} exercise={exercise} />;
    case 'count':
      return <CountGame {...props} exercise={exercise} />;
    case 'pairs':
      return <PairsGame {...props} exercise={exercise} />;
    case 'fix':
      return <FixGame {...props} exercise={exercise} />;
    case 'flashcard':
      return <FlashcardGame {...props} exercise={exercise} />;
    case 'match':
      return <MatchGame {...props} exercise={exercise} />;
    case 'quantity':
      return <QuantityGame {...props} exercise={exercise} />;
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
  truefalse: 'Vrai ou faux',
  sort: 'Tri des mots',
  tapword: 'Touche le mot',
  sentence: 'Phrase en vrac',
  dictation: 'Dictée',
  count: 'Compte les objets',
  pairs: 'Memory',
  fix: 'Corrige Gribouille',
  flashcard: 'Carte mémoire',
  match: 'Paires chrono',
  quantity: 'Dizaines et unités',
};
