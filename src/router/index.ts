import { createRouter, createWebHistory } from 'vue-router'
import AuthView from '../views/AuthView.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'auth',
      component: AuthView
    },
    {
      path: '/clube',
      name: 'clube',
      component: () => import('../views/ClubeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/equipa',
      name: 'equipa',
      component: () => import('../views/EquipaView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/jogos',
      name: 'jogos',
      component: () => import('../views/JogosView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/jogos/calendario',
      name: 'calendario',
      component: () => import('../views/CalendarioCompleto.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/jogos/historico',
      name: 'historico',
      component: () => import('../views/HistoricoJogos.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/economy',
      name: 'economy',
      component: () => import('../views/EconomyView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/transfers',
      name: 'transfers',
      component: () => import('../views/TransfersView.vue'),
      meta: { requiresAuth: true }
    }
,
    {
      path: '/jovens',
      name: 'jovens',
      component: () => import('../views/JovensView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/tatica',
      name: 'tatica',
      component: () => import('../views/TaticaView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/treino',
      name: 'treino',
      component: () => import('../views/TreinoView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/jogos/:id',
      name: 'detalhes-jogo',
      component: () => import('../views/DetalhesJogoView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// O Firebase restaura a sessão de forma assíncrona. Sem esperar por isso,
// `auth.currentUser` é null no primeiro carregamento e o utilizador é atirado
// para a página de login mesmo estando autenticado (ex.: F5 em /clube).
// Esperamos apenas uma vez; depois lemos sempre o valor actual.
let authInitialized = false
let authInitPromise: Promise<void> | null = null

function waitForAuthInit(): Promise<void> {
  if (authInitialized) return Promise.resolve()
  if (!authInitPromise) {
    authInitPromise = new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(getAuth(), () => {
        unsubscribe()
        authInitialized = true
        resolve()
      })
    })
  }
  return authInitPromise
}

// Navigation guard
router.beforeEach(async (to) => {
  await waitForAuthInit()

  const user = getAuth().currentUser
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  // Sem sessão iniciada, as páginas do jogo mandam de volta para o login
  if (requiresAuth && !user) return { name: 'auth' }

  // Com sessão iniciada, a página de autenticação salta logo para o Clube
  if (to.name === 'auth' && user) return { name: 'clube' }

  return true
})

export default router
