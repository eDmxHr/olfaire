import {
  IconFeather,
  IconFlame,
  IconCloud,
  IconBolt,
  IconMoon,
  IconWind,
  IconSparkles,
  IconHeart,
} from '@tabler/icons-react-native';
import type { ComponentType } from 'react';
import type { Mood } from '@/lib/supabase';
import { COLORS } from '@/lib/theme';

export const MOODS: {
  key: Mood;
  label: string;
  icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  tint: string;
  activeBorder: string;
}[] = [
  { key: 'soft',       label: 'Soft',       icon: IconFeather,  tint: COLORS.linen, activeBorder: COLORS.amber },
  { key: 'bold',       label: 'Bold',       icon: IconFlame,    tint: COLORS.linen, activeBorder: COLORS.amber },
  { key: 'cosy',       label: 'Cosy',       icon: IconCloud,    tint: COLORS.linen, activeBorder: COLORS.amber },
  { key: 'sharp',      label: 'Sharp',      icon: IconBolt,     tint: COLORS.linen, activeBorder: COLORS.amber },
  { key: 'mysterious', label: 'Mysterious', icon: IconMoon,     tint: COLORS.linen, activeBorder: COLORS.amber },
  { key: 'fresh',      label: 'Fresh',      icon: IconWind,     tint: COLORS.linen, activeBorder: COLORS.amber },
  { key: 'dark',       label: 'Dark',       icon: IconSparkles, tint: COLORS.linen, activeBorder: COLORS.amber },
  { key: 'romantic',   label: 'Romantic',   icon: IconHeart,    tint: COLORS.linen, activeBorder: COLORS.amber },
];
