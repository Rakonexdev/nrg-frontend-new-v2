<template>
  <div class="space-y-8">
    <!-- Header & Filters -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
      <div class="space-y-1">
        <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Collections Report</h1>
        <p class="text-slate-500 dark:text-slate-400 font-medium">Track and analyze your collection history</p>
      </div>
      
      <div class="flex flex-wrap items-end gap-4">
        <DateInput 
          label="From Date"
          v-model="filters.from_date"
        />
        <DateInput 
          label="To Date"
          v-model="filters.to_date"
        />
        <button @click="fetchCollections" 
                class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          Filter
        </button>
        <button @click="resetFilters" 
                class="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm transition-all active:scale-95">
          Reset
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden relative group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Collected</p>
            <h3 class="text-2xl font-black text-slate-800 dark:text-white mt-0.5">QAR {{ summary.total_collected?.toLocaleString() }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <DataTable :columns="columns" :data="collections" :loading="loading" :pagination="pagination" @page-change="handlePageChange">
      <template #staff_info="{ row }">
        <div class="flex flex-col">
            <span class="font-bold text-slate-800 dark:text-slate-200">{{ row.contract?.staff?.name || 'N/A' }}</span>
            <span class="text-[10px] font-black text-blue-600 uppercase tracking-widest">{{ row.contract?.staff?.company?.name || 'Individual' }}</span>
        </div>
      </template>
      <template #amount="{ value }">
        <span class="font-black text-blue-600 dark:text-blue-400">QAR {{ parseFloat(value || 0).toLocaleString() }}</span>
      </template>
      <template #payment_method="{ value }">
        <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
          {{ value?.replace('_', ' ') }}
        </span>
      </template>
      <template #payment_date="{ value }">
        <span class="font-medium text-slate-600 dark:text-slate-400">{{ formatDate(value) }}</span>
      </template>
      <template #creator="{ value }">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
            {{ value?.name?.substring(0, 1) }}
          </div>
          <span class="text-xs font-bold text-slate-600 dark:text-slate-400">{{ value?.name || 'System' }}</span>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue';
import { reportService } from '@/services/api';
import DataTable from '@/components/shared/DataTable.vue';
import DateInput from '@/components/shared/DateInput.vue';
import debounce from 'lodash/debounce';

const loading = ref(false);
const collections = ref([]);
const pagination = ref({});
const summary = ref({ total_collected: 0 });
const filters = reactive({
  from_date: '',
  to_date: '',
  search: '',
  page: 1
});

const columns = [
  { key: 'payment_date', label: 'Date', sortable: true },
  { key: 'staff_info', label: 'Staff / Company' },
  { key: 'amount', label: 'Amount' },
  { key: 'payment_method', label: 'Method' },
  { key: 'creator', label: 'Collector' },
  { key: 'notes', label: 'Notes' }
];

const fetchCollections = async () => {
  loading.value = true;
  try {
    const response = await reportService.getCollections(filters);
    collections.value = response.data.data;
    pagination.value = response.data;
    summary.value = response.data.summary;
  } catch (error) {
    console.error('Error fetching collections report:', error);
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = debounce(() => {
    filters.page = 1;
    fetchCollections();
}, 500);

watch(() => filters.search, debouncedFetch);

const handlePageChange = (page) => {
  filters.page = page;
  fetchCollections();
};

const resetFilters = () => {
  filters.from_date = '';
  filters.to_date = '';
  filters.search = '';
  filters.page = 1;
  fetchCollections();
};

const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' }).toLowerCase();
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

onMounted(() => {
  fetchCollections();
});
</script>

