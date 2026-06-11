<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Expenses</h1>
        <p class="text-slate-500 dark:text-slate-400">Track and manage your daily business expenditures</p>
      </div>
      <div class="flex gap-3">
        <button @click="$router.push({ name: 'admin-expense-categories' })" class="flex items-center gap-2 px-6 py-3 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl shadow-lg shadow-[#29166e]/30 transition-all transform hover:-translate-y-0.5 font-black uppercase tracking-widest text-[10px]">
          <svg class="w-4 h-4 text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          Categories
        </button>
        <button v-if="authStore.hasPermission('expense_create')" @click="openModal(null, 'Company')" class="flex items-center gap-2 px-6 py-3 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl shadow-lg shadow-[#29166e]/30 transition-all transform hover:-translate-y-0.5 font-black uppercase tracking-widest text-[10px]">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          NRG Company Expense
        </button>
        <button v-if="authStore.hasPermission('expense_create')" @click="openModal(null, 'Employee')" class="flex items-center gap-2 px-6 py-3 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl shadow-lg shadow-[#29166e]/30 transition-all transform hover:-translate-y-0.5 font-black uppercase tracking-widest text-[10px]">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          Add Employee Expense
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div ref="statsContainerRef" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Expenses -->
      <div class="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex items-center gap-6 group transition-all hover:shadow-md hover:-translate-y-1">
        <div class="w-16 h-16 bg-[#29166e]/5 dark:bg-[#29166e]/20 text-[#29166e] dark:text-[#29166e]/80 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm font-black text-xl">∑</div>
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Expenses</p>
          <p class="text-lg font-black text-slate-800 dark:text-white leading-none">QAR {{ stats.this_month?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00' }}</p>
          <p class="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">This Month</p>
        </div>
      </div>

      <!-- Employee Related -->
      <div class="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex items-center gap-6 group transition-all hover:shadow-md hover:-translate-y-1">
        <div class="w-16 h-16 bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
           <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </div>
        <div>
          <p class="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-1">Employee Expenses</p>
          <p class="text-lg font-black text-slate-800 dark:text-white leading-none">QAR {{ stats.this_month_employee?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00' }}</p>
          <p class="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Deducted from profit</p>
        </div>
      </div>

      <!-- Personal Due -->
      <div class="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex items-center gap-6 group transition-all hover:shadow-md hover:-translate-y-1">
        <div class="w-16 h-16 bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
           <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </div>
        <div>
          <p class="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Personal Due</p>
          <p class="text-lg font-black text-slate-800 dark:text-white leading-none">QAR {{ stats.this_month_personal_due?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00' }}</p>
          <p class="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Paid on behalf</p>
        </div>
      </div>

      <!-- Company Related -->
      <div class="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex items-center gap-6 group transition-all hover:shadow-md hover:-translate-y-1">
        <div class="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </div>
        <div>
          <p class="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Company Operations</p>
          <p class="text-lg font-black text-slate-800 dark:text-white leading-none">QAR {{ stats.this_month_company?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00' }}</p>
          <p class="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Paid from profit</p>
        </div>
      </div>
    </div>

    <!-- Search & Filters -->
    <div :class="[
           'transition-all duration-300 flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-2xl border shadow-sm relative z-30 animate-fade-in',
           isScrolled 
             ? 'sticky top-[-32px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-md' 
             : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
         ]">
      <div class="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
        <div class="flex items-center gap-3 w-full xl:max-w-2xl">
          <div class="relative w-full md:w-80 group">
            <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-[#29166e] transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            </span>
            <input v-model="search" @input="debouncedSearch" type="text" placeholder="Search by contract or category..." 
                   class="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-[#29166e]/10 focus:border-[#29166e] outline-none transition-all dark:text-white font-medium">
          </div>

          <transition name="fade-slide-horizontal">
            <div v-if="isScrolled" class="flex gap-2 shrink-0">
                <button v-if="authStore.hasPermission('expense_create')" @click="openModal(null, 'Company')" class="flex items-center gap-2 px-4 py-2.5 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl shadow-lg shadow-[#29166e]/30 transition-all font-bold text-xs transform hover:-translate-y-0.5">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                  Company Exp
                </button>
                <button v-if="authStore.hasPermission('expense_create')" @click="openModal(null, 'Employee')" class="flex items-center gap-2 px-4 py-2.5 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl shadow-lg shadow-[#29166e]/30 transition-all font-bold text-xs transform hover:-translate-y-0.5">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                  Employee Exp
                </button>
            </div>
          </transition>
        </div>
      </div>

      <div class="flex items-center gap-4 w-full xl:w-auto mt-4 xl:mt-0">
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

        <div class="flex items-center gap-2">
            <select v-model="perPage" @change="fetchExpenses(1)" class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none dark:text-white font-bold h-[50px] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <option :value="10">10 / pg</option>
                <option :value="25">25 / pg</option>
                <option :value="50">50 / pg</option>
                <option :value="100">100 / pg</option>
            </select>
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
        <div class="w-16 h-16 border-4 border-[#29166e]/10 border-t-[#29166e] rounded-full animate-spin"></div>
        <p class="mt-6 text-slate-400 font-black uppercase tracking-widest text-[10px]">Synchronizing Records...</p>
    </div>
    
    <DataTable v-else
      :columns="columns" 
      :data="expenses" 
      :pagination="pagination"
      @page-change="fetchExpenses">
      
      <template #expense_date="{ value }">
        <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-[#29166e]"></div>
            <span class="font-black text-slate-800 dark:text-slate-200 tracking-tight">
                {{ formatDate(value) }}
            </span>
        </div>
      </template>

      <template #contract="{ row }">
        <div v-if="row.contract" class="flex flex-col">
            <span class="text-sm font-black text-slate-800 dark:text-white tracking-tight">{{ row.contract.staff?.name }} Contract</span>
            <span v-if="row.contract.staff?.qid_number" class="text-xs text-slate-500 font-bold mb-1 tracking-wider">
                QID: <span class="text-slate-600 dark:text-slate-400 font-black">{{ row.contract.staff.qid_number }}</span>
            </span>
            <div class="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <span>{{ row.contract.company?.name || 'Individual' }}</span>
                <span v-if="row.contract.staff?.branch_name" class="text-[#29166e] font-black">
                    ({{ row.contract.staff.branch_name }}<span v-if="row.contract.staff.branch_number != null && row.contract.staff.branch_number !== ''">-{{ row.contract.staff.branch_number }}</span>)
                </span>
            </div>
        </div>
        <span v-else class="text-[10px] font-black text-slate-300 uppercase tracking-widest">General Expense</span>
      </template>

      <template #category="{ row }">
        <div class="flex flex-col">
            <span class="text-xs font-black text-slate-700 dark:text-slate-300">{{ row.category ? row.category.name : 'N/A' }}</span>
            <span v-if="row.subcategory" class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{{ row.subcategory ? row.subcategory.name : '' }}</span>
        </div>
      </template>

      <template #description="{ value, row }">
        <div class="flex flex-col">
            <span class="text-sm font-medium text-slate-800 dark:text-white">{{ value }}</span>
        </div>
      </template>

      <template #recorded_by="{ row }">
        <div class="flex flex-col">
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">{{ row.recorder ? row.recorder.name : 'System' }}</span>
        </div>
      </template>

      <template #amount="{ value, row }">
        <div class="flex flex-col items-end gap-1">
            <div class="flex items-baseline gap-1">
                <span class="text-[10px] font-black text-slate-400">QAR</span>
                <span class="text-lg font-black text-rose-600 dark:text-rose-400 tracking-tight">{{ parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
            </div>
            <span v-if="row.is_recoverable" class="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[8px] font-black rounded-lg uppercase tracking-widest border border-amber-200/50">Personal Due</span>
        </div>
      </template>

      <template #actions="{ row }">
        <div class="flex items-center gap-2">
          <button @click="openModal(row, null, true)" class="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all" title="View Details">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
          <button v-if="authStore.hasPermission('expense_edit')" @click="openModal(row)" class="p-2 text-slate-400 hover:text-[#29166e] hover:bg-[#29166e]/5 dark:hover:bg-[#29166e]/20 rounded-lg transition-all" title="Edit">
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
      <form @submit.prevent="saveExpense" class="p-6 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Date -->
          <DateInput 
            label="Expense Date *"
            v-model="form.expense_date"
            :error="errors.expense_date?.[0]"
            :disabled="viewMode"
            required
          />

          <!-- Contract Linking (Only for Employee type) -->
          <div v-if="currentType === 'Employee'">
              <SearchableSelect 
                label="Link to Staff Contract *"
                v-model="form.contract_id"
                :options="contractsList"
                :error="errors.contract_id?.[0]"
                placeholder="Select Staff Member's Contract"
                :disabled="viewMode"
                required
              />
              <p v-if="errors.contract_id" class="text-rose-500 text-[10px] mt-1 ml-1 font-bold uppercase tracking-widest">{{ errors.contract_id[0] }}</p>

              <!-- Expiry Warnings moved here for better visibility -->
              <div v-if="selectedContractStaff" class="mt-2 flex flex-wrap gap-2">
                  <!-- QID Expiry Warning -->
                  <div v-if="selectedContractStaff?.qid_expiry" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border shadow-sm animate-in zoom-in-95 duration-300" 
                       :class="getDaysDiff(selectedContractStaff.qid_expiry) <= 30 ? 'border-rose-200 text-rose-600' : 'border-slate-200 text-slate-500'">
                      <svg class="w-3.5 h-3.5" :class="getDaysDiff(selectedContractStaff.qid_expiry) <= 30 ? 'animate-pulse' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                      <span class="text-[10px] font-black uppercase tracking-tight">QID Expiry: {{ formatDate(selectedContractStaff.qid_expiry) }}</span>
                      <span v-if="getDaysDiff(selectedContractStaff.qid_expiry) <= 30" class="text-[9px] font-black px-1.5 py-0.5 bg-rose-100 dark:bg-rose-900/30 rounded-lg ml-1">
                          {{ getDaysDiff(selectedContractStaff.qid_expiry) <= 0 ? 'Expired' : getDaysDiff(selectedContractStaff.qid_expiry) + ' Days Left' }}
                      </span>
                  </div>

                  <!-- Passport Expiry Warning -->
                  <div v-if="selectedContractStaff?.passport_expiry" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border shadow-sm animate-in zoom-in-95 duration-300 delay-75"
                       :class="getDaysDiff(selectedContractStaff.passport_expiry) <= 90 ? 'border-amber-200 text-amber-600' : 'border-slate-200 text-slate-500'">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                      <span class="text-[10px] font-black uppercase tracking-tight">Passport Expiry: {{ formatDate(selectedContractStaff.passport_expiry) }}</span>
                      <span v-if="getDaysDiff(selectedContractStaff.passport_expiry) <= 90" class="text-[9px] font-black px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg ml-1">
                          {{ getDaysDiff(selectedContractStaff.passport_expiry) <= 0 ? 'Expired' : getDaysDiff(selectedContractStaff.passport_expiry) + ' Days Left' }}
                      </span>
                  </div>
              </div>
            
            <!-- Prefilled Company Confirmation -->
            <div v-if="selectedContractCompany" class="mt-2 p-4 bg-[#29166e]/5 dark:bg-[#29166e]/20 border border-[#29166e]/10 dark:border-[#29166e]/30 rounded-2xl animate-in fade-in slide-in-from-top-1">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-[#29166e] text-white rounded-xl flex items-center justify-center font-black text-lg">
                        {{ selectedContractCompany.charAt(0) }}
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-0.5">
                            <p class="text-[9px] font-black text-[#29166e] uppercase tracking-widest">Assigned Client / Company</p>
                            <span v-if="selectedContractCompany !== 'Individual'" class="px-1.5 py-0.5 bg-[#29166e] text-white text-[8px] font-black rounded uppercase tracking-tight">Active Assignment</span>
                        </div>
                        <p class="text-base font-black text-slate-800 dark:text-white leading-tight uppercase tracking-tight">{{ selectedContractCompany }}</p>
                        <p v-if="selectedContractProfession" class="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                            <svg class="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                            Profession: {{ selectedContractProfession }}
                        </p>
                    </div>
                </div>
            </div>
            <p v-else class="mt-2 text-[9px] text-[#29166e] font-bold uppercase tracking-widest italic animate-pulse">* Required for employee expenses</p>
          </div>
          <div v-else class="flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white/50 dark:bg-slate-900/30">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Company Level Expense<br><span class="text-[8px] font-bold lowercase opacity-50">(No contract required)</span></p>
          </div>

          <!-- Category -->
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Main Category <span class="text-rose-500">*</span></label>
            <select v-model="form.category_id" required @change="handleCategoryChange" :disabled="viewMode" :class="{'border-rose-500 ring-4 ring-rose-500/10': errors.category_id}" class="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-[#29166e]/10 focus:border-[#29166e] transition-all dark:text-white font-bold">
                <option value="">Select Category</option>
                <option v-for="cat in mainCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
            <p v-if="errors.category_id" class="text-rose-500 text-[10px] mt-1 ml-1 font-bold uppercase tracking-widest">{{ errors.category_id[0] }}</p>
          </div>

          <!-- Subcategory -->
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Sub Category <span class="text-rose-500">*</span></label>
            <select v-model="form.subcategory_id" :disabled="!availableSubcategories.length || viewMode" @change="handleSubcategoryChange" required :class="{'border-rose-500 ring-4 ring-rose-500/10': errors.subcategory_id}" class="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-[#29166e]/10 focus:border-[#29166e] transition-all dark:text-white font-bold disabled:opacity-50">
                <option value="">Select Subcategory</option>
                <option v-for="sub in availableSubcategories" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
            </select>
            <p v-if="errors.subcategory_id" class="text-rose-500 text-[10px] mt-1 ml-1 font-bold uppercase tracking-widest">{{ errors.subcategory_id[0] }}</p>
          </div>

          <!-- Validation Date (Only for QID/PP Renewal) -->
          <div v-if="showValidationDateField" class="animate-in fade-in slide-in-from-top-2 duration-300">
            <DateInput 
              label="New Validation/Expiry Date *"
              v-model="form.validation_date"
              :error="errors.validation_date?.[0]"
              :disabled="viewMode"
              required
            />
          </div>
          
          <!-- Description / Reason / Notes -->
          <div class="md:col-span-2">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
              {{ currentType === 'Employee' ? 'Reason / Expense Name' : 'Expense Notes / Details' }}
              <span class="text-rose-500">*</span>
            </label>
            
            <textarea v-if="currentType !== 'Employee'" 
                      v-model="form.description" 
                      required 
                      :disabled="viewMode" 
                      rows="3"
                      :class="{'border-rose-500 ring-4 ring-rose-500/10': errors.description}" 
                      class="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-[#29166e]/10 focus:border-[#29166e] transition-all dark:text-white font-medium tracking-tight placeholder:font-medium" 
                      placeholder="Add any additional details here..."></textarea>
            
            <input v-else 
                   v-model="form.description" 
                   type="text" 
                   required 
                   :disabled="viewMode" 
                   :class="{'border-rose-500 ring-4 ring-rose-500/10': errors.description}" 
                   class="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-[#29166e]/10 focus:border-[#29166e] transition-all dark:text-white font-bold tracking-tight placeholder:font-medium" 
                   placeholder="e.g., Office Supplies, Staff Transport, etc.">
            
            <p v-if="errors.description" class="text-rose-500 text-[10px] mt-1 ml-1 font-bold uppercase tracking-widest">{{ errors.description[0] }}</p>
          </div>




          <!-- Recoverable Toggle (Only for Employee type) -->
          <div v-if="currentType === 'Employee'" class="md:col-span-2">
            <!-- Balance Warning Message -->
            <div v-if="form.contract_id && selectedContractFunds <= 0" class="mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                <p class="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Note: Employee current balance is zero. Expense will be recorded as a pending recovery.</p>
            </div>

            <div @click="!viewMode ? (form.is_recoverable = !form.is_recoverable) : null" 
                 class="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-2 rounded-2xl transition-all"
                 :class="[
                    form.is_recoverable ? 'border-amber-500 bg-amber-50/30 dark:bg-amber-900/10' : 'border-slate-200 dark:border-slate-800',
                    viewMode ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:shadow-md'
                 ]">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                         :class="form.is_recoverable ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    </div>
                    <div>
                        <p class="text-sm font-black uppercase tracking-tight" :class="form.is_recoverable ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'">Personal Due (Recoverable from Staff)</p>
                        <p v-if="!form.is_recoverable" class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">If enabled, this expense will not be deducted from contract profit.</p>
                        <div v-else class="flex items-center gap-2 mt-1">
                            <span class="text-[10px] font-black text-amber-500 uppercase tracking-widest">Available Balance:</span>
                            <span class="text-xs font-black text-amber-600 dark:text-amber-400">QAR {{ formatCurrency(selectedContractFunds) }}</span>
                        </div>
                    </div>
                </div>
                <div class="relative inline-flex items-center">
                    <input type="checkbox" v-model="form.is_recoverable" :disabled="viewMode" class="sr-only peer">
                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
                </div>
            </div>
          </div>

          <!-- Amount & Method -->
          <div class="grid grid-cols-2 gap-4 md:col-span-2">
            <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Amount (QAR) <span class="text-rose-500">*</span></label>
                <div class="relative">
                    <span class="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">QAR</span>
                    <input v-model="form.amount" type="number" step="0.01" required :disabled="viewMode" :class="{'border-rose-500 ring-4 ring-rose-500/10': errors.amount}" class="w-full pl-14 pr-5 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-[#29166e]/10 focus:border-[#29166e] transition-all dark:text-white font-black text-2xl" placeholder="0.00">
                </div>
                <p v-if="errors.amount" class="text-rose-500 text-[10px] mt-1 ml-1 font-bold uppercase tracking-widest">{{ errors.amount[0] }}</p>
                <p v-if="form.is_recoverable && isAmountExceedingFunds" class="text-amber-500 text-[10px] mt-1 ml-1 font-bold uppercase tracking-widest">Notice: Amount exceeds current available balance. This will be recorded as a debt.</p>
            </div>
            <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Payment Method <span class="text-rose-500">*</span></label>
                <select v-model="form.payment_method" required :disabled="viewMode" :class="{'border-rose-500 ring-4 ring-rose-500/10': errors.payment_method}" class="w-full px-5 py-[22px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-[#29166e]/10 focus:border-[#29166e] transition-all dark:text-white font-bold">
                    <option value="">Select Method</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                    <option value="Check">Check</option>
                </select>
                <p v-if="errors.payment_method" class="text-rose-500 text-[10px] mt-1 ml-1 font-bold uppercase tracking-widest">{{ errors.payment_method[0] }}</p>
            </div>
          </div>

          <!-- Notes -->
          <div class="md:col-span-2 animate-in fade-in slide-in-from-top-1">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Notes / Remarks</label>
            <textarea v-model="form.notes" 
                      :disabled="viewMode" 
                      rows="3"
                      :class="{'border-rose-500 ring-4 ring-rose-500/10': errors.notes}" 
                      class="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-[#29166e]/10 focus:border-[#29166e] transition-all dark:text-white font-medium tracking-tight placeholder:font-medium" 
                      placeholder="Add any additional notes or remarks here..."></textarea>
            <p v-if="errors.notes" class="text-rose-500 text-[10px] mt-1 ml-1 font-bold uppercase tracking-widest">{{ errors.notes[0] }}</p>
          </div>

          <!-- Receipt Document -->
          <div class="md:col-span-2 animate-in fade-in slide-in-from-top-1">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Receipt Document Upload <span v-if="currentType === 'Employee'" class="text-rose-500">*</span></label>
            <div v-if="viewMode && form.receipt_document" class="mt-2">
                <a :href="`${baseUrl}/storage/${form.receipt_document}`" target="_blank" class="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-bold">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    View Attached Receipt
                </a>
            </div>
            <div v-else-if="!viewMode">
                <div v-if="form.receipt_document && !form.receipt_document_file" class="mb-3">
                    <a :href="`${baseUrl}/storage/${form.receipt_document}`" target="_blank" class="inline-flex items-center gap-2 px-4 py-2 bg-[#29166e]/10 text-[#29166e] dark:bg-[#29166e]/30 dark:text-[#29166e] rounded-xl hover:bg-[#29166e]/20 transition-colors text-xs font-bold">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                        View Current Receipt
                    </a>
                </div>
                <input type="file" @change="handleFileUpload" :required="currentType === 'Employee' && !form.receipt_document" accept=".jpg,.jpeg,.png,.pdf" :class="{'border-rose-500 ring-4 ring-rose-500/10': errors.receipt_document}" class="w-full px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-[#29166e]/10 focus:border-[#29166e] transition-all dark:text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-[#29166e]/5 file:text-[#29166e] hover:file:bg-[#29166e]/10">
                <p class="text-[9px] font-bold text-slate-400 mt-2 ml-1 uppercase tracking-widest">Allowed: JPG, PNG, PDF (Max 10MB)</p>
                <p v-if="errors.receipt_document" class="text-rose-500 text-[10px] mt-1 ml-1 font-bold uppercase tracking-widest">{{ errors.receipt_document[0] }}</p>
            </div>
            <div v-else class="mt-2 text-xs font-bold text-slate-400 italic">
                No receipt attached.
            </div>
          </div>
        </div>
      </form>
      <template #footer>
        <div class="flex items-center justify-between w-full p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800">
          <button @click="showModal = false" class="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">{{ viewMode ? 'Close' : 'Cancel' }}</button>
          <button v-if="!viewMode" @click="saveExpense" class="px-10 py-4 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-2xl shadow-xl shadow-[#29166e]/20 transition-all font-black text-[10px] uppercase tracking-[0.2em] transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-3" :disabled="saving">
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
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import DataTable from '@/components/shared/DataTable.vue';
import Modal from '@/components/shared/Modal.vue';
import ConfirmModal from '@/components/shared/ConfirmModal.vue';
import SearchableSelect from '@/components/shared/SearchableSelect.vue';
import DateInput from '@/components/shared/DateInput.vue';
import { expenseService, expenseCategoryService, contractService, BASE_URL } from '@/services/api';
const baseUrl = BASE_URL;
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { useDashboardStore } from '@/stores/dashboard';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const dashboardStore = useDashboardStore();
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
const perPage = ref(10);
const pagination = ref({});
const statsContainerRef = ref(null);
const isScrolled = ref(false);
let observer = null;
const showModal = ref(false);
const showConfirmModal = ref(false);
const itemToDelete = ref(null);
const deleting = ref(false);
const errors = ref({});

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
  amount: '',
  expense_date: '',
  validation_date: null,
  is_recoverable: false,
  payment_method: 'Cash',
  description: '',
  notes: '',
  contract_id: null,
  staff_id: null,
  company_id: null,
  receipt_document: null,
  receipt_document_file: null
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

const selectedContractStaff = computed(() => {
    if (!form.value.contract_id) return null;
    const contract = rawContracts.value.find(c => c.id == form.value.contract_id);
    return contract?.staff || null;
});

const selectedContractStaffName = computed(() => selectedContractStaff.value?.name || '');

const selectedContractCompany = computed(() => {
    if (!selectedContractStaff.value) return '';
    return selectedContractStaff.value.company?.name || selectedContractStaff.value.company_name || 'Individual';
});

const selectedContractProfession = computed(() => selectedContractStaff.value?.profession || '');

const selectedContractFunds = computed(() => {
    if (!form.value.contract_id) return 0;
    const contract = rawContracts.value.find(c => c.id == form.value.contract_id);
    return parseFloat(contract?.adjustment_paid_total || 0);
});

const isAmountExceedingFunds = computed(() => {
    if (!form.value.is_recoverable) return false;
    const amount = parseFloat(form.value.amount) || 0;
    return amount > selectedContractFunds.value;
});

const getDaysDiff = (date) => {
    if (!date) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(date);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};



const columns = [
  { key: 'expense_date', label: 'Date', sortable: true },
  { key: 'contract', label: 'Contract', sortable: false },
  { key: 'category', label: 'Category', sortable: false },
  { key: 'description', label: 'Reason', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true },
  { key: 'recorded_by', label: 'Added By', sortable: true },
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
    updateAutomaticDescription();
};

const handleSubcategoryChange = () => {
    updateAutomaticDescription();
};

const updateAutomaticDescription = () => {
    if (!form.value.category_id) {
        form.value.description = '';
        return;
    }

    const cat = allCategories.value.find(c => c.id == form.value.category_id);
    const sub = form.value.subcategory_id ? allCategories.value.find(s => s.id == form.value.subcategory_id) : null;
    
    if (sub) {
        const name = sub.name.toLowerCase();
        if (name.includes('qid')) {
            const dateStr = selectedContractStaff.value?.qid_expiry ? ` (${formatDate(selectedContractStaff.value.qid_expiry)})` : '';
            form.value.description = `QID Expenses${dateStr}`;
        } else if (name.includes('passport') || name.includes('pp')) {
            const dateStr = selectedContractStaff.value?.passport_expiry ? ` (${formatDate(selectedContractStaff.value.passport_expiry)})` : '';
            form.value.description = `Passport Expenses${dateStr}`;
        } else {
            form.value.description = `${sub.name} Expenses`;
        }
    } else if (cat) {
        form.value.description = `${cat.name} Expenses`;
    }
};

// Re-update description when contract/staff changes to catch the correct expiry dates
watch(() => form.value.contract_id, (newVal) => {
    if (!newVal) {
        form.value.is_recoverable = false;
    }
    
    if (!editMode.value) { // Only auto-fill in create mode
        updateAutomaticDescription();
    }
});

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        form.value.receipt_document_file = file;
    } else {
        form.value.receipt_document_file = null;
    }
};

const fetchResources = async () => {
    try {
        const [catsRes, contractsRes] = await Promise.all([
            expenseCategoryService.getAll(),
            contractService.getAll({ per_page: 1000 })
        ]);
        allCategories.value = catsRes.data;
        rawContracts.value = contractsRes.data.data;
        
        // Group by staff_id to show each staff member only once (latest contract)
        const uniqueStaff = new Map();
        contractsRes.data.data.forEach(c => {
            if (c.staff && !uniqueStaff.has(c.staff.id)) {
                uniqueStaff.set(c.staff.id, {
                    id: c.id,
                    name: c.staff.name,
                    qid_number: c.staff.qid_number,
                    mobile: c.staff.mobile,
                    company_name: c.staff.company?.name || 'Individual'
                });
            }
        });
        contractsList.value = Array.from(uniqueStaff.values());
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
      per_page: perPage.value,
      search: search.value,
      start_date: startDate.value,
      end_date: endDate.value,
      contract_id: filterType.value === 'overheads' ? 'null' : undefined
    });
    // Our updated controller returns { expenses, stats }
    if (res.data.expenses) {
      expenses.value = res.data.expenses.data;
      pagination.value = res.data.expenses;
    } else {
      expenses.value = [];
      pagination.value = {};
    }
    stats.value = res.data.stats;
    dashboardStore.setExpenseStats(res.data.stats);
  } catch (err) {
    console.error('Failed to fetch expenses:', err);
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
  errors.value = {};
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
        is_recoverable: !!expense.is_recoverable,
        payment_method: expense.payment_method || 'Cash',
        notes: expense.notes || '',
        receipt_document: expense.receipt_document || null,
        receipt_document_file: null
    };
  } else {
    editMode.value = false;
    form.value = { 
        id: null, 
        category_id: null,
        subcategory_id: null,
        amount: '',
        expense_date: '',
        validation_date: null,
        is_recoverable: false,
        payment_method: '',
        description: '',
        notes: '',
        contract_id: null,
        staff_id: null,
        company_id: null,
        receipt_document: null,
        receipt_document_file: null
    };
  }
  showModal.value = true;
};

const saveExpense = async () => {
  saving.value = true;
  try {
    const formData = new FormData();
    
    // Add all form fields to formData
    Object.keys(form.value).forEach(key => {
        if (key === 'receipt_document_file') {
            if (form.value[key]) {
                formData.append('receipt_document', form.value[key]);
            }
        } else if (key !== 'receipt_document') {
            let val = form.value[key];
            if (key === 'amount' && val === '') val = null;
            if (key === 'category_id' && !val) val = null;
            if (key === 'subcategory_id' && !val) val = null;
            if (key === 'contract_id' && !val) val = null;
            if (key === 'validation_date' && !val) val = null;
            if (key === 'staff_id' && !val) val = null;
            if (key === 'company_id' && !val) val = null;
            
            if (val !== null && val !== undefined && val !== '') {
                // If it's boolean, convert to 1 or 0
                if (typeof val === 'boolean') {
                    formData.append(key, val ? '1' : '0');
                } else {
                    formData.append(key, val);
                }
            }
        }
    });

    if (editMode.value) {
      await expenseService.update(form.value.id, formData);
      notificationStore.success('Expense record updated');
    } else {
      await expenseService.create(formData);
      notificationStore.success('Expense recorded successfully');
    }
    showModal.value = false;
    fetchExpenses(pagination.value?.current_page || 1);
  } catch (err) {
    console.error('Save error:', err.response?.data);
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors;
      notificationStore.error('Validation error. Please check the fields.');
    } else {
      const msg = err.response?.data?.message || 'Failed to save expense';
      notificationStore.error(msg);
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

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

onMounted(() => {
    if (statsContainerRef.value) {
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const scrolledPast = !entry.isIntersecting;
                isScrolled.value = scrolledPast;
                dashboardStore.setShowExpenseMiniStats(scrolledPast);
            });
        }, {
            threshold: 0,
            rootMargin: '-80px 0px 0px 0px'
        });
        observer.observe(statsContainerRef.value);
    }

    // Async data fetching
    (async () => {
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
    })();
});

onUnmounted(() => {
    dashboardStore.setShowExpenseMiniStats(false);
    if (observer) {
        observer.disconnect();
    }
});
</script>

<style scoped>
/* Custom animations for the summary cards */
.grid > div {
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.fade-slide-horizontal-enter-active,
.fade-slide-horizontal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-horizontal-enter-from,
.fade-slide-horizontal-leave-to {
  opacity: 0;
  transform: translateX(-15px);
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
    animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
</style>
