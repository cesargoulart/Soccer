<script setup lang="ts">
import { computed } from 'vue'
import { positionGroup } from '@/services/teamRatings'

const props = defineProps<{ position: string }>()

const group = computed(() => positionGroup(props.position))
const label = computed(() => ({ GK: 'GR', DEF: 'DF', MID: 'MC', ATT: 'AV' })[group.value])
</script>

<template>
  <span class="pos-tag" :class="group">{{ label }}</span>
</template>

<style scoped>
.pos-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 0;
  border-radius: 2px;
  color: #fff;
  display: inline-block;
  width: 34px;
  text-align: center;
}
.GK { background: var(--gk); }
.DEF { background: var(--df); }
.MID { background: var(--mf); }
.ATT { background: var(--fw); }
</style>
