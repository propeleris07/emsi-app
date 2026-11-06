import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { StationWithDistance } from '@/hooks/useStations';
import { useLang } from '@/hooks/useLang';
import { useTheme } from '@/theme';
import { formatDistance } from '@/utils/format';
import { isOpenNow, todayHours } from '@/utils/hours';
import { Surface } from './Surface';
import { Text } from './Text';

export function OpenStatus({ station }: { station: StationWithDistance }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const open = isOpenNow(station);
  const hours = todayHours(station);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: open ? colors.success : colors.danger }} />
      <Text variant="small" tone="muted">
        {station.open24h ? t('stations.open24h') : `${open ? t('stations.openNow') : t('stations.closed')} · ${hours}`}
      </Text>
    </View>
  );
}

export function StationCard({ station, onPress, right }: { station: StationWithDistance; onPress?: () => void; right?: React.ReactNode }) {
  const lang = useLang();
  const { colors, spacing, radius } = useTheme();
  return (
    <Surface onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <View
        style={{ width: 44, height: 44, borderRadius: radius.sm + 2, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}
      >
        <Ionicons name="location-outline" size={22} color={colors.primary} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {station.name}
        </Text>
        <Text variant="small" tone="muted" numberOfLines={1}>
          {formatDistance(station.distanceKm, lang)} · {station.address}, {station.city}
        </Text>
        <OpenStatus station={station} />
      </View>
      {right}
    </Surface>
  );
}
