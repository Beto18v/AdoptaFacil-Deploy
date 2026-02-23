import ChatbotWidget from '@/components/chatbot-widget';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { InteractiveMap } from '@/components/ui/interactive-map';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Mapa',
        href: '/mapa',
    },
];

interface Location {
    id: string;
    city: string;
    count: number;
    shelters: number;
    lat: number;
    lng: number;
}

interface MapPageProps {
    locations: Location[] | null | undefined;
    totalMascotas: number;
    totalCiudades: number;
    [key: string]: unknown;
}

export default function AdoptionMap() {
    const { locations: rawLocations, totalMascotas, totalCiudades } = usePage<MapPageProps>().props;

    // Asegurar que locations sea siempre un array
    const locations = Array.isArray(rawLocations) ? rawLocations : [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mapa de Adopciones" />
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
                            <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Mapa de Adopciones</span>
                        </h1>
                        <p className="mt-4 text-xl leading-relaxed font-medium text-white/90">Descubre mascotas en adopción cerca de ti</p>

                        {/* Línea decorativa */}
                        <div className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                    </div>

                    {/* Tarjetas de estadísticas */}
                    <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
                        {/* Total Mascotas */}
                        <div className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-white/95 p-6 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] dark:bg-gray-800/95">
                            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500/20 to-transparent"></div>
                            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-blue-300/10 to-transparent"></div>
                            <div className="relative text-center">
                                <div className="mx-auto mb-3 w-fit rounded-2xl bg-gradient-to-r from-blue-500 to-blue-700 p-3 shadow-xl">
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalMascotas}</p>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Mascotas</p>
                            </div>
                        </div>

                        {/* Total Ciudades */}
                        <div className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-white/95 p-6 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] dark:bg-gray-800/95">
                            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-green-500/20 to-transparent"></div>
                            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-green-300/10 to-transparent"></div>
                            <div className="relative text-center">
                                <div className="mx-auto mb-3 w-fit rounded-2xl bg-gradient-to-r from-green-500 to-green-700 p-3 shadow-xl">
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                        />
                                    </svg>
                                </div>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalCiudades}</p>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Ciudades</p>
                            </div>
                        </div>

                        {/* Total Refugios */}
                        <div className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-white/95 p-6 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] dark:bg-gray-800/95">
                            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-purple-500/20 to-transparent"></div>
                            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-purple-300/10 to-transparent"></div>
                            <div className="relative text-center">
                                <div className="mx-auto mb-3 w-fit rounded-2xl bg-gradient-to-r from-purple-500 to-purple-700 p-3 shadow-xl">
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                        />
                                    </svg>
                                </div>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                                    {Array.isArray(locations) && locations.length > 0 ? locations.reduce((acc, loc) => acc + loc.shelters, 0) : 0}
                                </p>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Refugios Activos</p>
                            </div>
                        </div>
                    </div>

                    {/* Contenedor principal del mapa */}
                    <div className="relative overflow-hidden rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm dark:bg-gray-800/95">
                        {/* Elementos decorativos */}
                        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/5 blur-2xl"></div>
                        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-tr from-green-500/10 to-blue-500/5 blur-xl"></div>

                        <div className="relative">
                            {/* Header del mapa con filtros */}
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Mapa Interactivo</h2>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                        Explora {totalMascotas} mascotas en {totalCiudades} ciudades
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl bg-gradient-to-r from-blue-500/20 to-green-500/20 p-3">
                                        <svg
                                            className="h-6 w-6 text-blue-600 dark:text-blue-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Línea decorativa */}
                            <div className="mb-6 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
                        </div>

                        {/* Mapa interactivo */}
                        <div className="mb-8">
                            {locations && locations.length > 0 ? (
                                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                                    <InteractiveMap locations={locations} className="rounded-2xl" />
                                </div>
                            ) : (
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-12 dark:from-gray-700 dark:to-gray-800">
                                    {/* Elementos decorativos para estado vacío */}
                                    <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-gradient-to-br from-blue-300/20 to-transparent"></div>
                                    <div className="absolute -bottom-4 -left-4 h-12 w-12 rounded-full bg-gradient-to-tr from-green-300/20 to-transparent"></div>

                                    <div className="relative text-center">
                                        <div className="mx-auto mb-4 w-fit rounded-full bg-gradient-to-r from-gray-400 to-gray-600 p-6 shadow-lg">
                                            <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="mb-2 text-xl font-bold text-gray-700 dark:text-gray-300">
                                            No hay datos de ubicación disponibles
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">Agrega refugios con ciudades para ver el mapa interactivo</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Estadísticas por ciudad */}
                        {locations && locations.length > 0 && (
                            <div className="mb-8">
                                <div className="mb-6 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Distribución por Ciudad</h3>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Mascotas disponibles en cada ubicación</p>
                                    </div>
                                    <div className="rounded-2xl bg-gradient-to-r from-green-500/20 to-blue-500/20 p-3">
                                        <svg
                                            className="h-5 w-5 text-green-600 dark:text-green-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                            />
                                        </svg>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                    {locations.map((location) => (
                                        <div
                                            key={location.id}
                                            className="city-card group relative overflow-hidden rounded-2xl bg-white/95 p-6 text-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:bg-gray-700/95"
                                        >
                                            {/* Elemento decorativo */}
                                            <div className="absolute -top-4 -right-4 h-12 w-12 rounded-full bg-gradient-to-br from-blue-400/30 to-green-400/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                                            <div className="relative">
                                                <div className="mx-auto mb-3 w-fit rounded-xl bg-gradient-to-r from-blue-500 to-green-600 p-2 shadow-md">
                                                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                    </svg>
                                                </div>
                                                <h4 className="mb-2 text-sm font-bold text-gray-800 dark:text-white">{location.city}</h4>
                                                <p className="mb-1 text-2xl font-black text-blue-600 dark:text-blue-400">{location.count}</p>
                                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">mascotas</p>
                                                {location.shelters > 0 && (
                                                    <div className="mt-2 rounded-lg bg-green-100/80 px-2 py-1 dark:bg-green-900/30">
                                                        <p className="text-xs font-semibold text-green-700 dark:text-green-400">
                                                            {location.shelters} refugio{location.shelters > 1 ? 's' : ''}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <ThemeSwitcher hasChatbot={true} />
            <ChatbotWidget />
        </AppLayout>
    );
}
