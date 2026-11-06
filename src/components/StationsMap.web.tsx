import { useEffect, useEffectEvent, useRef, useState, type ComponentRef } from 'react';
import { View } from 'react-native';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLang } from '@/hooks/useLang';
import { useTheme } from '@/theme';
import { formatPricePerL } from '@/utils/format';
import { cardPrice } from '@/utils/pricing';
import type { StationsMapProps } from './StationsMap';

/** Nuo šio mastelio rodomi kainų žymekliai (atitinka ~0,9° platumos telefone). */
const PRICE_PIN_MIN_ZOOM = 9;
const LITHUANIA_CENTER: L.LatLngTuple = [55.2, 23.9];

// OpenStreetMap žemėlapis (nemokamas, be API rakto). Didesniam srautui rinkitės komercinį tiekėją.
const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);

/** Žemėlapis naršyklėje: Leaflet + OpenStreetMap. Telefone naudojamas `StationsMap.tsx`. */
export function StationsMap({ stations, prices, rules, fuel, coords, showUser, selectedId, onSelect, fitKey, locateKey }: StationsMapProps) {
  const { colors } = useTheme();
  const lang = useLang();
  const container = useRef<ComponentRef<typeof View>>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markers = useRef<L.LayerGroup | null>(null);
  const userLayer = useRef<L.LayerGroup | null>(null);
  const [zoom, setZoom] = useState(showUser ? 11 : 7);
  const select = useEffectEvent((id: string | undefined) => onSelect(id));
  const currentStations = useEffectEvent(() => stations);
  const isFirstFit = useRef(true);

  // Žemėlapio sukūrimas.
  useEffect(() => {
    const el = container.current as unknown as HTMLElement | null;
    if (!el) return;
    const map = L.map(el, { zoomControl: false, attributionControl: true }).setView(showUser ? [coords.lat, coords.lng] : LITHUANIA_CENTER, showUser ? 11 : 7);
    L.tileLayer(TILES, { attribution: ATTRIBUTION, maxZoom: 19, className: 'emsi-tiles' }).addTo(map);
    L.control.zoom({ position: 'topright' }).addTo(map);
    markers.current = L.layerGroup().addTo(map);
    userLayer.current = L.layerGroup().addTo(map);
    map.on('zoomend', () => setZoom(map.getZoom()));
    map.on('click', () => select(undefined));
    mapRef.current = map;
    // Švelnesnės žemėlapio spalvos, kad žymekliai būtų ryškesni.
    if (!document.getElementById('emsi-map-style')) {
      const style = document.createElement('style');
      style.id = 'emsi-map-style';
      style.textContent = '.emsi-tiles{filter:saturate(.75) brightness(1.02)}';
      document.head.appendChild(style);
    }
    // Konteinerio dydis nusistovi po pirmo atvaizdavimo.
    const t = setTimeout(() => map.invalidateSize(), 50);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => map.invalidateSize()) : null;
    ro?.observe(el);
    return () => {
      clearTimeout(t);
      ro?.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // Žemėlapis kuriamas vieną kartą.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Žymekliai.
  useEffect(() => {
    const group = markers.current;
    if (!group) return;
    group.clearLayers();
    const showPrices = zoom >= PRICE_PIN_MIN_ZOOM;
    for (const s of stations) {
      const selected = s.id === selectedId;
      const p = prices[s.id]?.find((x) => x.fuel === fuel);
      const label = p ? formatPricePerL(cardPrice(p.pricePerL, fuel, rules), lang) : 'EMSI';
      const icon =
        showPrices || selected
          ? L.divIcon({
              className: '',
              iconSize: [0, 0],
              html: `<div style="transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;cursor:pointer">
                  <div style="background:${selected ? colors.accent : colors.mapPin};color:${selected ? colors.onAccent : '#fff'};font:800 13px system-ui,-apple-system,sans-serif;padding:5px 9px;border-radius:12px;border:2px solid #fff;box-shadow:0 4px 12px rgba(16,40,28,.25);white-space:nowrap">${esc(label)}</div>
                  <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid #fff;margin-top:-1px"></div>
                </div>`,
            })
          : L.divIcon({
              className: '',
              iconSize: [0, 0],
              html: `<div style="transform:translate(-50%,-50%);width:16px;height:16px;border-radius:50%;background:${colors.mapPin};border:2.5px solid #fff;box-shadow:0 2px 6px rgba(16,40,28,.35);cursor:pointer"></div>`,
            });
      L.marker([s.lat, s.lng], { icon, title: s.name, zIndexOffset: selected ? 1000 : 0, keyboard: true })
        .on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          select(s.id);
        })
        .addTo(group);
    }
  }, [stations, prices, rules, fuel, selectedId, zoom, lang, colors]);

  // Vartotojo vieta.
  useEffect(() => {
    const layer = userLayer.current;
    if (!layer) return;
    layer.clearLayers();
    if (showUser) {
      L.circleMarker([coords.lat, coords.lng], { radius: 8, color: '#fff', weight: 3, fillColor: colors.info, fillOpacity: 1 }).addTo(layer);
    }
  }, [showUser, coords, colors]);

  // Pasirinkta degalinė.
  useEffect(() => {
    const s = currentStations().find((x) => x.id === selectedId);
    const map = mapRef.current;
    if (s && map) map.flyTo([s.lat - 0.01, s.lng], Math.max(map.getZoom(), 12), { duration: 0.5 });
  }, [selectedId]);

  // Parodyti visas filtruotas degalines.
  useEffect(() => {
    const map = mapRef.current;
    const list = currentStations();
    // Pirmą kartą: jei žinoma vartotojo vieta – liekame ties ja.
    const first = isFirstFit.current;
    isFirstFit.current = false;
    if (!map || !list.length || (first && showUser)) return;
    const bounds = L.latLngBounds(list.map((s) => [s.lat, s.lng] as L.LatLngTuple));
    const fit = () => {
      map.invalidateSize();
      if (first) map.fitBounds(bounds, { padding: [28, 28], maxZoom: 13 });
      else map.flyToBounds(bounds, { padding: [28, 28], maxZoom: 13, duration: 0.5 });
    };
    // Pirmą kartą palaukiame, kol nusistovės konteinerio dydis.
    if (first) {
      const t = setTimeout(fit, 80);
      return () => clearTimeout(t);
    }
    fit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey]);

  useEffect(() => {
    if (locateKey) mapRef.current?.flyTo([coords.lat, coords.lng], 12, { duration: 0.5 });
    // Centruojama tik paspaudus mygtuką.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locateKey]);

  return <View ref={container} style={{ flex: 1, backgroundColor: colors.surfaceAlt }} />;
}
