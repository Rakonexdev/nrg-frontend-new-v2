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
    userRole: (state) => state.user?.role,
    isSuperAdmin: (state) => state.user?.role === 'super_admin',
    userPermissions: (state) => state.user?.permissions || [],
    hasPermission: (state) => (permission) => {
      // Super admin has all permissions
      if (state.user?.role === 'super_admin') return true;
      return (state.user?.permissions || []).includes(permission);
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