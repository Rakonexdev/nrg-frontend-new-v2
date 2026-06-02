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
    }
    return config;
});

// Handle authentication errors
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
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
    delete: (id) => api.delete(`/staff/${id}`),
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
    update: (id, data) => api.put(`/contracts/${id}`, data),
    delete: (id) => api.delete(`/contracts/${id}`),
    getPayments: (id) => api.get(`/contracts/${id}/payments`),
    addPayment: (id, data) => api.post(`/contracts/${id}/payments`, data),
    updatePayment: (contractId, paymentId, data) => api.put(`/contracts/${contractId}/payments/${paymentId}`, data),
    deletePayment: (contractId, paymentId) => api.delete(`/contracts/${contractId}/payments/${paymentId}`),
    addAdjustment: (id, data) => api.post(`/contracts/${id}/adjustments`, data),
    updateAdjustment: (contractId, adjustmentId, data) => api.put(`/contracts/${contractId}/adjustments/${adjustmentId}`, data),
    updateNextDueDate: (id, data) => api.put(`/contracts/${id}/next-due-date`, data)
};

export const expenseService = {
    getAll: (params) => api.get('/expenses', { params }),
    getById: (id) => api.get(`/expenses/${id}`),
    create: (data) => api.post('/expenses', data),
    update: (id, data) => api.put(`/expenses/${id}`, data),
    delete: (id) => api.delete(`/expenses/${id}`),
    export: (params) => api.get('/expenses/export', { params, responseType: 'blob' })
};

export const expenseCategoryService = {
    getAll: () => api.get('/expense-categories'),
    create: (data) => api.post('/expense-categories', data),
    update: (id, data) => api.put(`/expense-categories/${id}`, data),
    delete: (id) => api.delete(`/expense-categories/${id}`)
};

export const companyService = {
    getAll: (params) => api.get('/companies', { params }),
    getSimple: () => api.get('/companies', { params: { mode: 'simple' } }),
    getById: (id) => api.get(`/companies/${id}`),
    create: (data) => api.post('/companies', data),
    update: (id, data) => api.put(`/companies/${id}`, data),
    delete: (id) => api.delete(`/companies/${id}`),
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
    delete: (id) => api.delete(`/collectors/${id}`)
};

export const reportService = {
    getCollections: (params) => api.get('/reports/collections', { params }),
    exportCollections: (params) => api.get('/reports/collections/export', { params, responseType: 'blob' }),
    updateCollectionStatus: (id, status) => api.put(`/collections/${id}/status`, { status }),
    getIncomeExpenditure: (params) => api.get('/reports/income-expenditure', { params }),
    exportIncomeExpenditure: (params) => api.get('/reports/income-expenditure/export', { params, responseType: 'blob' }),
    getDocumentationStatus: (params) => api.get('/reports/documentation-status', { params })
};

export const branchService = {
    getAll: (companyId) => api.get(`/companies/${companyId}/branches`),
    create: (companyId, data) => api.post(`/companies/${companyId}/branches`, data),
    update: (branchId, data) => api.put(`/branches/${branchId}`, data),
    delete: (branchId) => api.delete(`/branches/${branchId}`)
};

export const roleService = {
    getAll: () => api.get('/roles'),
    getPermissions: () => api.get('/roles/permissions'),
    create: (data) => api.post('/roles', data),
    update: (id, data) => api.put(`/roles/${id}`, data),
    delete: (id) => api.delete(`/roles/${id}`)
};

export const adminUserService = {
    getAll: () => api.get('/admin-users'),
    create: (data) => api.post('/admin-users', data),
    update: (id, data) => api.put(`/admin-users/${id}`, data),
    delete: (id) => api.delete(`/admin-users/${id}`)
};

export const generalDocumentService = {
    getAll: (params) => api.get('/general-documents', { params }),
    upload: (data) => api.post('/general-documents', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/general-documents/${id}`),
    update: (id, data) => api.post(`/general-documents/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    download: (id) => api.get(`/general-documents/${id}/download`, { responseType: 'blob' })
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
    delete: (id) => api.delete(`/vehicles/${id}`)
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
    delete: (id) => api.delete(`/visa-applications/${id}`)
};

export default api;
