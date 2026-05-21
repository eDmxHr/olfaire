import Svg, { Circle, Line, Path } from 'react-native-svg';
import { COLORS } from '@/lib/theme';

interface LumiProps {
  size?: number;
  wingColor?: string;
  bodyColor?: string;
  veinColor?: string;
}

export function Lumi({
  size = 48,
  wingColor = COLORS.ink,
  bodyColor = COLORS.amber,
  veinColor = COLORS.parchment,
}: LumiProps) {
  const h = size * (88 / 100);
  const showVeins = size > 20;

  return (
    <Svg width={size} height={h} viewBox="0 0 100 88" fill="none">
      {/* Upper wings */}
      <Path d="M47 36 C42 26 22 16 8 22 C2 28 6 40 16 44 C28 48 42 44 47 40" fill={wingColor} />
      <Path d="M53 36 C58 26 78 16 92 22 C98 28 94 40 84 44 C72 48 58 44 53 40" fill={wingColor} />
      {/* Lower wings */}
      <Path
        d="M46 44 C38 50 22 56 18 66 C15 74 24 77 34 70 C43 64 47 56 47 48"
        fill={wingColor}
        opacity={0.75}
      />
      <Path
        d="M54 44 C62 50 78 56 82 66 C85 74 76 77 66 70 C57 64 53 56 53 48"
        fill={wingColor}
        opacity={0.75}
      />
      {/* Wing vein detail — suppressed at nav size (≤20px) */}
      {showVeins && (
        <>
          <Path
            d="M47 38 C36 36 22 30 12 28"
            stroke={veinColor}
            strokeWidth={0.8}
            opacity={0.5}
            strokeLinecap="round"
          />
          <Path
            d="M53 38 C64 36 78 30 88 28"
            stroke={veinColor}
            strokeWidth={0.8}
            opacity={0.5}
            strokeLinecap="round"
          />
          <Path
            d="M46 46 C38 52 28 60 22 66"
            stroke={veinColor}
            strokeWidth={0.7}
            opacity={0.4}
            strokeLinecap="round"
          />
          <Path
            d="M54 46 C62 52 72 60 78 66"
            stroke={veinColor}
            strokeWidth={0.7}
            opacity={0.4}
            strokeLinecap="round"
          />
        </>
      )}
      {/* Amber body line */}
      <Line
        x1={50}
        y1={26}
        x2={50}
        y2={68}
        stroke={bodyColor}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      {/* Head */}
      <Circle cx={50} cy={22} r={4} fill={wingColor} />
      {/* Antennae */}
      <Path d="M48 19 Q38 12 30 5" stroke={wingColor} strokeWidth={1.1} strokeLinecap="round" />
      <Path d="M52 19 Q62 12 70 5" stroke={wingColor} strokeWidth={1.1} strokeLinecap="round" />
      {/* Antennae tips */}
      <Circle cx={30} cy={5} r={2} fill={bodyColor} />
      <Circle cx={70} cy={5} r={2} fill={bodyColor} />
    </Svg>
  );
}
