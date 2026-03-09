import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TeamState {
  id: string | null;
  teamName: string | null;
  currentStation: number;
  startTime: number | null;
  totalHintsUsed: number;
  isFinished: boolean;
  isAdmin: boolean;
  cheatWarnings: number;
  login: (teamData: { id: string; teamName: string; currentStation: number; startTime: number; totalHintsUsed: number; isFinished: boolean; cheatWarnings: number }) => void;
  adminLogin: () => void;
  logout: () => void;
  updateProgress: (station: number) => void;
  useHint: () => void;
  addPenalty: () => void;
  addCheatWarning: () => void;
  finishGame: () => void;
}

export const useGameStore = create<TeamState>()(
  persist(
    (set) => ({
      id: null,
      teamName: null,
      currentStation: 1,
      startTime: null,
      totalHintsUsed: 0,
      isFinished: false,
      isAdmin: false,
      cheatWarnings: 0,

      login: (teamData) => set({ 
        id: teamData.id, 
        teamName: teamData.teamName, 
        currentStation: teamData.currentStation,
        startTime: teamData.startTime,
        totalHintsUsed: teamData.totalHintsUsed,
        isFinished: teamData.isFinished,
        cheatWarnings: teamData.cheatWarnings,
        isAdmin: false
      }),
      
      adminLogin: () => set({
        isAdmin: true,
        id: 'admin',
        teamName: 'Admin'
      }),

      logout: () => set({ 
        id: null, 
        teamName: null, 
        currentStation: 1, 
        startTime: null,
        totalHintsUsed: 0,
        isFinished: false,
        isAdmin: false,
        cheatWarnings: 0
      }),

      updateProgress: (station) => set({ currentStation: station }),
      
      useHint: () => set((state) => ({ totalHintsUsed: state.totalHintsUsed + 1 })),
      
      addPenalty: () => set((state) => ({ totalHintsUsed: state.totalHintsUsed + 1 })),
      
      addCheatWarning: () => set((state) => ({ cheatWarnings: state.cheatWarnings + 1 })),
      
      finishGame: () => set({ isFinished: true })
    }),
    {
      name: 'clue-code-storage',
    }
  )
);
