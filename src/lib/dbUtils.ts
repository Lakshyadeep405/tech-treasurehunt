import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  onSnapshot,
  increment
} from 'firebase/firestore';
import { db } from './firebase';
import type { StationData } from './mockData'; // For types

export interface TeamDoc {
  id: string; // The team code
  teamName: string;
  currentStation: number;
  startTime: number;
  endTime?: number | null;
  totalHintsUsed: number;
  cheatWarnings: number;
  status: 'playing' | 'finished';
}

/** 
 * Register a new team or login an existing one 
 */
export async function authenticateTeam(teamName: string, teamCode: string): Promise<TeamDoc | null> {
  if (!db) return null;
  
  const teamRef = doc(db, 'teams', teamCode.trim().toLowerCase());
  const snapshot = await getDoc(teamRef);

  if (snapshot.exists()) {
    // Login existing
    const data = snapshot.data() as TeamDoc;
    // Basic verification - ensuring name matches the code closely enough, 
    // or just trust the code for this college event if name doesn't match perfectly
    if (data.teamName.toLowerCase() === teamName.trim().toLowerCase()) {
      return data;
    } else {
      throw new Error("Team code exists but name does not match.");
    }
  } else {
    // Register new
    const newTeam: TeamDoc = {
      id: teamCode.trim().toLowerCase(),
      teamName: teamName.trim(),
      currentStation: 1,
      startTime: Date.now(),
      status: 'playing',
      totalHintsUsed: 0,
      cheatWarnings: 0
    };
    await setDoc(teamRef, newTeam);
    return newTeam;
  }
}

/**
 * Fetch a specific station's details from the database
 */
export async function getStation(stationNumber: number): Promise<StationData | null> {
  if (!db) return null;

  const stationRef = doc(db, 'stations', stationNumber.toString());
  const snap = await getDoc(stationRef);
  
  if (snap.exists()) {
    return snap.data() as StationData;
  }
  return null;
}

/**
 * Updates a team's progress when they unlock a station
 */
export async function updateTeamStation(teamCode: string, newStationNum: number, isFinished: boolean = false) {
  if (!db) return;
  const teamRef = doc(db, 'teams', teamCode.trim().toLowerCase());
  
  const updates: Partial<TeamDoc> = {
    currentStation: newStationNum
  };
  
  if (isFinished) {
    updates.status = 'finished';
    updates.endTime = Date.now();
  }
  
  await updateDoc(teamRef, updates);
}

/**
 * Adds a hint penalty to the team in Firestore
 */
export async function addTeamHintPenalty(teamCode: string) {
  if (!db) return;
  const teamRef = doc(db, 'teams', teamCode.trim().toLowerCase());
  await updateDoc(teamRef, {
    totalHintsUsed: increment(1)
  });
}

/**
 * Adds a cheat warning explicitly to a team
 */
export async function addTeamCheatWarning(teamCode: string) {
  if (!db) return;
  const teamRef = doc(db, 'teams', teamCode.trim().toLowerCase());
  await updateDoc(teamRef, {
    cheatWarnings: increment(1)
  });
}

/**
 * Subscribes to the live leaderboard (all teams sorted by progress)
 */
export function subscribeToLeaderboard(callback: (teams: TeamDoc[]) => void) {
  if (!db) return () => {};
  
  const teamsRef = collection(db, 'teams');
  // Order by station descending, then by hints/time. 
  // For simplicity, we just fetch all and let frontend sort precisely based on time + penalty
  const q = query(teamsRef); 
  
  return onSnapshot(q, (snapshot) => {
    const teams = snapshot.docs.map(doc => doc.data() as TeamDoc);
    callback(teams);
  });
}

/**
 * Subscribes to a single team's live updates (for anti-cheat tracking on the frontend if needed)
 */
export function subscribeToTeam(teamCode: string, callback: (team: TeamDoc) => void) {
  if (!db) return () => {};
  
  const teamRef = doc(db, 'teams', teamCode.trim().toLowerCase());
  return onSnapshot(teamRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as TeamDoc);
    }
  });
}
