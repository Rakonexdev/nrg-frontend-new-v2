<template>
  <div class="admin-layout flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden font-outfit">
    <!-- Sidebar -->
    <aside class="w-56 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-2xl shadow-[#29166e]/5 border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col z-30 transition-all">
      <div class="p-4 flex items-center justify-center">
        <div class="relative group">
            <div class="absolute -inset-4 bg-[#29166e]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <img src="@/assets/nrg-logo.png" alt="NRG Logo" class="w-24 h-auto relative drop-shadow-lg transform transition-transform duration-500 hover:scale-105" />
        </div>
      </div>
      
      <nav class="flex-1 px-2 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
        <p class="px-3 text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-2 mt-4">Core Operations</p>
        
        <router-link v-for="link in filteredNavLinks" :key="link.to" :to="link.to" 
                     class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative" 
                     active-class="bg-[#29166e] text-white shadow-xl shadow-[#29166e]/30 scale-[1.02]">
          <div v-html="link.icon" class="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110"></div>
          <span class="font-bold tracking-tight text-xs">{{ link.label }}</span>
          <div v-if="$route.path === link.to" class="absolute left-0 w-1 h-5 bg-white rounded-r-full my-auto inset-y-0"></div>
        </router-link>

        <template v-if="filteredDocLinks.length > 0">
          <p class="px-3 text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-2 mt-5">Documentation</p>
          
          <router-link v-for="link in filteredDocLinks" :key="link.to" :to="link.to" 
                       class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative" 
                       active-class="bg-[#29166e] text-white shadow-xl shadow-[#29166e]/30 scale-[1.02]">
            <div v-html="link.icon" class="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110"></div>
            <span class="font-bold tracking-tight text-xs flex-1">{{ link.label }}</span>
            <div v-if="$route.path === link.to" class="absolute left-0 w-1 h-5 bg-white rounded-r-full my-auto inset-y-0"></div>
          </router-link>
        </template>

        <template v-if="filteredImmigrationLinks.length > 0">
          <p class="px-3 text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-2 mt-5">Immigration</p>
          
          <router-link v-for="link in filteredImmigrationLinks" :key="link.to" :to="link.to" 
                       class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative" 
                       active-class="bg-[#29166e] text-white shadow-xl shadow-[#29166e]/30 scale-[1.02]">
            <div v-html="link.icon" class="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110"></div>
            <span class="font-bold tracking-tight text-xs flex-1">{{ link.label }}</span>
            <span v-if="link.badge" class="text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[1.5rem] text-center" :class="$route.path === link.to ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'">{{ link.badge }}</span>
            <div v-if="$route.path === link.to" class="absolute left-0 w-1 h-5 bg-white rounded-r-full my-auto inset-y-0"></div>
          </router-link>
        </template>

        <!-- Reports Section -->
        <template v-if="authStore.hasPermission('view_reports') || authStore.isSuperAdmin">
          <p class="px-3 text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-2 mt-5">Reports</p>
          
          <router-link v-for="link in filteredReportLinks" :key="link.to" :to="link.to" 
                       class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative" 
                       active-class="bg-[#29166e] text-white shadow-xl shadow-[#29166e]/30 scale-[1.02]">
            <div v-html="link.icon" class="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110"></div>
            <span class="font-bold tracking-tight text-xs">{{ link.label }}</span>
            <div v-if="$route.path === link.to" class="absolute left-0 w-1 h-5 bg-white rounded-r-full my-auto inset-y-0"></div>
          </router-link>
        </template>
      </nav>

      <div class="p-3 mt-auto">
        <div class="bg-slate-100/50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200/50 dark:border-slate-700/50">
            <div class="flex items-center gap-2 mb-3">
                <div class="w-8 h-8 rounded-full bg-[#29166e]/10 dark:bg-[#29166e]/30 flex items-center justify-center text-[#29166e] dark:text-blue-400 font-bold text-xs flex-shrink-0">{{ userInitials }}</div>
                <div class="min-w-0">
                    <p class="text-xs font-bold text-slate-800 dark:text-white truncate">{{ authStore.user?.name || 'Admin User' }}</p>
                    <p class="text-[9px] font-medium text-slate-500 truncate">{{ roleBadge }}</p>
                </div>
            </div>
            <router-link to="/admin/change-password" class="w-full flex items-center justify-center gap-2 py-2 mb-2 bg-[#29166e]/5 dark:bg-[#29166e]/20 text-[#29166e] dark:text-blue-400 rounded-lg font-bold text-xs hover:bg-[#29166e]/10 dark:hover:bg-[#29166e]/30 transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                Change Password
            </router-link>
            <button @click="logout" class="w-full flex items-center justify-center gap-2 py-2 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 rounded-lg font-bold text-xs hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                Sign Out
            </button>
        </div>
      </div>
    </aside>

    <!-- Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      <!-- Glow effect -->
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-[#29166e]/10 blur-[100px] pointer-events-none"></div>
      
      <header class="h-20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-10 relative z-20">
        <div class="flex items-center gap-3">
            <div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <h2 class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{{ $route.meta.title || 'Overview' }}</h2>
        </div>
        
        <!-- Mini Stats Bar in Header -->
        <transition name="fade-scale" mode="out-in">
          <div v-if="$route.name === 'admin-dashboard' && dashboardStore.showMiniStats" 
               class="flex-1 hidden lg:flex items-center justify-center gap-2 mx-6 overflow-x-auto no-scrollbar py-1" key="dashboard">
            <div v-for="stat in activeMiniStats" :key="stat.key" 
                 class="flex items-center gap-2.5 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-full shadow-sm hover:shadow-md transition-all hover:scale-105 duration-200 cursor-default">
              <span class="w-2.5 h-2.5 rounded-full" :class="stat.color"></span>
              <div class="flex items-baseline gap-2">
                <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ stat.label }}</span>
                <span class="text-base font-black text-slate-800 dark:text-slate-200">{{ stat.value }}</span>
              </div>
            </div>
          </div>
          
          <div v-else-if="$route.name === 'admin-contracts' && dashboardStore.showContractMiniStats" 
               class="flex-1 hidden lg:flex items-center justify-center gap-2 mx-6 overflow-x-auto no-scrollbar py-1" key="contracts">
            <div v-for="stat in activeContractMiniStats" :key="stat.key" 
                 class="flex items-center gap-2.5 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-full shadow-sm hover:shadow-md transition-all hover:scale-105 duration-200 cursor-default">
              <span class="w-2.5 h-2.5 rounded-full" :class="stat.color"></span>
              <div class="flex items-baseline gap-2">
                <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ stat.label }}</span>
                <span class="text-base font-black text-slate-800 dark:text-slate-200">{{ stat.value }}</span>
              </div>
            </div>
          </div>

          <div v-else-if="$route.name === 'admin-expenses' && dashboardStore.showExpenseMiniStats" 
               class="flex-1 hidden lg:flex items-center justify-center gap-2 mx-6 overflow-x-auto no-scrollbar py-1" key="expenses">
            <div v-for="stat in activeExpenseMiniStats" :key="stat.key" 
                 class="flex items-center gap-2.5 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-full shadow-sm hover:shadow-md transition-all hover:scale-105 duration-200 cursor-default">
              <span class="w-2.5 h-2.5 rounded-full" :class="stat.color"></span>
              <div class="flex items-baseline gap-2">
                <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ stat.label }}</span>
                <span class="text-base font-black text-slate-800 dark:text-slate-200">{{ stat.value }}</span>
              </div>
            </div>
          </div>

          <div v-else-if="$route.name === 'admin-immigration-bank-details' && dashboardStore.showBankMiniStats" 
               class="flex-1 hidden lg:flex items-center justify-center gap-2 mx-6 overflow-x-auto no-scrollbar py-1" key="bank">
            <div v-for="stat in activeBankMiniStats" :key="stat.key" 
                 class="flex items-center gap-2.5 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-full shadow-sm hover:shadow-md transition-all hover:scale-105 duration-200 cursor-default">
              <span class="w-2.5 h-2.5 rounded-full" :class="stat.color"></span>
              <div class="flex items-baseline gap-2">
                <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ stat.label }}</span>
                <span class="text-base font-black text-slate-800 dark:text-slate-200">{{ stat.value }}</span>
              </div>
            </div>
          </div>

          <div v-else-if="$route.name === 'admin-immigration-visa-applications' && dashboardStore.showVisaMiniStats" 
               class="flex-1 hidden lg:flex items-center justify-center gap-2 mx-6 overflow-x-auto no-scrollbar py-1" key="visa">
            <div v-for="stat in activeVisaMiniStats" :key="stat.key" 
                 class="flex items-center gap-2.5 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-full shadow-sm hover:shadow-md transition-all hover:scale-105 duration-200 cursor-default">
              <span class="w-2.5 h-2.5 rounded-full" :class="stat.color"></span>
              <div class="flex items-baseline gap-2">
                <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ stat.label }}</span>
                <span class="text-base font-black text-slate-800 dark:text-slate-200">{{ stat.value }}</span>
              </div>
            </div>
          </div>
        </transition>

        <div class="flex items-center gap-6">
          <button @click="toggleDarkMode" class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all group">
            <svg v-if="isDark" class="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            <svg v-else class="w-5 h-5 group-hover:-rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
          <div class="relative group">
              <button class="p-2.5 rounded-xl bg-[#29166e]/10 dark:bg-[#29166e]/20 text-[#29166e] dark:text-blue-400 transition-all">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                  <span class="absolute top-2 right-2 w-2 h-2 bg-[#29166e] rounded-full border-2 border-white dark:border-slate-900"></span>
              </button>
          </div>
        </div>
      </header>
      
      <main class="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar relative z-10">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useDashboardStore } from '@/stores/dashboard';

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();

const formatCurrency = (val) => {
  if (val === undefined || val === null) return '0';
  return parseFloat(val).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

const miniStats = computed(() => [
  {
    key: 'total_staff',
    label: 'Staff',
    value: dashboardStore.stats.total_staff,
    permission: 'dashboard_total_staff',
    color: 'bg-[#29166e]',
  },
  {
    key: 'expiring_qid',
    label: 'QID Exp',
    value: dashboardStore.stats.expiring_qid,
    permission: 'dashboard_qid_expiry',
    color: 'bg-amber-500',
  },
  {
    key: 'expiring_passport',
    label: 'Pass Exp',
    value: dashboardStore.stats.expiring_passport,
    permission: 'dashboard_passport_expiry',
    color: 'bg-rose-500',
  },
  {
    key: 'renewing_contracts',
    label: 'Renewing',
    value: dashboardStore.stats.renewing_contracts,
    permission: 'dashboard_renewing_this_month',
    color: 'bg-[#29166e]',
  },
  {
    key: 'pending_docs_count',
    label: 'Docs',
    value: dashboardStore.stats.pending_docs_count,
    permission: 'dashboard_doc_status',
    color: 'bg-rose-600',
  },
  {
    key: 'total_collected',
    label: 'Collected',
    value: `QAR ${formatCurrency(dashboardStore.stats.total_collected)}`,
    permission: 'dashboard_total_collected',
    color: 'bg-emerald-600',
  },
  {
    key: 'total_pending',
    label: 'Pending',
    value: `QAR ${formatCurrency(dashboardStore.stats.total_pending)}`,
    permission: 'dashboard_pending_collection',
    color: 'bg-amber-600',
  },
  {
    key: 'total_profit',
    label: 'Profit',
    value: `QAR ${formatCurrency(dashboardStore.stats.total_profit)}`,
    permission: 'dashboard_contract_profit',
    color: 'bg-[#29166e]',
  }
]);

const activeMiniStats = computed(() => {
  return miniStats.value.filter(stat => authStore.hasPermission(stat.permission));
});

const contractMiniStats = computed(() => [
  {
    key: 'total_collected',
    label: 'Collected',
    value: `QAR ${formatCurrency(dashboardStore.contractStats.total_paid)}`,
    permission: 'contract_card_total_collected',
    color: 'bg-emerald-600',
  },
  {
    key: 'pending_collection',
    label: 'Pending',
    value: `QAR ${formatCurrency(dashboardStore.contractStats.total_pending)}`,
    permission: 'contract_card_pending_collection',
    color: 'bg-amber-500',
  },
  {
    key: 'contract_profit',
    label: 'Profit',
    value: `QAR ${formatCurrency(dashboardStore.contractStats.total_contract_profit)}`,
    permission: 'contract_card_contract_profit',
    color: 'bg-[#29166e]',
  },
  {
    key: 'general_overheads',
    label: 'Overheads',
    value: `QAR ${formatCurrency(dashboardStore.contractStats.total_overheads)}`,
    permission: 'contract_card_general_overheads',
    color: 'bg-rose-500',
  }
]);

const activeContractMiniStats = computed(() => {
  return contractMiniStats.value.filter(stat => authStore.hasPermission(stat.permission));
});

const expenseMiniStats = computed(() => [
  {
    key: 'total_expenses',
    label: 'Total Exp',
    value: `QAR ${formatCurrency(dashboardStore.expenseStats.this_month)}`,
    permission: 'view_expenses',
    color: 'bg-[#29166e]',
  },
  {
    key: 'employee_exp',
    label: 'Emp Exp',
    value: `QAR ${formatCurrency(dashboardStore.expenseStats.this_month_employee)}`,
    permission: 'view_expenses',
    color: 'bg-rose-500',
  },
  {
    key: 'personal_due',
    label: 'Pers Due',
    value: `QAR ${formatCurrency(dashboardStore.expenseStats.this_month_personal_due)}`,
    permission: 'view_expenses',
    color: 'bg-amber-500',
  },
  {
    key: 'company_exp',
    label: 'Comp Exp',
    value: `QAR ${formatCurrency(dashboardStore.expenseStats.this_month_company)}`,
    permission: 'view_expenses',
    color: 'bg-emerald-600',
  }
]);

const activeExpenseMiniStats = computed(() => {
  return expenseMiniStats.value.filter(stat => authStore.hasPermission(stat.permission));
});

const bankMiniStats = computed(() => [
  {
    key: 'credit_total',
    label: 'Credit',
    value: `QAR ${formatCurrency(dashboardStore.bankStats.credit_total)}`,
    permission: 'view_bank_details',
    color: 'bg-[#29166e]',
  },
  {
    key: 'debit_total',
    label: 'Debit',
    value: `QAR ${formatCurrency(dashboardStore.bankStats.debit_total)}`,
    permission: 'view_bank_details',
    color: 'bg-blue-600',
  },
  {
    key: 'total_balance',
    label: 'Total',
    value: `QAR ${formatCurrency(dashboardStore.bankStats.total_balance)}`,
    permission: 'view_bank_details',
    color: 'bg-emerald-500',
  }
]);

const activeBankMiniStats = computed(() => {
  return bankMiniStats.value.filter(stat => authStore.hasPermission(stat.permission) || authStore.isSuperAdmin);
});

const visaMiniStats = computed(() => [
  {
    key: 'total_collected',
    label: 'Collection',
    value: `QAR ${formatCurrency(dashboardStore.visaStats.total_collected)}`,
    permission: 'view_visa_applications',
    color: 'bg-[#29166e]',
  },
  {
    key: 'total_pending',
    label: 'Pending',
    value: `QAR ${formatCurrency(dashboardStore.visaStats.total_pending)}`,
    permission: 'view_visa_applications',
    color: 'bg-rose-500',
  },
  {
    key: 'total_expired_vps',
    label: 'Expired VPs',
    value: `${dashboardStore.visaStats.total_expired_vps} Records`,
    permission: 'view_visa_applications',
    color: 'bg-amber-500',
  }
]);

const activeVisaMiniStats = computed(() => {
  return visaMiniStats.value.filter(stat => authStore.hasPermission(stat.permission) || authStore.isSuperAdmin);
});

const router = useRouter();
const isDark = ref(document.documentElement.classList.contains('dark'));

const userInitials = computed(() => {
    const name = authStore.user?.name || 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
});

const roleBadge = computed(() => {
    const role = authStore.userRole;
    if (role === 'super_admin') return '🛡️ Super Admin';
    if (role === 'admin') return '👤 Admin';
    return role || 'User';
});

// Define all navigation links with their required permissions
const allNavLinks = [
    { to: '/admin', label: 'Overview', permission: 'view_dashboard', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' },
    { to: '/admin/companies', label: 'Companies', permission: 'view_companies', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' },
    { to: '/admin/staff', label: 'Staff', permission: 'view_staff', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' },
    { to: '/admin/contracts', label: 'Contracts', permission: 'view_contracts', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' },
    { to: '/admin/expenses', label: 'Expenses', permission: 'view_expenses', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' },
    { to: '/admin/collectors', label: 'Collectors', permission: 'view_collectors', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' },
];

const allReportLinks = [
    { to: '/admin/reports/collections', label: 'Collections', permission: 'view_reports', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' },
    { to: '/admin/reports/income-expenditure', label: 'Income & Expenditure', permission: 'view_reports', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' },
    { to: '/admin/reports/documentation-status', label: 'Documentation Status', permission: 'view_reports', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' },
    { to: '/admin/role-access', label: 'Role Access', permission: 'view_role_access', superAdminOnly: true, icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' },
];

const allDocLinks = [
    { to: '/admin/documentation/company', label: 'Company Docs', permission: 'view_documentation', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' },
    { to: '/admin/documentation/other', label: 'Other Docs', permission: 'view_documentation', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' },
];

const allImmigrationLinks = [
    { to: '/admin/immigration/sponsorship-change', label: 'Sponsorship Change', permission: 'view_sponsorship_changes', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>' },
    { to: '/admin/immigration/company-visas', label: 'Company Visas', permission: 'view_company_visas', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>' },
    { to: '/admin/immigration/visa-applications', label: 'Visa Applications', permission: 'view_visa_applications', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>' },
    { to: '/admin/immigration/vehicle-tracking', label: 'Vehicle Tracking', permission: 'view_vehicles', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 8h4a1 1 0 01.8.4l3 4V16h-1.8m-4.4 0H11"></path></svg>' },
    { to: '/admin/immigration/bank-details', label: 'Bank Details', permission: 'view_bank_details', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>' },
    { to: '/admin/immigration/official-format', label: 'Official Format', permission: 'view_documentation', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>' },
];

// Filter navigation links based on user permissions
const filteredNavLinks = computed(() => {
    return allNavLinks.filter(link => authStore.hasPermission(link.permission));
});

const filteredReportLinks = computed(() => {
    return allReportLinks.filter(link => {
        if (link.superAdminOnly && !authStore.isSuperAdmin) return false;
        return authStore.hasPermission(link.permission);
    });
});

const filteredDocLinks = computed(() => {
    return allDocLinks.filter(link => authStore.hasPermission(link.permission));
});

const filteredImmigrationLinks = computed(() => {
    return allImmigrationLinks.filter(link => authStore.hasPermission(link.permission) || authStore.isSuperAdmin);
});



const toggleDarkMode = () => {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
};

const logout = async () => {
    try {
        await authStore.logout();
    } finally {
        router.push('/login');
    }
};
</script>

<style>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-10px);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
}
</style>
<style scoped>
.admin-layout {
  font-family: 'Outfit', sans-serif;
}
</style>