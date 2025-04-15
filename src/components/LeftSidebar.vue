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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(true)
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
</style>
