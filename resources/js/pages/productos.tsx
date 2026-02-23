/**
 * Página del catálogo público de productos
 *
 * Esta vista permite a los visitantes explorar todos los productos disponibles
 * en el marketplace de AdoptaFácil, ofrecidos por aliados comerciales:
 *
 * Características principales:
 * - Catálogo completo de productos con información detallada
 * - Sistema de filtros por categoría, precio y vendedor
 * - Modal de galería para visualizar múltiples imágenes
 * - Información de contacto del vendedor/aliado
 * - Diseño responsive optimizado para todos los dispositivos
 *
 * Funcionalidades de filtrado:
 * - Filtro por rango de precios
 * - Búsqueda por nombre de producto
 * - Filtro por vendedor/aliado específico
 * - Ordenamiento por precio y fecha
 *
 * Interacciones:
 * - Galería de imágenes con carousel
 * - Información completa del producto
 * - Datos de contacto para compra directa
 * - Integración con sistema de whatsapp/teléfono
 *
 * @author Equipo AdoptaFácil
 * @version 1.0.0
 * @since 2024
 */

import ChatbotWidget from '@/components/chatbot-widget';
import Footer from '@/components/landing/footer';
import Header from '@/components/landing/header';
import ProductCard from '@/components/productos/product-card';
import ProductFilters from '@/components/productos/product-filters';
import ProductHero from '@/components/productos/product-hero';
import { ThemeSwitcher } from '@/components/theme-switcher';
import CarouselModal from '@/components/ui/carousel-modal';
import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

// Interfaces para tipado (sin cambios)
interface Product {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen?: string;
    shelter: string;
    user: {
        id: number;
        name: string;
    };
}

interface ProductosProps {
    productos: Product[];
}

export default function Productos({ productos = [] }: ProductosProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const allProducts = useMemo(() => {
        return productos.map((producto) => ({
            id: producto.id,
            type: 'product' as const,
            nombre: producto.nombre || '',
            category: 'Productos',
            precio: producto.precio || 0,
            imageUrl: producto.imagen ? `/storage/${producto.imagen}` : 'https://images.unsplash.com/photo-1591946614725-3b9b0d5b248b?q=80&w=400',
            descripcion: producto.descripcion || '',
            seller: producto.user?.name || 'Usuario',
            shelter: producto.user?.name || 'Usuario',
            user: producto.user,
        }));
    }, [productos]);

    const availableFilters = useMemo(() => {
        const categories = Array.from(new Set(allProducts.map((p) => p.category)));
        const prices = allProducts.map((p) => p.precio).filter((p) => p > 0); // Filtrar precios válidos
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 150000;

        return {
            categories,
            priceRange: [0, maxPrice] as [number, number],
        };
    }, [allProducts]);

    // Estado para controlar si ya se inicializó el precio máximo
    const [isPriceInitialized, setIsPriceInitialized] = useState(false);

    // El estado de los filtros con inicialización correcta del precio máximo
    const [filters, setFilters] = useState(() => ({
        searchTerm: '',
        category: 'Todas',
        priceLimit: availableFilters.priceRange[1] || 150000, // Usar el precio máximo disponible o un valor por defecto
    }));

    // Actualizar el precio límite solo una vez cuando los productos estén disponibles
    const maxPriceValue = availableFilters.priceRange[1];
    useEffect(() => {
        if (maxPriceValue > 0 && !isPriceInitialized) {
            setFilters((prev) => ({
                ...prev,
                priceLimit: maxPriceValue,
            }));
            setIsPriceInitialized(true);
        }
    }, [maxPriceValue, isPriceInitialized]);

    const handleFilterChange = (key: string, value: string | number | boolean) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleProductClick = (index: number) => {
        setSelectedIndex(index);
        setIsModalOpen(true);
    };

    const filteredProducts = useMemo(() => {
        return allProducts.filter((product) => {
            const searchTermMatch = (product.nombre || '').toLowerCase().includes((filters.searchTerm || '').toLowerCase());
            // Se usa `filters.category` en lugar de `filters.selectedCategory`
            const categoryMatch = filters.category === 'Todas' || product.category === filters.category;
            const priceMatch = product.precio <= filters.priceLimit;
            return searchTermMatch && categoryMatch && priceMatch;
        });
    }, [filters, allProducts]);

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
            <Head title="Productos" />
            <Header />

            <main className="flex-1">
                <ProductHero />
                {/* Sección principal con espaciado según PALETA */}
                <div className="relative border-t border-blue-200/50 bg-gradient-to-br from-blue-100/80 via-green-100/60 to-blue-200/40 pt-30 pb-20 md:pt-36 md:pb-24 dark:border-blue-800/30 dark:from-blue-950/40 dark:via-green-950/30 dark:to-blue-900/50">
                    {/* Elementos decorativos según PALETA */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -top-10 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-blue-300/30 to-green-300/30 blur-3xl dark:from-blue-800/25 dark:to-green-800/25"></div>
                        <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-gradient-to-br from-green-300/25 to-blue-300/25 blur-2xl dark:from-green-800/30 dark:to-blue-800/30"></div>

                        {/* Puntos animados */}
                        <div className="absolute top-1/4 right-1/3 h-3 w-3 animate-pulse rounded-full bg-blue-400/90 shadow-lg shadow-blue-400/50 dark:bg-blue-600/90 dark:shadow-blue-600/50"></div>
                        <div className="absolute bottom-1/3 left-1/4 h-4 w-4 animate-ping rounded-full bg-green-400/80 shadow-lg shadow-green-400/50 dark:bg-green-600/80 dark:shadow-green-600/50"></div>
                    </div>

                    <div className="relative container mx-auto px-4 md:px-6">
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                            <aside className="lg:col-span-1">
                                <ProductFilters
                                    priceRange={availableFilters.priceRange}
                                    onFilterChange={handleFilterChange}
                                    currentFilters={filters}
                                />
                            </aside>
                            <section className="lg:col-span-3">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map((product, index) => (
                                            <ProductCard
                                                key={product.id}
                                                {...product}
                                                onImageClick={() => handleProductClick(index)}
                                                onViewDetails={() => handleProductClick(index)}
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-full py-16 text-center">
                                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                                {allProducts.length === 0
                                                    ? 'No hay productos disponibles aún.'
                                                    : 'No se encontraron productos con estos filtros.'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
            <ThemeSwitcher hasChatbot={true} />
            <ChatbotWidget />

            <CarouselModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} items={filteredProducts} initialIndex={selectedIndex} />
        </div>
    );
}
