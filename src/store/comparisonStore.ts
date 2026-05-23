import { create } from "zustand";
import { ComparisonResult } from "../services/specpulseApi";

type ComparisonState = {
  fordVersionId: string | null;
  competitorVersionId: string | null;
  selectedAttributeIds: string[];
  currentComparison: ComparisonResult | null;
  setFordVersionId: (id: string) => void;
  setCompetitorVersionId: (id: string) => void;
  toggleAttribute: (id: string) => void;
  setCurrentComparison: (comparison: ComparisonResult) => void;
  reset: () => void;
};

export const useComparisonStore = create<ComparisonState>((set) => ({
  fordVersionId: null,
  competitorVersionId: null,
  selectedAttributeIds: [],
  currentComparison: null,

  setFordVersionId: (id) => set({ fordVersionId: id }),

  setCompetitorVersionId: (id) => set({ competitorVersionId: id }),

  toggleAttribute: (id) =>
    set((state) => ({
      selectedAttributeIds: state.selectedAttributeIds.includes(id)
        ? state.selectedAttributeIds.filter((item) => item !== id)
        : [...state.selectedAttributeIds, id],
    })),

  setCurrentComparison: (comparison) => set({ currentComparison: comparison }),

  reset: () =>
    set({
      fordVersionId: null,
      competitorVersionId: null,
      selectedAttributeIds: [],
      currentComparison: null,
    }),
}));
