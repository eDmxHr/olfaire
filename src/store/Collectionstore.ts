import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  supabase,
  uploadBottleImage,
  type CollectionItem,
  type Fragrance,
  type DNAProfile,
  type StockLevel,
} from '@/lib/supabase';

// ── State & Actions interface ─────────────────────────────────────
interface CollectionState {
  // State
  items: CollectionItem[]; // owned bottles (is_wishlist = false)
  wishlist: CollectionItem[]; // wishlist bottles (is_wishlist = true)
  dna: DNAProfile | null;
  searchResults: Fragrance[];
  isLoading: boolean;
  isSyncing: boolean;

  // Computed selectors
  lowStockItems: () => CollectionItem[];
  getById: (id: string) => CollectionItem | undefined;
  getByFragrance: (fragranceId: number) => CollectionItem | undefined;

  // Fetch
  fetchCollection: () => Promise<void>;
  fetchDNA: () => Promise<void>;

  // Collection actions
  addBottle: (fragranceId: number, isWishlist?: boolean) => Promise<void>;
  removeBottle: (collectionId: string) => Promise<void>;
  updateStock: (collectionId: string, level: StockLevel) => Promise<void>;
  updateRating: (collectionId: string, rating: number) => Promise<void>;
  updateNotes: (collectionId: string, notes: string) => Promise<void>;
  moveToCollection: (collectionId: string) => Promise<void>;
  uploadImage: (collectionId: string, uri: string) => Promise<void>;

  // Search
  searchFragrances: (query: string) => Promise<void>;
  clearSearch: () => void;
  reset: () => void;
}

// ── Store ─────────────────────────────────────────────────────────
export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],
      dna: null,
      searchResults: [],
      isLoading: false,
      isSyncing: false,

      // ── Computed ───────────────────────────────────────────────
      lowStockItems: () =>
        get().items.filter((i) => i.stock_level === 'low' || i.stock_level === 'empty'),

      getById: (id) => [...get().items, ...get().wishlist].find((i) => i.id === id),

      getByFragrance: (fragranceId) => get().items.find((i) => i.fragrance_id === fragranceId),

      // ── Fetch ──────────────────────────────────────────────────
      fetchCollection: async () => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase
            .from('user_collection')
            .select('*, fragrance:fragrances(*)')
            .order('added_at', { ascending: false });

          if (error) throw error;
          if (data) {
            set({
              items: data.filter((i) => !i.is_wishlist),
              wishlist: data.filter((i) => i.is_wishlist),
            });
          }
        } catch (err) {
          console.error('fetchCollection error:', err);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchDNA: async () => {
        try {
          const { data, error } = await supabase.from('dna_profiles').select('*').single();

          if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
          if (data) set({ dna: data });
        } catch (err) {
          console.error('fetchDNA error:', err);
        }
      },

      // ── Add bottle ─────────────────────────────────────────────
      addBottle: async (fragranceId, isWishlist = false) => {
        set({ isSyncing: true });
        try {
          const { data, error } = await supabase
            .from('user_collection')
            .insert<{ fragrance_id: number; is_wishlist: boolean }>(
              { fragrance_id: fragranceId, is_wishlist: isWishlist }
            )
            .select('*, fragrance:fragrances(*)')
            .single();

          if (error) throw error;
          if (data) {
            if (isWishlist) {
              set({ wishlist: [data, ...get().wishlist] });
            } else {
              set({ items: [data, ...get().items] });
            }
          }
        } catch (err) {
          console.error('addBottle error:', err);
        } finally {
          set({ isSyncing: false });
        }
      },

      // ── Remove bottle ──────────────────────────────────────────
      removeBottle: async (collectionId) => {
        // Optimistic remove
        const prevItems = get().items;
        const prevWishlist = get().wishlist;
        set({
          items: get().items.filter((i) => i.id !== collectionId),
          wishlist: get().wishlist.filter((i) => i.id !== collectionId),
        });

        try {
          const { error } = await supabase.from('user_collection').delete().eq('id', collectionId);

          if (error) throw error;
        } catch (err) {
          // Rollback
          set({ items: prevItems, wishlist: prevWishlist });
          console.error('removeBottle error:', err);
        }
      },

      // ── Update stock ───────────────────────────────────────────
      updateStock: async (collectionId, level) => {
        const prev = get().items;
        // Optimistic update
        set({
          items: get().items.map((i) => (i.id === collectionId ? { ...i, stock_level: level } : i)),
        });

        try {
          const { error } = await supabase
            .from('user_collection')
            .update({ stock_level: level })
            .eq('id', collectionId);

          if (error) throw error;
        } catch (err) {
          set({ items: prev });
          console.error('updateStock error:', err);
        }
      },

      // ── Update rating ──────────────────────────────────────────
      updateRating: async (collectionId, rating) => {
        const prev = get().items;
        set({
          items: get().items.map((i) =>
            i.id === collectionId ? { ...i, personal_rating: rating } : i
          ),
        });

        try {
          const { error } = await supabase
            .from('user_collection')
            .update({ personal_rating: rating })
            .eq('id', collectionId);

          if (error) throw error;
        } catch (err) {
          set({ items: prev });
          console.error('updateRating error:', err);
        }
      },

      // ── Update notes ───────────────────────────────────────────
      updateNotes: async (collectionId, notes) => {
        const prev = get().items;
        set({
          items: get().items.map((i) => (i.id === collectionId ? { ...i, notes } : i)),
        });

        try {
          const { error } = await supabase
            .from('user_collection')
            .update({ notes })
            .eq('id', collectionId);

          if (error) throw error;
        } catch (err) {
          set({ items: prev });
          console.error('updateNotes error:', err);
        }
      },

      // ── Move wishlist → collection ─────────────────────────────
      moveToCollection: async (collectionId) => {
        const item = get().wishlist.find((i) => i.id === collectionId);
        if (!item) return;

        // Optimistic move
        set({
          wishlist: get().wishlist.filter((i) => i.id !== collectionId),
          items: [{ ...item, is_wishlist: false }, ...get().items],
        });

        try {
          const { error } = await supabase
            .from('user_collection')
            .update({ is_wishlist: false })
            .eq('id', collectionId);

          if (error) throw error;
        } catch (err) {
          // Rollback
          set({
            items: get().items.filter((i) => i.id !== collectionId),
            wishlist: [item, ...get().wishlist],
          });
          console.error('moveToCollection error:', err);
        }
      },

      // ── Upload bottle image ────────────────────────────────────
      uploadImage: async (collectionId, uri) => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) return;

          const url = await uploadBottleImage(user.id, collectionId, uri);
          if (!url) return;

          // Update local state + Supabase
          set({
            items: get().items.map((i) =>
              i.id === collectionId ? { ...i, custom_image_url: url } : i
            ),
          });

          await supabase
            .from('user_collection')
            .update({ custom_image_url: url })
            .eq('id', collectionId);
        } catch (err) {
          console.error('uploadImage error:', err);
        }
      },

      // ── Search fragrances catalogue ────────────────────────────
      searchFragrances: async (query) => {
        if (query.trim().length < 2) {
          set({ searchResults: [] });
          return;
        }

        try {
          const { data, error } = await supabase
            .from('fragrances')
            .select('*')
            .textSearch('search_vector', query.trim(), {
              type: 'websearch',
              config: 'english',
            })
            .limit(10);

          if (error) throw error;
          set({ searchResults: data ?? [] });
        } catch (err) {
          console.error('searchFragrances error:', err);
          set({ searchResults: [] });
        }
      },

      clearSearch: () => set({ searchResults: [] }),

      // ── Reset (called on sign out) ─────────────────────────────
      reset: () =>
        set({
          items: [],
          wishlist: [],
          dna: null,
          searchResults: [],
          isLoading: false,
          isSyncing: false,
        }),
    }),
    {
      name: 'olfaire-collection',
      storage: createJSONStorage(() => AsyncStorage),
      // Cache collection and DNA for offline access
      partialize: (state) => ({
        items: state.items,
        wishlist: state.wishlist,
        dna: state.dna,
      }),
    }
  )
);
