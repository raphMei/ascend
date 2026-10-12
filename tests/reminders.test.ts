import { parisNow } from '@/core/paris';
import { dueReminders, remindersToSend, reminderSchedule, GRACE_MIN, type Reminder } from '@/domain/reminders';
import { planDay } from '@/domain/planner';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { genericTasks } from './fixtures';
import type { DayData } from '@/domain/types';
import { pushStatus, urlBase64ToBytes, type PushEnv } from '@/services/push';

const S = DEFAULT_SETTINGS;
const tasks = genericTasks(S);
const WED = '2026-10-14', FRI = '2026-11-06', SAT = '2026-11-07';
const plan = (date: string, day?: DayData) => planDay({ date, settings: S, progress: { done: {} }, day, today: date, tasks });
const kinds = (rs: Reminder[]) => rs.map((r) => r.kind);

describe('programme des rappels', () => {
  it('journée type : un seul rappel, 5 minutes avant la première séance d\'apprentissage', () => {
    const p = plan(WED), rs = reminderSchedule(WED, p, undefined, S);
    const first = p.blocks.find((b) => b.checkable && !b.done && !b.blocked)!;
    expect(kinds(rs)).toEqual(['seance']);
    expect(rs[0].at).toBe(first.start - 5);
    expect(rs[0].title).toBe(first.title);
    expect(rs[0].key).toBe(`${WED}:seance`);
  });
  it('aucun rappel pour la routine, le sport, les repas ni le sommeil : ce sont des temps réservés', () => {
    reminderSchedule(WED, plan(WED), undefined, S).forEach((r) => expect(['routine', 'sport', 'bilan', 'saisie']).not.toContain(r.kind));
  });
  it('ne rappelle pas ce qui est déjà fait', () => {
    const day: DayData = { done: { java: true } };
    const only = planDay({ date: WED, settings: S, progress: { done: {} }, day, today: WED, tasks: [] });
    expect(only.blocks.filter((b) => b.checkable).map((b) => b.id)).toEqual(['java', 'java']);
    expect(reminderSchedule(WED, only, day, S)).toEqual([]);
  });
  it('rien le samedi', () => { expect(reminderSchedule(SAT, plan(SAT), undefined, S)).toEqual([]); });
  it('vendredi : aucun rappel à partir de l\'allumage', () => {
    const p = plan(FRI);
    reminderSchedule(FRI, p, undefined, S).forEach((r) => expect(r.at).toBeLessThan(p.sh!.candle));
  });
});

describe('rappels dus', () => {
  const p = plan(WED), sched = reminderSchedule(WED, p, undefined, S), at = sched[0].at;
  it('dus seulement après leur heure, et dans les 90 minutes', () => {
    expect(kinds(dueReminders(sched, WED, at - 1, {}, S, p))).toEqual([]);
    expect(kinds(dueReminders(sched, WED, at, {}, S, p))).toEqual(['seance']);
    expect(kinds(dueReminders(sched, WED, at + GRACE_MIN + 1, {}, S, p))).toEqual([]);
  });
  it('un rappel déjà envoyé ne revient pas', () => {
    expect(kinds(dueReminders(sched, WED, at + 5, { [`${WED}:seance`]: 'x' }, S, p))).toEqual([]);
  });
  it('un type désactivé dans les réglages est ignoré', () => {
    expect(kinds(dueReminders(sched, WED, at + 5, {}, { ...S, reminders: { seance: false } }, p))).toEqual([]);
  });
  it('jamais pendant Chabbat, même si l\'heure est passée', () => {
    const pf = plan(FRI), sf = reminderSchedule(FRI, pf, undefined, S);
    expect(dueReminders(sf, FRI, pf.sh!.candle + 5, {}, S, pf)).toEqual([]);
    const ps = plan(SAT);
    expect(dueReminders([{ key: 'k', kind: 'seance', at: 100, title: 't', body: 'b' }], SAT, 600, {}, S, ps)).toEqual([]);
  });
  it('remindersToSend : rien avant la première séance, un rappel « séance » à l\'heure', () => {
    const run = (now: number) => remindersToSend({ date: WED, now, settings: S, progress: { done: {} }, day: undefined, sent: {} });
    expect(run(300)).toEqual([]);
    const hits = Array.from({ length: 33 }, (_, i) => 360 + i * 30).filter((n) => run(n).length > 0);
    expect(hits.length).toBeGreaterThan(0);
    expect(kinds(run(hits[0]))).toEqual(['seance']);
  });
});

describe('heure de Paris', () => {
  it('été (UTC+2) et hiver (UTC+1)', () => {
    expect(parisNow(new Date('2026-10-14T04:05:00Z'))).toEqual({ date: '2026-10-14', minutes: 365 });
    expect(parisNow(new Date('2026-12-14T05:05:00Z'))).toEqual({ date: '2026-12-14', minutes: 365 });
  });
  it('passe au jour suivant à minuit, heure de Paris', () => {
    expect(parisNow(new Date('2026-10-14T22:30:00Z'))).toEqual({ date: '2026-10-15', minutes: 30 });
  });
});

describe('statut des notifications', () => {
  const env = (o: Partial<PushEnv> = {}): PushEnv => ({ hasServiceWorker: true, hasPushManager: true, hasNotification: true, permission: 'default', standalone: false, ios: false, ...o });
  it('iPhone hors écran d\'accueil : application à installer', () => { expect(pushStatus(env({ ios: true }), false, 'k')).toBe('needs-install'); });
  it('iPhone installé : possible', () => { expect(pushStatus(env({ ios: true, standalone: true }), false, 'k')).toBe('off'); });
  it('navigateur sans push', () => { expect(pushStatus(env({ hasPushManager: false }), false, 'k')).toBe('unsupported'); });
  it('clé serveur absente', () => { expect(pushStatus(env(), false, '')).toBe('unconfigured'); });
  it('refusées', () => { expect(pushStatus(env({ permission: 'denied' }), false, 'k')).toBe('denied'); });
  it('actives seulement si autorisées et abonnées', () => {
    expect(pushStatus(env({ permission: 'granted' }), true, 'k')).toBe('on');
    expect(pushStatus(env({ permission: 'granted' }), false, 'k')).toBe('off');
  });
  it('clé VAPID base64url → octets', () => {
    expect(Array.from(urlBase64ToBytes('AQID'))).toEqual([1, 2, 3]);
    expect(Array.from(urlBase64ToBytes('_-8'))).toEqual([255, 239]);
  });
});
