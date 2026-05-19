<template>
  <div class="saturday-countdown" :class="{ 'is-saturday': isTodaySaturday }">
    <div v-if="isTodaySaturday" class="banner saturday-banner">
      <span class="icon">⚽</span>
      <span class="text">Hoje é dia de jogo!</span>
      <span class="separator">·</span>
      <span class="text">Novo jogador das camadas jovens disponível!</span>
    </div>
    <div v-else class="banner countdown-banner">
      <span class="icon">📅</span>
      <span class="text">
        Próximo dia de jogo: <strong>Sábado, {{ nextSaturdayDisplay }}</strong>
        — faltam <strong>{{ daysUntilSaturday }} {{ daysUntilSaturday === 1 ? 'dia' : 'dias' }}</strong>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const isTodaySaturday = computed(() => new Date().getDay() === 6)

const daysUntilSaturday = computed(() => {
  const dayOfWeek = new Date().getDay()
  return (6 - dayOfWeek + 7) % 7
})

const nextSaturdayDisplay = computed(() => {
  const today = new Date()
  const saturday = new Date(today)
  saturday.setDate(today.getDate() + daysUntilSaturday.value)
  return saturday.toLocaleDateString('pt-PT', { day: '2-digit', month: 'long' })
})
</script>

<style scoped>
.saturday-countdown {
  margin-bottom: 24px;
}

.banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 0.95em;
  backdrop-filter: blur(8px);
}

.countdown-banner {
  background: rgba(100, 108, 255, 0.1);
  border: 1px solid rgba(100, 108, 255, 0.25);
  color: #a8b4ff;
}

.saturday-banner {
  background: rgba(142, 45, 226, 0.15);
  border: 1px solid rgba(142, 45, 226, 0.4);
  color: #d4a8ff;
  animation: pulse 2s ease-in-out infinite;
}

.icon {
  font-size: 1.1em;
  flex-shrink: 0;
}

.text strong {
  color: #fff;
}

.separator {
  opacity: 0.4;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(142, 45, 226, 0); }
  50% { box-shadow: 0 0 12px 2px rgba(142, 45, 226, 0.3); }
}
</style>
