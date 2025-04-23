<template>
  <div class="transfers-view">
    <h1 class="title">Transfer Market</h1>
    <div class="content-wrapper">
      <div class="transfers-section animate-slide-in">
        <h2>Listed Players</h2>
        <div v-if="transfersStore.playersForTransfer.length === 0" class="no-players">
          <p>No players listed for transfer</p>
        </div>
        <table v-else class="player-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Position</th>
              <th>Rating</th>
              <th>Price</th>
              <!-- Added Price header -->
              <th>Team</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="player in transfersStore.playersForTransfer" :key="player.id">
              <td>{{ player.number }}</td>
              <td>{{ player.name }}</td>
              <td>{{ player.position }}</td>
              <td>{{ player.rating }}</td>
              <td>{{ player.price ? `€${player.price.toLocaleString()}` : 'N/A' }}</td>
              <!-- Display Price -->
              <td>{{ player.team }}</td>
              <td>
                <!-- Conditionally render buttons based on team ownership -->
                <button
                  v-if="player.team === currentUserTeam"
                  class="btn-remove"
                  @click="removeFromTransfer(player.id)"
                >
                  Remove from List
                </button>
                <!-- Use a different class for styling -->
                <button v-else class="btn-buy" @click="buyPlayer(player)">Buy Player</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue' // Import ref and lifecycle hooks
import { useTransfersStore, type Player } from '../stores/transfers' // Import Player type
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth' // Import auth functions and User type
import { doc, getDoc } from 'firebase/firestore' // Import Firestore functions
import { db } from '../firebaseConfig' // Import db instance

const transfersStore = useTransfersStore()
const currentUserTeam = ref<string | null>(null) // To store the logged-in user's team name
let authListener: (() => void) | null = null // To store the auth state change listener

const removeFromTransfer = (playerId: string) => {
  // The playerId here is the Firestore document ID from the transfer list
  transfersStore.removePlayerFromTransfer(playerId)
}

// Placeholder function for buying a player
const buyPlayer = async (player: Player) => {
  if (!currentUserTeam.value) {
    console.error('Current user team not loaded.')
    // Optionally show an error message to the user
    return
  }
  try {
    console.log('Attempting to buy player:', player.name, 'for team:', currentUserTeam.value)
    await transfersStore.buyPlayer(player, currentUserTeam.value)
    console.log('Player bought successfully!')
    // Optionally show a success message to the user
  } catch (error) {
    console.error('Failed to buy player:', error)
    // Optionally show an error message to the user
  }
}

// Fetch the logged-in user's team name
const fetchUserTeam = async (userId: string) => {
  try {
    const userDocRef = doc(db, 'users', userId)
    const userDocSnap = await getDoc(userDocRef)
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data()
      currentUserTeam.value = userData.team || null // Assuming 'team' field exists
      console.log('Fetched current user team:', currentUserTeam.value)
    } else {
      currentUserTeam.value = null
      console.log('User document not found.')
    }
  } catch (error) {
    console.error('Error fetching user team:', error)
    currentUserTeam.value = null
  }
}

// Subscribe to the transfer list and listen for auth state changes when the component is mounted
onMounted(() => {
  transfersStore.subscribeToTransferList()

  // Listen for auth state changes to get the current user's team
  const auth = getAuth()
  authListener = onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      // User is logged in, fetch their team
      fetchUserTeam(user.uid)
    } else {
      // User is logged out, clear the team
      currentUserTeam.value = null
    }
  })
})

// Unsubscribe from the transfer list and auth listener when the component is unmounted
onUnmounted(() => {
  transfersStore.unsubscribe()
  if (authListener) {
    authListener() // Unsubscribe from auth listener
  }
})
</script>

<style scoped>
.transfers-view {
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
  max-width: 1200px;
  margin: 0 auto;
}

.transfers-section {
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

.no-players {
  text-align: center;
  padding: 40px;
  background: rgba(30, 30, 30, 0.5);
  border-radius: 10px;
  margin-top: 20px;
}

.no-players p {
  font-size: 1.2em;
  color: #646cff;
}

.player-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  color: #e0e0e0;
  animation: fadeIn 0.5s ease forwards 0.2s;
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

.player-table td:first-child {
  font-weight: bold;
  color: #646cff;
  text-align: center;
  width: 50px;
}

.btn-remove {
  padding: 8px 16px;
  background: linear-gradient(135deg, #ff4646 0%, #ff7070 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-remove:hover {
  transform: translateY(-2px);
  filter: brightness(110%);
}

.btn-buy {
  padding: 8px 16px;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-buy:hover {
  transform: translateY(-2px);
  filter: brightness(110%);
}

h2 {
  font-size: 1.8em;
  margin-bottom: 20px;
  color: #646cff;
}

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
</style>
