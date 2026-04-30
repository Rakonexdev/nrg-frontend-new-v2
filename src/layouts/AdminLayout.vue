<template>
  <div class="admin-layout flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden font-outfit">
    <!-- Sidebar -->
    <aside class="w-72 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-2xl shadow-blue-500/5 border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col z-30 transition-all">
      <div class="p-8 flex items-center gap-4">
        <div class="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/40 transform rotate-3">N</div>
        <div>
            <h2 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">NRG <span class="text-blue-600">Pro</span></h2>
            <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Management Suite</p>
        </div>
      </div>
      
      <nav class="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
        <p class="px-4 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-4 mt-6">Core Operations</p>
        
        <template v-for="link in navLinks" :key="link.label">
            <!-- Parent Link with Submenu -->
            <div v-if="link.subLinks" class="space-y-1">
                <button @click="toggleSubmenu(link.label)"
                        class="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 group relative"
                        :class="isSubmenuActive(link) ? 'bg-slate-100 dark:bg-slate-800 text-blue-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'">
                    <div class="flex items-center gap-4">
                        <div v-html="link.icon" class="w-5 h-5 transition-transform group-hover:scale-110"></div>
                        <span class="font-bold tracking-tight text-sm">{{ link.label }}</span>
                    </div>
                    <svg class="w-4 h-4 transition-transform duration-300" 
                        :class="{ 'rotate-180': openSubmenu === link.label || isSubmenuActive(link) }"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                </button>
                
                <transition name="submenu">
                    <div v-show="openSubmenu === link.label || isSubmenuActive(link)" class="pl-12 space-y-1 overflow-hidden">
                        <router-link v-for="sub in link.subLinks" :key="sub.to" :to="sub.to"
                                    class="flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all duration-300 group text-sm font-bold"
                                    active-class="text-blue-600 dark:text-blue-400"
                                    exact-active-class="text-blue-600 dark:text-blue-400">
                            <span class="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-blue-500 transition-colors"
                                :class="{ 'bg-blue-600 dark:bg-blue-400 scale-125': $route.path === sub.to }"></span>
                            <span :class="$route.path === sub.to ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'">{{ sub.label }}</span>
                        </router-link>
                    </div>
                </transition>
            </div>

            <!-- Regular Link -->
            <router-link v-else :to="link.to" 
                        class="flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative" 
                        :active-class="link.to === '/admin' ? '' : 'bg-blue-600 text-white shadow-xl shadow-blue-500/30 scale-[1.02]'"
                        exact-active-class="bg-blue-600 text-white shadow-xl shadow-blue-500/30 scale-[1.02]">
                <div v-html="link.icon" class="w-5 h-5 transition-transform group-hover:scale-110"></div>
                <span class="font-bold tracking-tight text-sm">{{ link.label }}</span>
                <div v-if="link.to === '/admin' ? $route.path === '/admin' : $route.path.startsWith(link.to)" class="absolute left-0 w-1.5 h-6 bg-white rounded-r-full my-auto inset-y-0"></div>
            </router-link>
        </template>

      </nav>

    </aside>

    <!-- Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      <!-- Glow effect -->
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 blur-[100px] pointer-events-none"></div>
      
      <header class="h-20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-10 relative z-20">
        <div class="flex items-center gap-3">
            <div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <h2 class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{{ $route.meta.title || 'System Dashboard' }}</h2>
        </div>
        <div class="flex items-center gap-6">
          <!-- Profile Dropdown -->
          <div class="relative" ref="profileRef">
            <button @click="showProfileDropdown = !showProfileDropdown" 
                    class="flex items-center gap-2.5 p-1 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 hover:border-blue-500 dark:hover:border-blue-500 transition-all group overflow-hidden shadow-sm hover:shadow-md">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                  {{ authStore.user?.name?.substring(0, 2).toUpperCase() || 'AD' }}
                </div>
                <div class="text-left hidden md:block pr-2">
                    <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Administrator</p>
                    <p class="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[100px] leading-tight">{{ authStore.user?.name || 'Admin User' }}</p>
                </div>
                <svg class="w-4 h-4 text-slate-400 mr-2 transition-transform group-hover:translate-y-0.5" 
                     :class="{ 'rotate-180': showProfileDropdown }"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            </button>

            <!-- Profile Dropdown -->
            <transition name="dropdown">
              <div v-if="showProfileDropdown" 
                   class="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden py-3 z-50">
                <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 mb-2">
                    <p class="text-sm font-black text-slate-800 dark:text-white leading-none mb-1">{{ authStore.user?.name }}</p>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{{ authStore.user?.email }}</p>
                </div>
                
                <button @click="openChangePassword" class="w-full flex items-center gap-4 px-6 py-3.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-blue-600 transition-all group">
                    <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    </div>
                    <span class="text-sm font-bold tracking-tight">Change Password</span>
                </button>

                <div class="px-3 mt-2">
                    <button @click="logout" class="w-full flex items-center gap-4 px-4 py-3 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all group">
                        <div class="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                        </div>
                        Sign Out Account
                    </button>
                </div>
              </div>
            </transition>
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
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const showProfileDropdown = ref(false);
const profileRef = ref(null);
const openSubmenu = ref(null);

const navLinks = [
    { to: '/admin', label: 'Overview', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' },
    { to: '/admin/companies', label: 'Companies', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' },
    { to: '/admin/staff', label: 'Staff', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' },
    { to: '/admin/contracts', label: 'Contracts', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' },
    { to: '/admin/expenses', label: 'Expenses', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' },
    { to: '/admin/collectors', label: 'Collectors', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' },
    { 
        label: 'Reports', 
        icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        subLinks: [
            { to: '/admin/reports/collections', label: 'Collections Report' },
            { to: '/admin/reports/income-expenditure', label: 'Income & Expenditure' }
        ]
    }
];

const toggleSubmenu = (label) => {
    openSubmenu.value = openSubmenu.value === label ? null : label;
};

const isSubmenuActive = (link) => {
    return link.subLinks && link.subLinks.some(sub => route.path.startsWith(sub.to));
};

const openChangePassword = () => {
    showProfileDropdown.value = false;
    router.push({ name: 'admin-change-password' });
};

const handleClickOutsideProfile = (event) => {
    if (profileRef.value && !profileRef.value.contains(event.target)) {
        showProfileDropdown.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutsideProfile);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutsideProfile);
});

const logout = async () => {
    showProfileDropdown.value = false;
    try {
        await authStore.logout();
    } finally {
        router.push('/login');
    }
};
</script>

<style>
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