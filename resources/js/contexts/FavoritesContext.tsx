import { backendJson } from '@/lib/http';
import { showToast } from '@/lib/toast';
import { router } from '@inertiajs/react';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface FavoritesContextType {
    favoriteIds: number[];
    isLoading: boolean;
    isInitialized: boolean;
    isFavorite: (mascotaId: number) => boolean;
    toggleFavorite: (mascotaId: number) => Promise<boolean>;
    addToFavorites: (mascotaId: number) => Promise<boolean>;
    removeFromFavorites: (mascotaId: number) => Promise<boolean>;
    refreshFavorites: () => Promise<void>;
    showNotification?: (message: string, type: 'error' | 'success' | 'info') => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const handleAuthError = () => {
    sessionStorage.setItem('intended_url', window.location.pathname);
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
            if (favoriteSet.has(mascotaId) || isLoading) {
                return true;
            }

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
                    return false;
                }

                if (!response.ok) {
                    setFavoriteIds((prev) => prev.filter((id) => id !== mascotaId));
                    console.error('Error al agregar a favoritos:', data?.message);

                    if (response.status === 409) {
                        return true;
                    }

                    notify(data?.message || 'Error al agregar a favoritos', 'error');
                    return false;
                }

                notify('Agregado a favoritos', 'success');
                return true;
            } catch (error) {
                setFavoriteIds((prev) => prev.filter((id) => id !== mascotaId));
                console.error('Error al agregar a favoritos:', error);

                if (error instanceof TypeError && error.message.includes('fetch')) {
                    handleAuthError();
                    return false;
                }

                notify('Error de conexion al agregar a favoritos', 'error');
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [favoriteSet, isLoading, notify],
    );

    const removeFromFavorites = useCallback(
        async (mascotaId: number) => {
            if (!favoriteSet.has(mascotaId) || isLoading) {
                return true;
            }

            setFavoriteIds((prev) => prev.filter((id) => id !== mascotaId));

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
                    return false;
                }

                if (!response.ok) {
                    setFavoriteIds((prev) => {
                        if (prev.includes(mascotaId)) return prev;
                        return [...prev, mascotaId];
                    });
                    console.error('Error al remover de favoritos:', data?.message);

                    if (response.status === 404) {
                        return true;
                    }

                    notify(data?.message || 'Error al remover de favoritos', 'error');
                    return false;
                }

                return true;
            } catch (error) {
                setFavoriteIds((prev) => {
                    if (prev.includes(mascotaId)) return prev;
                    return [...prev, mascotaId];
                });
                console.error('Error al remover de favoritos:', error);

                if (error instanceof TypeError && error.message.includes('fetch')) {
                    handleAuthError();
                    return false;
                }

                notify('Error de conexion al remover de favoritos', 'error');
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [favoriteSet, isLoading, notify],
    );

    const toggleFavorite = useCallback(
        async (mascotaId: number) => {
            if (isFavorite(mascotaId)) {
                return removeFromFavorites(mascotaId);
            }

            return addToFavorites(mascotaId);
        },
        [isFavorite, addToFavorites, removeFromFavorites],
    );

    return (
        <FavoritesContext.Provider
            value={{
                favoriteIds,
                isLoading,
                isInitialized,
                isFavorite,
                toggleFavorite,
                addToFavorites,
                removeFromFavorites,
                refreshFavorites,
                showNotification,
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);

    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }

    return context;
}
