<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
    <div class="relative w-24 h-24 flex items-center justify-center">
      <div class="absolute inset-0 bg-[#29166e]/10 dark:bg-[#29166e]/20 rounded-full animate-ping"></div>
      <div class="relative bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl shadow-[#29166e]/10 border border-slate-100 dark:border-slate-700 z-10">
        <svg class="w-12 h-12 text-[#29166e] dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
      </div>
    </div>
    
    <div class="max-w-md space-y-2">
      <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ moduleName }}</h1>
      <div class="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-black uppercase tracking-widest mb-2 border border-amber-200 dark:border-amber-800/50">Coming Soon</div>
      <p class="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">We are currently building out the {{ moduleName }} module. This feature will be available in an upcoming release.</p>
    </div>
    
    <button @click="$router.back()" class="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors mt-8">
      Go Back
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const moduleName = computed(() => {
  return route.meta.title || 'Feature';
});
</script>
