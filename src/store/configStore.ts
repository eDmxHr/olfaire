import { create } from 'zustand';

interface FreeTierLimits {
  collectionCap: number;
  signatureLimit: number;
  layeringPerDay: number;
}

interface ConfigState {
  freeTier: FreeTierLimits;
  setFreeTier: (limits: FreeTierLimits) => void;
}

export const useConfigStore = create<ConfigState>()((set) => ({
  freeTier: { collectionCap: 10, signatureLimit: 1, layeringPerDay: 3 },
  setFreeTier: (freeTier) => set({ freeTier }),
}));
