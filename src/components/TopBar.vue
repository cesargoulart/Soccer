<template>
  <header class="topbar">
    <div class="topbar-left">
      <button class="menu-btn" aria-label="Abrir menu" @click="emit('toggle-menu')">
        <AppIcon name="menu" :size="20" />
      </button>
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
import AppIcon from './AppIcon.vue'

const emit = defineEmits<{ (e: 'toggle-menu'): void }>()

const route = useRoute()
const auth = getAuth()

const pageTitles: Record<string, string> = {
  '/clube': 'Clube',
  '/equipa': 'Equipa',
  '/jogos': 'Jogos',
  '/jogos/calendario': 'Calendário Completo',
  '/jogos/historico': 'Histórico de Jogos',
  '/tatica': 'Tática',
  '/treino': 'Treino',
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
  gap: 12px;
  padding: 0 28px;
  position: sticky;
  top: 0;
  z-index: 50;
  flex-shrink: 0;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.menu-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-subtle);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 0;
  transition:
    background 0.18s ease,
    color 0.18s ease;
}

.menu-btn:hover {
  background: rgba(46, 207, 133, 0.15);
  color: var(--accent-light);
}

.page-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--vt-c-text-dark-1);
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

@media (max-width: 900px) {
  .topbar {
    padding: 0 14px;
  }

  .menu-btn {
    display: flex;
  }

  .page-title {
    font-size: 1rem;
  }

  /* Só o círculo com a inicial cabe bem num ecrã pequeno */
  .user-email {
    display: none;
  }

  .user-card {
    padding: 5px;
    border-radius: 50%;
  }
}
</style>
