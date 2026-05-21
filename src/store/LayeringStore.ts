import { create } from 'zustand';
import { type CollectionItem, type Signature } from '@/lib/supabase';

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
  cacheId: string | null;
  signatures: Signature[];
  isAnalysing: boolean;
  isSaving: boolean;

  // Computed
  canAnalyse: () => boolean;
  hasConflict: () => boolean;

  // Selection (pure)
  selectBottle: (item: CollectionItem) => void;
  deselectBottle: (collectionId: string) => void;
  clearSelection: () => void;

  // Pure setters (used by useLayering hook)
  setAnalysis: (analysis: LayeringAnalysis | null, cacheId: string | null) => void;
  setAnalysing: (analysing: boolean) => void;
  setSignatures: (signatures: Signature[]) => void;
  prependSignature: (signature: Signature) => void;
  removeSignature: (id: string) => void;
  setSaving: (saving: boolean) => void;

  // Reset
  reset: () => void;
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

  clearSelection: () => set({ selectedItems: [], analysis: null, cacheId: null }),

  // ── Pure setters ───────────────────────────────────────────
  setAnalysis: (analysis, cacheId) => set({ analysis, cacheId }),
  setAnalysing: (isAnalysing) => set({ isAnalysing }),
  setSignatures: (signatures) => set({ signatures }),
  prependSignature: (signature) => set({ signatures: [signature, ...get().signatures] }),
  removeSignature: (id) => set({ signatures: get().signatures.filter((s) => s.id !== id) }),
  setSaving: (isSaving) => set({ isSaving }),

  // ── Reset ──────────────────────────────────────────────────
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
