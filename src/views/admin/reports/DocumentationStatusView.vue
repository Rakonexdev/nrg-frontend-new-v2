<template>
  <div class="space-y-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Documentation Status Report</h1>
        <p class="text-slate-500 dark:text-slate-400 font-medium">Tracking pending renewals and document updates.</p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="fetchData" class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all">
          <svg class="w-4 h-4" :class="{'animate-spin': loading}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          Refresh Data
        </button>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pending Updates</p>
        <h3 class="text-2xl font-black text-slate-900 dark:text-white">{{ summary.total_pending }}</h3>
      </div>
      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <p class="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Currently Processing</p>
        <h3 class="text-2xl font-black text-slate-900 dark:text-white">{{ summary.processing }}</h3>
      </div>
      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <p class="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Reported Delayed</p>
        <h3 class="text-2xl font-black text-slate-900 dark:text-white">{{ summary.delayed }}</h3>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="relative flex-1 min-w-[240px] max-w-md">
        <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        <input v-model="filters.search" type="text" placeholder="Search staff, QID, phone, company or type..."
               class="w-full pl-11 pr-4 py-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
      </div>

      <!-- Status Filter -->
      <div class="space-y-0.5">
        <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Status</label>
        <select v-model="filters.status"
                class="px-4 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer appearance-none pr-8 bg-no-repeat bg-[right_0.5rem_center] bg-[length:16px]"
                style="background-image: url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2394a3b8%22 stroke-width=%222%22%3E%3Cpath d=%22M6 9l6 6 6-6%22/%3E%3C/svg%3E')">
          <option value="">All Statuses</option>
          <option value="processing">Processing</option>
          <option value="medical">Medical</option>
          <option value="fingerprints">Fingerprints</option>
          <option value="submitted">Submitted</option>
          <option value="delayed">Delayed</option>
          <option value="qid_upload">QID Upload</option>
          <option value="passport_upload">Passport Upload</option>
        </select>
      </div>

      <div v-if="filters.search || filters.status" class="flex items-center">
        <button @click="clearFilters"
                class="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <DataTable :columns="columns" :data="items" :loading="loading" :pagination="pagination" @page-change="handlePageChange">
      <template #staff_member="{ row }">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black text-slate-500">{{ row.staff_name?.[0] || '?' }}</div>
          <div class="flex flex-col">
            <span class="text-sm font-black text-slate-800 dark:text-white">{{ row.staff_name }}</span>
            <span v-if="row.staff?.company_name" class="text-[9px] font-bold text-blue-600 uppercase tracking-widest">{{ row.staff.company_name }}</span>
            <span v-if="row.staff?.branch_name" class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              {{ row.staff.branch_name }}<span v-if="row.staff.branch_number">-{{ row.staff.branch_number }}</span>
            </span>
          </div>
        </div>
      </template>
      <template #type="{ value }">
        <span class="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
          {{ value }}
        </span>
      </template>
      <template #expense_date="{ value }">
        <span class="text-xs font-bold text-slate-600 dark:text-slate-400">{{ value }}</span>
      </template>
      <template #system_status="{ row }">
        <div class="flex flex-col">
          <span class="text-[10px] font-black text-rose-500 uppercase">Current: {{ row.current_expiry }}</span>
          <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Target: {{ row.new_expiry }}</span>
        </div>
      </template>
      <template #renewal_status="{ row }">
        <div class="flex flex-col">
          <span :class="{
            'text-slate-500': row.renewal_status === 'processing',
            'text-amber-500': row.renewal_status === 'medical' || row.renewal_status === 'fingerprints',
            'text-rose-500': row.renewal_status === 'delayed',
            'text-blue-500': row.renewal_status === 'submitted' || row.renewal_status === 'qid_upload' || row.renewal_status === 'passport_upload',
            'text-emerald-500': row.renewal_status === 'completed'
          }" class="text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full" :class="{
              'bg-slate-500': row.renewal_status === 'processing',
              'bg-amber-500': row.renewal_status === 'medical' || row.renewal_status === 'fingerprints',
              'bg-rose-500': row.renewal_status === 'delayed',
              'bg-blue-500': row.renewal_status === 'submitted' || row.renewal_status === 'qid_upload' || row.renewal_status === 'passport_upload',
              'bg-emerald-500': row.renewal_status === 'completed'
            }"></span>
            {{ row.renewal_status }}
          </span>
          <p v-if="row.renewal_notes" class="text-[10px] text-slate-400 italic mt-1 max-w-[200px] leading-tight">
            "{{ row.renewal_notes }}"
          </p>
        </div>
      </template>
      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-2">
          <router-link v-if="authStore.hasPermission('staff_edit') || authStore.hasPermission('report_doc_status_edit')" :to="{ name: 'admin-staff', query: { edit: row.staff_id, search: row.staff?.name } }" class="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm" title="Update Documents">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </router-link>
          <button v-if="authStore.hasPermission('report_doc_status_edit')" @click="openTrackingModal(row)" class="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg hover:bg-blue-100 transition-all shadow-sm" title="Update Status">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Tracking Modal -->
    <Modal :show="showModal" title="Update Renewal Progress" @close="showModal = false">
      <div v-if="selectedItem" class="p-8 space-y-6">
        <div class="space-y-4">
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Process Status</label>
            <select v-model="form.renewal_status" :class="{'border-rose-500 ring-2 ring-rose-500/10': errors.renewal_status}" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none">
              <option value="processing">🔄 Initial Processing</option>
              <option value="medical">🏥 Medical Test Pending</option>
              <option value="fingerprints">☝️ Fingerprints / Biometrics</option>
              <option value="submitted">📤 Submitted to Gov</option>
              <option value="qid_upload">🪪 QID Document Upload</option>
              <option value="passport_upload">🛂 Passport Document Upload</option>
              <option value="delayed">⚠️ Delayed / Pending Requirement</option>
              <option value="completed">✅ Completed</option>
            </select>
            <p v-if="errors.renewal_status" class="text-[10px] font-bold text-rose-500 mt-1 pl-1">{{ errors.renewal_status[0] }}</p>
          </div>

          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal Notes / Progress Remarks</label>
            <textarea v-model="form.renewal_notes" rows="4" :class="{'border-rose-500 ring-2 ring-rose-500/10': errors.renewal_notes}" placeholder="Enter details about why it's taking time, missing documents, etc." class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"></textarea>
            <p v-if="errors.renewal_notes" class="text-[10px] font-bold text-rose-500 mt-1 pl-1">{{ errors.renewal_notes[0] }}</p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex items-center justify-end w-full p-6 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 gap-3">
          <button @click="showModal = false" class="px-6 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
          
          <button @click="save" :disabled="saving" class="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 disabled:opacity-50">
            {{ saving ? 'Saving...' : 'Update Progress' }}
          </button>

          <button v-if="form.renewal_status === 'completed'" @click="finalize" :disabled="finalizing" class="px-8 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/30 disabled:opacity-50 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            {{ finalizing ? 'Finalizing...' : 'Finalize & Update Staff Record' }}
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import api, { reportService } from '@/services/api';
import DataTable from '@/components/shared/DataTable.vue';
import Modal from '@/components/shared/Modal.vue';
import { useAuthStore } from '@/stores/auth';
import debounce from 'lodash/debounce';

const authStore = useAuthStore();
const loading = ref(false);
const saving = ref(false);
const finalizing = ref(false);
const errors = ref({});
const items = ref([]);
const pagination = ref({});
const summary = ref({ total_pending: 0, processing: 0, delayed: 0 });
const showModal = ref(false);
const selectedItem = ref(null);
const form = ref({
  renewal_status: 'processing',
  renewal_notes: ''
});

const filters = reactive({
  search: '',
  status: '',
  page: 1,
  per_page: 10
});

const columns = [
  { key: 'staff_member', label: 'Staff Member' },
  { key: 'type', label: 'Renewal Type' },
  { key: 'expense_date', label: 'Payment Date' },
  { key: 'system_status', label: 'System Status' },
  { key: 'renewal_status', label: 'Progress Status' },
  { key: 'actions', label: 'Actions' }
];

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await reportService.getDocumentationStatus(filters);
    items.value = res.data.data || [];
    pagination.value = res.data;
    summary.value = res.data.summary;
  } catch (err) {
    console.error('Failed to fetch documentation status', err);
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = debounce(() => {
  filters.page = 1;
  fetchData();
}, 500);

watch(() => filters.search, debouncedFetch);
watch(() => filters.status, () => { filters.page = 1; fetchData(); });

const handlePageChange = (page) => {
  filters.page = page;
  fetchData();
};

const clearFilters = () => {
  filters.search = '';
  filters.status = '';
  filters.page = 1;
  fetchData();
};

const openTrackingModal = (item) => {
  errors.value = {};
  selectedItem.value = item;
  form.value = {
    renewal_status: item.renewal_status || 'processing',
    renewal_notes: item.renewal_notes || ''
  };
  showModal.value = true;
};

const save = async () => {
  if (!selectedItem.value) return;
  saving.value = true;
  errors.value = {};
  try {
    await api.put(`/expenses/${selectedItem.value.id}`, {
        renewal_status: form.value.renewal_status,
        renewal_notes: form.value.renewal_notes || ''
    });
    
    showModal.value = false;
    await fetchData();
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors;
    } else {
      console.error('Save failed', err);
      alert('Failed to save tracking info.');
    }
  } finally {
    saving.value = false;
  }
};

const finalize = async () => {
  if (!selectedItem.value) return;
  if (!confirm('This will automatically update the staff record expiry date. Continue?')) return;

  finalizing.value = true;
  errors.value = {};
  try {
    await api.post(`/expenses/${selectedItem.value.id}/finalize`);
    showModal.value = false;
    await fetchData();
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors;
    } else {
      console.error('Finalization failed', err);
      alert('Failed to finalize renewal');
    }
  } finally {
    finalizing.value = false;
  }
};

onMounted(() => fetchData());
</script>
