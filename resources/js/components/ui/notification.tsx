import { useCallback } from 'react';
import { showToast, type ToastType } from '@/lib/toast';

type NotificationType = Extract<ToastType, 'error' | 'info' | 'success'>;

function NotificationContainer() {
    return null;
}

export function useNotifications() {
    const addNotification = useCallback((message: string, type: NotificationType) => {
        showToast(message, type);
    }, []);

    return {
        addNotification,
        NotificationContainer,
    };
}
