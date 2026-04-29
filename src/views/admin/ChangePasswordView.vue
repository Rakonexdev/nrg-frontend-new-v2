<template>
  <div class="max-w-2xl mx-auto py-10">
    <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-blue-500/5 border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
      <div class="p-10 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 pointer-events-none">
        <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Security <span class="text-blue-600">Settings</span></h1>
        <p class="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Update your account credentials</p>
      </div>

      <form @submit.prevent="handleSubmit" class="p-10 space-y-8">
        <!-- Current Password -->
        <div class="space-y-3">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Current Password</label>
          <div class="relative group">
            <input 
              v-model="form.current_password"
              type="password"
              placeholder="••••••••"
              class="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
              required
            />
            <div class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- New Password -->
          <div class="space-y-3">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">New Password</label>
            <div class="relative group">
              <input 
                v-model="form.new_password"
                type="password"
                placeholder="••••••••"
                class="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                required
              />
              <div class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
              </div>
            </div>
          </div>

          <!-- Confirm Password -->
          <div class="space-y-3">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Confirm New Password</label>
            <div class="relative group">
              <input 
                v-model="form.new_password_confirmation"
                type="password"
                placeholder="••••••••"
                class="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                required
              />
              <div class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-6">
          <button 
            type="submit" 
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 group overflow-hidden relative"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <svg v-if="!loading" class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            <svg v-else class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            <span class="uppercase tracking-[0.2em] text-sm">{{ loading ? 'Saving Credentials...' : 'Update Password' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification';

const notificationStore = useNotificationStore();
const loading = ref(false);

const form = reactive({
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
});

const handleSubmit = async () => {
    if (form.new_password !== form.new_password_confirmation) {
        notificationStore.addNotification("New passwords do not match!", "error");
        return;
    }

    loading.value = true;
    try {
        await api.post('/auth/change-password', form);
        notificationStore.addNotification("Password updated successfully!", "success");
        form.current_password = '';
        form.new_password = '';
        form.new_password_confirmation = '';
    } catch (error) {
        console.error(error);
        notificationStore.addNotification(error.response?.data?.message || "Failed to update password", "error");
    } finally {
        loading.value = false;
    }
};
</script>
