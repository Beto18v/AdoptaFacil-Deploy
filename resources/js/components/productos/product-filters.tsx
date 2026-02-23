import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, ListFilter, Search } from 'lucide-react';

interface ProductFiltersProps {
    // Función para manejar todos los cambios de filtro
    onFilterChange: (key: string, value: string | number) => void;
    // Estado actual de los filtros para sincronizar la UI
    currentFilters: {
        searchTerm: string;
        priceLimit: number;
    };
    // Rango de precios para el slider [min_para_slider, max_para_slider]
    priceRange: [number, number];
    // Precio mínimo real de productos (opcional, si no se pasa usa un valor por defecto)
    minProductPrice?: number;
}

export default function ProductFilters({ onFilterChange, currentFilters, priceRange, minProductPrice }: ProductFiltersProps) {
    const percentage = priceRange[1] > priceRange[0] ? ((currentFilters.priceLimit - priceRange[0]) / (priceRange[1] - priceRange[0])) * 100 : 0;

    // Usar el precio mínimo real de productos, o un valor por defecto si no se pasa
    const actualMinPrice = minProductPrice || 20000; // Por defecto $20.000

    return (
        // Contenedor con gradiente sutil y decoraciones
        <div className="sticky top-24 rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50/80 via-green-50/60 to-purple-50/40 shadow-lg backdrop-blur-sm dark:border-blue-800/30 dark:from-blue-950/40 dark:via-green-950/30 dark:to-purple-900/50 dark:shadow-2xl">
            {/* Decoraciones de fondo */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br from-blue-300/30 to-green-300/30 blur-xl dark:from-blue-700/20 dark:to-green-700/20"></div>
                <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-gradient-to-tr from-green-300/20 to-purple-300/20 blur-lg dark:from-green-800/15 dark:to-purple-800/15"></div>
            </div>

            {/* Contenido principal */}
            <div className="relative z-10 p-6">
                {/* Título con gradiente */}
                <h3 className="mb-6 flex items-center bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-lg font-bold text-transparent">
                    <ListFilter className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Filtros
                </h3>

                <div className="grid gap-8">
                    {/* 1. Filtro de Búsqueda por palabra clave */}
                    <div className="grid gap-3">
                        <Label htmlFor="search" className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300">
                            <Search className="h-4 w-4" />
                            Buscar productos
                        </Label>
                        <div className="relative">
                            <Input
                                id="search"
                                placeholder="Escribe para buscar..."
                                value={currentFilters.searchTerm}
                                onChange={(e) => onFilterChange('searchTerm', e.target.value)}
                                className="rounded-lg border-blue-200/50 bg-white/80 transition-all duration-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 dark:border-blue-700/50 dark:bg-gray-800/80 dark:focus:border-blue-500 dark:focus:ring-blue-700/50"
                            />
                        </div>
                    </div>

                    {/* 2. Filtro por Rango de Precios */}
                    <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="price" className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300">
                                <DollarSign className="h-4 w-4" />
                                Precio máximo
                            </Label>
                            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-lg font-bold text-transparent">
                                ${currentFilters.priceLimit ? currentFilters.priceLimit.toLocaleString('es-CO') : '0'}
                            </span>
                        </div>

                        {/* Slider personalizado con gradiente de 3 colores */}
                        <div className="relative">
                            {/* Track de fondo gris para la parte no seleccionada */}
                            <div className="h-3 w-full rounded-full bg-gray-400 shadow-inner dark:bg-gray-700"></div>

                            {/* Progreso del slider con gradiente suave solo en la parte seleccionada */}
                            <div
                                className="absolute top-0 h-3 rounded-full bg-gradient-to-r from-blue-500 via-green-500 to-purple-600 shadow-lg transition-all duration-300"
                                style={{
                                    width: `${percentage}%`,
                                }}
                            ></div>

                            {/* Input range invisible sobre el track */}
                            <input
                                id="price"
                                type="range"
                                min={priceRange[0]}
                                max={priceRange[1]}
                                value={currentFilters.priceLimit}
                                step={5000}
                                onChange={(e) => onFilterChange('priceLimit', Number(e.target.value))}
                                className="absolute top-0 h-3 w-full cursor-pointer opacity-0"
                                style={{
                                    background: 'transparent',
                                }}
                            />

                            {/* Thumb personalizado */}
                            <div
                                className="absolute top-1/2 z-10 h-6 w-6 -translate-y-1/2 cursor-pointer rounded-full border-2 border-white shadow-lg transition-all duration-300 hover:scale-110 dark:border-gray-200"
                                style={{
                                    left: `calc(${percentage}% - 12px)`,
                                    background: percentage > 0 ? 'linear-gradient(135deg, #3b82f6, #10b981)' : '#6b7280',
                                }}
                            ></div>
                        </div>

                        {/* Etiquetas de rango clickeables */}
                        <div className="mt-2 flex justify-between text-sm">
                            <button
                                onClick={() => onFilterChange('priceLimit', actualMinPrice)}
                                className="cursor-pointer text-gray-500 transition-colors duration-200 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
                                title="Mostrar solo el producto más económico"
                            >
                                ${actualMinPrice.toLocaleString('es-CO')}
                            </button>
                            <button
                                onClick={() => onFilterChange('priceLimit', priceRange[1])}
                                className="cursor-pointer text-gray-500 transition-colors duration-200 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                            >
                                ${priceRange[1].toLocaleString('es-CO')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
