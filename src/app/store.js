import { INITIAL_VIEW_STATE } from '@/lib/enums';
import { create } from 'zustand';

export const useMapStore = create((set) => ({
  viewState: INITIAL_VIEW_STATE,
  setViewState: (viewState) => set({ viewState }),
}));
