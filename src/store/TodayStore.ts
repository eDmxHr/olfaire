import { create } from 'zustand';
import { supabase, type DailyLog, type Mood, type WearRating } from '@/lib/supabase';

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
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 60,
          system: `You are Lumi, a fragrance intelligence guide. Write one short morning greeting — 
                         the single line the user sees before selecting their mood. One sentence, 
                         maximum 15 words. No greeting words like "Good morning", "Hello", "Hi". 
                         Start with the day, weather, or something sensory. Return plain text only.`,
          messages: [
            {
              role: 'user',
              content: `Today: ${today}. Weather: ${weather?.condition ?? 'clear'}, ${weather?.temp_c ?? 20}°C.`,
            },
          ],
        }),
      });

      const data = await res.json();
      const line = data.content?.[0]?.text?.trim();
      if (line) set({ lumiOpening: line });
    } catch (err) {
      // Silent fail — fallback shown in UI
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

      const { data, error } = await supabase
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
      // Fetch user's collection for context
      const { data: collection } = await supabase
        .from('user_collection')
        .select('*, fragrance:fragrances(*)')
        .eq('is_wishlist', false)
        .neq('stock_level', 'empty')
        .order('personal_rating', { ascending: false })
        .limit(8);

      if (!collection?.length) return;

      // Build context for Lumi
      const collectionContext = collection
        .map((item) => {
          const f = item.fragrance as any;
          return `- ${f.house} ${f.name} | ${f.family} ${f.concentration}
  Top: ${f.notes_top?.join(', ')} | Heart: ${f.notes_heart?.join(', ')} | Base: ${f.notes_base?.join(', ')}
  Rating: ${item.personal_rating ?? 'unrated'}/5 | Worn: ${item.wear_count}x | Low stock: ${item.stock_level === 'low'}`;
        })
        .join('\n');

      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 200,
          system: `You are Lumi, a fragrance intelligence guide. Suggest exactly one perfume 
                         from the user's collection for today. Return JSON only, no preamble, 
                         no markdown backticks.`,
          messages: [
            {
              role: 'user',
              content: `TODAY: ${today} | Weather: ${weather?.condition ?? 'clear'}, ${weather?.temp_c ?? 20}°C, humidity ${weather?.humidity ?? 50}% | Mood: ${todayLog.mood}

COLLECTION:
${collectionContext}

Respond with exactly:
{
  "fragrance_id": <number>,
  "fragrance_house": "<house>",
  "fragrance_name": "<name>",
  "lumi_line": "<one sentence max 20 words>",
  "reasoning_tags": ["<tag1>", "<tag2>"]
}`,
            },
          ],
        }),
      });

      const apiData = await res.json();
      const text = apiData.content?.[0]?.text?.trim();
      if (!text) return;

      const parsed: Suggestion = JSON.parse(text);
      set({ suggestion: parsed });

      // Cache Lumi's line in the daily log
      await supabase
        .from('daily_log')
        .update({
          suggested_fragrance_id: parsed.fragrance_id,
          lumi_suggestion_text: parsed.lumi_line,
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
      const { error } = await supabase
        .from('daily_log')
        .update({ worn_fragrance_id: fragranceId })
        .eq('id', todayLog.id);

      if (error) throw error;

      // Increment wear count via RPC
      await supabase.rpc('increment_wear_count', { p_fragrance_id: fragranceId });
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
      const { error } = await supabase
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
