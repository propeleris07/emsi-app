import { Pressable, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '@/theme';
import { Text } from './Text';

export interface StackedBar {
  label: string;
  segments: { value: number; color: string }[];
}

/** Sukrautų stulpelių grafikas (pvz., mėnesio išlaidos pagal kategorijas). */
export function BarChart({
  bars,
  width,
  height = 180,
  highlightIndex,
  onSelect,
}: {
  bars: StackedBar[];
  width: number;
  height?: number;
  highlightIndex?: number;
  onSelect?: (index: number) => void;
}) {
  const { colors, spacing } = useTheme();
  const max = Math.max(1, ...bars.map((b) => b.segments.reduce((a, s) => a + s.value, 0)));
  const slot = width / Math.max(1, bars.length);
  const barW = Math.min(36, slot * 0.6);

  return (
    <View>
      <Svg width={width} height={height}>
        {bars.map((b, i) => {
          let y = height;
          const x = i * slot + (slot - barW) / 2;
          return b.segments.map((seg, j) => {
            const h = (seg.value / max) * (height - 8);
            y -= h;
            return (
              <Rect
                key={`${i}-${j}`}
                x={x}
                y={y}
                width={barW}
                height={Math.max(0, h)}
                rx={j === b.segments.length - 1 ? 4 : 0}
                fill={seg.color}
                opacity={highlightIndex === undefined || highlightIndex === i ? 1 : 0.45}
              />
            );
          });
        })}
      </Svg>
      <View style={{ flexDirection: 'row', marginTop: spacing.xs }}>
        {bars.map((b) => (
          <Text key={b.label} variant="caption" tone="muted" center style={{ width: slot, color: colors.textMuted }}>
            {b.label}
          </Text>
        ))}
      </View>
      {onSelect ? (
        <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, flexDirection: 'row' }}>
          {bars.map((b, i) => (
            <Pressable key={b.label} accessibilityRole="button" accessibilityLabel={b.label} onPress={() => onSelect(i)} style={{ width: slot }} />
          ))}
        </View>
      ) : null}
    </View>
  );
}
