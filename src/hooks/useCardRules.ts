import { useMemo } from 'react';
import { services } from '@/services';
import { useCardStore } from '@/store';

/** Dabartinės kortelės nuolaidų taisyklės (arba bendros, jei kortelės dar nėra). */
export function useCardRules() {
  const type = useCardStore((s) => s.card?.type ?? 'general');
  return useMemo(() => services.loyalty.getRules(type), [type]);
}
