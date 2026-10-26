<template>
  <div class="clube-view">
    <h1 class="title">Clube</h1>
    <div class="content-wrapper">
      <template v-if="loading"></template>
      <template v-else-if="clube">
        <div class="info-card animate-slide-in">
          <div class="info-card-header">
            <h2>{{ clube.nome }}</h2>
            <button class="settings-btn" @click="openSettings" title="Definições">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Definições
            </button>
          </div>
          <div class="info-content">
            <div class="info-item">
              <h3>Estádio</h3>
              <p>{{ clube.stadium || 'N/A' }}</p>
            </div>
            <div class="info-item">
              <h3>Região</h3>
              <p>{{ clube.region || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <!-- Settings Modal -->
        <div v-if="showSettings" class="modal-overlay" @click.self="closeSettings">
          <div class="settings-modal">
            <h3>Definições do Clube</h3>
            <div class="settings-field">
              <label>Nome do Estádio</label>
              <input v-model="editStadium" type="text" placeholder="Nome do estádio" class="settings-input" />
            </div>
            <div class="settings-field">
              <label>Região</label>
              <div class="region-options">
                <label class="region-option" :class="{ active: editRegion === 'Açores' }">
                  <input type="radio" v-model="editRegion" value="Açores" hidden />
                  Açores
                </label>
                <label class="region-option" :class="{ active: editRegion === 'Lisboa' }">
                  <input type="radio" v-model="editRegion" value="Lisboa" hidden />
                  Lisboa
                </label>
              </div>
            </div>
            <div class="settings-actions">
              <button class="btn-cancel" @click="closeSettings">Cancelar</button>
              <button class="btn-save" :disabled="saving" @click="saveSettings">
                {{ saving ? 'A guardar...' : 'Guardar' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Estádio Section -->
        <div class="table-card animate-slide-in">
          <h2>Estádio</h2>
          <div class="stadium-grid">
            <!-- Capacity -->
            <div class="stadium-item">
              <div class="stadium-item-header">
                <span class="stadium-item-label">Capacidade</span>
                <span class="stadium-item-value">{{ stadiumData.capacidade.toLocaleString('pt-PT') }} lugares</span>
              </div>
              <div class="stadium-item-sub">Receita estimada/jogo em casa: {{ revenueEstimate }}</div>
              <button
                class="upgrade-btn"
                :disabled="upgrading || !nextCapacidade || saldo < (nextCapacidade?.custo ?? 0)"
                @click="upgradeCapacidade"
              >
                <span v-if="!nextCapacidade">Máximo atingido</span>
                <span v-else-if="saldo < nextCapacidade.custo">Fundos insuficientes</span>
                <span v-else>Expandir → {{ nextCapacidade.lugares.toLocaleString('pt-PT') }} lugares (€{{ nextCapacidade.custo.toLocaleString('pt-PT') }})</span>
              </button>
            </div>
            <!-- Facilities -->
            <div v-for="inst in instalacoes" :key="inst.key" class="stadium-item">
              <div class="stadium-item-header">
                <span class="stadium-item-label">{{ inst.label }}</span>
                <div class="level-dots">
                  <span v-for="n in 3" :key="n" class="level-dot" :class="{ filled: n <= (stadiumData.instalacoes[inst.key] ?? 1) }"></span>
                </div>
              </div>
              <div class="stadium-item-sub">{{ inst.desc[stadiumData.instalacoes[inst.key] ?? 1] }}</div>
              <button
                class="upgrade-btn"
                :disabled="upgrading || (stadiumData.instalacoes[inst.key] ?? 1) >= 3 || saldo < inst.custo[(stadiumData.instalacoes[inst.key] ?? 1)]"
                @click="upgradeInstalacao(inst.key)"
              >
                <span v-if="(stadiumData.instalacoes[inst.key] ?? 1) >= 3">Nível máximo</span>
                <span v-else-if="saldo < inst.custo[(stadiumData.instalacoes[inst.key] ?? 1)]">Fundos insuficientes</span>
                <span v-else>Melhorar (€{{ inst.custo[(stadiumData.instalacoes[inst.key] ?? 1)].toLocaleString('pt-PT') }})</span>
              </button>
            </div>
          </div>
          <div class="saldo-row">
            <span>Saldo disponível:</span>
            <span class="saldo-value">€{{ saldo.toLocaleString('pt-PT') }}</span>
          </div>
        </div>

        <!-- League Table Section -->
        <div class="table-card animate-slide-in">
          <h2>League Table</h2>
          <table class="league-table">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Team</th>
                <th>P</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GD</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(team, index) in leagueTable" :key="team.name">
                <td>{{ index + 1 }}</td>
                <td @click="selectTeam(team)" class="team-name-cell">{{ team.name }}</td>
                <td>{{ team.played }}</td>
                <td>{{ team.won }}</td>
                <td>{{ team.drawn }}</td>
                <td>{{ team.lost }}</td>
                <td>{{ team.goalDifference }}</td>
                <td>{{ team.points }}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </template>
      <template v-else>
        <AddClube @clube-added="handleClubeAdded"></AddClube>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { getAuth } from 'firebase/auth';
import AddClube from '@/components/AddClube.vue';

// Interface for completed fixtures (similar to JogosView)
interface CompletedFixture {
  id?: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  matchDate: Date; // Keep as Date object for potential sorting
  time: string;
  competition: string;
  stadium: string;
  homeScore: number;
  awayScore: number;
}

interface Clube {
  id: string
  nome: string
  userId: string
  createdAt: Date
  stadium?: string // Added stadium
  region?: string // Added region
}

interface LeagueTeam {
  name: string
  played: number
  won: number
  drawn: number
  lost: number
  goalDifference: number
  points: number
}

interface Player {
  id: number | string // Assuming id can be number or string based on data source
  name: string
  position: string
  // Add other player properties as needed
}

// League table data
const leagueTable = ref<LeagueTeam[]>([])
const selectedTeam = ref<LeagueTeam | null>(null)
const selectedTeamPlayers = ref<Player[]>([])

// Fictional team names (stats will be calculated)
const fictionalTeamNames = [
  'Team Alpha',
  'Team Beta',
  'Team Gamma',
  'Team Delta',
  'Team Epsilon',
  'Team Zeta',
  'Team Eta',
  'Team Theta',
];
const LEAGUE_SIZE = 8; // Consistent league size

const clube = ref<Clube | null>(null);
const loading = ref(true);

// Settings modal
const showSettings = ref(false)
const editStadium = ref('')
const editRegion = ref('')
const saving = ref(false)

// Stadium
interface StadiumInstall {
  relvado: number
  balnearios: number
  bilheteira: number
}
interface StadiumData {
  capacidade: number
  instalacoes: StadiumInstall
}

const stadiumData = ref<StadiumData>({
  capacidade: 5000,
  instalacoes: { relvado: 1, balnearios: 1, bilheteira: 1 }
})
const upgrading = ref(false)
const saldo = ref(0)

const capacityLevels = [
  { lugares: 5000,  custo: 0 },
  { lugares: 10000, custo: 25000 },
  { lugares: 20000, custo: 75000 },
  { lugares: 35000, custo: 150000 },
  { lugares: 50000, custo: 300000 },
]

const nextCapacidade = computed(() => {
  const idx = capacityLevels.findIndex(l => l.lugares === stadiumData.value.capacidade)
  if (idx === -1 || idx >= capacityLevels.length - 1) return null
  return capacityLevels[idx + 1]
})

const revenueEstimate = computed(() => {
  const cap = stadiumData.value.capacidade
  const ticketPrice = [8, 12, 18][stadiumData.value.instalacoes.bilheteira - 1]
  const occupancy  = [0.65, 0.70, 0.75][stadiumData.value.instalacoes.relvado - 1]
  const revenue = Math.round(cap * occupancy * ticketPrice)
  return '€' + revenue.toLocaleString('pt-PT')
})

const instalacoes = [
  {
    key: 'relvado' as const,
    label: 'Relvado',
    desc: ['', 'Relvado básico', 'Relvado sintético', 'Relvado profissional'],
    custo: [0, 30000, 80000],
  },
  {
    key: 'balnearios' as const,
    label: 'Balneários',
    desc: ['', 'Balneários simples', 'Balneários modernos', 'Balneários premium'],
    custo: [0, 20000, 50000],
  },
  {
    key: 'bilheteira' as const,
    label: 'Bilheteira',
    desc: ['', 'Bilheteira manual', 'Bilheteira digital', 'Bilheteira premium'],
    custo: [0, 40000, 100000],
  },
]

async function loadStadiumData() {
  if (!clube.value || clube.value.id === 'temp-id') return
  const snap = await getDoc(doc(db, 'clubes', clube.value.id))
  if (snap.exists()) {
    const d = snap.data()
    stadiumData.value = {
      capacidade: d.capacidade ?? 5000,
      instalacoes: {
        relvado:    d.instalacoes?.relvado    ?? 1,
        balnearios: d.instalacoes?.balnearios ?? 1,
        bilheteira: d.instalacoes?.bilheteira ?? 1,
      }
    }
  }
}

async function loadSaldo() {
  const user = getAuth().currentUser
  if (!user) return
  const snap = await getDoc(doc(db, 'users', user.uid, 'economy', 'current'))
  if (snap.exists()) {
    saldo.value = snap.data().lucros ?? 0
  }
}

async function upgradeCapacidade() {
  if (!clube.value || clube.value.id === 'temp-id' || !nextCapacidade.value) return
  const custo = nextCapacidade.value.custo
  if (saldo.value < custo) return
  const user = getAuth().currentUser
  if (!user) return
  upgrading.value = true
  try {
    const novaCapacidade = nextCapacidade.value.lugares
    await updateDoc(doc(db, 'clubes', clube.value.id), { capacidade: novaCapacidade })
    await updateDoc(doc(db, 'users', user.uid, 'economy', 'current'), { lucros: saldo.value - custo })
    stadiumData.value.capacidade = novaCapacidade
    saldo.value -= custo
  } finally {
    upgrading.value = false
  }
}

async function upgradeInstalacao(key: 'relvado' | 'balnearios' | 'bilheteira') {
  if (!clube.value || clube.value.id === 'temp-id') return
  const currentLevel = stadiumData.value.instalacoes[key]
  if (currentLevel >= 3) return
  const inst = instalacoes.find(i => i.key === key)
  if (!inst) return
  const custo = inst.custo[currentLevel]
  if (saldo.value < custo) return
  const user = getAuth().currentUser
  if (!user) return
  upgrading.value = true
  try {
    const novoNivel = currentLevel + 1
    await updateDoc(doc(db, 'clubes', clube.value.id), { [`instalacoes.${key}`]: novoNivel })
    await updateDoc(doc(db, 'users', user.uid, 'economy', 'current'), { lucros: saldo.value - custo })
    stadiumData.value.instalacoes[key] = novoNivel
    saldo.value -= custo
  } finally {
    upgrading.value = false
  }
}

function openSettings() {
  editStadium.value = clube.value?.stadium || ''
  editRegion.value = clube.value?.region || ''
  showSettings.value = true
}

function closeSettings() {
  showSettings.value = false
}

async function saveSettings() {
  if (!clube.value) return
  saving.value = true
  try {
    if (clube.value.id === 'temp-id') {
      // Clube not yet in Firestore — create it
      const docRef = await addDoc(collection(db, 'clubes'), {
        nome: clube.value.nome,
        userId: clube.value.userId,
        createdAt: Timestamp.fromDate(clube.value.createdAt),
        stadium: editStadium.value,
        region: editRegion.value,
      })
      clube.value.id = docRef.id
    } else {
      await updateDoc(doc(db, 'clubes', clube.value.id), {
        stadium: editStadium.value,
        region: editRegion.value,
      })
    }
    clube.value.stadium = editStadium.value
    clube.value.region = editRegion.value
    closeSettings()
  } finally {
    saving.value = false
  }
}

const selectTeam = async (team: LeagueTeam) => {
  selectedTeam.value = team
  selectedTeamPlayers.value = [] // Clear previous players
  console.log('Selected team:', team.name)

  try {
    // Assuming players are stored in a 'players' collection with a 'clubeId' field
    // Need to find the corresponding clube document for the selected team name
    // This assumes team.name in leagueTable corresponds to clube.nome
    const clubeQuery = query(collection(db, 'clubes'), where('nome', '==', team.name))
    const clubeSnapshot = await getDocs(clubeQuery)

    if (!clubeSnapshot.empty) {
      const clubeDoc = clubeSnapshot.docs[0]
      const clubeId = clubeDoc.id

      const playersRef = collection(db, 'players')
      const playersQuery = query(playersRef, where('clubeId', '==', clubeId))
      const playersSnapshot = await getDocs(playersQuery)

      selectedTeamPlayers.value = playersSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.name,
          position: data.position,
          // Map other player properties as needed
        } as Player // Cast to Player interface
      })
      console.log('Fetched players for', team.name, ':', selectedTeamPlayers.value)
    } else {
      console.log('No clube found for team:', team.name)
      // For fictional teams, you might want to add placeholder players or handle differently
      // For now, it will just show "No players found"
    }
  } catch (error) {
    console.error('Error fetching players:', error)
  }
}

const fetchAllClubeData = async () => {
  console.log('Fetching all league table data and calculating stats...');
  try {
    // 1. Fetch Registered Teams from 'users' collection
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    const registeredTeamNames: string[] = usersSnapshot.docs
      .map(doc => doc.data().team)
      .filter((teamName): teamName is string => typeof teamName === 'string' && teamName.trim() !== '');
    console.log('Registered team names:', registeredTeamNames);

    // 2. Combine Registered and Fictional Teams (up to LEAGUE_SIZE)
    const allTeamNames: string[] = [];
    // Add registered teams first
    for (const teamName of registeredTeamNames) {
      if (allTeamNames.length < LEAGUE_SIZE && !allTeamNames.includes(teamName)) {
        allTeamNames.push(teamName);
      }
    }
    // Fill remaining slots with fictional teams
    let fictionalIndex = 0;
    while (allTeamNames.length < LEAGUE_SIZE && fictionalIndex < fictionalTeamNames.length) {
      const fictionalName = fictionalTeamNames[fictionalIndex];
      if (!allTeamNames.includes(fictionalName)) {
        allTeamNames.push(fictionalName);
      }
      fictionalIndex++;
    }
    console.log('Final list of teams for table:', allTeamNames);

    // 3. Fetch Completed Fixtures
    const completedFixturesRef = collection(db, 'completedFixtures');
    const completedFixturesSnapshot = await getDocs(completedFixturesRef);
    const completedFixtures: CompletedFixture[] = [];
    completedFixturesSnapshot.forEach(doc => {
      const data = doc.data();
      completedFixtures.push({
        id: doc.id,
        ...data,
        matchDate: data.matchDate?.toDate() || new Date() // Handle potential Timestamp
      } as CompletedFixture);
    });
    console.log(`Fetched ${completedFixtures.length} completed fixtures.`);

    // 4. Calculate Stats
    const teamStats: { [key: string]: LeagueTeam } = {};

    // Initialize stats for all teams in the league
    allTeamNames.forEach(name => {
      teamStats[name] = {
        name: name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalDifference: 0,
        points: 0,
      };
    });

    // Process each completed fixture
    completedFixtures.forEach(fixture => {
      const homeTeam = fixture.homeTeam;
      const awayTeam = fixture.awayTeam;
      const homeScore = fixture.homeScore;
      const awayScore = fixture.awayScore;

      // Update stats only if both teams are part of the current league table
      if (teamStats[homeTeam] && teamStats[awayTeam]) {
        // Update Played
        teamStats[homeTeam].played++;
        teamStats[awayTeam].played++;

        // Update Goal Difference
        teamStats[homeTeam].goalDifference += homeScore - awayScore;
        teamStats[awayTeam].goalDifference += awayScore - homeScore;

        // Update Win/Draw/Loss and Points
        if (homeScore > awayScore) { // Home win
          teamStats[homeTeam].won++;
          teamStats[homeTeam].points += 3;
          teamStats[awayTeam].lost++;
        } else if (awayScore > homeScore) { // Away win
          teamStats[awayTeam].won++;
          teamStats[awayTeam].points += 3;
          teamStats[homeTeam].lost++;
        } else { // Draw
          teamStats[homeTeam].drawn++;
          teamStats[homeTeam].points += 1;
          teamStats[awayTeam].drawn++;
          teamStats[awayTeam].points += 1;
        }
      }
    });

    // 5. Prepare and Sort League Table
    const calculatedTable: LeagueTeam[] = Object.values(teamStats);

    calculatedTable.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points; // Sort by points descending
      }
      if (b.goalDifference !== a.goalDifference) {
        return b.goalDifference - a.goalDifference; // Then by goal difference descending
      }
       // Optional: Add further sorting criteria like goals scored or alphabetical if needed
      return a.name.localeCompare(b.name); // Alphabetical as final tie-breaker
    });

    leagueTable.value = calculatedTable;
    console.log('Final calculated league table data:', leagueTable.value);

  } catch (error) {
    console.error('Error fetching league table data or calculating stats:', error);
    // Optionally, set leagueTable to an empty array or handle the error state
    leagueTable.value = [];
  }
};

// Modify the fetchUserClubeData function in ClubeView.vue

const fetchUserClubeData = async () => {
  console.log('Fetching user clube data...')
  try {
    const auth = getAuth()
    const user = auth.currentUser

    if (!user) {
      console.error('User not authenticated')
      return
    }

    // First, fetch the user's document to get the team name
    const userDocRef = doc(db, 'users', user.uid)
    const userDocSnap = await getDoc(userDocRef)

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data()
      const userTeamName = userData.team // This comes from the user's profile
      console.log('User team from profile:', userTeamName)

      if (userTeamName) {
        // If a team name is found, first check if it exists in clubes collection
        const clubesRef = collection(db, 'clubes')
        const q = query(clubesRef, where('nome', '==', userTeamName))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          // Team exists in clubes collection, proceed as normal
          const clubeDoc = querySnapshot.docs[0]
          const data = clubeDoc.data()
          clube.value = {
            id: clubeDoc.id,
            nome: data.nome,
            userId: data.userId || user.uid, // Default to current user if missing
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
            stadium: data.stadium || 'Home Stadium', // Default value if missing
            region: data.region || 'Local Region', // Default value if missing
          }
          console.log('Fetched existing clube:', clube.value)

          // Create a team object to pass to selectTeam
          const userTeamForSelection = {
            name: clube.value.nome,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalDifference: 0,
            points: 0,
          }

          // Automatically select the user's team
          await selectTeam(userTeamForSelection)
        } else {
          // Team doesn't exist in clubes collection yet, create it
          console.log('Creating new clube for team:', userTeamName)

          // Create a basic clube object with the user's team name
          clube.value = {
            id: 'temp-id', // Will be replaced when saved
            nome: userTeamName,
            userId: user.uid,
            createdAt: new Date(),
            stadium: 'Home Stadium', // Default value
            region: 'Local Region', // Default value
          }

          // You would typically save this to Firestore here
          // For now, we're just ensuring the UI shows the team info

          // Create a team object to pass to selectTeam
          const userTeamForSelection = {
            name: userTeamName,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalDifference: 0,
            points: 0,
          }

          // Automatically select the user's team
          await selectTeam(userTeamForSelection)
        }
      } else {
        console.log('No team name found in user document.')
        clube.value = null // Show AddClube component
      }
    } else {
      console.log('User document not found.')
      clube.value = null // Show AddClube component
    }
  } catch (error) {
    console.error('Error fetching user or clube data:', error)
    clube.value = null // Ensure clube is null on error
  }
}

const handleClubeAdded = async (newClube: Clube) => {
  console.log('Clube added event received:', newClube)
  clube.value = newClube
  await fetchUserClubeData() // Fetch again to ensure consistency, though newClube should be sufficient
  await fetchAllClubeData() // Refresh league table after adding a club
}

onMounted(async () => {
  const auth = getAuth()
  console.log('Auth current user:', auth.currentUser)
  await fetchUserClubeData()
  await fetchAllClubeData()
  await loadStadiumData()
  await loadSaldo()
  loading.value = false
})
</script>

<style scoped>
.clube-view {
  padding: 20px;
  color: var(--vt-c-text-dark-1);
  min-height: 100vh;
  background: linear-gradient(135deg, var(--vt-c-black) 0%, var(--vt-c-black-soft) 100%);
  overflow-y: auto;
  position: relative;
}

.title {
  font-size: 3.2em;
  margin-bottom: 40px;
  text-align: center;
  background: linear-gradient(45deg, var(--vt-c-purple), var(--vt-c-indigo));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: neonGlow 1.5s ease-in-out infinite alternate, fadeIn 0.8s ease forwards;
}

.content-wrapper {
  display: grid;
  gap: 30px;
  max-width: 1300px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.info-card, .table-card, .player-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
  border: 1px solid var(--vt-c-divider-dark-2);
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.info-card::before, .table-card::before, .player-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(31, 165, 106, 0.15) 0%, transparent 70%);
  transform: rotate(25deg);
  z-index: 0;
}

.info-card:hover::before, .table-card:hover::before, .player-card:hover::before {
  animation: rotateGlow 10s linear infinite;
}

.info-card {
  animation: slideIn 0.8s ease forwards;
}

.info-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
  position: relative;
  z-index: 1;
}

.info-card-header h2 {
  margin-bottom: 0;
}

.settings-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  background: rgba(46, 207, 133, 0.12);
  border: 1px solid rgba(46, 207, 133, 0.3);
  border-radius: 20px;
  color: #a6f2cc;
  font-size: 0.82em;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.25s ease;
}

.settings-btn:hover {
  background: rgba(46, 207, 133, 0.25);
  border-color: rgba(166, 242, 204, 0.5);
  color: #fff;
  box-shadow: 0 0 14px rgba(46, 207, 133, 0.2);
}

/* Modal overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.settings-modal {
  background: #1e1a2e;
  border: 1px solid rgba(46, 207, 133, 0.3);
  border-radius: 20px;
  padding: 32px;
  width: 420px;
  max-width: 90vw;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.25s ease forwards;
}

.settings-modal h3 {
  font-size: 1.3em;
  color: #a6f2cc;
  margin-bottom: 28px;
}

.settings-field {
  margin-bottom: 22px;
}

.settings-field label {
  display: block;
  font-size: 0.82em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.4);
  margin-bottom: 10px;
}

.settings-input {
  width: 100%;
  padding: 10px 14px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(46, 207, 133, 0.25);
  border-radius: 10px;
  color: #fff;
  font-size: 0.95em;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.settings-input:focus {
  border-color: rgba(46, 207, 133, 0.6);
}

.region-options {
  display: flex;
  gap: 12px;
}

.region-option {
  flex: 1;
  text-align: center;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid rgba(46, 207, 133, 0.25);
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  font-size: 0.95em;
  transition: all 0.2s;
}

.region-option.active {
  background: rgba(46, 207, 133, 0.2);
  border-color: rgba(46, 207, 133, 0.6);
  color: #fff;
}

.settings-actions {
  display: flex;
  gap: 12px;
  margin-top: 28px;
}

.btn-cancel {
  flex: 1;
  padding: 10px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 10px;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.9em;
  transition: all 0.2s;
}

.btn-cancel:hover {
  border-color: rgba(255,255,255,0.3);
  color: #fff;
}

.btn-save {
  flex: 2;
  padding: 10px;
  background: rgba(46, 207, 133, 0.25);
  border: 1px solid rgba(46, 207, 133, 0.5);
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.9em;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: rgba(46, 207, 133, 0.4);
  box-shadow: 0 0 16px rgba(46, 207, 133, 0.3);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.table-card {
  animation: slideIn 0.8s ease forwards 0.2s;
}

.player-card {
  animation: slideIn 0.8s ease forwards 0.4s;
}

.animate-slide-in {
  animation: slideIn 0.8s ease forwards;
}

.info-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  margin-top: 25px;
}

.info-item {
  padding: 25px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 15px;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--vt-c-divider-dark-2);
}

.info-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(120deg, rgba(31, 165, 106, 0.1) 0%, rgba(46, 207, 133, 0.1) 100%);
  transition: left 0.6s ease;
  z-index: 0;
}

.info-item:hover::before {
  left: 100%;
}

.info-item:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border-color: var(--vt-c-purple);
}

.info-item h3 {
  position: relative;
  z-index: 1;
}

.info-item p {
  position: relative;
  z-index: 1;
  font-weight: 500;
  color: var(--vt-c-text-dark-2);
}

.team-name-cell {
  cursor: pointer;
  color: var(--vt-c-purple);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.team-name-cell:hover {
  color: var(--vt-c-indigo);
  transform: translateX(5px);
}

.team-name-cell::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 0%;
  height: 2px;
  background: linear-gradient(90deg, var(--vt-c-purple), var(--vt-c-indigo));
  transition: width 0.3s ease;
  z-index: 0;
}

.team-name-cell:hover::after {
  width: 100%;
}

.league-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
  margin-top: 25px;
  color: var(--vt-c-text-dark-1);
  animation: fadeIn 0.6s ease forwards 0.5s;
  opacity: 0;
  position: relative;
  z-index: 1;
}

.league-table th,
.league-table td {
  padding: 14px 18px;
  text-align: left;
  position: relative;
  z-index: 1;
}

.league-table th {
  background: rgba(31, 165, 106, 0.15);
  color: var(--vt-c-purple);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85em;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.league-table td:first-child {
  border-radius: 8px 0 0 8px;
  background: rgba(46, 207, 133, 0.1);
  color: var(--vt-c-indigo);
  font-weight: 600;
}

.league-table td:last-child {
  border-radius: 0 8px 8px 0;
}

.league-table tbody tr {
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.league-table tbody tr:hover {
  transform: scale(1.01);
  box-shadow: 0 8px 25px rgba(31, 165, 106, 0.2);
}

.league-table tbody tr:hover td:first-child {
  background: rgba(31, 165, 106, 0.2);
}

.player-list {
  margin-top: 25px;
}

.player-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  position: relative;
  z-index: 1;
}

.player-item:last-child {
  padding-bottom: 0;
}

.player-actions button {
  margin-left: 12px;
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.fire-button {
  background: linear-gradient(45deg, #ff4d4d, #cc0000);
  color: white;
  box-shadow: 0 4px 10px rgba(255, 77, 77, 0.3);
}

.fire-button:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 15px rgba(255, 77, 77, 0.4);
}

.sell-button {
  background: linear-gradient(45deg, #4caf50, #388e3c);
  color: white;
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.3);
}

.sell-button:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 15px rgba(76, 175, 80, 0.4);
}

h2 {
  font-size: 2.2em;
  margin-bottom: 25px;
  color: var(--vt-c-indigo);
  position: relative;
  z-index: 1;
}

h3 {
  font-size: 1.3em;
  color: var(--vt-c-purple);
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
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
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes neonGlow {
  0% {
    text-shadow: 0 0 5px var(--vt-c-purple), 0 0 10px var(--vt-c-purple);
  }
  100% {
    text-shadow: 0 0 10px var(--vt-c-indigo), 0 0 20px var(--vt-c-indigo);
  }
}

@keyframes rotateGlow {
  0% {
    transform: rotate(25deg);
  }
  100% {
    transform: rotate(385deg);
  }
}

/* Add subtle animated background pattern */
.clube-view::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 200%;
  background: repeating-radial-gradient(circle, rgba(31, 165, 106, 0.03) 0, rgba(31, 165, 106, 0.03) 10px, transparent 10px, transparent 20px);
  animation: backgroundMove 30s linear infinite;
  z-index: 0;
  pointer-events: none;
}

@keyframes backgroundMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(-25%, -25%);
  }
}

/* Stadium */
.stadium-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.stadium-item {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(46, 207, 133,0.2);
  border-radius: 14px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  z-index: 1;
}

.stadium-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stadium-item-label {
  font-size: 0.78em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: rgba(255,255,255,0.4);
}

.stadium-item-value {
  font-size: 0.95em;
  font-weight: 700;
  color: #fff;
}

.stadium-item-sub {
  font-size: 0.76em;
  color: rgba(255,255,255,0.35);
  min-height: 1em;
}

.level-dots {
  display: flex;
  gap: 5px;
}

.level-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1.5px solid rgba(46, 207, 133,0.35);
  background: transparent;
  transition: background 0.2s, border-color 0.2s;
}

.level-dot.filled {
  background: var(--vt-c-indigo);
  border-color: var(--vt-c-indigo);
  box-shadow: 0 0 6px rgba(46, 207, 133,0.5);
}

.upgrade-btn {
  width: 100%;
  padding: 9px 12px;
  background: rgba(46, 207, 133,0.1);
  border: 1px solid rgba(46, 207, 133,0.3);
  border-radius: 9px;
  color: #a6f2cc;
  font-size: 0.78em;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  margin-top: auto;
}

.upgrade-btn:hover:not(:disabled) {
  background: rgba(46, 207, 133,0.22);
  border-color: rgba(166, 242, 204,0.5);
  color: #fff;
  box-shadow: 0 0 10px rgba(46, 207, 133,0.2);
}

.upgrade-btn:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}

.saldo-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0 0;
  border-top: 1px solid rgba(255,255,255,0.07);
  font-size: 0.88em;
  color: rgba(255,255,255,0.45);
  position: relative;
  z-index: 1;
}

.saldo-value {
  font-weight: 700;
  font-size: 1.05em;
  color: #81c784;
}
</style>
