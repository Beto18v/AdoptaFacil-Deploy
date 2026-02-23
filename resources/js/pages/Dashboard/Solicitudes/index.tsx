import ChatbotWidget from '@/components/chatbot-widget';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

// Tipos de datos que el controlador envía
interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}
interface Mascota {
    id: number;
    nombre: string;
    especie: string;
    raza: string;
    imagen?: string;
    user_id: number;
}
interface Solicitud {
    id: number;
    estado: string;
    created_at: string;
    user_id: number;
    mascota_id: number;
    mascota: Mascota;
    // Datos personales
    nombre_completo: string;
    cedula: string;
    email: string;
    telefono: string;
    // Dirección
    direccion_ciudad: string;
    direccion_barrio: string;
    direccion_postal: string;
    // Vivienda
    tipo_vivienda: string;
    propiedad_vivienda: string;
    tiene_patio: string;
    permiten_mascotas_alquiler: string;
    // Convivientes
    cantidad_convivientes: number;
    hay_ninos: string;
    edades_ninos: string;
    todos_acuerdo_adopcion: string;
    // Otras mascotas
    tiene_otras_mascotas: string;
    otras_mascotas_detalles?: string;
    tuvo_mascotas_antes: string;
    que_paso_mascotas_anteriores?: string;
    // Motivaciones y expectativas
    porque_adopta: string;
    que_espera_convivencia: string;
    que_haria_problemas_comportamiento: string;
    acepta_visitas_seguimiento: string;
    // Compromisos
    acepta_proceso_evaluacion: boolean;
    acepta_cuidado_responsable: boolean;
    acepta_contrato_adopcion: boolean;
    // Comentario de rechazo
    comentario_rechazo?: string;
}
interface SolicitudesPageProps {
    solicitudes: Solicitud[];
    auth: { user: User };
}

export default function SolicitudesIndex({ auth, solicitudes }: SolicitudesPageProps) {
    const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [comentarioRechazo, setComentarioRechazo] = useState('');
    const [isSubmittingReject, setIsSubmittingReject] = useState(false);

    const handleApprove = async () => {
        if (!selectedSolicitud) return;

        try {
            const response = await fetch(route('solicitudes.updateEstado', selectedSolicitud.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name=csrf-token]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({ estado: 'Aprobada' }),
            });

            if (response.ok) {
                setSelectedSolicitud({ ...selectedSolicitud, estado: 'Aprobada' });
                window.location.reload();
            } else {
                throw new Error('Error en la respuesta del servidor');
            }
        } catch (error) {
            console.error('Error al aprobar solicitud:', error);
            alert('Error al aprobar la solicitud. Por favor, intenta de nuevo.');
        }
    };

    const handleRejectWithComment = async () => {
        if (!selectedSolicitud) return;

        setIsSubmittingReject(true);
        try {
            const response = await fetch(route('solicitudes.updateEstado', selectedSolicitud.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name=csrf-token]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    estado: 'Rechazada',
                    comentario_rechazo: comentarioRechazo,
                }),
            });

            if (response.ok) {
                await response.json();
                setSelectedSolicitud({
                    ...selectedSolicitud,
                    estado: 'Rechazada',
                    comentario_rechazo: comentarioRechazo,
                });
                setShowRejectModal(false);
                setComentarioRechazo('');
                window.location.reload();
            }
        } catch (error) {
            console.error('Error al rechazar solicitud:', error);
            alert('Error al procesar la solicitud. Por favor, intenta de nuevo.');
        } finally {
            setIsSubmittingReject(false);
        }
    };

    const handleCancel = (solicitudId: number) => {
        if (confirm('¿Estás seguro de que quieres cancelar esta solicitud?')) {
            router.delete(route('solicitudes.destroy', solicitudId), { preserveScroll: true });
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'Aprobada':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'En Proceso':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Rechazada':
            case 'Cancelada':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-blue-100 text-blue-800 border-blue-300';
        }
    };

    const breadcrumbs = [{ title: 'Solicitudes', href: route('solicitudes.index') }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis Solicitudes" />
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
                            <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Mis Solicitudes</span>
                        </h1>
                        <p className="mt-4 text-xl leading-relaxed font-medium text-white/90">Gestiona tus solicitudes de adopción</p>

                        {/* Línea decorativa */}
                        <div className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                    </div>

                    {/* Estadística de solicitudes */}
                    <div className="mb-8">
                        <div className="group hover:shadow-3xl relative mx-auto max-w-sm overflow-hidden rounded-3xl bg-white/95 p-6 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] dark:bg-gray-800/95">
                            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-orange-500/20 to-transparent"></div>
                            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-orange-300/10 to-transparent"></div>
                            <div className="relative text-center">
                                <div className="mx-auto mb-3 w-fit rounded-2xl bg-gradient-to-r from-orange-500 to-orange-700 p-3 shadow-xl">
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">{solicitudes.length}</p>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    {solicitudes.length === 1 ? 'Solicitud Enviada' : 'Solicitudes Enviadas'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {solicitudes.length > 0 ? (
                        <div className="relative overflow-hidden rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm dark:bg-gray-800/95">
                            {/* Elementos decorativos */}
                            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-orange-500/10 to-purple-500/5 blur-2xl"></div>
                            <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-tr from-orange-500/10 to-blue-500/5 blur-xl"></div>

                            <div className="relative">
                                {/* Header de la sección */}
                                <div className="mb-6 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Historial de Solicitudes</h2>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                            Seguimiento de {solicitudes.length} {solicitudes.length === 1 ? 'solicitud' : 'solicitudes'}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-gradient-to-r from-orange-500/20 to-blue-500/20 p-3">
                                        <svg
                                            className="h-6 w-6 text-orange-600 dark:text-orange-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                            />
                                        </svg>
                                    </div>
                                </div>

                                {/* Línea decorativa */}
                                <div className="mb-6 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>

                                <div className="overflow-x-auto rounded-2xl">
                                    {solicitudes.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Mascota</TableHead>
                                                    <TableHead>Estado</TableHead>
                                                    <TableHead>Fecha de Solicitud</TableHead>
                                                    <TableHead className="text-right">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {solicitudes.map((solicitud) => (
                                                    <TableRow key={solicitud.id}>
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-3">
                                                                <img
                                                                    src={
                                                                        solicitud.mascota.imagen
                                                                            ? `/storage/${solicitud.mascota.imagen}`
                                                                            : 'https://via.placeholder.com/150'
                                                                    }
                                                                    alt={solicitud.mascota.nombre}
                                                                    className="h-10 w-10 rounded-full object-cover"
                                                                />
                                                                <span>{solicitud.mascota.nombre}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className={getStatusBadgeClass(solicitud.estado)}>
                                                                {solicitud.estado}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{new Date(solicitud.created_at).toLocaleDateString()}</TableCell>
                                                        <TableCell className="flex justify-end gap-2 text-right">
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                className="bg-gray-500 text-white hover:bg-gray-600"
                                                                onClick={() => setSelectedSolicitud(solicitud)}
                                                            >
                                                                Ver Detalle
                                                            </Button>
                                                            {solicitud.estado === 'Enviada' && (
                                                                <Button variant="destructive" size="icon" onClick={() => handleCancel(solicitud.id)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                    <span className="sr-only">Cancelar Solicitud</span>
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <p className="py-8 text-center text-gray-600 dark:text-gray-300">
                                            Aún no has realizado ninguna solicitud de adopción.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative overflow-hidden rounded-3xl bg-white/95 p-12 shadow-2xl backdrop-blur-sm dark:bg-gray-800/95">
                            {/* Elementos decorativos para estado vacío */}
                            <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-gradient-to-br from-orange-300/20 to-transparent"></div>
                            <div className="absolute -bottom-4 -left-4 h-12 w-12 rounded-full bg-gradient-to-tr from-orange-300/20 to-transparent"></div>

                            <div className="relative text-center">
                                <div className="mx-auto mb-4 w-fit rounded-full bg-gradient-to-r from-orange-400 to-orange-600 p-6 shadow-lg">
                                    <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-gray-700 dark:text-gray-300">No hay solicitudes enviadas</h3>
                                <p className="mb-6 text-gray-500 dark:text-gray-400">Aún no has realizado ninguna solicitud de adopción</p>
                                <a
                                    href="/mascotas"
                                    className="inline-block rounded-xl bg-gradient-to-r from-green-500 to-green-700 px-6 py-3 text-white shadow-lg transition-all duration-300 hover:from-green-600 hover:to-green-800 hover:shadow-xl"
                                >
                                    Explorar mascotas
                                </a>
                            </div>
                        </div>
                    )}
                </div>
                {/* Modal/Card para mostrar el detalle de la solicitud */}
                {selectedSolicitud && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="relative mx-4 my-8 max-h-[calc(100vh-4rem)] w-full max-w-5xl overflow-hidden rounded-3xl bg-white/95 shadow-2xl backdrop-blur-sm dark:bg-gray-800/95">
                            {/* Elementos decorativos */}
                            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/20 to-transparent blur-xl"></div>
                            <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-tr from-green-500/15 to-transparent blur-lg"></div>

                            <div className="relative max-h-[calc(100vh-4rem)] overflow-y-auto">
                                <button
                                    className="group absolute top-4 right-4 z-10 rounded-full p-3 text-gray-500 transition-all duration-200 hover:bg-red-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                                    onClick={() => setSelectedSolicitud(null)}
                                    aria-label="Cerrar"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 transition-transform group-hover:scale-110"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <div className="p-6 sm:p-8">
                                    <div className="mb-10 text-center">
                                        <h2 className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-3xl font-bold text-transparent dark:from-blue-400 dark:to-green-400">
                                            📋 Detalle de Solicitud de Adopción
                                        </h2>
                                        <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                                            Información completa proporcionada por el solicitante
                                        </p>
                                        {/* Línea decorativa */}
                                        <div className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                                    </div>
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                            <div className="relative overflow-hidden rounded-3xl border-2 border-blue-200/50 bg-gradient-to-br from-blue-50/80 to-indigo-50/60 p-6 shadow-xl dark:border-blue-700/30 dark:from-blue-900/25 dark:to-indigo-900/20">
                                                {/* Elemento decorativo */}
                                                <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-gradient-to-br from-blue-300/30 to-transparent blur-lg"></div>

                                                <h3 className="relative mb-6 flex items-center text-xl font-bold text-blue-700 dark:text-blue-300">
                                                    <div className="mr-3 rounded-xl bg-blue-600 p-2 shadow-lg dark:bg-blue-500">
                                                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                            />
                                                        </svg>
                                                    </div>
                                                    👤 Datos del Solicitante
                                                </h3>
                                                <div className="relative space-y-3">
                                                    <div className="rounded-xl bg-gradient-to-r from-white/80 to-blue-50/80 p-4 shadow-md transition-all duration-200 hover:shadow-lg dark:from-gray-800/80 dark:to-blue-900/20">
                                                        <div className="mb-2 flex items-center">
                                                            <span className="mr-2 text-lg">👤</span>
                                                            <strong className="font-semibold text-blue-700 dark:text-blue-300">
                                                                Nombre completo:
                                                            </strong>
                                                        </div>
                                                        <div className="ml-6 font-medium text-gray-800 dark:text-gray-200">
                                                            {selectedSolicitud.nombre_completo}
                                                        </div>
                                                    </div>
                                                    <div className="rounded-xl bg-gradient-to-r from-white/80 to-blue-50/80 p-4 shadow-md transition-all duration-200 hover:shadow-lg dark:from-gray-800/80 dark:to-blue-900/20">
                                                        <div className="mb-2 flex items-center">
                                                            <span className="mr-2 text-lg">🆔</span>
                                                            <strong className="font-semibold text-blue-700 dark:text-blue-300">Cédula:</strong>
                                                        </div>
                                                        <div className="ml-6 font-medium text-gray-800 dark:text-gray-200">
                                                            {selectedSolicitud.cedula}
                                                        </div>
                                                    </div>
                                                    <div className="rounded-xl bg-gradient-to-r from-white/80 to-blue-50/80 p-4 shadow-md transition-all duration-200 hover:shadow-lg dark:from-gray-800/80 dark:to-blue-900/20">
                                                        <div className="mb-2 flex items-center">
                                                            <span className="mr-2 text-lg">📧</span>
                                                            <strong className="font-semibold text-blue-700 dark:text-blue-300">Email:</strong>
                                                        </div>
                                                        <div className="ml-6 font-medium text-gray-800 dark:text-gray-200">
                                                            {selectedSolicitud.email}
                                                        </div>
                                                    </div>
                                                    <div className="rounded-xl bg-gradient-to-r from-white/80 to-blue-50/80 p-4 shadow-md transition-all duration-200 hover:shadow-lg dark:from-gray-800/80 dark:to-blue-900/20">
                                                        <div className="mb-2 flex items-center">
                                                            <span className="mr-2 text-lg">📱</span>
                                                            <strong className="font-semibold text-blue-700 dark:text-blue-300">Teléfono:</strong>
                                                        </div>
                                                        <div className="ml-6 font-medium text-gray-800 dark:text-gray-200">
                                                            {selectedSolicitud.telefono}
                                                        </div>
                                                    </div>
                                                    <div className="rounded-xl bg-gradient-to-r from-white/80 to-blue-50/80 p-4 shadow-md transition-all duration-200 hover:shadow-lg dark:from-gray-800/80 dark:to-blue-900/20">
                                                        <div className="mb-2 flex items-center">
                                                            <span className="mr-2 text-lg">🏙️</span>
                                                            <strong className="font-semibold text-blue-700 dark:text-blue-300">Ciudad:</strong>
                                                        </div>
                                                        <div className="ml-6 font-medium text-gray-800 dark:text-gray-200">
                                                            {selectedSolicitud.direccion_ciudad}
                                                        </div>
                                                    </div>
                                                    <div className="rounded-xl bg-gradient-to-r from-white/80 to-blue-50/80 p-4 shadow-md transition-all duration-200 hover:shadow-lg dark:from-gray-800/80 dark:to-blue-900/20">
                                                        <div className="mb-2 flex items-center">
                                                            <span className="mr-2 text-lg">🏘️</span>
                                                            <strong className="font-semibold text-blue-700 dark:text-blue-300">Barrio:</strong>
                                                        </div>
                                                        <div className="ml-6 font-medium text-gray-800 dark:text-gray-200">
                                                            {selectedSolicitud.direccion_barrio}
                                                        </div>
                                                    </div>
                                                    <div className="rounded-xl bg-gradient-to-r from-white/80 to-blue-50/80 p-4 shadow-md transition-all duration-200 hover:shadow-lg dark:from-gray-800/80 dark:to-blue-900/20">
                                                        <div className="mb-2 flex items-center">
                                                            <span className="mr-2 text-lg">📮</span>
                                                            <strong className="font-semibold text-blue-700 dark:text-blue-300">Código Postal:</strong>
                                                        </div>
                                                        <div className="ml-6 font-medium text-gray-800 dark:text-gray-200">
                                                            {selectedSolicitud.direccion_postal}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="relative overflow-hidden rounded-3xl border-2 border-green-200/50 bg-gradient-to-br from-green-50/80 to-emerald-50/60 p-6 shadow-xl dark:border-green-700/30 dark:from-green-900/25 dark:to-emerald-900/20">
                                                {/* Elemento decorativo */}
                                                <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-gradient-to-br from-green-300/30 to-transparent blur-lg"></div>

                                                <h3 className="relative mb-6 flex items-center text-xl font-bold text-green-700 dark:text-green-300">
                                                    <div className="mr-3 rounded-xl bg-green-600 p-2 shadow-lg dark:bg-green-500">
                                                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                                            />
                                                        </svg>
                                                    </div>
                                                    🏠 Vivienda
                                                </h3>
                                                <div className="relative space-y-3">
                                                    <div className="rounded-xl bg-gradient-to-r from-white/80 to-green-50/80 p-4 shadow-md transition-all duration-200 hover:shadow-lg dark:from-gray-800/80 dark:to-green-900/20">
                                                        <div className="mb-2 flex items-center">
                                                            <span className="mr-2 text-lg">🏠</span>
                                                            <strong className="font-semibold text-green-700 dark:text-green-300">
                                                                Tipo de vivienda:
                                                            </strong>
                                                        </div>
                                                        <div className="ml-6 font-medium text-gray-800 dark:text-gray-200">
                                                            {selectedSolicitud.tipo_vivienda}
                                                        </div>
                                                    </div>
                                                    <div className="rounded-xl bg-gradient-to-r from-white/80 to-green-50/80 p-4 shadow-md transition-all duration-200 hover:shadow-lg dark:from-gray-800/80 dark:to-green-900/20">
                                                        <div className="mb-2 flex items-center">
                                                            <span className="mr-2 text-lg">📋</span>
                                                            <strong className="font-semibold text-green-700 dark:text-green-300">
                                                                Propiedad de la vivienda:
                                                            </strong>
                                                        </div>
                                                        <div className="ml-6 font-medium text-gray-800 dark:text-gray-200">
                                                            {selectedSolicitud.propiedad_vivienda}
                                                        </div>
                                                    </div>
                                                    <div className="rounded-xl bg-gradient-to-r from-white/80 to-green-50/80 p-4 shadow-md transition-all duration-200 hover:shadow-lg dark:from-gray-800/80 dark:to-green-900/20">
                                                        <div className="mb-2 flex items-center">
                                                            <span className="mr-2 text-lg">🌳</span>
                                                            <strong className="font-semibold text-green-700 dark:text-green-300">Tiene patio:</strong>
                                                        </div>
                                                        <div className="ml-6 flex items-center">
                                                            <span
                                                                className={`mr-2 text-lg ${selectedSolicitud.tiene_patio === 'si' ? '✅' : '❌'}`}
                                                            ></span>
                                                            <div
                                                                className={`font-medium ${selectedSolicitud.tiene_patio === 'si' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                                                            >
                                                                {selectedSolicitud.tiene_patio === 'si' ? 'Sí tiene' : 'No tiene'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="rounded-xl bg-gradient-to-r from-white/80 to-green-50/80 p-4 shadow-md transition-all duration-200 hover:shadow-lg dark:from-gray-800/80 dark:to-green-900/20">
                                                        <div className="mb-2 flex items-center">
                                                            <span className="mr-2 text-lg">🏘️</span>
                                                            <strong className="font-semibold text-green-700 dark:text-green-300">
                                                                ¿Permiten mascotas en alquiler?:
                                                            </strong>
                                                        </div>
                                                        <div className="ml-6 flex items-center">
                                                            <span
                                                                className={`mr-2 text-lg ${selectedSolicitud.permiten_mascotas_alquiler === 'si' ? '✅' : '❌'}`}
                                                            ></span>
                                                            <div
                                                                className={`font-medium ${selectedSolicitud.permiten_mascotas_alquiler === 'si' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                                                            >
                                                                {selectedSolicitud.permiten_mascotas_alquiler === 'si'
                                                                    ? 'Sí permiten'
                                                                    : 'No permiten'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                            <div className="relative overflow-hidden rounded-3xl border-2 border-purple-200/50 bg-gradient-to-br from-purple-50/80 to-pink-50/60 p-6 shadow-xl dark:border-purple-700/30 dark:from-purple-900/25 dark:to-pink-900/20">
                                                {/* Elemento decorativo */}
                                                <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-gradient-to-br from-purple-300/30 to-transparent blur-lg"></div>

                                                <h3 className="relative mb-6 flex items-center text-xl font-bold text-purple-700 dark:text-purple-300">
                                                    <div className="mr-3 rounded-xl bg-purple-600 p-2 shadow-lg dark:bg-purple-500">
                                                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                            />
                                                        </svg>
                                                    </div>
                                                    👥 Convivientes
                                                </h3>
                                                <div className="relative space-y-3">
                                                    <div className="rounded-md border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                                                        <strong className="text-green-600 dark:text-green-400">Cantidad de convivientes:</strong>
                                                        <span className="ml-2 text-gray-600 dark:text-gray-300">
                                                            {selectedSolicitud.cantidad_convivientes}
                                                        </span>
                                                    </div>
                                                    <div className="rounded-md border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                                                        <strong className="text-green-600 dark:text-green-400">¿Hay niños?:</strong>
                                                        <span className="ml-2 text-gray-600 dark:text-gray-300">{selectedSolicitud.hay_ninos}</span>
                                                    </div>
                                                    <div className="rounded-md border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                                                        <strong className="text-green-600 dark:text-green-400">Edades de los niños:</strong>
                                                        <span className="ml-2 text-gray-600 dark:text-gray-300">
                                                            {selectedSolicitud.edades_ninos}
                                                        </span>
                                                    </div>
                                                    <div className="rounded-md border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                                                        <strong className="text-green-600 dark:text-green-400">
                                                            ¿Todos están de acuerdo con la adopción?:
                                                        </strong>
                                                        <span className="ml-2 text-gray-600 dark:text-gray-300">
                                                            {selectedSolicitud.todos_acuerdo_adopcion}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="relative overflow-hidden rounded-3xl border-2 border-orange-200/50 bg-gradient-to-br from-orange-50/80 to-yellow-50/60 p-6 shadow-xl dark:border-orange-700/30 dark:from-orange-900/25 dark:to-yellow-900/20">
                                                {/* Elemento decorativo */}
                                                <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-gradient-to-br from-orange-300/30 to-transparent blur-lg"></div>

                                                <h3 className="relative mb-6 flex items-center text-xl font-bold text-orange-700 dark:text-orange-300">
                                                    <div className="mr-3 rounded-xl bg-orange-600 p-2 shadow-lg dark:bg-orange-500">
                                                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                            />
                                                        </svg>
                                                    </div>
                                                    🐕 Otras Mascotas
                                                </h3>
                                                <div className="relative space-y-3">
                                                    <div className="rounded-md border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                                                        <strong className="text-green-600 dark:text-green-400">¿Tiene otras mascotas?:</strong>
                                                        <span className="ml-2 text-gray-600 dark:text-gray-300">
                                                            {selectedSolicitud.tiene_otras_mascotas}
                                                        </span>
                                                    </div>
                                                    {selectedSolicitud.tiene_otras_mascotas === 'si' && selectedSolicitud.otras_mascotas_detalles && (
                                                        <div className="rounded-md border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                                                            <strong className="text-green-600 dark:text-green-400">
                                                                Detalles de otras mascotas:
                                                            </strong>
                                                            <span className="ml-2 text-gray-600 dark:text-gray-300">
                                                                {selectedSolicitud.otras_mascotas_detalles}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="rounded-md border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                                                        <strong className="text-green-600 dark:text-green-400">¿Tuvo mascotas antes?:</strong>
                                                        <span className="ml-2 text-gray-600 dark:text-gray-300">
                                                            {selectedSolicitud.tuvo_mascotas_antes}
                                                        </span>
                                                    </div>
                                                    {selectedSolicitud.tuvo_mascotas_antes === 'si' &&
                                                        selectedSolicitud.que_paso_mascotas_anteriores && (
                                                            <div className="rounded-md border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                                                                <strong className="text-green-600 dark:text-green-400">
                                                                    ¿Qué pasó con las mascotas anteriores?:
                                                                </strong>
                                                                <span className="ml-2 text-gray-600 dark:text-gray-300">
                                                                    {selectedSolicitud.que_paso_mascotas_anteriores}
                                                                </span>
                                                            </div>
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="relative overflow-hidden rounded-3xl border-2 border-pink-200/50 bg-gradient-to-br from-pink-50/80 to-rose-50/60 p-6 shadow-xl dark:border-pink-700/30 dark:from-pink-900/25 dark:to-rose-900/20">
                                            {/* Elemento decorativo */}
                                            <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-gradient-to-br from-pink-300/30 to-transparent blur-lg"></div>

                                            <h3 className="relative mb-6 flex items-center text-xl font-bold text-pink-700 dark:text-pink-300">
                                                <div className="mr-3 rounded-xl bg-pink-600 p-2 shadow-lg dark:bg-pink-500">
                                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                                        />
                                                    </svg>
                                                </div>
                                                💖 Detalles de Adopción
                                            </h3>
                                            <div className="relative space-y-4">
                                                <div className="rounded-md border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                                                    <strong className="text-green-600 dark:text-green-400">¿Por qué desea adoptar?:</strong>
                                                    <p className="mt-1 text-gray-600 dark:text-gray-300">{selectedSolicitud.porque_adopta}</p>
                                                </div>
                                                <div className="rounded-md border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                                                    <strong className="text-green-600 dark:text-green-400">¿Qué espera de la convivencia?:</strong>
                                                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                                                        {selectedSolicitud.que_espera_convivencia}
                                                    </p>
                                                </div>
                                                <div className="rounded-md border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                                                    <strong className="text-green-600 dark:text-green-400">
                                                        ¿Qué haría ante problemas de comportamiento?:
                                                    </strong>
                                                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                                                        {selectedSolicitud.que_haria_problemas_comportamiento}
                                                    </p>
                                                </div>
                                                <div className="rounded-md border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                                                    <strong className="text-green-600 dark:text-green-400">¿Acepta visitas de seguimiento?:</strong>
                                                    <span className="ml-2 text-gray-600 dark:text-gray-300">
                                                        {selectedSolicitud.acepta_visitas_seguimiento}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                            <div>
                                                <h3 className="mb-3 text-lg font-semibold text-green-600 dark:text-green-400">
                                                    Compromisos y Condiciones
                                                </h3>
                                                <div className="space-y-2">
                                                    <div className="rounded-md border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                                                        <strong className="text-green-600 dark:text-green-400">
                                                            ¿Acepta proceso de evaluación?:
                                                        </strong>
                                                        <span className="ml-2 text-gray-600 dark:text-gray-300">
                                                            {selectedSolicitud.acepta_proceso_evaluacion ? 'Sí' : 'No'}
                                                        </span>
                                                    </div>
                                                    <div className="rounded-md border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                                                        <strong className="text-green-600 dark:text-green-400">¿Acepta cuidado responsable?:</strong>
                                                        <span className="ml-2 text-gray-600 dark:text-gray-300">
                                                            {selectedSolicitud.acepta_cuidado_responsable ? 'Sí' : 'No'}
                                                        </span>
                                                    </div>
                                                    <div className="rounded-md border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                                                        <strong className="text-green-600 dark:text-green-400">¿Acepta contrato de adopción?:</strong>
                                                        <span className="ml-2 text-gray-600 dark:text-gray-300">
                                                            {selectedSolicitud.acepta_contrato_adopcion ? 'Sí' : 'No'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="mb-3 text-lg font-semibold text-green-600 dark:text-green-400">Mascota Solicitada</h3>
                                                <div className="space-y-2">
                                                    <div className="rounded-md border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                                                        <strong className="text-green-600 dark:text-green-400">Nombre:</strong>
                                                        <span className="ml-2 text-gray-600 dark:text-gray-300">
                                                            {selectedSolicitud.mascota?.nombre}
                                                        </span>
                                                    </div>
                                                    <div className="rounded-md border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                                                        <strong className="text-green-600 dark:text-green-400">Especie:</strong>
                                                        <span className="ml-2 text-gray-600 dark:text-gray-300">
                                                            {selectedSolicitud.mascota?.especie}
                                                        </span>
                                                    </div>
                                                    <div className="rounded-md border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                                                        <strong className="text-green-600 dark:text-green-400">Raza:</strong>
                                                        <span className="ml-2 text-gray-600 dark:text-gray-300">
                                                            {selectedSolicitud.mascota?.raza}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="mb-3 text-lg font-semibold text-green-600 dark:text-green-400">Estado de la Solicitud</h3>
                                            <div className="space-y-2">
                                                <div className="rounded-md border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                                                    <strong className="text-green-600 dark:text-green-400">Estado de la solicitud:</strong>
                                                    <span className="ml-2 text-gray-600 dark:text-gray-300">{selectedSolicitud.estado}</span>
                                                </div>
                                                <div className="rounded-md border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                                                    <strong className="text-green-600 dark:text-green-400">Fecha de solicitud:</strong>
                                                    <span className="ml-2 text-gray-600 dark:text-gray-300">
                                                        {new Date(selectedSolicitud.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {selectedSolicitud.estado === 'Rechazada' && selectedSolicitud.comentario_rechazo && (
                                                    <div className="rounded-md border-red-300 bg-red-50 p-3 dark:border-red-600 dark:bg-red-900/20">
                                                        <strong className="text-green-600 dark:text-green-400">Motivo de rechazo:</strong>
                                                        <p className="mt-1 text-red-600 dark:text-red-400">{selectedSolicitud.comentario_rechazo}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botones de Acción */}
                                    <div className="flex flex-col gap-4 pt-8 sm:flex-row sm:justify-center">
                                        {auth.user.role === 'aliado' && selectedSolicitud.mascota?.user_id === auth.user.id && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="group hover:shadow-3xl relative w-full overflow-hidden rounded-3xl bg-gradient-to-r from-green-500 to-green-700 px-8 py-4 font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:opacity-50 sm:w-auto"
                                                    onClick={handleApprove}
                                                    disabled={selectedSolicitud.estado === 'Aprobada'}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                                    <span className="relative flex items-center gap-2">
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        ✅ Aprobar Solicitud
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="group hover:shadow-3xl relative w-full overflow-hidden rounded-3xl bg-gradient-to-r from-red-500 to-red-700 px-8 py-4 font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:opacity-50 sm:w-auto"
                                                    onClick={() => {
                                                        setComentarioRechazo('');
                                                        setShowRejectModal(true);
                                                    }}
                                                    disabled={selectedSolicitud.estado === 'Rechazada'}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                                    <span className="relative flex items-center gap-2">
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M6 18L18 6M6 6l12 12"
                                                            />
                                                        </svg>
                                                        ❌ Rechazar Solicitud
                                                    </span>
                                                </button>
                                            </>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setSelectedSolicitud(null)}
                                            className="group hover:shadow-3xl relative w-full overflow-hidden rounded-3xl bg-gradient-to-r from-gray-400 to-gray-600 px-8 py-4 font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 sm:w-auto dark:from-gray-600 dark:to-gray-800"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                            <span className="relative flex items-center gap-2">
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                                    />
                                                </svg>
                                                🔙 Cerrar
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de comentario de rechazo */}
                {showRejectModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
                            <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">Rechazar Solicitud</h3>
                            <p className="mb-4 text-gray-600 dark:text-gray-300">
                                ¿Está seguro de que desea rechazar esta solicitud? Seleccione el motivo principal del rechazo:
                            </p>
                            <select
                                value={comentarioRechazo}
                                onChange={(e) => setComentarioRechazo(e.target.value)}
                                className="w-full rounded-md border-gray-300 p-3 shadow-sm focus:border-red-500 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                required
                            >
                                <option value="">-- Seleccione un motivo de rechazo --</option>
                                <option value="Vivienda inadecuada">
                                    Vivienda inadecuada (sin patio, no permiten mascotas, espacio insuficiente)
                                </option>
                                <option value="Falta de experiencia">Falta de experiencia previa con mascotas o historial problemático</option>
                                <option value="Incompatibilidad familiar">
                                    Incompatibilidad familiar (niños pequeños, no todos de acuerdo, otras mascotas)
                                </option>
                                <option value="Motivación insuficiente">
                                    Motivación insuficiente o expectativas no realistas sobre la convivencia
                                </option>
                                <option value="Compromiso dudoso">Falta de compromiso (no acepta visitas, cuidado veterinario, contrato)</option>
                            </select>
                            <div className="mt-6 flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setComentarioRechazo('');
                                    }}
                                    className="rounded-md bg-gray-200 px-6 py-2 font-semibold text-gray-700 transition hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRejectWithComment}
                                    disabled={isSubmittingReject}
                                    className="rounded-md bg-red-600 px-6 py-2 font-semibold text-white shadow-md transition hover:bg-red-700 disabled:opacity-50"
                                >
                                    {isSubmittingReject ? 'Rechazando...' : 'Confirmar Rechazo'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <ThemeSwitcher hasChatbot={true} />
            <ChatbotWidget />
        </AppLayout>
    );
}
