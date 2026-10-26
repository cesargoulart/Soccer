<script setup lang="ts">
import CountUp from './CountUp.vue'
defineProps<{ label: string; value: number; suffix?: string }>()
</script>

<template>
  <div class="money rise">
    <label>{{ label }}</label>
    <div>
      <b><CountUp :value="value" :decimals="2" /></b>
      <span>{{ suffix ?? '€' }}</span>
    </div>
  </div>
</template>

<style scoped>
.money label {
  display: block;
  font-size: 12px;
  color: var(--mute);
  margin-bottom: 6px;
}
.money div {
  display: flex;
  background: oklch(0.48 0.06 150 / 0.55);
  border-radius: 4px;
  overflow: hidden;
}
.money b {
  flex: 1;
  padding: 10px 14px;
  font-size: 18px;
  font-weight: 600;
}
.money span {
  padding: 10px 14px;
  background: oklch(0.38 0.05 155 / 0.8);
  font-weight: 600;
}
</style>
