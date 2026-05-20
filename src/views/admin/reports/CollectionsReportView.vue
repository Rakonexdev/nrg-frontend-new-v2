<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Collections Report</h1>
        <p class="text-slate-500 dark:text-slate-400 font-medium">Track and analyze your collection history</p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="exportCSV" :disabled="exporting"
                class="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
          {{ exporting ? 'Exporting...' : 'Export CSV' }}
        </button>
        <button @click="fetchCollections" class="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
          <svg class="w-4 h-4" :class="{'animate-spin': loading}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
          Refresh Data
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
      <div class="flex flex-wrap items-end gap-4">
        <!-- Search input -->
        <div class="relative flex-1 min-w-[240px]">
          <label class="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1.5">Search</label>
          <div class="relative">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <input v-model="filters.search" type="text" placeholder="Search staff, company name..."
                   class="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-[#29166e]/20 focus:border-[#29166e] outline-none transition-all" />
          </div>
        </div>

        <!-- From Date -->
        <DateInput 
          label="From Date"
          v-model="filters.from_date"
          class="min-w-[140px]"
        />

        <!-- To Date -->
        <DateInput 
          label="To Date"
          v-model="filters.to_date"
          class="min-w-[140px]"
        />

        <!-- Per Page selector -->
        <div class="flex flex-col">
          <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1.5">Show</label>
          <select v-model="filters.per_page" @change="handlePageChange(1)"
                  class="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#29166e]/20 focus:border-[#29166e] outline-none transition-all cursor-pointer appearance-none pr-8 bg-no-repeat bg-[right_0.5rem_center] bg-[length:16px]"
                  style="background-image: url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2394a3b8%22 stroke-width=%222%22%3E%3Cpath d=%22M6 9l6 6 6-6%22/%3E%3C/svg%3E')">
            <option :value="10">10 / pg</option>
            <option :value="25">25 / pg</option>
            <option :value="50">50 / pg</option>
            <option :value="100">100 / pg</option>
          </select>
        </div>

        <!-- Filter / Reset actions -->
        <div class="flex items-center gap-2">
          <button @click="filters.page = 1; fetchCollections()" 
                  class="px-6 py-2.5 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#29166e]/30 transition-all active:scale-95 flex items-center gap-2">
            Filter
          </button>
          <button @click="resetFilters" 
                  class="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm transition-all active:scale-95">
            Reset
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden relative group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-[#29166e]/10 rounded-full blur-2xl group-hover:bg-[#29166e]/20 transition-all"></div>
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 rounded-2xl bg-[#29166e]/10 flex items-center justify-center text-[#29166e]">
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
            <span class="text-[10px] font-black text-[#29166e] uppercase tracking-widest">{{ row.contract?.staff?.company?.name || 'Individual' }}</span>
        </div>
      </template>
      <template #amount="{ value }">
        <span class="font-black text-[#29166e] dark:text-[#29166e]/80">QAR {{ parseFloat(value || 0).toLocaleString() }}</span>
      </template>
      <template #personal_due="{ row }">
        <span class="font-bold text-amber-600 dark:text-amber-500/80">
          QAR {{ parseFloat(row.contract?.adjustment_pending || 0).toLocaleString() }}
        </span>
      </template>
      <template #payment_method="{ value }">
        <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
          {{ value?.replace('_', ' ') }}
        </span>
      </template>
      <template #payment_date="{ row }">
        <div class="flex flex-col gap-0.5">
          <span class="font-bold text-slate-800 dark:text-slate-200">{{ formatDate(row.payment_date) }}</span>
          <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <span>🕐</span>
            <span>{{ formatTime(row.recorded_at || row.created_at) }}</span>
          </span>
        </div>
      </template>
      <template #creator="{ value }">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
            {{ value?.name?.substring(0, 1) || 'S' }}
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">{{ value?.name || 'System' }}</span>
            <span class="text-[9px] font-black uppercase tracking-widest" :class="value?.role === 'super_admin' ? 'text-rose-500' : 'text-blue-500'">
              {{ value?.role ? (value.role === 'super_admin' ? 'Super Admin' : (value.role === 'admin' ? 'Admin' : value.role)) : 'System' }}
            </span>
          </div>
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
const exporting = ref(false);
const collections = ref([]);
const pagination = ref({});
const summary = ref({ total_collected: 0 });
const filters = reactive({
  from_date: '',
  to_date: '',
  search: '',
  page: 1,
  per_page: 10
});

const columns = [
  { key: 'payment_date', label: 'Date', sortable: true },
  { key: 'staff_info', label: 'Staff / Company' },
  { key: 'amount', label: 'Amount' },
  { key: 'personal_due', label: 'Personal Due' },
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

const exportCSV = async () => {
  exporting.value = true;
  try {
    const response = await reportService.exportCollections(filters);
    const blob = new Blob([response.data], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `Collections_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error exporting collections:', error);
  } finally {
    exporting.value = false;
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
  filters.per_page = 10;
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

const formatTime = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

onMounted(() => {
  fetchCollections();
});
</script>
