import type { Language } from '@/models';

const sep = (lang: Language) => (lang === 'lt' ? ',' : '.');

/** Pinigų suma, pvz. „38,40 €“. */
export function formatMoney(value: number, lang: Language = 'lt'): string {
  const s = Math.abs(value).toFixed(2).replace('.', sep(lang));
  return `${value < 0 ? '–' : ''}${s} €`;
}

/** Kaina už litrą su 3 skaitmenimis po kablelio, pvz. „1,529“. */
export function formatPricePerL(value: number, lang: Language = 'lt'): string {
  return value.toFixed(3).replace('.', sep(lang));
}

export function formatLitres(value: number, lang: Language = 'lt'): string {
  return `${value.toFixed(2).replace('.', sep(lang))} l`;
}

export function formatDistance(km: number, lang: Language = 'lt'): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(km < 10 ? 1 : 0).replace('.', sep(lang))} km`;
}

export function formatDate(iso: string, lang: Language = 'lt'): string {
  return new Date(iso).toLocaleDateString(lang === 'lt' ? 'lt-LT' : 'en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(iso: string, lang: Language = 'lt'): string {
  return new Date(iso).toLocaleString(lang === 'lt' ? 'lt-LT' : 'en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** „7300 1234 5678 9012“ */
export function groupCardNumber(n: string): string {
  return n.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
}

export function maskCardNumber(n: string): string {
  const d = n.replace(/\D/g, '');
  return `•••• ${d.slice(-4)}`;
}

/** Normalizuoja LT mobiliojo numerį į +3706XXXXXXX formą arba grąžina null. */
export function normalizeLtPhone(input: string): string | null {
  const d = input.replace(/\D/g, '');
  let local: string;
  if (d.startsWith('370')) local = d.slice(3);
  else if (d.startsWith('86')) local = d.slice(1);
  else local = d;
  if (/^6\d{7}$/.test(local)) return `+370${local}`;
  return null;
}

export function formatPhone(e164: string): string {
  const m = e164.match(/^\+370(\d{3})(\d{5})$/);
  return m ? `+370 ${m[1]} ${m[2]}` : e164;
}

export const round2 = (n: number) => Math.round(n * 100) / 100;
export const round3 = (n: number) => Math.round(n * 1000) / 1000;

/** Valstybinis numeris be tarpų, didžiosiomis raidėmis, arba null, jei netinkamas. */
export function normalizePlate(input: string): string | null {
  const p = input.toUpperCase().replace(/[\s-]/g, '');
  return /^[A-Z0-9]{2,8}$/.test(p) ? p : null;
}

/** „ABC123“ → „ABC 123“ (įprastas LT formatas). */
export function formatPlate(plate: string): string {
  const m = plate.match(/^([A-Z]{3})(\d{3})$/);
  return m ? `${m[1]} ${m[2]}` : plate;
}
