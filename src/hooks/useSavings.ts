import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import type { SavingsSummary } from '@/models';
import { services } from '@/services';
import { useSession } from '@/store';

/** Sutaupymai iš pirkimų istorijos; atnaujinami kaskart grįžus į ekraną. */
export function useSavings(): SavingsSummary | null {
  const userId = useSession((s) => s.user?.id);
  const [savings, setSavings] = useState<SavingsSummary | null>(null);
  useFocusEffect(
    useCallback(() => {
      if (userId) services.loyalty.getSavings(userId).then(setSavings);
    }, [userId]),
  );
  return savings;
}
