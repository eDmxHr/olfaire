import Purchases from 'react-native-purchases';
import { supabase } from './supabase';
import { useAuthStore } from '@/store/authStore';

export async function syncPremiumStatus(): Promise<void> {
  try {
    const info = await Purchases.getCustomerInfo();
    const activeEntitlements = info.entitlements.active;
    const entitlement = activeEntitlements['Olfaire Pro'];
    const isPremium = !!entitlement;
    // expirationDate on the entitlement is sometimes null immediately after
    // sandbox purchase. latestExpirationDate on CustomerInfo is populated more reliably.
    const expiresAt = entitlement?.expirationDate ?? info.latestExpirationDate ?? null;

    const userId = useAuthStore.getState().profile?.id;
    if (!userId) return;

    // Only include premium_expires_at when the SDK provides a value — avoids
    // clobbering a webhook-written expiry when the SDK returns null right after purchase.
    const updatePayload: Record<string, unknown> = { is_premium: isPremium };
    if (expiresAt !== null) {
      updatePayload.premium_expires_at = expiresAt;
    } else if (!isPremium) {
      updatePayload.premium_expires_at = null;
    }

    const { error: updateError } = await (supabase.from('profiles') as any)
      .update(updatePayload)
      .eq('id', userId);
    if (updateError) throw updateError;

    const current = useAuthStore.getState().profile;
    if (current) {
      useAuthStore.getState().setProfile({
        ...current,
        is_premium: isPremium,
        premium_expires_at: expiresAt ?? current.premium_expires_at,
      });
    }
  } catch (err) {
    console.warn('syncPremiumStatus failed:', err);
  }
}
