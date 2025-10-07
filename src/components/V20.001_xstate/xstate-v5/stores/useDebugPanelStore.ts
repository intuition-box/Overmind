// xstate-v5/stores/useDebugPanelStore.ts
import { create } from 'zustand';

type TabType = 'animations' | 'rendering' | 'materials' | 'performance';

interface DebugPanelState {
  isOpen: boolean;
  activeTab: TabType;
  fps: number;
  bones: number;
  animations: number;

  // Actions
  toggle: () => void;
  open: () => void;
  close: () => void;
  setActiveTab: (tab: TabType) => void;
  updateFPS: (fps: number) => void;
  updateBones: (bones: number) => void;
  updateAnimations: (animations: number) => void;
  reset: () => void;
}

const initialState = {
  isOpen: false,
  activeTab: 'animations' as TabType,
  fps: 0,
  bones: 0,
  animations: 0
};

export const useDebugPanelStore = create<DebugPanelState>((set) => ({
  ...initialState,

  toggle: () => set((state) => ({ isOpen: !state.isOpen })),

  open: () => set({ isOpen: true }),

  close: () => set({ isOpen: false }),

  setActiveTab: (tab: TabType) => set({ activeTab: tab }),

  updateFPS: (fps: number) => set({ fps }),

  updateBones: (bones: number) => set({ bones }),

  updateAnimations: (animations: number) => set({ animations }),

  reset: () => set(initialState)
}));
