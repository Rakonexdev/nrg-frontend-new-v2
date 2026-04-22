<template>
  <div class="min-h-screen bg-slate-50">
    <router-view />
    <Toast />
  </div>
</template>

<script setup>
import Toast from '@/components/shared/Toast.vue';
</script>