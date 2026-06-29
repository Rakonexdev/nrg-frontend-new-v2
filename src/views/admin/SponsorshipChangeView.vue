<template>
  <div class="space-y-6">
    <div ref="headerRef" class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Sponsorship Change</h1>
        <p class="text-slate-500 dark:text-slate-400">Manage sponsorship change submissions</p>
      </div>
      <div class="flex flex-col sm:flex-row items-center gap-3">
        <!-- Action Buttons -->
        <button v-if="authStore.hasPermission('sponsorship_change_create')" @click="openModal()" class="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl shadow-lg shadow-[#29166e]/30 transition-all transform hover:-translate-y-0.5 font-bold text-sm">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          Add Submission
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex flex-wrap gap-3 mb-4">
      <button @click="activeTab = 'submissions'; debouncedSearch()" 
              :class="['px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2', 
                       activeTab === 'submissions' ? 'bg-[#5b4eff] text-white shadow-lg shadow-indigo-500/30' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700']">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          Submissions
      </button>
      <button @click="activeTab = 'rejected'; debouncedSearch()" 
              :class="['px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2', 
                       activeTab === 'rejected' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-rose-500 shadow-lg shadow-rose-500/10' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700']">
          <div :class="['w-5 h-5 rounded flex items-center justify-center', activeTab === 'rejected' ? 'bg-rose-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400']">
             <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
          </div>
          Rejected
      </button>
      <button @click="activeTab = 'approved'; debouncedSearch()" 
              :class="['px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2', 
                       activeTab === 'approved' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-emerald-500 shadow-lg shadow-emerald-500/10' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700']">
          <div :class="['w-5 h-5 rounded flex items-center justify-center', activeTab === 'approved' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400']">
             <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          Approved
      </button>
      <button @click="activeTab = 'completed'; debouncedSearch()" 
              :class="['px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2', 
                       activeTab === 'completed' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-blue-500 shadow-lg shadow-blue-500/10' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700']">
          <div :class="['w-5 h-5 rounded flex items-center justify-center', activeTab === 'completed' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400']">
             <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          Completed
      </button>
      <button @click="activeTab = 'stopped'; debouncedSearch()" 
              :class="['px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2', 
                       activeTab === 'stopped' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-amber-500 shadow-lg shadow-amber-500/10' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700']">
          <div :class="['w-5 h-5 rounded flex items-center justify-center', activeTab === 'stopped' ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400']">
             <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
          </div>
          Stopped
      </button>
      <button @click="activeTab = 'canceled'; debouncedSearch()" 
              :class="['px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2', 
                       activeTab === 'canceled' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-500 shadow-lg shadow-slate-500/10' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700']">
          <div :class="['w-5 h-5 rounded flex items-center justify-center', activeTab === 'canceled' ? 'bg-slate-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400']">
             <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          Canceled
      </button>
    </div>

    <!-- Search & Filters -->
    <div ref="searchBarRef" :class="[
           'transition-all duration-300 flex flex-col gap-4 p-4 rounded-2xl border shadow-sm relative z-30 animate-fade-in',
           isScrolled 
             ? 'sticky top-[-32px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-md' 
             : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
         ]">
      <div class="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
        <div class="relative w-full md:w-80 group shrink-0">
          <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-[#29166e] transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </span>
          <input v-model="searchQuery" @input="debouncedSearch" type="text" placeholder="Search by QID, phone, company, name, ref..." 
                 class="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-[#29166e]/10 focus:border-[#29166e] outline-none transition-all dark:text-white font-medium">
        </div>

        <div class="flex items-center gap-3 w-full md:w-auto shrink-0 flex-wrap justify-end">
          <DateInput v-model="fromDate" @change="debouncedSearch" label="From Date" class="w-44" />
          <DateInput v-model="toDate" @change="debouncedSearch" label="To Date" class="w-44" />
          <button v-if="fromDate || toDate" @click="clearDates" class="px-3 py-2 mt-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs transition-all border border-slate-200 dark:border-slate-700 shadow-sm">
              Clear
          </button>
          <div class="mt-5">
              <select v-model="pagination.per_page" @change="debouncedSearch" class="w-full md:w-auto px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:ring-4 focus:ring-[#29166e]/10 focus:border-[#29166e] outline-none transition-all cursor-pointer">
                <option :value="10">10 per page</option>
                <option :value="25">25 per page</option>
                <option :value="50">50 per page</option>
              </select>
          </div>
        </div>
      </div>

      <transition name="fade-slide-vertical">
        <div v-if="isScrolled" class="flex items-center gap-2 overflow-x-auto hide-scrollbar w-full pt-3 border-t border-slate-100 dark:border-slate-800 mt-1">
            <button v-if="authStore.hasPermission('view_immigration') || authStore.isSuperAdmin" @click="openModal()" class="flex items-center gap-2 px-4 py-2 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl shadow-lg shadow-[#29166e]/30 transition-all font-bold text-xs transform hover:-translate-y-0.5 shrink-0 whitespace-nowrap">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
              Add Submission
            </button>
            
            <div class="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2 shrink-0"></div>
            
            <button @click="activeTab = 'submissions'; debouncedSearch()" 
                    :class="['px-4 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap shrink-0', activeTab === 'submissions' ? 'bg-[#5b4eff] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700']">
                Submissions
            </button>
            <button @click="activeTab = 'approved'; debouncedSearch()" 
                    :class="['px-4 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap shrink-0', activeTab === 'approved' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700']">
                Approved
            </button>
            <button @click="activeTab = 'rejected'; debouncedSearch()" 
                    :class="['px-4 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap shrink-0', activeTab === 'rejected' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700']">
                Rejected
            </button>
            <button @click="activeTab = 'completed'; debouncedSearch()" 
                    :class="['px-4 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap shrink-0', activeTab === 'completed' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700']">
                Completed
            </button>
            <button @click="activeTab = 'stopped'; debouncedSearch()" 
                    :class="['px-4 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap shrink-0', activeTab === 'stopped' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700']">
                Stopped
            </button>
            <button @click="activeTab = 'canceled'; debouncedSearch()" 
                    :class="['px-4 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap shrink-0', activeTab === 'canceled' ? 'bg-slate-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700']">
                Canceled
            </button>
        </div>
      </transition>
    </div>

    <!-- Data Table -->
    <DataTable v-if="!loading"
      :columns="columns" 
      :data="sponsorships"
      :pagination="pagination"
      :stickyTop="tableStickyTop"
      @page-change="fetchSponsorships">
      
      <template #identity="{ row }">
        <div class="flex flex-col gap-0.5">
          <span class="font-bold text-slate-800 dark:text-slate-200">{{ row.full_name }}</span>
          <span class="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-1">QID: {{ row.qid_number }}</span>
          <span v-if="row.qid_expiry_date" class="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Exp: {{ formatDate(row.qid_expiry_date) }}</span>
          <span v-if="row.identity_phone" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Phone: +974 {{ row.identity_phone }}</span>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">S.R: {{ row.sr_number }}</span>
        </div>
      </template>

      <template #person_info="{ row }">
        <div class="flex flex-col gap-1">
          <span class="font-bold text-slate-700 dark:text-slate-300">{{ row.referral_contact_person || 'N/A' }}</span>
          <span v-if="row.reference_contact_number" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Phone: +974 {{ row.reference_contact_number }}</span>
        </div>
      </template>

      <template #company_info="{ row }">
        <div class="flex flex-col gap-0.5">
          <span class="font-bold text-slate-800 dark:text-white">{{ row.company?.name || 'N/A' }}</span>
          <span v-if="row.ec_number" class="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">EC: {{ row.ec_number }}</span>
          <span v-if="row.company?.computer_card" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CC: {{ row.company.computer_card }}</span>
        </div>
      </template>



      <template #status="{ row }">
        <div class="flex flex-col items-start gap-1.5">
          <span :class="[
            'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest',
            row.final_status === 'Approval' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
            row.final_status === 'Rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
            row.final_status === 'Completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
            (row.final_status === 'stopped' || row.final_status === 'Canceled') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
          ]">
            {{ row.final_status === 'Approval' ? 'Approved' : (row.final_status || 'submission') }}
          </span>
          <div v-if="row.final_status === 'Approval' && (row.approval_date || row.approval_expiry)" class="flex flex-col gap-0.5 mt-0.5">
            <span v-if="row.approval_date" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date: {{ formatDate(row.approval_date) }}</span>
            <span v-if="row.approval_expiry" class="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Exp: {{ formatDate(row.approval_expiry) }}</span>
          </div>
        </div>
      </template>

      <template #total_amount="{ row }">
        <span class="font-bold text-slate-700 dark:text-slate-300">{{ formatCurrency(row.total_contract_amount) }}</span>
      </template>

      <template #labour_contract="{ row }">
        <span v-if="row.labour_contract" class="font-bold text-slate-700 dark:text-slate-300 text-sm">
          {{ row.labour_contract }}
        </span>
        <span v-else class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">N/A</span>
      </template>

      <template #payments="{ row }">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-emerald-500">Paid: {{ formatCurrency(row.pay_amount) }}</span>
          <span class="text-xs font-bold text-rose-500">Due: {{ formatCurrency(row.due_amount) }}</span>
        </div>
      </template>

      <template #document="{ row }">
        <div class="flex flex-col gap-1.5">
          <a v-if="row.document" :href="getStorageUrl(row.document)" target="_blank" class="text-[9px] font-bold text-blue-500 hover:text-blue-600 inline-flex items-center gap-1 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-800/50 w-max">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            Submitted File
          </a>
          <a v-if="row.approval_file" :href="getStorageUrl(row.approval_file)" target="_blank" class="text-[9px] font-bold text-emerald-500 hover:text-emerald-600 inline-flex items-center gap-1 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-800/50 w-max">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            Approval File
          </a>
          <span v-if="!row.document && !row.approval_file" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">N/A</span>
        </div>
      </template>
      <template #actions="{ row }">
        <div class="flex items-center gap-3">
          <button v-if="authStore.hasPermission('sponsorship_change_payment')" @click="openPayment(row)" class="p-1 text-slate-400 hover:text-emerald-500 transition-colors" title="Manage Payments">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </button>
          <button v-if="authStore.hasPermission('view_sponsorship_changes')" @click="openModal(row, true)" class="p-1 text-slate-400 hover:text-blue-500 transition-colors" title="View Detail">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
          </button>
          <button v-if="authStore.hasPermission('sponsorship_change_edit')" @click="openModal(row)" class="p-1 text-slate-400 hover:text-[#29166e] transition-colors" title="Edit Detail">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
          <button v-if="authStore.hasPermission('sponsorship_change_delete')" @click="confirmDelete(row)" class="p-1 text-slate-400 hover:text-red-500 transition-colors" title="Delete Detail">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
        </div>
      </template>
    </DataTable>

    <div v-else class="flex flex-col items-center justify-center py-32 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-700">
        <div class="w-16 h-16 border-4 border-[#29166e]/10 border-t-[#29166e] rounded-full animate-spin"></div>
        <p class="mt-6 text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Loading Sponsorships</p>
    </div>

    <!-- Add/Edit Modal -->
    <Modal :show="showModal" :title="viewMode ? 'View Sponsorship Submission' : editMode ? 'Edit Sponsorship Submission' : 'New Sponsorship Submission'" @close="showModal = false" maxWidth="4xl">
      <form id="sponsorshipForm" @submit.prevent="saveSponsorship" class="space-y-6">
        <fieldset :disabled="viewMode" class="space-y-6">

        <!-- IDENTITY Section -->
        <div class="bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div class="flex items-center gap-2 mb-6">
                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                <h3 class="text-xs font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest">IDENTITY</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">S.R NUMBER <span class="text-red-500">*</span></label>
                    <input v-model="form.sr_number" type="text" required readonly placeholder="e.g. 3002"
                           class="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none transition-all font-bold cursor-not-allowed text-slate-500">
                </div>

                <div class="col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">QID NUMBER <span class="text-red-500">*</span></label>
                    <input v-model="form.qid_number" type="text" required pattern="[0-9]{11}" title="Must be exactly 11 digits" maxlength="11" placeholder="11-digit QID"
                           class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                </div>

                <div class="col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">QID EXPIRY DATE <span class="text-red-500">*</span></label>
                    <DateInput v-model="form.qid_expiry_date" placeholder="dd/mm/yyyy" required />
                </div>

                <div class="col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">FULL NAME <span class="text-red-500">*</span></label>
                    <input v-model="form.full_name" type="text" required
                           class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                </div>

                <div class="col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">SUBMITTED DATE</label>
                    <DateInput v-model="form.submitted_date" placeholder="dd/mm/yyyy" />
                </div>


                <div class="col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">PHONE <span class="text-red-500">*</span></label>
                    <div class="flex items-center w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#29166e]/20 transition-all">
                        <div class="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 text-sm">
                            +974
                        </div>
                        <input v-model="form.identity_phone" type="text" placeholder="Phone Number" required
                               maxlength="8" pattern="[0-9]{8}" title="Phone number must be exactly 8 digits"
                               @input="form.identity_phone = $event.target.value.replace(/[^0-9]/g, '')"
                               class="w-full px-4 py-3 bg-transparent text-sm outline-none font-bold">
                    </div>
                </div>

                <div class="col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">ALTERNATIVE PHONE</label>
                    <div class="flex items-center w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#29166e]/20 transition-all">
                        <div class="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 text-sm">
                            +974
                        </div>
                        <input v-model="form.identity_alt_phone" type="text" placeholder="Alternative Phone Number"
                               maxlength="8" pattern="[0-9]{8}" title="Phone number must be exactly 8 digits"
                               @input="form.identity_alt_phone = $event.target.value.replace(/[^0-9]/g, '')"
                               class="w-full px-4 py-3 bg-transparent text-sm outline-none font-bold">
                    </div>
                </div>

                <div class="col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">REFERRAL CONTACT PERSON <span class="text-red-500">*</span></label>
                    <input v-model="form.referral_contact_person" type="text" placeholder="Contact Person Name" required
                           class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                </div>

                <div class="col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">REFERENCE CONTACT NUMBER <span class="text-red-500">*</span></label>
                    <div class="flex items-center w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#29166e]/20 transition-all">
                        <div class="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 text-sm">
                            +974
                        </div>
                        <input v-model="form.reference_contact_number" type="text" placeholder="Reference Phone Number" required
                               maxlength="8" pattern="[0-9]{8}" title="Phone number must be exactly 8 digits"
                               @input="form.reference_contact_number = $event.target.value.replace(/[^0-9]/g, '')"
                               class="w-full px-4 py-3 bg-transparent text-sm outline-none font-bold">
                    </div>
                </div>

                <div class="col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">ALTERNATIVE NUMBER</label>
                    <div class="flex items-center w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#29166e]/20 transition-all">
                        <div class="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 text-sm">
                            +974
                        </div>
                        <input v-model="form.reference_alt_number" type="text" placeholder="Alternative Number"
                               maxlength="8" pattern="[0-9]{8}" title="Phone number must be exactly 8 digits"
                               @input="form.reference_alt_number = $event.target.value.replace(/[^0-9]/g, '')"
                               class="w-full px-4 py-3 bg-transparent text-sm outline-none font-bold">
                    </div>
                </div>

                <div class="col-span-1 md:col-span-2">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">PASSWORD</label>
                    <div class="relative w-full">
                        <input :type="showPassword ? 'text' : 'password'" v-model="form.password" placeholder="Enter password"
                               class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold pr-12">
                        <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-[#29166e]">
                            <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- COMPANY DETAILS Section -->
        <div class="bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div class="flex items-center gap-2 mb-6">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <h3 class="text-xs font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">COMPANY DETAILS</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">EC NUMBER <span class="text-red-500">*</span></label>
                    <input v-model="form.ec_number" type="text" required
                           class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                </div>



                <div class="col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">NEW COMPANY NAME / COMPUTER CARD <span class="text-red-500">*</span></label>
                    <SearchableSelect 
                        v-model="form.new_company_id" 
                        :options="computedCompanies" 
                        placeholder="Select Company" 
                        class="w-full font-bold"
                        required
                    />
                </div>

            </div>
        </div>

        <!-- APPROVAL & CONTRACT Section -->
        <div class="bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div class="flex items-center gap-2 mb-6">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                <h3 class="text-xs font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">APPROVAL & CONTRACT</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">APPROVAL DATE <span v-if="form.final_status === 'Approval'" class="text-red-500">*</span></label>
                    <DateInput v-model="form.approval_date" placeholder="dd/mm/yyyy" :required="form.final_status === 'Approval'" />
                </div>

                <div class="col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">APPROVAL EXPIRY <span v-if="form.final_status === 'Approval'" class="text-red-500">*</span></label>
                    <DateInput v-model="form.approval_expiry" placeholder="dd/mm/yyyy" :required="form.final_status === 'Approval'" />
                </div>

                <div class="col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">LABOUR CONTRACT</label>
                    <select v-model="form.labour_contract" class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                        <option value="">Select Status</option>
                        <option value="Labour Contract Submitted">Labour Contract Submitted</option>
                        <option value="Labour Contract Pending">Labour Contract Pending</option>
                        <option value="Labour Contract Reject">Labour Contract Reject</option>
                        <option value="Labour Contract Complete">Labour Contract Complete</option>
                        <option value="Labour Contract Cancelled">Labour Contract Cancelled</option>
                    </select>
                </div>

                <div class="col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">FINAL STATUS</label>
                    <select v-model="form.final_status" :disabled="!authStore.hasPermission('sponsorship_change_status') && !authStore.isSuperAdmin" class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold disabled:opacity-60">
                        <option value="submission">submission</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Approval">Approved</option>
                        <option value="Completed">Completed</option>
                        <option value="stopped">stopped</option>
                        <option value="Canceled">Canceled</option>
                    </select>
                </div>

                <div class="col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">TOTAL CONTRACT AMOUNT <span class="text-red-500">*</span></label>
                    <input v-model="form.total_contract_amount" type="number" step="0.01" placeholder="QAR" required
                           class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                </div>

                <div class="col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">PAY AMOUNT</label>
                    <input v-model="form.pay_amount" type="number" step="0.01" placeholder="QAR"
                           class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold">
                </div>

                <div class="col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">DUE AMOUNT (AUTO)</label>
                    <input :value="computedDueAmount" type="text" disabled placeholder="QAR"
                           class="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none transition-all font-bold text-slate-500 cursor-not-allowed">
                </div>

                <div class="col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">SUBMITTED FILE <span class="text-red-500">*</span></label>
                    <input type="file" @change="handleFileUpload" accept=".pdf,.jpg,.jpeg,.png" :required="!form.document"
                           class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#29166e]/10 file:text-[#29166e] hover:file:bg-[#29166e]/20 cursor-pointer">
                    <div v-if="form.document && typeof form.document === 'string'" class="mt-2 text-sm text-blue-500 font-bold">
                         <a :href="getStorageUrl(form.document)" target="_blank" class="hover:underline flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            View Submitted File
                         </a>
                    </div>
                </div>

                <div class="col-span-1">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">APPROVAL FILE</label>
                    <input type="file" @change="handleApprovalFileUpload" accept=".pdf,.jpg,.jpeg,.png"
                           class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#29166e]/10 file:text-[#29166e] hover:file:bg-[#29166e]/20 cursor-pointer">
                    <div v-if="form.approval_file && typeof form.approval_file === 'string'" class="mt-2 text-sm text-emerald-500 font-bold">
                         <a :href="getStorageUrl(form.approval_file)" target="_blank" class="hover:underline flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            View Approval File
                         </a>
                    </div>
                </div>

                <div class="col-span-1 md:col-span-2">
                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">REMARK</label>
                    <textarea v-model="form.remark" rows="3"
                           class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#29166e]/20 outline-none transition-all font-bold resize-y"></textarea>
                </div>
            </div>
        </div>

        </fieldset>

      </form>

      <template #footer>
        <button type="button" @click="showModal = false" class="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 border border-transparent text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl font-bold text-sm transition-colors">{{ viewMode ? 'Close' : 'Cancel' }}</button>
        
        <div v-if="!viewMode" class="flex justify-end gap-3 ml-auto">
            <button type="submit" form="sponsorshipForm" class="px-8 py-2.5 bg-[#5b4eff] hover:bg-[#4a3ecc] text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-all font-black text-sm transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2" :disabled="saving">
              <svg v-if="!saving" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
              <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {{ saving ? 'Saving...' : 'Save Submission' }}
            </button>
        </div>
      </template>
    </Modal>

    <!-- Payment Modal -->
    <Modal :show="showPaymentModal" title="Sponsorship Payment" @close="showPaymentModal = false" maxWidth="5xl">
      
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

              <!-- Next Payment Date -->
              <div>
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Next Payment Date</label>
                <DateInput v-model="paymentForm.next_payment_date" />
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
             <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sponsorship Payment History</h4>
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
                     <span class="text-sm font-black text-emerald-600 dark:text-emerald-400">QAR {{ parseFloat(applicationToPay?.pay_amount || 0).toFixed(2) }}</span>
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
      title="Delete Sponsorship Submission"
      :message="`Are you sure you want to delete this submission?`"
      description="This action cannot be undone."
      variant="danger"
      confirm-text="Yes, Delete"
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import { debounce } from 'lodash';
import sponsorshipChangeService from '@/services/sponsorshipChange.service';
import { companyService } from '@/services/api';
import { useNotificationStore } from '@/stores/notification';
import DataTable from '@/components/shared/DataTable.vue';
import Modal from '@/components/shared/Modal.vue';
import ConfirmModal from '@/components/shared/ConfirmModal.vue';
import SearchableSelect from '@/components/shared/SearchableSelect.vue';
import DateInput from '@/components/shared/DateInput.vue';
import { useAuthStore } from '@/stores/auth';

const columns = computed(() => {
    const baseCols = [
        { key: 'identity', label: 'Identity', sortable: false },
        { key: 'person_info', label: 'Reference Contact', sortable: false },
        { key: 'company_info', label: 'Company Details', sortable: false },
        { key: 'status', label: 'Status', sortable: false },
        { key: 'labour_contract', label: 'Labour Contract Status', sortable: false }
    ];
    
    baseCols.push(
        { key: 'total_amount', label: 'Total Amount (QAR)', sortable: false },
        { key: 'payments', label: 'Payments (QAR)', sortable: false },
        { key: 'document', label: 'Document', sortable: false },
        { key: 'actions', label: 'Actions', sortable: false }
    );
    
    return baseCols;
});

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const sponsorships = ref([]);
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
const showPassword = ref(false);
const showDeleteModal = ref(false);
const itemToDelete = ref(null);
const editMode = ref(false);
const viewMode = ref(false);
const activeTab = ref('submissions');
const searchQuery = ref('');
const fromDate = ref('');
const toDate = ref('');
const searchBarRef = ref(null);
const tableStickyTop = ref('0px');
const isScrolled = ref(false);
let observer = null;
let resizeObserver = null;
const pagination = ref({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
    from: 0,
    to: 0
});

const getStorageUrl = (path) => {
    if (!path) return '';
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
    return `${baseUrl}/storage/${path}`;
};

const debouncedSearch = debounce(() => {
    pagination.value.current_page = 1;
    fetchSponsorships();
}, 500);

const clearDates = () => {
    fromDate.value = '';
    toDate.value = '';
    debouncedSearch();
};

const form = ref({
    sr_number: '',
    qid_number: '',
    qid_expiry_date: '',
    full_name: '',
    submitted_date: '',
    being_here: '',
    ec_number: '',
    computer_card: '',
    new_company_id: '',
    phone: '',
    approval_date: '',
    approval_expiry: '',
    labour_contract: '',
    final_status: 'submission',
    total_contract_amount: null,
    pay_amount: null,
    remark: '',
    identity_phone: '',
    alt_phone: '',
    password: '',
    document: null,
    approval_file: null
});

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        form.value.document = file;
    }
};

const handleApprovalFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        form.value.approval_file = file;
    }
};

const computedDueAmount = computed(() => {
    const total = parseFloat(form.value.total_contract_amount) || 0;
    const pay = parseFloat(form.value.pay_amount) || 0;
    return Math.max(0, total - pay).toFixed(2);
});

const formatCurrency = (val) => {
    return parseFloat(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const currentPipelineStep = computed(() => {
    let step = 1;
    if (form.value.ec_number) step = 2;
    if (form.value.approval_date) step = 3;
    if (form.value.labour_contract) step = 4;
    if (form.value.final_status === 'Completed') step = 5;
    return step;
});

const pipelineSteps = [
    { id: 1, label: '1 • Submit' },
    { id: 2, label: '2 • EC Processing' },
    { id: 3, label: '3 • Approval' },
    { id: 4, label: '4 • Labour Contract' },
    { id: 5, label: '5 • QID Complete' }
];

const getStepClasses = (stepId, currentStep) => {
    if (currentStep < stepId) {
        return 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 border border-dashed border-slate-300 dark:border-slate-600';
    }
    switch (stepId) {
        case 1: return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700/50';
        case 2: return 'bg-[#5b4eff] text-white border border-[#5b4eff]';
        case 3: return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700/50';
        case 4: return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700/50';
        case 5: return 'bg-emerald-500 text-white border border-emerald-500';
        default: return '';
    }
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const fetchSponsorships = async (page = null) => {
    if (page && typeof page === 'number') {
        pagination.value.current_page = page;
    }
    loading.value = true;
    try {
        const response = await sponsorshipChangeService.getAll({
            page: pagination.value.current_page,
            search: searchQuery.value,
            per_page: pagination.value.per_page,
            tab: activeTab.value,
            from_date: fromDate.value,
            to_date: toDate.value
        });
        sponsorships.value = response.data.data || [];
        pagination.value = {
            current_page: response.data.current_page,
            last_page: response.data.last_page,
            total: response.data.total,
            per_page: response.data.per_page,
            from: response.data.from,
            to: response.data.to
        };
    } catch (error) {
        console.error('Failed to fetch sponsorships:', error);
        notificationStore.error(error?.response?.data?.message || error?.message || 'Failed to load sponsorships');
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

const openModal = (item = null, isView = false) => {
    viewMode.value = isView;
    if (item) {
        editMode.value = !isView;
        form.value = { ...item };
    } else {
        editMode.value = false;
        form.value = {
            sr_number: 'Auto-generated',
            qid_number: '',
            qid_expiry_date: '',
            full_name: '',
            submitted_date: '',
            being_here: '',
            ec_number: '',
            computer_card: '',
            new_company_id: '',
            phone: '',
            approval_date: '',
            approval_expiry: '',
            labour_contract: '',
            final_status: 'submission',
            total_contract_amount: null,
            pay_amount: null,
            remark: '',
            identity_phone: '',
            identity_alt_phone: '',
            alt_phone: '',
            referral_contact_person: '',
            reference_contact_number: '',
            reference_alt_number: '',
            document: null,
            approval_file: null
        };
    }
    showModal.value = true;
};

const saveSponsorship = async () => {
    saving.value = true;
    try {
        const submitData = new FormData();
        Object.keys(form.value).forEach(key => {
            if (form.value[key] !== null && form.value[key] !== undefined) {
                if ((key === 'document' || key === 'approval_file') && typeof form.value[key] === 'string') {
                    // Do not append existing document string
                } else if ((key === 'document' || key === 'approval_file') && form.value[key] instanceof File) {
                    submitData.append(key, form.value[key]);
                } else if (key !== 'document' && key !== 'approval_file') {
                    submitData.append(key, form.value[key]);
                }
            }
        });

        if (editMode.value) {
            await sponsorshipChangeService.update(form.value.id, submitData);
            notificationStore.addNotification('Sponsorship change updated successfully', 'success');
        } else {
            await sponsorshipChangeService.create(submitData);
            notificationStore.addNotification('Sponsorship change created successfully', 'success');
        }
        showModal.value = false;
        fetchSponsorships();
    } catch (error) {
        console.error('Error saving sponsorship:', error);
        notificationStore.addNotification(error.response?.data?.message || 'Failed to save sponsorship', 'error');
    } finally {
        saving.value = false;
    }
};

const confirmDelete = (item) => {
    itemToDelete.value = item;
    showDeleteModal.value = true;
};

const handleDelete = async () => {
    if (!itemToDelete.value) return;
    
    saving.value = true;
    try {
        await sponsorshipChangeService.delete(itemToDelete.value.id);
        notificationStore.success('Sponsorship change deleted successfully');
        showDeleteModal.value = false;
        fetchSponsorships();
    } catch (error) {
        console.error('Delete failed', error);
        notificationStore.error(error.response?.data?.message || 'Failed to delete sponsorship change');
    } finally {
        saving.value = false;
        itemToDelete.value = null;
    }
};

const showPaymentModal = ref(false);
const applicationToPay = ref(null);
const paymentForm = ref({ amount: null, payment_date: '', method: 'Cash', next_due_date: '', notes: '' });
const editingPaymentId = ref(null);

const openPayment = (item) => {
    applicationToPay.value = item;
    editingPaymentId.value = null;
    paymentForm.value = {
        amount: null,
        payment_date: new Date().toISOString().split('T')[0],
        method: 'Cash',
        next_payment_date: '',
        notes: ''
    };
    showPaymentModal.value = true;
};

const savePayment = async () => {
    saving.value = true;
    try {
        if (editingPaymentId.value) {
            await sponsorshipChangeService.updatePayment(applicationToPay.value.id, editingPaymentId.value, paymentForm.value);
            notificationStore.success('Payment updated successfully');
        } else {
            await sponsorshipChangeService.addPayment(applicationToPay.value.id, paymentForm.value);
            notificationStore.success('Payment added successfully');
        }
        
        // Refresh data
        await fetchSponsorships();
        
        // Update local selected item from the refreshed list so the modal table updates
        const updatedItem = sponsorships.value.find(s => s.id === applicationToPay.value.id);
        if (updatedItem) {
            applicationToPay.value = updatedItem;
        }
        
        // Reset form
        editingPaymentId.value = null;
        paymentForm.value = {
            amount: null,
            payment_date: new Date().toISOString().split('T')[0],
            method: 'Cash',
            next_payment_date: '',
            notes: ''
        };
    } catch (error) {
        console.error('Failed to save payment:', error);
        notificationStore.error(error.response?.data?.message || 'Failed to save payment');
    } finally {
        saving.value = false;
    }
};

const editPayment = (payment) => {
    editingPaymentId.value = payment.id;
    paymentForm.value = {
        amount: payment.amount,
        payment_date: payment.payment_date,
        method: payment.method || 'Cash',
        next_payment_date: payment.next_payment_date || '',
        notes: payment.notes || ''
    };
};

const deletePayment = async (payment) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    
    saving.value = true;
    try {
        await sponsorshipChangeService.deletePayment(applicationToPay.value.id, payment.id);
        notificationStore.success('Payment deleted successfully');
        
        // Refresh data
        await fetchSponsorships();
        
        const updatedItem = sponsorships.value.find(s => s.id === applicationToPay.value.id);
        if (updatedItem) {
            applicationToPay.value = updatedItem;
        }
    } catch (error) {
        console.error('Failed to delete payment:', error);
        notificationStore.error(error.response?.data?.message || 'Failed to delete payment');
    } finally {
        saving.value = false;
    }
};
const headerRef = ref(null);

onMounted(() => {
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

    fetchSponsorships();
    fetchCompanies();
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
