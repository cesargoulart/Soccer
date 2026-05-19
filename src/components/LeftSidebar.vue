<template>
  <aside class="sidebar">
    <!-- Brand -->
    <div class="sidebar-brand">
      <div class="brand-logo">
        <i class="fas fa-futbol"></i>
      </div>
      <div class="brand-text">
        <span class="brand-name">Soccer</span>
        <span class="brand-tagline">Manager</span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <span class="nav-section-label">Navegação</span>

      <router-link to="/clube" class="nav-item">
        <span class="nav-icon"><i class="fas fa-shield-halved"></i></span>
        <span class="nav-label">Clube</span>
        <span class="nav-dot"></span>
      </router-link>

      <router-link to="/equipa" class="nav-item">
        <span class="nav-icon"><i class="fas fa-users"></i></span>
        <span class="nav-label">Equipa</span>
        <span class="nav-dot"></span>
      </router-link>

      <router-link to="/jogos" class="nav-item">
        <span class="nav-icon"><i class="fas fa-futbol"></i></span>
        <span class="nav-label">Jogos</span>
        <span class="nav-dot"></span>
      </router-link>

      <router-link to="/tatica" class="nav-item">
        <span class="nav-icon"><i class="fas fa-chess-board"></i></span>
        <span class="nav-label">Tática</span>
        <span class="nav-dot"></span>
      </router-link>

      <router-link to="/treino" class="nav-item">
        <span class="nav-icon"><i class="fas fa-dumbbell"></i></span>
        <span class="nav-label">Treino</span>
        <span class="nav-dot"></span>
      </router-link>

      <router-link to="/economy" class="nav-item">
        <span class="nav-icon"><i class="fas fa-chart-line"></i></span>
        <span class="nav-label">Economia</span>
        <span class="nav-dot"></span>
      </router-link>

      <router-link to="/transfers" class="nav-item">
        <span class="nav-icon"><i class="fas fa-right-left"></i></span>
        <span class="nav-label">Transferências</span>
        <span class="nav-dot"></span>
      </router-link>

      <router-link to="/jovens" class="nav-item">
        <span class="nav-icon"><i class="fas fa-seedling"></i></span>
        <span class="nav-label">Jovens</span>
        <span class="nav-dot"></span>
      </router-link>
    </nav>

    <!-- Footer -->
    <div class="sidebar-footer">
      <button @click="logout" class="logout-btn">
        <span class="nav-icon"><i class="fas fa-arrow-right-from-bracket"></i></span>
        <span>Terminar Sessão</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { getAuth, signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'

const router = useRouter()

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
  width: var(--sidebar-width);
  background: var(--surface-sidebar);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  z-index: 100;
  box-shadow: 4px 0 30px rgba(0, 0, 0, 0.5);
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
  font-size: 1.1rem;
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
  color: rgba(255, 255, 255, 0.22);
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
  color: rgba(255, 255, 255, 0.5);
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
  background: rgba(124, 58, 237, 0.15);
  color: var(--accent-light);
}

.nav-item.router-link-active {
  background: rgba(124, 58, 237, 0.14);
  color: var(--vt-c-text-dark-1);
  border-color: var(--border-accent);
}

.nav-item.router-link-active .nav-icon {
  background: rgba(124, 58, 237, 0.25);
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
  font-size: 0.8rem;
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

/* Transfer badge */
.transfer-badge {
  margin-left: auto;
  background: rgba(124, 58, 237, 0.2);
  color: var(--accent-light);
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  border: 1px solid var(--border-accent);
  white-space: nowrap;
  transition: background 0.18s ease;
}

.nav-item:hover .transfer-badge {
  background: rgba(124, 58, 237, 0.3);
}

/* Footer */
.sidebar-footer {
  padding: 14px;
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
</style>
