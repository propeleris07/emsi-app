import { useMemo, useState } from 'react';
import { View, type GestureResponderEvent } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';
import { useTheme } from '@/theme';
import { Text } from './Text';

const pad = { top: 16, bottom: 16, left: 4, right: 4 };

export interface ChartPoint {
  label: string;
  value: number;
}

interface Props {
  data: ChartPoint[];
  width: number;
  height?: number;
  formatValue: (v: number) => string;
  color?: string;
}

/** Paprastas linijinis grafikas su „palietimu peržiūrėti reikšmę“. */
export function LineChart({ data, width, height = 180, formatValue, color }: Props) {
  const { colors } = useTheme();
  const stroke = color ?? colors.primary;
  const [active, setActive] = useState<number | null>(null);

  const { path, area, points, min, max } = useMemo(() => {
    const values = data.map((d) => d.value);
    const lo = Math.min(...values);
    const hi = Math.max(...values);
    const span = hi - lo || 1;
    const innerW = width - pad.left - pad.right;
    const innerH = height - pad.top - pad.bottom;
    const pts = data.map((d, i) => ({
      x: pad.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW),
      y: pad.top + innerH - ((d.value - lo) / span) * innerH,
    }));
    const p = pts.map((pt, i) => `${i ? 'L' : 'M'}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
    const a = `${p} L${pts[pts.length - 1]?.x ?? 0},${height} L${pts[0]?.x ?? 0},${height} Z`;
    return { path: p, area: a, points: pts, min: lo, max: hi };
  }, [data, width, height]);

  if (data.length === 0) return <View style={{ height }} />;

  const onTouch = (e: GestureResponderEvent) => {
    const x = e.nativeEvent.locationX;
    const i = Math.round(((x - pad.left) / (width - pad.left - pad.right)) * (data.length - 1));
    setActive(Math.max(0, Math.min(data.length - 1, i)));
  };

  const shown = active ?? data.length - 1;
  const pt = points[shown];

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text variant="small" tone="muted">
          {data[shown].label}
        </Text>
        <Text variant="bodyStrong">{formatValue(data[shown].value)}</Text>
      </View>
      <View
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={onTouch}
        onResponderMove={onTouch}
        onResponderRelease={() => setActive(null)}
        onResponderTerminate={() => setActive(null)}
      >
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="area" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={stroke} stopOpacity={0.28} />
              <Stop offset="1" stopColor={stroke} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={area} fill="url(#area)" />
          <Path d={path} stroke={stroke} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
          {pt ? (
            <>
              <Line x1={pt.x} x2={pt.x} y1={0} y2={height} stroke={colors.border} strokeWidth={1} />
              <Circle cx={pt.x} cy={pt.y} r={5} fill={colors.surface} stroke={stroke} strokeWidth={2.5} />
            </>
          ) : null}
        </Svg>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        <Text variant="caption" tone="muted">
          min {formatValue(min)}
        </Text>
        <Text variant="caption" tone="muted">
          max {formatValue(max)}
        </Text>
      </View>
    </View>
  );
}
