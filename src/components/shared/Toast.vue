<template>
  <div class="fixed top-6 right-6 z-[200] space-y-3 pointer-events-none">
    <TransitionGroup name="toast">
      <div v-for="n in store.notifications" :key="n.id" 
        class="pointer-events-auto flex items-center gap-4 px-6 py-4 bg-white dark:bg-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-2xl border border-slate-100 dark:border-slate-700/50 min-w-[320px] max-w-md overflow-hidden relative group">
        
        <!-- Progress Bar -->
        <div class="absolute bottom-0 left-0 h-1 bg-current opacity-20 transition-all duration-[3000ms] ease-linear w-0 group-hover:w-full" :class="typeClasses[n.type].progress"></div>

        <!-- Icon -->
        <div class="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" :class="typeClasses[n.type].iconBg">
          <svg v-if="n.type === 'success'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>

        <!-- Text -->
        <div class="flex-1 pr-6">
          <h4 class="text-sm font-black text-slate-800 dark:text-white mb-0.5">{{ n.type === 'success' ? 'Success' : 'Attention' }}</h4>
          <p class="text-xs font-bold text-slate-400 dark:text-slate-500">{{ n.message }}</p>
        </div>

        <!-- Close -->
        <button @click="store.removeNotification(n.id)" class="absolute top-4 right-4 text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useNotificationStore } from '@/stores/notification';

const store = useNotificationStore();

const typeClasses = {
  success: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    progress: 'text-emerald-500'
  },
  error: {
    iconBg: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    progress: 'text-rose-500'
  }
};
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(50px) scale(0.9);
}
</style>
