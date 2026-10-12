import { useSyncExternalStore } from 'react';
import type { ISODate } from '@/core/dates';
import type { Block } from '@/domain/types';

/* File d'attente du bilan de séance : proposé quand on termine une séance d'apprentissage. Un seul à la fois ; le dernier demandé l'emporte. */
export interface BilanAsk { id: number; date: ISODate; block: Block }
let current: BilanAsk | null = null;
let seq = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export function askBilan(date: ISODate, block: Block): void { current = { id: ++seq, date, block }; emit(); }
export function clearBilan(): void { current = null; emit(); }
export const useBilanAsk = (): BilanAsk | null => useSyncExternalStore(subscribe, () => current);
