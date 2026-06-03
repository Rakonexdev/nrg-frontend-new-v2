<template>
  <div class="space-y-6">
    <div ref="headerRef" class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Vehicle Tracking</h1>
        <p class="text-slate-500 dark:text-slate-400">Manage company vehicles and driver assignments</p>
      </div>
      <button v-if="authStore.hasPermission('vehicle_create') || authStore.isSuperAdmin" @click="openModal()" class="flex items-center gap-2 px-6 py-2.5 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl shadow-lg shadow-[#29166e]/30 transition-all transform hover:-translate-y-0.5 font-bold text-sm">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        Add Vehicle
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
                <input v-model="searchQuery" @input="fetchVehicles(1)" type="text" placeholder="Search vehicles, plates, drivers..." 
                       class="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
            </div>
            
            <transition name="fade-slide-horizontal">
              <button v-if="isScrolled && (authStore.hasPermission('vehicle_create') || authStore.isSuperAdmin)" @click="openModal()" class="flex items-center gap-2 px-5 py-2.5 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl shadow-lg shadow-[#29166e]/30 transition-all font-bold text-xs shrink-0 transform hover:-translate-y-0.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                Add Vehicle
              </button>
            </transition>
        </div>
        
        <div class="flex items-center gap-3 w-full md:w-auto">
            <SearchableSelect 
                v-model="statusFilter"
                :options="statusOptions"
                @change="fetchVehicles(1)"
                placeholder="All Status"
                class="flex-1 md:w-48"
            />
            <select v-model="perPage" @change="fetchVehicles(1)" class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none dark:text-white font-bold appearance-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm">
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
        <p class="mt-6 text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Loading Vehicles</p>
    </div>

    <!-- Data Table -->
    <DataTable v-if="!loading"
      :columns="columns" 
      :data="vehicles"
      :pagination="pagination"
      :stickyTop="tableStickyTop"
      @page-change="fetchVehicles">
      
      <template #vehicle_info="{ row }">
        <div class="flex flex-col gap-0.5">
          <div>
            <span class="font-bold text-slate-800 dark:text-white">{{ row.vehicle_name }}</span>
          </div>
          <div class="flex items-center gap-1.5 mt-0.5">
            <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">Plate: {{ row.plate_number }}</span>
          </div>
        </div>
      </template>

      <template #driver_info="{ row }">
        <div class="flex flex-col">
          <span class="font-bold text-slate-700 dark:text-slate-300">{{ row.driver_name }}</span>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ row.driver_phone }}</span>
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">QID: {{ row.driver_qid || 'N/A' }}</span>
        </div>
      </template>

      <template #istimara_date="{ row }">
        <div class="flex flex-col">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">{{ formatDate(row.reg_expiry_date) }}</span>
        </div>
      </template>
      
      <template #company_info="{ row }">
        <div class="flex flex-col">
          <span class="font-bold text-slate-700 dark:text-slate-300">{{ row.company?.name || 'N/A' }}</span>
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">CC: {{ row.company?.computer_card || 'N/A' }}</span>
        </div>
      </template>

      <template #starting_date="{ row }">
        <div class="flex flex-col">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">{{ formatDate(row.handover_datetime) }}</span>
        </div>
      </template>

      <template #fine_amount="{ row }">
        <div class="flex flex-col">
          <span class="text-xs font-bold" :class="row.fine_amount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'">QAR {{ row.fine_amount || '0' }}</span>
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
          <button v-if="authStore.hasPermission('view_vehicles') || authStore.isSuperAdmin" @click="openModal(row, true)" class="p-1 text-slate-400 hover:text-blue-500 transition-colors" title="View Vehicle">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
          </button>
          <button v-if="authStore.hasPermission('vehicle_edit') || authStore.isSuperAdmin" @click="openModal(row)" class="p-1 text-slate-400 hover:text-[#29166e] transition-colors" title="Edit Vehicle">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
          <button v-if="authStore.hasPermission('vehicle_status') || authStore.isSuperAdmin" @click="confirmStatusToggle(row)" class="p-1 transition-colors" :class="row.is_active ? 'text-green-500 hover:text-green-600' : 'text-slate-400 hover:text-slate-500'" :title="row.is_active ? 'Deactivate' : 'Activate'">
            <svg v-if="row.is_active" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </button>
          <button v-if="authStore.hasPermission('vehicle_delete') || authStore.isSuperAdmin" @click="confirmDelete(row)" class="p-1 text-slate-400 hover:text-red-500 transition-colors" title="Delete Vehicle">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Add/Edit Modal -->
    <Modal :show="showModal" :title="viewMode ? 'View Vehicle' : editMode ? 'Edit Vehicle' : 'Add Vehicle'" @close="showModal = false" maxWidth="4xl">
      <form @submit.prevent="saveVehicle" class="space-y-6">
        <fieldset :disabled="viewMode" class="space-y-6">
        
        <!-- VEHICLE INFORMATION -->
        <div class="bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div class="flex items-center gap-2 mb-6">
                <span class="w-2 h-2 rounded-full bg-orange-500"></span>
                <h3 class="text-xs font-black text-orange-600 dark:text-orange-500 uppercase tracking-widest">Vehicle Information</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Plate Number <span class="text-red-500">*</span></label>
                    <input v-model="form.plate_number" type="text" required
                           class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                </div>
                
                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Vehicle Name <span class="text-red-500">*</span></label>
                    <input v-model="form.vehicle_name" type="text" required placeholder="Make & Model"
                           class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold placeholder:font-normal">
                </div>

                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Description</label>
                    <input v-model="form.description" type="text" placeholder="Purpose, notes..."
                           class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold placeholder:font-normal">
                </div>

                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Chassis No.</label>
                    <input v-model="form.chassis_no" type="text"
                           class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                </div>

                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Istimara Expiry Date <span class="text-red-500">*</span></label>
                    <DateInput v-model="form.reg_expiry_date" required />
                </div>

                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Fine Amount (QAR)</label>
                    <input v-model="form.fine_amount" type="number" min="0" step="0.01" placeholder="0.00"
                           class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold placeholder:font-normal">
                </div>

                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Vehicle Document</label>
                    <input v-if="!viewMode" type="file" @change="e => handleFileChange(e, 'vehicle_document')" accept=".jpg,.jpeg,.png,.pdf"
                           class="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-wider file:bg-[#29166e]/10 file:text-[#29166e] hover:file:bg-[#29166e]/20 transition-all outline-none">
                    <div v-if="filePreviews.vehicle_document || (typeof form.vehicle_document === 'string' && form.vehicle_document)" class="mt-3">
                        <img v-if="filePreviews.vehicle_document" :src="filePreviews.vehicle_document" class="h-24 object-cover rounded-lg border border-slate-200 shadow-sm mb-2">
                        <img v-else-if="typeof form.vehicle_document === 'string' && form.vehicle_document.match(/\.(jpeg|jpg|gif|png)$/i)" :src="getStorageUrl(form.vehicle_document)" class="h-24 object-cover rounded-lg border border-slate-200 shadow-sm mb-2">
                        <a v-if="typeof form.vehicle_document === 'string' && form.vehicle_document" :href="getStorageUrl(form.vehicle_document)" target="_blank" class="text-[10px] font-bold text-blue-500 inline-flex items-center gap-1 hover:text-blue-600">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                            View Document
                        </a>
                    </div>
                    <div v-else-if="viewMode" class="text-sm text-slate-500 italic mt-2">No document uploaded</div>
                </div>

                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Company & Computer No. <span class="text-red-500">*</span></label>
                    <SearchableSelect 
                        v-model="form.company_id" 
                        :options="computedCompanies" 
                        placeholder="Select Company" 
                        class="w-full font-bold"
                    />
                </div>
            </div>
        </div>

        <!-- DRIVER INFORMATION -->
        <div class="bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div class="flex items-center gap-2 mb-6">
                <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                <h3 class="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Driver Information</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">QID Number <span class="text-red-500">*</span></label>
                    <input v-model="form.driver_qid" type="text" required
                           @input="form.driver_qid = form.driver_qid.replace(/[^0-9]/g, '').slice(0, 11)"
                           minlength="11" maxlength="11"
                           class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                </div>
                
                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Driver Name <span class="text-red-500">*</span></label>
                    <input v-model="form.driver_name" type="text" required
                           class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                </div>

                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Mobile Number <span class="text-red-500">*</span></label>
                    <div class="relative group">
                        <div class="absolute inset-y-0 left-0 flex items-center px-4 text-sm font-black text-slate-500 border-r border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 rounded-l-2xl pointer-events-none transition-colors group-focus-within:text-[#29166e] group-focus-within:bg-[#29166e]/5">
                            +974
                        </div>
                        <input v-model="form.driver_phone" type="text" required
                               @input="form.driver_phone = form.driver_phone.replace(/[^0-9]/g, '').slice(0, 8)"
                               minlength="8" maxlength="8"
                               class="w-full pl-20 pr-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                    </div>
                </div>

                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Alt. Mobile <span class="text-slate-400 font-normal italic">(Optional)</span></label>
                    <div class="relative group">
                        <div class="absolute inset-y-0 left-0 flex items-center px-4 text-sm font-black text-slate-500 border-r border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 rounded-l-2xl pointer-events-none transition-colors group-focus-within:text-[#29166e] group-focus-within:bg-[#29166e]/5">
                            +974
                        </div>
                        <input v-model="form.driver_alt_phone" type="text"
                               @input="form.driver_alt_phone = form.driver_alt_phone.replace(/[^0-9]/g, '').slice(0, 8)"
                               minlength="8" maxlength="8"
                               class="w-full pl-20 pr-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                    </div>
                </div>
            </div>
        </div>

        <!-- HANDOVER & RETURN -->
        <div class="bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div class="flex items-center gap-2 mb-6">
                <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                <h3 class="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Handover & Return</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Starting date & time</label>
                    <DateTimeInput v-model="form.handover_datetime" />
                </div>
                
                <div class="md:col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Return Date & Time</label>
                    <DateTimeInput v-model="form.return_datetime" />
                </div>
            </div>
        </div>

        </fieldset>
        <div class="flex justify-end gap-4 mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
          <button type="button" @click="showModal = false" class="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-xl font-bold text-sm transition-colors shadow-sm">{{ viewMode ? 'Close' : 'Cancel' }}</button>
          <button v-if="!viewMode" type="submit" class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/25 transition-all font-black text-sm transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2" :disabled="saving">
            <svg v-if="!saving" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
            <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ saving ? 'Saving...' : 'Save Vehicle' }}
          </button>
        </div>
      </form>
    </Modal>
    
    <!-- Delete Confirmation Modal -->
    <ConfirmModal 
      :show="showDeleteModal" 
      title="Delete Vehicle"
      :message="`Are you sure you want to delete this vehicle?`"
      description="This action cannot be undone. All related data will be permanently removed."
      variant="danger"
      confirm-text="Yes, Delete Vehicle"
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
      :title="vehicleToToggle?.is_active ? 'Deactivate Vehicle' : 'Activate Vehicle'"
      :message="`Are you sure you want to ${vehicleToToggle?.is_active ? 'deactivate' : 'activate'} this vehicle?`"
      :description="vehicleToToggle?.is_active ? 'This vehicle will no longer be marked as active.' : 'This vehicle will be marked as active.'"
      :variant="vehicleToToggle?.is_active ? 'warning' : 'primary'"
      :confirm-text="vehicleToToggle?.is_active ? 'Yes, Deactivate' : 'Yes, Activate'"
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
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { vehicleService, companyService } from '@/services/api';
import { useNotificationStore } from '@/stores/notification';
import DataTable from '@/components/shared/DataTable.vue';
import Modal from '@/components/shared/Modal.vue';
import ConfirmModal from '@/components/shared/ConfirmModal.vue';
import SearchableSelect from '@/components/shared/SearchableSelect.vue';
import DateInput from '@/components/shared/DateInput.vue';
import DateTimeInput from '@/components/shared/DateTimeInput.vue';
import { useAuthStore } from '@/stores/auth';

const columns = [
    { key: 'vehicle_info', label: 'Vehicle Info', sortable: false },
    { key: 'driver_info', label: 'Driver Info', sortable: false },
    { key: 'istimara_date', label: 'Istimara Expiry Date', sortable: false },
    { key: 'company_info', label: 'Company', sortable: false },
    { key: 'starting_date', label: 'Starting Date', sortable: false },
    { key: 'fine_amount', label: 'Fine', sortable: false },
    { key: 'is_active', label: 'Status', sortable: false },
    { key: 'actions', label: 'Actions', sortable: false }
];

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month.toUpperCase()}-${year}`;
};

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const vehicles = ref([]);
const companies = ref([]);
const computedCompanies = computed(() => {
    return companies.value.map(c => ({
        ...c,
        original_name: c.name,
        name: `${c.name} - ${c.computer_card || 'N/A'}`
    }));
});
const loading = ref(true);
const saving = ref(false);
const showModal = ref(false);
const showDeleteModal = ref(false);
const showStatusModal = ref(false);
const vehicleToDelete = ref(null);
const vehicleToToggle = ref(null);
const editMode = ref(false);
const viewMode = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');
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
    { id: 'active', name: 'Active Vehicles' },
    { id: 'inactive', name: 'Inactive Vehicles' }
];

const selectedVehicle = ref(null);
const filePreviews = ref({});

const getStorageUrl = (path) => {
    if (!path) return '';
    return `${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${path}`;
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

const form = ref({
    plate_number: '',
    vehicle_name: '',
    description: '',
    chassis_no: '',
    reg_expiry_date: '',
    company_id: '',
    driver_qid: '',
    driver_name: '',
    driver_phone: '',
    driver_alt_phone: '',
    handover_datetime: '',
    return_datetime: '',
    vehicle_document: null,
    fine_amount: 0,
    is_active: true
});

const fetchVehicles = async (page = 1) => {
    loading.value = true;
    try {
        const response = await vehicleService.getAll({ 
            status: statusFilter.value,
            page,
            per_page: perPage.value,
            search: searchQuery.value
        });
        
        const resData = response.data;
        vehicles.value = resData.data;
        
        const meta = resData.meta || resData;
        pagination.value = {
            current_page: meta.current_page,
            last_page: meta.last_page,
            total: meta.total,
            per_page: meta.per_page,
        };
    } catch (error) {
        console.error('Failed to fetch vehicles:', error);
        notificationStore.error(error.response?.data?.message || 'Failed to load vehicles');
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

const openModal = (vehicle = null, isView = false) => {
    viewMode.value = isView;
    if (vehicle) {
        editMode.value = !isView;
        selectedVehicle.value = vehicle;
        form.value = { ...vehicle };
        // Format dates for inputs if needed
        if (form.value.handover_datetime) form.value.handover_datetime = form.value.handover_datetime.substring(0, 16);
        if (form.value.return_datetime) form.value.return_datetime = form.value.return_datetime.substring(0, 16);
    } else {
        editMode.value = false;
        viewMode.value = false;
        selectedVehicle.value = null;
        form.value = {
            plate_number: '',
            vehicle_name: '',
            description: '',
            chassis_no: '',
            reg_expiry_date: '',
            company_id: '',
            driver_qid: '',
            driver_name: '',
            driver_phone: '',
            driver_alt_phone: '',
            handover_datetime: '',
            return_datetime: '',
            vehicle_document: null,
            fine_amount: 0,
            is_active: true
        };
    }
    filePreviews.value = {};
    showModal.value = true;
};

const saveVehicle = async () => {
    saving.value = true;
    try {
        let submitData = new FormData();
        const fileFields = ['vehicle_document'];
        
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
            await vehicleService.update(selectedVehicle.value.id, submitData);
            notificationStore.addNotification('Vehicle updated successfully', 'success');
        } else {
            await vehicleService.create(submitData);
            notificationStore.addNotification('Vehicle created successfully', 'success');
        }
        showModal.value = false;
        fetchVehicles(editMode.value ? pagination.value.current_page : 1);
    } catch (error) {
        console.error('Error saving vehicle:', error);
        notificationStore.addNotification(error.response?.data?.message || 'Failed to save vehicle', 'error');
    } finally {
        saving.value = false;
    }
};

const confirmDelete = (vehicle) => {
    vehicleToDelete.value = vehicle;
    showDeleteModal.value = true;
};

const handleDelete = async () => {
    if (!vehicleToDelete.value) return;
    
    saving.value = true;
    try {
        await vehicleService.delete(vehicleToDelete.value.id);
        notificationStore.success('Vehicle deleted successfully');
        showDeleteModal.value = false;
        fetchVehicles(pagination.value.current_page);
    } catch (error) {
        console.error('Delete failed', error);
        notificationStore.error(error.response?.data?.message || 'Failed to delete vehicle');
    } finally {
        saving.value = false;
        vehicleToDelete.value = null;
    }
};

const confirmStatusToggle = (vehicle) => {
    vehicleToToggle.value = vehicle;
    showStatusModal.value = true;
};

const handleStatusToggle = async () => {
    if (!vehicleToToggle.value) return;
    
    saving.value = true;
    try {
        await vehicleService.update(vehicleToToggle.value.id, {
            is_active: !vehicleToToggle.value.is_active
        });
        notificationStore.success(`Vehicle ${!vehicleToToggle.value.is_active ? 'activated' : 'deactivated'} successfully`);
        showStatusModal.value = false;
        fetchVehicles(pagination.value.current_page);
    } catch (error) {
        console.error('Status toggle failed', error);
        notificationStore.error(error.response?.data?.message || 'Failed to update status');
    } finally {
        saving.value = false;
        vehicleToToggle.value = null;
    }
};

onMounted(() => {
    fetchVehicles();
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
