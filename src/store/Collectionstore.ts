import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type CollectionItem, type Fragrance, type DNAProfile, type StockLevel } from '@/lib/supabase';

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

  // Pure setters (used by useCollection hook)
  setItems: (items: CollectionItem[], wishlist: CollectionItem[]) => void;
  setDNA: (dna: DNAProfile | null) => void;
  setSearchResults: (results: Fragrance[]) => void;
  setLoading: (loading: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  prependItem: (item: CollectionItem) => void;
  prependWishlist: (item: CollectionItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, patch: Partial<CollectionItem>) => void;
  moveWishlistToCollection: (id: string) => void;
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

      // ── Pure setters ───────────────────────────────────────────
      setItems: (items, wishlist) => set({ items, wishlist }),
      setDNA: (dna) => set({ dna }),
      setSearchResults: (searchResults) => set({ searchResults }),
      setLoading: (isLoading) => set({ isLoading }),
      setSyncing: (isSyncing) => set({ isSyncing }),

      prependItem: (item) => set({ items: [item, ...get().items] }),
      prependWishlist: (item) => set({ wishlist: [item, ...get().wishlist] }),

      removeItem: (id) =>
        set({
          items: get().items.filter((i) => i.id !== id),
          wishlist: get().wishlist.filter((i) => i.id !== id),
        }),

      updateItem: (id, patch) =>
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
          wishlist: get().wishlist.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        }),

      moveWishlistToCollection: (id) => {
        const item = get().wishlist.find((i) => i.id === id);
        if (!item) return;
        set({
          wishlist: get().wishlist.filter((i) => i.id !== id),
          items: [{ ...item, is_wishlist: false }, ...get().items],
        });
      },

      clearSearch: () => set({ searchResults: [] }),

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
      partialize: (state) => ({
        items: state.items,
        wishlist: state.wishlist,
        dna: state.dna,
      }),
    }
  )
);
