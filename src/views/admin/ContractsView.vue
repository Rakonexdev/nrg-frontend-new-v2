<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Contracts Management</h1>
        <p class="text-slate-500 dark:text-slate-400">Track profit, assignments, and payment status</p>
      </div>
      <button @click="openModal()" class="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 font-bold text-sm">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        New Contract
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total Contract Value</p>
            <h3 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">QAR {{ formatCurrency(totalValue) }}</h3>
        </div>
        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Active Contracts</p>
            <h3 class="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{{ contracts.length }}</h3>
        </div>
        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Avg Contact Value</p>
            <h3 class="text-2xl font-black text-amber-500 tracking-tight">QAR {{ formatCurrency(totalValue / (contracts.length || 1)) }}</h3>
        </div>
        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total Pending Amount</p>
            <h3 class="text-2xl font-black text-rose-500 tracking-tight">QAR {{ formatCurrency(totalPendingValue) }}</h3>
        </div>
    </div>

    <!-- Filters & Search -->
    <div class="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50 dark:bg-slate-800/50 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="relative w-full md:w-96 group">
        <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-blue-500 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </span>
        <input v-model="search" @input="fetchContracts(1)" type="text" placeholder="Search staff or company..." 
               class="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white font-medium">
      </div>
      <div class="flex items-center gap-3">
        <select v-model="paymentStatusFilter" @change="fetchContracts(1)" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold outline-none dark:text-white focus:ring-4 focus:ring-blue-500/10 transition-all">
          <option value="">All payment statuses</option>
          <option v-for="status in paymentStatusOptions" :key="status" :value="status">{{ status }}</option>
        </select>
        <select v-model="perPage" @change="fetchContracts(1)" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold outline-none dark:text-white focus:ring-4 focus:ring-blue-500/10 transition-all">
          <option :value="10">10 per page</option>
          <option :value="25">25 per page</option>
          <option :value="50">50 per page</option>
        </select>
      </div>
    </div>

    <!-- Data Table -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-32 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div class="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
        <p class="mt-6 text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Loading Contracts</p>
    </div>
    
    <div v-else class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden shadow-slate-200/20 dark:shadow-none">
        <DataTable
            :columns="columns" 
            :data="contracts" 
            :pagination="pagination"
            :sort-by="sortBy"
            :sort-dir="sortDir"
            @sort="handleSort"
            @page-change="fetchContracts">
            
            <template #staff="{ row }">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-xs">
                        {{ row.staff?.name?.charAt(0) || 'S' }}
                    </div>
                    <div>
                        <p class="font-bold text-slate-800 dark:text-white">{{ row.staff?.name }}</p>
                        <p class="text-[10px] text-slate-500 font-medium">{{ row.staff?.position || 'Staff' }}</p>
                    </div>
                </div>
            </template>

            <template #company="{ row }">
                <span class="font-black text-xs text-slate-500 uppercase tracking-widest">{{ row.company?.name }}</span>
            </template>

            <template #date_range="{ row }">
                <div class="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    <span class="text-blue-600 dark:text-blue-400">{{ formatDate(row.start_date) }}</span>
                    <span class="mx-2 opacity-30">→</span>
                    <span class="text-rose-500">{{ formatDate(row.end_date) }}</span>
                </div>
            </template>

            <template #contract_value="{ value }">
                <span class="font-black text-slate-800 dark:text-white">{{ formatCurrency(value) }}</span>
            </template>

            <template #paid_amount="{ value }">
                <span class="font-black text-emerald-600 dark:text-emerald-400">{{ formatCurrency(value) }}</span>
            </template>

            <template #pending_amount="{ value }">
                <span class="font-black text-rose-500">{{ formatCurrency(value) }}</span>
            </template>

            <template #payment_status="{ value }">
                <span class="inline-flex items-center whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" :class="paymentStatusClass(value)">
                    {{ value }}
                </span>
            </template>

            <template #payment_type="{ value }">
                <div class="flex items-center gap-2">
                    <div class="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                        <svg v-if="value === 'Cash'" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                        <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3-3v12a3 3 0 003 3z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    </div>
                    <span class="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{{ value }}</span>
                </div>
            </template>

            <template #actions="{ row }">
                <div class="flex items-center gap-2">
                <button @click="openPaymentModal(row)" class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all" title="Manage Payments">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2m4-6h-8m8 0l-3-3m3 3l-3 3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                </button>
                <button @click="openModal(row)" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                </button>
                <button @click="confirmDelete(row)" class="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                </button>
                </div>
            </template>
        </DataTable>
    </div>

    <!-- Upsert Modal -->
    <Modal :show="showModal" :title="editMode ? 'Edit Contract' : 'New Contract'" @close="showModal = false" maxWidth="6xl">
      <form @submit.prevent="saveContract" class="p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Staff Member</label>
                <select v-model="form.staff_id" required class="w-full px-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white font-bold text-sm appearance-none">
                    <option value="" disabled>Select Staff</option>
                    <option v-for="s in staffList" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
            </div>
            <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Client Company</label>
                <select v-model="form.company_id" required class="w-full px-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white font-bold text-sm appearance-none">
                    <option value="" disabled>Select Company</option>
                    <option v-for="c in companyList" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="relative">
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Start Date</label>
                <input v-model="form.start_date" type="date" required class="w-full px-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white font-bold text-sm">
            </div>
            <div class="relative">
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">End Date</label>
                <input v-model="form.end_date" type="date" required class="w-full px-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white font-bold text-sm">
            </div>
        </div>

        <div v-if="contractDuration" class="p-5 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-700/20 rounded-2xl space-y-4">
            <div class="flex items-center justify-between">
                <span class="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Calculated Duration</span>
                <span class="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-black shadow-lg shadow-blue-500/20">{{ contractDuration }}</span>
            </div>
            <div class="flex flex-wrap gap-2 pt-2 border-t border-blue-200/50 dark:border-blue-700/20">
                <span v-for="year in contractYearsList" :key="year" class="px-2.5 py-1 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700/50 rounded-lg text-[10px] font-black text-slate-600 dark:text-slate-300">
                    {{ year }}
                </span>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Contract Value (Lump Sum QAR)</label>
                <div class="relative group">
                    <span class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-black text-xs transition-colors group-focus-within:text-blue-500">QAR</span>
                    <input v-model="form.contract_value" type="text" required class="w-full pl-16 pr-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white font-black text-sm" placeholder="Ex: 50,000">
                </div>
            </div>
            <div>
                <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 h-full flex flex-col justify-center">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Paid Amount</p>
                    <p class="text-lg font-black text-emerald-600 dark:text-emerald-400">QAR {{ formatCurrency(form.paid_amount || 0) }}</p>
                    <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2">Managed through payment history entries.</p>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Amount</p>
                <p class="text-lg font-black text-rose-500">QAR {{ formatCurrency(form.pending_amount || 0) }}</p>
            </div>
            <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Status</p>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" :class="paymentStatusClass(form.payment_status)">
                    {{ form.payment_status }}
                </span>
            </div>
            <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Payment Method</label>
                <select v-model="form.payment_type" required class="w-full px-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white font-extrabold text-sm appearance-none cursor-pointer">
                    <option value="Cash">Cash</option>
                    <option value="Online">Online Transaction</option>
                </select>
            </div>
        </div>

        <div v-if="false" class="space-y-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment History</p>
                    <p class="text-sm text-slate-500 dark:text-slate-400">Add ledger entries to update paid and pending totals.</p>
                </div>
                <span v-if="!editMode" class="text-xs font-bold text-slate-500 dark:text-slate-400">Create the contract first to add payments.</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Amount</label>
                    <input v-model="paymentForm.amount" :disabled="!editMode || paymentSaving" type="text" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white font-bold text-sm" placeholder="Ex: 1,000">
                </div>
                <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Date</label>
                    <input v-model="paymentForm.payment_date" :disabled="!editMode || paymentSaving" type="date" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white font-bold text-sm">
                </div>
                <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Method</label>
                    <select v-model="paymentForm.payment_method" :disabled="!editMode || paymentSaving" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white font-bold text-sm">
                        <option value="Cash">Cash</option>
                        <option value="Online">Online Transaction</option>
                    </select>
                </div>
                <div class="flex items-end">
                    <button @click.prevent="addPayment" :disabled="!editMode || paymentSaving" class="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm transition-all">
                        {{ paymentSaving ? 'Saving...' : 'Add Payment' }}
                    </button>
                </div>
                <div class="md:col-span-4">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Notes</label>
                    <textarea v-model="paymentForm.notes" :disabled="!editMode || paymentSaving" rows="2" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white font-medium text-sm" placeholder="Optional payment note"></textarea>
                </div>
            </div>

            <div class="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
                <div v-if="paymentLoading" class="px-6 py-8 text-sm font-bold text-slate-500 dark:text-slate-400">Loading payment history...</div>
                <div v-else-if="payments.length === 0" class="px-6 py-8 text-sm font-bold text-slate-500 dark:text-slate-400">No payment entries yet.</div>
                <div v-else class="divide-y divide-slate-200 dark:divide-slate-700">
                    <div v-for="payment in payments" :key="payment.id" class="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div class="space-y-1">
                            <p class="font-black text-slate-800 dark:text-white">QAR {{ formatCurrency(payment.amount) }}</p>
                            <p class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ formatDate(payment.payment_date) }} • {{ payment.payment_method }}</p>
                            <p v-if="payment.notes" class="text-sm text-slate-600 dark:text-slate-300">{{ payment.notes }}</p>
                        </div>
                        <button @click="removePayment(payment)" :disabled="paymentDeletingId === payment.id" class="self-start md:self-center px-4 py-2 text-sm font-black text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all disabled:opacity-50">
                            {{ paymentDeletingId === payment.id ? 'Removing...' : 'Delete' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

      </form>
      <template #footer>
        <button @click="showModal = false" class="px-6 py-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-sm transition-colors">Cancel</button>
        <button @click="saveContract" class="px-10 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-xl shadow-blue-500/25 transition-all font-black text-sm transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2" :disabled="saving">
          {{ saving ? 'Processing...' : (editMode ? 'Update Contract' : 'Create Contract') }}
        </button>
      </template>
    </Modal>

    <Modal :show="showPaymentModal" title="Manage Contract Payments" @close="closePaymentModal" maxWidth="5xl">
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 md:col-span-2">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contract</p>
            <p class="text-lg font-black text-slate-800 dark:text-white">{{ paymentContract.staff?.name || 'Contract' }}</p>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ paymentContract.company?.name || 'Company' }}</p>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Paid Amount</p>
            <p class="text-lg font-black text-emerald-600 dark:text-emerald-400">QAR {{ formatCurrency(paymentContract.paid_amount || 0) }}</p>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Amount</p>
            <p class="text-lg font-black text-rose-500">QAR {{ formatCurrency(paymentContract.pending_amount || 0) }}</p>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment History</p>
            <p class="text-sm text-slate-500 dark:text-slate-400">Record ledger entries independently from contract details.</p>
          </div>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" :class="paymentStatusClass(paymentContract.payment_status)">
            {{ paymentContract.payment_status || 'Pending' }}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Amount</label>
            <input v-model="paymentForm.amount" :disabled="paymentSaving" type="text" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white font-bold text-sm" placeholder="Ex: 1,000">
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Date</label>
            <input v-model="paymentForm.payment_date" :disabled="paymentSaving" type="date" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white font-bold text-sm">
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Method</label>
            <select v-model="paymentForm.payment_method" :disabled="paymentSaving" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white font-bold text-sm">
              <option value="Cash">Cash</option>
              <option value="Online">Online Transaction</option>
            </select>
          </div>
          <div class="flex items-end">
            <button @click.prevent="addPayment" :disabled="paymentSaving || !paymentContract.id" class="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm transition-all">
              {{ paymentSaving ? 'Saving...' : 'Add Payment' }}
            </button>
          </div>
          <div class="md:col-span-4">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Notes</label>
            <textarea v-model="paymentForm.notes" :disabled="paymentSaving" rows="2" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white font-medium text-sm" placeholder="Optional payment note"></textarea>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
          <div v-if="paymentLoading" class="px-6 py-8 text-sm font-bold text-slate-500 dark:text-slate-400">Loading payment history...</div>
          <div v-else-if="payments.length === 0" class="px-6 py-8 text-sm font-bold text-slate-500 dark:text-slate-400">No payment entries yet.</div>
          <div v-else class="divide-y divide-slate-200 dark:divide-slate-700">
            <div v-for="payment in payments" :key="payment.id" class="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div class="space-y-1">
                <p class="font-black text-slate-800 dark:text-white">QAR {{ formatCurrency(payment.amount) }}</p>
                <p class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ formatDate(payment.payment_date) }} • {{ payment.payment_method }}</p>
                <p v-if="payment.notes" class="text-sm text-slate-600 dark:text-slate-300">{{ payment.notes }}</p>
              </div>
              <button @click="removePayment(payment)" :disabled="paymentDeletingId === payment.id" class="self-start md:self-center px-4 py-2 text-sm font-black text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all disabled:opacity-50">
                {{ paymentDeletingId === payment.id ? 'Removing...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button @click="closePaymentModal" class="px-6 py-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-sm transition-colors">Close</button>
      </template>
    </Modal>

    <!-- Confirm Delete Modal -->
    <ConfirmModal 
      :show="showConfirmModal" 
      title="Archive Contract"
      message="Are you sure you want to delete this contract? This action cannot be undone."
      :loading="deleting"
      @confirm="deleteContract"
      @cancel="showConfirmModal = false"
    />

    <!-- Alert Modal -->
    <AlertModal
      :show="showAlertModal"
      :type="alertConfig.type"
      :title="alertConfig.title"
      :message="alertConfig.message"
      @close="showAlertModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import DataTable from '@/components/shared/DataTable.vue';
import Modal from '@/components/shared/Modal.vue';
import ConfirmModal from '@/components/shared/ConfirmModal.vue';
import AlertModal from '@/components/shared/AlertModal.vue';
import { contractService, staffService, companyService } from '@/services/api';
import { useNotificationStore } from '@/stores/notification';

const notificationStore = useNotificationStore();

const contracts = ref([]);
const staffList = ref([]);
const companyList = ref([]);
const loading = ref(true);
const saving = ref(false);
const paymentLoading = ref(false);
const paymentSaving = ref(false);
const paymentDeletingId = ref(null);
const search = ref('');
const paymentStatusFilter = ref('');
const sortBy = ref('id');
const sortDir = ref('desc');
const perPage = ref(10);
const pagination = ref({});

const showModal = ref(false);
const showPaymentModal = ref(false);
const showConfirmModal = ref(false);
const showAlertModal = ref(false);
const alertConfig = ref({
    type: 'error',
    title: 'Validation Error',
    message: ''
});
const itemToDelete = ref(null);
const deleting = ref(false);
const editMode = ref(false);
const form = ref({
  id: null,
  staff_id: '',
  company_id: '',
  start_date: '',
  end_date: '',
  contract_value: '',
  paid_amount: 0,
  pending_amount: 0,
  payment_status: 'Pending',
  payment_type: 'Cash'
});
const paymentContract = ref({
  id: null,
  staff: null,
  company: null,
  contract_value: 0,
  paid_amount: 0,
  pending_amount: 0,
  payment_status: 'Pending',
  payment_type: 'Cash'
});
const payments = ref([]);
const paymentForm = ref({
  amount: '',
  payment_date: new Date().toISOString().slice(0, 10),
  payment_method: 'Cash',
  notes: ''
});

const paymentStatusOptions = ['Pending', 'Partially Paid', 'Fully Paid'];

const contractDuration = computed(() => {
    if (!form.value.start_date || !form.value.end_date) return '';
    const start = new Date(form.value.start_date);
    const end = new Date(form.value.end_date);
    
    if (end < start) return 'Invalid Date Range';

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    
    if (months < 0) {
        years--;
        months += 12;
    }

    const duration = [];
    if (years > 0) duration.push(`${years} ${years === 1 ? 'year' : 'years'}`);
    if (months > 0) duration.push(`${months} ${months === 1 ? 'month' : 'months'}`);
    
    return duration.length > 0 ? duration.join(' and ') : 'Less than a month';
});

const contractYearsList = computed(() => {
    if (!form.value.start_date || !form.value.end_date) return [];
    const start = new Date(form.value.start_date).getFullYear();
    const end = new Date(form.value.end_date).getFullYear();
    const years = [];
    for (let y = start; y <= end; y++) {
        years.push(y);
    }
    return years;
});

const columns = [
  { key: 'staff', label: 'Staff Member', sortable: false },
  { key: 'company', label: 'Client', sortable: false },
  { key: 'date_range', label: 'Duration/Dates', sortable: false },
  { key: 'contract_value', label: 'Value (QAR)', sortable: true },
  { key: 'paid_amount', label: 'Paid (QAR)', sortable: true },
  { key: 'pending_amount', label: 'Pending (QAR)', sortable: true },
  { key: 'payment_status', label: 'Payment Status', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false }
];

const totalValue = computed(() => contracts.value.reduce((sum, c) => sum + parseFloat(c.contract_value || 0), 0));
const totalPendingValue = computed(() => contracts.value.reduce((sum, c) => sum + parseFloat(c.pending_amount || 0), 0));

const fetchContracts = async (page = 1) => {
  loading.value = true;
  try {
    const res = await contractService.getAll({
      page,
      search: search.value,
      payment_status: paymentStatusFilter.value,
      sort_by: sortBy.value,
      sort_direction: sortDir.value,
      per_page: perPage.value
    });
    contracts.value = res.data.data;
    pagination.value = res.data.meta;
  } catch (err) {
    console.error('Failed to fetch contracts', err);
  } finally {
    loading.value = false;
  }
};

const fetchResources = async () => {
    try {
        const [staffRes, companyRes] = await Promise.all([
            staffService.getAll({ per_page: 1000, status: 'active' }),
            companyService.getAll({ per_page: 1000, is_active: 1 })
        ]);
        staffList.value = staffRes.data.data;
        companyList.value = companyRes.data.data;
    } catch (err) {
        console.error('Failed to fetch resources', err);
    }
};

const handleSort = (key) => {
  if (sortBy.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = key;
    sortDir.value = 'asc';
  }
  fetchContracts(1);
};

const openModal = (contract = null) => {
  if (contract) {
    editMode.value = true;
    syncFormWithContract(contract);
  } else {
    editMode.value = false;
    form.value = { 
        id: null, 
        staff_id: '', 
        company_id: '', 
        start_date: '', 
        end_date: '', 
        contract_value: '', 
        paid_amount: 0,
        pending_amount: 0,
        payment_status: 'Pending',
        payment_type: 'Cash'
    };
  }
  showModal.value = true;
};

const saveContract = async () => {
  saving.value = true;
  try {
    const payload = { ...form.value };
    if (typeof payload.contract_value === 'string') {
        payload.contract_value = payload.contract_value.replace(/[^0-9.]/g, '');
    }
    delete payload.paid_amount;
    delete payload.pending_amount;
    delete payload.payment_status;
    
    if (editMode.value) {
      const res = await contractService.update(payload.id, payload);
      syncFormWithContract(res.data.data);
      notificationStore.addNotification('Contract updated successfully');
    } else {
      const res = await contractService.create(payload);
      syncFormWithContract(res.data.data);
      editMode.value = true;
      notificationStore.addNotification('Contract created successfully');
    }
    fetchContracts(pagination.value.current_page || 1);
  } catch (err) {
    alertConfig.value = {
        type: 'error',
        title: 'Validation Error',
        message: err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat()[0] || 'Failed to save contract'
    };
    showAlertModal.value = true;
  } finally {
    saving.value = false;
  }
};

const fetchContractPayments = async (contractId) => {
  paymentLoading.value = true;
  try {
    const [contractRes, paymentsRes] = await Promise.all([
      contractService.getById(contractId),
      contractService.getPayments(contractId)
    ]);

    syncPaymentContract(contractRes.data.data);
    payments.value = paymentsRes.data.data || [];
  } catch (err) {
    console.error('Failed to fetch contract payments', err);
  } finally {
    paymentLoading.value = false;
  }
};

const openPaymentModal = async (contract) => {
  syncPaymentContract(contract);
  resetPaymentForm();
  showPaymentModal.value = true;
  await fetchContractPayments(contract.id);
};

const closePaymentModal = () => {
  showPaymentModal.value = false;
  payments.value = [];
  paymentDeletingId.value = null;
};

const addPayment = async () => {
  if (!paymentContract.value.id) return;

  paymentSaving.value = true;
  try {
    const payload = {
      ...paymentForm.value,
      amount: parseAmount(paymentForm.value.amount),
    };

    await contractService.addPayment(paymentContract.value.id, payload);
    await fetchContractPayments(paymentContract.value.id);
    await fetchContracts(pagination.value.current_page || 1);
    resetPaymentForm();
    notificationStore.addNotification('Payment entry added successfully');
  } catch (err) {
    alertConfig.value = {
      type: 'error',
      title: 'Payment Error',
      message: err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat()[0] || 'Failed to add payment entry'
    };
    showAlertModal.value = true;
  } finally {
    paymentSaving.value = false;
  }
};

const removePayment = async (payment) => {
  if (!paymentContract.value.id) return;

  paymentDeletingId.value = payment.id;
  try {
    await contractService.deletePayment(paymentContract.value.id, payment.id);
    await fetchContractPayments(paymentContract.value.id);
    await fetchContracts(pagination.value.current_page || 1);
    notificationStore.addNotification('Payment entry deleted successfully');
  } catch (err) {
    alertConfig.value = {
      type: 'error',
      title: 'Payment Error',
      message: err.response?.data?.message || 'Failed to delete payment entry'
    };
    showAlertModal.value = true;
  } finally {
    paymentDeletingId.value = null;
  }
};

const confirmDelete = (contract) => {
  itemToDelete.value = contract;
  showConfirmModal.value = true;
};

const deleteContract = async () => {
  if (!itemToDelete.value) return;
  deleting.value = true;
  try {
    await contractService.delete(itemToDelete.value.id);
    notificationStore.addNotification('Contract deleted successfully');
    showConfirmModal.value = false;
    itemToDelete.value = null;
    fetchContracts(pagination.value.current_page || 1);
  } catch (err) {
    alertConfig.value = {
        type: 'error',
        title: 'Error',
        message: 'Failed to delete contract'
    };
    showAlertModal.value = true;
  } finally {
    deleting.value = false;
  }
};

const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatCurrency = (value) => {
    return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const parseAmount = (value) => {
    if (value === null || value === undefined || value === '') {
        return 0;
    }

    const normalized = typeof value === 'string' ? value.replace(/[^0-9.]/g, '') : value;
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
};

const syncFormWithContract = (contract) => {
    form.value = {
        ...contract,
        staff_id: contract.staff?.id || contract.staff_id,
        company_id: contract.company?.id || contract.company_id,
        paid_amount: contract.paid_amount ?? 0,
        pending_amount: contract.pending_amount ?? 0,
        payment_status: contract.payment_status || 'Pending',
        payment_type: contract.payment_type || 'Cash'
    };
};

const syncPaymentContract = (contract) => {
    paymentContract.value = {
        ...contract,
        paid_amount: contract.paid_amount ?? 0,
        pending_amount: contract.pending_amount ?? 0,
        payment_status: contract.payment_status || 'Pending',
        payment_type: contract.payment_type || 'Cash'
    };
};

const resetPaymentForm = () => {
    paymentForm.value = {
        amount: '',
        payment_date: new Date().toISOString().slice(0, 10),
        payment_method: paymentContract.value.payment_type || 'Cash',
        notes: ''
    };
};

const paymentStatusClass = (value) => {
    if (value === 'Fully Paid') {
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    }

    if (value === 'Partially Paid') {
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    }

    return 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300';
};

onMounted(() => {
    fetchContracts();
    fetchResources();
});
</script>
