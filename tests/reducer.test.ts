import { initialState, reducer } from '@/state/reducer';

const user = { uid: 'u', email: 'a@b.c', displayName: 'A' };

describe('reducer', () => {
  it('connexion puis première synchro', () => {
    let s = reducer(initialState(false), { type: 'auth', user, demo: false });
    expect(s.sync).toBe('loading'); expect(s.authReady).toBe(true);
    s = reducer(s, { type: 'days', days: { '2026-11-03': { weight: 87 } } });
    expect(s.sync).toBe('ok');
  });
  it('mode démo : reste « demo »', () => {
    let s = reducer(initialState(true), { type: 'auth', user, demo: true });
    s = reducer(s, { type: 'days', days: {} });
    expect(s.sync).toBe('demo');
  });
  it('déconnexion : efface les données', () => {
    let s = reducer(initialState(false), { type: 'auth', user, demo: false });
    s = reducer(s, { type: 'days', days: { d: { weight: 1 } } });
    s = reducer(s, { type: 'auth', user: null, demo: false });
    expect(s.days).toEqual({}); expect(s.user).toBeNull();
  });
  it('écritures optimistes en merge', () => {
    let s = reducer(initialState(false), { type: 'patchDay', date: 'd', patch: { done: { a: true } } });
    s = reducer(s, { type: 'patchDay', date: 'd', patch: { done: { b: true }, weight: 80 } });
    expect(s.days.d).toEqual({ done: { a: true, b: true }, weight: 80 });
    s = reducer(s, { type: 'patchProgress', patch: { done: { x: true } } });
    expect(s.progress.done).toEqual({ x: true });
    s = reducer(s, { type: 'patchSettings', patch: { theme: 'dark' } });
    expect(s.settings.theme).toBe('dark');
  });
  it('erreur de synchronisation', () => {
    const s = reducer(initialState(false), { type: 'error', code: 'permission-denied' });
    expect(s.sync).toBe('error'); expect(s.error).toBe('permission-denied');
  });
});
