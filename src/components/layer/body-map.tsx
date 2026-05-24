import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { COLORS } from '@/lib/theme';

interface BodyMapProps {
  placementFirst: string;
  placementSecond: string;
}

const ZONES: Record<string, { x: number; y: number }[]> = {
  'pulse':       [{ x: 100, y: 76 }, { x: 34, y: 185 }, { x: 166, y: 185 }],
  'wrist':       [{ x: 34, y: 185 }, { x: 166, y: 185 }],
  'elbow':       [{ x: 42, y: 155 }, { x: 158, y: 155 }],
  'neck':        [{ x: 100, y: 76 }],
  'décolleté':   [{ x: 100, y: 95 }],
  'decollete':   [{ x: 100, y: 95 }],
  'chest':       [{ x: 100, y: 130 }],
  'hair':        [{ x: 100, y: 12 }],
  'behind ear':  [{ x: 72, y: 44 }, { x: 128, y: 44 }],
};

const PRIORITY = ['pulse', 'wrist', 'elbow', 'neck', 'décolleté', 'decollete', 'chest', 'hair', 'behind ear'];

function resolveZones(placement: string): { x: number; y: number }[] {
  const lower = placement.toLowerCase();
  const seen = new Set<string>();
  const dots: { x: number; y: number }[] = [];

  for (const key of PRIORITY) {
    if (lower.includes(key)) {
      for (const dot of ZONES[key]) {
        const k = `${dot.x},${dot.y}`;
        if (!seen.has(k)) {
          seen.add(k);
          dots.push(dot);
        }
      }
    }
  }

  return dots.length ? dots : [{ x: 100, y: 130 }];
}

export function BodyMap({ placementFirst, placementSecond }: BodyMapProps) {
  const dotsFirst = resolveZones(placementFirst);
  const dotsSecond = resolveZones(placementSecond);

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={160} height={256} viewBox="0 0 200 320">
        {/* Silhouette */}
        <Circle cx={100} cy={38} r={26} stroke={COLORS.ash} strokeWidth={1.5} fill="none" />
        <Path
          d="M 88 64 L 88 82 L 112 82 L 112 64"
          stroke={COLORS.ash}
          strokeWidth={1.5}
          fill="none"
        />
        <Path
          d="M 88 82 Q 60 88 52 108 L 52 220 Q 52 230 62 230 L 138 230 Q 148 230 148 220 L 148 108 Q 140 88 112 82"
          stroke={COLORS.ash}
          strokeWidth={1.5}
          fill="none"
        />
        <Path
          d="M 55 112 Q 38 140 36 180"
          stroke={COLORS.ash}
          strokeWidth={1.2}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M 145 112 Q 162 140 164 180"
          stroke={COLORS.ash}
          strokeWidth={1.2}
          fill="none"
          strokeLinecap="round"
        />

        {/* First placement dots — amber */}
        {dotsFirst.map((dot, i) => (
          <React.Fragment key={`first-${i}`}>
            <Circle cx={dot.x} cy={dot.y} r={9} fill={COLORS.amber} opacity={0.25} />
            <Circle cx={dot.x} cy={dot.y} r={5} fill={COLORS.amber} />
          </React.Fragment>
        ))}

        {/* Second placement dots — ash */}
        {dotsSecond.map((dot, i) => (
          <React.Fragment key={`second-${i}`}>
            <Circle cx={dot.x} cy={dot.y} r={9} fill={COLORS.ash} opacity={0.25} />
            <Circle cx={dot.x} cy={dot.y} r={5} fill={COLORS.ash} />
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
}
