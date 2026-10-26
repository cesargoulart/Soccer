<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebaseConfig'
import { useClubStore } from '@/stores/club'
import Card from '@/components/ui/Card.vue'
import KpiCard from '@/components/ui/KpiCard.vue'
import LineChart from '@/components/charts/LineChart.vue'

// Bilhetes: receita de bilheteira dos jogos em casa. O jogo não guarda a assistência
// de cada partida, por isso preço e ocupação vêm dos níveis ATUAIS do estádio
// (a mesma fórmula que credita a receita em JogosView) — são valores estimados.
interface Game { id: string; date: Date; opponent: string; competition: string }

const club = useClubStore()
const games = ref<Game[]>([])
const loading = ref(true)

const price = computed(() => [8, 12, 18][club.instalacoes.bilheteira - 1] ?? 8)
const occupancy = computed(() => [0.65, 0.7, 0.75][club.instalacoes.relvado - 1] ?? 0.65)
const perGame = computed(() => Math.round(club.capacidade * occupancy.value * price.value))

onMounted(async () => {
  await club.load()
  try {
    const snap = await getDocs(collection(db, 'completedFixtures'))
    games.value = snap.docs
      .map((d) => d.data())
      .filter((d) => d.homeTeam === club.team)
      .map((d, i) => ({
        id: String(i),
        date: d.matchDate?.toDate?.() ?? new Date(),
        opponent: d.awayTeam as string,
        competition: (d.competition as string) ?? '—',
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  } catch (e) {
    console.error('Erro ao carregar jogos:', e)
  } finally {
    loading.value = false
  }
})

const recent = computed(() => games.value.slice(-8))
const total = computed(() => games.value.length * perGame.value)
const points = computed(() =>
  recent.value.map((g, i) => ({
    label: g.date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' }),
    value: (games.value.length - recent.value.length + i + 1) * perGame.value,
  })),
)
const rows = computed(() => [...games.value].reverse())
const eur = (v: number) => '€' + v.toLocaleString('pt-PT')
const fmtDate = (d: Date) => d.toLocaleDateString('pt-PT')
</script>

<template>
  <div class="bilhetes-view screen-in">
    <div class="g4">
      <KpiCard label="Lotação" :value="club.capacidade" icon="stadium" :index="0" />
      <KpiCard label="Preço do bilhete" :value="price" suffix=" €" icon="ticket" :index="1" />
      <KpiCard label="Ocupação estimada" :value="Math.round(occupancy * 100)" suffix="%" icon="users" :index="2" />
      <KpiCard label="Receita acumulada" :value="total" suffix=" €" icon="chart" :index="3" />
    </div>

    <Card title="Receita acumulada de bilheteira (jogos em casa)" :index="4">
      <LineChart v-if="points.length >= 2" :points="points" :format="eur" />
      <p v-else class="empty">{{ loading ? 'A carregar...' : 'Ainda há poucos jogos em casa para desenhar o gráfico.' }}</p>
    </Card>

    <Card title="Jogos em casa" :index="5">
      <p v-if="!loading && !rows.length" class="empty">Ainda não jogaste em casa.</p>
      <div v-else class="scroll">
        <table>
          <thead>
            <tr><th>Data</th><th>Adversário</th><th>Competição</th><th>Preço</th><th>Receita</th><th>Assistência</th></tr>
          </thead>
          <tbody>
            <tr v-for="(g, i) in rows" :key="g.id" :style="{ '--i': i }">
              <td>{{ fmtDate(g.date) }}</td>
              <td>{{ g.opponent }}</td>
              <td>{{ g.competition }}</td>
              <td>{{ eur(price) }}</td>
              <td>{{ eur(perGame) }}</td>
              <td class="att">
                <span class="bar2"><i :style="{ '--w': occupancy * 100 + '%' }"></i></span>
                <b>{{ Math.round(occupancy * 100) }}%</b>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="note">Valores estimados com os níveis atuais de estádio, relvado e bilheteira.</p>
    </Card>
  </div>
</template>

<style scoped>
.bilhetes-view { padding: 22px 24px 40px; display: flex; flex-direction: column; gap: 20px; }
.g4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 20px; }
.scroll { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th { font-size: 12px; font-weight: 600; text-align: left; padding: 4px 8px 12px; color: var(--mute); text-transform: none; letter-spacing: 0; }
td { padding: 8px; border-bottom: 1px solid var(--line); font-weight: 500; white-space: nowrap; }
tbody tr { opacity: 0; animation: rowin 0.4s ease forwards; animation-delay: calc(var(--i) * 35ms); }
tbody tr:hover td { background: oklch(0.55 0.06 150 / 0.2); }
@keyframes rowin { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: none; } }
.att { display: flex; align-items: center; gap: 10px; min-width: 160px; }
.bar2 { flex: 1; height: 6px; background: oklch(0.4 0.04 155 / 0.6); border-radius: 3px; overflow: hidden; }
.bar2 i { display: block; height: 100%; width: 0; background: var(--ok); border-radius: 3px; animation: fill 1s cubic-bezier(0.3, 0.8, 0.3, 1) forwards; }
@keyframes fill { to { width: var(--w); } }
.empty, .note { color: var(--mute); font-size: 13px; }
.note { margin-top: 12px; font-size: 12px; }
@media (max-width: 900px) { .bilhetes-view { padding: 14px; } }
</style>
