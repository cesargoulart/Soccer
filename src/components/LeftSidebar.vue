<template>
  <div class="left-sidebar" :class="{ 'sidebar-open': isOpen }">
    <div class="menu-items">
      <router-link to="/clube" class="menu-item">
        <span>Clube</span>
      </router-link>
      <router-link to="/equipa" class="menu-item">
        <span>Equipa</span>
      </router-link>
      <router-link to="/jogos" class="menu-item">
        <span>Jogos</span>
      </router-link>
      <router-link to="/economy" class="menu-item">
        <span>Economy</span>
      </router-link>
      <router-link to="/transfers" class="menu-item transfer-link">
        <span>Transfers</span>
        <span v-if="totalTransferValue > 0" class="transfer-value">
          (${{ totalTransferValue.toLocaleString() }})
        </span>
      </router-link>
      <button @click="logout" class="menu-item logout-button">
        <span>Logout</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue' // Import computed
import { getAuth, signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { useTransfersStore } from '../stores/transfers' // Import the transfers store

const isOpen = ref(true)
const router = useRouter()
const transfersStore = useTransfersStore() // Get the store instance

// Calculate total transfer value reactively
const totalTransferValue = computed(() => {
  return transfersStore.playersForTransfer.reduce((sum, player) => sum + (player.price || 0), 0);
});

const logout = async () => {
  const auth = getAuth()
  try {
    await signOut(auth)
    router.push('/auth') // Redirect to login page after logout
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>

<style scoped>
.left-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 250px;
  background: #1a1a1a;
  padding-top: 60px;
  transform: translateX(-100%);
  transition: transform 0.3s ease-in-out;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar-open {
  transform: translateX(0);
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  height: 100%; /* Ensure menu-items takes full height */
  position: relative; /* Needed for absolute positioning of logout button */
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: #fff;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: #2a2a2a;
}

.menu-item:hover {
  background: #3a3a3a;
  transform: translateX(5px);
}

.menu-item.router-link-active {
  background: #4a4a4a;
  border-left: 4px solid #646cff;
}

.transfer-link {
  display: flex;
  justify-content: space-between; /* Align text and value */
  align-items: center;
}

.transfer-value {
  font-size: 0.8em;
  color: #a8b4ff; /* Lighter color for value */
  margin-left: 8px;
  font-weight: normal;
}

.logout-button {
  position: absolute;
  bottom: 20px; /* Position at the bottom */
  left: 20px; /* Align with other menu items */
  width: calc(100% - 40px); /* Match width of container minus padding */
  background-color: #d32f2f; /* Distinct color for logout */
  border: none;
  cursor: pointer;
}

.logout-button:hover {
  background-color: #b71c1c;
  transform: none; /* Override hover transform if needed */
}
</style>
