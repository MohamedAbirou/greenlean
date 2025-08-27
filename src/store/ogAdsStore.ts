import { create } from 'zustand';

interface OGAdsState {
  isLocked: boolean;
  setLocked: (locked: boolean) => void;
}

export const useOGAdsStore = create<OGAdsState>((set) => ({
  isLocked: true,
  setLocked: (locked) => set({ isLocked: locked }),
}));