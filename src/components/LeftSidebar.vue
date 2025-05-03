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
      <router-link to="/jovens" class="menu-item">
        <span>Jovens</span>
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
  background: linear-gradient(135deg, var(--vt-c-black) 0%, var(--vt-c-black-soft) 100%);
  padding-top: 60px;
  transform: translateX(-100%);
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 8px 0 20px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-right: 1px solid var(--vt-c-divider-dark-1);
}

.sidebar-open {
  transform: translateX(0);
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.3);
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 25px 20px;
  height: 100%;
  position: relative;
  animation: fadeIn 0.6s ease-out;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px 22px;
  color: var(--vt-c-text-dark-1);
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.3s ease-in-out;
  background: rgba(255, 255, 255, 0.03);
  border-left: 3px solid transparent;
  position: relative;
  overflow: hidden;
}

.menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(120deg, var(--vt-c-purple) 0%, var(--vt-c-indigo) 100%);
  transition: left 0.5s ease;
  z-index: 0;
}

.menu-item:hover::before {
  left: 100%;
}

.menu-item:hover {
  transform: translateX(8px) scale(1.02);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border-left: 3px solid var(--vt-c-purple);
}

.menu-item.router-link-active {
  background: var(--vt-c-black-mute);
  border-left: 4px solid var(--vt-c-purple);
  box-shadow: 0 4px 15px rgba(142, 45, 226, 0.3);
  transform: scale(1.03);
}

.menu-item.router-link-active::after {
  content: '';
  position: absolute;
  top: 50%;
  right: -5px;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  background: var(--vt-c-purple);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--vt-c-purple);
}

.transfer-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.transfer-value {
  font-size: 0.8em;
  color: var(--vt-c-purple);
  margin-left: 10px;
  font-weight: 600;
  background: rgba(142, 45, 226, 0.15);
  padding: 2px 6px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.transfer-link:hover .transfer-value {
  background: rgba(142, 45, 226, 0.25);
  transform: scale(1.1);
}

.logout-button {
  position: absolute;
  bottom: 25px;
  left: 20px;
  width: calc(100% - 40px);
  background: linear-gradient(45deg, var(--vt-c-purple), var(--vt-c-indigo));
  border: none;
  cursor: pointer;
  padding: 14px 20px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(142, 45, 226, 0.4);
  z-index: 1;
}

.logout-button:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 20px rgba(142, 45, 226, 0.5);
}

.logout-button:active {
  transform: translateY(0);
}

@keyframes fadeIn {
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
