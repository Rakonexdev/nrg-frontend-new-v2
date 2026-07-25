import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['X-Authorization'] = `Bearer ${token}`;
  }
  if (config.method?.toLowerCase() === 'delete') {
    config.headers['X-HTTP-Method-Override'] = 'DELETE';
  }
  return config;
});

// Track if we are already redirecting to prevent loops
let isRedirecting = false;

instance.interceptors.response.use(response => response, error => {
  if (isRedirecting) {
    return Promise.reject(error);
  }

  if (error.response?.status === 401) {
    // Check if user is Super Admin — don't force logout
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const email = (user?.email || '').toLowerCase();
        const role = (user?.role || '').toLowerCase().replace(/[\s-]/g, '_');
        const isSuperAdmin = email.includes('superadmin') || email === 'admin@nrg.local' || email === 'admin@nrg.com' || email === 'admin@nrgqatar.com' || role === 'super_admin' || role === 'superadmin';

        if (isSuperAdmin) {
          console.warn('[axios] 401 received for Super Admin — NOT redirecting.');
          return Promise.reject(error);
        }
      } catch (e) {
        // fall through
      }
    }

    isRedirecting = true;
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export default instance;
