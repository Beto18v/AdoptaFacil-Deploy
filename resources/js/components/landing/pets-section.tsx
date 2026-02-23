import { ArrowRight, Heart, Star } from 'lucide-react';
import PetCard from './pet-card';

// Definimos la interfaz para el array de mascotas
interface Pet {
    name: string;
    breed: string;
    age: string;
    description: string;
    imageUrl: string | null;
}

export default function PetsSection({ pets, totalMascotas }: { pets: Pet[]; totalMascotas: number }) {
    return (
        <section className="relative border-t border-blue-200/50 bg-gradient-to-br from-blue-100/80 via-green-100/60 to-blue-200/40 pt-30 pb-20 md:pt-36 md:pb-24 dark:border-blue-800/30 dark:from-blue-950/40 dark:via-green-950/30 dark:to-blue-900/50">
            {/* Elementos decorativos mejorados */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 h-40 w-40 rounded-full bg-gradient-to-br from-blue-300/30 to-green-300/30 blur-3xl dark:from-blue-800/25 dark:to-green-800/25"></div>
                <div className="absolute top-40 right-20 h-32 w-32 rounded-full bg-gradient-to-br from-green-300/35 to-blue-300/35 blur-2xl dark:from-green-800/30 dark:to-blue-800/30"></div>
                <div className="absolute bottom-20 left-1/4 h-28 w-28 rounded-full bg-gradient-to-br from-blue-400/25 to-green-400/25 blur-2xl dark:from-blue-700/20 dark:to-green-700/20"></div>
                <div className="absolute top-1/2 right-1/3 h-20 w-20 rounded-full bg-gradient-to-br from-green-200/25 to-blue-200/25 blur-xl dark:from-green-900/20 dark:to-blue-900/20"></div>

                {/* Puntos animados más prominentes */}
                <div className="absolute top-32 right-32 h-3 w-3 animate-pulse rounded-full bg-blue-400/90 shadow-lg shadow-blue-400/50 dark:bg-blue-600/90 dark:shadow-blue-600/50"></div>
                <div className="absolute top-48 left-20 h-4 w-4 animate-ping rounded-full bg-green-400/80 shadow-lg shadow-green-400/50 dark:bg-green-600/80 dark:shadow-green-600/50"></div>
                <div className="absolute right-1/4 bottom-32 h-3 w-3 animate-pulse rounded-full bg-blue-500/70 shadow-lg shadow-blue-500/40 dark:bg-blue-500/80 dark:shadow-blue-500/40"></div>
                <div className="absolute right-16 bottom-40 h-2 w-2 animate-bounce rounded-full bg-green-300/80 dark:bg-green-700/80"></div>
            </div>

            <div className="relative container mx-auto px-6">
                {/* Header destacado con mejor spacing */}
                <div className="mb-20 text-center">
                    <div className="mb-8 inline-flex items-center rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 px-8 py-4 text-sm font-bold text-white shadow-lg">
                        <Star className="mr-3 h-5 w-5 fill-current text-yellow-300" />
                        Destacados de la semana
                        <Star className="ml-3 h-5 w-5 fill-current text-yellow-300" />
                    </div>

                    <h2 className="mb-8 text-4xl font-bold tracking-tight text-gray-800 lg:text-6xl dark:text-white">
                        Mascotas que buscan
                        <br />
                        <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                            un hogar lleno de amor
                        </span>
                    </h2>

                    {/* Línea decorativa */}
                    <div className="mx-auto mb-6 h-1 w-32 rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>

                    <p className="mx-auto max-w-4xl text-xl leading-relaxed text-gray-600 dark:text-gray-300">
                        Aquí tienes una muestra de nuestras mascotas más recientes que buscan un hogar lleno de amor.
                        <br />
                        <span className="font-bold text-green-600 dark:text-green-400"> ¿Serás tú su nueva familia?</span>
                    </p>
                </div>

                {/* Stats rápidas mejoradas */}
                <div className="mb-20 grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="rounded-2xl border border-green-200/50 bg-white/95 p-6 text-center shadow-xl ring-1 ring-green-100/60 backdrop-blur-sm dark:border-green-800/40 dark:bg-gray-900/95 dark:ring-green-900/40">
                        <div className="mb-3 bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-4xl font-bold text-transparent dark:from-green-400 dark:to-green-500">
                            {totalMascotas}
                        </div>
                        <p className="font-semibold text-gray-700 dark:text-gray-200">Mascotas disponibles</p>
                        <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-green-400 to-green-500 dark:from-green-500 dark:to-green-600"></div>
                    </div>
                    <div className="rounded-2xl border border-blue-200/50 bg-white/95 p-6 text-center shadow-xl ring-1 ring-blue-100/60 backdrop-blur-sm dark:border-blue-800/40 dark:bg-gray-900/95 dark:ring-blue-900/40">
                        <div className="mb-3 bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-4xl font-bold text-transparent dark:from-blue-400 dark:to-blue-500">
                            100%
                        </div>
                        <p className="font-semibold text-gray-700 dark:text-gray-200">Verificadas y sanas</p>
                        <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600"></div>
                    </div>
                    <div className="rounded-2xl border border-blue-200/50 bg-white/95 p-6 text-center shadow-xl ring-1 ring-blue-100/60 backdrop-blur-sm dark:border-green-800/40 dark:bg-gray-900/95 dark:ring-green-900/40">
                        <div className="mb-3 bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-4xl font-bold text-transparent dark:from-blue-400 dark:to-green-400">
                            24/7
                        </div>
                        <p className="font-semibold text-gray-700 dark:text-gray-200">Soporte post-adopción</p>
                        <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-blue-400 to-green-400 dark:from-blue-500 dark:to-green-500"></div>
                    </div>
                </div>

                {/* Grid de mascotas con mejor spacing */}
                <div className="mb-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
                    {pets.map((pet, index) => (
                        <PetCard key={index} {...pet} />
                    ))}
                </div>

                {/* Call to action prominente mejorado */}
                <div className="text-center">
                    <div className="hover:shadow-3xl relative mx-auto max-w-2xl rounded-3xl bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 p-8 text-white shadow-2xl transition-all duration-300 dark:from-green-600 dark:via-blue-600 dark:to-purple-700">
                        <div className="relative z-10">
                            <Heart className="mx-auto mb-6 h-16 w-16 animate-pulse fill-current drop-shadow-lg" />
                            <h3 className="mb-4 text-3xl font-bold drop-shadow-md">¿Listo para adoptar?</h3>
                            <p className="mx-auto mb-8 max-w-md text-center text-lg leading-relaxed opacity-95">
                                Descubre todas nuestras mascotas disponibles y encuentra a tu compañero perfecto.
                                <span className="font-semibold"> ¡Tu nueva familia te está esperando!</span>
                            </p>
                            <a
                                href="/mascotas"
                                className="inline-flex items-center rounded-full bg-white px-10 py-4 font-bold text-green-600 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-gray-50 hover:shadow-2xl"
                            >
                                <span className="mr-2">🐾</span>
                                Ver todas las mascotas
                                <ArrowRight className="ml-3 h-6 w-6" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
