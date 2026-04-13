<template>
  <div class="space-y-8 animate-fade-in">
    <div class="flex items-center gap-4">
        <router-link to="/admin/staff" class="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
            <svg class="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </router-link>
        <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Staff Member Profile</h1>
    </div>

    <div v-if="loading" class="flex justify-center p-20">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
    </div>

    <div v-else-if="staff" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Profile Card -->
        <div class="lg:col-span-1 space-y-8">
            <div class="glass p-8 rounded-[2.5rem] text-center relative overflow-hidden group">
                <div class="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
                <div class="absolute top-0 right-0 p-6">
                    <span :class="[
                        'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
                        staff.status === 'active' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'
                    ]">{{ staff.status || 'Active' }}</span>
                </div>
                <div class="w-32 h-32 bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-[2.2rem] mx-auto flex items-center justify-center text-white text-4xl font-black mb-6 shadow-2xl shadow-blue-500/40 transform group-hover:rotate-6 transition-transform duration-500">
                    {{ staff.name ? staff.name[0] : (staff.first_name ? staff.first_name[0] : '?') }}
                </div>
                <h2 class="text-2xl font-black text-slate-800 dark:text-white">{{ staff.name || (staff.first_name + ' ' + staff.last_name) }}</h2>
                <p class="text-blue-600 dark:text-blue-400 font-black uppercase text-[10px] tracking-[0.2em] mt-3 mb-8 bg-blue-50 dark:bg-blue-900/20 py-2 px-4 rounded-xl inline-block">{{ staff.profession || staff.designation || 'Staff Member' }}</p>
                
                <div class="space-y-3">
                    <div class="flex items-center gap-4 px-5 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl text-left border border-slate-100 dark:border-slate-700/50 hover:border-blue-500/30 transition-colors group/item">
                        <div class="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover/item:text-blue-500 transition-colors shadow-sm">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 5z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mobile Number</span>
                            <span class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ staff.mobile || staff.personal_number || 'N/A' }}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-4 px-5 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl text-left border border-slate-100 dark:border-slate-700/50 hover:border-indigo-500/30 transition-colors group/item">
                        <div class="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover/item:text-indigo-500 transition-colors shadow-sm">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nationality</span>
                            <span class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ staff.nationality || 'Qatar' }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="glass p-8 rounded-[2.5rem] space-y-6">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 font-bold text-xs">!</div>
                    <h3 class="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">Emergency Information</h3>
                </div>
                <div class="space-y-4">
                    <div class="flex flex-col gap-1 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Person</span>
                        <span class="text-sm font-black text-slate-700 dark:text-white capitalize">{{ staff.emergency_contact_name || 'Relative' }}</span>
                    </div>
                    <div class="flex flex-col gap-1 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Phone</span>
                        <span class="text-sm font-black text-slate-700 dark:text-white">{{ staff.emergency_contact_number || 'N/A' }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Column: Details & Actions -->
        <div class="lg:col-span-2 space-y-8">
            <div class="glass p-10 rounded-[2.5rem] relative overflow-hidden">
                <div class="flex items-center justify-between mb-10">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                        </div>
                        <div>
                            <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Professional Dossier</h3>
                            <p class="text-xs font-bold text-slate-400 tracking-wide uppercase mt-0.5">Comprehensive Identity & Work History</p>
                        </div>
                    </div>
                    <button class="px-8 py-3 bg-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-xs shadow-xl transition-all hover:-translate-y-1 active:scale-95">Edit Profile</button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div class="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 flex items-center gap-5">
                       <div class="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-indigo-500">
                           <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                       </div>
                       <div>
                           <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">QID Number</p>
                           <p class="text-lg font-black text-slate-800 dark:text-white">{{ staff.qid_number || staff.nid_passport || 'None' }}</p>
                       </div>
                    </div>

                    <div class="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 flex items-center gap-5">
                       <div class="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-blue-500">
                           <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                       </div>
                       <div>
                           <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Joining Date</p>
                           <p class="text-lg font-black text-slate-800 dark:text-white">{{ formatDate(staff.joining_date || staff.created_at) }}</p>
                       </div>
                    </div>

                    <div class="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 flex items-center gap-5">
                       <div class="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-teal-500">
                           <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                       </div>
                       <div>
                           <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Passport Number</p>
                           <p class="text-lg font-black text-slate-800 dark:text-white">{{ staff.passport_number || 'N/A' }}</p>
                       </div>
                    </div>

                    <div class="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 flex items-center gap-5">
                       <div class="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-amber-500">
                           <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                       </div>
                       <div>
                           <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Employee Status</p>
                           <p class="text-lg font-black text-slate-800 dark:text-white capitalize">{{ staff.status || 'Verified' }}</p>
                       </div>
                    </div>
                </div>

                <div class="mt-12 p-8 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] border-2 border-dashed border-blue-200 dark:border-blue-800/50">
                    <h4 class="text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-[0.2em] mb-4">Internal System Notes</h4>
                    <p class="text-sm text-blue-600 dark:text-blue-400 font-bold leading-relaxed italic">"Premium profile verification completed. All identity documents are currently up to date. Security clearance approved for site operations."</p>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';

const route = useRoute();
const staff = ref(null);
const loading = ref(true);

const fetchStaff = async () => {
    try {
        const response = await api.get(`/staff/${route.params.id}`);
        staff.value = response.data.data;
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
};

const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
};

onMounted(fetchStaff);
</script>
