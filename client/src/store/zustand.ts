import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Research {
  id: number;
  topic: string;
  report: string;
  createdAt: Date;
}
interface ResearchState {
  researches: Research[];
  setResearches: (researches: Research[]) => void;
  addResearch: (research: Research) => void;
  deleteResearch: (id: number) => void;
  qaReport:string;
  setQAReport:(report:string) => void
}

export const useResearchStore = create<ResearchState>()(
  persist(
    (set, get) => ({
      researches: [],
      qaReport:"",
      setResearches: (researches) => set({ researches }),
      setQAReport:(report) => set({qaReport:report}),
      deleteResearch: (id) => {
        set((state) => ({
          researches: state.researches.filter((r) => r.id !== id),
        }));
      },
      addResearch: (research) =>
        set((state) => ({ researches: [research, ...state.researches] })),
    }),
    {
      name: "research-store",
    },
  ),
);
