<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Companies Management</h1>
        <p class="text-slate-500 dark:text-slate-400">View and manage client companies</p>
      </div>
      <button @click="openModal()" class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 font-semibold">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        Add Company
      </button>
    </div>

    <!-- Filters & Search -->
    <div class="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="relative w-full md:w-96">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </span>
        <input v-model="search" @input="fetchCompanies(1)" type="text" placeholder="Search companies, contact person..." 
               class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white">
      </div>

      <div v-if="statusFilter" class="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg animate-in fade-in slide-in-from-left-4">
        <span class="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider text-nowrap">Status: {{ statusFilter === 'active' ? 'Active Only' : 'Inactive Only' }}</span>
        <button @click="statusFilter = ''; fetchCompanies(1)" class="p-0.5 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition-colors text-blue-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </button>
      </div>

      <div class="flex items-center gap-2">
        <select v-model="perPage" @change="fetchCompanies(1)" class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none dark:text-white">
          <option :value="10">10 per page</option>
          <option :value="25">25 per page</option>
          <option :value="50">50 per page</option>
        </select>
      </div>
    </div>

    <!-- Data Table -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div class="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <p class="mt-4 text-slate-500 font-medium">Loading companies...</p>
    </div>
    
    <DataTable v-else
      :columns="columns" 
      :data="companies" 
      :pagination="pagination"
      :sort-by="sortBy"
      :sort-dir="sortDir"
      @sort="handleSort"
      @page-change="fetchCompanies">
      
      <template #is_active="{ value }">
        <span :class="[
          'px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider',
          value ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        ]">
          {{ value ? 'Active' : 'Inactive' }}
        </span>
      </template>

      <template #actions="{ row }">
        <div class="flex items-center gap-3">
          <button @click="openModal(row)" class="p-1 text-slate-400 hover:text-blue-500 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
          <button @click="confirmDelete(row)" class="p-1 text-slate-400 hover:text-red-500 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Upsert Modal -->
    <Modal :show="showModal" :title="editMode ? 'Edit Company' : 'Add New Company'" @close="showModal = false" maxWidth="md">
      <form @submit.prevent="saveCompany" class="space-y-6">
        <div>
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Company Name</label>
          <input v-model="form.name" type="text" required class="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white font-medium" placeholder="e.g. NRG Solutions">
        </div>
        <div>
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Contact Person</label>
          <input v-model="form.contact_person_name" type="text" class="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white font-medium" placeholder="Full Name">
        </div>
        <div>
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
          <input v-model="form.contact_person_phone" type="text" class="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white font-medium" placeholder="+974 ...">
        </div>
        <div class="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50">
          <input v-model="form.is_active" type="checkbox" id="is_active" class="w-5 h-5 text-blue-600 border-slate-300 rounded-lg focus:ring-blue-500 transition-all">
          <label for="is_active" class="text-sm font-bold text-slate-700 dark:text-slate-300">Active Company</label>
        </div>
      </form>
      <template #footer>
        <button @click="showModal = false" class="px-6 py-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-sm transition-colors">Cancel</button>
        <button @click="saveCompany" class="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg shadow-blue-500/25 transition-all font-black text-sm transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Company' }}
        </button>
      </template>
    </Modal>

    <!-- Confirm Delete Modal -->
    <ConfirmModal 
      :show="showConfirmModal" 
      title="Delete Company"
      :message="`Are you sure you want to delete ${itemToDelete?.name}?`"
      :loading="deleting"
      @confirm="deleteCompany"
      @cancel="showConfirmModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import DataTable from '@/components/shared/DataTable.vue';
import Modal from '@/components/shared/Modal.vue';
import ConfirmModal from '@/components/shared/ConfirmModal.vue';
import { companyService } from '@/services/api';
import { useNotificationStore } from '@/stores/notification';

const notificationStore = useNotificationStore();

const companies = ref([]);
const loading = ref(true);
const saving = ref(false);
const search = ref('');
const sortBy = ref('name');
const sortDir = ref('asc');
const perPage = ref(10);
const pagination = ref({});
const statusFilter = ref('');
const route = useRoute();

const showModal = ref(false);
const showConfirmModal = ref(false);
const itemToDelete = ref(null);
const deleting = ref(false);
const editMode = ref(false);
const form = ref({
  id: null,
  name: '',
  contact_person_name: '',
  contact_person_phone: '',
  is_active: true
});

const columns = [
  { key: 'name', label: 'Company Name', sortable: true },
  { key: 'contact_person_name', label: 'Contact Person', sortable: true },
  { key: 'contact_person_phone', label: 'Phone', sortable: false },
  { key: 'is_active', label: 'Status', sortable: false },
  { key: 'actions', label: 'Actions', sortable: false }
];

const fetchCompanies = async (page = 1) => {
  loading.value = true;
  try {
    const res = await companyService.getAll({
      page,
      search: search.value,
      sort_by: sortBy.value,
      sort_direction: sortDir.value,
      per_page: perPage.value,
      is_active: statusFilter.value === 'active' ? 1 : (statusFilter.value === 'inactive' ? 0 : undefined)
    });
    companies.value = res.data.data;
    pagination.value = res.data.meta;
  } catch (err) {
    console.error('Failed to fetch companies', err);
  } finally {
    loading.value = false;
  }
};

const handleSort = (key) => {
  if (sortBy.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = key;
    sortDir.value = 'asc';
  }
  fetchCompanies(1);
};

const openModal = (company = null) => {
  if (company) {
    editMode.value = true;
    form.value = { ...company };
  } else {
    editMode.value = false;
    form.value = { id: null, name: '', contact_person_name: '', contact_person_phone: '', is_active: true };
  }
  showModal.value = true;
};

const saveCompany = async () => {
  saving.value = true;
  try {
    if (editMode.value) {
      await companyService.update(form.value.id, form.value);
      notificationStore.addNotification('Company updated successfully');
    } else {
      await companyService.create(form.value);
      notificationStore.addNotification('Company added successfully');
    }
    showModal.value = false;
    fetchCompanies(pagination.value.current_page || 1);
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to save company');
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (company) => {
  itemToDelete.value = company;
  showConfirmModal.value = true;
};

const deleteCompany = async () => {
  if (!itemToDelete.value) return;
  
  deleting.value = true;
  try {
    await companyService.delete(itemToDelete.value.id);
    notificationStore.addNotification('Company deleted successfully');
    showConfirmModal.value = false;
    itemToDelete.value = null;
    fetchCompanies(pagination.value.current_page || 1);
  } catch (err) {
    alert('Failed to delete company');
  } finally {
    deleting.value = false;
  }
};

onMounted(() => {
  if (route.query.status) {
    statusFilter.value = route.query.status;
  }
  fetchCompanies();
});
</script>