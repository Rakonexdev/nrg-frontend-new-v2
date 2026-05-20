<template>
  <div class="h-full bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
    <div class="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <div v-html="icon" class="w-32 h-32 text-[#29166e]"></div>
    </div>
    <div class="flex items-center gap-4 relative z-10">
      <div :class="[colorClass, 'p-3 rounded-xl text-white shadow-lg']" v-html="icon"></div>
      <div>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400 capitalize">{{ title }}</p>
        <p class="text-xl font-bold text-slate-800 dark:text-white mt-1">{{ value }}</p>
      </div>
    </div>
    <div v-if="trend" class="mt-4 flex items-center gap-1 text-xs font-semibold relative z-10">
      <span :class="trend > 0 ? 'text-green-500' : 'text-red-500'">
        {{ trend > 0 ? '↑' : '↓' }} {{ Math.abs(trend) }}%
      </span>
      <span class="text-slate-400">vs last period</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
  icon: String,
  colorClass: { type: String, default: 'bg-[#29166e]' },
  trend: Number
});
</script>