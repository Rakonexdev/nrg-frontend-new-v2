<template>
  <div class="px-6 py-6 pb-32">
    <div class="mb-8 px-2">
      <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Today's Settlements</h1>
      <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">Review your collections and submit for settlement.</p>
    </div>

    <!-- Summary Card (Actionable) -->
    <div v-if="summary" class="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-6 shadow-[0_15px_40px_rgba(79,70,229,0.3)] text-center relative overflow-hidden mb-10 transition-all duration-500">
      <div class="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      <div class="absolute -left-10 -bottom-10 w-32 h-32 bg-black/20 rounded-full blur-xl"></div>
      
      <p class="text-indigo-100 text-[10px] font-black uppercase tracking-widest relative z-10 mb-2 opacity-80">Pending Settlement</p>
      <h2 class="text-5xl font-black text-white tracking-tight relative z-10 mb-2 drop-shadow-lg">
        <span class="text-lg">QR</span> {{ formatNumber(summary.total_unsettled_amount) }}
      </h2>
      <p class="text-indigo-200 text-sm font-bold relative z-10">From {{ summary.unsettled.length }} collection(s)</p>
      
      <div v-if="summary.total_collected_today > 0" class="mt-4 pt-4 border-t border-white/10 relative z-10 flex justify-between items-center">
        <span class="text-indigo-100 text-[10px] font-bold uppercase tracking-wider">Total Collected Today</span>
        <span class="text-white font-black text-sm">QR {{ formatNumber(summary.total_collected_today) }}</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-24 bg-slate-800/40 rounded-2xl animate-pulse"></div>
    </div>

    <!-- 1. Collections to Settle (Actionable) -->
    <div v-else-if="summary && summary.unsettled.length > 0" class="mb-12">
      <div class="flex justify-between items-center mb-5 px-2">
        <h3 class="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Ready to Settle</h3>
        <span class="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/20">ACTION NEEDED</span>
      </div>
      
      <div class="space-y-4 mb-8">
        <div 
          v-for="item in summary.unsettled" 
          :key="'unsettled-'+item.id" 
          class="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 p-4 rounded-2xl flex justify-between items-center shadow-sm backdrop-blur transition-colors duration-300"
        >
          <div class="min-w-0 flex-1 pr-4">
            <p class="text-[13px] font-black text-slate-900 dark:text-white truncate">{{ item.company }}</p>
            <p class="text-[10px] text-slate-500 dark:text-slate-500 font-medium mt-1">{{ item.time }} • {{ item.method }}</p>
          </div>
          <p class="text-teal-600 dark:text-teal-400 font-black text-base tabular-nums">{{ formatNumber(item.amount) }}</p>
        </div>
      </div>

      <!-- Remarks & Submit -->
      <div class="space-y-4">
        <textarea 
          v-model="remarks"
          rows="2" 
          placeholder="Add settlement notes..." 
          class="w-full bg-white dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white font-bold rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500/50 transition-all px-5 py-4 shadow-sm placeholder-slate-400 dark:placeholder-slate-600 outline-none block text-sm"
        ></textarea>
        
        <button 
          @click="submitSettlement"
          :disabled="submitting"
          class="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-black text-lg py-4-5 rounded-2xl shadow-[0_15px_30px_rgba(79,70,229,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
        >
          <svg v-if="submitting" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          {{ submitting ? 'Submitting...' : 'Submit Settlement' }}
        </button>
      </div>
    </div>

    <!-- 2. Today's Collection History -->
    <div v-if="summary && summary.history.length > 0" class="mb-10">
      <div class="flex justify-between items-center mb-5 px-2">
        <h3 class="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Collection History Today</h3>
        <span class="text-[10px] font-bold text-slate-500 dark:text-slate-500 bg-slate-500/5 dark:bg-slate-500/10 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-500/20">HISTORICAL</span>
      </div>

      <div class="space-y-3">
        <div 
          v-for="item in summary.history" 
          :key="'hist-'+item.id" 
          class="bg-white dark:bg-slate-800/20 border border-slate-100 dark:border-slate-700/30 p-4 rounded-2xl flex justify-between items-center group transition-all shadow-sm dark:shadow-none"
          :class="{'opacity-60': item.is_settled}"
        >
          <div class="min-w-0 flex-1 pr-4">
            <div class="flex items-center gap-2">
              <p class="text-[12px] font-bold text-slate-900 dark:text-white truncate">{{ item.company }}</p>
              <span v-if="item.is_settled" class="text-[8px] font-black bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 px-1 rounded uppercase">SETTLED</span>
              <span v-else-if="item.is_pending" class="text-[8px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-1 rounded uppercase">PENDING</span>
            </div>
            <p class="text-[9px] text-slate-500 dark:text-slate-500 mt-0.5 font-bold">{{ item.time }} • {{ item.method }}</p>
          </div>
          <p class="font-black text-sm tabular-nums" :class="item.is_settled ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'">
            {{ formatNumber(item.amount) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && summary.history.length === 0" class="flex flex-col items-center justify-center py-20 text-center opacity-60">
      <div class="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-700">
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </div>
      <p class="text-sm font-black text-slate-500 uppercase tracking-widest">No collections yet today</p>
    </div>

    <!-- Success Overlay -->
    <transition name="fade">
      <div v-if="success" class="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 dark:bg-slate-900/95 backdrop-blur p-6 text-center">
        <div class="space-y-6">
          <div class="w-24 h-24 bg-teal-500/10 dark:bg-teal-500/20 rounded-full flex items-center justify-center mx-auto border border-teal-500/20 dark:border-teal-500/30 animate-bounce">
            <svg class="w-12 h-12 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <div>
            <h3 class="text-2xl font-black text-slate-900 dark:text-white">Settlement Requested</h3>
            <p class="text-slate-500 dark:text-slate-400 text-sm mt-2">Request sent to back office for confirmation.</p>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const loading = ref(true);
const submitting = ref(false);
const summary = ref(null);
const remarks = ref('');
const success = ref(false);

const fetchSummary = async () => {
  try {
    const { data } = await api.get('/settlements/summary');
    summary.value = data;
  } catch (err) {
    console.error('Failed to load settlement summary', err);
  } finally {
    loading.value = false;
  }
};

const formatNumber = (num) => {
  return parseFloat(num || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const submitSettlement = async () => {
  if (!summary.value || summary.value.unsettled.length === 0) return;
  
  submitting.value = true;
  try {
    const paymentIds = summary.value.unsettled.map(p => p.id);
    await api.post('/settlements', {
      contract_payment_ids: paymentIds,
      notes: remarks.value
    });
    
    success.value = true;
    setTimeout(() => {
      success.value = false;
      remarks.value = '';
      fetchSummary();
    }, 2000);
  } catch (err) {
    alert('Failed to submit settlement request. Please try again.');
  } finally {
    submitting.value = false;
  }
};

onMounted(fetchSummary);
</script>

<style scoped>
.py-4-5 { padding-top: 1.125rem; padding-bottom: 1.125rem; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>