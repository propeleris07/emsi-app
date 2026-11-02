import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import type { Transaction } from '@/models';
import { services } from '@/services';
import { useSession } from '@/store';

export function useTransactions() {
  const userId = useSession((s) => s.user?.id);
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setItems(await services.transactions.list(userId));
    setLoading(false);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { items, loading, reload: load };
}
