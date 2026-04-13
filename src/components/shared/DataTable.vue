<template>
  <div class="overflow-hidden bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-700">
            <th v-for="col in columns" :key="col.key" 
                @click="col.sortable && $emit('sort', col.key)"
                :class="[col.sortable ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700' : '', 'px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors']">
              <div class="flex items-center gap-2">
                {{ col.label }}
                <svg v-if="col.sortable" class="w-3 h-3 opacity-50" :class="{'text-blue-500 opacity-100': sortBy === col.key}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in data" :key="row.id || index" 
              class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
            <td v-for="col in columns" :key="col.key" class="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
              <slot :name="col.key" :value="row[col.key]" :row="row">
                {{ row[col.key] }}
              </slot>
            </td>
          </tr>
          <tr v-if="data.length === 0">
            <td :colspan="columns.length" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400 italic">
              No records found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination && pagination.total > 0" 
         class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
      <div class="text-sm text-slate-500 dark:text-slate-400">
        Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} entries
      </div>
      <div class="flex items-center gap-2">
        <button 
          @click="$emit('page-change', pagination.current_page - 1)"
          :disabled="pagination.current_page === 1"
          class="px-3 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm">
          Previous
        </button>
        <button 
          v-for="page in totalPages" :key="page"
          @click="$emit('page-change', page)"
          :class="[
            'px-3 py-1 rounded-md text-sm font-medium transition-colors shadow-sm',
            pagination.current_page === page 
              ? 'bg-blue-600 text-white border border-blue-600' 
              : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
          ]">
          {{ page }}
        </button>
        <button 
          @click="$emit('page-change', pagination.current_page + 1)"
          :disabled="pagination.current_page === pagination.last_page"
          class="px-3 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm">
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  columns: { type: Array, required: true },
  data: { type: Array, required: true },
  pagination: { type: Object, default: null },
  sortBy: { type: String, default: null },
  sortDir: { type: String, default: 'asc' }
});

defineEmits(['sort', 'page-change']);

const totalPages = computed(() => {
  if (!props.pagination) return 0;
  return props.pagination.last_page;
});
</script>