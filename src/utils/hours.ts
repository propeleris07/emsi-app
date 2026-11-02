import type { OpeningHours, Station } from '@/models';

function todayRange(hours: OpeningHours, d: Date): string {
  const day = d.getDay(); // 0 – sekmadienis
  return day === 0 ? hours.sunday : day === 6 ? hours.saturday : hours.weekdays;
}

export function isOpenNow(station: Station, now = new Date()): boolean {
  if (station.open24h || !station.hours) return true;
  const [from, to] = todayRange(station.hours, now).split('–');
  const mins = now.getHours() * 60 + now.getMinutes();
  const toMin = (s: string) => {
    const [h, m] = s.split(':').map(Number);
    return h * 60 + m;
  };
  return mins >= toMin(from) && mins < toMin(to);
}

export function todayHours(station: Station, now = new Date()): string | null {
  return station.open24h || !station.hours ? null : todayRange(station.hours, now);
}
