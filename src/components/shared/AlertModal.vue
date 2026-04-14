<template>
  <Modal :show="show" :title="title" maxWidth="md" @close="$emit('close')">
    <div class="flex flex-col items-center text-center">
      <!-- Icon -->
      <div :class="[
        'w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-pulse',
        type === 'error' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
      ]">
        <svg v-if="type === 'error'" class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
        <svg v-else class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      </div>
      
      <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">{{ message }}</h3>
      <p class="text-slate-500 dark:text-slate-400 text-sm">Please review the details and try again.</p>
    </div>

    <template #footer>
      <div class="flex items-center gap-3 w-full">
        <button @click="$emit('close')" :class="[
          'flex-1 px-6 py-3 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-lg',
          type === 'error' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
        ]">
          OK, Got It
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import Modal from './Modal.vue';

const props = defineProps({
  show: Boolean,
  type: {
    type: String,
    default: 'info'
  },
  title: {
    type: String,
    default: 'Alert'
  },
  message: String
});

defineEmits(['close']);
</script>
