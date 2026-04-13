<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 relative overflow-hidden font-outfit">
    <!-- Background Elements -->
    <div class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div class="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/5 blur-[120px] rounded-full"></div>
        <div class="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-600/5 blur-[120px] rounded-full"></div>
    </div>

    <div class="w-full max-w-md relative z-10 transition-all duration-700 transform" :class="loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'">
        <!-- Logo -->
        <div class="flex flex-col items-center mb-10">
            <div class="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-blue-500/40 mb-4 transform hover:rotate-6 transition-transform">N</div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Welcome Back</h1>
            <p class="text-slate-500 dark:text-slate-400 mt-2 font-medium">Empowering your HR workforce</p>
        </div>

        <!-- Card -->
        <div class="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
            <form @submit.prevent="handleLogin" class="space-y-6">
                <div v-if="authStore.error" class="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-bold flex items-center gap-3">
                    <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    {{ authStore.error }}
                </div>

                <div class="space-y-2">
                    <label class="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
                    <div class="relative group">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                        </div>
                        <input v-model="form.email" type="email" required placeholder="name@company.com" 
                               class="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white font-bold" />
                    </div>
                </div>

                <div class="space-y-2">
                    <div class="flex items-center justify-between ml-1">
                        <label class="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Secret Key</label>
                        <a href="#" class="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot?</a>
                    </div>
                    <div class="relative group">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                        </div>
                        <input v-model="form.password" type="password" required placeholder="••••••••" 
                               class="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white font-bold" />
                    </div>
                </div>

                <div class="flex items-center gap-3 ml-1">
                    <input type="checkbox" id="remember" v-model="form.remember" class="w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer" />
                    <label for="remember" class="text-sm font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none">Keep me logged in</label>
                </div>

                <button type="submit" :disabled="authStore.loading" 
                        class="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3">
                    <svg v-if="authStore.loading" class="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>{{ authStore.loading ? 'Authenticating...' : 'Sign In to NRG' }}</span>
                </button>
            </form>
        </div>

        <!-- Footer -->
        <p class="text-center mt-8 text-slate-500 dark:text-slate-400 font-bold text-sm">
            Don't have an account? <a href="#" class="text-blue-600 hover:underline">Request access</a>
        </p>
    </div>

    <!-- Theme Toggle -->
    <button @click="toggleTheme" class="absolute bottom-8 right-8 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl text-slate-600 dark:text-slate-400 hover:scale-110 transition-all">
        <svg v-if="isDark" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const loaded = ref(false);
const isDark = ref(document.documentElement.classList.contains('dark'));

const form = ref({
  email: '',
  password: '',
  remember: false
});

const handleLogin = async () => {
  const success = await authStore.login({
    email: form.value.email,
    password: form.value.password
  });

  if (success) {
    const role = authStore.userRole;
    if (role === 'admin' || role === 'super_admin') {
      router.push('/admin');
    } else {
      router.push('/collector');
    }
  }
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
};

onMounted(() => {
  setTimeout(() => loaded.value = true, 100);
});
</script>