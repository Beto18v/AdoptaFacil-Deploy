// Tarjeta unificada para mostrar productos y mascotas con acciones específicas por rol
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';

// Tipo para items de producto/mascota
export type CardItem = {
    id: number;
    nombre: string;
    tipo: 'producto' | 'mascota';
    descripcion: string;
    precio: number | null;
    imagen?: string;
    user_id: number;
    user?: {
        id: number;
        name: string;
        avatar?: string;
    };
};

// Props del componente tarjeta
interface ProductoMascotaCardProps {
    item: CardItem;
    onDelete: (item: CardItem) => void;
    onEdit: (item: CardItem) => void;
}

export default function ProductoMascotaCard({ item, onDelete, onEdit }: ProductoMascotaCardProps) {
    // Obtenemos el usuario autenticado para determinar el rol
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    // Determinación de roles y permisos
    const esPropietario = user.role === 'aliado' && user.id === item.user_id;
    const esAdmin = user.role === 'admin';

    return (
        <>
            <div
                className="group hover:shadow-3xl relative flex h-full flex-col overflow-hidden rounded-3xl bg-white/95 p-6 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] dark:bg-gray-800/95"
                style={{ minHeight: '550px' }}
            >
                {/* Elementos decorativos */}
                <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500/10 to-transparent"></div>
                <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-purple-300/10 to-transparent"></div>

                {/* Contenedor de la imagen - Altura fija */}
                <div className="relative mb-4 h-48 w-full shrink-0 overflow-hidden rounded-2xl">
                    <img
                        src={item.imagen ? `/storage/${item.imagen}` : 'https://via.placeholder.com/300'}
                        alt={item.nombre}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div
                        className={`absolute top-3 right-3 inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold shadow-lg backdrop-blur-sm ${
                            item.tipo === 'producto'
                                ? 'bg-blue-500/90 text-white dark:bg-blue-600/90'
                                : 'bg-pink-500/90 text-white dark:bg-pink-600/90'
                        }`}
                    >
                        <span className="drop-shadow-sm">{item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}</span>
                    </div>
                </div>

                {/* Contenido que crece - Ocupa el espacio restante */}
                <div className="relative flex flex-1 flex-col justify-between">
                    {/* Información superior */}
                    <div className="space-y-4">
                        <h3 className="line-clamp-2 text-lg font-bold text-gray-900 dark:text-white">{item.nombre}</h3>
                        <p className="line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{item.descripcion}</p>
                    </div>

                    {/* Información inferior - Precio, Avatar y Acciones */}
                    <div className="shrink-0 space-y-4">
                        {/* Precio/Estado */}
                        <div>
                            <span
                                className={`inline-flex items-center rounded-xl px-4 py-2 text-lg font-semibold shadow-sm ${
                                    item.tipo === 'producto'
                                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                        : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                                }`}
                            >
                                {item.tipo === 'producto'
                                    ? item.precio !== null && item.precio !== undefined
                                        ? `$${item.precio.toLocaleString('es-CO')}`
                                        : 'Precio no disponible'
                                    : '💝 En Adopción'}
                            </span>
                        </div>

                        {/* ✨ SECCIÓN "PUBLICADO POR" CON AVATAR ✨ */}
                        <div className="border-t border-gray-200/50 pt-4 dark:border-gray-700/50">
                            {esPropietario ? (
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                    <Avatar className="h-8 w-8 border-2 border-blue-200 dark:border-blue-700">
                                        <AvatarImage src={user?.avatar ? `/storage/${user.avatar}` : undefined} alt={user?.name} />
                                        <AvatarFallback className="bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                            {user?.name?.substring(0, 2).toUpperCase() || 'TU'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span>
                                        Publicado por <span className="font-semibold text-blue-600 dark:text-blue-400">ti</span>
                                    </span>
                                </div>
                            ) : (
                                item.user?.name && (
                                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                        <Avatar className="h-8 w-8 border-2 border-gray-200 dark:border-gray-600">
                                            <AvatarImage src={item.user?.avatar ? `/storage/${item.user.avatar}` : undefined} alt={item.user.name} />
                                            <AvatarFallback className="bg-gray-100 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                {item.user.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span>
                                            Publicado por: <span className="font-semibold text-gray-800 dark:text-gray-200">{item.user.name}</span>
                                        </span>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Botones de Acción */}
                        <div>
                            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-700/50">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Acciones:</span>
                                    <div className="flex gap-2">
                                        {/* Botón de Editar */}
                                        {esPropietario && (
                                            <button
                                                onClick={() => onEdit(item)}
                                                className="rounded-xl bg-blue-500 p-2 text-white shadow-md transition-all duration-300 hover:scale-110 hover:bg-blue-600 hover:shadow-lg"
                                                aria-label="Editar"
                                            >
                                                <Pencil className="h-5 w-5" />
                                            </button>
                                        )}
                                        {/* Botón de Eliminar */}
                                        {(esAdmin || esPropietario) && (
                                            <button
                                                onClick={() => onDelete(item)}
                                                className="rounded-xl bg-red-500 p-2 text-white shadow-md transition-all duration-300 hover:scale-110 hover:bg-red-600 hover:shadow-lg"
                                                aria-label="Eliminar"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
