import type { CSSProperties, ReactNode } from 'react';

export function Chip({ children, dot, style }: { children: ReactNode; dot?: CSSProperties; style?: CSSProperties }) {
  return <span className={'chip' + (dot ? ' dot' : '')} style={{ ...dot, ...style }}>{children}</span>;
}
