import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Assuming firebaseConfig is in src/

export interface Player { // Add export here
  name: string;
  position: string;
  overall: number;
  rating: number;
  clubeId: string;
  number?: number;
}

const firstNames = ['Hugo', 'Ricardo', 'Pedro', 'Rui', 'Paulo', 'Helio'];
const lastNames  = ['Sousa', 'Goulart', 'Castro', 'Caetano', 'Silva', 'Medeiros'];

function allNameCombinations(): string[] {
  const names: string[] = [];
  for (const first of firstNames) {
    for (const last of lastNames) {
      names.push(`${first} ${last}`);
    }
  }
  return names;
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateRandomName(): string {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last  = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${last}`;
}

// Function to generate a random player position
function generateRandomPosition(): string {
  const positions = ['Goleiro', 'Defensor', 'Meio-campo', 'Atacante'];
  return positions[Math.floor(Math.random() * positions.length)];
}

// Function to generate a random player overall rating (e.g., 50-90)
function generateRandomOverall(): number {
  return Math.floor(Math.random() * (90 - 50 + 1)) + 50;
}

// Function to generate a single random player
export function generateRandomPlayer(userId: string, playerNumber: number): Player {
  const overall = generateRandomOverall();
  return {
    name: generateRandomName(),
    position: generateRandomPosition(),
    overall: overall,
    rating: overall, // Use the same value for rating as overall
    clubeId: userId,
    number: playerNumber // Assign sequential number
  };
}

// Migrate existing players to use the new name pool (no duplicates per user)
export async function migratePlayerNames(): Promise<void> {
  const usersSnap = await getDocs(collection(db, 'users'));
  for (const userDoc of usersSnap.docs) {
    const playersSnap = await getDocs(collection(db, 'users', userDoc.id, 'players'));
    if (playersSnap.empty) continue;
    const names = shuffle(allNameCombinations()).slice(0, playersSnap.size);
    let i = 0;
    for (const playerDoc of playersSnap.docs) {
      await updateDoc(doc(db, 'users', userDoc.id, 'players', playerDoc.id), { name: names[i++] });
    }
  }
}

// Function to generate and save 11 players for a given team (no duplicate names)
export async function generateAndSavePlayers(userId: string): Promise<void> {
  const playersCollectionRef = collection(db, 'users', userId, 'players');
  const names = shuffle(allNameCombinations()).slice(0, 11);
  for (let i = 0; i < names.length; i++) {
    const overall = generateRandomOverall();
    const player: Player = {
      name: names[i],
      position: generateRandomPosition(),
      overall,
      rating: overall,
      clubeId: userId,
      number: i + 1,
    };
    await addDoc(playersCollectionRef, player);
  }
}
