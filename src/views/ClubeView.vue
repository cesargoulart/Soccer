<template>
  <div class="clube-view">
    <h1 class="title">Clube</h1>
    <div class="content-wrapper">
      <template v-if="clube">
        <div class="info-card animate-slide-in">
          <h2>{{ clube.nome }}</h2>
        </div>
      </template>
      <template v-else>
        <AddClube @clube-added="handleClubeAdded"></AddClube>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebaseConfig'
import { getAuth } from 'firebase/auth'
import AddClube from '@/components/AddClube.vue'

interface Clube {
  id: string
  nome: string
  userId: string
  createdAt: Date
}

const clube = ref<Clube | null>(null)

const fetchClubeData = async () => {
  console.log('Fetching clube data...')
  try {
    const auth = getAuth()
    const userId = auth.currentUser?.uid

    if (!userId) {
      console.error('User not authenticated')
      return
    }

    const clubesRef = collection(db, 'clubes')
    const q = query(clubesRef, where('userId', '==', userId))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const clubeDoc = querySnapshot.docs[0]
      const data = clubeDoc.data()
      clube.value = {
        id: clubeDoc.id,
        nome: data.nome,
        userId: data.userId,
        createdAt: data.createdAt.toDate()
      }
    }
  } catch (error) {
    console.error('Error fetching clube data:', error)
  }
}

const handleClubeAdded = async (newClube: Clube) => {
  console.log('Clube added event received:', newClube)
  clube.value = newClube
  await fetchClubeData()
}

onMounted(async () => {
  console.log('ClubeView mounted')
  const auth = getAuth()
  console.log('Auth current user:', auth.currentUser)
  await fetchClubeData()
})

</script>

<style scoped>
.clube-view {
  padding: 20px;
  color: #fff;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}

.title {
  font-size: 2.5em;
  margin-bottom: 30px;
  text-align: center;
  background: linear-gradient(45deg, #646cff, #a855f7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  opacity: 0;
  animation: fadeIn 0.5s ease forwards;
}

.content-wrapper {
  display: grid;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.info-card {
  background: rgba(45, 45, 45, 0.7);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0;
  transform: translateY(20px);
}

.animate-slide-in {
  animation: slideIn 0.6s ease forwards;
}

.info-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.info-item {
  padding: 20px;
  background: rgba(30, 30, 30, 0.5);
  border-radius: 10px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.info-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

h2 {
  font-size: 1.8em;
  margin-bottom: 20px;
  color: #646cff;
}

h3 {
  font-size: 1.2em;
  color: #a855f7;
  margin-bottom: 10px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
