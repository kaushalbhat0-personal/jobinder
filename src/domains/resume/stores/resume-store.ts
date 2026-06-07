import { create } from 'zustand';
import type { Resume, ResumeStatus } from '../entities/resume';
import type { ResumeAnalysis } from '../entities/resume-analysis';

interface ResumeState {
  resume: Resume | null;
  analysis: ResumeAnalysis | null;
  versions: number[];
  isLoading: boolean;
  error: string | null;
}

interface ResumeActions {
  setResume: (resume: Resume | null) => void;
  setAnalysis: (analysis: ResumeAnalysis | null) => void;
  setStatus: (status: ResumeStatus) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type ResumeStore = ResumeState & ResumeActions;

export const useResumeStore = create<ResumeStore>((set) => ({
  resume: null,
  analysis: null,
  versions: [],
  isLoading: false,
  error: null,
  setResume: (resume) => set({ resume }),
  setAnalysis: (analysis) => set({ analysis }),
  setStatus: (status) =>
    set((s) => (s.resume ? { resume: { ...s.resume, status } as Resume } : {})),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ resume: null, analysis: null, versions: [], isLoading: false, error: null }),
}));
