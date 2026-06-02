import api from './api';

export default {
    getAll(params = {}) {
        return api.get('/bank-details', { params });
    },

    getById(id) {
        return api.get(`/bank-details/${id}`);
    },

    create(data) {
        if (data instanceof FormData) {
            return api.post('/bank-details', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.post('/bank-details', data);
    },

    update(id, data) {
        if (data instanceof FormData) {
            data.append('_method', 'PUT');
            return api.post(`/bank-details/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.put(`/bank-details/${id}`, data);
    },

    delete(id) {
        return api.delete(`/bank-details/${id}`);
    }
};
