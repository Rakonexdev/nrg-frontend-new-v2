<template>
  <div class="space-y-6">
    <div ref="headerRef" class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Bank Details</h1>
        <p class="text-slate-500 dark:text-slate-400">Manage bank details and card information</p>
      </div>
      <button v-if="authStore.hasPermission('bank_detail_create') || authStore.isSuperAdmin" @click="openModal()" class="flex items-center gap-2 px-6 py-2.5 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl shadow-lg shadow-[#29166e]/30 transition-all transform hover:-translate-y-0.5 font-bold text-sm">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        Add Bank Detail
      </button>
    </div>

    <!-- Data Table -->
    <DataTable v-if="!loading"
      :columns="columns" 
      :data="bankDetails"
      :pagination="pagination"
      @page-change="fetchBankDetails">
      
      <template #company_info="{ row }">
        <div class="flex flex-col">
          <span class="font-bold text-slate-700 dark:text-slate-300">{{ row.company?.name || 'N/A' }}</span>
        </div>
      </template>
      
      <template #person_info="{ row }">
        <div class="flex flex-col">
          <span class="font-bold text-slate-700 dark:text-slate-300">{{ row.person_name }}</span>
        </div>
      </template>

      <template #bank_info="{ row }">
        <div class="flex flex-col gap-0.5">
          <span class="font-bold text-slate-800 dark:text-white">{{ row.bank_name }}</span>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ row.account_number }}</span>
        </div>
      </template>

      <template #financial_info="{ row }">
        <div class="flex flex-col">
          <span class="font-bold text-slate-700 dark:text-slate-300">QAR {{ formatCurrency(row.balance) }}</span>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ row.card_type || 'N/A' }}</span>
        </div>
      </template>
      
      <template #updated_date="{ row }">
        <span class="text-sm font-medium text-slate-600 dark:text-slate-400">{{ formatDate(row.updated_date) }}</span>
      </template>

      <template #actions="{ row }">
        <div class="flex items-center gap-3">
          <button v-if="authStore.hasPermission('view_bank_details') || authStore.isSuperAdmin" @click="openModal(row, true)" class="p-1 text-slate-400 hover:text-blue-500 transition-colors" title="View Bank Detail">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
          </button>
          <button v-if="authStore.hasPermission('bank_detail_edit') || authStore.isSuperAdmin" @click="openModal(row)" class="p-1 text-slate-400 hover:text-[#29166e] transition-colors" title="Edit Bank Detail">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
          <button v-if="authStore.hasPermission('bank_detail_delete') || authStore.isSuperAdmin" @click="confirmDelete(row)" class="p-1 text-slate-400 hover:text-red-500 transition-colors" title="Delete Bank Detail">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
        </div>
      </template>
    </DataTable>

    <div v-else class="flex flex-col items-center justify-center py-32 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-700">
        <div class="w-16 h-16 border-4 border-[#29166e]/10 border-t-[#29166e] rounded-full animate-spin"></div>
        <p class="mt-6 text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Loading Bank Details</p>
    </div>

    <!-- Add/Edit Modal -->
    <Modal :show="showModal" :title="viewMode ? 'View Bank Detail' : editMode ? 'Edit Bank Detail' : 'Add Bank Detail'" @close="showModal = false" maxWidth="4xl">
      <form @submit.prevent="saveBankDetail" class="space-y-6">
        <fieldset :disabled="viewMode" class="space-y-6">
        <div class="bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div class="flex items-center gap-2 mb-6">
                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                <h3 class="text-xs font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest">General Information</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Company Name <span class="text-red-500">*</span></label>
                    <SearchableSelect 
                        v-model="form.company_id" 
                        :options="computedCompanies" 
                        placeholder="Select Company" 
                        class="w-full font-bold"
                    />
                </div>
                
                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Person Name <span class="text-red-500">*</span></label>
                    <input v-model="form.person_name" type="text" required
                           class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                </div>

                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Bank Name <span class="text-red-500">*</span></label>
                    <input v-model="form.bank_name" type="text" required
                           class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                </div>

                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Account Number <span class="text-red-500">*</span></label>
                    <input v-model="form.account_number" type="text" required
                           class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                </div>

                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Balance (QAR) <span class="text-red-500">*</span></label>
                    <input v-model="form.balance" type="number" step="0.01" required
                           class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                </div>

                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Credit / Debit Card</label>
                    <select v-model="form.card_type" class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                        <option value="">Select Card Type</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Debit Card">Debit Card</option>
                    </select>
                </div>
                
                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Updated Date</label>
                    <DateInput v-model="form.updated_date" />
                </div>
            </div>
        </div>
        </fieldset>

        <div class="flex justify-end gap-4 mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
          <button type="button" @click="showModal = false" class="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-xl font-bold text-sm transition-colors shadow-sm">{{ viewMode ? 'Close' : 'Cancel' }}</button>
          <button v-if="!viewMode" type="submit" class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/25 transition-all font-black text-sm transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2" :disabled="saving">
            <svg v-if="!saving" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
            <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ saving ? 'Saving...' : 'Save Bank Detail' }}
          </button>
        </div>
      </form>
    </Modal>
    
    <!-- Delete Confirmation Modal -->
    <ConfirmModal 
      :show="showDeleteModal" 
      title="Delete Bank Detail"
      :message="`Are you sure you want to delete this bank detail?`"
      description="This action cannot be undone."
      variant="danger"
      confirm-text="Yes, Delete"
      :loading="saving"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    >
      <template #icon>
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      </template>
    </ConfirmModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import bankDetailService from '@/services/bankDetail.service';
import { companyService } from '@/services/api';
import { useNotificationStore } from '@/stores/notification';
import DataTable from '@/components/shared/DataTable.vue';
import Modal from '@/components/shared/Modal.vue';
import ConfirmModal from '@/components/shared/ConfirmModal.vue';
import SearchableSelect from '@/components/shared/SearchableSelect.vue';
import DateInput from '@/components/shared/DateInput.vue';
import { useAuthStore } from '@/stores/auth';

const columns = [
    { key: 'company_info', label: 'Company', sortable: false },
    { key: 'person_info', label: 'Person Name', sortable: false },
    { key: 'bank_info', label: 'Bank & Account', sortable: false },
    { key: 'financial_info', label: 'Balance & Card', sortable: false },
    { key: 'updated_date', label: 'Updated Date', sortable: false },
    { key: 'actions', label: 'Actions', sortable: false }
];

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const bankDetails = ref([]);
const companies = ref([]);
const computedCompanies = computed(() => {
    return companies.value.map(c => ({
        ...c,
        original_name: c.name,
        name: `${c.name} - ${c.computer_card || 'N/A'}`
    }));
});
const loading = ref(true);
const saving = ref(false);
const showModal = ref(false);
const showDeleteModal = ref(false);
const itemToDelete = ref(null);
const editMode = ref(false);
const viewMode = ref(false);
const pagination = ref({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 100
});

const form = ref({
    company_id: '',
    person_name: '',
    bank_name: '',
    account_number: '',
    balance: 0,
    card_type: '',
    updated_date: ''
});

const formatCurrency = (val) => {
    return parseFloat(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
};

const fetchBankDetails = async () => {
    loading.value = true;
    try {
        const response = await bankDetailService.getAll();
        bankDetails.value = response.data;
    } catch (error) {
        console.error('Failed to fetch bank details:', error);
        notificationStore.error(error.response?.data?.message || 'Failed to load bank details');
    } finally {
        loading.value = false;
    }
};

const fetchCompanies = async () => {
    try {
        const res = await companyService.getSimple();
        companies.value = res.data;
    } catch (error) {
        console.error('Failed to fetch companies:', error);
    }
};

const openModal = (item = null, isView = false) => {
    viewMode.value = isView;
    if (item) {
        editMode.value = !isView;
        form.value = { ...item };
    } else {
        editMode.value = false;
        form.value = {
            company_id: '',
            person_name: '',
            bank_name: '',
            account_number: '',
            balance: 0,
            card_type: '',
            updated_date: ''
        };
    }
    showModal.value = true;
};

const saveBankDetail = async () => {
    saving.value = true;
    try {
        if (editMode.value) {
            await bankDetailService.update(form.value.id, form.value);
            notificationStore.addNotification('Bank detail updated successfully', 'success');
        } else {
            await bankDetailService.create(form.value);
            notificationStore.addNotification('Bank detail created successfully', 'success');
        }
        showModal.value = false;
        fetchBankDetails();
    } catch (error) {
        console.error('Error saving bank detail:', error);
        notificationStore.addNotification(error.response?.data?.message || 'Failed to save bank detail', 'error');
    } finally {
        saving.value = false;
    }
};

const confirmDelete = (item) => {
    itemToDelete.value = item;
    showDeleteModal.value = true;
};

const handleDelete = async () => {
    if (!itemToDelete.value) return;
    
    saving.value = true;
    try {
        await bankDetailService.delete(itemToDelete.value.id);
        notificationStore.success('Bank detail deleted successfully');
        showDeleteModal.value = false;
        fetchBankDetails();
    } catch (error) {
        console.error('Delete failed', error);
        notificationStore.error(error.response?.data?.message || 'Failed to delete bank detail');
    } finally {
        saving.value = false;
        itemToDelete.value = null;
    }
};

onMounted(() => {
    fetchBankDetails();
    fetchCompanies();
});
</script>
