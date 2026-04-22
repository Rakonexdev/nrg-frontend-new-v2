<template>
  <Modal :show="show" :title="title" maxWidth="md" @close="$emit('cancel')">
    <div class="flex flex-col items-center text-center">
      <!-- Icon -->
      <div :class="[
        'w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-pulse transition-colors duration-500',
        variant === 'danger' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30' : 
        variant === 'success' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' :
        'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
      ]">
        <slot name="icon">
          <svg v-if="variant === 'danger'" class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
          <svg v-else-if="variant === 'success'" class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
          <svg v-else class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </slot>
      </div>
      
      <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">{{ message }}</h3>
      <p v-if="description" class="text-slate-500 dark:text-slate-400 text-sm px-4">{{ description }}</p>
      <p v-else-if="variant === 'danger'" class="text-slate-500 dark:text-slate-400 text-sm">This action cannot be undone. All associated data will be permanently removed.</p>
    </div>

    <template #footer>
      <div class="flex items-center gap-3 w-full">
        <button @click="$emit('cancel')" class="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-transparent active:scale-95">
          {{ cancelText }}
        </button>
        <button @click="$emit('confirm')" :disabled="loading" :class="[
          'flex-1 px-6 py-3 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50',
          variant === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/30' : 
          variant === 'success' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30' :
          'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
        ]">
          <span v-if="loading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ loadingText || (variant === 'danger' ? 'Deleting...' : 'Processing...') }}
          </span>
          <span v-else>{{ confirmText }}</span>
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import Modal from './Modal.vue';

const props = defineProps({
  show: Boolean,
  title: {
    type: String,
    default: 'Confirm Deletion'
  },
  message: {
    type: String,
    default: 'Are you sure you want to delete this item?'
  },
  description: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: 'Yes, Delete'
  },
  cancelText: {
    type: String,
    default: 'No, Cancel'
  },
  loading: Boolean,
  loadingText: String,
  variant: {
    type: String,
    default: 'danger',
    validator: (value) => ['danger', 'success', 'info'].includes(value)
  }
});

defineEmits(['confirm', 'cancel']);
</script>
