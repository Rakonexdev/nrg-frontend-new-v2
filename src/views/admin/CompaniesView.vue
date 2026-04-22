<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Company management</h1>
        <p class="text-slate-500 dark:text-slate-400">Manage business partners and clients</p>
      </div>
      <button @click="openModal()" class="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 font-bold text-sm">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        Add Company
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900/50 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div class="relative w-full md:w-96">
            <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            </span>
            <input v-model="searchQuery" @input="fetchCompanies(1)" type="text" placeholder="Search companies by name or card..." 
                   class="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold">
        </div>
        
        <div class="flex items-center gap-3 w-full md:w-auto">
            <SearchableSelect 
                v-model="statusFilter"
                :options="statusOptions"
                @change="fetchCompanies(1)"
                placeholder="All Status"
                class="flex-1 md:w-48"
            />
            <select v-model="perPage" @change="fetchCompanies(1)" class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none dark:text-white font-bold appearance-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm">
                <option :value="10">10 / pg</option>
                <option :value="15">15 / pg</option>
                <option :value="30">30 / pg</option>
                <option :value="50">50 / pg</option>
            </select>
        </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-32 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div class="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
        <p class="mt-6 text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Loading Companies</p>
    </div>

    <!-- Data Table -->
    <DataTable v-if="!loading"
      :columns="columns" 
      :data="companies"
      :pagination="pagination"
      @page-change="fetchCompanies">
      
      <template #name="{ row }">
        <div class="flex flex-col">
          <span class="font-bold text-slate-800 dark:text-white">{{ row.name }}</span>
          <span v-if="row.computer_card" class="text-[10px] text-slate-400 uppercase tracking-widest font-black">{{ row.computer_card }}</span>
        </div>
      </template>

      <template #phone_number="{ row }">
        <div class="flex flex-col">
          <span class="font-semibold text-slate-700 dark:text-slate-300">{{ row.phone_number || 'N/A' }}</span>
          <span v-if="row.alternative_phone_number" class="text-xs text-slate-500">{{ row.alternative_phone_number }}</span>
        </div>
      </template>

      <template #branch_number="{ value }">
        <span class="font-medium text-slate-600 dark:text-slate-400">Branch: {{ value || 'Main' }}</span>
      </template>

      <template #is_active="{ value }">
        <span :class="[
          'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
          value ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
        ]">
          {{ value ? 'Active' : 'Inactive' }}
        </span>
      </template>

      <template #actions="{ row }">
        <div class="flex items-center gap-3">
          <button @click="openModal(row)" class="p-1 text-slate-400 hover:text-blue-500 transition-colors" title="Edit Company">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
          
          <!-- Separate Toggle Action -->
          <button v-if="row.is_active" @click="toggleStatus(row)" class="p-1 text-slate-400 hover:text-red-500 transition-colors" title="Deactivate Company">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
          <button v-else @click="toggleStatus(row)" class="p-1 text-green-500 hover:text-green-600 transition-colors" title="Activate Company">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Add/Edit Modal -->
    <Modal :show="showModal" :title="editMode ? 'Edit Company' : 'Add New Company'" @close="showModal = false" maxWidth="2xl">
      <form @submit.prevent="saveCompany" class="p-8 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
                <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Company Name</label>
                <input v-model="form.name" type="text" required
                       class="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 transition-all font-bold" 
                       placeholder="Enter full company name">
            </div>

            <div>
                <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Computer Card</label>
                <input v-model="form.computer_card" type="text"
                       class="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 transition-all font-bold" 
                       placeholder="ID number">
            </div>

            <div>
                <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Branch Number</label>
                <input v-model="form.branch_number" type="text"
                       class="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 transition-all font-bold" 
                       placeholder="e.g. 001">
            </div>

            <div>
                <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Contact Person</label>
                <input v-model="form.contact_person" type="text"
                       class="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 transition-all font-bold" 
                       placeholder="Full name">
            </div>

            <div>
                <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                <input v-model="form.phone_number" type="text"
                       @input="form.phone_number = form.phone_number.replace(/[^0-9]/g, '')"
                       class="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 transition-all font-bold" 
                       placeholder="Primary contact">
            </div>

            <div>
                <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Alternative Number</label>
                <input v-model="form.alternative_phone_number" type="text"
                       @input="form.alternative_phone_number = form.alternative_phone_number.replace(/[^0-9]/g, '')"
                       class="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 transition-all font-bold" 
                       placeholder="Secondary contact">
            </div>

        </div>

        <div class="flex justify-end gap-4 mt-8">
          <button type="button" @click="showModal = false" class="px-6 py-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-sm transition-colors">Cancel</button>
          <button type="submit" class="px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/25 transition-all font-black text-sm transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2" :disabled="saving">
            {{ saving ? 'Saving...' : (editMode ? 'Update Company' : 'Create Company') }}
          </button>
        </div>
      </form>
    </Modal>
    
    <!-- Status Toggle Confirmation Modal -->
    <ConfirmModal 
      :show="showStatusModal" 
      :title="selectedCompany?.is_active ? 'Deactivate Company' : 'Activate Company'"
      :message="`Are you sure you want to set ${selectedCompany?.name} to ${selectedCompany?.is_active ? 'Inactive' : 'Active'}?`"
      :description="selectedCompany?.is_active ? 'This will hide the company from active lists and disable its related contracts.' : 'This will restore the company to active status.'"
      :variant="selectedCompany?.is_active ? 'danger' : 'success'"
      :confirm-text="selectedCompany?.is_active ? 'Yes, Inactivate' : 'Yes, Activate'"
      :loading="saving"
      @confirm="handleStatusToggle"
      @cancel="showStatusModal = false"
    >
      <template #icon>
        <svg v-if="selectedCompany?.is_active" class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
        <svg v-else class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      </template>
    </ConfirmModal>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { companyService } from '@/services/api';
import { useNotificationStore } from '@/stores/notification';
import DataTable from '@/components/shared/DataTable.vue';
import Modal from '@/components/shared/Modal.vue';
import ConfirmModal from '@/components/shared/ConfirmModal.vue';
import SearchableSelect from '@/components/shared/SearchableSelect.vue';

const columns = [
    { key: 'name', label: 'Company Info', sortable: true },
    { key: 'contact_person', label: 'Contact Person', sortable: true },
    { key: 'phone_number', label: 'Phone & Alternative', sortable: false },
    { key: 'branch_number', label: 'Branch', sortable: true },
    { key: 'is_active', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
];

// Remove dayjs import and use native Date formatting for consistency
const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
};

const notificationStore = useNotificationStore();
const companies = ref([]);
const loading = ref(true);
const saving = ref(false);
const showModal = ref(false);
const showStatusModal = ref(false);
const editMode = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');
const perPage = ref(10);
const pagination = ref({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10
});
const statusOptions = [
    { id: '', name: 'All Status' },
    { id: 'active', name: 'Active Companies' },
    { id: 'inactive', name: 'Inactive Companies' }
];
const selectedCompany = ref(null);

const form = ref({
    name: '',
    computer_card: '',
    branch_number: '',
    contact_person: '',
    phone_number: '',
    alternative_phone_number: '',
    is_active: true
});

const fetchCompanies = async (page = 1) => {
    loading.value = true;
    try {
        const response = await companyService.getAll({ 
            status: statusFilter.value,
            page,
            per_page: perPage.value,
            search: searchQuery.value
        });
        
        const resData = response.data;
        companies.value = resData.data;
        
        // Handle both Resource (meta) and raw Paginator structures
        const meta = resData.meta || resData;
        pagination.value = {
            current_page: meta.current_page,
            last_page: meta.last_page,
            total: meta.total,
            per_page: meta.per_page,
            from: meta.from,
            to: meta.to
        };
    } catch (error) {
        notificationStore.addNotification('Failed to load companies', 'error');
    } finally {
        loading.value = false;
    }
};

const openModal = (company = null) => {
    if (company) {
        editMode.value = true;
        selectedCompany.value = company;
        form.value = { ...company };
    } else {
        editMode.value = false;
        selectedCompany.value = null;
        form.value = {
            name: '',
            computer_card: '',
            branch_number: '',
            contact_person: '',
            phone_number: '',
            alternative_phone_number: '',
            is_active: true
        };
    }
    showModal.value = true;
};

const saveCompany = async () => {
    saving.value = true;
    try {
        if (editMode.value) {
            await companyService.update(selectedCompany.value.id, form.value);
            notificationStore.addNotification('Company updated successfully', 'success');
        } else {
            await companyService.create(form.value);
            notificationStore.addNotification('Company created successfully', 'success');
        }
        showModal.value = false;
        fetchCompanies(editMode.value ? pagination.value.current_page : 1);
    } catch (error) {
        notificationStore.addNotification(error.response?.data?.message || 'Failed to save company', 'error');
    } finally {
        saving.value = false;
    }
};

const toggleStatus = (company) => {
    selectedCompany.value = company;
    showStatusModal.value = true;
};

const handleStatusToggle = async () => {
    if (!selectedCompany.value) return;
    
    saving.value = true;
    const newStatus = !selectedCompany.value.is_active;
    
    try {
        await companyService.update(selectedCompany.value.id, { is_active: newStatus });
        notificationStore.addNotification(`Company is now ${newStatus ? 'Active' : 'Inactive'}`, 'success');
        showStatusModal.value = false;
        fetchCompanies(pagination.value.current_page);
    } catch (error) {
        console.error('Status toggle failed', error);
        const errorMsg = error.response?.data?.message || 'Failed to update company status';
        notificationStore.addNotification(errorMsg, 'error');
    } finally {
        saving.value = false;
    }
};


onMounted(fetchCompanies);
</script>
