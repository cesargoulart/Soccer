<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed } from 'vue'

// Converte um valor 0-99 em 0-5 estrelas.
const props = defineProps<{ value: number }>()
const filled = computed(() => Math.max(0, Math.min(5, Math.round(((props.value - 40) / 55) * 5))))
</script>

<template>
  <span class="stars" :aria-label="`${filled} de 5 estrelas`">
    <template v-for="n in 5" :key="n"><s v-if="n > filled">★</s><template v-else>★</template></template>
  </span>
</template>

<style scoped>
.stars { color: var(--ink); letter-spacing: 1px; }
.stars s { color: oklch(0.4 0.03 160); text-decoration: none; }
</style>
