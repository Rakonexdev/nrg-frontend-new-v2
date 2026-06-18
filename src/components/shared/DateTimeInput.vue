<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label v-if="label" class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
      <template v-if="label.includes('*')">
        {{ label.replace('*', '') }}<span class="text-rose-500 font-black">*</span>
      </template>
      <template v-else>
        {{ label }}
      </template>
    </label>
    <div class="relative group">
      <!-- Visible text input for formatted display and manual typing -->
      <input
        type="text"
        :value="displayValue"
        @input="onTextInput"
        :placeholder="placeholder || 'DD/MM/YYYY hh:mm AM'"
        :disabled="disabled"
        :required="required"
        class="w-full pl-4 pr-12 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#29166e]/20 transition-all dark:text-white font-bold disabled:opacity-75 disabled:cursor-not-allowed text-sm uppercase"
        :class="{ 'border-red-500 ring-4 ring-red-500/10': error }"
      />
      
      <!-- Hidden native datetime-local input triggered by the calendar icon -->
      <div class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6">
        <input
          type="datetime-local"
          :value="normalizedDateTime"
          @input="onNativeInput"
          :disabled="disabled"
          :required="required"
          class="absolute inset-0 opacity-0 cursor-pointer z-20 w-full h-full"
          style="color-scheme: light dark;"
        />
        <div class="text-slate-400 group-focus-within:text-[#29166e] transition-colors z-10">
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
  modelValue: String, // YYYY-MM-DDTHH:mm
  label: String,
  placeholder: String,
  error: String,
  disabled: Boolean,
  required: Boolean
});

const emit = defineEmits(['update:modelValue']);
const nativeDateInput = ref(null);

// Display value in DD/MM/YYYY HH:MM
const displayValue = computed(() => {
  if (!props.modelValue) return '';
  
  let datePart = '';
  let timePart = '';
  
  if (props.modelValue.includes('T')) {
      const parts = props.modelValue.split('T');
      datePart = parts[0];
      timePart = parts[1].substring(0, 5);
  } else if (props.modelValue.includes(' ')) {
      const parts = props.modelValue.split(' ');
      datePart = parts[0];
      timePart = parts[1].substring(0, 5);
  } else {
      datePart = props.modelValue;
  }
  
  const dParts = datePart.split('-');
  if (dParts.length !== 3) return props.modelValue;
  
  if (timePart) {
      let [hh, mm] = timePart.split(':');
      let hour = parseInt(hh, 10);
      let ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12;
      if (hour === 0) hour = 12;
      let hourStr = hour.toString().padStart(2, '0');
      
      return `${dParts[2]}/${dParts[1]}/${dParts[0]} ${hourStr}:${mm} ${ampm}`;
  }
  return `${dParts[2]}/${dParts[1]}/${dParts[0]}`;
});

const normalizedDateTime = computed(() => {
  if (!props.modelValue) return '';
  let dt = props.modelValue;
  if (dt.includes('Z')) dt = dt.split('Z')[0];
  if (dt.includes('.')) dt = dt.split('.')[0];
  if (dt.includes(' ')) dt = dt.replace(' ', 'T');
  if (dt.length > 16) {
      dt = dt.substring(0, 16);
  }
  return dt;
});

const onNativeInput = (e) => {
  emit('update:modelValue', e.target.value);
};

const onTextInput = (e) => {
  let raw = e.target.value;
  let val = '';
  for (let i = 0; i < raw.length; i++) {
     let c = raw[i].toUpperCase();
     if (val.length < 12) {
         if (/[0-9]/.test(c)) val += c;
     } else if (val.length === 12) {
         if (c === 'A' || c === 'P') val += c;
     }
  }
  
  let formatted = val;
  if (val.length > 2) formatted = val.slice(0, 2) + '/' + val.slice(2);
  if (val.length > 4) formatted = formatted.slice(0, 5) + '/' + formatted.slice(5);
  if (val.length > 8) formatted = formatted.slice(0, 10) + ' ' + formatted.slice(10);
  if (val.length > 10) formatted = formatted.slice(0, 13) + ':' + formatted.slice(13);
  if (val.length > 12) formatted = formatted.slice(0, 16) + ' ' + formatted.slice(16) + 'M';
  
  e.target.value = formatted;

  if (val.length === 13) {
    const d = val.slice(0, 2);
    const m = val.slice(2, 4);
    const y = val.slice(4, 8);
    let hh = parseInt(val.slice(8, 10), 10);
    const mm = val.slice(10, 12);
    const ampm = val.slice(12, 13);
    
    if (hh === 12) {
        hh = ampm === 'A' ? 0 : 12;
    } else {
        if (ampm === 'P') hh += 12;
    }
    
    const hhStr = hh.toString().padStart(2, '0');
    const dateStr = `${y}-${m}-${d}T${hhStr}:${mm}`;
    
    if (!isNaN(Date.parse(`${y}-${m}-${d}T${hhStr}:${mm}`))) {
        emit('update:modelValue', dateStr);
    }
  } else if (val.length === 0) {
    emit('update:modelValue', '');
  }
};
</script>
