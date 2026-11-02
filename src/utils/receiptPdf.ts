import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { Language, Receipt } from '@/models';
import { formatDateTime, formatMoney } from './format';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

function receiptHtml(r: Receipt, lang: Language, title: string): string {
  const m = (v: number) => formatMoney(v, lang);
  const rows = r.items
    .map(
      (i) => `<tr><td>${esc(i.name)}<br><small>${i.qty.toFixed(2)} ${i.unit === 'l' ? 'l' : 'vnt.'} × ${i.unitPrice.toFixed(3)} €</small></td>
      <td class="r">${m(i.qty * i.unitPrice)}${i.discount ? `<br><small class="g">–${m(i.discount)}</small>` : ''}</td></tr>`,
    )
    .join('');
  const vat = r.vat
    .map((v) => `<tr><td>PVM ${Math.round(v.rate * 100)} % nuo ${m(v.base)}</td><td class="r">${m(v.amount)}</td></tr>`)
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body{font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:420px;margin:24px auto;color:#111}
    h1{font-size:20px;margin:0}.muted{color:#666;font-size:12px}table{width:100%;border-collapse:collapse;margin:12px 0}
    td{padding:6px 0;border-bottom:1px dashed #ccc;vertical-align:top;font-size:14px}.r{text-align:right}.g{color:#00A651}
    .tot td{font-weight:700;font-size:18px;border:none}.brand{color:#00A651;font-weight:800;font-size:24px}
  </style></head><body>
    <div class="brand">EMSI</div><h1>${esc(title)}</h1>
    <p class="muted">${esc(r.seller.name)}, įm. k. ${r.seller.companyCode}, PVM k. ${r.seller.vatCode}<br>
    ${esc(r.station.name)}, ${esc(r.station.address)}<br>Nr. ${r.number} · ${formatDateTime(r.issuedAt, lang)}</p>
    <table>${rows}
      <tr><td>Tarpinė suma</td><td class="r">${m(r.subtotal)}</td></tr>
      <tr><td class="g">Nuolaidos</td><td class="r g">–${m(r.discount)}</td></tr>
      <tr class="tot"><td>Iš viso</td><td class="r">${m(r.total)}</td></tr>${vat}</table>
    <p class="muted">${esc(r.paymentLabel)}${r.loyaltyCardMasked ? `<br>EMSI kortelė ${r.loyaltyCardMasked}` : ''}</p>
    <p class="muted">Demonstracinis kvitas – netikras finansinis dokumentas.</p>
  </body></html>`;
}

/** Sugeneruoja kvito PDF ir atidaro „Bendrinti“ langą (išsaugoti, siųsti el. paštu ir t. t.). */
export async function exportReceiptPdf(r: Receipt, lang: Language, title: string): Promise<void> {
  const html = receiptHtml(r, lang, title);
  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return;
  }
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: title });
  }
}
