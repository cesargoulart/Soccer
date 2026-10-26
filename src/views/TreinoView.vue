<template>
  <div class="treino-view">
    <div class="split screen-in">
      <!-- Estado do treino -->
      <Card title="Estado" :index="0" class="state-card">
        <dl class="facts">
          <div><dt>Treino atual</dt><dd class="hl">{{ selectedFoco || 'Nenhum' }}</dd></div>
          <div><dt>Último aplicado</dt><dd>{{ treinoAplicado ? ultimoFoco : '—' }}</dd></div>
          <div><dt>Próximo sábado</dt><dd>{{ proximoSabado }}</dd></div>
        </dl>
        <p class="note">
          O foco é aplicado aos jogadores no próximo sábado. Podes alterar a qualquer momento antes disso.
        </p>
        <button class="btn-save" :disabled="saving || !selectedFoco" @click="saveTreino">
          {{ saving ? 'A guardar...' : saved ? '✓ Guardado' : 'Definir Treino' }}
        </button>
      </Card>

      <!-- Foco da semana -->
      <Card title="Foco da semana" :index="1">
        <div class="focus-grid">
          <button
            v-for="(f, i) in focos"
            :key="f.id"
            type="button"
            class="focus-option"
            :class="{ active: selectedFoco === f.id, applied: treinoAplicado && ultimoFoco === f.id }"
            @click="selectedFoco = f.id"
          >
            <span class="focus-icon">{{ f.icon }}</span>
            <span class="focus-name">{{ f.id }}</span>
            <span class="focus-desc">{{ f.desc }}</span>
            <span class="focus-bonus">{{ f.bonus }}</span>
            <span class="bar2"><i :style="{ '--w': power(f.bonus) + '%', '--d': i * 25 + 'ms' }"></i></span>
          </button>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebaseConfig'
import { getAuth } from 'firebase/auth'
import Card from '@/components/ui/Card.vue'

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

// Força do bónus (+1 / +2) para a barra animada
const power = (bonus: string) => (Number(/\+(\d)/.exec(bonus)?.[1] ?? 1) / 2) * 100

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
.split { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 20px; align-items: start; }
.facts { display: flex; flex-direction: column; margin: 0 0 14px; }
.facts div { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--line); font-weight: 500; }
.facts dd { margin: 0; font-weight: 600; text-align: right; text-transform: capitalize; }
.facts dd.hl { color: var(--ok); }
.note { font-size: 12px; color: var(--mute); margin-bottom: 16px; line-height: 1.5; }
.btn-save {
  width: 100%;
  padding: 11px 14px;
  border: 0;
  border-radius: 4px;
  background: var(--ok);
  color: oklch(0.2 0.04 160);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.2s;
}
.btn-save:hover:not(:disabled) { filter: brightness(1.08); }
.btn-save:disabled { opacity: 0.45; cursor: not-allowed; }

.focus-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.focus-option {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2px 12px;
  align-items: center;
  text-align: left;
  padding: 14px;
  border-radius: 4px;
  background: var(--card2);
  color: var(--ink);
  font: inherit;
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s, background 0.2s;
}
.focus-option:hover { border-color: var(--ink); transform: translateY(-2px); }
.focus-option.active {
  border-color: oklch(0.85 0.15 120);
  background: oklch(0.3 0.06 155 / 0.8);
  box-shadow: 0 0 18px oklch(0.85 0.15 120 / 0.25);
}
.focus-icon { grid-row: span 3; font-size: 26px; }
.focus-name { font-weight: 600; font-size: 16px; }
.focus-desc { font-size: 12px; color: var(--mute); }
.focus-bonus { font-size: 12px; font-weight: 600; color: oklch(0.8 0.12 25); }
.focus-option.applied .focus-name::after { content: ' ✓'; color: var(--ok); }
.bar2 { grid-column: 1 / -1; height: 4px; margin-top: 10px; background: oklch(0.4 0.04 155 / 0.6); border-radius: 2px; overflow: hidden; }
.bar2 i { display: block; height: 100%; width: 0; background: var(--ok); border-radius: 2px; animation: fill 1s cubic-bezier(0.3, 0.8, 0.3, 1) forwards; animation-delay: var(--d, 0ms); }
@keyframes fill { to { width: var(--w); } }

@media (max-width: 1100px) {
  .split { grid-template-columns: 1fr; }
}
</style>
