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
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <router-link to="/admin/staff" class="block group h-full">
        <KpiCard 
          title="Total Staff" 
          :value="stats.total_staff" 
          :icon="icons.users" 
          color-class="bg-[#29166e]" 
          class="cursor-pointer group-hover:scale-[1.02] transition-transform"
        />
      </router-link>
      <router-link to="/admin/staff?filter=expiring_qid" class="block group h-full">
        <KpiCard 
          title="QID Expiry" 
          :value="stats.expiring_qid" 
          :icon="icons.alert" 
          color-class="bg-amber-500" 
          class="cursor-pointer group-hover:scale-[1.02] transition-transform"
        />
      </router-link>
      <router-link to="/admin/staff?filter=expiring_passport" class="block group h-full">
        <KpiCard 
          title="Passport Expiry" 
          :value="stats.expiring_passport" 
          :icon="icons.document" 
          color-class="bg-rose-500" 
          class="cursor-pointer group-hover:scale-[1.02] transition-transform"
        />
      </router-link>
      <router-link to="/admin/staff?filter=renewing_contract" class="block group h-full">
        <KpiCard 
          title="Renewing This Month" 
          :value="stats.renewing_contracts" 
          :icon="icons.clock" 
          color-class="bg-[#29166e]" 
          class="cursor-pointer group-hover:scale-[1.02] transition-transform"
        />
      </router-link>
      <router-link to="/admin/reports/documentation-status" class="block group h-full">
        <KpiCard 
          title="Doc Status" 
          :value="stats.pending_docs_count" 
          :icon="icons.document" 
          color-class="bg-rose-600" 
          class="cursor-pointer group-hover:scale-[1.02] transition-transform"
        />
      </router-link>
    </div>
    
    <!-- Financial Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="block h-full">
        <KpiCard 
          title="Total Collected" 
          :value="`QAR ${formatCurrency(stats.total_collected)}`" 
          :icon="icons.currency" 
          color-class="bg-emerald-600" 
        />
      </div>
      <router-link to="/admin/contracts?filter=pending" class="block group h-full">
        <KpiCard 
          title="Pending Collection" 
          :value="`QAR ${formatCurrency(stats.total_pending)}`" 
          :icon="icons.clock" 
          color-class="bg-amber-600" 
          class="cursor-pointer group-hover:scale-[1.02] transition-transform"
        />
      </router-link>
      <div class="block h-full">
        <KpiCard 
          title="Contract Profit" 
          :value="`QAR ${formatCurrency(stats.total_profit)}`" 
          :icon="icons.trending" 
          color-class="bg-[#29166e]" 
        />
      </div>
    </div>

    <!-- Data Tables Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Recent Collections Table -->
      <div class="lg:col-span-2 bg-white dark:bg-slate-800 p-0 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between p-6 pb-2">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white">Recent Collections</h3>
          <router-link to="/admin/reports/collections" class="text-xs font-bold text-[#29166e] hover:text-[#1d0f4d]">View All Collections →</router-link>
        </div>
        
        <div class="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-50 dark:border-slate-700/50">
                <th class="px-6 py-4 font-black">Time & Date</th>
                <th class="px-6 py-4 font-black">Collector</th>
                <th class="px-6 py-4 font-black">Company</th>
                <th class="px-6 py-4 font-black">Staff</th>
                <th class="px-6 py-4 font-black text-right">Amount</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
              <tr v-for="collection in recentCollections" :key="collection.id" 
                  @click="viewCollectionDetails(collection)"
                  class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group">
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <span class="text-sm font-black text-slate-800 dark:text-white leading-tight mb-0.5">{{ collection.date }}</span>
                    <span class="text-[10px] font-bold text-[#29166e]/70 uppercase tracking-wider">{{ collection.time_ago }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-[#29166e]/10 dark:bg-[#29166e]/20 flex items-center justify-center text-[10px] font-bold text-[#29166e]">
                      {{ collection.collector.charAt(0) }}
                    </div>
                    <span class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ collection.collector }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[150px] block">{{ collection.company }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    {{ collection.staff }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <span class="text-xs font-medium text-slate-400 uppercase mr-1">QAR</span>
                  <span class="text-base font-black text-slate-900 dark:text-white">{{ formatCurrency(collection.amount) }}</span>
                </td>
              </tr>
              <tr v-if="!recentCollections.length">
                <td colspan="5" class="px-6 py-10 text-center text-slate-400 italic text-sm">No collections recorded yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

        <!-- Column for Alerts -->
        <div class="space-y-8">
          <!-- Upcoming Expirations -->
          <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden relative h-fit">
              <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-6">Upcoming Expirations</h3>
              <div class="space-y-4">
                  <div v-for="staff in upcomingExpirations" :key="staff.id" class="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                      <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                          <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                      </div>
                      <div class="min-w-0 flex-1">
                          <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ staff.name }}</p>
                          <p class="text-xs" :class="staff.status === 'critical' ? 'text-red-500 font-bold' : (staff.status === 'warning' ? 'text-amber-500 font-medium' : 'text-slate-500')">
                            <template v-if="staff.days < 0">
                              {{ staff.type }} expired {{ Math.abs(staff.days) }} days ago
                            </template>
                            <template v-else-if="staff.days === 0">
                              {{ staff.type }} expires today
                            </template>
                            <template v-else>
                              {{ staff.type }} expires in {{ staff.days }} days
                            </template>
                          </p>
                      </div>
                      <router-link :to="`/admin/staff?search=${staff.name}`" class="text-xs font-bold text-[#29166e] hover:text-[#1d0f4d]">View</router-link>
                  </div>
                  <div v-if="!upcomingExpirations.length" class="py-10 text-center text-slate-400 italic text-sm">
                      No expirations in the next 30 days.
                  </div>
              </div>
              <router-link to="/admin/staff?filter=expiring_qid" class="block w-full mt-6 py-2 text-center text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors bg-slate-50 dark:bg-slate-700 rounded-lg">View All Expiry Alerts</router-link>
          </div>

        </div>
      </div>
    

    <!-- Collection Details Modal -->
    <Modal :show="showCollectionModal" title="Collection & Company Details" @close="showCollectionModal = false" maxWidth="4xl">
      <div v-if="selectedCollection" class="p-8 space-y-8">
        <!-- Current Collection Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-4">
            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Collection Info</h4>
            <div class="p-5 rounded-2xl bg-[#29166e]/5 dark:bg-[#29166e]/10 border border-[#29166e]/10 dark:border-[#29166e]/20">
              <div class="flex items-center justify-between mb-4">
                <span class="text-xs font-bold text-[#29166e]">Amount Collected</span>
                <span class="text-2xl font-black text-[#29166e] dark:text-white">QAR {{ formatCurrency(selectedCollection.amount) }}</span>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500 font-medium">Date:</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200">{{ selectedCollection.date }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500 font-medium">Method:</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200">{{ selectedCollection.method }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500 font-medium">Staff Member:</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200">{{ selectedCollection.staff }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500 font-medium">Recorded By:</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200">{{ selectedCollection.collector }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Company Details</h4>
            <div v-if="companyInfo" class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50">
              <h5 class="text-lg font-black text-slate-800 dark:text-white mb-4">{{ companyInfo.name }}</h5>
              <div class="space-y-3">
                <div class="flex items-center gap-3 text-sm">
                  <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                  <span class="text-slate-500">Contact:</span>
                  <span class="font-bold text-slate-700 dark:text-slate-300">{{ companyInfo.contact_person || 'N/A' }}</span>
                </div>
                <div class="flex items-center gap-3 text-sm">
                  <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                  <span class="text-slate-500">Phone:</span>
                  <span class="font-bold text-slate-700 dark:text-slate-300">{{ companyInfo.phone_number || 'N/A' }}</span>
                </div>
              </div>
              <router-link :to="`/admin/companies`" class="mt-4 block w-full py-2 text-center text-[10px] font-black uppercase tracking-widest text-[#29166e] bg-[#29166e]/5 dark:bg-[#29166e]/20 rounded-xl hover:bg-[#29166e]/10 transition-colors">
                View Full Company Profile
              </router-link>
            </div>
            <div v-else-if="loadingDetails" class="p-10 flex flex-col items-center justify-center space-y-4">
              <div class="w-8 h-8 border-4 border-[#29166e]/20 border-t-[#29166e] rounded-full animate-spin"></div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Company Info...</p>
            </div>
          </div>
        </div>

        <!-- Pending Collections for Company -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Other Pending Collections for this Company</h4>
            <span v-if="!loadingDetails" class="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/30 text-[9px] font-black text-rose-600 uppercase tracking-widest">
              {{ pendingCollections.length }} Outstanding
            </span>
          </div>
          
          <div v-if="loadingDetails" class="flex justify-center py-12">
            <div class="w-10 h-10 border-4 border-slate-200 border-t-[#29166e] rounded-full animate-spin"></div>
          </div>
          <div v-else-if="pendingCollections.length > 0" class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
            <table class="w-full text-left">
              <thead>
                <tr class="text-[9px] uppercase tracking-[0.2em] text-slate-400 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th class="px-6 py-3 font-black">Staff Member</th>
                  <th class="px-6 py-3 font-black">Contract Total</th>
                  <th class="px-6 py-3 font-black">Paid</th>
                  <th class="px-6 py-3 font-black text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr v-for="item in pendingCollections" :key="item.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td class="px-6 py-4">
                    <span class="text-sm font-bold text-slate-800 dark:text-white">{{ item.staff_name }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-xs font-medium text-slate-400 uppercase mr-1">QAR</span>
                    <span class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ formatCurrency(item.total_income) }}</span>
                  </td>
                  <td class="px-6 py-4 text-emerald-600 dark:text-emerald-400">
                    <span class="text-[10px] font-black uppercase mr-1">QAR</span>
                    <span class="text-sm font-bold">{{ formatCurrency(item.paid_amount) }}</span>
                  </td>
                  <td class="px-6 py-4 text-right text-rose-600 dark:text-rose-400">
                    <span class="text-[10px] font-black uppercase mr-1">QAR</span>
                    <span class="text-base font-black">{{ formatCurrency(item.pending_amount) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else-if="!loadingDetails" class="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
            <p class="text-sm font-bold text-slate-400 dark:text-slate-500 italic">No other pending collections found for this company.</p>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="flex items-center justify-end w-full p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <button @click="showCollectionModal = false" class="px-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            Close View
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import KpiCard from '@/components/shared/KpiCard.vue';
import Modal from '@/components/shared/Modal.vue';
import api, { companyService } from '@/services/api';

const loading = ref(false);
const lastSync = ref(new Date().toLocaleTimeString());
const stats = ref({
    total_staff: 0,
    expiring_qid: 0,
    expiring_passport: 0,
    renewing_contracts: 0,
    total_collected: 0,
    total_pending: 0,
    total_profit: 0,
    pending_docs_count: 0
});

const recentCollections = ref([]);
const upcomingExpirations = ref([]);
const renewingContracts = ref([]);

// Collection Modal State
const showCollectionModal = ref(false);
const selectedCollection = ref(null);
const loadingDetails = ref(false);
const companyInfo = ref(null);
const pendingCollections = ref([]);

const icons = {
    users: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
    briefcase: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
    alert: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
    document: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
    currency: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
    clock: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
    trending: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`
};

const formatCurrency = (val) => {
  return parseFloat(val).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const getStatusClass = (status) => {
  switch (status) {
    case 'critical': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
    case 'warning': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'expired': return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
    case 'info': return 'bg-[#29166e]/10 text-[#29166e] dark:bg-[#29166e]/20 dark:text-[#29166e]';
    default: return 'bg-slate-100 text-slate-500';
  }
};

const fetchDashboardData = async () => {
    loading.value = true;
    try {
        const res = await api.get('/dashboard');
        stats.value = res.data.stats;
        recentCollections.value = res.data.recentCollections;
        upcomingExpirations.value = res.data.upcomingExpirations || [];
        renewingContracts.value = res.data.renewingContracts || [];
        lastSync.value = new Date().toLocaleTimeString();
    } catch (err) {
        console.error('Failed to load dashboard data', err);
    } finally {
        loading.value = false;
    }
}



const viewCollectionDetails = async (collection) => {
    selectedCollection.value = collection;
    showCollectionModal.value = true;
    
    if (collection.company_id) {
        loadingDetails.value = true;
        try {
            const res = await companyService.getPendingCollections(collection.company_id);
            companyInfo.value = res.data.company;
            pendingCollections.value = res.data.pending_contracts;
        } catch (err) {
            console.error('Failed to fetch pending collections', err);
        } finally {
            loadingDetails.value = false;
        }
    } else {
        companyInfo.value = null;
        pendingCollections.value = [];
    }
};

onMounted(() => fetchDashboardData());
</script>