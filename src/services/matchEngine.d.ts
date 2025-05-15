interface MatchEvent {
  minute: number;
  id: string;
}

interface MinuteUpdateEvent extends MatchEvent {
  homeScore: number;
  awayScore: number;
  stats: MatchStats;
}

interface CommentaryEvent extends MatchEvent {
  type: 'goal' | 'card' | 'substitution' | 'other' | 'kickOff' | 'shot' | 'save' | 'foul' | 'corner' | 'halfTime' | 'fullTime' | 'general';
  text: string;
}

interface MatchEndEvent {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  stats: MatchStats;
}

interface TeamData {
  name: string;
  stadium?: string;
  attackRating?: number;
  defenseRating?: number;
  players?: Array<{
    name: string;
    position?: string;
  }>;
  bench?: Array<{
    name: string;
    position?: string;
  }>;
}

interface MatchStats {
  possession: {
    home: number;
    away: number;
  };
  shots: {
    home: number;
    away: number;
  };
  shotsOnTarget: {
    home: number;
    away: number;
  };
  corners: {
    home: number;
    away: number;
  };
  fouls: {
    home: number;
    away: number;
  };
  yellowCards: {
    home: number;
    away: number;
  };
  redCards: {
    home: number;
    away: number;
  };
}

interface MatchScore {
  home: number;
  away: number;
}

interface MatchSimulationResult {
  startSimulation: (homeTeam: TeamData, awayTeam: TeamData) => Promise<void>;
  stopSimulation: () => void;
  togglePause: () => void;
  isSimulating: Ref<boolean>;
  currentMinute: Ref<number>;
  score: Ref<MatchScore>;
  matchStats: Ref<MatchStats>;
}

declare module '@/services/matchEngine' {
  import { Ref } from 'vue';

  export class MatchEngine {
    constructor(homeTeam: TeamData, awayTeam: TeamData, fixtureId: string);
    startMatch(): void;
    endMatch(): void;
    pauseMatch(): void;
    resumeMatch(): void;
    on(eventName: 'minuteUpdate', callback: (data: MinuteUpdateEvent) => void): this;
    on(eventName: 'commentary', callback: (data: CommentaryEvent) => void): this;
    on(eventName: 'matchEnd', callback: (data: MatchEndEvent) => void): this;
  }

  export const commentaryPhrases: {
    kickOff: string[];
    goal: string[];
    shot: string[];
  };

  export const useMatchSimulation: (fixtureId: string) => MatchSimulationResult;
}
