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
                           <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Start Contract Date</p>
                           <p class="text-lg font-black text-slate-800 dark:text-white">{{ formatDate(staff.joining_date || staff.created_at) }}</p>
                       </div>
                    </div>

                    <div class="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 flex items-center gap-5">
                       <div class="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-rose-500">
                           <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                       </div>
                       <div>
                           <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">QID Expiry</p>
                           <p class="text-lg font-black text-slate-800 dark:text-white">{{ formatDate(staff.qid_expiry) }}</p>
                           <span v-if="staff.qid_expiry" class="text-[8px] font-bold text-rose-500 uppercase tracking-tight">
                               {{ getDaysDiff(staff.qid_expiry) }} Days Left
                           </span>
                       </div>
                    </div>

                    <div class="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 flex items-center gap-5">
                       <div class="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-amber-500">
                           <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                       </div>
                       <div>
                           <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Passport Expiry</p>
                           <p class="text-lg font-black text-slate-800 dark:text-white">{{ formatDate(staff.passport_expiry) }}</p>
                           <span v-if="staff.passport_expiry" class="text-[8px] font-bold text-amber-500 uppercase tracking-tight">
                               {{ getDaysDiff(staff.passport_expiry) }} Days Left
                           </span>
                       </div>
                    </div>
                </div>

                </div>

                <!-- Company Details Insert -->
                <div v-if="staff.company_name" class="mt-8 p-8 bg-teal-50 dark:bg-teal-900/20 rounded-[2rem] border border-teal-100 dark:border-teal-800/50">
                    <h4 class="text-xs font-black text-teal-800 dark:text-teal-300 uppercase tracking-[0.2em] mb-4">Company Allocation</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p class="text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-1">Company Name</p>
                            <p class="text-sm font-black text-slate-800 dark:text-white">{{ staff.company_name }}</p>
                        </div>
                        <div v-if="staff.branch_name">
                            <p class="text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-1">Assigned Branch</p>
                            <p class="text-sm font-black text-slate-800 dark:text-white">
                                {{ staff.branch_name }}
                                <span v-if="staff.branch_number" class="text-blue-500 ml-1">#{{ staff.branch_number }}</span>
                            </p>
                        </div>
                        <div v-if="staff.company_contact_person">
                            <p class="text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-1">Contact Person</p>
                            <p class="text-sm font-black text-slate-800 dark:text-white">{{ staff.company_contact_person }}</p>
                        </div>
                        <div v-if="staff.company_phone">
                            <p class="text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-1">Contact Phone</p>
                            <p class="text-sm font-black text-slate-800 dark:text-white">{{ staff.company_phone }}</p>
                        </div>
                    </div>
                </div>

                <!-- Digital Document Repository -->
                <div class="mt-8 space-y-6">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                        </div>
                        <div>
                            <h4 class="text-lg font-black text-slate-800 dark:text-white tracking-tight">Digital Document Repository</h4>
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Latest uploaded QID & Passport scans</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- QID Preview -->
                        <div class="group relative bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden aspect-[4/3] flex items-center justify-center">
                            <template v-if="getLatestDoc('qid')">
                                <img v-if="isImage(getLatestDoc('qid').url)" :src="getFileUrl(getLatestDoc('qid').url)" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="QID Scan">
                                <div v-else class="text-center space-y-3">
                                    <div class="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
                                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                                    </div>
                                    <p class="text-[10px] font-black uppercase tracking-widest text-blue-600">PDF Document</p>
                                </div>
                                <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                    <a :href="getFileUrl(getLatestDoc('qid').url)" target="_blank" class="w-full py-3 bg-white/20 backdrop-blur-md rounded-xl text-white font-black text-[10px] uppercase tracking-widest text-center hover:bg-white/30 transition-colors">View Document</a>
                                </div>
                            </template>
                            <div v-else class="text-center space-y-3 opacity-40">
                                <svg class="w-12 h-12 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                                <p class="text-[10px] font-black uppercase tracking-widest">No QID Scan Uploaded</p>
                            </div>
                            <div class="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                                <span class="text-[9px] font-black text-slate-800 dark:text-white uppercase tracking-widest">QID Document</span>
                            </div>
                        </div>

                        <!-- Passport Preview -->
                        <div class="group relative bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden aspect-[4/3] flex items-center justify-center">
                            <template v-if="getLatestDoc('passport')">
                                <img v-if="isImage(getLatestDoc('passport').url)" :src="getFileUrl(getLatestDoc('passport').url)" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Passport Scan">
                                <div v-else class="text-center space-y-3">
                                    <div class="w-16 h-16 mx-auto bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center text-rose-600">
                                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                                    </div>
                                    <p class="text-[10px] font-black uppercase tracking-widest text-rose-600">PDF Document</p>
                                </div>
                                <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                    <a :href="getFileUrl(getLatestDoc('passport').url)" target="_blank" class="w-full py-3 bg-white/20 backdrop-blur-md rounded-xl text-white font-black text-[10px] uppercase tracking-widest text-center hover:bg-white/30 transition-colors">View Document</a>
                                </div>
                            </template>
                            <div v-else class="text-center space-y-3 opacity-40">
                                <svg class="w-12 h-12 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                                <p class="text-[10px] font-black uppercase tracking-widest">No Passport Scan Uploaded</p>
                            </div>
                            <div class="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                                <span class="text-[9px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Passport Document</span>
                            </div>
                        </div>
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

const getLatestDoc = (type) => {
    if (!staff.value) return null;
    const docs = type === 'qid' ? staff.value.qid_documents : staff.value.passport_documents;
    if (!docs || docs.length === 0) return null;
    // They are usually returned in order, so pick the last one
    return docs[docs.length - 1];
};

const getFileUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
};

const isImage = (path) => {
    if (!path) return false;
    const cleanPath = path.split('?')[0]; // Remove query params if any
    const ext = cleanPath.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
};

const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getDaysDiff = (date) => {
    if (!date) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(date);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

onMounted(fetchStaff);
</script>
