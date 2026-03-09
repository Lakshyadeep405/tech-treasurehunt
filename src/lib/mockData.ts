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
  answer: string;
  accessCode: string;
  locationHint: string;
  qrChallenge: Question;
  lockCode: string;
}

export const MockStations: Record<number, StationData> = {
  1: {
    stationNumber: 1,
    name: "Binary Decode",
    locationName: "Main Gate",
    question: {
      type: 'text',
      prompt: "Decode this binary to ASCII. The result is your next destination.",
      codeSnippet: "01001100 01001001 01000010 01010010 01000001 01010010 01011001"
    },
    answer: "LIBRARY",
    accessCode: "4821",
    locationHint: "Where silence speaks volumes and knowledge is stacked.",
    qrChallenge: {
      type: 'text',
      prompt: "Scan successful. Proceed to next challenge step."
    },
    lockCode: "4821" 
  },
  2: {
    stationNumber: 2,
    name: "Debug the Code",
    locationName: "Library",
    question: {
      type: 'code',
      prompt: "Spot and fix the bug. What does the corrected code print?",
      codeSnippet: `def get_next_place():
    locaton = 'COMPUTER LAB'   # fix the bug
    return locaton

print(get_next_place())`
    },
    answer: "COMPUTER LAB",
    accessCode: "3375",
    locationHint: "Arrays start at 0, but this room is full of 1s and 0s.",
    qrChallenge: {
      type: 'text',
      prompt: "Scan successful. Enter lock code to proceed."
    },
    lockCode: "3375"
  },
  // Further stations to be filled in from seed
};
