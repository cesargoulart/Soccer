import { describe, it, expect } from 'vitest'
import {
  positionGroup,
  formationModifier,
  styleModifier,
  computeRatings,
  goalChance,
  createRng,
  computeSalary,
  totalWageBill,
  applyLineup,
  type PlayerLike,
} from '../teamRatings'
import { getFormation, suggestLineup } from '../formations'

// Plantel de exemplo (11 titulares) com posições em português
function squad(overall = 75): PlayerLike[] {
  return [
    { position: 'Goleiro', overall: overall - 5 },
    { position: 'Defensor', overall },
    { position: 'Defensor', overall },
    { position: 'Defensor', overall },
    { position: 'Defensor', overall },
    { position: 'Meio-campo', overall },
    { position: 'Meio-campo', overall },
    { position: 'Meio-campo', overall },
    { position: 'Atacante', overall },
    { position: 'Atacante', overall },
    { position: 'Atacante', overall },
  ]
}

describe('positionGroup', () => {
  it('classifica posições em PT e abreviaturas', () => {
    expect(positionGroup('Goleiro')).toBe('GK')
    expect(positionGroup('GK')).toBe('GK')
    expect(positionGroup('Defensor')).toBe('DEF')
    expect(positionGroup('Meio-campo')).toBe('MID')
    expect(positionGroup('Atacante')).toBe('ATT')
  })
})

describe('formationModifier / styleModifier', () => {
  it('4-3-3 é mais ofensiva que 5-3-2', () => {
    expect(formationModifier('4-3-3').attack).toBeGreaterThan(formationModifier('5-3-2').attack)
    expect(formationModifier('5-3-2').defense).toBeGreaterThan(formationModifier('4-3-3').defense)
  })

  it('Pressão Alta aumenta o tempo (ritmo) e Posse reduz', () => {
    expect(styleModifier('Pressão Alta').tempo).toBeGreaterThan(1)
    expect(styleModifier('Posse').tempo).toBeLessThan(1)
  })
})

describe('computeRatings', () => {
  it('produz ratings no intervalo 1-99', () => {
    const r = computeRatings(squad(75))
    expect(r.attackRating).toBeGreaterThanOrEqual(1)
    expect(r.attackRating).toBeLessThanOrEqual(99)
    expect(r.overall).toBeGreaterThan(60)
  })

  it('a tática altera o resultado: 4-3-3 dá mais ataque que 5-3-2', () => {
    const ofensiva = computeRatings(squad(75), { formacao: '4-3-3', estilo: 'Pressão Alta' })
    const defensiva = computeRatings(squad(75), { formacao: '5-3-2', estilo: 'Posse' })
    expect(ofensiva.attackRating).toBeGreaterThan(defensiva.attackRating)
    expect(defensiva.defenseRating).toBeGreaterThan(ofensiva.defenseRating)
  })

  it('jogadores melhores -> ratings maiores', () => {
    expect(computeRatings(squad(85)).overall).toBeGreaterThan(computeRatings(squad(60)).overall)
  })
})

describe('goalChance', () => {
  it('é monótona: mais ataque -> mais golo, mais defesa -> menos golo', () => {
    expect(goalChance(90, 60)).toBeGreaterThan(goalChance(60, 60))
    expect(goalChance(70, 90)).toBeLessThan(goalChance(70, 50))
  })

  it('fica sempre dentro de [0.02, 0.6]', () => {
    expect(goalChance(99, 1)).toBeLessThanOrEqual(0.6)
    expect(goalChance(1, 99)).toBeGreaterThanOrEqual(0.02)
  })
})

describe('createRng', () => {
  it('é determinístico para a mesma semente', () => {
    const a = createRng(42)
    const b = createRng(42)
    const seqA = [a(), a(), a()]
    const seqB = [b(), b(), b()]
    expect(seqA).toEqual(seqB)
  })

  it('devolve valores em [0,1)', () => {
    const rng = createRng(7)
    for (let i = 0; i < 1000; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('computeSalary', () => {
  it('jogadores melhores ganham mais', () => {
    expect(computeSalary(90, 27)).toBeGreaterThan(computeSalary(60, 27))
  })

  it('jogadores em idade de pico ganham mais que muito jovens ou velhos', () => {
    const pico = computeSalary(80, 27)
    const jovem = computeSalary(80, 18)
    const velho = computeSalary(80, 34)
    expect(pico).toBeGreaterThan(jovem)
    expect(pico).toBeGreaterThan(velho)
  })

  it('respeita o salário mínimo', () => {
    expect(computeSalary(40, 18)).toBeGreaterThanOrEqual(200)
  })
})

describe('totalWageBill', () => {
  it('soma os salários, tratando ausentes como 0', () => {
    expect(totalWageBill([{ salary: 1000 }, { salary: 500 }, {}])).toBe(1500)
  })
})

// ---------------------------------------------------------------------------
// Onze inicial (tática arrastando jogadores para o campo)
// ---------------------------------------------------------------------------

// Plantel de 16 jogadores com id, para testar a escolha do onze
function bigSquad(): PlayerLike[] {
  const make = (id: string, position: string, overall: number) => ({ id, position, overall })
  return [
    make('gk1', 'Goleiro', 78),
    make('gk2', 'Goleiro', 65),
    make('d1', 'Defensor', 80),
    make('d2', 'Defensor', 79),
    make('d3', 'Defensor', 77),
    make('d4', 'Defensor', 76),
    make('d5', 'Defensor', 70),
    make('m1', 'Meio-campo', 82),
    make('m2', 'Meio-campo', 80),
    make('m3', 'Meio-campo', 78),
    make('m4', 'Meio-campo', 74),
    make('m5', 'Meio-campo', 71),
    make('a1', 'Atacante', 84),
    make('a2', 'Atacante', 81),
    make('a3', 'Atacante', 75),
    make('a4', 'Atacante', 68),
  ]
}

describe('suggestLineup', () => {
  it('preenche os 11 slots sem repetir jogadores', () => {
    const lineup = suggestLineup(bigSquad(), '4-4-2', {}, positionGroup)
    const slots = getFormation('4-4-2').slots
    expect(Object.keys(lineup)).toHaveLength(11)
    expect(new Set(Object.values(lineup)).size).toBe(11)
    expect(slots.every((s) => !!lineup[s.id])).toBe(true)
  })

  it('prefere jogadores da posição natural e o melhor guarda-redes', () => {
    const lineup = suggestLineup(bigSquad(), '4-4-2', {}, positionGroup)
    expect(lineup.gk).toBe('gk1')
    expect(lineup.ple).toMatch(/^a/)
  })

  it('respeita as escolhas já feitas pelo utilizador', () => {
    const lineup = suggestLineup(bigSquad(), '4-4-2', { gk: 'gk2' }, positionGroup)
    expect(lineup.gk).toBe('gk2')
    expect(Object.values(lineup)).not.toContain('gk1')
  })
})

describe('applyLineup', () => {
  it('sem onze guardado devolve o plantel inteiro', () => {
    const squadList = bigSquad()
    expect(applyLineup(squadList, { formacao: '4-4-2' })).toHaveLength(squadList.length)
  })

  it('com onze guardado devolve apenas 11 titulares', () => {
    const squadList = bigSquad()
    const onze = suggestLineup(squadList, '4-4-2', {}, positionGroup)
    expect(applyLineup(squadList, { formacao: '4-4-2', onze })).toHaveLength(11)
  })

  it('o jogador passa a contar com a posição do slot onde foi colocado', () => {
    const squadList = bigSquad()
    // Um defesa colocado a ponta de lança
    const onze = suggestLineup(squadList, '4-4-2', { ple: 'd1' }, positionGroup)
    const starters = applyLineup(squadList, { formacao: '4-4-2', onze })
    const moved = starters.find((p) => p.id === 'd1')
    expect(moved?.position).toBe('ATT')
  })

  it('jogar fora de posição custa overall', () => {
    const squadList = bigSquad()
    const certo = applyLineup(squadList, {
      formacao: '4-4-2',
      onze: suggestLineup(squadList, '4-4-2', { gk: 'gk1' }, positionGroup),
    })
    const errado = applyLineup(squadList, {
      formacao: '4-4-2',
      onze: suggestLineup(squadList, '4-4-2', { gk: 'a1' }, positionGroup),
    })
    const gkCerto = certo.find((p) => p.position === 'GK')!
    const gkErrado = errado.find((p) => p.position === 'GK')!
    expect(gkErrado.overall).toBeLessThan(gkCerto.overall)
  })

  it('um onze com os melhores jogadores é mais forte que um com os piores', () => {
    const squadList = bigSquad()
    const melhor = suggestLineup(squadList, '4-4-2', {}, positionGroup)
    const pior = suggestLineup(squadList, '4-4-2', { gk: 'gk2', ple: 'a4', pld: 'a3' }, positionGroup)
    const rMelhor = computeRatings(applyLineup(squadList, { formacao: '4-4-2', onze: melhor }))
    const rPior = computeRatings(applyLineup(squadList, { formacao: '4-4-2', onze: pior }))
    expect(rMelhor.overall).toBeGreaterThanOrEqual(rPior.overall)
  })

  it('completa slots vazios em vez de mandar 8 jogadores para o campo', () => {
    const squadList = bigSquad()
    const starters = applyLineup(squadList, { formacao: '4-3-3', onze: { gk: 'gk1' } })
    expect(starters).toHaveLength(11)
  })
})
