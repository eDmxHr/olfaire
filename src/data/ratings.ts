import { IconHeart, IconMinus, IconThumbDown } from '@tabler/icons-react-native';
import { COLORS } from '@/lib/theme';
import type { WearRating } from '@/lib/supabase';

export const RATINGS: { key: WearRating; label: string; Icon: typeof IconHeart }[] = [
  { key: 'loved',    label: 'Loved it',  Icon: IconHeart },
  { key: 'neutral',  label: 'Neutral',   Icon: IconMinus },
  { key: 'disliked', label: 'Not today', Icon: IconThumbDown },
];

export const RATING_CONFIG: Record<WearRating, { Icon: typeof IconHeart; color: string; label: string }> = {
  loved:    { Icon: IconHeart,     color: COLORS.amber, label: 'Logged as a favourite' },
  neutral:  { Icon: IconMinus,     color: COLORS.ash,   label: 'Logged as neutral' },
  disliked: { Icon: IconThumbDown, color: COLORS.ash,   label: 'Noted for next time' },
};
