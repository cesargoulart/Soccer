<template>
  <div class="jovens-view">
    <h1 class="title">Jovens Promessas</h1>
    <div class="content-wrapper">
      <WeeklyPlayer />
    </div>
  </div>
</template>

<script setup lang="ts">
import WeeklyPlayer from '@/components/WeeklyPlayer.vue'
</script>

<style scoped>
.jovens-view {
  padding: 20px;
  color: #fff;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  animation: fadeInView 0.5s ease-out;
}

.title {
  font-size: 2.5em;
  margin-bottom: 30px;
  text-align: center;
  background: linear-gradient(45deg, #4caf50, #81c784); /* Green gradient */
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  opacity: 0;
  animation: fadeIn 0.5s ease forwards 0.1s;
}

.content-wrapper {
  max-width: 800px; /* Adjust as needed */
  margin: 0 auto;
  opacity: 0;
  animation: slideIn 0.6s ease forwards 0.3s;
}

/* Re-use WeeklyPlayer styles or define specific ones */
/* Example: Ensure WeeklyPlayer component fits well */
:deep(.weekly-player) { /* Use :deep to target child component styles if needed */
  margin: 0; /* Remove default margin if WeeklyPlayer has it */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(76, 175, 80, 0.2); /* Green border */
}

@keyframes fadeInView {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
