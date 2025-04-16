<template>
  <div class="add-clube-form animate-slide-in">
    <h2>Adicionar Clube</h2>
    <form @submit.prevent="handleSubmit" class="form-container">
      <div v-if="error" class="error-message">{{ error }}</div>
      <div class="form-group">
        <input
          v-model="clubeData.nome"
          type="text"
          placeholder="Nome do Clube"
          required
          class="input-field"
        />
      </div>
      <button type="submit" class="submit-btn" :disabled="isSubmitting">
        {{ isSubmitting ? 'Adicionando...' : 'Adicionar Clube' }}
        <span class="btn-shine"></span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/firebaseConfig'
import { getAuth } from 'firebase/auth'

const clubeData = ref({
  nome: ''
})
const error = ref('')
const isSubmitting = ref(false)

const emit = defineEmits(['clube-added'])

const handleSubmit = async (e: Event) => {
  e.preventDefault() // Ensure the form doesn't submit traditionally
  error.value = ''
  isSubmitting.value = true

  try {
    console.log('Form submitted')
    const auth = getAuth()
    const userId = auth.currentUser?.uid
    console.log('Current user ID:', userId)

    if (!userId) {
      error.value = 'Utilizador não autenticado. Por favor, faça login.'
      return
    }

    const newClube = {
      ...clubeData.value,
      userId,
      createdAt: new Date()
    }
    console.log('New clube data:', newClube)

    const clubeRef = await addDoc(collection(db, 'clubes'), newClube)
    console.log('Club added with ID:', clubeRef.id)

    const clubeToEmit = {
      id: clubeRef.id,
      ...newClube,
      createdAt: newClube.createdAt
    }
    console.log('Emitting clube:', clubeToEmit)
    emit('clube-added', clubeToEmit)

    clubeData.value = { nome: '' }
    console.log('Form reset')
  } catch (err) {
    console.error('Erro ao adicionar clube:', err)
    error.value = 'Erro ao adicionar clube. Tente novamente.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.add-clube-form {
  background: rgba(45, 45, 45, 0.7);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.form-group {
  position: relative;
}

.input-field {
  width: 100%;
  padding: 12px;
  background: rgba(30, 30, 30, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
  transition: all 0.3s ease;
}

.textarea {
  min-height: 120px;
  resize: vertical;
}

.input-field:focus {
  outline: none;
  border-color: #646cff;
  box-shadow: 0 0 0 2px rgba(100, 108, 255, 0.2);
}

.submit-btn {
  position: relative;
  padding: 12px 24px;
  background: linear-gradient(45deg, #646cff, #a855f7);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: linear-gradient(45deg, #4b5563, #6b7280);
}

.error-message {
  color: #ef4444;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.btn-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transform: rotate(45deg);
  animation: shine 2s infinite;
}

@keyframes shine {
  0% {
    transform: rotate(45deg) translateX(-200%);
  }
  100% {
    transform: rotate(45deg) translateX(200%);
  }
}

.animate-slide-in {
  animation: slideIn 0.6s ease forwards;
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
