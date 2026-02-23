import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, ShieldCheck } from 'lucide-react';

interface ProductCardProps {
    id: number;
    nombre: string;
    descripcion: string;
    shelter: string;
    precio: number;
    imageUrl: string;
    user?: {
        id: number;
        name: string;
        avatar?: string;
    };
    onImageClick?: () => void;
    onViewDetails?: () => void;
}

export default function ProductCard({ nombre, shelter, descripcion, precio, imageUrl, user, onImageClick, onViewDetails }: ProductCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800">
            {/* Badge de producto según PALETA */}
            <div className="absolute top-4 right-4 z-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                Producto
            </div>

            <div className="cursor-pointer" onClick={onImageClick}>
                <img
                    src={imageUrl}
                    alt={nombre}
                    width={400}
                    height={300}
                    className="h-60 w-full object-cover transition-all duration-300 group-hover:scale-105"
                />
            </div>
            <div className="bg-white p-6 dark:bg-gray-800 dark:text-gray-200">
                <div className="space-y-4">
                    <div>
                        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">{nombre}</h3>
                        <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{descripcion}</p>
                        <div className="mt-3 flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />
                            <Avatar className="mr-2 h-6 w-6 ring-2 ring-green-200 dark:ring-green-800">
                                <AvatarImage src={user?.avatar ? `/storage/${user.avatar}` : undefined} alt={user?.name} />
                                <AvatarFallback className="bg-gradient-to-r from-green-500 to-green-600 text-xs text-white">
                                    {user?.name?.substring(0, 2).toUpperCase() || 'AL'}
                                </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-blue-600 dark:text-blue-400">Vendido por: {shelter}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        {/* Precio con gradiente */}
                        <div className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-2xl font-bold text-transparent dark:from-green-400 dark:to-green-500">
                            ${precio ? precio.toLocaleString('es-CO') : '0'}
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
                >
                    <Heart className="h-5 w-5 text-gray-500 transition-colors hover:fill-red-500 hover:text-red-500" />
                </Button>
            </div>
        </div>
    );
}
