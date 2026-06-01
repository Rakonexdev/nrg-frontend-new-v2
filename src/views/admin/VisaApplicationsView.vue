<template>
  <div class="space-y-6">
    <div ref="headerRef" class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Visa Applications</h1>
        <p class="text-slate-500 dark:text-slate-400">Manage visa applications and processing status</p>
      </div>
      <button v-if="authStore.hasPermission('visa_application_create') || authStore.isSuperAdmin" @click="openModal()" class="flex items-center gap-2 px-6 py-2.5 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl shadow-lg shadow-[#29166e]/30 transition-all transform hover:-translate-y-0.5 font-bold text-sm">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        Add Visa Application
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
                <input v-model="searchQuery" @input="fetchApplications(1)" type="text" placeholder="Search VP, names, passport..." 
                       class="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
            </div>
            
            <transition name="fade-slide-horizontal">
              <button v-if="isScrolled && (authStore.hasPermission('visa_application_create') || authStore.isSuperAdmin)" @click="openModal()" class="flex items-center gap-2 px-5 py-2.5 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl shadow-lg shadow-[#29166e]/30 transition-all font-bold text-xs shrink-0 transform hover:-translate-y-0.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                Add Application
              </button>
            </transition>
        </div>
        
        <div class="flex items-center gap-3 w-full md:w-auto">
            <SearchableSelect 
                v-model="statusFilter"
                :options="statusOptions"
                @change="fetchApplications(1)"
                placeholder="All Status"
                class="flex-1 md:w-48"
            />
            <select v-model="perPage" @change="fetchApplications(1)" class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none dark:text-white font-bold appearance-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm">
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
        <p class="mt-6 text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Loading Applications</p>
    </div>

    <!-- Data Table -->
    <DataTable v-if="!loading"
      :columns="columns" 
      :data="applications"
      :pagination="pagination"
      @page-change="fetchApplications">
      
      <template #vp_info="{ row }">
        <div class="flex flex-col gap-0.5">
          <div>
            <span class="font-bold text-slate-800 dark:text-white">{{ row.vp_number }}</span>
          </div>
          <div class="flex items-center gap-1.5 mt-0.5">
            <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">Serial: {{ row.serial_no }}</span>
          </div>
        </div>
      </template>

      <template #person_info="{ row }">
        <div class="flex flex-col">
          <span class="font-bold text-slate-700 dark:text-slate-300">{{ row.full_name }}</span>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ row.nationality || 'N/A' }}</span>
        </div>
      </template>
      
      <template #company_info="{ row }">
        <div class="flex flex-col">
          <span class="font-bold text-slate-700 dark:text-slate-300">{{ row.company?.name || 'N/A' }}</span>
        </div>
      </template>

      <template #contract_info="{ row }">
        <div class="flex flex-col">
          <span class="font-bold text-slate-700 dark:text-slate-300">{{ row.contract_person || 'N/A' }}</span>
          <span v-if="row.contract_person_phone" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ row.contract_person_phone }}</span>
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
          <button v-if="authStore.hasPermission('view_visa_applications') || authStore.isSuperAdmin" @click="openModal(row, true)" class="p-1 text-slate-400 hover:text-blue-500 transition-colors" title="View Application">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
          </button>
          <button v-if="authStore.hasPermission('visa_application_edit') || authStore.isSuperAdmin" @click="openModal(row)" class="p-1 text-slate-400 hover:text-[#29166e] transition-colors" title="Edit Application">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
          <button v-if="authStore.hasPermission('visa_application_status') || authStore.isSuperAdmin" @click="confirmStatusToggle(row)" class="p-1 transition-colors" :class="row.is_active ? 'text-green-500 hover:text-green-600' : 'text-slate-400 hover:text-slate-500'" :title="row.is_active ? 'Deactivate' : 'Activate'">
            <svg v-if="row.is_active" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </button>
          <button v-if="authStore.hasPermission('visa_application_delete') || authStore.isSuperAdmin" @click="confirmDelete(row)" class="p-1 text-slate-400 hover:text-red-500 transition-colors" title="Delete Application">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Add/Edit Modal -->
    <Modal :show="showModal" :title="viewMode ? 'View Visa Application' : editMode ? 'Edit Visa Application' : 'New Visa Application'" @close="showModal = false" maxWidth="5xl">
      <form @submit.prevent="saveApplication" class="space-y-6">
        <fieldset :disabled="viewMode" class="space-y-6">
        
        <!-- VP RECORD -->
        <div class="bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div class="flex items-center gap-2 mb-6">
                <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                <h3 class="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">VP Record</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Serial No. <span class="text-red-500">*</span></label>
                    <input v-model="form.serial_no" type="text" required readonly
                           class="w-full px-4 py-3.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none transition-all font-bold cursor-not-allowed text-slate-500">
                </div>
                
                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">VP Expiry Date <span class="text-red-500">*</span></label>
                    <DateInput v-model="form.vp_expiry_date" required />
                </div>

                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">VP Number <span class="text-red-500">*</span></label>
                    <input v-model="form.vp_number" type="text" required placeholder="VP2023XXXXXX"
                           class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold placeholder:font-normal placeholder:text-slate-400">
                </div>

                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Position <span class="text-red-500">*</span></label>
                    <input v-model="form.position" type="text" required placeholder="Job position"
                           class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold placeholder:font-normal">
                </div>

                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Nationality <span class="text-red-500">*</span></label>
                    <SearchableSelect 
                        v-model="form.nationality"
                        :options="countryOptions"
                        placeholder="Select Nationality"
                    />
                </div>

                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">CC / Company <span class="text-red-500">*</span></label>
                    <SearchableSelect 
                        v-model="form.company_id"
                        :options="companyOptions"
                        placeholder="Select Company"
                    />
                </div>
            </div>
        </div>

        <!-- PERSON & DOCUMENTS -->
        <div class="bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div class="flex items-center gap-2 mb-6">
                <span class="w-2 h-2 rounded-full bg-teal-500"></span>
                <h3 class="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">Person & Documents</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Full Name <span class="text-red-500">*</span></label>
                    <input v-model="form.full_name" type="text" required
                           class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                </div>
                
                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Passport Number <span class="text-red-500">*</span></label>
                    <input v-model="form.passport_number" type="text" required
                           class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                </div>

                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Visa Number</label>
                    <input v-model="form.visa_number" type="text"
                           class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                </div>
            </div>
        </div>

        <!-- STATUS, SCHEDULE & FINANCIALS -->
        <div class="bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div class="flex items-center gap-2 mb-6">
                <span class="w-2 h-2 rounded-full bg-green-500"></span>
                <h3 class="text-xs font-black text-green-600 dark:text-green-400 uppercase tracking-widest">Status, Schedule & Financials</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Medical Appointment Date & Time</label>
                    <DateTimeInput v-model="form.appointment_date" />
                </div>

                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Contract Person <span class="text-red-500">*</span></label>
                    <input v-model="form.contract_person" type="text" required
                           class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                </div>
                
                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Contract Person Phone <span class="text-red-500">*</span></label>
                    <div class="flex">
                        <span class="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-sm">+974</span>
                        <input :value="form.contract_person_phone" @input="e => { let val = e.target.value.replace(/\\D/g, ''); e.target.value = val; form.contract_person_phone = val; }" type="text" maxlength="8" placeholder="Phone Number" required
                               class="flex-1 w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-r-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                    </div>
                </div>
                
                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Medical Report and Visa Status</label>
                    <select v-model="form.medical_report" class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold appearance-none cursor-pointer">
                        <option value="" disabled>-- Select --</option>
                        <option value="FIT">FIT</option>
                        <option value="UNFIT">UNFIT</option>
                        <option value="PENDING">PENDING</option>
                        <option value="DEFERRED / FURTHER EXAM REQUIRED">DEFERRED / FURTHER EXAM REQUIRED</option>
                        <option value="FIT WITH CONDITIONS">FIT WITH CONDITIONS</option>
                        <option value="INCOMPLETE DOCUMENTS">INCOMPLETE DOCUMENTS</option>
                        <option value="RE VISIT">RE VISIT</option>
                        <option value="UNDER PROCESS">UNDER PROCESS</option>
                        <option value="OUT SIDE PROCESS">OUT SIDE PROCESS</option>
                        <option value="INSIDE COUNTRY">INSIDE COUNTRY</option>
                    </select>
                </div>

                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Attestation Details</label>
                    <select v-model="form.attestation_details" class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold appearance-none cursor-pointer">
                        <option value="" disabled>-- Select --</option>
                        <option value="Attested Complete">Attested Complete</option>
                        <option value="Pending Attestation">Pending Attestation</option>
                        <option value="Not Required">Not Required</option>
                    </select>
                </div>
                
                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Payment Date & Time</label>
                    <DateTimeInput v-model="form.payment_date" />
                </div>
                
                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Total Amount <span class="text-red-500">*</span></label>
                    <input v-model="form.total_amount" @input="calculateDue" type="number" step="0.01" required placeholder="QAR"
                           class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                </div>
                
                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Total Pay <span class="text-red-500">*</span></label>
                    <input v-model="form.total_pay" @input="calculateDue" type="number" step="0.01" required placeholder="QAR"
                           class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                </div>
                
                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Due Amount (Auto) <span class="text-red-500">*</span></label>
                    <input v-model="form.due_amount" type="number" step="0.01" placeholder="QAR" readonly required
                           class="w-full px-4 py-3.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none transition-all font-bold cursor-not-allowed text-slate-500">
                </div>

                <div class="md:col-span-2">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Description</label>
                    <input v-model="form.description" type="text" placeholder="Enter description..."
                           class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                </div>
            </div>
        </div>

        </fieldset>
        <div class="flex justify-end gap-4 mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
          <button type="button" @click="showModal = false" class="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-xl font-bold text-sm transition-colors shadow-sm">{{ viewMode ? 'Close' : 'Cancel' }}</button>
          <button v-if="!viewMode" type="submit" class="px-8 py-3 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl shadow-lg shadow-[#29166e]/25 transition-all font-black text-sm transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2" :disabled="saving">
            <svg v-if="!saving" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
            <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ saving ? 'Saving...' : 'Save Application' }}
          </button>
        </div>
      </form>
    </Modal>
    
    <!-- Delete Confirmation Modal -->
    <ConfirmModal 
      :show="showDeleteModal" 
      title="Delete Visa Application"
      :message="`Are you sure you want to delete this visa application?`"
      description="This action cannot be undone. All related data will be permanently removed."
      variant="danger"
      confirm-text="Yes, Delete Application"
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

    <!-- Status Confirmation Modal -->
    <ConfirmModal 
      :show="showStatusModal" 
      :title="applicationToToggle?.is_active ? 'Deactivate Application' : 'Activate Application'"
      :message="`Are you sure you want to ${applicationToToggle?.is_active ? 'deactivate' : 'activate'} this application?`"
      :description="applicationToToggle?.is_active ? 'This application will no longer be marked as active.' : 'This application will be marked as active.'"
      :variant="applicationToToggle?.is_active ? 'warning' : 'primary'"
      :confirm-text="applicationToToggle?.is_active ? 'Yes, Deactivate' : 'Yes, Activate'"
      :loading="saving"
      @confirm="handleStatusToggle"
      @cancel="showStatusModal = false"
    >
      <template #icon>
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </template>
    </ConfirmModal>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { visaApplicationService, companyService } from '@/services/api';
import { useNotificationStore } from '@/stores/notification';
import DataTable from '@/components/shared/DataTable.vue';
import Modal from '@/components/shared/Modal.vue';
import ConfirmModal from '@/components/shared/ConfirmModal.vue';
import SearchableSelect from '@/components/shared/SearchableSelect.vue';
import DateInput from '@/components/shared/DateInput.vue';
import DateTimeInput from '@/components/shared/DateTimeInput.vue';
import { useAuthStore } from '@/stores/auth';

const columns = [
    { key: 'vp_info', label: 'VP Record', sortable: false },
    { key: 'person_info', label: 'Person Info', sortable: false },
    { key: 'company_info', label: 'Company', sortable: false },
    { key: 'contract_info', label: 'Contract Person', sortable: false },
    { key: 'is_active', label: 'Status', sortable: false },
    { key: 'actions', label: 'Actions', sortable: false }
];

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const applications = ref([]);
const companies = ref([]);
const loading = ref(true);
const saving = ref(false);
const showModal = ref(false);
const showDeleteModal = ref(false);
const showStatusModal = ref(false);
const applicationToDelete = ref(null);
const applicationToToggle = ref(null);
const editMode = ref(false);
const viewMode = ref(false);
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
    { id: 'active', name: 'Active' },
    { id: 'inactive', name: 'Inactive' }
];

const companyOptions = computed(() => {
    return companies.value.map(c => ({
        id: c.id,
        name: `${c.name} - ${c.computer_card || 'N/A'}`
    }));
});

const countryOptions = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Côte d'Ivoire", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. 'Swaziland')", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe", "Other"
].map(c => ({ id: c, name: c }));

const selectedApplication = ref(null);

const form = ref({
    serial_no: '001',
    vp_expiry_date: '',
    vp_number: '',
    position: '',
    nationality: '',
    company_id: '',
    full_name: '',
    passport_number: '',
    visa_number: '',
    description: '',
    appointment_date: '',
    contract_person: '',
    contract_person_phone: '',
    medical_report: '',
    attestation_details: '',
    payment_date: '',
    total_amount: null,
    total_pay: null,
    due_amount: null,
    is_active: true
});

const calculateDue = () => {
    const total = parseFloat(form.value.total_amount) || 0;
    const pay = parseFloat(form.value.total_pay) || 0;
    form.value.due_amount = (total - pay).toFixed(2);
};

const fetchApplications = async (page = 1) => {
    loading.value = true;
    try {
        const response = await visaApplicationService.getAll({ 
            status: statusFilter.value,
            page,
            per_page: perPage.value,
            search: searchQuery.value
        });
        
        const resData = response.data;
        applications.value = resData.data;
        
        const meta = resData.meta || resData;
        pagination.value = {
            current_page: meta.current_page,
            last_page: meta.last_page,
            total: meta.total,
            per_page: meta.per_page,
        };
    } catch (error) {
        console.error('Failed to fetch applications:', error);
        notificationStore.error(error.response?.data?.message || 'Failed to load visa applications');
    } finally {
        loading.value = false;
    }
};

const fetchCompanies = async () => {
    try {
        const res = await companyService.getSimple();
        companies.value = res.data;
    } catch (error) {
        console.error('Failed to fetch companies:', error);
    }
};

const getNextSerialNumber = () => {
    if (!applications.value || applications.value.length === 0) {
        return '001';
    }
    
    let maxSerial = 0;
    for (const app of applications.value) {
        if (app.serial_no) {
            const num = parseInt(app.serial_no, 10);
            if (!isNaN(num) && num > maxSerial) {
                maxSerial = num;
            }
        }
    }
    
    return String(maxSerial + 1).padStart(3, '0');
};

const openModal = (application = null, isView = false) => {
    viewMode.value = isView;
    if (application) {
        editMode.value = !isView;
        selectedApplication.value = application;
        form.value = { ...application };
    } else {
        editMode.value = false;
        viewMode.value = false;
        selectedApplication.value = null;
        form.value = {
            serial_no: getNextSerialNumber(),
            vp_expiry_date: '',
            vp_number: '',
            position: '',
            nationality: '',
            company_id: '',
            full_name: '',
            passport_number: '',
            visa_number: '',
            description: '',
            appointment_date: '',
            contract_person: '',
            contract_person_phone: '',
            medical_report: '',
            attestation_details: '',
            payment_date: '',
            total_amount: null,
            total_pay: null,
            due_amount: null,
            is_active: true
        };
    }
    showModal.value = true;
};

const saveApplication = async () => {
    saving.value = true;
    try {
        if (editMode.value) {
            await visaApplicationService.update(selectedApplication.value.id, form.value);
            notificationStore.addNotification('Application updated successfully', 'success');
        } else {
            await visaApplicationService.create(form.value);
            notificationStore.addNotification('Application created successfully', 'success');
        }
        showModal.value = false;
        fetchApplications(editMode.value ? pagination.value.current_page : 1);
    } catch (error) {
        console.error('Error saving application:', error);
        notificationStore.addNotification(error.response?.data?.message || 'Failed to save application', 'error');
    } finally {
        saving.value = false;
    }
};

const confirmDelete = (application) => {
    applicationToDelete.value = application;
    showDeleteModal.value = true;
};

const handleDelete = async () => {
    if (!applicationToDelete.value) return;
    
    saving.value = true;
    try {
        await visaApplicationService.delete(applicationToDelete.value.id);
        notificationStore.success('Application deleted successfully');
        showDeleteModal.value = false;
        fetchApplications(pagination.value.current_page);
    } catch (error) {
        console.error('Delete failed', error);
        notificationStore.error(error.response?.data?.message || 'Failed to delete application');
    } finally {
        saving.value = false;
        applicationToDelete.value = null;
    }
};

const confirmStatusToggle = (application) => {
    applicationToToggle.value = application;
    showStatusModal.value = true;
};

const handleStatusToggle = async () => {
    if (!applicationToToggle.value) return;
    
    saving.value = true;
    try {
        await visaApplicationService.update(applicationToToggle.value.id, {
            is_active: !applicationToToggle.value.is_active
        });
        notificationStore.success(`Application ${!applicationToToggle.value.is_active ? 'activated' : 'deactivated'} successfully`);
        showStatusModal.value = false;
        fetchApplications(pagination.value.current_page);
    } catch (error) {
        console.error('Status toggle failed', error);
        notificationStore.error(error.response?.data?.message || 'Failed to update status');
    } finally {
        saving.value = false;
        applicationToToggle.value = null;
    }
};

onMounted(() => {
    fetchApplications();
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
