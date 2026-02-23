import { useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system' | 'blue' | 'green';

const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

const applyTheme = (appearance: Appearance) => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-blue', 'theme-green');

    if (appearance === 'dark') {
        root.classList.add('dark');
    } else if (appearance === 'blue') {
        root.classList.add('theme-blue');
    } else if (appearance === 'green') {
        root.classList.add('theme-green');
    } else if (appearance === 'system') {
        const isDark = prefersDark();
        root.classList.toggle('dark', isDark);
    }
};

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

const handleSystemThemeChange = () => {
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    applyTheme(currentAppearance || 'system');
};

export function initializeTheme() {
    const savedAppearance = (localStorage.getItem('appearance') as Appearance) || 'system';
    applyTheme(savedAppearance);
    mediaQuery.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('system');

    const updateAppearance = (mode: Appearance) => {
        setAppearance(mode);
        localStorage.setItem('appearance', mode);
        applyTheme(mode);
    };

    useEffect(() => {
        const savedAppearance = localStorage.getItem('appearance') as Appearance | null;
        updateAppearance(savedAppearance || 'system');

        return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }, []);

    return { appearance, updateAppearance };
}
