import { useEffect, useRef, type PointerEvent as RPointerEvent } from 'react';

const LONG_PRESS_MS = 480;
const DECIDE_PX = 10;        // distance avant de choisir « horizontal » ou « vertical » : le défilement vertical reste prioritaire
const THRESHOLD = 0.35;      // part de la largeur à dépasser pour valider un balayage

interface Options {
  /** Faux pour les lignes d'information et les jours bloqués : aucun geste. */
  enabled: boolean;
  /** Vrai si le balayage vers la droite peut cocher (tâche cochable et pas déjà faite). */
  canDone: boolean;
  onDone(): void;
  onSkip(): void;
  onMenu(): void;
}

/** Gestes d'une carte d'habitude : balayer à droite = fait, à gauche = passer, appui long = menu.
    Écrit directement dans des variables CSS (`--tx`, `--sr`, `--sl`) de l'élément : aucun rendu React pendant le glissement. */
export function useCardGestures(o: Options) {
  const ref = useRef<HTMLDivElement>(null);
  const opts = useRef(o);
  opts.current = o;
  const st = useRef<{ id: number; x: number; y: number; dx: number; mode: 'h' | 'v' | 'lp' | null; lp?: ReturnType<typeof setTimeout> } | null>(null);
  const suppress = useRef(false);

  const reset = () => {
    const el = ref.current;
    el?.classList.remove('pressed', 'dragging');
    el?.style.setProperty('--tx', '0px'); el?.style.setProperty('--sr', '0'); el?.style.setProperty('--sl', '0');
  };
  useEffect(() => () => { if (st.current?.lp) clearTimeout(st.current.lp); }, []);

  return {
    ref,
    handlers: {
      onPointerDown(e: RPointerEvent<HTMLDivElement>) {
        if (!opts.current.enabled || (e.pointerType === 'mouse' && e.button !== 0)) return;
        if ((e.target as HTMLElement).closest('input, label.cb, .habit-more, a')) return;
        suppress.current = false;
        const cur = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, mode: null as null | 'h' | 'v' | 'lp', lp: undefined as ReturnType<typeof setTimeout> | undefined };
        cur.lp = setTimeout(() => { cur.mode = 'lp'; suppress.current = true; ref.current?.classList.remove('pressed'); opts.current.onMenu(); }, LONG_PRESS_MS);
        st.current = cur;
        ref.current?.classList.add('pressed');
      },
      onPointerMove(e: RPointerEvent<HTMLDivElement>) {
        const s = st.current;
        if (!s || e.pointerId !== s.id || s.mode === 'lp' || s.mode === 'v') return;
        const mx = e.clientX - s.x, my = e.clientY - s.y;
        if (!s.mode && (Math.abs(mx) > DECIDE_PX || Math.abs(my) > DECIDE_PX)) {
          clearTimeout(s.lp);
          ref.current?.classList.remove('pressed');
          s.mode = Math.abs(mx) > Math.abs(my) ? 'h' : 'v';
          if (s.mode === 'h') { try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignoré */ } ref.current?.classList.add('dragging'); }
        }
        if (s.mode === 'h') {
          const el = ref.current!;
          const dx = !opts.current.canDone && mx > 0 ? mx * 0.25 : mx;     // résistance quand « fait » n'est pas possible
          s.dx = dx; suppress.current = true;
          el.style.setProperty('--tx', dx + 'px');
          el.style.setProperty('--sr', dx > 0 && opts.current.canDone ? String(Math.min(1, dx / 90)) : '0');
          el.style.setProperty('--sl', dx < 0 ? String(Math.min(1, -dx / 90)) : '0');
        }
      },
      onPointerUp(e: RPointerEvent<HTMLDivElement>) {
        const s = st.current;
        if (!s || e.pointerId !== s.id) return;
        clearTimeout(s.lp); st.current = null;
        const w = (ref.current?.offsetWidth ?? 320) * THRESHOLD;
        reset();
        if (s.mode === 'h') {
          if (s.dx > w && opts.current.canDone) opts.current.onDone();
          else if (s.dx < -w) opts.current.onSkip();
        }
      },
      onPointerCancel() { if (st.current) { clearTimeout(st.current.lp); st.current = null; } reset(); },
      onContextMenu(e: React.MouseEvent) { if (opts.current.enabled) e.preventDefault(); },
      /** Après un glissement ou un appui long, le « clic » qui suit ne doit pas déplier la carte. */
      onClickCapture(e: React.MouseEvent) { if (suppress.current) { e.stopPropagation(); e.preventDefault(); suppress.current = false; } }
    }
  };
}
