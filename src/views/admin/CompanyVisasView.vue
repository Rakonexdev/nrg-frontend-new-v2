<template>
  <div class="space-y-6">
    <div ref="headerRef" class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Company Visas</h1>
        <p class="text-slate-500 dark:text-slate-400">Manage company visa slots by profession</p>
      </div>
      <button v-if="authStore.hasPermission('company_visa_create') || authStore.isSuperAdmin" @click="openModal()" class="flex items-center gap-2 px-6 py-2.5 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl shadow-lg shadow-[#29166e]/30 transition-all transform hover:-translate-y-0.5 font-bold text-sm">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        Add Company Visa Slots
      </button>
    </div>

    <!-- Sticky Wrapper for KPIs and Filters -->
    <div ref="searchBarRef" class="sticky top-0 z-30 flex flex-col gap-4 pb-4 pt-4 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm -mx-4 px-4 sm:-mx-6 sm:px-6 mb-6">
        <!-- KPIs -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div @click="filterStatus = 'All'" class="bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm flex flex-col justify-center cursor-pointer transition-all transform hover:-translate-y-0.5"
                 :class="filterStatus === 'All' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-slate-800 hover:border-blue-300'">
                <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Slots</span>
                <span class="text-2xl font-black text-blue-600 dark:text-blue-400">{{ kpiTotalSlots }}</span>
            </div>
            <div @click="filterStatus = 'Used'" class="bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm flex flex-col justify-center cursor-pointer transition-all transform hover:-translate-y-0.5"
                 :class="filterStatus === 'Used' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 dark:border-slate-800 hover:border-amber-300'">
                <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Used Slots</span>
                <span class="text-2xl font-black text-amber-500 dark:text-amber-400">{{ kpiUsedSlots }}</span>
            </div>
            <div @click="filterStatus = 'Available'" class="bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm flex flex-col justify-center cursor-pointer transition-all transform hover:-translate-y-0.5"
                 :class="filterStatus === 'Available' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300'">
                <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Available Slots</span>
                <span class="text-2xl font-black text-emerald-600 dark:text-emerald-400">{{ kpiAvailableSlots }}</span>
            </div>
        </div>

        <!-- Search and Filters -->
        <div class="relative flex flex-col gap-4 p-5 rounded-2xl border bg-white dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50 shadow-sm">
         
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div class="xl:col-span-1">
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Company</label>
                <SearchableSelect 
                    v-model="filterCompany" 
                    :options="uniqueCompanies" 
                    placeholder="All Companies" 
                    class="w-full text-sm"
                />
            </div>
            
            <div class="xl:col-span-1">
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Nationality</label>
                <SearchableSelect 
                    v-model="filterNationality" 
                    :options="uniqueNationalities" 
                    placeholder="All Nationalities" 
                    class="w-full text-sm"
                />
            </div>
            
            <div class="xl:col-span-1">
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Profession</label>
                <SearchableSelect 
                    v-model="filterProfession" 
                    :options="uniqueProfessions" 
                    placeholder="All Professions" 
                    class="w-full text-sm"
                />
            </div>


            <div class="xl:col-span-1 flex items-end gap-2">
                <div class="relative w-full">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    </span>
                    <input v-model="searchQuery" type="text" placeholder="Search..." 
                           class="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium">
                </div>
                <button v-if="hasActiveFilters" @click="clearFilters" title="Clear Filters"
                        class="p-3 bg-slate-50 dark:bg-slate-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-slate-400 hover:text-rose-500 rounded-2xl transition-all border border-slate-200 dark:border-slate-700/50 hover:border-rose-200 dark:hover:border-rose-800 flex-shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        </div>
    </div>
    </div>

    <!-- Data Table -->
    <DataTable v-if="!loading"
      :columns="columns" 
      :data="paginatedVisas"
      :pagination="computedPagination"
      :stickyTop="tableStickyTop"
      @page-change="page => currentPage = page">
      
      <template #company="{ row }">
        <div class="flex flex-col gap-0.5">
          <span class="font-bold text-slate-800 dark:text-white">{{ row.company?.name || 'Unknown' }}</span>
          <span v-if="row.company?.computer_card" class="text-[10px] font-black text-slate-500 uppercase tracking-widest">CC: {{ row.company.computer_card }}</span>
        </div>
      </template>

      <template #profession="{ row }">
        <div class="flex flex-col gap-0.5">
          <span class="font-bold text-slate-700 dark:text-slate-300">{{ row.profession }}</span>
          <span v-if="row.vp_number" class="text-[10px] font-black text-blue-500 uppercase tracking-widest">VP: {{ row.vp_number }}</span>
        </div>
      </template>

      <template #nationality="{ row }">
        <span v-if="row.nationality" class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded uppercase tracking-wider">{{ row.nationality }}</span>
        <span v-else class="text-xs text-slate-400">-</span>
      </template>

      <template #used="{ row }">
        <span class="font-bold text-slate-700 dark:text-slate-300">{{ row.used_slots || 0 }}</span>
      </template>

      <template #total="{ row }">
        <span class="font-bold text-slate-700 dark:text-slate-300">{{ row.available_slots }}</span>
      </template>

      <template #available="{ row }">
        <span class="font-bold px-2 py-1 rounded-lg text-xs" :class="(row.available_slots - (row.used_slots || 0)) <= 0 ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'">
            {{ Math.max(0, row.available_slots - (row.used_slots || 0)) }}
        </span>
      </template>

      <template #expiry="{ row }">
        <span v-if="row.vp_expiry_date" class="text-[11px] font-bold px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {{ formatDate(row.vp_expiry_date) }}
        </span>
        <span v-else class="text-xs text-slate-400">-</span>
      </template>

      <template #actions="{ row }">
         <div class="flex items-center gap-1">
            <button v-if="authStore.hasPermission('company_visa_edit') || authStore.isSuperAdmin" @click="openModal(row)" class="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-all" title="Edit">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </button>
            <button v-if="authStore.hasPermission('company_visa_delete') || authStore.isSuperAdmin" @click="deleteSlot(row)" class="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-all" title="Delete">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
         </div>
      </template>
    </DataTable>

    <!-- Add/Edit Modal -->
    <Modal :show="showModal" :title="editMode ? 'Update Company Visa Slots' : 'Add Company Visa Slots'" @close="showModal = false" maxWidth="3xl">
      <form @submit.prevent="saveVisaSlot" class="space-y-6">
        
        <!-- COMPANY INFORMATION -->
        <div class="bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div class="flex items-center gap-2 mb-6">
                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                <h3 class="text-xs font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest">Company Information</h3>
            </div>
            
            <div class="grid grid-cols-1 gap-5">
                <div class="col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Company Name / Computer Card <span class="text-red-500">*</span></label>
                    <SearchableSelect 
                        v-model="form.company_id" 
                        :options="companyOptions" 
                        placeholder="Search & Select Company" 
                        class="w-full font-bold"
                    />
                </div>
            </div>
        </div>

        <!-- AVAILABLE VISA SLOTS BY PROFESSION -->
        <div class="bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div class="flex items-center gap-2 mb-6">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <h3 class="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Available Visa Slots by Profession</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-5 gap-5 items-end">
                <div class="md:col-span-2">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Profession <span class="text-red-500">*</span></label>
                    <SearchableSelect 
                        v-model="form.profession" 
                        :options="professionOptions" 
                        placeholder="Select or Type Profession" 
                        :allowCustom="true"
                        placement="top"
                        class="w-full font-bold"
                    />
                </div>
                
                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Total Slots <span class="text-red-500">*</span></label>
                    <input v-model.number="form.available" type="number" min="0" required placeholder="e.g. 5"
                           class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold text-center">
                </div>

                <div class="md:col-span-2">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Nationality</label>
                    <SearchableSelect 
                        v-model="form.nationality" 
                        :options="countryOptions" 
                        placeholder="Select Nationality" 
                        placement="top"
                        class="w-full font-bold"
                    />
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">VP Number <span class="text-red-500">*</span></label>
                    <input v-model="form.vp_number" type="text" required placeholder="e.g. VP2023XXXXXX"
                           class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                </div>
                
                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">VP Expiry Date <span class="text-red-500">*</span></label>
                    <DateInput v-model="form.vp_expiry_date" required />
                </div>
            </div>
        </div>

        <div class="flex justify-end gap-4 mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
          <button type="button" @click="showModal = false" class="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-xl font-bold text-sm transition-colors shadow-sm">Cancel</button>
          <button type="submit" class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/25 transition-all font-black text-sm transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2" :disabled="saving">
            <svg v-if="!saving" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
            <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ saving ? 'Saving...' : 'Save Slots' }}
          </button>
        </div>
      </form>
    </Modal>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { useNotificationStore } from '@/stores/notification';
import { useAuthStore } from '@/stores/auth';
import { companyService, companyVisaService } from '@/services/api';
import DataTable from '@/components/shared/DataTable.vue';
import Modal from '@/components/shared/Modal.vue';
import SearchableSelect from '@/components/shared/SearchableSelect.vue';
import DateInput from '@/components/shared/DateInput.vue';

const columns = [
    { key: 'company', label: 'Company', sortable: false },
    { key: 'nationality', label: 'Nationality', sortable: false },
    { key: 'profession', label: 'Profession', sortable: false },
    { key: 'used', label: 'Used', sortable: false },
    { key: 'total', label: 'Total', sortable: false },
    { key: 'available', label: 'Available', sortable: false },
    { key: 'expiry', label: 'Expiry Date', sortable: false },
    { key: 'actions', label: 'Actions', sortable: false }
];

const filterCompany = ref('');
const filterNationality = ref('');
const filterProfession = ref('');
const filterStatus = ref('All');

const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const visas = ref([]);
const loading = ref(false);

const defaultProfessions = [
    'Software Engineer',
    'Accountant',
    'Driver',
    'Security Guard'
];

const professionOptions = computed(() => {
    const profs = new Set(defaultProfessions);
    visas.value.forEach(v => {
        if (v.profession) profs.add(v.profession);
    });
    return Array.from(profs).sort().map(p => ({ id: p, name: p }));
});

const companies = ref([]);
const companyOptions = computed(() => {
    return companies.value.map(c => ({
        id: c.id,
        name: `${c.name} - ${c.computer_card || 'N/A'}`
    }));
});

const countryOptions = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Côte d'Ivoire", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. 'Swaziland')", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe", "Other"
].map(c => ({ id: c, name: c }));

const fetchCompanies = async () => {
    try {
        const res = await companyService.getSimple();
        companies.value = res.data;
    } catch (error) {
        console.error('Failed to fetch companies:', error);
    }
};

const saving = ref(false);
const showModal = ref(false);
const editMode = ref(false);
const searchQuery = ref('');
const headerRef = ref(null);
const searchBarRef = ref(null);
const tableStickyTop = ref('0px');
const isScrolled = ref(false);
let observer = null;
let resizeObserver = null;
const currentPage = ref(1);
const perPage = ref(10);

watch([searchQuery, filterCompany, filterNationality, filterProfession, filterStatus], () => {
    currentPage.value = 1;
});

const uniqueCompanies = computed(() => {
    return [
        { id: '', name: 'All Companies' },
        ...companies.value.map(c => ({
            id: c.id,
            name: `${c.name} ${c.computer_card && c.computer_card !== 'No CC' ? ' - CC: ' + c.computer_card : ''}`
        }))
    ];
});

const uniqueNationalities = computed(() => {
    return [
        { id: '', name: 'All Nationalities' },
        ...countryOptions
    ];
});

const uniqueProfessions = computed(() => {
    return [
        { id: '', name: 'All Professions' },
        ...professionOptions.value
    ];
});

const filterStatusOptions = [
    { id: 'All', name: 'All Statuses' },
    { id: 'Available', name: 'Available' },
    { id: 'Used', name: 'Has Used Slots' },
    { id: 'Full', name: 'Full (No Slots)' }
];

const hasActiveFilters = computed(() => {
    return filterCompany.value !== '' || 
           filterNationality.value !== '' || 
           filterProfession.value !== '' || 
           filterStatus.value !== 'All' || 
           searchQuery.value !== '';
});

const clearFilters = () => {
    filterCompany.value = '';
    filterNationality.value = '';
    filterProfession.value = '';
    filterStatus.value = 'All';
    searchQuery.value = '';
};

const filteredVisas = computed(() => {
    let result = visas.value;
    
    if (filterCompany.value) result = result.filter(v => v.company_id === filterCompany.value);
    if (filterNationality.value) result = result.filter(v => v.nationality === filterNationality.value);
    if (filterProfession.value) result = result.filter(v => v.profession === filterProfession.value);
    if (filterStatus.value !== 'All') {
        if (filterStatus.value === 'Available') result = result.filter(v => (v.available_slots - (v.used_slots || 0)) > 0);
        else if (filterStatus.value === 'Used') result = result.filter(v => (v.used_slots || 0) > 0);
        else if (filterStatus.value === 'Full') result = result.filter(v => (v.available_slots - (v.used_slots || 0)) <= 0);
    }

    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter(v => 
            (v.company?.name || '').toLowerCase().includes(q) ||
            (v.profession || '').toLowerCase().includes(q) ||
            (v.nationality || '').toLowerCase().includes(q) ||
            (v.vp_number || '').toLowerCase().includes(q)
        );
    }
    
    return result;
});

const kpiTotalCompanies = computed(() => new Set(filteredVisas.value.map(v => v.company_id)).size);
const kpiTotalSlots = computed(() => filteredVisas.value.reduce((sum, v) => sum + (v.available_slots || 0), 0));
const kpiUsedSlots = computed(() => filteredVisas.value.reduce((sum, v) => sum + (v.used_slots || 0), 0));
const kpiAvailableSlots = computed(() => Math.max(0, kpiTotalSlots.value - kpiUsedSlots.value));

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month.toUpperCase()}-${year}`;
};

const fetchVisas = async () => {
    loading.value = true;
    try {
        const res = await companyVisaService.getAll();
        visas.value = res.data;
    } catch (error) {
        console.error('Failed to fetch visas:', error);
        notificationStore.error('Failed to load company visas');
    } finally {
        loading.value = false;
    }
};

const computedPagination = computed(() => {
    return {
        current_page: currentPage.value,
        last_page: Math.ceil(filteredVisas.value.length / perPage.value) || 1,
        total: filteredVisas.value.length,
        per_page: perPage.value,
        from: filteredVisas.value.length === 0 ? 0 : (currentPage.value - 1) * perPage.value + 1,
        to: Math.min(currentPage.value * perPage.value, filteredVisas.value.length)
    };
});

const paginatedVisas = computed(() => {
    const start = (currentPage.value - 1) * perPage.value;
    const end = start + perPage.value;
    return filteredVisas.value.slice(start, end);
});

const selectedVisa = ref(null);

const form = ref({
    company_id: '',
    company_name: '',
    profession: '',
    available: 0,
    vp_number: '',
    vp_expiry_date: ''
});

watch(() => form.value.company_id, (newId) => {
    if (newId && !editMode.value) {
        const company = companies.value.find(c => c.id === newId);
        if (company) {
            form.value.company_name = company.name;
        }
    }
});

const openModal = (visa = null) => {
    if (visa) {
        editMode.value = true;
        selectedVisa.value = visa;
        form.value = { 
            company_id: visa.company_id,
            company_name: visa.company_name,
            profession: visa.profession,
            available: visa.available_slots,
            nationality: visa.nationality || '',
            vp_number: visa.vp_number || '',
            vp_expiry_date: visa.vp_expiry_date || ''
        };
    } else {
        editMode.value = false;
        selectedVisa.value = null;
        form.value = {
            company_id: '',
            company_name: '',
            profession: '',
            available: 0,
            nationality: '',
            vp_number: '',
            vp_expiry_date: ''
        };
    }
    showModal.value = true;
};

const saveVisaSlot = async () => {
    saving.value = true;
    try {
        const payload = {
            company_id: form.value.company_id,
            profession: form.value.profession,
            available_slots: form.value.available,
            nationality: form.value.nationality,
            vp_number: form.value.vp_number,
            vp_expiry_date: form.value.vp_expiry_date
        };

        if (editMode.value) {
            await companyVisaService.update(selectedVisa.value.id, payload);
            notificationStore.success('Visa slots updated successfully');
        } else {
            await companyVisaService.create(payload);
            notificationStore.success('Visa slots added successfully');
        }

        // The profession options will automatically update when fetchVisas() refreshes the visa list

        showModal.value = false;
        fetchVisas();
    } catch (error) {
        console.error('Failed to save visa slots', error);
        notificationStore.error(error.response?.data?.message || 'Error saving visa slots');
    } finally {
        saving.value = false;
    }
};

const deleteSlot = async (row) => {
    if (confirm('Are you sure you want to delete this visa slot?')) {
        try {
            await companyVisaService.delete(row.id);
            notificationStore.success('Visa slot deleted successfully');
            fetchVisas();
        } catch (error) {
            console.error('Failed to delete visa slot', error);
            notificationStore.error('Failed to delete visa slot');
        }
    }
};

onMounted(() => {
    fetchCompanies();
    fetchVisas();
    
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

    resizeObserver = new ResizeObserver(() => {
        if (searchBarRef.value) {
            const height = searchBarRef.value.getBoundingClientRect().height;
            tableStickyTop.value = `${height}px`;
        }
    });
    
    if (searchBarRef.value) {
        resizeObserver.observe(searchBarRef.value);
    }
});

onUnmounted(() => {
    if (observer) {
        observer.disconnect();
    }
    if (resizeObserver) {
        resizeObserver.disconnect();
    }
});
</script>

<style scoped>
.fade-slide-horizontal-enter-active,
.fade-slide-horizontal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-horizontal-enter-from,
.fade-slide-horizontal-leave-to {
  opacity: 0;
  transform: translateX(-15px);
}
</style>
