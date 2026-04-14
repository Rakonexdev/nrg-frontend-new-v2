<template>
  <div class="space-y-8 pb-10">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">System Dashboard</h1>
        <p class="text-slate-500 dark:text-slate-400">Welcome back. Here's what's happening today.</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
          Last Updated: {{ lastSync }}
        </span>
        <button @click="fetchDashboardData" class="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
            <svg class="w-5 h-5 text-slate-600" :class="{'animate-spin': loading}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <router-link to="/admin/staff" class="block group">
        <KpiCard 
          title="Total Staff" 
          :value="stats.total_staff" 
          :icon="icons.users" 
          color-class="bg-blue-600" 
          :trend="12"
          class="cursor-pointer group-hover:scale-[1.02] transition-transform"
        />
      </router-link>
      <router-link to="/admin/companies?status=active" class="block group">
        <KpiCard 
          title="Active Companies" 
          :value="stats.active_companies" 
          :icon="icons.briefcase" 
          color-class="bg-indigo-600" 
          :trend="5"
          class="cursor-pointer group-hover:scale-[1.02] transition-transform"
        />
      </router-link>
      <router-link to="/admin/staff?filter=expiring_qid" class="block group">
        <KpiCard 
          title="Expiring QIDs" 
          :value="stats.expiring_qid" 
          :icon="icons.alert" 
          color-class="bg-amber-500" 
          class="cursor-pointer group-hover:scale-[1.02] transition-transform"
        />
      </router-link>
      <router-link to="/admin/staff?filter=expired_passport" class="block group">
        <KpiCard 
          title="Expired Passports" 
          :value="stats.expired_passport" 
          :icon="icons.document" 
          color-class="bg-rose-500" 
          class="cursor-pointer group-hover:scale-[1.02] transition-transform"
        />
      </router-link>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Chart -->
      <div class="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white">Staff Recruitment Pattern</h3>
          <select class="text-xs font-semibold bg-slate-50 border-none rounded-md px-2 py-1 outline-none">
            <option>Last 6 Months</option>
            <option>Last Year</option>
          </select>
        </div>
        <div class="h-80 w-full relative">
            <Line v-if="chartData.labels.length" :data="chartData" :options="chartOptions" />
            <div v-else class="h-full flex items-center justify-center text-slate-400 italic">No data available for trend</div>
        </div>
      </div>

      <!-- Quick Actions / Alerts -->
      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden relative">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-6">Upcoming Expirations</h3>
          <div class="space-y-4">
              <div v-for="i in 5" :key="i" class="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                  <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                  </div>
                  <div class="min-w-0 flex-1">
                      <p class="text-sm font-bold text-slate-900 dark:text-white truncate">Staff Name Sample</p>
                      <p class="text-xs text-slate-500">QID expires in 12 days</p>
                  </div>
                  <button class="text-xs font-bold text-blue-600 hover:text-blue-700">View</button>
              </div>
          </div>
          <button class="w-full mt-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors bg-slate-50 dark:bg-slate-700 rounded-lg">View All Alerts</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import KpiCard from '@/components/shared/KpiCard.vue';
import api from '@/services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'vue-chartjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const loading = ref(false);
const lastSync = ref(new Date().toLocaleTimeString());
const stats = ref({
    total_staff: 0,
    active_staff: 0,
    total_companies: 0,
    active_companies: 0,
    expiring_qid: 0,
    expired_passport: 0
});

const chartData = reactive({
    labels: [],
    datasets: [
        {
            label: 'New Staff Joining',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: '#3b82f6',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#fff',
            data: []
        }
    ]
});

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: '#1E293B',
            padding: 12,
            titleFont: { size: 14, weight: 'bold' },
            cornerRadius: 8
        }
    },
    scales: {
        y: { grid: { borderDash: [5, 5], color: '#E2E8F0' }, ticks: { font: { weight: '600' } } },
        x: { grid: { display: false }, ticks: { font: { weight: '600' } } }
    }
};

const icons = {
    users: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
    briefcase: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
    alert: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
    document: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`
};

const fetchDashboardData = async () => {
    loading.value = true;
    try {
        const res = await api.get('/dashboard');
        stats.value = res.data.stats;
        
        // Prepare chart
        chartData.labels = res.data.monthlyTrend.map(t => t.month);
        chartData.datasets[0].data = res.data.monthlyTrend.map(t => t.count);
        
        lastSync.value = new Date().toLocaleTimeString();
    } catch (err) {
        console.error('Failed to load dashboard data', err);
    } finally {
        loading.value = false;
    }
}

onMounted(() => fetchDashboardData());
</script>