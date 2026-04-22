<template>
  <div class="px-6 py-6 pb-32">
    <div class="mb-8">
      <button @click="$router.back()" class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 text-sm font-bold mb-4 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Back
      </button>
      <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Record Collection</h1>
      <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">MegaCorp Industries - INV-9042</p>
    </div>

    <form @submit.prevent="submitCollection" class="space-y-6">
      <!-- Amount -->
      <div class="relative group">
        <label class="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 pl-1 transition-colors group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400">Amount Collected (QAR)</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <span class="text-slate-400 dark:text-slate-500 font-bold">QR</span>
          </div>
          <input type="number" placeholder="0.00" class="w-full bg-white dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white text-2xl font-black rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all py-4 pl-14 pr-4 shadow-sm dark:shadow-inner placeholder-slate-300 dark:placeholder-slate-600 outline-none block" />
        </div>
      </div>

      <!-- Payment Channel -->
      <div class="relative group">
        <label class="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 pl-1 transition-colors group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400">Payment Channel</label>
        <div class="grid grid-cols-3 gap-3">
          <button type="button" @click="channel = 'cash'" :class="channel === 'cash' ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg' : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/50 text-slate-400 dark:text-slate-500'" class="border-2 rounded-2xl py-4 flex flex-col items-center gap-2 transition-all duration-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            <span class="text-[10px] font-black uppercase">Cash</span>
          </button>
          <button type="button" @click="channel = 'bank_transfer'" :class="channel === 'bank_transfer' ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg' : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/50 text-slate-400 dark:text-slate-500'" class="border-2 rounded-2xl py-4 flex flex-col items-center gap-2 transition-all duration-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            <span class="text-[10px] font-black uppercase">Bank TX</span>
          </button>
          <button type="button" @click="channel = 'mobile_pay'" :class="channel === 'mobile_pay' ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg' : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/50 text-slate-400 dark:text-slate-500'" class="border-2 rounded-2xl py-4 flex flex-col items-center gap-2 transition-all duration-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
            <span class="text-[10px] font-black uppercase">Mobile</span>
          </button>
        </div>
      </div>

      <!-- Next Due Date -->
      <div class="relative group">
        <label class="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 pl-1 transition-colors group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400">Follow-up Date (if partial)</label>
        <input type="date" class="w-full bg-white dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all px-4 py-3 shadow-sm dark:shadow-inner placeholder-slate-300 dark:placeholder-slate-600 outline-none block" />
      </div>

      <!-- Notes -->
      <div class="relative group">
        <label class="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 pl-1 transition-colors group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400">Notes / Remarks</label>
        <textarea rows="3" placeholder="Optional notes here..." class="w-full bg-white dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all px-4 py-3 shadow-sm dark:shadow-inner placeholder-slate-300 dark:placeholder-slate-600 outline-none block"></textarea>
      </div>

      <!-- Submit -->
      <button @click="$router.push('/collector/acknowledgement')" type="button" class="w-full bg-gradient-to-r from-teal-400 to-indigo-500 text-white font-bold text-lg py-4 rounded-2xl shadow-[0_10px_30px_rgba(45,212,191,0.3)] hover:shadow-[0_10px_40px_rgba(45,212,191,0.5)] transform hover:-translate-y-1 transition-all active:scale-95 flex justify-center items-center gap-2">
        <span>Confirm Collection</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const channel = ref('cash');
</script>