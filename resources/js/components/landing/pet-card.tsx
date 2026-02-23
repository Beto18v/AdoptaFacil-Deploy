import { useState } from 'react';

interface PetCardProps {
    name: string;
    breed: string;
    age: string;
    description: string;
    imageUrl: string | null;
}

export default function PetCard({ name, breed, age, description, imageUrl }: PetCardProps) {
    const [imageSrc, setImageSrc] = useState(
        imageUrl || 'https://images.unsplash.com/photo-1598133894005-6d5c4b6f634d?auto=format&fit=crop&w=800&q=60',
    );
    const defaultImage = 'https://images.unsplash.com/photo-1598133894005-6d5c4b6f634d?auto=format&fit=crop&w=800&q=60';
    const handleImageError = () => {
        setImageSrc(defaultImage);
    };

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl transition-all duration-300 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800">
            {/* Imagen con overlay */}
            <div className="relative overflow-hidden">
                <img
                    src={imageSrc}
                    alt={`${name} - ${breed}`}
                    className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onError={handleImageError}
                />
                {/* Overlay sutil en hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                {/* Badge de estado en la esquina */}
                <div className="absolute top-4 right-4 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                    Disponible
                </div>
            </div>

            {/* Contenido de la tarjeta */}
            <div className="p-8">
                {/* Nombre con gradiente */}
                <h3 className="mb-3 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-gray-300">
                    {name}
                </h3>

                {/* Separador decorativo */}
                <div className="mb-4 h-0.5 w-16 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300 group-hover:w-24"></div>

                {/* Información de raza y edad */}
                <div className="mb-4 flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                    <span className="text-blue-500">🐾</span>
                    <p className="font-semibold">
                        {breed} • {age}
                    </p>
                </div>

                {/* Descripción */}
                <p className="mb-6 line-clamp-3 leading-relaxed text-gray-700 dark:text-gray-300">{description}</p>
            </div>
        </div>
    );
}
