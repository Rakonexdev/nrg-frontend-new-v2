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

    <!-- Search and Filters -->
    <div ref="searchBarRef" :class="[
           'relative flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-2xl border transition-all duration-300 shadow-sm',
           isScrolled 
             ? 'sticky top-[-32px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-md z-30' 
             : 'bg-white dark:bg-slate-900/50 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50 z-20'
         ]">
        <div class="flex items-center gap-4 w-full md:w-auto flex-1">
            <div class="relative w-full md:w-96">
                <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                </span>
                <input v-model="searchQuery" type="text" placeholder="Search by company or profession..." 
                       class="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
            </div>
            
            <transition name="fade-slide-horizontal">
              <button v-if="isScrolled && (authStore.hasPermission('company_visa_create') || authStore.isSuperAdmin)" @click="openModal()" class="flex items-center gap-2 px-5 py-2.5 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl shadow-lg shadow-[#29166e]/30 transition-all font-bold text-xs shrink-0 transform hover:-translate-y-0.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                Add Slot
              </button>
            </transition>
        </div>
        
        <div class="flex items-center gap-3 w-full md:w-auto">
            <select v-model="perPage" @change="currentPage = 1" class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none dark:text-white font-bold appearance-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm">
                <option :value="10">10 / pg</option>
                <option :value="15">15 / pg</option>
                <option :value="30">30 / pg</option>
                <option :value="50">50 / pg</option>
            </select>
        </div>
    </div>

    <!-- Data Table -->
    <DataTable v-if="!loading"
      :columns="columns" 
      :data="paginatedVisas"
      :pagination="computedPagination"
      :stickyTop="tableStickyTop"
      @page-change="page => currentPage = page">
      
      <template #company_info="{ row }">
        <div class="flex flex-col gap-0.5">
          <span class="font-bold text-slate-800 dark:text-white">{{ row.company_name }}</span>
          <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">CC: {{ row.computer_code }}</span>
        </div>
      </template>

      <template #total_slots="{ row, toggleExpand, isExpanded }">
        <button @click="toggleExpand" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors">
          <span class="text-xs font-black uppercase tracking-widest">{{ Math.max(0, row.total_slots - (row.total_used || 0)) }} AVAILABLE SLOTS</span>
          <svg class="w-4 h-4 transition-transform duration-200" :class="isExpanded ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
      </template>

      <template #actions="{ row, toggleExpand }">
        <button @click="toggleExpand" class="px-4 py-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm">
          View Breakdown
        </button>
      </template>

      <template #expanded-row="{ row }">
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700/50 p-5 shadow-inner">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Allocated Professions
            </h4>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
             <div v-for="prof in row.professions" :key="prof.id" class="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 transition-colors shadow-sm group">
                <div class="flex items-center justify-between flex-1 pr-3 border-r border-slate-100 dark:border-slate-700 overflow-hidden">
                 <div class="flex flex-col truncate pr-2">
                    <div class="flex items-center gap-2 truncate">
                      <span class="font-bold text-[15px] text-slate-700 dark:text-slate-200 truncate">{{ prof.profession }}</span>
                      <span v-if="prof.nationality" class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded uppercase tracking-wider">{{ prof.nationality }}</span>
                    </div>
                   <span v-if="prof.vp_number" class="text-[11px] font-bold uppercase tracking-widest mt-1.5 truncate flex items-center gap-2">
                     <span class="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">VP: {{ prof.vp_number }}</span>
                     <span v-if="prof.vp_expiry_date" class="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded">EXP: {{ formatDate(prof.vp_expiry_date) }}</span>
                   </span>
                 </div>
                 <span class="font-mono text-sm font-bold whitespace-nowrap ml-3"
                       :class="(prof.available - (prof.used || 0)) <= 0 ? 'text-red-600 dark:text-red-400' : (prof.available - (prof.used || 0)) <= 2 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-500'">
                   {{ prof.used || 0 }} / {{ prof.available }}
                 </span>
               </div>
               <div class="flex items-center gap-1.5 pl-2 border-l border-slate-100 dark:border-slate-700 ml-2" v-if="(authStore.hasPermission('company_visa_edit') || authStore.hasPermission('company_visa_delete') || authStore.isSuperAdmin)">
                 <button v-if="authStore.hasPermission('company_visa_edit') || authStore.isSuperAdmin" @click="openModal(prof)" class="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-all" title="Edit Slots">
                   <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                 </button>
                 <button v-if="authStore.hasPermission('company_visa_delete') || authStore.isSuperAdmin" @click="deleteSlot(prof)" class="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-all" title="Delete Slots">
                   <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                 </button>
               </div>
             </div>
          </div>
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
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Available <span class="text-red-500">*</span></label>
                    <input v-model.number="form.available" type="number" min="0" required placeholder="e.g. 0"
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
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useNotificationStore } from '@/stores/notification';
import { useAuthStore } from '@/stores/auth';
import { companyService, companyVisaService } from '@/services/api';
import DataTable from '@/components/shared/DataTable.vue';
import Modal from '@/components/shared/Modal.vue';
import SearchableSelect from '@/components/shared/SearchableSelect.vue';
import DateInput from '@/components/shared/DateInput.vue';

const columns = [
    { key: 'company_info', label: 'Company Info', sortable: false },
    { key: 'total_slots', label: 'Total Allocated Slots', sortable: false },
    { key: 'actions', label: 'Breakdown', sortable: false }
];

const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const visas = ref([]);
const loading = ref(false);

const professionOptions = ref([
    { id: 'Software Engineer', name: 'Software Engineer' },
    { id: 'Accountant', name: 'Accountant' },
    { id: 'Driver', name: 'Driver' },
    { id: 'Security Guard', name: 'Security Guard' }
]);

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

watch(searchQuery, () => {
    currentPage.value = 1;
});

const filteredVisas = computed(() => {
    let result = visas.value;
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(v => 
            (v.company?.name || '').toLowerCase().includes(query) || 
            (v.profession || '').toLowerCase().includes(query) ||
            (v.company?.computer_card || '').toLowerCase().includes(query)
        );
    }
    
    const map = {};
    result.forEach(v => {
        const companyName = v.company?.name || 'Unknown';
        const computerCode = v.company?.computer_card || 'No CC';
        const key = `${companyName}|${computerCode}`;
        
        if (!map[key]) {
            map[key] = {
                id: key,
                company_name: companyName,
                computer_code: computerCode,
                professions: [],
                total_slots: 0,
                total_used: 0
            };
        }
        map[key].professions.push({
            id: v.id,
            profession: v.profession,
            available: v.available_slots,
            used: v.used_slots || 0,
            nationality: v.nationality,
            company_id: v.company_id,
            company_name: companyName,
            computer_code: computerCode,
            vp_number: v.vp_number,
            vp_expiry_date: v.vp_expiry_date
        });
        map[key].total_slots += v.available_slots;
        map[key].total_used += (v.used_slots || 0);
    });
    
    return Object.values(map);
});

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
        per_page: perPage.value
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
            available: visa.available,
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

        if (form.value.profession && !professionOptions.value.some(p => p.id === form.value.profession)) {
            professionOptions.value.push({ id: form.value.profession, name: form.value.profession });
        }

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
        if (isScrolled.value && searchBarRef.value) {
            const height = searchBarRef.value.getBoundingClientRect().height;
            tableStickyTop.value = `${height - 32}px`;
        } else {
            tableStickyTop.value = '0px';
        }
    });
    
    if (searchBarRef.value) {
        resizeObserver.observe(searchBarRef.value);
    }

    watch(isScrolled, () => {
        if (isScrolled.value && searchBarRef.value) {
            const height = searchBarRef.value.getBoundingClientRect().height;
            tableStickyTop.value = `${height - 32}px`;
        } else {
            tableStickyTop.value = '0px';
        }
    });
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
