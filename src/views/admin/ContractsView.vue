<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Contracts Management</h1>
        <p class="text-slate-500 dark:text-slate-400">Track staff contracts, fees, and payments</p>
      </div>
      <button v-if="authStore.hasPermission('contract_create')" @click="openModal()" class="flex items-center gap-2 px-6 py-2.5 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl shadow-lg shadow-[#29166e]/30 transition-all transform hover:-translate-y-0.5 font-bold text-sm">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        New Contract
      </button>
    </div>
    <!-- Summary Cards -->
    <div ref="statsContainerRef" :class="['grid grid-cols-1 gap-6', visibleCardsGridClass]">
      <KpiCard 
        v-if="authStore.hasPermission('contract_card_total_collected')"
        title="Total Collected" 
        :value="formatCurrencyValue(contractSummary.total_paid)" 
        :icon="summaryIcons.paid" 
        color-class="bg-emerald-600" 
      />
      <KpiCard 
        v-if="authStore.hasPermission('contract_card_pending_collection')"
        title="Pending Collection" 
        :value="formatCurrencyValue(contractSummary.total_pending)" 
        :icon="summaryIcons.pending" 
        color-class="bg-amber-500" 
        subtitle="Unpaid balances"
      />
      <KpiCard 
        v-if="authStore.hasPermission('contract_card_contract_profit')"
        title="Contract Profit" 
        :value="formatCurrencyValue(contractSummary.total_contract_profit)" 
        :icon="summaryIcons.profit" 
        color-class="bg-[#29166e]" 
        subtitle="Gross from contracts"
      />

      <KpiCard 
        v-if="authStore.hasPermission('contract_card_general_overheads')"
        title="General Overheads" 
        :value="formatCurrencyValue(contractSummary.total_overheads)" 
        :icon="summaryIcons.overhead" 
        color-class="bg-rose-500" 
        subtitle="Fuel, Rent, Utilities, etc."
      />
    </div>
    <!-- Filters & Search -->
    <div :class="[
           'transition-all duration-300 flex flex-col xl:flex-row gap-4 items-center justify-between p-4 rounded-2xl border shadow-sm relative z-30 animate-fade-in',
           isScrolled 
             ? 'sticky top-[-32px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-md py-3' 
             : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
         ]">
      <div class="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
        <div class="flex items-center gap-3 w-full xl:max-w-xl">
          <div class="relative w-full md:w-80 group">
            <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-[#29166e] transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            </span>
            <input v-model="search" @input="debouncedSearch" type="text" placeholder="Search staff, QID or company..." 
                   class="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-[#29166e]/10 focus:border-[#29166e] outline-none transition-all dark:text-white font-medium">
          </div>
          <transition name="fade-slide-horizontal">
            <button v-if="isScrolled && authStore.hasPermission('contract_create')" @click="openModal()" class="flex items-center gap-2 px-5 py-2.5 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-xl shadow-lg shadow-[#29166e]/30 transition-all font-bold text-xs shrink-0 transform hover:-translate-y-0.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
              New Contract
            </button>
          </transition>
        </div>
        <div class="w-full md:w-64">
          <SearchableSelect 
            v-model="companyFilter"
            :options="companyOptions"
            @change="fetchContracts(1)"
            placeholder="All Companies"
            class="w-full"
          />
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-3 w-full xl:w-auto mt-4 xl:mt-0">

        <div class="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
          <span class="text-slate-400 font-black text-[11px] uppercase tracking-widest pl-2">From</span>
          <div class="relative">
            <input v-model="fromDate" @change="fetchContracts(1)" type="date" 
                   class="bg-transparent border-none rounded-lg px-4 py-2 text-sm font-black outline-none dark:text-white focus:ring-0 transition-all w-[150px]"
                   title="From Date">
          </div>
          <span class="text-slate-400 font-black text-[11px] uppercase tracking-widest px-1">To</span>
          <div class="relative">
            <input v-model="toDate" @change="fetchContracts(1)" type="date" 
                   class="bg-transparent border-none rounded-lg px-4 py-2 text-sm font-black outline-none dark:text-white focus:ring-0 transition-all w-[150px]"
                   title="To Date">
          </div>
        </div>

        <div class="w-full md:w-32">
          <select v-model="perPage" @change="fetchContracts(1)" class="w-full h-[50px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-black outline-none dark:text-white focus:ring-4 focus:ring-[#29166e]/10 transition-all">
            <option :value="10">10 per page</option>
            <option :value="25">25 per page</option>
            <option :value="50">50 per page</option>
          </select>
        </div>
        <button v-if="search || paymentStatusFilter || companyFilter || pendingOnly || fromDate || toDate" @click="resetMainFilters" class="p-2 text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1" title="Reset Filters">
          <span v-if="pendingOnly" class="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">Pending Only</span>
          <span v-if="fromDate || toDate" class="text-[10px] font-black uppercase text-[#29166e] bg-[#29166e]/5 px-2 py-1 rounded-lg border border-[#29166e]/10">Date Range Active</span>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </button>
      </div>
    </div>

    <!-- View Modal -->
    <Modal :show="showViewModal" title="Contract Details" @close="showViewModal = false" maxWidth="4xl">
        <div v-if="selectedViewContract" class="p-8 space-y-8 bg-slate-50/30 dark:bg-slate-900/30">
            <!-- Header Info -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
                <div class="flex items-center gap-5">
                    <div class="w-16 h-16 rounded-2xl bg-[#29166e] flex items-center justify-center text-white shadow-lg shadow-[#29166e]/20">
                        <span class="text-2xl font-black">{{ selectedViewContract.staff?.name?.charAt(0).toUpperCase() || 'E' }}</span>
                    </div>
                    <div>
                        <h2 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">{{ selectedViewContract.staff?.name || 'N/A' }}</h2>
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#29166e]/5 dark:bg-[#29166e]/20 text-[10px] font-black text-[#29166e] dark:text-[#29166e] uppercase tracking-widest mt-1 border border-[#29166e]/10 dark:border-[#29166e]/30">
                            {{ selectedViewContract.staff?.company_name || 'Individual' }} 
                            <span v-if="selectedViewContract.staff?.branch_name" class="ml-1 opacity-60">
                                ({{ selectedViewContract.staff.branch_name }}<span v-if="selectedViewContract.staff.branch_number != null && selectedViewContract.staff.branch_number !== ''">-{{ selectedViewContract.staff.branch_number }}</span>)
                            </span>
                        </span>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Expense</p>
                    <p class="text-4xl font-black text-[#29166e] dark:text-[#29166e]">{{ formatCurrency(selectedViewContract.expense_total) }}</p>
                </div>
            </div>

            <!-- Finance Summary -->
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div class="p-4 bg-[#29166e]/5 dark:bg-[#29166e]/20 rounded-3xl border border-[#29166e]/10 dark:border-[#29166e]/30 shadow-sm transition-all hover:shadow-md">
                    <p class="text-[10px] font-black text-[#29166e] uppercase tracking-widest mb-1">Contract Value</p>
                    <p class="text-2xl font-black text-[#29166e] dark:text-[#29166e]/80">QAR {{ formatCurrency(selectedViewContract.net_income || selectedViewContract.total_income) }}</p>
                    <p class="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">(Total + Adjustments)</p>
                </div>
                <div class="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl border border-emerald-100 dark:border-emerald-800 shadow-sm transition-all hover:shadow-md">
                    <p class="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Gross Income</p>
                    <p class="text-2xl font-black text-emerald-600 dark:text-emerald-500">QAR {{ formatCurrency(selectedViewContract.paid_amount) }}</p>
                    <p class="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">(Total Collected)</p>
                </div>
                <div class="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-3xl border border-amber-100 dark:border-amber-800 shadow-sm transition-all hover:shadow-md">
                    <p class="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Pending Balance</p>
                    <p class="text-2xl font-black text-amber-600 dark:text-amber-400">QAR {{ formatCurrency(selectedViewContract.pending_amount) }}</p>
                    <p class="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">(Remaining to Pay)</p>
                </div>
                <div class="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-3xl border border-rose-100 dark:border-rose-800 shadow-sm transition-all hover:shadow-md">
                    <p class="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Employee Expenses</p>
                    <p class="text-2xl font-black text-rose-500">QAR {{ formatCurrency(selectedViewContract.employee_expenses_total) }}</p>
                    <p class="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">(Fees + Daily Exp)</p>
                </div>
                <div class="p-4 bg-[#29166e] rounded-3xl border border-[#29166e] shadow-xl shadow-[#29166e]/20 transition-all hover:shadow-md">
                    <p class="text-[10px] font-black text-white/80 uppercase tracking-widest mb-1">Company Profit</p>
                    <p class="text-2xl font-black text-white">QAR {{ formatCurrency(selectedViewContract.profit_amount) }}</p>
                    <p class="text-[9px] font-bold text-white/60 mt-1 uppercase tracking-widest">(Net Available)</p>
                </div>
            </div>





            <!-- Notes Section -->
            <div v-if="selectedViewContract.notes" class="p-6 bg-[#29166e]/5 dark:bg-[#29166e]/10 rounded-3xl border border-[#29166e]/10 dark:border-[#29166e]/30 shadow-sm">
                <h3 class="text-xs font-black text-[#29166e] uppercase tracking-widest mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Contract Notes
                </h3>
                <p class="text-sm text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap">{{ selectedViewContract.notes }}</p>
            </div>

            <!-- Daily Expenses Log -->
            <div class="space-y-4">
                <div class="flex items-center justify-between px-2">
                    <h3 class="text-sm font-black text-rose-500 uppercase tracking-widest">Daily Expenses Log (Company)</h3>
                    <span class="text-[10px] font-black text-slate-400 uppercase">{{ (selectedViewContract.daily_expenses?.filter(e => !e.is_recoverable) || []).length }} Entries</span>
                </div>
                <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="bg-rose-50 dark:bg-rose-900/10">
                                <th class="px-6 py-4 text-[10px] font-black text-rose-400 uppercase tracking-widest">Date</th>
                                <th class="px-6 py-4 text-[10px] font-black text-rose-400 uppercase tracking-widest">Category / Reason</th>
                                <th class="px-6 py-4 text-[10px] font-black text-rose-400 uppercase tracking-widest text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                            <tr v-for="expense in (selectedViewContract.daily_expenses?.filter(e => !e.is_recoverable) || [])" :key="expense.id" class="hover:bg-rose-50/30 transition-colors">
                                <td class="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400">{{ formatDate(expense.expense_date) }}</td>
                                <td class="px-6 py-4">
                                    <div class="text-sm font-black text-slate-800 dark:text-white">
                                        {{ expense.category?.name }}
                                        <span v-if="expense.subcategory?.name" class="text-[9px] text-slate-400 ml-1">({{ expense.subcategory.name }})</span>
                                    </div>
                                    <div class="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{{ expense.description || expense.reason }}</div>
                                </td>
                                <td class="px-6 py-4 text-sm font-black text-rose-500 text-right">QAR {{ formatCurrency(expense.amount) }}</td>
                            </tr>
                            <tr v-if="!(selectedViewContract.daily_expenses?.filter(e => !e.is_recoverable) || []).length">
                                <td colspan="3" class="px-6 py-8 text-center text-slate-400 italic text-xs font-bold">No operational daily expenses recorded.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Additional Amounts & Recoverable History -->
            <div class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 class="text-sm font-black text-[#29166e] uppercase tracking-widest">Personal Due & Recoverable History</h3>
                <span class="text-[10px] font-black text-slate-400 uppercase">{{ (selectedViewContract.adjustments?.length || 0) + (selectedViewContract.recoverable_expenses?.length || 0) }} Entries</span>
                <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="bg-[#29166e]/5 dark:bg-[#29166e]/10">
                                <th class="px-6 py-4 text-[10px] font-black text-[#29166e]/60 uppercase tracking-widest">Date</th>
                                <th class="px-6 py-4 text-[10px] font-black text-[#29166e]/60 uppercase tracking-widest">Type / Reason</th>
                                <th class="px-6 py-4 text-[10px] font-black text-[#29166e]/60 uppercase tracking-widest text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                            <!-- Show Adjustments (Positive) -->
                             <tr v-for="adj in selectedViewContract.adjustments" :key="'adj-'+adj.id" class="hover:bg-[#29166e]/5 transition-colors">
                                 <td class="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400">{{ formatDate(adj.adjustment_date) }}</td>
                                 <td class="px-6 py-4">
                                     <span class="inline-flex px-1.5 py-0.5 rounded bg-[#29166e]/10 text-[8px] font-black text-[#29166e] uppercase tracking-tighter mr-2">Addition</span>
                                     <span class="text-sm font-black text-slate-800 dark:text-white">{{ adj.reason }}</span>
                                     <div v-if="adj.recorded_by" class="mt-1 text-[9px] font-bold text-slate-400">
                                         Rec by: <span class="font-black text-slate-600 dark:text-slate-400">{{ adj.recorded_by }}</span> <span class="uppercase text-[8px]">({{ adj.recorded_by_role }})</span>
                                     </div>
                                 </td>
                                 <td class="px-6 py-4 text-sm font-black text-[#29166e] text-right">QAR {{ formatCurrency(adj.amount) }}</td>
                             </tr>
                            <!-- Show Recoverable Expenses (Negative) -->
                            <tr v-for="expense in selectedViewContract.recoverable_expenses" :key="'rec-'+expense.id" class="hover:bg-rose-50/30 transition-colors">
                                <td class="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400">{{ formatDate(expense.expense_date) }}</td>
                                <td class="px-6 py-4">
                                    <span class="inline-flex px-1.5 py-0.5 rounded bg-rose-100 text-[8px] font-black text-rose-600 uppercase tracking-tighter mr-2">Personal Expense</span>
                                    <div class="inline-block">
                                        <div class="text-sm font-black text-slate-800 dark:text-white">{{ expense.category?.name }}</div>
                                        <div class="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{{ expense.description || expense.reason }}</div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-sm font-black text-rose-500 text-right">- QAR {{ formatCurrency(expense.amount) }}</td>
                            </tr>
                            <tr v-if="!selectedViewContract.adjustments?.length && !selectedViewContract.recoverable_expenses?.length">
                                <td colspan="3" class="px-6 py-8 text-center text-slate-400 italic text-xs font-bold">No Personal Due or personal expenses recorded.</td>
                            </tr>
                        </tbody>
                        <tfoot v-if="selectedViewContract.adjustments?.length || selectedViewContract.recoverable_expenses?.length">
                            <tr class="bg-slate-50 dark:bg-slate-800/50 border-t-2 border-slate-200 dark:border-slate-700">
                                <td colspan="2" class="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Net Personal Due</td>
                                <td class="px-6 py-4 text-sm font-black text-[#29166e] dark:text-[#29166e]/80 text-right">QAR {{ formatCurrency(selectedViewContract.adjustment_total) }}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <!-- Personal Due Payments Log -->
                <div v-if="selectedViewAdjustmentPayments.length > 0" class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div class="flex items-center justify-between px-2">
                        <p class="text-[10px] font-black text-[#29166e]/60 uppercase tracking-widest">Personal Due Payments Log</p>
                    </div>
                    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <table class="w-full text-left">
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                 <tr v-for="payment in selectedViewAdjustmentPayments" :key="payment.id" class="hover:bg-[#29166e]/5 transition-colors">
                                     <td class="px-6 py-3 text-[11px] font-bold text-slate-500">{{ formatDateTime(payment.payment_date) }}</td>
                                     <td class="px-6 py-3">
                                         <div class="flex items-center gap-2 flex-wrap">
                                             <span class="text-[11px] font-black text-slate-700 dark:text-slate-300">Personal Due Payment</span>
                                             <span class="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold uppercase tracking-tighter">{{ payment.payment_method }}</span>
                                             <span v-if="payment.recorded_by" class="text-[9px] font-bold text-slate-400 dark:text-slate-500 lowercase">
                                                 by {{ payment.recorded_by }} ({{ payment.recorded_by_role }})
                                             </span>
                                         </div>
                                     </td>
                                     <td class="px-6 py-3 text-right text-[11px] font-black text-[#29166e]">QAR {{ formatCurrency(payment.amount) }}</td>
                                 </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Payment History -->
            <div class="space-y-4">
                <div class="flex items-center justify-between px-2">
                    <h3 class="text-sm font-black text-emerald-500 uppercase tracking-widest">Payment History (Collections)</h3>
                    <span class="text-[10px] font-black text-slate-400 uppercase">{{ selectedViewAdminPayments.length }} Entries</span>
                </div>
                <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="bg-emerald-50 dark:bg-emerald-900/10">
                                <th class="px-6 py-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest">Date</th>
                                <th class="px-6 py-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest">Settlement Info</th>
                                <th class="px-6 py-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                             <tr v-for="payment in selectedViewAdminPayments" :key="payment.id" class="hover:bg-emerald-50/30 transition-colors">
                                 <td class="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400">{{ formatDateTime(payment.payment_date) }}</td>
                                 <td class="px-6 py-4">
                                     <div v-if="payment.is_settled" class="space-y-1">
                                         <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-[8px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-200 dark:border-emerald-800/50">
                                             Settled
                                         </span>
                                         <p class="text-[9px] font-bold text-slate-400 italic">ID: #{{ payment.settlement?.settlement_number || payment.settlement_id }}</p>
                                         <p class="text-[9px] font-bold text-slate-400">{{ formatDate(payment.settled_at) }}</p>
                                     </div>
                                     <span v-else class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-[8px] font-black text-amber-600 uppercase tracking-widest border border-amber-200 dark:border-amber-800/50">
                                         Pending Settlement
                                     </span>
                                     <div v-if="payment.recorded_by" class="mt-1 text-[9px] font-bold text-slate-400">
                                         Rec by: <span class="font-black text-slate-600 dark:text-slate-400">{{ payment.recorded_by }}</span> <span class="uppercase text-[8px]">({{ payment.recorded_by_role }})</span>
                                     </div>
                                 </td>
                                 <td class="px-6 py-4 text-sm font-black text-emerald-600 text-right">QAR {{ formatCurrency(payment.amount) }}</td>
                             </tr>
                            <tr v-if="!selectedViewAdminPayments.length">
                                <td colspan="3" class="px-6 py-8 text-center text-slate-400 italic text-xs font-bold">No payment history found.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Footer Details -->
            <div class="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-slate-400">
                <div class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    <span class="text-[10px] font-black uppercase tracking-widest">Last Updated: {{ formatDate(selectedViewContract.updated_at) }}</span>
                </div>
                <button @click="showViewModal = false" class="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all font-black uppercase tracking-widest text-[10px]">Close View</button>
            </div>
        </div>
    </Modal>

    <!-- Data Table -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-32 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div class="w-16 h-16 border-4 border-[#29166e]/10 border-t-[#29166e] rounded-full animate-spin"></div>
        <p class="mt-6 text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Loading Contract Records</p>
    </div>
    
    <div v-else class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden shadow-slate-200/20 dark:shadow-none">
        <DataTable
            :columns="columns" 
            :data="contracts" 
            :pagination="pagination"
            @page-change="fetchContracts"
        >
            <template #staff_name="{ row }">
                <div class="flex flex-col">
                    <span class="font-black text-slate-800 dark:text-white tracking-tight">{{ row.staff?.name || 'N/A' }}</span>
                    <span v-if="row.staff?.qid_number" class="text-xs font-bold text-slate-500 mt-0.5">QID: {{ row.staff.qid_number }}</span>
                </div>
            </template>

            <template #company_name="{ row }">
                <div class="flex flex-col">
                    <span class="font-black text-slate-800 dark:text-white tracking-tight">{{ row.staff?.company_name || 'No Company' }}</span>
                    <span v-if="row.staff?.branch_name" class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        {{ row.staff.branch_name }}<span v-if="row.staff.branch_number != null && row.staff.branch_number !== ''">-{{ row.staff.branch_number }}</span>
                    </span>
                    <span v-if="row.staff?.company?.computer_card" class="text-xs font-bold text-slate-500 mt-0.5">Card: {{ row.staff.company.computer_card }}</span>
                </div>
            </template>

            <template #net_payable="{ row }">
                <span class="font-black text-slate-800 dark:text-white">{{ formatCurrency(row.net_payable) }}</span>
            </template>

            <template #contract_date="{ value }">
                <span class="font-black text-slate-700 dark:text-slate-300">{{ formatDate(value) }}</span>
            </template>



            <template #paid_amount="{ value }">
                <span class="font-black text-emerald-600">{{ formatCurrency(value) }}</span>
            </template>

            <template #pending_amount="{ row, value }">
                <div class="flex flex-col gap-2 py-1">
                  <!-- Main Collection Balance -->
                  <span class="font-black text-rose-500 text-xl leading-none tracking-tight">{{ formatCurrency(value) }}</span>
                  
                  <!-- Maximized Personal Due -->
                  <div v-if="row.adjustment_pending > 0" class="flex items-center gap-2">
                    <span class="font-black text-[#29166e] dark:text-[#29166e]/80 text-xl leading-none">{{ formatCurrency(row.adjustment_pending) }}</span>
                    <span class="text-xs font-black text-[#29166e]/60 dark:text-[#29166e]/60 uppercase tracking-widest">Personal Due</span>
                  </div>
                </div>
            </template>

            <template #next_collection_due_date="{ row }">
                <div class="flex items-center gap-2 justify-center group/due">
                    <div v-if="row.next_collection_due_date && row.pending_amount > 0" class="flex flex-col items-center">
                        <span class="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800/50 shadow-sm inline-flex items-center justify-center min-w-[110px]">
                            {{ formatDate(row.next_collection_due_date) }}
                        </span>
                    </div>
                    <span v-else class="text-slate-300 dark:text-slate-600 font-black text-xs">—</span>
                    
                    <button v-if="authStore.hasPermission('contract_edit')" @click="openUpdateNextDueDateModal(row, 'collection')" class="opacity-0 group-hover/due:opacity-100 p-1 text-slate-400 hover:text-[#29166e] hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-all" title="Update Company Next Due Date">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    </button>
                </div>
            </template>

            <template #next_personal_due_date="{ row }">
                <div class="flex items-center gap-2 justify-center group/due">
                    <div v-if="row.next_personal_due_date && row.adjustment_pending > 0" class="flex flex-col items-center">
                        <span class="text-xs font-black text-[#29166e] dark:text-[#29166e]/80 bg-[#29166e]/5 dark:bg-[#29166e]/20 px-4 py-2 rounded-xl border border-[#29166e]/10 dark:border-[#29166e]/30 shadow-sm inline-flex items-center justify-center min-w-[110px]">
                            {{ formatDate(row.next_personal_due_date) }}
                        </span>
                    </div>
                    <span v-else class="text-slate-300 dark:text-slate-600 font-black text-xs">—</span>
                    
                    <button v-if="authStore.hasPermission('contract_edit') && row.adjustment_pending > 0" @click="openUpdateNextDueDateModal(row, 'personal')" class="opacity-0 group-hover/due:opacity-100 p-1 text-slate-400 hover:text-[#29166e] hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-all" title="Update Personal Next Due Date">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    </button>
                </div>
            </template>



            <template #actions="{ row }">
                <div class="flex items-center gap-2">
                <button v-if="authStore.hasPermission('contract_edit')" @click="openPaymentModal(row)" class="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all" title="Manage Payments">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                </button>
                <button @click="openViewModal(row)" class="p-2 text-slate-400 hover:text-[#29166e] hover:bg-[#29166e]/5 dark:hover:bg-[#29166e]/20 rounded-lg transition-all" title="View Details">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                </button>
                <button v-if="authStore.hasPermission('contract_delete')" @click="confirmDelete(row)" class="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all" title="Delete">
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
                <SearchableSelect 
                  label="Staff Member *"
                  v-model="form.staff_id"
                  required
                  :options="staffList"
                  :error="errors.staff_id"
                  placeholder="Select Staff"
                />
            </div>
            <div v-if="selectedStaff" class="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 h-full flex flex-col justify-center">
                <div>
                   <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Company</p>
                   <p class="text-sm font-black text-slate-800 dark:text-white tracking-tight">{{ selectedStaff.company_name || 'N/A' }}</p>
                </div>
                <div>
                   <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">QID Number</p>
                   <p class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{{ selectedStaff.qid_number || 'N/A' }}</p>
                </div>
            </div>
        </div>

        <h3 class="text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700 pb-2">Contract Financials</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Contract Value *</label>
                <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">QAR</span>
                    <input v-model="form.total_income" type="number" step="0.01" required 
                           :class="[errors.total_income ? 'ring-4 ring-rose-500/10 border-rose-500' : 'border-slate-200 dark:border-slate-700']"
                           class="w-full h-[54px] pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border rounded-2xl outline-none focus:ring-4 focus:ring-[#29166e]/10 focus:border-[#29166e] transition-all dark:text-white font-black text-sm" placeholder="Ex: 5000.00">
                </div>
                <p v-if="errors.total_income" class="text-rose-500 text-[10px] mt-1 ml-1 font-bold uppercase tracking-widest">{{ Array.isArray(errors.total_income) ? errors.total_income[0] : errors.total_income }}</p>
            </div>
            <div>
                <DateInput 
                    label="Next QID Date *"
                    v-model="form.contract_date"
                    required
                    :error="errors.contract_date"
                />
            </div>
        </div>

        <div class="pt-4 border-t border-slate-200 dark:border-slate-800">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Contract Notes</label>
            <textarea v-model="form.notes"
                class="w-full px-6 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-4 focus:ring-[#29166e]/10 focus:border-[#29166e] transition-all dark:text-white font-medium resize-none h-28" 
                placeholder="Enter any additional details, special instructions, or notes about this contract..."></textarea>
        </div>

<div class="hidden">

</div>
      </form>

      <template #footer>
        <button @click="showModal = false" class="px-6 py-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-sm transition-colors">Cancel</button>
        <button @click="handleInitialSave" class="px-10 py-3.5 bg-[#29166e] hover:bg-[#1d0f4d] text-white rounded-2xl shadow-xl shadow-[#29166e]/25 transition-all font-black text-sm transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2" :disabled="saving">
          {{ saving ? 'Processing...' : (editMode ? 'Update Contract' : 'Create Contract') }}
        </button>
      </template>
    </Modal>

    <Modal :show="showPaymentModal" title="Manage Contract Payments" @close="closePaymentModal" maxWidth="6xl">
      <div class="space-y-6">
        <!-- Tab Navigation -->
        <div class="flex border-b border-slate-200 dark:border-slate-700 p-1 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl">
          <button 
            @click="paymentModalTab = 'payments'" 
            :class="[
              'flex-1 py-3 px-6 text-sm font-black transition-all rounded-xl flex items-center justify-center gap-2.5',
              paymentModalTab === 'payments' 
                ? 'bg-[#29166e] text-white shadow-lg shadow-[#29166e]/20' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900/50'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            Company Collections details
          </button>
          <button 
            @click="paymentModalTab = 'details'" 
            :class="[
              'flex-1 py-3 px-6 text-sm font-black transition-all rounded-xl flex items-center justify-center gap-2.5',
              paymentModalTab === 'details' 
                ? 'bg-[#29166e] text-white shadow-lg shadow-[#29166e]/20' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900/50'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            Add Personal Due
          </button>
        </div>

        <!-- ===================== TAB 1: Contract Details ===================== -->
        <div v-if="paymentModalTab === 'details'" class="space-y-6 animate-fade-in">
          <!-- Row 1: Contract Info + Contract Value + Personal Due Payment -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Contract Information (Employee + Company) -->
            <div class="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Contract Information</p>
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-[#29166e] flex items-center justify-center text-white shadow-lg shadow-[#29166e]/20 flex-shrink-0">
                  <span class="text-lg font-black">{{ paymentContract.staff?.name?.charAt(0).toUpperCase() || 'E' }}</span>
                </div>
                <div class="min-w-0">
                  <p class="text-base font-black text-slate-800 dark:text-white truncate">{{ paymentContract.staff?.name || 'N/A' }}</p>
                  <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#29166e]/5 dark:bg-[#29166e]/20 text-[9px] font-black text-[#29166e] dark:text-[#29166e] uppercase tracking-widest mt-1 border border-[#29166e]/10 dark:border-[#29166e]/30">
                    {{ paymentContract.staff?.company_name || 'Individual' }}
                    <span v-if="paymentContract.staff?.branch_name" class="ml-1 opacity-60">({{ paymentContract.staff.branch_name }})</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Contract Value Card -->
            <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contract Value</p>
              <p class="text-2xl font-black text-slate-800 dark:text-white">QAR {{ formatCurrency(paymentContract.total_income || 0) }}</p>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Fixed Contract Amount</p>
            </div>

            <!-- Personal Due Payment Card -->
            <div class="p-5 rounded-2xl bg-[#29166e]/5 dark:bg-[#29166e]/10 border border-[#29166e]/10 dark:border-[#29166e]/30 shadow-sm">
              <p class="text-[10px] font-black text-[#29166e] uppercase tracking-widest mb-1">Personal Due Payment</p>
              <p class="text-3xl font-black text-[#29166e] dark:text-[#29166e]">QAR {{ formatCurrency(paymentContract.adjustment_total || 0) }}</p>
              <p class="text-[9px] font-bold text-[#29166e]/60 uppercase tracking-tighter mt-1">{{ contractAdjustments.length }} adjustment{{ contractAdjustments.length !== 1 ? 's' : '' }} added</p>
            </div>
          </div>

          <!-- Row 2: Linked Expenses + Pending Personal Due + Personal Next Due -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Linked Expenses Card -->
            <div class="p-5 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 shadow-sm">
              <p class="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Linked Expenses</p>
              <p class="text-2xl font-black text-orange-500">QAR {{ formatCurrency(paymentContract.expense_total || 0) }}</p>
              <p class="text-[9px] font-bold text-orange-400 uppercase tracking-tighter mt-1">Fixed Fees + Dynamic</p>
            </div>

            <!-- Pending Personal Due Card -->
            <div class="p-5 rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 shadow-sm">
              <p class="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Pending Personal Due</p>
              <p class="text-3xl font-black text-rose-500">QAR {{ formatCurrency(totalPersonalDuePending) }}</p>
              <p class="text-[9px] font-bold text-rose-400 uppercase tracking-tighter mt-1">Unpaid from {{ contractAdjustments.length }} adjustment{{ contractAdjustments.length !== 1 ? 's' : '' }}</p>
            </div>

            <!-- Personal Next Due Date Card -->
            <div class="p-5 rounded-2xl bg-[#29166e]/5 dark:bg-[#29166e]/10 border border-[#29166e]/10 dark:border-[#29166e]/30 shadow-sm">
              <p class="text-[10px] font-black text-[#29166e] uppercase tracking-widest mb-1">Next Personal Due</p>
              <p class="text-xl font-black text-[#29166e] dark:text-[#29166e] mt-1">{{ formatDate(paymentContract.next_personal_due_date) || 'None' }}</p>
              <p class="text-[9px] font-bold text-[#29166e]/60 uppercase tracking-tighter mt-1">Scheduled Staff Payment</p>
            </div>
          </div>

          <!-- Add Personal Due Section -->
          <div class="space-y-4">
            <div class="flex items-center gap-3 px-1">
              <div class="w-1 h-6 rounded-full bg-[#29166e]"></div>
              <h3 class="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Add Personal Due</h3>
              <p class="text-[10px] text-slate-400 font-bold italic ml-auto">This records extra payments that do not affect the main contract balance.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <DateInput 
                label="Paid Date *"
                v-model="adjustmentForm.adjustment_date"
                :disabled="adjustmentSaving"
              />
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Total Amount <span class="text-rose-500">*</span></label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">QAR</span>
                  <input v-model="adjustmentForm.amount" :disabled="adjustmentSaving" type="number" step="0.01" class="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-[#29166e]/10 focus:border-[#29166e] transition-all dark:text-white font-black text-lg" placeholder="0.00">
                </div>
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Paid Amount</label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">QAR</span>
                  <input v-model="adjustmentForm.paid_amount" :disabled="adjustmentSaving" type="number" step="0.01" class="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all dark:text-white font-bold text-sm" placeholder="0.00">
                </div>
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Reason <span class="text-rose-500">*</span></label>
                <select v-model="adjustmentForm.reason" :disabled="adjustmentSaving" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-[#29166e]/10 focus:border-[#29166e] transition-all dark:text-white font-bold text-sm">
                  <option value="">Select Reason</option>
                  <option value="QID Renewal Fee">QID Renewal Fee</option>
                  <option value="Passport Renewal Fee">Passport Renewal Fee</option>
                  <option value="Profession Change Fee">Profession Change Fee</option>
                  <option value="Sponsorship Change Fee">Sponsorship Change Fee</option>
                  <option value="Health Card Fee">Health Card Fee</option>
                  <option value="Re-entry Permit">Re-entry Permit</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <DateInput 
                label="Next Personal Due"
                v-model="adjustmentForm.next_payment_date"
                :disabled="adjustmentSaving"
              />
              <div class="md:col-span-5 flex justify-end mt-2">
                <button @click.prevent="submitAdjustmentFromModal" :disabled="adjustmentSaving || !paymentContract.id" class="px-8 py-3.5 bg-[#29166e] hover:bg-[#1d0f4d] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-[#29166e]/20 hover:shadow-[#29166e]/30 flex items-center gap-2">
                  <svg v-if="adjustmentSaving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  {{ adjustmentSaving ? 'Adding...' : 'Add Personal Due' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Adjustments List -->
          <div v-if="contractAdjustments.length > 0" class="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
            <div class="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal Due History</p>
              <span class="text-[10px] font-black text-slate-400 uppercase">{{ contractAdjustments.length }} Entries</span>
            </div>
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-50/50 dark:bg-slate-800/30">
                  <th class="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid Date</th>
                  <th class="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</th>
                  <th class="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                  <th class="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Paid</th>
                  <th class="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Pending</th>
                  <th class="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recorded By</th>
                  <th class="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status / Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr v-for="adj in contractAdjustments" :key="adj.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td class="px-5 py-3.5 text-xs font-bold text-slate-600 dark:text-slate-400">{{ formatDate(adj.adjustment_date) }}</td>
                  <td class="px-5 py-3.5">
                    <p class="text-sm font-black text-slate-800 dark:text-white">{{ adj.reason }}</p>
                  </td>
                  <td class="px-5 py-3.5 text-sm font-black text-slate-700 dark:text-slate-300 text-right">QAR {{ formatCurrency(adj.amount) }}</td>
                  <td class="px-5 py-3.5 text-sm font-black text-emerald-600 text-right">QAR {{ formatCurrency(adj.paid_amount || 0) }}</td>
                  <td class="px-5 py-3.5 text-sm font-black text-rose-500 text-right">QAR {{ formatCurrency(adj.pending_amount || 0) }}</td>
                  <td class="px-5 py-3.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span class="font-bold">{{ adj.recorded_by || 'N/A' }}</span>
                    <span v-if="adj.recorded_by_role" class="block text-[9px] font-black uppercase text-slate-400 tracking-wider">
                      {{ adj.recorded_by_role }}
                    </span>
                  </td>
                  <td class="px-5 py-3.5 text-center">
                    <div v-if="adj.pending_amount > 0" class="flex flex-col items-center gap-1.5 justify-center">
                      <button @click="openPendingPaymentModal(adj)" class="px-3 py-1.5 text-[10px] font-black bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 rounded-lg transition-all uppercase tracking-widest border border-emerald-200 dark:border-emerald-800 shadow-sm">
                        Pay Pending
                      </button>
                      <button @click="openEditNextPaymentDateModal(adj)" class="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 rounded-md transition-all shadow-sm">
                        <svg class="w-3 h-3 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span>Due: {{ adj.next_payment_date ? formatDate(adj.next_payment_date) : 'Not Set' }}</span>
                        <svg class="w-2.5 h-2.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                    </div>
                    <div v-else class="flex flex-col items-center gap-1.5 justify-center mb-1.5">
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                        <svg class="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                        Completed
                      </span>
                    </div>
                    <div class="flex flex-col items-center justify-center mt-1.5">
                        <button v-if="authStore.hasPermission('contract_edit')" @click="openEditAdjustmentModal(adj)" class="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800 rounded-md transition-all shadow-sm">
                            <svg class="w-3 h-3 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                            <span>Edit</span>
                        </button>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="bg-[#29166e]/5 dark:bg-[#29166e]/10 border-t-2 border-[#29166e]/10 dark:border-[#29166e]/30">
                  <td colspan="2" class="px-5 py-3 text-[10px] font-black text-[#29166e] uppercase tracking-widest">Total Personal Due</td>
                  <td class="px-5 py-3 text-sm font-black text-[#29166e] dark:text-[#29166e] text-right">QAR {{ formatCurrency(totalPersonalDueAmount) }}</td>
                  <td class="px-5 py-3 text-sm font-black text-emerald-600 text-right">QAR {{ formatCurrency(totalPersonalDuePaid) }}</td>
                  <td class="px-5 py-3 text-sm font-black text-rose-500 text-right">QAR {{ formatCurrency(totalPersonalDuePending) }}</td>
                  <td></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div v-else class="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 px-6 py-8 text-center">
            <p class="text-sm font-bold text-slate-400 dark:text-slate-500 italic">No Personal Due entries added yet.</p>
          </div>

          <!-- Personal Due Payments History (Collections for Adjustments) -->
          <div v-if="filteredAdjustmentPayments.length > 0" class="space-y-4">
              <div class="flex items-center gap-3 px-1">
                  <div class="w-1 h-5 rounded-full bg-[#29166e]"></div>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal Due Payments History (Staff to NRG)</p>
              </div>
              <div class="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
                  <table class="w-full text-left">
                      <thead>
                          <tr class="bg-slate-50/50 dark:bg-slate-800/30">
                              <th class="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid Date</th>
                              <th class="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                              <th class="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                              <th class="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recorded By</th>
                              <th class="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                          </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                          <tr v-for="payment in filteredAdjustmentPayments" :key="payment.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td class="px-5 py-3.5 text-xs font-bold text-slate-600 dark:text-slate-400">{{ formatDateTime(payment.payment_date) }}</td>
                              <td class="px-5 py-3.5 text-sm font-black text-[#29166e] dark:text-[#29166e] text-right">QAR {{ formatCurrency(payment.amount) }}</td>
                              <td class="px-5 py-3.5">
                                  <span class="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter bg-[#29166e]/5 dark:bg-[#29166e]/20 text-[#29166e] border border-[#29166e]/10 dark:border-[#29166e]/30">
                                      {{ payment.payment_method }}
                                  </span>
                              </td>
                              <td class="px-5 py-3.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                                  <span class="font-bold">{{ payment.recorded_by || 'N/A' }}</span>
                                  <span v-if="payment.recorded_by_role" class="block text-[9px] font-black uppercase text-slate-400 tracking-wider">
                                      {{ payment.recorded_by_role }}
                                  </span>
                              </td>
                              <td class="px-5 py-3.5 text-center">
                                  <button @click="removePayment(payment)" :disabled="paymentDeletingId === payment.id" class="px-3 py-1.5 text-[10px] font-black text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all disabled:opacity-50 uppercase tracking-widest">
                                      {{ paymentDeletingId === payment.id ? 'Removing...' : 'Delete' }}
                                  </button>
                              </td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </div>
        </div>

        <!-- ===================== TAB 2: Manage Contract Payment ===================== -->
        <div v-if="paymentModalTab === 'payments'" class="space-y-6 animate-fade-in">
          <!-- Payment Status Header -->
          <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company Collection Management (Company to NRG)</p>
              <p class="text-[10px] text-emerald-500 font-bold italic">Record payments received from companies against the main contract balance.</p>
            </div>
            <div class="flex items-center gap-3">
              <div class="text-right hidden md:block">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Net Payable</p>
                <p class="text-base font-black text-slate-800 dark:text-white">QAR {{ formatCurrency(paymentContract.net_payable || 0) }}</p>
              </div>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" :class="paymentStatusClass(paymentContract.payment_status)">
                {{ paymentContract.payment_status || 'Payment Not Initialized' }}
              </span>
            </div>
          </div>

          <!-- Quick Summary Pills -->
          <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contract Value</p>
              <p class="text-sm font-black text-slate-800 dark:text-white mt-0.5">QAR {{ formatCurrency(paymentContract.total_income || 0) }}</p>
            </div>
            <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center">
              <p class="text-[9px] font-black text-[#29166e] uppercase tracking-widest">Personal Due</p>
              <p class="text-sm font-black text-[#29166e] dark:text-[#29166e] mt-0.5">QAR {{ formatCurrency(paymentContract.adjustment_total || 0) }}</p>
            </div>
            <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center">
              <p class="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Paid</p>
              <p class="text-sm font-black text-emerald-600 mt-0.5">QAR {{ formatCurrency(paymentContract.paid_amount || 0) }}</p>
            </div>
            <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center">
              <p class="text-[9px] font-black text-rose-500 uppercase tracking-widest">Pending</p>
              <p class="text-sm font-black text-rose-500 mt-0.5">QAR {{ formatCurrency(paymentContract.pending_amount || 0) }}</p>
            </div>
            <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center ring-2 ring-emerald-500/10">
              <p class="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Company Next Due</p>
              <p class="text-sm font-black text-emerald-600 mt-0.5">{{ formatDate(paymentContract.next_collection_due_date) || '—' }}</p>
            </div>
          </div>

          <!-- Payment Entry Form -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Amount <span class="text-rose-500">*</span></label>
              <input v-model="paymentForm.amount" :disabled="paymentSaving" type="text" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all dark:text-white font-bold text-sm" placeholder="Ex: 1,000">
            </div>
            <DateInput 
              label="Paid Date *"
              v-model="paymentForm.payment_date"
              :disabled="paymentSaving"
            />
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Method <span class="text-rose-500">*</span></label>
              <select v-model="paymentForm.payment_method" :disabled="paymentSaving" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all dark:text-white font-bold text-sm">
                <option value="Cash">Cash</option>
                <option value="Online">Online Transaction</option>
              </select>
            </div>
            <DateInput 
              label="Next Collection Due"
              v-model="paymentForm.next_payment_date"
              :disabled="paymentSaving"
            />

            <div class="md:col-span-3">
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Reason <span class="text-rose-500">*</span></label>
              <select v-model="paymentForm.subcategory" :disabled="paymentSaving" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all dark:text-white font-bold text-sm">
                <option value="">Select Reason</option>
                <option value="Monthly Installment">Monthly Installment</option>
                <option value="QID Renewal Fee">QID Renewal Fee</option>
                <option value="Passport Renewal Fee">Passport Renewal Fee</option>
                <option value="Profession Change Fee">Profession Change Fee</option>
                <option value="Sponsorship Change Fee">Sponsorship Change Fee</option>
                <option value="Health Card Fee">Health Card Fee</option>
                <option value="Re-entry Permit">Re-entry Permit</option>
                <option value="Settlement">Settlement</option>
                <option value="Others Fee">Others Fee</option>
              </select>
            </div>
            <div class="flex flex-col items-end gap-2 justify-end">
              <button @click.prevent="savePayment" :disabled="paymentSaving || !paymentContract.id" class="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30">
                {{ paymentSaving ? 'Saving...' : (paymentEditingId ? 'Save Changes' : 'Add Payment') }}
              </button>
              <button v-if="paymentEditingId" @click.prevent="resetPaymentForm" :disabled="paymentSaving" class="w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 rounded-2xl font-black text-sm transition-all">
                Cancel Edit
              </button>
            </div>
          </div>

          <!-- Payment History Table -->
          <div class="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
            <div class="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company Collection History (NRG Revenue)</p>
              <span class="text-[10px] font-black text-slate-400 uppercase">{{ filteredContractPayments.length }} Entries</span>
            </div>
            <div v-if="paymentLoading" class="px-6 py-10 text-center">
              <div class="w-8 h-8 border-3 border-[#29166e]/10 border-t-[#29166e] rounded-full animate-spin mx-auto"></div>
              <p class="mt-3 text-sm font-bold text-slate-500 dark:text-slate-400">Loading payment history...</p>
            </div>
            <div v-else-if="filteredContractPayments.length === 0" class="px-6 py-10 text-center">
              <svg class="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
              <p class="text-sm font-bold text-slate-400 dark:text-slate-500 italic">No payment entries yet.</p>
            </div>
            <table v-else class="w-full text-left">
              <thead>
                <tr class="bg-slate-50/50 dark:bg-slate-800/30">
                  <th class="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid Date</th>
                  <th class="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                  <th class="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                  <th class="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sub Category</th>
                  <th class="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Pay Date</th>
                  <th class="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recorded By</th>
                  <th class="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr v-for="payment in filteredContractPayments" :key="payment.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td class="px-5 py-3.5 text-xs font-bold text-slate-600 dark:text-slate-400">{{ formatDateTime(payment.payment_date) }}</td>
                  <td class="px-5 py-3.5 text-sm font-black text-emerald-600 dark:text-emerald-400 text-right">QAR {{ formatCurrency(payment.amount) }}</td>
                  <td class="px-5 py-3.5">
                    <span class="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter" :class="payment.payment_method === 'Cash' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border border-amber-200 dark:border-amber-800' : 'bg-[#29166e]/5 dark:bg-[#29166e]/20 text-[#29166e] border border-[#29166e]/10 dark:border-[#29166e]/30'">
                      {{ payment.payment_method }}
                    </span>
                  </td>
                  <td class="px-5 py-3.5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight">{{ payment.subcategory || '—' }}</td>
                  <td class="px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400">{{ formatDate(payment.next_payment_date) }}</td>
                  <td class="px-5 py-3.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span class="font-bold">{{ payment.recorded_by || 'N/A' }}</span>
                    <span v-if="payment.recorded_by_role" class="block text-[9px] font-black uppercase text-slate-400 tracking-wider">
                      {{ payment.recorded_by_role }}
                    </span>
                  </td>
                  <td class="px-5 py-3.5 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <button @click="editPayment(payment)" :disabled="paymentDeletingId === payment.id" class="px-3 py-1.5 text-[10px] font-black text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all uppercase tracking-widest">
                        Edit
                      </button>
                      <button @click="removePayment(payment)" :disabled="paymentDeletingId === payment.id" class="px-3 py-1.5 text-[10px] font-black text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all disabled:opacity-50 uppercase tracking-widest">
                        {{ paymentDeletingId === payment.id ? 'Removing...' : 'Delete' }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="bg-emerald-50/50 dark:bg-emerald-900/10 border-t-2 border-emerald-100 dark:border-emerald-900/30">
                  <td class="px-5 py-3 text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total Company Collected</td>
                  <td class="px-5 py-3 text-sm font-black text-emerald-600 dark:text-emerald-400 text-right">QAR {{ formatCurrency(paymentContract.paid_amount || 0) }}</td>
                  <td colspan="5"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
      <template #footer>
        <button @click="closePaymentModal" class="px-6 py-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-sm transition-colors">Close</button>
      </template>
    </Modal>
 
    <!-- Pay Pending Payment Modal -->
    <Modal :show="showPendingPaymentModal" title="Pay Pending Amount" @close="showPendingPaymentModal = false" maxWidth="md">
        <div class="p-6 space-y-5 bg-white dark:bg-slate-900">
            <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Paying for</p>
                    <p class="text-sm font-black text-slate-800 dark:text-white">{{ payingAdjustment?.reason }}</p>
                </div>
                <div class="text-right">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pending</p>
                    <p class="text-lg font-black text-rose-500">QAR {{ formatCurrency(payingAdjustment?.pending_amount || 0) }}</p>
                </div>
            </div>
            
            <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Payment Amount <span class="text-rose-500">*</span></label>
                <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">QAR</span>
                    <input v-model="pendingPaymentForm.amount" :disabled="pendingPaymentSaving" type="number" step="0.01" class="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-[#29166e]/10 focus:border-[#29166e] transition-all dark:text-white font-bold text-sm" placeholder="0.00">
                </div>
            </div>
            <DateInput 
                label="Paid Date *" 
                v-model="pendingPaymentForm.payment_date" 
                :disabled="pendingPaymentSaving" 
            />
            <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Method <span class="text-rose-500">*</span></label>
                <select v-model="pendingPaymentForm.payment_method" :disabled="pendingPaymentSaving" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-[#29166e]/10 focus:border-[#29166e] transition-all dark:text-white font-bold text-sm">
                    <option value="Cash">Cash</option>
                    <option value="Online">Online Transaction</option>
                </select>
            </div>
            <DateInput 
                label="Next Pay Date (Optional)" 
                v-model="pendingPaymentForm.next_payment_date" 
                :disabled="pendingPaymentSaving" 
            />
        </div>
        <template #footer>
            <button @click="showPendingPaymentModal = false" class="px-6 py-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-sm transition-colors">Cancel</button>
            <button @click="submitPendingPayment" :disabled="pendingPaymentSaving" class="px-8 py-3.5 bg-[#29166e] hover:bg-[#1d0f4d] disabled:opacity-50 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-[#29166e]/20 flex items-center gap-2">
                <svg v-if="pendingPaymentSaving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {{ pendingPaymentSaving ? 'Processing...' : 'Submit Payment' }}
            </button>
        </template>
    </Modal>

    <!-- Edit Adjustment Modal -->
    <Modal :show="showEditAdjustmentModal" title="Edit Personal Due" @close="showEditAdjustmentModal = false" maxWidth="md">
        <div class="p-6 space-y-5 bg-white dark:bg-slate-900">
            <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Total Amount <span class="text-rose-500">*</span></label>
                <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">QAR</span>
                    <input v-model="editAdjustmentForm.amount" :disabled="savingEditAdjustment" type="number" step="0.01" class="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-[#29166e]/10 focus:border-[#29166e] transition-all dark:text-white font-bold text-sm" placeholder="0.00">
                </div>
            </div>

            <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Paid Amount</label>
                <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">QAR</span>
                    <input v-model="editAdjustmentForm.paid_amount" :disabled="savingEditAdjustment" type="number" step="0.01" min="0" class="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-[#29166e]/10 focus:border-[#29166e] transition-all dark:text-white font-bold text-sm" placeholder="0.00">
                </div>
                <p class="text-[10px] font-bold mt-1 ml-1" :class="editAdjPendingPreview >= 0 ? 'text-slate-400' : 'text-rose-500'">
                    Pending after edit: QAR {{ formatCurrency(editAdjPendingPreview >= 0 ? editAdjPendingPreview : 0) }}
                </p>
            </div>
            
            <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Reason / Description <span class="text-rose-500">*</span></label>
                <input v-model="editAdjustmentForm.reason" :disabled="savingEditAdjustment" type="text" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-[#29166e]/10 focus:border-[#29166e] transition-all dark:text-white font-bold text-sm" placeholder="e.g., Traffic Violation">
            </div>

            <DateInput 
                label="Date *" 
                v-model="editAdjustmentForm.adjustment_date" 
                :disabled="savingEditAdjustment" 
            />

            <DateInput 
                label="Next Pay Date (Optional)" 
                v-model="editAdjustmentForm.next_payment_date" 
                :disabled="savingEditAdjustment" 
            />
        </div>
        <template #footer>
            <button @click="showEditAdjustmentModal = false" class="px-6 py-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-sm transition-colors">Cancel</button>
            <button @click="submitEditAdjustment" :disabled="savingEditAdjustment" class="px-8 py-3.5 bg-[#29166e] hover:bg-[#1d0f4d] disabled:opacity-50 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-[#29166e]/20 flex items-center gap-2">
                <svg v-if="savingEditAdjustment" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {{ savingEditAdjustment ? 'Saving...' : 'Save Changes' }}
            </button>
        </template>
    </Modal>

    <!-- Edit Next Payment Date Modal -->
    <Modal :show="showEditNextPaymentDateModal" title="Update Next Payment Date" @close="showEditNextPaymentDateModal = false" maxWidth="md">
        <div class="p-6 space-y-5 bg-white dark:bg-slate-900">
            <div class="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p class="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Personal Due Reason</p>
                <p class="text-sm font-black text-slate-800 dark:text-white">{{ selectedAdjustmentToEditDate?.reason }}</p>
            </div>
            
            <DateInput 
                label="Next Pay Date *" 
                v-model="editNextPaymentDateForm.next_payment_date" 
                :disabled="savingNextPaymentDate" 
            />
        </div>
        <template #footer>
            <button @click="showEditNextPaymentDateModal = false" class="px-6 py-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-sm transition-colors">Cancel</button>
            <button @click="submitEditNextPaymentDate" :disabled="savingNextPaymentDate" class="px-8 py-3.5 bg-[#29166e] hover:bg-[#1d0f4d] disabled:opacity-50 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-[#29166e]/20 flex items-center gap-2">
                <svg v-if="savingNextPaymentDate" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {{ savingNextPaymentDate ? 'Saving...' : 'Update Date' }}
            </button>
        </template>
    </Modal>

    <!-- Update Next Due Date Modal (Collection & Personal Due) -->
    <Modal :show="showUpdateNextDueDateModal" :title="nextDueDateForm.type === 'collection' ? 'Update Company Next Due Date' : 'Update Personal Next Due Date'" @close="showUpdateNextDueDateModal = false" maxWidth="md">
        <div class="p-6 space-y-5 bg-white dark:bg-slate-900">
            <div class="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p class="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Staff Member</p>
                <p class="text-sm font-black text-slate-800 dark:text-white">{{ nextDueDateForm.staff_name }}</p>
            </div>
            
            <DateInput 
                :label="nextDueDateForm.type === 'collection' ? 'Company Next Due Date *' : 'Personal Next Due Date *'" 
                v-model="nextDueDateForm.next_payment_date" 
                :disabled="savingNextDueDate" 
            />
        </div>
        <template #footer>
            <button @click="showUpdateNextDueDateModal = false" class="px-6 py-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-sm transition-colors">Cancel</button>
            <button @click="submitUpdateNextDueDate" :disabled="savingNextDueDate" class="px-8 py-3.5 bg-[#29166e] hover:bg-[#1d0f4d] disabled:opacity-50 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-[#29166e]/20 flex items-center gap-2">
                <svg v-if="savingNextDueDate" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {{ savingNextDueDate ? 'Saving...' : 'Update Date' }}
            </button>
        </template>
    </Modal>


    <!-- Confirm Add Modal -->
    <ConfirmModal 
      :show="showCreateConfirmModal" 
      variant="info"
      title="Confirm Contract Creation"
      message="Once you added the contract it is not editable so please verify all details and submit."
      confirmText="Yes, Submit"
      cancelText="Wait, Let me check"
      :loading="saving"
      @confirm="() => { showCreateConfirmModal = false; saveContract(); }"
      @cancel="showCreateConfirmModal = false"
    />

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
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import KpiCard from '@/components/shared/KpiCard.vue';
import DataTable from '@/components/shared/DataTable.vue';
import Modal from '@/components/shared/Modal.vue';
import ConfirmModal from '@/components/shared/ConfirmModal.vue';
import SearchableSelect from '@/components/shared/SearchableSelect.vue';
import AlertModal from '@/components/shared/AlertModal.vue';
import DateInput from '@/components/shared/DateInput.vue';
import { useAuthStore } from '@/stores/auth';
import { useDashboardStore } from '@/stores/dashboard';
import { contractService, staffService, companyService } from '@/services/api';
import { useNotificationStore } from '@/stores/notification';

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();
const notificationStore = useNotificationStore();
const route = useRoute();
const router = useRouter();

const statsContainerRef = ref(null);
const isScrolled = ref(false);
let observer = null;

const contractSummary = ref({
    total_contracts: 0,
    total_value: 0,
    total_paid: 0,
    total_pending: 0,
    total_contract_profit: 0,
    total_overheads: 0
});

const summaryIcons = {
    contracts: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
    value: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3 1.343 3 3-1.343 3-3 3m0-13c-1.11 0-2.08.402-2.599 1M12 8V7m0 1v8m0 0v1m0-1c1.11 0 2.08-.402 2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
    paid: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
    pending: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
    profit: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
    overhead: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`
};

const visibleCardsGridClass = computed(() => {
    const showPaid = authStore.hasPermission('contract_card_total_collected');
    const showPending = authStore.hasPermission('contract_card_pending_collection');
    const showProfit = authStore.hasPermission('contract_card_contract_profit');
    const showOverhead = authStore.hasPermission('contract_card_general_overheads');
    
    let count = 0;
    if (showPaid) count++;
    if (showPending) count++;
    if (showProfit) count++;
    if (showOverhead) count++;
    
    if (count === 4) {
        return 'md:grid-cols-2 lg:grid-cols-4';
    } else if (count === 3) {
        return 'md:grid-cols-2 lg:grid-cols-3';
    } else if (count === 2) {
        return 'md:grid-cols-2 lg:grid-cols-2';
    } else {
        return 'grid-cols-1';
    }
});

const fetchSummary = async () => {
    try {
        const res = await contractService.getSummary();
        contractSummary.value = res.data;
        dashboardStore.setContractStats(res.data);
    } catch (err) {
        console.error('Failed to load contract summary', err);
    }
};

const selectedExpenseCategory = ref('');
const activeCategories = ref([]);

const toggleCategory = (cat) => {
    if (!cat) return;
    if (!activeCategories.value.includes(cat)) {
        activeCategories.value.push(cat);
    }
    selectedExpenseCategory.value = '';
};
const removeCategory = (cat) => {
    activeCategories.value = activeCategories.value.filter(c => c !== cat);
};

const contracts = ref([]);
const staffList = ref([]);
const loading = ref(true);
const saving = ref(false);
const paymentLoading = ref(false);
const paymentSaving = ref(false);
const paymentEditingId = ref(null);
const paymentDeletingId = ref(null);
const search = ref('');
const paymentStatusFilter = ref('');
const pendingOnly = ref(false);
const fromDate = ref('');
const toDate = ref('');
const sortBy = ref('id');
const sortDir = ref('desc');
const perPage = ref(10);
const pagination = ref({});
const companies = ref([]);
const companyFilter = ref('');
const companyOptions = computed(() => {
  const options = [
    { id: '', name: 'All Companies' }
  ];
  if (Array.isArray(companies.value)) {
    companies.value.forEach(c => {
      const displayName = c.branch_number ? `${c.name} (${c.branch_number})` : c.name;
      options.push({ id: c.id, name: displayName });
    });
  }
  return options;
});

const showModal = ref(false);
const showViewModal = ref(false);
const selectedViewContract = ref(null);
const showPaymentModal = ref(false);
const paymentModalTab = ref('payments');
const contractAdjustments = ref([]);

const totalPersonalDueAmount = computed(() => {
    return contractAdjustments.value.reduce((sum, adj) => sum + (parseFloat(adj.amount) || 0), 0);
});

const totalPersonalDuePaid = computed(() => {
    return contractAdjustments.value.reduce((sum, adj) => sum + (parseFloat(adj.paid_amount) || 0), 0);
});

const totalPersonalDuePending = computed(() => {
    return contractAdjustments.value.reduce((sum, adj) => sum + (parseFloat(adj.pending_amount) || 0), 0);
});

const filteredContractPayments = computed(() => {
    return payments.value.filter(p => !p.contract_adjustment_id);
});

const filteredAdjustmentPayments = computed(() => {
    return payments.value.filter(p => p.contract_adjustment_id);
});

const selectedViewAdminPayments = computed(() => {
    return (selectedViewContract.value?.payments || []).filter(p => !p.contract_adjustment_id);
});

const selectedViewAdjustmentPayments = computed(() => {
    return (selectedViewContract.value?.payments || []).filter(p => p.contract_adjustment_id);
});

const showConfirmModal = ref(false);
const showCreateConfirmModal = ref(false);
const showAlertModal = ref(false);
const alertConfig = ref({
    type: 'error',
    title: 'Validation Error',
    message: ''
});
const itemToDelete = ref(null);
const deleting = ref(false);
const editMode = ref(false);
const errors = ref({});
const form = ref({
  id: null,
  staff_id: '',
  qid_renewal_fee: '',
  qid_next_renewal_date: '',
  passport_renewal_fee: '',
  profession_change_fee: '',
  sponsorship_change_fee: '',
  health_card_fee: '',
  others_fee: '',
  others_reason: '',
  total_income: '',
  contract_date: '',
  start_date: '',
  end_date: '',
  paid_amount: 0,
  pending_amount: 0,
  payment_status: 'Payment Not Initialized',
  payment_type: 'Cash',
  notes: ''
});
const showAdjustmentModal = ref(false);
const adjustmentSaving = ref(false);
const adjustmentContract = ref({ id: null, net_payable: 0 });
const adjustmentForm = ref({
    amount: '',
    paid_amount: '',
    reason: '',
    adjustment_date: new Date().toISOString().slice(0, 10),
    next_payment_date: '',
    payment_method: 'Cash'
});
const paymentContract = ref({
  id: null,
  staff: null,
  company: null,
  total_income: 0,
  net_payable: 0,
  paid_amount: 0,
  pending_amount: 0,
  payment_status: 'Payment Not Initialized',
  payment_type: 'Cash'
});
const payments = ref([]);
const paymentForm = ref({
  amount: '',
  payment_date: new Date().toISOString().slice(0, 10),
  payment_method: 'Cash',
  subcategory: 'Monthly Installment',
  next_payment_date: '',
  notes: '',
  contract_adjustment_id: ''
});

const showPendingPaymentModal = ref(false);
const payingAdjustment = ref(null);
const pendingPaymentForm = ref({
    amount: '',
    payment_date: new Date().toISOString().slice(0, 10),
    payment_method: 'Cash',
    next_payment_date: ''
});
const pendingPaymentSaving = ref(false);

const showEditNextPaymentDateModal = ref(false);
const selectedAdjustmentToEditDate = ref(null);
const editNextPaymentDateForm = ref({
    next_payment_date: ''
});
const savingNextPaymentDate = ref(false);

const showEditAdjustmentModal = ref(false);
const selectedAdjustmentToEdit = ref(null);
const editAdjustmentForm = ref({
    amount: '',
    paid_amount: '',
    reason: '',
    adjustment_date: new Date().toISOString().slice(0, 10),
    next_payment_date: ''
});
const savingEditAdjustment = ref(false);

const editAdjPendingPreview = computed(() => {
    const total = parseFloat(editAdjustmentForm.value.amount) || 0;
    const paid = parseFloat(editAdjustmentForm.value.paid_amount) || 0;
    return Math.round((total - paid) * 100) / 100;
});

const showUpdateNextDueDateModal = ref(false);
const nextDueDateForm = ref({
    contract_id: null,
    type: 'collection',
    next_payment_date: '',
    staff_name: ''
});
const savingNextDueDate = ref(false);


const paymentStatusOptions = ['Payment Not Initialized', 'Partially Paid', 'Fully Paid'];



const selectedStaff = computed(() => {
    if (!form.value.staff_id) return null;
    return staffList.value.find(s => s.id === form.value.staff_id) || null;
});

watch(() => form.value.staff_id, (newId) => {
    if (!editMode.value && newId) {
        const staff = staffList.value.find(s => s.id === newId);
        if (staff && staff.qid_expiry) {
            const currentExpiry = new Date(staff.qid_expiry);
            const nextExpiry = new Date(currentExpiry);
            nextExpiry.setFullYear(currentExpiry.getFullYear() + 1);
            form.value.qid_next_renewal_date = nextExpiry.toISOString().slice(0, 10);
        }
    }
});

const currentExpenseTotal = computed(() => {
    const fields = ['qid_renewal_fee', 'passport_renewal_fee', 'profession_change_fee', 'sponsorship_change_fee', 'health_card_fee', 'others_fee'];
    return fields.reduce((sum, field) => {
        const val = parseFloat(form.value[field]) || 0;
        return sum + val;
    }, 0);
});

const columns = [
  { key: 'staff_name', label: 'Staff Member', sortable: false },
  { key: 'company_name', label: 'Company', sortable: false },
  { key: 'net_payable', label: 'Contract Value', sortable: true },
  { key: 'contract_date', label: 'Next QID Date', sortable: true },
  { key: 'paid_amount', label: 'Paid', sortable: true },
  { key: 'pending_amount', label: 'Balance', sortable: true },
  { key: 'next_collection_due_date', label: 'Company Next Due', sortable: true },
  { key: 'next_personal_due_date', label: 'Personal Next Due', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false }
];

const fetchContracts = async (page = 1) => {
  loading.value = true;
  try {
    const res = await contractService.getAll({
      page,
      search: search.value,
      payment_status: paymentStatusFilter.value,
      pending_only: pendingOnly.value ? 1 : '',
      from_date: fromDate.value,
      to_date: toDate.value,
      staff_id: '',
      company_id: companyFilter.value,
      sort_by: sortBy.value === 'total_income' ? 'total_income' : sortBy.value,
      sort_direction: sortDir.value,
      per_page: perPage.value
    });
    contracts.value = res.data.data;
    pagination.value = res.data.meta;
  } catch (err) {
    console.error('Failed to fetch contracts', err);
    notificationStore.error(err.response?.data?.message || 'Failed to load contracts');
  } finally {
    loading.value = false;
  }
};

const fetchResources = async () => {
    try {
        const staffRes = await staffService.getSimple({ status: 'active' });
        staffList.value = staffRes.data || [];
        
        const companyRes = await companyService.getSimple();
        companies.value = companyRes.data || [];
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

const searchDebounceTimer = ref(null);

const debouncedSearch = () => {
    clearTimeout(searchDebounceTimer.value);
    searchDebounceTimer.value = setTimeout(() => {
        fetchContracts(1);
    }, 400);
};

const resetMainFilters = () => {
    search.value = '';
    paymentStatusFilter.value = '';
    companyFilter.value = '';
    pendingOnly.value = false;
    fromDate.value = '';
    toDate.value = '';
    
    // Clear URL query parameters
    router.replace({ query: {} });

    clearTimeout(searchDebounceTimer.value);
    fetchContracts(1);
};

const openModal = (contract = null) => {
  errors.value = {};
  activeCategories.value = [];
  if (contract) {
    editMode.value = true;
    syncFormWithContract(contract);
  } else {
    editMode.value = false;
    form.value = {
      id: null,
      staff_id: '',
      qid_renewal_fee: '',
      qid_next_renewal_date: '',
      passport_renewal_fee: '',
      profession_change_fee: '',
      sponsorship_change_fee: '',
      health_card_fee: '',
      others_fee: '',
      others_reason: '',
      total_income: '',
      contract_date: '',
      start_date: '',
      end_date: '',
      paid_amount: 0,
      pending_amount: 0,
      payment_status: 'Payment Not Initialized',
      payment_type: 'Cash',
      notes: ''
    };
  }
  selectedExpenseCategory.value = '';
  showModal.value = true;
};
const openViewModal = async (contract) => {
    try {
        const res = await contractService.getById(contract.id);
        selectedViewContract.value = res.data.data;
        showViewModal.value = true;
    } catch (err) {
        console.error('Failed to fetch contract details', err);
        notificationStore.error('Failed to load contract details');
    }
};

const handleInitialSave = () => {
    errors.value = {};
    let hasError = false;

    if (!form.value.staff_id) {
        errors.value.staff_id = 'Staff member is required';
        hasError = true;
    }
    if (!form.value.total_income || parseFloat(form.value.total_income) <= 0) {
        errors.value.total_income = 'Valid contract value is required';
        hasError = true;
    }

    if (hasError) {
        notificationStore.error('Please fix the validation errors.');
        return;
    }

    if (editMode.value) {
        saveContract();
    } else {
        showCreateConfirmModal.value = true;
    }
};

const saveContract = async () => {
  saving.value = true;
  try {
    const payload = { ...form.value };
    
    // Normalize format strings
    const fields = ['total_income', 'qid_renewal_fee', 'passport_renewal_fee', 'profession_change_fee', 'sponsorship_change_fee', 'health_card_fee', 'others_fee'];
    fields.forEach(f => {
        if (typeof payload[f] === 'string' && payload[f] !== '') {
            payload[f] = payload[f].replace(/[^0-9.]/g, '');
            payload[f] = parseFloat(payload[f]);
        } else if (payload[f] === '' || payload[f] === null) {
            payload[f] = null;
        }
    });
    delete payload.paid_amount;
    delete payload.pending_amount;
    delete payload.payment_status;
    
    if (editMode.value) {
      const res = await contractService.update(payload.id, payload);
      syncFormWithContract(res.data.data);
      notificationStore.success('Contract updated successfully');
    } else {
      const res = await contractService.create(payload);
      showModal.value = false;
      notificationStore.success('Contract created successfully');
    }
    fetchContracts(pagination.value.current_page || 1);
    fetchSummary();
  } catch (err) {
    if (err.response?.status === 422) {
        errors.value = err.response.data.errors;
        notificationStore.error('Validation error. Please check the fields.');
    } else {
        alertConfig.value = {
            type: 'error',
            title: 'Error',
            message: err.response?.data?.message || 'Failed to save contract'
        };
        showAlertModal.value = true;
    }
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
    contractAdjustments.value = contractRes.data.data.adjustments || [];
  } catch (err) {
    console.error('Failed to fetch contract payments', err);
  } finally {
    paymentLoading.value = false;
  }
};

const openPaymentModal = async (contract) => {
  syncPaymentContract(contract);
  resetPaymentForm();
  paymentModalTab.value = 'payments';
  contractAdjustments.value = [];
  showPaymentModal.value = true;
  await fetchContractPayments(contract.id);
};

const closePaymentModal = () => {
  showPaymentModal.value = false;
  payments.value = [];
  contractAdjustments.value = [];
  paymentDeletingId.value = null;
};

const savePayment = async () => {
  if (!paymentContract.value.id) return;

  // Client-side validation
  if (!paymentForm.value.amount || parseAmount(paymentForm.value.amount) <= 0) {
    alertConfig.value = { type: 'error', title: 'Amount Required', message: 'Please enter a valid payment amount.' };
    showAlertModal.value = true;
    return;
  }
  if (!paymentForm.value.payment_date) {
    alertConfig.value = { type: 'error', title: 'Date Required', message: 'Please select the payment date.' };
    showAlertModal.value = true;
    return;
  }
  if (!paymentForm.value.payment_method) {
    alertConfig.value = { type: 'error', title: 'Method Required', message: 'Please select a payment method.' };
    showAlertModal.value = true;
    return;
  }
  if (!paymentForm.value.subcategory) {
    alertConfig.value = { type: 'error', title: 'Reason Required', message: 'Please select a reason for this payment.' };
    showAlertModal.value = true;
    return;
  }

  paymentSaving.value = true;
  try {
    const payload = {
      ...paymentForm.value,
      amount: parseAmount(paymentForm.value.amount),
    };

    if (paymentEditingId.value) {
      await contractService.updatePayment(paymentContract.value.id, paymentEditingId.value, payload);
      notificationStore.success('Payment entry updated successfully');
    } else {
      await contractService.addPayment(paymentContract.value.id, payload);
      notificationStore.success('Payment entry added successfully');
    }
    
    await fetchContractPayments(paymentContract.value.id);
    await fetchContracts(pagination.value.current_page || 1);
    await fetchSummary();
    resetPaymentForm();
  } catch (err) {
    alertConfig.value = {
      type: 'error',
      title: 'Payment Error',
      message: err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat()[0] || 'Failed to save payment entry'
    };
    showAlertModal.value = true;
  } finally {
    paymentSaving.value = false;
  }
};

const editPayment = (payment) => {
    paymentEditingId.value = payment.id;
    paymentForm.value = {
        amount: payment.amount,
        payment_date: payment.payment_date ? payment.payment_date.substring(0, 10) : '',
        payment_method: payment.payment_method || 'Cash',
        subcategory: payment.subcategory || '',
        next_payment_date: payment.next_payment_date ? payment.next_payment_date.substring(0, 10) : '',
        notes: payment.notes || '',
        contract_adjustment_id: payment.contract_adjustment_id || ''
    };
};

const removePayment = async (payment) => {
  if (!paymentContract.value.id) return;

  paymentDeletingId.value = payment.id;
  try {
    await contractService.deletePayment(paymentContract.value.id, payment.id);
    await fetchContractPayments(paymentContract.value.id);
    await fetchContracts(pagination.value.current_page || 1);
    await fetchSummary();
    notificationStore.success('Payment entry deleted successfully');
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
    notificationStore.success('Contract deleted successfully');
    showConfirmModal.value = false;
    itemToDelete.value = null;
    fetchContracts(pagination.value.current_page || 1);
    fetchSummary();
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
  if (!date) return '-';
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' }).toLowerCase();
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatDateTime = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' }).toLowerCase();
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strTime = hours.toString().padStart(2, '0') + ':' + minutes + ' ' + ampm;
  return `${day}-${month}-${year} ${strTime}`;
};

const formatCurrency = (value) => {
    return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatCurrencyValue = (value) => {
    return 'QAR ' + formatCurrency(value);
};

const parseAmount = (value) => {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const normalized = typeof value === 'string' ? value.replace(/[^0-9.]/g, '') : value;
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
};

const syncFormWithContract = (contract) => {
    form.value = {
        ...contract,
        staff_id: contract.staff?.id || contract.staff_id,
        paid_amount: contract.paid_amount ?? 0,
        pending_amount: contract.pending_amount ?? 0,
        contract_date: contract.contract_date || '',
        payment_status: contract.payment_status || 'Payment Not Initialized',
        payment_type: contract.payment_type || 'Cash',
        notes: contract.notes || ''
    };

    // Populate activeCategories based on existing data
    activeCategories.value = [];
    if (contract.qid_renewal_fee > 0) activeCategories.value.push('qid');
    if (contract.passport_renewal_fee > 0) activeCategories.value.push('passport');
    if (contract.profession_change_fee > 0) activeCategories.value.push('profession');
    if (contract.sponsorship_change_fee > 0) activeCategories.value.push('sponsorship');
    if (contract.health_card_fee > 0) activeCategories.value.push('health');
    if (contract.others_fee > 0) activeCategories.value.push('others');
    form.value.others_reason = contract.others_reason || '';
};

const syncPaymentContract = (contract) => {
    paymentContract.value = {
        ...contract,
        paid_amount: contract.paid_amount ?? 0,
        pending_amount: contract.pending_amount ?? 0,
        payment_status: contract.payment_status || 'Payment Not Initialized',
        payment_type: contract.payment_type || 'Cash'
    };
};

const resetPaymentForm = () => {
    paymentForm.value = {
        amount: '',
        payment_date: new Date().toISOString().slice(0, 10),
        payment_method: paymentContract.value.payment_type || 'Cash',
        subcategory: '',
        next_payment_date: '',
        notes: '',
        contract_adjustment_id: ''
    };
    paymentEditingId.value = null;
};


const openAdjustmentModal = (contract) => {
    adjustmentContract.value = contract;
    adjustmentForm.value = {
        amount: '',
        reason: '',
        adjustment_date: new Date().toISOString().slice(0, 10)
    };
    showAdjustmentModal.value = true;
};

const closeAdjustmentModal = () => {
    showAdjustmentModal.value = false;
};

const submitAdjustment = async () => {
    if (!adjustmentContract.value.id) return;
    if (!adjustmentForm.value.amount || parseFloat(adjustmentForm.value.amount) <= 0) {
        alertConfig.value = { type: 'error', title: 'Invalid Amount', message: 'Please enter a valid adjustment amount.' };
        showAlertModal.value = true;
        return;
    }

    adjustmentSaving.value = true;
    try {
        const payload = {
            ...adjustmentForm.value,
            amount: parseAmount(adjustmentForm.value.amount)
        };
        await contractService.addAdjustment(adjustmentContract.value.id, payload);
        notificationStore.success('Contract value adjusted successfully');
        closeAdjustmentModal();
        await fetchContracts(pagination.value.current_page || 1);
        await fetchSummary();
    } catch (err) {
        alertConfig.value = {
            type: 'error',
            title: 'Adjustment Error',
            message: err.response?.data?.message || 'Failed to add adjustment'
        };
        showAlertModal.value = true;
    } finally {
        adjustmentSaving.value = false;
    }
};

const submitAdjustmentFromModal = async () => {
    if (!paymentContract.value.id) return;

    if (!adjustmentForm.value.adjustment_date) {
        alertConfig.value = { type: 'error', title: 'Date Required', message: 'Please select a date for the Personal Due.' };
        showAlertModal.value = true;
        return;
    }
    if (!adjustmentForm.value.amount || parseFloat(adjustmentForm.value.amount) <= 0) {
        alertConfig.value = { type: 'error', title: 'Invalid Amount', message: 'Please enter a valid Personal Due amount.' };
        showAlertModal.value = true;
        return;
    }
    if (!adjustmentForm.value.reason) {
        alertConfig.value = { type: 'error', title: 'Reason Required', message: 'Please enter a reason for the Personal Due.' };
        showAlertModal.value = true;
        return;
    }

    adjustmentSaving.value = true;
    try {
        const payload = {
            ...adjustmentForm.value,
            amount: parseAmount(adjustmentForm.value.amount),
            paid_amount: parseAmount(adjustmentForm.value.paid_amount) || 0,
        };
        await contractService.addAdjustment(paymentContract.value.id, payload);
        notificationStore.success('Personal Due added successfully');
        // Reset adjustment form
        adjustmentForm.value = {
            amount: '',
            paid_amount: '',
            reason: '',
            adjustment_date: new Date().toISOString().slice(0, 10),
            next_payment_date: '',
            payment_method: 'Cash'
        };
        // Refresh contract data in modal
        await fetchContractPayments(paymentContract.value.id);
        await fetchContracts(pagination.value.current_page || 1);
        await fetchSummary();
    } catch (err) {
        alertConfig.value = {
            type: 'error',
            title: 'Adjustment Error',
            message: err.response?.data?.message || 'Failed to add Personal Due'
        };
        showAlertModal.value = true;
    } finally {
        adjustmentSaving.value = false;
    }
};

const openPendingPaymentModal = (adj) => {
    payingAdjustment.value = adj;
    pendingPaymentForm.value = {
        amount: adj.pending_amount,
        payment_date: new Date().toISOString().slice(0, 10),
        payment_method: 'Cash',
        next_payment_date: adj.next_payment_date ? adj.next_payment_date.substring(0, 10) : ''
    };
    showPendingPaymentModal.value = true;
};

const submitPendingPayment = async () => {
    if (!payingAdjustment.value || !paymentContract.value.id) return;
    
    if (!pendingPaymentForm.value.amount || parseFloat(pendingPaymentForm.value.amount) <= 0) {
        alertConfig.value = { type: 'error', title: 'Invalid Amount', message: 'Please enter a valid amount.' };
        showAlertModal.value = true;
        return;
    }
    if (parseFloat(pendingPaymentForm.value.amount) > payingAdjustment.value.pending_amount) {
        alertConfig.value = { type: 'error', title: 'Invalid Amount', message: 'Payment cannot exceed pending amount.' };
        showAlertModal.value = true;
        return;
    }

    pendingPaymentSaving.value = true;
    try {
        const payload = {
            amount: parseAmount(pendingPaymentForm.value.amount),
            payment_date: pendingPaymentForm.value.payment_date,
            payment_method: pendingPaymentForm.value.payment_method,
            next_payment_date: pendingPaymentForm.value.next_payment_date || null,
            subcategory: payingAdjustment.value.reason,
            contract_adjustment_id: payingAdjustment.value.id
        };
        await contractService.addPayment(paymentContract.value.id, payload);
        notificationStore.success('Pending amount paid successfully');
        showPendingPaymentModal.value = false;
        
        await fetchContractPayments(paymentContract.value.id);
        await fetchContracts(pagination.value.current_page || 1);
        await fetchSummary();
    } catch (err) {
        alertConfig.value = {
            type: 'error',
            title: 'Payment Error',
            message: err.response?.data?.message || 'Failed to pay pending amount'
        };
        showAlertModal.value = true;
    } finally {
        pendingPaymentSaving.value = false;
    }
};

const openEditAdjustmentModal = (adj) => {
    selectedAdjustmentToEdit.value = adj;
    editAdjustmentForm.value = {
        amount: adj.amount,
        paid_amount: adj.paid_amount ?? 0,
        reason: adj.reason,
        adjustment_date: adj.adjustment_date ? adj.adjustment_date.substring(0, 10) : '',
        next_payment_date: adj.next_payment_date ? adj.next_payment_date.substring(0, 10) : ''
    };
    showEditAdjustmentModal.value = true;
};

const submitEditAdjustment = async () => {
    if (!selectedAdjustmentToEdit.value || !paymentContract.value.id) return;
    
    const totalAmt = parseFloat(editAdjustmentForm.value.amount);
    const paidAmt = parseFloat(editAdjustmentForm.value.paid_amount) || 0;

    if (!editAdjustmentForm.value.amount || totalAmt <= 0) {
        alertConfig.value = { type: 'error', title: 'Invalid Amount', message: 'Please enter a valid total amount.' };
        showAlertModal.value = true;
        return;
    }

    if (paidAmt > totalAmt) {
        alertConfig.value = { type: 'error', title: 'Invalid Paid Amount', message: 'Paid amount cannot exceed the total amount.' };
        showAlertModal.value = true;
        return;
    }

    savingEditAdjustment.value = true;
    try {
        const payload = {
            amount: totalAmt,
            paid_amount: paidAmt,
            reason: editAdjustmentForm.value.reason,
            adjustment_date: editAdjustmentForm.value.adjustment_date || null,
            next_payment_date: editAdjustmentForm.value.next_payment_date || null
        };
        await contractService.updateAdjustment(
            paymentContract.value.id,
            selectedAdjustmentToEdit.value.id,
            payload
        );
        notificationStore.success('Personal due updated successfully');
        showEditAdjustmentModal.value = false;
        
        await fetchContractPayments(paymentContract.value.id);
        await fetchContracts(pagination.value.current_page || 1);
        await fetchSummary();
    } catch (err) {
        alertConfig.value = {
            type: 'error',
            title: 'Update Error',
            message: err.response?.data?.message || 'Failed to update personal due'
        };
        showAlertModal.value = true;
    } finally {
        savingEditAdjustment.value = false;
    }
};

const openEditNextPaymentDateModal = (adj) => {
    selectedAdjustmentToEditDate.value = adj;
    editNextPaymentDateForm.value = {
        next_payment_date: adj.next_payment_date ? adj.next_payment_date.substring(0, 10) : ''
    };
    showEditNextPaymentDateModal.value = true;
};

const submitEditNextPaymentDate = async () => {
    if (!selectedAdjustmentToEditDate.value || !paymentContract.value.id) return;
    
    savingNextPaymentDate.value = true;
    try {
        const payload = {
            next_payment_date: editNextPaymentDateForm.value.next_payment_date || null
        };
        await contractService.updateAdjustment(
            paymentContract.value.id,
            selectedAdjustmentToEditDate.value.id,
            payload
        );
        notificationStore.success('Next payment date updated successfully');
        showEditNextPaymentDateModal.value = false;
        
        await fetchContractPayments(paymentContract.value.id);
        await fetchContracts(pagination.value.current_page || 1);
        await fetchSummary();
    } catch (err) {
        alertConfig.value = {
            type: 'error',
            title: 'Update Error',
            message: err.response?.data?.message || 'Failed to update next payment date'
        };
        showAlertModal.value = true;
    } finally {
        savingNextPaymentDate.value = false;
    }
};

const openUpdateNextDueDateModal = (contract, type) => {
    nextDueDateForm.value = {
        contract_id: contract.id,
        type: type,
        next_payment_date: type === 'collection' 
            ? (contract.next_collection_due_date ? contract.next_collection_due_date.substring(0, 10) : '')
            : (contract.next_personal_due_date ? contract.next_personal_due_date.substring(0, 10) : ''),
        staff_name: contract.staff?.name || 'N/A'
    };
    showUpdateNextDueDateModal.value = true;
};

const submitUpdateNextDueDate = async () => {
    if (!nextDueDateForm.value.contract_id) return;
    
    savingNextDueDate.value = true;
    try {
        const payload = {
            type: nextDueDateForm.value.type,
            next_payment_date: nextDueDateForm.value.next_payment_date || null
        };
        await contractService.updateNextDueDate(nextDueDateForm.value.contract_id, payload);
        notificationStore.success('Next due date updated successfully');
        showUpdateNextDueDateModal.value = false;
        
        await fetchContracts(pagination.value.current_page || 1);
        await fetchSummary();
    } catch (err) {
        alertConfig.value = {
            type: 'error',
            title: 'Update Error',
            message: err.response?.data?.message || 'Failed to update next due date'
        };
        showAlertModal.value = true;
    } finally {
        savingNextDueDate.value = false;
    }
};

const paymentStatusClass = (value) => {
    if (value === 'Fully Paid') {
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    }

    if (value === 'Partially Paid') {
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    }

    if (value === 'Payment Not Initialized') {
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300';
    }

    return 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300';
};

onMounted(() => {
    console.log('ContractsView mounted, checking filters...');
    if (route.query.filter === 'pending') {
        pendingOnly.value = true;
    }
    fetchContracts();
    fetchResources();
    fetchSummary();

    if (statsContainerRef.value) {
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const scrolledPast = !entry.isIntersecting;
                isScrolled.value = scrolledPast;
                dashboardStore.setShowContractMiniStats(scrolledPast);
            });
        }, {
            threshold: 0,
            rootMargin: '-80px 0px 0px 0px'
        });
        observer.observe(statsContainerRef.value);
    }
});

onUnmounted(() => {
    dashboardStore.setShowContractMiniStats(false);
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

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
    animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
</style>
