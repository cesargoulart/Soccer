import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Assuming firebaseConfig is in src/

interface Player {
  name: string;
  position: string;
  overall: number;
  rating: number;
  clubeId: string;
  number?: number;
}

// Function to generate a random player name (simple example)
function generateRandomName(): string {
  const firstNames = ['Gonçalo', 'João', 'Pedro', 'André', 'Miguel', 'Ricardo', 'Tiago', 'Bruno', 'Fábio', 'Rui'];
  const lastNames = ['Silva', 'Santos', 'Oliveira', 'Pereira', 'Rodrigues', 'Fernandes', 'Gonçalves', 'Martins', 'Costa', 'Gomes'];
  const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${randomFirstName} ${randomLastName}`;
}

// Function to generate a random player position
function generateRandomPosition(): string {
  const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
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

// Function to generate and save 11 players for a given team
export async function generateAndSavePlayers(userId: string): Promise<void> {
  // Save players in a subcollection under the user's document
  const playersCollectionRef = collection(db, 'users', userId, 'players');
  for (let i = 1; i <= 11; i++) {
    const player = generateRandomPlayer(userId, i);
    await addDoc(playersCollectionRef, player);
  }
}
