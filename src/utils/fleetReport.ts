import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { FleetAccount, FleetReport, Language } from '@/models';
import { formatDateTime, formatMoney, formatPlate } from './format';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Trumpa tekstinė ataskaita vadovui (el. paštui / žinutei). */
export function fleetReportText(account: FleetAccount, r: FleetReport, lang: Language, title: string): string {
  const m = (v: number) => formatMoney(v, lang);
  const lines = r.byVehicle
    .filter((v) => v.fills)
    .map(
      (v) =>
        `• ${formatPlate(v.vehicle.plate)} (${v.vehicle.nickname}): ${v.fills} × ${v.litres.toFixed(1)} l, ${m(v.amount)}${
          v.avgL100 ? `, ${v.avgL100.toFixed(1)} l/100 km` : ''
        }`,
    );
  return [`${title} – ${account.companyName}, ${r.month}`, ...lines, `= ${r.litres.toFixed(1)} l, ${m(r.total)} (−${m(r.saved)})`].join('\n');
}

export async function exportFleetReportPdf(account: FleetAccount, r: FleetReport, lang: Language, title: string) {
  const m = (v: number) => formatMoney(v, lang);
  const vehicleRows = r.byVehicle
    .map(
      (v) =>
        `<tr><td>${formatPlate(v.vehicle.plate)}<br><small>${esc(v.vehicle.nickname)}</small></td><td class="r">${v.fills}</td><td class="r">${v.litres.toFixed(1)}</td><td class="r">${v.distanceKm}</td><td class="r">${v.avgL100?.toFixed(1) ?? '–'}</td><td class="r">${m(v.amount)}</td></tr>`,
    )
    .join('');
  const txRows = r.transactions
    .map(
      (t) =>
        `<tr><td>${formatDateTime(t.createdAt, lang)}</td><td>${formatPlate(t.vehiclePlate ?? '')}</td><td>${esc(t.stationName)}</td><td class="r">${t.odometerKm ?? ''}</td><td class="r">${t.items[0]?.qty.toFixed(2) ?? ''}</td><td class="r">${m(t.total)}</td></tr>`,
    )
    .join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    body{font-family:-apple-system,Helvetica,Arial,sans-serif;margin:24px;color:#111;font-size:12px}
    h1{font-size:20px;margin:0 0 4px}.brand{color:#00A651;font-weight:800;font-size:22px}
    table{width:100%;border-collapse:collapse;margin:12px 0}th,td{padding:5px;border-bottom:1px solid #ddd;text-align:left}
    th{background:#f2f5f3}.r{text-align:right}.muted{color:#666}
  </style></head><body>
    <div class="brand">EMSI</div><h1>${esc(title)}</h1>
    <p class="muted">${esc(account.companyName)} (${account.companyCode}) · ${r.month}</p>
    <p><b>${m(r.total)}</b> · ${r.litres.toFixed(1)} l · ${m(r.saved)}</p>
    <table><tr><th>Automobilis</th><th class="r">Pylimai</th><th class="r">Litrai</th><th class="r">Km</th><th class="r">l/100 km</th><th class="r">Suma</th></tr>${vehicleRows}</table>
    <table><tr><th>Data</th><th>Nr.</th><th>Degalinė</th><th class="r">Rida</th><th class="r">l</th><th class="r">Suma</th></tr>${txRows}</table>
    <p class="muted">Demonstracinė ataskaita.</p></body></html>`;
  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return;
  }
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: title });
}
