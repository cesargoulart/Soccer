<template>
  <div class="calendario-view">
    <h1 class="title">Calendário Completo</h1>

    <!-- Navigation Links -->
    <div class="navigation-links">
      <router-link to="/jogos" class="nav-link">
        <span class="icon"><i class="fas fa-arrow-left"></i></span>
        Voltar para Jogos
      </router-link>
      <router-link to="/jogos/historico" class="nav-link">
        <span class="icon"><i class="fas fa-history"></i></span>
        Histórico de Jogos
      </router-link>
    </div>

    <div class="content-wrapper">
      <div class="calendario-section animate-slide-in">
        <h2>Todos os Jogos Futuros</h2>

        <div v-if="Object.keys(groupedUpcomingFixtures).length > 0">
          <div
            v-for="(weekFixtures, weekKey) in groupedUpcomingFixtures"
            :key="weekKey"
            class="week-group"
          >
            <h3 class="week-title">{{ weekKey }}</h3>
            <table class="fixtures-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Hora</th>
                  <th>Equipa Casa</th>
                  <th></th>
                  <!-- VS column -->
                  <th>Equipa Fora</th>
                  <th>Competição</th>
                  <th>Estádio</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(fixture, index) in weekFixtures" :key="`${weekKey}-${index}`">
                  <td>{{ fixture.date }}</td>
                  <td>{{ fixture.time }}</td>
                  <td class="team-name">{{ fixture.homeTeam }}</td>
                  <td class="vs-cell">
                    <router-link
                      :to="{
                        name: 'detalhes-jogo',
                        params: { id: fixture.id },
                        query: { from: $route.fullPath }
                      }"
                      class="vs-link"
                    >
                      VS
                    </router-link>
                  </td>
                  <td class="team-name">{{ fixture.awayTeam }}</td>
                  <td>{{ fixture.competition }}</td>
                  <td>{{ fixture.stadium }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else>
          <p>{{ loadingMessage || 'Não há jogos futuros agendados.' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebaseConfig'

// Interface para jogos futuros
interface UpcomingFixture {
  id?: string       // ID do documento no Firestore (se disponível)
  homeTeam: string
  awayTeam: string
  date: string      // Formatted date string for display
  matchDate: Date   // Actual Date object for calculations
  time: string
  competition: string
  stadium: string
}

// Refs para armazenar dados
const upcomingFixtures = ref<UpcomingFixture[]>([])
const loadingMessage = ref('A carregar jogos futuros...')

// Fetch upcoming fixtures from Firestore
const fetchUpcomingFixtures = async () => {
  try {
    const fixturesRef = collection(db, 'upcomingFixtures')
    const querySnapshot = await getDocs(fixturesRef)

    const fixtures: UpcomingFixture[] = []
    querySnapshot.forEach(doc => {
      const data = doc.data()
      fixtures.push({
        id: doc.id,
        ...data,
        matchDate: data.matchDate?.toDate() || new Date() // Handle potential Timestamp
      } as UpcomingFixture)
    })

    // Ordenar por data
    fixtures.sort((a, b) => a.matchDate.getTime() - b.matchDate.getTime())
    upcomingFixtures.value = fixtures

    loadingMessage.value = fixtures.length > 0 ? '' : 'Não há jogos futuros disponíveis.'
    console.log(`Fetched ${fixtures.length} upcoming fixtures from Firestore`)
  } catch (error) {
    console.error('Error fetching upcoming fixtures:', error)
    loadingMessage.value = 'Erro ao carregar jogos futuros.'
  }
}

// Helper function to get ISO week number
const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

// Computed property to group upcoming fixtures by week
const groupedUpcomingFixtures = computed(() => {
  const groups: { [key: string]: UpcomingFixture[] } = {}
  upcomingFixtures.value.forEach((fixture) => {
    const weekNum = getWeekNumber(fixture.matchDate)
    const year = fixture.matchDate.getFullYear()
    const weekKey = `Semana ${weekNum}, ${year}` // Key like "Semana 17, 2025"
    if (!groups[weekKey]) {
      groups[weekKey] = []
    }
    groups[weekKey].push(fixture)
  })

  // Sort weeks chronologically
  const sortedWeeks = Object.keys(groups).sort((a, b) => {
    const [, weekA, yearA] = a.match(/Semana (\d+), (\d+)/) || []
    const [, weekB, yearB] = b.match(/Semana (\d+), (\d+)/) || []
    if (!weekA || !weekB) return 0
    if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB)
    return parseInt(weekA) - parseInt(weekB)
  })

  const sortedGroups: { [key: string]: UpcomingFixture[] } = {}
  sortedWeeks.forEach((weekKey) => {
    sortedGroups[weekKey] = groups[weekKey]
  })

  return sortedGroups
})

// Inicialização
onMounted(async () => {
  await fetchUpcomingFixtures()
})
</script>

<style scoped>
/* Estilo específico para esta página */
.calendario-view {
  padding: 20px;
  color: #fff;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}

.title {
  font-size: 2.5em;
  margin-bottom: 30px;
  text-align: center;
  background: linear-gradient(45deg, #646cff, #a855f7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  opacity: 0;
  animation: fadeIn 0.5s ease forwards;
}

/* Navigation links styles */
.navigation-links {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 30px;
  opacity: 0;
  animation: fadeIn 0.5s ease forwards 0.2s;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  background: rgba(100, 108, 255, 0.15);
  border-radius: 50px;
  color: #a8b4ff;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid rgba(100, 108, 255, 0.3);
}

.nav-link:hover {
  background: rgba(100, 108, 255, 0.3);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(100, 108, 255, 0.2);
}

.nav-link .icon {
  margin-right: 10px;
  font-size: 1.1em;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.calendario-section {
  background: rgba(45, 45, 45, 0.7);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0;
  transform: translateY(20px);
}

.animate-slide-in {
  animation: slideIn 0.6s ease forwards;
}

h2 {
  font-size: 1.8em;
  margin-bottom: 20px;
  color: #646cff;
}

.week-group {
  margin-bottom: 30px;
}

.week-title {
  font-size: 1.5em;
  color: #a8b4ff;
  margin-bottom: 15px;
  padding-bottom: 5px;
  border-bottom: 1px solid rgba(100, 108, 255, 0.3);
}

/* Table styles */
.fixtures-table {
  width: 100%;
  border-collapse: collapse;
  color: #e0e0e0;
}

.fixtures-table th,
.fixtures-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap;
}

.fixtures-table th {
  background-color: rgba(64, 76, 255, 0.2);
  color: #a8b4ff;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.9em;
}

.fixtures-table tbody tr {
  transition: background-color 0.3s ease;
}

.fixtures-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.fixtures-table .team-name {
  font-weight: 500;
}

.fixtures-table .vs-cell {
  text-align: center;
  padding: 12px 5px;
}

.vs-link {
  display: inline-block;
  font-weight: bold;
  color: #646cff;
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.vs-link:hover {
  background: rgba(100, 108, 255, 0.15);
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(100, 108, 255, 0.3);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
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
</style>
