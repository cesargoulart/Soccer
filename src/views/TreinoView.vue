<template>
  <div class="treino-view">
    <h1 class="title">Treino</h1>
    <div class="content-wrapper">

      <div class="info-banner">
        <span>📅</span>
        <span>O foco de treino é aplicado aos jogadores no próximo sábado. Podes alterar a qualquer momento antes de sábado.</span>
      </div>

      <div class="treino-card animate-in">
        <h2>Foco da Semana</h2>
        <div class="focus-grid">
          <div
            v-for="f in focos"
            :key="f.id"
            class="focus-option"
            :class="{ active: selectedFoco === f.id, applied: treinoAplicado && ultimoFoco === f.id }"
            @click="selectedFoco = f.id"
          >
            <div class="focus-icon">{{ f.icon }}</div>
            <div class="focus-name">{{ f.id }}</div>
            <div class="focus-desc">{{ f.desc }}</div>
            <div class="focus-bonus">{{ f.bonus }}</div>
          </div>
        </div>
      </div>

      <!-- Status -->
      <div class="status-card animate-in" style="animation-delay:0.1s">
        <h2>Estado</h2>
        <div class="status-row">
          <span class="status-label">Treino atual</span>
          <span class="status-value highlight">{{ selectedFoco || 'Nenhum' }}</span>
        </div>
        <div class="status-row">
          <span class="status-label">Último treino aplicado</span>
          <span class="status-value">{{ treinoAplicado ? ultimoFoco : '—' }}</span>
        </div>
        <div class="status-row">
          <span class="status-label">Próximo sábado</span>
          <span class="status-value">{{ proximoSabado }}</span>
        </div>
      </div>

      <button class="btn-save" :disabled="saving || !selectedFoco" @click="saveTreino">
        {{ saving ? 'A guardar...' : saved ? '✓ Guardado' : 'Definir Treino' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebaseConfig'
import { getAuth } from 'firebase/auth'

const focos = [
  {
    id: 'Físico',
    icon: '💪',
    desc: 'Condição física e resistência',
    bonus: '+1 rating a todos os jogadores',
  },
  {
    id: 'Técnico',
    icon: '⚽',
    desc: 'Habilidade individual e passe',
    bonus: '+2 rating a Atacantes e Meios',
  },
  {
    id: 'Tático',
    icon: '🧠',
    desc: 'Posicionamento e organização',
    bonus: '+2 rating a Defesas e Guarda-redes',
  },
  {
    id: 'Descanso',
    icon: '😴',
    desc: 'Recuperação e prevenção de lesões',
    bonus: '+1 rating a todos (recuperação)',
  },
]

const selectedFoco  = ref<string | null>(null)
const ultimoFoco    = ref<string | null>(null)
const treinoAplicado = ref(false)
const saving = ref(false)
const saved  = ref(false)

const proximoSabado = computed(() => {
  const today = new Date()
  const days  = (6 - today.getDay() + 7) % 7 || 7
  const sat   = new Date(today)
  sat.setDate(today.getDate() + days)
  return sat.toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: 'long' })
})

onMounted(async () => {
  const user = getAuth().currentUser
  if (!user) return
  const snap = await getDoc(doc(db, 'users', user.uid))
  if (snap.exists() && snap.data().treino) {
    const t = snap.data().treino
    selectedFoco.value   = t.foco      ?? null
    ultimoFoco.value     = t.foco      ?? null
    treinoAplicado.value = t.aplicado  ?? false
  }
})

async function saveTreino() {
  const user = getAuth().currentUser
  if (!user || !selectedFoco.value) return
  saving.value = true
  saved.value  = false
  const today  = new Date()
  const days   = (6 - today.getDay() + 7) % 7 || 7
  const sat    = new Date(today)
  sat.setDate(today.getDate() + days)
  await updateDoc(doc(db, 'users', user.uid), {
    treino: {
      foco:     selectedFoco.value,
      semana:   sat.toISOString().split('T')[0],
      aplicado: false,
    }
  })
  treinoAplicado.value = false
  ultimoFoco.value     = selectedFoco.value
  saving.value = false
  saved.value  = true
  setTimeout(() => { saved.value = false }, 2500)
}
</script>

<style scoped>
.treino-view {
  padding: 20px;
  color: #fff;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a2e24 0%, #124436 100%);
}

.title {
  font-size: 2.5em;
  text-align: center;
  margin-bottom: 30px;
  background: linear-gradient(45deg, #4caf50, #81c784);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  opacity: 0;
  animation: fadeIn 0.5s ease forwards;
}

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  display: grid;
  gap: 20px;
}

.info-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  background: rgba(76,175,80,0.1);
  border: 1px solid rgba(76,175,80,0.25);
  border-radius: 12px;
  color: #a5d6a7;
  font-size: 0.88em;
}

.treino-card, .status-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(76,175,80,0.2);
  border-radius: 20px;
  padding: 28px;
  opacity: 0;
}

.animate-in { animation: slideIn 0.5s ease forwards; }

.treino-card h2, .status-card h2 {
  font-size: 1.2em;
  color: #81c784;
  margin-bottom: 20px;
}

.focus-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
}

.focus-option {
  padding: 20px 14px;
  border-radius: 14px;
  border: 1px solid rgba(76,175,80,0.2);
  background: rgba(255,255,255,0.02);
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
}

.focus-option:hover {
  border-color: rgba(76,175,80,0.5);
  background: rgba(76,175,80,0.08);
}

.focus-option.active {
  border-color: #4caf50;
  background: rgba(76,175,80,0.15);
  box-shadow: 0 0 16px rgba(76,175,80,0.2);
}

.focus-option.applied {
  border-color: rgba(76,175,80,0.3);
  opacity: 0.6;
}

.focus-icon  { font-size: 2em;  margin-bottom: 8px; }
.focus-name  { font-size: 1em;  font-weight: 700; margin-bottom: 6px; }
.focus-desc  { font-size: 0.76em; color: rgba(255,255,255,0.45); margin-bottom: 8px; }
.focus-bonus { font-size: 0.72em; color: #81c784; font-weight: 500; }

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  font-size: 0.9em;
}

.status-row:last-child { border-bottom: none; }
.status-label { color: rgba(255,255,255,0.45); }
.status-value { color: #fff; font-weight: 500; }
.status-value.highlight { color: #81c784; }

.btn-save {
  padding: 14px 32px;
  background: linear-gradient(135deg, #388e3c, #4caf50);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 1em;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.25s ease;
  justify-self: end;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(76,175,80,0.3);
}

.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

@keyframes fadeIn  { to { opacity: 1; } }
@keyframes slideIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
</style>
