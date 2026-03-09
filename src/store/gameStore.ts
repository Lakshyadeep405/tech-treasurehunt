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
  adminSignature: string | null;
  cheatWarnings: number;
  loginAttempts: number;
  lastAttemptTime: number | null;
  login: (teamData: { id: string; teamName: string; currentStation: number; startTime: number; totalHintsUsed: number; isFinished: boolean; cheatWarnings: number }) => void;
  adminLogin: () => void;
  logout: () => void;
  updateProgress: (station: number) => void;
  useHint: () => void;
  addPenalty: () => void;
  addCheatWarning: () => void;
  finishGame: () => void;
  recordLoginAttempt: () => void;
}

// Simple signature to prevent localStorage admin tampering
const ADMIN_SIGNATURE_KEY = 'clue-x-sig-2026';
function generateAdminSignature(): string {
  const base = `admin-${ADMIN_SIGNATURE_KEY}-${new Date().toDateString()}`;
  // Simple hash-like signature
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    const char = base.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `ax${Math.abs(hash).toString(36)}`;
}

export function verifyAdminSignature(sig: string | null): boolean {
  if (!sig) return false;
  return sig === generateAdminSignature();
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
      adminSignature: null,
      cheatWarnings: 0,
      loginAttempts: 0,
      lastAttemptTime: null,

      login: (teamData) => set({ 
        id: teamData.id, 
        teamName: teamData.teamName, 
        currentStation: teamData.currentStation,
        startTime: teamData.startTime,
        totalHintsUsed: teamData.totalHintsUsed,
        isFinished: teamData.isFinished,
        cheatWarnings: teamData.cheatWarnings,
        isAdmin: false,
        adminSignature: null
      }),
      
      adminLogin: () => set({
        isAdmin: true,
        adminSignature: generateAdminSignature(),
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
        adminSignature: null,
        cheatWarnings: 0,
        loginAttempts: 0,
        lastAttemptTime: null,
      }),

      updateProgress: (station) => set({ currentStation: station }),
      
      useHint: () => set((state) => ({ totalHintsUsed: state.totalHintsUsed + 1 })),
      
      addPenalty: () => set((state) => ({ totalHintsUsed: state.totalHintsUsed + 1 })),
      
      addCheatWarning: () => set((state) => ({ cheatWarnings: state.cheatWarnings + 1 })),
      
      finishGame: () => set({ isFinished: true }),

      recordLoginAttempt: () => set((state) => ({
        loginAttempts: state.loginAttempts + 1,
        lastAttemptTime: Date.now()
      }))
    }),
    {
      name: 'clue-code-storage',
    }
  )
);
