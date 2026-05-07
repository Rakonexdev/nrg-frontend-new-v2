<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="fixed inset-0 z-[100] flex justify-center items-start p-4 md:p-10 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
        <div :class="['bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full my-auto md:my-0 overflow-hidden transform transition-all scale-100 border border-white/20', maxWidthClass]">
          <!-- Header -->
          <div class="px-8 py-6 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
            <h3 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{{ title }}</h3>
            <button @click="$emit('close')" class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all hover:rotate-90">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            </button>
          </div>
          
          <!-- Content -->
          <div class="px-8 py-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
            <slot></slot>
          </div>
          
          <!-- Footer -->
          <div class="px-8 py-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700/50 flex justify-end gap-4">
            <slot name="footer">
              <button @click="$emit('close')" class="px-6 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all font-bold text-sm">
                Cancel
              </button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: Boolean,
  title: String,
  maxWidth: {
    type: String,
    default: 'lg'
  }
});

defineEmits(['close']);

const maxWidthClass = computed(() => {
  return {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl'
  }[props.maxWidth] || 'max-w-lg';
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
