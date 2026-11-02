import { useEffect, useRef } from 'react';
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
  onSelect: (id: string) => void;
}

export function StationsMap({ stations, prices, rules, fuel, coords, showUser, selectedId, onSelect }: StationsMapProps) {
  const { colors } = useTheme();
  const lang = useLang();
  const map = useRef<MapView>(null);

  useEffect(() => {
    const s = stations.find((x) => x.id === selectedId);
    if (s) map.current?.animateToRegion({ latitude: s.lat, longitude: s.lng, latitudeDelta: 0.08, longitudeDelta: 0.08 }, 400);
  }, [selectedId, stations]);

  return (
    <MapView
      ref={map}
      style={{ flex: 1 }}
      showsUserLocation={showUser}
      initialRegion={{ latitude: showUser ? coords.lat : 55.2, longitude: showUser ? coords.lng : 23.9, latitudeDelta: showUser ? 0.3 : 3.6, longitudeDelta: showUser ? 0.3 : 3.6 }}
    >
      {stations.map((s) => {
        const p = prices[s.id]?.find((x) => x.fuel === fuel);
        const selected = s.id === selectedId;
        return (
          <Marker
            key={`${s.id}-${selected}-${fuel}`}
            coordinate={{ latitude: s.lat, longitude: s.lng }}
            onPress={() => onSelect(s.id)}
            tracksViewChanges={false}
          >
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  backgroundColor: selected ? colors.accent : colors.mapPin,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: '#fff',
                }}
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
          </Marker>
        );
      })}
    </MapView>
  );
}
