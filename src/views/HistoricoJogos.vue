<template>
  <div class="historico-view">
    <h1 class="title">Histórico de Jogos</h1>

    <!-- Navigation Links -->
    <div class="navigation-links">
      <router-link to="/jogos" class="nav-link">
        <span class="icon"><i class="fas fa-arrow-left"></i></span>
        Voltar para Jogos
      </router-link>
      <router-link to="/jogos/calendario" class="nav-link">
        <span class="icon"><i class="fas fa-calendar-alt"></i></span>
        Calendário Completo
      </router-link>
    </div>

    <div class="content-wrapper">
      <div class="historico-section animate-slide-in">
        <h2>Todos os Resultados</h2>

        <div v-if="groupedCompletedFixtures.length > 0">
          <div v-for="(monthGroup, index) in groupedCompletedFixtures" :key="index" class="month-group">
            <h3 class="month-title">{{ monthGroup.month }}</h3>

            <div class="matches-grid">
              <div
                v-for="(fixture, fixtureIndex) in monthGroup.fixtures"
                :key="`result-${index}-${fixtureIndex}`"
                class="match-card result"
                :class="{
                  'home-win': fixture.homeScore > fixture.awayScore,
                  'away-win': fixture.homeScore < fixture.awayScore,
                  'draw': fixture.homeScore === fixture.awayScore,
                }"
              >
                <div class="match-header">
                  <span class="match-date">{{ fixture.date }}</span>
                  <span class="match-competition">{{ fixture.competition }}</span>
                </div>
                <div class="match-teams">
                  <span class="team home">{{ fixture.homeTeam }}</span>
                  <span class="score">{{ fixture.homeScore }} - {{ fixture.awayScore }}</span>
                  <span class="team away">{{ fixture.awayTeam }}</span>
                </div>
                <div class="match-info">
                  <span class="match-stadium">{{ fixture.stadium }}</span>
                  <span class="match-status completed">Terminado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <p>{{ loadingMessage || 'Não há resultados disponíveis.' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebaseConfig'

// Interface para jogos completados
interface CompletedFixture {
  id?: string       // ID do documento no Firestore (se disponível)
  homeTeam: string
  awayTeam: string
  date: string      // Formatted date string for display
  matchDate: Date   // Actual Date object for calculations
  time: string
  competition: string
  stadium: string
  homeScore: number  // Score for home team
  awayScore: number  // Score for away team
}

// Interface para agrupar jogos por mês
interface MonthGroup {
  month: string
  fixtures: CompletedFixture[]
}

// Refs para armazenar dados
const completedFixtures = ref<CompletedFixture[]>([])
const loadingMessage = ref('A carregar resultados históricos...')

// Fetch completed fixtures from Firestore
const fetchCompletedFixtures = async () => {
  try {
    const fixturesRef = collection(db, 'completedFixtures')
    const querySnapshot = await getDocs(fixturesRef)

    const fixtures: CompletedFixture[] = []
    querySnapshot.forEach(doc => {
      const data = doc.data()
      fixtures.push({
        id: doc.id,
        ...data,
        matchDate: data.matchDate?.toDate() || new Date() // Handle potential Timestamp
      } as CompletedFixture)
    })

    // Ordenar do mais recente para o mais antigo
    fixtures.sort((a, b) => b.matchDate.getTime() - a.matchDate.getTime())
    completedFixtures.value = fixtures

    loadingMessage.value = fixtures.length > 0 ? '' : 'Não há resultados disponíveis.'
    console.log(`Fetched ${fixtures.length} completed fixtures from Firestore`)
  } catch (error) {
    console.error('Error fetching completed fixtures:', error)
    loadingMessage.value = 'Erro ao carregar histórico de jogos.'
  }
}

// Computed property to group completed fixtures by month
const groupedCompletedFixtures = computed(() => {
  const monthGroups: { [key: string]: CompletedFixture[] } = {}

  // Agrupar por mês
  completedFixtures.value.forEach(fixture => {
    const monthYear = fixture.matchDate.toLocaleDateString('pt-PT', {
      month: 'long',
      year: 'numeric'
    })

    if (!monthGroups[monthYear]) {
      monthGroups[monthYear] = []
    }

    monthGroups[monthYear].push(fixture)
  })

  // Converter para array para ordenar
  const sortedGroups: MonthGroup[] = Object.keys(monthGroups).map(monthYear => ({
    month: monthYear,
    fixtures: monthGroups[monthYear]
  }))

  // Ordenar meses do mais recente para o mais antigo
  sortedGroups.sort((a, b) => {
    const aDate = new Date(a.fixtures[0].matchDate)
    const bDate = new Date(b.fixtures[0].matchDate)
    return bDate.getTime() - aDate.getTime()
  })

  return sortedGroups
})

// Inicialização
onMounted(async () => {
  await fetchCompletedFixtures()
})
</script>

<style scoped>
/* Estilo específico para esta página */
.historico-view {
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

.historico-section {
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

.month-group {
  margin-bottom: 40px;
}

.month-title {
  font-size: 1.5em;
  color: #a8b4ff;
  margin-bottom: 15px;
  padding-bottom: 5px;
  border-bottom: 1px solid rgba(100, 108, 255, 0.3);
  text-transform: capitalize;
}

/* Match card styles */
.matches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.match-card {
  padding: 20px;
  background: rgba(30, 30, 30, 0.5);
  border-radius: 10px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.match-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.match-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 0.9em;
  color: #a0a0a0;
}

.match-teams {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 15px 0;
  font-size: 1.1em;
}

.score {
  padding: 5px 10px;
  background: rgba(100, 108, 255, 0.2);
  border-radius: 5px;
  color: #646cff;
}

.match-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.9em;
  color: #a0a0a0;
}

.match-stadium {
  font-style: italic;
}

.match-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.completed {
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
}

/* Result indicators */
.match-card.result::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 30px 30px 0;
  border-color: transparent;
}

.home-win::after {
  border-color: transparent #4caf50 transparent transparent;
}

.away-win::after {
  border-color: transparent #2196f3 transparent transparent;
}

.draw::after {
  border-color: transparent #ffc107 transparent transparent;
}

/* Team emphasis */
.home-win .team.home {
  font-weight: bold;
  color: #4caf50;
}

.away-win .team.away {
  font-weight: bold;
  color: #4caf50;
}

.draw .score {
  color: #ffc107;
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
