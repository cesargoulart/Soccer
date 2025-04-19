<template>
  <div class="jogos-view">
    <h1 class="title">Jogos</h1>
    <div class="content-wrapper">
      <!-- Upcoming Matches Section -->
      <div class="matches-section animate-slide-in">
        <h2>Próximos Jogos</h2>
        <table v-if="fixtures.length > 0" class="fixtures-table">
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
            <tr v-for="(fixture, index) in fixtures" :key="index">
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
        <div v-else>
          <p>A gerar calendário...</p>
        </div>
      </div>

      <!-- Results Section (remains the same for now, but using grid for consistency if needed later) -->
      <div class="results-section animate-slide-in" style="animation-delay: 0.2s">
        <h2>Últimos Resultados</h2>
        <div class="matches-grid">
          <div class="match-card result">
            <div class="match-header">
              <span class="match-date">10 Abril 2025</span>
              <span class="match-competition">Liga Portugal</span>
            </div>
            <div class="match-teams">
              <span class="team home">Equipa Casa</span>
              <span class="score">2 - 1</span>
              <span class="team away">Equipa Fora</span>
            </div>
            <div class="match-info">
              <span class="match-status completed">Terminado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Fixture {
  homeTeam: string
  awayTeam: string
  date: string
  time: string
  competition: string
  stadium: string
}

// Team list based on ClubeView placeholder data
const teams = [
  'Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta',
  'Team Epsilon', 'Team Zeta', 'Team Eta', 'Team Theta'
]

const fixtures = ref<Fixture[]>([])

// Simple function to generate round-robin fixtures
const generateFixtures = () => {
  const generated: Fixture[] = []
  const baseDate = new Date(2025, 3, 20) // Start date: April 20, 2025
  let matchDayOffset = 0

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const matchDate = new Date(baseDate)
      matchDate.setDate(baseDate.getDate() + matchDayOffset * 7 + (j % 2 === 0 ? 0 : 1)) // Basic date staggering

      generated.push({
        homeTeam: teams[i],
        awayTeam: teams[j],
        date: matchDate.toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' }),
        time: (j % 2 === 0 ? '18:00' : '20:30'), // Alternate times
        competition: 'Liga Placeholder',
        stadium: `${teams[i]} Stadium` // Placeholder stadium
      })

      // Simple way to advance match days, not a perfect schedule
      if (generated.length % (teams.length / 2) === 0) {
         matchDayOffset++;
      }
    }
  }
  fixtures.value = generated
}

onMounted(() => {
  generateFixtures()
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

/* Remove .matches-grid and .match-card styles */
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
  margin-top: 20px;
  color: #e0e0e0;
  animation: fadeIn 0.5s ease forwards 0.2s;
  opacity: 0;
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
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
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
