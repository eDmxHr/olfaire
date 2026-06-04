import { create } from 'zustand';
import { type Session } from '@supabase/supabase-js';
import { type Profile } from '@/lib/supabase';

// ── State & Actions interface ─────────────────────────────────────
interface AuthState {
  // State
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;

  // Pure setters (used by useProfile hook)
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  clearAll: () => void;

  // Computed helpers
  isPremium: () => boolean;
  isDarkMode: () => boolean;
}

// ── Store ─────────────────────────────────────────────────────────
// No persistence — Supabase client owns session persistence via AsyncStorage.
// Profile is fetched fresh on every SIGNED_IN event.
export const useAuthStore = create<AuthState>()((set, get) => ({
  session: null,
  profile: null,
  isLoading: false,

  // ── Computed ───────────────────────────────────────────────
  isPremium: () => {
    const profile = get().profile;
    if (!profile?.is_premium) return false;
    if (!profile.premium_expires_at) return true;
    return new Date(profile.premium_expires_at) > new Date();
  },

  isDarkMode: () => {
    const theme = get().profile?.theme ?? 'light';
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    // 'system' — caller should use Appearance.getColorScheme()
    return false;
  },

  // ── Pure setters ───────────────────────────────────────────
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  clearAll: () => set({ session: null, profile: null, isLoading: false }),
}));
