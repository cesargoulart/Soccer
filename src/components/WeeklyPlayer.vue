<template>
  <div>
    <!-- Debug info -->
    <div v-if="debugMode" class="debug">
      🔍 Debug: Today is Saturday? <strong>{{ isSaturday() ? 'Yes' : 'No' }}</strong> (Raw Day: {{ new Date().getDay() }})
      <br>
      🧪 Player Data: {{ player }}
    </div>

    <!-- Weekly Player Card -->
    <div v-if="isSaturday()" class="weekly-player">
      <h2>Weekly Player</h2>
      <div class="player-card">
        <div class="player-info">
          <h3>{{ player.name }}</h3>
          <p>Position: {{ player.position }}</p>
          <p>Rating: {{ player.rating }}</p>
        </div>
        <div class="player-actions">
          <button @click="acceptPlayer" class="btn accept">Accept</button>
          <button @click="rejectPlayer" class="btn reject">Reject</button>
        </div>
      </div>
    </div>

    <!-- Fallback Message -->
    <div v-else class="no-player">
      The Weekly Player feature is only available on Saturdays.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTransfersStore } from '@/stores/transfers'
import { generateRandomPlayer } from '@/utils/playerGenerator'
import { doc, collection } from 'firebase/firestore'
import { db } from '@/firebaseConfig'
import { getAuth } from 'firebase/auth'

// === DEBUG CONFIG ===
const debugMode = true // Set to false in production

// === STORE & AUTH ===
const transfersStore = useTransfersStore()
const currentUser = getAuth().currentUser
const userId = currentUser?.uid || 'demo-user'

// === DATE CHECK ===
function isSaturday() {
  const today = new Date()
  if (debugMode) {
    console.log('Checking if today is Saturday:', {
      day: today.getDay(),
      date: today.toDateString()
    })
  }
  return today.getDay() === 6
}

// === PLAYER GENERATION ===
const playerGenerator = { generatePlayer: generateRandomPlayer }

// Test player generation
const player = ref(generatePlayerWithFallback())

function generatePlayerWithFallback() {
  try {
    const newPlayer = playerGenerator.generatePlayer(userId, 12)

    if (!newPlayer || !newPlayer.name) {
      throw new Error('Invalid player data received')
    }

    if (debugMode) {
      console.log('✅ Successfully generated player:', newPlayer)
    }

    return newPlayer
  } catch (error) {
    console.warn('⚠️ Failed to generate player. Using fallback data:', error)

    // Return mock player for debugging
    return {
      name: 'John Doe',
      position: 'Forward',
      rating: 85,
      clubeId: 'teamA',
      number: 10
    }
  }
}

// === PLAYER ACTIONS ===
function acceptPlayer() {
  try {
    const transferId = doc(collection(db, 'transferList')).id

    const playerWithTeamAndPrice = {
      id: transferId,
      ...player.value,
      team: player.value.clubeId,
      price: (player.value.rating || 80) * 10000,
      number: player.value.number || 10
    }

    transfersStore.addPlayerForTransfer(playerWithTeamAndPrice)
    player.value = generatePlayerWithFallback()
  } catch (error) {
    console.error('❌ Accept player failed:', error)
  }
}

function rejectPlayer() {
  player.value = generatePlayerWithFallback()
}
</script>

<style scoped>
/* Original styles remain unchanged */
.weekly-player {
  background-color: #1a1a1a;
  border-radius: 10px;
  padding: 20px;
  margin: 20px;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.2);
  animation: fadeIn 1s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.player-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s ease;
}

.player-card:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
}

.player-info {
  text-align: center;
  margin-bottom: 15px;
}

.player-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.accept {
  background-color: #4caf50;
  color: white;
}

.accept:hover {
  background-color: #45a049;
}

.reject {
  background-color: #f44336;
  color: white;
}

.reject:hover {
  background-color: #e53935;
}

/* New debug styles */
.debug {
  background: #222;
  padding: 10px;
  margin: 10px;
  color: #0f0;
  font-size: 14px;
  border-radius: 5px;
}

.no-player {
  padding: 20px;
  color: #ccc;
  text-align: center;
  font-style: italic;
}
</style>
