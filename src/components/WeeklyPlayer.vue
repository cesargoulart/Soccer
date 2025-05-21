<template>
  <div>
    <!-- Debug info -->
    <!-- <div v-if="debugMode" class="debug">
      🔍 Debug: Today is Saturday? <strong>{{ isSaturday() ? 'Yes' : 'No' }}</strong> | Action Taken? <strong>{{ actionTakenThisWeek ? 'Yes' : 'No' }}</strong> | Loading? <strong>{{ isLoading ? 'Yes' : 'No' }}</strong>
      <br>
      🧪 Player Data: {{ player || 'N/A' }}
    </div> -->

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="loading-indicator">Checking for weekly player...</div>

    <!-- Weekly Player Card -->
    <div v-else-if="showPlayerCard" class="weekly-player">
      <h2>Jogador Jovem da Semana</h2>
      <div class="player-card"> <!-- No v-if needed here, showPlayerCard handles it -->
        <div class="player-info">
          <h3>{{ player?.name }}</h3>
          <p>Posição: {{ player?.position }}</p>
          <p>Potencial: {{ player?.rating }}</p>
          <p class="warning">⚠️ Você só pode aceitar um jogador por semana!</p>
        </div>
        <div class="player-actions">
          <button @click="acceptPlayer" class="btn accept" :disabled="isLoading">Aceitar Jogador</button>
          <button @click="rejectPlayer" class="btn reject" :disabled="isLoading">Rejeitar Jogador</button>
        </div>
      </div>
    </div>

    <!-- Fallback Message -->
    <div v-else-if="showFallbackMessage" class="no-player"> <!-- Use v-else-if -->
      {{ fallbackText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watchEffect } from 'vue'
// import { useTransfersStore } from '@/stores/transfers' // No longer needed for transfers
import { generateRandomPlayer, type Player } from '@/utils/playerGenerator' // Import Player type
import { collection, addDoc } from 'firebase/firestore' // Import addDoc
import { db } from '@/firebaseConfig'
import { getAuth } from 'firebase/auth'

// === DEBUG CONFIG ===
const debugMode = true // Set to false in production

// === STORE & AUTH ===
// const transfersStore = useTransfersStore() // No longer needed
const currentUser = getAuth().currentUser
const userId = currentUser?.uid // Get the actual user ID, handle null case later

// === STATE ===
const player = ref<Player | null>(null) // Initialize player as null
const actionTakenThisWeek = ref(false) // Track if action was taken
const isLoading = ref(true) // Track initial loading/checking state

// === DATE & PERSISTENCE HELPERS ===
function getCurrentSaturdayDateString(): string {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday, 6 = Saturday
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -1 : 6) // Adjust to get current week's Saturday
  const saturdayDate = new Date(today.setDate(diff))
  return saturdayDate.toISOString().split('T')[0] // Format as YYYY-MM-DD
}

const storageKey = `weeklyPlayerActionTaken_${userId}` // User-specific storage key

// === DATE CHECK ===
function isSaturday(): boolean {
  const today = new Date()
  if (debugMode) {
    console.log('Checking if today is Saturday:', {
      day: today.getDay(),
      date: today.toDateString()
    })
  }
  return today.getDay() === 6
}

// === PLAYER GENERATION (Conditional) ===
const playerGenerator = { generatePlayer: generateRandomPlayer }

function generatePlayerWithFallback(): Player | null {
  if (!userId) {
    console.warn('⚠️ Cannot generate player: User not logged in.')
    return null // Or return a default placeholder if needed
  }
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
    console.error('❌ Failed to generate player:', error)
    // Return null or a specific error indicator if generation fails
    return null
  }
}

// === COMPONENT LOGIC ===
const showPlayerCard = computed(() => {
  return isSaturday() && !actionTakenThisWeek.value && player.value !== null && !isLoading.value
})

const showFallbackMessage = computed(() => {
    if (isLoading.value) return false; // Don't show fallback during initial check
    if (!isSaturday()) return true; // Show if not Saturday
    if (isSaturday() && actionTakenThisWeek.value) return true; // Show if action taken
    return false; // Otherwise, don't show (player card should show or still loading)
})

const fallbackText = computed(() => {
    if (!isSaturday()) {
        const nextSaturday = new Date();
        nextSaturday.setDate(nextSaturday.getDate() + (6 - nextSaturday.getDay()));
        return `Um novo jogador jovem estará disponível no próximo sábado (${nextSaturday.toLocaleDateString('pt-BR')}).`;
    }
    if (actionTakenThisWeek.value) return 'Você já tomou uma decisão sobre o jogador desta semana. Um novo jogador estará disponível no próximo sábado!';
    return ''; // Default empty
})


onMounted(() => {
  if (!userId) {
      console.log("WeeklyPlayer: No user ID found on mount.");
      isLoading.value = false;
      return; // Don't proceed if user isn't logged in
  }
  const currentSaturday = getCurrentSaturdayDateString()
  const lastActionDate = localStorage.getItem(storageKey)
  actionTakenThisWeek.value = lastActionDate === currentSaturday
  console.log(`WeeklyPlayer Mount: Is Saturday? ${isSaturday()}, Action Taken? ${actionTakenThisWeek.value}, Last Action Date: ${lastActionDate}, Current Saturday: ${currentSaturday}`);
  isLoading.value = false; // Finished initial check
})

watchEffect(() => {
  // Generate player only if the card should be shown and player hasn't been generated yet
  if (isSaturday() && !actionTakenThisWeek.value && !player.value && !isLoading.value) {
      console.log("WatchEffect: Generating new player...");
      player.value = generatePlayerWithFallback()
  }
  // Clear player if card shouldn't be shown (e.g., action taken, not Saturday)
  if ((!isSaturday() || actionTakenThisWeek.value) && player.value) {
      console.log("WatchEffect: Clearing player...");
      player.value = null;
  }
})

// === PLAYER ACTIONS ===
async function acceptPlayer() {
  if (!player.value || !userId) return

  try {
    isLoading.value = true; // Indicate processing
    const playersCollectionRef = collection(db, 'users', userId, 'players')
    // Prepare player data for Firestore (omit temporary/unneeded fields if any)
    const playerData = {
        name: player.value.name,
        position: player.value.position,
        rating: player.value.rating,
        number: player.value.number,
        // Add any other relevant fields from your Player type that should be saved
    };
    await addDoc(playersCollectionRef, playerData)

    console.log('✅ Player accepted and added to team:', player.value.name)

    // Mark action taken for this week
    const currentSaturday = getCurrentSaturdayDateString()
    localStorage.setItem(storageKey, currentSaturday)
    actionTakenThisWeek.value = true

  } catch (error) {
    console.error('❌ Failed to accept player and add to Firestore:', error)
    // Optionally show an error message to the user
  } finally {
      isLoading.value = false;
  }
}

function rejectPlayer() {
   if (!player.value || !userId) return

  console.log('Player rejected:', player.value.name)
  isLoading.value = true; // Indicate processing

  // Mark action taken for this week
  const currentSaturday = getCurrentSaturdayDateString()
  localStorage.setItem(storageKey, currentSaturday)
  actionTakenThisWeek.value = true
  isLoading.value = false;
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

.warning {
    color: #ffd700;
    font-weight: bold;
    margin: 10px 0;
    padding: 10px;
    border: 1px solid #ffd700;
    border-radius: 5px;
    background-color: rgba(255, 215, 0, 0.1);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
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

.loading-indicator {
    padding: 20px;
    color: #aaa;
    text-align: center;
    font-style: italic;
}

.no-player {
  padding: 20px;
  color: #ccc;
  text-align: center;
  font-style: italic;
}
</style>
