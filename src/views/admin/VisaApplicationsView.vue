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

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
      <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
        <div>
          <p class="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Total Collection</p>
          <h3 class="text-2xl font-black text-[#29166e] dark:text-blue-400">{{ parseFloat(totalCollectedAmount).toFixed(2) }} <span class="text-sm font-bold text-slate-400">QAR</span></h3>
        </div>
        <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
      </div>
      <div @click="togglePendingFilter" :class="['bg-white dark:bg-slate-800 p-5 rounded-2xl border transition-all hover:shadow-md cursor-pointer flex items-center justify-between', pendingFilter ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-rose-500/10' : 'border-slate-200 dark:border-slate-700 shadow-sm']">
        <div>
          <p class="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Pending Amount</p>
          <h3 class="text-2xl font-black text-rose-600 dark:text-rose-400">{{ parseFloat(totalPendingAmount).toFixed(2) }} <span class="text-sm font-bold text-slate-400">QAR</span></h3>
        </div>
        <div class="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl text-rose-600 dark:text-rose-400">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
      </div>
      <div @click="toggleExpiredFilter" :class="['bg-white dark:bg-slate-800 p-5 rounded-2xl border transition-all hover:shadow-md cursor-pointer flex items-center justify-between', vpExpiredFilter ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-amber-500/10' : 'border-slate-200 dark:border-slate-700 shadow-sm']">
        <div>
          <p class="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Expired VPs</p>
          <h3 class="text-2xl font-black text-amber-600 dark:text-amber-400">{{ totalExpiredVps }} <span class="text-sm font-bold text-slate-400">Records</span></h3>
        </div>
        <div class="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
      </div>
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
                <input v-model="searchQuery" @input="fetchApplications(1)" type="text" placeholder="Search VP, names, passport, visa, rep name, phone..." 
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
                v-model="visaStatusFilter"
                :options="visaStatusOptions"
                @change="fetchApplications(1)"
                placeholder="All Visa Status"
                class="flex-1 md:w-48"
            />
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
      :stickyTop="tableStickyTop"
      @page-change="fetchApplications">
      
      <template #vp_info="{ row }">
        <div class="flex flex-col gap-0.5">
          <div>
            <span class="font-bold text-slate-800 dark:text-white">{{ row.vp_number }}</span>
          </div>
          <div class="flex items-center gap-1.5 mt-0.5">
            <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">Serial: {{ row.serial_no }}</span>
          </div>
          <span class="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-widest mt-1">Exp: {{ formatDate(row.vp_expiry_date) }}</span>
        </div>
      </template>

      <template #person_info="{ row }">
        <div class="flex flex-col">
          <span class="font-bold text-slate-700 dark:text-slate-300">{{ row.full_name }}</span>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ row.nationality || 'N/A' }}</span>
          <span class="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">PPT: {{ row.passport_number || 'N/A' }}</span>
          <span v-if="row.visa_number" class="text-xs font-bold text-slate-500 uppercase tracking-widest">Visa: {{ row.visa_number }}</span>
          <span v-if="row.visa_expiry_date" class="text-xs font-bold text-slate-500 uppercase tracking-widest">Visa Exp: {{ formatDate(row.visa_expiry_date) }}</span>
        </div>
      </template>
      
      <template #company_info="{ row }">
        <div class="flex flex-col">
          <span class="font-bold text-slate-700 dark:text-slate-300">{{ row.company?.name || 'N/A' }}</span>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">CC: {{ row.company?.computer_card || 'N/A' }}</span>
          <span v-if="row.contract_person" class="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2 border-t border-slate-100 dark:border-slate-800 pt-1">
            Rep: {{ row.contract_person }}
          </span>
          <span v-if="row.contract_person_phone" class="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">
            Tel: {{ row.contract_person_phone }}
          </span>
        </div>
      </template>

      <template #total_amount_info="{ row }">
        <div class="flex flex-col">
          <span class="text-sm font-black text-slate-700 dark:text-slate-300">{{ row.total_amount || 0 }}</span>
        </div>
      </template>

      <template #payment_info="{ row }">
        <div class="flex flex-col gap-0.5">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paid: <span class="text-emerald-600 font-black">{{ row.total_pay || 0 }} QAR</span></span>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due: <span class="text-rose-600 font-black">{{ row.due_amount || 0 }} QAR</span></span>
          <span v-if="parseFloat(row.due_amount) <= 0" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status: <span class="text-emerald-600 font-black">COMPLETED</span></span>
          <span v-else-if="row.next_due_date" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Next Due: <span class="text-amber-600 font-black">{{ formatDate(row.next_due_date) }}</span></span>
        </div>
      </template>

      <template #visa_status="{ row }">
        <div class="flex flex-col">
          <span class="font-bold text-slate-700 dark:text-slate-300 text-xs">{{ row.medical_report || 'N/A' }}</span>
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
          <button v-if="authStore.hasPermission('visa_application_payment') || authStore.isSuperAdmin" @click="openPaymentModal(row)" class="p-1 text-slate-400 hover:text-amber-500 transition-colors" title="Payment & History">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
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
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">CC / Company <span class="text-red-500">*</span></label>
                    <SearchableSelect 
                        v-model="form.company_id"
                        :options="companyOptions"
                        placeholder="Select Company"
                    />
                </div>

                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Profession <span class="text-red-500">*</span></label>
                    <SearchableSelect 
                        v-model="form.position"
                        :options="companyProfessionOptions"
                        placeholder="Select Profession"
                    >
                        <template #option="{ option }">
                            <div class="flex items-center justify-between w-full pr-2">
                                <span class="break-words whitespace-normal text-slate-700 dark:text-slate-300">{{ option.name }}</span>
                                <span v-if="option.available !== undefined" 
                                      class="ml-3 font-mono text-xs font-bold whitespace-nowrap"
                                      :class="(option.available - option.used) <= 0 ? 'text-red-600 dark:text-red-400' : (option.available - option.used) <= 2 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-500'">
                                    {{ option.used }} / {{ option.available }}
                                </span>
                            </div>
                        </template>
                    </SearchableSelect>
                </div>

                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">VP Number <span class="text-red-500">*</span></label>
                    <input v-model="form.vp_number" type="text" required readonly placeholder="Auto-filled"
                           class="w-full px-4 py-3.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none transition-all font-bold cursor-not-allowed text-slate-500">
                </div>
                
                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">VP Expiry Date <span class="text-red-500">*</span></label>
                    <div class="pointer-events-none opacity-80 cursor-not-allowed">
                        <DateInput v-model="form.vp_expiry_date" required />
                    </div>
                </div>
                
                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Nationality <span class="text-red-500">*</span></label>
                    <SearchableSelect 
                        v-model="form.nationality"
                        :options="countryOptions"
                        placeholder="Select Nationality"
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

                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Visa Expiry Date</label>
                    <DateInput v-model="form.visa_expiry_date" />
                </div>

                <div class="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-5 mt-2 border-t border-slate-200 dark:border-slate-700 pt-6">
                    <div class="col-span-1">
                        <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Passport Photo <span v-if="!editMode && !viewMode" class="text-red-500">*</span></label>
                        <input v-if="!viewMode" type="file" @change="e => handleFileChange(e, 'passport_photo')" accept=".jpg,.jpeg,.png,.pdf" :required="!editMode && !form.passport_photo"
                               class="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-wider file:bg-[#29166e]/10 file:text-[#29166e] hover:file:bg-[#29166e]/20 transition-all outline-none">
                        <div v-if="filePreviews.passport_photo || typeof form.passport_photo === 'string'" class="mt-3">
                            <img v-if="filePreviews.passport_photo" :src="filePreviews.passport_photo" class="h-24 object-cover rounded-lg border border-slate-200 shadow-sm mb-2">
                            <img v-else-if="typeof form.passport_photo === 'string' && form.passport_photo.match(/\.(jpeg|jpg|gif|png)$/i)" :src="getStorageUrl(form.passport_photo)" class="h-24 object-cover rounded-lg border border-slate-200 shadow-sm mb-2">
                            <a v-if="typeof form.passport_photo === 'string'" :href="getStorageUrl(form.passport_photo)" target="_blank" class="text-[10px] font-bold text-blue-500 inline-flex items-center gap-1 hover:text-blue-600">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                View Document
                            </a>
                        </div>
                        <div v-else-if="viewMode" class="text-sm text-slate-500 italic mt-2">No document uploaded</div>
                    </div>
                    <div class="col-span-1">
                        <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Personal Photo <span v-if="!editMode && !viewMode" class="text-red-500">*</span></label>
                        <input v-if="!viewMode" type="file" @change="e => handleFileChange(e, 'personal_photo')" accept=".jpg,.jpeg,.png,.pdf" :required="!editMode && !form.personal_photo"
                               class="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-wider file:bg-[#29166e]/10 file:text-[#29166e] hover:file:bg-[#29166e]/20 transition-all outline-none">
                        <div v-if="filePreviews.personal_photo || typeof form.personal_photo === 'string'" class="mt-3">
                            <img v-if="filePreviews.personal_photo" :src="filePreviews.personal_photo" class="h-24 object-cover rounded-lg border border-slate-200 shadow-sm mb-2">
                            <img v-else-if="typeof form.personal_photo === 'string' && form.personal_photo.match(/\.(jpeg|jpg|gif|png)$/i)" :src="getStorageUrl(form.personal_photo)" class="h-24 object-cover rounded-lg border border-slate-200 shadow-sm mb-2">
                            <a v-if="typeof form.personal_photo === 'string'" :href="getStorageUrl(form.personal_photo)" target="_blank" class="text-[10px] font-bold text-blue-500 inline-flex items-center gap-1 hover:text-blue-600">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                View Document
                            </a>
                        </div>
                        <div v-else-if="viewMode" class="text-sm text-slate-500 italic mt-2">No document uploaded</div>
                    </div>
                    <div class="col-span-1">
                        <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Medical Appointment Page</label>
                        <input v-if="!viewMode" type="file" @change="e => handleFileChange(e, 'medical_appointment_page')" accept=".jpg,.jpeg,.png,.pdf"
                               class="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-wider file:bg-[#29166e]/10 file:text-[#29166e] hover:file:bg-[#29166e]/20 transition-all outline-none">
                        <div v-if="filePreviews.medical_appointment_page || typeof form.medical_appointment_page === 'string'" class="mt-3">
                            <img v-if="filePreviews.medical_appointment_page" :src="filePreviews.medical_appointment_page" class="h-24 object-cover rounded-lg border border-slate-200 shadow-sm mb-2">
                            <img v-else-if="typeof form.medical_appointment_page === 'string' && form.medical_appointment_page.match(/\.(jpeg|jpg|gif|png)$/i)" :src="getStorageUrl(form.medical_appointment_page)" class="h-24 object-cover rounded-lg border border-slate-200 shadow-sm mb-2">
                            <a v-if="typeof form.medical_appointment_page === 'string'" :href="getStorageUrl(form.medical_appointment_page)" target="_blank" class="text-[10px] font-bold text-blue-500 inline-flex items-center gap-1 hover:text-blue-600">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                View Document
                            </a>
                        </div>
                        <div v-else-if="viewMode" class="text-sm text-slate-500 italic mt-2">No document uploaded</div>
                    </div>
                    <div class="col-span-1">
                        <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Visa Copy</label>
                        <input v-if="!viewMode" type="file" @change="e => handleFileChange(e, 'visa_copy')" accept=".jpg,.jpeg,.png,.pdf"
                               class="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-wider file:bg-[#29166e]/10 file:text-[#29166e] hover:file:bg-[#29166e]/20 transition-all outline-none">
                        <div v-if="filePreviews.visa_copy || typeof form.visa_copy === 'string'" class="mt-3">
                            <img v-if="filePreviews.visa_copy" :src="filePreviews.visa_copy" class="h-24 object-cover rounded-lg border border-slate-200 shadow-sm mb-2">
                            <img v-else-if="typeof form.visa_copy === 'string' && form.visa_copy.match(/\.(jpeg|jpg|gif|png)$/i)" :src="getStorageUrl(form.visa_copy)" class="h-24 object-cover rounded-lg border border-slate-200 shadow-sm mb-2">
                            <a v-if="typeof form.visa_copy === 'string'" :href="getStorageUrl(form.visa_copy)" target="_blank" class="text-[10px] font-bold text-blue-500 inline-flex items-center gap-1 hover:text-blue-600">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                View Document
                            </a>
                        </div>
                        <div v-else-if="viewMode" class="text-sm text-slate-500 italic mt-2">No document uploaded</div>
                    </div>
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
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Medical Report and Visa Status <span class="text-red-500">*</span></label>
                    <select v-model="form.medical_report" required class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold appearance-none cursor-pointer">
                        <option value="" disabled>-- Select --</option>
                        <option value="FIT">FIT</option>
                        <option value="UNFIT">UNFIT</option>
                        <option value="PENDING">PENDING</option>
                        <option value="DEFERRED / FURTHER EXAM REQUIRED">DEFERRED / FURTHER EXAM REQUIRED</option>
                        <option value="FIT WITH CONDITIONS">FIT WITH CONDITIONS</option>
                        <option value="INCOMPLETE DOCUMENTS">INCOMPLETE DOCUMENTS</option>
                        <option value="RE VISIT">RE VISIT</option>
                        <option value="UNDER PROCESS">UNDER PROCESS</option>
                        <option value="OUTSIDE PROCESS">OUTSIDE PROCESS</option>
                        <option value="INSIDE COUNTRY">INSIDE COUNTRY</option>
                        <option value="READY TO PRINT">READY TO PRINT</option>
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

    <!-- Payment Modal -->
    <Modal :show="showPaymentModal" title="Visa Application Payment" @close="showPaymentModal = false" maxWidth="5xl">
      
      <div class="space-y-6">
        <!-- New Payment Form -->
        <div v-if="parseFloat(applicationToPay?.due_amount) > 0" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <form id="paymentFormElement" @submit.prevent="savePayment" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <!-- Amount -->
              <div>
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Amount <span class="text-rose-500">*</span></label>
                <div class="relative">
                  <input v-model="paymentForm.amount" type="number" step="0.01" min="0.01" :max="applicationToPay?.due_amount" required placeholder="Ex: 1,000"
                         class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                </div>
                <div class="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Due: {{ applicationToPay?.due_amount || 0 }} QAR</div>
              </div>

              <!-- Paid Date -->
              <div>
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Paid Date <span class="text-rose-500">*</span></label>
                <DateInput v-model="paymentForm.payment_date" required />
              </div>

              <!-- Method -->
              <div>
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Method <span class="text-rose-500">*</span></label>
                <select v-model="paymentForm.method" required class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold appearance-none">
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <!-- Next Collection Due -->
              <div>
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Next Collection Due</label>
                <DateInput v-model="paymentForm.next_due_date" />
              </div>
            </div>

            <div class="flex justify-end pt-2">
              <button type="submit" form="paymentFormElement" :disabled="saving" class="px-8 py-2.5 rounded-xl font-bold text-sm text-white bg-[#059669] hover:bg-[#047857] shadow-lg shadow-[#059669]/30 transition-all disabled:opacity-50 flex items-center gap-2">
                <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                {{ saving ? 'Processing...' : (editingPaymentId ? 'Update Payment' : 'Add Payment') }}
              </button>
            </div>
          </form>
        </div>
        <div v-else class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800 p-6 flex items-center justify-center">
             <span class="text-emerald-600 font-black text-sm uppercase tracking-widest">Payment is fully completed.</span>
        </div>

        <!-- History Table -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
           <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
             <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visa Application Payment History</h4>
             <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ applicationToPay?.payments?.length || 0 }} Entries</span>
           </div>
           
           <div class="overflow-x-auto">
             <table class="w-full text-left border-collapse">
               <thead>
                 <tr class="border-b border-slate-200 dark:border-slate-700">
                   <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Paid Date</th>
                   <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Amount</th>
                   <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Method</th>
                   <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Recorded By</th>
                   <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Action</th>
                 </tr>
               </thead>
               <tbody class="divide-y divide-slate-100 dark:divide-slate-700/50">
                 <tr v-if="!applicationToPay?.payments?.length">
                    <td colspan="5" class="px-6 py-8 text-center text-sm font-bold text-slate-400">No payment history available</td>
                 </tr>
                 <tr v-for="pay in applicationToPay?.payments" :key="pay.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                   <td class="px-6 py-4 whitespace-nowrap">
                     <span class="text-xs font-bold text-slate-700 dark:text-slate-300">{{ formatDate(pay.payment_date) }}</span>
                   </td>
                   <td class="px-6 py-4 whitespace-nowrap">
                     <span class="text-sm font-black text-[#059669]">QAR {{ parseFloat(pay.amount).toFixed(2) }}</span>
                   </td>
                   <td class="px-6 py-4 whitespace-nowrap">
                     <span class="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400">
                        {{ pay.method || 'CASH' }}
                     </span>
                   </td>
                   <td class="px-6 py-4 whitespace-nowrap">
                     <div class="flex flex-col">
                       <span class="text-xs font-bold text-slate-700 dark:text-slate-300">{{ pay.user?.name || 'Super Administrator' }}</span>
                       <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{{ pay.user?.role || 'System' }}</span>
                     </div>
                   </td>
                   <td class="px-6 py-4 whitespace-nowrap text-right">
                     <div class="flex items-center justify-end gap-3">
                       <button @click.prevent="editPayment(pay)" class="text-[10px] font-black text-blue-500 hover:text-blue-600 uppercase tracking-widest transition-colors">Edit</button>
                       <button @click.prevent="deletePayment(pay)" class="text-[10px] font-black text-red-500 hover:text-red-600 uppercase tracking-widest transition-colors">Delete</button>
                     </div>
                   </td>
                 </tr>
               </tbody>
               <tfoot v-if="applicationToPay?.payments?.length" class="bg-emerald-50/50 dark:bg-emerald-900/10 border-t border-emerald-100 dark:border-emerald-800/50">
                 <tr>
                   <td class="px-6 py-4 whitespace-nowrap">
                     <span class="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Total Paid</span>
                   </td>
                   <td colspan="4" class="px-6 py-4 whitespace-nowrap">
                     <span class="text-sm font-black text-emerald-600 dark:text-emerald-400">QAR {{ parseFloat(applicationToPay?.total_pay || 0).toFixed(2) }}</span>
                   </td>
                 </tr>
               </tfoot>
             </table>
           </div>
        </div>

      </div>
      
      <template #footer>
        <button type="button" @click="showPaymentModal = false" class="px-8 py-2.5 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
          Close
        </button>
      </template>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { visaApplicationService, companyService, companyVisaService } from '@/services/api';
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
    { key: 'visa_status', label: 'Visa Status', sortable: false },
    { key: 'total_amount_info', label: 'Total Amount (QAR)', sortable: false },
    { key: 'payment_info', label: 'Financials', sortable: false },
    { key: 'is_active', label: 'Status', sortable: false },
    { key: 'actions', label: 'Actions', sortable: false }
];

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const applications = ref([]);
const companies = ref([]);
const loading = ref(true);
const saving = ref(false);
const totalCollectedAmount = ref(0);
const totalPendingAmount = ref(0);
const totalExpiredVps = ref(0);
const showModal = ref(false);
const showDeleteModal = ref(false);
const showStatusModal = ref(false);
const showPaymentModal = ref(false);
const applicationToDelete = ref(null);
const applicationToToggle = ref(null);
const applicationToPay = ref(null);
const editMode = ref(false);
const viewMode = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');
const visaStatusFilter = ref('');
const vpExpiredFilter = ref(false);
const pendingFilter = ref(false);
const perPage = ref(10);
const headerRef = ref(null);
const searchBarRef = ref(null);
const tableStickyTop = ref('0px');
const isScrolled = ref(false);
let observer = null;
let resizeObserver = null;
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

const visaStatusOptions = [
    { id: '', name: 'All Visa Status' },
    { id: 'FIT', name: 'FIT' },
    { id: 'UNFIT', name: 'UNFIT' },
    { id: 'PENDING', name: 'PENDING' },
    { id: 'DEFERRED / FURTHER EXAM REQUIRED', name: 'DEFERRED / FURTHER EXAM REQUIRED' },
    { id: 'FIT WITH CONDITIONS', name: 'FIT WITH CONDITIONS' },
    { id: 'INCOMPLETE DOCUMENTS', name: 'INCOMPLETE DOCUMENTS' },
    { id: 'RE VISIT', name: 'RE VISIT' },
    { id: 'UNDER PROCESS', name: 'UNDER PROCESS' },
    { id: 'OUTSIDE PROCESS', name: 'OUTSIDE PROCESS' },
    { id: 'INSIDE COUNTRY', name: 'INSIDE COUNTRY' },
    { id: 'READY TO PRINT', name: 'READY TO PRINT' }
];

const filePreviews = ref({});

const companyOptions = computed(() => {
    return companies.value.map(c => ({
        id: c.id,
        name: `${c.name} - ${c.computer_card || 'N/A'}`
    }));
});

const companyProfessionOptions = ref([]);


const countryOptions = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Côte d'Ivoire", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. 'Swaziland')", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe", "Other"
].map(c => ({ id: c, name: c }));

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month.toLowerCase()}-${year}`;
};

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
    visa_expiry_date: '',
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
    passport_photo: null,
    personal_photo: null,
    medical_appointment_page: null,
    visa_copy: null,
    is_active: true
});

const paymentForm = ref({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    next_due_date: '',
    method: 'Cash',
    notes: ''
});
const editingPaymentId = ref(null);



const companyVisaRecords = ref([]);

watch(() => form.value.company_id, async (newCompanyId) => {
    if (!newCompanyId) {
        companyProfessionOptions.value = [];
        companyVisaRecords.value = [];
        return;
    }
    
    try {
        const res = await companyVisaService.getAll({ company_id: newCompanyId });
        companyVisaRecords.value = res.data;
        
        const professionMap = {};
        res.data.forEach(v => {
            if (!professionMap[v.profession]) {
                professionMap[v.profession] = { used: 0, available: 0 };
            }
            professionMap[v.profession].used += (v.used_slots || 0);
            professionMap[v.profession].available += (v.available_slots || 0);
        });

        companyProfessionOptions.value = Object.keys(professionMap).map(p => ({ 
            id: p, 
            name: p,
            used: professionMap[p].used,
            available: professionMap[p].available
        }));
        
        if (form.value.position && !professionMap[form.value.position]) {
            form.value.position = '';
        }
    } catch (error) {
        console.error('Failed to fetch company professions', error);
        companyProfessionOptions.value = [];
        companyVisaRecords.value = [];
    }
});

watch(() => form.value.position, (newProfession) => {
    if (!editMode.value && newProfession && form.value.company_id && companyVisaRecords.value.length > 0) {
        const match = companyVisaRecords.value.find(v => v.profession === newProfession);
        if (match) {
            form.value.vp_number = match.vp_number || '';
            form.value.vp_expiry_date = match.vp_expiry_date || '';
        }
    }
});

const calculateDue = () => {
    const total = parseFloat(form.value.total_amount) || 0;
    const pay = parseFloat(form.value.total_pay) || 0;
    form.value.due_amount = (total - pay).toFixed(2);
};

const openPaymentModal = (application) => {
    applicationToPay.value = application;
    editingPaymentId.value = null;
    paymentForm.value = {
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        next_due_date: '',
        method: 'Cash',
        notes: ''
    };
    showPaymentModal.value = true;
};

const editPayment = (pay) => {
    editingPaymentId.value = pay.id;
    paymentForm.value = {
        amount: pay.amount,
        payment_date: pay.payment_date,
        next_due_date: applicationToPay.value.next_due_date || '',
        method: pay.method || 'Cash',
        notes: pay.notes || ''
    };
    
    // Smooth scroll to top of modal to show form
    const modalContent = document.querySelector('.custom-scrollbar');
    if (modalContent) modalContent.scrollTo({ top: 0, behavior: 'smooth' });
};

const deletePayment = async (pay) => {
    if (!confirm('Are you sure you want to delete this payment? This will update the balances.')) return;
    
    try {
        const response = await visaApplicationService.deletePayment(applicationToPay.value.id, pay.id);
        notificationStore.success('Payment deleted successfully');
        applicationToPay.value = response.data.data;
        fetchApplications(pagination.value.current_page);
    } catch (error) {
        notificationStore.error(error?.response?.data?.message || 'Failed to delete payment');
    }
};

const savePayment = async () => {
    if (!paymentForm.value.amount || paymentForm.value.amount <= 0) {
        notificationStore.error('Please enter a valid amount');
        return;
    }
    
    // For new payments, check against due amount. 
    // For edits, check against due amount + original payment amount.
    const originalAmount = editingPaymentId.value ? 
        applicationToPay.value.payments.find(p => p.id === editingPaymentId.value)?.amount || 0 
        : 0;
        
    const maxAllowed = parseFloat(applicationToPay.value.due_amount) + parseFloat(originalAmount);
    
    if (parseFloat(paymentForm.value.amount) > maxAllowed) {
        notificationStore.error('Amount cannot exceed due amount');
        return;
    }

    try {
        saving.value = true;
        
        let response;
        if (editingPaymentId.value) {
            response = await visaApplicationService.updatePayment(applicationToPay.value.id, editingPaymentId.value, paymentForm.value);
            notificationStore.success('Payment updated successfully');
        } else {
            response = await visaApplicationService.addPayment(applicationToPay.value.id, paymentForm.value);
            notificationStore.success('Payment processed successfully');
        }
        
        // Update the application object in place so the modal reflects the changes
        applicationToPay.value = response.data.data;
        
        // Reset form to Add mode
        editingPaymentId.value = null;
        paymentForm.value = {
            amount: '',
            payment_date: new Date().toISOString().split('T')[0],
            next_due_date: applicationToPay.value.next_due_date || '',
            method: 'Cash',
            notes: ''
        };
        
        fetchApplications(pagination.value.current_page);
    } catch (error) {
        notificationStore.error(error?.response?.data?.message || 'Failed to process payment');
    } finally {
        saving.value = false;
    }
};

const fetchApplications = async (page = 1) => {
    loading.value = true;
    try {
        const response = await visaApplicationService.getAll({ 
            status: statusFilter.value,
            visa_status: visaStatusFilter.value,
            vp_expired: vpExpiredFilter.value ? 1 : 0,
            has_due: pendingFilter.value ? 1 : 0,
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
        
        if (resData.summary) {
            totalCollectedAmount.value = resData.summary.total_collected || 0;
            totalPendingAmount.value = resData.summary.total_pending || 0;
            totalExpiredVps.value = resData.summary.total_expired_vps || 0;
        }
    } catch (error) {
        console.error('Failed to fetch applications:', error);
        notificationStore.error(error.response?.data?.message || 'Failed to load visa applications');
    } finally {
        loading.value = false;
    }
};

const toggleExpiredFilter = () => {
    vpExpiredFilter.value = !vpExpiredFilter.value;
    fetchApplications(1);
};

const togglePendingFilter = () => {
    pendingFilter.value = !pendingFilter.value;
    fetchApplications(1);
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
            visa_expiry_date: '',
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
            passport_photo: null,
            personal_photo: null,
            medical_appointment_page: null,
            visa_copy: null,
            is_active: true
        };
    }
    filePreviews.value = {};
    showModal.value = true;
};

const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
        form.value[field] = file;
        if (file.type.startsWith('image/')) {
            filePreviews.value[field] = URL.createObjectURL(file);
        } else {
            filePreviews.value[field] = null;
        }
    } else {
        form.value[field] = null;
        filePreviews.value[field] = null;
    }
};

const getStorageUrl = (path) => {
    if (!path) return '';
    return `${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${path}`;
};

const saveApplication = async () => {
    saving.value = true;
    try {
        let submitData = new FormData();
        const fileFields = ['passport_photo', 'personal_photo', 'medical_appointment_page', 'visa_copy'];
        
        Object.keys(form.value).forEach(key => {
            const val = form.value[key];
            if (val !== null && val !== undefined && val !== '') {
                if (fileFields.includes(key)) {
                    if (val instanceof File) {
                        submitData.append(key, val);
                    }
                } else {
                    submitData.append(key, val === true ? 1 : val === false ? 0 : val);
                }
            }
        });

        if (editMode.value) {
            await visaApplicationService.update(selectedApplication.value.id, submitData);
            notificationStore.addNotification('Application updated successfully', 'success');
        } else {
            await visaApplicationService.create(submitData);
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
