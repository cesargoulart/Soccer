// teamRatings.ts
// Lógica PURA e testável que liga jogadores + tática à força da equipa,
// e calcula salários. Sem dependências de Vue ou Firestore — fácil de testar.

export interface PlayerLike {
  name?: string
  position: string
  overall: number
  rating?: number
  age?: number
}

export interface Tactic {
  formacao: string
  estilo: string
}

export interface TeamRatings {
  attackRating: number
  defenseRating: number
  midfieldRating: number
  overall: number
}

// ---------------------------------------------------------------------------
// Posições
// ---------------------------------------------------------------------------

export type PositionGroup = 'GK' | 'DEF' | 'MID' | 'ATT'

// Normaliza os vários nomes de posição usados no projeto (PT e abreviaturas).
export function positionGroup(position: string): PositionGroup {
  const p = (position || '').toLowerCase()
  if (p.includes('gole') || p === 'gk' || p.includes('guarda')) return 'GK'
  if (p.includes('defens') || p === 'def' || p.includes('zagueiro') || p.includes('lateral'))
    return 'DEF'
  if (p.includes('meio') || p === 'mid' || p.includes('medio') || p.includes('médio')) return 'MID'
  if (p.includes('atac') || p === 'att' || p.includes('avan') || p.includes('ponta')) return 'ATT'
  return 'MID'
}

function avg(values: number[], fallback = 70): number {
  if (!values.length) return fallback
  return values.reduce((a, b) => a + b, 0) / values.length
}

// ---------------------------------------------------------------------------
// Modificadores de tática
// ---------------------------------------------------------------------------

// Cada formação altera o peso ofensivo/defensivo/meio-campo (multiplicadores).
export function formationModifier(formacao: string): {
  attack: number
  defense: number
  midfield: number
} {
  switch (formacao) {
    case '4-3-3':
      return { attack: 1.1, defense: 0.95, midfield: 1.0 }
    case '3-5-2':
      return { attack: 1.0, defense: 0.9, midfield: 1.12 }
    case '4-2-3-1':
      return { attack: 1.05, defense: 1.0, midfield: 1.05 }
    case '5-3-2':
      return { attack: 0.9, defense: 1.15, midfield: 1.0 }
    case '4-4-2':
    default:
      return { attack: 1.0, defense: 1.0, midfield: 1.0 }
  }
}

// O estilo de jogo afeta o ritmo do jogo (nº de remates/eventos) e o risco.
export function styleModifier(estilo: string): {
  attack: number
  defense: number
  tempo: number // multiplicador de frequência de eventos ofensivos
} {
  switch (estilo) {
    case 'Posse':
      return { attack: 1.0, defense: 1.05, tempo: 0.9 }
    case 'Contra-ataque':
      return { attack: 1.08, defense: 1.05, tempo: 0.95 }
    case 'Pressão Alta':
      return { attack: 1.1, defense: 0.92, tempo: 1.2 }
    case 'Equilíbrio':
    default:
      return { attack: 1.0, defense: 1.0, tempo: 1.0 }
  }
}

// ---------------------------------------------------------------------------
// Força da equipa a partir dos jogadores + tática
// ---------------------------------------------------------------------------

export function computeRatings(players: PlayerLike[], tactic?: Partial<Tactic>): TeamRatings {
  const get = (p: PlayerLike) => p.overall ?? p.rating ?? 70

  const gk = players.filter((p) => positionGroup(p.position) === 'GK').map(get)
  const def = players.filter((p) => positionGroup(p.position) === 'DEF').map(get)
  const mid = players.filter((p) => positionGroup(p.position) === 'MID').map(get)
  const att = players.filter((p) => positionGroup(p.position) === 'ATT').map(get)

  const fMod = formationModifier(tactic?.formacao ?? '4-4-2')
  const sMod = styleModifier(tactic?.estilo ?? 'Equilíbrio')

  // Defesa pondera guarda-redes + defensores; ataque pondera avançados + algum meio.
  const defenseBase = avg([...def, ...gk, ...gk]) // guarda-redes conta a dobrar
  const attackBase = avg([...att, ...mid.slice(0, 2)])
  const midfieldBase = avg(mid)

  const attackRating = clampRating(attackBase * fMod.attack * sMod.attack)
  const defenseRating = clampRating(defenseBase * fMod.defense * sMod.defense)
  const midfieldRating = clampRating(midfieldBase * fMod.midfield)
  const overall = clampRating((attackRating + defenseRating + midfieldRating) / 3)

  return { attackRating, defenseRating, midfieldRating, overall }
}

function clampRating(v: number): number {
  return Math.max(1, Math.min(99, Math.round(v)))
}

// ---------------------------------------------------------------------------
// Probabilidade de golo (pura) — usada pelo motor e pelos testes
// ---------------------------------------------------------------------------

// Dada a força de ataque e de defesa, devolve uma probabilidade [0,1]
// de um remate se transformar em golo. Monótona: mais ataque -> mais golo,
// mais defesa -> menos golo.
export function goalChance(attackRating: number, defenseRating: number): number {
  const ratio = attackRating / (attackRating + defenseRating)
  // base ~ proporção da força, escalada para um intervalo realista por remate
  const chance = ratio * 0.35
  return Math.max(0.02, Math.min(0.6, chance))
}

// ---------------------------------------------------------------------------
// RNG com semente (determinístico) — permite simulações reproduzíveis/testes
// ---------------------------------------------------------------------------

export function createRng(seed = 1): () => number {
  let s = seed >>> 0
  if (s === 0) s = 0x9e3779b9
  return function next(): number {
    // mulberry32
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---------------------------------------------------------------------------
// Salários
// ---------------------------------------------------------------------------

// Salário semanal (na moeda do jogo) com base no overall e idade.
// Jogadores melhores e em idade de pico custam mais.
export function computeSalary(overall: number, age = 25): number {
  // base exponencial sobre o overall: 50 -> ~1k, 70 -> ~5k, 90 -> ~25k
  const base = Math.round(50 * Math.pow(1.085, overall - 40))

  // fator de idade: pico entre 24 e 29 anos
  let ageFactor = 1
  if (age < 21) ageFactor = 0.7
  else if (age < 24) ageFactor = 0.9
  else if (age <= 29) ageFactor = 1.1
  else if (age <= 32) ageFactor = 1.0
  else ageFactor = 0.75

  return Math.max(200, Math.round((base * ageFactor) / 10) * 10)
}

// Folha salarial semanal total de uma lista de jogadores.
export function totalWageBill(players: { salary?: number }[]): number {
  return players.reduce((sum, p) => sum + (p.salary ?? 0), 0)
}
