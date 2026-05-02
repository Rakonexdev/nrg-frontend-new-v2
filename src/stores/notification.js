import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
    const notifications = ref([]);

    const addNotification = (message, type = 'success', duration = 3000) => {
        const id = Date.now();
        notifications.value.push({
            id,
            message,
            type,
        });

        setTimeout(() => {
            removeNotification(id);
        }, duration);
    };

    const removeNotification = (id) => {
        notifications.value = notifications.value.filter(n => n.id !== id);
    };

    const success = (message) => addNotification(message, 'success');
    const error = (message) => addNotification(message, 'error');

    return {
        notifications,
        addNotification,
        removeNotification,
        success,
        error
    };
});
