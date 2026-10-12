import { reducedMotion } from '@/hooks/feedback';

/** Petite explosion d'étincelles autour d'un élément, dans la couleur de son domaine (`--df`). Sans effet si le mouvement est réduit. */
export function sparks(from: Element | null, count = 16): void {
  if (!from || reducedMotion()) return;
  const r = from.getBoundingClientRect();
  if (!r.width && !r.height) return;
  const color = getComputedStyle(from).getPropertyValue('--df').trim() || '#ffb02e';
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.className = 'spark';
    s.style.cssText = `left:${x - 4}px;top:${y - 4}px;background:${i % 3 ? color : '#fff'}`;
    document.body.appendChild(s);
    if (typeof s.animate !== 'function') { s.remove(); continue; }
    const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 70;
    s.animate(
      [{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px) scale(0)`, opacity: 0 }],
      { duration: 600 + Math.random() * 350, easing: 'cubic-bezier(.1,.8,.3,1)' }
    ).onfinish = () => s.remove();
  }
}
