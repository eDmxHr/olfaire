import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, type Profile, type Theme, type SkinType, type Lifestyle } from '@/lib/supabase';

// ── State & Actions interface ─────────────────────────────────────
interface AuthState {
  // State
  session: any | null;
  profile: Profile | null;
  isLoading: boolean;

  // Actions
  setSession: (session: any | null) => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
  setSkinType: (skinType: SkinType) => Promise<void>;
  setLifestyle: (lifestyle: Lifestyle) => Promise<void>;
  setNotifications: (enabled: boolean, time?: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  signOut: () => Promise<void>;
  clearAll: () => void;

  // Computed helpers
  isPremium: () => boolean;
  isDarkMode: () => boolean;
}

// ── Store ─────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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

      // ── Session ────────────────────────────────────────────────
      setSession: (session) => set({ session }),

      // ── Profile ────────────────────────────────────────────────
      fetchProfile: async () => {
        set({ isLoading: true });
        try {
          const { data, error } = await (supabase as any).from('profiles').select('*').single();

          if (error) throw error;
          if (data) set({ profile: data as Profile });
        } catch (err) {
          console.error('fetchProfile error:', err);
        } finally {
          set({ isLoading: false });
        }
      },

      updateProfile: async (updates) => {
        const current = get().profile;
        if (!current) return;

        set({ profile: { ...current, ...updates } });

        try {
          const { error } = await (supabase as any)
            .from('profiles')
            .update(updates)
            .eq('id', current.id);

          if (error) {
            set({ profile: current });
            console.error('updateProfile error:', error);
          }
        } catch (err) {
          set({ profile: current });
          console.error('updateProfile error:', err);
        }
      },

      // ── Settings shortcuts ─────────────────────────────────────
      setTheme: async (theme) => {
        await get().updateProfile({ theme });
      },

      setSkinType: async (skin_type) => {
        await get().updateProfile({ skin_type });
      },

      setLifestyle: async (lifestyle) => {
        await get().updateProfile({ lifestyle });
      },

      setNotifications: async (notification_enabled, notification_time) => {
        const updates: Partial<Profile> = { notification_enabled };
        if (notification_time) updates.notification_time = notification_time;
        await get().updateProfile(updates);
      },

      completeOnboarding: async () => {
        await get().updateProfile({ onboarding_completed: true });
      },

      // ── Auth ───────────────────────────────────────────────────
      signOut: async () => {
        try {
          await supabase.auth.signOut();
        } catch (err) {
          console.error('signOut error:', err);
        } finally {
          get().clearAll();
        }
      },

      clearAll: () => set({ session: null, profile: null, isLoading: false }),
    }),
    {
      name: 'olfaire-auth',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist session and profile — not loading state
      partialize: (state) => ({
        session: state.session,
        profile: state.profile,
      }),
    }
  )
);
