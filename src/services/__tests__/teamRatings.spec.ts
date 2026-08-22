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
  type PlayerLike,
} from '../teamRatings'

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
