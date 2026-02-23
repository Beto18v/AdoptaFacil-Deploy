import { router } from '@inertiajs/react';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

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

    // Set para búsquedas más rápidas
    const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

    const refreshFavorites = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/favoritos/ids', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                credentials: 'same-origin',
            });

            if (response.status === 401) {
                // Usuario no autenticado - esto es normal, no redirigir aquí
                setFavoriteIds([]);
                return;
            }

            if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    try {
                        const data = await response.json();
                        setFavoriteIds(data.favorite_ids || []);
                    } catch (jsonError) {
                        setFavoriteIds([]);
                    }
                } else {
                    setFavoriteIds([]);
                }
            } else {
                setFavoriteIds([]);
            }
        } catch (error) {
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
                const response = await fetch('/favoritos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({ mascota_id: mascotaId }),
                });

                // Manejar errores de autenticación antes de intentar parsear JSON
                if (response.status === 401) {
                    setFavoriteIds((prev) => prev.filter((id) => id !== mascotaId));
                    handleAuthError();
                    return;
                }

                let data;
                try {
                    data = await response.json();
                } catch (jsonError) {
                    // Si no se puede parsear JSON, probablemente es un error de autenticación
                    console.error('Error al parsear JSON:', jsonError);
                    setFavoriteIds((prev) => prev.filter((id) => id !== mascotaId));
                    handleAuthError();
                    return;
                }

                if (!response.ok) {
                    // Revertir cambio optimista en caso de error
                    setFavoriteIds((prev) => prev.filter((id) => id !== mascotaId));
                    console.error('Error al agregar a favoritos:', data.message);

                    if (response.status === 409) {
                        // Favorito ya existe, no mostrar error
                    } else {
                        const message = data.message || 'Error al agregar a favoritos';
                        if (showNotification) {
                            showNotification(message, 'error');
                        } else {
                            alert(message);
                        }
                    }
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
                    if (showNotification) {
                        showNotification(message, 'error');
                    } else {
                        alert(message);
                    }
                }
            } finally {
                setIsLoading(false);
            }
        },
        [favoriteSet, isLoading, showNotification],
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
                const response = await fetch('/favoritos', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({ mascota_id: mascotaId }),
                });

                // Manejar errores de autenticación antes de intentar parsear JSON
                if (response.status === 401) {
                    setFavoriteIds((prev) => {
                        if (prev.includes(mascotaId)) return prev;
                        return [...prev, mascotaId];
                    });
                    handleAuthError();
                    return;
                }

                let data;
                try {
                    data = await response.json();
                } catch (jsonError) {
                    // Si no se puede parsear JSON, probablemente es un error de autenticación
                    console.error('Error al parsear JSON:', jsonError);
                    setFavoriteIds((prev) => {
                        if (prev.includes(mascotaId)) return prev;
                        return [...prev, mascotaId];
                    });
                    handleAuthError();
                    return;
                }

                if (!response.ok) {
                    // Revertir cambio optimista en caso de error
                    setFavoriteIds((prev) => {
                        if (prev.includes(mascotaId)) return prev;
                        return [...prev, mascotaId];
                    });
                    console.error('Error al remover de favoritos:', data.message);

                    if (response.status === 404) {
                        // Favorito no existe, no mostrar error
                    } else {
                        const message = data.message || 'Error al remover de favoritos';
                        if (showNotification) {
                            showNotification(message, 'error');
                        } else {
                            alert(message);
                        }
                    }
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
                    if (showNotification) {
                        showNotification(message, 'error');
                    } else {
                        alert(message);
                    }
                }
            } finally {
                setIsLoading(false);
            }
        },
        [favoriteSet, isLoading, showNotification],
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
