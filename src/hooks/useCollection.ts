import { router } from 'expo-router';
import { supabase, getCurrentUserId, uploadBottleImage, type CollectionItem, type Fragrance, type StockLevel } from '@/lib/supabase';
import { useCollectionStore } from '@/store/Collectionstore';
import { fetchDNAInsight } from '@/lib/claudeApi';
import { useAuthStore } from '@/store/authStore';
import { useConfigStore } from '@/store/configStore';

interface UseCollectionReturn {
  fetchCollection: () => Promise<void>;
  fetchDNA: () => Promise<void>;
  computeAndSaveDNA: () => Promise<void>;
  addBottle: (fragranceId: number, isWishlist?: boolean) => Promise<void>;
  removeBottle: (collectionId: string) => Promise<void>;
  updateStock: (collectionId: string, level: StockLevel) => Promise<void>;
  updateRating: (collectionId: string, rating: number) => Promise<void>;
  updateNotes: (collectionId: string, notes: string) => Promise<void>;
  moveToCollection: (collectionId: string) => Promise<void>;
  uploadImage: (collectionId: string, uri: string) => Promise<void>;
  searchFragrances: (query: string) => Promise<void>;
  clearSearch: () => void;
}

export function useCollection(): UseCollectionReturn {
  const store = useCollectionStore();

  async function fetchCollection() {
    store.setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_collection')
        .select('*, fragrance:fragrances(*)')
        .order('added_at', { ascending: false });

      if (error) throw error;
      if (data) {
        const items = data as CollectionItem[];
        store.setItems(
          items.filter((i) => !i.is_wishlist),
          items.filter((i) => i.is_wishlist)
        );
      }
    } catch (err) {
      console.error('fetchCollection error:', err);
    } finally {
      store.setLoading(false);
    }
  }

  async function fetchDNA() {
    try {
      const { data, error } = await supabase.from('dna_profiles').select('*').single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) store.setDNA(data);
    } catch (err) {
      console.error('fetchDNA error:', err);
    }
  }

  async function computeAndSaveDNA() {
    const owned = store.items.filter((i) => !i.is_wishlist);
    if (owned.length === 0) return;

    // Tally family counts from each bottle's fragrance.family string
    const counts: Record<string, number> = {};
    for (const item of owned) {
      const family = (item.fragrance as any)?.family as string | undefined;
      if (family) counts[family] = (counts[family] ?? 0) + 1;
    }

    // Convert counts to 0–100 scores relative to the max count
    const maxCount = Math.max(...Object.values(counts));
    const families: Record<string, number> = {};
    for (const [family, count] of Object.entries(counts)) {
      families[family] = Math.round((count / maxCount) * 100);
    }

    const dominant_family =
      Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;

    const user_id = await getCurrentUserId();
    if (!user_id) return;

    const topFamilies = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([f]) => f);

    let lumi_insight: string | null = null;
    try {
      lumi_insight = await fetchDNAInsight({
        dominantFamily: dominant_family ?? topFamilies[0],
        topFamilies,
        bottleCount: owned.length,
      });
    } catch {
      // insight is optional — upsert proceeds without it
    }

    try {
      const { error } = await supabase.from('dna_profiles').upsert(
        { user_id, families, dominant_family, lumi_insight, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
      if (error) throw error;
      store.setDNA({ user_id, families, dominant_family, lumi_insight, updated_at: new Date().toISOString() });
    } catch (err) {
      console.error('computeAndSaveDNA error:', err);
    }
  }

  async function addBottle(fragranceId: number, isWishlist = false) {
    if (!isWishlist && !useAuthStore.getState().isPremium()) {
      const { collectionCap } = useConfigStore.getState().freeTier;
      if (store.items.length >= collectionCap) {
        router.push('/modals/premium-gate');
        return;
      }
    }

    store.setSyncing(true);
    try {
      const { data, error } = await supabase
        .from('user_collection')
        .insert({ fragrance_id: fragranceId, is_wishlist: isWishlist })
        .select('*, fragrance:fragrances(*)')
        .single();

      if (error) throw error;
      if (data) {
        const item = data as CollectionItem;
        if (isWishlist) {
          store.prependWishlist(item);
        } else {
          store.prependItem(item);
        }
      }
    } finally {
      store.setSyncing(false);
    }
  }

  async function removeBottle(collectionId: string) {
    const prevItems = store.items;
    const prevWishlist = store.wishlist;
    store.removeItem(collectionId);

    try {
      const { error } = await supabase.from('user_collection').delete().eq('id', collectionId);
      if (error) throw error;
    } catch (err) {
      store.setItems(prevItems, prevWishlist);
      console.error('removeBottle error:', err);
    }
  }

  async function updateStock(collectionId: string, level: StockLevel) {
    const prevItems = store.items;
    store.updateItem(collectionId, { stock_level: level });

    try {
      const { error } = await supabase
        .from('user_collection')
        .update({ stock_level: level })
        .eq('id', collectionId);
      if (error) throw error;
    } catch (err) {
      store.setItems(prevItems, store.wishlist);
      console.error('updateStock error:', err);
    }
  }

  async function updateRating(collectionId: string, rating: number) {
    const prevItems = store.items;
    store.updateItem(collectionId, { personal_rating: rating });

    try {
      const { error } = await supabase
        .from('user_collection')
        .update({ personal_rating: rating })
        .eq('id', collectionId);
      if (error) throw error;
    } catch (err) {
      store.setItems(prevItems, store.wishlist);
      console.error('updateRating error:', err);
    }
  }

  async function updateNotes(collectionId: string, notes: string) {
    const prevItems = store.items;
    store.updateItem(collectionId, { notes });

    try {
      const { error } = await supabase
        .from('user_collection')
        .update({ notes })
        .eq('id', collectionId);
      if (error) throw error;
    } catch (err) {
      store.setItems(prevItems, store.wishlist);
      console.error('updateNotes error:', err);
    }
  }

  async function moveToCollection(collectionId: string) {
    const item = store.wishlist.find((i) => i.id === collectionId);
    if (!item) return;

    store.moveWishlistToCollection(collectionId);

    try {
      const { error } = await supabase
        .from('user_collection')
        .update({ is_wishlist: false })
        .eq('id', collectionId);
      if (error) throw error;
    } catch (err) {
      // Rollback: remove from items, restore to wishlist
      store.removeItem(collectionId);
      store.prependWishlist(item);
      console.error('moveToCollection error:', err);
    }
  }

  async function uploadImage(collectionId: string, uri: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const url = await uploadBottleImage(user.id, collectionId, uri);
      if (!url) return;

      store.updateItem(collectionId, { custom_image_url: url });

      const { error } = await supabase
        .from('user_collection')
        .update({ custom_image_url: url })
        .eq('id', collectionId);
      if (error) throw error;
    } catch (err) {
      console.error('uploadImage error:', err);
    }
  }

  async function searchFragrances(query: string) {
    if (query.trim().length < 2) {
      store.clearSearch();
      return;
    }

    try {
      const { data, error } = await supabase
        .from('fragrances')
        .select('*')
        .textSearch('search_vector', query.trim(), { type: 'websearch' })
        .limit(10);

      if (error) throw error;
      store.setSearchResults((data ?? []) as Fragrance[]);
    } catch (err) {
      store.clearSearch();
    }
  }

  return {
    fetchCollection,
    fetchDNA,
    computeAndSaveDNA,
    addBottle,
    removeBottle,
    updateStock,
    updateRating,
    updateNotes,
    moveToCollection,
    uploadImage,
    searchFragrances,
    clearSearch: store.clearSearch,
  };
}
