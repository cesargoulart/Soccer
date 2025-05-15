<template>
  <div class="detalhes-jogo-view">
    <div class="navigation-links">
      <router-link :to="previousPath" class="nav-link">
        <span class="icon"><i class="fas fa-arrow-left"></i></span>
        Voltar
      </router-link>
    </div>

    <div class="content-wrapper">
      <div class="jogo-card animate-slide-in">
        <div class="match-header">
          <div class="competition">{{ fixture?.competition }}</div>
          <div class="date-time">
            {{ fixture?.date }} - {{ fixture?.time }}
          </div>
        </div>

        <div class="teams-container">
          <div class="team home">
            <h2>{{ fixture?.homeTeam }}</h2>
          </div>
          <div class="vs">VS</div>
          <div class="team away">
            <h2>{{ fixture?.awayTeam }}</h2>
          </div>
        </div>

        <div class="match-details">
          <div class="stadium">
            <i class="fas fa-stadium"></i>
            <span>{{ fixture?.stadium }}</span>
          </div>
        </div>

        <!-- Controles da Partida -->
        <div class="match-controls">
          <button
            @click="isSimulating ? stopSimulation() : startSimulation()"
            :class="{'btn-start': !isSimulating, 'btn-stop': isSimulating}"
          >
            {{ isSimulating ? 'Parar Simulação' : 'Iniciar Partida' }}
          </button>
          <button
            v-if="isSimulating || isPaused"
            @click="togglePause()"
            class="btn-pause"
          >
            {{ isPaused ? 'Continuar' : 'Pausar' }}
          </button>
        </div>

        <!-- Cronômetro e Placar -->
        <div v-if="currentMinute > 0" class="match-live-info">
          <div class="match-timer">{{ currentMinute > 0 ? currentMinute + "'" : "" }}
            <span v-if="isPaused" class="paused-indicator">(Parado)</span>
          </div>
          <div class="live-score">
            <span class="team home">{{ fixture?.homeTeam }}</span>
            <span class="score-display">{{ score.home }} - {{ score.away }}</span>
            <span class="team away">{{ fixture?.awayTeam }}</span>
          </div>
        </div>

        <!-- Estatísticas da Partida -->
        <div class="match-stats" v-if="currentMinute > 0">
          <h4>Estatísticas ao vivo</h4>
          <div class="stat-row">
            <span class="stat-home-value">{{ matchStats.possession.home }}%</span>
            <div class="stat-label">Posse de bola</div>
            <span class="stat-away-value">{{ matchStats.possession.away }}%</span>
          </div>
          <div class="stat-progress">
            <div class="stat-bar home" :style="{width: matchStats.possession.home + '%'}"></div>
            <div class="stat-bar away" :style="{width: matchStats.possession.away + '%'}"></div>
          </div>

          <div class="stat-row">
            <span class="stat-home-value">{{ matchStats.shots.home }}</span>
            <div class="stat-label">Finalizações</div>
            <span class="stat-away-value">{{ matchStats.shots.away }}</span>
          </div>

          <div class="stat-row">
            <span class="stat-home-value">{{ matchStats.shotsOnTarget.home }}</span>
            <div class="stat-label">Finalizações no gol</div>
            <span class="stat-away-value">{{ matchStats.shotsOnTarget.away }}</span>
          </div>

          <div class="stat-row">
            <span class="stat-home-value">{{ matchStats.corners.home }}</span>
            <div class="stat-label">Escanteios</div>
            <span class="stat-away-value">{{ matchStats.corners.away }}</span>
          </div>

          <div class="stat-row">
            <span class="stat-home-value">{{ matchStats.fouls.home }}</span>
            <div class="stat-label">Faltas</div>
            <span class="stat-away-value">{{ matchStats.fouls.away }}</span>
          </div>

          <div class="stat-row">
            <span class="stat-home-value">{{ matchStats.yellowCards.home }}</span>
            <div class="stat-label">Cartões amarelos</div>
            <span class="stat-away-value">{{ matchStats.yellowCards.away }}</span>
          </div>
        </div>

        <!-- Seção de Comentários -->
        <div class="commentary-section">
          <h3>Comentários do Jogo</h3>

          <div class="timeline">
            <div v-for="comment in comments" :key="comment.id" class="timeline-item">
              <div class="timeline-marker">
                <span class="minute">{{ comment.minute }}'</span>
                <i :class="getCommentIcon(comment.type)" :style="{ color: getCommentColor(comment.type) }"></i>
              </div>
              <div class="timeline-content">
                <p>{{ comment.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebaseConfig'
import { useMatchSimulation } from '@/services/matchEngine'

interface Comment {
  id: string
  text: string
  timestamp: Date
  type: 'goal' | 'card' | 'substitution' | 'other' | 'kickOff' | 'shot' | 'save' | 'foul' | 'corner' | 'halfTime' | 'fullTime' | 'general'
  minute: number
}

interface Fixture {
  id?: string
  homeTeam: string
  awayTeam: string
  date: string
  matchDate: Date
  time: string
  competition: string
  stadium: string
}

const route = useRoute()
const router = useRouter()
const fixture = ref<Fixture | null>(null)
const comments = ref<Comment[]>([])
const previousPath = ref('/jogos')
let unsubscribe: (() => void) | undefined

// Simulação de partida
const fixtureId = computed(() => route.params.id.toString())
const {
  startSimulation: startMatchSim,
  stopSimulation: stopMatchSim,
  togglePause: toggleMatchPause,
  isSimulating,
  currentMinute,
  score,
  matchStats
} = useMatchSimulation(fixtureId.value)

const isPaused = computed(() => !isSimulating.value && currentMinute.value > 0)

// Iniciar simulação com dados dos times
const startSimulation = async () => {
  if (!fixture.value) return

  // Dados do time da casa
  const homeTeamData = {
    name: fixture.value.homeTeam,
    stadium: fixture.value.stadium,
    attackRating: 75, // Você pode buscar esses valores do Firestore depois
    defenseRating: 70,
    players: [] // Idealmente, buscar jogadores do time
  }

  // Dados do time visitante
  const awayTeamData = {
    name: fixture.value.awayTeam,
    attackRating: 73,
    defenseRating: 72,
    players: []
  }

  // Iniciar simulação com os times
  await startMatchSim(homeTeamData, awayTeamData)
}

// Parar simulação
const stopSimulation = () => {
  stopMatchSim()
}

// Pausar/continuar simulação
const togglePause = () => {
  toggleMatchPause()
}

onMounted(async () => {
  // Guardar o caminho anterior
  previousPath.value = route.query.from?.toString() || '/jogos'

  // Buscar detalhes do jogo
  const fixtureId = route.params.id
  if (fixtureId) {
    // Iniciar busca de comentários em tempo real
    unsubscribe = fetchComments(fixtureId.toString())
    try {
      const docRef = doc(db, 'upcomingFixtures', fixtureId.toString())
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        fixture.value = {
          id: docSnap.id,
          homeTeam: data.homeTeam,
          awayTeam: data.awayTeam,
          date: data.date,
          time: data.time,
          competition: data.competition,
          stadium: data.stadium,
          matchDate: data.matchDate?.toDate() || new Date()
        }
      } else {
        console.log('Jogo não encontrado!')
        router.push('/jogos')
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do jogo:', error)
    }
  }
})

// Limpar inscrição quando componente for desmontado
onUnmounted(() => {
  if (typeof unsubscribe === 'function') {
    unsubscribe()
  }
  stopSimulation() // Parar simulação ao sair
})

// Buscar comentários do jogo
const fetchComments = (fixtureId: string) => {
  const commentsRef = collection(db, 'fixtures', fixtureId, 'comments')
  const q = query(commentsRef, orderBy('minute', 'asc'))

  return onSnapshot(q, (snapshot) => {
    comments.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date()
    })) as Comment[]
  })
}

// Função para retornar o ícone baseado no tipo do comentário
const getCommentIcon = (type: string) => {
  switch (type) {
    case 'goal':
      return 'fas fa-futbol'
    case 'card':
      return 'fas fa-square'
    case 'substitution':
      return 'fas fa-retweet'
    case 'kickOff':
    case 'halfTime':
    case 'fullTime':
      return 'fas fa-whistle'
    case 'corner':
      return 'fas fa-flag-corner'
    case 'shot':
      return 'fas fa-bullseye'
    case 'save':
      return 'fas fa-hand-paper'
    case 'foul':
      return 'fas fa-exclamation-triangle'
    default:
      return 'fas fa-circle'
  }
}

// Função para retornar a cor baseada no tipo do comentário
const getCommentColor = (type: string) => {
  switch (type) {
    case 'goal':
      return '#32CD32'
    case 'card':
      return '#FFD700'
    case 'substitution':
      return '#4169E1'
    case 'kickOff':
    case 'halfTime':
    case 'fullTime':
      return '#00BFFF'
    case 'corner':
      return '#FF7F50'
    case 'shot':
      return '#FF6347'
    case 'save':
      return '#9932CC'
    case 'foul':
      return '#FF4500'
    default:
      return '#646cff'
  }
}
</script>

<style scoped>
.match-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 20px 0;
}

.btn-start, .btn-stop, .btn-pause {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

.btn-start {
  background: linear-gradient(135deg, #32CD32, #228B22);
  color: white;
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(50, 205, 50, 0.4);
}

.btn-stop {
  background: linear-gradient(135deg, #FF4500, #FF6347);
  color: white;
}

.btn-stop:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 69, 0, 0.4);
}

.btn-pause {
  background: linear-gradient(135deg, #FFA500, #FF8C00);
  color: white;
}

.btn-pause:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 165, 0, 0.4);
}

.match-live-info {
  text-align: center;
  margin: 20px 0;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: pulse 2s infinite alternate;
}

.match-timer {
  font-size: 24px;
  font-weight: bold;
  color: #FFD700;
  margin-bottom: 10px;
}

.paused-indicator {
  font-size: 18px;
  color: #FF6347;
  font-style: italic;
}

.live-score {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  font-size: 28px;
}

.score-display {
  background: rgba(0, 0, 0, 0.4);
  padding: 5px 15px;
  border-radius: 8px;
  font-weight: bold;
  color: #FFD700;
  min-width: 80px;
  text-align: center;
}

.match-stats {
  margin: 25px 0;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.match-stats h4 {
  text-align: center;
  margin-bottom: 15px;
  color: #646cff;
  font-size: 18px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
}

.stat-label {
  flex: 1;
  text-align: center;
  font-size: 14px;
  color: #e1e1e1;
}

.stat-home-value, .stat-away-value {
  width: 40px;
  text-align: center;
  font-weight: bold;
}

.stat-home-value {
  color: #646cff;
}

.stat-away-value {
  color: #FF6347;
}

.stat-progress {
  height: 8px;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
  background: #2A2A2A;
  display: flex;
  margin-bottom: 15px;
}

.stat-bar {
  height: 100%;
  transition: width 0.5s ease;
}

.stat-bar.home {
  background: linear-gradient(90deg, #646cff, #8F8FFF);
}

.stat-bar.away {
  background: linear-gradient(90deg, #FF4500, #FF6347);
}

/* Seção de comentários */
.commentary-section {
  margin-top: 30px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.commentary-section h3 {
  color: #646cff;
  margin-bottom: 20px;
  text-align: center;
  font-size: 20px;
}

/* Timeline de comentários */
.timeline {
  display: flex;
  flex-direction: column-reverse;
  gap: 15px;
}

.timeline-item {
  display: flex;
  gap: 15px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  animation: fadeInUp 0.5s ease-out;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  min-width: 40px;
}

.timeline-marker .minute {
  font-size: 14px;
  font-weight: bold;
  color: #FFD700;
}

.timeline-marker i {
  font-size: 18px;
}

.timeline-content {
  flex: 1;
}

.timeline-content p {
  margin: 0;
  color: #e1e1e1;
  font-size: 15px;
  line-height: 1.4;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 5px rgba(100, 108, 255, 0.3);
  }
  100% {
    box-shadow: 0 0 20px rgba(100, 108, 255, 0.6);
  }
}

@keyframes fadeInUp {
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
