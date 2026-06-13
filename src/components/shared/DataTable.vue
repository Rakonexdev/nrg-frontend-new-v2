<template>
  <div class="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
    <div class="w-full">
      <table class="w-full text-left border-collapse">
        <thead class="sticky z-20 shadow-sm transition-all duration-300" :style="{ top: stickyTop }">
          <tr class="bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
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
        <tbody v-if="data?.length > 0 && !loading">
          <template v-for="(row, index) in data" :key="row.id || index">
            <tr :class="[
              'border-b border-slate-100 dark:border-slate-700/50 transition-colors',
              rowClass && rowClass(row) ? rowClass(row) : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
            ]">
              <td v-for="col in columns" :key="col.key" class="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                <slot :name="col.key" :value="row[col.key]" :row="row" :toggleExpand="() => toggleExpand(row.id || index)" :isExpanded="expandedRows.includes(row.id || index)">
                  {{ row[col.key] }}
                </slot>
              </td>
            </tr>
            <tr v-if="$slots['expanded-row'] && expandedRows.includes(row.id || index)" class="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-700/50">
              <td :colspan="columns.length" class="p-0">
                <transition name="expand">
                  <div class="px-6 py-4">
                    <slot name="expanded-row" :row="row"></slot>
                  </div>
                </transition>
              </td>
            </tr>
          </template>
        </tbody>
        <tbody v-else>
          <tr v-if="loading">
            <td :colspan="columns.length" class="px-6 py-12 text-center">
              <div class="flex flex-col items-center gap-2">
                <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span class="text-sm font-medium text-slate-500 dark:text-slate-400">Loading records...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="!data || data.length === 0">
            <td :colspan="columns.length" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400 italic font-medium">
              No records match your criteria.
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
        <!-- First Page -->
        <button 
          v-if="pagination.current_page > 3"
          @click="$emit('page-change', 1)"
          class="px-3 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm">
          1
        </button>
        <span v-if="pagination.current_page > 4" class="text-slate-400">...</span>

        <button 
          @click="$emit('page-change', pagination.current_page - 1)"
          :disabled="pagination.current_page === 1"
          class="px-3 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm">
          Previous
        </button>
        
        <button 
          v-for="page in visiblePages" :key="page"
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

        <span v-if="pagination.current_page < pagination.last_page - 3" class="text-slate-400">...</span>
        <button 
          v-if="pagination.current_page < pagination.last_page - 2"
          @click="$emit('page-change', pagination.last_page)"
          class="px-3 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm">
          {{ pagination.last_page }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  columns: { type: Array, required: true },
  data: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  pagination: { type: Object, default: null },
  sortBy: { type: String, default: null },
  sortDir: {
    type: String,
    default: 'desc'
  },
  stickyTop: {
    type: String,
    default: '0px'
  },
  rowClass: {
    type: Function,
    default: null
  }
});

defineEmits(['sort', 'page-change']);

const expandedRows = ref([]);

const toggleExpand = (id) => {
  const index = expandedRows.value.indexOf(id);
  if (index === -1) {
    expandedRows.value.push(id);
  } else {
    expandedRows.value.splice(index, 1);
  }
};

const visiblePages = computed(() => {
  if (!props.pagination) return [];
  const current = props.pagination.current_page;
  const last = props.pagination.last_page;
  const delta = 2;
  const range = [];
  
  for (let i = Math.max(1, current - delta); i <= Math.min(last, current + delta); i++) {
    range.push(i);
  }
  return range;
});
</script>