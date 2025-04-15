<template>
  <div class="jogos-view">
    <h1 class="title">Jogos</h1>
    <div class="content-wrapper">
      <div class="matches-section animate-slide-in">
        <h2>Próximos Jogos</h2>
        <div class="matches-grid">
          <div class="match-card">
            <div class="match-header">
              <span class="match-date">15 Abril 2025</span>
              <span class="match-competition">Liga Portugal</span>
            </div>
            <div class="match-teams">
              <span class="team home">Equipa Casa</span>
              <span class="vs">VS</span>
              <span class="team away">Equipa Fora</span>
            </div>
            <div class="match-info">
              <span class="match-time">20:45</span>
              <span class="match-stadium">Estádio Principal</span>
            </div>
          </div>
        </div>
      </div>

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

.matches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.match-card {
  padding: 20px;
  background: rgba(30, 30, 30, 0.5);
  border-radius: 10px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
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

.vs, .score {
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
