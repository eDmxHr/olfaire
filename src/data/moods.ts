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
}[] = [
  { key: 'soft',       label: 'Soft',       icon: IconFeather,  tint: '#F5EDE8' },
  { key: 'bold',       label: 'Bold',       icon: IconFlame,    tint: '#F0E8DC' },
  { key: 'cosy',       label: 'Cosy',       icon: IconCloud,    tint: '#EAE8E0' },
  { key: 'sharp',      label: 'Sharp',      icon: IconBolt,     tint: '#E8EAEC' },
  { key: 'mysterious', label: 'Mysterious', icon: IconMoon,     tint: '#E5E0EA' },
  { key: 'fresh',      label: 'Fresh',      icon: IconWind,     tint: '#E8F0EC' },
  { key: 'dark',       label: 'Dark',       icon: IconSparkles, tint: '#E0E0E8' },
  { key: 'romantic',   label: 'Romantic',   icon: IconHeart,    tint: '#EDE8EE' },
];
