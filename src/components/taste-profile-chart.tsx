import { View } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { Text } from '@/components/ui/text';
import { FONTS, COLORS } from '@/lib/theme';
import { FAMILY_COLORS } from '@/data/onboarding';

const SIZE = 160;
const cx = SIZE / 2;
const cy = SIZE / 2;
const r = SIZE / 2 - 4;

function polarToCartesian(angle: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

function slicePath(startAngle: number, endAngle: number): string {
  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

function Legend({ families }: { families: string[] }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
      {families.map((family) => (
        <View key={family} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              backgroundColor: FAMILY_COLORS[family] ?? COLORS.amber,
            }}
          />
          <Text style={{ fontFamily: FONTS.ui, fontSize: 11, color: COLORS.ash }}>{family}</Text>
        </View>
      ))}
    </View>
  );
}

export function TasteProfileChart({ families }: { families: string[] }) {
  if (families.length === 0) {
    return (
      <View style={{ alignItems: 'center', gap: 12 }}>
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={COLORS.dust}
            strokeWidth={2}
            strokeDasharray="6 4"
          />
        </Svg>
        <Text
          style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ash, textAlign: 'center' }}>
          Select your favourite families
        </Text>
      </View>
    );
  }

  if (families.length === 1) {
    return (
      <View style={{ alignItems: 'center', gap: 12 }}>
        <Svg width={SIZE} height={SIZE}>
          <Circle cx={cx} cy={cy} r={r} fill={FAMILY_COLORS[families[0]] ?? COLORS.amber} />
        </Svg>
        <Legend families={families} />
      </View>
    );
  }

  const sweep = (2 * Math.PI) / families.length;
  const startOffset = -Math.PI / 2;

  return (
    <View style={{ alignItems: 'center', gap: 12 }}>
      <Svg width={SIZE} height={SIZE}>
        <G>
          {families.map((family, i) => {
            const startAngle = startOffset + i * sweep;
            const endAngle = startAngle + sweep;
            return (
              <Path
                key={family}
                d={slicePath(startAngle, endAngle)}
                fill={FAMILY_COLORS[family] ?? COLORS.amber}
              />
            );
          })}
        </G>
      </Svg>
      <Legend families={families} />
    </View>
  );
}
