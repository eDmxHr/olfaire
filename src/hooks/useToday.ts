import { supabase, type CollectionItem, type Mood, type WearRating } from '@/lib/supabase';
import { fetchLumiOpeningLine, fetchDailySuggestion } from '@/lib/claudeApi';
import { useTodayStore } from '@/store/TodayStore';
import { useAuthStore } from '@/store/authStore';
import { useCollectionStore } from '@/store/Collectionstore';

function todayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function useToday() {
  const store = useTodayStore();
  const profile = useAuthStore((s) => s.profile);
  const dna = useCollectionStore((s) => s.dna);

  async function fetchTodayLog() {
    store.setLoadingLog(true);
    try {
      const { data, error } = await supabase
        .from('daily_log')
        .select('*')
        .eq('log_date', todayDate())
        .maybeSingle();

      if (error) throw error;
      store.setTodayLog(data ?? null);
    } catch (err) {
      console.error('fetchTodayLog error:', err);
    } finally {
      store.setLoadingLog(false);
    }
  }

  async function fetchWeekLogs() {
    try {
      const from = new Date();
      from.setDate(from.getDate() - 6);
      const fromDate = from.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_log')
        .select('*')
        .gte('log_date', fromDate)
        .order('log_date', { ascending: false });

      if (error) throw error;
      store.setWeekLogs(data ?? []);
    } catch (err) {
      console.error('fetchWeekLogs error:', err);
    }
  }

  async function fetchWeather(city: string) {
    const apiKey = process.env.EXPO_PUBLIC_OPENWEATHER_KEY;
    if (!apiKey || !city) return;

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
      );
      if (!res.ok) return;
      const data = await res.json();
      store.setWeather({
        condition: data.weather?.[0]?.main ?? 'Clear',
        temp_c: Math.round(data.main?.temp ?? 20),
        humidity: data.main?.humidity ?? 50,
      });
      await backfillWeather();
    } catch (err) {
      console.error('fetchWeather error:', err);
    }
  }

  async function waitForWeather(timeoutMs = 3000): Promise<void> {
    const start = Date.now();
    while (!useTodayStore.getState().weather) {
      if (Date.now() - start > timeoutMs) return;
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  async function backfillWeather() {
    const { todayLog, weather } = useTodayStore.getState();
    if (!todayLog?.id || !weather || todayLog.weather_condition) return;
    try {
      await (supabase as any)
        .from('daily_log')
        .update({
          weather_condition: weather.condition,
          weather_temp_c: weather.temp_c,
          weather_humidity: weather.humidity,
        })
        .eq('id', todayLog.id);
      store.patchTodayLog({
        weather_condition: weather.condition,
        weather_temp_c: weather.temp_c,
        weather_humidity: weather.humidity,
      });
    } catch (err) {
      console.error('backfillWeather error:', err);
    }
  }

  async function fetchLumiOpening() {
    const weather = store.weather;
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    try {
      const line = await fetchLumiOpeningLine({
        weekday: today,
        condition: weather?.condition ?? 'clear',
        tempC: weather?.temp_c ?? 20,
      });
      if (line) store.setLumiOpening(line);
    } catch (err) {
      console.error('fetchLumiOpening error:', err);
    }
  }

  async function fetchSuggestion() {
    const { todayLog, weather } = store;
    if (!todayLog?.mood) return;

    store.setLoadingSuggestion(true);
    try {
      const { data: collection } = await (supabase as any)
        .from('user_collection')
        .select('*, fragrance:fragrances(*)')
        .eq('is_wishlist', false)
        .neq('stock_level', 'empty')
        .order('personal_rating', { ascending: false, nullsFirst: false })
        .limit(8);

      if (!collection?.length) return;

      const collectionContext = collection
        .map((item: CollectionItem) => {
          const f = item.fragrance as any;
          return `- [ID:${item.fragrance_id}] ${f.house} ${f.name} | ${f.family} ${f.concentration}
  Top: ${f.notes_top?.join(', ')} | Heart: ${f.notes_heart?.join(', ')} | Base: ${f.notes_base?.join(', ')}
  Rating: ${item.personal_rating ?? 'unrated'}/5 | Worn: ${item.wear_count}x | Low stock: ${item.stock_level === 'low'}`;
        })
        .join('\n');

      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

      // Build computed DNA string from dna_profiles.families — top 3 by score
      let computedDNA: string | null = null;
      if (collection.length >= 3 && dna?.families && Object.keys(dna.families).length > 0) {
        computedDNA = Object.entries(dna.families)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 3)
          .map(([family, score]) => `${family} ${Math.round(score as number)}%`)
          .join(', ');
      }

      const result = await fetchDailySuggestion({
        weekday: today,
        mood: todayLog.mood,
        condition: weather?.condition ?? 'clear',
        tempC: weather?.temp_c ?? 20,
        humidity: weather?.humidity ?? 50,
        collectionLines: collectionContext,
        skinType: profile?.skin_type ?? 'normal',
        lifestyle: profile?.lifestyle ?? 'casual',
        preferredFamilies: profile?.preferred_families ?? [],
        computedDNA,
        calendarEvent: todayLog.calendar_event ?? null,
      });

      store.setSuggestion(result);

      await (supabase as any)
        .from('daily_log')
        .update({
          suggested_fragrance_id: result.fragrance_id,
          lumi_suggestion_text: result.lumi_line,
        })
        .eq('id', todayLog.id);
    } catch (err) {
      console.error('fetchSuggestion error:', err);
    } finally {
      store.setLoadingSuggestion(false);
    }
  }

  async function selectMood(mood: Mood, occasion?: string) {
    const { weather } = store;
    const today = todayDate();

    store.setSuggestion(null);

    try {
      const upsertData: any = {
        user_id: profile?.id,
        log_date: today,
        mood,
        worn_fragrance_id: null,
        wear_rating: null,
        suggested_fragrance_id: null,
        lumi_suggestion_text: null,
        ...(occasion && { occasion }),
        ...(weather && {
          weather_condition: weather.condition,
          weather_temp_c: weather.temp_c,
          weather_humidity: weather.humidity,
        }),
      };

      const { data, error } = await (supabase as any)
        .from('daily_log')
        .upsert(upsertData, { onConflict: 'user_id,log_date' })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        store.setTodayLog(data);
        store.setLoadingSuggestion(true);
        void backfillWeather();
        await waitForWeather(3000);
        await fetchSuggestion();
      }
    } catch (err) {
      console.error('selectMood error:', err);
    }
  }

  async function confirmWearing(fragranceId: number) {
    const { todayLog } = store;
    if (!todayLog) return;

    const prev = todayLog;
    store.patchTodayLog({ worn_fragrance_id: fragranceId });

    try {
      const { error } = await (supabase as any)
        .from('daily_log')
        .update({ worn_fragrance_id: fragranceId })
        .eq('id', todayLog.id);

      if (error) throw error;

      await (supabase as any).rpc('increment_wear_count', { p_fragrance_id: fragranceId });
    } catch (err) {
      store.setTodayLog(prev);
      console.error('confirmWearing error:', err);
    }
  }

  async function submitRating(rating: WearRating) {
    const { todayLog } = store;
    if (!todayLog) return;

    const prev = todayLog;
    store.patchTodayLog({ wear_rating: rating });

    try {
      const { error } = await (supabase as any)
        .from('daily_log')
        .update({ wear_rating: rating })
        .eq('id', todayLog.id);

      if (error) throw error;
    } catch (err) {
      store.setTodayLog(prev);
      console.error('submitRating error:', err);
    }
  }

  async function requestAnother() {
    store.setSuggestion(null);
    await fetchSuggestion();
  }

  return {
    fetchTodayLog,
    fetchWeekLogs,
    fetchWeather,
    fetchLumiOpening,
    selectMood,
    fetchSuggestion,
    confirmWearing,
    submitRating,
    requestAnother,
  };
}
