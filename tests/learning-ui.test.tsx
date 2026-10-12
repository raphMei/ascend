import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { DayData } from '@/domain/types';
import { TUESDAY, renderApp } from './helpers';

const todayWrites = (writes: { days: [string, Record<string, unknown>][] }) => writes.days.filter(([d]) => d === TUESDAY.today).map(([, p]) => p);

describe('bilan de séance', () => {
  it('terminer une séance propose un bilan ; l\'enregistrer écrit le journal du jour avec la révision espacée', async () => {
    const { writes } = renderApp({ hash: '#/today' });
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Java backend' }));
    const dialog = await screen.findByRole('dialog', { name: 'Bilan de séance' });
    await userEvent.type(within(dialog).getByLabelText(/Ce que j'ai compris/), 'Optional sert de retour');
    await userEvent.click(within(dialog).getByRole('radio', { name: 'Dur' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Enregistrer la séance' }));
    expect(screen.queryByRole('dialog', { name: 'Bilan de séance' })).not.toBeInTheDocument();
    const entry = todayWrites(writes).map((p) => (p.journal as Record<string, unknown> | undefined)?.java).find(Boolean);
    expect(entry).toEqual({ t: 'Java backend', k: 'java', note: 'Optional sert de retour', diff: 3, rev: true, n: 0, next: '2026-11-05' });
  });

  it('« Passer » ferme le bilan sans rien écrire dans le journal', async () => {
    const { writes } = renderApp({ hash: '#/today' });
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Java backend' }));
    await userEvent.click(within(await screen.findByRole('dialog', { name: 'Bilan de séance' })).getByRole('button', { name: 'Passer' }));
    expect(screen.queryByRole('dialog', { name: 'Bilan de séance' })).not.toBeInTheDocument();
    expect(todayWrites(writes).some((p) => 'journal' in p)).toBe(false);
  });

  it('pas de bilan pour une mise en place, ni quand il est désactivé dans les réglages', async () => {
    renderApp({ hash: '#/today' });
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Récupérer les supports et créer le dossier' }));
    expect(screen.queryByRole('dialog', { name: 'Bilan de séance' })).not.toBeInTheDocument();
  });
  it('désactivé dans les réglages : aucune fenêtre', async () => {
    renderApp({ hash: '#/today', seed: { settings: { ui: { bilan: false, onboarded: true } } } });
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Java backend' }));
    expect(screen.queryByRole('dialog', { name: 'Bilan de séance' })).not.toBeInTheDocument();
  });
});

describe('réglage du bilan', () => {
  it('se désactive depuis les réglages (synchronisé)', async () => {
    const { writes } = renderApp({ hash: '#/settings' });
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Bilan après chaque séance' }));
    expect(writes.settings).toEqual([{ ui: { bilan: false } }]);
  });
});

describe('journal', () => {
  const days: Record<string, DayData> = {
    '2026-11-01': { journal: { 'dl:u1': { t: 'Perceptron', k: 'miage', note: 'Un neurone, une somme pondérée', diff: 2, rev: true, next: '2026-11-03', n: 0 } } },
    '2026-10-30': { journal: { java: { t: 'Collections', k: 'java', note: '', diff: 1 } } }
  };
  it('vide : explique comment il se remplit', async () => {
    renderApp({ hash: '#/journal' });
    expect(await screen.findByRole('heading', { name: 'Ton journal est vide' })).toBeInTheDocument();
  });
  it('liste les bilans par jour, avec le domaine et la difficulté', async () => {
    renderApp({ hash: '#/journal', seed: { days } });
    const day = await screen.findByRole('region', { name: 'dimanche 1 novembre' });
    expect(within(day).getByText('Perceptron')).toBeInTheDocument();
    expect(within(day).getByText(/Cours MIAGE · Correct/)).toBeInTheDocument();
    expect(within(day).getByText('Un neurone, une somme pondérée')).toBeInTheDocument();
  });
  it('« À revoir aujourd\'hui » : « Je sais » passe à la révision suivante et propose d\'annuler', async () => {
    const { writes } = renderApp({ hash: '#/journal', seed: { days } });
    const review = await screen.findByRole('region', { name: 'À revoir' });
    await userEvent.click(within(review).getByRole('button', { name: 'Je sais : Perceptron' }));
    expect(writes.days).toContainEqual(['2026-11-01', { journal: { 'dl:u1': { n: 1, next: '2026-11-06', rev: true } } }]);
    await userEvent.click(within(await screen.findByRole('status')).getByRole('button', { name: 'Annuler' }));
    expect(writes.days.at(-1)).toEqual(['2026-11-01', { journal: { 'dl:u1': { n: 0, next: '2026-11-03', rev: true } } }]);
  });
  it('« Flou » repart de demain', async () => {
    const { writes } = renderApp({ hash: '#/journal', seed: { days } });
    await userEvent.click(await screen.findByRole('button', { name: 'Flou : Perceptron' }));
    expect(writes.days).toContainEqual(['2026-11-01', { journal: { 'dl:u1': { n: 0, next: '2026-11-04', rev: true } } }]);
  });
  it('filtre par domaine', async () => {
    renderApp({ hash: '#/journal', seed: { days } });
    await userEvent.click(await screen.findByRole('button', { name: 'Java backend' }));
    expect(screen.queryByText('Perceptron')).not.toBeInTheDocument();
    expect(screen.getByText('Collections')).toBeInTheDocument();
  });
});

describe('semaine', () => {
  it('sept jours, le jour courant marqué, des leçons cliquables vers le jour', async () => {
    renderApp({ hash: '#/week' });
    const list = await screen.findByRole('list', { name: 'Les sept jours' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(7);
    expect(within(list).getByRole('link', { name: 'Ouvrir mar. 3' })).toHaveAttribute('href', '#/today');
    expect(within(list).getByText('Chabbat : aucune leçon')).toBeInTheDocument();
  });
  it('navigue d\'une semaine à l\'autre et revient à la semaine courante', async () => {
    renderApp({ hash: '#/week' });
    await userEvent.click(await screen.findByRole('link', { name: 'Semaine suivante' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Ma semaine' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('link', { name: 'Cette semaine' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Cette semaine' })).toBeInTheDocument();
  });
  it('résume les heures par domaine', async () => {
    renderApp({ hash: '#/week' });
    const card = await screen.findByRole('region', { name: 'Heures par domaine' });
    await waitFor(() => expect(within(card).getByText(/Java backend/)).toBeInTheDocument());
  });
});

describe('domaines : intensité et avancement', () => {
  it('une carte par domaine d\'apprentissage avec statut, et l\'intensité choisie est cochée', async () => {
    renderApp({ hash: '#/domains', seed: { settings: { months: { '2026-11': { cloud: 'normal' } } } } });
    const cloud = await screen.findByRole('region', { name: 'Cloud et DevOps' });
    expect(within(cloud).getByRole('radio', { name: 'Normal' })).toBeChecked();
    expect(within(cloud).getByText('À jour')).toBeInTheDocument();
    const miage = screen.getByRole('region', { name: 'Cours MIAGE' });
    expect(within(miage).getByText(/En retard de \d+/)).toBeInTheDocument();
  });
  it('un domaine désactivé pour le mois est « En pause »', async () => {
    renderApp({ hash: '#/domains', seed: { settings: { months: { '2026-11': { front: 'off' } } } } });
    expect(within(await screen.findByRole('region', { name: 'Dev front' })).getByText('En pause')).toBeInTheDocument();
  });
});
