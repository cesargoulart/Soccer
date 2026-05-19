<template>
  <div class="tatica-view">
    <h1 class="title">Tática</h1>
    <div class="content-wrapper">

      <!-- Formation -->
      <div class="tactic-card animate-in">
        <h2>Formação</h2>
        <div class="formation-grid">
          <div
            v-for="f in formations"
            :key="f.id"
            class="formation-option"
            :class="{ active: selectedFormacao === f.id }"
            @click="selectedFormacao = f.id"
          >
            <div class="formation-pitch">
              <div v-for="(row, i) in f.rows" :key="i" class="pitch-row">
                <span v-for="j in row" :key="j" class="player-dot"></span>
              </div>
            </div>
            <div class="formation-label">{{ f.id }}</div>
            <div class="formation-desc">{{ f.desc }}</div>
          </div>
        </div>
      </div>

      <!-- Style -->
      <div class="tactic-card animate-in" style="animation-delay:0.1s">
        <h2>Estilo de Jogo</h2>
        <div class="style-grid">
          <div
            v-for="s in styles"
            :key="s.id"
            class="style-option"
            :class="{ active: selectedEstilo === s.id }"
            @click="selectedEstilo = s.id"
          >
            <div class="style-icon">{{ s.icon }}</div>
            <div class="style-name">{{ s.id }}</div>
            <div class="style-desc">{{ s.desc }}</div>
          </div>
        </div>
      </div>

      <!-- Save -->
      <button class="btn-save" :disabled="saving" @click="saveTatica">
        {{ saving ? 'A guardar...' : saved ? '✓ Guardado' : 'Guardar Tática' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebaseConfig'
import { getAuth } from 'firebase/auth'

const formations = [
  { id: '4-4-2',   rows: [2,4,4,1],   desc: 'Equilibrado' },
  { id: '4-3-3',   rows: [3,3,4,1],   desc: 'Ofensivo' },
  { id: '3-5-2',   rows: [2,5,3,1],   desc: 'Controlo do meio' },
  { id: '4-2-3-1', rows: [1,3,2,4,1], desc: 'Criativo' },
  { id: '5-3-2',   rows: [2,3,5,1],   desc: 'Defensivo' },
]

const styles = [
  { id: 'Posse',         icon: '🎯', desc: 'Jogo controlado, baixo risco' },
  { id: 'Contra-ataque', icon: '⚡', desc: 'Eficiente, explora espaços' },
  { id: 'Pressão Alta',  icon: '🔥', desc: 'Agressivo, jogos mais abertos' },
  { id: 'Equilíbrio',    icon: '⚖️', desc: 'Adaptável a qualquer situação' },
]

const selectedFormacao = ref('4-4-2')
const selectedEstilo = ref('Equilíbrio')
const saving = ref(false)
const saved = ref(false)

onMounted(async () => {
  const user = getAuth().currentUser
  if (!user) return
  const snap = await getDoc(doc(db, 'users', user.uid))
  if (snap.exists() && snap.data().tatica) {
    const t = snap.data().tatica
    selectedFormacao.value = t.formacao ?? '4-4-2'
    selectedEstilo.value   = t.estilo   ?? 'Equilíbrio'
  }
})

async function saveTatica() {
  const user = getAuth().currentUser
  if (!user) return
  saving.value = true
  saved.value  = false
  await updateDoc(doc(db, 'users', user.uid), {
    tatica: { formacao: selectedFormacao.value, estilo: selectedEstilo.value }
  })
  saving.value = false
  saved.value  = true
  setTimeout(() => { saved.value = false }, 2500)
}
</script>

<style scoped>
.tatica-view {
  padding: 20px;
  color: #fff;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}

.title {
  font-size: 2.5em;
  text-align: center;
  margin-bottom: 30px;
  background: linear-gradient(45deg, var(--vt-c-purple), var(--vt-c-indigo));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  opacity: 0;
  animation: fadeIn 0.5s ease forwards;
}

.content-wrapper {
  max-width: 900px;
  margin: 0 auto;
  display: grid;
  gap: 24px;
}

.tactic-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(100,108,255,0.2);
  border-radius: 20px;
  padding: 28px;
  opacity: 0;
  animation: slideIn 0.5s ease forwards;
}

.tactic-card h2 {
  font-size: 1.3em;
  color: var(--vt-c-indigo);
  margin-bottom: 20px;
}

/* Formations */
.formation-grid {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.formation-option {
  flex: 1;
  min-width: 120px;
  padding: 16px 12px;
  border-radius: 14px;
  border: 1px solid rgba(100,108,255,0.2);
  background: rgba(255,255,255,0.02);
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
}

.formation-option:hover {
  border-color: rgba(100,108,255,0.5);
  background: rgba(100,108,255,0.08);
}

.formation-option.active {
  border-color: var(--vt-c-indigo);
  background: rgba(100,108,255,0.15);
  box-shadow: 0 0 16px rgba(100,108,255,0.2);
}

.formation-pitch {
  display: flex;
  flex-direction: column-reverse;
  gap: 6px;
  align-items: center;
  margin-bottom: 10px;
  min-height: 80px;
  justify-content: center;
}

.pitch-row {
  display: flex;
  gap: 5px;
}

.player-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: rgba(168,180,255,0.5);
  display: inline-block;
  transition: background 0.2s;
}

.formation-option.active .player-dot {
  background: #a8b4ff;
}

.formation-label {
  font-size: 1.05em;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.formation-desc {
  font-size: 0.75em;
  color: rgba(255,255,255,0.4);
}

/* Styles */
.style-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
}

.style-option {
  padding: 20px 16px;
  border-radius: 14px;
  border: 1px solid rgba(142,45,226,0.2);
  background: rgba(255,255,255,0.02);
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
}

.style-option:hover {
  border-color: rgba(142,45,226,0.5);
  background: rgba(142,45,226,0.08);
}

.style-option.active {
  border-color: var(--vt-c-purple);
  background: rgba(142,45,226,0.15);
  box-shadow: 0 0 16px rgba(142,45,226,0.2);
}

.style-icon { font-size: 1.8em; margin-bottom: 8px; }
.style-name { font-size: 0.95em; font-weight: 600; margin-bottom: 6px; }
.style-desc { font-size: 0.75em; color: rgba(255,255,255,0.4); }

/* Save button */
.btn-save {
  padding: 14px 32px;
  background: linear-gradient(135deg, var(--vt-c-purple), var(--vt-c-indigo));
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
  box-shadow: 0 8px 20px rgba(100,108,255,0.3);
}

.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

@keyframes fadeIn  { to { opacity: 1; } }
@keyframes slideIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
@keyframes animate-in { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
.animate-in { animation: slideIn 0.5s ease forwards; }
</style>
