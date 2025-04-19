<template>
  <div class="equipa-view">
    <h1 class="title">Equipa</h1>
    <div class="content-wrapper">
      <!-- Squad Section -->
      <div class="squad-section animate-slide-in">
        <h2>Plantel</h2>
        <table class="player-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Position</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="player in players" :key="player.id">
              <td>{{ player.number }}</td>
              <td>{{ player.name }}</td>
              <td>{{ player.position }}</td>
              <td>{{ player.rating }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Staff Section (remains the same) -->
      <div class="staff-section animate-slide-in" style="animation-delay: 0.2s">
        <h2>Equipa Técnica</h2>
        <div class="staff-grid">
          <div class="staff-card">
            <h3>Treinador Principal</h3>
            <p>Nome do treinador</p>
          </div>
          <div class="staff-card">
            <h3>Treinador Adjunto</h3>
            <p>Nome do adjunto</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Player {
  id: number
  name: string
  position: string
  number: number
  rating: number
}

// Placeholder player data for 11 players
const players = ref<Player[]>([
  { id: 1, name: 'Alex Silva', position: 'Guarda-Redes', number: 1, rating: 85 },
  { id: 2, name: 'Bruno Costa', position: 'Defesa Direito', number: 2, rating: 82 },
  { id: 3, name: 'Carlos Dias', position: 'Defesa Central', number: 4, rating: 84 },
  { id: 4, name: 'David Rocha', position: 'Defesa Central', number: 5, rating: 83 },
  { id: 5, name: 'Eduardo Lima', position: 'Defesa Esquerdo', number: 3, rating: 81 },
  { id: 6, name: 'Fábio Mendes', position: 'Médio Defensivo', number: 6, rating: 86 },
  { id: 7, name: 'Gustavo Alves', position: 'Médio Centro', number: 8, rating: 88 },
  { id: 8, name: 'Hugo Pereira', position: 'Médio Ofensivo', number: 10, rating: 90 },
  { id: 9, name: 'Igor Santos', position: 'Extremo Direito', number: 7, rating: 87 },
  { id: 10, name: 'João Nunes', position: 'Extremo Esquerdo', number: 11, rating: 85 },
  { id: 11, name: 'Kevin Andrade', position: 'Avançado', number: 9, rating: 89 }
])
</script>

<style scoped>
.equipa-view {
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

.squad-section, .staff-section {
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

/* Remove .player-grid styles */
.staff-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Keep staff grid */
  gap: 20px;
  margin-top: 20px;
}

/* Remove .player-card styles */
.staff-card {
  padding: 20px;
  background: rgba(30, 30, 30, 0.5);
  border-radius: 10px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* Remove .player-card:hover */
.staff-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.player-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  color: #e0e0e0;
  animation: fadeIn 0.5s ease forwards 0.2s; /* Fade in table */
  opacity: 0;
}

.player-table th,
.player-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.player-table th {
  background-color: rgba(64, 76, 255, 0.2);
  color: #a8b4ff;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.9em;
}

.player-table tbody tr {
  transition: background-color 0.3s ease;
}

.player-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.player-table td:first-child { /* Style player number */
  font-weight: bold;
  color: #646cff;
  text-align: center;
  width: 50px; /* Fixed width for number column */
}

h2 {
  font-size: 1.8em;
  margin-bottom: 20px;
  color: #646cff;
}

h3 {
  font-size: 1.2em;
  color: #a855f7;
  /* Staff card title */
  font-size: 1.2em;
  color: #a855f7;
  margin-bottom: 10px;
}

/* Remove styles for .player-header, .player-number, .player-details */

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
