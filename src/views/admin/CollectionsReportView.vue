<template>
  <div class="space-y-8 pb-10">
    <!-- Header + Filters -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-8">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Collections Report</h1>
          <p class="text-slate-500 dark:text-slate-400 mt-1">Track and analyze your collection history</p>
        </div>
        <div class="flex flex-wrap items-end gap-4">
          <div class="space-y-1">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">From Date</label>
            <input v-model="filters.from_date" type="date" class="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#29166e]/20 focus:border-[#29166e] outline-none transition-all" />
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">To Date</label>
            <input v-model="filters.to_date" type="date" class="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#29166e]/20 focus:border-[#29166e] outline-none transition-all" />
          </div>
          <button @click="fetchReport(1)" class="flex items-center gap-2 px-6 py-2.5 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#29166e]/30 hover:shadow-xl transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            Filter
          </button>
          <button @click="resetFilters" class="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Reset</button>
          <button @click="handleDownload" :disabled="downloading"
                  class="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50">
            <svg v-if="!downloading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ downloading ? 'Exporting...' : 'Excel' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Card -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-[#29166e]/10 flex items-center justify-center">
          <svg class="w-7 h-7 text-[#29166e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </div>
        <div>
          <p class="text-[10px] font-black text-[#29166e] uppercase tracking-widest">Total Collected</p>
          <p class="text-2xl font-black text-slate-900 dark:text-white">QAR {{ formatCurrency(summary.total_collected) }}</p>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="w-10 h-10 border-4 border-slate-200 border-t-[#29166e] rounded-full animate-spin"></div>
      </div>

      <div v-else>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/30">
                <th class="px-6 py-4 font-black cursor-pointer hover:text-[#29166e] transition-colors" @click="toggleSort">
                  Date
                  <span v-if="sortDir === 'desc'" class="ml-1">↓</span>
                  <span v-else class="ml-1">↑</span>
                </th>
                <th class="px-6 py-4 font-black">Staff / Company</th>
                <th class="px-6 py-4 font-black">Amount</th>
                <th class="px-6 py-4 font-black">Method</th>
                <th class="px-6 py-4 font-black">Collector</th>
                <th class="px-6 py-4 font-black">Notes</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
              <tr v-for="item in collections" :key="item.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td class="px-6 py-4">
                  <span class="text-sm font-bold text-slate-800 dark:text-white">{{ formatDate(item.payment_date) }}</span>
                </td>
                <td class="px-6 py-4">
                  <div>
                    <p class="text-sm font-bold text-slate-800 dark:text-white">{{ item.contract?.staff?.name || '—' }}</p>
                    <p class="text-[11px] text-slate-400">{{ item.contract?.staff?.company?.name || '' }}</p>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-xs font-medium text-slate-400 uppercase mr-1">QAR</span>
                  <span class="text-sm font-black text-slate-900 dark:text-white">{{ formatCurrency(item.amount) }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 capitalize">{{ item.payment_method || '—' }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-[#29166e]/10 flex items-center justify-center text-[10px] font-bold text-[#29166e]">
                      {{ (item.creator?.name || 'U').charAt(0) }}
                    </div>
                    <span class="text-sm font-medium text-slate-600 dark:text-slate-400">{{ item.creator?.name || '—' }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[200px] block">{{ item.notes || '—' }}</span>
                </td>
              </tr>
              <tr v-if="collections.length === 0">
                <td colspan="6" class="px-6 py-16 text-center text-slate-400 italic text-sm">No records match your criteria.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.last_page > 1" class="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-900/20">
          <p class="text-xs font-bold text-slate-400">
            Showing {{ pagination.from || 0 }} to {{ pagination.to || 0 }} of {{ pagination.total || 0 }} results
          </p>
          <div class="flex items-center gap-2">
            <button @click="fetchReport(pagination.current_page - 1)" :disabled="pagination.current_page <= 1"
                    class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              ← Prev
            </button>
            <template v-for="page in visiblePages" :key="page">
              <button v-if="page !== '...'" @click="fetchReport(page)"
                      class="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                      :class="page === pagination.current_page ? 'bg-[#29166e] text-white shadow-lg shadow-[#29166e]/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'">
                {{ page }}
              </button>
              <span v-else class="text-slate-400 text-xs px-1">...</span>
            </template>
            <button @click="fetchReport(pagination.current_page + 1)" :disabled="pagination.current_page >= pagination.last_page"
                    class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { reportService } from '@/services/api';
import { useNotificationStore } from '@/stores/notification';

const notificationStore = useNotificationStore();
const loading = ref(false);
const downloading = ref(false);
const collections = ref([]);
const summary = ref({ total_collected: 0 });
const sortDir = ref('desc');

const filters = ref({
  from_date: '',
  to_date: '',
});

const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0,
  from: 0,
  to: 0,
  per_page: 15,
});

const visiblePages = computed(() => {
  const current = pagination.value.current_page;
  const last = pagination.value.last_page;
  const pages = [];

  if (last <= 7) {
    for (let i = 1; i <= last; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(last - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < last - 2) pages.push('...');
    pages.push(last);
  }
  return pages;
});

const formatCurrency = (val) => {
  return parseFloat(val || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const toggleSort = () => {
  sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc';
  fetchReport(1);
};

const resetFilters = () => {
  filters.value = { from_date: '', to_date: '' };
  fetchReport(1);
};

const fetchReport = async (page = 1) => {
  if (page < 1 || page > pagination.value.last_page) return;
  loading.value = true;
  try {
    const params = {
      page,
      per_page: 15,
      ...filters.value,
    };
    const res = await reportService.getCollections(params);
    collections.value = res.data.data;
    summary.value = res.data.summary;
    pagination.value = {
      current_page: res.data.current_page,
      last_page: res.data.last_page,
      total: res.data.total,
      from: res.data.from,
      to: res.data.to,
      per_page: res.data.per_page,
    };
  } catch (err) {
    console.error('Failed to load collections report', err);
  } finally {
    loading.value = false;
  }
};

const handleDownload = async () => {
  downloading.value = true;
  try {
    const response = await reportService.exportCollections(filters.value);

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Collections_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    notificationStore.success('Excel report downloaded successfully');
  } catch (error) {
    console.error('Download failed:', error);
    notificationStore.error('Failed to download Excel report');
  } finally {
    downloading.value = false;
  }
};

onMounted(() => fetchReport(1));
</script>
