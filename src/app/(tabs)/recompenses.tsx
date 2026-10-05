import { PlaceholderScreen } from '@/components/placeholder-screen';
import { useUnivers } from '@/univers/UniversProvider';

export default function RecompensesScreen() {
  const { univers } = useUnivers();
  return (
    <PlaceholderScreen
      title="Récompenses"
      intro="Des récompenses saines : costumes, autocollants, univers à débloquer. Jamais d'achat pour l'enfant."
      bullets={[
        univers.words.coffre + ' à ouvrir après chaque mission',
        'Autocollants et costumes de Gribouille',
        'Série de jours avec joker, paliers fêtés à 7, 30 et 100 jours',
        'Mur des victoires : la note du vrai contrôle, fêtée dans l\'appli',
      ]}
      step="5"
    />
  );
}
