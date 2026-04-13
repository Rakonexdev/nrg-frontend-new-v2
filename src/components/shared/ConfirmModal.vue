<template>
  <Modal :show="show" :title="title" maxWidth="md" @close="$emit('cancel')">
    <div class="flex flex-col items-center text-center">
      <!-- Icon -->
      <div class="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-6 animate-pulse">
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      </div>
      
      <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ message }}</h3>
      <p class="text-slate-500 dark:text-slate-400">This action cannot be undone. All associated data will be permanently removed.</p>
    </div>

    <template #footer>
      <div class="flex items-center gap-3 w-full">
        <button @click="$emit('cancel')" class="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
          No, Cancel
        </button>
        <button @click="$emit('confirm')" :disabled="loading" class="flex-1 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold shadow-lg shadow-rose-500/30 transition-all active:scale-95 disabled:opacity-50">
          <span v-if="loading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Deleting...
          </span>
          <span v-else>Yes, Delete</span>
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
  loading: Boolean
});

defineEmits(['confirm', 'cancel']);
</script>
