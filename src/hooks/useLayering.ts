import { supabase, type LayeringCache } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { fetchLayeringAnalysis } from '@/lib/claudeApi';
import { useLayeringStore, type LayeringAnalysis } from '@/store/LayeringStore';

interface UseLayeringReturn {
  analyse: () => Promise<void>;
  fetchSignatures: () => Promise<void>;
  saveSignature: (name: string, tags: string[]) => Promise<string | null>;
  deleteSignature: (id: string) => Promise<void>;
}

// ── Cache helpers ─────────────────────────────────────────────────

async function checkCache(
  idA: number,
  idB: number
): Promise<{ hit: boolean; data: LayeringCache | null; cacheId: string | null }> {
  const least = Math.min(idA, idB);
  const greatest = Math.max(idA, idB);

  const { data, error } = await supabase
    .from('layering_cache')
    .select('*')
    .eq('fragrance_a_id', least)
    .eq('fragrance_b_id', greatest)
    .maybeSingle();

  if (error || !data) return { hit: false, data: null, cacheId: null };
  return { hit: true, data: data as LayeringCache, cacheId: (data as LayeringCache).id };
}

async function writeCache(
  idA: number,
  idB: number,
  analysis: LayeringAnalysis
): Promise<string | null> {
  const least = Math.min(idA, idB);
  const greatest = Math.max(idA, idB);

  const { data, error } = await supabase
    .from('layering_cache')
    .insert({
      fragrance_a_id: least,
      fragrance_b_id: greatest,
      compatibility_score: analysis.compatibility_score,
      conflicts: analysis.conflicts,
      severity: analysis.severity,
      analysis_json: analysis as any,
      overall_character: analysis.overall_character,
    })
    .select('id')
    .single();

  if (error) {
    console.error('writeCache error:', error);
    return null;
  }
  return (data as { id: string })?.id ?? null;
}

// ── Hook ──────────────────────────────────────────────────────────

export function useLayering(): UseLayeringReturn {
  const store = useLayeringStore();
  const profile = useAuthStore((s) => s.profile);

  async function analyse() {
    const { selectedItems } = store;
    if (selectedItems.length < 2) return;

    store.setAnalysing(true);
    store.setAnalysis(null, null);

    try {
      const [itemA, itemB] = selectedItems;
      const fragA = itemA.fragrance as any;
      const fragB = itemB.fragrance as any;
      if (!fragA || !fragB) return;

      const cached = await checkCache(fragA.id, fragB.id);
      if (cached.hit && cached.data) {
        store.setAnalysis(cached.data.analysis_json as LayeringAnalysis, cached.cacheId);
        return;
      }

      const result = await fetchLayeringAnalysis({
        bottleA: {
          house: fragA.house,
          name: fragA.name,
          concentration: fragA.concentration ?? '',
          family: fragA.family ?? '',
          notes_top: fragA.notes_top ?? [],
          notes_heart: fragA.notes_heart ?? [],
          notes_base: fragA.notes_base ?? [],
        },
        bottleB: {
          house: fragB.house,
          name: fragB.name,
          concentration: fragB.concentration ?? '',
          family: fragB.family ?? '',
          notes_top: fragB.notes_top ?? [],
          notes_heart: fragB.notes_heart ?? [],
          notes_base: fragB.notes_base ?? [],
        },
      });

      store.setAnalysis(result as LayeringAnalysis, null);

      const newCacheId = await writeCache(fragA.id, fragB.id, result as LayeringAnalysis);
      if (newCacheId) store.setAnalysis(result as LayeringAnalysis, newCacheId);
    } catch (err) {
      console.error('analyse error:', err);
    } finally {
      store.setAnalysing(false);
    }
  }

  async function fetchSignatures() {
    try {
      const { data, error } = await supabase
        .from('signatures')
        .select(`*, layering_cache:layering_cache_id(fragrance_a:fragrance_a_id(name), fragrance_b:fragrance_b_id(name))`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = (data ?? []).map((row: any) => ({
        ...row,
        fragrance_a_name: row.layering_cache?.fragrance_a?.name ?? null,
        fragrance_b_name: row.layering_cache?.fragrance_b?.name ?? null,
        layering_cache: undefined,
      }));
      store.setSignatures(mapped);
    } catch (err) {
      console.error('fetchSignatures error:', err);
    }
  }

  async function saveSignature(name: string, tags: string[]): Promise<string | null> {
    const { cacheId, analysis } = store;
    if (!cacheId || !analysis || !profile) return null;

    store.setSaving(true);
    try {
      const { data, error } = await supabase
        .from('signatures')
        .insert({ layering_cache_id: cacheId, name, tags, user_id: profile.id })
        .select()
        .single();

      if (error) throw error;
      if (data) store.prependSignature(data);
      return (data as { id: string })?.id ?? null;
    } catch (err) {
      console.error('saveSignature error:', err);
      return null;
    } finally {
      store.setSaving(false);
    }
  }

  async function deleteSignature(id: string) {
    const prev = store.signatures;
    store.removeSignature(id);

    try {
      const { error } = await supabase.from('signatures').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      store.setSignatures(prev);
      console.error('deleteSignature error:', err);
    }
  }

  return {
    analyse,
    fetchSignatures,
    saveSignature,
    deleteSignature,
  };
}
