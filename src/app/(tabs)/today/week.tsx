import { useEffect, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconChevronLeft } from '@tabler/icons-react-native';
import { Text } from '@/components/ui/text';
import { WeekDayRow } from '@/components/today/week-day-row';
import { useTodayStore } from '@/store/TodayStore';
import { useToday } from '@/hooks/useToday';
import { supabase } from '@/lib/supabase';
import { COLORS, FONTS } from '@/lib/theme';
import type { DailyLog } from '@/lib/supabase';

function todayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Build the full 7-day range (today + 6 prior days), filling gaps with empty slots
function buildWeekRange(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });
}

export default function WeekScreen() {
  const weekLogs = useTodayStore((s) => s.weekLogs);
  const { fetchWeekLogs } = useToday();
  const [fragranceNames, setFragranceNames] = useState<Record<number, string>>({});
  const today = todayDate();

  useEffect(() => {
    fetchWeekLogs();
  }, []);

  // Resolve all worn_fragrance_ids to names in one query
  useEffect(() => {
    const ids = weekLogs
      .map((l) => l.worn_fragrance_id)
      .filter((id): id is number => id != null);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.parchment }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 28, gap: 8 }}>
          <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
            <IconChevronLeft size={22} color={COLORS.ink} strokeWidth={1.5} />
          </Pressable>
          <Text
            style={{
              fontFamily: FONTS.displayLightItalic,
              fontSize: 24,
              color: COLORS.ink,
            }}>
            This week
          </Text>
        </View>

        {/* Day rows */}
        {days.map((date) => {
          const log = logsByDate[date] as DailyLog | undefined;

          if (!log) {
            // Empty day placeholder
            const d = new Date(date + 'T00:00:00');
            const day = d.toLocaleDateString('en-US', { weekday: 'short' });
            const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const isToday = date === today;

            return (
              <View
                key={date}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: COLORS.dust,
                  gap: 14,
                }}>
                <View style={{ width: 42 }}>
                  <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 12, color: isToday ? COLORS.amber : COLORS.ink }}>
                    {day}
                  </Text>
                  <Text style={{ fontFamily: FONTS.ui, fontSize: 11, color: COLORS.ash }}>
                    {dateLabel}
                  </Text>
                </View>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: COLORS.dust,
                  }}
                />
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
              fragranceName={log.worn_fragrance_id ? (fragranceNames[log.worn_fragrance_id] ?? null) : null}
              isToday={date === today}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
