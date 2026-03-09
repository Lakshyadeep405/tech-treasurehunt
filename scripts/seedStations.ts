import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';

// To run this script:
// 1. Place your Firebase service account key as 'serviceAccountKey.json' in project root
// 2. Run: npx tsx scripts/seedStations.ts

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
} catch (error) {
  console.error('\n[X] Error: serviceAccountKey.json not found.');
  console.error('Download it from Firebase Console → Project Settings → Service Accounts\n');
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// Hash function to protect answers
function hashAnswer(answer: string): string {
  return createHash('sha256')
    .update(answer.trim().toLowerCase())
    .digest('hex');
}

// Full Game Data — answers will be hashed before storing
const stationsData = [
  {
    stationNumber: 1,
    name: "Binary Decode",
    locationName: "Main Gate",
    question: {
      type: 'text',
      prompt: "Decode this binary to ASCII. The result is your next destination.",
      codeSnippet: "01001100 01001001 01000010 01010010 01000001 01010010 01011001",
    },
    answer: "LIBRARY",
    accessCode: "4821",
    locationHint: "Where silence speaks volumes and knowledge is stacked.",
    qrChallenge: {
      type: 'text',
      prompt: "Scan successful. Enter the lock code below to unlock the terminal.",
    },
    lockCode: "4821" 
  },
  {
    stationNumber: 2,
    name: "Debug the Code",
    locationName: "Library",
    question: {
      type: 'code',
      prompt: "Spot and fix the bug to find the system's location.",
      codeSnippet: "def get_next_place():\n    locaton = 'COMPUTER LAB'   # fix the bug\n    return locaton\n\nprint(get_next_place())"
    },
    answer: "COMPUTER LAB",
    accessCode: "3375",
    locationHint: "Arrays start at 0, but this room is full of 1s and 0s.",
    qrChallenge: {
      type: 'text',
      prompt: "Scan successful. Enter the lock code to bypass.",
    },
    lockCode: "3375"
  },
  {
    stationNumber: 3,
    name: "SQL Injection",
    locationName: "Computer Lab",
    question: {
      type: 'text',
      prompt: "What is the classic tautology string used for basic SQL injection bypass?",
      codeSnippet: "SELECT * FROM users WHERE username = 'admin' AND password = '' OR '1'='1';"
    },
    answer: "' OR '1'='1",
    accessCode: "9902",
    locationHint: "Find the place where athletes sweat, near the courts.",
    qrChallenge: {
      type: 'text',
      prompt: "System integrity compromised. Enter the override lock code.",
    },
    lockCode: "9902"
  },
  {
    stationNumber: 4,
    name: "IP Tracing",
    locationName: "Sports Complex",
    question: {
      type: 'text',
      prompt: "Identify the localhost loopback IP address (IPv4).",
      codeSnippet: "ping _____ -c 4"
    },
    answer: "127.0.0.1",
    accessCode: "5118",
    locationHint: "The campus hub where you refuel and grab a bite.",
    qrChallenge: {
      type: 'text',
      prompt: "Node reached. Awaiting lock sequence.",
    },
    lockCode: "5118"
  },
  {
    stationNumber: 5,
    name: "Hexadecimal Cipher",
    locationName: "Cafeteria",
    question: {
      type: 'text',
      prompt: "Convert this hex string to ASCII.",
      codeSnippet: "41 55 44 49 54 4f 52 49 55 4d"
    },
    answer: "AUDITORIUM",
    accessCode: "7740",
    locationHint: "The main hall where events are hosted and speeches are made.",
    qrChallenge: {
      type: 'text',
      prompt: "Authentication required to proceed to final stage.",
    },
    lockCode: "7740"
  },
  {
    stationNumber: 6,
    name: "Final Decryption",
    locationName: "Auditorium",
    question: {
      type: 'text',
      prompt: "What cryptography algorithm is commonly used for secure web traffic (HTTPS) handshakes?",
      codeSnippet: "Hint: It involves asymmetric keys."
    },
    answer: "RSA",
    accessCode: "0000",
    locationHint: "Victory. Awaiting final override command.",
    qrChallenge: {
      type: 'text',
      prompt: "Master node accessed. Input final lock code to complete mission.",
    },
    lockCode: "0000"
  }
];

async function seedDatabase() {
  console.log('Seeding Clue Code Stations (with hashed answers)...');
  const batch = db.batch();

  stationsData.forEach((station) => {
    const stationRef = db.collection('stations').doc(station.stationNumber.toString());
    
    // Hash the answer and lockCode before storing
    const securedStation = {
      ...station,
      answerHash: hashAnswer(station.answer),
      lockCodeHash: hashAnswer(station.lockCode),
    };
    
    // Remove plaintext answer from the stored document
    delete (securedStation as any).answer;

    batch.set(stationRef, securedStation);
    console.log(`  Station ${station.stationNumber}: answer "${station.answer}" → hash ${securedStation.answerHash.slice(0, 12)}...`);
  });

  try {
    await batch.commit();
    console.log('\n[✓] Successfully seeded 6 stations with hashed answers.');
  } catch (err) {
    console.error('[X] Error seeding database:', err);
  }
  
  process.exit(0);
}

seedDatabase();
