<template>
  <div class="max-w-2xl mx-auto py-10">
    <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-[#29166e]/5 border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
      <div class="p-10 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 pointer-events-none">
        <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Security <span class="text-[#29166e]">Settings</span></h1>
        <p class="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Update your account credentials</p>
      </div>

      <form @submit.prevent="handleSubmit" class="p-10 space-y-8">
        <!-- Current Password -->
        <div class="space-y-3">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Current Password</label>
          <div class="relative group">
            <input 
              v-model="form.current_password"
              :type="showPasswords.current ? 'text' : 'password'"
              placeholder="••••••••"
              class="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-[#29166e] dark:focus:border-[#29166e] rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 pr-14"
              required
            />
            <button type="button" @click="showPasswords.current = !showPasswords.current" class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 group-focus-within:text-[#29166e] transition-colors">
              <svg v-if="showPasswords.current" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 011.51-2.711m1.8-1.8A10.015 10.015 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.015 10.015 0 01-1.332 2.316m-2.115 2.115l-4.5-4.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" /></svg>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- New Password -->
          <div class="space-y-3">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">New Password</label>
            <div class="relative group">
              <input 
                v-model="form.new_password"
                :type="showPasswords.new ? 'text' : 'password'"
                placeholder="••••••••"
                class="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 pr-14"
                required
              />
              <button type="button" @click="showPasswords.new = !showPasswords.new" class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 group-focus-within:text-blue-500 transition-colors">
                <svg v-if="showPasswords.new" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 011.51-2.711m1.8-1.8A10.015 10.015 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.015 10.015 0 01-1.332 2.316m-2.115 2.115l-4.5-4.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" /></svg>
              </button>
            </div>
          </div>

          <!-- Confirm Password -->
          <div class="space-y-3">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Confirm New Password</label>
            <div class="relative group">
              <input 
                v-model="form.new_password_confirmation"
                :type="showPasswords.confirm ? 'text' : 'password'"
                placeholder="••••••••"
                class="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 pr-14"
                required
              />
              <button type="button" @click="showPasswords.confirm = !showPasswords.confirm" class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 group-focus-within:text-blue-500 transition-colors">
                <svg v-if="showPasswords.confirm" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 011.51-2.711m1.8-1.8A10.015 10.015 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.015 10.015 0 01-1.332 2.316m-2.115 2.115l-4.5-4.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" /></svg>
              </button>
            </div>
          </div>
        </div>

        <div class="pt-6">
          <button 
            type="submit" 
            :disabled="loading"
            class="w-full bg-[#29166e] hover:bg-[#1d0f4d] disabled:bg-[#29166e]/50 text-white font-black py-5 rounded-2xl shadow-xl shadow-[#29166e]/20 transition-all flex items-center justify-center gap-3 group overflow-hidden relative"
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
const showPasswords = reactive({
  current: false,
  new: false,
  confirm: false
});

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
