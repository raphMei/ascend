import { useCallback, useEffect, useState } from 'react';
import { REMINDER_KINDS } from '@/domain/reminders';
import { currentSubscription, disablePush, enablePush, pushStatus, readEnv, showTestNotification, VAPID_PUBLIC_KEY, type PushStatus } from '@/services/push';
import { useData } from '@/state/DataContext';

const EXPLAIN: Record<PushStatus, string> = {
  unsupported: 'Cet appareil ou ce navigateur ne gère pas les notifications.',
  'needs-install': 'Sur iPhone, les notifications ne marchent que pour une application ajoutée à l\'écran d\'accueil (iOS 16.4 ou plus). Dans Safari : Partager › Sur l\'écran d\'accueil, puis rouvre Ascend depuis l\'icône.',
  unconfigured: 'Les rappels ne sont pas encore configurés sur le serveur (clé manquante). Voir docs/RAPPELS.md.',
  denied: 'Les notifications sont refusées pour Ascend. Autorise-les dans les réglages de ton appareil, puis reviens ici.',
  off: 'Active les rappels sur cet appareil : routine du matin, sport, bilan du soir, saisie du poids. Aucun rappel pendant Chabbat.',
  on: 'Les rappels sont actifs sur cet appareil. Aucun rappel n\'est envoyé pendant Chabbat.'
};

/** Réglages des notifications : autorisation, abonnement de cet appareil, choix des rappels. */
export function RemindersCard() {
  const { settings, setSettings, savePush } = useData();
  const [status, setStatus] = useState<PushStatus>('off');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    const sub = await currentSubscription().catch(() => null);
    setStatus(pushStatus(readEnv(), !!sub, VAPID_PUBLIC_KEY));
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  const enable = async () => {
    setBusy(true); setMessage('');
    try {
      const { id, sub } = await enablePush();
      await savePush({ subscriptions: { [id]: sub } });
      setMessage('Rappels activés sur cet appareil.');
    } catch (e) {
      setMessage(e instanceof Error && e.message.startsWith('permission-') ? 'Autorisation refusée : active les notifications dans les réglages de l\'appareil.' : 'Activation impossible. Réessaie, ou vérifie ta connexion.');
    } finally { setBusy(false); await refresh(); }
  };
  const disable = async () => {
    setBusy(true); setMessage('');
    try { const id = await disablePush(); if (id) await savePush({ subscriptions: { [id]: null } }); setMessage('Rappels désactivés sur cet appareil.'); }
    catch { setMessage('Désactivation impossible.'); }
    finally { setBusy(false); await refresh(); }
  };
  const test = async () => { try { await showTestNotification(); setMessage('Notification de test envoyée.'); } catch { setMessage('Impossible d\'afficher une notification ici.'); } };

  const canAct = status === 'off' || status === 'on';
  return (
    <section className="card"><h2>Rappels</h2>
      <p className="muted" style={{ margin: '4px 0 12px' }}>{EXPLAIN[status]}</p>
      {canAct && (
        <div className="quick" style={{ marginTop: 0 }}>
          {status === 'off' ? <button type="button" className="btn primary" disabled={busy || !VAPID_PUBLIC_KEY} onClick={() => void enable()}>Activer les rappels</button>
            : <><button type="button" className="btn" disabled={busy} onClick={() => void disable()}>Désactiver sur cet appareil</button><button type="button" className="btn" onClick={() => void test()}>Notification de test</button></>}
        </div>
      )}
      {status === 'on' && (
        <div className="list" style={{ marginTop: 10 }}>
          {REMINDER_KINDS.map(({ kind, label, hint }) => (
            <label className="row" key={kind} style={{ cursor: 'pointer' }}>
              <span>{label}<span className="muted" style={{ display: 'block', fontSize: 14 }}>{hint}</span></span>
              <input type="checkbox" checked={settings.reminders?.[kind] !== false} onChange={(e) => setSettings({ reminders: { [kind]: e.target.checked } })} aria-label={label} style={{ width: 24, height: 24 }} />
            </label>
          ))}
        </div>
      )}
      {message && <p role="status" className="muted" style={{ marginTop: 10 }}>{message}</p>}
    </section>
  );
}
