<template>
  <div :class="{ 'dark': isDark }" class="h-screen w-full flex flex-col font-sans overflow-hidden">
    <div class="h-full w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
    <!-- Header -->
    <header class="pt-10 pb-4 px-6 bg-white dark:bg-slate-900 shadow-md dark:shadow-lg dark:backdrop-blur-md sticky top-0 z-50 flex justify-between items-center border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div>
        <h1 class="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#29166e] to-slate-600 dark:from-blue-400 dark:to-slate-400 tracking-tight uppercase">NRG Qatar</h1>
        <p class="text-[10px] text-[#29166e] dark:text-blue-300 font-black tracking-wider uppercase">Field Collector</p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Theme Toggle -->
        <button @click="themeStore.toggleTheme" 
                class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-105 active:scale-95 transition-all shadow-sm">
          <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-width="2" stroke-linecap="round"></path></svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" stroke-width="2" stroke-linecap="round"></path></svg>
        </button>

        <!-- Profile Dropdown -->
        <div class="relative" ref="profileRef">
          <button @click="showProfileDropdown = !showProfileDropdown" 
                  class="w-10 h-10 rounded-full bg-gradient-to-tr from-[#29166e] to-slate-500 flex items-center justify-center p-[2px] shadow-lg transition-transform hover:scale-105">
            <div class="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
              <span class="text-sm font-bold text-[#29166e] dark:text-blue-400">{{ userInitials }}</span>
            </div>
          </button>
  
          <transition name="dropdown">
            <div v-if="showProfileDropdown" 
                 class="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden py-3 z-50">
              <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 mb-2">
                  <p class="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">{{ authStore.user?.name || 'Collector' }}</p>
                  <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate">{{ authStore.user?.email || 'collector@nrg.local' }}</p>
              </div>
              
              <div class="px-3 mt-2 space-y-1">
                  <button @click="openChangePassword" class="w-full flex items-center gap-4 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl hover:text-blue-600 transition-all group font-bold text-xs uppercase tracking-widest">
                      <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                      </div>
                      Change Password
                  </button>
                  <button @click="logout" class="w-full flex items-center gap-4 px-4 py-3 bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500/20 transition-all group">
                      <div class="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center group-hover:rotate-12 transition-transform border border-slate-200 dark:border-slate-800">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                      </div>
                      Sign Out
                  </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 overflow-y-auto pb-20 scroll-smooth">
      <router-view v-slot="{ Component }">
        <transition name="fade-slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Bottom Navigation (Glassmorphism) -->
    <nav class="fixed bottom-0 w-full px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50 rounded-t-3xl transition-colors duration-300">
      <ul class="flex justify-around items-center">
        <!-- Home -->
        <li class="flex-1 flex justify-center">
          <router-link to="/collector" class="flex flex-col items-center gap-1 group transition-all duration-300 text-slate-400 dark:text-slate-500 hover:text-[#29166e] dark:hover:text-blue-300" active-class="text-[#29166e] dark:text-blue-400 scale-110" exact>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            <span class="text-[10px] font-medium tracking-wide">Home</span>
          </router-link>
        </li>
        <!-- Settlement -->
        <li class="flex-1 flex justify-center">
          <router-link to="/collector/settle" class="flex flex-col items-center gap-1 group transition-all duration-300 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300" active-class="text-[#29166e] dark:text-blue-400 scale-110">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
            <span class="text-[10px] font-medium tracking-wide">Settle</span>
          </router-link>
        </li>
      </ul>
    </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);
const router = useRouter();
const showProfileDropdown = ref(false);
const profileRef = ref(null);

const userInitials = computed(() => {
  const name = authStore.user?.name || 'C';
  return name.substring(0, 2).toUpperCase();
});

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

const openChangePassword = () => {
    showProfileDropdown.value = false;
    router.push({ name: 'collector-change-password' });
};

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
  transform: translateY(20px) scale(0.98);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.98);
}

/* Fix for dropdown transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top right;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>