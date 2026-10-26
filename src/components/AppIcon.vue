<template>
  <span class="app-icon" v-html="markup" aria-hidden="true"></span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Ícones em SVG escritos à mão, para não depender de nenhuma fonte externa.
// Todos usam currentColor, por isso herdam a cor do texto onde estão.
const paths: Record<string, string> = {
  shield: '<path d="M12 3l7.5 3v5.2c0 4.6-3.1 8.4-7.5 10.3C7.6 19.6 4.5 15.8 4.5 11.2V6z"/>',
  users:
    '<circle cx="9" cy="8" r="3.2"/><path d="M3 20v-1.2A4.8 4.8 0 0 1 7.8 14h2.4A4.8 4.8 0 0 1 15 18.8V20"/><path d="M16.6 5.4a3.2 3.2 0 0 1 0 5.8"/><path d="M17.2 14h.6A3.2 3.2 0 0 1 21 17.2V20"/>',
  ball: '<circle cx="12" cy="12" r="9"/><path d="M12 7.2l3.9 2.8-1.5 4.6H9.6L8.1 10z"/><path d="M12 3v4.2M4.4 9.3l3.7.7M19.6 9.3l-3.7.7M7.6 20.4l2-5.8M16.4 20.4l-2-5.8"/>',
  pitch: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16"/><circle cx="12" cy="12" r="2.6"/>',
  dumbbell: '<path d="M6.5 7v10M3.5 9v6M17.5 7v10M20.5 9v6M6.5 12h11"/>',
  chart: '<path d="M4 4v16h16"/><path d="M7.5 15l3.5-4.2 3 2.4L20 7.5"/>',
  swap: '<path d="M7 5L3.5 8.5 7 12"/><path d="M3.5 8.5H16"/><path d="M17 19l3.5-3.5L17 12"/><path d="M20.5 15.5H8"/>',
  seedling:
    '<path d="M12 21v-7"/><path d="M12 14c0-3.3-2.7-6-6-6 0 3.3 2.7 6 6 6z"/><path d="M12 14c0-3.9 2.7-6.5 6-6.5 0 3.6-2.7 6.5-6 6.5z"/>',
  logout:
    '<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="M10 16l4-4-4-4"/><path d="M14 12H3.5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  'arrow-left': '<path d="M14.5 5.5L8 12l6.5 6.5"/>',
  history:
    '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><path d="M3.5 4v4h4"/><path d="M12 8v4.3l3 1.8"/>',
  calendar:
    '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3.5V6.5M16 3.5V6.5"/>',
  stadium: '<ellipse cx="12" cy="12" rx="9" ry="6"/><ellipse cx="12" cy="12" rx="4.2" ry="2.6"/>',
  card: '<rect x="7.5" y="3.5" width="9" height="16" rx="1.6" fill="currentColor" stroke="none" transform="rotate(14 12 12)"/>',
  sub: '<path d="M4 9h11"/><path d="M11.5 5.5L15 9l-3.5 3.5"/><path d="M20 15H9"/><path d="M12.5 11.5L9 15l3.5 3.5"/>',
  whistle:
    '<circle cx="8.5" cy="14.5" r="4.5"/><path d="M13 12.5h7.5a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1H13"/><path d="M15 9V6.5"/>',
  corner: '<path d="M6 21V4"/><path d="M6 5.2h11l-2.6 3.4L17 12H6"/>',
  target:
    '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
  save: '<path d="M8.5 12.5V6.2a1.6 1.6 0 0 1 3.2 0v5"/><path d="M11.7 11.2V4.8a1.6 1.6 0 0 1 3.2 0v6.4"/><path d="M14.9 11.2V6.6a1.6 1.6 0 0 1 3.2 0V14a6 6 0 0 1-6 6h-.8a5 5 0 0 1-4.4-2.6l-2-3.6a1.6 1.6 0 0 1 2.6-1.9l1.4 1.7"/>',
  alert:
    '<path d="M12 4.2l8.6 15.3H3.4z"/><path d="M12 10v4"/><circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none"/>',
  bag: '<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  ticket: '<path d="M4 8a2 2 0 0 0 0 4v0a2 2 0 0 0 0 4v1.5h16V16a2 2 0 0 0 0-4v0a2 2 0 0 0 0-4V6.5H4z"/><path d="M14 7v10" stroke-dasharray="2 2"/>',
  news: '<rect x="3" y="6" width="18" height="13" rx="2"/><circle cx="12" cy="12.5" r="3.5"/>',
  dot: '<circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/>',
}

const props = withDefaults(defineProps<{ name: string; size?: number | string }>(), {
  size: 20,
})

const markup = computed(() => {
  const body = paths[props.name] ?? paths.dot
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${props.size}" height="${props.size}" ` +
    `fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ` +
    `focusable="false">${body}</svg>`
  )
})
</script>

<style scoped>
.app-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}
</style>
