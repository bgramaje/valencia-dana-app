import { INITIAL_VIEW_STATE } from '@/lib/enums';
import { isEqual } from 'lodash';
import { create } from 'zustand';

export const useMapStore = create((set) => ({
  globalViewState: INITIAL_VIEW_STATE,
  setGlobalViewState: (newViewState) => set((state) => {
    if (isEqual(state.globalViewState, newViewState)) {
      return state;
    }
    return { globalViewState: { ...state.globalViewState, ...newViewState } };
  }),
}));
