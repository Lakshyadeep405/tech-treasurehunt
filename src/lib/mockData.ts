export interface Question {
  type: 'text' | 'code' | 'mcq' | 'image';
  prompt: string;
  codeSnippet?: string;
  options?: string[];
}

export interface StationData {
  stationNumber: number;
  name: string;
  locationName: string;
  question: Question;
  answerHash: string;        // SHA-256 hash of the answer (plaintext never sent to client)
  answer?: string;           // Only exists in admin context, NOT sent from Firestore
  accessCode: string;
  locationHint: string;
  qrChallenge: Question;
  lockCode: string;
  lockCodeHash?: string;     // SHA-256 hash of lock code
}

// Mock data stripped of answers for type reference only
export const MockStations: Record<number, Partial<StationData>> = {};
