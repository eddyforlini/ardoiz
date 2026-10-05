import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function ParentScreen() {
  return (
    <PlaceholderScreen
      title="Espace parent"
      intro="Pour les parents : les photos, les progrès par compétence, le temps d'écran et les réglages."
      bullets={[
        'Suivi par compétence : acquis, en cours, à retravailler',
        'Mes pièges : les erreurs qui reviennent',
        'Rapport de la semaine et une idée d\'activité sans écran',
        'Réglages : temps d\'écran, mode dys, voix du parent pour la dictée',
        'Comptes : créés par le parent, plusieurs enfants',
      ]}
      step="6"
    />
  );
}
