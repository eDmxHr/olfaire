import { Svg, Polygon, Line, Text as SvgText, Circle, TSpan } from 'react-native-svg';
import { COLORS, FONTS, colorWithOpacity } from '@/lib/theme';

interface Props {
  families: Record<string, number>;
  size?: number;
}

export function DNARadarChart({ families, size = 260 }: Props) {
  const entries = Object.entries(families)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const n = entries.length;
  if (n < 2) return null;

  // Extra horizontal padding so left/right labels don't clip
  const hPad = 48;
  const width = size + hPad * 2;
  const cx = width / 2;
  const cy = size / 2;
  const maxR = size * 0.32;
  const labelR = size * 0.46;
  const levels = 4;

  function angleFor(i: number) {
    return (Math.PI * 2 * i) / n - Math.PI / 2;
  }

  function pointAt(i: number, r: number) {
    const a = angleFor(i);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  function polygonPoints(r: number) {
    return Array.from({ length: n }, (_, i) => {
      const p = pointAt(i, r);
      return `${p.x},${p.y}`;
    }).join(' ');
  }

  const maxScore = Math.max(...entries.map(([, v]) => v));
  const dataPoints = entries.map(([, score], i) => {
    const r = (score / Math.max(maxScore, 100)) * maxR;
    return pointAt(i, r);
  });
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <Svg width={width} height={size}>
      {/* Grid rings */}
      {Array.from({ length: levels }, (_, l) => {
        const r = (maxR * (l + 1)) / levels;
        return (
          <Polygon
            key={l}
            points={polygonPoints(r)}
            fill="none"
            stroke={colorWithOpacity(COLORS.ash, 0.18)}
            strokeWidth={1}
          />
        );
      })}

      {/* Axis lines */}
      {entries.map((_, i) => {
        const outer = pointAt(i, maxR);
        return (
          <Line
            key={i}
            x1={cx}
            y1={cy}
            x2={outer.x}
            y2={outer.y}
            stroke={colorWithOpacity(COLORS.ash, 0.18)}
            strokeWidth={1}
          />
        );
      })}

      {/* Data polygon */}
      <Polygon
        points={dataPolygon}
        fill={colorWithOpacity(COLORS.amber, 0x33 / 255)}
        stroke={COLORS.amber}
        strokeWidth={1.5}
      />

      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={3} fill={COLORS.amber} />
      ))}

      {/* Labels */}
      {entries.map(([family], i) => {
        const angle = angleFor(i);
        const p = { x: cx + labelR * Math.cos(angle), y: cy + labelR * Math.sin(angle) };
        const anchor =
          Math.abs(Math.cos(angle)) < 0.15
            ? 'middle'
            : Math.cos(angle) > 0
            ? 'start'
            : 'end';
        const words = family.split(' ');
        const lineHeight = 12;
        // Center multi-line labels vertically around the point
        const totalHeight = (words.length - 1) * lineHeight;
        const startY = p.y + 4 - totalHeight / 2;
        return (
          <SvgText
            key={i}
            textAnchor={anchor}
            fontSize={10}
            fontFamily={FONTS.ui}
            fill={COLORS.ash}>
            {words.map((word, wi) => (
              <TSpan key={wi} x={p.x} y={startY + wi * lineHeight}>
                {word}
              </TSpan>
            ))}
          </SvgText>
        );
      })}
    </Svg>
  );
}
