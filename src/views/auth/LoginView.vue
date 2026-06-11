<template>
  <div class="min-h-screen flex items-center justify-center bg-[#fcfcfc] p-6 relative overflow-hidden font-outfit">
    <!-- Sophisticated Background Elements -->
    <div class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div class="absolute -top-[10%] -right-[5%] w-[700px] h-[700px] bg-[#29166e]/5 blur-[120px] rounded-full animate-pulse"></div>
        <div class="absolute -bottom-[15%] -left-[5%] w-[600px] h-[600px] bg-slate-500/5 blur-[120px] rounded-full"></div>
        
        <!-- Subtle Grid Pattern -->
        <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(#29166e 0.5px, transparent 0.5px); background-size: 24px 24px;"></div>
    </div>

    <div class="w-full max-w-md relative z-10 transition-all duration-1000 transform" :class="loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'">
        <!-- Logo Section -->
        <div class="flex flex-col items-center mb-12">
            <div class="relative group cursor-default">
                <div class="absolute -inset-4 bg-[#29166e]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <img src="@/assets/nrg-logo.png" alt="NRG Logo" class="h-24 w-auto relative drop-shadow-2xl transform transition-transform duration-500 hover:scale-105" />
            </div>
            <div class="mt-6 text-center">
                <h1 class="text-3xl font-black text-slate-900 tracking-tight uppercase">Portal Access</h1>
                <div class="h-1 w-12 bg-[#29166e] mx-auto mt-2 rounded-full"></div>
            </div>
        </div>

        <!-- Premium Login Card -->
        <div class="bg-white/80 backdrop-blur-3xl p-10 rounded-[3rem] border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-500 hover:shadow-[0_48px_80px_-24px_rgba(41,22,110,0.15)]">
            <form @submit.prevent="handleLogin" class="space-y-7">
                <!-- Error Alert -->
                <Transition name="fade">
                    <div v-if="authStore.error" class="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                        </div>
                        {{ authStore.error }}
                    </div>
                </Transition>

                <!-- Email Input -->
                <div class="space-y-3">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Authorized Email</label>
                    <div class="relative group">
                        <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-slate-400 group-focus-within:text-[#29166e] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                        </div>
                        <input v-model="form.email" type="email" required placeholder="name@nrgqatar.com" 
                               class="w-full pl-12 pr-6 py-5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#29166e]/5 focus:border-[#29166e]/50 focus:bg-white outline-none transition-all duration-300 font-bold text-slate-700" />
                    </div>
                </div>

                <!-- Password Input -->
                <div class="space-y-3">
                    <div class="flex items-center justify-between ml-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security Key</label>
                        <a href="#" class="text-[10px] font-black text-[#29166e] hover:text-[#1a0d4a] transition-colors uppercase tracking-widest">Reset</a>
                    </div>
                    <div class="relative group">
                        <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-slate-400 group-focus-within:text-[#29166e] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                        </div>
                        <input v-model="form.password" type="password" required placeholder="••••••••" 
                               class="w-full pl-12 pr-6 py-5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#29166e]/5 focus:border-[#29166e]/50 focus:bg-white outline-none transition-all duration-300 font-bold text-slate-700" />
                    </div>
                </div>

                <!-- Remember & Options -->
                <div class="flex items-center gap-3 ml-2">
                    <div class="relative flex items-center">
                        <input type="checkbox" id="remember" v-model="form.remember" 
                               class="w-5 h-5 rounded-lg border-slate-300 text-[#29166e] focus:ring-[#29166e] transition-all cursor-pointer accent-[#29166e]" />
                    </div>
                    <label for="remember" class="text-xs font-bold text-slate-500 cursor-pointer select-none">Remember this session</label>
                </div>

                <!-- Action Button -->
                <button type="submit" :disabled="authStore.loading" 
                        class="group relative w-full py-5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-r from-[#29166e] to-[#1a0d4a] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <svg v-if="authStore.loading" class="animate-spin h-5 w-5 text-white relative z-10" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span class="relative z-10">{{ authStore.loading ? 'Verifying...' : 'Authorize' }}</span>
                    <svg v-if="!authStore.loading" class="w-4 h-4 relative z-10 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                </button>
            </form>
        </div>

        <!-- Footer -->
        <div class="text-center mt-10 space-y-4">
            <p class="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                System Protected by SecureAuth™
            </p>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const loaded = ref(false);

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

onMounted(() => {
  setTimeout(() => loaded.value = true, 100);
  if (route.query.expired) {
    authStore.error = "Your shift time is completed. Please contact the Super Admin to extend your time.";
  }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>