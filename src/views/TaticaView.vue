<template>
  <div class="tatica-view">
    <div class="content-wrapper">
      <!-- Táticas: botões de formação + campo com as 11 posições animadas -->
      <div v-if="modo === 'taticas'" class="split screen-in">
        <Card title="Formação" :index="0">
          <div class="forms">
            <button
              v-for="f in formations"
              :key="f.id"
              type="button"
              :class="{ cur: selectedFormacao === f.id }"
              :title="f.desc"
              @click="selectedFormacao = f.id"
            >
              {{ f.id }}
            </button>
          </div>
        </Card>
        <Card :index="1">
          <Pitch :chips="chips" />
        </Card>
      </div>

      <!-- Campo + plantel -->
      <div v-if="modo === 'onze'" class="board screen-in">
        <!-- Campo -->
        <div class="tactic-card pitch-card">
          <div class="card-head">
            <h2>Onze inicial</h2>
            <div class="head-actions">
              <span class="counter" :class="{ complete: filledCount === 11 }">
                {{ filledCount }}/11
              </span>
              <button class="btn-mini" :disabled="!players.length" @click="autoFill">Auto</button>
              <button class="btn-mini ghost" :disabled="!filledCount" @click="clearLineup">
                Limpar
              </button>
            </div>
          </div>

          <div class="pitch-wrapper">
            <div class="pitch">
              <!-- Marcações -->
              <div class="line halfway"></div>
              <div class="center-circle"></div>
              <div class="center-spot"></div>
              <div class="box box-bottom"></div>
              <div class="six box-bottom-six"></div>
              <div class="box box-top"></div>
              <div class="six box-top-six"></div>

              <!-- Posições -->
              <div
                v-for="slot in slots"
                :key="slot.id"
                class="slot"
                :class="{
                  filled: !!playerAt(slot.id),
                  over: dragOverSlot === slot.id,
                  selected: selectedId && lineup[slot.id] === selectedId,
                  target: !!selectedId && !lineup[slot.id],
                }"
                :style="{ left: slot.x + '%', top: slot.y + '%' }"
                :draggable="!!playerAt(slot.id)"
                @dragstart="onDragStart($event, lineup[slot.id], slot.id)"
                @dragend="clearDrag"
                @dragover.prevent="dragOverSlot = slot.id"
                @dragenter.prevent="dragOverSlot = slot.id"
                @dragleave="dragOverSlot === slot.id && (dragOverSlot = null)"
                @drop.prevent="onDropSlot(slot.id)"
                @click="onSlotClick(slot)"
              >
                <template v-if="playerAt(slot.id)">
                  <div class="jersey" :class="fitClass(slot)">
                    <span class="jersey-num">{{ playerAt(slot.id)!.number ?? '–' }}</span>
                    <span class="jersey-ovr">{{ playerAt(slot.id)!.overall }}</span>
                    <button
                      class="slot-remove"
                      title="Tirar do onze"
                      @click.stop="removeFromSlot(slot.id)"
                    >
                      ×
                    </button>
                  </div>
                  <div class="slot-name">
                    {{ shortName(playerAt(slot.id)!.name) }}
                    <span v-if="fitClass(slot) !== 'fit-ok'" class="warn" :title="fitTitle(slot)"
                      >⚠</span
                    >
                  </div>
                </template>
                <template v-else>
                  <div class="jersey empty">
                    <span class="slot-label">{{ slot.label }}</span>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- Ratings ao vivo -->
          <div class="ratings">
            <div class="rating-item">
              <span class="rating-label">Ataque</span>
              <div class="bar"><i :style="{ width: ratings.attackRating + '%' }"></i></div>
              <span class="rating-value">{{ ratings.attackRating }}</span>
            </div>
            <div class="rating-item">
              <span class="rating-label">Meio</span>
              <div class="bar"><i :style="{ width: ratings.midfieldRating + '%' }"></i></div>
              <span class="rating-value">{{ ratings.midfieldRating }}</span>
            </div>
            <div class="rating-item">
              <span class="rating-label">Defesa</span>
              <div class="bar"><i :style="{ width: ratings.defenseRating + '%' }"></i></div>
              <span class="rating-value">{{ ratings.defenseRating }}</span>
            </div>
            <div class="rating-item overall">
              <span class="rating-label">Geral</span>
              <div class="bar"><i :style="{ width: ratings.overall + '%' }"></i></div>
              <span class="rating-value">{{ ratings.overall }}</span>
            </div>
          </div>
        </div>

        <!-- Plantel -->
        <div
          class="tactic-card bench-card"
          :class="{ 'bench-over': benchOver }"
          @dragover.prevent="benchOver = true"
          @dragleave="benchOver = false"
          @drop.prevent="onDropBench"
        >
          <div class="card-head">
            <h2>Plantel</h2>
            <span class="counter">{{ bench.length }}</span>
          </div>

          <p v-if="loading" class="bench-msg">A carregar jogadores...</p>
          <p v-else-if="!players.length" class="bench-msg">
            Ainda não tens jogadores. Cria o clube na página Clube.
          </p>

          <div v-else class="roster-scroll">
            <table class="roster">
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Nome</th>
                  <th class="n">Méd</th>
                  <th class="n">Idade</th>
                  <th>Qual</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(p, i) in rosterRows"
                  :key="p.id"
                  :class="[slotOf(p.id) ? 'tit' : 'res', { picked: selectedId === p.id }]"
                  :style="{ '--i': i }"
                  draggable="true"
                  @dragstart="onDragStart($event, p.id, slotOf(p.id))"
                  @dragend="clearDrag"
                  @click="onBenchClick(p.id)"
                >
                  <td><PosTag :position="p.position" /></td>
                  <td>{{ p.name }}</td>
                  <td class="n"><span>{{ p.overall }}</span></td>
                  <td class="n"><span>{{ p.age ?? '—' }}</span></td>
                  <td><Stars :value="p.overall" /></td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="bench-tip">
            Arrasta um jogador para o campo — ou toca no jogador e depois na posição.
          </p>
        </div>
      </div>

      <!-- Estilo -->
      <div v-if="modo === 'taticas'" class="tactic-card rise" style="--i: 2">
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

      <!-- Guardar -->
      <div class="save-row">
        <span v-if="errorMsg" class="error-msg">{{ errorMsg }}</span>
        <button class="btn-save" :disabled="saving" @click="saveTatica">
          {{ saving ? 'A guardar...' : saved ? '✓ Guardado' : 'Guardar Tática' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore'
import { auth, db } from '@/firebaseConfig'
import {
  FORMATIONS,
  DEFAULT_FORMATION,
  getFormation,
  suggestLineup,
  positionFitPenalty,
  type Lineup,
  type FormationSlot,
} from '@/services/formations'
import { positionGroup, computeRatings, applyLineup, type PlayerLike } from '@/services/teamRatings'
import Card from '@/components/ui/Card.vue'
import PosTag from '@/components/ui/PosTag.vue'
import Stars from '@/components/ui/Stars.vue'
import Pitch from '@/components/charts/Pitch.vue'

interface SquadPlayer {
  id: string
  name: string
  position: string
  overall: number
  number?: number
  age?: number
}

// 'taticas': escolher formação/estilo · 'onze': montar o onze (definido na rota)
withDefaults(defineProps<{ modo?: 'taticas' | 'onze' }>(), { modo: 'taticas' })

const formations = FORMATIONS

const styles = [
  { id: 'Posse', icon: '🎯', desc: 'Jogo controlado, baixo risco' },
  { id: 'Contra-ataque', icon: '⚡', desc: 'Eficiente, explora espaços' },
  { id: 'Pressão Alta', icon: '🔥', desc: 'Agressivo, jogos mais abertos' },
  { id: 'Equilíbrio', icon: '⚖️', desc: 'Adaptável a qualquer situação' },
]

const selectedFormacao = ref(DEFAULT_FORMATION)
const selectedEstilo = ref('Equilíbrio')
const lineup = ref<Lineup>({})
const players = ref<SquadPlayer[]>([])

const loading = ref(true)
const saving = ref(false)
const saved = ref(false)
const errorMsg = ref('')
const userId = ref<string | null>(null)

// Estado de arrastar / seleção por toque
const dragging = ref<{ playerId: string; fromSlot: string | null } | null>(null)
const dragOverSlot = ref<string | null>(null)
const benchOver = ref(false)
const selectedId = ref<string | null>(null)

// ---------------------------------------------------------------------------
// Derivados
// ---------------------------------------------------------------------------

const slots = computed(() => getFormation(selectedFormacao.value).slots)

const playersById = computed(() => new Map(players.value.map((p) => [p.id, p])))

const usedIds = computed(() => new Set(Object.values(lineup.value)))

// Chips do campo (Táticas): índice estável 0-10, só mudam posição/etiqueta
const chips = computed(() => slots.value.map((sl) => ({ label: sl.label, group: sl.group, x: sl.x, y: sl.y })))

function slotOf(playerId: string): string | null {
  return Object.keys(lineup.value).find((k) => lineup.value[k] === playerId) ?? null
}

// Tabela do Onze inicial: titulares primeiro, depois suplentes por rating
const rosterRows = computed(() => {
  const starters = players.value.filter((p) => usedIds.value.has(p.id)).sort((a, b) => b.overall - a.overall)
  return [...starters, ...bench.value]
})

const bench = computed(() =>
  players.value.filter((p) => !usedIds.value.has(p.id)).sort((a, b) => b.overall - a.overall),
)

const filledCount = computed(() => slots.value.filter((s) => lineup.value[s.id]).length)

const ratings = computed(() => {
  const tactic = {
    formacao: selectedFormacao.value,
    estilo: selectedEstilo.value,
    onze: lineup.value,
  }
  return computeRatings(applyLineup(players.value as PlayerLike[], tactic), tactic)
})

function playerAt(slotId: string): SquadPlayer | null {
  const id = lineup.value[slotId]
  return id ? (playersById.value.get(id) ?? null) : null
}

function fitClass(slot: FormationSlot): string {
  const player = playerAt(slot.id)
  if (!player) return 'fit-ok'
  const penalty = positionFitPenalty(positionGroup(player.position), slot.group)
  if (penalty === 1) return 'fit-ok'
  return penalty < 0.85 ? 'fit-bad' : 'fit-warn'
}

function fitTitle(slot: FormationSlot): string {
  const player = playerAt(slot.id)
  if (!player) return ''
  return `${player.name} é ${player.position} — fora de posição neste lugar`
}

function shortName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  return `${parts[0][0]}. ${parts[parts.length - 1]}`
}

// ---------------------------------------------------------------------------
// Manipulação do onze
// ---------------------------------------------------------------------------

function touched() {
  saved.value = false
  errorMsg.value = ''
}

function assign(slotId: string, playerId: string) {
  if (!playerId || !playersById.value.has(playerId)) return
  const next: Lineup = { ...lineup.value }
  const previousSlot = Object.keys(next).find((k) => next[k] === playerId)
  const occupant = next[slotId]

  if (previousSlot && previousSlot !== slotId) {
    delete next[previousSlot]
    // Troca directa entre dois jogadores já no campo
    if (occupant) next[previousSlot] = occupant
  }
  next[slotId] = playerId
  lineup.value = next
  touched()
}

function removeFromSlot(slotId: string) {
  const next = { ...lineup.value }
  delete next[slotId]
  lineup.value = next
  if (selectedId.value && !Object.values(next).includes(selectedId.value)) selectedId.value = null
  touched()
}

function autoFill() {
  lineup.value = suggestLineup(players.value, selectedFormacao.value, lineup.value, positionGroup)
  selectedId.value = null
  touched()
}

function clearLineup() {
  lineup.value = {}
  selectedId.value = null
  touched()
}

// ---------------------------------------------------------------------------
// Arrastar (rato) + tocar (telemóvel)
// ---------------------------------------------------------------------------

function onDragStart(event: DragEvent, playerId: string | undefined, fromSlot: string | null) {
  if (!playerId) return
  dragging.value = { playerId, fromSlot }
  selectedId.value = null
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', playerId)
  }
}

function clearDrag() {
  dragging.value = null
  dragOverSlot.value = null
  benchOver.value = false
}

function onDropSlot(slotId: string) {
  const playerId = dragging.value?.playerId
  if (playerId) assign(slotId, playerId)
  clearDrag()
}

function onDropBench() {
  const from = dragging.value?.fromSlot
  if (from) removeFromSlot(from)
  clearDrag()
}

function onBenchClick(playerId: string) {
  selectedId.value = selectedId.value === playerId ? null : playerId
}

function onSlotClick(slot: FormationSlot) {
  if (selectedId.value) {
    assign(slot.id, selectedId.value)
    selectedId.value = null
    return
  }
  const current = lineup.value[slot.id]
  // Toca num jogador já no campo para o mover para outra posição
  if (current) selectedId.value = current
}

// Ao mudar de formação, mantém quem está em posições com o mesmo nome
watch(selectedFormacao, (formacao) => {
  const valid = new Set(getFormation(formacao).slots.map((s) => s.id))
  const next: Lineup = {}
  for (const [slotId, playerId] of Object.entries(lineup.value)) {
    if (valid.has(slotId)) next[slotId] = playerId
  }
  lineup.value = next
  touched()
})

// ---------------------------------------------------------------------------
// Firestore
// ---------------------------------------------------------------------------

async function load(uid: string) {
  loading.value = true
  try {
    const [userSnap, playersSnap] = await Promise.all([
      getDoc(doc(db, 'users', uid)),
      getDocs(collection(db, 'users', uid, 'players')),
    ])

    players.value = playersSnap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        name: data.name ?? 'Jogador',
        position: data.position ?? 'Meio-campo',
        overall: data.overall ?? data.rating ?? 70,
        number: data.number,
        age: data.age,
      }
    })

    const tatica = userSnap.exists() ? userSnap.data().tatica : null
    if (tatica) {
      selectedFormacao.value = tatica.formacao ?? DEFAULT_FORMATION
      selectedEstilo.value = tatica.estilo ?? 'Equilíbrio'
      // Só mantém jogadores que ainda existem no plantel
      const known = new Set(players.value.map((p) => p.id))
      const stored: Lineup = tatica.onze ?? {}
      const clean: Lineup = {}
      for (const [slotId, playerId] of Object.entries(stored)) {
        if (known.has(playerId)) clean[slotId] = playerId
      }
      lineup.value = clean
    }

    // Primeira visita sem onze guardado: sugere um de partida
    if (!Object.keys(lineup.value).length && players.value.length) {
      lineup.value = suggestLineup(players.value, selectedFormacao.value, {}, positionGroup)
    }
  } catch (error) {
    console.error('Erro ao carregar a tática:', error)
    errorMsg.value = 'Não foi possível carregar os dados da equipa.'
  } finally {
    loading.value = false
  }
}

async function saveTatica() {
  const uid = userId.value
  if (!uid) return

  if (players.value.length >= 11 && filledCount.value < 11) {
    errorMsg.value = `Faltam ${11 - filledCount.value} jogadores no campo.`
    return
  }

  saving.value = true
  saved.value = false
  errorMsg.value = ''
  try {
    await setDoc(
      doc(db, 'users', uid),
      {
        tatica: {
          formacao: selectedFormacao.value,
          estilo: selectedEstilo.value,
          onze: lineup.value,
        },
      },
      { merge: true },
    )
    saved.value = true
    setTimeout(() => (saved.value = false), 2500)
  } catch (error) {
    console.error('Erro ao guardar a tática:', error)
    errorMsg.value = 'Não foi possível guardar. Tenta outra vez.'
  } finally {
    saving.value = false
  }
}

let authListener: (() => void) | null = null

onMounted(() => {
  authListener = auth.onAuthStateChanged((user) => {
    if (user) {
      userId.value = user.uid
      load(user.uid)
    } else {
      userId.value = null
      players.value = []
      lineup.value = {}
      loading.value = false
    }
  })
})

onUnmounted(() => {
  if (authListener) authListener()
})
</script>

<style scoped>
.tatica-view {
  padding: 20px;
  color: #fff;
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
  max-width: 1240px;
  margin: 0 auto;
  display: grid;
  gap: 24px;
}

.tactic-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(46, 207, 133, 0.2);
  border-radius: 20px;
  padding: 24px;
}

.tactic-card h2 {
  font-size: 1.3em;
  color: var(--vt-c-indigo);
  margin: 0 0 20px;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.card-head h2 {
  margin: 0;
}

.hint {
  font-size: 0.75em;
  color: rgba(255, 255, 255, 0.35);
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.counter {
  font-size: 0.8em;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.6);
}

.counter.complete {
  background: rgba(46, 204, 113, 0.15);
  color: #58d68d;
}

.btn-mini {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid rgba(46, 207, 133, 0.35);
  background: rgba(46, 207, 133, 0.12);
  color: #cdd3ff;
  font-size: 0.78em;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-mini:hover:not(:disabled) {
  background: rgba(46, 207, 133, 0.25);
}

.btn-mini.ghost {
  border-color: rgba(255, 255, 255, 0.15);
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
}

.btn-mini:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ------------------------------------------------------------------ Campo */

.board {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 24px;
  align-items: start;
}

.pitch-wrapper {
  display: flex;
  justify-content: center;
}

.pitch {
  position: relative;
  width: 100%;
  max-width: 560px;
  aspect-ratio: 68 / 100;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  background:
    repeating-linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.035) 0 8%,
      rgba(0, 0, 0, 0.03) 8% 16%
    ),
    linear-gradient(180deg, #14532d 0%, #166534 45%, #14532d 100%);
  box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.45);
  overflow: hidden;
}

.line,
.box,
.six,
.center-circle,
.center-spot {
  position: absolute;
  border-color: rgba(255, 255, 255, 0.3);
}

.halfway {
  left: 0;
  right: 0;
  top: 50%;
  border-top: 2px solid rgba(255, 255, 255, 0.3);
}

.center-circle {
  left: 50%;
  top: 50%;
  width: 28%;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
}

.center-spot {
  left: 50%;
  top: 50%;
  width: 6px;
  height: 6px;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.35);
  border-radius: 50%;
}

.box {
  left: 21%;
  width: 58%;
  height: 16%;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.box-bottom {
  bottom: 0;
  border-bottom: none;
}

.box-top {
  top: 0;
  border-top: none;
}

.six {
  left: 36%;
  width: 28%;
  height: 6.5%;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.box-bottom-six {
  bottom: 0;
  border-bottom: none;
}

.box-top-six {
  top: 0;
  border-top: none;
}

.slot {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  z-index: 2;
}

.jersey {
  position: relative;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1em;
  color: #fff;
  background: linear-gradient(160deg, #6c74ff, #4b53d6);
  border: 2px solid rgba(255, 255, 255, 0.75);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.slot:hover .jersey {
  transform: scale(1.08);
}

.jersey.empty {
  background: rgba(0, 0, 0, 0.25);
  border: 2px dashed rgba(255, 255, 255, 0.4);
  box-shadow: none;
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.72em;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.jersey.fit-warn {
  background: linear-gradient(160deg, #d99a2b, #b57a15);
}

.jersey.fit-bad {
  background: linear-gradient(160deg, #d9534f, #a83733);
}

.jersey-ovr {
  position: absolute;
  bottom: -5px;
  right: -6px;
  font-size: 0.6em;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 999px;
  background: #101010;
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #d7dcff;
}

.slot-remove {
  position: absolute;
  top: -7px;
  right: -7px;
  width: 18px;
  height: 18px;
  line-height: 1;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: #0a2e24;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.slot:hover .slot-remove {
  opacity: 1;
}

.slot-name {
  font-size: 0.66em;
  font-weight: 600;
  white-space: nowrap;
  padding: 2px 7px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
}

.warn {
  color: #ffcd6b;
}

.slot.over .jersey,
.slot.target .jersey {
  border-color: #a6f2cc;
  box-shadow: 0 0 0 4px rgba(166, 242, 204, 0.35);
}

.slot.selected .jersey {
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.55);
}

/* Ratings */

.ratings {
  display: grid;
  gap: 8px;
  margin-top: 20px;
}

.rating-item {
  display: grid;
  grid-template-columns: 62px 1fr 32px;
  align-items: center;
  gap: 10px;
  font-size: 0.78em;
}

.rating-label {
  color: rgba(255, 255, 255, 0.5);
}

.bar {
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.bar i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--vt-c-indigo), var(--vt-c-purple));
  transition: width 0.3s ease;
}

.rating-value {
  font-weight: 700;
  text-align: right;
}

.rating-item.overall .rating-label,
.rating-item.overall .rating-value {
  color: #a6f2cc;
}

/* ---------------------------------------------------------------- Plantel */

.bench-card {
  display: flex;
  flex-direction: column;
  max-height: 760px;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.bench-card.bench-over {
  border-color: rgba(46, 207, 133, 0.6);
  background: rgba(46, 207, 133, 0.07);
}

.bench-msg {
  font-size: 0.82em;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
}

.bench-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 6px;
  overflow-y: auto;
  flex: 1;
}

.bench-item {
  display: grid;
  grid-template-columns: 28px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
  cursor: grab;
  transition: all 0.15s ease;
}

.bench-item:hover {
  border-color: rgba(46, 207, 133, 0.45);
  background: rgba(46, 207, 133, 0.1);
}

.bench-item:active {
  cursor: grabbing;
}

.bench-item.picked {
  border-color: var(--vt-c-indigo);
  background: rgba(46, 207, 133, 0.18);
  box-shadow: 0 0 12px rgba(46, 207, 133, 0.25);
}

.bench-num {
  font-size: 0.72em;
  font-weight: 700;
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
}

.bench-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.bench-name {
  font-size: 0.85em;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bench-pos {
  font-size: 0.68em;
  color: rgba(255, 255, 255, 0.4);
}

.bench-ovr {
  font-size: 0.8em;
  font-weight: 700;
  color: #a6f2cc;
}

.bench-tip {
  margin: 14px 0 0;
  font-size: 0.7em;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.35);
}

/* ------------------------------------------------------------- Formações */

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
  border: 1px solid rgba(46, 207, 133, 0.2);
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
}

.formation-option:hover {
  border-color: rgba(46, 207, 133, 0.5);
  background: rgba(46, 207, 133, 0.08);
}

.formation-option.active {
  border-color: var(--vt-c-indigo);
  background: rgba(46, 207, 133, 0.15);
  box-shadow: 0 0 16px rgba(46, 207, 133, 0.2);
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
  background: rgba(166, 242, 204, 0.5);
  display: inline-block;
  transition: background 0.2s;
}

.formation-option.active .player-dot {
  background: #a6f2cc;
}

.formation-label {
  font-size: 1.05em;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.formation-desc {
  font-size: 0.75em;
  color: rgba(255, 255, 255, 0.4);
}

/* ---------------------------------------------------------------- Estilos */

.style-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
}

.style-option {
  padding: 20px 16px;
  border-radius: 14px;
  border: 1px solid rgba(31, 165, 106, 0.2);
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
}

.style-option:hover {
  border-color: rgba(31, 165, 106, 0.5);
  background: rgba(31, 165, 106, 0.08);
}

.style-option.active {
  border-color: var(--vt-c-purple);
  background: rgba(31, 165, 106, 0.15);
  box-shadow: 0 0 16px rgba(31, 165, 106, 0.2);
}

.style-icon {
  font-size: 1.8em;
  margin-bottom: 8px;
}

.style-name {
  font-size: 0.95em;
  font-weight: 600;
  margin-bottom: 6px;
}

.style-desc {
  font-size: 0.75em;
  color: rgba(255, 255, 255, 0.4);
}

/* ---------------------------------------------------------------- Guardar */

.save-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
}

.error-msg {
  font-size: 0.82em;
  color: #ff9b9b;
}

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
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(46, 207, 133, 0.3);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 980px) {
  .board {
    grid-template-columns: 1fr;
  }

  .bench-card {
    max-height: 420px;
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  opacity: 0;
  animation: slideIn 0.5s ease forwards;
}

/* ------------------------------------------------------------ Menus v2 */
.content-wrapper { max-width: none; }
.split { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 20px; align-items: start; }
.forms { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 22px; }
.forms button {
  height: 94px;
  border-radius: 4px;
  background: var(--card2);
  color: var(--ink);
  font: inherit;
  font-size: 30px;
  font-weight: 500;
  letter-spacing: 0.04em;
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s, background 0.2s;
}
.forms button:hover { border-color: var(--ink); transform: translateY(-2px); }
.forms button.cur {
  border-color: oklch(0.85 0.15 120);
  background: oklch(0.3 0.06 155 / 0.8);
  box-shadow: 0 0 18px oklch(0.85 0.15 120 / 0.25);
}
.tactic-card {
  background: var(--card);
  border: 0;
  border-radius: 6px;
  padding: 18px;
  backdrop-filter: blur(6px);
  box-shadow: 0 8px 24px oklch(0.1 0.03 170 / 0.25);
}
.tactic-card h2 { color: var(--ink); font-size: 16px; font-weight: 600; }
.roster-scroll { max-height: 640px; overflow: auto; }
.roster { width: 100%; border-collapse: collapse; }
.roster th { font-size: 12px; font-weight: 600; text-align: left; padding: 4px 8px 12px; color: var(--mute); text-transform: none; letter-spacing: 0; }
.roster td { padding: 6px 8px; border-bottom: 1px solid var(--line); font-weight: 500; white-space: nowrap; }
.roster td.n, .roster th.n { text-align: center; }
.roster td.n span { background: oklch(0.45 0.05 150 / 0.6); padding: 2px 6px; border-radius: 2px; font-size: 12px; font-weight: 600; }
.roster tbody tr { opacity: 0; animation: rowin 0.4s ease forwards; animation-delay: calc(var(--i) * 35ms); cursor: grab; }
.roster tbody tr:hover td { background: oklch(0.55 0.06 150 / 0.2); }
.roster tr.tit td:first-child { box-shadow: inset 3px 0 oklch(0.82 0.16 125); }
.roster tr.res td:first-child { box-shadow: inset 3px 0 oklch(0.8 0.15 85); }
.roster tr.picked td { background: oklch(0.62 0.05 150 / 0.35); }
@keyframes rowin { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: none; } }
@media (max-width: 1100px) {
  .split { grid-template-columns: 1fr; }
  .forms { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 560px) {
  .forms { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .forms button { height: 70px; font-size: 24px; }
}
.split :deep(.pitch) { max-width: 360px; margin: 0 auto; }
</style>
