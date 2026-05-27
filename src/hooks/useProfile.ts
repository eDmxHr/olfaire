import { supabase, uploadAvatarImage, type Profile, type Theme, type SkinType, type Lifestyle } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

interface UseProfileReturn {
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  uploadAvatar: (uri: string) => Promise<void>;
  signOut: () => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
  setSkinType: (skin_type: SkinType) => Promise<void>;
  setLifestyle: (lifestyle: Lifestyle) => Promise<void>;
  setNotifications: (enabled: boolean, time?: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

export function useProfile(): UseProfileReturn {
  const setProfile = useAuthStore((s) => s.setProfile);
  const setLoading = useAuthStore((s) => s.setLoading);
  const profile = useAuthStore((s) => s.profile);
  const clearAll = useAuthStore((s) => s.clearAll);

  async function fetchProfile() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*').single();
      if (error) throw error;
      if (data) setProfile(data as Profile);
    } catch (err) {
      console.error('fetchProfile error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!profile) return;
    const prev = profile;
    setProfile({ ...profile, ...updates });
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);
      if (error) {
        setProfile(prev);
        console.error('updateProfile error:', error);
      }
    } catch (err) {
      setProfile(prev);
      console.error('updateProfile error:', err);
    }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('signOut error:', err);
    } finally {
      clearAll();
    }
  }

  const setTheme = (theme: Theme) => updateProfile({ theme });
  const setSkinType = (skin_type: SkinType) => updateProfile({ skin_type });
  const setLifestyle = (lifestyle: Lifestyle) => updateProfile({ lifestyle });

  function setNotifications(notification_enabled: boolean, notification_time?: string) {
    const updates: Partial<Profile> = { notification_enabled };
    if (notification_time) updates.notification_time = notification_time;
    return updateProfile(updates);
  }

  const completeOnboarding = () => updateProfile({ onboarding_completed: true });

  async function uploadAvatar(uri: string): Promise<void> {
    if (!profile) return;
    try {
      const publicUrl = await uploadAvatarImage(profile.id, uri);
      if (publicUrl) await updateProfile({ avatar_url: publicUrl });
    } catch (err) {
      console.error('uploadAvatar error:', err);
    }
  }

  return {
    fetchProfile,
    updateProfile,
    uploadAvatar,
    signOut,
    setTheme,
    setSkinType,
    setLifestyle,
    setNotifications,
    completeOnboarding,
  };
}
