import ParticlesComponent from '../particles';

export default function HeroSection() {
    return (
        <section className="relative min-h-auto bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 pt-30 pb-8 md:pt-36 md:pb-10 dark:from-green-600 dark:via-blue-700 dark:to-purple-800">
            <ParticlesComponent />
            {/* Elementos decorativos de fondo */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Círculos grandes */}
                <div className="absolute -top-10 -left-10 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
                <div className="absolute -right-10 -bottom-10 h-80 w-80 rounded-full bg-white/5 blur-3xl"></div>

                {/* Círculos medianos */}
                <div className="absolute top-1/4 right-1/4 h-32 w-32 rounded-full bg-blue-300/10 blur-2xl"></div>
                <div className="absolute bottom-1/4 left-1/4 h-24 w-24 rounded-full bg-purple-300/10 blur-xl"></div>

                {/* Puntos animados */}
                <div className="absolute top-20 left-20 h-2 w-2 animate-pulse rounded-full bg-white/20"></div>
                <div className="absolute top-40 right-32 h-3 w-3 animate-ping rounded-full bg-white/30"></div>
                <div className="absolute bottom-32 left-16 h-2 w-2 animate-ping rounded-full bg-white/25"></div>
                <div className="absolute right-20 bottom-20 h-1 w-1 animate-pulse rounded-full bg-white/30"></div>
            </div>

            <div className="relative container mx-auto px-6 text-center">
                {/* Título principal con efectos */}
                <div className="mb-8">
                    <h1 className="mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text pb-2 text-4xl font-bold tracking-tight text-transparent drop-shadow-lg md:text-5xl lg:text-6xl">
                        Encuentra a tu nuevo
                        <br />
                        <span className="text-white drop-shadow-2xl">mejor amigo</span>
                    </h1>

                    {/* Línea decorativa */}
                    <div className="mx-auto mt-6 h-1 w-24 bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                </div>

                {/* Subtítulo */}
                <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed font-medium text-white/90">
                    Conectamos a mascotas necesitadas con hogares amorosos desde 2025.
                    <br />
                    <span className="font-semibold text-blue-100">¡Cambia una vida y transforma la tuya!</span>
                </p>

                {/* Estadísticas rápidas */}
                <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
                    <div className="text-center">
                        <div className="mb-2 text-3xl font-bold text-white drop-shadow-lg">1000+</div>
                        <p className="font-medium text-white/80">Mascotas rescatadas</p>
                    </div>
                    <div className="text-center">
                        <div className="mb-2 text-3xl font-bold text-white drop-shadow-lg">500+</div>
                        <p className="font-medium text-white/80">Familias felices</p>
                    </div>
                    <div className="text-center">
                        <div className="mb-2 text-3xl font-bold text-white drop-shadow-lg">24/7</div>
                        <p className="font-medium text-white/80">Soporte disponible</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
