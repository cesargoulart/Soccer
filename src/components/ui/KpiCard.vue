<script setup lang="ts">
import Card from './Card.vue'
import CountUp from './CountUp.vue'
import AppIcon from '../AppIcon.vue'

withDefaults(
  defineProps<{
    label: string
    value: number | null
    decimals?: number
    icon: string
    suffix?: string
    index?: number
  }>(),
  { decimals: 0, suffix: '', index: 0 },
)
</script>

<template>
  <Card :index="index" class="kpi-card">
    <div class="kpi-text">
      <small>{{ label }}</small>
      <b v-if="value === null">—</b>
      <b v-else><CountUp :value="value" :decimals="decimals" />{{ suffix }}</b>
    </div>
    <span class="kpi-ico"><AppIcon :name="icon" :size="22" /></span>
  </Card>
</template>

<style scoped>
.kpi-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.kpi-text small {
  font-size: 12px;
  font-weight: 500;
  color: var(--mute);
}
.kpi-text b {
  display: block;
  font-size: 22px;
  font-weight: 600;
  margin-top: 2px;
}
.kpi-ico {
  width: 46px;
  height: 46px;
  border-radius: 6px;
  background: var(--card2);
  display: grid;
  place-items: center;
  flex: none;
}
</style>
