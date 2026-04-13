<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900">
    <router-view />
    <Toast />
  </div>
</template>

<script setup>
import Toast from '@/components/shared/Toast.vue';
</script>