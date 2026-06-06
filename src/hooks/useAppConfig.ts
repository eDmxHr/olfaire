import { supabase } from '@/lib/supabase';
import { useConfigStore } from '@/store/configStore';

export async function fetchAppConfig(): Promise<void> {
  const { data } = await supabase.from('app_config').select('key, value');
  if (!data) return;
  const map = Object.fromEntries(data.map((r) => [r.key, r.value]));
  useConfigStore.getState().setFreeTier({
    collectionCap: parseInt(map['free_collection_cap'] ?? '10'),
    signatureLimit: parseInt(map['free_signature_limit'] ?? '1'),
    layeringPerDay: parseInt(map['free_layering_per_day'] ?? '3'),
    moodPerDay: parseInt(map['free_mood_per_day'] ?? '1'),
  });
}
