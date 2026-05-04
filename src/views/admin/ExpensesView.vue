<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Expenses</h1>
        <p class="text-slate-500 dark:text-slate-400">Track and manage your daily business expenditures</p>
      </div>
      <div class="flex gap-3">
        <button @click="$router.push({ name: 'admin-expense-categories' })" class="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 font-black uppercase tracking-widest text-[10px]">
          <svg class="w-4 h-4 text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          Categories
        </button>
        <button v-if="authStore.hasPermission('expense_create')" @click="openModal(null, 'Company')" class="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 font-black uppercase tracking-widest text-[10px]">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          Add Company Expense
        </button>
        <button v-if="authStore.hasPermission('expense_create')" @click="openModal(null, 'Employee')" class="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 font-black uppercase tracking-widest text-[10px]">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          Add Employee Expense
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Total Expenses -->
      <div class="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex items-center gap-6 group transition-all hover:shadow-md hover:-translate-y-1">
        <div class="w-16 h-16 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm font-black text-xl">∑</div>
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Expenses</p>
          <p class="text-2xl font-black text-slate-800 dark:text-white leading-none">QAR {{ stats.this_month?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00' }}</p>
          <p class="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">This Month</p>
        </div>
      </div>

      <!-- Employee Related -->
      <div class="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex items-center gap-6 group transition-all hover:shadow-md hover:-translate-y-1">
        <div class="w-16 h-16 bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
           <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </div>
        <div>
          <p class="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Employee Related</p>
          <p class="text-2xl font-black text-slate-800 dark:text-white leading-none">QAR {{ stats.this_month_employee?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00' }}</p>
          <p class="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Deducted from profit</p>
        </div>
      </div>

      <!-- Company Related -->
      <div class="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex items-center gap-6 group transition-all hover:shadow-md hover:-translate-y-1">
        <div class="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </div>
        <div>
          <p class="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Company Operations</p>
          <p class="text-2xl font-black text-slate-800 dark:text-white leading-none">QAR {{ stats.this_month_company?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00' }}</p>
          <p class="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Paid from profit</p>
        </div>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
      <div class="relative w-full md:w-96 group">
        <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-blue-500 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </span>
        <input v-model="search" @input="debouncedSearch" type="text" placeholder="Search by contract or category..." 
               class="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white font-medium">
      </div>

      <div class="flex items-center gap-4 w-full md:w-auto md:ml-auto">
        <div class="flex items-center gap-2">
            <DateInput 
              label="Start Date"
              v-model="startDate"
              @change="fetchExpenses(1)"
            />
            <DateInput 
              label="End Date"
              v-model="endDate"
              @change="fetchExpenses(1)"
            />
        </div>

        <button v-if="search || startDate || endDate" @click="resetFilters" class="p-3 text-slate-400 hover:text-rose-500 transition-all bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700" title="Reset Filters">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </button>

        <button @click="handleDownload" :disabled="downloading" class="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50">
          <svg v-if="!downloading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          {{ downloading ? 'Exporting...' : 'Download Excel' }}
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm shadow-slate-100">
        <div class="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
        <p class="mt-6 text-slate-400 font-black uppercase tracking-widest text-[10px]">Synchronizing Records...</p>
    </div>
    
    <DataTable v-else
      :columns="columns" 
      :data="expenses" 
      :pagination="pagination"
      @page-change="fetchExpenses">
      
      <template #expense_date="{ value }">
        <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-blue-500"></div>
            <span class="font-black text-slate-800 dark:text-slate-200 tracking-tight">
                {{ formatDate(value) }}
            </span>
        </div>
      </template>

      <template #contract="{ row }">
        <div v-if="row.contract" class="flex flex-col">
            <span class="text-sm font-black text-slate-800 dark:text-white tracking-tight">{{ row.contract.staff?.name }} Contract</span>
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{{ row.contract.company?.name || 'Individual' }}</span>
        </div>
        <span v-else class="text-[10px] font-black text-slate-300 uppercase tracking-widest">General Expense</span>
      </template>

      <template #category="{ row }">
        <div class="flex flex-col">
            <span class="text-xs font-black text-slate-700 dark:text-slate-300">{{ row.category?.name || 'N/A' }}</span>
            <span v-if="row.subcategory" class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{{ row.subcategory?.name }}</span>
        </div>
      </template>

      <template #amount="{ value }">
        <div class="flex items-baseline gap-1">
            <span class="text-[10px] font-black text-slate-400">QAR</span>
            <span class="text-lg font-black text-rose-600 dark:text-rose-400 tracking-tight">{{ parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
        </div>
      </template>

      <template #actions="{ row }">
        <div class="flex items-center gap-2">
          <button @click="openModal(row, null, true)" class="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all" title="View Details">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
          <button v-if="authStore.hasPermission('expense_edit')" @click="openModal(row)" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all" title="Edit">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
          <button v-if="authStore.hasPermission('expense_delete')" @click="confirmDelete(row)" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all" title="Delete">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Expense Modal -->
    <Modal :show="showModal" :title="viewMode ? `${currentType} Expense Details` : (editMode ? `Edit ${currentType} Expense` : `Record ${currentType} Expense`)" @close="showModal = false" maxWidth="4xl">
      <form @submit.prevent="saveExpense" class="p-8 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Date -->
          <DateInput 
            label="Expense Date"
            v-model="form.expense_date"
            required
          />

          <!-- Contract Linking (Only for Employee type) -->
          <div v-if="currentType === 'Employee'">
            <SearchableSelect 
              label="Link to Staff Contract"
              v-model="form.contract_id"
              :options="contractsList"
              placeholder="Select Staff Member's Contract"
              required
            />
            
            <!-- Prefilled Company Confirmation -->
            <div v-if="selectedContractCompany" class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl animate-in fade-in slide-in-from-top-1">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-lg">
                        {{ selectedContractCompany.charAt(0) }}
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-0.5">
                            <p class="text-[9px] font-black text-blue-500 uppercase tracking-widest">Assigned Client / Company</p>
                            <span v-if="selectedContractCompany !== 'Individual'" class="px-1.5 py-0.5 bg-blue-600 text-white text-[8px] font-black rounded uppercase tracking-tight">Active Assignment</span>
                        </div>
                        <p class="text-base font-black text-slate-800 dark:text-white leading-tight uppercase tracking-tight">{{ selectedContractCompany }}</p>
                        <div class="flex flex-wrap items-center gap-x-3 mt-1">
                            <p v-if="selectedContractProfession" class="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <svg class="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                                Staff Profession: {{ selectedContractProfession }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <p v-else class="mt-2 text-[9px] text-blue-500 font-bold uppercase tracking-widest italic animate-pulse">* Required for employee expenses</p>
          </div>
          <div v-else class="flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white/50 dark:bg-slate-900/30">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Company Level Expense<br><span class="text-[8px] font-bold lowercase opacity-50">(No contract required)</span></p>
          </div>

          <!-- Category -->
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Main Category</label>
            <select v-model="form.category_id" required @change="handleCategoryChange" class="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white font-bold">
                <option value="">Select Category</option>
                <option v-for="cat in mainCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>

          <!-- Subcategory -->
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Sub Category</label>
            <select v-model="form.subcategory_id" :disabled="!availableSubcategories.length" class="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white font-bold disabled:opacity-50">
                <option value="">No Subcategory</option>
                <option v-for="sub in availableSubcategories" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
            </select>
          </div>

          <!-- Validation Date (Only for QID/PP Renewal) -->
          <div v-if="showValidationDateField" class="animate-in fade-in slide-in-from-top-2 duration-300">
            <DateInput 
              label="New Validation/Expiry Date"
              v-model="form.validation_date"
              required
            />
          </div>
          
          <!-- Reason -->
          <div class="md:col-span-2">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Reason / Expense Name</label>
            <input v-model="form.description" type="text" required class="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white font-bold tracking-tight placeholder:font-medium" placeholder="e.g., Office Supplies, Staff Transport, etc.">
          </div>

          <!-- Amount & Method -->
          <div class="grid grid-cols-2 gap-4 md:col-span-2">
            <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Amount (QAR)</label>
                <div class="relative">
                    <span class="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">QAR</span>
                    <input v-model="form.amount" type="number" step="0.01" required class="w-full pl-14 pr-5 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white font-black text-2xl" placeholder="0.00">
                </div>
            </div>
            <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Payment Method</label>
                <select v-model="form.payment_method" class="w-full px-5 py-[22px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white font-bold">
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                    <option value="Check">Check</option>
                </select>
            </div>
          </div>
        </div>
      </form>
      <template #footer>
        <div class="flex items-center justify-between w-full p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800">
            <button @click="showModal = false" class="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">{{ viewMode ? 'Close' : 'Cancel' }}</button>
            <button v-if="!viewMode" @click="saveExpense" class="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/20 transition-all font-black text-[10px] uppercase tracking-[0.2em] transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-3" :disabled="saving">
            <svg v-if="!saving" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            {{ saving ? 'Verifying...' : 'Confirm & Save' }}
            </button>
        </div>
      </template>
    </Modal>
    <!-- Confirm Delete Modal -->
    <ConfirmModal 
      :show="showConfirmModal" 
      title="Delete Expense Record"
      :message="`Are you sure you want to delete this expense of ${itemToDelete?.amount}? This action cannot be undone.`"
      :loading="deleting"
      @confirm="deleteExpense"
      @cancel="showConfirmModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import DataTable from '@/components/shared/DataTable.vue';
import Modal from '@/components/shared/Modal.vue';
import ConfirmModal from '@/components/shared/ConfirmModal.vue';
import SearchableSelect from '@/components/shared/SearchableSelect.vue';
import DateInput from '@/components/shared/DateInput.vue';
import { expenseService, expenseCategoryService, contractService } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const route = useRoute();

const expenses = ref([]);
const stats = ref({
    this_month: 0,
    last_month: 0,
    yearly: 0
});
const loading = ref(true);
const saving = ref(false);
const downloading = ref(false);
const search = ref('');
const startDate = ref('');
const endDate = ref('');
const pagination = ref({});

const showModal = ref(false);
const showConfirmModal = ref(false);
const itemToDelete = ref(null);
const deleting = ref(false);

watch(() => route.query.filter, (newFilter) => {
    filterType.value = newFilter || '';
    fetchExpenses(1);
});
const editMode = ref(false);
const viewMode = ref(false);
const filterType = ref('');

const form = ref({
  id: null,
  category_id: null,
  subcategory_id: null,
  amount: 0,
  expense_date: new Date().toISOString().split('T')[0],
  validation_date: null,
  payment_method: 'Cash',
  description: '',
  contract_id: null,
  staff_id: null,
  company_id: null
});

const allCategories = ref([]);
const currentType = ref('Company');

const mainCategories = computed(() => {
    return allCategories.value.filter(c => !c.parent_id && (c.target_type === currentType.value));
});
const availableSubcategories = computed(() => {
    if (!form.value.category_id) return [];
    return allCategories.value.filter(c => c.parent_id == form.value.category_id);
});

const contractsList = ref([]);
const rawContracts = ref([]);

const selectedContractStaffName = computed(() => {
    if (!form.value.contract_id) return '';
    const contract = rawContracts.value.find(c => c.id == form.value.contract_id);
    return contract?.staff?.name || '';
});

const selectedContractCompany = computed(() => {
    if (!form.value.contract_id) return '';
    const contract = rawContracts.value.find(c => c.id == form.value.contract_id);
    // Use company name from staff if available, otherwise Individual
    return contract?.staff?.company?.name || contract?.staff?.company_name || 'Individual';
});

const selectedContractProfession = computed(() => {
    if (!form.value.contract_id) return '';
    const contract = rawContracts.value.find(c => c.id == form.value.contract_id);
    return contract?.staff?.profession || '';
});

// Auto-suggest description based on selection
watch([() => form.value.contract_id, () => form.value.category_id], ([newContractId, newCatId]) => {
    if (currentType.value === 'Employee' && newContractId && newCatId && !editMode.value) {
        const staffName = selectedContractStaffName.value;
        const category = allCategories.value.find(c => c.id == newCatId);
        if (staffName && category && !form.value.description) {
            form.value.description = `${staffName} - ${category.name}`;
        }
    }
});

const columns = [
  { key: 'expense_date', label: 'Date', sortable: true },
  { key: 'contract', label: 'Contract', sortable: false },
  { key: 'category', label: 'Category', sortable: false },
  { key: 'description', label: 'Reason', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false }
];

const showValidationDateField = computed(() => {
    if (!form.value.subcategory_id) return false;
    const sub = allCategories.value.find(s => s.id === form.value.subcategory_id);
    if (!sub) return false;
    const name = sub.name.toLowerCase();
    return name.includes('qid') || name.includes('passport') || name.includes('pp');
});

const handleCategoryChange = () => {
    form.value.subcategory_id = '';
};

const fetchResources = async () => {
    try {
        const [catsRes, contractsRes] = await Promise.all([
            expenseCategoryService.getAll(),
            contractService.getAll({ per_page: 1000 })
        ]);
        allCategories.value = catsRes.data;
        rawContracts.value = contractsRes.data.data;
        contractsList.value = contractsRes.data.data.map(c => ({
            id: c.id,
            name: c.staff?.name,
            qid_number: c.staff?.qid_number,
            mobile: c.staff?.mobile,
            company_name: c.staff?.company?.name || 'Individual'
        }));
    } catch (err) {
        console.error('Failed to fetch resources', err);
    }
};

const searchDebounceTimer = ref(null);

const debouncedSearch = () => {
    clearTimeout(searchDebounceTimer.value);
    searchDebounceTimer.value = setTimeout(() => {
        fetchExpenses(1);
    }, 400);
};

const fetchExpenses = async (page = 1) => {
  loading.value = true;
  try {
    const res = await expenseService.getAll({
      page,
      search: search.value,
      start_date: startDate.value,
      end_date: endDate.value,
      contract_id: filterType.value === 'overheads' ? 'null' : undefined
    });
    // Our updated controller returns { expenses, stats }
    expenses.value = res.data.expenses.data;
    pagination.value = res.data.expenses;
    stats.value = res.data.stats;
  } catch (err) {
    console.error('Failed to fetch expenses', err);
    notificationStore.error(err.response?.data?.message || 'Failed to load expenses');
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
    search.value = '';
    startDate.value = '';
    endDate.value = '';
    clearTimeout(searchDebounceTimer.value);
    fetchExpenses(1);
};

const handleDownload = async () => {
    downloading.value = true;
    try {
        const response = await expenseService.export({
            search: search.value,
            start_date: startDate.value,
            end_date: endDate.value,
            contract_id: filterType.value === 'overheads' ? 'null' : undefined
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Expenses_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        notificationStore.success('Excel file downloaded successfully');
    } catch (error) {
        console.error('Download failed:', error);
        notificationStore.error('Failed to download Excel file');
    } finally {
        downloading.value = false;
    }
};

const openModal = async (expense = null, type = 'Company', isView = false) => {
  viewMode.value = isView;
  currentType.value = type;
  if (expense) {
    editMode.value = !isView;
    // Find category type from allCategories if not provided
    const cat = allCategories.value.find(c => c.id == expense.category_id);
    if (cat) currentType.value = cat.target_type || 'Company';
    
    form.value = { 
        ...expense,
        expense_date: expense.expense_date.split('T')[0],
        validation_date: expense.validation_date ? expense.validation_date.split('T')[0] : null,
        category_id: expense.category_id || null,
        subcategory_id: expense.subcategory_id || null,
        contract_id: expense.contract_id || null,
        payment_method: expense.payment_method || 'Cash'
    };
  } else {
    editMode.value = false;
    form.value = { 
        id: null, 
        category_id: null,
        subcategory_id: null,
        amount: 0,
        expense_date: new Date().toISOString().split('T')[0],
        validation_date: null,
        payment_method: 'Cash',
        description: '',
        contract_id: null,
        staff_id: null,
        company_id: null
    };
  }
  showModal.value = true;
};

const saveExpense = async () => {
  saving.value = true;
  try {
    const payload = { ...form.value };
    
    // Sanitize payload: convert empty strings/values to null for backend validation
    payload.amount = parseFloat(payload.amount) || 0;
    payload.category_id = payload.category_id || null;
    payload.subcategory_id = payload.subcategory_id || null;
    payload.validation_date = payload.validation_date || null;
    payload.contract_id = payload.contract_id || null;
    payload.staff_id = payload.staff_id || null;
    payload.company_id = payload.company_id || null;
    
    if (editMode.value) {
      await expenseService.update(payload.id, payload);
      notificationStore.success('Expense record updated');
    } else {
      await expenseService.create(payload);
      notificationStore.success('Expense recorded successfully');
    }
    showModal.value = false;
    fetchExpenses(pagination.value?.current_page || 1);
  } catch (err) {
    console.error('Save error:', err.response?.data);
    const msg = err.response?.data?.message || 'Failed to save expense';
    notificationStore.error(msg);
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (expense) => {
  itemToDelete.value = expense;
  showConfirmModal.value = true;
};

const deleteExpense = async () => {
  if (!itemToDelete.value) return;
  deleting.value = true;
  try {
    await expenseService.delete(itemToDelete.value.id);
    showConfirmModal.value = false;
    itemToDelete.value = null;
    notificationStore.success('Expense record removed');
    fetchExpenses(pagination.value?.current_page || 1);
  } catch (err) {
    console.error('Delete error:', err.response?.data);
    notificationStore.error('Failed to delete expense');
  } finally {
    deleting.value = false;
  }
};

const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' }).toLowerCase();
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

onMounted(async () => {
    await fetchResources();
    await fetchExpenses();
    
    // Check if we came from categories page with a quick-add request
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('category_id');
    if (categoryId) {
        const cat = allCategories.value.find(c => c.id == categoryId);
        if (cat) {
            openModal(null, cat.target_type);
            form.value.category_id = categoryId;
        }
    }

    const overheadsFilter = urlParams.get('filter');
    if (overheadsFilter === 'overheads') {
        filterType.value = 'overheads';
        await fetchExpenses(1);
    }
});
</script>

<style scoped>
/* Custom animations for the summary cards */
.grid > div {
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
</style>
