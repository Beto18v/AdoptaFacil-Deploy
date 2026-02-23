import ParticlesHero from '../particles-hero';

/**
 * Componente Hero optimizado para la página de refugios
 *
 * Proporciona una introducción visual atractiva al directorio de refugios
 * y organizaciones de rescate animal con diseño responsive y accesible.
 *
 * @author Equipo AdoptaFácil
 * @version 2.0.0 - Actualizado según PALETA
 */
export default function ShelterHero() {
    return (
        <section className="relative min-h-auto bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 pt-30 pb-8 md:pt-36 md:pb-10 dark:from-green-600 dark:via-blue-700 dark:to-purple-800">
            <ParticlesHero />

            {/* Elementos decorativos de fondo según PALETA */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
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

            {/* Contenido principal */}
            <div className="relative container mx-auto px-6 text-center">
                {/* Título principal con efectos según PALETA */}
                <div className="mb-8">
                    <h1 className="bg-gradient-to-r from-white to-blue-100 bg-clip-text pb-2 text-4xl font-bold tracking-tight text-transparent drop-shadow-lg md:text-5xl lg:text-6xl">
                        Apoya refugios
                    </h1>

                    {/* Línea decorativa */}
                    <div className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                </div>

                {/* Descripción */}
                <p className="mx-auto max-w-2xl text-xl leading-relaxed font-medium text-white/90">
                    Descubre organizaciones cercanas, conoce su labor y apóyalas.
                    <br />
                    <span className="font-semibold text-blue-100">¡Ayuda a darles visibilidad con donaciones o voluntariado!</span>
                </p>
            </div>
        </section>
    );
}
