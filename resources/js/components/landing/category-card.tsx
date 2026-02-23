import { Link } from '@inertiajs/react';
import { ArrowRight, Heart } from 'lucide-react';

interface CategoryCardProps {
    emoji: string;
    title: string;
    count: string;
    link: string;
}

export default function CategoryCard({ emoji, title, count, link }: CategoryCardProps) {
    const isPerro = title.toLowerCase() === 'perros';

    // Usar gradientes de la paleta oficial
    const gradientClass = isPerro ? 'from-blue-500 to-blue-700' : 'from-green-500 to-green-700';

    const bgClass = isPerro
        ? 'from-blue-50/80 to-blue-100/80 dark:from-blue-900/20 dark:to-blue-800/20'
        : 'from-green-50/80 to-green-100/80 dark:from-green-900/20 dark:to-green-800/20';

    const hoverGradient = isPerro ? 'from-blue-600 to-blue-800' : 'from-green-600 to-green-800';

    return (
        <Link
            href={link}
            className="group hover:shadow-3xl relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-2xl transition-all duration-500 hover:scale-[1.02] dark:border-gray-700 dark:bg-gray-800"
        >
            {/* Fondo con gradiente sutil */}
            <div className={`absolute inset-0 bg-gradient-to-br ${bgClass} opacity-60 transition-all duration-500 group-hover:opacity-80`}></div>

            {/* Elementos decorativos */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-gradient-to-br from-white/10 to-transparent opacity-50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12"></div>
                <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-gradient-to-tr from-white/5 to-transparent opacity-30"></div>
            </div>

            {/* Contenido */}
            <div className="relative z-10">
                {/* Icono principal con efectos */}
                <div
                    className={`mb-8 inline-flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br ${gradientClass} shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-gradient-to-br group-hover:${hoverGradient}`}
                >
                    <span className="text-5xl drop-shadow-lg">{emoji}</span>
                </div>

                {/* Título y descripción */}
                <div className="mb-8">
                    <h3 className="mb-4 text-3xl font-bold tracking-tight text-gray-800 dark:text-white">{title}</h3>
                    <div className="flex items-center space-x-3">
                        <Heart className="h-5 w-5 animate-pulse text-red-500" />
                        <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                            <span className={`${isPerro ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'} font-bold`}>
                                {count}
                            </span>{' '}
                            esperando un hogar
                        </p>
                    </div>
                </div>

                {/* Call to action mejorado */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Explorar ahora</span>
                        <div
                            className={`h-0.5 w-16 bg-gradient-to-r ${gradientClass} rounded-full transition-all duration-300 group-hover:w-24`}
                        ></div>
                    </div>
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${gradientClass} shadow-lg transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110 group-hover:shadow-xl`}
                    >
                        <ArrowRight className="h-6 w-6 text-white transition-transform duration-300 group-hover:translate-x-0.5" />
                    </div>
                </div>
            </div>

            {/* Efecto de brillo en hover */}
            <div className="absolute inset-0 translate-x-[-100%] -skew-x-12 transform rounded-3xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:translate-x-[200%] group-hover:opacity-100"></div>
        </Link>
    );
}
