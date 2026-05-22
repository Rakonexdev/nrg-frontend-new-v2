<template>
  <div class="space-y-6">
    <div ref="headerRef" class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Collectors Management</h1>
        <p class="text-slate-500 dark:text-slate-400">Manage collector accounts and mobile logins</p>
      </div>
      <button v-if="authStore.hasPermission('collector_create')" @click="openModal()" class="flex items-center gap-2 px-6 py-2.5 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl shadow-lg shadow-[#29166e]/30 transition-all font-bold text-sm transform hover:-translate-y-0.5">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        Add Collector
      </button>
    </div>

    <!-- Filters & Search -->
    <div :class="[
           'transition-all duration-300 flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-2xl border shadow-sm relative z-30 animate-fade-in',
           isScrolled 
             ? 'sticky top-[-32px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-md' 
             : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
         ]">
      <div class="flex items-center gap-3 w-full xl:max-w-xl">
        <div class="relative w-full md:w-96 group">
          <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-[#29166e] transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </span>
          <input v-model="search" @input="fetchCollectors(1)" type="text" placeholder="Search by name, email, or mobile..." 
                 class="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-[#29166e]/10 focus:border-[#29166e] outline-none transition-all dark:text-white font-medium">
        </div>
        <transition name="fade-slide-horizontal">
            <div v-if="isScrolled" class="flex gap-2 shrink-0">
                <button v-if="authStore.hasPermission('collector_create')" @click="openModal()" class="flex items-center gap-2 px-5 py-2.5 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl shadow-lg shadow-[#29166e]/30 transition-all font-bold text-xs shrink-0 transform hover:-translate-y-0.5">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                  Add Collector
                </button>
            </div>
        </transition>
      </div>

      <div class="flex items-center gap-2">
        <select v-model="perPage" @change="fetchCollectors(1)" class="w-full h-[50px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-black outline-none dark:text-white focus:ring-4 focus:ring-[#29166e]/10 transition-all">
          <option :value="10">10 per page</option>
          <option :value="25">25 per page</option>
          <option :value="50">50 per page</option>
        </select>
      </div>
    </div>

    <!-- Data Table -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div class="w-12 h-12 border-4 border-[#29166e]/20 border-t-[#29166e] rounded-full animate-spin"></div>
        <p class="mt-4 text-slate-500 font-medium">Loading collectors...</p>
    </div>

    <DataTable v-else
      :columns="columns" 
      :data="collectors" 
      :pagination="pagination"
      :sort-by="sortBy"
      :sort-dir="sortDir"
      @sort="handleSort"
      @page-change="fetchCollectors">
      
      <template #name="{ row }">
        <div class="flex flex-col">
          <span class="font-bold text-slate-800 dark:text-white">{{ row.name }}</span>
        </div>
      </template>

      <template #mobile="{ row }">
        <span class="text-sm font-black text-slate-700 dark:text-slate-300 tracking-wider">
          +974 {{ formatMobile(row.mobile) }}
        </span>
      </template>

      <template #status="{ value }">
        <span :class="[
          'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
          value === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
        ]">
          {{ value }}
        </span>
      </template>

      <template #actions="{ row }">
        <div class="flex items-center gap-3">
          <button @click="openModal(row, true)" class="p-1 text-slate-400 hover:text-[#29166e] transition-colors" title="View Details">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
          <button v-if="authStore.hasPermission('collector_edit')" @click="openModal(row)" class="p-1 text-slate-400 hover:text-[#29166e] transition-colors" title="Edit Collector">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
          <button v-if="authStore.hasPermission('collector_delete')" @click="confirmDelete(row)" class="p-1 text-slate-400 hover:text-red-500 transition-colors" title="Delete Collector">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Upsert/View Modal -->
    <Modal :show="showModal" :title="viewMode ? 'Collector Details' : (editMode ? 'Edit Collector' : 'Add Collector')" @close="showModal = false" maxWidth="lg">
      <form @submit.prevent="saveCollector" class="space-y-6">
        <div class="space-y-4">
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
            <input v-model="form.name" type="text" :disabled="viewMode"
              :class="[errors.name ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-200 dark:border-slate-700/50', viewMode ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-900/50']"
              class="w-full px-5 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-[#29166e]/20 focus:border-[#29166e] transition-all dark:text-white font-medium" placeholder="Collector Name">
            <p v-if="errors.name" class="mt-1 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{{ errors.name }}</p>
          </div>
          
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email (Mobile Login ID)</label>
            <input v-model="form.email" type="email" :disabled="viewMode"
              :class="[errors.email ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-200 dark:border-slate-700/50', viewMode ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-900/50']"
              class="w-full px-5 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-[#29166e]/20 focus:border-[#29166e] transition-all dark:text-white font-medium" placeholder="collector@nrg.com">
            <p v-if="errors.email" class="mt-1 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{{ errors.email }}</p>
          </div>

          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mobile Number</label>
            <div class="relative group">
                <div class="absolute inset-y-0 left-0 flex items-center pl-4 pr-2 border-r border-slate-200 dark:border-slate-700/50 text-slate-400 font-bold text-xs pointer-events-none group-focus-within:text-[#29166e] transition-colors">
                    +974
                </div>
                <input v-model="form.mobile" type="text" :disabled="viewMode"
                  @input="form.mobile = form.mobile.replace(/[^0-9]/g, '').slice(0, 8)"
                  :class="[errors.mobile ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-200 dark:border-slate-700/50', viewMode ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-900/50']"
                  class="w-full pl-16 pr-5 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-[#29166e]/20 focus:border-[#29166e] transition-all dark:text-white font-medium" placeholder="8-digit number">
            </div>
            <p v-if="errors.mobile" class="mt-1 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{{ errors.mobile }}</p>
          </div>

          <!-- Password Fields -->
          <div v-if="!editMode">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
            <div class="relative">
              <input v-model="form.password" :type="showPassword ? 'text' : 'password'" :disabled="viewMode"
                :class="[errors.password ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-200 dark:border-slate-700/50', viewMode ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-900/50']"
                class="w-full px-5 py-3 pr-12 border rounded-2xl outline-none focus:ring-2 focus:ring-[#29166e]/20 focus:border-[#29166e] transition-all dark:text-white font-medium" placeholder="••••••••">
              <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600">
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{{ errors.password }}</p>
          </div>

          <div v-else-if="editMode && !viewMode" class="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700/50">
            <h3 class="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Change Password <span class="text-slate-400 font-normal normal-case">(Optional)</span></h3>
            
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Old Password</label>
              <div class="relative">
                <input v-model="form.old_password" :type="showPassword ? 'text' : 'password'" 
                  class="w-full px-5 py-3 pr-12 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-[#29166e]/20 focus:border-[#29166e] transition-all dark:text-white font-medium" placeholder="••••••••">
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">New Password</label>
              <div class="relative">
                <input v-model="form.password" :type="showPassword ? 'text' : 'password'" 
                  :class="[errors.password ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-200 dark:border-slate-700/50']"
                  class="w-full px-5 py-3 pr-12 bg-slate-50 dark:bg-slate-900/50 border rounded-2xl outline-none focus:ring-2 focus:ring-[#29166e]/20 focus:border-[#29166e] transition-all dark:text-white font-medium" placeholder="••••••••">
                <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600">
                  <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                </button>
              </div>
              <p v-if="errors.password" class="mt-1 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{{ errors.password }}</p>
            </div>

            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Confirm New Password</label>
              <div class="relative">
                <input v-model="form.password_confirmation" :type="showPassword ? 'text' : 'password'" 
                  :class="[errors.password_confirmation ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-200 dark:border-slate-700/50']"
                  class="w-full px-5 py-3 pr-12 bg-slate-50 dark:bg-slate-900/50 border rounded-2xl outline-none focus:ring-2 focus:ring-[#29166e]/20 focus:border-[#29166e] transition-all dark:text-white font-medium" placeholder="••••••••">
              </div>
              <p v-if="errors.password_confirmation" class="mt-1 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{{ errors.password_confirmation }}</p>
            </div>
          </div>
        </div>
      </form>
      <template #footer>
        <button @click="showModal = false" class="px-6 py-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-sm transition-colors">
          {{ viewMode ? 'Close' : 'Cancel' }}
        </button>
        <button v-if="!viewMode" @click="saveCollector" class="px-8 py-3 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl shadow-lg shadow-[#29166e]/25 transition-all font-black text-sm transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2" :disabled="saving">
          <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          {{ saving ? 'Saving...' : 'Save Collector' }}
        </button>
      </template>
    </Modal>

    <!-- Confirm Delete Modal -->
    <ConfirmModal 
      :show="showConfirmModal" 
      title="Delete Collector"
      :message="`Are you sure you want to delete collector ${itemToDelete?.name}?`"
      :loading="deleting"
      @confirm="deleteCollector"
      @cancel="showConfirmModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import DataTable from '@/components/shared/DataTable.vue';
import Modal from '@/components/shared/Modal.vue';
import ConfirmModal from '@/components/shared/ConfirmModal.vue';
import { collectorService } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const headerRef = ref(null);
const isScrolled = ref(false);
let observer = null;

const collectors = ref([]);
const loading = ref(true);
const saving = ref(false);
const search = ref('');
const sortBy = ref('created_at');
const sortDir = ref('desc');
const perPage = ref(10);
const pagination = ref({});

const showModal = ref(false);
const showConfirmModal = ref(false);
const itemToDelete = ref(null);
const deleting = ref(false);
const editMode = ref(false);
const viewMode = ref(false);
const errors = ref({});

const form = ref({
  id: null,
  name: '',
  email: '',
  mobile: '',
  old_password: '',
  password: '',
  password_confirmation: ''
});

const showPassword = ref(false);

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'mobile', label: 'Mobile Number', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false }
];

const fetchCollectors = async (page = 1) => {
  loading.value = true;
  try {
    const res = await collectorService.getAll({
      page,
      search: search.value,
      sort_by: sortBy.value,
      sort_direction: sortDir.value,
      per_page: perPage.value
    });
    collectors.value = res.data.data;
    const { data, ...meta } = res.data;
    pagination.value = meta;
  } catch (err) {
    console.error('Failed to fetch collectors', err);
    notificationStore.addNotification('Failed to load collectors', 'error');
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
  fetchCollectors(1);
};

const validate = () => {
    errors.value = {};
    if (!form.value.name) errors.value.name = 'Full name is required';
    if (!form.value.email) errors.value.email = 'Email is required';
    else if (!/^.+@.+\..+$/.test(form.value.email)) errors.value.email = 'Invalid email format';
    
    if (!form.value.mobile) {
        errors.value.mobile = 'Mobile number is required';
    }

    if (!editMode.value && !form.value.password) {
        errors.value.password = 'Password is required for new collectors';
    } else if (form.value.password && form.value.password.length < 8) {
        errors.value.password = 'Password must be at least 8 characters';
    }
    
    if (editMode.value && form.value.password) {
        if (!form.value.old_password) {
            errors.value.password = 'Old password is required to change password';
        }
        if (form.value.password !== form.value.password_confirmation) {
            errors.value.password_confirmation = 'Passwords do not match';
        }
    }

    return Object.keys(errors.value).length === 0;
};

const openModal = (collector = null, isView = false) => {
  errors.value = {};
  viewMode.value = isView;
  
  if (collector) {
    editMode.value = !isView;
    showPassword.value = false;
    form.value = { 
        id: collector.id,
        name: collector.name,
        email: collector.email,
        mobile: collector.mobile,
        old_password: '',
        password: isView ? collector.raw_password : '',
        password_confirmation: ''
    };
  } else {
    editMode.value = false;
    showPassword.value = false;
    form.value = {
      id: null, name: '', email: '', mobile: '', old_password: '', password: '', password_confirmation: ''
    };
  }
  showModal.value = true;
};

const saveCollector = async () => {
    if (!validate()) return;
    
    saving.value = true;
    
    try {
        if (editMode.value) {
            await collectorService.update(form.value.id, form.value);
            notificationStore.addNotification('Collector updated successfully');
        } else {
            await collectorService.create(form.value);
            notificationStore.addNotification('Collector added successfully');
        }
        showModal.value = false;
        fetchCollectors(pagination.value?.current_page || 1);
    } catch (err) {
        alert(err.response?.data?.message || 'Validation error. Please check all fields.');
    } finally {
        saving.value = false;
    }
};

const confirmDelete = (collector) => {
  itemToDelete.value = collector;
  showConfirmModal.value = true;
};

const deleteCollector = async () => {
  if (!itemToDelete.value) return;
  
  deleting.value = true;
  try {
    await collectorService.delete(itemToDelete.value.id);
    notificationStore.addNotification('Collector deleted successfully');
    showConfirmModal.value = false;
    itemToDelete.value = null;
    fetchCollectors(pagination.value.current_page || 1);
  } catch (err) {
    alert('Failed to delete collector');
  } finally {
    deleting.value = false;
  }
};

const formatMobile = (val) => {
  if (!val) return '—';
  const s = String(val).replace(/[^0-9]/g, '');
  if (s.length === 8) {
    return s.slice(0, 4) + ' ' + s.slice(4);
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

  fetchCollectors();
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>
