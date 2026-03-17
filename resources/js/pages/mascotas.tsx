/**
 * Vista publica del catalogo de mascotas.
 * Renderiza filtros, favoritos y tarjetas para explorar mascotas disponibles.
 */

import ChatbotWidget from '@/components/chatbot-widget';
import Footer from '@/components/landing/footer';
import Header from '@/components/landing/header';
import PetCard from '@/components/mascotas/pet-card';
import PetFilters from '@/components/mascotas/pet-filters';
import PetHero from '@/components/mascotas/pet-hero';
import { ThemeSwitcher } from '@/components/theme-switcher';
import CarouselModal from '@/components/ui/carousel-modal';
import { useNotifications } from '@/components/ui/notification';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

// ACTUALIZADO: Asegúrate de que tu prop 'mascotas' incluya ciudad y sexo.
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
    sexo: string; // <-- AÑADIDO
    ciudad: string; // <-- AÑADIDO
    descripcion: string;
    imagen?: string;
    images?: MascotaImage[]; // <-- AÑADIDO: imágenes múltiples
    user: {
        id: number;
        name: string;
    };
}

interface MascotasProps {
    mascotas: Mascota[];
}

export default function Mascotas({ mascotas = [] }: MascotasProps) {
    const { url } = usePage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { addNotification, NotificationContainer } = useNotifications();

    const normalizeEspecieLabel = (value: string) => {
        const normalized = (value || '').trim().toLowerCase();

        if (normalized === 'perro' || normalized === 'perros') {
            return 'Perros';
        }

        if (normalized === 'gato' || normalized === 'gatos') {
            return 'Gatos';
        }

        if (normalized === '') {
            return '';
        }

        return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    };

    const getEspecieFromUrl = (inertiaUrl: string) => {
        if (typeof window === 'undefined') {
            return 'all';
        }

        const parsed = new URL(inertiaUrl, window.location.origin);
        return parsed.searchParams.get('especie') || 'all';
    };

    // ACTUALIZADO: Mapeamos también 'sexo' y 'ciudad' e imágenes múltiples.
    const allPets = useMemo(() => {
        return mascotas.map((mascota) => {
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
                        // Evitar duplicados
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
                especie: normalizeEspecieLabel(mascota.especie),
                raza: mascota.raza,
                edad: mascota.edad,
                sexo: mascota.sexo, // <-- AÑADIDO
                ciudad: mascota.ciudad, // <-- AÑADIDO
                descripcion: mascota.descripcion,
                imageUrl: images[0], // Primera imagen como principal
                images: images, // <-- AÑADIDO: todas las imágenes
                shelter: mascota.user.name,
                user: mascota.user, // <-- AÑADIDO: información completa del usuario
            };
        });
    }, [mascotas]);

    // ACTUALIZADO: Se añaden los nuevos filtros al estado inicial.
    const [filters, setFilters] = useState({
        searchTerm: '',
        selectedEspecie: 'all',
        selectedEdad: 'all',
        selectedCiudad: 'all',
        selectedGenero: 'all',
    });

    useEffect(() => {
        const especieFromUrl = getEspecieFromUrl(url);
        if (especieFromUrl === 'all') {
            setFilters((prev) => (prev.selectedEspecie === 'all' ? prev : { ...prev, selectedEspecie: 'all' }));
            return;
        }

        const normalizedEspecie = normalizeEspecieLabel(especieFromUrl);

        setFilters((prev) => ({ ...prev, selectedEspecie: normalizedEspecie }));
    }, [url]);

    const handleFilterChange = (key: string, value: string | number | boolean) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handlePetClick = (index: number) => {
        setSelectedIndex(index);
        setIsModalOpen(true);
    };

    // Función para limpiar todos los filtros.
    const clearAllFilters = () => {
        setFilters({
            searchTerm: '',
            selectedEspecie: 'all',
            selectedEdad: 'all',
            selectedCiudad: 'all',
            selectedGenero: 'all',
        });
    };

    const filteredPets = useMemo(() => {
        // Debug: mostrar información de filtrado cuando hay filtro de edad activo
        if (filters.selectedEdad !== 'all') {
            console.log('🐕 Filtro por edad activo:', filters.selectedEdad);
            console.log('📊 Total mascotas antes del filtro:', allPets.length);
            console.log(
                '📈 Distribución de edades:',
                allPets.map((pet) => ({ nombre: pet.name, edad: pet.edad })),
            );
        }

        return allPets.filter((pet) => {
            const searchTermMatch =
                pet.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                pet.descripcion.toLowerCase().includes(filters.searchTerm.toLowerCase());

            const especieMatch = filters.selectedEspecie === 'all' || pet.especie === filters.selectedEspecie;

            // Lógica mejorada del filtro por edad con validación
            let edadMatch = true;
            if (filters.selectedEdad !== 'all') {
                const edadEnAnios = Number(pet.edad);

                // Debug: log para la primera mascota cuando hay filtro activo
                if (pet === allPets[0]) {
                    console.log(
                        `🔍 Analizando ${pet.name}: edad original="${pet.edad}", convertida=${edadEnAnios}, filtro="${filters.selectedEdad}"`,
                    );
                }

                if (isNaN(edadEnAnios)) {
                    edadMatch = false; // Si la edad no es un número válido, no coincide
                    console.log(`❌ ${pet.name}: edad inválida "${pet.edad}"`);
                } else {
                    switch (filters.selectedEdad) {
                        case 'joven':
                            edadMatch = edadEnAnios <= 2; // 0-2 años
                            break;
                        case 'adulto':
                            edadMatch = edadEnAnios > 2 && edadEnAnios <= 7; // 2-7 años
                            break;
                        case 'senior':
                            edadMatch = edadEnAnios > 7; // +7 años
                            break;
                        default:
                            edadMatch = true;
                    }

                    // Debug: log del resultado para la primera mascota
                    if (pet === allPets[0]) {
                        console.log(`📊 ${pet.name}: ${edadMatch ? '✅ coincide' : '❌ no coincide'} con filtro "${filters.selectedEdad}"`);
                    }
                }
            }

            // Lógica de filtros para ciudad y género
            const ciudadMatch = filters.selectedCiudad === 'all' || pet.ciudad === filters.selectedCiudad;
            const generoMatch = filters.selectedGenero === 'all' || pet.sexo === filters.selectedGenero;

            return searchTermMatch && especieMatch && edadMatch && ciudadMatch && generoMatch;
        });
    }, [filters, allPets]);

    const availableEspecies = useMemo(() => {
        return Array.from(new Set(allPets.map((pet) => pet.especie)));
    }, [allPets]);

    // NUEVO: Obtener ciudades únicas para el filtro.
    const availableCiudades = useMemo(() => {
        return Array.from(new Set(allPets.map((pet) => pet.ciudad)));
    }, [allPets]);

    return (
        <FavoritesProvider showNotification={addNotification}>
            <div className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
                <Head title="Mascotas" />
                <Header />
                <PetHero />

                <main className="flex-1">
                    {/* Sección principal con espaciado según PALETA */}
                    <div className="relative border-t border-blue-200/50 bg-gradient-to-br from-blue-100/80 via-green-100/60 to-blue-200/40 pt-12 pb-16 md:pt-16 md:pb-20 dark:border-blue-800/30 dark:from-blue-950/40 dark:via-green-950/30 dark:to-blue-900/50">
                        {/* Elementos decorativos según PALETA */}
                        <div className="pointer-events-none absolute inset-0 overflow-hidden">
                            <div className="absolute -top-10 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-blue-300/30 to-green-300/30 blur-3xl dark:from-blue-800/25 dark:to-green-800/25"></div>
                            <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-gradient-to-br from-green-300/25 to-blue-300/25 blur-2xl dark:from-green-800/30 dark:to-blue-800/30"></div>

                            {/* Puntos animados */}
                            <div className="absolute top-1/4 right-1/3 h-3 w-3 animate-pulse rounded-full bg-blue-400/90 shadow-lg shadow-blue-400/50 dark:bg-blue-600/90 dark:shadow-blue-600/50"></div>
                            <div className="absolute bottom-1/3 left-1/4 h-4 w-4 animate-ping rounded-full bg-green-400/80 shadow-lg shadow-green-400/50 dark:bg-green-600/80 dark:shadow-green-600/50"></div>
                        </div>

                        <div className="relative container mx-auto px-4 md:px-6">
                            {/* Componente de filtros separado para mejor performance */}
                            <PetFilters
                                filters={filters}
                                availableEspecies={availableEspecies}
                                availableCiudades={availableCiudades}
                                onFilterChange={handleFilterChange}
                                onClearAllFilters={clearAllFilters}
                            />

                            {/* Grid de mascotas */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredPets.length > 0 ? (
                                    filteredPets.map((pet, index) => (
                                        <PetCard
                                            key={pet.id}
                                            {...pet}
                                            onImageClick={() => handlePetClick(index)}
                                            onViewDetails={() => handlePetClick(index)}
                                        />
                                    ))
                                ) : (
                                    <p className="col-span-full py-16 text-center text-gray-500 dark:text-gray-400">
                                        {allPets.length === 0
                                            ? 'No hay mascotas disponibles para adopción aún.'
                                            : 'No se encontraron mascotas con estos filtros.'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
                <ThemeSwitcher hasChatbot={true} />
                <ChatbotWidget />
                <NotificationContainer />

                <CarouselModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} items={filteredPets} initialIndex={selectedIndex} />
            </div>
        </FavoritesProvider>
    );
}
