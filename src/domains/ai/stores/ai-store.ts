import { create } from 'zustand';
import type { AIModel } from '../entities/ai-model';

interface AIState {
  models: AIModel[];
  currentModelId: string | null;
  totalCost: number;
  isProcessing: boolean;
  error: string | null;
}

interface AIActions {
  setModels: (models: AIModel[]) => void;
  setCurrentModel: (modelId: string | null) => void;
  setTotalCost: (cost: number) => void;
  setProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type AIStore = AIState & AIActions;

export const useAIStore = create<AIStore>((set) => ({
  models: [],
  currentModelId: null,
  totalCost: 0,
  isProcessing: false,
  error: null,
  setModels: (models) => set({ models }),
  setCurrentModel: (currentModelId) => set({ currentModelId }),
  setTotalCost: (totalCost) => set({ totalCost }),
  setProcessing: (isProcessing) => set({ isProcessing }),
  setError: (error) => set({ error }),
  reset: () =>
    set({ models: [], currentModelId: null, totalCost: 0, isProcessing: false, error: null }),
}));
