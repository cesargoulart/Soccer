<template>
  <div class="jogos-view">
    <h1 class="title">Jogos</h1>
    <div class="content-wrapper">
      <!-- Upcoming Matches Section -->
      <div class="matches-section animate-slide-in">
        <h2>Próximos Jogos</h2>

        <div v-if="Object.keys(groupedFixtures).length > 0">
          <div v-for="(weekFixtures, weekKey) in groupedFixtures" :key="weekKey" class="week-group">
            <h3 class="week-title">{{ weekKey }}</h3>
            <table class="fixtures-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Hora</th>
                  <th>Equipa Casa</th>
                  <th></th> <!-- VS column -->
                  <th>Equipa Fora</th>
                  <th>Competição</th>
                  <th>Estádio</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(fixture, index) in weekFixtures" :key="`${weekKey}-${index}`"> <!-- Improved key -->
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
          <p>{{ loadingMessage }}</p> <!-- Updated loading message -->
        </div>
      </div>

      <!-- Results Section (Placeholder) -->
      <div class="results-section animate-slide-in" style="animation-delay: 0.2s">
        <h2>Últimos Resultados</h2>
        <div class="matches-grid">
          <div class="match-card result">
            <div class="match-header">
              <span class="match-date">10 Abril 2025</span>
              <span class="match-competition">Liga Placeholder</span>
            </div>
            <div class="match-teams">
              <span class="team home">Equipa Casa</span>
              <span class="score">? - ?</span>
              <span class="team away">Equipa Fora</span>
            </div>
            <div class="match-info">
              <span class="match-status scheduled">Agendado</span> <!-- Changed status -->
            </div>
          </div>
           <p>Resultados ainda não disponíveis.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { collection, getDocs } from 'firebase/firestore' // Import Firestore functions
import { db } from '@/firebaseConfig' // Import db instance

interface Fixture {
  homeTeam: string
  awayTeam: string
  date: string // Formatted date string for display
  matchDate: Date // Actual Date object for calculations
  time: string
  competition: string
  stadium: string
}

const fixtures = ref<Fixture[]>([])
const leagueTeams = ref<string[]>([]) // To store fetched + placeholder teams
const loadingMessage = ref('A carregar equipas...') // Loading state message
const LEAGUE_SIZE = 8; // Define desired league size

// Fictional teams list (names only, matching ClubeView)
const fictionalTeamNames = [
  'Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta',
  'Team Epsilon', 'Team Zeta', 'Team Eta', 'Team Theta'
];

// Fetch real teams from Firestore and combine with fictional teams (logic adapted from ClubeView)
const fetchLeagueTeams = async () => {
  console.log('Fetching league teams for fixtures...');
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    console.log('Users query snapshot received:', querySnapshot.size);

    const registeredTeams: string[] = querySnapshot.docs
      .map((doc) => {
        const userData = doc.data();
        return userData.team; // Assuming 'team' field holds the team name
      })
      .filter((teamName): teamName is string => typeof teamName === 'string' && teamName.trim() !== ''); // Filter out invalid names

    console.log('Registered teams fetched:', registeredTeams);

    // Combine registered teams with fictional teams (ClubeView logic)
    const teamsToInclude: string[] = [];

    // Add registered teams first, up to LEAGUE_SIZE
    for (const teamName of registeredTeams) {
      if (teamsToInclude.length < LEAGUE_SIZE) {
         // Ensure uniqueness before adding
         if (!teamsToInclude.includes(teamName)) {
            teamsToInclude.push(teamName);
         }
      } else {
        break;
      }
    }
    console.log('Teams after adding registered:', teamsToInclude);

    // Fill remaining slots with fictional teams
    let fictionalIndex = 0;
    while (teamsToInclude.length < LEAGUE_SIZE && fictionalIndex < fictionalTeamNames.length) {
      const fictionalName = fictionalTeamNames[fictionalIndex];
      // Only add fictional teams if a team with the same name doesn't exist
      if (!teamsToInclude.includes(fictionalName)) {
         teamsToInclude.push(fictionalName);
      }
      fictionalIndex++;
    }
     console.log('Teams after adding fictional:', teamsToInclude);


     // Handle case where not enough unique teams could be found
     if (teamsToInclude.length < LEAGUE_SIZE) {
        console.warn(`Could only assemble ${teamsToInclude.length} unique teams, needed ${LEAGUE_SIZE}. Fixture generation might be incomplete.`);
        // Optionally add generic placeholders if strict size is needed
        // let genericCounter = 1;
        // while (teamsToInclude.length < LEAGUE_SIZE) {
        //    const genericName = `Placeholder ${genericCounter++}`;
        //    if (!teamsToInclude.includes(genericName)) {
        //       teamsToInclude.push(genericName);
        //    } else {
        //        // Avoid infinite loop if somehow generic names clash
        //        break;
        //    }
        // }
     }

    leagueTeams.value = teamsToInclude.slice(0, LEAGUE_SIZE); // Ensure exactly LEAGUE_SIZE teams if possible
    console.log('Final league teams for fixtures:', leagueTeams.value);
    loadingMessage.value = 'A gerar calendário...'; // Update loading message

  } catch (error) {
    console.error('Error fetching league teams:', error);
    loadingMessage.value = 'Erro ao carregar equipas.';
    // Fallback to fictional teams if fetch fails
    leagueTeams.value = fictionalTeamNames.slice(0, LEAGUE_SIZE);
  }
};


// Helper function to get ISO week number
const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Simple function to generate round-robin fixtures
const generateFixtures = () => {
   // Use the fetched/combined leagueTeams
   const teamsToSchedule = [...leagueTeams.value]; // Create a copy to potentially modify
   if (teamsToSchedule.length < 2) {
       console.warn("Not enough teams to generate fixtures.");
       fixtures.value = [];
       loadingMessage.value = 'Não há equipas suficientes para gerar calendário.';
       return;
   }
   let addedBye = false;
   // Ensure even number of teams for simple round-robin
   if (teamsToSchedule.length % 2 !== 0) {
       teamsToSchedule.push("BYE"); // Add a dummy team if odd number
       addedBye = true;
       console.warn("Odd number of teams, added BYE week.");
   }

  const generated: Fixture[] = []
  const numTeams = teamsToSchedule.length;
  const numRounds = numTeams - 1;
  const matchesPerRound = numTeams / 2;
  const baseDate = new Date(2025, 3, 20) // Start date: April 20, 2025 (Month is 0-indexed)

  // Create team rotation arrays
  const teamIndices = Array.from(Array(numTeams).keys());

  for (let round = 0; round < numRounds; round++) {
      const roundDate = new Date(baseDate);
      roundDate.setDate(baseDate.getDate() + round * 7); // Advance by one week per round

      for (let match = 0; match < matchesPerRound; match++) {
          const homeIndex = teamIndices[match];
          const awayIndex = teamIndices[numTeams - 1 - match];

          const homeTeam = teamsToSchedule[homeIndex];
          const awayTeam = teamsToSchedule[awayIndex];

          // Skip BYE matches
          if (homeTeam === "BYE" || awayTeam === "BYE") {
              continue;
          }

          // Determine actual match date (e.g., Saturday of the round week)
          const matchDate = new Date(roundDate);
          matchDate.setDate(roundDate.getDate() + 6); // Set to Saturday

          // Alternate times
          const matchTime = match % 2 === 0 ? '18:00' : '20:30';

          generated.push({
              homeTeam: homeTeam,
              awayTeam: awayTeam,
              matchDate: matchDate,
              date: matchDate.toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' }),
              time: matchTime,
              competition: 'Liga Placeholder',
              stadium: `${homeTeam} Stadium` // Placeholder stadium
          });
      }

      // Rotate teams for next round (excluding the first team)
      if (numTeams > 1) { // Avoid error if only 1 team + BYE
        const lastTeam = teamIndices.pop()!;
        teamIndices.splice(1, 0, lastTeam);
      }
  }

  // Remove BYE team if it was added
  if (addedBye) {
      teamsToSchedule.pop();
  }

  // Sort fixtures by date before assigning
  generated.sort((a, b) => a.matchDate.getTime() - b.matchDate.getTime());
  fixtures.value = generated
  if (generated.length === 0 && teamsToSchedule.length >= 2) {
      loadingMessage.value = 'Calendário gerado sem jogos (verificar equipas).';
  } else if (generated.length > 0) {
       loadingMessage.value = ''; // Clear loading message if fixtures generated
  }
  console.log("Fixtures generated:", fixtures.value.length);
}

// Computed property to group fixtures by week
const groupedFixtures = computed(() => {
  const groups: { [key: string]: Fixture[] } = {}
  fixtures.value.forEach(fixture => {
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
        const [, weekA, yearA] = a.match(/Semana (\d+), (\d+)/) || [];
        const [, weekB, yearB] = b.match(/Semana (\d+), (\d+)/) || [];
        if (!weekA || !weekB) return 0; // Handle potential match failure
        if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
        return parseInt(weekA) - parseInt(weekB);
    });

    const sortedGroups: { [key: string]: Fixture[] } = {};
    sortedWeeks.forEach(weekKey => {
        sortedGroups[weekKey] = groups[weekKey];
    });

  return sortedGroups;
})


onMounted(async () => {
  await fetchLeagueTeams(); // Fetch teams first
  generateFixtures();      // Then generate fixtures with the fetched teams
})

</script>

<style scoped>
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

.matches-section, .results-section {
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
.results-section .match-card { /* Style results card */
   padding: 20px;
   background: rgba(30, 30, 30, 0.5);
   border-radius: 10px;
   transition: transform 0.3s ease, box-shadow 0.3s ease;
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

.completed { /* Keep for results if needed */
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
}
.scheduled { /* Style for scheduled games in results placeholder */
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
