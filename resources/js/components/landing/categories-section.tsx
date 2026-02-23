import CategoryCard from './category-card';

interface Category {
    emoji: string;
    title: string;
    count: string;
    link: string;
}

export default function CategoriesSection({ categories }: { categories: Category[] }) {
    return (
        <section className="relative bg-white pt-30 pb-20 md:pt-36 md:pb-24 dark:bg-gray-900">
            {/* Elementos decorativos de fondo */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-gradient-to-br from-green-400/10 to-blue-400/10 blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 blur-2xl"></div>

                {/* Puntos decorativos */}
                <div className="absolute top-32 left-20 h-2 w-2 animate-pulse rounded-full bg-green-400/60"></div>
                <div className="absolute top-48 right-32 h-3 w-3 animate-ping rounded-full bg-blue-400/40"></div>
                <div className="absolute bottom-32 left-1/3 h-2 w-2 animate-pulse rounded-full bg-purple-400/50"></div>
            </div>

            <div className="relative container mx-auto px-6">
                {/* Header mejorado */}
                <div className="mb-16 text-center">
                    <div className="mb-6 inline-flex items-center rounded-full bg-gradient-to-r from-green-500 to-blue-500 px-8 py-3 text-sm font-semibold text-white shadow-lg">
                        <span className="mr-2 text-lg">🐾</span>
                        Encuentra tu compañero ideal
                        <span className="ml-2 text-lg">💖</span>
                    </div>
                    <h2 className="mb-6 text-4xl font-bold text-gray-800 lg:text-5xl dark:text-white">
                        Explora por
                        <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent"> categoría</span>
                    </h2>
                    <div className="mx-auto mb-4 h-1 w-24 rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>
                    <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600 dark:text-gray-300">
                        Descubre mascotas increíbles esperando un hogar lleno de amor.
                        <span className="font-semibold text-green-600 dark:text-green-400"> Cada una tiene su propia historia que contar.</span>
                    </p>
                </div>

                {/* Grid de categorías optimizado para 2 elementos */}
                <div className="mx-auto mb-16 max-w-5xl">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
                        {categories.map((category, index) => (
                            <CategoryCard key={index} {...category} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
