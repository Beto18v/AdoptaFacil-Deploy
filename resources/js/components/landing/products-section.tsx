import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import ProductCard from './product-card';

interface Product {
    name: string;
    description: string;
    price: string;
    imageUrl: string | null;
}

export default function ProductsSection({ products }: { products: Product[] }) {
    return (
        <section className="relative bg-white pt-30 pb-20 md:pt-36 md:pb-24 dark:bg-gray-900">
            {/* Elementos decorativos de fondo mejorados */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-10 right-10 h-40 w-40 rounded-full bg-gradient-to-br from-blue-400/10 to-green-400/10 blur-3xl"></div>
                <div className="absolute bottom-20 left-10 h-32 w-32 rounded-full bg-gradient-to-br from-green-400/10 to-purple-400/10 blur-2xl"></div>
                <div className="absolute top-1/2 left-1/2 h-24 w-24 rounded-full bg-gradient-to-br from-purple-400/5 to-blue-400/5 blur-xl"></div>

                {/* Puntos decorativos */}
                <div className="absolute top-24 left-16 h-2 w-2 animate-pulse rounded-full bg-blue-400/60"></div>
                <div className="absolute top-48 right-24 h-3 w-3 animate-ping rounded-full bg-green-400/40"></div>
                <div className="absolute bottom-32 left-1/3 h-2 w-2 animate-pulse rounded-full bg-purple-400/50"></div>
            </div>

            <div className="relative container mx-auto px-6">
                {/* Header con diseño atractivo mejorado */}
                <div className="mb-20 text-center">
                    <div className="mb-8 inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 px-8 py-4 text-sm font-bold text-white shadow-lg">
                        <ShoppingBag className="mr-3 h-5 w-5" />
                        Todo para tu mascota
                        <Sparkles className="ml-3 h-5 w-5" />
                    </div>

                    <h2 className="mb-8 text-4xl font-bold tracking-tight text-gray-800 lg:text-6xl dark:text-white">
                        Productos y servicios
                        <br />
                        <span className="bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
                            de calidad premium
                        </span>
                    </h2>

                    {/* Línea decorativa */}
                    <div className="mx-auto mb-6 h-1 w-32 rounded-full bg-gradient-to-r from-blue-500 via-green-500 to-purple-500"></div>

                    <p className="mx-auto max-w-4xl text-xl leading-relaxed text-gray-600 dark:text-gray-300">
                        Descubre una muestra de nuestros productos más recientes para cuidar y consentir a tu mascota.
                        <br />
                        <span className="font-bold text-blue-600 dark:text-blue-400"> Calidad garantizada por nuestros aliados verificados.</span>
                    </p>
                </div>

                {/* Beneficios destacados mejorados */}
                <div className="mb-20 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 text-center transition-all hover:scale-105 hover:shadow-lg dark:border-blue-800/50 dark:bg-blue-900/20">
                        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                            <span className="text-2xl text-white">🚚</span>
                        </div>
                        <p className="mb-2 font-bold text-gray-800 dark:text-gray-200">Envío gratis</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">En compras +$50.000</p>
                        <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
                    </div>
                    <div className="rounded-2xl border border-green-100 bg-green-50/50 p-6 text-center transition-all hover:scale-105 hover:shadow-lg dark:border-green-800/50 dark:bg-green-900/20">
                        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                            <span className="text-2xl text-white">✅</span>
                        </div>
                        <p className="mb-2 font-bold text-gray-800 dark:text-gray-200">Calidad garantizada</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Productos verificados</p>
                        <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-gradient-to-r from-green-500 to-green-600"></div>
                    </div>
                    <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-6 text-center transition-all hover:scale-105 hover:shadow-lg dark:border-purple-800/50 dark:bg-purple-900/20">
                        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                            <span className="text-2xl text-white">💝</span>
                        </div>
                        <p className="mb-2 font-bold text-gray-800 dark:text-gray-200">Precios justos</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Directo del aliado</p>
                        <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-gradient-to-r from-purple-500 to-purple-600"></div>
                    </div>
                    <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-6 text-center transition-all hover:scale-105 hover:shadow-lg dark:border-orange-800/50 dark:bg-orange-900/20">
                        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                            <span className="text-2xl text-white">🏆</span>
                        </div>
                        <p className="mb-2 font-bold text-gray-800 dark:text-gray-200">Apoyo local</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Aliados verificados</p>
                        <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"></div>
                    </div>
                </div>

                {/* Grid de productos con mejor spacing */}
                <div className="mb-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
                    {products.map((product, index) => (
                        <div key={index} className="group">
                            <ProductCard {...product} />
                        </div>
                    ))}
                </div>

                {/* Call to action para productos mejorado */}
                <div className="text-center">
                    <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200/50 bg-gradient-to-br from-white via-blue-50/30 to-green-50/30 p-8 shadow-2xl dark:border-gray-600/50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
                        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
                            <div className="text-left">
                                <div className="mb-6 inline-flex items-center rounded-full bg-gradient-to-r from-green-500 to-blue-500 px-6 py-2 text-sm font-semibold text-white shadow-lg">
                                    <span className="mr-2">🤝</span>
                                    Únete a nosotros
                                </div>
                                <h3 className="mb-6 text-3xl font-bold text-gray-800 dark:text-white">¿Eres un aliado comercial?</h3>
                                <p className="mb-8 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                                    Únete a nuestra red de aliados y ofrece tus productos y servicios a miles de familias que aman a sus mascotas.
                                    <span className="font-semibold text-green-600 dark:text-green-400"> ¡Haz crecer tu negocio con nosotros!</span>
                                </p>
                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <a
                                        href="/productos"
                                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-green-500 px-8 py-4 font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                                    >
                                        <span className="mr-2">🛍️</span>
                                        Ver todos los productos
                                        <ArrowRight className="ml-3 h-5 w-5" />
                                    </a>
                                    <a
                                        href="/register?role=aliado"
                                        className="border-gradient-to-r inline-flex items-center justify-center rounded-xl border-2 border-gray-300 px-8 py-4 font-semibold text-gray-700 transition-all duration-300 hover:scale-105 hover:border-green-500 hover:text-green-600 dark:border-gray-600 dark:text-gray-300 dark:hover:border-green-400 dark:hover:text-green-400"
                                    >
                                        <span className="mr-2">🚀</span>
                                        Ser aliado comercial
                                    </a>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="mx-auto inline-flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 via-green-100 to-purple-100 text-8xl shadow-xl transition-transform hover:scale-110 dark:from-blue-900/50 dark:via-green-900/50 dark:to-purple-900/50">
                                    🛍️
                                </div>
                                <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">Más de 100 aliados confían en nosotros</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
