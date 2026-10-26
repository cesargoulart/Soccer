<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '@/firebaseConfig'
import { useEconomyStore } from '@/stores/economy'
import { useClubStore } from '@/stores/club'
import { positionGroup } from '@/services/teamRatings'
import KpiCard from './ui/KpiCard.vue'
import MoneyField from './ui/MoneyField.vue'
import Card from './ui/Card.vue'
import DonutChart from './charts/DonutChart.vue'
import AppIcon from './AppIcon.vue'

// Painel "Informação básica" (design Menus v2) com dados reais do plantel,
// da economia e do estádio. Fica no topo da página do Clube.
interface P { position: string; rating: number; age: number | null }

const economy = useEconomyStore()
const club = useClubStore()
const players = ref<P[]>([])
const loading = ref(true)

onMounted(async () => {
  club.load()
  const user = getAuth().currentUser
  if (!user) return
  try {
    const snap = await getDocs(collection(db, 'users', user.uid, 'players'))
    players.value = snap.docs.map((d) => {
      const x = d.data()
      return { position: x.position ?? '', rating: x.overall ?? x.rating ?? 0, age: x.age ?? null }
    })
  } catch (e) {
    console.error('Erro ao carregar o plantel:', e)
  } finally {
    loading.value = false
  }
})

const count = computed(() => players.value.length)
const avgRating = computed(() => (count.value ? players.value.reduce((a, p) => a + p.rating, 0) / count.value : null))
const best = computed(() => (count.value ? Math.max(...players.value.map((p) => p.rating)) : null))
const aged = computed(() => players.value.filter((p) => p.age !== null))
const avgAge = computed(() => (aged.value.length ? aged.value.reduce((a, p) => a + (p.age as number), 0) / aged.value.length : null))

const eco = computed(() => economy.economyData)
const despesas = computed(() => [
  { label: 'Despesas', value: eco.value?.despesas ?? 0, color: 'var(--exp)' },
  { label: 'Publicidade', value: eco.value?.publicidade ?? 0, color: 'oklch(0.72 0.14 70)' },
  { label: 'Staff', value: eco.value?.staff ?? 0, color: 'oklch(0.62 0.13 300)' },
  { label: 'Salários', value: eco.value?.salarios ?? 0, color: 'oklch(0.65 0.12 230)' },
])
const despesaTotal = computed(() => despesas.value.reduce((a, s) => a + s.value, 0))

const posCount = computed(() => {
  const n = { GK: 0, DEF: 0, MID: 0, ATT: 0 }
  players.value.forEach((p) => n[positionGroup(p.position)]++)
  return [
    { label: 'Guarda-redes', value: n.GK, color: 'oklch(0.55 0.03 160)' },
    { label: 'Defesas', value: n.DEF, color: 'var(--df)' },
    { label: 'Médios', value: n.MID, color: 'var(--mf)' },
    { label: 'Avançados', value: n.ATT, color: 'var(--fw)' },
  ]
})

const levels = computed(() => [
  { label: 'Relvado', n: club.instalacoes.relvado },
  { label: 'Balneários', n: club.instalacoes.balnearios },
  { label: 'Bilheteira', n: club.instalacoes.bilheteira },
])
</script>

<template>
  <div class="overview screen-in">
    <div class="g4">
      <KpiCard label="Jogadores no clube" :value="loading ? null : count" icon="users" :index="0" />
      <KpiCard label="Média" :value="avgRating" :decimals="1" icon="chart" :index="1" />
      <KpiCard label="Melhor jogador" :value="best" icon="target" :index="2" />
      <KpiCard label="Idade média" :value="avgAge" :decimals="1" icon="seedling" :index="3" />
    </div>

    <div class="g2">
      <MoneyField label="Saldo disponível" :value="eco?.lucros ?? 0" />
      <MoneyField label="Salários pagos" :value="eco?.salarios ?? 0" />
    </div>

    <div class="g3">
      <Card title="Despesas" :index="4">
        <DonutChart :segments="despesas" label="Despesa total" :total="despesaTotal" />
      </Card>
      <Card title="Plantel por posição" :index="5">
        <DonutChart :segments="posCount" label="Jogadores" :total="count" unit="" />
      </Card>
      <Card title="Estádio" :index="6">
        <dl class="facts">
          <div><dt>Lotação</dt><dd>{{ club.capacidade.toLocaleString('pt-PT') }}</dd></div>
          <div v-for="l in levels" :key="l.label">
            <dt>{{ l.label }}</dt>
            <dd class="dots">
              <AppIcon v-for="k in 3" :key="k" name="dot" :size="12" :class="{ off: k > l.n }" />
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.overview {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}
.g4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 20px; }
.g2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; }
.g3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
.facts { display: flex; flex-direction: column; }
.facts div {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--line);
  font-weight: 500;
}
.facts div::before {
  content: '';
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--ink);
  margin-right: 10px;
}
.facts dt { flex: 1; }
.facts dd { font-weight: 600; margin: 0; }
.dots { display: flex; gap: 4px; color: var(--ok); }
.dots .off { color: oklch(0.4 0.03 160); }
@media (max-width: 560px) {
  .g2 { grid-template-columns: 1fr; }
}
</style>
