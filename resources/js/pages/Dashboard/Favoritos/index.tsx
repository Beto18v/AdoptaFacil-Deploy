import ChatbotWidget from '@/components/chatbot-widget';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import CarouselModal from '@/components/ui/carousel-modal';
import { FavoritesProvider, useFavorites } from '@/contexts/FavoritesContext';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Heart, MapPin, User } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Favoritos',
        href: '/favoritos',
    },
];

interface MascotaImage {
    id: number;
    imagen_path: string;
    orden: number;
}

interface Mascota {
    id: number;
    nombre: string;
    especie: string;
    raza?: string;
    edad: number;
    sexo: string;
    ciudad: string;
    descripcion: string;
    imagen?: string;
    images?: MascotaImage[];
    user: {
        id: number;
        name: string;
    };
}

interface FavoritosProps {
    favoritos: Mascota[];
}

function FavoritePetsContent({ favoritos = [] }: FavoritosProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { removeFromFavorites, isLoading } = useFavorites();

    const handlePetClick = (index: number) => {
        setSelectedIndex(index);
        setIsModalOpen(true);
    };

    const handleRemoveFavorite = async (mascotaId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        await removeFromFavorites(mascotaId);
        // Recargar la página para actualizar la lista
        window.location.reload();
    };

    // Convertir favoritos al formato esperado por el modal
    const modalItems = useMemo(() => {
        return favoritos.map((mascota) => {
            // Construir array de imágenes
            const images: string[] = [];

            // Agregar imagen principal si existe
            if (mascota.imagen) {
                images.push(`/storage/${mascota.imagen}`);
            }

            // Agregar imágenes adicionales de la relación 'images'
            if (mascota.images && mascota.images.length > 0) {
                mascota.images.forEach((img) => {
                    const imagePath = `/storage/${img.imagen_path}`;
                    if (!images.includes(imagePath)) {
                        images.push(imagePath);
                    }
                });
            }

            // Imagen por defecto si no hay ninguna
            if (images.length === 0) {
                images.push('https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=400');
            }

            return {
                id: mascota.id,
                type: 'pet' as const,
                name: mascota.nombre,
                especie: mascota.especie,
                raza: mascota.raza,
                edad: mascota.edad,
                sexo: mascota.sexo,
                ciudad: mascota.ciudad,
                descripcion: mascota.descripcion,
                imageUrl: images[0],
                images: images,
                shelter: mascota.user.name,
            };
        });
    }, [favoritos]);

    return (
        <>
            <main className="relative flex-1 overflow-y-auto bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-6 dark:from-green-600 dark:via-blue-700 dark:to-purple-800">
                {/* Elementos decorativos de fondo */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    {/* Círculos decorativos grandes */}
                    <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
                    <div className="absolute top-1/4 -right-32 h-80 w-80 rounded-full bg-blue-300/10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-purple-300/10 blur-3xl"></div>

                    {/* Puntos animados */}
                    <div className="absolute top-20 right-20 h-3 w-3 animate-pulse rounded-full bg-white/20 shadow-lg"></div>
                    <div className="absolute top-1/3 left-1/4 h-4 w-4 animate-ping rounded-full bg-white/30 shadow-lg"></div>
                    <div className="absolute right-1/3 bottom-32 h-2 w-2 animate-pulse rounded-full bg-white/25 shadow-md"></div>
                </div>

                <div className="relative z-10 container mx-auto">
                    {/* Título de la página con gradiente */}
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold tracking-tight drop-shadow-lg md:text-5xl lg:text-6xl">
                            <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Mis Mascotas Favoritas</span>
                        </h1>
                        <p className="mt-4 text-xl leading-relaxed font-medium text-white/90">Tus mascotas guardadas esperándote</p>

                        {/* Línea decorativa */}
                        <div className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                    </div>

                    {/* Estadística de favoritos */}
                    <div className="mb-8">
                        <div className="group hover:shadow-3xl relative mx-auto max-w-sm overflow-hidden rounded-3xl bg-white/95 p-6 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] dark:bg-gray-800/95">
                            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-pink-500/20 to-transparent"></div>
                            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-pink-300/10 to-transparent"></div>
                            <div className="relative text-center">
                                <div className="mx-auto mb-3 w-fit rounded-2xl bg-gradient-to-r from-pink-500 to-red-500 p-3 shadow-xl">
                                    <Heart className="h-6 w-6 fill-current text-white" />
                                </div>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">{favoritos.length}</p>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    {favoritos.length === 1 ? 'Mascota Favorita' : 'Mascotas Favoritas'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {favoritos.length > 0 ? (
                        <div className="relative overflow-hidden rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm dark:bg-gray-800/95">
                            {/* Elementos decorativos */}
                            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-pink-500/10 to-purple-500/5 blur-2xl"></div>
                            <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-tr from-pink-500/10 to-red-500/5 blur-xl"></div>

                            <div className="relative">
                                {/* Header de la sección */}
                                <div className="mb-6 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Galería de Favoritos</h2>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                            Explora {favoritos.length} {favoritos.length === 1 ? 'mascota guardada' : 'mascotas guardadas'}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-gradient-to-r from-pink-500/20 to-red-500/20 p-3">
                                        <Heart className="h-6 w-6 fill-current text-pink-600 dark:text-pink-400" />
                                    </div>
                                </div>

                                {/* Línea decorativa */}
                                <div className="mb-6 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {favoritos.map((pet, index) => {
                                    const mainImage = pet.imagen
                                        ? `/storage/${pet.imagen}`
                                        : pet.images && pet.images.length > 0
                                          ? `/storage/${pet.images[0].imagen_path}`
                                          : 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=400';

                                    return (
                                        <div
                                            key={pet.id}
                                            className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:scale-105 hover:shadow-2xl dark:bg-gray-800"
                                            onClick={() => handlePetClick(index)}
                                        >
                                            <div className="relative h-48">
                                                <img
                                                    src={mainImage}
                                                    alt={pet.nombre}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                                />
                                                <div className="absolute top-2 right-2 flex gap-2">
                                                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                                                        Disponible
                                                    </span>
                                                    <button
                                                        onClick={(e) => handleRemoveFavorite(pet.id, e)}
                                                        disabled={isLoading}
                                                        className="rounded-full bg-white/90 p-1.5 text-red-500 transition-colors hover:bg-red-100 disabled:opacity-50 dark:bg-gray-800/90 dark:hover:bg-red-900/20"
                                                    >
                                                        <Heart className="h-4 w-4 fill-current" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <div className="mb-2 flex items-start justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{pet.nombre}</h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                                            {pet.especie} {pet.raza && `• ${pet.raza}`}
                                                        </p>
                                                    </div>
                                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                        {pet.especie}
                                                    </span>
                                                </div>
                                                <div className="mb-3 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>
                                                            {pet.edad} {pet.edad === 1 ? 'año' : 'años'} • {pet.sexo}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        <span>{pet.ciudad}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        <span className="text-blue-600 dark:text-blue-400">{pet.user.name}</span>
                                                    </div>
                                                </div>
                                                <p className="mb-3 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{pet.descripcion}</p>{' '}
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="w-full bg-green-600 hover:bg-green-700"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handlePetClick(index);
                                                        }}
                                                    >
                                                        Ver detalles
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="relative overflow-hidden rounded-3xl bg-white/95 p-12 shadow-2xl backdrop-blur-sm dark:bg-gray-800/95">
                            {/* Elementos decorativos para estado vacío */}
                            <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-gradient-to-br from-pink-300/20 to-transparent"></div>
                            <div className="absolute -bottom-4 -left-4 h-12 w-12 rounded-full bg-gradient-to-tr from-pink-300/20 to-transparent"></div>

                            <div className="relative text-center">
                                <div className="mx-auto mb-4 w-fit rounded-full bg-gradient-to-r from-pink-400 to-red-400 p-6 shadow-lg">
                                    <Heart className="h-12 w-12 fill-current text-white" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-gray-700 dark:text-gray-300">No tienes mascotas favoritas aún</h3>
                                <p className="mb-6 text-gray-500 dark:text-gray-400">
                                    Explora mascotas y marca tus favoritas haciendo clic en el corazón
                                </p>
                                <Link href="/mascotas">
                                    <Button className="rounded-xl bg-gradient-to-r from-green-500 to-green-700 px-6 py-3 text-white shadow-lg transition-all duration-300 hover:from-green-600 hover:to-green-800 hover:shadow-xl">
                                        Explorar mascotas
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal del carrusel */}
            <CarouselModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} items={modalItems} initialIndex={selectedIndex} />
        </>
    );
}

export default function FavoritePets({ favoritos = [] }: FavoritosProps) {
    return (
        <FavoritesProvider>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Mascotas Favoritas" />
                <FavoritePetsContent favoritos={favoritos} />
                <ThemeSwitcher hasChatbot={true} />
                <ChatbotWidget />
            </AppLayout>
        </FavoritesProvider>
    );
}
