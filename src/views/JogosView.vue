<template>
  <div class="jogos-view">
    <h1 class="title">Jogos</h1>

    <!-- Navigation Links -->
    <div class="navigation-links">
      <router-link to="/jogos/calendario" class="nav-link">
        <span class="icon"><AppIcon name="calendar" :size="16" /></span>
        Calendário Completo
      </router-link>
      <router-link to="/jogos/historico" class="nav-link">
        <span class="icon"><AppIcon name="history" :size="16" /></span>
        Histórico de Jogos
      </router-link>
    </div>

    <SaturdayCountdown />

    <div class="content-wrapper">
      <!-- Upcoming Matches Section -->
      <div class="matches-section animate-slide-in">
        <div class="section-header">
          <h2>Próximos Jogos</h2>
          <button v-if="!showAllUpcoming" class="view-all-link" @click="showAllUpcoming = true">
            Ver todos <span class="arrow">→</span>
          </button>
          <button v-else class="view-all-link my-only" @click="showAllUpcoming = false">
            <span class="arrow">←</span> Só os meus
          </button>
        </div>

        <div v-if="Object.keys(nextTwoWeeksFixtures).length > 0">
          <div
            v-for="(weekFixtures, weekKey) in nextTwoWeeksFixtures"
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
                  <!-- Improved key -->
                  <td>{{ fixture.date }}</td>
                  <td>{{ fixture.time }}</td>
                  <td class="team-name">{{ fixture.homeTeam }}</td>
                  <td class="vs-cell">VS</td>
                  <td class="team-name">{{ fixture.awayTeam }}</td>
                  <td>{{ fixture.competition }}</td>
                  <td>{{ fixture.stadium }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else>
          <p>{{ loadingMessage || 'Não há jogos agendados nas próximas duas semanas.' }}</p>
        </div>
      </div>

      <!-- Results Section -->
      <div class="results-section animate-slide-in" style="animation-delay: 0.2s">
        <div class="section-header">
          <h2>Últimos Resultados</h2>
          <button v-if="!showAllResults" class="view-all-link" @click="showAllResults = true">
            Ver todos <span class="arrow">→</span>
          </button>
          <button v-else class="view-all-link my-only" @click="showAllResults = false">
            <span class="arrow">←</span> Só os meus
          </button>
        </div>

        <div v-if="latestResults.length > 0" class="matches-grid">
          <!-- Loop through limited completed fixtures -->
          <div
            v-for="(fixture, index) in latestResults"
            :key="`result-${index}`"
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
        <div v-else>
          <p>Ainda não há resultados disponíveis.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { collection, getDocs, addDoc, deleteDoc, doc, getDoc, updateDoc, setDoc, query, where, Timestamp } from 'firebase/firestore'
import { db } from '@/firebaseConfig'
import { getAuth } from 'firebase/auth'
import SaturdayCountdown from '@/components/SaturdayCountdown.vue'
import AppIcon from '@/components/AppIcon.vue'

// Interfaces separadas para jogos futuros e completados
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

// Refs separados para jogos futuros e completados
const upcomingFixtures = ref<UpcomingFixture[]>([])
const completedFixtures = ref<CompletedFixture[]>([])
const leagueTeams = ref<string[]>([])
const loadingMessage = ref('A carregar equipas...')
const LEAGUE_SIZE = 8
const userTeam = ref<string | null>(null)
const showAllUpcoming = ref(false)
const showAllResults = ref(false)

interface UserTactic {
  formacao: string
  estilo: string
}

interface UserStadiumData {
  clubeId: string
  capacidade: number
  instalacoes: { relvado: number; balnearios: number; bilheteira: number }
}

const userTactic = ref<UserTactic | null>(null)
const userStadiumData = ref<UserStadiumData | null>(null)

const fetchUserTeam = async () => {
  const user = getAuth().currentUser
  if (!user) return
  const snap = await getDoc(doc(db, 'users', user.uid))
  if (snap.exists()) {
    userTeam.value = snap.data().team ?? null
    if (snap.data().tatica) userTactic.value = snap.data().tatica
  }
}

const loadUserStadium = async () => {
  if (!userTeam.value) return
  const q = query(collection(db, 'clubes'), where('nome', '==', userTeam.value))
  const qSnap = await getDocs(q)
  if (!qSnap.empty) {
    const d = qSnap.docs[0].data()
    userStadiumData.value = {
      clubeId: qSnap.docs[0].id,
      capacidade: d.capacidade ?? 5000,
      instalacoes: {
        relvado:    d.instalacoes?.relvado    ?? 1,
        balnearios: d.instalacoes?.balnearios ?? 1,
        bilheteira: d.instalacoes?.bilheteira ?? 1,
      }
    }
  }
}

function simulateUserMatch(isHome: boolean): { homeScore: number; awayScore: number } {
  const formacao = userTactic.value?.formacao ?? '4-4-2'
  const estilo   = userTactic.value?.estilo   ?? 'Equilíbrio'

  let winProb  = isHome ? 0.45 : 0.30
  let drawProb = 0.25

  if (formacao === '4-3-3')   { winProb += 0.08; drawProb -= 0.04 }
  else if (formacao === '5-3-2')   { winProb -= 0.10; drawProb += 0.12 }
  else if (formacao === '3-5-2')   { drawProb += 0.05 }
  else if (formacao === '4-2-3-1') { winProb += 0.05 }

  if (estilo === 'Contra-ataque') { winProb += isHome ? 0.08 : 0.05; drawProb -= 0.04 }
  else if (estilo === 'Pressão Alta') { winProb += 0.12; drawProb -= 0.06 }
  else if (estilo === 'Posse')       { drawProb += 0.08; winProb  -= 0.04 }

  winProb  = Math.max(0.05, Math.min(0.78, winProb))
  drawProb = Math.max(0.05, Math.min(0.40, drawProb))
  const lossProb = Math.max(0.05, 1 - winProb - drawProb)
  const total = winProb + drawProb + lossProb
  const nw = winProb / total
  const nd = drawProb / total

  const r = Math.random()
  const result = r < nw ? 'win' : r < nw + nd ? 'draw' : 'loss'

  const pick = () => {
    const dist = [0, 1, 1, 2, 2, 2, 3, 3, 4]
    return dist[Math.floor(Math.random() * dist.length)]
  }

  let userScore: number, oppScore: number
  if (result === 'win') {
    oppScore  = pick()
    userScore = oppScore + 1 + Math.floor(Math.random() * 2)
  } else if (result === 'draw') {
    userScore = pick()
    oppScore  = userScore
  } else {
    userScore = pick()
    oppScore  = userScore + 1 + Math.floor(Math.random() * 2)
  }

  return isHome
    ? { homeScore: userScore, awayScore: oppScore }
    : { homeScore: oppScore, awayScore: userScore }
}

async function addMatchdayRevenue() {
  if (!userStadiumData.value) return
  const user = getAuth().currentUser
  if (!user) return
  const { capacidade, instalacoes } = userStadiumData.value
  const ticketPrice = [8, 12, 18][instalacoes.bilheteira - 1]
  const occupancy   = [0.65, 0.70, 0.75][instalacoes.relvado - 1]
  const revenue     = Math.round(capacidade * occupancy * ticketPrice)
  const econDoc = doc(db, 'users', user.uid, 'economy', 'current')
  const econSnap = await getDoc(econDoc)
  const current  = econSnap.exists() ? (econSnap.data().lucros ?? 0) : 0
  await setDoc(econDoc, { lucros: current + revenue }, { merge: true })
}

async function applyTrainingEffects() {
  if (new Date().getDay() !== 6) return
  const user = getAuth().currentUser
  if (!user) return
  const userSnap = await getDoc(doc(db, 'users', user.uid))
  if (!userSnap.exists()) return
  const treino = userSnap.data().treino
  if (!treino || treino.aplicado || !treino.foco) return

  const foco = treino.foco as string
  const playersSnap = await getDocs(collection(db, 'users', user.uid, 'players'))
  const updates: Promise<void>[] = []
  playersSnap.docs.forEach(playerDoc => {
    const data = playerDoc.data()
    const pos: string = data.position ?? ''
    let bonus = 0
    if (foco === 'Físico' || foco === 'Descanso') {
      bonus = 1
    } else if (foco === 'Técnico') {
      if (/Avançado|Médio|Atacante/i.test(pos)) bonus = 2
    } else if (foco === 'Tático') {
      if (/Defesa|Guarda-redes/i.test(pos)) bonus = 2
    }
    if (bonus > 0) {
      const newRating = Math.min(99, (data.rating ?? 70) + bonus)
      updates.push(updateDoc(doc(db, 'users', user.uid, 'players', playerDoc.id), { rating: newRating }))
    }
  })
  await Promise.all(updates)
  await updateDoc(doc(db, 'users', user.uid), { 'treino.aplicado': true })
}

// Número de resultados a mostrar na página principal
const MAX_RESULTS_TO_SHOW = 6

// Computed para obter apenas os resultados mais recentes (filtrados pela equipa do utilizador)
const latestResults = computed(() => {
  const fixtures = (showAllResults.value || !userTeam.value)
    ? completedFixtures.value
    : completedFixtures.value.filter(
        f => f.homeTeam === userTeam.value || f.awayTeam === userTeam.value
      )
  return fixtures.slice(0, MAX_RESULTS_TO_SHOW)
})

// Fictional teams list (names only)
const fictionalTeamNames = [
  'Team Alpha',
  'Team Beta',
  'Team Gamma',
  'Team Delta',
  'Team Epsilon',
  'Team Zeta',
  'Team Eta',
  'Team Theta',
]

// Fetch real teams from Firestore and combine with fictional teams
const fetchLeagueTeams = async () => {
  console.log('Fetching league teams for fixtures...')
  try {
    const usersRef = collection(db, 'users')
    const querySnapshot = await getDocs(usersRef)
    console.log('Users query snapshot received:', querySnapshot.size)

    const registeredTeams: string[] = querySnapshot.docs
      .map((doc) => {
        const userData = doc.data()
        return userData.team
      })
      .filter(
        (teamName): teamName is string => typeof teamName === 'string' && teamName.trim() !== '',
      )

    console.log('Registered teams fetched:', registeredTeams)

    const teamsToInclude: string[] = []

    // Add registered teams first, up to LEAGUE_SIZE
    for (const teamName of registeredTeams) {
      if (teamsToInclude.length < LEAGUE_SIZE) {
        if (!teamsToInclude.includes(teamName)) {
          teamsToInclude.push(teamName)
        }
      } else {
        break
      }
    }
    console.log('Teams after adding registered:', teamsToInclude)

    // Fill remaining slots with fictional teams
    let fictionalIndex = 0
    while (teamsToInclude.length < LEAGUE_SIZE && fictionalIndex < fictionalTeamNames.length) {
      const fictionalName = fictionalTeamNames[fictionalIndex]
      if (!teamsToInclude.includes(fictionalName)) {
        teamsToInclude.push(fictionalName)
      }
      fictionalIndex++
    }
    console.log('Teams after adding fictional:', teamsToInclude)

    if (teamsToInclude.length < LEAGUE_SIZE) {
      console.warn(
        `Could only assemble ${teamsToInclude.length} unique teams, needed ${LEAGUE_SIZE}. Fixture generation might be incomplete.`,
      )
    }

    leagueTeams.value = teamsToInclude.slice(0, LEAGUE_SIZE)
    console.log('Final league teams for fixtures:', leagueTeams.value)
    loadingMessage.value = 'A gerar calendário...'
  } catch (error) {
    console.error('Error fetching league teams:', error)
    loadingMessage.value = 'Erro ao carregar equipas.'
    leagueTeams.value = fictionalTeamNames.slice(0, LEAGUE_SIZE)
  }
}

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

    // Se não houver jogos futuros no Firestore, não sobrescreva
    if (fixtures.length > 0) {
      upcomingFixtures.value = fixtures
    }

    console.log(`Fetched ${fixtures.length} upcoming fixtures from Firestore`)
  } catch (error) {
    console.error('Error fetching upcoming fixtures:', error)
  }
}

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

    console.log(`Fetched ${fixtures.length} completed fixtures from Firestore`)
  } catch (error) {
    console.error('Error fetching completed fixtures:', error)
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

// Function to check and move completed fixtures
const checkForCompletedMatches = async () => {
  const now = new Date()
  const completedMatches: UpcomingFixture[] = []
  const remainingMatches: UpcomingFixture[] = []

  // Separar jogos concluídos dos ainda não realizados
  upcomingFixtures.value.forEach(fixture => {
    const fixtureDate = new Date(fixture.matchDate)
    fixtureDate.setHours(0, 0, 0, 0)
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)

    if (
      fixtureDate < today ||
      (fixtureDate.getTime() === today.getTime() &&
       parseInt(fixture.time.split(':')[0]) < now.getHours())
    ) {
      completedMatches.push(fixture)
    } else {
      remainingMatches.push(fixture)
    }
  })

  // Atualizar os jogos futuros
  upcomingFixtures.value = remainingMatches

  let userPlayedHome = false

  // Para cada jogo concluído, criar um resultado e salvar no Firestore
  for (const match of completedMatches) {
    const isUserHome = match.homeTeam === userTeam.value
    const isUserAway = match.awayTeam === userTeam.value
    const isUserMatch = isUserHome || isUserAway

    const scores = isUserMatch
      ? simulateUserMatch(isUserHome)
      : { homeScore: Math.floor(Math.random() * 5), awayScore: Math.floor(Math.random() * 5) }

    if (isUserHome) userPlayedHome = true

    const completedMatch: CompletedFixture = { ...match, ...scores }

    try {
      const docRef = await addDoc(collection(db, 'completedFixtures'), {
        ...completedMatch,
        matchDate: Timestamp.fromDate(completedMatch.matchDate)
      })
      completedMatch.id = docRef.id
      if (match.id) {
        await deleteDoc(doc(db, 'upcomingFixtures', match.id))
      }
      console.log(`Moved completed match to history: ${match.homeTeam} vs ${match.awayTeam}`)
    } catch (error) {
      console.error('Error saving match result:', error)
    }

    completedFixtures.value.unshift(completedMatch)
  }

  if (userPlayedHome) {
    await addMatchdayRevenue()
  }
}

// Function to generate round-robin fixtures
const generateFixtures = async () => {
  // Use the fetched/combined leagueTeams
  const teamsToSchedule = [...leagueTeams.value]
  if (teamsToSchedule.length < 2) {
    console.warn('Not enough teams to generate fixtures.')
    upcomingFixtures.value = []
    loadingMessage.value = 'Não há equipas suficientes para gerar calendário.'
    return
  }

  let addedBye = false
  // Ensure even number of teams for simple round-robin
  if (teamsToSchedule.length % 2 !== 0) {
    teamsToSchedule.push('BYE')
    addedBye = true
    console.warn('Odd number of teams, added BYE week.')
  }

  const generated: UpcomingFixture[] = []
  const numTeams = teamsToSchedule.length
  const numRounds = numTeams - 1
  const matchesPerRound = numTeams / 2
  // Calculate next upcoming Saturday from today
  const todayForFixtures = new Date()
  todayForFixtures.setHours(0, 0, 0, 0)
  const daysUntilSat = (6 - todayForFixtures.getDay() + 7) % 7
  const firstSaturday = new Date(todayForFixtures)
  firstSaturday.setDate(todayForFixtures.getDate() + daysUntilSat)

  // Create team rotation arrays
  const teamIndices = Array.from(Array(numTeams).keys())

  for (let round = 0; round < numRounds; round++) {
    for (let match = 0; match < matchesPerRound; match++) {
      const homeIndex = teamIndices[match]
      const awayIndex = teamIndices[numTeams - 1 - match]

      const homeTeam = teamsToSchedule[homeIndex]
      const awayTeam = teamsToSchedule[awayIndex]

      // Skip BYE matches
      if (homeTeam === 'BYE' || awayTeam === 'BYE') {
        continue
      }

      const matchDate = new Date(firstSaturday)
      matchDate.setDate(firstSaturday.getDate() + round * 7)

      // Alternate times
      const matchTime = match % 2 === 0 ? '18:00' : '20:30'

      const newFixture: UpcomingFixture = {
        homeTeam: homeTeam,
        awayTeam: awayTeam,
        matchDate: matchDate,
        date: matchDate.toLocaleDateString('pt-PT', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        time: matchTime,
        competition: 'Liga Placeholder',
        stadium: `${homeTeam} Stadium`,
      }

      generated.push(newFixture)
    }

    // Rotate teams for next round (excluding the first team)
    if (numTeams > 1) {
      const lastTeam = teamIndices.pop()!
      teamIndices.splice(1, 0, lastTeam)
    }
  }

  // Remove BYE team if it was added
  if (addedBye) {
    teamsToSchedule.pop()
  }

  // Sort fixtures by date
  generated.sort((a, b) => a.matchDate.getTime() - b.matchDate.getTime())

  // Verificar se já existem jogos no Firestore antes de gerar novos
  const fixturesRef = collection(db, 'upcomingFixtures')
  const querySnapshot = await getDocs(fixturesRef)

  if (querySnapshot.size === 0) {
    console.log('No fixtures found in Firestore, generating new fixtures...')

    // Salvar os jogos gerados no Firestore
    for (const fixture of generated) {
      try {
        const docRef = await addDoc(collection(db, 'upcomingFixtures'), {
          ...fixture,
          matchDate: Timestamp.fromDate(fixture.matchDate)
        })
        fixture.id = docRef.id
      } catch (error) {
        console.error('Error saving fixture to Firestore:', error)
      }
    }

    upcomingFixtures.value = generated
  } else {
    console.log('Fixtures already exist in Firestore, not generating new ones')
    await fetchUpcomingFixtures()
  }

  if (generated.length === 0 && teamsToSchedule.length >= 2) {
    loadingMessage.value = 'Calendário gerado sem jogos (verificar equipas).'
  } else if (generated.length > 0) {
    loadingMessage.value = ''
  }

  console.log('Fixtures generated:', upcomingFixtures.value.length)
}

// Computed property to group upcoming fixtures by week
// const groupedUpcomingFixtures = computed(() => {
//   const groups: { [key: string]: UpcomingFixture[] } = {}
//   upcomingFixtures.value.forEach((fixture) => {
//     const weekNum = getWeekNumber(fixture.matchDate)
//     const year = fixture.matchDate.getFullYear()
//     const weekKey = `Semana ${weekNum}, ${year}` // Key like "Semana 17, 2025"
//     if (!groups[weekKey]) {
//       groups[weekKey] = []
//     }
//     groups[weekKey].push(fixture)
//   })

//   // Sort weeks chronologically
//   const sortedWeeks = Object.keys(groups).sort((a, b) => {
//     const [, weekA, yearA] = a.match(/Semana (\d+), (\d+)/) || []
//     const [, weekB, yearB] = b.match(/Semana (\d+), (\d+)/) || []
//     if (!weekA || !weekB) return 0
//     if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB)
//     return parseInt(weekA) - parseInt(weekB)
//   })

//   const sortedGroups: { [key: string]: UpcomingFixture[] } = {}
//   sortedWeeks.forEach((weekKey) => {
//     sortedGroups[weekKey] = groups[weekKey]
//   })

//   return sortedGroups
// })

// Computed para filtrar apenas as duas próximas semanas
const nextTwoWeeksFixtures = computed(() => {
  const now = new Date()
  const twoWeeksLater = new Date(now)
  twoWeeksLater.setDate(now.getDate() + 14) // Duas semanas depois

  // Filtrar para partidas nas próximas duas semanas
  const relevantFixtures = upcomingFixtures.value.filter(fixture => {
    const inRange = fixture.matchDate >= now && fixture.matchDate <= twoWeeksLater
    const isMyTeam = showAllUpcoming.value || !userTeam.value ||
      fixture.homeTeam === userTeam.value ||
      fixture.awayTeam === userTeam.value
    return inRange && isMyTeam
  })

  // Agrupar por semana, como no groupedUpcomingFixtures
  const groups: { [key: string]: UpcomingFixture[] } = {}
  relevantFixtures.forEach((fixture) => {
    const weekNum = getWeekNumber(fixture.matchDate)
    const year = fixture.matchDate.getFullYear()
    const weekKey = `Semana ${weekNum}, ${year}`
    if (!groups[weekKey]) {
      groups[weekKey] = []
    }
    groups[weekKey].push(fixture)
  })

  // Ordenar semanas cronologicamente
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
  await fetchUserTeam()
  await loadUserStadium()
  await fetchLeagueTeams()
  await fetchUpcomingFixtures()
  await fetchCompletedFixtures()

  // Clear and regenerate fixtures if: non-Saturday dates exist, OR a registered team is missing
  if (upcomingFixtures.value.length > 0) {
    const hasNonSaturdayFixtures = upcomingFixtures.value.some(
      f => new Date(f.matchDate).getDay() !== 6
    )

    const teamsInFixtures = new Set([
      ...upcomingFixtures.value.map(f => f.homeTeam),
      ...upcomingFixtures.value.map(f => f.awayTeam),
    ])
    const registeredTeams = leagueTeams.value.filter(t => !fictionalTeamNames.includes(t))
    const hasNewRegisteredTeam = registeredTeams.some(t => !teamsInFixtures.has(t))

    if (hasNonSaturdayFixtures || hasNewRegisteredTeam) {
      console.log('Clearing and regenerating fixtures (teams changed or non-Saturday dates)...')
      for (const fixture of upcomingFixtures.value) {
        if (fixture.id) {
          await deleteDoc(doc(db, 'upcomingFixtures', fixture.id))
        }
      }
      upcomingFixtures.value = []
    }
  }

  if (upcomingFixtures.value.length === 0) {
    await generateFixtures()
  }

  await applyTrainingEffects()
  await checkForCompletedMatches()
  setInterval(checkForCompletedMatches, 60000)
})
</script>

<style scoped>
/* Novos estilos para links de navegação */
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

/* Estilos para o cabeçalho da seção com botão "Ver todos" */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  background: rgba(100, 108, 255, 0.12);
  border: 1px solid rgba(100, 108, 255, 0.3);
  border-radius: 20px;
  color: #a8b4ff;
  text-decoration: none;
  font-size: 0.82em;
  font-weight: 500;
  letter-spacing: 0.03em;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.25s ease;
}

.view-all-link:hover {
  background: rgba(100, 108, 255, 0.25);
  border-color: rgba(168, 180, 255, 0.5);
  color: #fff;
  box-shadow: 0 0 14px rgba(100, 108, 255, 0.25);
  transform: translateY(-1px);
}

.view-all-link .arrow {
  font-style: normal;
  transition: transform 0.25s ease;
}

.view-all-link:hover .arrow {
  transform: translateX(3px);
}

.view-all-link.my-only {
  background: rgba(168, 85, 247, 0.12);
  border-color: rgba(168, 85, 247, 0.35);
  color: #c084fc;
}

.view-all-link.my-only:hover {
  background: rgba(168, 85, 247, 0.25);
  border-color: rgba(192, 132, 252, 0.55);
  color: #fff;
  box-shadow: 0 0 14px rgba(168, 85, 247, 0.25);
}

.view-all-link.my-only:hover .arrow {
  transform: translateX(-3px);
}

/* Estilos existentes */
/* Estilos para diferentes resultados */
.home-win .team.home {
  font-weight: bold;
  color: #4caf50; /* Verde para equipe vencedora (casa) */
}

.away-win .team.away {
  font-weight: bold;
  color: #4caf50; /* Verde para equipe vencedora (fora) */
}

.draw .score {
  color: #ffc107; /* Amarelo para empate */
}

.match-card.result {
  position: relative;
  overflow: hidden;
}

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
  border-color: transparent #4caf50 transparent transparent; /* Indicador de vitória em casa */
}

.away-win::after {
  border-color: transparent #2196f3 transparent transparent; /* Indicador de vitória fora */
}

.draw::after {
  border-color: transparent #ffc107 transparent transparent; /* Indicador de empate */
}

.jogos-view {
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

.content-wrapper {
  display: grid;
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.matches-section,
.results-section {
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

.week-group {
  margin-bottom: 30px; /* Add space between week tables */
}

.week-title {
  font-size: 1.5em;
  color: #a8b4ff;
  margin-bottom: 15px;
  padding-bottom: 5px;
  border-bottom: 1px solid rgba(100, 108, 255, 0.3);
}

/* Keep .results-section .matches-grid if needed for results cards */
.results-section .matches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}
.results-section .match-card {
  /* Style results card */
  padding: 20px;
  background: rgba(30, 30, 30, 0.5);
  border-radius: 10px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}
.results-section .match-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}
.results-section .match-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 0.9em;
  color: #a0a0a0;
}
.results-section .match-teams {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 15px 0;
  font-size: 1.1em;
}
.results-section .score {
  padding: 5px 10px;
  background: rgba(100, 108, 255, 0.2);
  border-radius: 5px;
  color: #646cff;
}
.results-section .match-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.9em;
  color: #a0a0a0;
}

.match-stadium {
  font-style: italic;
}

/* Add styles for the fixtures table */
.fixtures-table {
  width: 100%;
  border-collapse: collapse;
  /* margin-top: 20px; Remove top margin as it's handled by week-group */
  color: #e0e0e0;
  /* animation: fadeIn 0.5s ease forwards 0.2s; */ /* Let parent handle animation */
  /* opacity: 0; */
}

.fixtures-table th,
.fixtures-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap; /* Prevent wrapping */
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
  font-weight: bold;
  color: #646cff;
  padding: 12px 5px; /* Reduce padding for VS */
}

h2 {
  font-size: 1.8em;
  margin-bottom: 20px;
  color: #646cff;
}

.match-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.completed {
  /* Keep for results if needed */
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
}
.scheduled {
  /* Style for scheduled games in results placeholder */
  background: rgba(100, 108, 255, 0.2);
  color: #a8b4ff;
}

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
