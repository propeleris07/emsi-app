import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import type { Subscription, SubscriptionPlan } from '@/models';
import { services } from '@/services';
import { useSession } from '@/store';

export function useSubscription(kind: Subscription['kind']) {
  const userId = useSession((s) => s.user?.id);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    const [plans, subs] = await Promise.all([services.subscriptions.listPlans(), services.subscriptions.list(userId)]);
    setPlan(plans.find((p) => p.kind === kind) ?? null);
    setSubscription(subs.find((s) => s.kind === kind) ?? null);
  }, [userId, kind]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { plan, subscription, reload: load };
}
