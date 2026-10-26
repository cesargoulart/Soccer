import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { doc, getDoc, getDocs, collection, query, where } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '@/firebaseConfig'

export interface ClubInstalacoes {
  relvado: number
  balnearios: number
  bilheteira: number
}

// Dados base do clube do utilizador, partilhados pela topbar, pela
// "Informação básica" e pelos "Bilhetes".
export const useClubStore = defineStore('club', () => {
  const uid = ref<string | null>(null)
  const loaded = ref(false)
  const team = ref<string | null>(null)
  const clubeId = ref<string | null>(null)
  const stadium = ref('')
  const region = ref('')
  const capacidade = ref(5000)
  const instalacoes = ref<ClubInstalacoes>({ relvado: 1, balnearios: 1, bilheteira: 1 })
  const createdAt = ref<Date | null>(null)

  // Época de agosto a julho: "2026/27"
  const season = computed(() => {
    const now = new Date()
    const start = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1
    return `${start}/${String((start + 1) % 100).padStart(2, '0')}`
  })

  async function load(force = false) {
    const user = getAuth().currentUser
    if (!user) return
    if (loaded.value && !force && uid.value === user.uid) return
    uid.value = user.uid
    try {
      const userSnap = await getDoc(doc(db, 'users', user.uid))
      team.value = userSnap.exists() ? (userSnap.data().team ?? null) : null
      if (team.value) {
        const snap = await getDocs(query(collection(db, 'clubes'), where('nome', '==', team.value)))
        if (!snap.empty) {
          const d = snap.docs[0].data()
          clubeId.value = snap.docs[0].id
          stadium.value = d.stadium ?? ''
          region.value = d.region ?? ''
          capacidade.value = d.capacidade ?? 5000
          instalacoes.value = {
            relvado: d.instalacoes?.relvado ?? 1,
            balnearios: d.instalacoes?.balnearios ?? 1,
            bilheteira: d.instalacoes?.bilheteira ?? 1,
          }
          createdAt.value = d.createdAt?.toDate?.() ?? null
        }
      }
      loaded.value = true
    } catch (e) {
      console.error('Erro ao carregar o clube:', e)
    }
  }

  function reset() {
    uid.value = null
    loaded.value = false
    team.value = null
    clubeId.value = null
  }

  return { team, clubeId, stadium, region, capacidade, instalacoes, createdAt, season, loaded, load, reset }
})
