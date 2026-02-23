import { useState } from 'react';

interface ProductCardProps {
    name: string;
    description: string;
    price: string;
    imageUrl: string | null;
}

export default function ProductCard({ name, description, price, imageUrl }: ProductCardProps) {
    const [imageSrc, setImageSrc] = useState(
        imageUrl || 'https://images.unsplash.com/photo-1598133894005-6d5c4b6f634d?auto=format&fit=crop&w=800&q=60',
    );
    const defaultImage = '';
    const handleImageError = () => {
        setImageSrc(defaultImage);
    };

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800">
            {/* Imagen con overlay */}
            <div className="relative overflow-hidden">
                <img
                    src={imageSrc}
                    alt={name}
                    className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={handleImageError}
                />
                {/* Overlay sutil en hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

                {/* Badge de nuevo en la esquina */}
                <div className="absolute top-4 right-4 rounded-full bg-gradient-to-r from-green-500 to-green-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                    Nuevo
                </div>
            </div>

            {/* Contenido de la tarjeta */}
            <div className="p-8">
                {/* Nombre con gradiente */}
                <h3 className="mb-3 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-gray-300">
                    {name}
                </h3>

                {/* Separador decorativo */}
                <div className="mb-4 h-0.5 w-16 rounded-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300 group-hover:w-24"></div>

                {/* Descripción */}
                <p className="mb-4 line-clamp-2 leading-relaxed text-gray-600 dark:text-gray-300">{description}</p>

                {/* Precio destacado */}
                <div className="mb-6">
                    <p className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-3xl font-bold text-transparent dark:from-green-400 dark:to-green-500">
                        {price}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Precio final</p>
                </div>
            </div>

            {/* Efecto de brillo en hover */}
            <div className="absolute inset-0 translate-x-[-100%] -skew-x-12 transform rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:translate-x-[200%] group-hover:opacity-100"></div>
        </div>
    );
}
