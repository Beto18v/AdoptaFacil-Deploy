// resources/js/components/comunidad/post-filters.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ListFilter, Search, X } from 'lucide-react';
import { useState } from 'react';

interface PostFiltersProps {
    onFiltersChange?: (filters: { search: string; categories: string[] }) => void;
}

export default function PostFilters({ onFiltersChange }: PostFiltersProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [tempSearch, setTempSearch] = useState('');

    const categories = [
        { id: 'Campaña', label: 'Campañas', color: 'bg-blue-500 text-blue-800 dark:bg-blue-600 dark:text-blue-300' },
        { id: 'Noticia', label: 'Noticias', color: 'bg-green-500 text-green-800 dark:bg-green-600 dark:text-green-300' },
        { id: 'Consejo', label: 'Consejos', color: 'bg-purple-500 text-purple-800 dark:bg-purple-600 dark:text-purple-300' },
        { id: 'General', label: 'General', color: 'bg-gray-500 text-gray-800 dark:bg-gray-600 dark:text-gray-300' },
    ];

    const handleCategoryToggle = (categoryId: string) => {
        const newSelectedCategories = selectedCategories.includes(categoryId)
            ? selectedCategories.filter((cat) => cat !== categoryId)
            : [...selectedCategories, categoryId];

        setSelectedCategories(newSelectedCategories);

        if (onFiltersChange) {
            onFiltersChange({
                search: searchTerm,
                categories: newSelectedCategories,
            });
        }
    };

    const handleSearch = () => {
        setSearchTerm(tempSearch);
        if (onFiltersChange) {
            onFiltersChange({
                search: tempSearch,
                categories: selectedCategories,
            });
        }
    };

    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const removeFilter = (type: 'search' | 'category', value?: string) => {
        if (type === 'search') {
            setSearchTerm('');
            setTempSearch('');
            if (onFiltersChange) {
                onFiltersChange({
                    search: '',
                    categories: selectedCategories,
                });
            }
        } else if (type === 'category' && value) {
            const newCategories = selectedCategories.filter((cat) => cat !== value);
            setSelectedCategories(newCategories);
            if (onFiltersChange) {
                onFiltersChange({
                    search: searchTerm,
                    categories: newCategories,
                });
            }
        }
    };

    const clearAllFilters = () => {
        setSearchTerm('');
        setTempSearch('');
        setSelectedCategories([]);
        if (onFiltersChange) {
            onFiltersChange({
                search: '',
                categories: [],
            });
        }
    };

    const hasActiveFilters = searchTerm || selectedCategories.length > 0;

    return (
        <div className="sticky top-24 rounded-xl border-2 border-cyan-400 bg-white p-6 shadow-lg dark:border-cyan-500 dark:bg-gray-900">
            <h3 className="mb-4 flex items-center text-lg font-bold text-gray-900 dark:text-white">
                <ListFilter className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                Filtrar Publicaciones
            </h3>

            {/* Búsqueda */}
            <div className="mb-6">
                <div className="flex gap-2">
                    <Input
                        placeholder="Buscar por palabra clave..."
                        value={tempSearch}
                        onChange={(e) => setTempSearch(e.target.value)}
                        onKeyPress={handleSearchKeyPress}
                        className="flex-1"
                    />
                    <Button
                        onClick={handleSearch}
                        size="icon"
                        className="bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    >
                        <Search className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Categorías */}
            <div className="mb-6">
                <p className="mb-3 font-semibold text-gray-900 dark:text-white">Categorías</p>
                <div className="space-y-2">
                    {categories.map((category) => (
                        <Button
                            key={category.id}
                            variant={selectedCategories.includes(category.id) ? 'default' : 'ghost'}
                            onClick={() => handleCategoryToggle(category.id)}
                            className={`w-full justify-start transition-all duration-300 ${
                                selectedCategories.includes(category.id)
                                    ? 'bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg hover:scale-105 hover:shadow-xl'
                                    : 'text-gray-700 hover:scale-102 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                        >
                            <span className={`mr-2 h-3 w-3 rounded-full ${category.color.split(' ')[0]}`}></span>
                            {category.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Filtros activos */}
            {hasActiveFilters && (
                <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Filtros activos</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFilters}
                            className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                            Limpiar todo
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {/* Filtro de búsqueda */}
                        {searchTerm && (
                            <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-sm dark:bg-blue-900/20">
                                <Search className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                <span className="flex-1 truncate text-blue-800 dark:text-blue-200">"{searchTerm}"</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFilter('search')}
                                    className="h-5 w-5 p-0 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-800"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        )}

                        {/* Filtros de categoría */}
                        {selectedCategories.map((categoryId) => {
                            const category = categories.find((cat) => cat.id === categoryId);
                            if (!category) return null;

                            return (
                                <div key={categoryId} className="flex items-center gap-2 rounded-full bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800">
                                    <span className={`h-2 w-2 rounded-full ${category.color.split(' ')[0]}`}></span>
                                    <span className="flex-1 text-gray-700 dark:text-gray-300">{category.label}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFilter('category', categoryId)}
                                        className="h-5 w-5 p-0 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
