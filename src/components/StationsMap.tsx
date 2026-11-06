import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import type { DiscountRules, FuelPrice, FuelType } from '@/models';
import type { StationWithDistance } from '@/hooks/useStations';
import { useLang } from '@/hooks/useLang';
import { useTheme } from '@/theme';
import { formatPricePerL } from '@/utils/format';
import type { LatLng } from '@/utils/geo';
import { cardPrice } from '@/utils/pricing';
import { Text } from './Text';

export interface StationsMapProps {
  stations: StationWithDistance[];
  prices: Record<string, FuelPrice[]>;
  rules: DiscountRules;
  fuel: FuelType;
  coords: LatLng;
  showUser: boolean;
  selectedId?: string;
  onSelect: (id: string | undefined) => void;
  /** Pasikeitus reikšmei žemėlapis parodo visas `stations` degalines. */
  fitKey: string;
  /** Pasikeitus reikšmei žemėlapis centruojamas ties vartotoju. */
  locateKey: number;
}

/** Nutolus labiau nei šis mastelis rodomi taškai, priartinus – kainų žymekliai. */
export const PRICE_PIN_MAX_DELTA = 0.9;
export const LITHUANIA = { latitude: 55.2, longitude: 23.9, latitudeDelta: 3.4, longitudeDelta: 3.4 };

export function StationsMap({ stations, prices, rules, fuel, coords, showUser, selectedId, onSelect, fitKey, locateKey }: StationsMapProps) {
  const { colors, shadows } = useTheme();
  const lang = useLang();
  const map = useRef<MapView>(null);
  const [delta, setDelta] = useState(showUser ? 0.3 : LITHUANIA.latitudeDelta);
  const currentStations = useEffectEvent(() => stations);
  const isFirstFit = useRef(true);

  useEffect(() => {
    const s = currentStations().find((x) => x.id === selectedId);
    if (s) map.current?.animateToRegion({ latitude: s.lat - 0.012, longitude: s.lng, latitudeDelta: 0.08, longitudeDelta: 0.08 }, 400);
  }, [selectedId]);

  useEffect(() => {
    const list = currentStations();
    // Pirmą kartą: jei žinoma vartotojo vieta – liekame ties ja.
    const first = isFirstFit.current;
    isFirstFit.current = false;
    if (!list.length || (first && showUser)) return;
    map.current?.fitToCoordinates(
      list.map((s) => ({ latitude: s.lat, longitude: s.lng })),
      { edgePadding: { top: 50, right: 40, bottom: 50, left: 40 }, animated: !first },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey]);

  useEffect(() => {
    if (locateKey) map.current?.animateToRegion({ latitude: coords.lat, longitude: coords.lng, latitudeDelta: 0.2, longitudeDelta: 0.2 }, 400);
    // Centruojama tik paspaudus mygtuką, ne pasikeitus koordinatėms.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locateKey]);

  const showPrices = delta <= PRICE_PIN_MAX_DELTA;

  return (
    <MapView
      ref={map}
      style={{ flex: 1 }}
      showsUserLocation={showUser}
      showsMyLocationButton={false}
      onPress={(e) => {
        if (e.nativeEvent.action !== 'marker-press') onSelect(undefined);
      }}
      onRegionChangeComplete={(r) => setDelta(r.latitudeDelta)}
      initialRegion={showUser ? { latitude: coords.lat, longitude: coords.lng, latitudeDelta: 0.3, longitudeDelta: 0.3 } : LITHUANIA}
    >
      {stations.map((s) => {
        const p = prices[s.id]?.find((x) => x.fuel === fuel);
        const selected = s.id === selectedId;
        return (
          <Marker
            key={`${s.id}-${selected}-${fuel}-${showPrices}`}
            coordinate={{ latitude: s.lat, longitude: s.lng }}
            onPress={() => onSelect(s.id)}
            tracksViewChanges={false}
            anchor={showPrices || selected ? { x: 0.5, y: 1 } : { x: 0.5, y: 0.5 }}
            zIndex={selected ? 10 : 1}
          >
            {showPrices || selected ? (
              <View style={{ alignItems: 'center' }}>
                <View
                  style={[
                    {
                      backgroundColor: selected ? colors.accent : colors.mapPin,
                      paddingHorizontal: 9,
                      paddingVertical: 5,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: '#fff',
                    },
                    shadows.sm,
                  ]}
                >
                  <Text style={{ color: selected ? colors.onAccent : '#fff', fontWeight: '800', fontSize: 13 }}>
                    {p ? formatPricePerL(cardPrice(p.pricePerL, fuel, rules), lang) : 'EMSI'}
                  </Text>
                </View>
                <View
                  style={{
                    width: 0,
                    height: 0,
                    borderLeftWidth: 6,
                    borderRightWidth: 6,
                    borderTopWidth: 7,
                    borderLeftColor: 'transparent',
                    borderRightColor: 'transparent',
                    borderTopColor: '#fff',
                  }}
                />
              </View>
            ) : (
              <View style={[{ width: 16, height: 16, borderRadius: 8, backgroundColor: colors.mapPin, borderWidth: 2.5, borderColor: '#fff' }, shadows.sm]} />
            )}
          </Marker>
        );
      })}
    </MapView>
  );
}
