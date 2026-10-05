import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function PhotoScreen() {
  return (
    <PlaceholderScreen
      title="Photo de la leçon"
      intro="Le parent photographie la leçon, la fiche ou le cahier de textes. Ardoiz lit la page et fabrique la mission."
      bullets={[
        'Prendre une ou plusieurs photos, ou choisir dans la galerie',
        'Lecture de la page par Claude, écriture manuscrite comprise',
        'Résumé à valider : matière, niveau, notion, type de page, date du contrôle',
        'La mission apparaît sur le parcours, habillée dans l\'univers choisi',
        'Les photos sont supprimées après analyse',
      ]}
      step="3"
    />
  );
}
