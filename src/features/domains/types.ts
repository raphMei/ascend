import type { ComponentType } from 'react';
import type { DomainId } from '@/domain/types';

/** Un domaine de vie dans l'interface : sa carte (écran « Mes domaines ») et sa page détaillée. */
export interface DomainModule {
  id: DomainId;
  Card: ComponentType;
  Page: ComponentType<{ sub?: string }>;
}
