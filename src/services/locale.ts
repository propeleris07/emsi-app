import type { Language } from '@/models';

/**
 * Kalba, kuria „serveris“ grąžina turinį (kaip Accept-Language antraštė).
 * Nustatoma iš programėlės nustatymų.
 */
let current: Language = 'lt';

export const setServiceLanguage = (lang: Language) => {
  current = lang;
};

export const getServiceLanguage = () => current;

/** Demonstraciniuose JSON duomenyse vertimai laikomi lauke `en`. */
export function localize<T extends object>(row: T & { en?: Partial<T> }): T {
  const { en, ...rest } = row;
  return (current === 'en' && en ? { ...rest, ...en } : rest) as T;
}
