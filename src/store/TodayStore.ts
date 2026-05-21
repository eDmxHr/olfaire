import { create } from 'zustand';
import {
  CollectionItem,
  supabase,
  type DailyLog,
  type Mood,
  type WearRating,
} from '@/lib/supabase';
import { fetchLumiOpeningLine, fetchDailySuggestion } from '@/lib/claudeApi';

// ── Types ─────────────────────────────────────────────────────────
interface WeatherContext {
  condition: string;
  temp_c: number;
  humidity: number;
}

interface Suggestion {
  fragrance_id: number;
  fragrance_house: string;
  fragrance_name: string;
  lumi_line: string;
  reasoning_tags: string[];
}

// ── State & Actions interface ─────────────────────────────────────
interface TodayState {
  // State
  todayLog: DailyLog | null;
  weekLogs: DailyLog[];
  suggestion: Suggestion | null;
  weather: WeatherContext | null;
  lumiOpening: string | null;
  isLoadingSuggestion: boolean;
  isLoadingLog: boolean;

  // Computed
  isWearing: () => boolean;
  hasMoodToday: () => boolean;
  hasRated: () => boolean;

  // Actions
  fetchTodayLog: () => Promise<void>;
  fetchWeekLogs: () => Promise<void>;
  fetchWeather: (city: string) => Promise<void>;
  fetchLumiOpening: () => Promise<void>;
  selectMood: (mood: Mood, occasion?: string) => Promise<void>;
  fetchSuggestion: () => Promise<void>;
  confirmWearing: (fragranceId: number) => Promise<void>;
  submitRating: (rating: WearRating) => Promise<void>;
  requestAnother: () => Promise<void>;
  reset: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────
function todayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// ── Store ─────────────────────────────────────────────────────────
export const useTodayStore = create<TodayState>()((set, get) => ({
  todayLog: null,
  weekLogs: [],
  suggestion: null,
  weather: null,
  lumiOpening: null,
  isLoadingSuggestion: false,
  isLoadingLog: false,

  // ── Computed ───────────────────────────────────────────────
  isWearing: () => !!get().todayLog?.worn_fragrance_id,
  hasMoodToday: () => !!get().todayLog?.mood,
  hasRated: () => !!get().todayLog?.wear_rating,

  // ── Fetch today's log ──────────────────────────────────────
  fetchTodayLog: async () => {
    set({ isLoadingLog: true });
    try {
      const { data, error } = await supabase
        .from('daily_log')
        .select('*')
        .eq('log_date', todayDate())
        .maybeSingle();

      if (error) throw error;
      set({ todayLog: data ?? null });
    } catch (err) {
      console.error('fetchTodayLog error:', err);
    } finally {
      set({ isLoadingLog: false });
    }
  },

  // ── Fetch week logs ────────────────────────────────────────
  fetchWeekLogs: async () => {
    try {
      // Last 7 days
      const from = new Date();
      from.setDate(from.getDate() - 6);
      const fromDate = from.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_log')
        .select('*')
        .gte('log_date', fromDate)
        .order('log_date', { ascending: false });

      if (error) throw error;
      set({ weekLogs: data ?? [] });
    } catch (err) {
      console.error('fetchWeekLogs error:', err);
    }
  },

  // ── Fetch weather ──────────────────────────────────────────
  // Uses OpenWeather API — key stored in env
  fetchWeather: async (city) => {
    const apiKey = process.env.EXPO_PUBLIC_OPENWEATHER_KEY;
    if (!apiKey || !city) return;

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
      );
      if (!res.ok) return;
      const data = await res.json();
      set({
        weather: {
          condition: data.weather?.[0]?.main ?? 'Clear',
          temp_c: Math.round(data.main?.temp ?? 20),
          humidity: data.main?.humidity ?? 50,
        },
      });
    } catch (err) {
      console.error('fetchWeather error:', err);
    }
  },

  // ── Fetch Lumi's morning opening line ─────────────────────
  fetchLumiOpening: async () => {
    const weather = get().weather;
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    try {
      const line = await fetchLumiOpeningLine({
        weekday: today,
        condition: weather?.condition ?? 'clear',
        tempC: weather?.temp_c ?? 20,
      });
      if (line) set({ lumiOpening: line });
    } catch (err) {
      console.error('fetchLumiOpening error:', err);
    }
  },

  // ── Select mood → upsert log → fetch suggestion ────────────
  selectMood: async (mood, occasion) => {
    const weather = get().weather;
    const today = todayDate();

    try {
      const upsertData: any = {
        log_date: today,
        mood,
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
      if (data) set({ todayLog: data });

      // Immediately fetch suggestion after mood is locked
      await get().fetchSuggestion();
    } catch (err) {
      console.error('selectMood error:', err);
    }
  },

  // ── Fetch Lumi's daily suggestion ─────────────────────────
  fetchSuggestion: async () => {
    const todayLog = get().todayLog;
    const weather = get().weather;
    if (!todayLog?.mood) return;

    set({ isLoadingSuggestion: true });
    try {
      const { data: collection } = await (supabase as any)
        .from('user_collection')
        .select('*, fragrance:fragrances(*)')
        .eq('is_wishlist', false)
        .neq('stock_level', 'empty')
        .order('personal_rating', { ascending: false })
        .limit(8);

      if (!collection?.length) return;

      const collectionContext = collection
        .map((item: CollectionItem) => {
          const f = item.fragrance as any;
          return `- ${f.house} ${f.name} | ${f.family} ${f.concentration}
  Top: ${f.notes_top?.join(', ')} | Heart: ${f.notes_heart?.join(', ')} | Base: ${f.notes_base?.join(', ')}
  Rating: ${item.personal_rating ?? 'unrated'}/5 | Worn: ${item.wear_count}x | Low stock: ${item.stock_level === 'low'}`;
        })
        .join('\n');

      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

      const result = await fetchDailySuggestion({
        weekday: today,
        mood: todayLog.mood,
        condition: weather?.condition ?? 'clear',
        tempC: weather?.temp_c ?? 20,
        humidity: weather?.humidity ?? 50,
        collectionLines: collectionContext,
      });

      set({ suggestion: result });

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
      set({ isLoadingSuggestion: false });
    }
  },

  // ── Confirm wearing ────────────────────────────────────────
  confirmWearing: async (fragranceId) => {
    const todayLog = get().todayLog;
    if (!todayLog) return;

    // Optimistic update
    set({ todayLog: { ...todayLog, worn_fragrance_id: fragranceId } });

    try {
      const { error } = await (supabase as any)
        .from('daily_log')
        .update({ worn_fragrance_id: fragranceId })
        .eq('id', todayLog.id);

      if (error) throw error;

      // Increment wear count via RPC
      await (supabase as any).rpc('increment_wear_count', { p_fragrance_id: fragranceId });
    } catch (err) {
      // Rollback
      set({ todayLog });
      console.error('confirmWearing error:', err);
    }
  },

  // ── Submit end-of-day rating ───────────────────────────────
  submitRating: async (rating) => {
    const todayLog = get().todayLog;
    if (!todayLog) return;

    set({ todayLog: { ...todayLog, wear_rating: rating } });

    try {
      const { error } = await (supabase as any)
        .from('daily_log')
        .update({ wear_rating: rating })
        .eq('id', todayLog.id);

      if (error) throw error;
    } catch (err) {
      set({ todayLog });
      console.error('submitRating error:', err);
    }
  },

  // ── Request another suggestion ─────────────────────────────
  requestAnother: async () => {
    set({ suggestion: null });
    await get().fetchSuggestion();
  },

  // ── Reset (called on sign out) ─────────────────────────────
  reset: () =>
    set({
      todayLog: null,
      weekLogs: [],
      suggestion: null,
      weather: null,
      lumiOpening: null,
      isLoadingSuggestion: false,
      isLoadingLog: false,
    }),
}));
