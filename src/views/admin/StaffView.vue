<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Staff Management</h1>
        <p class="text-slate-500 dark:text-slate-400">Manage employees, documents and assignments</p>
      </div>
      <button v-if="authStore.hasPermission('staff_create')" @click="openModal()" class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-500/30 transition-all font-semibold">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        Add Staff Member
      </button>
    </div>

    <!-- Filters & Search -->
    <div class="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="relative w-full md:w-96">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </span>
        <input v-model="search" @input="fetchStaff(1)" type="text" placeholder="Search by name, QID, profession..." 
               class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-white">
      </div>

      <div v-if="filter" class="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg animate-in fade-in slide-in-from-left-4">
        <span class="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider text-nowrap">Filtered: {{ filter.replace('_', ' ') }}</span>
        <button @click="filter = ''; fetchStaff(1)" class="p-0.5 hover:bg-amber-100 dark:hover:bg-amber-800 rounded transition-colors text-amber-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </button>
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto">
        <SearchableSelect 
          v-model="statusFilter"
          :options="statusOptions"
          @change="fetchStaff(1)"
          placeholder="All Status"
          class="flex-1 md:w-48"
        />
        <SearchableSelect 
          v-model="companyFilter"
          :options="companyOptions"
          @change="fetchStaff(1)"
          placeholder="All Companies"
          class="flex-1 md:w-64"
        />
        <select v-model="perPage" @change="fetchStaff(1)" class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none dark:text-white font-semibold">
          <option :value="10">10 / pg</option>
          <option :value="25">25 / pg</option>
          <option :value="50">50 / pg</option>
        </select>
      </div>
    </div>

    <!-- Data Table -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div class="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <p class="mt-4 text-slate-500 font-medium">Loading staff records...</p>
    </div>

    <DataTable v-else
      :columns="columns" 
      :data="staffMembers" 
      :pagination="pagination"
      :sort-by="sortBy"
      :sort-dir="sortDir"
      @sort="handleSort"
      @page-change="fetchStaff">
      
      <template #name="{ row }">
        <div class="flex flex-col">
          <span class="text-sm font-black text-slate-800 dark:text-white leading-tight uppercase">{{ row.name }}</span>
          <span class="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-wider mt-1">{{ formatMobile(row.mobile) }}</span>
        </div>
      </template>

      <template #company_name="{ row }">
        <div class="flex flex-col">
          <span class="font-semibold text-slate-700 dark:text-slate-300">{{ row.company?.name || 'N/A' }}</span>
          <span v-if="row.branch" class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {{ row.branch.name }}<span v-if="row.branch.branch_number">-{{ row.branch.branch_number }}</span>
          </span>
        </div>
      </template>

      <template #qid_expiry="{ value, row }">
        <div class="flex flex-col">
          <span :class="expiryClass(value)">{{ formatDate(value) }}</span>
          <span v-if="row.qid_days_left !== null" class="text-[10px] font-bold" :class="row.qid_days_left <= 0 ? 'text-red-500' : 'text-slate-400'">
            {{ row.qid_days_left > 0 ? '+' : '' }}{{ row.qid_days_left }} Days
          </span>
        </div>
      </template>

      <template #passport_expiry="{ value, row }">
        <div class="flex flex-col">
          <span :class="expiryClass(value)">{{ formatDate(value) }}</span>
          <span v-if="row.passport_days_left !== null" class="text-[10px] font-bold" :class="row.passport_days_left <= 0 ? 'text-red-500' : 'text-slate-400'">
            {{ row.passport_days_left > 0 ? '+' : '' }}{{ row.passport_days_left }} Days
          </span>
        </div>
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
          <button @click="openModal(row, true)" class="p-1 text-slate-400 hover:text-indigo-500 transition-colors" title="View Details">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>

          <button v-if="authStore.hasPermission('staff_edit')" @click="openModal(row)" class="p-1 text-slate-400 hover:text-blue-500 transition-colors" title="Edit Staff">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>

          <button v-if="authStore.hasPermission('staff_status')" @click="toggleStatus(row)" class="p-1 transition-colors" :class="row.status === 'active' ? 'text-green-500 hover:text-red-500' : 'text-slate-400 hover:text-green-500'" :title="row.status === 'active' ? 'Deactivate Staff' : 'Activate Staff'">
            <svg v-if="row.status === 'active'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Upsert/View Modal -->
    <Modal :show="showModal" :title="viewMode ? 'Staff Details' : (editMode ? 'Edit Staff Member' : 'Add Staff Member')" @close="showModal = false" maxWidth="5xl">
      <form @submit.prevent="saveStaff" class="grid grid-cols-1 md:grid-cols-2 gap-10">
        <!-- Left Column -->
        <div class="space-y-10">
          <!-- Basic Info -->
          <div class="space-y-6">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            </div>
            <h4 class="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Personal & Prof. Info</h4>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name <span class="text-red-500">*</span></label>
              <input v-model="form.name" type="text" required :disabled="viewMode" 
                :class="[
                  errors.name ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-slate-200 dark:border-slate-700/50',
                  viewMode ? 'bg-slate-100 dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-900/50'
                ]"
                class="w-full px-5 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white font-medium disabled:opacity-75 disabled:cursor-not-allowed" placeholder="Employee Name">
              <p v-if="errors.name" class="mt-1 ml-1 text-[10px] font-bold text-rose-500 uppercase tracking-wider">{{ Array.isArray(errors.name) ? errors.name[0] : errors.name }}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nationality <span class="text-red-500">*</span></label>
                <select v-model="form.nationality" required :disabled="viewMode"
                  :class="[
                    errors.nationality ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-slate-200 dark:border-slate-700/50',
                    viewMode ? 'bg-slate-100 dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-900/50'
                  ]"
                  class="w-full px-5 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white font-medium disabled:opacity-75 disabled:cursor-not-allowed appearance-none">
                  <option value="">Select Country</option>
                  <option v-for="c in nationalities" :key="c" :value="c">{{ c }}</option>
                </select>
                <p v-if="errors.nationality" class="mt-1 ml-1 text-[10px] font-bold text-rose-500 uppercase tracking-wider">{{ Array.isArray(errors.nationality) ? errors.nationality[0] : errors.nationality }}</p>
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Profession <span class="text-red-500">*</span></label>
                <input v-model="form.profession" type="text" required :disabled="viewMode" 
                  :class="[
                    errors.profession ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-slate-200 dark:border-slate-700/50',
                    viewMode ? 'bg-slate-100 dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-900/50'
                  ]"
                  class="w-full px-5 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white font-medium disabled:opacity-75 disabled:cursor-not-allowed" placeholder="Job Title">
                <p v-if="errors.profession" class="mt-1 ml-1 text-[10px] font-bold text-rose-500 uppercase tracking-wider">{{ Array.isArray(errors.profession) ? errors.profession[0] : errors.profession }}</p>
              </div>
            </div>

            <div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <SearchableSelect 
                    label="Assigned Company *"
                    v-model="selectedCompanyName"
                    required
                    :options="modalCompanyOptions"
                    :disabled="viewMode"
                    :error="errors.company_id"
                    placeholder="Select Assigned Company"
                    @change="handleCompanyChange"
                  />
                </div>
                <div>
                  <SearchableSelect 
                    label="Assign Branch"
                    v-model="form.branch_id"
                    :options="modalBranchOptions"
                    :disabled="viewMode || !form.company_id"
                    :placeholder="loadingBranches ? 'Loading branches...' : 'Select Branch'"
                  />
                  <p class="mt-1 ml-1 text-[10px] text-slate-400 italic">Optional: Defaults to Main</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mobile Number <span class="text-red-500">*</span></label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-4 pr-2 border-r border-slate-200 dark:border-slate-700/50 text-slate-400 font-bold text-xs pointer-events-none group-focus-within:text-blue-500 transition-colors">
                    +974
                  </div>
                    <input v-model="form.mobile" type="text" required :disabled="viewMode" 
                      @input="form.mobile = form.mobile.replace(/[^0-9]/g, '').slice(0, 8)"
                      :class="[
                        errors.mobile ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-slate-200 dark:border-slate-700/50',
                        viewMode ? 'bg-slate-100 dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-900/50'
                      ]"
                      class="w-full pl-16 pr-5 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white font-medium disabled:opacity-75 disabled:cursor-not-allowed" placeholder="8-digit number">
                </div>
                <p v-if="errors.mobile" class="mt-1 ml-1 text-[10px] font-bold text-rose-500 uppercase tracking-wider">{{ Array.isArray(errors.mobile) ? errors.mobile[0] : errors.mobile }}</p>
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Alt. Mobile <span class="text-slate-400 font-normal italic">(Optional)</span></label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-4 pr-2 border-r border-slate-200 dark:border-slate-700/50 text-slate-400 font-bold text-xs pointer-events-none group-focus-within:text-blue-500 transition-colors">
                    +974
                  </div>
                  <input v-model="form.alternative_mobile" type="text" :disabled="viewMode" 
                    @input="form.alternative_mobile = form.alternative_mobile.replace(/[^0-9]/g, '').slice(0, 8)"
                    class="w-full pl-16 pr-5 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white font-medium disabled:opacity-75 disabled:cursor-not-allowed" placeholder="8-digit number">
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <DateInput 
                label="Date of Birth *"
                v-model="form.date_of_birth"
                required
                :disabled="viewMode"
                :error="errors.date_of_birth"
              />
              <div class="relative group">
                <DateInput 
                  label="Start Contract Date *"
                  v-model="form.joining_date"
                  required
                  :disabled="viewMode"
                  :error="errors.joining_date"
                />
              </div>
            </div>
          </div>
        </div>

        </div>

        <!-- Identity Details -->
        <div class="space-y-6">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            </div>
            <h4 class="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Identity & Documents</h4>
          </div>
          
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Passport Number <span class="text-red-500">*</span></label>
                <input v-model="form.passport_number" type="text" required :disabled="viewMode" 
                  :class="[
                    errors.passport_number ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-slate-200 dark:border-slate-700/50',
                    viewMode ? 'bg-slate-100 dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-900/50'
                  ]"
                  class="w-full px-5 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white font-medium disabled:opacity-75 disabled:cursor-not-allowed">
                <p v-if="errors.passport_number" class="mt-1 ml-1 text-[10px] font-bold text-rose-500 uppercase tracking-wider">{{ Array.isArray(errors.passport_number) ? errors.passport_number[0] : errors.passport_number }}</p>
              </div>
              <DateInput 
                label="Passport Expiry *"
                v-model="form.passport_expiry"
                required
                :disabled="viewMode"
                :error="errors.passport_expiry"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Qatar ID (QID) Number <span class="text-red-500">*</span></label>
                <input v-model="form.qid_number" type="text" required :disabled="viewMode" maxlength="11"
                  :class="[
                    errors.qid_number ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-slate-200 dark:border-slate-700/50',
                    viewMode ? 'bg-slate-100 dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-900/50'
                  ]"
                  class="w-full px-5 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white font-medium disabled:opacity-75 disabled:cursor-not-allowed" placeholder="11-digit QID">
                <p v-if="errors.qid_number" class="mt-1 ml-1 text-[10px] font-bold text-rose-500 uppercase tracking-wider">{{ Array.isArray(errors.qid_number) ? errors.qid_number[0] : errors.qid_number }}</p>
              </div>
              <DateInput 
                label="QID Expiry *"
                v-model="form.qid_expiry"
                required
                :disabled="viewMode"
                :error="errors.qid_expiry"
              />
            </div>
            
            <div class="space-y-4 pt-2">
              <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50">
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">QID Documents <span class="text-slate-400 font-normal italic">(Optional)</span></label>
                
                <div class="flex flex-wrap gap-3 mb-3">
                  <!-- Existing Documents -->
                  <div v-for="file in form.qid_documents" :key="file.id" class="group relative">
                    <a :href="getFileUrl(file.url)" target="_blank" 
                       :class="[isImage(file.name) ? 'w-24 h-24' : 'w-24 h-24 flex flex-col items-center justify-center bg-white dark:bg-slate-800']"
                       class="block rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:border-blue-500 transition-all">
                      <img v-if="isImage(file.name)" :src="getFileUrl(file.url)" class="w-full h-full object-cover" />
                      <div v-else class="flex flex-col items-center p-2 text-center">
                        <svg class="w-8 h-8 text-slate-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                        <span class="text-[8px] font-bold text-slate-500 truncate w-full px-1">{{ file.name }}</span>
                      </div>
                    </a>
                    <button v-if="!viewMode" @click.stop="removeStoredDocument('qid', file.id)" 
                      class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all z-20"
                      title="Remove document">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    </button>
                  </div>

                  <!-- New Uploads Previews -->
                  <div v-for="(file, index) in form.qid_files" :key="'new-'+index" class="group relative">
                    <div :class="[form.qid_previews[index] ? 'w-24 h-24' : 'w-24 h-24 flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900/20']"
                         class="rounded-xl overflow-hidden border-2 border-dashed border-blue-400 dark:border-blue-500/50 shadow-sm">
                      <img v-if="form.qid_previews[index]" :src="form.qid_previews[index]" class="w-full h-full object-cover" />
                      <div v-else class="flex flex-col items-center p-2 text-center">
                        <svg class="w-8 h-8 text-blue-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                        <span class="text-[8px] font-bold text-blue-500 truncate w-full px-1">{{ file.name }}</span>
                      </div>
                    </div>
                    <button v-if="!viewMode" @click.stop="removeNewFile('qid', index)" 
                      class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all z-20"
                      title="Remove file">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    </button>
                  </div>
                </div>

                <input v-if="!viewMode" type="file" @change="e => handleFileChange(e, 'qid_files')" multiple accept=".jpg,.jpeg,.png,.pdf" class="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all cursor-pointer">
                <p v-if="!form.qid_documents?.length && !form.qid_files?.length" class="text-xs text-slate-400 italic py-2">No documents attached</p>
              </div>
              <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50">
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Passport Documents <span class="text-slate-400 font-normal italic">(Optional)</span></label>
                
                <div class="flex flex-wrap gap-3 mb-3">
                  <!-- Existing Documents -->
                  <div v-for="file in form.passport_documents" :key="file.id" class="group relative">
                    <a :href="getFileUrl(file.url)" target="_blank" 
                       :class="[isImage(file.name) ? 'w-24 h-24' : 'w-24 h-24 flex flex-col items-center justify-center bg-white dark:bg-slate-800']"
                       class="block rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-500 transition-all">
                      <img v-if="isImage(file.name)" :src="getFileUrl(file.url)" class="w-full h-full object-cover" />
                      <div v-else class="flex flex-col items-center p-2 text-center">
                        <svg class="w-8 h-8 text-slate-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                        <span class="text-[8px] font-bold text-slate-500 truncate w-full px-1">{{ file.name }}</span>
                      </div>
                    </a>
                    <button v-if="!viewMode" @click.stop="removeStoredDocument('passport', file.id)" 
                      class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all z-20"
                      title="Remove document">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    </button>
                  </div>

                  <!-- New Uploads Previews -->
                  <div v-for="(file, index) in form.passport_files" :key="'new-'+index" class="group relative">
                    <div :class="[form.passport_previews[index] ? 'w-24 h-24' : 'w-24 h-24 flex flex-col items-center justify-center bg-indigo-50 dark:bg-indigo-900/20']"
                         class="rounded-xl overflow-hidden border-2 border-dashed border-indigo-400 dark:border-indigo-500/50 shadow-sm">
                      <img v-if="form.passport_previews[index]" :src="form.passport_previews[index]" class="w-full h-full object-cover" />
                      <div v-else class="flex flex-col items-center p-2 text-center">
                        <svg class="w-8 h-8 text-indigo-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                        <span class="text-[8px] font-bold text-indigo-500 truncate w-full px-1">{{ file.name }}</span>
                      </div>
                    </div>
                    <button v-if="!viewMode" @click.stop="removeNewFile('passport', index)" 
                      class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all z-20"
                      title="Remove file">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    </button>
                  </div>
                </div>

                <input v-if="!viewMode" type="file" @change="e => handleFileChange(e, 'passport_files')" multiple accept=".jpg,.jpeg,.png,.pdf" class="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 transition-all cursor-pointer">
                <p v-if="!form.passport_documents?.length && !form.passport_files?.length" class="text-xs text-slate-400 italic py-2">No documents attached</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Full Width Notes -->
        <div class="md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Important Notes <span class="text-slate-400 font-normal italic">(Internal Use Only)</span></label>
          <textarea v-model="form.notes" :disabled="viewMode"
            :class="[
              viewMode ? 'bg-slate-100 dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-900/50'
            ]"
            class="w-full px-6 py-5 border border-slate-200 dark:border-slate-700/50 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white font-medium disabled:opacity-75 disabled:cursor-not-allowed resize-none h-28 shadow-inner" 
            placeholder="Enter any additional details, special instructions, or performance notes about this staff member..."></textarea>
        </div>
      </form>
      <template #footer>
        <button @click="showModal = false" class="px-6 py-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-sm transition-colors">
          {{ viewMode ? 'Close' : 'Cancel' }}
        </button>
        <button v-if="!viewMode" @click="saveStaff" class="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-500/25 transition-all font-black text-sm transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2" :disabled="saving">
          <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          {{ saving ? 'Saving Changes...' : 'Save Member Details' }}
        </button>
      </template>
    </Modal>



    <!-- Status Toggle Confirmation Modal -->
    <ConfirmModal 
      :show="showStatusModal" 
      :title="selectedStaff?.status === 'active' ? 'Deactivate Staff' : 'Activate Staff'"
      :message="`Are you sure you want to set ${selectedStaff?.name} to ${selectedStaff?.status === 'active' ? 'Inactive' : 'Active'}?`"
      :description="selectedStaff?.status === 'active' ? 'This will mark the employee as inactive and stop their active assignments.' : 'This will restore the employee to active status.'"
      :variant="selectedStaff?.status === 'active' ? 'danger' : 'success'"
      :confirm-text="selectedStaff?.status === 'active' ? 'Yes, Inactivate' : 'Yes, Activate'"
      :loading="saving"
      @confirm="handleStatusToggle"
      @cancel="showStatusModal = false"
    >
      <template #icon>
        <svg v-if="selectedStaff?.status === 'active'" class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
        <svg v-else class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      </template>
    </ConfirmModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import DataTable from '@/components/shared/DataTable.vue';
import Modal from '@/components/shared/Modal.vue';
import ConfirmModal from '@/components/shared/ConfirmModal.vue';
import SearchableSelect from '@/components/shared/SearchableSelect.vue';
import DateInput from '@/components/shared/DateInput.vue';
import { useAuthStore } from '@/stores/auth';
import { staffService, companyService, branchService, BASE_URL } from '@/services/api';
import { useNotificationStore } from '@/stores/notification';

const notificationStore = useNotificationStore();
const authStore = useAuthStore();

const staffMembers = ref([]);
const loading = ref(true);
const saving = ref(false);
const search = ref('');
const sortBy = ref('created_at');
const sortDir = ref('desc');
const perPage = ref(10);
const pagination = ref({});
const filter = ref('');
const statusFilter = ref('');
const statusOptions = [
  { id: '', name: 'All Status' },
  { id: 'active', name: 'Active Staff' },
  { id: 'inactive', name: 'Inactive Staff' }
];
const companyFilter = ref('');
const route = useRoute();

const showModal = ref(false);
const showConfirmModal = ref(false);
const showStatusModal = ref(false);
const itemToDelete = ref(null);
const selectedStaff = ref(null);
const deleting = ref(false);
const editMode = ref(false);
const viewMode = ref(false);
const errors = ref({});
const companies = ref([]);
const companyOptions = computed(() => {
  const options = [
    { id: '', name: 'All Companies' },
    { id: 'null', name: 'Freelance Only' }
  ];
  if (Array.isArray(companies.value)) {
    companies.value.forEach(c => options.push({ id: c.id, name: c.name }));
  }
  return options;
});

const modalCompanyOptions = computed(() => {
  if (!Array.isArray(companies.value)) return [];
  // Group by name to show each company name only once
  const uniqueNames = new Set();
  companies.value.forEach(c => uniqueNames.add(c.name));
  
  return Array.from(uniqueNames).sort().map(name => ({ id: name, name: name }));
});

const branches = ref([]);
const modalBranchOptions = computed(() => {
  if (!Array.isArray(branches.value)) return [];
  return branches.value.map(b => {
    let name = b.name;
    if (b.branch_number && !name.includes(b.branch_number)) {
      name = `${name} (${b.branch_number})`;
    }
    return { id: b.id, name };
  });
});

const nationalities = [
  'Qatar', 'India', 'Nepal', 'Philippines', 'Bangladesh', 'Pakistan', 'Sri Lanka', 
  'Egypt', 'Jordan', 'Lebanon', 'Syria', 'Sudan', 'Kenya', 'Ethiopia', 'Uganda',
  'United Kingdom', 'United States', 'Canada', 'Australia', 'Other'
];

const form = ref({
  id: null,
  name: '',
  nationality: '',
  profession: '',
  company_id: null,
  branch_id: null,
  mobile: '',
  alternative_mobile: '',
  date_of_birth: '',
  passport_number: '',
  passport_expiry: '',
  qid_number: '',
  qid_expiry: '',
  joining_date: '',
  status: 'active',
  qid_documents: [],
  passport_documents: [],
  qid_files: [],
  passport_files: [],
  qid_previews: [],
  passport_previews: [],
  delete_document_ids: [],
  notes: ''
});

const loadingBranches = ref(false);

const columns = [
  { key: 'name', label: 'Name & Contact', sortable: true },
  { key: 'profession', label: 'Profession', sortable: true },
  { key: 'company_name', label: 'Company', sortable: false },
  { key: 'qid_number', label: 'QID Number', sortable: false },
  { key: 'qid_expiry', label: 'QID Expiry', sortable: true },
  { key: 'passport_expiry', label: 'Passport Expiry', sortable: true },
  { key: 'status', label: 'Status', sortable: false },
  { key: 'actions', label: 'Actions', sortable: false }
];

const fetchCompanies = async () => {
  if (companies.value.length > 0) return;
  try {
    const res = await companyService.getSimple();
    companies.value = res.data;
  } catch (err) {
    console.error('Failed to fetch companies', err);
  }
};

const fetchStaff = async (page = 1) => {
  loading.value = true;
  try {
    const res = await staffService.getAll({
      page,
      search: search.value,
      sort_by: sortBy.value,
      sort_direction: sortDir.value,
      per_page: perPage.value,
      filter: filter.value,
      status: statusFilter.value,
      company_id: companyFilter.value
    });
    staffMembers.value = res.data.data;
    pagination.value = res.data.meta;
  } catch (err) {
    console.error('Failed to fetch staff', err);
    notificationStore.error(err.response?.data?.message || 'Failed to load staff list');
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
  fetchStaff(1);
};

const isImage = (fileName) => {
  if (!fileName) return false;
  const ext = fileName.split('.').pop().toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
};

const getFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  // Ensure we don't double slash
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${BASE_URL}${path}`;
};

const cleanPreviews = () => {
  if (form.value.qid_previews) {
    form.value.qid_previews.forEach(url => url && URL.revokeObjectURL(url));
  }
  if (form.value.passport_previews) {
    form.value.passport_previews.forEach(url => url && URL.revokeObjectURL(url));
  }
  form.value.qid_previews = [];
  form.value.passport_previews = [];
};

const handleFileChange = (e, field) => {
  const files = Array.from(e.target.files);
  form.value[field] = files;
  
  const previewField = field.replace('_files', '_previews');
  
  // Clean old previews for this field
  form.value[previewField].forEach(url => URL.revokeObjectURL(url));
  form.value[previewField] = [];

  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      form.value[previewField].push(URL.createObjectURL(file));
    } else {
      form.value[previewField].push(null); // No preview for non-images
    }
  });
};

const removeStoredDocument = (type, id) => {
  const field = type === 'qid' ? 'qid_documents' : 'passport_documents';
  form.value[field] = form.value[field].filter(doc => doc.id !== id);
  if (!form.value.delete_document_ids) {
    form.value.delete_document_ids = [];
  }
  form.value.delete_document_ids.push(id);
};

const removeNewFile = (type, index) => {
  if (type === 'qid') {
    form.value.qid_files.splice(index, 1);
    form.value.qid_previews.splice(index, 1);
  } else if (type === 'passport') {
    form.value.passport_files.splice(index, 1);
    form.value.passport_previews.splice(index, 1);
  }
};

const validate = () => {
    errors.value = {};
    if (!form.value.name) errors.value.name = 'Full name is required';
    if (!form.value.nationality) errors.value.nationality = 'Please select nationality';
    if (!form.value.profession) errors.value.profession = 'Profession is required';
    
    if (!form.value.mobile) {
        errors.value.mobile = 'Mobile number is required';
    } else if (!/^[0-9]{8}$/.test(form.value.mobile)) {
        errors.value.mobile = 'Mobile number must be exactly 8 digits';
    }

    if (!form.value.company_id) {
        errors.value.company_id = 'Please assign a company';
    }

    if (!form.value.date_of_birth) {
        errors.value.date_of_birth = 'Birth date is required';
    }

    if (!form.value.passport_number) {
        errors.value.passport_number = 'Passport is required';
    } else if (!/^[A-Z0-9]{7,15}$/i.test(form.value.passport_number)) {
        errors.value.passport_number = 'Passport must be alphanumeric (7-15 chars)';
    }

    if (!form.value.passport_expiry) errors.value.passport_expiry = 'Expiry date required';
    
    if (!form.value.qid_number) {
        errors.value.qid_number = 'QID number is required';
    } else if (!/^[0-9]{11}$/.test(form.value.qid_number)) {
        errors.value.qid_number = 'QID must be exactly 11 digits';
    }
    
    if (!form.value.qid_expiry) errors.value.qid_expiry = 'QID expiry is required';
    
    if (!form.value.joining_date) errors.value.joining_date = 'Start contract date is required';

    return Object.keys(errors.value).length === 0;
};

const selectedCompanyName = ref('');

const openModal = async (staff = null, isView = false) => {
  cleanPreviews();
  errors.value = {};
  viewMode.value = isView;
  await fetchCompanies();
  
  if (staff) {
    editMode.value = !isView;
    
    // Initialize selectedCompanyName
    if (staff.company) {
        selectedCompanyName.value = staff.company.name;
    } else if (staff.company_id) {
        const company = companies.value.find(c => c.id === staff.company_id);
        if (company) selectedCompanyName.value = company.name;
    } else {
        selectedCompanyName.value = '';
    }

    if (selectedCompanyName.value) {
        await fetchBranches(selectedCompanyName.value);
    }

    try {
        // Fetch full details to ensure documents and other relations are loaded
        const res = await staffService.getById(staff.id);
        const data = res.data.data;
        form.value = { 
            ...data, 
            qid_documents: data.qid_documents || [],
            passport_documents: data.passport_documents || [],
            qid_files: [], 
            passport_files: [],
            qid_previews: [],
            passport_previews: [],
            delete_document_ids: []
        };
    } catch (err) {
        console.error('Failed to fetch full staff details', err);
        form.value = { 
            ...staff, 
            qid_documents: staff.qid_documents || [],
            passport_documents: staff.passport_documents || [],
            qid_files: [], 
            passport_files: [],
            qid_previews: [],
            passport_previews: [],
            delete_document_ids: []
        };
    }
  } else {
    editMode.value = false;
    branches.value = [];
    selectedCompanyName.value = '';
    form.value = {
      id: null, name: '', nationality: '', profession: '', mobile: '',
      alternative_mobile: '',
      company_id: null,
      branch_id: null,
      date_of_birth: '', passport_number: '', passport_expiry: '',
      qid_number: '', qid_expiry: '', joining_date: '', status: 'active',
      qid_documents: [], passport_documents: [],
      qid_files: [], passport_files: [],
      qid_previews: [], passport_previews: [],
      delete_document_ids: [],
      notes: ''
    };
  }
  showModal.value = true;
};

const saveStaff = async () => {
    if (!validate()) return;
    
    saving.value = true;
    const formData = new FormData();
    
    // Append fields
    Object.keys(form.value).forEach(key => {
        if (['qid_files', 'passport_files'].includes(key)) {
            if (Array.isArray(form.value[key])) {
                form.value[key].forEach(file => formData.append(`${key}[]`, file));
            }
        } else if (!['qid_documents', 'passport_documents', 'qid_previews', 'passport_previews', 'delete_document_ids'].includes(key)) {
            // Only append non-object and non-file-info fields
            if (form.value[key] !== null && form.value[key] !== undefined) {
                formData.append(key, form.value[key]);
            }
        }
    });

    if (form.value.delete_document_ids && form.value.delete_document_ids.length > 0) {
        form.value.delete_document_ids.forEach(id => formData.append('delete_document_ids[]', id));
    }

    try {
        if (editMode.value) {
            await staffService.update(form.value.id, formData);
            notificationStore.success('Staff member updated successfully');
        } else {
            await staffService.create(formData);
            notificationStore.success('Staff member added successfully');
        }
        showModal.value = false;
        fetchStaff(pagination.value.current_page || 1);
    } catch (err) {
        if (err.response?.status === 422) {
            errors.value = err.response.data.errors;
            notificationStore.error('Validation error. Please check the fields.');
        } else {
            notificationStore.error(err.response?.data?.message || 'Failed to save staff member');
        }
    } finally {
        saving.value = false;
    }
};

const toggleStatus = (staff) => {
  selectedStaff.value = staff;
  showStatusModal.value = true;
};

const handleStatusToggle = async () => {
    if (!selectedStaff.value) return;
    
    saving.value = true;
    const newStatus = selectedStaff.value.status === 'active' ? 'inactive' : 'active';
    
    try {
        await staffService.update(selectedStaff.value.id, { status: newStatus });
        notificationStore.success(`Staff member is now ${newStatus}`);
        showStatusModal.value = false;
        fetchStaff(pagination.value.current_page || 1);
    } catch (err) {
        console.error('Status toggle failed', err);
        notificationStore.error(err.response?.data?.message || 'Failed to update status');
    } finally {
        saving.value = false;
    }
};



const handleCompanyChange = (companyName) => {
    form.value.branch_id = null;
    if (companyName) {
        fetchBranches(companyName);
    } else {
        branches.value = [];
        form.value.company_id = null;
    }
};

const fetchBranches = async (companyName) => {
    if (!companyName) {
        branches.value = [];
        return;
    }
    loadingBranches.value = true;
    try {
        // Find all company records with this name
        const matchingCompanies = companies.value.filter(c => c.name === companyName);
        const companyIds = matchingCompanies.map(c => c.id);
        
        if (companyIds.length === 0) {
            branches.value = [];
            return;
        }

        // Set default company_id to the first one found
        if (!form.value.company_id || !matchingCompanies.find(c => c.id === form.value.company_id)) {
            form.value.company_id = companyIds[0];
        }

        // Fetch branches for all these companies
        const branchPromises = companyIds.map(id => branchService.getAll(id));
        const results = await Promise.all(branchPromises);
        
        // Flatten all branches
        const allBranches = results.flatMap(res => 
            Array.isArray(res.data) ? res.data : (res.data.data || [])
        );
        
        branches.value = allBranches;
        
        // Auto-select if only one branch exists across all records
        if (branches.value.length === 1 && !form.value.branch_id) {
            form.value.branch_id = branches.value[0].id;
            form.value.company_id = branches.value[0].company_id;
        }
    } catch (err) {
        console.error('Failed to fetch combined branches', err);
        branches.value = [];
    } finally {
        loadingBranches.value = false;
    }
};

// Sync company_id when branch_id is selected
watch(() => form.value.branch_id, (newBranchId) => {
    if (newBranchId && branches.value.length > 0) {
        const branch = branches.value.find(b => b.id === newBranchId);
        if (branch) {
            form.value.company_id = branch.company_id;
        }
    }
});

// Sync branches is now handled by handleCompanyChange and openModal via selectedCompanyName

// Utilities
const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' }).toLowerCase();
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const expiryClass = (date) => {
    if (!date) return '';
    const expiry = new Date(date);
    const now = new Date();
    const diff = (expiry - now) / (1000 * 60 * 60 * 24);
    
    if (diff < 0) return 'text-red-600 font-bold';
    if (diff < 30) return 'text-orange-500 font-semibold';
    return 'text-slate-600';
};

const formatMobile = (val) => {
  if (!val) return '—';
  const s = String(val).replace(/[^0-9]/g, '');
  if (s.length === 8) {
    return s.slice(0, 4) + ' ' + s.slice(4);
  }
  return val;
};

onMounted(async () => {
  if (route.query.filter) {
    filter.value = route.query.filter;
  }
  if (route.query.search) {
    search.value = route.query.search;
  }
  await Promise.all([
    fetchStaff(),
    fetchCompanies()
  ]);

  // Handle auto-edit from query params
  if (route.query.edit) {
    try {
        const res = await staffService.getById(route.query.edit);
        if (res.data.success) {
            openModal(res.data.data);
        }
    } catch (err) {
        console.error('Failed to auto-open edit modal', err);
    }
  }
});

onUnmounted(() => {
  cleanPreviews();
});
</script>