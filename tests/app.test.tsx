import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FRIDAY_NIGHT, TUESDAY, renderApp } from './helpers';

describe('connexion', () => {
  it('affiche l\'écran de connexion quand personne n\'est connecté, puis lance Google', async () => {
    const { signIn } = renderApp({ seed: { user: null } });
    await userEvent.click(await screen.findByRole('button', { name: 'Continuer avec Google' }));
    expect(signIn).toHaveBeenCalledOnce();
  });
});

describe('accueil', () => {
  it('affiche coach, anneau du jour et navigation', async () => {
    renderApp();
    expect(await screen.findByRole('heading', { level: 1, name: 'Salut Raphaël' })).toBeInTheDocument();
    expect(screen.getByLabelText('Message du coach')).toBeInTheDocument();
    ['Accueil', "Aujourd'hui", 'Domaines', 'Réglages'].forEach((n) => expect(screen.getByRole('button', { name: n })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Accueil' })).toHaveAttribute('aria-current', 'page');
  });

  it('navigue vers les autres écrans', async () => {
    renderApp();
    await userEvent.click(await screen.findByRole('button', { name: 'Domaines' }));
    expect(await screen.findByRole('heading', { name: 'Où je progresse' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Réglages' }));
    expect(await screen.findByRole('heading', { name: 'Mon Ascend' })).toBeInTheDocument();
  });
});

describe('aujourd\'hui', () => {
  it('cocher un bloc l\'enregistre avec l\'instantané de stats du jour', async () => {
    const { writes } = renderApp({ hash: '#/today' });
    const box = await screen.findByRole('checkbox', { name: 'Téphila' });
    expect(box).not.toBeChecked();
    await userEvent.click(box);
    expect(box).toBeChecked();
    expect(writes.days).toHaveLength(1);
    const [date, patch] = writes.days[0];
    expect(date).toBe(TUESDAY.today);
    expect(patch).toMatchObject({ done: { tephila: true }, stats: { dn: 20 } });
  });

  it('saisir le poids enregistre à la fin de la saisie (pas à chaque frappe)', async () => {
    const { writes } = renderApp({ hash: '#/today' });
    const input = await screen.findByLabelText('Poids (kg)');
    await userEvent.type(input, '86.5');
    expect(writes.days).toHaveLength(0);
    await userEvent.tab();
    expect(writes.days).toEqual([[TUESDAY.today, { weight: 86.5 }]]);
  });

  it('+ 500 ml ajoute à l\'eau déjà bue', async () => {
    const { writes } = renderApp({ hash: '#/today', seed: { days: { [TUESDAY.today]: { water: 1000 } } } });
    await userEvent.click(await screen.findByRole('button', { name: '+ 500 ml' }));
    expect(writes.days[0][1]).toEqual({ water: 1500 });
  });

  it('navigue au jour précédent', async () => {
    renderApp({ hash: '#/today' });
    await userEvent.click(await screen.findByRole('link', { name: 'Jour précédent' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'lundi 2 novembre' })).toBeInTheDocument();
  });
});

describe('domaines', () => {
  it('toutes les cartes sont présentes et mènent à leur page', async () => {
    renderApp({ hash: '#/domains' });
    for (const name of ['Routine du matin', 'Sport', 'Alimentation', 'Sommeil', 'Cours MIAGE', 'Java backend']) {
      expect(await screen.findByRole('heading', { level: 3, name })).toBeInTheDocument();
    }
  });

  it.each(['matin', 'sport', 'alim', 'sommeil', 'miage', 'java'])('la page « %s » s\'affiche', async (id) => {
    renderApp({ hash: `#/dom/${id}` });
    expect(await screen.findByText('Domaine')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Domaines' })).toBeInTheDocument();
  });

  it('cocher une tâche MIAGE met à jour la progression', async () => {
    const { writes } = renderApp({ hash: '#/dom/miage/dl' });
    const boxes = await screen.findAllByRole('checkbox');
    await userEvent.click(boxes[0]);
    expect(writes.progress).toHaveLength(1);
    expect(Object.values((writes.progress[0] as { done: Record<string, boolean> }).done)).toEqual([true]);
  });

  it('une phase Java affiche ses étapes', async () => {
    renderApp({ hash: '#/dom/java/p1' });
    expect(await screen.findByRole('heading', { level: 1, name: 'Java : remise à niveau' })).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(3);
  });

  it('un domaine inconnu renvoie vers la liste', async () => {
    renderApp({ hash: '#/dom/inconnu' });
    expect(await screen.findByRole('heading', { name: 'Où je progresse' })).toBeInTheDocument();
  });
});

describe('réglages', () => {
  it('le jeudi reste obligatoirement sur site ; cocher un jour enregistre', async () => {
    const { writes } = renderApp({ hash: '#/settings' });
    const thu = await screen.findByRole('checkbox', { name: /Jeudi/ });
    expect(thu).toBeDisabled(); expect(thu).toBeChecked();
    await userEvent.click(screen.getByRole('checkbox', { name: /Lundi/ }));
    expect(writes.settings).toEqual([{ onsite: [1, 2, 4] }]);
  });

  it('changer le thème enregistre et applique l\'attribut sur <html>', async () => {
    const { writes } = renderApp({ hash: '#/settings' });
    await userEvent.click(await screen.findByRole('button', { name: 'Sombre' }));
    expect(writes.settings).toEqual([{ theme: 'dark' }]);
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark'));
  });

  it('un objectif numérique est enregistré en nombre', async () => {
    const { writes } = renderApp({ hash: '#/settings' });
    const kcal = await screen.findByLabelText('Calories');
    fireEvent.change(kcal, { target: { value: '2800' } });
    fireEvent.blur(kcal);
    expect(writes.settings).toEqual([{ kcalGoal: 2800 }]);
  });
});

describe('réglages : champ vidé', () => {
  it('ne remplace pas un objectif par 0', async () => {
    const { writes } = renderApp({ hash: '#/settings' });
    const kcal = await screen.findByLabelText('Calories');
    fireEvent.change(kcal, { target: { value: '' } });
    fireEvent.blur(kcal);
    expect(writes.settings).toEqual([]);
  });
});

describe('Chabbat', () => {
  it('vendredi soir : écran de repos, sans tâche, avec l\'heure de sortie', async () => {
    renderApp({ clock: FRIDAY_NIGHT });
    expect(await screen.findByRole('heading', { name: 'Chabbat shalom' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.getByText(/Sortie vers/)).toBeInTheDocument();
  });

  it('« Afficher quand même » ouvre l\'application', async () => {
    renderApp({ clock: FRIDAY_NIGHT });
    await userEvent.click(await screen.findByRole('button', { name: 'Afficher quand même' }));
    expect(await screen.findByRole('heading', { name: 'Salut Raphaël' })).toBeInTheDocument();
  });

  it('en semaine l\'écran de repos n\'apparaît pas', async () => {
    renderApp();
    await screen.findByRole('heading', { name: 'Salut Raphaël' });
    expect(screen.queryByRole('heading', { name: 'Chabbat shalom' })).not.toBeInTheDocument();
  });
});

describe('synchronisation', () => {
  it('indique « Synchronisé » en fonctionnement normal', async () => {
    renderApp();
    expect(await screen.findByText('● Synchronisé')).toBeInTheDocument();
  });

  it('affiche l\'erreur quand le backend en signale une (règles Firestore, réseau…)', async () => {
    const { ref } = renderApp();
    await screen.findByRole('heading', { name: 'Salut Raphaël' });
    act(() => ref.listener!.onError('permission-denied'));
    expect(await screen.findByText('Synchronisation interrompue (permission-denied)')).toBeInTheDocument();
  });
});
