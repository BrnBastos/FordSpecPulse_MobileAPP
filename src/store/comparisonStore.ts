import { create } from "zustand";
import { ComparisonResult } from "../services/specpulseApi";

type ComparisonState = {
  fordVersionId: string | null;
  competitorVersionId: string | null;
  selectedAttributeIds: string[];
  requestedAttributes: string[];
  setRequestedAttributes: (terms: string[]) => void;
  currentComparison: ComparisonResult | null;
  setFordVersionId: (id: string | null) => void;
  setCompetitorVersionId: (id: string | null) => void;
  toggleAttribute: (id: string) => void;
  setCurrentComparison: (comparison: ComparisonResult) => void;
  reset: () => void;
};

export const useComparisonStore = create<ComparisonState>((set) => ({
  fordVersionId: null,
  competitorVersionId: null,
  selectedAttributeIds: [],
  requestedAttributes: [],
  currentComparison: null,

  setFordVersionId: (id) => set({ fordVersionId: id, currentComparison: null }),

  setCompetitorVersionId: (id) =>
    set({ competitorVersionId: id, currentComparison: null }),

  setRequestedAttributes: (terms) =>
    set({ requestedAttributes: terms, currentComparison: null }),

  toggleAttribute: (id) =>
    set((state) => ({
      currentComparison: null,
      selectedAttributeIds: state.selectedAttributeIds.includes(id)
        ? state.selectedAttributeIds.filter((item) => item !== id)
        : state.selectedAttributeIds.length + state.requestedAttributes.length <
            50
          ? [...state.selectedAttributeIds, id]
          : state.selectedAttributeIds,
    })),

  setCurrentComparison: (comparison) => set({ currentComparison: comparison }),

  reset: () =>
    set({
      fordVersionId: null,
      competitorVersionId: null,
      selectedAttributeIds: [],
      requestedAttributes: [],
      currentComparison: null,
    }),
}));
