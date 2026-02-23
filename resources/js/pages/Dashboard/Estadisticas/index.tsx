import ChatbotWidget from '@/components/chatbot-widget';
import { SpeciesDonutChart } from '@/components/species-donut-chart';
import { ThemeSwitcher } from '@/components/theme-switcher';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';
import { Chart } from '../../../components/chart';

interface MonthlyStat {
    month: string;
    adoptions: number;
    returns: number;
    success: number;
}

interface GeneralStats {
    totalAdoptions: number;
    averageMonthly: number;
    successRate: number;
    pendingRequests: number;
}

interface AdoptionData {
    mes: string;
    adopciones: number;
}

interface SpeciesDistribution {
    name: string;
    value: number;
    total: number;
}

interface Props {
    generalStats: GeneralStats;
    monthlyStats: MonthlyStat[];
    adopcionesPorMes: AdoptionData[];
    distribucionTipos: SpeciesDistribution[];
    motivosRechazo: { motivo: string; cantidad: number }[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Estadísticas',
        href: '/estadisticas',
    },
];

export default function AdoptionStats({ generalStats, monthlyStats, adopcionesPorMes, distribucionTipos, motivosRechazo }: Props) {
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);

    const [tipoReporte, setTipoReporte] = useState<'general' | 'rechazos'>('general');

    const totalGatos = distribucionTipos.find((item) => item.name.toLowerCase() === 'gato')?.total ?? 0;

    const totalPerros = distribucionTipos.find((item) => item.name.toLowerCase() === 'perro')?.total ?? 0;

    const descargarReportePDF = async () => {
        setIsGeneratingPdf(true);
        setPdfError(null);

        try {
            // Obtener fechas actuales del ultimo año
            const fechaFin = new Date();
            const fechaInicio = new Date();
            fechaInicio.setFullYear(fechaFin.getFullYear() - 1);

            const response = await axios.post(
                '/estadisticas/generar-pdf', // Asegura que se recoja la ruta
                {
                    fecha_inicio: fechaInicio.toISOString().split('T')[0],
                    fecha_fin: fechaFin.toISOString().split('T')[0],
                },
                {
                    responseType: 'blob',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/pdf',
                    },
                },
            );

            // Crear blob y descargar
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `reporteEstadisticas${new Date().getTime()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            // descarga exitosa
            alert('Reporte descargado correctamente');
        } catch (err: unknown) {
            console.error('Error al generar el pdf:', err);
            let mensaje = 'Error al generar el reporte. Por favor, intente nuevamente.';

            if (axios.isAxiosError(err)) {
                // Si es un error de axios podemos intentar leer el mensaje de la respuesta
                mensaje = err.response?.data?.message ?? err.message ?? mensaje;
            } else if (err instanceof Error) {
                mensaje = err.message || mensaje;
            }

            setPdfError(mensaje);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const descargarReporteRechazos = async () => {
        setIsGeneratingPdf(true);
        setPdfError(null);

        try {
            const fechaFin = new Date();
            const fechaInicio = new Date();
            fechaInicio.setFullYear(fechaFin.getFullYear() - 1);

            const response = await axios.post(
                '/estadisticas/generar-pdf-rechazos',
                {
                    fecha_inicio: fechaInicio.toISOString().split('T')[0],
                    fecha_fin: fechaFin.toISOString().split('T')[0],
                },
                {
                    responseType: 'blob',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/pdf',
                    },
                },
            );

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `reporteRechazos${new Date().getTime()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            alert('Reporte de rechazos descargado correctamente');
        } catch (err: unknown) {
            console.error('Error al generar el pdf de rechazos:', err);
            let mensaje = 'Error al generar el reporte. Por favor, intente nuevamente.';

            if (axios.isAxiosError(err)) {
                mensaje = err.response?.data?.message ?? err.message ?? mensaje;
            } else if (err instanceof Error) {
                mensaje = err.message || mensaje;
            }

            setPdfError(mensaje);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Estadísticas de Adopción" />
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
                            <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Estadísticas de Adopción</span>
                        </h1>
                        <p className="mt-4 text-xl leading-relaxed font-medium text-white/90">Analiza las métricas de la plataforma</p>

                        {/* Línea decorativa */}
                        <div className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                    </div>

                    {/* Botones de acción*/}
                    <div className="mb-8 flex justify-center gap-4">
                        <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                            <div className="w-full sm:w-auto">
                                <select
                                    value={tipoReporte}
                                    onChange={(e) => setTipoReporte(e.target.value as 'general' | 'rechazos')}
                                    className="w-full rounded-2xl border-2 border-white/30 bg-white/20 px-6 py-3 font-semibold text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/50 focus:outline-none"
                                >
                                    <option value="general" className="bg-gray-800 text-white">
                                        Reporte Adopciones Por Especie
                                    </option>
                                    <option value="rechazos" className="bg-gray-800 text-white">
                                        Reporte de Motivos de Rechazo
                                    </option>
                                </select>
                            </div>

                            <button
                                onClick={tipoReporte === 'general' ? descargarReportePDF : descargarReporteRechazos}
                                disabled={isGeneratingPdf}
                                className={`group hover:shadow-3xl relative overflow-hidden rounded-3xl px-8 py-3 font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 ${
                                    isGeneratingPdf
                                        ? 'cursor-not-allowed bg-gray-400'
                                        : 'bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800'
                                }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                <span className="relative flex items-center gap-2">
                                    {isGeneratingPdf ? (
                                        <>
                                            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            <span>Generando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                            <span>Descargar PDF</span>
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Mensaje de error */}
                    {pdfError && (
                        <div className="mb-4 rounded-lg bg-red-100 p-3 text-center text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                            {pdfError}
                        </div>
                    )}

                    {/* Tarjetas de estadísticas principales */}
                    <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4">
                        {/* Total Adopciones */}
                        <div className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] dark:bg-gray-800/95">
                            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500/20 to-transparent"></div>
                            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-blue-300/10 to-transparent"></div>
                            <div className="relative text-center">
                                <div className="mx-auto mb-4 w-fit rounded-2xl bg-gradient-to-r from-blue-500 to-blue-700 p-4 shadow-xl">
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Total Adopciones</h3>
                                <p className="text-3xl font-bold text-gray-800 dark:text-white">{generalStats.totalAdoptions}</p>
                            </div>
                        </div>

                        {/* Promedio Mensual */}
                        <div className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] dark:bg-gray-800/95">
                            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-green-500/20 to-transparent"></div>
                            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-green-300/10 to-transparent"></div>
                            <div className="relative text-center">
                                <div className="mx-auto mb-4 w-fit rounded-2xl bg-gradient-to-r from-green-500 to-green-700 p-4 shadow-xl">
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Promedio Mensual</h3>
                                <p className="text-3xl font-bold text-gray-800 dark:text-white">{generalStats.averageMonthly}</p>
                            </div>
                        </div>

                        {/* Tasa de Éxito */}
                        <div className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] dark:bg-gray-800/95">
                            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-purple-500/20 to-transparent"></div>
                            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-purple-300/10 to-transparent"></div>
                            <div className="relative text-center">
                                <div className="mx-auto mb-4 w-fit rounded-2xl bg-gradient-to-r from-purple-500 to-purple-700 p-4 shadow-xl">
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Tasa de Éxito</h3>
                                <p className="text-3xl font-bold text-gray-800 dark:text-white">{generalStats.successRate}%</p>
                            </div>
                        </div>

                        {/* Solicitudes Pendientes */}
                        <div className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] dark:bg-gray-800/95">
                            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-transparent"></div>
                            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-yellow-300/10 to-transparent"></div>
                            <div className="relative text-center">
                                <div className="mx-auto mb-4 w-fit rounded-2xl bg-gradient-to-r from-yellow-500 to-yellow-700 p-4 shadow-xl">
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Solicitudes Pendientes</h3>
                                <p className="text-3xl font-bold text-gray-800 dark:text-white">{generalStats.pendingRequests}</p>
                            </div>
                        </div>
                    </div>

                    {/* Gráficos y tablas */}
                    <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Gráfico principal */}
                        <div className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 lg:col-span-2 dark:bg-gray-800/95">
                            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/5 blur-2xl"></div>
                            <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-tr from-green-500/10 to-blue-500/5 blur-xl"></div>
                            <div className="relative">
                                <h2 className="mb-6 text-xl font-bold text-gray-800 dark:text-white">Adopciones por mes</h2>
                                <Chart data={adopcionesPorMes} />
                            </div>
                        </div>

                        {/* Estadísticas adicionales */}
                        <div className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 dark:bg-gray-800/95">
                            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-orange-500/20 to-transparent"></div>
                            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-orange-300/10 to-transparent"></div>
                            <div className="relative">
                                <h2 className="mb-6 text-xl font-bold text-gray-800 dark:text-white">Distribución por tipo</h2>
                                <div className="space-y-4">
                                    {distribucionTipos.length > 0 ? (
                                        distribucionTipos.map((item, index) => {
                                            // Asignar colores según el tipo
                                            const colores = [
                                                'bg-blue-500',
                                                'bg-green-500',
                                                'bg-purple-500',
                                                'bg-yellow-500',
                                                'bg-red-500',
                                                'bg-indigo-500',
                                            ];
                                            const color = colores[index % colores.length];

                                            return (
                                                <div key={index} className="flex flex-col">
                                                    <div className="mb-1 flex justify-between">
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            {item.name} ({item.total})
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.value}%</span>
                                                    </div>
                                                    <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                                        <div className={`${color} h-2.5 rounded-full`} style={{ width: `${item.value}%` }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center text-gray-500 dark:text-gray-400">
                                            <p>No hay datos de mascotas disponibles</p>
                                        </div>
                                    )}
                                </div>

                                {/* Gráfico de anillos gatos vs perros */}
                                {totalGatos + totalPerros > 0 ? (
                                    <div className="mb-6">
                                        <SpeciesDonutChart gatos={totalGatos} perros={totalPerros} />
                                    </div>
                                ) : (
                                    <p className="mb-6 text-center text-gray-500 dark:text-gray-400">No hay datos de gatos y perros para mostrar.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabla de estadísticas mensuales mejorada */}
                    <div className="relative overflow-hidden rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm dark:bg-gray-800/95">
                        {/* Elementos decorativos para la tabla */}
                        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/5 blur-2xl"></div>
                        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-tr from-green-500/10 to-blue-500/5 blur-xl"></div>

                        <div className="relative">
                            {/* Header de la sección */}
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Estadísticas Mensuales</h2>
                                    <p className="text-gray-600 dark:text-gray-300">Rendimiento detallado por mes</p>
                                </div>
                                <div className="rounded-2xl bg-gradient-to-r from-blue-500/20 to-green-500/20 p-3">
                                    <svg className="h-6 w-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Línea decorativa */}
                            <div className="mb-6 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>

                            {/* Tabla de estadísticas mensuales */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                                Mes
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                                Adopciones
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                                Devoluciones
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                                Tasa de Éxito
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                        {monthlyStats.map((stat, index) => (
                                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-white">
                                                    {stat.month}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                    {stat.adoptions}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                    {stat.returns}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
                                                                stat.success >= 95
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                            }`}
                                                        >
                                                            {stat.success}%
                                                        </span>
                                                        <div className="ml-4 h-2.5 w-24 rounded-full bg-gray-200 dark:bg-gray-700">
                                                            <div
                                                                className={`h-2.5 rounded-full ${stat.success >= 95 ? 'bg-green-500' : 'bg-yellow-500'}`}
                                                                style={{ width: `${stat.success}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    {/* Gráfico de Motivos de Rechazo */}
                    {motivosRechazo && motivosRechazo.length > 0 && (
                        <div className="relative mt-8 overflow-hidden rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm dark:bg-gray-800/95">
                            {/* Elementos decorativos */}
                            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-red-500/10 to-red-500/5 blur-2xl"></div>
                            <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-tr from-red-500/10 to-red-500/5 blur-xl"></div>

                            <div className="relative">
                                {/* Header de la sección */}
                                <div className="mb-6 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Motivos de Rechazo</h2>
                                        <p className="text-gray-600 dark:text-gray-300">Análisis de solicitudes rechazadas</p>
                                    </div>
                                    <div className="rounded-2xl bg-gradient-to-r from-red-500/20 to-red-500/20 p-3">
                                        <svg
                                            className="h-6 w-6 text-gray-700 dark:text-gray-300"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Línea decorativa */}
                                <div className="mb-6 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>

                                {/* Gráfico de barras */}
                                <div className="mb-6">
                                    <div className="space-y-4">
                                        {motivosRechazo.map((item, index) => {
                                            const maxCantidad = Math.max(...motivosRechazo.map((m) => m.cantidad));
                                            const porcentaje = (item.cantidad / maxCantidad) * 100;

                                            return (
                                                <div key={index} className="group">
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="max-w-md truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            {item.motivo}
                                                        </span>
                                                        <span className="ml-2 text-sm font-bold text-red-600 dark:text-red-400">{item.cantidad}</span>
                                                    </div>
                                                    <div className="relative h-8 w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                                                        <div
                                                            className="h-full rounded-lg bg-gradient-to-r from-red-500 to-red-600 transition-all duration-1000 ease-out group-hover:from-red-600 group-hover:to-red-700"
                                                            style={{ width: `${porcentaje}%` }}
                                                        >
                                                            <div className="flex h-full w-full items-center justify-end pr-3">
                                                                <span className="text-xs font-semibold text-white drop-shadow-lg">
                                                                    {item.cantidad} rechazo{item.cantidad !== 1 ? 's' : ''}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Resumen */}
                                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        <span className="font-semibold">Total de rechazos registrados:</span>{' '}
                                        <span className="font-bold text-red-600 dark:text-red-400">
                                            {motivosRechazo.reduce((sum, item) => sum + item.cantidad, 0)}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <ThemeSwitcher hasChatbot={true} />
            <ChatbotWidget />
        </AppLayout>
    );
}
