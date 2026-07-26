<template>
  <div class="space-y-6">
    <div ref="headerRef" class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Company management</h1>
        <p class="text-slate-500 dark:text-slate-400">Manage business partners and clients</p>
      </div>
      <button v-if="authStore.hasPermission('company_create')" @click="openModal()" class="flex items-center gap-2 px-6 py-2.5 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl shadow-lg shadow-[#29166e]/30 transition-all transform hover:-translate-y-0.5 font-bold text-sm">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        Add Company
      </button>
    </div>

    <!-- Search and Filters -->
    <div :class="[
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
                <input v-model="searchQuery" @input="fetchCompanies(1)" type="text" placeholder="Search companies by name or card..." 
                       class="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
            </div>
            
            <transition name="fade-slide-horizontal">
              <button v-if="isScrolled && authStore.hasPermission('company_create')" @click="openModal()" class="flex items-center gap-2 px-5 py-2.5 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl shadow-lg shadow-[#29166e]/30 transition-all font-bold text-xs shrink-0 transform hover:-translate-y-0.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                Add Company
              </button>
            </transition>
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
        <div class="w-16 h-16 border-4 border-[#29166e]/10 border-t-[#29166e] rounded-full animate-spin"></div>
        <p class="mt-6 text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Loading Companies</p>
    </div>

    <!-- Data Table -->
    <DataTable v-if="!loading"
      :columns="columns" 
      :data="companies"
      :pagination="pagination"
      :rowClass="getRowClass"
      @page-change="fetchCompanies">
      
      <template #name="{ row }">
        <div class="flex flex-col gap-0.5">
          <div>
            <span class="font-bold text-slate-800 dark:text-white">{{ row.name }}</span>
            <span v-if="row.branch_number != null && row.branch_number !== ''" class="text-[11px] font-black text-[#29166e]">({{ row.branch_number }})</span>
          </div>
          <div v-if="row.computer_card" class="flex items-center gap-1.5 mt-0.5">
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">Computer Card: {{ row.computer_card }}</span>
          </div>
        </div>
      </template>

      <template #phone_number="{ row }">
        <div class="flex flex-col">
          <span class="font-bold text-slate-700 dark:text-slate-300">{{ formatMobile(row.phone_number) }}</span>
          <span v-if="row.alternative_phone_number" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ formatMobile(row.alternative_phone_number) }}</span>
        </div>
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
          <button @click="openModal(row, true)" class="p-1 text-slate-400 hover:text-[#29166e] transition-colors" title="View Details">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
          <button v-if="authStore.hasPermission('company_edit')" @click="openModal(row)" class="p-1 text-slate-400 hover:text-[#29166e] transition-colors" title="Edit Company">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
          
          <!-- Separate Toggle Action -->
          <template v-if="authStore.hasPermission('company_edit')">
            <button @click="toggleStatus(row)" class="p-1 transition-colors" :class="row.is_active ? 'text-green-500 hover:text-red-500' : 'text-red-500 hover:text-green-500'" :title="row.is_active ? 'Deactivate Company' : 'Activate Company'">
              <svg v-if="row.is_active" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            </button>
          </template>
          
          <button v-if="authStore.hasPermission('company_delete')" @click="confirmDelete(row)" class="p-1 text-slate-400 hover:text-red-500 transition-colors" title="Delete Company">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Add/Edit/View Modal -->
    <Modal :show="showModal" :title="viewMode ? 'Company Details' : (editMode ? 'Edit Company' : 'Add New Company')" @close="showModal = false" maxWidth="2xl">
      <form @submit.prevent="saveCompany" class="p-8 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
                <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Company Name <span class="text-red-500">*</span></label>
                <input v-model="form.name" type="text" required :disabled="viewMode"
                       @keydown.enter.prevent="handleEnter"
                       :class="[
                           viewMode ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-900',
                           errors.name ? 'ring-4 ring-rose-500/10 border-rose-500' : 'border-none'
                       ]"
                       class="w-full px-5 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-[#29166e]/50 transition-all font-bold" 
                       placeholder="Enter full company name">
                <p v-if="errors.name" class="text-rose-500 text-[10px] mt-1 ml-1 font-bold uppercase tracking-widest">{{ errors.name[0] }}</p>
            </div>

            <div>
                <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Computer Card <span class="text-red-500">*</span></label>
                <input v-model="form.computer_card" type="text" required :disabled="viewMode"
                       @input="form.computer_card = form.computer_card.replace(/[^0-9]/g, '').slice(0, 8)"
                       @keydown.enter.prevent="handleEnter"
                       maxlength="8"
                       :class="[
                           viewMode ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-900',
                           errors.computer_card ? 'ring-4 ring-rose-500/10 border-rose-500' : 'border-none'
                       ]"
                       class="w-full px-5 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-[#29166e]/50 transition-all font-bold" 
                       placeholder="Enter 8-digit Computer Card">
                <p v-if="errors.computer_card" class="text-rose-500 text-[10px] mt-1 ml-1 font-bold uppercase tracking-widest">{{ errors.computer_card[0] }}</p>
            </div>

            <div>
                <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Contact Person <span class="text-red-500">*</span></label>
                <input v-model="form.contact_person" type="text" required :disabled="viewMode"
                       @keydown.enter.prevent="handleEnter"
                       :class="[
                           viewMode ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-900',
                           errors.contact_person ? 'ring-4 ring-rose-500/10 border-rose-500' : 'border-none'
                       ]"
                       class="w-full px-5 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-[#29166e]/50 transition-all font-bold" 
                       placeholder="Full name">
                <p v-if="errors.contact_person" class="text-rose-500 text-[10px] mt-1 ml-1 font-bold uppercase tracking-widest">{{ errors.contact_person[0] }}</p>
            </div>

            <div>
                <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number <span class="text-red-500">*</span></label>
                <div class="relative group">
                    <div class="absolute inset-y-0 left-0 flex items-center px-4 text-sm font-black text-slate-500 border-r border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 rounded-l-2xl pointer-events-none transition-colors group-focus-within:text-[#29166e] group-focus-within:bg-[#29166e]/5">
                        +974
                    </div>
                    <input v-model="form.phone_number" type="text" required :disabled="viewMode"
                           @input="form.phone_number = form.phone_number.replace(/[^0-9]/g, '').slice(0, 8)"
                           @keydown.enter.prevent="handleEnter"
                           minlength="8" maxlength="8"
                           :class="[
                               viewMode ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-900',
                               errors.phone_number ? 'ring-4 ring-rose-500/10 border-rose-500' : 'border-slate-200 dark:border-slate-700'
                           ]"
                           class="w-full pl-20 pr-5 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-[#29166e]/50 border outline-none font-bold transition-all" 
                           placeholder="8-digit number">
                </div>
                <p v-if="errors.phone_number" class="text-rose-500 text-[10px] mt-1 ml-1 font-bold uppercase tracking-widest">{{ errors.phone_number[0] }}</p>
            </div>

            <div>
                <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Alternative Number <span class="text-slate-400 font-normal italic">(Optional)</span></label>
                <div class="relative group">
                    <div class="absolute inset-y-0 left-0 flex items-center px-4 text-sm font-black text-slate-500 border-r border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 rounded-l-2xl pointer-events-none transition-colors group-focus-within:text-[#29166e] group-focus-within:bg-[#29166e]/5">
                        +974
                    </div>
                    <input v-model="form.alternative_phone_number" type="text" :disabled="viewMode"
                           @input="form.alternative_phone_number = form.alternative_phone_number.replace(/[^0-9]/g, '').slice(0, 8)"
                           @keydown.enter.prevent="handleEnter"
                           minlength="8" maxlength="8"
                           :class="[
                               viewMode ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-900',
                               errors.alternative_phone_number ? 'ring-4 ring-rose-500/10 border-rose-500' : 'border-slate-200 dark:border-slate-700'
                           ]"
                           class="w-full pl-20 pr-5 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-[#29166e]/50 border outline-none font-bold transition-all" 
                           placeholder="8-digit number">
                </div>
                <p v-if="errors.alternative_phone_number" class="text-rose-500 text-[10px] mt-1 ml-1 font-bold uppercase tracking-widest">{{ errors.alternative_phone_number[0] }}</p>
            </div>

            <div>
                <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Branch Number <span class="text-red-500">*</span></label>
                <input v-model="form.branch_number" type="text" required :disabled="viewMode"
                       @keydown.enter.prevent="handleEnter"
                       :class="[
                           viewMode ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-900',
                           errors.branch_number ? 'ring-4 ring-rose-500/10 border-rose-500' : 'border-none'
                       ]"
                       class="w-full px-5 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-[#29166e]/50 transition-all font-bold" 
                       placeholder="Branch ID (e.g. 001)">
                <p v-if="errors.branch_number" class="text-rose-500 text-[10px] mt-1 ml-1 font-bold uppercase tracking-widest">{{ errors.branch_number[0] }}</p>
            </div>





        </div>

        <div class="flex justify-end gap-4 mt-8">
          <button type="button" @click="showModal = false" class="px-6 py-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-sm transition-colors">{{ viewMode ? 'Close' : 'Cancel' }}</button>
          <button v-if="!viewMode" type="submit" class="px-10 py-3.5 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-2xl shadow-xl shadow-[#29166e]/25 transition-all font-black text-sm transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2" :disabled="saving">
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

    <!-- Delete Confirmation Modal -->
    <ConfirmModal 
      :show="showDeleteModal" 
      title="Delete Company"
      :message="`Are you sure you want to delete ${companyToDelete?.name}?`"
      description="This action cannot be undone. All related data will be permanently removed."
      variant="danger"
      confirm-text="Yes, Delete Company"
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
    
    <!-- Branches Management Modal -->
    <Modal :show="showBranchModal" :title="`Branches - ${selectedCompany?.name}`" @close="showBranchModal = false" maxWidth="3xl">
        <div class="p-8 space-y-8">
            <!-- Add New Branch Form -->
            <div class="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Add New Branch</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input v-model="branchForm.name" type="text" placeholder="Branch Name" class="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#29166e]/20 font-bold">
                    <input v-model="branchForm.branch_number" type="text" placeholder="Branch Number (e.g. 001)" class="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#29166e]/20 font-bold">
                    <input v-model="branchForm.location" type="text" placeholder="Location/Address" class="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#29166e]/20 font-bold">
                    <input v-model="branchForm.contact_person" type="text" placeholder="Contact Person" class="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#29166e]/20 font-bold">
                    <input v-model="branchForm.contact_number" type="text" placeholder="Contact Number" class="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#29166e]/20 font-bold">
                </div>
                <div class="flex justify-end mt-4">
                    <button @click="saveBranch" class="px-6 py-2.5 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl font-black text-xs shadow-lg shadow-[#29166e]/20 transition-all flex items-center gap-2" :disabled="branchSaving">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                        Add Branch
                    </button>
                </div>
            </div>

            <!-- Branches List -->
            <div class="space-y-4">
                <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Existing Branches</h4>
                <div v-if="branchesLoading" class="flex justify-center py-10">
                    <div class="w-8 h-8 border-4 border-[#29166e]/10 border-t-[#29166e] rounded-full animate-spin"></div>
                </div>
                <div v-else-if="branches.length === 0" class="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <p class="text-xs text-slate-400 font-bold">No branches registered for this company yet.</p>
                </div>
                <div v-else class="space-y-3">
                    <div v-for="branch in branches" :key="branch.id" class="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 group-hover:bg-[#29166e] group-hover:text-white transition-all">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                            </div>
                            <div>
                                <h5 class="text-sm font-black text-slate-800 dark:text-white">{{ branch.name }} <span class="text-[#29166e] ml-1">#{{ branch.branch_number }}</span></h5>
                                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{{ branch.location || 'No location set' }}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <div v-if="branch.contact_number" class="mr-4 text-right hidden sm:block">
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{{ branch.contact_person || 'Contact' }}</p>
                                <p class="text-xs font-bold text-slate-600 dark:text-slate-300">{{ branch.contact_number }}</p>
                            </div>
                            <button @click="deleteBranch(branch.id)" class="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <template #footer>
            <button @click="showBranchModal = false" class="px-8 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl font-black text-xs uppercase tracking-widest transition-all">Close Panel</button>
        </template>
    </Modal>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { companyService, branchService } from '@/services/api';
import { useNotificationStore } from '@/stores/notification';
import DataTable from '@/components/shared/DataTable.vue';
import Modal from '@/components/shared/Modal.vue';
import ConfirmModal from '@/components/shared/ConfirmModal.vue';
import { useAuthStore } from '@/stores/auth';
import SearchableSelect from '@/components/shared/SearchableSelect.vue';

const columns = [
    { key: 'name', label: 'Company Info', sortable: true },
    { key: 'contact_person', label: 'Contact Person', sortable: true },
    { key: 'phone_number', label: 'Phone & Alternative', sortable: false },
    { key: 'is_active', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
];

const getRowClass = (row) => {
  return (row.is_active === 0 || row.is_active === false) ? 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20' : '';
};

// Remove dayjs import and use native Date formatting for consistency
const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
};

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const companies = ref([]);
const loading = ref(true);
const saving = ref(false);
const showModal = ref(false);
const showStatusModal = ref(false);
const showBranchModal = ref(false);
const showDeleteModal = ref(false);
const companyToDelete = ref(null);
const editMode = ref(false);
const viewMode = ref(false);
const errors = ref({});
const searchQuery = ref('');
const statusFilter = ref('');
const perPage = ref(10);
const headerRef = ref(null);
const isScrolled = ref(false);
let observer = null;
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

const branches = ref([]);
const branchesLoading = ref(false);
const branchSaving = ref(false);

const branchForm = ref({
    name: '',
    branch_number: '',
    location: '',
    contact_person: '',
    contact_number: ''
});

const form = ref({
    name: '',
    computer_card: '',
    contact_person: '',
    phone_number: '',
    alternative_phone_number: '',
    branch_number: '',
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
        console.error('Failed to fetch companies:', error);
        notificationStore.error(error.response?.data?.message || 'Failed to load companies');
    } finally {
        loading.value = false;
    }
};

const openModal = (company = null, isView = false) => {
    errors.value = {};
    viewMode.value = isView;
    if (company) {
        editMode.value = !isView;
        selectedCompany.value = company;
        form.value = { ...company };
    } else {
        editMode.value = false;
        selectedCompany.value = null;
        form.value = {
            name: '',
            computer_card: '',
            contact_person: '',
            phone_number: '',
            alternative_phone_number: '',
            branch_number: '',
            is_active: true
        };
    }
    showModal.value = true;
};

const handleEnter = (e) => {
    // Get all focusable form elements that are not disabled or readonly
    const inputs = Array.from(e.target.form.querySelectorAll('input:not([disabled]), select:not([disabled]), textarea:not([disabled])'));
    const index = inputs.indexOf(e.target);
    
    if (index > -1 && index < inputs.length - 1) {
        // Move to the next input
        inputs[index + 1].focus();
    }
    // Removed automatic saveCompany() call to prevent accidental submissions
};

const saveCompany = async () => {
    // Validate phone number length (must be 8 digits)
    if (form.value.phone_number && form.value.phone_number.length !== 8) {
        errors.value.phone_number = ['Phone number must be exactly 8 digits'];
        notificationStore.error('Phone number must be exactly 8 digits');
        return;
    }
    if (form.value.alternative_phone_number && form.value.alternative_phone_number.length !== 8) {
        errors.value.alternative_phone_number = ['Alternative phone number must be exactly 8 digits'];
        notificationStore.error('Alternative phone number must be exactly 8 digits');
        return;
    }

    saving.value = true;
    try {
        const payload = { ...form.value };
        if (payload.alternative_phone_number === '') {
            payload.alternative_phone_number = null;
        }
        if (payload.branch_name === '') {
            payload.branch_name = null;
        }
        delete payload.branches;
        delete payload.branches_count;
        delete payload.created_at;
        delete payload.updated_at;

        if (editMode.value) {
            await companyService.update(selectedCompany.value.id, payload);
            notificationStore.addNotification('Company updated successfully', 'success');
        } else {
            await companyService.create(payload);
            notificationStore.addNotification('Company created successfully', 'success');
        }
        showModal.value = false;
        fetchCompanies(editMode.value ? pagination.value.current_page : 1);
    } catch (error) {
        if (error.response?.status === 422) {
            errors.value = error.response.data.errors;
            notificationStore.error('Validation error. Please check the fields.');
        } else {
            notificationStore.addNotification(error.response?.data?.message || 'Failed to save company', 'error');
        }
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
        notificationStore.success(`Company is now ${newStatus ? 'Active' : 'Inactive'}`);
        showStatusModal.value = false;
        fetchCompanies(pagination.value.current_page);
    } catch (error) {
        console.error('Status toggle failed', error);
        const errorMsg = error.response?.data?.message || 'Failed to update company status';
        notificationStore.error(errorMsg);
    } finally {
        saving.value = false;
    }
};

const confirmDelete = (company) => {
    companyToDelete.value = company;
    showDeleteModal.value = true;
};

const handleDelete = async () => {
    if (!companyToDelete.value) return;
    
    saving.value = true;
    try {
        await companyService.delete(companyToDelete.value.id);
        notificationStore.success('Company deleted successfully');
        showDeleteModal.value = false;
        fetchCompanies(pagination.value.current_page);
    } catch (error) {
        console.error('Delete failed', error);
        notificationStore.error(error.response?.data?.message || 'Failed to delete company');
    } finally {
        saving.value = false;
        companyToDelete.value = null;
    }
};

const openBranchModal = async (company) => {
    selectedCompany.value = company;
    showBranchModal.value = true;
    branchForm.value = { 
        name: '', 
        branch_number: '',
        location: '', 
        contact_person: '', 
        contact_number: '' 
    };
    fetchBranches();
};

const fetchBranches = async () => {
    if (!selectedCompany.value) return;
    branchesLoading.value = true;
    try {
        const res = await branchService.getAll(selectedCompany.value.id);
        branches.value = res.data;
    } catch (err) {
        notificationStore.error(err.response?.data?.message || 'Failed to load branches');
    } finally {
        branchesLoading.value = false;
    }
};

const saveBranch = async () => {
    if (!branchForm.value.name) {
        notificationStore.addNotification('Please enter branch name', 'warning');
        return;
    }
    
    branchSaving.value = true;
    try {
        await branchService.create(selectedCompany.value.id, branchForm.value);
        notificationStore.success('Branch added successfully');
        
        branchForm.value = { 
            name: '', 
            branch_number: '',
            location: '', 
            contact_person: '', 
            contact_number: '' 
        };
        fetchBranches();
    } catch (err) {
        notificationStore.error('Failed to add branch');
    } finally {
        branchSaving.value = false;
    }
};

const deleteBranch = async (id) => {
    if (!confirm('Are you sure you want to delete this branch?')) return;
    try {
        await branchService.delete(id);
        fetchBranches();
        notificationStore.success('Branch deleted successfully');
    } catch (err) {
        notificationStore.error('Failed to delete branch');
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
    console.log('CompaniesView mounted, fetching data...');
    fetchCompanies();
    
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
});

onUnmounted(() => {
    if (observer) {
        observer.disconnect();
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
