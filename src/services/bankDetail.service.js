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
        let formData;
        if (data instanceof FormData) {
            formData = data;
        } else {
            formData = new FormData();
            for (const key in data) {
                if (data[key] !== null && data[key] !== undefined) {
                    formData.append(key, data[key]);
                }
            }
        }
        if (!formData.has('_method')) {
            formData.append('_method', 'PUT');
        }
        return api.post(`/bank-details/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    delete(id) {
        return api.post(`/bank-details/${id}/delete`);
    }
};
