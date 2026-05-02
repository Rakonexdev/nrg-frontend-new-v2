<template>
  <div class="space-y-8 pb-10">
    <!-- Header + Filters -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-8">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Income & Expenditure</h1>
          <p class="text-slate-500 dark:text-slate-400 mt-1">Compare your income against expenses</p>
        </div>
        <div class="flex flex-wrap items-end gap-4">
          <div class="space-y-1">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">From Date</label>
            <input v-model="filters.from_date" type="date" class="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">To Date</label>
            <input v-model="filters.to_date" type="date" class="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
          </div>
          <button @click="fetchReport(1)" class="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            Generate
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Total Income -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-10 -mt-10"></div>
        <p class="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Total Income</p>
        <p class="text-2xl font-black text-emerald-600 dark:text-emerald-400">QAR {{ formatCurrency(summary.total_income) }}</p>
      </div>
      <!-- Total Expenditure -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-10 -mt-10"></div>
        <p class="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Total Expenditure</p>
        <p class="text-2xl font-black text-rose-600 dark:text-rose-400">QAR {{ formatCurrency(summary.total_expenditure) }}</p>
      </div>
      <!-- Net Balance -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-slate-500/5 rounded-full -mr-10 -mt-10"></div>
        <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Net Balance</p>
        <p class="text-2xl font-black text-slate-900 dark:text-white">QAR {{ formatCurrency(summary.net_balance) }}</p>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
      <div v-if="loading" class="flex justify-center py-20">
        <div class="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>

      <div v-else>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/30">
                <th class="px-6 py-4 font-black">Date</th>
                <th class="px-6 py-4 font-black">Type</th>
                <th class="px-6 py-4 font-black">Staff / Company</th>
                <th class="px-6 py-4 font-black">Amount</th>
                <th class="px-6 py-4 font-black">Method</th>
                <th class="px-6 py-4 font-black">Description / Notes</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
              <tr v-for="item in records" :key="item.id + '-' + item.type" class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td class="px-6 py-4">
                  <span class="text-sm font-bold text-slate-800 dark:text-white">{{ formatDate(item.date) }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="px-3 py-1 rounded-lg text-[11px] font-bold capitalize"
                        :class="item.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'">
                    {{ item.type }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div>
                    <p class="text-sm font-bold text-slate-800 dark:text-white">{{ item.staff_name || '—' }}</p>
                    <p class="text-[11px] text-slate-400">{{ item.company_name || '' }}</p>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-xs font-medium text-slate-400 uppercase mr-1">QAR</span>
                  <span class="text-sm font-black" :class="item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
                    {{ formatCurrency(item.amount) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 capitalize">{{ item.payment_method || '—' }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[250px] block">{{ item.notes || '—' }}</span>
                </td>
              </tr>
              <tr v-if="records.length === 0">
                <td colspan="6" class="px-6 py-16 text-center text-slate-400 italic text-sm">No records match your criteria.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.last_page > 1" class="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-900/20">
          <p class="text-xs font-bold text-slate-400">
            Page {{ pagination.current_page }} of {{ pagination.last_page }}
          </p>
          <div class="flex items-center gap-2">
            <button @click="fetchReport(pagination.current_page - 1)" :disabled="pagination.current_page <= 1"
                    class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              ← Prev
            </button>
            <template v-for="page in visiblePages" :key="page">
              <button v-if="page !== '...'" @click="fetchReport(page)"
                      class="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                      :class="page === pagination.current_page ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'">
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

const loading = ref(false);
const records = ref([]);
const summary = ref({ total_income: 0, total_expenditure: 0, net_balance: 0 });

const filters = ref({ from_date: '', to_date: '' });

const pagination = ref({
  current_page: 1,
  last_page: 1,
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
    for (let i = Math.max(2, current - 1); i <= Math.min(last - 1, current + 1); i++) pages.push(i);
    if (current < last - 2) pages.push('...');
    pages.push(last);
  }
  return pages;
});

const formatCurrency = (val) => parseFloat(val || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fetchReport = async (page = 1) => {
  if (page < 1 || (pagination.value.last_page > 0 && page > pagination.value.last_page)) return;
  loading.value = true;
  try {
    const params = { page, per_page: 15, ...filters.value };
    const res = await reportService.getIncomeExpenditure(params);
    records.value = res.data.data?.data || res.data.data || [];
    summary.value = res.data.summary;
    pagination.value = {
      current_page: res.data.data?.current_page || 1,
      last_page: res.data.data?.last_page || 1,
    };
  } catch (err) {
    console.error('Failed to load income/expenditure report', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchReport(1));
</script>
