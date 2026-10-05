import { PlaceholderScreen } from '@/components/placeholder-screen';
import { useUnivers } from '@/univers/UniversProvider';

export default function MondeScreen() {
  const { univers } = useUnivers();
  return (
    <PlaceholderScreen
      title={univers.words.monde}
      intro="Un lieu à soi qui grandit avec les missions. Certains bâtiments ne s'ouvrent qu'en apprenant."
      bullets={[
        'Six parcelles à bâtir avec les ' + univers.currency,
        'Gribouille évolue de Bébé à Légende',
        'Le Codex : chaque notion apprise devient une créature à collectionner',
        'Événements de saison et mode vacances',
      ]}
      step="5"
    />
  );
}
