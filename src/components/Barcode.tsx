import { useMemo } from 'react';
import Svg, { Rect } from 'react-native-svg';
import { encodeCode128 } from '@/utils/code128';

interface Props {
  value: string;
  width: number;
  height: number;
  color?: string;
}

/** Code 128 brūkšninis kodas (piešiamas SVG). Fonas visada baltas – kad skaitytuvai jį nuskaitytų. */
export function Barcode({ value, width, height, color = '#000' }: Props) {
  const bars = useMemo(() => {
    const widths = encodeCode128(value);
    const quiet = 10;
    const modules = widths.reduce((a, b) => a + b, 0) + quiet * 2;
    const unit = width / modules;
    const rects: { x: number; w: number }[] = [];
    let x = quiet * unit;
    widths.forEach((w, i) => {
      if (i % 2 === 0) rects.push({ x, w: w * unit });
      x += w * unit;
    });
    return rects;
  }, [value, width]);

  return (
    <Svg width={width} height={height}>
      <Rect x={0} y={0} width={width} height={height} fill="#fff" />
      {bars.map((b, i) => (
        <Rect key={i} x={b.x} y={0} width={b.w} height={height} fill={color} />
      ))}
    </Svg>
  );
}
