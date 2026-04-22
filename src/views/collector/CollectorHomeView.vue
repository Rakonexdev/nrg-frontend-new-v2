<template>
  <div class="px-4 py-6 space-y-6">

    <!-- Header Greeting -->
    <div class="px-2">
      <p class="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-widest font-black">Collector Dashboard</p>
      <h2 class="text-2xl font-black text-slate-900 dark:text-white mt-1">Outstanding Payments</h2>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ pendingClients.length }} client(s) with pending amounts</p>
    </div>

    <!-- KPI Strip -->
    <div class="grid grid-cols-2 gap-3">
      <div class="bg-white dark:bg-gradient-to-br dark:from-rose-500/20 dark:to-orange-500/10 border border-rose-500/20 dark:border-rose-500/30 rounded-2xl p-4 relative overflow-hidden shadow-sm dark:shadow-none transition-colors duration-300">
        <div class="absolute -right-3 -top-3 w-12 h-12 bg-rose-500/10 dark:bg-rose-500/20 rounded-full blur-xl"></div>
        <p class="text-rose-600 dark:text-rose-300 text-[10px] font-bold tracking-wider uppercase mb-2">Total Outstanding</p>
        <p class="text-xl font-black text-slate-900 dark:text-white">{{ formatCurrency(totalPending) }}</p>
        <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">QAR</p>
      </div>
      <div class="bg-white dark:bg-gradient-to-br dark:from-indigo-500/20 dark:to-purple-500/10 border border-indigo-500/20 dark:border-indigo-500/30 rounded-2xl p-4 relative overflow-hidden shadow-sm dark:shadow-none transition-colors duration-300">
        <div class="absolute -right-3 -top-3 w-12 h-12 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-xl"></div>
        <p class="text-indigo-600 dark:text-indigo-300 text-[10px] font-bold tracking-wider uppercase mb-2">Pending Contracts</p>
        <p class="text-xl font-black text-slate-900 dark:text-white">{{ totalContracts }}</p>
        <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">contracts</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="bg-slate-800/50 rounded-2xl p-4 animate-pulse h-24"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="pendingClients.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
      <div class="w-20 h-20 bg-teal-500/10 rounded-full flex items-center justify-center mb-4 border border-teal-500/20">
        <svg class="w-10 h-10 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
        </svg>
      </div>
      <h3 class="text-lg font-bold text-slate-300">All Settled!</h3>
      <p class="text-sm text-slate-500 mt-1">No outstanding payments at this time.</p>
    </div>

    <!-- Client Cards -->
    <div v-else class="space-y-4">
      <div
        v-for="client in pendingClients"
        :key="client.company_id"
        class="bg-white dark:bg-slate-800/60 border rounded-2xl overflow-hidden shadow-sm dark:shadow-lg dark:backdrop-blur transition-all duration-300"
        :class="expandedId === client.company_id ? 'border-teal-500/40 shadow-teal-500/10 ring-1 ring-teal-500/20' : 'border-slate-200 dark:border-slate-700/50'"
      >
        <!-- Summary Row -->
        <button
          @click="toggleExpand(client.company_id)"
          class="w-full p-4 flex items-center justify-between gap-3 text-left"
        >
          <div class="flex items-center gap-3 min-w-0">
            <!-- Avatar -->
            <div class="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-lg shadow-sm"
                 :class="getAvatarClass(client.company_id)">
              {{ getInitials(client.company_name) }}
            </div>
            <div class="min-w-0">
              <h3 class="text-sm font-black text-slate-900 dark:text-white truncate">{{ client.company_name }}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ client.contact_person || 'No contact listed' }}</p>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{{ client.contracts.length }} contract(s)</p>
            </div>
          </div>
          <div class="text-right flex-shrink-0 flex flex-col items-end gap-1">
            <p class="text-base font-black text-slate-900 dark:text-white">{{ formatCurrency(client.total_pending) }}</p>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">QAR pending</p>
            <svg class="w-4 h-4 text-slate-400 transition-transform duration-300"
                 :class="expandedId === client.company_id ? 'rotate-180' : ''"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </button>

        <!-- Contact Strip -->
        <div v-if="client.phone_number" class="px-4 pb-3 flex items-center gap-2">
          <a :href="`tel:${client.phone_number}`"
             class="flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-400 text-xs font-bold hover:bg-teal-500/20 transition-colors active:scale-95">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            {{ client.phone_number }}
          </a>
        </div>

        <!-- Expanded Contract Details -->
        <transition name="slide-down">
          <div v-if="expandedId === client.company_id" class="border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-transparent">
            <div class="divide-y divide-slate-100 dark:divide-slate-700/30">
              <div
                v-for="contract in client.contracts"
                :key="contract.contract_id"
                class="p-4 space-y-3"
              >
                <!-- Staff Header -->
                <div class="flex justify-between items-start">
                  <div>
                    <p class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ contract.staff_name }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">{{ contract.profession || 'Staff Member' }}</p>
                    <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5" v-if="contract.start_date">
                      {{ formatDate(contract.start_date) }} – {{ formatDate(contract.end_date) }}
                    </p>
                  </div>
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-sm"
                        :class="contract.payment_status === 'Partially Paid'
                          ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                          : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'">
                    {{ contract.payment_status === 'Partially Paid' ? 'PARTIAL' : 'NOT STARTED' }}
                  </span>
                </div>

                <!-- Amount Progress -->
                <div class="space-y-1.5">
                  <div class="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Paid: <span class="text-green-600 dark:text-green-400 font-bold">QAR {{ formatCurrency(contract.paid_amount) }}</span></span>
                    <span>Pending: <span class="text-rose-600 dark:text-rose-400 font-bold">QAR {{ formatCurrency(contract.pending_amount) }}</span></span>
                  </div>
                  <div class="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full transition-all duration-500"
                         :style="{ width: getProgressWidth(contract) + '%' }"></div>
                  </div>
                  <p class="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Total: QAR {{ formatCurrency(contract.total_income) }}</p>
                </div>

                <!-- Action buttons -->
                <div class="flex gap-2 pt-1">
                  <a v-if="contract.staff_mobile"
                     :href="`tel:${contract.staff_mobile}`"
                     class="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600/50 rounded-xl text-slate-600 dark:text-slate-300 text-xs font-bold shadow-sm hover:bg-slate-50 transition-colors active:scale-95">
                    <svg class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    Call Staff
                  </a>
                  <button
                    @click="openRecordModal(client, contract)"
                    class="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-teal-500 to-indigo-500 rounded-xl text-white text-xs font-black shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all active:scale-95">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    Record Collection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- ====== Record Collection Modal ====== -->
    <transition name="modal-fade">
      <div v-if="showModal" class="fixed inset-0 z-[100] flex items-end justify-center" @click.self="closeModal">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

        <!-- Sheet -->
        <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-700 p-6 pb-10 z-10 space-y-5 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-2xl transition-colors duration-300">

          <!-- Handle -->
          <div class="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto -mt-1 mb-2"></div>

          <div>
            <h3 class="text-lg font-black text-slate-900 dark:text-white">Record Collection</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span class="text-teal-600 dark:text-teal-400 font-bold">{{ modalData.company_name }}</span> — {{ modalData.staff_name }}
            </p>
          </div>

          <!-- Balance info -->
          <div class="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 flex justify-between border border-slate-100 dark:border-slate-700/50 shadow-sm dark:shadow-none transition-colors duration-300">
            <div>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Total Income</p>
              <p class="text-sm font-black text-slate-900 dark:text-white mt-1">QAR {{ formatCurrency(modalData.total_income) }}</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Max Collectable</p>
              <p class="text-sm font-black text-rose-600 dark:text-rose-400 mt-1">QAR {{ formatCurrency(modalData.pending_amount) }}</p>
            </div>
          </div>

          <!-- Error -->
          <div v-if="modalError" class="flex items-center gap-2 px-4 py-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-bold">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ modalError }}
          </div>

          <!-- Form -->
          <div class="space-y-4">
            <!-- Amount -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Amount Collected (QAR)</label>
              <input
                v-model.number="form.amount"
                type="number"
                min="1"
                :max="modalData.pending_amount"
                placeholder="0.00"
                class="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold text-lg focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none transition-all"
              />
            </div>

            <!-- Payment Date -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Payment Date</label>
              <input
                v-model="form.payment_date"
                type="date"
                class="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none transition-all"
              />
            </div>

            <!-- Payment Method -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Payment Method</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  @click="form.payment_method = 'Cash'"
                  class="py-3 rounded-xl text-sm font-bold border transition-all shadow-sm"
                  :class="form.payment_method === 'Cash'
                    ? 'bg-teal-500/10 dark:bg-teal-500/20 border-teal-500 text-teal-700 dark:text-teal-300 shadow-teal-500/10'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500'"
                >
                  💵 Cash
                </button>
                <button
                  type="button"
                  @click="form.payment_method = 'Online'"
                  class="py-3 rounded-xl text-sm font-bold border transition-all shadow-sm"
                  :class="form.payment_method === 'Online'
                    ? 'bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-indigo-500/10'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500'"
                >
                  🏦 Online
                </button>
              </div>
            </div>

            <!-- Notes -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Notes (optional)</label>
              <input
                v-model="form.notes"
                type="text"
                placeholder="e.g. Cash collected at site"
                class="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none transition-all"
              />
            </div>
          </div>

          <!-- Submit -->
          <button
            @click="submitCollection"
            :disabled="submitting"
            class="w-full py-4 bg-gradient-to-r from-teal-500 to-indigo-500 rounded-2xl text-white font-black text-base shadow-xl shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg v-if="submitting" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ submitting ? 'Submitting...' : 'Confirm Collection' }}
          </button>
        </div>
      </div>
    </transition>

    <!-- ====== Success Overlay ====== -->
    <transition name="modal-fade">
      <div v-if="showSuccess" class="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div class="text-center px-8">
          <div class="w-24 h-24 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-teal-500/30 animate-bounce">
            <svg class="w-12 h-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h3 class="text-2xl font-black text-white">Collection Recorded!</h3>
          <p class="text-slate-400 text-sm mt-2">QAR {{ formatCurrency(lastCollectedAmount) }} recorded successfully.</p>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { collectorService } from '@/services/api';

// ── State ──────────────────────────────────────────────────────────────────
const loading = ref(true);
const pendingClients = ref([]);
const expandedId = ref(null);

const showModal = ref(false);
const showSuccess = ref(false);
const submitting = ref(false);
const modalError = ref('');
const lastCollectedAmount = ref(0);

const modalData = ref({
  company_name: '',
  staff_name: '',
  contract_id: null,
  total_income: 0,
  pending_amount: 0,
});

const form = ref({
  amount: '',
  payment_date: new Date().toISOString().slice(0, 10),
  payment_method: 'Cash',
  notes: '',
});

// ── Computed ───────────────────────────────────────────────────────────────
const totalPending = computed(() =>
  pendingClients.value.reduce((s, c) => s + c.total_pending, 0)
);
const totalContracts = computed(() =>
  pendingClients.value.reduce((s, c) => s + c.contracts.length, 0)
);

// ── Fetch ──────────────────────────────────────────────────────────────────
const fetchPendingCollections = async () => {
  loading.value = true;
  try {
    const { data } = await collectorService.getPendingCollections();
    pendingClients.value = data;
  } catch (e) {
    console.error('Failed to load pending collections', e);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchPendingCollections);

// ── UI Helpers ─────────────────────────────────────────────────────────────
const toggleExpand = (id) => {
  expandedId.value = expandedId.value === id ? null : id;
};

const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
};

const avatarClasses = [
  'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30',
  'bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30',
  'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30',
  'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30',
  'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30',
];
const getAvatarClass = (id) => avatarClasses[id % avatarClasses.length];

const formatCurrency = (val) => {
  const n = parseFloat(val) || 0;
  return n.toLocaleString('en-QA', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getProgressWidth = (contract) => {
  const total = parseFloat(contract.total_income) || 0;
  const paid = parseFloat(contract.paid_amount) || 0;
  if (total <= 0) return 0;
  return Math.min((paid / total) * 100, 100).toFixed(1);
};

// ── Modal ──────────────────────────────────────────────────────────────────
const openRecordModal = (client, contract) => {
  modalData.value = {
    company_name: client.company_name,
    staff_name: contract.staff_name,
    contract_id: contract.contract_id,
    total_income: contract.total_income,
    pending_amount: contract.pending_amount,
  };
  form.value = {
    amount: '',
    payment_date: new Date().toISOString().slice(0, 10),
    payment_method: 'Cash',
    notes: '',
  };
  modalError.value = '';
  showModal.value = true;
};

const closeModal = () => {
  if (!submitting.value) showModal.value = false;
};

const submitCollection = async () => {
  modalError.value = '';
  const amount = parseFloat(form.value.amount);

  if (!amount || amount <= 0) {
    modalError.value = 'Please enter a valid amount greater than 0.';
    return;
  }
  if (amount > modalData.value.pending_amount) {
    modalError.value = `Amount cannot exceed the pending balance of QAR ${formatCurrency(modalData.value.pending_amount)}.`;
    return;
  }
  if (!form.value.payment_date) {
    modalError.value = 'Please select a payment date.';
    return;
  }
  if (!form.value.payment_method) {
    modalError.value = 'Please select a payment method.';
    return;
  }

  submitting.value = true;
  try {
    await collectorService.recordPayment(modalData.value.contract_id, {
      amount,
      payment_date: form.value.payment_date,
      payment_method: form.value.payment_method,
      notes: form.value.notes || null,
    });

    lastCollectedAmount.value = amount;
    showModal.value = false;
    showSuccess.value = true;

    // Refresh list data in background
    await fetchPendingCollections();

    setTimeout(() => { showSuccess.value = false; }, 2500);
  } catch (err) {
    const msg = err.response?.data?.message || err.response?.data?.errors?.amount?.[0];
    modalError.value = msg || 'Failed to record collection. Please try again.';
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
/* slide-down for contract details */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 600px;
  opacity: 1;
}

/* modal fade */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>