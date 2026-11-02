import { useSettings } from '@/store';

export const useLang = () => useSettings((s) => s.language);
