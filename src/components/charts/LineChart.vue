<script setup lang="ts">
import { computed } from 'vue'

export interface LinePoint { label: string; value: number }

const props = defineProps<{ points: LinePoint[]; format?: (v: number) => string }>()

const W = 900, H = 200, L = 56, R = 10, T = 16, B = 170

const range = computed(() => {
  const vals = props.points.map((p) => p.value)
  const max = Math.max(...vals, 1)
  return { min: 0, max: max * 1.1 }
})
const x = (i: number) => (props.points.length < 2 ? (L + W - R) / 2 : L + (i * (W - L - R)) / (props.points.length - 1))
const y = (v: number) => B - ((v - range.value.min) / (range.value.max - range.value.min)) * (B - T)

const d = computed(() => props.points.map((p, i) => `${i ? 'L' : 'M'}${x(i)} ${y(p.value)}`).join(' '))
const area = computed(() =>
  props.points.length ? `${d.value} L${x(props.points.length - 1)} ${B} L${x(0)} ${B} Z` : '',
)
const ticks = computed(() => [0, 1, 2, 3, 4].map((k) => range.value.min + ((range.value.max - range.value.min) * k) / 4))
const fmt = (v: number) => (props.format ? props.format(v) : Math.round(v).toLocaleString('pt-PT'))
</script>

<template>
  <svg class="line" :viewBox="`0 0 ${W} ${H + 24}`" width="100%" role="img">
    <defs>
      <linearGradient id="lc-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="oklch(0.72 0.17 150)" stop-opacity=".45" />
        <stop offset="1" stop-color="oklch(0.72 0.17 150)" stop-opacity="0" />
      </linearGradient>
    </defs>
    <g class="grid">
      <template v-for="t in ticks" :key="t">
        <line :x1="L" :x2="W - R" :y1="y(t)" :y2="y(t)" />
        <text :x="L - 8" :y="y(t) + 3" text-anchor="end">{{ fmt(t) }}</text>
      </template>
    </g>
    <path class="ar" :d="area" fill="url(#lc-grad)" />
    <path class="ln" :d="d" pathLength="1" fill="none" stroke="var(--ok)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" />
    <g v-for="(p, i) in points" :key="i" :style="{ '--i': i }">
      <circle class="pt" :cx="x(i)" :cy="y(p.value)" r="4.5" fill="var(--ink)" stroke="var(--ok)" stroke-width="2.5" />
      <text :x="x(i)" :y="B + 20" text-anchor="middle">{{ p.label }}</text>
    </g>
  </svg>
</template>

<style scoped>
text { fill: var(--mute); font-family: var(--font-ui); font-size: 11px; }
.grid line { stroke: var(--line); }
.ln { stroke-dasharray: 1; stroke-dashoffset: 1; animation: draw 1.4s ease forwards 0.2s; }
.ar { opacity: 0; animation: fade 1s ease forwards 0.8s; }
.pt { opacity: 0; animation: fade 0.3s ease forwards; animation-delay: calc(0.4s + var(--i, 0) * 110ms); }
@keyframes draw { to { stroke-dashoffset: 0; } }
@keyframes fade { to { opacity: 1; } }
</style>
