import { router } from '@inertiajs/react';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { backendJson } from '@/lib/http';
import { showToast } from '@/lib/toast';

interface FavoritesContextType {
    favoriteIds: number[];
    isLoading: boolean;
    isInitialized: boolean;
    isFavorite: (mascotaId: number) => boolean;
    toggleFavorite: (mascotaId: number) => Promise<void>;
    addToFavorites: (mascotaId: number) => Promise<void>;
    removeFromFavorites: (mascotaId: number) => Promise<void>;
    refreshFavorites: () => Promise<void>;
    showNotification?: (message: string, type: 'error' | 'success' | 'info') => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Helper function para manejar errores de autenticación
const handleAuthError = () => {
    // Guardar la URL actual para redirigir después del login
    sessionStorage.setItem('intended_url', window.location.pathname);
    // Redirigir al login
    router.visit('/login');
};

export function FavoritesProvider({
    children,
    showNotification,
}: {
    children: React.ReactNode;
    showNotification?: (message: string, type: 'error' | 'success' | 'info') => void;
}) {
    const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const notify = useCallback(
        (message: string, type: 'error' | 'success' | 'info') => {
            if (showNotification) {
                showNotification(message, type);
                return;
            }

            showToast(message, type);
        },
        [showNotification],
    );

    // Set para búsquedas más rápidas
    const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

    const refreshFavorites = useCallback(async () => {
        try {
            setIsLoading(true);
            const { response, data } = await backendJson<{ favorite_ids?: number[]; authenticated?: boolean }>('/favoritos/ids');

            if (response.status === 401 || data?.authenticated === false) {
                setFavoriteIds([]);
                return;
            }

            if (response.ok && data) {
                setFavoriteIds(data.favorite_ids || []);
            } else {
                setFavoriteIds([]);
            }
        } catch {
            setFavoriteIds([]);
        } finally {
            setIsLoading(false);
            setIsInitialized(true);
        }
    }, []);

    // Cargar favoritos al inicializar el contexto
    useEffect(() => {
        refreshFavorites();
    }, [refreshFavorites]);

    const isFavorite = useCallback(
        (mascotaId: number): boolean => {
            return favoriteSet.has(mascotaId);
        },
        [favoriteSet],
    );

    const addToFavorites = useCallback(
        async (mascotaId: number) => {
            // Evitar duplicados y llamadas innecesarias
            if (favoriteSet.has(mascotaId) || isLoading) return;

            // Actualización optimista - actualizar UI inmediatamente
            setFavoriteIds((prev) => {
                if (prev.includes(mascotaId)) return prev;
                return [...prev, mascotaId];
            });

            setIsLoading(true);
            try {
                const { response, data } = await backendJson<{ message?: string }>('/favoritos', {
                    method: 'POST',
                    json: { mascota_id: mascotaId },
                });

                if (response.status === 401) {
                    setFavoriteIds((prev) => prev.filter((id) => id !== mascotaId));
                    handleAuthError();
                    return;
                }

                if (!response.ok) {
                    setFavoriteIds((prev) => prev.filter((id) => id !== mascotaId));
                    console.error('Error al agregar a favoritos:', data?.message);

                    if (response.status === 409) {
                        return;
                    }

                    const message = data?.message || 'Error al agregar a favoritos';
                    notify(message, 'error');
                } else {
                    notify('Agregado a favoritos', 'success');
                }
            } catch (error) {
                // Revertir cambio optimista en caso de error
                setFavoriteIds((prev) => prev.filter((id) => id !== mascotaId));
                console.error('Error al agregar a favoritos:', error);

                // Verificar si el error es por autenticación
                if (error instanceof TypeError && error.message.includes('fetch')) {
                    handleAuthError();
                    return;
                } else {
                    const message = 'Error de conexión al agregar a favoritos';
                    notify(message, 'error');
                }
            } finally {
                setIsLoading(false);
            }
        },
        [favoriteSet, isLoading, notify],
    );

    const removeFromFavorites = useCallback(
        async (mascotaId: number) => {
            // Evitar llamadas innecesarias
            if (!favoriteSet.has(mascotaId) || isLoading) return;

            // Actualización optimista - actualizar UI inmediatamente
            setFavoriteIds((prev) => {
                return prev.filter((id) => id !== mascotaId);
            });

            setIsLoading(true);
            try {
                const { response, data } = await backendJson<{ message?: string }>('/favoritos', {
                    method: 'DELETE',
                    json: { mascota_id: mascotaId },
                });

                if (response.status === 401) {
                    setFavoriteIds((prev) => {
                        if (prev.includes(mascotaId)) return prev;
                        return [...prev, mascotaId];
                    });
                    handleAuthError();
                    return;
                }

                if (!response.ok) {
                    setFavoriteIds((prev) => {
                        if (prev.includes(mascotaId)) return prev;
                        return [...prev, mascotaId];
                    });
                    console.error('Error al remover de favoritos:', data?.message);

                    if (response.status === 404) {
                        return;
                    }

                    const message = data?.message || 'Error al remover de favoritos';
                    notify(message, 'error');
                }
            } catch (error) {
                // Revertir cambio optimista en caso de error
                setFavoriteIds((prev) => {
                    if (prev.includes(mascotaId)) return prev;
                    return [...prev, mascotaId];
                });
                console.error('Error al remover de favoritos:', error);

                // Verificar si el error es por autenticación
                if (error instanceof TypeError && error.message.includes('fetch')) {
                    handleAuthError();
                    return;
                } else {
                    const message = 'Error de conexión al remover de favoritos';
                    notify(message, 'error');
                }
            } finally {
                setIsLoading(false);
            }
        },
        [favoriteSet, isLoading, notify],
    );

    const toggleFavorite = useCallback(
        async (mascotaId: number) => {
            if (isFavorite(mascotaId)) {
                await removeFromFavorites(mascotaId);
            } else {
                await addToFavorites(mascotaId);
            }
        },
        [isFavorite, addToFavorites, removeFromFavorites],
    );

    const value = {
        favoriteIds,
        isLoading,
        isInitialized,
        isFavorite,
        toggleFavorite,
        addToFavorites,
        removeFromFavorites,
        refreshFavorites,
        showNotification,
    };

    return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}
