import { defineStore } from 'pinia';
import axios from '@/utils/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => {
      const email = (state.user?.email || '').toLowerCase();
      if (email.includes('superadmin') || email === 'admin@nrg.local' || email === 'admin@nrg.com' || email === 'admin@nrgqatar.com') {
        return 'super_admin';
      }
      return state.user?.role || 'user';
    },
    isSuperAdmin: (state) => {
      if (!state.user) return false;
      const email = (state.user.email || '').toLowerCase();
      if (email.includes('superadmin') || email === 'admin@nrg.local' || email === 'admin@nrg.com' || email === 'admin@nrgqatar.com') return true;
      const role = (state.user.role || '').toLowerCase().replace(/[\s-]/g, '_');
      if (role === 'super_admin' || role === 'superadmin' || role === 'super_administrator') return true;
      if (state.user.roles && state.user.roles.some(r => {
        const rName = (r.name || '').toLowerCase().replace(/[\s-]/g, '_');
        return rName === 'super_admin' || rName === 'superadmin' || rName === 'super_administrator';
      })) return true;
      return false;
    },
    userPermissions: (state) => state.user?.permissions || [],
    hasPermission: (state) => (permission) => {
      if (!state.user) return false;
      const email = (state.user.email || '').toLowerCase();
      const role = (state.user.role || '').toLowerCase().replace(/[\s-]/g, '_');
      const hasSuperRole = state.user.roles && state.user.roles.some(r => {
        const rName = (r.name || '').toLowerCase().replace(/[\s-]/g, '_');
        return rName === 'super_admin' || rName === 'superadmin' || rName === 'super_administrator';
      });
      const checkSuper = email.includes('superadmin') || email === 'admin@nrg.local' || email === 'admin@nrg.com' || email === 'admin@nrgqatar.com' || role === 'super_admin' || role === 'superadmin' || role === 'super_administrator' || hasSuperRole;

      if (checkSuper) return true;
      return (state.user.permissions || []).includes(permission);
    }
  },
  
  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.post('/auth/login', credentials);
        this.token = response.data.token;
        this.user = response.data.user;
        
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        return true;
      } catch (err) {
        this.error = err.response?.data?.message || 'Login failed. Please check your credentials.';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async refreshUser() {
      try {
        const response = await axios.get('/auth/me');
        this.user = response.data;
        localStorage.setItem('user', JSON.stringify(this.user));
      } catch (err) {
        console.error('Failed to refresh user data', err);
      }
    },
    
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }
});