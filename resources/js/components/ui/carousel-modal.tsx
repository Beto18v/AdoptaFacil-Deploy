import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import FormularioAdopcionModal from '@/components/ui/formulario-adopcion-modal';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useCarousel } from '@/hooks/use-carousel';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Heart, MapPin, MessageCircle, Phone, Share2, ShoppingCart, Star, User, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// Hook personalizado para manejar favoritos de manera opcional
function useOptionalFavorites() {
    try {
        return useFavorites();
    } catch {
        return {
            isFavorite: () => false,
            toggleFavorite: async () => {},
            isLoading: false,
            isInitialized: false,
            addToFavorites: async () => {},
            removeFromFavorites: async () => {},
            refreshFavorites: async () => {},
            favoriteIds: [],
        };
    }
}

interface BaseItem {
    id: number;
    imageUrl: string;
    images?: string[];
    description?: string;
    shelter: string;
    user?: {
        id: number;
        name: string;
        avatar?: string;
    };
}

interface Product extends BaseItem {
    type: 'product';
    nombre: string;
    precio: number;
    descripcion: string;
    category?: string;
    seller?: string;
}

interface Pet extends BaseItem {
    type: 'pet';
    name: string;
    especie: string;
    raza?: string;
    edad: number;
    sexo?: string;
    ciudad?: string;
    descripcion: string;
}

type CarouselItem = Product | Pet;

interface CarouselModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: CarouselItem[];
    initialIndex: number;
}

export default function CarouselModal({ isOpen, onClose, items, initialIndex }: CarouselModalProps) {
    const [imageLoading, setImageLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showAdoptionForm, setShowAdoptionForm] = useState(false);
    const [favoriteState, setFavoriteState] = useState<Record<number, boolean>>({});
    const [favoriteChanges, setFavoriteChanges] = useState(false);
    const initializedRef = useRef(false);

    const { isFavorite, toggleFavorite, isLoading: favoritesLoading, refreshFavorites } = useOptionalFavorites();

    const { currentIndex, goToNext, goToPrevious } = useCarousel({
        totalItems: items.length,
        initialIndex,
        autoPlayInterval: 5000,
        enableAutoPlay: false,
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    goToPrevious();
                    break;
                case 'ArrowRight':
                    goToNext();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, goToNext, goToPrevious, onClose]);

    useEffect(() => {
        setImageLoading(true);
        setCurrentImageIndex(0);
        // Cerrar el formulario de adopción si está abierto al cambiar de item
        setShowAdoptionForm(false);
    }, [currentIndex]);

    useEffect(() => {
        if (isOpen && !initializedRef.current) {
            const initialFavoriteState: Record<number, boolean> = {};
            items.forEach((item) => {
                if (item.type === 'pet') {
                    initialFavoriteState[item.id] = isFavorite(item.id);
                }
            });
            setFavoriteState(initialFavoriteState);
            setFavoriteChanges(false);
            initializedRef.current = true;
        } else if (!isOpen) {
            setFavoriteState({});
            initializedRef.current = false;
        }
    }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!isOpen && favoriteChanges && refreshFavorites) {
            const timeoutId = setTimeout(() => {
                refreshFavorites();
                setFavoriteChanges(false);
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [isOpen, favoriteChanges, refreshFavorites]);

    const currentItem = items[currentIndex];
    const currentImages = currentItem?.images || [currentItem?.imageUrl].filter(Boolean);
    const totalImages = currentImages.length;

    const goToNextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % totalImages);
        setImageLoading(true);
    };

    const goToPreviousImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
        setImageLoading(true);
    };

    const currentDisplayImage = currentImages[currentImageIndex] || currentItem?.imageUrl;

    const getCurrentFavoriteState = useCallback(
        (petId: number) => {
            if (isOpen && Object.prototype.hasOwnProperty.call(favoriteState, petId)) {
                return favoriteState[petId];
            }
            return isFavorite(petId);
        },
        [favoriteState, isFavorite, isOpen],
    );

    const handleFavoriteClick = useCallback(
        async (e: React.MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();

            if (currentItem?.type === 'pet' && !favoritesLoading) {
                const petId = currentItem.id;
                const currentFavoriteState = getCurrentFavoriteState(petId);

                try {
                    setFavoriteState((prev) => ({
                        ...prev,
                        [petId]: !currentFavoriteState,
                    }));

                    setFavoriteChanges(true);
                    await toggleFavorite(petId);
                } catch (error) {
                    console.error('Error al cambiar favorito:', error);
                    setFavoriteState((prev) => ({
                        ...prev,
                        [petId]: currentFavoriteState,
                    }));
                    setFavoriteChanges(false);
                }
            }
        },
        [currentItem, favoritesLoading, toggleFavorite, getCurrentFavoriteState],
    );

    if (!isOpen || !currentItem) return null;

    const isProduct = currentItem.type === 'product';
    const title = isProduct ? (currentItem as Product).nombre : (currentItem as Pet).name;

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/60 via-black/80 to-black/60 backdrop-blur-md"
                        onClick={onClose}
                    >
                        {/* Elementos decorativos de fondo */}
                        <div className="pointer-events-none absolute inset-0 overflow-hidden">
                            <div className="absolute top-1/4 left-1/4 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-blue-500/10 to-green-500/10 blur-3xl"></div>
                            <div className="absolute top-3/4 right-1/4 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-2xl"></div>
                            <div className="absolute top-1/2 left-3/4 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-green-500/10 to-purple-500/10 blur-3xl"></div>
                        </div>

                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative mx-4 w-full max-w-6xl overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/95"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="relative flex items-center justify-between border-b border-blue-200/30 bg-gradient-to-r from-blue-600/5 via-green-600/5 to-blue-600/5 p-6 backdrop-blur-sm dark:border-blue-800/30 dark:from-blue-600/10 dark:via-green-600/10 dark:to-blue-600/10">
                                {/* Elemento decorativo de fondo */}
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

                                <div className="relative flex items-center space-x-3">
                                    <Badge
                                        variant={isProduct ? 'default' : 'secondary'}
                                        className={`px-3 py-1 text-sm font-semibold ${
                                            isProduct
                                                ? 'border-blue-600/20 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-blue-500/25'
                                                : 'border-green-600/20 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-green-500/25'
                                        }`}
                                    >
                                        {isProduct ? 'Producto' : 'Mascota'}
                                    </Badge>
                                    <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-sm font-medium text-transparent dark:from-blue-400 dark:to-green-400">
                                        {currentIndex + 1} de {items.length}
                                    </span>
                                    {totalImages > 1 && (
                                        <Badge
                                            variant="outline"
                                            className="border-blue-200/50 bg-blue-50/50 text-xs text-blue-700 dark:border-blue-700/50 dark:bg-blue-900/30 dark:text-blue-300"
                                        >
                                            Imagen {currentImageIndex + 1}/{totalImages}
                                        </Badge>
                                    )}
                                </div>

                                <div className="relative flex items-center space-x-2">
                                    {currentItem.type === 'pet' && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleFavoriteClick}
                                            disabled={favoritesLoading}
                                            className="group relative rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm transition-all duration-300 hover:border-red-200/50 hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 hover:shadow-lg hover:shadow-red-500/20 dark:border-gray-700/30 dark:bg-gray-800/20 dark:hover:from-red-900/20 dark:hover:to-pink-900/20"
                                            title={getCurrentFavoriteState(currentItem.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                                        >
                                            <Heart
                                                className={`h-5 w-5 transition-all duration-300 ${
                                                    getCurrentFavoriteState(currentItem.id)
                                                        ? 'scale-110 fill-red-500 text-red-500 drop-shadow-sm'
                                                        : 'text-gray-600 group-hover:scale-110 group-hover:text-red-500 dark:text-gray-400'
                                                } ${favoritesLoading ? 'animate-pulse opacity-50' : ''}`}
                                            />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="group rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm transition-all duration-300 hover:border-blue-200/50 hover:bg-gradient-to-br hover:from-blue-50 hover:to-green-50 hover:shadow-lg hover:shadow-blue-500/20 dark:border-gray-700/30 dark:bg-gray-800/20 dark:hover:from-blue-900/20 dark:hover:to-green-900/20"
                                    >
                                        <Share2 className="h-5 w-5 text-gray-600 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={onClose}
                                        className="group rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm transition-all duration-300 hover:border-red-200/50 hover:bg-gradient-to-br hover:from-gray-50 hover:to-red-50 hover:shadow-lg hover:shadow-red-500/20 dark:border-gray-700/30 dark:bg-gray-800/20 dark:hover:from-gray-900/20 dark:hover:to-red-900/20"
                                    >
                                        <X className="h-5 w-5 text-gray-600 transition-all duration-300 group-hover:scale-110 group-hover:text-red-600 dark:text-gray-400 dark:group-hover:text-red-400" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid max-h-[85vh] min-h-[600px] grid-cols-1 overflow-y-auto lg:grid-cols-2">
                                {/* Image Section */}
                                <div className="relative flex items-center justify-center bg-gradient-to-br from-blue-50/50 via-white/30 to-green-50/50 dark:from-blue-950/20 dark:via-gray-900/50 dark:to-green-950/20">
                                    {/* Elementos decorativos en la sección de imagen */}
                                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                                        <div className="absolute top-1/4 left-1/4 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-blue-300/20 to-green-300/20 blur-2xl"></div>
                                        <div className="absolute right-1/4 bottom-1/4 h-24 w-24 animate-pulse rounded-full bg-gradient-to-br from-purple-300/20 to-blue-300/20 blur-xl"></div>
                                        <div className="absolute top-3/4 left-3/4 h-20 w-20 animate-pulse rounded-full bg-gradient-to-br from-green-300/20 to-purple-300/20 blur-lg"></div>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        <motion.img
                                            key={`${currentItem.id}-${currentImageIndex}`}
                                            initial={{ opacity: 0, scale: 1.05 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.3 }}
                                            src={currentDisplayImage}
                                            alt={title}
                                            className="max-h-full max-w-full object-contain"
                                            style={{ maxHeight: '85vh' }}
                                            onLoad={() => setImageLoading(false)}
                                        />
                                    </AnimatePresence>

                                    {imageLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50/80 via-white/60 to-green-50/80 backdrop-blur-sm dark:from-blue-950/40 dark:via-gray-900/60 dark:to-green-950/40">
                                            <div className="flex flex-col items-center space-y-4">
                                                <div className="relative">
                                                    <div className="h-14 w-14 animate-spin rounded-full border-4 border-blue-600 border-t-transparent shadow-lg"></div>
                                                    <div className="absolute inset-0 h-14 w-14 animate-ping rounded-full bg-gradient-to-r from-blue-600/20 to-green-600/20"></div>
                                                </div>
                                                <p className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-sm font-medium text-transparent dark:from-blue-400 dark:to-green-400">
                                                    Cargando imagen...
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Navigation Arrows for Images */}
                                    {totalImages > 1 && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="absolute top-1/2 left-3 z-20 -translate-y-1/2 rounded-full border border-white/30 bg-white/90 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-blue-200/50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 hover:shadow-blue-500/20 dark:border-gray-700/30 dark:bg-gray-900/90 dark:hover:from-blue-900/30 dark:hover:to-green-900/30"
                                                onClick={goToPreviousImage}
                                            >
                                                <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="absolute top-1/2 right-3 z-20 -translate-y-1/2 rounded-full border border-white/30 bg-white/90 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-blue-200/50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 hover:shadow-blue-500/20 dark:border-gray-700/30 dark:bg-gray-900/90 dark:hover:from-blue-900/30 dark:hover:to-green-900/30"
                                                onClick={goToNextImage}
                                            >
                                                <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                                            </Button>
                                        </>
                                    )}

                                    {/* Navigation Arrows for Items - Only on desktop */}
                                    {items.length > 1 && (
                                        <>
                                            <Button
                                                variant="default"
                                                size="lg"
                                                className="absolute bottom-6 left-6 hidden rounded-2xl border-2 border-white/30 bg-gradient-to-r from-blue-600 via-blue-600 to-green-600 px-4 py-3 text-white shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/40 hover:from-blue-700 hover:via-blue-700 hover:to-green-700 hover:shadow-blue-500/30 lg:flex dark:from-blue-500 dark:via-blue-500 dark:to-green-500 dark:shadow-blue-900/40 dark:hover:from-blue-600 dark:hover:via-blue-600 dark:hover:to-green-600"
                                                onClick={goToPrevious}
                                            >
                                                <ChevronLeft className="mr-2 h-5 w-5 drop-shadow-sm" />
                                                <span className="text-sm font-semibold drop-shadow-sm">{isProduct ? 'Anterior' : 'Anterior'}</span>
                                            </Button>
                                            <Button
                                                variant="default"
                                                size="lg"
                                                className="absolute right-6 bottom-6 hidden rounded-2xl border-2 border-white/30 bg-gradient-to-r from-green-600 via-green-600 to-blue-600 px-4 py-3 text-white shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/40 hover:from-green-700 hover:via-green-700 hover:to-blue-700 hover:shadow-green-500/30 lg:flex dark:from-green-500 dark:via-green-500 dark:to-blue-500 dark:shadow-green-900/40 dark:hover:from-green-600 dark:hover:via-green-600 dark:hover:to-blue-600"
                                                onClick={goToNext}
                                            >
                                                <span className="text-sm font-semibold drop-shadow-sm">{isProduct ? 'Siguiente' : 'Siguiente'}</span>
                                                <ChevronRight className="ml-2 h-5 w-5 drop-shadow-sm" />
                                            </Button>
                                        </>
                                    )}

                                    {/* Image Dots Indicator */}
                                    {totalImages > 1 && (
                                        <div className="absolute top-4 left-1/2 z-20 flex -translate-x-1/2 space-x-2 rounded-full border border-white/20 bg-black/30 px-4 py-2 backdrop-blur-md">
                                            {currentImages.map((_, index) => (
                                                <button
                                                    key={index}
                                                    className={`rounded-full shadow-sm transition-all duration-300 ${
                                                        index === currentImageIndex
                                                            ? 'h-2 w-6 bg-gradient-to-r from-blue-400 to-green-400 shadow-lg shadow-blue-500/30'
                                                            : 'h-2 w-2 bg-white/60 hover:bg-gradient-to-r hover:from-blue-400/80 hover:to-green-400/80 hover:shadow-md'
                                                    }`}
                                                    onClick={() => {
                                                        setCurrentImageIndex(index);
                                                        setImageLoading(true);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Content Section */}
                                <div className="relative flex max-h-[85vh] flex-col overflow-y-auto bg-gradient-to-br from-white/50 via-white/80 to-blue-50/30 p-6 backdrop-blur-sm dark:from-gray-900/50 dark:via-gray-900/80 dark:to-blue-950/30">
                                    {/* Elementos decorativos en el contenido */}
                                    <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-br from-green-100/30 to-blue-100/30 blur-2xl dark:from-green-900/20 dark:to-blue-900/20"></div>
                                    <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-gradient-to-br from-blue-100/30 to-purple-100/30 blur-xl dark:from-blue-900/20 dark:to-purple-900/20"></div>

                                    <div className="flex-1">
                                        {/* Title and Basic Info */}
                                        <div className="mb-8">
                                            <h1 className="relative mb-3 inline-block bg-gradient-to-r from-blue-600 via-green-600 to-blue-600 bg-clip-text text-4xl font-bold text-transparent drop-shadow-sm dark:from-blue-400 dark:via-green-400 dark:to-blue-400">
                                                {title}
                                                <div className="absolute right-0 -bottom-1 left-0 h-1 scale-x-75 transform rounded-full bg-gradient-to-r from-blue-500 via-green-500 to-blue-500 shadow-lg"></div>
                                            </h1>
                                        </div>

                                        {isProduct ? (
                                            <div className="relative mb-6 rounded-2xl border border-blue-200/30 bg-gradient-to-r from-blue-50/50 via-green-50/30 to-blue-50/50 p-4 backdrop-blur-sm dark:border-blue-800/30 dark:from-blue-950/30 dark:via-green-950/20 dark:to-blue-950/30">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">Precio</p>
                                                        <p className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-4xl font-bold text-transparent dark:from-blue-400 dark:to-green-400">
                                                            ${(currentItem as Product).precio.toLocaleString('es-CO')}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <div className="mb-1 flex items-center space-x-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                                                            ))}
                                                        </div>
                                                        <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-sm font-medium text-transparent dark:from-yellow-400 dark:to-orange-400">
                                                            (4.8) • 24 reseñas
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div className="flex items-center space-x-3 rounded-xl border border-blue-200/30 bg-gradient-to-r from-blue-50/50 to-green-50/50 p-3 backdrop-blur-sm dark:border-blue-800/30 dark:from-blue-950/30 dark:to-green-950/30">
                                                    <div className="flex-shrink-0 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 p-2 text-white shadow-lg">
                                                        <Calendar className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Edad</p>
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {(currentItem as Pet).edad} {(currentItem as Pet).edad === 1 ? 'año' : 'años'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3 rounded-xl border border-green-200/30 bg-gradient-to-r from-green-50/50 to-blue-50/50 p-3 backdrop-blur-sm dark:border-green-800/30 dark:from-green-950/30 dark:to-blue-950/30">
                                                    <div className="flex-shrink-0 rounded-lg bg-gradient-to-r from-green-500 to-green-600 p-2 text-white shadow-lg">
                                                        <User className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Sexo</p>
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {(currentItem as Pet).sexo || 'No especificado'}
                                                        </span>
                                                    </div>
                                                </div>
                                                {(currentItem as Pet).ciudad && (
                                                    <div className="col-span-1 flex items-center space-x-3 rounded-xl border border-purple-200/30 bg-gradient-to-r from-purple-50/50 via-blue-50/50 to-green-50/50 p-3 backdrop-blur-sm md:col-span-2 dark:border-purple-800/30 dark:from-purple-950/30 dark:via-blue-950/30 dark:to-green-950/30">
                                                        <div className="flex-shrink-0 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 p-2 text-white shadow-lg">
                                                            <MapPin className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Ubicación</p>
                                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                                {(currentItem as Pet).ciudad}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Species/Category Info */}
                                        <div className="mb-4 flex flex-wrap gap-2">
                                            {isProduct ? (
                                                <Badge
                                                    variant="outline"
                                                    className="border-blue-200 bg-gradient-to-r from-blue-50 to-green-50 text-blue-700 dark:border-blue-800 dark:from-blue-950 dark:to-green-950 dark:text-blue-300"
                                                >
                                                    {(currentItem as Product).category || 'Producto'}
                                                </Badge>
                                            ) : (
                                                <>
                                                    <Badge
                                                        variant="outline"
                                                        className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50 text-green-700 dark:border-green-800 dark:from-green-950 dark:to-blue-950 dark:text-green-300"
                                                    >
                                                        {(currentItem as Pet).especie}
                                                    </Badge>
                                                    {(currentItem as Pet).raza && (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 dark:border-purple-800 dark:from-purple-950 dark:to-pink-950 dark:text-purple-300"
                                                        >
                                                            {(currentItem as Pet).raza}
                                                        </Badge>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <div className="mb-6">
                                            <h3 className="mb-3 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-lg font-semibold text-transparent dark:from-gray-200 dark:to-gray-400">
                                                Descripción
                                            </h3>
                                            <p className="leading-relaxed text-gray-600 dark:text-gray-300">
                                                {isProduct ? (currentItem as Product).descripcion : (currentItem as Pet).descripcion}
                                            </p>
                                        </div>

                                        {/* Shelter/Seller Info */}
                                        <div className="mb-6 rounded-2xl border border-gray-200/30 bg-gradient-to-r from-gray-50/80 via-blue-50/30 to-green-50/80 p-4 backdrop-blur-sm dark:border-gray-700/30 dark:from-gray-800/80 dark:via-blue-950/30 dark:to-green-950/80">
                                            <h4 className="mb-3 bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text font-semibold text-transparent dark:from-gray-300 dark:to-gray-200">
                                                {isProduct ? 'Vendido por' : 'Publicado por'}
                                            </h4>
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="h-12 w-12 ring-2 ring-blue-200/50 dark:ring-blue-800/50">
                                                    <AvatarImage
                                                        src={currentItem.user?.avatar ? `/storage/${currentItem.user.avatar}` : undefined}
                                                        alt={currentItem.user?.name || currentItem.shelter}
                                                    />
                                                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-green-600 text-lg font-semibold text-white">
                                                        {(currentItem.user?.name || currentItem.shelter).charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{currentItem.shelter}</p>
                                                    <p className="flex items-center text-sm text-green-600 dark:text-green-400">
                                                        <span className="mr-1">✓</span>
                                                        Miembro verificado
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3">
                                        {/* Mobile Navigation Buttons */}
                                        {items.length > 1 && (
                                            <div className="mb-4 flex gap-2 lg:hidden">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 border-blue-200 bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 dark:border-blue-800 dark:from-blue-950 dark:to-green-950"
                                                    onClick={goToPrevious}
                                                >
                                                    <ChevronLeft className="mr-1 h-4 w-4" />
                                                    Anterior
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 border-green-200 bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 dark:border-green-800 dark:from-green-950 dark:to-blue-950"
                                                    onClick={goToNext}
                                                >
                                                    Siguiente
                                                    <ChevronRight className="ml-1 h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}

                                        {isProduct ? (
                                            <>
                                                <Button
                                                    className="group relative w-full overflow-hidden bg-gradient-to-r from-blue-600 via-blue-600 to-green-600 py-6 text-lg font-semibold shadow-xl transition-all duration-300 hover:scale-[1.02] hover:from-blue-700 hover:via-blue-700 hover:to-green-700 hover:shadow-2xl hover:shadow-blue-500/25 dark:from-blue-500 dark:via-blue-500 dark:to-green-500"
                                                    size="lg"
                                                >
                                                    {/* Efecto de brillo */}
                                                    <div className="absolute inset-0 translate-x-[-100%] -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-[200%]"></div>
                                                    <ShoppingCart className="mr-2 h-5 w-5 drop-shadow-sm transition-transform duration-300 group-hover:scale-110" />
                                                    Agregar al carrito - ${(currentItem as Product).precio.toLocaleString('es-CO')}
                                                </Button>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Button
                                                        variant="outline"
                                                        size="lg"
                                                        className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50 py-4 hover:border-green-300 hover:from-green-100 hover:to-blue-100 dark:border-green-800 dark:from-green-950 dark:to-blue-950"
                                                    >
                                                        <Phone className="mr-2 h-4 w-4" />
                                                        Llamar
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="lg"
                                                        className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 py-4 hover:border-blue-300 hover:from-blue-100 hover:to-purple-100 dark:border-blue-800 dark:from-blue-950 dark:to-purple-950"
                                                    >
                                                        <MessageCircle className="mr-2 h-4 w-4" />
                                                        Mensaje
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    className="group relative w-full overflow-hidden bg-gradient-to-r from-green-600 via-green-600 to-blue-600 py-6 text-lg font-semibold shadow-xl transition-all duration-300 hover:scale-[1.02] hover:from-green-700 hover:via-green-700 hover:to-blue-700 hover:shadow-2xl hover:shadow-green-500/25 dark:from-green-500 dark:via-green-500 dark:to-blue-500"
                                                    size="lg"
                                                    onClick={() => setShowAdoptionForm(true)}
                                                >
                                                    {/* Efecto de brillo */}
                                                    <div className="absolute inset-0 translate-x-[-100%] -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-[200%]"></div>
                                                    <Heart className="mr-2 h-5 w-5 drop-shadow-sm transition-transform duration-300 group-hover:scale-110" />
                                                    Iniciar proceso de adopción
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Formulario de Adopción */}
            {currentItem && !isProduct && (
                <FormularioAdopcionModal
                    show={showAdoptionForm}
                    onClose={() => setShowAdoptionForm(false)}
                    mascota={{
                        id: currentItem.id,
                        nombre: currentItem.type === 'pet' ? (currentItem as Pet).name : 'Mascota sin nombre',
                        type: 'pet',
                    }}
                />
            )}
        </>
    );
}
