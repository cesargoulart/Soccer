// Configuração do menu lateral (design Menus v2) mapeada para as rotas existentes.
// Para acrescentar uma página: junta um `sub` ao item certo (e a rota em router/index.ts).

export interface MenuSub {
  label: string
  to: string
  /** Rotas extra que também marcam este sub-link como ativo (ex.: detalhe de um jogo). */
  also?: RegExp
}

export interface MenuItem {
  id: string
  label: string
  icon: string
  sub: MenuSub[]
}

export interface MenuGroup {
  group: string
  items: MenuItem[]
}

export const MENU: MenuGroup[] = [
  {
    group: 'Clube',
    items: [
      {
        id: 'prep',
        label: 'Preparar jogo',
        icon: 'target',
        sub: [
          { label: 'Táticas', to: '/tatica' },
          { label: 'Onze inicial', to: '/tatica/onze' },
          { label: 'Bilhetes', to: '/bilhetes' },
        ],
      },
      {
        id: 'treino',
        label: 'Treino',
        icon: 'dumbbell',
        sub: [{ label: 'Técnico', to: '/treino' }],
      },
      {
        id: 'estr',
        label: 'Estrutura',
        icon: 'shield',
        sub: [
          { label: 'Informação básica', to: '/clube' },
          { label: 'Plantel', to: '/equipa' },
          { label: 'Orçamento', to: '/economy' },
          { label: 'Jovens', to: '/jovens' },
        ],
      },
    ],
  },
  {
    group: 'Competição',
    items: [
      {
        id: 'comp',
        label: 'Competição',
        icon: 'ball',
        sub: [
          { label: 'Próximos jogos', to: '/jogos', also: /^\/jogos\/(?!calendario$|historico$)[^/]+$/ },
          { label: 'Calendário', to: '/jogos/calendario' },
          { label: 'Resultados', to: '/jogos/historico' },
        ],
      },
      {
        id: 'merc',
        label: 'Mercado',
        icon: 'bag',
        sub: [{ label: 'Transferências', to: '/transfers' }],
      },
    ],
  },
]

export interface MenuMatch {
  item: MenuItem
  sub: MenuSub
}

/** Encontra o item + sub-link que correspondem a um caminho (ou null). */
export function findMenuEntry(path: string): MenuMatch | null {
  for (const g of MENU) {
    for (const item of g.items) {
      for (const sub of item.sub) {
        if (sub.to === path || sub.also?.test(path)) return { item, sub }
      }
    }
  }
  return null
}
