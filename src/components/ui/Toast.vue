<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
defineProps<{ message: string }>()
</script>

<template>
  <div class="toast" role="status"><i></i>{{ message }}</div>
</template>

<style scoped>
.toast {
  position: fixed;
  top: 14px;
  right: 18px;
  background: #fff;
  color: oklch(0.3 0.02 160);
  padding: 12px 40px 14px 14px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  box-shadow: 0 10px 30px oklch(0.1 0.03 170 / 0.35);
  transform: translateX(130%);
  animation: toast 4.5s ease forwards;
  overflow: hidden;
  z-index: 300;
}
.toast i { width: 18px; height: 18px; border-radius: 50%; background: var(--ok); }
.toast::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  height: 3px;
  background: var(--ok);
  animation: tbar 4s linear forwards;
}
@keyframes toast {
  8%, 88% { transform: none; }
  100% { transform: translateX(130%); }
}
@keyframes tbar { from { width: 100%; } to { width: 0; } }
</style>
