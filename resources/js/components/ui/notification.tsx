import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface NotificationProps {
    message: string;
    type: 'error' | 'success' | 'info';
    onClose: () => void;
    duration?: number;
}

export function Notification({ message, type, onClose, duration = 5000 }: NotificationProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'error':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'info':
                return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'error':
                return 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800';
            case 'success':
                return 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800';
            case 'info':
                return 'bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800';
        }
    };

    return (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg border p-4 shadow-lg transition-all ${getBgColor()}`}>
            {getIcon()}
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{message}</p>
            <button
                onClick={onClose}
                className="ml-auto flex-shrink-0 rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

// Hook para manejar notificaciones
export function useNotifications() {
    const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: 'error' | 'success' | 'info' }>>([]);

    const addNotification = (message: string, type: 'error' | 'success' | 'info') => {
        const id = Math.random().toString(36).substring(7);
        setNotifications(prev => [...prev, { id, message, type }]);
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const NotificationContainer = () => (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {notifications.map(notification => (
                <Notification
                    key={notification.id}
                    message={notification.message}
                    type={notification.type}
                    onClose={() => removeNotification(notification.id)}
                />
            ))}
        </div>
    );

    return {
        addNotification,
        NotificationContainer
    };
}
