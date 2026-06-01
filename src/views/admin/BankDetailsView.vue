<template>
  <div class="space-y-6">
    <div ref="headerRef" class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Bank Details</h1>
        <p class="text-slate-500 dark:text-slate-400">Manage bank details and card information</p>
      </div>
      <div class="flex flex-col sm:flex-row items-center gap-3">
        <!-- Search -->
        <div class="relative w-full sm:w-64">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </div>
          <input v-model="searchQuery" @input="debouncedSearch" type="text" placeholder="Search details..." 
                 class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all dark:text-white shadow-sm font-medium">
        </div>
        <!-- Action Buttons -->
        <button v-if="authStore.hasPermission('bank_detail_create') || authStore.isSuperAdmin" @click="openModal()" class="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl shadow-lg shadow-[#29166e]/30 transition-all transform hover:-translate-y-0.5 font-bold text-sm">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          Add Bank Detail
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-gradient-to-br from-[#29166e] to-[#1d0f4d] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
        <div class="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
          <svg class="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
        </div>
        <div class="relative z-10">
            <h3 class="text-white/70 font-black text-xs tracking-widest uppercase mb-2">Total Credit Balance</h3>
            <p class="text-3xl font-bold text-white">QAR {{ formatCurrency(summary.credit_total) }}</p>
        </div>
      </div>
      <div class="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
        <div class="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
          <svg class="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
        </div>
        <div class="relative z-10">
            <h3 class="text-white/70 font-black text-xs tracking-widest uppercase mb-2">Total Debit Balance</h3>
            <p class="text-3xl font-bold text-white">QAR {{ formatCurrency(summary.debit_total) }}</p>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <DataTable v-if="!loading"
      :columns="columns" 
      :data="bankDetails"
      :pagination="pagination"
      @page-change="fetchBankDetails">
      
      <template #details_for="{ row }">
        <div class="flex flex-col gap-1.5">
          <span class="px-2 py-0.5 rounded-md bg-[#29166e]/10 dark:bg-[#29166e]/30 text-[#29166e] dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest w-fit border border-[#29166e]/20">{{ row.bank_details_for || 'Company' }}</span>
          <span class="font-bold text-slate-700 dark:text-slate-300">
             {{ row.bank_details_for === 'Person' ? row.person_name : (row.company?.name || 'N/A') }}
          </span>
          <span v-if="row.bank_details_for === 'Person' && row.qid" class="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">QID: {{ row.qid }}</span>
        </div>
      </template>

      <template #mobile_number="{ row }">
        <span class="font-bold text-slate-700 dark:text-slate-300">
          {{ row.mobile_number ? `+974 ${row.mobile_number}` : 'N/A' }}
        </span>
      </template>

      <template #bank_info="{ row }">
        <div class="flex flex-col gap-0.5">
          <span class="font-bold text-slate-800 dark:text-white">{{ row.bank_name }}</span>
          <span class="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">{{ row.account_number }}</span>
        </div>
      </template>

      <template #balance_info="{ row }">
        <span class="font-bold text-slate-700 dark:text-slate-300">{{ formatCurrency(row.balance) }}</span>
      </template>

      <template #card_info="{ row }">
        <div class="flex flex-col">
          <span v-if="row.card_type" 
                :class="[
                  'px-2 py-0.5 rounded-md text-white text-[10px] font-bold uppercase tracking-widest w-fit mt-1',
                  row.card_type === 'Credit Card' ? 'bg-[#1d0f4d]' : 'bg-[#1e40af]'
                ]">
            {{ row.card_type }}
          </span>
          <span v-else class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">N/A</span>
          <span v-if="row.card_number" class="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">{{ row.card_number }}</span>
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
                <div class="md:col-span-2">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Bank Details For <span class="text-red-500">*</span></label>
                    <div class="flex gap-4">
                        <label class="flex-1 flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer transition-all" :class="form.bank_details_for === 'Company' ? 'bg-[#29166e]/5 border-[#29166e]/30' : 'bg-white dark:bg-slate-900'">
                            <input type="radio" v-model="form.bank_details_for" value="Company" class="w-4 h-4 text-[#29166e] focus:ring-[#29166e] border-slate-300">
                            <span class="font-bold text-sm text-slate-700 dark:text-slate-300">Company</span>
                        </label>
                        <label class="flex-1 flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer transition-all" :class="form.bank_details_for === 'Person' ? 'bg-[#29166e]/5 border-[#29166e]/30' : 'bg-white dark:bg-slate-900'">
                            <input type="radio" v-model="form.bank_details_for" value="Person" class="w-4 h-4 text-[#29166e] focus:ring-[#29166e] border-slate-300">
                            <span class="font-bold text-sm text-slate-700 dark:text-slate-300">Person</span>
                        </label>
                    </div>
                </div>

                <div class="md:col-span-1" v-if="form.bank_details_for === 'Company'">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Company Name <span class="text-red-500">*</span></label>
                    <SearchableSelect 
                        v-model="form.company_id" 
                        :options="computedCompanies" 
                        placeholder="Select Company" 
                        class="w-full font-bold"
                    />
                </div>
                
                <div class="md:col-span-1" v-if="form.bank_details_for === 'Person'">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Person Name <span class="text-red-500">*</span></label>
                    <input v-model="form.person_name" type="text" required
                           class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                </div>

                <div class="md:col-span-1" v-if="form.bank_details_for === 'Person'">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">QID Number <span class="text-red-500">*</span></label>
                    <input v-model="form.qid" type="text" required pattern="[0-9]{11}" title="Must be exactly 11 digits" maxlength="11"
                           placeholder="11-digit QID"
                           class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                </div>

                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Mobile Number <span class="text-red-500">*</span></label>
                    <div class="flex items-center">
                        <span class="flex items-center justify-center px-4 py-3.5 bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-xl text-sm font-bold text-slate-500">
                            +974
                        </span>
                        <input v-model="form.mobile_number" type="text" pattern="[0-9]{8}" title="Must be exactly 8 digits" maxlength="8" required
                               placeholder="8-digit number"
                               class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-r-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                    </div>
                </div>

                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Bank Name <span class="text-red-500">*</span></label>
                    <select v-model="form.bank_name" required
                           class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                        <option value="">Select Bank</option>
                        <option value="Qatar National Bank (QNB)">Qatar National Bank (QNB)</option>
                        <option value="Qatar Islamic Bank(QIB)">Qatar Islamic Bank(QIB)</option>
                        <option value="Qatar International Islamic Bank(QIIB)">Qatar International Islamic Bank(QIIB)</option>
                        <option value="Commercial Bank of Qatar(CBQ)">Commercial Bank of Qatar(CBQ)</option>
                        <option value="Al Rayan">Al Rayan</option>
                        <option value="Doha Bank">Doha Bank</option>
                        <option value="Ahlibank">Ahlibank</option>
                        <option value="Dukhan Bank">Dukhan Bank</option>
                    </select>
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
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Credit / Debit Card <span class="text-red-500">*</span></label>
                    <select v-model="form.card_type" required class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                        <option value="">Select Card Type</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Debit Card">Debit Card</option>
                    </select>
                </div>

                <div class="md:col-span-1" v-if="form.card_type">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Card Number <span class="text-red-500">*</span></label>
                    <input v-model="form.card_number" type="text" required
                           class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
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
import { debounce } from 'lodash';
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
    { key: 'details_for', label: 'Details For', sortable: false },
    { key: 'mobile_number', label: 'Mobile Number', sortable: false },
    { key: 'bank_info', label: 'Bank & Account', sortable: false },
    { key: 'balance_info', label: 'Balance (QAR)', sortable: false },
    { key: 'card_info', label: 'Card Information', sortable: false },
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
const searchQuery = ref('');
const summary = ref({
    credit_total: 0,
    debit_total: 0
});
const pagination = ref({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15
});

const debouncedSearch = debounce(() => {
    pagination.value.current_page = 1;
    fetchBankDetails();
}, 500);

const form = ref({
    bank_details_for: 'Company',
    company_id: '',
    person_name: '',
    qid: '',
    mobile_number: '',
    bank_name: '',
    account_number: '',
    balance: 0,
    card_type: '',
    card_number: '',
    updated_date: ''
});

const formatCurrency = (val) => {
    return parseFloat(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

const fetchBankDetails = async (page = null) => {
    if (page && typeof page === 'number') {
        pagination.value.current_page = page;
    }
    loading.value = true;
    try {
        const response = await bankDetailService.getAll({
            page: pagination.value.current_page,
            search: searchQuery.value,
            per_page: pagination.value.per_page
        });
        bankDetails.value = response.data.data || [];
        if (response.data.summary) {
            summary.value = response.data.summary;
        }
        pagination.value = {
            current_page: response.data.current_page,
            last_page: response.data.last_page,
            total: response.data.total,
            per_page: response.data.per_page
        };
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
            bank_details_for: 'Company',
            company_id: '',
            person_name: '',
            qid: '',
            mobile_number: '',
            bank_name: '',
            account_number: '',
            balance: 0,
            card_type: '',
            card_number: '',
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
