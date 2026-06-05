import api from './api';

export default {
    getAll(params) {
        return api.get('/sponsorship-changes', { params })
    },
    get(id) {
        return api.get(`/sponsorship-changes/${id}`)
    },
    create(data) {
        return api.post('/sponsorship-changes', data)
    },
    update(id, data) {
        return api.put(`/sponsorship-changes/${id}`, data)
    },
    delete(id) {
        return api.delete(`/sponsorship-changes/${id}`)
    },
    
    // Payment methods
    addPayment(id, paymentData) {
        return api.post(`/sponsorship-changes/${id}/payments`, paymentData)
    },
    updatePayment(sponsorshipId, paymentId, paymentData) {
        return api.put(`/sponsorship-changes/${sponsorshipId}/payments/${paymentId}`, paymentData)
    },
    deletePayment(sponsorshipId, paymentId) {
        return api.delete(`/sponsorship-changes/${sponsorshipId}/payments/${paymentId}`)
    }
}
