<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
      {{ label }}
    </label>
    <div class="relative group">
      <!-- Visible text input for formatted display and manual typing -->
      <input
        type="text"
        :value="displayValue"
        @input="onTextInput"
        :placeholder="placeholder || 'DD/MM/YYYY'"
        :disabled="disabled"
        class="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white font-medium disabled:opacity-75 disabled:cursor-not-allowed text-sm"
        :class="{ 'border-red-500 ring-4 ring-red-500/10': error }"
      />
      
      <!-- Hidden native date input triggered by the calendar icon -->
      <div class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6">
        <input
          type="date"
          :value="modelValue"
          @input="onNativeInput"
          :disabled="disabled"
          class="absolute inset-0 opacity-0 cursor-pointer z-20 w-full h-full"
          style="color-scheme: dark;"
        />
        <div class="text-slate-400 group-focus-within:text-blue-500 transition-colors z-10">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </div>
      </div>
    </div>
    <p v-if="error" class="mt-1 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  modelValue: String, // YYYY-MM-DD
  label: String,
  placeholder: String,
  error: String,
  disabled: Boolean
});

const emit = defineEmits(['update:modelValue']);
const nativeDateInput = ref(null);

// Display value in DD/MM/YYYY
const displayValue = computed(() => {
  if (!props.modelValue) return '';
  const parts = props.modelValue.split('-');
  if (parts.length !== 3) return props.modelValue;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
});

const onNativeInput = (e) => {
  emit('update:modelValue', e.target.value);
};

const onTextInput = (e) => {
  let val = e.target.value.replace(/\D/g, '');
  if (val.length > 8) val = val.slice(0, 8);
  
  let formatted = val;
  if (val.length > 2) formatted = val.slice(0, 2) + '/' + val.slice(2);
  if (val.length > 4) formatted = formatted.slice(0, 5) + '/' + formatted.slice(5);
  
  e.target.value = formatted;

  if (val.length === 8) {
    const d = val.slice(0, 2);
    const m = val.slice(2, 4);
    const y = val.slice(4, 8);
    // Basic validation check before emitting
    const dateStr = `${y}-${m}-${d}`;
    if (!isNaN(Date.parse(dateStr))) {
        emit('update:modelValue', dateStr);
    }
  } else if (val.length === 0) {
    emit('update:modelValue', '');
  }
};
</script>
