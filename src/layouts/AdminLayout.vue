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
        
        <router-link v-for="link in navLinks" :key="link.to" :to="link.to" 
                     class="flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative" 
                     active-class="bg-blue-600 text-white shadow-xl shadow-blue-500/30 scale-[1.02]">
          <div v-html="link.icon" class="w-5 h-5 transition-transform group-hover:scale-110"></div>
          <span class="font-bold tracking-tight text-sm">{{ link.label }}</span>
          <div v-if="$route.path === link.to" class="absolute left-0 w-1.5 h-6 bg-white rounded-r-full my-auto inset-y-0"></div>
        </router-link>

        <p class="px-4 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-4 mt-8">System Control</p>
        <button v-for="link in systemLinks" :key="link.label" class="flex items-center gap-4 w-full px-5 py-3.5 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all group">
            <div v-html="link.icon" class="w-5 h-5"></div>
            <span class="font-bold tracking-tight text-sm">{{ link.label }}</span>
        </button>
      </nav>

      <div class="p-6 mt-auto">
        <div class="bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50">
            <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">JD</div>
                <div class="min-w-0">
                    <p class="text-sm font-bold text-slate-800 dark:text-white truncate">Admin User</p>
                    <p class="text-[10px] font-medium text-slate-500 truncate">admin@nrg.com</p>
                </div>
            </div>
            <button @click="logout" class="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 rounded-xl font-bold text-xs hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                Sign Out
            </button>
        </div>
      </div>
    </aside>

    <!-- Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      <!-- Glow effect -->
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 blur-[100px] pointer-events-none"></div>
      
      <header class="h-20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-10 relative z-20">
        <div class="flex items-center gap-3">
            <div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <h2 class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{{ $route.meta.title || 'Overview' }}</h2>
        </div>
        <div class="flex items-center gap-6">
          <button @click="toggleDarkMode" class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all group">
            <svg v-if="isDark" class="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            <svg v-else class="w-5 h-5 group-hover:-rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
          <div class="relative group">
              <button class="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-all">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                  <span class="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
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
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const isDark = ref(document.documentElement.classList.contains('dark'));

const navLinks = [
    { to: '/admin', label: 'Overview', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' },
    { to: '/admin/staff', label: 'Staff', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' },
    { to: '/admin/companies', label: 'Companies', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' },
    { to: '/admin/contracts', label: 'Contracts', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' },
    { to: '/admin/invoices', label: 'Invoices', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 17v-2m3 2v-4m3 2v-6m-8-5.125c.487-.167 1.013-.245 1.5-.25.5-.005 1.035.05 1.5.2.463.15.908.411 1.25.75.342.339.605.783.75 1.25.151.465.205 1 .2 1.5-.005.487-.083 1.013-.25 1.5-.167.487-.417.915-.75 1.25-.333.335-.777.599-1.25.75-.465.151-1 .205-1.5.2-.487-.005-1.013-.083-1.5-.25-.487-.167-.915-.417-1.25-.75-.335-.333-.599-.777-.75-1.25-.151-.465-.205-1-.2-1.5.005-.487.083-1.013.25-1.5.167-.487.417-.915.75-1.25.333-.335.777-.599 1.25-.75zM12 21H3v-1a6 6 0 0112 0v1z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' },
    { to: '/admin/expenses', label: 'Expenses', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' }
];

const systemLinks = [
    { label: 'Settings', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' },
    { label: 'Activity Logs', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' }
];

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