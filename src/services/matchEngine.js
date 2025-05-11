// matchEngine.js - Serviço para simulação de partidas
import { ref, onUnmounted } from 'vue';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

export class MatchEngine {
  constructor(homeTeam, awayTeam, fixtureId) {
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.fixtureId = fixtureId;
    this.minute = 0;
    this.events = [];
    this.homeScore = 0;
    this.awayScore = 0;
    this.isPlaying = false;
    this.eventListeners = {};
    this.commentaryTimeout = null;
    this.simulationInterval = null;

    // Estatísticas da partida
    this.stats = {
      possession: { home: 50, away: 50 },
      shots: { home: 0, away: 0 },
      shotsOnTarget: { home: 0, away: 0 },
      corners: { home: 0, away: 0 },
      fouls: { home: 0, away: 0 },
      yellowCards: { home: 0, away: 0 },
      redCards: { home: 0, away: 0 }
    };

    // Estado atual do jogo
    this.currentState = {
      possession: Math.random() > 0.5 ? 'home' : 'away',
      fieldZone: 'midfield', // 'defense_home', 'midfield', 'attack_home', 'defense_away', 'attack_away'
      intensity: 'normal'    // 'low', 'normal', 'high'
    };
  }

  on(eventName, callback) {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = [];
    }
    this.eventListeners[eventName].push(callback);
    return this;
  }

  emit(eventName, data) {
    const callbacks = this.eventListeners[eventName] || [];
    callbacks.forEach(callback => callback(data));
  }

  startMatch() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.minute = 0;

    // Emitir comentário de início de jogo
    this.emitCommentary({
      type: 'kickOff',
      text: `A bola começa a rolar no estádio ${this.homeTeam.stadium}! ${this.homeTeam.name} contra ${this.awayTeam.name}.`,
      minute: 0,
      id: Date.now().toString()
    });

    // Iniciar simulação de partida
    this.simulationInterval = setInterval(() => this.simulateMinute(), 3000); // 3 segundos por minuto de jogo

    // Agendar comentários gerais para acontecer em intervalos aleatórios
    this.scheduleNextCommentary();
  }

  scheduleNextCommentary() {
    if (!this.isPlaying) return;

    const nextCommentaryDelay = this.getRandomInt(5000, 15000); // Entre 5 e 15 segundos

    this.commentaryTimeout = setTimeout(() => {
      this.generateGeneralCommentary();
      this.scheduleNextCommentary();
    }, nextCommentaryDelay);
  }

  simulateMinute() {
    this.minute++;

    // Simular eventos com base em probabilidades
    this.simulateEvents();

    // Emitir atualização de minuto
    this.emit('minuteUpdate', {
      minute: this.minute,
      homeScore: this.homeScore,
      awayScore: this.awayScore,
      stats: this.stats
    });

    // Simular mudança de posse de bola ocasionalmente
    if (Math.random() < 0.3) {
      this.currentState.possession = this.currentState.possession === 'home' ? 'away' : 'home';

      // Atualizar estatísticas de posse
      const possessionChange = this.getRandomInt(1, 3);
      if (this.currentState.possession === 'home') {
        this.stats.possession.home += possessionChange;
        this.stats.possession.away -= possessionChange;
      } else {
        this.stats.possession.home -= possessionChange;
        this.stats.possession.away += possessionChange;
      }

      // Garantir que os valores estão entre 0 e 100
      this.stats.possession.home = Math.max(0, Math.min(100, this.stats.possession.home));
      this.stats.possession.away = 100 - this.stats.possession.home;
    }

    // Comentário de meio tempo
    if (this.minute === 45) {
      this.emitCommentary({
        type: 'halfTime',
        text: `Fim do primeiro tempo! ${this.homeTeam.name} ${this.homeScore} x ${this.awayScore} ${this.awayTeam.name}.`,
        minute: 45,
        id: Date.now().toString()
      });
    }

    // Verificar fim do jogo
    if (this.minute >= 90) {
      this.endMatch();
    }
  }

  simulateEvents() {
    const possessionTeam = this.currentState.possession === 'home' ? this.homeTeam : this.awayTeam;
    const defendingTeam = this.currentState.possession === 'home' ? this.awayTeam : this.homeTeam;

    // Probabilidades baseadas na qualidade dos times
    const attackingStrength = possessionTeam.attackRating || 70;
    const defendingStrength = defendingTeam.defenseRating || 70;

    // Randomizar zona do campo
    if (Math.random() < 0.2) {
      const zones = ['defense', 'midfield', 'attack'];
      const zoneIndex = this.getRandomInt(0, 2);
      this.currentState.fieldZone = zones[zoneIndex];
    }

    // Simular eventos baseados na zona do campo e posse de bola
    // Chance de finalização
    if (this.currentState.fieldZone === 'attack' && Math.random() < 0.4) {
      const shotQuality = (attackingStrength / defendingStrength) * Math.random();

      // Registrar a finalização nas estatísticas
      if (this.currentState.possession === 'home') {
        this.stats.shots.home++;
      } else {
        this.stats.shots.away++;
      }

      // Gerar comentário de finalização
      const shootingPlayer = this.getRandomPlayer(possessionTeam);

      this.emitCommentary({
        type: 'shot',
        text: `${shootingPlayer} arrisca uma finalização para o ${possessionTeam.name}!`,
        minute: this.minute,
        id: Date.now().toString()
      });

      // Finalização no alvo
      if (shotQuality > 0.6) {
        if (this.currentState.possession === 'home') {
          this.stats.shotsOnTarget.home++;
        } else {
          this.stats.shotsOnTarget.away++;
        }

        // Chance de gol baseada na qualidade da finalização
        if (shotQuality > 0.85) {
          this.handleGoal(shootingPlayer, possessionTeam, defendingTeam);
        } else {
          // Defesa do goleiro
          const keeper = this.getRandomKeeper(defendingTeam);

          this.emitCommentary({
            type: 'save',
            text: `${keeper} faz uma boa defesa para o ${defendingTeam.name}!`,
            minute: this.minute,
            id: Date.now().toString()
          });
        }
      }
    }

    // Simular falta
    if (Math.random() < 0.1) {
      const foulCommitter = this.getRandomPlayer(defendingTeam);
      const foulVictim = this.getRandomPlayer(possessionTeam);

      // Registrar falta
      if (this.currentState.possession === 'home') {
        this.stats.fouls.away++;
      } else {
        this.stats.fouls.home++;
      }

      this.emitCommentary({
        type: 'foul',
        text: `Falta de ${foulCommitter} sobre ${foulVictim}.`,
        minute: this.minute,
        id: Date.now().toString()
      });

      // Chance de cartão
      if (Math.random() < 0.3) {
        if (Math.random() < 0.1) {
          // Cartão vermelho (10% das vezes que tem cartão)
          if (this.currentState.possession === 'home') {
            this.stats.redCards.away++;
          } else {
            this.stats.redCards.home++;
          }

          this.emitCommentary({
            type: 'card',
            text: `CARTÃO VERMELHO para ${foulCommitter}! Entrada muito dura, ${defendingTeam.name} fica com um jogador a menos.`,
            minute: this.minute,
            id: Date.now().toString()
          });
        } else {
          // Cartão amarelo
          if (this.currentState.possession === 'home') {
            this.stats.yellowCards.away++;
          } else {
            this.stats.yellowCards.home++;
          }

          this.emitCommentary({
            type: 'card',
            text: `Cartão amarelo para ${foulCommitter} por falta em ${foulVictim}.`,
            minute: this.minute,
            id: Date.now().toString()
          });
        }
      }
    }

    // Simular escanteio
    if (this.currentState.fieldZone === 'attack' && Math.random() < 0.15) {
      if (this.currentState.possession === 'home') {
        this.stats.corners.home++;
      } else {
        this.stats.corners.away++;
      }

      const cornerTaker = this.getRandomPlayer(possessionTeam);

      this.emitCommentary({
        type: 'corner',
        text: `Escanteio para o ${possessionTeam.name}. ${cornerTaker} vai cobrar.`,
        minute: this.minute,
        id: Date.now().toString()
      });

      // Pequena chance de gol de escanteio
      if (Math.random() < 0.1) {
        const scorer = this.getRandomPlayer(possessionTeam);
        this.handleGoal(scorer, possessionTeam, defendingTeam, `de cabeça após cobrança de escanteio de ${cornerTaker}`);
      }
    }

    // Simulação de substituição (mais provável na segunda metade do jogo)
    if (this.minute > 60 && Math.random() < 0.03) {
      const team = Math.random() < 0.5 ? this.homeTeam : this.awayTeam;
      const playerOut = this.getRandomPlayer(team);
      const playerIn = this.getRandomSubstitute(team);

      this.emitCommentary({
        type: 'substitution',
        text: `Substituição no ${team.name}: sai ${playerOut}, entra ${playerIn}.`,
        minute: this.minute,
        id: Date.now().toString()
      });
    }
  }

  handleGoal(scorer, scoringTeam, concedingTeam, extraContext = '') {
    // Atualizar placar
    if (scoringTeam === this.homeTeam) {
      this.homeScore++;
    } else {
      this.awayScore++;
    }

    // Texto do gol
    let goalText = `GOOOOOOL!!! ${scorer} marca para o ${scoringTeam.name}`;
    if (extraContext) {
      goalText += ` ${extraContext}`;
    }
    goalText += `! ${this.homeTeam.name} ${this.homeScore} x ${this.awayScore} ${this.awayTeam.name}.`;

    // Emitir comentário de gol
    this.emitCommentary({
      type: 'goal',
      text: goalText,
      minute: this.minute,
      id: Date.now().toString()
    });

    // Após um gol, a posse de bola vai para o time que sofreu
    this.currentState.possession = scoringTeam === this.homeTeam ? 'away' : 'home';
    this.currentState.fieldZone = 'midfield';
    this.currentState.intensity = 'high'; // Aumentar intensidade após gol
  }

  generateGeneralCommentary() {
    if (!this.isPlaying) return;

    const possessionTeam = this.currentState.possession === 'home' ? this.homeTeam : this.awayTeam;
    const player = this.getRandomPlayer(possessionTeam);

    let commentaryType = 'general';
    let commentaryText = '';

    // Comentários baseados na zona do campo
    switch (this.currentState.fieldZone) {
      case 'defense':
        commentaryText = `${player} tenta organizar a saída de bola do ${possessionTeam.name}.`;
        break;
      case 'midfield':
        commentaryText = `${possessionTeam.name} controla a posse de bola no meio-campo com ${player}.`;
        break;
      case 'attack':
        commentaryText = `${player} tenta criar uma chance para o ${possessionTeam.name} na área adversária.`;
        break;
      default:
        commentaryText = `${player} com a bola para o ${possessionTeam.name}.`;
    }

    // Adicionar comentários sobre o placar em momentos aleatórios
    if (Math.random() < 0.2) {
      commentaryText += ` ${this.homeTeam.name} ${this.homeScore} x ${this.awayScore} ${this.awayTeam.name}.`;
    }

    this.emitCommentary({
      type: commentaryType,
      text: commentaryText,
      minute: this.minute,
      id: Date.now().toString()
    });
  }

  emitCommentary(commentData) {
    this.emit('commentary', commentData);
  }

  endMatch() {
    // Limpar intervalos e timeouts
    clearInterval(this.simulationInterval);
    clearTimeout(this.commentaryTimeout);

    this.isPlaying = false;

    // Emitir comentário de fim de jogo
    this.emitCommentary({
      type: 'fullTime',
      text: `APITA O ÁRBITRO! FIM DE JOGO! ${this.homeTeam.name} ${this.homeScore} x ${this.awayScore} ${this.awayTeam.name}.`,
      minute: 90,
      id: Date.now().toString()
    });

    // Emitir evento de fim de jogo com resultado final
    this.emit('matchEnd', {
      homeTeam: this.homeTeam.name,
      awayTeam: this.awayTeam.name,
      homeScore: this.homeScore,
      awayScore: this.awayScore,
      stats: this.stats
    });
  }

  pauseMatch() {
    this.isPlaying = false;
    clearInterval(this.simulationInterval);
    clearTimeout(this.commentaryTimeout);
  }

  resumeMatch() {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.simulationInterval = setInterval(() => this.simulateMinute(), 3000);
      this.scheduleNextCommentary();
    }
  }

  // Helpers
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getRandomPlayer(team) {
    const playerNames = team.players?.map(p => p.name) || [
      'Silva', 'Santos', 'Oliveira', 'Rodrigues', 'Costa',
      'Almeida', 'Fernandes', 'Gonçalves', 'Sousa', 'Carvalho'
    ];

    return playerNames[this.getRandomInt(0, playerNames.length - 1)];
  }

  getRandomKeeper(team) {
    // Se o time tiver guarda-redes específicos, retornar um deles
    const keepers = team.players?.filter(p => p.position === 'GK').map(p => p.name) || ['Rui Patrício', 'Diogo Costa'];

    return keepers[this.getRandomInt(0, keepers.length - 1)];
  }

  getRandomSubstitute(team) {
    const benchNames = team.bench?.map(p => p.name) || [
      'Mendes', 'Ramos', 'Martins', 'Ferreira', 'Cardoso',
      'Pinto', 'Neves', 'Correia', 'Barbosa', 'Lopes'
    ];

    return benchNames[this.getRandomInt(0, benchNames.length - 1)];
  }
}

// Exemplo de banco de frases para diferentes situações
export const commentaryPhrases = {
  kickOff: [
    "E a bola rola no estádio {stadium}!",
    "Começa o jogo entre {homeTeam} e {awayTeam}!",
    "A partida tem início! {homeTeam} contra {awayTeam}."
  ],
  goal: [
    "GOOOOOOL! {player} marca para o {team}!",
    "É GOL! {player} balança as redes para o {team}!",
    "GOLAÇO DE {player}! Que finalização espetacular!"
  ],
  shot: [
    "{player} arrisca de fora da área!",
    "Finalização de {player}!",
    "{player} tenta o chute!"
  ],
};

// Composable Vue para integração
export const useMatchSimulation = (fixtureId) => {
  const matchEngine = ref(null);
  const isSimulating = ref(false);
  const currentMinute = ref(0);
  const score = ref({ home: 0, away: 0 });
  const matchStats = ref({
    possession: { home: 50, away: 50 },
    shots: { home: 0, away: 0 },
    shotsOnTarget: { home: 0, away: 0 },
    corners: { home: 0, away: 0 },
    fouls: { home: 0, away: 0 },
    yellowCards: { home: 0, away: 0 },
    redCards: { home: 0, away: 0 }
  });

  // Iniciar simulação
  const startSimulation = async (homeTeam, awayTeam) => {
    if (isSimulating.value) return;

    try {
      matchEngine.value = new MatchEngine(homeTeam, awayTeam, fixtureId);

      // Configurar handlers de eventos
      matchEngine.value.on('minuteUpdate', (data) => {
        currentMinute.value = data.minute;
        score.value = { home: data.homeScore, away: data.awayScore };
        matchStats.value = data.stats;
      });

      // Configurar manipulador para comentários
      matchEngine.value.on('commentary', async (commentData) => {
        try {
          // Salvar comentário na subcoleção fixtures/{fixtureId}/comments
          const commentsRef = collection(db, 'fixtures', fixtureId, 'comments');
          await addDoc(commentsRef, {
            ...commentData,
            timestamp: serverTimestamp()
          });
        } catch (error) {
          console.error('Erro ao salvar comentário:', error);
        }
      });

      // Configurar manipulador para fim de jogo
      matchEngine.value.on('matchEnd', async (result) => {
        isSimulating.value = false;
        try {
          // Atualizar documento do jogo com resultado final
          const fixtureRef = doc(db, 'fixtures', fixtureId);
          await updateDoc(fixtureRef, {
            homeScore: result.homeScore,
            awayScore: result.awayScore,
            stats: result.stats,
            status: 'completed',
            completedAt: serverTimestamp()
          });
        } catch (error) {
          console.error('Erro ao salvar resultado final:', error);
        }
      });

      // Iniciar o motor da partida
      matchEngine.value.startMatch();
      isSimulating.value = true;

    } catch (error) {
      console.error('Erro ao iniciar simulação:', error);
    }
  };

  // Parar simulação
  const stopSimulation = () => {
    if (matchEngine.value) {
      matchEngine.value.endMatch();
      isSimulating.value = false;
    }
  };

  // Pausar/continuar
  const togglePause = () => {
    if (!matchEngine.value) return;

    if (isSimulating.value) {
      matchEngine.value.pauseMatch();
      isSimulating.value = false;
    } else {
      matchEngine.value.resumeMatch();
      isSimulating.value = true;
    }
  };


  // Limpar recursos quando o componente for desmontado
  onUnmounted(() => {
    if (matchEngine.value) {
      matchEngine.value.endMatch();
    }
  });

  return {
    startSimulation,
    stopSimulation,
    togglePause,
    isSimulating,
    currentMinute,
    score,
    matchStats
  };
};
