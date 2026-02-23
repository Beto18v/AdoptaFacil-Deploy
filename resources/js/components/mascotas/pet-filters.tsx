import React, { useEffect, useState } from 'react';

/**
 * Componente de filtros para la página de mascotas
 *
 * Proporciona filtros avanzados con diseño según PALETA de AdoptaFácil:
 * - Filtro de búsqueda por texto
 * - Filtros por especie, ciudad, edad y género
 * - Píldoras de filtros activos con colores específicos
 * - Diseño responsive con elementos decorativos
 * - Optimizado para cambios rápidos de tema
 *
 * @author Equipo AdoptaFácil
 * @version 1.1.0 - Optimizado para tema responsive
 */

interface PetFiltersProps {
    filters: {
        searchTerm: string;
        selectedEspecie: string;
        selectedEdad: string;
        selectedCiudad: string;
        selectedGenero: string;
    };
    availableEspecies: string[];
    availableCiudades: string[];
    onFilterChange: (key: string, value: string | number | boolean) => void;
    onClearAllFilters: () => void;
}

function PetFilters({ filters, availableEspecies, availableCiudades, onFilterChange, onClearAllFilters }: PetFiltersProps) {
    // Estado para detectar el tema actual
    const [isDark, setIsDark] = useState(false);

    // Detectar cambios de tema
    useEffect(() => {
        const checkTheme = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };

        // Verificar tema inicial
        checkTheme();

        // Observer para cambios en la clase 'dark'
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    // Variable para saber si hay algún filtro activo
    const anyFilterActive =
        filters.selectedEspecie !== 'all' || filters.selectedEdad !== 'all' || filters.selectedCiudad !== 'all' || filters.selectedGenero !== 'all';

    // Estilos dinámicos basados en el tema
    const getContainerStyles = () => ({
        borderColor: isDark ? 'rgb(30 64 175 / 0.3)' : 'rgb(147 197 253 / 0.5)',
        background: isDark
            ? 'linear-gradient(to bottom right, rgb(30 58 138 / 0.4), rgb(22 163 74 / 0.3), rgb(88 28 135 / 0.5))'
            : 'linear-gradient(to bottom right, rgb(239 246 255 / 0.8), rgb(240 253 244 / 0.6), rgb(237 233 254 / 0.4))',
        boxShadow: isDark ? '0 25px 50px -12px rgb(0 0 0 / 0.5)' : '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    });

    const getInputStyles = (borderColor: string) => ({
        borderColor: isDark ? `${borderColor.replace('/ 0.7', '/ 0.6')}` : borderColor,
        backgroundColor: isDark ? 'rgb(31 41 55 / 0.9)' : 'rgb(255 255 255 / 0.9)',
        color: isDark ? 'rgb(255 255 255)' : 'inherit',
    });

    const getDecorationStyles = (colors: string) => ({
        background: isDark ? colors.replace('/30', '/20').replace('/20', '/15') : colors,
    });

    return (
        <>
            {/* Contenedor de filtros con tema dinámico */}
            <div className="mb-8 rounded-2xl border p-6 shadow-lg backdrop-blur-sm transition-all duration-200" style={getContainerStyles()}>
                {/* Decoraciones de fondo con tema dinámico */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                    <div
                        className="absolute -top-4 -right-4 h-24 w-24 rounded-full blur-xl transition-all duration-200"
                        style={getDecorationStyles('linear-gradient(to bottom right, rgb(147 197 253 / 0.3), rgb(134 239 172 / 0.3))')}
                    ></div>
                    <div
                        className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full blur-lg transition-all duration-200"
                        style={getDecorationStyles('linear-gradient(to top right, rgb(134 239 172 / 0.2), rgb(196 181 253 / 0.2))')}
                    ></div>
                </div>

                {/* Título de filtros */}
                <div className="relative z-10 mb-6">
                    <h3 className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-lg font-bold text-transparent">
                        🔍 Filtrar mascotas
                    </h3>
                </div>

                {/* Grid de filtros */}
                <div className="relative z-10 flex flex-wrap items-center gap-4">
                    {/* Input de búsqueda optimizado */}
                    <div className="relative flex-grow sm:flex-grow-0">
                        <input
                            type="text"
                            placeholder="🔎 Buscar por nombre o descripción..."
                            value={filters.searchTerm}
                            onChange={(e) => onFilterChange('searchTerm', e.target.value)}
                            className="w-full rounded-xl border-2 px-4 py-3 font-medium shadow-md transition-all duration-200 hover:shadow-md focus:shadow-lg focus:ring-2"
                            style={getInputStyles('rgb(147 197 253 / 0.7)')}
                        />
                    </div>

                    {/* Select de Especie optimizado */}
                    <select
                        value={filters.selectedEspecie}
                        onChange={(e) => onFilterChange('selectedEspecie', e.target.value)}
                        className="rounded-xl border-2 px-4 py-3 font-semibold shadow-md transition-all duration-200 hover:shadow-md focus:shadow-lg focus:ring-2"
                        style={getInputStyles('rgb(147 197 253 / 0.7)')}
                    >
                        <option value="all">🐾 Todas las especies</option>
                        {availableEspecies.map((especie) => (
                            <option key={especie} value={especie}>
                                {especie === 'Perros' ? '🐕' : especie === 'Gatos' ? '🐱' : '🐾'} {especie}
                            </option>
                        ))}
                    </select>

                    {/* Select de Ciudad optimizado */}
                    <select
                        value={filters.selectedCiudad}
                        onChange={(e) => onFilterChange('selectedCiudad', e.target.value)}
                        className="rounded-xl border-2 px-4 py-3 font-semibold shadow-md transition-all duration-200 hover:shadow-md focus:shadow-lg focus:ring-2"
                        style={getInputStyles('rgb(134 239 172 / 0.7)')}
                    >
                        <option value="all">📍 Todas las ciudades</option>
                        {availableCiudades.map((ciudad) => (
                            <option key={ciudad} value={ciudad}>
                                📍 {ciudad}
                            </option>
                        ))}
                    </select>

                    {/* Select de Edad optimizado */}
                    <select
                        value={filters.selectedEdad}
                        onChange={(e) => onFilterChange('selectedEdad', e.target.value)}
                        className="rounded-xl border-2 px-4 py-3 font-semibold shadow-md transition-all duration-200 hover:shadow-md focus:shadow-lg focus:ring-2"
                        style={getInputStyles('rgb(252 211 77 / 0.7)')}
                    >
                        <option value="all">⏰ Todas las edades</option>
                        <option value="joven">🐶 Joven (0-2 años)</option>
                        <option value="adulto">🐕‍🦺 Adulto (2-7 años)</option>
                        <option value="senior">🐕‍🦳 Senior (7+ años)</option>
                    </select>

                    {/* Select de Género optimizado */}
                    <select
                        value={filters.selectedGenero}
                        onChange={(e) => onFilterChange('selectedGenero', e.target.value)}
                        className="rounded-xl border-2 px-4 py-3 font-semibold shadow-md transition-all duration-200 hover:shadow-md focus:shadow-lg focus:ring-2"
                        style={getInputStyles('rgb(196 181 253 / 0.7)')}
                    >
                        <option value="all">⚤ Todos los géneros</option>
                        <option value="Macho">♂️ Macho</option>
                        <option value="Hembra">♀️ Hembra</option>
                    </select>
                </div>
            </div>

            {/* Sección optimizada para filtros activos */}
            {anyFilterActive && (
                <div
                    className="mb-8 rounded-xl border p-4 shadow-md backdrop-blur-sm transition-all duration-200"
                    style={{
                        borderColor: isDark ? 'rgb(55 65 81 / 0.5)' : 'rgb(229 231 235 / 0.5)',
                        backgroundColor: isDark ? 'rgb(31 41 55 / 0.6)' : 'rgb(255 255 255 / 0.6)',
                    }}
                >
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                        <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-sm font-bold text-transparent">
                            ✨ Filtros Activos:
                        </span>

                        {/* Píldora mejorada para Especie */}
                        {filters.selectedEspecie !== 'all' && (
                            <span className="group flex items-center gap-2 rounded-full border-2 border-blue-300 bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-2 text-sm font-semibold text-blue-800 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-blue-600 dark:from-blue-900 dark:to-blue-800 dark:text-blue-200">
                                🐾 {filters.selectedEspecie}
                                <button
                                    onClick={() => onFilterChange('selectedEspecie', 'all')}
                                    className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-200 font-bold text-blue-800 transition-all duration-200 hover:scale-110 hover:bg-blue-300 dark:bg-blue-700 dark:text-blue-200 dark:hover:bg-blue-600"
                                    title="Quitar filtro de especie"
                                >
                                    ✕
                                </button>
                            </span>
                        )}

                        {/* Píldora mejorada para Ciudad */}
                        {filters.selectedCiudad !== 'all' && (
                            <span className="group flex items-center gap-2 rounded-full border-2 border-green-300 bg-gradient-to-r from-green-100 to-green-200 px-4 py-2 text-sm font-semibold text-green-800 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-green-600 dark:from-green-900 dark:to-green-800 dark:text-green-200">
                                📍 {filters.selectedCiudad}
                                <button
                                    onClick={() => onFilterChange('selectedCiudad', 'all')}
                                    className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-200 font-bold text-green-800 transition-all duration-200 hover:scale-110 hover:bg-green-300 dark:bg-green-700 dark:text-green-200 dark:hover:bg-green-600"
                                    title="Quitar filtro de ciudad"
                                >
                                    ✕
                                </button>
                            </span>
                        )}

                        {/* Píldora mejorada para Edad */}
                        {filters.selectedEdad !== 'all' && (
                            <span className="group flex items-center gap-2 rounded-full border-2 border-yellow-300 bg-gradient-to-r from-yellow-100 to-yellow-200 px-4 py-2 text-sm font-semibold text-yellow-800 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-yellow-600 dark:from-yellow-900 dark:to-yellow-800 dark:text-yellow-200">
                                ⏰ {filters.selectedEdad}
                                <button
                                    onClick={() => onFilterChange('selectedEdad', 'all')}
                                    className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-200 font-bold text-yellow-800 transition-all duration-200 hover:scale-110 hover:bg-yellow-300 dark:bg-yellow-700 dark:text-yellow-200 dark:hover:bg-yellow-600"
                                    title="Quitar filtro de edad"
                                >
                                    ✕
                                </button>
                            </span>
                        )}

                        {/* Píldora mejorada para Género */}
                        {filters.selectedGenero !== 'all' && (
                            <span className="group flex items-center gap-2 rounded-full border-2 border-purple-300 bg-gradient-to-r from-purple-100 to-purple-200 px-4 py-2 text-sm font-semibold text-purple-800 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-purple-600 dark:from-purple-900 dark:to-purple-800 dark:text-purple-200">
                                ⚤ {filters.selectedGenero}
                                <button
                                    onClick={() => onFilterChange('selectedGenero', 'all')}
                                    className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-200 font-bold text-purple-800 transition-all duration-200 hover:scale-110 hover:bg-purple-300 dark:bg-purple-700 dark:text-purple-200 dark:hover:bg-purple-600"
                                    title="Quitar filtro de género"
                                >
                                    ✕
                                </button>
                            </span>
                        )}

                        {/* Botón de Limpieza General mejorado */}
                        <button
                            onClick={onClearAllFilters}
                            className="group flex items-center gap-2 rounded-full border-2 border-red-300 bg-gradient-to-r from-red-100 to-red-200 px-4 py-2 text-sm font-bold text-red-800 shadow-lg transition-all duration-300 hover:scale-105 hover:from-red-200 hover:to-red-300 hover:shadow-xl dark:border-red-600 dark:from-red-900 dark:to-red-800 dark:text-red-200 dark:hover:from-red-800 dark:hover:to-red-700"
                            title="Limpiar todos los filtros"
                        >
                            🗑️ Limpiar filtros
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

// Optimización con React.memo para evitar re-renders innecesarios y mejorar respuesta al tema
export default React.memo(PetFilters, (prevProps, nextProps) => {
    // Solo re-renderizar si cambian los filtros, especies o ciudades disponibles
    return (
        prevProps.filters.searchTerm === nextProps.filters.searchTerm &&
        prevProps.filters.selectedEspecie === nextProps.filters.selectedEspecie &&
        prevProps.filters.selectedEdad === nextProps.filters.selectedEdad &&
        prevProps.filters.selectedCiudad === nextProps.filters.selectedCiudad &&
        prevProps.filters.selectedGenero === nextProps.filters.selectedGenero &&
        JSON.stringify(prevProps.availableEspecies) === JSON.stringify(nextProps.availableEspecies) &&
        JSON.stringify(prevProps.availableCiudades) === JSON.stringify(nextProps.availableCiudades)
    );
});
