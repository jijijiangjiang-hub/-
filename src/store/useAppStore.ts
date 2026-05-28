import { create } from 'zustand';

export type AppPhase = 'loading' | 'vortex' | 'reveal' | 'main';

interface AppState {
  phase: AppPhase;
  setPhase: (phase: AppPhase) => void;
}

export const useAppStore = create<AppState>((set) => ({
  phase: 'loading',
  setPhase: (phase) => set({ phase }),
}));
