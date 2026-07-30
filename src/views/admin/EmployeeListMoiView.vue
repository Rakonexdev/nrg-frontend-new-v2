<template>
  <div class="space-y-6">
    <div ref="headerRef" class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Employee List MOI</h1>
        <p class="text-slate-500 dark:text-slate-400">Manage and upload MOI employee list documents</p>
      </div>
      <button v-if="authStore.hasPermission('employee_list_moi_create') || authStore.isSuperAdmin" 
              @click="openUploadModal" 
              class="flex items-center gap-2 px-6 py-3 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl shadow-lg shadow-[#29166e]/30 transition-all transform hover:-translate-y-0.5 font-black uppercase tracking-widest text-[10px]">
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0l-4 4m4-4v12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        Upload New Document
      </button>
    </div>

    <!-- Search & Filters -->
    <div :class="[
           'transition-all duration-300 flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-2xl border shadow-sm relative z-30 animate-fade-in',
           isScrolled 
             ? 'sticky top-[-32px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-md' 
             : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
         ]">
      <div class="flex flex-col md:flex-row items-center gap-3 w-full xl:max-w-4xl">
        <div class="relative w-full md:w-80 group">
          <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-[#29166e] transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </span>
          <input v-model="search" @input="debouncedSearch" type="text" placeholder="Search by name, computer card, company, salary month..." 
                 class="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-[#29166e]/10 focus:border-[#29166e] outline-none transition-all dark:text-white font-medium text-sm">
        </div>

        <!-- Filter by Company -->
        <div class="w-full md:w-64">
          <SearchableSelect 
            v-model="filterCompany" 
            :options="companyOptions" 
            placeholder="All Companies" 
            @update:modelValue="fetchDocuments(1)"
            class="text-sm"
          />
        </div>

        <transition name="fade-slide-horizontal">
            <div v-if="isScrolled" class="flex gap-2 shrink-0">
                <button v-if="authStore.hasPermission('employee_list_moi_create') || authStore.isSuperAdmin" 
                        @click="openUploadModal" 
                        class="flex items-center gap-2 px-5 py-2.5 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl shadow-lg shadow-[#29166e]/30 transition-all font-black uppercase tracking-widest text-[10px] shrink-0 transform hover:-translate-y-0.5">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0l-4 4m4-4v12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                  Upload New Document
                </button>
            </div>
        </transition>
      </div>

      <div class="flex items-center gap-2 md:ml-auto">
        <select v-model="perPage" @change="fetchDocuments(1)" class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none dark:text-white font-bold h-[50px] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
          <option :value="10">10 / pg</option>
          <option :value="25">25 / pg</option>
          <option :value="50">50 / pg</option>
          <option :value="100">100 / pg</option>
        </select>
      </div>
    </div>

    <!-- Data Table -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div class="w-16 h-16 border-4 border-[#29166e]/10 border-t-[#29166e] rounded-full animate-spin"></div>
        <p class="mt-6 text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading MOI Employee Lists...</p>
    </div>
    
    <DataTable v-else
      :columns="columns" 
      :data="documents" 
      :pagination="pagination"
      @page-change="fetchDocuments">
      
      <template #document_name="{ value, row }">
        <div class="flex flex-col">
            <span class="font-black text-slate-800 dark:text-slate-200 tracking-tight">{{ value }}</span>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ row.file_name || 'No file' }}</span>
        </div>
      </template>

      <template #computer_card_number="{ value }">
        <span class="text-sm font-bold text-slate-700 dark:text-slate-300">
            <span v-if="value" class="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-mono">{{ value }}</span>
            <span v-else class="text-slate-400 font-medium text-xs">N/A</span>
        </span>
      </template>

      <template #company_name="{ value }">
        <span class="text-sm font-bold text-slate-700 dark:text-slate-300">
            <span v-if="value">{{ value }}</span>
            <span v-else class="text-slate-400 font-medium text-xs">N/A</span>
        </span>
      </template>

      <template #upload_date="{ value }">
        <span class="text-sm font-bold text-slate-600 dark:text-slate-400">{{ formatDate(value) }}</span>
      </template>

      <template #salary_month="{ value }">
        <span class="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg">
            <span v-if="value">{{ formatSalaryMonth(value) }}</span>
            <span v-else class="text-slate-400 font-medium text-xs">N/A</span>
        </span>
      </template>

      <template #uploader="{ value }">
        <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-[#29166e]/10 dark:bg-[#29166e]/20 flex items-center justify-center text-[#29166e] dark:text-[#29166e]/80 font-bold text-[10px]">
                {{ value?.name?.charAt(0) || 'U' }}
            </div>
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">{{ value?.name || 'System' }}</span>
        </div>
      </template>

      <template #actions="{ row }">
        <div class="flex items-center gap-2">
          <button v-if="authStore.hasPermission('employee_list_moi_download') || authStore.isSuperAdmin" 
                  @click="viewDocument(row)" 
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors text-[11px] font-bold tracking-wide" title="View">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            View
          </button>
          <button v-if="authStore.hasPermission('employee_list_moi_download') || authStore.isSuperAdmin" 
                  @click="downloadDocument(row)" 
                  class="p-2 text-slate-400 hover:text-[#29166e] hover:bg-[#29166e]/5 dark:hover:bg-[#29166e]/20 rounded-lg transition-all" title="Download">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
          <button v-if="authStore.hasPermission('employee_list_moi_edit') || authStore.isSuperAdmin" 
                  @click="openEditModal(row)" 
                  class="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all" title="Edit">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
          <button v-if="authStore.hasPermission('employee_list_moi_delete') || authStore.isSuperAdmin" 
                  @click="confirmDelete(row)" 
                  class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all" title="Delete">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Upload/Edit Modal -->
    <Modal :show="showModal" :title="isEditing ? 'Edit Employee List MOI' : 'Upload Employee List MOI'" @close="showModal = false" maxWidth="2xl">
      <form @submit.prevent="handleSubmit" class="p-6 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-5">
        <!-- 1. Document Name -->
        <div>
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Document Name <span class="text-rose-500">*</span></label>
          <input v-model="form.document_name" type="text" required :class="{'border-rose-500 ring-4 ring-rose-500/10': errors.document_name}" class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-[#29166e]/10 focus:border-[#29166e] transition-all dark:text-white font-bold tracking-tight text-sm" placeholder="e.g., MOI Employee List July 2026">
          <p v-if="errors.document_name" class="text-rose-500 text-[10px] mt-1 ml-1 font-bold uppercase tracking-widest">{{ errors.document_name[0] }}</p>
        </div>

        <!-- 3. Company Name & 2. Computer Card Number -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Company Name <span class="text-rose-500">*</span></label>
            <SearchableSelect 
              v-model="form.company_id" 
              :options="companyListOptions" 
              placeholder="Select Company..." 
              @update:modelValue="onCompanySelect"
              class="w-full text-sm"
              :error="errors.company_name ? errors.company_name[0] : ''"
            />
            <p v-if="errors.company_name" class="text-rose-500 text-[10px] mt-1 ml-1 font-bold uppercase tracking-widest">{{ errors.company_name[0] }}</p>
          </div>

          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Computer Card Number <span class="text-rose-500">*</span></label>
            <input v-model="form.computer_card_number" type="text" readonly disabled :class="{'border-rose-500 ring-4 ring-rose-500/10': errors.computer_card_number}" class="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-600 dark:text-slate-400 font-bold tracking-tight text-sm font-mono cursor-not-allowed" placeholder="Auto-populated from company">
            <p v-if="errors.computer_card_number" class="text-rose-500 text-[10px] mt-1 ml-1 font-bold uppercase tracking-widest">{{ errors.computer_card_number[0] }}</p>
          </div>
        </div>

        <!-- 4. Upload Date & 5. Salary Month -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Upload Date <span class="text-rose-500">*</span></label>
            <input v-model="form.upload_date" type="date" required class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-[#29166e]/10 focus:border-[#29166e] transition-all dark:text-white font-bold text-sm">
            <p v-if="errors.upload_date" class="text-rose-500 text-[10px] mt-1 ml-1 font-bold uppercase tracking-widest">{{ errors.upload_date[0] }}</p>
          </div>

          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Salary Month <span class="text-rose-500">*</span></label>
            <input v-model="form.salary_month" type="month" required class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-[#29166e]/10 focus:border-[#29166e] transition-all dark:text-white font-bold text-sm">
            <p v-if="errors.salary_month" class="text-rose-500 text-[10px] mt-1 ml-1 font-bold uppercase tracking-widest">{{ errors.salary_month[0] }}</p>
          </div>
        </div>

        <!-- 6. File Upload Option -->
        <div>
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Document File <span class="text-rose-500">*</span></label>
          <div class="relative group">
            <input type="file" @change="handleFileChange" :required="!isEditing" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
            <div class="px-5 py-6 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group-hover:border-[#29166e] group-hover:bg-[#29166e]/5 dark:group-hover:bg-[#29166e]/10">
                <div class="w-10 h-10 bg-[#29166e]/10 dark:bg-[#29166e]/20 text-[#29166e] dark:text-[#29166e]/80 rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                </div>
                <div class="text-center">
                    <p class="text-xs font-bold text-slate-700 dark:text-slate-300">{{ selectedFile ? selectedFile.name : (isEditing && editingItem?.file_name ? `Current: ${editingItem.file_name} (Click to replace)` : 'Click or drag file to upload') }}</p>
                    <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">PDF, DOCX, XLSX, JPG, PNG (Max 10MB)</p>
                </div>
            </div>
          </div>
          <p v-if="errors.file" class="text-rose-500 text-[10px] mt-1 ml-1 font-bold uppercase tracking-widest">{{ errors.file[0] }}</p>
        </div>
      </form>
      <template #footer>
        <div class="flex items-center justify-between w-full p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800">
            <button @click="showModal = false" class="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
            <button @click="handleSubmit" class="px-8 py-3.5 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl shadow-xl shadow-[#29166e]/20 transition-all font-black text-[10px] uppercase tracking-[0.2em] transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2" :disabled="submitting">
              <svg v-if="!submitting" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path></svg>
              {{ submitting ? (isEditing ? 'Updating...' : 'Uploading...') : (isEditing ? 'Update Document' : 'Confirm & Upload') }}
            </button>
        </div>
      </template>
    </Modal>

    <!-- Confirm Delete Modal -->
    <ConfirmModal 
      :show="showConfirmModal" 
      title="Delete Employee List MOI Document" 
      :message="`Are you sure you want to delete '${itemToDelete?.document_name}'? This action cannot be undone.`" 
      :loading="deleting" 
      @confirm="deleteDocument" 
      @close="showConfirmModal = false" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { employeeListMoiService, companyService } from '@/services/api';
import DataTable from '@/components/shared/DataTable.vue';
import Modal from '@/components/shared/Modal.vue';
import ConfirmModal from '@/components/shared/ConfirmModal.vue';
import SearchableSelect from '@/components/shared/SearchableSelect.vue';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const headerRef = ref(null);
const isScrolled = ref(false);
let observer = null;

const documents = ref([]);
const rawCompanies = ref([]);
const loading = ref(false);
const submitting = ref(false);
const isEditing = ref(false);
const editingItem = ref(null);
const search = ref('');
const filterCompany = ref('');
const perPage = ref(10);
const pagination = ref({});
const showModal = ref(false);
const showConfirmModal = ref(false);
const itemToDelete = ref(null);
const deleting = ref(false);
const errors = ref({});
const selectedFile = ref(null);

const form = ref({
    document_name: '',
    computer_card_number: '',
    company_name: '',
    company_id: '',
    upload_date: new Date().toISOString().substring(0, 10),
    salary_month: new Date().toISOString().substring(0, 7)
});

const columns = [
  { key: 'document_name', label: 'Document Name', sortable: true },
  { key: 'computer_card_number', label: 'Computer Card No.', sortable: true },
  { key: 'company_name', label: 'Company Name', sortable: true },
  { key: 'upload_date', label: 'Upload Date', sortable: true },
  { key: 'salary_month', label: 'Salary Month', sortable: true },
  { key: 'uploader', label: 'Uploaded By', sortable: false },
  { key: 'actions', label: 'Actions', sortable: false }
];

const getCompanyDisplayName = (c) => {
    if (!c) return '';
    let branchInfo = '';
    if (c.branch_name && c.branch_number) {
        branchInfo = `${c.branch_name} - ${c.branch_number}`;
    } else if (c.branch_number) {
        branchInfo = `${c.branch_number}`;
    } else if (c.branch_name) {
        branchInfo = `${c.branch_name}`;
    }
    return branchInfo ? `${c.name} (${branchInfo})` : c.name;
};

const companyOptions = computed(() => {
    const list = rawCompanies.value.map(c => {
        const name = getCompanyDisplayName(c);
        return { id: name, name: name, label: name };
    });
    return [{ id: '', name: 'All Companies', label: 'All Companies' }, ...list];
});

const companyListOptions = computed(() => {
    return rawCompanies.value.map(c => {
        const name = getCompanyDisplayName(c);
        return { 
            id: c.id, 
            name: name,
            label: name 
        };
    });
});

const onCompanySelect = (companyId) => {
    if (!companyId) {
        form.value.company_name = '';
        form.value.computer_card_number = '';
        return;
    }
    const selected = rawCompanies.value.find(c => c.id === companyId);
    if (selected) {
        form.value.company_name = getCompanyDisplayName(selected);
        if (selected.computer_card) {
            form.value.computer_card_number = selected.computer_card;
        }
    }
};

const fetchCompanies = async () => {
    try {
        const res = await companyService.getAll({ per_page: 500 });
        rawCompanies.value = res.data?.data || res.data || [];
    } catch (err) {
        console.error('Failed to load companies:', err);
    }
};

const fetchDocuments = async (page = 1) => {
  loading.value = true;
  try {
    const res = await employeeListMoiService.getAll({
      page,
      per_page: perPage.value,
      search: search.value,
      company_name: filterCompany.value
    });
    documents.value = res.data.data;
    pagination.value = res.data;
  } catch (err) {
    console.error('Failed to fetch MOI employee lists', err);
    const message = err.response?.data?.message || 'Failed to load documents';
    notificationStore.error(message);
  } finally {
    loading.value = false;
  }
};

const searchDebounceTimer = ref(null);
const debouncedSearch = () => {
    clearTimeout(searchDebounceTimer.value);
    searchDebounceTimer.value = setTimeout(() => {
        fetchDocuments(1);
    }, 400);
};

const openUploadModal = () => {
    isEditing.value = false;
    editingItem.value = null;
    form.value = { 
        document_name: '', 
        computer_card_number: '', 
        company_name: '', 
        company_id: '',
        upload_date: new Date().toISOString().substring(0, 10),
        salary_month: new Date().toISOString().substring(0, 7)
    };
    selectedFile.value = null;
    errors.value = {};
    showModal.value = true;
};

const openEditModal = (item) => {
    isEditing.value = true;
    editingItem.value = item;
    form.value = { 
        document_name: item.document_name || '', 
        computer_card_number: item.computer_card_number || '', 
        company_name: item.company_name || '', 
        company_id: item.company_id || '',
        upload_date: item.upload_date ? item.upload_date.substring(0, 10) : new Date().toISOString().substring(0, 10),
        salary_month: item.salary_month || ''
    };
    selectedFile.value = null;
    errors.value = {};
    showModal.value = true;
};

const handleFileChange = (e) => {
    selectedFile.value = e.target.files[0];
};

const handleSubmit = async () => {
    if (isEditing.value) {
        handleUpdate();
    } else {
        handleUpload();
    }
};

const handleUpload = async () => {
    if (!form.value.document_name) {
        notificationStore.error('Please enter Document Name');
        return;
    }
    if (!form.value.company_id && !form.value.company_name) {
        notificationStore.error('Please select Company Name');
        return;
    }
    if (!form.value.computer_card_number) {
        notificationStore.error('Computer Card Number is required');
        return;
    }
    if (!form.value.upload_date) {
        notificationStore.error('Please select Upload Date');
        return;
    }
    if (!form.value.salary_month) {
        notificationStore.error('Please select Salary Month');
        return;
    }
    if (!selectedFile.value) {
        notificationStore.error('Please select a document file');
        return;
    }

    submitting.value = true;
    errors.value = {};

    try {
        const formData = new FormData();
        formData.append('document_name', form.value.document_name);
        if (form.value.computer_card_number) formData.append('computer_card_number', form.value.computer_card_number);
        if (form.value.company_name) formData.append('company_name', form.value.company_name);
        if (form.value.company_id) formData.append('company_id', form.value.company_id);
        if (form.value.upload_date) formData.append('upload_date', form.value.upload_date);
        if (form.value.salary_month) formData.append('salary_month', form.value.salary_month);
        formData.append('file', selectedFile.value);

        await employeeListMoiService.upload(formData);
        notificationStore.success('Employee List MOI uploaded successfully');
        showModal.value = false;
        fetchDocuments(1);
    } catch (err) {
        console.error('Upload error:', err);
        if (err.response?.status === 422) {
            errors.value = err.response.data.errors;
            notificationStore.error('Please fix validation errors');
        } else {
            const message = err.response?.data?.message || 'Failed to upload document';
            notificationStore.error(message);
        }
    } finally {
        submitting.value = false;
    }
};

const handleUpdate = async () => {
    if (!form.value.document_name) {
        notificationStore.error('Please enter Document Name');
        return;
    }
    if (!form.value.company_id && !form.value.company_name) {
        notificationStore.error('Please select Company Name');
        return;
    }
    if (!form.value.computer_card_number) {
        notificationStore.error('Computer Card Number is required');
        return;
    }
    if (!form.value.upload_date) {
        notificationStore.error('Please select Upload Date');
        return;
    }
    if (!form.value.salary_month) {
        notificationStore.error('Please select Salary Month');
        return;
    }

    submitting.value = true;
    errors.value = {};

    try {
        const formData = new FormData();
        formData.append('document_name', form.value.document_name);
        if (form.value.computer_card_number) formData.append('computer_card_number', form.value.computer_card_number);
        if (form.value.company_name) formData.append('company_name', form.value.company_name);
        if (form.value.company_id) formData.append('company_id', form.value.company_id);
        if (form.value.upload_date) formData.append('upload_date', form.value.upload_date);
        if (form.value.salary_month) formData.append('salary_month', form.value.salary_month);

        if (selectedFile.value) {
            formData.append('file', selectedFile.value);
        }

        await employeeListMoiService.update(editingItem.value.id, formData);
        notificationStore.success('Document updated successfully');
        showModal.value = false;
        fetchDocuments(pagination.value.current_page || 1);
    } catch (err) {
        console.error('Update error:', err);
        if (err.response?.status === 422) {
            errors.value = err.response.data.errors;
            notificationStore.error('Please fix validation errors');
        } else {
            const message = err.response?.data?.message || 'Failed to update document';
            notificationStore.error(message);
        }
    } finally {
        submitting.value = false;
    }
};

const confirmDelete = (doc) => {
    itemToDelete.value = doc;
    showConfirmModal.value = true;
};

const deleteDocument = async () => {
    if (!itemToDelete.value) return;
    deleting.value = true;
    try {
        await employeeListMoiService.delete(itemToDelete.value.id);
        notificationStore.success('Document deleted successfully');
        showConfirmModal.value = false;
        fetchDocuments(1);
    } catch (err) {
        notificationStore.error('Failed to delete document');
    } finally {
        deleting.value = false;
    }
};

const downloadDocument = async (doc) => {
    try {
        const response = await employeeListMoiService.download(doc.id);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', doc.file_name || 'employee_list_moi.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Download error:', err);
        notificationStore.error('Failed to download document');
    }
};

const viewDocument = async (doc) => {
    try {
        const response = await employeeListMoiService.download(doc.id);
        const contentType = response.headers['content-type'] || 'application/pdf';
        const blob = new Blob([response.data], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (err) {
        console.error('View error:', err);
        notificationStore.error('Failed to view document');
    }
};

const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' }).toLowerCase();
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatSalaryMonth = (val) => {
  if (!val) return '-';
  // If val is YYYY-MM
  const parts = val.split('-');
  if (parts.length === 2) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (months[monthIndex]) {
      return `${months[monthIndex]} ${year}`;
    }
  }
  return val;
};

onMounted(() => {
    if (headerRef.value) {
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isScrolled.value = !entry.isIntersecting;
            });
        }, {
            threshold: 0,
            rootMargin: '-80px 0px 0px 0px'
        });
        observer.observe(headerRef.value);
    }
    
    fetchCompanies();
    fetchDocuments();
});

onUnmounted(() => {
    if (observer) {
        observer.disconnect();
    }
});
</script>
