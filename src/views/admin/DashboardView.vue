<template>
  <div class="space-y-8 pb-10">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">System Dashboard</h1>
        <p class="text-slate-500 dark:text-slate-400">Welcome back. Here's what's happening today.</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
          Last Updated: {{ lastSync }}
        </span>
        <button @click="fetchDashboardData" class="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
            <svg class="w-5 h-5 text-slate-600" :class="{'animate-spin': loading}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <router-link to="/admin/staff" class="block group h-full">
        <KpiCard 
          title="Total Staff" 
          :value="stats.total_staff" 
          :icon="icons.users" 
          color-class="bg-blue-600" 
          class="cursor-pointer group-hover:scale-[1.02] transition-transform"
        />
      </router-link>
      <router-link to="/admin/staff?filter=expiring_qid" class="block group h-full">
        <KpiCard 
          title="QID Expiry (This Month)" 
          :value="stats.expiring_qid" 
          :icon="icons.alert" 
          color-class="bg-amber-500" 
          class="cursor-pointer group-hover:scale-[1.02] transition-transform"
        />
      </router-link>
      <router-link to="/admin/staff?filter=expired_passport" class="block group h-full">
        <KpiCard 
          title="Passport Expiry (This Month)" 
          :value="stats.expired_passport" 
          :icon="icons.document" 
          color-class="bg-rose-500" 
          class="cursor-pointer group-hover:scale-[1.02] transition-transform"
        />
      </router-link>
    </div>

    <!-- Data Tables Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Recent Collections Table -->
      <div class="lg:col-span-2 bg-white dark:bg-slate-800 p-0 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between p-6 pb-2">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white">Recent Collections</h3>
          <router-link to="/admin/reports/collections" class="text-xs font-bold text-blue-600 hover:text-blue-700">View All Collections →</router-link>
        </div>
        
        <div class="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-50 dark:border-slate-700/50">
                <th class="px-6 py-4 font-black">Time & Date</th>
                <th class="px-6 py-4 font-black">Collector</th>
                <th class="px-6 py-4 font-black">Company</th>
                <th class="px-6 py-4 font-black">Staff</th>
                <th class="px-6 py-4 font-black text-right">Amount</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
              <tr v-for="collection in recentCollections" :key="collection.id" 
                  @click="viewCollectionDetails(collection)"
                  class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group">
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <span class="text-sm font-black text-slate-800 dark:text-white leading-tight mb-0.5">{{ collection.date }}</span>
                    <span class="text-[10px] font-bold text-blue-500/70 dark:text-blue-400/60 uppercase tracking-wider">{{ collection.time_ago }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      {{ collection.collector.charAt(0) }}
                    </div>
                    <span class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ collection.collector }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[150px] block">{{ collection.company }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    {{ collection.staff }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <span class="text-xs font-medium text-slate-400 uppercase mr-1">QAR</span>
                  <span class="text-base font-black text-slate-900 dark:text-white">{{ formatCurrency(collection.amount) }}</span>
                </td>
              </tr>
              <tr v-if="!recentCollections.length">
                <td colspan="5" class="px-6 py-10 text-center text-slate-400 italic text-sm">No collections recorded yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

        <!-- Upcoming Expirations -->
      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden relative">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-6">Upcoming Expirations</h3>
          <div class="space-y-4">
              <div v-for="staff in upcomingExpirations" :key="staff.id" class="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                  <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                  </div>
                  <div class="min-w-0 flex-1">
                      <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ staff.name }}</p>
                      <p class="text-xs" :class="staff.status === 'critical' ? 'text-red-500 font-bold' : (staff.status === 'warning' ? 'text-amber-500 font-medium' : 'text-slate-500')">
                        {{ staff.type }} expires in {{ staff.days }} days
                      </p>
                  </div>
                  <router-link :to="`/admin/staff?search=${staff.name}`" class="text-xs font-bold text-blue-600 hover:text-blue-700">View</router-link>
              </div>
              <div v-if="!upcomingExpirations.length" class="py-10 text-center text-slate-400 italic text-sm">
                  No expirations in the next 30 days.
              </div>
          </div>
          <router-link to="/admin/staff?filter=expiring_qid" class="block w-full mt-6 py-2 text-center text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors bg-slate-50 dark:bg-slate-700 rounded-lg">View All Alerts</router-link>
      </div>
    </div>
    
    <!-- In-Progress Renewals Row -->
    <div class="mt-8 bg-white dark:bg-slate-800 p-0 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden mb-8">
      <div class="flex items-center justify-between p-6 pb-2">
        <div>
          <h3 class="text-lg font-bold text-slate-800 dark:text-white">In-Progress Renewals</h3>
          <p class="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-0.5">Fees paid, but system record pending update</p>
        </div>
      </div>
      
      <div v-if="pendingUpdates.length > 0" class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-50 dark:border-slate-700/50">
              <th class="px-6 py-4 font-black">Staff Member</th>
              <th class="px-6 py-4 font-black">Document Type</th>
              <th class="px-6 py-4 font-black">Payment Date</th>
              <th class="px-6 py-4 font-black">Current System Expiry</th>
              <th class="px-6 py-4 font-black text-center">Status</th>
              <th class="px-6 py-4 font-black text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
            <tr v-for="update in pendingUpdates" :key="update.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
              <td class="px-6 py-4">
                <span class="text-sm font-black text-slate-800 dark:text-white">{{ update.staff_name }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  {{ update.type }} Renewal
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="text-xs font-bold text-slate-600 dark:text-slate-400">{{ update.expense_date }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-xs font-black text-rose-500">{{ update.current_expiry }}</span>
                  <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Target: {{ update.new_expiry }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <span :class="{
                  'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400': update.renewal_status === 'processing',
                  'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400': update.renewal_status === 'medical' || update.renewal_status === 'fingerprints',
                  'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400': update.renewal_status === 'submitted',
                  'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400': update.renewal_status === 'delayed',
                  'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400': update.renewal_status === 'completed'
                }" class="px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest">
                  {{ update.renewal_status }}
                </span>
                <p v-if="update.renewal_notes" class="text-[9px] text-slate-400 mt-1 max-w-[150px] truncate mx-auto" :title="update.renewal_notes">
                  {{ update.renewal_notes }}
                </p>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openTrackingModal(update)" class="p-1.5 text-slate-400 hover:text-blue-600 transition-colors" title="Update Status">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                  </button>
                  <router-link :to="`/admin/staff?search=${update.staff_name}`" class="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-all">
                    Update System
                  </router-link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="p-12 text-center">
        <div class="w-12 h-12 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </div>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">All documentation records are currently up to date</p>
      </div>
    </div>

    <!-- Collection Details Modal -->
    <Modal :show="showCollectionModal" title="Collection & Company Details" @close="showCollectionModal = false" maxWidth="4xl">
      <div v-if="selectedCollection" class="p-8 space-y-8">
        <!-- Current Collection Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-4">
            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Collection Info</h4>
            <div class="p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
              <div class="flex items-center justify-between mb-4">
                <span class="text-xs font-bold text-blue-600 dark:text-blue-400">Amount Collected</span>
                <span class="text-2xl font-black text-blue-700 dark:text-white">QAR {{ formatCurrency(selectedCollection.amount) }}</span>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500 font-medium">Date:</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200">{{ selectedCollection.date }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500 font-medium">Method:</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200">{{ selectedCollection.method }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500 font-medium">Staff Member:</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200">{{ selectedCollection.staff }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500 font-medium">Recorded By:</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200">{{ selectedCollection.collector }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Company Details</h4>
            <div v-if="companyInfo" class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50">
              <h5 class="text-lg font-black text-slate-800 dark:text-white mb-4">{{ companyInfo.name }}</h5>
              <div class="space-y-3">
                <div class="flex items-center gap-3 text-sm">
                  <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                  <span class="text-slate-500">Contact:</span>
                  <span class="font-bold text-slate-700 dark:text-slate-300">{{ companyInfo.contact_person || 'N/A' }}</span>
                </div>
                <div class="flex items-center gap-3 text-sm">
                  <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                  <span class="text-slate-500">Phone:</span>
                  <span class="font-bold text-slate-700 dark:text-slate-300">{{ companyInfo.phone_number || 'N/A' }}</span>
                </div>
              </div>
              <router-link :to="`/admin/companies`" class="mt-4 block w-full py-2 text-center text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-900/30 rounded-xl hover:bg-blue-100 transition-colors">
                View Full Company Profile
              </router-link>
            </div>
            <div v-else-if="loadingDetails" class="p-10 flex flex-col items-center justify-center space-y-4">
              <div class="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Company Info...</p>
            </div>
          </div>
        </div>

        <!-- Pending Collections for Company -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Other Pending Collections for this Company</h4>
            <span v-if="!loadingDetails" class="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/30 text-[9px] font-black text-rose-600 uppercase tracking-widest">
              {{ pendingCollections.length }} Outstanding
            </span>
          </div>
          
          <div v-if="loadingDetails" class="flex justify-center py-12">
            <div class="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <div v-else-if="pendingCollections.length > 0" class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
            <table class="w-full text-left">
              <thead>
                <tr class="text-[9px] uppercase tracking-[0.2em] text-slate-400 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th class="px-6 py-3 font-black">Staff Member</th>
                  <th class="px-6 py-3 font-black">Contract Total</th>
                  <th class="px-6 py-3 font-black">Paid</th>
                  <th class="px-6 py-3 font-black text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr v-for="item in pendingCollections" :key="item.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td class="px-6 py-4">
                    <span class="text-sm font-bold text-slate-800 dark:text-white">{{ item.staff_name }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-xs font-medium text-slate-400 uppercase mr-1">QAR</span>
                    <span class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ formatCurrency(item.total_income) }}</span>
                  </td>
                  <td class="px-6 py-4 text-emerald-600 dark:text-emerald-400">
                    <span class="text-[10px] font-black uppercase mr-1">QAR</span>
                    <span class="text-sm font-bold">{{ formatCurrency(item.paid_amount) }}</span>
                  </td>
                  <td class="px-6 py-4 text-right text-rose-600 dark:text-rose-400">
                    <span class="text-[10px] font-black uppercase mr-1">QAR</span>
                    <span class="text-base font-black">{{ formatCurrency(item.pending_amount) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else-if="!loadingDetails" class="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
            <p class="text-sm font-bold text-slate-400 dark:text-slate-500 italic">No other pending collections found for this company.</p>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="flex items-center justify-end w-full p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <button @click="showCollectionModal = false" class="px-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            Close View
          </button>
        </div>
      </template>
    </Modal>

    <!-- Renewal Tracking Modal -->
    <Modal :show="showTrackingModal" title="Update Renewal Status" @close="showTrackingModal = false">
      <div v-if="selectedRenewal" class="p-6 space-y-6">
        <div class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-black">{{ selectedRenewal.staff_name[0] }}</div>
          <div>
            <p class="text-sm font-black text-slate-800 dark:text-white">{{ selectedRenewal.staff_name }}</p>
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{{ selectedRenewal.type }} Renewal Tracking</p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Process Status</label>
            <select v-model="trackingForm.renewal_status" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all">
              <option value="processing">🔄 Initial Processing</option>
              <option value="medical">🏥 Medical Test Pending</option>
              <option value="fingerprints">☝️ Fingerprints / Biometrics</option>
              <option value="submitted">📤 Submitted to Gov</option>
              <option value="delayed">⚠️ Delayed / Pending Requirement</option>
              <option value="completed">✅ Completed</option>
            </select>
          </div>

          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal Notes / Progress Remarks</label>
            <textarea v-model="trackingForm.renewal_notes" rows="4" placeholder="Enter details about why it's taking time, missing documents, etc." class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"></textarea>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex items-center justify-between w-full p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div>
            <button v-if="selectedRenewal?.renewal_status === 'completed'" @click="finalizeRenewal" :disabled="finalizing" class="px-6 py-2 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 flex items-center gap-2">
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path></svg>
               {{ finalizing ? 'Finalizing...' : 'Finalize & Update Staff' }}
            </button>
          </div>
          <div class="flex items-center gap-3">
            <button @click="showTrackingModal = false" class="px-6 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800">Cancel</button>
            <button @click="updateRenewalTracking" :disabled="savingTracking" class="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50">
              {{ savingTracking ? 'Saving...' : 'Save Tracking Info' }}
            </button>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import KpiCard from '@/components/shared/KpiCard.vue';
import Modal from '@/components/shared/Modal.vue';
import api, { companyService } from '@/services/api';

const loading = ref(false);
const lastSync = ref(new Date().toLocaleTimeString());
const stats = ref({
    total_staff: 0,
    expiring_qid: 0,
    expired_passport: 0
});

const recentCollections = ref([]);
const upcomingExpirations = ref([]);
const pendingUpdates = ref([]);
const showTrackingModal = ref(false);
const savingTracking = ref(false);
const finalizing = ref(false);
const selectedRenewal = ref(null);
const trackingForm = ref({
    renewal_status: 'processing',
    renewal_notes: ''
});

const icons = {
    users: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
    briefcase: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
    alert: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
    document: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`
};

const formatCurrency = (val) => {
  return parseFloat(val).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

const fetchDashboardData = async () => {
    loading.value = true;
    try {
        const res = await api.get('/dashboard');
        stats.value = res.data.stats;
        recentCollections.value = res.data.recentCollections;
        upcomingExpirations.value = res.data.upcomingExpirations || [];
        pendingUpdates.value = res.data.pendingUpdates || [];
        lastSync.value = new Date().toLocaleTimeString();
    } catch (err) {
        console.error('Failed to load dashboard data', err);
    } finally {
        loading.value = false;
    }
}

const viewCollectionDetails = async (collection) => {
    selectedCollection.value = collection;
    showCollectionModal.value = true;
    
    if (collection.company_id) {
        loadingDetails.value = true;
        try {
            const res = await companyService.getPendingCollections(collection.company_id);
            companyInfo.value = res.data.company;
            pendingCollections.value = res.data.pending_contracts;
        } catch (err) {
            console.error('Failed to fetch pending collections', err);
        } finally {
            loadingDetails.value = false;
        }
    } else {
        companyInfo.value = null;
        pendingCollections.value = [];
    }
};

const openTrackingModal = (renewal) => {
    selectedRenewal.value = renewal;
    trackingForm.value = {
        renewal_status: renewal.renewal_status || 'processing',
        renewal_notes: renewal.renewal_notes || ''
    };
    showTrackingModal.value = true;
};

const updateRenewalTracking = async () => {
    if (!selectedRenewal.value) return;
    
    savingTracking.value = true;
    try {
        await api.put(`/expenses/${selectedRenewal.value.id}`, {
            renewal_status: trackingForm.value.renewal_status,
            renewal_notes: trackingForm.value.renewal_notes
        });
        showTrackingModal.value = false;
        await fetchDashboardData();
    } catch (err) {
        console.error('Failed to update renewal tracking', err);
        alert('Failed to update status. Please ensure you have run the latest database migrations.');
    } finally {
        savingTracking.value = false;
    }
};

const finalizeRenewal = async () => {
    if (!selectedRenewal.value) return;
    if (!confirm('This will automatically update the staff record expiry date. Continue?')) return;
    
    finalizing.value = true;
    try {
        await api.post(`/expenses/${selectedRenewal.value.id}/finalize`);
        showTrackingModal.value = false;
        // Redirect to staff detail
        router.push(`/admin/staff/${selectedRenewal.value.staff_id}`);
    } catch (err) {
        console.error('Finalization failed', err);
        alert('Failed to finalize renewal');
    } finally {
        finalizing.value = false;
    }
};

onMounted(() => fetchDashboardData());
</script>