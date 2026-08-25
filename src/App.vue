<script setup lang="ts">
import { RouterView } from 'vue-router'
import LeftSidebar from './components/LeftSidebar.vue'
import TopBar from './components/TopBar.vue'
import { ref, watch, onMounted } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const isAuthenticated = ref(false)
const sidebarOpen = ref(false)

onMounted(() => {
  const auth = getAuth()
  onAuthStateChanged(auth, (user) => {
    isAuthenticated.value = !!user
    if (!user) sidebarOpen.value = false
  })
})

// Com a gaveta aberta no telemóvel, bloqueia o scroll do fundo
watch(sidebarOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})
</script>

<template>
  <div class="app-container">
    <LeftSidebar v-if="isAuthenticated" :open="sidebarOpen" @close="sidebarOpen = false" />
    <div class="main-wrapper" :class="{ 'with-sidebar': isAuthenticated }">
      <TopBar v-if="isAuthenticated" @toggle-menu="sidebarOpen = !sidebarOpen" />
      <main class="main-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
}

#app {
  max-width: 100%;
  padding: 0;
}

.app-container {
  display: flex;
  min-height: 100vh;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-width: 0;
}

.main-wrapper.with-sidebar {
  margin-left: var(--sidebar-width);
}

.main-content {
  flex: 1;
  overflow-y: auto;
}

/* Abaixo de 900px a barra lateral é uma gaveta: o conteúdo ocupa o ecrã todo */
@media (max-width: 900px) {
  .main-wrapper.with-sidebar {
    margin-left: 0;
  }
}
</style>
