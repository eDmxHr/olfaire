import { useState } from 'react';
import type { CollectionItem } from '@/lib/supabase';

interface UseCollectionSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  isSearching: boolean;
  filtered: CollectionItem[];
  visible: CollectionItem[];
  hasMore: boolean;
  showAll: boolean;
  setShowAll: (v: boolean) => void;
}

export function useCollectionSearch(items: CollectionItem[], pageSize = 8): UseCollectionSearchReturn {
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const isSearching = query.trim().length > 0;

  const filtered = isSearching
    ? items.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.fragrance?.name?.toLowerCase().includes(q) ||
          item.fragrance?.house?.toLowerCase().includes(q)
        );
      })
    : items;

  const visible = isSearching || showAll ? filtered : filtered.slice(0, pageSize);
  const hasMore = !isSearching && !showAll && filtered.length > pageSize;

  return { query, setQuery, isSearching, filtered, visible, hasMore, showAll, setShowAll };
}
