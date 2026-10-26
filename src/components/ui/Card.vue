<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
// Cartão base do design Menus v2. `index` escalona a animação de entrada (70ms por posição).
withDefaults(defineProps<{ title?: string; index?: number }>(), { index: 0 })
</script>

<template>
  <section class="ui-card rise" :style="{ '--i': index }">
    <h3 v-if="title" class="ui-card-title">{{ title }}</h3>
    <slot />
  </section>
</template>

<style>
.ui-card {
  background: var(--card);
  border-radius: 6px;
  padding: 18px;
  backdrop-filter: blur(6px);
  box-shadow: 0 8px 24px oklch(0.1 0.03 170 / 0.25);
  min-width: 0;
}
.ui-card-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 14px;
  color: var(--ink);
}
.rise {
  opacity: 0;
  transform: translateY(14px);
  animation: rise 0.55s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
  animation-delay: calc(var(--i, 0) * 70ms);
}
@keyframes rise {
  to {
    opacity: 1;
    transform: none;
  }
}
.screen-in {
  animation: screen-in 0.35s ease;
}
@keyframes screen-in {
  from {
    opacity: 0;
    filter: blur(4px);
  }
  to {
    opacity: 1;
    filter: none;
  }
}
</style>
