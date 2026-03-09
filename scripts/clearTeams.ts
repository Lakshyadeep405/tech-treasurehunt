import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function clearTeams() {
  const snapshot = await db.collection('teams').get();
  if (snapshot.empty) {
    console.log('No teams to delete.');
    return;
  }
  for (const doc of snapshot.docs) {
    console.log(`Deleting team: ${doc.id} (${doc.data().teamName})`);
    await doc.ref.delete();
  }
  console.log(`✅ Deleted ${snapshot.size} teams.`);
}

clearTeams();
