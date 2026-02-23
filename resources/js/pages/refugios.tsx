/**
 * Página del directorio público de refugios
 *
 * Esta vista presenta el directorio completo de refugios de animales registrados
 * en AdoptaFácil, permitiendo a los usuarios conocer y contactar organizaciones:
 *
 * Características principales:
 * - Directorio completo de refugios verificados
 * - Información detallada de cada refugio (nombre, ubicación, contacto)
 * - Estadísticas de donaciones recibidas por refugio
 * - Sistema de ordenamiento por popularidad y donaciones
 * - Diseño responsive con tarjetas informativas
 *
 * Información mostrada por refugio:
 * - Nombre y descripción de la organización
 * - Ubicación geográfica y datos de contacto
 * - Total de donaciones recibidas
 * - Enlaces a redes sociales y sitio web
 * - Información del usuario responsable
 *
 * Funcionalidades:
 * - Vista en grid adaptable según tamaño de pantalla
 * - Hero section con información general
 * - Estado de carga para refugios sin datos
 * - Integración con sistema de donaciones
 *
 * @author Equipo AdoptaFácil
 * @version 1.0.0
 * @since 2024
 */

import ChatbotWidget from '@/components/chatbot-widget';
import Footer from '@/components/landing/footer';
import Header from '@/components/landing/header';
import ShelterCard from '@/components/refugio/shelter-card';
import ShelterHero from '@/components/refugio/shelter-hero';
import { ThemeSwitcher } from '@/components/theme-switcher';
// 1. Importa el tipo `Shelter` desde tu archivo de tipos
import { type Shelter } from '@/types';
import { Head, usePage } from '@inertiajs/react';

export default function Refugios() {
    // 3. Usa el tipo importado para los props
    const { shelters } = usePage().props as unknown as { shelters: Shelter[] };

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
            <Head title="Refugios" />
            <Header />
            <ShelterHero />

            <main className="flex-1">
                {/* Sección principal con espaciado según PALETA */}
                <div className="relative border-t border-blue-200/50 bg-gradient-to-br from-blue-100/80 via-green-100/60 to-blue-200/40 py-12 md:py-16 dark:border-blue-800/30 dark:from-blue-950/40 dark:via-green-950/30 dark:to-blue-900/50">
                    {/* Elementos decorativos según PALETA */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -top-10 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-blue-300/30 to-green-300/30 blur-3xl dark:from-blue-800/25 dark:to-green-800/25"></div>
                        <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-gradient-to-br from-green-300/25 to-blue-300/25 blur-2xl dark:from-green-800/30 dark:to-blue-800/30"></div>

                        {/* Puntos animados */}
                        <div className="absolute top-1/4 right-1/3 h-3 w-3 animate-pulse rounded-full bg-blue-400/90 shadow-lg shadow-blue-400/50 dark:bg-blue-600/90 dark:shadow-blue-600/50"></div>
                        <div className="absolute bottom-1/3 left-1/4 h-4 w-4 animate-ping rounded-full bg-green-400/80 shadow-lg shadow-green-400/50 dark:bg-green-600/80 dark:shadow-green-600/50"></div>
                    </div>

                    <div className="relative container mx-auto px-4 md:px-6">
                        {shelters && shelters.length > 0 ? (
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {shelters.map((shelter) => (
                                    <ShelterCard key={shelter.id} shelter={shelter} />
                                ))}
                            </div>
                        ) : (
                            <div className="mt-16 text-center text-gray-500 dark:text-gray-400">
                                <h2 className="text-2xl font-semibold">Aún no hay refugios</h2>
                                <p className="mt-2">Vuelve pronto para ver las fundaciones aliadas a nuestra causa.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
            <ThemeSwitcher hasChatbot={true} />
            <ChatbotWidget />
        </div>
    );
}
