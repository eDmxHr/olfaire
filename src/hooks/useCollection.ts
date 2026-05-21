import { supabase, uploadBottleImage, type CollectionItem, type StockLevel } from '@/lib/supabase';
import { useCollectionStore } from '@/store/Collectionstore';

export function useCollection() {
  const store = useCollectionStore();

  async function fetchCollection() {
    store.setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('user_collection')
        .select('*, fragrance:fragrances(*)')
        .order('added_at', { ascending: false });

      if (error) throw error;
      if (data) {
        store.setItems(
          data.filter((i: CollectionItem) => !i.is_wishlist),
          data.filter((i: CollectionItem) => i.is_wishlist)
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

  async function addBottle(fragranceId: number, isWishlist = false) {
    store.setSyncing(true);
    try {
      const { data, error } = await (supabase as any)
        .from('user_collection')
        .insert({ fragrance_id: fragranceId, is_wishlist: isWishlist })
        .select('*, fragrance:fragrances(*)')
        .single();

      if (error) throw error;
      if (data) {
        if (isWishlist) {
          store.prependWishlist(data);
        } else {
          store.prependItem(data);
        }
      }
    } catch (err) {
      console.error('addBottle error:', err);
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
      const { error } = await (supabase as any)
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
      const { error } = await (supabase as any)
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
      const { error } = await (supabase as any)
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
      const { error } = await (supabase as any)
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

      await (supabase as any)
        .from('user_collection')
        .update({ custom_image_url: url })
        .eq('id', collectionId);
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
        .textSearch('search_vector', query.trim(), { type: 'websearch', config: 'english' })
        .limit(10);

      if (error) throw error;
      store.setSearchResults(data ?? []);
    } catch (err) {
      console.error('searchFragrances error:', err);
      store.clearSearch();
    }
  }

  return {
    fetchCollection,
    fetchDNA,
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
