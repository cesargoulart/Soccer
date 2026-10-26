<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{ value: number; decimals?: number; locale?: string }>(), {
  decimals: 0,
  locale: 'pt-PT',
})

const shown = ref(0)
let raf = 0

function format(n: number) {
  return n.toLocaleString(props.locale, {
    minimumFractionDigits: props.decimals,
    maximumFractionDigits: props.decimals,
  })
}

function run(to: number) {
  cancelAnimationFrame(raf)
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    shown.value = to
    return
  }
  const from = shown.value
  const t0 = performance.now()
  const dur = 1200
  const step = (t: number) => {
    const k = Math.min(1, (t - t0) / dur)
    const e = 1 - Math.pow(1 - k, 3) // easeOutCubic
    shown.value = from + (to - from) * e
    if (k < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
}

onMounted(() => run(props.value))
watch(() => props.value, run)
onUnmounted(() => cancelAnimationFrame(raf))
</script>

<template>
  <span>{{ format(shown) }}</span>
</template>
