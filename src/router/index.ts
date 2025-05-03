import { createRouter, createWebHistory } from 'vue-router'
import AuthView from '../views/AuthView.vue'
import { getAuth } from 'firebase/auth'

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
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const auth = getAuth()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !auth.currentUser) {
    next('/')
  } else {
    next()
  }
})

export default router
