<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Daily Expenses</h1>
        <p class="text-slate-500 dark:text-slate-400">Track and manage your daily business expenditures</p>
      </div>
      <div class="flex gap-3">
        <button @click="openManageCategories()" class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-semibold">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.91 0-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          Categories
        </button>
        <button @click="openModal()" class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 font-semibold">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          Add Expense
        </button>
      </div>
    </div>

    <!-- Filters & Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </div>
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Monthly</p>
          <p class="text-2xl font-black text-slate-800 dark:text-white">QAR {{ totalMonthly.toFixed(2) }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </div>
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Daily (Avg)</p>
          <p class="text-2xl font-black text-slate-800 dark:text-white">QAR {{ (totalMonthly / 30).toFixed(2) }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </div>
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Category</p>
          <p class="text-2xl font-black text-slate-800 dark:text-white">{{ topCategory || 'N/A' }}</p>
        </div>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="relative w-full md:w-96">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </span>
        <input v-model="search" @input="fetchExpenses(1)" type="text" placeholder="Search by category, vendor, description..." 
               class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white">
      </div>
      <div class="flex items-center gap-2">
        <select v-model="categoryFilter" @change="fetchExpenses(1)" class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none dark:text-white">
          <option value="">All Categories</option>
          <option v-for="cat in mainCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
        <input v-model="dateFilter" @change="fetchExpenses(1)" type="date" class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none dark:text-white">
        <button v-if="search || categoryFilter || dateFilter" @click="resetFilters" class="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Reset Filters">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div class="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <p class="mt-4 text-slate-500 font-medium">Loading expenses...</p>
    </div>
    
    <DataTable v-else
      :columns="columns" 
      :data="expenses" 
      :pagination="pagination"
      @page-change="fetchExpenses">
      
      <template #expense_date="{ value }">
        <span class="font-medium text-slate-700 dark:text-slate-300">
            {{ new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }}
        </span>
      </template>

      <template #category="{ row }">
        <div class="flex flex-col">
          <span class="text-sm font-bold text-slate-800 dark:text-white">{{ row.category?.name }}</span>
          <span v-if="row.subcategory" class="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{{ row.subcategory?.name }}</span>
        </div>
      </template>

      <template #contract="{ row }">
        <div class="flex flex-col">
          <span class="text-sm font-bold text-slate-800 dark:text-white">{{ row.contract ? `${row.contract.staff?.name || 'Staff'} Contract` : 'Unlinked' }}</span>
          <span v-if="row.contract" class="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{{ row.contract.start_date }} to {{ row.contract.end_date }}</span>
        </div>
      </template>

      <template #company="{ row }">
        <span class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ row.company?.name || '-' }}</span>
      </template>

      <template #amount="{ value }">
        <span class="font-black text-rose-600 dark:text-rose-400">QAR {{ parseFloat(value).toFixed(2) }}</span>
      </template>

      <template #payment_method="{ value }">
        <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
          {{ value }}
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

    <!-- Expense Modal -->
    <Modal :show="showModal" :title="editMode ? 'Edit Expense' : 'Record New Expense'" @close="showModal = false" maxWidth="2xl">
      <form @submit.prevent="saveExpense" class="p-2">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Expense Date</label>
            <input v-model="form.expense_date" type="date" required class="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white font-medium">
          </div>
          
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Category</label>
            <select v-model="form.category_id" required @change="handleCategoryChange" class="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white font-medium">
              <option value="">Select Category</option>
              <option v-for="cat in mainCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Sub-Category</label>
            <select v-model="form.subcategory_id" class="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!availableSubCategories.length">
              <option value="">{{ availableSubCategories.length ? 'Select Sub-Category' : 'No Sub-categories' }}</option>
              <option v-for="sub in availableSubCategories" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Linked Contract</label>
            <select v-model="form.contract_id" class="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white font-medium">
              <option value="">No linked contract</option>
              <option v-for="contract in contracts" :key="contract.id" :value="contract.id">
                {{ contract.staff?.name || 'Staff' }} - {{ contract.company?.name || 'Company' }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Amount (QAR)</label>
            <input v-model="form.amount" type="number" step="0.01" required class="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white font-bold text-lg" placeholder="0.00">
          </div>

          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Payment Method</label>
            <select v-model="form.payment_method" required class="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white font-medium">
              <option v-for="method in paymentMethods" :key="method" :value="method">{{ method }}</option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Vendor Name</label>
            <input v-model="form.vendor_name" type="text" class="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white font-medium" placeholder="Who did you pay?">
          </div>

          <div class="md:col-span-2">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Description / Notes</label>
            <textarea v-model="form.description" rows="3" class="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white font-medium" placeholder="Add any extra details..."></textarea>
          </div>
        </div>
      </form>
      <template #footer>
        <button @click="showModal = false" class="px-6 py-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-sm transition-colors">Cancel</button>
        <button @click="saveExpense" class="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-xl shadow-blue-500/25 transition-all font-black text-sm transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2" :disabled="saving">
          <svg v-if="!saving" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          {{ saving ? 'Processing...' : 'Save Record' }}
        </button>
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
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from '@/components/shared/DataTable.vue';
import Modal from '@/components/shared/Modal.vue';
import ConfirmModal from '@/components/shared/ConfirmModal.vue';
import { expenseService, expenseCategoryService, contractService } from '@/services/api';
import { useNotificationStore } from '@/stores/notification';

const router = useRouter();
const notificationStore = useNotificationStore();

const expenses = ref([]);
const categories = ref([]);
const contracts = ref([]);
const loading = ref(true);
const saving = ref(false);
const search = ref('');
const categoryFilter = ref('');
const dateFilter = ref('');
const pagination = ref({});

const showModal = ref(false);
const showConfirmModal = ref(false);
const itemToDelete = ref(null);
const deleting = ref(false);
const editMode = ref(false);

const paymentMethods = ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Cheque'];

const form = ref({
  id: null,
  expense_date: new Date().toISOString().split('T')[0],
  category_id: '',
  subcategory_id: '',
  contract_id: '',
  amount: '',
  payment_method: 'Cash',
  vendor_name: '',
  description: ''
});

const columns = [
  { key: 'expense_date', label: 'Date', sortable: true },
  { key: 'contract', label: 'Contract', sortable: false },
  { key: 'company', label: 'Company', sortable: false },
  { key: 'category', label: 'Category', sortable: false },
  { key: 'vendor_name', label: 'Vendor', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true },
  { key: 'payment_method', label: 'Method', sortable: false },
  { key: 'actions', label: 'Actions', sortable: false }
];

const mainCategories = computed(() => categories.value.filter(c => !c.parent_id));

const availableSubCategories = ref([]);

const totalMonthly = computed(() => {
    return expenses.value.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
});

const topCategory = computed(() => {
    if (!expenses.value.length) return '';
    const counts = {};
    expenses.value.forEach(ex => {
        const name = ex.category?.name || 'Unknown';
        counts[name] = (counts[name] || 0) + parseFloat(ex.amount);
    });
    return Object.entries(counts).sort((a,b) => b[1] - a[1])[0][0];
});

const fetchExpenses = async (page = 1) => {
  loading.value = true;
  try {
    const res = await expenseService.getAll({
      page,
      search: search.value,
      category_id: categoryFilter.value,
      date: dateFilter.value
    });
    expenses.value = res.data.data || res.data;
    pagination.value = res.data.meta || res.data;
  } catch (err) {
    console.error('Failed to fetch expenses', err);
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
    try {
        const res = await expenseCategoryService.getAll();
        categories.value = res.data;
    } catch (err) {
        console.error('Failed to fetch categories', err);
    }
};

const fetchContracts = async () => {
    try {
        const res = await contractService.getAll({ per_page: 1000 });
        contracts.value = res.data.data || [];
    } catch (err) {
        console.error('Failed to fetch contracts', err);
    }
};

const resetFilters = () => {
    search.value = '';
    categoryFilter.value = '';
    dateFilter.value = '';
    fetchExpenses(1);
};

const handleCategoryChange = () => {
    if (!form.value.category_id) {
        availableSubCategories.value = [];
        form.value.subcategory_id = '';
        return;
    }
    // Filter subcategories and ensure IDs are treated consistently
    const selectedId = Number(form.value.category_id);
    availableSubCategories.value = categories.value.filter(c => Number(c.parent_id) === selectedId);
    form.value.subcategory_id = '';
};

const openManageCategories = () => {
    router.push({ name: 'admin-expense-categories' });
};

const openModal = async (expense = null) => {
  await fetchCategories();
  await fetchContracts();
  if (expense) {
    editMode.value = true;
    form.value = { 
        ...expense,
        expense_date: expense.expense_date.split('T')[0]
    };
    // Sync subcategories for the edit form
    const catId = Number(expense.category_id);
    availableSubCategories.value = categories.value.filter(c => Number(c.parent_id) === catId);
    form.value.subcategory_id = expense.subcategory_id || '';
  } else {
    editMode.value = false;
    form.value = { 
        id: null, 
        expense_date: new Date().toISOString().split('T')[0],
        category_id: '',
        subcategory_id: '',
        contract_id: '',
        amount: '',
        payment_method: 'Cash',
        vendor_name: '',
        description: ''
    };
    availableSubCategories.value = [];
  }
  showModal.value = true;
};

const saveExpense = async () => {
  saving.value = true;
  try {
    const payload = { ...form.value };
    // Convert empty strings to null for backend validation
    if (!payload.subcategory_id) payload.subcategory_id = null;
    if (!payload.contract_id) payload.contract_id = null;
    if (payload.amount) payload.amount = Number(payload.amount);
    
    if (editMode.value) {
      await expenseService.update(payload.id, payload);
      notificationStore.addNotification('Expense record updated');
    } else {
      await expenseService.create(payload);
      notificationStore.addNotification('Expense recorded successfully');
    }
    showModal.value = false;
    const currentPage = pagination.value?.current_page || 1;
    fetchExpenses(currentPage);
  } catch (err) {
    console.error('Save error:', err.response?.data);
    const msg = err.response?.data?.message || 'Failed to save expense';
    const errors = err.response?.data?.errors;
    
    if (errors) {
        // Concatenate validation errors if they exist
        const errorDetails = Object.values(errors).flat().join(' ');
        notificationStore.addNotification(`${msg}: ${errorDetails}`, 'error', 5000);
    } else {
        notificationStore.addNotification(msg, 'error');
    }
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
    const idToDelete = itemToDelete.value.id;
    await expenseService.delete(idToDelete);
    
    // Close modal and clear item first to prevent UI artifacts
    showConfirmModal.value = false;
    const currentPage = pagination.value?.current_page || 1;
    itemToDelete.value = null;
    
    // Update local state immediately for instant feedback
    expenses.value = expenses.value.filter(e => e.id !== idToDelete);
    
    notificationStore.addNotification('Expense record removed');
    
    // Refetch to ensure everything is in sync
    fetchExpenses(currentPage);
  } catch (err) {
    console.error('Delete error:', err.response?.data);
    const msg = err.response?.data?.message || 'Failed to delete expense';
    notificationStore.addNotification(msg, 'error');
  } finally {
    deleting.value = false;
  }
};

onMounted(() => {
    fetchExpenses();
    fetchCategories();
    fetchContracts();
});
</script>

<style scoped>
/* Custom animations for the summary cards */
.grid > div {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.grid > div:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05);
}
</style>
