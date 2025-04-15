<template>
  <div class="equipa-view">
    <h1 class="title">Equipa</h1>
    <div class="content-wrapper">
      <div class="squad-section animate-slide-in">
        <h2>Plantel</h2>
        <div class="player-grid">
          <div class="player-card" v-for="position in ['Guarda-Redes', 'Defesas', 'Médios', 'Avançados']" :key="position">
            <h3>{{ position }}</h3>
            <div class="position-content">
              <p>Lista de jogadores...</p>
            </div>
          </div>
        </div>
      </div>

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

.player-grid, .staff-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.player-card, .staff-card {
  padding: 20px;
  background: rgba(30, 30, 30, 0.5);
  border-radius: 10px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.player-card:hover, .staff-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
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

.position-content {
  margin-top: 10px;
  padding: 10px;
  background: rgba(20, 20, 20, 0.3);
  border-radius: 8px;
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
