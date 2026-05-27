import { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { ScreenHeader } from '@/components/ui/screen-header';
import { WeekDayRow } from '@/components/today/week-day-row';
import { ShimmerLine } from '@/components/today/shimmer-line';
import { useTodayStore } from '@/store/TodayStore';
import { useToday } from '@/hooks/useToday';
import { supabase } from '@/lib/supabase';
import { COLORS, FONTS } from '@/lib/theme';
import type { DailyLog } from '@/lib/supabase';

function todayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function buildWeekRange(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
}

export default function WeekScreen() {
  const weekLogs = useTodayStore((s) => s.weekLogs);
  const { fetchWeekLogs } = useToday();
  const [fragranceNames, setFragranceNames] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const today = todayDate();

  useEffect(() => {
    fetchWeekLogs().finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const ids = weekLogs.map((l) => l.worn_fragrance_id).filter((id): id is number => id != null);
    if (!ids.length) return;
    (async () => {
      const { data } = await (supabase as any)
        .from('fragrances')
        .select('id, house, name')
        .in('id', ids);
      if (data) {
        const map: Record<number, string> = {};
        for (const f of data) map[f.id] = `${f.house} ${f.name}`;
        setFragranceNames(map);
      }
    })();
  }, [weekLogs]);

  const logsByDate = Object.fromEntries(weekLogs.map((l) => [l.log_date, l]));
  const days = buildWeekRange();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScreenHeader title="This week" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-12"
        showsVerticalScrollIndicator={false}>
        {/* Day rows */}
        {isLoading
          ? Array.from({ length: 7 }).map((_, i) => (
              <View key={i} className="flex-row items-center gap-3.5 border-b border-border py-3.5">
                <View className="w-10 gap-1">
                  <ShimmerLine width={28} />
                  <ShimmerLine width={36} />
                </View>
                <View className="h-2.5 w-2.5 rounded-full border border-border" />
                <ShimmerLine width={140} />
              </View>
            ))
          : days.map((date) => {
          const log = logsByDate[date] as DailyLog | undefined;
          const isToday = date === today;

          if (!log) {
            const d = new Date(date + 'T00:00:00');
            const day = d.toLocaleDateString('en-US', { weekday: 'short' });
            const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            return (
              <View
                key={date}
                className="flex-row items-center gap-3.5 border-b border-border py-3.5">
                <View className="w-10">
                  <Text
                    style={{
                      fontFamily: FONTS.uiMedium,
                      fontSize: 11,
                      color: isToday ? COLORS.amber : COLORS.ink,
                    }}>
                    {day}
                  </Text>
                  <Text style={{ fontFamily: FONTS.ui, fontSize: 11, color: COLORS.ash }}>
                    {dateLabel}
                  </Text>
                </View>
                <View className="h-2.5 w-2.5 rounded-full border border-border" />
                <Text style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ash }}>
                  Nothing logged
                </Text>
              </View>
            );
          }

          return (
            <WeekDayRow
              key={date}
              log={log}
              fragranceName={
                log.worn_fragrance_id ? (fragranceNames[log.worn_fragrance_id] ?? null) : null
              }
              isToday={isToday}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
