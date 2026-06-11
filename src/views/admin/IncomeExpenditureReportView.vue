<template>
  <div class="space-y-8 pb-10">
    <!-- Header + Filters -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
      <div class="space-y-1">
        <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Income & Expenditure</h1>
        <p class="text-slate-500 dark:text-slate-400 font-medium">Compare your income against expenses</p>
      </div>
      <div class="flex flex-wrap items-end gap-4">
        <DateInput label="From Date" v-model="filters.from_date" />
        <DateInput label="To Date" v-model="filters.to_date" />
        <button @click="filters.page = 1; fetchReport()"
                class="flex items-center gap-2 px-6 py-2.5 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#29166e]/30 hover:shadow-xl transition-all active:scale-95">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          Generate
        </button>
        <button @click="resetFilters"
                class="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm transition-all active:scale-95">
          Reset
        </button>
        <button @click="handleDownload" :disabled="downloading"
                class="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50">
          <svg v-if="!downloading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          {{ downloading ? 'Exporting...' : 'Excel' }}
        </button>
        <div class="flex items-center gap-2">
          <select v-model="filters.per_page" @change="handlePageChange(1)"
                  class="px-4 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all cursor-pointer">
            <option :value="10">10 / pg</option>
            <option :value="25">25 / pg</option>
            <option :value="50">50 / pg</option>
            <option :value="100">100 / pg</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-if="authStore.hasPermission('income_card_total_income')" class="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
        <p class="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2">Total Income</p>
        <p class="text-2xl font-black text-emerald-600 dark:text-emerald-400">QAR {{ formatCurrency(summary.total_income) }}</p>
      </div>
      <div v-if="authStore.hasPermission('income_card_total_expenditure')" class="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
        <p class="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-2">Total Expenditure</p>
        <p class="text-2xl font-black text-rose-600 dark:text-rose-400">QAR {{ formatCurrency(summary.total_expenditure) }}</p>
      </div>
      <div v-if="authStore.hasPermission('income_card_net_balance')" class="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-slate-500/10 rounded-full blur-2xl group-hover:bg-slate-500/20 transition-all"></div>
        <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Net Balance</p>
        <p class="text-2xl font-black text-slate-900 dark:text-white">QAR {{ formatCurrency(summary.net_balance) }}</p>
      </div>
    </div>

    <!-- Search & Column Filters -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Search -->
      <div class="relative flex-1 min-w-[240px] max-w-md">
        <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        <input v-model="filters.search" type="text" placeholder="Search by name, QID..."
               class="w-full pl-11 pr-4 py-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-[#29166e]/20 focus:border-[#29166e] outline-none transition-all" />
      </div>

      <!-- Type Filter -->
      <div class="space-y-0.5">
        <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Type</label>
        <select v-model="filters.type"
                class="px-4 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#29166e]/20 focus:border-[#29166e] outline-none transition-all cursor-pointer appearance-none pr-8 bg-no-repeat bg-[right_0.5rem_center] bg-[length:16px]"
                style="background-image: url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2394a3b8%22 stroke-width=%222%22%3E%3Cpath d=%22M6 9l6 6 6-6%22/%3E%3C/svg%3E')">
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expenditure">Expenditure</option>
        </select>
      </div>

      <!-- Method Filter -->
      <div class="space-y-0.5">
        <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Method</label>
        <select v-model="filters.method"
                class="px-4 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#29166e]/20 focus:border-[#29166e] outline-none transition-all cursor-pointer appearance-none pr-8 bg-no-repeat bg-[right_0.5rem_center] bg-[length:16px]"
                style="background-image: url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2394a3b8%22 stroke-width=%222%22%3E%3Cpath d=%22M6 9l6 6 6-6%22/%3E%3C/svg%3E')">
          <option value="">All Methods</option>
          <option value="cash">Cash</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="cheque">Cheque</option>
          <option value="online">Online</option>
          <option value="card">Card</option>
        </select>
      </div>

      <!-- Active Filters indicator -->
      <div v-if="hasActiveFilters" class="flex items-center">
        <button @click="clearColumnFilters"
                class="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <DataTable :columns="columns" :data="records" :loading="loading" :pagination="pagination" @page-change="handlePageChange">
      <template #date="{ value, row }">
        <div class="flex flex-col">
          <span class="font-bold text-slate-800 dark:text-white">{{ formatDate(value) }}</span>
          <span v-if="row.recorded_at || row.created_at" class="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <span>🕐</span>
            <span>{{ formatTime(row.recorded_at || row.created_at) }}</span>
          </span>
        </div>
      </template>
      <template #type="{ value }">
        <span class="px-3 py-1 rounded-lg text-[11px] font-bold capitalize"
              :class="value === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'">
          {{ value }}
        </span>
      </template>
      <template #staff_info="{ row }">
        <div class="flex flex-col">
          <span class="font-bold text-slate-800 dark:text-slate-200">{{ row.staff_name || '—' }}</span>
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] font-black text-[#29166e] uppercase tracking-widest">{{ row.company_name || '' }}</span>
            <span v-if="row.staff_qid" class="text-[9px] font-bold text-slate-400">/ {{ row.staff_qid }}</span>
          </div>
        </div>
      </template>
      <template #amount="{ row }">
        <div>
          <span class="text-xs font-medium text-slate-400 uppercase mr-1">QAR</span>
          <span class="text-sm font-black" :class="row.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
            {{ formatCurrency(row.amount) }}
          </span>
        </div>
      </template>
      <template #payment_method="{ value }">
        <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
          {{ (value || '—').replace('_', ' ') }}
        </span>
      </template>
      <template #notes="{ value }">
        <span class="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[250px] block">{{ value || '—' }}</span>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { reportService } from '@/services/api';
import { useNotificationStore } from '@/stores/notification';
import { useAuthStore } from '@/stores/auth';
import DataTable from '@/components/shared/DataTable.vue';
import DateInput from '@/components/shared/DateInput.vue';
import debounce from 'lodash/debounce';

const loading = ref(false);
const downloading = ref(false);
const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const records = ref([]);
const pagination = ref({});
const summary = ref({ total_income: 0, total_expenditure: 0, net_balance: 0 });

const filters = reactive({
  from_date: '',
  to_date: '',
  search: '',
  type: '',
  method: '',
  page: 1,
  per_page: 10
});

const columns = [
  { key: 'date', label: 'Date', sortable: true },
  { key: 'type', label: 'Type' },
  { key: 'staff_info', label: 'Staff / Company' },
  { key: 'amount', label: 'Amount' },
  { key: 'payment_method', label: 'Method' },
  { key: 'notes', label: 'Description / Notes' }
];

const hasActiveFilters = computed(() => filters.search || filters.type || filters.method);

const formatCurrency = (val) => parseFloat(val || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const fetchReport = async () => {
  loading.value = true;
  try {
    const res = await reportService.getIncomeExpenditure(filters);
    records.value = res.data.data || [];
    pagination.value = res.data;
    summary.value = res.data.summary;
  } catch (err) {
    console.error('Failed to load income/expenditure report', err);
  } finally {
    loading.value = false;
  }
};

const handleDownload = async () => {
  downloading.value = true;
  try {
    const response = await reportService.exportIncomeExpenditure(filters);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Income_Expenditure_Report_${new Date().toISOString().split('T')[0]}.csv`);
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

const debouncedFetch = debounce(() => {
  filters.page = 1;
  fetchReport();
}, 500);

// Watch search input for debounced fetch
watch(() => filters.search, debouncedFetch);

// Watch column filters for immediate fetch
watch(() => filters.type, () => { filters.page = 1; fetchReport(); });
watch(() => filters.method, () => { filters.page = 1; fetchReport(); });

const handlePageChange = (page) => {
  filters.page = page;
  fetchReport();
};

const clearColumnFilters = () => {
  filters.search = '';
  filters.type = '';
  filters.method = '';
  filters.page = 1;
  fetchReport();
};

const resetFilters = () => {
  filters.from_date = '';
  filters.to_date = '';
  filters.search = '';
  filters.type = '';
  filters.method = '';
  filters.page = 1;
  fetchReport();
};

onMounted(() => {
  authStore.refreshUser();
  fetchReport();
});
</script>
