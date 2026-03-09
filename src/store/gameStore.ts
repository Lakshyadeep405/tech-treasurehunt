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
  login: (id: string, name: string) => void;
  adminLogin: () => void;
  logout: () => void;
  updateProgress: (station: number) => void;
  useHint: () => void;
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

      login: (id, name) => set({ 
        id, 
        teamName: name, 
        startTime: Date.now(),
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
        isAdmin: false
      }),

      updateProgress: (station) => set({ currentStation: station }),
      
      useHint: () => set((state) => ({ totalHintsUsed: state.totalHintsUsed + 1 })),
      
      finishGame: () => set({ isFinished: true })
    }),
    {
      name: 'clue-code-storage',
    }
  )
);
