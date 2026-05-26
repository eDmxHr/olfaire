import Purchases from 'react-native-purchases';
import { supabase } from './supabase';
import { useAuthStore } from '@/store/authStore';

export async function syncPremiumStatus(): Promise<void> {
  try {
    const info = await Purchases.getCustomerInfo();
    const activeEntitlements = info.entitlements.active;
    const entitlement = activeEntitlements['Olfaire Pro'];
    const isPremium = !!entitlement;
    const expiresAt = entitlement?.expirationDate ?? null;

    const userId = useAuthStore.getState().profile?.id;
    if (!userId) return;

    await (supabase.from('profiles') as any)
      .update({ is_premium: isPremium, premium_expires_at: expiresAt })
      .eq('id', userId);

    const current = useAuthStore.getState().profile;
    if (current) {
      useAuthStore.getState().setProfile({
        ...current,
        is_premium: isPremium,
        premium_expires_at: expiresAt,
      });
    }
  } catch (err) {
    console.warn('syncPremiumStatus failed:', err);
  }
}
