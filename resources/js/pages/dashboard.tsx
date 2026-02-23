/**
 * Dashboard principal de AdoptaFácil
 *
 * Panel de control administrativo que proporciona una vista general
 * del estado de la plataforma con métricas clave y estadísticas:
 *
 * Métricas principales:
 * - Total de mascotas registradas
 * - Total de adopciones exitosas
 * - Total de donaciones recibidas
 * - Total de usuarios registrados
 *
 * Funcionalidades de análisis:
 * - Comparación con período anterior (% de cambio)
 * - Gráfico de distribución de mascotas por especie
 * - Gráfico de adopciones por mes
 * - Tabla de actividad reciente
 *
 * Componentes utilizados:
 * - StatCard: Tarjetas de estadísticas con indicadores de cambio
 * - Chart: Gráficos interactivos para visualización de datos
 * - RecentTable: Tabla de actividades recientes
 *
 * @author Equipo AdoptaFácil
 * @version 1.0.0
 * @since 2024
 */

import ChatbotWidget from '@/components/chatbot-widget';
import { ThemeSwitcher } from '@/components/theme-switcher';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { RecentTable } from '../components/recent-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardStats {
    totalMascotas: number;
    totalAdopciones: number;
    totalDonaciones: number;
    totalUsuarios: number;
    cambioMascotas: number;
    cambioAdopciones: number;
    cambioDonaciones: number;
    cambioUsuarios: number;
}

interface DistribucionTipo {
    name: string;
    value: number;
    total: number;
}

interface AdopcionMes {
    mes: string;
    adopciones: number;
}

interface ActividadReciente {
    id: number;
    tipo: string;
    mascota: string;
    usuario: string;
    estado: string;
    fecha: string;
}

interface DashboardProps {
    stats: DashboardStats;
    distribucionTipos: DistribucionTipo[];
    adopcionesPorMes: AdopcionMes[];
    actividadesRecientes: ActividadReciente[];
}

export default function Dashboard({ stats, actividadesRecientes }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <main className="relative flex-1 overflow-y-auto bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-6 dark:from-green-600 dark:via-blue-700 dark:to-purple-800">
                {/* Elementos decorativos de fondo */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    {/* Círculos decorativos grandes */}
                    <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
                    <div className="absolute top-1/4 -right-32 h-80 w-80 rounded-full bg-blue-300/10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-purple-300/10 blur-3xl"></div>

                    {/* Puntos animados */}
                    <div className="absolute top-20 right-20 h-3 w-3 animate-pulse rounded-full bg-white/20 shadow-lg"></div>
                    <div className="absolute top-1/3 left-1/4 h-4 w-4 animate-ping rounded-full bg-white/30 shadow-lg"></div>
                    <div className="absolute right-1/3 bottom-32 h-2 w-2 animate-pulse rounded-full bg-white/25 shadow-md"></div>
                </div>

                <div className="relative z-10 container mx-auto">
                    {/* Título de la página con gradiente */}
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold tracking-tight drop-shadow-lg md:text-5xl lg:text-6xl">
                            <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Panel de Control</span>
                        </h1>
                        <p className="mt-4 text-xl leading-relaxed font-medium text-white/90">Monitorea la plataforma AdoptaFácil</p>

                        {/* Línea decorativa */}
                        <div className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                    </div>

                    {/* Tarjetas de estadísticas mejoradas */}
                    <div className="mb-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Tarjeta Mascotas */}
                        <div className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] dark:bg-gray-800/95">
                            {/* Elementos decorativos */}
                            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500/20 to-transparent"></div>
                            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-blue-300/10 to-transparent"></div>

                            {/* Contenido */}
                            <div className="relative">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-blue-700 p-4 shadow-xl">
                                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                            />
                                        </svg>
                                    </div>
                                    <div
                                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                                            stats.cambioMascotas >= 0
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}
                                    >
                                        {stats.cambioMascotas >= 0 ? '+' : ''}
                                        {stats.cambioMascotas}%
                                    </div>
                                </div>
                                <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Total Mascotas</h3>
                                <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.totalMascotas.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Tarjeta Adopciones */}
                        <div className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] dark:bg-gray-800/95">
                            {/* Elementos decorativos */}
                            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-green-500/20 to-transparent"></div>
                            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-green-300/10 to-transparent"></div>

                            {/* Contenido */}
                            <div className="relative">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="rounded-2xl bg-gradient-to-r from-green-500 to-green-700 p-4 shadow-xl">
                                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                            />
                                        </svg>
                                    </div>
                                    <div
                                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                                            stats.cambioAdopciones >= 0
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}
                                    >
                                        {stats.cambioAdopciones >= 0 ? '+' : ''}
                                        {stats.cambioAdopciones}%
                                    </div>
                                </div>
                                <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Adopciones</h3>
                                <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.totalAdopciones.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Tarjeta Donaciones */}
                        <div className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] dark:bg-gray-800/95">
                            {/* Elementos decorativos */}
                            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-purple-500/20 to-transparent"></div>
                            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-purple-300/10 to-transparent"></div>

                            {/* Contenido */}
                            <div className="relative">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-purple-700 p-4 shadow-xl">
                                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                            />
                                        </svg>
                                    </div>
                                    <div
                                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                                            stats.cambioDonaciones >= 0
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}
                                    >
                                        {stats.cambioDonaciones >= 0 ? '+' : ''}
                                        {stats.cambioDonaciones}%
                                    </div>
                                </div>
                                <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Donaciones</h3>
                                <p className="text-3xl font-bold text-gray-800 dark:text-white">${stats.totalDonaciones.toLocaleString('es-CO')}</p>
                            </div>
                        </div>

                        {/* Tarjeta Usuarios */}
                        <div className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] dark:bg-gray-800/95">
                            {/* Elementos decorativos */}
                            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500/20 to-green-500/10"></div>
                            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-blue-300/10 to-green-300/5"></div>

                            {/* Contenido */}
                            <div className="relative">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-green-600 p-4 shadow-xl">
                                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    </div>
                                    <div
                                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                                            stats.cambioUsuarios >= 0
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}
                                    >
                                        {stats.cambioUsuarios >= 0 ? '+' : ''}
                                        {stats.cambioUsuarios}%
                                    </div>
                                </div>
                                <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Usuarios</h3>
                                <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.totalUsuarios.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de actividades recientes mejorada */}
                    <div className="relative overflow-hidden rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm dark:bg-gray-800/95">
                        {/* Elementos decorativos para la tabla */}
                        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/5 blur-2xl"></div>
                        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-tr from-green-500/10 to-blue-500/5 blur-xl"></div>

                        <div className="relative">
                            {/* Header de la sección */}
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Actividades Recientes</h2>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Últimas acciones en la plataforma</p>
                                </div>
                                <div className="rounded-2xl bg-gradient-to-r from-blue-500/20 to-green-500/20 p-3">
                                    <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Línea decorativa */}
                            <div className="mb-6 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>

                            <RecentTable activities={actividadesRecientes} />
                        </div>
                    </div>
                </div>
            </main>

            <ThemeSwitcher hasChatbot={true} />
            <ChatbotWidget />
        </AppLayout>
    );
}
