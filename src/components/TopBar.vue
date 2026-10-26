<template>
  <header class="topbar">
    <div class="topbar-left">
      <button class="menu-btn" aria-label="Abrir menu" @click="emit('toggle-menu')">
        <AppIcon name="menu" :size="20" />
      </button>
      <nav class="crumb" aria-label="Localização">
        <template v-if="entry">
          <h1 class="crumb-section">{{ entry.item.label }}</h1>
          <AppIcon :name="entry.item.icon" :size="16" />
          <span class="sep">›</span>
          <b>{{ entry.sub.label }}</b>
        </template>
        <h1 v-else class="crumb-section only">Soccer Manager</h1>
      </nav>
    </div>

    <div class="topbar-right">
      <router-link to="/jogos/calendario" class="tb" title="Calendário" aria-label="Calendário">
        <AppIcon name="calendar" :size="20" />
      </router-link>
      <div class="club">
        <div class="crest">{{ initial }}</div>
        <div class="club-text">
          <b>{{ club.team ?? userEmail }}</b>
          <small>Época {{ club.season }}</small>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getAuth } from 'firebase/auth'
import AppIcon from './AppIcon.vue'
import { findMenuEntry } from '@/config/menu'
import { useClubStore } from '@/stores/club'

const emit = defineEmits<{ (e: 'toggle-menu'): void }>()

const route = useRoute()
const club = useClubStore()
const entry = computed(() => findMenuEntry(route.path))
const userEmail = computed(() => getAuth().currentUser?.email ?? '')
const initial = computed(() => (club.team ?? userEmail.value).charAt(0).toUpperCase())

onMounted(() => club.load())
</script>

<style scoped>
.topbar {
  height: var(--topbar-height);
  background: var(--surface-topbar);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 24px;
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
  border-radius: 4px;
  background: none;
  border: 0;
  color: var(--ink);
  cursor: pointer;
  padding: 0;
}
.menu-btn:hover {
  background: oklch(0.6 0.07 145 / 0.35);
}

.crumb {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  color: var(--ink);
  min-width: 0;
  white-space: nowrap;
}
.crumb-section {
  font-weight: 500;
  font-size: 20px;
  color: var(--mute);
  padding-right: 14px;
  border-right: 1px solid var(--line);
  line-height: 1.2;
}
.crumb-section.only {
  border-right: 0;
}
.crumb b {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sep {
  color: var(--mute);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.tb {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 4px;
  color: var(--ink);
}
.tb:hover {
  background: oklch(0.6 0.07 145 / 0.35);
}
.club {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 16px;
  margin-left: 8px;
  border-left: 1px solid var(--line);
}
.crest {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: repeating-linear-gradient(90deg, var(--ink) 0 6px, oklch(0.68 0.17 320) 6px 12px);
  display: grid;
  place-items: center;
  color: oklch(0.2 0.04 160);
  font-weight: 700;
  text-shadow: 0 0 4px var(--ink);
}
.club-text b {
  display: block;
  font-weight: 600;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.club-text small {
  font-size: 11px;
  color: var(--mute);
}

@media (max-width: 900px) {
  .topbar {
    padding: 0 14px;
  }
  .menu-btn {
    display: flex;
  }
  .crumb-section {
    font-size: 15px;
    padding-right: 10px;
  }
  .club {
    padding-left: 8px;
    margin-left: 0;
  }
  .club-text {
    display: none;
  }
}
</style>
