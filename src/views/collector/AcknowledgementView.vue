<template>
  <div class="px-6 py-12 flex flex-col items-center justify-center min-h-[80vh] text-center">
    
    <div class="relative w-32 h-32 mb-8 animate-[bounce_2s_infinite]">
      <div class="absolute inset-0 bg-teal-400/20 rounded-full blur-2xl"></div>
      <div class="relative w-full h-full bg-gradient-to-tr from-teal-400 to-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(52,211,153,0.5)]">
        <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
      </div>
    </div>

    <h1 class="text-3xl font-black tracking-tight text-white mb-2">Collection Saved!</h1>
    <p class="text-slate-400 text-sm mb-10">Receipt has been recorded securely in the system.</p>

    <div class="w-full bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-3xl p-6 shadow-xl mb-10 text-left space-y-4">
      <div class="flex justify-between items-center border-b border-slate-700/50 pb-4">
        <span class="text-slate-400 text-xs font-bold uppercase tracking-wider">Amount Paid</span>
        <span class="text-2xl font-black text-teal-400">QR 4,200</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-slate-400 text-xs font-bold uppercase tracking-wider">Company</span>
        <span class="text-sm font-bold text-white">MegaCorp Industries</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-slate-400 text-xs font-bold uppercase tracking-wider">Method</span>
        <span class="text-sm font-bold text-white">Cash</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-slate-400 text-xs font-bold uppercase tracking-wider">Ref ID</span>
        <span class="text-xs font-mono text-indigo-300 bg-indigo-500/20 px-2 py-1 rounded">TRX-098231</span>
      </div>
    </div>

    <div class="w-full space-y-4">
      <button @click="shareReceipt" class="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
        Share Receipt Config
      </button>

      <router-link to="/collector" class="w-full block font-bold text-indigo-400 hover:text-indigo-300 py-4 transition-colors">
        Return to Home
      </router-link>
    </div>

  </div>
</template>

<script setup>
import { useShare } from '@vueuse/core';

const { share, isSupported } = useShare();

const shareReceipt = () => {
  if (isSupported.value) {
    share({
      title: 'Collection Receipt - NRG',
      text: 'MegaCorp Industries - Amount Paid: QR 4,200 via Cash.',
      url: location.href,
    });
  } else {
    alert('Web Share API not supported on this device.');
  }
};
</script>