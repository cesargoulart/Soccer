<template>
  <!-- Fundo escurecido, só no telemóvel -->
  <div class="sidebar-overlay" :class="{ visible: open }" @click="emit('close')"></div>

  <aside class="sidebar" :class="{ open }">
    <div class="sidebar-brand">
      <span class="brand-logo"><AppIcon name="ball" :size="18" /></span>
      <span class="brand-name">Soccer</span>
      <button class="drawer-close" aria-label="Fechar menu" @click="emit('close')">
        <AppIcon name="close" :size="20" />
      </button>
    </div>

    <nav class="sidebar-nav" aria-label="Navegação principal">
      <template v-for="g in MENU" :key="g.group">
        <div class="grp">{{ g.group }}</div>
        <template v-for="it in g.items" :key="it.id">
          <button
            class="item"
            :class="{ open: openId === it.id }"
            :aria-expanded="openId === it.id"
            @click="toggle(it.id)"
          >
            <AppIcon :name="it.icon" :size="20" />
            <span class="item-label">{{ it.label }}</span>
            <span class="chev"></span>
          </button>
          <div class="sub" :class="{ open: openId === it.id }">
            <div>
              <router-link
                v-for="s in it.sub"
                :key="s.to"
                :to="s.to"
                :tabindex="openId === it.id ? 0 : -1"
                :class="{ cur: current?.sub.to === s.to }"
              >
                {{ s.label }}
              </router-link>
            </div>
          </div>
        </template>
      </template>

      <div class="side-foot">
        <button class="item logout" @click="logout">
          <AppIcon name="logout" :size="20" />
          <span class="item-label">Terminar sessão</span>
        </button>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { getAuth, signOut } from 'firebase/auth'
import { useRouter, useRoute } from 'vue-router'
import AppIcon from './AppIcon.vue'
import { MENU, findMenuEntry } from '@/config/menu'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const router = useRouter()
const route = useRoute()

const STORAGE_KEY = 'menuV2.open'
const read = () => {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}
const write = (v: string | null) => {
  try {
    if (v) localStorage.setItem(STORAGE_KEY, v)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* sem armazenamento: o acordeão continua a funcionar */
  }
}

const current = computed(() => findMenuEntry(route.path))

// Acordeão: só um item aberto de cada vez; clicar no aberto fecha-o.
const openId = ref<string | null>(current.value?.item.id ?? read())

function toggle(id: string) {
  openId.value = openId.value === id ? null : id
  write(openId.value)
}

// Navegar (ou carregar a página diretamente) abre o grupo da rota atual
watch(
  () => route.path,
  () => {
    const entry = findMenuEntry(route.path)
    if (entry) {
      openId.value = entry.item.id
      write(openId.value)
    }
    emit('close') // no telemóvel o menu fecha-se ao escolher uma página
  },
)

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.open) emit('close')
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

const logout = async () => {
  try {
    await signOut(getAuth())
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
  display: flex;
  flex-direction: column;
  z-index: 100;
}
.sidebar-overlay,
.drawer-close {
  display: none;
}

.sidebar-brand {
  height: var(--topbar-height);
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: oklch(0.5 0.09 145 / 0.55);
  font-family: var(--font-brand);
  font-size: 22px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink);
}
.brand-logo {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 3px solid var(--ink);
  display: grid;
  place-items: center;
}

.sidebar-nav {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 10px 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  scrollbar-width: none;
}
.sidebar-nav::-webkit-scrollbar {
  display: none;
}

.grp {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--dim);
  padding: 16px 6px 6px;
}

.item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 11px 12px;
  border-radius: 4px;
  font: inherit;
  font-weight: 600;
  font-size: 15px;
  text-align: left;
  color: var(--ink);
  background: none;
  border: 0;
  cursor: pointer;
  transition: background 0.2s;
}
.item:hover {
  background: oklch(0.5 0.06 150 / 0.25);
}
.item :deep(svg) {
  flex: none;
}
.item-label {
  flex: 1;
}
.chev {
  width: 7px;
  height: 7px;
  border-left: 2px solid var(--mute);
  border-bottom: 2px solid var(--mute);
  transform: rotate(45deg);
  transition: transform 0.25s;
}
.item.open {
  background: oklch(0.5 0.06 150 / 0.3);
  border-radius: 4px 4px 0 0;
}
.item.open .chev {
  transform: rotate(-45deg);
}

/* Altura animada sem medir em JS: grid-template-rows 0fr -> 1fr */
.sub {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease;
}
.sub.open {
  grid-template-rows: 1fr;
}
.sub > div {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: oklch(0.5 0.06 150 / 0.18);
  border-radius: 0 0 4px 4px;
}
.sub a {
  padding: 10px 16px;
  font-weight: 500;
  color: var(--mute);
  transition:
    background 0.2s,
    color 0.2s,
    padding 0.2s;
}
.sub a:hover {
  color: var(--ink);
  padding-left: 20px;
}
.sub a.cur {
  color: var(--ink);
  font-weight: 600;
  background: oklch(0.62 0.05 150 / 0.35);
}

.side-foot {
  margin-top: auto;
  border-top: 1px solid var(--line);
  padding-top: 14px;
  padding-bottom: env(safe-area-inset-bottom);
}
.logout {
  color: oklch(0.8 0.12 25);
}

/* Telemóvel / tablet: a barra passa a gaveta que desliza por cima */
@media (max-width: 900px) {
  .sidebar {
    width: min(280px, 84vw);
    transform: translateX(-100%);
    transition: transform 0.28s ease;
    will-change: transform;
    box-shadow: 4px 0 30px rgba(0, 0, 0, 0.35);
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
    position: relative;
  }
  .drawer-close {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: 12px;
    width: 34px;
    height: 34px;
    border-radius: 4px;
    background: oklch(0.5 0.06 150 / 0.3);
    border: 0;
    color: var(--ink);
    cursor: pointer;
    padding: 0;
  }
}
</style>
