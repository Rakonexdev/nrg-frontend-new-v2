import api from './api';

export default {
    getAll() {
        return api.get('/bank-details');
    },

    getById(id) {
        return api.get(`/bank-details/${id}`);
    },

    create(data) {
        return api.post('/bank-details', data);
    },

    update(id, data) {
        return api.put(`/bank-details/${id}`, data);
    },

    delete(id) {
        return api.delete(`/bank-details/${id}`);
    }
};
