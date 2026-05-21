import { create } from 'zustand';
import { supabase, type CollectionItem, type Signature, type LayeringCache } from '@/lib/supabase';

// ── Types ─────────────────────────────────────────────────────────
interface NoteInteraction {
  note_a: string;
  note_b: string;
  type: 'anchor' | 'amplify' | 'contrast' | 'neutral';
  explanation: string;
}

interface ApplicationGuide {
  first: string;
  wait_seconds: number;
  second: string;
  ratio: string;
  placement_first: string;
  placement_second: string;
}

export interface LayeringAnalysis {
  compatibility_score: number;
  conflicts: boolean;
  severity: string | null;
  lumi_summary: string;
  lumi_warning: string | null;
  interactions: NoteInteraction[];
  application: ApplicationGuide;
  overall_character: string;
  reasons: string[];
  alternative_suggestion: {
    swap_bottle: string;
    suggested_name: string;
    suggested_house: string;
    reason: string;
  } | null;
}

// ── State & Actions interface ─────────────────────────────────────
interface LayeringState {
  // State
  selectedItems: CollectionItem[]; // max 3
  analysis: LayeringAnalysis | null;
  cacheId: string | null; // layering_cache.id for saving signatures
  signatures: Signature[];
  isAnalysing: boolean;
  isSaving: boolean;

  // Computed
  canAnalyse: () => boolean;
  hasConflict: () => boolean;

  // Selection
  selectBottle: (item: CollectionItem) => void;
  deselectBottle: (collectionId: string) => void;
  clearSelection: () => void;

  // Analysis
  analyse: () => Promise<void>;

  // Signatures
  fetchSignatures: () => Promise<void>;
  saveSignature: (name: string, tags: string[]) => Promise<void>;
  deleteSignature: (id: string) => Promise<void>;

  // Reset
  reset: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────

/** Build the note context string for a fragrance */
function buildFragranceContext(item: CollectionItem, label: string): string {
  const f = item.fragrance as any;
  if (!f) return '';
  return `${label}: ${f.house} ${f.name}
  Top: ${f.notes_top?.join(', ') ?? 'unknown'}
  Heart: ${f.notes_heart?.join(', ') ?? 'unknown'}
  Base: ${f.notes_base?.join(', ') ?? 'unknown'}
  Concentration: ${f.concentration ?? 'unknown'} | Family: ${f.family ?? 'unknown'}`;
}

/** Check layering_cache for an existing analysis of this pair */
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
  return { hit: true, data, cacheId: data.id };
}

/** Write a new analysis result to layering_cache */
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
  return data?.id ?? null;
}

// ── Store ─────────────────────────────────────────────────────────
export const useLayeringStore = create<LayeringState>()((set, get) => ({
  selectedItems: [],
  analysis: null,
  cacheId: null,
  signatures: [],
  isAnalysing: false,
  isSaving: false,

  // ── Computed ───────────────────────────────────────────────
  canAnalyse: () => get().selectedItems.length >= 2,
  hasConflict: () => !!get().analysis?.conflicts,

  // ── Selection ──────────────────────────────────────────────
  selectBottle: (item) => {
    const { selectedItems } = get();
    if (selectedItems.length >= 3) return;
    if (selectedItems.find((i) => i.id === item.id)) return;
    set({ selectedItems: [...selectedItems, item], analysis: null, cacheId: null });
  },

  deselectBottle: (collectionId) => {
    set({
      selectedItems: get().selectedItems.filter((i) => i.id !== collectionId),
      analysis: null,
      cacheId: null,
    });
  },

  clearSelection: () =>
    set({
      selectedItems: [],
      analysis: null,
      cacheId: null,
    }),

  // ── Analyse ────────────────────────────────────────────────
  analyse: async () => {
    const { selectedItems } = get();
    if (selectedItems.length < 2) return;

    set({ isAnalysing: true, analysis: null });

    try {
      const [itemA, itemB] = selectedItems;
      const fragA = itemA.fragrance as any;
      const fragB = itemB.fragrance as any;
      if (!fragA || !fragB) return;

      // 1. Check cache first
      const cached = await checkCache(fragA.id, fragB.id);
      if (cached.hit && cached.data) {
        set({
          analysis: cached.data.analysis_json as LayeringAnalysis,
          cacheId: cached.cacheId,
        });
        return;
      }

      // 2. Cache miss → call Claude
      const contextA = buildFragranceContext(itemA, 'BOTTLE A');
      const contextB = buildFragranceContext(itemB, 'BOTTLE B');

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are Lumi, a fragrance intelligence guide with deep knowledge of 
                         perfume chemistry. Analyse layering combinations with precision and 
                         poetry. Return JSON only, no preamble, no markdown backticks.`,
          messages: [
            {
              role: 'user',
              content: `Analyse the chemistry of layering these two perfumes and detect any conflicts.

${contextA}

${contextB}

Respond with exactly this JSON structure:
{
  "compatibility_score": <0-100>,
  "lumi_summary": "<1-2 sentences in your voice>",
  "conflicts": <true|false>,
  "severity": <"mild"|"moderate"|"strong"|null>,
  "lumi_warning": "<one sentence if conflicts, else null>",
  "reasons": ["<conflict reason 1>"],
  "interactions": [
    {
      "note_a": "<note>",
      "note_b": "<note>",
      "type": "<anchor|amplify|contrast|neutral>",
      "explanation": "<one sentence>"
    }
  ],
  "application": {
    "first": "<bottle name>",
    "wait_seconds": <30-120>,
    "second": "<bottle name>",
    "ratio": "<e.g. 2 sprays A, 1 spray B>",
    "placement_first": "<body placement>",
    "placement_second": "<body placement>"
  },
  "overall_character": "<4-6 words>",
  "alternative_suggestion": null
}`,
            },
          ],
        }),
      });

      const apiData = await res.json();
      const text = apiData.content?.[0]?.text?.trim();
      if (!text) return;

      const parsed: LayeringAnalysis = JSON.parse(text);
      set({ analysis: parsed });

      // 3. Write result to cache
      const newCacheId = await writeCache(fragA.id, fragB.id, parsed);
      if (newCacheId) set({ cacheId: newCacheId });
    } catch (err) {
      console.error('analyse error:', err);
    } finally {
      set({ isAnalysing: false });
    }
  },

  // ── Fetch signatures ───────────────────────────────────────
  fetchSignatures: async () => {
    try {
      const { data, error } = await supabase
        .from('signatures')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ signatures: data ?? [] });
    } catch (err) {
      console.error('fetchSignatures error:', err);
    }
  },

  // ── Save signature ─────────────────────────────────────────
  saveSignature: async (name, tags) => {
    const { cacheId, analysis } = get();
    if (!cacheId || !analysis) return;

    set({ isSaving: true });
    try {
      const { data, error } = await supabase
        .from('signatures')
        .insert({ layering_cache_id: cacheId, name, tags })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        set({ signatures: [data, ...get().signatures] });
      }
    } catch (err) {
      console.error('saveSignature error:', err);
    } finally {
      set({ isSaving: false });
    }
  },

  // ── Delete signature ───────────────────────────────────────
  deleteSignature: async (id) => {
    const prev = get().signatures;
    // Optimistic remove
    set({ signatures: get().signatures.filter((s) => s.id !== id) });

    try {
      const { error } = await supabase.from('signatures').delete().eq('id', id);

      if (error) throw error;
    } catch (err) {
      set({ signatures: prev });
      console.error('deleteSignature error:', err);
    }
  },

  // ── Reset (called on sign out) ─────────────────────────────
  reset: () =>
    set({
      selectedItems: [],
      analysis: null,
      cacheId: null,
      signatures: [],
      isAnalysing: false,
      isSaving: false,
    }),
}));
