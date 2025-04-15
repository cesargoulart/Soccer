<script setup lang="ts">
import { RouterView } from 'vue-router'
import LeftSidebar from './components/LeftSidebar.vue'
import { ref, onMounted } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const isAuthenticated = ref(false)

onMounted(() => {
  const auth = getAuth()
  onAuthStateChanged(auth, (user) => {
    isAuthenticated.value = !!user
  })
})
</script>

<template>
  <div class="app-container">
    <LeftSidebar v-if="isAuthenticated" />
    <main class="main-content" :class="{ 'with-sidebar': isAuthenticated }">
      <RouterView />
    </main>
  </div>
</template>

<style>
.app-container {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
  transition: margin-left 0.3s ease-in-out;
}

.main-content.with-sidebar {
  margin-left: 250px;
}
</style>

<style>
/* Applying full height to make the auth view fill the screen */
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}

#app {
  max-width: 100%;
  padding: 0;
}
</style>
