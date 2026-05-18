<template>
  <div class="relative w-full" ref="containerRef">
    <label v-if="label" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
      <template v-if="label.includes('*')">
        {{ label.replace('*', '') }}<span class="text-rose-500 font-black">*</span>
      </template>
      <template v-else>
        {{ label }}
      </template>
    </label>
    
    <div 
      @click="toggleDropdown"
      class="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all cursor-pointer flex items-center justify-between"
      :class="{ 
        'opacity-50 cursor-not-allowed': disabled, 
        'border-blue-500 ring-2 ring-blue-500/20': isOpen,
        'border-rose-500 ring-4 ring-rose-500/10': error 
      }"
    >
      <span class="break-words whitespace-normal pr-2 dark:text-white font-medium" :class="{ 'text-slate-400': !selectedOption }">
        {{ selectedOption ? selectedOption.name : placeholder }}
      </span>
      <svg class="w-4 h-4 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <p v-if="error" class="mt-1.5 ml-1 text-[10px] font-black text-rose-500 uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
      {{ error }}
    </p>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div 
        v-if="isOpen"
        class="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden"
      >
        <div class="p-2 border-b border-slate-100 dark:border-slate-700">
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              ref="searchInputRef"
              v-model="search"
              type="text"
              placeholder="Search..."
              class="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white"
              @click.stop
            >
          </div>
        </div>
        
        <div class="max-h-60 overflow-y-auto custom-scrollbar">
          <div 
            v-if="filteredOptions.length === 0"
            class="px-4 py-8 text-center text-slate-500 dark:text-slate-400 text-sm italic"
          >
            No results found
          </div>
          
          <button
             v-for="option in filteredOptions"
             :key="option.id"
             type="button"
             class="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-between group"
             :class="{ 'bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 font-bold': modelValue == option.id, 'text-slate-700 dark:text-slate-300': modelValue != option.id }"
             @click="selectOption(option)"
           >
             <div class="flex-1 min-w-0">
               <slot name="option" :option="option">
                 <span class="break-words whitespace-normal block">{{ option.name }}</span>
               </slot>
             </div>
             <svg 
               v-if="modelValue == option.id" 
               class="w-4 h-4 text-blue-500" 
               fill="none" 
               stroke="currentColor" 
               viewBox="0 0 24 24"
             >
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
             </svg>
           </button>

           <button
             v-if="allowCustom && search && !filteredOptions.some(opt => opt.name.toLowerCase() === search.toLowerCase())"
             type="button"
             class="w-full px-4 py-3 text-left text-sm border-t border-slate-100 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors flex items-center gap-2 group"
             @click="selectCustom"
           >
             <div class="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
             </div>
             <div class="flex flex-col">
               <span class="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Add New</span>
               <span class="text-slate-600 dark:text-slate-300 font-medium font-mono text-[10px] break-all">"{{ search }}"</span>
             </div>
           </button>
         </div>
       </div>
     </Transition>
   </div>
 </template>
 
 <script setup>
 import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
 
 const props = defineProps({
   modelValue: [String, Number],
   options: {
     type: Array,
     default: () => []
   },
   placeholder: {
     type: String,
     default: 'Select an option'
   },
   label: String,
   disabled: Boolean,
   allowClear: {
     type: Boolean,
     default: false
   },
   allowCustom: {
     type: Boolean,
     default: false
   },
   error: String
 });
 
 const emit = defineEmits(['update:modelValue', 'change', 'custom-select']);
 
 const isOpen = ref(false);
 const search = ref('');
 const containerRef = ref(null);
 const searchInputRef = ref(null);
 
 const selectedOption = computed(() => {
   return props.options.find(opt => opt.id == props.modelValue) || (props.allowCustom && props.modelValue ? { id: props.modelValue, name: props.modelValue } : null);
 });
 
 const filteredOptions = computed(() => {
   let results = props.options;
   if (search.value) {
     const q = search.value.toLowerCase();
     results = results.filter(opt => {
        const nameMatch = opt.name?.toLowerCase().includes(q);
        const qidMatch = opt.qid_number?.toString().toLowerCase().includes(q);
        const mobileMatch = opt.mobile?.toString().toLowerCase().includes(q);
        const companyMatch = opt.company_name?.toLowerCase().includes(q);
        return nameMatch || qidMatch || mobileMatch || companyMatch;
     });
   }
   // Limit to 100 results to maintain performance with 2000+ items
   return results.slice(0, 100);
 });
 
 const toggleDropdown = () => {
   if (props.disabled) return;
   isOpen.value = !isOpen.value;
   if (isOpen.value) {
     search.value = '';
     nextTick(() => {
       searchInputRef.value?.focus();
     });
   }
 };
 
 const selectOption = (option) => {
   emit('update:modelValue', option.id);
   emit('change', option.id);
   isOpen.value = false;
 };
 
 const selectCustom = () => {
   emit('update:modelValue', search.value);
   emit('change', search.value);
   emit('custom-select', search.value);
   isOpen.value = false;
 };
 
 const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Watch for external changes to clear search
watch(isOpen, (val) => {
  if (!val) search.value = '';
});
 </script>
 
 <style scoped>
 .custom-scrollbar::-webkit-scrollbar {
   width: 4px;
 }
 .custom-scrollbar::-webkit-scrollbar-track {
   background: transparent;
 }
 .custom-scrollbar::-webkit-scrollbar-thumb {
   background: #e2e8f0;
   border-radius: 10px;
 }
 .dark .custom-scrollbar::-webkit-scrollbar-thumb {
   background: #334155;
 }
 </style>
