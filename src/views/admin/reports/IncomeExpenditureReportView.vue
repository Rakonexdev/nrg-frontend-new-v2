<template>
  <div class="space-y-8">
    <!-- Header & Filters -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
      <div class="space-y-1">
        <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Income & Expenditure</h1>
        <p class="text-slate-500 dark:text-slate-400 font-medium">Compare your income against expenses</p>
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
        <button @click="fetchReport" 
                class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          Generate
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Income</p>
        <h3 class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">QAR {{ summary.total_income?.toLocaleString() }}</h3>
      </div>

      <div class="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Expenditure</p>
        <h3 class="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">QAR {{ summary.total_expenditure?.toLocaleString() }}</h3>
      </div>

      <div class="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Net Balance</p>
        <h3 class="text-2xl font-black mt-1" :class="summary.net_balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600'">
          QAR {{ summary.net_balance?.toLocaleString() }}
        </h3>
      </div>
    </div>

    <!-- Daily Comparison Table -->
    <DataTable :columns="columns" :data="dailyData" :loading="loading">
      <template #date="{ value }">
        <span class="font-bold text-slate-800 dark:text-slate-200">{{ formatDate(value) }}</span>
      </template>
      <template #income="{ value }">
        <span class="font-bold text-emerald-600 dark:text-emerald-400">QAR {{ value?.toLocaleString() }}</span>
      </template>
      <template #expenditure="{ value }">
        <span class="font-bold text-rose-600 dark:text-rose-400">QAR {{ value?.toLocaleString() }}</span>
      </template>
      <template #balance="{ value }">
        <span class="font-black" :class="value >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600'">
          QAR {{ value?.toLocaleString() }}
        </span>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { reportService } from '@/services/api';
import DataTable from '@/components/shared/DataTable.vue';
import DateInput from '@/components/shared/DateInput.vue';

const loading = ref(false);
const dailyData = ref([]);
const summary = ref({});

// Native JS for yyyy-mm-dd
const getISODate = (date) => {
  const d = new Date(date);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};

const filters = reactive({
  from_date: getISODate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
  to_date: getISODate(new Date())
});

const columns = [
  { key: 'date', label: 'Date' },
  { key: 'income', label: 'Income' },
  { key: 'expenditure', label: 'Expenditure' },
  { key: 'balance', label: 'Net Balance' }
];

const fetchReport = async () => {
  loading.value = true;
  try {
    const response = await reportService.getIncomeExpenditure(filters);
    dailyData.value = response.data.daily_data;
    summary.value = response.data.summary;
  } catch (error) {
    console.error('Error fetching income expenditure report:', error);
  } finally {
    loading.value = false;
  }
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
  fetchReport();
});
</script>
