import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export type ToastType = 'error' | 'info' | 'success' | 'warning';

const TOAST_BY_TYPE = {
    error: toast.error,
    info: toast.info,
    success: toast.success,
    warning: toast.warning,
} as const;

export function showToast(message: string, type: ToastType = 'info') {
    if (!message) {
        return;
    }

    TOAST_BY_TYPE[type](message);
}

export function useToastMessage(message: string | null | undefined, type: ToastType = 'info') {
    const lastMessageRef = useRef<string | null>(null);

    useEffect(() => {
        if (!message) {
            lastMessageRef.current = null;
            return;
        }

        if (lastMessageRef.current === message) {
            return;
        }

        lastMessageRef.current = message;
        showToast(message, type);
    }, [message, type]);
}

export function useToastSignal(active: boolean, message: string, type: ToastType = 'info') {
    const wasShownRef = useRef(false);

    useEffect(() => {
        if (!active) {
            wasShownRef.current = false;
            return;
        }

        if (wasShownRef.current) {
            return;
        }

        wasShownRef.current = true;
        showToast(message, type);
    }, [active, message, type]);
}
