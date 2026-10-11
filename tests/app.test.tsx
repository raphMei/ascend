import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FRIDAY_NIGHT, TUESDAY, renderApp } from './helpers';
import * as push from '@/services/push';

vi.mock('@/services/push', async (orig) => ({ ...(await orig<typeof import('@/services/push')>()), readEnv: vi.fn(() => ({ hasServiceWorker: true, hasPushManager: true, hasNotification: true, permission: 'default', standalone: true, ios: true })), currentSubscription: vi.fn(async () => null), enablePush: vi.fn(), disablePush: vi.fn(), showTestNotification: vi.fn(async () => {}), VAPID_PUBLIC_KEY: 'cle-test' }));
const env = (o: Partial<ReturnType<typeof push.readEnv>> = {}) => ({ hasServiceWorker: true, hasPushManager: true, hasNotification: true, permission: 'default' as const, standalone: true, ios: true, ...o });

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
    const mine = writes.days.filter(([d]) => d === TUESDAY.today);
    expect(mine).toHaveLength(1);
    const [date, patch] = mine[0];
    expect(date).toBe(TUESDAY.today);
    expect(patch).toMatchObject({ done: { tephila: true }, stats: { dn: 20 } });
  });

  it('saisir le poids enregistre à la fin de la saisie (pas à chaque frappe)', async () => {
    const { writes } = renderApp({ hash: '#/today' });
    const input = await screen.findByLabelText('Poids (kg)');
    await userEvent.type(input, '86.5');
    const today = () => writes.days.filter(([d]) => d === TUESDAY.today);
    expect(today()).toHaveLength(0);
    await userEvent.tab();
    expect(today()).toEqual([[TUESDAY.today, { weight: 86.5 }]]);
  });

  it('+ 500 ml ajoute à l\'eau déjà bue', async () => {
    const { writes } = renderApp({ hash: '#/today', seed: { days: { [TUESDAY.today]: { water: 1000 } } } });
    await userEvent.click(await screen.findByRole('button', { name: '+ 500 ml' }));
    expect(writes.days.filter(([d]) => d === TUESDAY.today).map(([, p]) => p)).toEqual([{ water: 1500 }]);
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

describe('écriture refusée', () => {
  it('rétablit la valeur d\'avant et prévient (retour arrière)', async () => {
    const { failWrites } = renderApp({ hash: '#/today' });
    const box = await screen.findByRole('checkbox', { name: 'Téphila' });
    failWrites.on = true;
    await userEvent.click(box);
    expect(await screen.findByRole('alert')).toHaveTextContent('Enregistrement impossible');
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Téphila' })).not.toBeChecked());
  });
});

describe("rattrapage et fenêtre d'historique", () => {
  it('enregistre les stats des jours passés une seule fois, sans toucher aux jours qui en ont', async () => {
    const seeded = { stats: { pct: 50, pl: 100, dn: 50, planned: {}, done: {} } };
    const { writes } = renderApp({ seed: { days: { '2026-11-02': seeded } } });
    await screen.findByRole('heading', { name: 'Salut Raphaël' });
    await waitFor(() => expect(writes.days.length).toBeGreaterThan(0));
    const dates = writes.days.map(([d]) => d);
    expect(dates).toContain('2026-11-01');
    expect(dates).not.toContain('2026-11-02');
    expect(new Set(dates).size).toBe(dates.length);
    writes.days.forEach(([, patch]) => expect(Object.keys(patch)).toEqual(['stats']));
  });

  it('ne charge qu\'une fenêtre d\'historique au démarrage', async () => {
    const { startedFrom } = renderApp();
    await screen.findByRole('heading', { name: 'Salut Raphaël' });
    expect(startedFrom.value).toMatch(/^\d{4}-\d\d-\d\d$/);
    const days = (Date.now() - new Date(startedFrom.value + 'T12:00:00Z').getTime()) / 86400000;
    expect(Math.round(days)).toBeGreaterThanOrEqual(179);
    expect(Math.round(days)).toBeLessThanOrEqual(181);
  });
});

describe('édition libre des blocs', () => {
  const todayWrites = (writes: { days: [string, Record<string, unknown>][] }) => writes.days.filter(([d, p]) => d === TUESDAY.today && 'edits' in p).map(([, p]) => p);

  it('déplacer un créneau enregistre le nouvel horaire', async () => {
    const { writes } = renderApp({ hash: '#/today' });
    await userEvent.click(await screen.findByRole('button', { name: 'Modifier Séance : Pousser' }).catch(() => screen.findByRole('button', { name: /Modifier Séance/ })));
    const dialog = await screen.findByRole('dialog');
    const start = within(dialog).getByLabelText('Début');
    fireEvent.change(start, { target: { value: '19:30' } });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Enregistrer' }));
    expect(todayWrites(writes)).toEqual([{ edits: { move: { sport: { start: 1170, end: 1215 } } } }]);
  });

  it('passer un bloc le retire de la frise et propose de le rétablir', async () => {
    const { writes } = renderApp({ hash: '#/today' });
    await userEvent.click(await screen.findByRole('button', { name: /Modifier Séance/ }));
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: /Passer ce bloc/ }));
    expect(todayWrites(writes)).toEqual([{ edits: { skip: { sport: true } } }]);
    expect(screen.queryByRole('checkbox', { name: /Séance/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Rétablir' }));
    expect(await screen.findByRole('checkbox', { name: /Séance/ })).toBeInTheDocument();
  });

  it('ajouter un bloc à la main', async () => {
    const { writes } = renderApp({ hash: '#/today' });
    await userEvent.click(await screen.findByRole('button', { name: '+ Ajouter un bloc' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText('Titre'), 'Dentiste');
    fireEvent.change(within(dialog).getByLabelText('Début'), { target: { value: '21:00' } });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Ajouter' }));
    const [edit] = todayWrites(writes) as { edits: { extra: Record<string, { title: string; start: number; end: number }> } }[];
    expect(Object.values(edit.edits.extra)[0]).toMatchObject({ title: 'Dentiste', start: 1260, end: 1290 });
    expect(await screen.findByRole('checkbox', { name: 'Dentiste' })).toBeInTheDocument();
  });

  it('refuse un bloc sans titre', async () => {
    renderApp({ hash: '#/today' });
    await userEvent.click(await screen.findByRole('button', { name: '+ Ajouter un bloc' }));
    expect(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Ajouter' })).toBeDisabled();
  });

  it('Échap ferme la fenêtre', async () => {
    renderApp({ hash: '#/today' });
    await userEvent.click(await screen.findByRole('button', { name: '+ Ajouter un bloc' }));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('rappel de saisie', () => {
  it('invite à saisir poids et nuit après le réveil, puis disparaît quand c\'est fait', async () => {
    renderApp({ hash: '#/today' });
    expect(await screen.findByRole('status')).toHaveTextContent('ton poids et ta nuit');
  });
  it('absent si tout est saisi', async () => {
    renderApp({ hash: '#/today', seed: { days: { [TUESDAY.today]: { weight: 80, sleep: { bed: '22:30', wake: '06:00' } } } } });
    await screen.findByRole('checkbox', { name: 'Téphila' });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

describe('poids : objectif et historique', () => {
  it('l\'objectif de poids est enregistré depuis les réglages', async () => {
    const { writes } = renderApp({ hash: '#/settings' });
    const input = await screen.findByLabelText('Poids visé (kg)');
    fireEvent.change(input, { target: { value: '82' } });
    fireEvent.blur(input);
    expect(writes.settings).toEqual([{ weightGoal: 82 }]);
  });
  it('« 1 an » charge l\'historique plus ancien à la demande', async () => {
    const { history } = renderApp({ hash: '#/dom/alim' });
    await userEvent.click(await screen.findByRole('button', { name: '1 an' }));
    expect(history).toHaveLength(1);
    expect(history[0]).toBe('2025-11-03');   // 365 jours avant l'horloge figée (3 nov. 2026)
  });
  it('« 30 jours » ne charge rien de plus', async () => {
    const { history } = renderApp({ hash: '#/dom/alim' });
    await screen.findByRole('button', { name: '30 jours' });
    expect(history).toHaveLength(0);
  });
});

describe('nouveaux domaines', () => {
  it('onze domaines dans « Mes domaines »', async () => {
    renderApp({ hash: '#/domains' });
    for (const name of ['Dev front', 'Anglais', 'Lecture', 'Finances', 'Projets perso']) expect(await screen.findByRole('heading', { level: 3, name })).toBeInTheDocument();
  });

  it('un domaine sans créneau propose de l\'activer dans les réglages', async () => {
    renderApp({ hash: '#/dom/anglais' });
    expect(await screen.findByRole('note')).toHaveTextContent('Active-le dans Réglages › Mes domaines');
  });

  it('activer l\'anglais ajoute un bloc cochable à la journée', async () => {
    renderApp({ hash: '#/today/2026-10-14', seed: { settings: { anglaisMin: 20 } } });
    expect(await screen.findByRole('checkbox', { name: 'Anglais' })).toBeInTheDocument();
  });

  it('réglage : les minutes d\'un domaine sont enregistrées', async () => {
    const { writes } = renderApp({ hash: '#/settings' });
    const input = await screen.findByLabelText('Lecture (min)');
    fireEvent.change(input, { target: { value: '25' } });
    fireEvent.blur(input);
    expect(writes.settings).toEqual([{ lectureMin: 25 }]);
  });

  it('lecture : les pages lues sont enregistrées dans le jour', async () => {
    const { writes } = renderApp({ hash: '#/dom/lecture' });
    const input = await screen.findByLabelText("Pages lues aujourd'hui");
    fireEvent.change(input, { target: { value: '18' } });
    fireEvent.blur(input);
    expect(writes.days.filter(([d]) => d === TUESDAY.today).map(([, p]) => p)).toEqual([{ pages: 18 }]);
  });

  it('anglais : le score TOEIC est enregistré avec la date', async () => {
    const { writes } = renderApp({ hash: '#/dom/anglais' });
    const input = await screen.findByLabelText("Score du test d'aujourd'hui");
    fireEvent.change(input, { target: { value: '720' } });
    fireEvent.blur(input);
    expect(writes.progress).toEqual([{ toeic: { [TUESDAY.today]: 720 } }]);
  });

  it('finances : cocher une étape du mois et saisir l\'épargne', async () => {
    const { writes } = renderApp({ hash: '#/dom/finances' });
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Budget du mois revu' }));
    expect(writes.progress[0]).toEqual({ done: { 'fin:2026-11:budget': true } });
    const input = screen.getByLabelText('Épargné ce mois (€)');
    fireEvent.change(input, { target: { value: '300' } });
    fireEvent.blur(input);
    expect(writes.progress.at(-1)).toEqual({ finance: { '2026-11': { savings: 300 } } });
  });

  it('projets : ajouter, changer le statut, ajouter du temps, supprimer', async () => {
    const { writes } = renderApp({ hash: '#/dom/projets' });
    await userEvent.type(await screen.findByLabelText('Nom'), 'Site client');
    await userEvent.type(screen.getByLabelText('Première action concrète'), 'Maquette');
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter le projet' }));
    const created = Object.values((writes.progress[0] as { projects: Record<string, unknown> }).projects)[0];
    expect(created).toMatchObject({ name: 'Site client', next: 'Maquette', status: 'actif', minutes: 0 });
    await userEvent.click(await screen.findByRole('button', { name: '+ 30 min' }));
    expect(Object.values((writes.progress[1] as { projects: Record<string, unknown> }).projects)[0]).toEqual({ minutes: 30 });
    await userEvent.selectOptions(screen.getByLabelText('Statut'), 'pause');
    expect(Object.values((writes.progress[2] as { projects: Record<string, unknown> }).projects)[0]).toEqual({ status: 'pause' });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await userEvent.click(screen.getByRole('button', { name: 'Supprimer' }));
    expect(Object.values((writes.progress[3] as { projects: Record<string, unknown> }).projects)[0]).toBeNull();
    await waitFor(() => expect(screen.queryByText('Site client')).not.toBeInTheDocument());
  });

  it('dev front : une phase se parcourt et se coche', async () => {
    const { writes } = renderApp({ hash: '#/dom/front/f1' });
    await userEvent.click((await screen.findAllByRole('checkbox'))[0]);
    expect(writes.progress[0]).toEqual({ done: { f1t1: true } });
  });
});

describe('rappels (notifications)', () => {
  beforeEach(() => { vi.mocked(push.readEnv).mockReturnValue(env()); vi.mocked(push.currentSubscription).mockResolvedValue(null); });

  it('iPhone hors écran d\'accueil : explique comment installer l\'application', async () => {
    vi.mocked(push.readEnv).mockReturnValue(env({ standalone: false }));
    renderApp({ hash: '#/settings' });
    expect(await screen.findByText(/Sur iPhone, les notifications ne marchent que pour une application ajoutée/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Activer les rappels' })).not.toBeInTheDocument();
  });

  it('activer : demande l\'autorisation puis enregistre l\'abonnement dans Firestore', async () => {
    vi.mocked(push.enablePush).mockResolvedValue({ id: 'abc123', sub: { endpoint: 'https://push/x', keys: { p256dh: 'p', auth: 'a' }, created: 'now', ua: 'test' } });
    const { writes } = renderApp({ hash: '#/settings' });
    await userEvent.click(await screen.findByRole('button', { name: 'Activer les rappels' }));
    await waitFor(() => expect(writes.push).toEqual([{ subscriptions: { abc123: expect.objectContaining({ endpoint: 'https://push/x' }) } }]));
    expect(await screen.findByText('Rappels activés sur cet appareil.')).toBeInTheDocument();
  });

  it('autorisation refusée : message clair, rien d\'enregistré', async () => {
    vi.mocked(push.enablePush).mockRejectedValue(new Error('permission-denied'));
    const { writes } = renderApp({ hash: '#/settings' });
    await userEvent.click(await screen.findByRole('button', { name: 'Activer les rappels' }));
    expect(await screen.findByText(/Autorisation refusée/)).toBeInTheDocument();
    expect(writes.push).toEqual([]);
  });

  it('actifs : choix des rappels par type, désactivation retire l\'abonnement', async () => {
    vi.mocked(push.readEnv).mockReturnValue(env({ permission: 'granted' }));
    vi.mocked(push.currentSubscription).mockResolvedValue({ endpoint: 'e' } as PushSubscription);
    vi.mocked(push.disablePush).mockResolvedValue('abc123');
    const { writes } = renderApp({ hash: '#/settings' });
    const sport = await screen.findByRole('checkbox', { name: 'Séance de sport' });
    expect(sport).toBeChecked();
    await userEvent.click(sport);
    expect(writes.settings).toEqual([{ reminders: { sport: false } }]);
    await userEvent.click(screen.getByRole('button', { name: 'Désactiver sur cet appareil' }));
    await waitFor(() => expect(writes.push).toEqual([{ subscriptions: { abc123: null } }]));
  });
});

describe('ajustement automatique', () => {
  // Mardi 3 nov. 2026, 10 h : plusieurs tâches des jours précédents n'ont pas été faites.
  const clickTodayCard = async () => screen.findByRole('region', { name: 'Ajustements automatiques du planning' });

  it('affiche ce qui a été déplacé, avec la raison', async () => {
    renderApp({ hash: '#/today' });
    const card = await clickTodayCard();
    expect(card).toHaveTextContent(/tâche[s]? déplacée/);
    expect(within(card).getAllByText(/En retard depuis/).length).toBeGreaterThan(0);
  });

  it('« Laisser tomber » enregistre le choix et fait disparaître la tâche des retards', async () => {
    const { writes } = renderApp({ hash: '#/today' });
    const card = await clickTodayCard();
    await userEvent.click(within(card).getAllByRole('button', { name: 'Laisser tomber' })[0]);
    expect(writes.progress).toHaveLength(1);
    expect(Object.values((writes.progress[0] as { pins: Record<string, string> }).pins)).toEqual(['skip']);
  });

  it('« Faire aujourd\'hui » impose la date du jour', async () => {
    const { writes } = renderApp({ hash: '#/today' });
    const card = await clickTodayCard();
    await userEvent.click(within(card).getAllByRole('button', { name: "Faire aujourd'hui" })[0]);
    expect(Object.values((writes.progress[0] as { pins: Record<string, string> }).pins)).toEqual([TUESDAY.today]);
  });

  it('une date imposée peut être annulée', async () => {
    const seed = { progress: { done: {}, pins: { 'dl:f0': '2026-11-10' } } };
    const { writes } = renderApp({ hash: '#/today', seed });
    const card = await clickTodayCard();
    await userEvent.click(within(card).getByRole('button', { name: 'Annuler' }));
    expect(writes.progress[0]).toEqual({ pins: { 'dl:f0': null } });
  });

  it('désactiver l\'ajustement le retire, et les réglages le rétablissent', async () => {
    const { writes } = renderApp({ hash: '#/today' });
    await userEvent.click(within(await clickTodayCard()).getByRole('button', { name: "Désactiver l'ajustement automatique" }));
    expect(writes.settings).toEqual([{ autoReschedule: false }]);
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Ajustements automatiques du planning' })).not.toBeInTheDocument());
  });

  it('la page d\'accueil signale l\'ajustement', async () => {
    renderApp();
    expect(await screen.findByText(/Planning ajusté automatiquement/)).toBeInTheDocument();
  });

  it('sans retard au départ de la saison : rien à signaler', async () => {
    renderApp({ hash: '#/today', clock: { today: '2026-10-08', now: 360 } });
    await screen.findByRole('heading', { level: 1 });
    expect(screen.queryByText(/En retard depuis/)).not.toBeInTheDocument();
  });
});

describe('Mon mois', () => {
  it('liste les domaines et enregistre l\'intensité choisie pour le mois', async () => {
    const { writes } = renderApp({ hash: '#/month' });
    expect(await screen.findByRole('heading', { level: 1, name: 'Novembre 2026' })).toBeInTheDocument();
    for (const n of ['Cours MIAGE', 'Sport', 'Java backend', 'Dev front', 'Anglais', 'Lecture', 'Projets perso', 'Finances']) expect(screen.getByRole('radiogroup', { name: `Intensité : ${n}` })).toBeInTheDocument();
    await userEvent.click(within(screen.getByRole('radiogroup', { name: 'Intensité : Anglais' })).getByRole('radio', { name: 'Intensif' }));
    expect(writes.settings).toEqual([{ months: { '2026-11': { anglais: 'intensif' } } }]);
    expect(within(screen.getByRole('radiogroup', { name: 'Intensité : Anglais' })).getByRole('radio', { name: 'Intensif' })).toBeChecked();
  });

  it('le choix du mois change le planning des jours de ce mois', async () => {
    renderApp({ hash: '#/today/2026-11-11', seed: { settings: { months: { '2026-11': { anglais: 'normal' } } } } });
    expect(await screen.findByRole('checkbox', { name: 'Anglais' })).toBeInTheDocument();
  });

  it('on peut régler le mois suivant, sans toucher à celui-ci', async () => {
    const { writes } = renderApp({ hash: '#/month' });
    await userEvent.click(await screen.findByRole('button', { name: 'Mois suivant' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Décembre 2026' })).toBeInTheDocument();
    await userEvent.click(within(screen.getByRole('radiogroup', { name: 'Intensité : Lecture' })).getByRole('radio', { name: 'Léger' }));
    expect(writes.settings).toEqual([{ months: { '2026-12': { lecture: 'leger' } } }]);
  });

  it('prévient quand les domaines réservent presque tout le temps libre', async () => {
    renderApp({ hash: '#/month', seed: { settings: { months: { '2026-11': { anglais: 'intensif', lecture: 'intensif', front: 'intensif', projets: 'intensif', java: 'intensif' } } } } });
    expect(await screen.findByRole('alert')).toHaveTextContent('Allège un domaine');
  });

  it('accessible depuis « Mes domaines »', async () => {
    renderApp({ hash: '#/domains' });
    await userEvent.click(await screen.findByRole('link', { name: /Mon mois/ }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Novembre 2026' })).toBeInTheDocument();
  });
});
