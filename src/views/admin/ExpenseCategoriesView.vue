<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Expense Categories</h1>
        <p class="text-slate-500 dark:text-slate-400">Manage main categories and their sub-categories</p>
      </div>
      <button @click="$router.back()" class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-semibold text-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        Back to Expenses
      </button>
    </div>

    <!-- Tabbed interface -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mt-8">
      <div class="flex border-b border-slate-200 dark:border-slate-700 p-1">
        <button 
          @click="activeTab = 'main'" 
          :class="[
            'flex-1 py-3 px-6 text-sm font-black transition-all rounded-xl flex items-center justify-center gap-3',
            activeTab === 'main' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
          ]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          Main Categories
        </button>
        <button 
          @click="activeTab = 'sub'" 
          :class="[
            'flex-1 py-3 px-6 text-sm font-black transition-all rounded-xl flex items-center justify-center gap-3',
            activeTab === 'sub' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
          ]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2 1m0 0L10 4m2 1v2.5M4 7l-2 1M4 7l-2-1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1m2 1l2-1m-2 1v-2.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          Sub-Categories
        </button>
      </div>

      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">
                {{ activeTab === 'main' ? 'All Main Categories' : 'All Sub-Categories' }}
            </h3>
            <button @click="openModal()" class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 font-semibold text-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                Add {{ activeTab === 'main' ? 'Main' : 'Sub' }} Category
            </button>
        </div>

        <DataTable 
          :columns="activeTab === 'main' ? mainColumns : subColumns" 
          :data="filteredCategories" 
          :loading="loading">
          
          <template #parent="{ row }">
            <span class="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                {{ row.parent?.name || 'N/A' }}
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
      </div>
    </div>

    <!-- Category Modal -->
    <Modal :show="showModal" :title="editMode ? 'Edit Category' : 'Create New Category'" @close="showModal = false" maxWidth="lg">
      <form @submit.prevent="saveCategory" class="p-2 space-y-6">
        <div>
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Category Name</label>
          <input v-model="form.name" type="text" required class="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white font-medium" placeholder="e.g. Office Supplies">
        </div>

        <div v-if="activeTab === 'sub'">
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Parent Category</label>
          <select v-model="form.parent_id" required class="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white font-medium">
            <option value="">Select Parent</option>
            <option v-for="cat in mainCategoriesOnly" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Description (Optional)</label>
          <textarea v-model="form.description" rows="3" class="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white font-medium" placeholder="What is this category for?"></textarea>
        </div>
      </form>
      <template #footer>
        <button @click="showModal = false" class="px-6 py-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-sm transition-colors">Cancel</button>
        <button @click="saveCategory" class="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-xl shadow-blue-500/25 transition-all font-black text-sm" :disabled="saving">
          {{ saving ? 'Saving...' : (editMode ? 'Update Category' : 'Create Category') }}
        </button>
      </template>
    </Modal>

    <!-- Confirm Delete Modal -->
    <ConfirmModal 
      :show="showConfirmModal" 
      title="Delete Category"
      :message="`Are you sure you want to delete ${itemToDelete?.name}? This might affect existing expense records.`"
      :loading="deleting"
      @confirm="deleteCategory"
      @cancel="showConfirmModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import DataTable from '@/components/shared/DataTable.vue';
import Modal from '@/components/shared/Modal.vue';
import ConfirmModal from '@/components/shared/ConfirmModal.vue';
import { expenseCategoryService } from '@/services/api';
import { useNotificationStore } from '@/stores/notification';

const notificationStore = useNotificationStore();
const categories = ref([]);
const loading = ref(true);
const activeTab = ref('main');
const showModal = ref(false);
const showConfirmModal = ref(false);
const itemToDelete = ref(null);
const saving = ref(false);
const deleting = ref(false);
const editMode = ref(false);

const form = ref({
    id: null,
    name: '',
    parent_id: '',
    description: ''
});

const mainColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'description', label: 'Description', sortable: false },
    { key: 'actions', label: 'Actions', sortable: false }
];

const subColumns = [
    { key: 'name', label: 'Sub-Category', sortable: true },
    { key: 'parent', label: 'Parent Category', sortable: false },
    { key: 'actions', label: 'Actions', sortable: false }
];

const filteredCategories = computed(() => {
    if (activeTab.value === 'main') {
        return categories.value.filter(c => !c.parent_id);
    }
    return categories.value.filter(c => c.parent_id);
});

const mainCategoriesOnly = computed(() => categories.value.filter(c => !c.parent_id));

const fetchCategories = async () => {
    loading.value = true;
    try {
        const res = await expenseCategoryService.getAll();
        categories.value = res.data;
    } catch (err) {
        notificationStore.addNotification('Failed to fetch categories', 'error');
    } finally {
        loading.value = false;
    }
};

const openModal = (category = null) => {
    if (category) {
        editMode.value = true;
        form.value = { ...category };
    } else {
        editMode.value = false;
        form.value = {
            id: null,
            name: '',
            parent_id: activeTab.value === 'sub' ? '' : null,
            description: ''
        };
    }
    showModal.value = true;
};

const saveCategory = async () => {
    saving.value = true;
    try {
        if (editMode.value) {
            await expenseCategoryService.update(form.value.id, form.value);
            notificationStore.addNotification('Category updated');
        } else {
            if (activeTab.value === 'main') form.value.parent_id = null;
            await expenseCategoryService.create(form.value);
            notificationStore.addNotification('Category created');
        }
        showModal.value = false;
        fetchCategories();
    } catch (err) {
        notificationStore.addNotification(err.response?.data?.message || 'Failed to save category', 'error');
    } finally {
        saving.value = false;
    }
};

const confirmDelete = (category) => {
    itemToDelete.value = category;
    showConfirmModal.value = true;
};

const deleteCategory = async () => {
    if (!itemToDelete.value) return;
    deleting.value = true;
    try {
        await expenseCategoryService.delete(itemToDelete.value.id);
        notificationStore.addNotification('Category deleted');
        showConfirmModal.value = false;
        fetchCategories();
    } catch (err) {
        notificationStore.addNotification(err.response?.data?.message || 'Failed to delete category', 'error');
    } finally {
        deleting.value = false;
    }
};

onMounted(fetchCategories);

// Reset form parent_id when switching tabs if modal is closed
watch(activeTab, () => {
    if (!showModal.value) return;
    form.value.parent_id = activeTab.value === 'sub' ? '' : null;
});
</script>
