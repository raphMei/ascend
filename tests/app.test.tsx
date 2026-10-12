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
    ['Bilan', "Aujourd'hui", 'Domaines', 'Réglages'].forEach((n) => expect(screen.getByRole('button', { name: n })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Bilan' })).toHaveAttribute('aria-current', 'page');
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
    const box = await screen.findByRole('checkbox', { name: 'Java backend' });
    expect(box).not.toBeChecked();
    await userEvent.click(box);
    expect(box).toBeChecked();
    const mine = writes.days.filter(([d]) => d === TUESDAY.today);
    expect(mine).toHaveLength(1);
    const [date, patch] = mine[0];
    expect(date).toBe(TUESDAY.today);
    expect(patch).toMatchObject({ done: { java: true }, stats: { dn: expect.any(Number) } });
  });

  it('les mesures (poids, eau) ne sont plus sur « Aujourd\'hui » : elles vivent dans le domaine Alimentation', async () => {
    renderApp({ hash: '#/today' });
    await screen.findByRole('checkbox', { name: 'Java backend' });
    expect(screen.queryByLabelText('Poids (kg)')).not.toBeInTheDocument();
    expect(screen.queryByText('Mes mesures du jour')).not.toBeInTheDocument();
  });

  it('saisir le poids enregistre à la fin de la saisie (pas à chaque frappe)', async () => {
    const { writes } = renderApp({ hash: '#/dom/alim' });
    const input = await screen.findByLabelText('Poids (kg)');
    await userEvent.type(input, '86.5');
    const today = () => writes.days.filter(([d]) => d === TUESDAY.today);
    expect(today()).toHaveLength(0);
    await userEvent.tab();
    expect(today()).toEqual([[TUESDAY.today, { weight: 86.5 }]]);
  });

  it('+ 500 ml ajoute à l\'eau déjà bue', async () => {
    const { writes } = renderApp({ hash: '#/dom/alim', seed: { days: { [TUESDAY.today]: { water: 1000 } } } });
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
    expect(Object.values((writes.progress[0] as { doneAt: Record<string, string> }).doneAt)).toEqual([TUESDAY.today]);
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
    const box = await screen.findByRole('checkbox', { name: 'Java backend' });
    failWrites.on = true;
    await userEvent.click(box);
    expect(await screen.findByRole('alert')).toHaveTextContent('Enregistrement impossible');
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Java backend' })).not.toBeChecked());
  });
});

describe("rattrapage et fenêtre d'historique", () => {
  it('enregistre les stats des jours passés en UNE écriture groupée, sans toucher aux jours qui en ont', async () => {
    const seeded = { stats: { pct: 50, pl: 100, dn: 50, planned: {}, done: {} } };
    const { writes } = renderApp({ hash: '#/today', seed: { days: { '2026-11-02': seeded } } });
    await screen.findByRole('navigation', { name: 'Semaine' });
    await waitFor(() => expect(writes.batches).toHaveLength(1));
    const dates = writes.batches[0].map((e) => e.date);
    expect(dates).toContain('2026-11-01');
    expect(dates).not.toContain('2026-11-02');
    expect(new Set(dates).size).toBe(dates.length);
    writes.batches[0].forEach((e) => expect(Object.keys(e.patch)).toEqual(['stats']));
    expect(writes.days.filter(([, p]) => 'stats' in p && Object.keys(p).length === 1 && !('done' in p))).toEqual([]);   // aucune écriture individuelle de stats seules
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
    await userEvent.click(await screen.findByRole('button', { name: /Java backend/, expanded: false }));
    await userEvent.click(await screen.findByRole('button', { name: /Modifier Java backend/ }));
    const dialog = await screen.findByRole('dialog');
    const start = within(dialog).getByLabelText('Début');
    fireEvent.change(start, { target: { value: '19:30' } });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Enregistrer' }));
    expect(todayWrites(writes)).toEqual([{ edits: { move: { java: { start: 1170, end: 1215 } } } }]);
  });

  it('passer un bloc le retire de la frise et propose de le rétablir', async () => {
    const { writes } = renderApp({ hash: '#/today' });
    await userEvent.click(await screen.findByRole('button', { name: /Java backend/, expanded: false }));
    await userEvent.click(await screen.findByRole('button', { name: /Modifier Java backend/ }));
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: /Passer ce bloc/ }));
    expect(todayWrites(writes)).toEqual([{ edits: { skip: { java: true } } }]);
    expect(screen.queryByRole('checkbox', { name: /Java backend/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Rétablir' }));
    expect(await screen.findByRole('checkbox', { name: /Java backend/ })).toBeInTheDocument();
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
    for (const name of ['Dev front', 'Cloud et DevOps', 'Architecture logicielle', 'Anglais', 'Lecture', 'Finances', 'Projets perso']) expect(await screen.findByRole('heading', { level: 3, name })).toBeInTheDocument();
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
    expect(writes.progress[0]).toEqual({ done: { 'fin:2026-11:budget': true }, doneAt: { 'fin:2026-11:budget': TUESDAY.today } });
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

  it.each([['cloud', 'c1'], ['archi', 'a1']])('%s : une phase se parcourt et se coche', async (id, phase) => {
    const { writes } = renderApp({ hash: `#/dom/${id}/${phase}` });
    expect(await screen.findByText(/Phase 1 sur 8/)).toBeInTheDocument();
    await userEvent.click((await screen.findAllByRole('checkbox'))[0]);
    expect(writes.progress[0]).toEqual({ done: { [`${phase}t1`]: true }, doneAt: { [`${phase}t1`]: TUESDAY.today } });
  });

  it('dev front : une phase se parcourt et se coche', async () => {
    const { writes } = renderApp({ hash: '#/dom/front/f1' });
    await userEvent.click((await screen.findAllByRole('checkbox'))[0]);
    expect(writes.progress[0]).toEqual({ done: { f1t1: true }, doneAt: { f1t1: TUESDAY.today } });
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
    const seance = await screen.findByRole('checkbox', { name: "Séance d'apprentissage" });
    expect(seance).toBeChecked();
    await userEvent.click(seance);
    expect(writes.settings).toEqual([{ reminders: { seance: false } }]);
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
    expect(card).toHaveTextContent(/Planning ajusté automatiquement · \d+ tâches? déplacée/);
    expect(card).toHaveTextContent('tu n\'as rien à valider');
    expect(within(card).getByText(/Planning ajusté automatiquement/).closest('details')).not.toHaveAttribute('open');
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
    const seed = { progress: { done: {}, pins: { 'dl:u1': '2026-11-10' } } };
    const { writes } = renderApp({ hash: '#/today', seed });
    const card = await clickTodayCard();
    await userEvent.click(within(card).getByRole('button', { name: 'Annuler ma date' }));
    expect(writes.progress[0]).toEqual({ pins: { 'dl:u1': null } });
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
    for (const n of ['Cours MIAGE', 'Sport', 'Java backend', 'Dev front', 'Cloud et DevOps', 'Architecture logicielle', 'Anglais', 'Lecture', 'Projets perso', 'Finances']) expect(screen.getByRole('radiogroup', { name: `Intensité : ${n}` })).toBeInTheDocument();
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

describe('liste d\'habitudes (mode Grit)', () => {
  it('l\'application s\'ouvre sur « Aujourd\'hui », en liste groupée par moments', async () => {
    window.location.hash = '';
    renderApp({ hash: '' });
    expect(await screen.findByRole('navigation', { name: 'Semaine' })).toBeInTheDocument();
    // La liste ne montre que l'apprentissage : la routine, le travail, les trajets et le sommeil sont du temps réservé, replié dessous.
    expect(screen.getByRole('region', { name: 'Soirée' })).toBeInTheDocument();
    for (const g of ['Matin', 'Trajet', 'Travail et cours', 'Avant de dormir']) expect(screen.queryByRole('region', { name: g })).not.toBeInTheDocument();
    expect(screen.getByText('Temps réservé')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Liste' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Moments' })).toBeChecked();
  });

  it('chaque groupe affiche son avancement et une séance se coche depuis la liste', async () => {
    const { writes } = renderApp({ hash: '#/today' });
    const soiree = await screen.findByRole('region', { name: 'Soirée' });
    expect(within(soiree).getByText('0/2')).toBeInTheDocument();
    await userEvent.click(within(soiree).getByRole('checkbox', { name: 'Java backend' }));
    expect(within(await screen.findByRole('region', { name: 'Soirée' })).getByText('1/2')).toBeInTheDocument();
    expect(writes.days.filter(([d]) => d === TUESDAY.today).at(-1)![1]).toMatchObject({ done: { java: true } });
  });

  it('le temps réservé (routine, sport, repas…) n\'a aucune case à cocher', async () => {
    renderApp({ hash: '#/today' });
    const reserved = (await screen.findByText('Temps réservé')).closest('details')!;
    expect(within(reserved).queryAllByRole('checkbox')).toHaveLength(0);
    expect(within(reserved).getByText('Routine du matin')).toBeInTheDocument();
  });

  it('un groupe se replie et se déplie, et l\'état est mémorisé', async () => {
    renderApp({ hash: '#/today' });
    const head = within(await screen.findByRole('region', { name: 'Soirée' })).getByRole('button', { name: /Soirée/ });
    expect(head).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(head);
    expect(head).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('checkbox', { name: 'Java backend' })).not.toBeInTheDocument();
    expect(localStorage.getItem('ascend-collapsed')).toContain('soiree');
    await userEvent.click(head);
    expect(await screen.findByRole('checkbox', { name: 'Java backend' })).toBeInTheDocument();
    localStorage.removeItem('ascend-collapsed');
  });

  it('regrouper par thèmes : MIAGE, Java…, et le choix est enregistré', async () => {
    const { writes } = renderApp({ hash: '#/today' });
    await userEvent.click(await screen.findByRole('radio', { name: 'Thèmes' }));
    expect(writes.settings).toEqual([{ ui: { group: 'themes' } }]);
    for (const g of ['MIAGE', 'Java']) expect(await screen.findByRole('region', { name: g })).toBeInTheDocument();
    for (const g of ['Santé', 'Repas', 'Sommeil', 'Productivité']) expect(screen.queryByRole('region', { name: g })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Soirée' })).not.toBeInTheDocument();
  });

  it('la frise horaire reste disponible', async () => {
    renderApp({ hash: '#/today', seed: { settings: { ui: { today: 'frise' } } } });
    expect(await screen.findByRole('region', { name: 'Frise de la journée' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Matin' })).not.toBeInTheDocument();
  });

  it('le bandeau de la semaine permet de changer de jour et marque le jour affiché', async () => {
    renderApp({ hash: '#/today' });
    const week = await screen.findByRole('navigation', { name: 'Semaine' });
    expect(within(week).getAllByRole('link')).toHaveLength(7);
    expect(within(week).getByRole('link', { current: 'date' })).toHaveAccessibleName(/mar\. 3/);
    await userEvent.click(within(week).getByRole('link', { name: /jeu\. 5/ }));
    expect(await screen.findByRole('heading', { level: 1, name: 'jeudi 5 novembre' })).toBeInTheDocument();
  });

  it('les objectifs sont listés en bas de la liste du jour', async () => {
    renderApp({ hash: '#/today', seed: { settings: { weightGoal: 80 }, days: { '2026-10-20': { weight: 90 }, [TUESDAY.today]: { weight: 85 } } } });
    const goals = await screen.findByRole('region', { name: 'Objectifs' });
    expect(within(goals).getByText('Cours MIAGE')).toBeInTheDocument();
    expect(within(goals).getByText('Java backend')).toBeInTheDocument();
    expect(within(goals).queryByText('Poids')).not.toBeInTheDocument();
  });
});

describe('ajustement automatique : réglage', () => {
  it('se désactive dans les réglages, et le journal disparaît', async () => {
    const { writes } = renderApp({ hash: '#/settings' });
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Ajuster automatiquement le planning' }));
    expect(writes.settings).toEqual([{ autoReschedule: false }]);
  });
  it('désactivé : plus de journal sur « Aujourd\'hui »', async () => {
    renderApp({ hash: '#/today', seed: { settings: { autoReschedule: false } } });
    await screen.findByRole('navigation', { name: 'Semaine' });
    expect(screen.queryByRole('region', { name: 'Ajustements automatiques du planning' })).not.toBeInTheDocument();
  });
});

describe('changer de jour d\'un geste ou au clavier', () => {
  it('flèche droite : jour suivant ; flèche gauche : jour précédent ; T : aujourd\'hui', async () => {
    renderApp({ hash: '#/today' });
    await screen.findByRole('heading', { level: 1, name: 'mardi 3 novembre' });
    await userEvent.keyboard('{ArrowRight}');
    expect(await screen.findByRole('heading', { level: 1, name: 'mercredi 4 novembre' })).toBeInTheDocument();
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(await screen.findByRole('heading', { level: 1, name: 'lundi 2 novembre' })).toBeInTheDocument();
    await userEvent.keyboard('t');
    expect(await screen.findByRole('heading', { level: 1, name: 'mardi 3 novembre' })).toBeInTheDocument();
  });

  it('les flèches ne changent pas de jour quand on tape dans un champ', async () => {
    renderApp({ hash: '#/today' });
    await userEvent.click(await screen.findByRole('button', { name: '+ Ajouter un bloc' }));
    await userEvent.click(within(await screen.findByRole('dialog')).getByLabelText('Titre'));
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('heading', { level: 1, name: 'mardi 3 novembre' })).toBeInTheDocument();
  });

  it('glisser vers la gauche : jour suivant ; vers la droite : jour précédent', async () => {
    renderApp({ hash: '#/today' });
    const week = await screen.findByRole('navigation', { name: 'Semaine' });
    fireEvent.touchStart(week, { touches: [{ clientX: 300, clientY: 400 }] });
    fireEvent.touchEnd(week, { changedTouches: [{ clientX: 150, clientY: 410 }] });
    expect(await screen.findByRole('heading', { level: 1, name: 'mercredi 4 novembre' })).toBeInTheDocument();
    const week2 = screen.getByRole('navigation', { name: 'Semaine' });
    fireEvent.touchStart(week2, { touches: [{ clientX: 100, clientY: 400 }] });
    fireEvent.touchEnd(week2, { changedTouches: [{ clientX: 260, clientY: 395 }] });
    expect(await screen.findByRole('heading', { level: 1, name: 'mardi 3 novembre' })).toBeInTheDocument();
  });

  it('un défilement vertical ou un petit mouvement n\'est pas un balayage', async () => {
    renderApp({ hash: '#/today' });
    const week = await screen.findByRole('navigation', { name: 'Semaine' });
    fireEvent.touchStart(week, { touches: [{ clientX: 300, clientY: 100 }] });
    fireEvent.touchEnd(week, { changedTouches: [{ clientX: 200, clientY: 400 }] });      // surtout vertical
    fireEvent.touchStart(week, { touches: [{ clientX: 300, clientY: 400 }] });
    fireEvent.touchEnd(week, { changedTouches: [{ clientX: 260, clientY: 400 }] });      // trop court
    expect(screen.getByRole('heading', { level: 1, name: 'mardi 3 novembre' })).toBeInTheDocument();
  });
});

describe('journées exceptionnelles (interface)', () => {
  it('choisir « Congé » enregistre le choix et libère la journée', async () => {
    const { writes } = renderApp({ hash: '#/today/2026-10-20' });
    await screen.findByRole('heading', { level: 1, name: 'mardi 20 octobre' });
    const reserved = () => screen.getByText('Temps réservé').closest('details')!;
    expect(within(reserved()).getAllByText(/Trajet/).length).toBeGreaterThan(0);
    await userEvent.selectOptions(screen.getByLabelText('Type de journée'), 'conge');
    expect(writes.days.filter(([d, p]) => d === '2026-10-20' && 'edits' in p).map(([, p]) => p)).toEqual([{ edits: { day: 'conge' } }]);
    await waitFor(() => expect(within(reserved()).queryByText(/Trajet/)).not.toBeInTheDocument());
    expect(screen.getByText('Congé', { selector: '.chip' })).toBeInTheDocument();
  });
  it('le week-end, le choix n\'est pas proposé', async () => {
    renderApp({ hash: '#/today/2026-10-18' });
    await screen.findByRole('heading', { level: 1, name: 'dimanche 18 octobre' });
    expect(screen.queryByLabelText('Type de journée')).not.toBeInTheDocument();
  });
});

describe('continuer mes cours (interface)', () => {
  it('affiche la prochaine étape Java avec son lien en français et la phase', async () => {
    renderApp({ hash: '#/today' });
    const section = await screen.findByRole('region', { name: 'Continuer mes cours' });
    expect(within(section).getByText('Syntaxe et éléments de base')).toBeInTheDocument();
    const open = within(section).getByRole('link', { name: /Ouvrir le cours : Syntaxe/ });
    expect(open).toHaveAttribute('href', 'https://www.jmdoudoux.fr/java/dej/chap-syntaxe.htm');
    expect(open).toHaveAttribute('target', '_blank');
    expect(within(section).getByRole('link', { name: /Voir la phase 1 de Java backend/ })).toHaveAttribute('href', '#/dom/java/p1');
  });
  it('après avoir fait la première étape, propose la suivante', async () => {
    renderApp({ hash: '#/today', seed: { progress: { done: { p1t1: true } } } });
    const section = await screen.findByRole('region', { name: 'Continuer mes cours' });
    expect(within(section).getByText('Programmation orientée objet : classes, héritage, interfaces')).toBeInTheDocument();
  });
});

describe('importer une sauvegarde (interface)', () => {
  const file = (obj: unknown, name = 'ascend.json') => new File([typeof obj === 'string' ? obj : JSON.stringify(obj)], name, { type: 'application/json' });

  it('un fichier valide : récapitulatif, confirmation, puis écriture groupée', async () => {
    const { writes } = renderApp({ hash: '#/settings' });
    const input = await screen.findByLabelText('Importer une sauvegarde');
    await waitFor(() => expect(writes.batches).toHaveLength(1));   // le rattrapage des stats au démarrage
    await userEvent.upload(input, file({ days: { '2026-10-20': { weight: 90 }, '2026-10-21': { weight: 89 } }, settings: { kcalGoal: 2900 }, progress: { done: { p1t1: true } } }));
    expect(await screen.findByText(/2 jours/)).toBeInTheDocument();
    expect(writes.batches).toHaveLength(1);                       // rien n'est écrit avant confirmation
    await userEvent.click(screen.getByRole('button', { name: 'Importer' }));
    await waitFor(() => expect(writes.batches.some((b) => b.length === 2 && b.every((e) => 'weight' in e.patch))).toBe(true));
    expect(writes.settings).toEqual([{ kcalGoal: 2900 }]);
    expect(writes.progress).toEqual([{ done: { p1t1: true } }]);
    expect(await screen.findByText(/Importé : 2 jours, 1 réglage, 1 tâche cochée/)).toBeInTheDocument();
  });

  it('un fichier invalide est refusé avec les raisons, sans rien écrire', async () => {
    const { writes } = renderApp({ hash: '#/settings' });
    const input = await screen.findByLabelText('Importer une sauvegarde');
    await waitFor(() => expect(writes.batches).toHaveLength(1));
    await userEvent.upload(input, file({ days: { demain: {} } }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Import refusé, rien n\'a été modifié');
    expect(screen.getByRole('alert')).toHaveTextContent('pas une date');
    expect(writes.batches).toHaveLength(1); expect(writes.settings).toEqual([]); expect(writes.progress).toEqual([]);
  });

  it('« Annuler » abandonne l\'import', async () => {
    const { writes } = renderApp({ hash: '#/settings' });
    await userEvent.upload(await screen.findByLabelText('Importer une sauvegarde'), file({ settings: { theme: 'dark' } }));
    await userEvent.click(await screen.findByRole('button', { name: 'Annuler' }));
    expect(writes.settings).toEqual([]);
  });

  it('un lot refusé par le serveur est annulé en entier, avec un message', async () => {
    const { failWrites } = renderApp({ hash: '#/settings', seed: { days: { '2026-10-20': { weight: 90 } } } });
    await userEvent.upload(await screen.findByLabelText('Importer une sauvegarde'), file({ days: { '2026-10-20': { weight: 70 } } }));
    failWrites.on = true;
    await userEvent.click(await screen.findByRole('button', { name: 'Importer' }));
    expect(await screen.findByText(/valeurs précédentes ont été rétablies/)).toBeInTheDocument();
  });
});

describe('premier lancement', () => {
  it('affiche « Pour bien démarrer » tant que rien n\'a été coché, avec les liens utiles', async () => {
    renderApp({ hash: '#/today' });
    const card = await screen.findByRole('region', { name: 'Pour bien démarrer' });
    expect(within(card).getByRole('link', { name: /Règle ton mois/ })).toHaveAttribute('href', '#/month');
    expect(within(card).getAllByRole('link', { name: /Choisis tes jours sur site|Active les rappels/ })).toHaveLength(2);
  });
  it('« C\'est fait » l\'enregistre (synchronisé) et la carte disparaît', async () => {
    const { writes } = renderApp({ hash: '#/today' });
    await userEvent.click(within(await screen.findByRole('region', { name: 'Pour bien démarrer' })).getByRole('button', { name: "C'est fait" }));
    expect(writes.settings).toEqual([{ ui: { onboarded: true } }]);
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Pour bien démarrer' })).not.toBeInTheDocument());
  });
  it('absente quand l\'utilisateur a déjà coché quelque chose', async () => {
    renderApp({ hash: '#/today', seed: { days: { '2026-11-02': { done: { java: true } } } } });
    await screen.findByRole('navigation', { name: 'Semaine' });
    expect(screen.queryByRole('region', { name: 'Pour bien démarrer' })).not.toBeInTheDocument();
  });
  it('absente quand c\'est déjà terminé, et le réglage d\'affichage de vue reste intact', async () => {
    renderApp({ hash: '#/today', seed: { settings: { ui: { onboarded: true, group: 'themes' } } } });
    await screen.findByRole('navigation', { name: 'Semaine' });
    expect(screen.queryByRole('region', { name: 'Pour bien démarrer' })).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Thèmes' })).toBeChecked();
  });
});

describe('prévision d\'achèvement (interface)', () => {
  it('sans rythme : invite à cocher les premières étapes', async () => {
    renderApp({ hash: '#/dom/java' });
    const card = await screen.findByRole('region', { name: "Prévision d'achèvement" });
    expect(card).toHaveTextContent('Coche tes premières étapes');
  });
  it('avec un rythme : minutes par jour, temps restant et date de fin', async () => {
    const done = { p1t1: true, p1t2: true, p1t3: true };
    const doneAt = { p1t1: '2026-11-02', p1t2: '2026-11-02', p1t3: '2026-11-03' };
    renderApp({ hash: '#/dom/java', seed: { progress: { done, doneAt } } });
    const card = await screen.findByRole('region', { name: "Prévision d'achèvement" });
    expect(card).toHaveTextContent(/Au rythme des 14 derniers jours/);
    expect(card).toHaveTextContent(/tu termines (vers le|dans plus de deux ans)/);
  });
});

describe('sur la bonne voie ? (interface)', () => {
  it('chaque matière affiche son statut, avec un symbole et pas seulement une couleur', async () => {
    renderApp({ hash: '#/dom/miage' });
    const link = (await screen.findByRole('link', { name: /Deep Learning/ }));
    expect(within(link).getByText(/En retard|Retard important|À jour|En avance/)).toBeInTheDocument();
    expect(link.querySelector('[data-track]')?.textContent).toMatch(/[▲●▼]/);
  });
});

describe('écran Statistiques', () => {
  const morning = { java: true };
  const snap = (pct: number, done: Record<string, number> = {}) => ({ pct, pl: 100, dn: pct, planned: {}, done });
  const days = {
    '2026-11-02': { done: morning, stats: snap(80, { matin: 75 }) },
    '2026-11-01': { done: morning, stats: snap(75, { matin: 75 }) },
    '2026-10-30': { done: morning, stats: snap(90, { matin: 75, java: 60 }) }
  };

  it('accessible depuis le Bilan, avec le bilan de la semaine et le retour', async () => {
    renderApp({ hash: '#/home' });
    await userEvent.click(await screen.findByRole('link', { name: /Statistiques/ }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Statistiques' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Bilan de la semaine' })).toHaveTextContent('Cette semaine');
    expect(screen.getByRole('link', { name: '← Bilan' })).toHaveAttribute('href', '#/home');
  });

  it('régularité par habitude : taux sur 7 et 30 jours, séries', async () => {
    renderApp({ hash: '#/stats', seed: { days } });
    const section = await screen.findByRole('region', { name: 'Régularité par habitude' });
    expect(within(section).getByText('Java backend')).toBeInTheDocument();
    expect(within(section).getAllByText(/Série actuelle/).length).toBeGreaterThan(0);
    expect(within(section).getAllByText(/7 j .* · 30 j /).length).toBeGreaterThan(0);
  });

  it('calendrier de chaleur : 84 cases accessibles avec la date et l\'avancement', async () => {
    renderApp({ hash: '#/stats', seed: { days } });
    const grid = await screen.findByRole('group', { name: 'Calendrier des 12 dernières semaines' });
    expect(within(grid).getAllByRole('img')).toHaveLength(84);
    expect(within(grid).getByRole('img', { name: 'lundi 2 novembre : 80 %' })).toBeInTheDocument();
    expect(within(grid).getByRole('img', { name: /mercredi 4 novembre : à venir/ })).toBeInTheDocument();
  });

  it('badges : aucun au départ, avec la progression vers chaque seuil', async () => {
    renderApp({ hash: '#/stats' });
    const section = await screen.findByRole('region', { name: 'Badges' });
    expect(section).toHaveTextContent('0 / 11');
    expect(within(section).getByText('Une semaine d\'affilée')).toBeInTheDocument();
    expect(section).toHaveTextContent('0 / 7');
  });

  it('un badge obtenu est marqué comme tel', async () => {
    const week = Object.fromEntries(['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-18', '2026-10-19'].map((d) => [d, { stats: snap(80) }]));
    renderApp({ hash: '#/stats', seed: { days: week } });
    const section = await screen.findByRole('region', { name: 'Badges' });
    expect(section).toHaveTextContent('1 / 11');
    expect(within(section).getByText('Une semaine d\'affilée').closest('.badge')).not.toHaveClass('locked');
  });

  it('bilan de la semaine : compare avec la semaine précédente', async () => {
    renderApp({ hash: '#/stats', seed: { days } });
    const section = await screen.findByRole('region', { name: 'Bilan de la semaine' });
    expect(section).toHaveTextContent(/Semaine précédente : 3,5 h/);
  });
});
