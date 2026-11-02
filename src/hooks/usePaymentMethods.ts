import { useEffect, useState } from 'react';
import type { PaymentMethod } from '@/models';
import { services } from '@/services';
import { useSession } from '@/store';

export function usePaymentMethods() {
  const userId = useSession((s) => s.user?.id);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  useEffect(() => {
    if (userId) services.payments.listMethods(userId).then(setMethods);
  }, [userId]);
  const defaultMethod = methods.find((m) => m.isDefault) ?? methods[0];
  return { methods, defaultMethod };
}
