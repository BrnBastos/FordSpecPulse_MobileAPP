import { create } from "zustand";

type ComparisonState = {
  fordVersionId: string | null;
  competitorVersionId: string | null;
  selectedAttributeIds: string[];
  setFordVersionId: (id: string) => void;
  setCompetitorVersionId: (id: string) => void;
  toggleAttribute: (id: string) => void;
  reset: () => void;
};

export const useComparisonStore = create<ComparisonState>((set) => ({
  fordVersionId: null,
  competitorVersionId: null,
  selectedAttributeIds: [],

  setFordVersionId: (id) => set({ fordVersionId: id }),

  setCompetitorVersionId: (id) => set({ competitorVersionId: id }),

  toggleAttribute: (id) =>
    set((state) => ({
      selectedAttributeIds: state.selectedAttributeIds.includes(id)
        ? state.selectedAttributeIds.filter((item) => item !== id)
        : [...state.selectedAttributeIds, id],
    })),

  reset: () =>
    set({
      fordVersionId: null,
      competitorVersionId: null,
      selectedAttributeIds: [],
    }),
}));