import { View } from 'react-native';
import { IconHeart, IconMinus, IconThumbDown } from '@tabler/icons-react-native';
import { Text } from '@/components/ui/text';
import { COLORS, FONTS } from '@/lib/theme';
import { MOODS } from '@/data/moods';
import type { DailyLog, WearRating, Mood } from '@/lib/supabase';

interface Props {
  log: DailyLog;
  fragranceName: string | null;
  isToday: boolean;
}

const RATING_ICON: Record<WearRating, typeof IconHeart> = {
  loved: IconHeart,
  neutral: IconMinus,
  disliked: IconThumbDown,
};

const RATING_COLOR: Record<WearRating, string> = {
  loved: COLORS.amber,
  neutral: COLORS.ash,
  disliked: COLORS.ash,
};

function formatDate(dateStr: string): { day: string; date: string } {
  const d = new Date(dateStr + 'T00:00:00');
  return {
    day: d.toLocaleDateString('en-US', { weekday: 'short' }),
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  };
}

export function WeekDayRow({ log, fragranceName, isToday }: Props) {
  const { day, date } = formatDate(log.log_date);
  const moodTint = log.mood ? MOODS.find((m) => m.key === (log.mood as Mood))?.tint : null;
  const RatingIcon = log.wear_rating ? RATING_ICON[log.wear_rating] : null;

  return (
    <View className="flex-row items-center gap-3.5 border-b border-border py-3.5">
      {/* Date column */}
      <View className="w-10">
        <Text
          style={{
            fontFamily: FONTS.uiMedium,
            fontSize: 12,
            color: isToday ? COLORS.amber : COLORS.ink,
          }}>
          {day}
        </Text>
        <Text style={{ fontFamily: FONTS.ui, fontSize: 11, color: COLORS.ash }}>{date}</Text>
      </View>

      {/* Fragrance + mood label */}
      <View className="flex-1">
        {fragranceName ? (
          <Text
            style={{ fontFamily: FONTS.displayLightItalic, fontSize: 15, color: COLORS.ink }}
            numberOfLines={1}>
            {fragranceName}
          </Text>
        ) : (
          <Text style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ash }}>
            {log.mood ? 'Not confirmed' : 'Nothing logged'}
          </Text>
        )}
        {log.mood && (
          <Text
            style={{ fontFamily: FONTS.ui, fontSize: 11, color: COLORS.ash }}
            className="mt-0.5">
            {log.mood.charAt(0).toUpperCase() + log.mood.slice(1)}
          </Text>
        )}
      </View>

      {/* Rating icon */}
      {RatingIcon && (
        <RatingIcon size={15} color={RATING_COLOR[log.wear_rating!]} strokeWidth={1.5} />
      )}
    </View>
  );
}
