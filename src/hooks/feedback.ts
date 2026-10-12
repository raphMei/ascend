/** Retours sensoriels : vibration courte et petit son de validation (optionnel).
    Tout est facultatif : sans effet si l'appareil ne sait pas le faire (la vibration web n'existe pas sur iPhone). */
export function haptic(pattern: number | number[] = 12): void {
  try { navigator.vibrate?.(pattern); } catch { /* pas de vibration sur cet appareil */ }
}

let audio: AudioContext | undefined;
/** Petit « tic » montant. `enabled` vient du réglage de l'utilisateur (désactivé par défaut). */
export function tickSound(enabled: boolean, freq = 880): void {
  if (!enabled) return;
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    audio ??= new AC();
    const t = audio.currentTime, o = audio.createOscillator(), g = audio.createGain();
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.09);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    o.connect(g).connect(audio.destination);
    o.start(t); o.stop(t + 0.17);
  } catch { /* son indisponible : on ignore */ }
}

/** Vrai si l'utilisateur a demandé moins de mouvement dans les réglages de son appareil. */
export function reducedMotion(): boolean {
  try { return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true; } catch { return false; }
}
