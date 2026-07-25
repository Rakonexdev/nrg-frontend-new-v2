<template>
  <div class="min-h-screen bg-slate-50 relative">
    <!-- Time Expiration Warning Banner -->
    <div v-if="showTimeWarning" class="fixed top-0 left-0 right-0 z-[9999] bg-rose-600 text-white px-4 py-2 flex items-center justify-center gap-3 shadow-md">
      <svg class="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
      <span class="text-sm font-bold tracking-wide">Warning: Your access shift ends in {{ remainingMinutes }} minute(s). Please save your work!</span>
    </div>

    <div :class="{'pt-10': showTimeWarning}">
      <router-view />
    </div>
    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import Toast from '@/components/shared/Toast.vue';

const authStore = useAuthStore();
let sessionTimer = null;
const showTimeWarning = ref(false);
const remainingMinutes = ref(0);

onMounted(() => {
  sessionTimer = setInterval(() => {
    const user = authStore.user;
    if (!user) {
      showTimeWarning.value = false;
      return;
    }

    const email = (user.email || '').toLowerCase();
    const role = (user.role || (user.roles && user.roles[0] && user.roles[0].name) || '').toLowerCase().replace(/[\s-]/g, '_');
    const isSuperAdmin = authStore.isSuperAdmin || email.includes('super') || role.includes('super') || email === 'admin@nrg.local' || email === 'admin@nrg.com';

    if (isSuperAdmin || !user.allowed_login_shifts || !Array.isArray(user.allowed_login_shifts) || user.allowed_login_shifts.length === 0) {
      showTimeWarning.value = false;
      return;
    }
    
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;
    
    let isWithin = false;
    let minTimeRemaining = Infinity;
    
    for (const shift of user.allowed_login_shifts) {
      if (!shift.start || !shift.end) continue;
      
      const [startHours, startMinutes] = shift.start.split(':').map(Number);
      const [endHours, endMinutes] = shift.end.split(':').map(Number);
      
      const startTimeInMinutes = startHours * 60 + startMinutes;
      const endTimeInMinutes = endHours * 60 + endMinutes;
      
      if (startTimeInMinutes <= endTimeInMinutes) {
        if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes) {
          isWithin = true;
          const remaining = endTimeInMinutes - currentTimeInMinutes;
          if (remaining < minTimeRemaining) minTimeRemaining = remaining;
        }
      } else {
        // Overnight shift
        if (currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes <= endTimeInMinutes) {
          isWithin = true;
          let remaining = 0;
          if (currentTimeInMinutes >= startTimeInMinutes) {
             remaining = (24 * 60 - currentTimeInMinutes) + endTimeInMinutes;
          } else {
             remaining = endTimeInMinutes - currentTimeInMinutes;
          }
          if (remaining < minTimeRemaining) minTimeRemaining = remaining;
        }
      }
    }
    
    if (isWithin) {
      if (minTimeRemaining > 0 && minTimeRemaining <= 5) {
        remainingMinutes.value = minTimeRemaining;
        showTimeWarning.value = true;
      } else {
        showTimeWarning.value = false;
      }
    } else {
      showTimeWarning.value = false;
      // Time expired! Log out automatically.
      authStore.token = null;
      authStore.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?expired=1';
    }
  }, 10000); // Check every 10 seconds
});

onUnmounted(() => {
  if (sessionTimer) clearInterval(sessionTimer);
});
</script>