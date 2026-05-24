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

export const MOODS: {
  key: Mood;
  label: string;
  icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  tint: string;
  activeBorder: string;
}[] = [
  { key: 'soft',       label: 'Soft',       icon: IconFeather,  tint: '#F5EDE8', activeBorder: '#C4937A' },
  { key: 'bold',       label: 'Bold',       icon: IconFlame,    tint: '#F0E8DC', activeBorder: '#B8895A' },
  { key: 'cosy',       label: 'Cosy',       icon: IconCloud,    tint: '#EAE8E0', activeBorder: '#9C9480' },
  { key: 'sharp',      label: 'Sharp',      icon: IconBolt,     tint: '#E8EAEC', activeBorder: '#7A8FA0' },
  { key: 'mysterious', label: 'Mysterious', icon: IconMoon,     tint: '#E5E0EA', activeBorder: '#8A72A8' },
  { key: 'fresh',      label: 'Fresh',      icon: IconWind,     tint: '#E8F0EC', activeBorder: '#6A9E80' },
  { key: 'dark',       label: 'Dark',       icon: IconSparkles, tint: '#E0E0E8', activeBorder: '#6E6E96' },
  { key: 'romantic',   label: 'Romantic',   icon: IconHeart,    tint: '#EDE8EE', activeBorder: '#A882B4' },
];
