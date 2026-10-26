<template>
  <!-- Fundo escurecido, só no telemóvel -->
  <div class="sidebar-overlay" :class="{ visible: open }" @click="emit('close')"></div>

  <aside class="sidebar" :class="{ open }">
    <!-- Brand -->
    <div class="sidebar-brand">
      <div class="brand-logo">
        <AppIcon name="ball" :size="22" />
      </div>
      <div class="brand-text">
        <span class="brand-name">Soccer</span>
        <span class="brand-tagline">Manager</span>
      </div>
      <button class="drawer-close" aria-label="Fechar menu" @click="emit('close')">
        <AppIcon name="close" :size="20" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <span class="nav-section-label">Navegação</span>

      <router-link v-for="item in navItems" :key="item.to" :to="item.to" class="nav-item">
        <span class="nav-icon"><AppIcon :name="item.icon" :size="17" /></span>
        <span class="nav-label">{{ item.label }}</span>
        <span class="nav-dot"></span>
      </router-link>
    </nav>

    <!-- Footer -->
    <div class="sidebar-footer">
      <button @click="logout" class="logout-btn">
        <span class="nav-icon"><AppIcon name="logout" :size="17" /></span>
        <span>Terminar Sessão</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'
import { getAuth, signOut } from 'firebase/auth'
import { useRouter, useRoute } from 'vue-router'
import AppIcon from './AppIcon.vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const router = useRouter()
const route = useRoute()

const navItems = [
  { to: '/clube', label: 'Clube', icon: 'shield' },
  { to: '/equipa', label: 'Equipa', icon: 'users' },
  { to: '/jogos', label: 'Jogos', icon: 'ball' },
  { to: '/tatica', label: 'Tática', icon: 'pitch' },
  { to: '/treino', label: 'Treino', icon: 'dumbbell' },
  { to: '/economy', label: 'Economia', icon: 'chart' },
  { to: '/transfers', label: 'Transferências', icon: 'swap' },
  { to: '/jovens', label: 'Jovens', icon: 'seedling' },
]

// No telemóvel o menu fecha-se assim que se escolhe uma página
watch(
  () => route.fullPath,
  () => emit('close'),
)

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.open) emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

const logout = async () => {
  const auth = getAuth()
  try {
    await signOut(auth)
    router.push('/')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  height: 100dvh;
  width: var(--sidebar-width);
  background: var(--surface-sidebar);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  z-index: 100;
  box-shadow: 4px 0 30px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
}

.sidebar-overlay {
  display: none;
}

.drawer-close {
  display: none;
}

/* Brand */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 26px 22px;
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.brand-logo {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: linear-gradient(135deg, var(--accent), var(--vt-c-indigo));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 14px var(--accent-glow);
  flex-shrink: 0;
  transition: box-shadow 0.3s ease;
}

.sidebar-brand:hover .brand-logo {
  box-shadow: 0 6px 20px var(--accent-glow);
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.brand-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--vt-c-text-dark-1);
  letter-spacing: 0.3px;
  margin-bottom: 4px;
}

.brand-tagline {
  font-size: 0.67rem;
  color: var(--accent-light);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.8px;
}

/* Nav */
.sidebar-nav {
  flex: 1;
  padding: 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-nav::-webkit-scrollbar {
  width: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: var(--border-accent);
  border-radius: 10px;
}

.nav-section-label {
  display: block;
  font-size: 0.63rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.8px;
  color: rgba(255, 255, 255, 0.5);
  padding: 0 10px;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.78);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  position: relative;
  border: 1px solid transparent;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    border-color 0.18s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.85);
}

.nav-item:hover .nav-icon {
  background: rgba(46, 207, 133, 0.15);
  color: var(--accent-light);
}

.nav-item.router-link-active {
  background: rgba(255, 255, 255, 0.16);
  color: var(--vt-c-text-dark-1);
  border-color: var(--border-accent);
}

.nav-item.router-link-active .nav-icon {
  background: rgba(46, 207, 133, 0.25);
  color: var(--accent-light);
}

/* Nav icon box */
.nav-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.35);
  flex-shrink: 0;
  transition:
    background 0.18s ease,
    color 0.18s ease;
}

.nav-label {
  flex: 1;
}

/* Active indicator dot */
.nav-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent-light);
  opacity: 0;
  transition: opacity 0.18s ease;
  flex-shrink: 0;
}

.nav-item.router-link-active .nav-dot {
  opacity: 1;
}

/* Footer */
.sidebar-footer {
  padding: 14px;
  padding-bottom: calc(14px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: rgba(239, 68, 68, 0.65);
  cursor: pointer;
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 500;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    border-color 0.18s ease;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.4);
}

.logout-btn .nav-icon {
  background: rgba(239, 68, 68, 0.08);
  color: inherit;
}

.logout-btn:hover .nav-icon {
  background: rgba(239, 68, 68, 0.18);
}

/* ------------------------------------------------------------------ */
/* Telemóvel / tablet: a barra passa a gaveta que desliza por cima     */
/* ------------------------------------------------------------------ */
@media (max-width: 900px) {
  .sidebar {
    width: min(280px, 84vw);
    transform: translateX(-100%);
    transition: transform 0.28s ease;
    will-change: transform;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(2px);
    z-index: 99;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.28s ease;
  }

  .sidebar-overlay.visible {
    opacity: 1;
    pointer-events: auto;
  }

  .sidebar-brand {
    padding: 18px 18px;
  }

  .drawer-close {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;
    width: 34px;
    height: 34px;
    border-radius: 9px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-subtle);
    color: rgba(255, 255, 255, 0.55);
    cursor: pointer;
    padding: 0;
  }

  .nav-item {
    padding: 12px;
    font-size: 0.95rem;
  }
}
</style>
