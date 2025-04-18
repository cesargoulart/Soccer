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
import { ref, onMounted } from 'vue'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore' // Import doc and getDoc
import { db } from '@/firebaseConfig'
import { getAuth } from 'firebase/auth'
import AddClube from '@/components/AddClube.vue'

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

// Placeholder fictional teams
const fictionalTeams = [
  { name: 'Team Alpha', played: 5, won: 4, drawn: 1, lost: 0, goalDifference: 10, points: 13 },
  { name: 'Team Beta', played: 5, won: 3, drawn: 1, lost: 1, goalDifference: 5, points: 10 },
  { name: 'Team Gamma', played: 5, won: 3, drawn: 0, lost: 2, goalDifference: 2, points: 9 },
  { name: 'Team Delta', played: 5, won: 2, drawn: 2, lost: 1, goalDifference: 1, points: 8 },
  { name: 'Team Epsilon', played: 5, won: 2, drawn: 1, lost: 2, goalDifference: -1, points: 7 },
  { name: 'Team Zeta', played: 5, won: 1, drawn: 2, lost: 2, goalDifference: -3, points: 5 },
  { name: 'Team Eta', played: 5, won: 1, drawn: 0, lost: 4, goalDifference: -7, points: 3 },
  { name: 'Team Theta', played: 5, won: 0, drawn: 1, lost: 4, goalDifference: -7, points: 1 },
]

const clube = ref<Clube | null>(null)

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
  console.log('Fetching all league table data...');
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    console.log('Users query snapshot received:', querySnapshot);

    const registeredTeams: LeagueTeam[] = querySnapshot.docs
      .map((doc) => {
        const userData = doc.data();
        console.log('Processing user document for league table:', doc.id, userData);
        const teamName = userData.team;
        if (teamName && typeof teamName === 'string') {
          // Create LeagueTeam object for each registered team
          return {
            name: teamName,
            played: 0, // Default stats for now
            won: 0,
            drawn: 0,
            lost: 0,
            goalDifference: 0,
            points: 0,
          };
        }
        return null; // Filter out users without a valid team name
      })
      .filter((team): team is LeagueTeam => team !== null); // Filter out null values

    console.log('Registered teams fetched:', registeredTeams);

    // Combine registered teams with fictional teams, replacing fictional teams
    const teamsToInclude: LeagueTeam[] = [];
    const maxTeams = 8;

    // Add registered teams first, up to maxTeams
    for (const team of registeredTeams) {
      if (teamsToInclude.length < maxTeams) {
        teamsToInclude.push(team);
      } else {
        break;
      }
    }

    // Fill remaining slots with fictional teams
    const fictionalStartIndex = 0; // Start from the beginning of fictionalTeams
    for (let i = fictionalStartIndex; teamsToInclude.length < maxTeams && i < fictionalTeams.length; i++) {
      // Only add fictional teams if a real team with the same name doesn't exist
      if (!teamsToInclude.some(team => team.name === fictionalTeams[i].name)) {
         teamsToInclude.push(fictionalTeams[i]);
      }
    }


    // Sort the league table by points (descending) and then goal difference (descending)
    teamsToInclude.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return b.goalDifference - a.goalDifference;
    });


    leagueTable.value = teamsToInclude;

    console.log('Final league table data:', leagueTable.value);
  } catch (error) {
    console.error('Error fetching league table data:', error);
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
  color: #fff;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  overflow-y: auto; /* Add scroll for potentially long player lists */
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
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.info-card {
  background: rgba(45, 45, 45, 0.7);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0;
  transform: translateY(20px);
}

.table-card {
  background: rgba(45, 45, 45, 0.7);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0;
  transform: translateY(20px);
  animation-delay: 0.2s; /* Stagger animation */
}

.animate-slide-in {
  animation: slideIn 0.6s ease forwards;
}

.info-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.info-item {
  padding: 20px;
  background: rgba(30, 30, 30, 0.5);
  border-radius: 10px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.info-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.team-name-cell {
  cursor: pointer;
  color: #646cff; /* Highlight clickable team names */
  transition: color 0.3s ease;
}

.team-name-cell:hover {
  color: #a855f7; /* Change color on hover */
  text-decoration: underline;
}

.league-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  color: #e0e0e0;
  animation: fadeIn 0.5s ease forwards 0.4s; /* Fade in after slide */
  opacity: 0;
}

.league-table th,
.league-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.league-table th {
  background-color: rgba(64, 76, 255, 0.2);
  color: #a8b4ff;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.9em;
}

.league-table tbody tr {
  transition: background-color 0.3s ease;
}

.league-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.league-table td:first-child {
  font-weight: bold;
  color: #646cff;
}

.player-card {
  background: rgba(45, 45, 45, 0.7);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0;
  transform: translateY(20px);
  animation-delay: 0.4s; /* Stagger animation */
}

.player-list {
  margin-top: 20px;
}

.player-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.player-item:last-child {
  border-bottom: none;
}

.player-actions button {
  margin-left: 10px;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.fire-button {
  background-color: #ff4d4d; /* Red color for fire */
  color: white;
}

.fire-button:hover {
  background-color: #cc0000;
}

.sell-button {
  background-color: #4caf50; /* Green color for sell */
  color: white;
}

.sell-button:hover {
  background-color: #45a049;
}

.player-card {
  background: rgba(45, 45, 45, 0.7);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0;
  transform: translateY(20px);
  animation-delay: 0.4s; /* Stagger animation */
}

.player-list {
  margin-top: 20px;
}

.player-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.player-item:last-child {
  border-bottom: none;
}

.player-actions button {
  margin-left: 10px;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.fire-button {
  background-color: #ff4d4d; /* Red color for fire */
  color: white;
}

.fire-button:hover {
  background-color: #cc0000;
}

.sell-button {
  background-color: #4caf50; /* Green color for sell */
  color: white;
}

.sell-button:hover {
  background-color: #45a049;
}

h2 {
  font-size: 1.8em;
  margin-bottom: 20px;
  color: #646cff;
}

h3 {
  font-size: 1.2em;
  color: #a855f7;
  margin-bottom: 10px;
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
