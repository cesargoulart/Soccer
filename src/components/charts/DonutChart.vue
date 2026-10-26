<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import CountUp from '../ui/CountUp.vue'

export interface DonutSeg { label: string; value: number; color: string }

const props = defineProps<{ segments: DonutSeg[]; label: string; total: number; unit?: string }>()

const R = 70
const C = 2 * Math.PI * R

const segs = computed(() => {
  const list = props.segments.filter((s) => s.value > 0)
  const sum = list.reduce((a, b) => a + b.value, 0) || 1
  let off = 0
  return list.map((s) => {
    const len = (s.value / sum) * C
    const out = { ...s, len, off: -off }
    off += len
    return out
  })
})

// Começa a 0 e, no frame seguinte, o CSS transition desenha os segmentos.
const ready = ref(false)
onMounted(() => requestAnimationFrame(() => requestAnimationFrame(() => (ready.value = true))))
</script>

<template>
  <div>
    <div class="donut">
      <svg viewBox="0 0 200 200" width="100%" style="transform: rotate(-90deg)" aria-hidden="true">
        <circle cx="100" cy="100" :r="R" fill="none" stroke="oklch(0.2 0.03 165 / .6)" stroke-width="34" />
        <circle
          v-for="(g, i) in segs"
          :key="g.label"
          class="seg"
          cx="100"
          cy="100"
          :r="R"
          fill="none"
          :stroke="g.color"
          stroke-width="34"
          :stroke-dasharray="ready ? `${g.len} ${C}` : `0 ${C}`"
          :stroke-dashoffset="ready ? g.off : 0"
          :style="{ transitionDelay: 300 + i * 150 + 'ms' }"
        />
      </svg>
      <div class="c">
        <small>{{ label }}</small>
        <b><CountUp :value="total" :decimals="2" /> {{ unit ?? '€' }}</b>
      </div>
    </div>
    <div class="dleg">
      <span v-for="g in segments" :key="g.label"><i :style="{ background: g.color }"></i>{{ g.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.donut { position: relative; max-width: 240px; margin: 0 auto; }
.seg {
  transition:
    stroke-dasharray 1.1s cubic-bezier(0.3, 0.8, 0.3, 1),
    stroke-dashoffset 1.1s cubic-bezier(0.3, 0.8, 0.3, 1);
}
.c { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; }
.c small { color: var(--mute); font-size: 13px; }
.c b { font-size: 18px; font-weight: 500; margin-top: 4px; }
.dleg { display: flex; flex-wrap: wrap; gap: 6px 14px; justify-content: center; margin-top: 12px; font-size: 12px; color: var(--mute); }
.dleg i { display: inline-block; width: 9px; height: 9px; border-radius: 2px; margin-right: 5px; }
</style>
