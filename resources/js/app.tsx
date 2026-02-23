import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import axios from 'axios';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

// Configurar Axios para enviar cookies automáticamente
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Configurar CSRF token automáticamente
const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token.getAttribute('content');
}

// Función para refrescar el token CSRF después de login/logout
export async function refreshCsrfToken() {
    const response = await fetch('/csrf-token');
    const data = await response.json();
    axios.defaults.headers.common['X-CSRF-TOKEN'] = data.csrf_token;
    // Si usas meta tag, actualízala también:
    const meta = document.querySelector('meta[name="csrf-token"]');
    if (meta) meta.setAttribute('content', data.csrf_token);
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        // @ts-expect-error: _reactRootContainer es una propiedad personalizada para evitar múltiples createRoot
        if (!el._reactRootContainer) {
            // @ts-expect-error: _reactRootContainer es una propiedad personalizada para evitar múltiples createRoot
            el._reactRootContainer = createRoot(el);
        }
        // @ts-expect-error: _reactRootContainer es una propiedad personalizada para evitar múltiples createRoot
        el._reactRootContainer.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
