<template>
  <div class="clube-view">
    <h1 class="title">Clube</h1>
    <div class="content-wrapper">
      <template v-if="clube">
        <div class="info-card animate-slide-in">
          <h2>{{ clube.nome }}</h2>
          <div class="info-content">
            <div class="info-item">
              <h3>Stadium</h3>
              <p>{{ clube.stadium || 'N/A' }}</p>
            </div>
            <div class="info-item">
              <h3>Region</h3>
              <p>{{ clube.region || 'N/A' }}</p>
            </div>
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

        <!-- Player Data Section -->
        <div v-if="selectedTeam" class="player-card animate-slide-in">
          <h2>Players for {{ selectedTeam.name }}</h2>
          <div class="player-list">
            <div v-for="player in selectedTeamPlayers" :key="player.id" class="player-item">
              <p>{{ player.name }} ({{ player.position }})</p>
              <div class="player-actions">
                <button class="fire-button">Fire</button>
                <button class="sell-button">Sell</button>
              </div>
            </div>
            <p v-if="selectedTeamPlayers.length === 0">No players found for this team.</p>
          </div>
        </div>
      </template>
      <template v-else>
        <AddClube @clube-added="handleClubeAdded"></AddClube>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'; // Removed Timestamp
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
  console.log('ClubeView mounted')
  const auth = getAuth()
  console.log('Auth current user:', auth.currentUser)
  await fetchUserClubeData() // Fetch user's club based on registered team
  await fetchAllClubeData() // Fetch all clubs for the league table
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
  background: radial-gradient(circle at center, rgba(142, 45, 226, 0.15) 0%, transparent 70%);
  transform: rotate(25deg);
  z-index: 0;
}

.info-card:hover::before, .table-card:hover::before, .player-card:hover::before {
  animation: rotateGlow 10s linear infinite;
}

.info-card {
  animation: slideIn 0.8s ease forwards;
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
  background: linear-gradient(120deg, rgba(142, 45, 226, 0.1) 0%, rgba(100, 108, 255, 0.1) 100%);
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
  background: rgba(142, 45, 226, 0.15);
  color: var(--vt-c-purple);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85em;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.league-table td:first-child {
  border-radius: 8px 0 0 8px;
  background: rgba(100, 108, 255, 0.1);
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
  box-shadow: 0 8px 25px rgba(142, 45, 226, 0.2);
}

.league-table tbody tr:hover td:first-child {
  background: rgba(142, 45, 226, 0.2);
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
  background: repeating-radial-gradient(circle, rgba(142, 45, 226, 0.03) 0, rgba(142, 45, 226, 0.03) 10px, transparent 10px, transparent 20px);
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
</style>
