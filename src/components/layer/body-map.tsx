import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { COLORS } from '@/lib/theme';

interface BodyMapProps {
  placementFirst?: string;
  placementSecond?: string;
}

type DotPoint = { x: number; y: number };

// ─── Zone dot positions (viewBox 200 × 420) ──────────────────────────────────

const ZONES: Record<string, DotPoint[]> = {
  hair: [{ x: 100, y: 10 }],

  behindEar: [
    { x: 74, y: 43 },
    { x: 126, y: 43 },
  ],

  neck: [{ x: 100, y: 78 }],

  decollete: [{ x: 100, y: 100 }],

  chest: [{ x: 100, y: 132 }],

  elbow: [
    { x: 38, y: 152 },
    { x: 162, y: 152 },
  ],

  wrist: [
    { x: 30, y: 183 },
    { x: 170, y: 183 },
  ],

  // ── new zones ──
  knee: [
    { x: 70, y: 308 },
    { x: 130, y: 308 },
  ],

  ankle: [
    { x: 68, y: 378 },
    { x: 132, y: 378 },
  ],
};

// ─── Keyword → zone mapping ───────────────────────────────────────────────────

const KEYWORDS: Record<string, string[]> = {
  hair: ['hair', 'scalp'],
  behindEar: ['behind ear', 'ears', 'ear', 'behind the ear'],
  neck: ['neck', 'throat', 'nape'],
  decollete: ['decollete', 'décolleté', 'collarbone', 'décolletage', 'decolletage'],
  chest: ['chest', 'sternum', 'breastbone'],
  elbow: ['elbow', 'inner elbow', 'crook of arm'],
  wrist: ['wrist', 'pulse', 'pulse point'],
  knee: ['knee', 'knees', 'behind knee', 'back of knee', 'crook of knee'],
  ankle: ['ankle', 'ankles', 'foot', 'feet'],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalize(text: string = '') {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function resolveZones(input?: string): DotPoint[] {
  if (!input) return [];

  const value = normalize(input);
  const found: DotPoint[] = [];
  const seen = new Set<string>();

  for (const [zone, keywords] of Object.entries(KEYWORDS)) {
    if (keywords.some((kw) => value.includes(normalize(kw)))) {
      for (const dot of ZONES[zone]) {
        const key = `${dot.x}-${dot.y}`;
        if (!seen.has(key)) {
          seen.add(key);
          found.push(dot);
        }
      }
    }
  }

  return found.length ? found : [{ x: 100, y: 132 }];
}

// ─── Dot — 4-ring radial bloom ────────────────────────────────────────────────

function Dot({ x, y, color, outlined = false }: DotPoint & { color: string; outlined?: boolean }) {
  return (
    <>
      {/* Outermost halo */}
      <Circle cx={x} cy={y} r={16} fill={color} opacity={0.05} />
      {/* Mid glow */}
      <Circle cx={x} cy={y} r={10} fill={color} opacity={0.11} />
      {/* Inner ring */}
      <Circle cx={x} cy={y} r={6} fill={color} opacity={0.22} />
      {/* Core */}
      <Circle
        cx={x}
        cy={y}
        r={3.5}
        fill={outlined ? COLORS.amber : color}
        stroke={outlined ? color : 'none'}
        strokeWidth={outlined ? 1.5 : 0}
      />
    </>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BodyMap({ placementFirst, placementSecond }: BodyMapProps) {
  const firstDots = resolveZones(placementFirst);
  const secondDots = resolveZones(placementSecond);
  const firstSet = new Set(firstDots.map((d) => `${d.x}-${d.y}`));

  const lc = COLORS.ash; // line color
  const sw = 1.4; // base stroke width

  return (
    <View style={{ alignItems: 'center' }}>
      {/*
        viewBox 200 × 420 — full body
        Displayed at 0.85× scale: width=170, height=357
      */}
      <Svg width={170} height={357} viewBox="0 0 200 420">
        {/* ── Head ── */}
        <Circle cx={100} cy={34} r={22} stroke={lc} strokeWidth={sw} fill="none" />

        {/* ── Neck ── */}
        <Path d="M 91 55 L 91 70 L 109 70 L 109 55" stroke={lc} strokeWidth={sw} fill="none" />

        {/* ── Left shoulder → waist → hip ── */}
        <Path
          d="M 91 70 Q 60 80 50 98 Q 46 132 56 166 Q 58 198 65 218"
          stroke={lc}
          strokeWidth={sw}
          fill="none"
          strokeLinecap="round"
        />

        {/* ── Right shoulder → waist → hip ── */}
        <Path
          d="M 109 70 Q 140 80 150 98 Q 154 132 144 166 Q 142 198 135 218"
          stroke={lc}
          strokeWidth={sw}
          fill="none"
          strokeLinecap="round"
        />

        {/* ── Pelvis arc (connects hips) ── */}
        <Path
          d="M 65 218 Q 100 232 135 218"
          stroke={lc}
          strokeWidth={sw}
          fill="none"
          strokeLinecap="round"
        />

        {/* ── Left arm ── */}
        <Path
          d="M 50 98 Q 36 138 30 182"
          stroke={lc}
          strokeWidth={1.2}
          fill="none"
          strokeLinecap="round"
        />

        {/* ── Right arm ── */}
        <Path
          d="M 150 98 Q 164 138 170 182"
          stroke={lc}
          strokeWidth={1.2}
          fill="none"
          strokeLinecap="round"
        />

        {/* ── Left leg — outer edge ── */}
        <Path
          d="M 65 218 Q 60 268 63 308 Q 61 350 64 390"
          stroke={lc}
          strokeWidth={1.2}
          fill="none"
          strokeLinecap="round"
        />

        {/* ── Left leg — inner edge ── */}
        <Path
          d="M 80 222 Q 78 268 76 308 Q 77 350 76 390"
          stroke={lc}
          strokeWidth={1.2}
          fill="none"
          strokeLinecap="round"
        />

        {/* ── Left foot ── */}
        <Path
          d="M 64 390 L 76 390"
          stroke={lc}
          strokeWidth={1.2}
          fill="none"
          strokeLinecap="round"
        />

        {/* ── Right leg — outer edge ── */}
        <Path
          d="M 135 218 Q 140 268 137 308 Q 139 350 136 390"
          stroke={lc}
          strokeWidth={1.2}
          fill="none"
          strokeLinecap="round"
        />

        {/* ── Right leg — inner edge ── */}
        <Path
          d="M 120 222 Q 122 268 124 308 Q 123 350 124 390"
          stroke={lc}
          strokeWidth={1.2}
          fill="none"
          strokeLinecap="round"
        />

        {/* ── Right foot ── */}
        <Path
          d="M 136 390 L 124 390"
          stroke={lc}
          strokeWidth={1.2}
          fill="none"
          strokeLinecap="round"
        />

        {/* ── First placement ── */}
        {firstDots.map((dot, i) => (
          <React.Fragment key={`first-${i}`}>
            <Dot {...dot} color={COLORS.amber} />
          </React.Fragment>
        ))}

        {/* ── Second placement ── */}
        {secondDots.map((dot, i) => {
          const duplicated = firstSet.has(`${dot.x}-${dot.y}`);
          return (
            <React.Fragment key={`second-${i}`}>
              <Dot {...dot} color={COLORS.ash} outlined={duplicated} />
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
