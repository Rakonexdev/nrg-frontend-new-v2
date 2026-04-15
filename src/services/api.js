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

export const staffService = {
    getAll: (params) => api.get('/staff', { params }),
    getById: (id) => api.get(`/staff/${id}`),
    create: (data) => api.post('/staff', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => api.post(`/staff/${id}`, { ...data, _method: 'PUT' }, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/staff/${id}`),
    getDocuments: (id) => api.get(`/staff/${id}/documents`),
    uploadDocuments: (id, data) => api.post(`/staff/${id}/documents`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};

export const companyService = {
    getAll: (params) => api.get('/companies', { params }),
    getById: (id) => api.get(`/companies/${id}`),
    create: (data) => api.post('/companies', data),
    update: (id, data) => api.put(`/companies/${id}`, data),
    delete: (id) => api.delete(`/companies/${id}`)
};

export const contractService = {
    getAll: (params) => api.get('/contracts', { params }),
    getById: (id) => api.get(`/contracts/${id}`),
    create: (data) => api.post('/contracts', data),
    update: (id, data) => api.put(`/contracts/${id}`, data),
    delete: (id) => api.delete(`/contracts/${id}`),
    getPayments: (id) => api.get(`/contracts/${id}/payments`),
    addPayment: (id, data) => api.post(`/contracts/${id}/payments`, data),
    deletePayment: (contractId, paymentId) => api.delete(`/contracts/${contractId}/payments/${paymentId}`)
};

export const expenseService = {
    getAll: (params) => api.get('/expenses', { params }),
    getById: (id) => api.get(`/expenses/${id}`),
    create: (data) => api.post('/expenses', data),
    update: (id, data) => api.put(`/expenses/${id}`, data),
    delete: (id) => api.delete(`/expenses/${id}`)
};

export const expenseCategoryService = {
    getAll: () => api.get('/expense-categories'),
    create: (data) => api.post('/expense-categories', data),
    update: (id, data) => api.put(`/expense-categories/${id}`, data),
    delete: (id) => api.delete(`/expense-categories/${id}`)
};

export default api;
