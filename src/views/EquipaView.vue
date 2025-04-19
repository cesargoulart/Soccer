<template>
  <div class="equipa-view">
    <h1 class="title">Equipa</h1>
    <div class="content-wrapper">
      <!-- Squad Section -->
      <div class="squad-section animate-slide-in">
        <h2>Plantel</h2>
        <table class="player-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Position</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="player in players"
              :key="player.id"
              @click="openPlayerModal(player)"
              class="clickable-row"
            >
              <td>{{ player.number }}</td>
              <td>{{ player.name }}</td>
              <td>{{ player.position }}</td>
              <td>{{ player.rating }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Staff Section (remains the same) -->
      <div class="staff-section animate-slide-in" style="animation-delay: 0.2s">
        <h2>Equipa Técnica</h2>
        <div class="staff-grid">
          <div class="staff-card">
            <h3>Treinador Principal</h3>
            <p>Nome do treinador</p>
          </div>
          <div class="staff-card">
            <h3>Treinador Adjunto</h3>
            <p>Nome do adjunto</p>
          </div>
        </div>
      </div>
    </div>
  </div>
<!-- Player Modal -->
<div v-if="selectedPlayer" class="modal-overlay" @click="closeModal">
  <div class="modal-content animate-modal" @click.stop>
    <h2>{{ selectedPlayer.name }}</h2>
    <div class="player-details">
      <p><strong>Number:</strong> {{ selectedPlayer.number }}</p>
      <p><strong>Position:</strong> {{ selectedPlayer.position }}</p>
      <p><strong>Rating:</strong> {{ selectedPlayer.rating }}</p>
    </div>
    <div class="modal-actions">
      <button class="btn-fire" @click="firePlayer">Fire Player</button>
      <button class="btn-sell" @click="sellPlayer">Sell Player</button>
    </div>
    <button class="btn-close" @click="closeModal">×</button>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useTransfersStore, type Player } from '../stores/transfers' // Import Player type
import { auth, db } from '../firebaseConfig' // Import auth and db
import { collection, query, getDocs } from 'firebase/firestore' // Import Firestore functions

const selectedPlayer = ref<Player | null>(null)
const players = ref<Player[]>([]) // Initialize players as an empty array
let authListener: () => void // To store the auth state change listener

const openPlayerModal = (player: Player) => {
  selectedPlayer.value = player
}

const closeModal = () => {
  selectedPlayer.value = null
}

const firePlayer = () => {
  if (selectedPlayer.value) {
    players.value = players.value.filter(p => p.id !== selectedPlayer.value!.id)
    closeModal()
  }
}

const transfersStore = useTransfersStore()

const sellPlayer = () => {
  if (selectedPlayer.value) {
    // Add player to transfer list
    transfersStore.addPlayerForTransfer(selectedPlayer.value)

    // Show success message with animation
    const message = document.createElement('div')
    message.textContent = 'Player listed for transfer successfully!'
    message.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
      padding: 15px 30px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 1001;
      animation: slideDown 0.3s ease forwards;
    `
    document.body.appendChild(message)

    // Remove the message after 3 seconds
    setTimeout(() => {
      message.style.animation = 'slideUp 0.3s ease forwards'
      setTimeout(() => document.body.removeChild(message), 300)
    }, 3000)

    closeModal()
  }
}

// Function to fetch players for the logged-in team
const fetchPlayers = async (teamId: string) => {
  console.log('Attempting to fetch players for teamId:', teamId);
  try {
    // Fetch players from the 'players' subcollection under the user's document
    const playersCollectionRef = collection(db, 'users', teamId, 'players')
    const q = query(playersCollectionRef)
    console.log('Firestore query created:', q);
    const querySnapshot = await getDocs(q)
    console.log('Query snapshot received:', querySnapshot);

    const fetchedPlayers: Player[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      console.log('Processing player document:', doc.id, data);
      // Explicitly map data to Player type, ensuring all properties exist
      // Note: 'number' and 'rating' were not generated in playerGenerator.ts,
      // so we'll use 'overall' for rating and assign a default number for now.
      if (data && typeof data.name === 'string' && typeof data.position === 'string' && typeof data.overall === 'number') {
        fetchedPlayers.push({
          id: doc.id,
          name: data.name,
          position: data.position,
          number: fetchedPlayers.length + 1, // Assign a sequential number for display
          rating: data.overall, // Use 'overall' from generated data
          team: teamId // Use the teamId (user UID)
        })
      } else {
        console.warn('Skipping player document with missing or incorrect data:', doc.id, data)
      }
    })
    console.log('Fetched players:', fetchedPlayers);
    players.value = fetchedPlayers
  } catch (error) {
    console.error('Error fetching players:', error)
    players.value = [] // Clear players on error
  }
}

// Listen for auth state changes
onMounted(() => {
  authListener = auth.onAuthStateChanged((user: import('firebase/auth').User | null) => {
    if (user) {
      // User is logged in, fetch players for their team
      // Assuming the team ID is the user's UID
      fetchPlayers(user.uid)
    } else {
      // User is logged out, clear players
      players.value = []
    }
  })
})

// Clean up the auth listener when the component is unmounted
onUnmounted(() => {
  if (authListener) {
    authListener()
  }
})
</script>

<style scoped>
.equipa-view {
  padding: 20px;
  color: #fff;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}

.title {
  font-size: 2.5em;
  margin-bottom: 30px;
  text-align: center;
  background: linear-gradient(45deg, #646cff, #a855f7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  opacity: 0;
  animation: fadeIn 0.5s ease forwards;
}

.content-wrapper {
  display: grid;
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.squad-section, .staff-section {
  background: rgba(45, 45, 45, 0.7);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0;
  transform: translateY(20px);
}

.animate-slide-in {
  animation: slideIn 0.6s ease forwards;
}

/* Remove .player-grid styles */
.staff-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Keep staff grid */
  gap: 20px;
  margin-top: 20px;
}

/* Remove .player-card styles */
.staff-card {
  padding: 20px;
  background: rgba(30, 30, 30, 0.5);
  border-radius: 10px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* Remove .player-card:hover */
.staff-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.player-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  color: #e0e0e0;
  animation: fadeIn 0.5s ease forwards 0.2s; /* Fade in table */
  opacity: 0;
}

.player-table th,
.player-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.player-table th {
  background-color: rgba(64, 76, 255, 0.2);
  color: #a8b4ff;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.9em;
}

.player-table tbody tr {
  transition: background-color 0.3s ease;
}

.player-table tbody tr.clickable-row {
  cursor: pointer;
}

.player-table tbody tr:hover {
  background-color: rgba(100, 108, 255, 0.1);
  transform: scale(1.01);
  transition: all 0.3s ease;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  padding: 30px;
  border-radius: 15px;
  min-width: 400px;
  position: relative;
  border: 1px solid rgba(100, 108, 255, 0.3);
  box-shadow: 0 0 30px rgba(100, 108, 255, 0.2);
}

.animate-modal {
  animation: modalSlideIn 0.3s ease forwards;
}

.player-details {
  margin: 20px 0;
  padding: 15px;
  background: rgba(45, 45, 45, 0.5);
  border-radius: 10px;
}

.player-details p {
  margin: 10px 0;
  color: #e0e0e0;
}

.player-details strong {
  color: #646cff;
  margin-right: 10px;
}

.modal-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.btn-fire, .btn-sell {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-fire {
  background: linear-gradient(135deg, #ff4646 0%, #ff7070 100%);
  color: white;
}

.btn-sell {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
}

.btn-fire:hover, .btn-sell:hover {
  transform: translateY(-2px);
  filter: brightness(110%);
}

.btn-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: #646cff;
  font-size: 24px;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: rgba(100, 108, 255, 0.1);
  transform: rotate(90deg);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.player-table td:first-child { /* Style player number */
  font-weight: bold;
  color: #646cff;
  text-align: center;
  width: 50px; /* Fixed width for number column */
}

h2 {
  font-size: 1.8em;
  margin-bottom: 20px;
  color: #646cff;
}

h3 {
  font-size: 1.2em;
  color: #a855f7;
  /* Staff card title */
  font-size: 1.2em;
  color: #a855f7;
  margin-bottom: 10px;
}

/* Remove styles for .player-header, .player-number, .player-details */

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@keyframes slideUp {
  from {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
}
</style>
