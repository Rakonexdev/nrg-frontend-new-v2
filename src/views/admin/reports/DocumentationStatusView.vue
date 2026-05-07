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
        <h3 class="text-2xl font-black text-slate-900 dark:text-white">{{ items.length }}</h3>
      </div>
      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <p class="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Currently Processing</p>
        <h3 class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.processing }}</h3>
      </div>
      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <p class="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Reported Delayed</p>
        <h3 class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.delayed }}</h3>
      </div>
    </div>

    <!-- Main Report Table -->
    <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
        <div class="relative w-full max-w-md">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </span>
          <input v-model="search" type="text" placeholder="Search staff, QID, phone or document type..." class="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
              <th class="px-6 py-4 font-black">Staff Member</th>
              <th class="px-6 py-4 font-black">Renewal Type</th>
              <th class="px-6 py-4 font-black">Payment Date</th>
              <th class="px-6 py-4 font-black">System Status</th>
              <th class="px-6 py-4 font-black">Progress Status</th>
              <th class="px-6 py-4 font-black text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
            <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black text-slate-500">{{ item.staff_name[0] }}</div>
                  <div class="flex flex-col">
                    <span class="text-sm font-black text-slate-800 dark:text-white">{{ item.staff_name }}</span>
                    <span v-if="item.staff?.branch_name" class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {{ item.staff.branch_name }}<span v-if="item.staff.branch_number">-{{ item.staff.branch_number }}</span>
                    </span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  {{ item.type }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="text-xs font-bold text-slate-600 dark:text-slate-400">{{ item.expense_date }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-[10px] font-black text-rose-500 uppercase">Current: {{ item.current_expiry }}</span>
                  <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Target: {{ item.new_expiry }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span :class="{
                    'text-slate-500': item.renewal_status === 'processing',
                    'text-amber-500': item.renewal_status === 'medical' || item.renewal_status === 'fingerprints',
                    'text-rose-500': item.renewal_status === 'delayed',
                    'text-blue-500': item.renewal_status === 'submitted',
                    'text-emerald-500': item.renewal_status === 'completed'
                  }" class="text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full" :class="{
                      'bg-slate-500': item.renewal_status === 'processing',
                      'bg-amber-500': item.renewal_status === 'medical' || item.renewal_status === 'fingerprints',
                      'bg-rose-500': item.renewal_status === 'delayed',
                      'bg-blue-500': item.renewal_status === 'submitted',
                      'bg-emerald-500': item.renewal_status === 'completed'
                    }"></span>
                    {{ item.renewal_status }}
                  </span>
                  <p v-if="item.renewal_notes" class="text-[10px] text-slate-400 italic mt-1 max-w-[200px] leading-tight">
                    "{{ item.renewal_notes }}"
                  </p>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <router-link :to="{ name: 'admin-staff', query: { edit: item.staff_id, search: item.staff?.name } }" class="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm" title="Update Documents">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                  </router-link>
                  <button @click="openTrackingModal(item)" class="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg hover:bg-blue-100 transition-all shadow-sm" title="Update Status">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && filteredItems.length === 0">
              <td colspan="6" class="px-6 py-20 text-center">
                <div class="w-16 h-16 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                </div>
                <p class="text-sm font-bold text-slate-400 uppercase tracking-widest">No pending renewals found</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tracking Modal -->
    <Modal :show="showModal" title="Update Renewal Progress" @close="showModal = false">
      <div v-if="selectedItem" class="p-8 space-y-6">
        <div class="space-y-4">
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Process Status</label>
            <select v-model="form.renewal_status" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none">
              <option value="processing">🔄 Initial Processing</option>
              <option value="medical">🏥 Medical Test Pending</option>
              <option value="fingerprints">☝️ Fingerprints / Biometrics</option>
              <option value="submitted">📤 Submitted to Gov</option>
              <option value="qid_upload">🪪 QID Document Upload</option>
              <option value="passport_upload">🛂 Passport Document Upload</option>
              <option value="delayed">⚠️ Delayed / Pending Requirement</option>
              <option value="completed">✅ Completed</option>
            </select>
          </div>

          <!-- Removed file upload sections as per user request -->

          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal Notes / Progress Remarks</label>
            <textarea v-model="form.renewal_notes" rows="4" placeholder="Enter details about why it's taking time, missing documents, etc." class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"></textarea>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import Modal from '@/components/shared/Modal.vue';

const router = useRouter();
const loading = ref(false);
const saving = ref(false);
const finalizing = ref(false);
const search = ref('');
const items = ref([]);
const showModal = ref(false);
const selectedItem = ref(null);
const form = ref({
  renewal_status: 'processing',
  renewal_notes: ''
});

const stats = computed(() => {
  return {
    processing: items.value.filter(i => i.renewal_status === 'processing').length,
    delayed: items.value.filter(i => i.renewal_status === 'delayed').length,
  };
});

const filteredItems = computed(() => {
  if (!search.value) return items.value;
  const s = search.value.toLowerCase();
  return items.value.filter(i => 
    (i.staff_name && String(i.staff_name).toLowerCase().includes(s)) || 
    (i.type && String(i.type).toLowerCase().includes(s)) ||
    (i.renewal_notes && String(i.renewal_notes).toLowerCase().includes(s)) ||
    (i.staff?.qid_number && String(i.staff.qid_number).toLowerCase().includes(s)) ||
    (i.staff?.phone && String(i.staff.phone).toLowerCase().includes(s)) ||
    (i.staff?.branch_name && String(i.staff.branch_name).toLowerCase().includes(s)) ||
    (i.staff?.branch_number && String(i.staff.branch_number).toLowerCase().includes(s))
  );
});

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await api.get('/dashboard');
    items.value = res.data.pendingUpdates || [];
  } catch (err) {
    console.error('Failed to fetch documentation status', err);
  } finally {
    loading.value = false;
  }
};

const openTrackingModal = (item) => {
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
  try {
    await api.put(`/expenses/${selectedItem.value.id}`, {
        renewal_status: form.value.renewal_status,
        renewal_notes: form.value.renewal_notes || ''
    });
    
    showModal.value = false;
    await fetchData();
  } catch (err) {
    console.error('Save failed', err);
    alert('Failed to save tracking info.');
  } finally {
    saving.value = false;
  }
};

const finalize = async () => {
  if (!selectedItem.value) return;
  if (!confirm('This will automatically update the staff record expiry date. Continue?')) return;

  finalizing.value = true;
  try {
    await api.post(`/expenses/${selectedItem.value.id}/finalize`);
    showModal.value = false;
    await fetchData();
    // Removed redirect to staff detail as per user request

  } catch (err) {
    console.error('Finalization failed', err);
    alert('Failed to finalize renewal');
  } finally {
    finalizing.value = false;
  }
};

onMounted(() => fetchData());
</script>
