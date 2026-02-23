import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import FormularioAdopcionModal from '@/components/ui/formulario-adopcion-modal';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Heart, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

interface PetCardProps {
    id: number;
    name: string;
    especie: string;
    raza?: string;
    edad: number;
    descripcion: string;
    imageUrl: string;
    shelter: string;
    sexo?: string;
    ciudad?: string;
    user?: {
        id: number;
        name: string;
        avatar?: string;
    };
    onImageClick?: () => void;
    onViewDetails?: () => void;
}

export default function PetCard({
    id,
    name,
    especie,
    raza,
    edad,
    descripcion,
    imageUrl,
    shelter,
    sexo,
    ciudad,
    user,
    onImageClick,
    onViewDetails,
}: PetCardProps) {
    const [showAdoptionForm, setShowAdoptionForm] = useState(false);
    const { isFavorite, toggleFavorite, isLoading, isInitialized } = useFavorites();

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.stopPropagation();

        // Verificar si el contexto está inicializado
        if (!isInitialized) {
            console.log('Contexto de favoritos no inicializado aún');
            return;
        }

        await toggleFavorite(id);
    };

    const isCurrentlyFavorite = isFavorite(id);

    // Función para obtener el color del badge según la especie
    const getSpeciesBadgeColor = (especie: string) => {
        switch (especie.toLowerCase()) {
            case 'perro':
                return 'from-blue-500 to-blue-600';
            case 'gato':
                return 'from-green-500 to-green-600';
            default:
                return 'from-purple-500 to-purple-600';
        }
    };

    return (
        <>
            <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                {/* Badge de especie según PALETA */}
                <div
                    className={`absolute top-4 right-4 z-10 rounded-full bg-gradient-to-r ${getSpeciesBadgeColor(especie)} px-3 py-1 text-xs font-semibold text-white shadow-lg`}
                >
                    {especie}
                </div>

                <div className="cursor-pointer" onClick={onImageClick}>
                    <img
                        src={imageUrl}
                        alt={name}
                        width={400}
                        height={300}
                        className="h-60 w-full object-cover transition-all duration-300 group-hover:scale-105"
                    />
                </div>

                <div className="bg-white p-6 dark:bg-gray-800 dark:text-gray-200">
                    <div className="space-y-4">
                        <div>
                            {/* Información de raza y edad */}
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                {raza || 'Sin raza específica'} • {edad} {edad === 1 ? 'año' : 'años'}
                            </p>

                            {/* Nombre destacado */}
                            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">{name}</h3>

                            {/* Información adicional */}
                            <div className="mb-2 flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-300">
                                {sexo && (
                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        {sexo}
                                    </span>
                                )}
                                {ciudad && (
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                        📍 {ciudad}
                                    </span>
                                )}
                            </div>

                            {/* Descripción */}
                            <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{descripcion}</p>

                            {/* Información del refugio */}
                            <div className="mt-3 flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />
                                <Avatar className="mr-2 h-6 w-6 ring-2 ring-green-200 dark:ring-green-800">
                                    <AvatarImage src={user?.avatar ? `/storage/${user.avatar}` : undefined} alt={user?.name} />
                                    <AvatarFallback className="bg-gradient-to-r from-green-500 to-green-600 text-xs text-white">
                                        {user?.name?.substring(0, 2).toUpperCase() || 'AL'}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-blue-600 dark:text-blue-400">Publicado por: {shelter}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            {/* Estado de adopción con gradiente */}
                            <div className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-sm font-bold text-transparent dark:from-green-400 dark:to-green-500">
                                Disponible para adopción
                            </div>

                            {/* Botón con gradiente */}
                            <Button
                                size="sm"
                                className="z-20 bg-gradient-to-r from-green-500 to-green-700 px-4 py-2 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-green-600 hover:to-green-800 hover:shadow-xl"
                                onClick={onViewDetails}
                            >
                                Ver detalle
                            </Button>
                        </div>
                    </div>

                    {/* Botón de favorito reposicionado */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 left-2 z-20 bg-white/80 backdrop-blur-sm hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
                        onClick={handleFavoriteClick}
                        disabled={isLoading || !isInitialized}
                        title={isCurrentlyFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    >
                        <Heart
                            className={`h-5 w-5 transition-all duration-200 ${
                                isCurrentlyFavorite ? 'scale-110 fill-red-500 text-red-500' : 'text-gray-600 hover:scale-105 hover:text-red-500'
                            } ${isLoading ? 'animate-pulse opacity-50' : ''}`}
                        />
                    </Button>
                </div>
            </div>

            {/* Formulario de Adopción */}
            <FormularioAdopcionModal
                show={showAdoptionForm}
                onClose={() => setShowAdoptionForm(false)}
                mascota={{
                    id,
                    nombre: name,
                    type: 'pet',
                }}
            />
        </>
    );
}
