<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type { PositionGroup } from '@/services/teamRatings'

export interface PitchChip { label: string; group: PositionGroup; x: number; y: number }

// Os 11 chips são sempre os mesmos elementos (chave = índice): ao mudar de formação
// só mudam left/top e a etiqueta, e o CSS transition anima o movimento.
defineProps<{ chips: PitchChip[] }>()
</script>

<template>
  <div class="pitch">
    <div class="l" style="inset: 50% 0 auto 0; height: 0"></div>
    <div class="l" style="left: 36%; right: 36%; top: 50%; aspect-ratio: 1; transform: translateY(-50%); border-radius: 50%; height: auto"></div>
    <div class="l" style="left: 20%; right: 20%; top: 0; height: 16%; border-top: 0"></div>
    <div class="l" style="left: 34%; right: 34%; top: 0; height: 6%; border-top: 0"></div>
    <div class="l" style="left: 20%; right: 20%; bottom: 0; height: 16%; border-bottom: 0"></div>
    <div class="l" style="left: 34%; right: 34%; bottom: 0; height: 6%; border-bottom: 0"></div>
    <span
      v-for="(c, i) in chips"
      :key="i"
      class="chip"
      :class="c.group"
      :style="{ left: c.x + '%', top: c.y + '%' }"
    >{{ c.label }}</span>
  </div>
</template>

<style scoped>
.pitch {
  aspect-ratio: 64 / 100;
  border-radius: 4px;
  position: relative;
  border: 2px solid oklch(0.95 0.02 140 / 0.85);
  overflow: hidden;
  background: repeating-linear-gradient(0deg, oklch(0.55 0.13 145) 0 8.33%, oklch(0.51 0.13 145) 8.33% 16.66%);
}
.l { position: absolute; border: 2px solid oklch(0.95 0.02 140 / 0.85); }
.chip {
  position: absolute;
  transform: translate(-50%, -50%);
  font-size: 11px;
  font-weight: 700;
  padding: 3px 7px;
  border-radius: 2px;
  color: #fff;
  z-index: 1;
  transition:
    left 0.6s cubic-bezier(0.5, 0, 0.2, 1),
    top 0.6s cubic-bezier(0.5, 0, 0.2, 1);
  box-shadow: 0 3px 8px oklch(0.1 0.03 170 / 0.4);
}
.GK { background: var(--gk); }
.DEF { background: var(--df); }
.MID { background: var(--mf); }
.ATT { background: var(--fw); }
</style>
