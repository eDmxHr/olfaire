import { create } from 'zustand';
import { type DailyLog } from '@/lib/supabase';

// ── Types ─────────────────────────────────────────────────────────
export interface WeatherContext {
  condition: string;
  temp_c: number;
  humidity: number;
}

export interface Suggestion {
  fragrance_id: number;
  fragrance_house: string;
  fragrance_name: string;
  fragrance_image_url: string | null;
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

  // Pure setters (used by useToday hook)
  setTodayLog: (log: DailyLog | null) => void;
  setWeekLogs: (logs: DailyLog[]) => void;
  setSuggestion: (suggestion: Suggestion | null) => void;
  setWeather: (weather: WeatherContext | null) => void;
  setLumiOpening: (line: string | null) => void;
  setLoadingSuggestion: (loading: boolean) => void;
  setLoadingLog: (loading: boolean) => void;
  patchTodayLog: (patch: Partial<DailyLog>) => void;
  reset: () => void;
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

  // ── Pure setters ───────────────────────────────────────────
  setTodayLog: (todayLog) => set({ todayLog }),
  setWeekLogs: (weekLogs) => set({ weekLogs }),
  setSuggestion: (suggestion) => set({ suggestion }),
  setWeather: (weather) => set({ weather }),
  setLumiOpening: (lumiOpening) => set({ lumiOpening }),
  setLoadingSuggestion: (isLoadingSuggestion) => set({ isLoadingSuggestion }),
  setLoadingLog: (isLoadingLog) => set({ isLoadingLog }),

  patchTodayLog: (patch) => {
    const current = get().todayLog;
    if (current) set({ todayLog: { ...current, ...patch } });
  },

  // ── Reset ──────────────────────────────────────────────────
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
