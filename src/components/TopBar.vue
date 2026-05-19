<template>
  <header class="topbar">
    <div class="topbar-left">
      <h1 class="page-title">{{ currentPageTitle }}</h1>
    </div>
    <div class="topbar-right">
      <div class="user-card">
        <div class="user-avatar">{{ userInitials }}</div>
        <span class="user-email">{{ userEmail }}</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getAuth } from 'firebase/auth'

const route = useRoute()
const auth = getAuth()

const pageTitles: Record<string, string> = {
  '/clube': 'Clube',
  '/equipa': 'Equipa',
  '/jogos': 'Jogos',
  '/jogos/calendario': 'Calendário Completo',
  '/jogos/historico': 'Histórico de Jogos',
  '/economy': 'Economia',
  '/transfers': 'Transferências',
  '/jovens': 'Jovens',
}

const currentPageTitle = computed(() => pageTitles[route.path] ?? 'Soccer Manager')

const userEmail = computed(() => auth.currentUser?.email ?? '')

const userInitials = computed(() => {
  const email = auth.currentUser?.email ?? ''
  return email.charAt(0).toUpperCase()
})
</script>

<style scoped>
.topbar {
  height: var(--topbar-height);
  background: var(--surface-topbar);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  position: sticky;
  top: 0;
  z-index: 50;
  flex-shrink: 0;
}

.page-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--vt-c-text-dark-1);
  letter-spacing: -0.01em;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-subtle);
  border-radius: 100px;
  padding: 5px 16px 5px 5px;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.user-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--border-accent);
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--vt-c-indigo));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.78rem;
  flex-shrink: 0;
  box-shadow: 0 2px 8px var(--accent-glow);
}

.user-email {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
