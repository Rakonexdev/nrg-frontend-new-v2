import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use(config => {
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

// Track if we are already redirecting to prevent infinite loops
let isRedirecting = false;

// Handle authentication errors
api.interceptors.response.use(
    response => response,
    error => {
        // Don't redirect if we're already in the process of redirecting
        if (isRedirecting) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401) {
            // Check if this is a Super Admin user — don't force logout Super Admins
            // because 401 might be caused by Apache stripping the Authorization header
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    const email = (user?.email || '').toLowerCase();
                    const role = (user?.role || '').toLowerCase().replace(/[\s-]/g, '_');
                    const isSuperAdmin = email.includes('superadmin') || email === 'admin@nrg.local' || email === 'admin@nrg.com' || email === 'admin@nrgqatar.com' || role === 'super_admin' || role === 'superadmin';

                    if (isSuperAdmin) {
                        // Don't redirect Super Admin — the 401 is likely a server
                        // misconfiguration stripping the Authorization header
                        console.warn('[API] 401 received for Super Admin user — NOT redirecting to login. The server may be stripping the Authorization header.');
                        return Promise.reject(error);
                    }
                } catch (e) {
                    // JSON parse error — fall through to redirect
                }
            }

            isRedirecting = true;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        } else if (error.response?.status === 403 && (error.response?.data?.message?.includes('shift time') || error.response?.data?.message?.includes('access time'))) {
            // Check if the user is a Super Admin — shift time restrictions don't apply
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    const email = (user?.email || '').toLowerCase();
                    const role = (user?.role || '').toLowerCase().replace(/[\s-]/g, '_');
                    const isSuperAdmin = email.includes('superadmin') || email === 'admin@nrg.local' || email === 'admin@nrg.com' || email === 'admin@nrgqatar.com' || role === 'super_admin' || role === 'superadmin';

                    if (isSuperAdmin) {
                        console.warn('[API] 403 shift time restriction received for Super Admin — ignoring.');
                        return Promise.reject(error);
                    }
                } catch (e) {
                    // fall through
                }
            }

            isRedirecting = true;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login?expired=1';
        }
        return Promise.reject(error);
    }
);

export const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

export const staffService = {
    getAll: (params) => api.get('/staff', { params }),
    getSimple: (params) => api.get('/staff', { params: { ...params, mode: 'simple' } }),
    getById: (id) => api.get(`/staff/${id}`),
    getCompanies: () => api.get('/companies'),
    create: (data) => api.post('/staff', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => {
        if (data instanceof FormData) {
            data.append('_method', 'PUT');
            return api.post(`/staff/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.put(`/staff/${id}`, data);
    },
    delete: (id) => api.post(`/staff/${id}/delete`),
    getDocuments: (id) => api.get(`/staff/${id}/documents`),
    uploadDocuments: (id, data) => api.post(`/staff/${id}/documents`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};

export const contractService = {
    getAll: (params) => api.get('/contracts', { params }),
    getSummary: () => api.get('/contracts/summary'),
    getById: (id) => api.get(`/contracts/${id}`),
    create: (data) => api.post('/contracts', data),
    update: (id, data) => {
        if (data instanceof FormData) {
            if (!data.has('_method')) data.append('_method', 'PUT');
            return api.post(`/contracts/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.post(`/contracts/${id}`, data);
    },
    delete: (id) => api.post(`/contracts/${id}/delete`),
    getPayments: (id) => api.get(`/contracts/${id}/payments`),
    addPayment: (id, data) => api.post(`/contracts/${id}/payments`, data),
    updatePayment: (contractId, paymentId, data) => api.post(`/contracts/${contractId}/payments/${paymentId}?_method=PUT`, data, { headers: { 'X-HTTP-Method-Override': 'PUT' } }),
    deletePayment: (contractId, paymentId) => api.post(`/contracts/${contractId}/payments/${paymentId}?_method=DELETE`, {}, { headers: { 'X-HTTP-Method-Override': 'DELETE' } }),
    addAdjustment: (id, data) => api.post(`/contracts/${id}/adjustments`, data),
    updateAdjustment: (contractId, adjustmentId, data) => api.post(`/contracts/${contractId}/adjustments/${adjustmentId}`, data),
    updateNextDueDate: (id, data) => api.post(`/contracts/${id}/next-due-date`, data)
};

export const expenseService = {
    getAll: (params) => api.get('/expenses', { params }),
    getById: (id) => api.get(`/expenses/${id}`),
    create: (data) => {
        if (data instanceof FormData) {
            return api.post('/expenses', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.post('/expenses', data);
    },
    update: (id, data) => {
        if (data instanceof FormData) {
            data.append('_method', 'PUT');
            return api.post(`/expenses/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.put(`/expenses/${id}`, data);
    },
    delete: (id) => api.post(`/expenses/${id}/delete`),
    export: (params) => api.get('/expenses/export', { params, responseType: 'blob' })
};

export const expenseCategoryService = {
    getAll: () => api.get('/expense-categories'),
    create: (data) => api.post('/expense-categories', data),
    update: (id, data) => api.put(`/expense-categories/${id}`, data),
    delete: (id) => api.post(`/expense-categories/${id}/delete`)
};

export const companyService = {
    getAll: (params) => api.get('/companies', { params }),
    getSimple: () => api.get('/companies', { params: { mode: 'simple' } }),
    getById: (id) => api.get(`/companies/${id}`),
    create: (data) => api.post('/companies', data),
    update: (id, data) => {
        if (data instanceof FormData) {
            if (!data.has('_method')) data.append('_method', 'PUT');
            return api.post(`/companies/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.post(`/companies/${id}`, data);
    },
    delete: (id) => api.post(`/companies/${id}/delete`),
    getPendingCollections: (id) => api.get(`/companies/${id}/pending-collections`)
};

export const collectorService = {
    // Operations for collector mobile app
    getPendingCollections: () => api.get('/collections/pending'),
    recordPayment: (contractId, data) => api.post(`/contracts/${contractId}/payments`, data),

    // CRUD operations for admin management
    getAll: (params) => api.get('/collectors', { params }),
    getById: (id) => api.get(`/collectors/${id}`),
    create: (data) => api.post('/collectors', data),
    update: (id, data) => api.put(`/collectors/${id}`, data),
    delete: (id) => api.post(`/collectors/${id}/delete`)
};

export const reportService = {
    getCollections: (params) => api.get('/reports/collections', { params }),
    exportCollections: (params) => api.get('/reports/collections/export', { params, responseType: 'blob' }),
    updateCollectionStatus: (id, status) => api.post(`/collections/${id}/status?_method=PUT`, { status }, { headers: { 'X-HTTP-Method-Override': 'PUT' } }),
    getIncomeExpenditure: (params) => api.get('/reports/income-expenditure', { params }),
    exportIncomeExpenditure: (params) => api.get('/reports/income-expenditure/export', { params, responseType: 'blob' }),
    getDocumentationStatus: (params) => api.get('/reports/documentation-status', { params })
};

export const branchService = {
    getAll: (companyId) => api.get(`/companies/${companyId}/branches`),
    create: (companyId, data) => api.post(`/companies/${companyId}/branches`, data),
    update: (branchId, data) => api.put(`/branches/${branchId}`, data),
    delete: (branchId) => api.post(`/branches/${branchId}/delete`)
};

export const roleService = {
    getAll: () => api.get('/roles'),
    getPermissions: () => api.get('/roles/permissions'),
    create: (data) => api.post('/roles', data),
    update: (id, data) => api.post(`/roles/${id}`, data),
    delete: (id) => api.post(`/roles/${id}/delete`)
};

export const adminUserService = {
    getAll: () => api.get('/admin-users'),
    create: (data) => api.post('/admin-users', data),
    update: (id, data) => api.put(`/admin-users/${id}`, data),
    delete: (id) => api.post(`/admin-users/${id}/delete`)
};

export const generalDocumentService = {
    getAll: (params) => api.get('/general-documents', { params }),
    upload: (data) => api.post('/general-documents', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.post(`/general-documents/${id}/delete`),
    update: (id, data) => api.post(`/general-documents/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    download: (id) => api.get(`/general-documents/${id}/download`, { responseType: 'blob' })
};

export const officialFormatService = {
    getAll: (params) => api.get('/official-formats', { params }),
    upload: (data) => api.post('/official-formats', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.post(`/official-formats/${id}/delete`),
    update: (id, data) => api.post(`/official-formats/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    download: (id) => api.get(`/official-formats/${id}/download`, { responseType: 'blob' })
};

export const vehicleService = {
    getAll: (params) => api.get('/vehicles', { params }),
    getById: (id) => api.get(`/vehicles/${id}`),
    create: (data) => {
        if (data instanceof FormData) {
            return api.post('/vehicles', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.post('/vehicles', data);
    },
    update: (id, data) => {
        if (data instanceof FormData) {
            data.append('_method', 'PUT');
            return api.post(`/vehicles/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.put(`/vehicles/${id}`, data);
    },
    delete: (id) => api.post(`/vehicles/${id}/delete`)
};

export const visaApplicationService = {
    getAll: (params) => api.get('/visa-applications', { params }),
    getById: (id) => api.get(`/visa-applications/${id}`),
    create: (data) => {
        if (data instanceof FormData) {
            return api.post('/visa-applications', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.post('/visa-applications', data);
    },
    update: (id, data) => {
        if (data instanceof FormData) {
            data.append('_method', 'PUT');
            return api.post(`/visa-applications/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.put(`/visa-applications/${id}`, data);
    },
    delete: (id) => api.post(`/visa-applications/${id}/delete`),
    addPayment: (id, data) => api.post(`/visa-applications/${id}/payments`, data),
    updatePayment: (applicationId, paymentId, data) => api.post(`/visa-applications/${applicationId}/payments/${paymentId}?_method=PUT`, data, { headers: { 'X-HTTP-Method-Override': 'PUT' } }),
    deletePayment: (applicationId, paymentId) => api.post(`/visa-applications/${applicationId}/payments/${paymentId}/delete`, {}, { headers: { 'X-HTTP-Method-Override': 'DELETE' } })
};

export const companyVisaService = {
    getAll: (params) => api.get('/company-visas', { params }),
    getById: (id) => api.get(`/company-visas/${id}`),
    create: (data) => api.post('/company-visas', data),
    update: (id, data) => api.post(`/company-visas/${id}`, data),
    delete: (id) => api.post(`/company-visas/${id}/delete`)
};

export default api;
