// formations.ts
// Definição PURA das formações e das posições (slots) no campo.
// Sem dependências de Vue ou Firestore — usada tanto pela TaticaView
// (para desenhar o campo) como pelo teamRatings (para calcular a força do onze).

import type { PositionGroup } from './teamRatings'

export interface FormationSlot {
  /** Identificador estável do slot dentro da formação (chave usada no Firestore). */
  id: string
  /** Etiqueta curta mostrada no campo (GR, DC, MC, PL, ...). */
  label: string
  /** Grupo de posição esperado neste slot. */
  group: PositionGroup
  /** Posição horizontal no campo, 0 (esquerda) a 100 (direita). */
  x: number
  /** Posição vertical no campo, 0 (baliza adversária) a 100 (nossa baliza). */
  y: number
}

export interface Formation {
  id: string
  desc: string
  /** Linhas de pontos para a pré-visualização em miniatura (de trás para a frente). */
  rows: number[]
  slots: FormationSlot[]
}

const s = (
  id: string,
  label: string,
  group: PositionGroup,
  x: number,
  y: number,
): FormationSlot => ({ id, label, group, x, y })

export const FORMATIONS: Formation[] = [
  {
    id: '4-4-2',
    desc: 'Equilibrado',
    rows: [2, 4, 4, 1],
    slots: [
      s('gk', 'GR', 'GK', 50, 93),
      s('de', 'DE', 'DEF', 14, 74),
      s('dce', 'DC', 'DEF', 37, 78),
      s('dcd', 'DC', 'DEF', 63, 78),
      s('dd', 'DD', 'DEF', 86, 74),
      s('me', 'ME', 'MID', 14, 50),
      s('mce', 'MC', 'MID', 38, 53),
      s('mcd', 'MC', 'MID', 62, 53),
      s('md', 'MD', 'MID', 86, 50),
      s('ple', 'PL', 'ATT', 38, 22),
      s('pld', 'PL', 'ATT', 62, 22),
    ],
  },
  {
    id: '4-3-3',
    desc: 'Ofensivo',
    rows: [3, 3, 4, 1],
    slots: [
      s('gk', 'GR', 'GK', 50, 93),
      s('de', 'DE', 'DEF', 14, 74),
      s('dce', 'DC', 'DEF', 37, 78),
      s('dcd', 'DC', 'DEF', 63, 78),
      s('dd', 'DD', 'DEF', 86, 74),
      s('mce', 'MC', 'MID', 32, 54),
      s('mc', 'MC', 'MID', 50, 58),
      s('mcd', 'MC', 'MID', 68, 54),
      s('ee', 'EE', 'ATT', 18, 26),
      s('pl', 'PL', 'ATT', 50, 18),
      s('ed', 'ED', 'ATT', 82, 26),
    ],
  },
  {
    id: '3-5-2',
    desc: 'Controlo do meio',
    rows: [2, 5, 3, 1],
    slots: [
      s('gk', 'GR', 'GK', 50, 93),
      s('dce', 'DC', 'DEF', 32, 78),
      s('dc', 'DC', 'DEF', 50, 80),
      s('dcd', 'DC', 'DEF', 68, 78),
      s('ale', 'ALE', 'MID', 10, 54),
      s('mce', 'MC', 'MID', 35, 55),
      s('mc', 'MC', 'MID', 50, 60),
      s('mcd', 'MC', 'MID', 65, 55),
      s('ald', 'ALD', 'MID', 90, 54),
      s('ple', 'PL', 'ATT', 38, 22),
      s('pld', 'PL', 'ATT', 62, 22),
    ],
  },
  {
    id: '4-2-3-1',
    desc: 'Criativo',
    rows: [1, 3, 2, 4, 1],
    slots: [
      s('gk', 'GR', 'GK', 50, 93),
      s('de', 'DE', 'DEF', 14, 74),
      s('dce', 'DC', 'DEF', 37, 78),
      s('dcd', 'DC', 'DEF', 63, 78),
      s('dd', 'DD', 'DEF', 86, 74),
      s('mdce', 'MDC', 'MID', 38, 62),
      s('mdcd', 'MDC', 'MID', 62, 62),
      s('moe', 'ME', 'MID', 18, 40),
      s('mo', 'MO', 'MID', 50, 38),
      s('mod', 'MD', 'MID', 82, 40),
      s('pl', 'PL', 'ATT', 50, 16),
    ],
  },
  {
    id: '5-3-2',
    desc: 'Defensivo',
    rows: [2, 3, 5, 1],
    slots: [
      s('gk', 'GR', 'GK', 50, 93),
      s('ale', 'DE', 'DEF', 8, 70),
      s('dce', 'DC', 'DEF', 30, 79),
      s('dc', 'DC', 'DEF', 50, 81),
      s('dcd', 'DC', 'DEF', 70, 79),
      s('ald', 'DD', 'DEF', 92, 70),
      s('mce', 'MC', 'MID', 32, 54),
      s('mc', 'MC', 'MID', 50, 52),
      s('mcd', 'MC', 'MID', 68, 54),
      s('ple', 'PL', 'ATT', 38, 22),
      s('pld', 'PL', 'ATT', 62, 22),
    ],
  },
]

export const DEFAULT_FORMATION = '4-4-2'

export function getFormation(id?: string): Formation {
  return FORMATIONS.find((f) => f.id === id) ?? FORMATIONS[0]
}

/** Mapa slotId -> playerId. */
export type Lineup = Record<string, string>

/**
 * Penalização multiplicativa por jogar fora da posição natural.
 * 1 = na posição; < 1 = desconto no overall efetivo.
 */
export function positionFitPenalty(natural: PositionGroup, slot: PositionGroup): number {
  if (natural === slot) return 1
  // Um guarda-redes na linha (ou um jogador de campo na baliza) é o pior cenário.
  if (natural === 'GK' || slot === 'GK') return 0.6
  const order: PositionGroup[] = ['DEF', 'MID', 'ATT']
  const distance = Math.abs(order.indexOf(natural) - order.indexOf(slot))
  return distance === 1 ? 0.92 : 0.82
}

interface Selectable {
  id?: string
  position: string
  overall?: number
  rating?: number
}

/**
 * Sugere um onze para a formação dada, escolhendo por cada slot o melhor
 * jogador disponível — preferindo os da posição natural.
 * `existing` permite manter as escolhas já feitas pelo utilizador.
 */
export function suggestLineup(
  players: Selectable[],
  formationId: string | undefined,
  existing: Lineup = {},
  groupOf: (position: string) => PositionGroup = () => 'MID',
): Lineup {
  const slots = getFormation(formationId).slots
  const lineup: Lineup = {}
  const used = new Set<string>()

  // Mantém as escolhas válidas que já existiam.
  for (const slot of slots) {
    const id = existing[slot.id]
    if (id && players.some((p) => p.id === id) && !used.has(id)) {
      lineup[slot.id] = id
      used.add(id)
    }
  }

  const value = (p: Selectable) => p.overall ?? p.rating ?? 0
  const available = players
    .filter((p) => p.id && !used.has(p.id))
    .sort((a, b) => value(b) - value(a))

  for (const slot of slots) {
    if (lineup[slot.id]) continue
    const pick =
      available.find((p) => !used.has(p.id!) && groupOf(p.position) === slot.group) ??
      available.find((p) => !used.has(p.id!))
    if (!pick?.id) continue
    lineup[slot.id] = pick.id
    used.add(pick.id)
  }

  return lineup
}
