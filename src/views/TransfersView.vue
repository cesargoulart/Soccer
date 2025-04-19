<template>
  <div class="transfers-view">
    <h1 class="title">Transfer Market</h1>
    <div class="content-wrapper">
      <div class="transfers-section animate-slide-in">
        <h2>Listed Players</h2>
        <div v-if="transfersStore.playersForTransfer.length === 0" class="no-players">
          <p>No players listed for transfer</p>
        </div>
        <table v-else class="player-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Position</th>
              <th>Rating</th>
              <th>Team</th> <!-- Added Team header -->
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="player in transfersStore.playersForTransfer" :key="player.id">
              <td>{{ player.number }}</td>
              <td>{{ player.name }}</td>
              <td>{{ player.position }}</td>
              <td>{{ player.rating }}</td>
              <td>{{ player.team }}</td> <!-- Added Team data -->
              <td>
                <button class="btn-remove" @click="removeFromTransfer(player.id)">
                  Remove from List
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTransfersStore } from '../stores/transfers'

const transfersStore = useTransfersStore()

const removeFromTransfer = (playerId: number) => {
  transfersStore.removePlayerFromTransfer(playerId)
}
</script>

<style scoped>
.transfers-view {
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
  max-width: 1200px;
  margin: 0 auto;
}

.transfers-section {
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

.no-players {
  text-align: center;
  padding: 40px;
  background: rgba(30, 30, 30, 0.5);
  border-radius: 10px;
  margin-top: 20px;
}

.no-players p {
  font-size: 1.2em;
  color: #646cff;
}

.player-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  color: #e0e0e0;
  animation: fadeIn 0.5s ease forwards 0.2s;
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

.player-table td:first-child {
  font-weight: bold;
  color: #646cff;
  text-align: center;
  width: 50px;
}

.btn-remove {
  padding: 8px 16px;
  background: linear-gradient(135deg, #ff4646 0%, #ff7070 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-remove:hover {
  transform: translateY(-2px);
  filter: brightness(110%);
}

h2 {
  font-size: 1.8em;
  margin-bottom: 20px;
  color: #646cff;
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
