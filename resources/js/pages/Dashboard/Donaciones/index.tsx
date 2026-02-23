import ChatbotWidget from '@/components/chatbot-widget';
import { ExcelImportComponent } from '@/components/donations';
import { ThemeSwitcher } from '@/components/theme-switcher';
import AppLayout from '@/layouts/app-layout';
import { generateDonationsReport } from '@/lib/report-generator';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FormularioDonacion from './components/formulario-donacion';
import FormularioFundacion from './components/formulario-fundacion';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Donaciones', href: route('donaciones.index') }];

// --- COMPONENTES REUTILIZABLES ---
const formatCurrency = (amount: string | number | bigint) => {
    const numericAmount = typeof amount === 'string' ? Number(amount) : amount;
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
    }).format(numericAmount);
};

type DonationType = {
    id: number;
    shelter?: { name?: string };
    donor_name?: string;
    amount: number;
    created_at: Date;
    description?: string;
};

const DonationsTable = ({ donations, userRole }: { donations: DonationType[]; userRole: string }) => (
    <div className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-white/95 shadow-2xl backdrop-blur-sm transition-all duration-300 dark:bg-gray-800/95">
        {/* Efectos decorativos mejorados */}
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 to-transparent"></div>
        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-tr from-purple-500/10 to-transparent"></div>

        {/* Contenido con padding mejorado */}
        <div className="relative p-6">
            <div className="overflow-hidden rounded-2xl border border-gray-200/50 bg-white/50 shadow-lg dark:border-gray-700/50 dark:bg-gray-800/50">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:border-gray-700/50 dark:from-gray-700/50 dark:to-gray-600/50">
                                <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                                    {userRole === 'cliente' ? 'Fundación' : 'Donante'}
                                </th>
                                {/* AÑADIDO: Condicional para mostrar la columna Refugio para el admin */}
                                {userRole === 'admin' && (
                                    <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                                        Fundación
                                    </th>
                                )}
                                <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                                    Monto
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                                    Fecha
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                                    Descripción
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                            {donations.map((donation: DonationType) => (
                                <tr
                                    key={donation.id}
                                    className="group transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 dark:hover:from-gray-700/30 dark:hover:to-gray-600/30"
                                >
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                                            {userRole === 'cliente' ? (donation.shelter?.name ?? 'N/A') : donation.donor_name}
                                        </div>
                                    </td>
                                    {/* Celda para mostrar el nombre del refugio */}
                                    {userRole === 'admin' && (
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="font-medium text-gray-600 dark:text-gray-300">{donation.shelter?.name ?? 'N/A'}</div>
                                        </td>
                                    )}
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <span className="inline-flex items-center rounded-full bg-gradient-to-r from-green-500 to-green-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                                            {formatCurrency(donation.amount)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 font-medium whitespace-nowrap text-gray-600 dark:text-gray-300">
                                        {new Date(donation.created_at)
                                            .toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                            })
                                            .toString()}
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                        {donation.description ? (
                                            <span className="text-sm font-medium">{donation.description}</span>
                                        ) : (
                                            <span className="text-sm text-gray-400 italic dark:text-gray-500">Sin descripción</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Estado vacío mejorado */}
            {donations.length === 0 && (
                <div className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700">
                        <svg className="h-10 w-10 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                        </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-600 dark:text-gray-300">No hay donaciones para mostrar</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aún no se han registrado donaciones en el sistema</p>
                </div>
            )}
        </div>
    </div>
);

// --- VISTAS ESPECÍFICAS PARA CADA ROL ---
const ClientView = ({
    donations,
    stats,
    onDonateClick,
}: {
    donations: DonationType[];
    stats: { totalAmount: number; donationsCount: number };
    onDonateClick: () => void;
}) => (
    <>
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Tarjeta Total Donado */}
            <div className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] dark:bg-gray-800/95">
                <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-purple-500/20 to-transparent"></div>
                <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-purple-300/10 to-transparent"></div>
                <div className="relative text-center">
                    <div className="mx-auto mb-4 w-fit rounded-2xl bg-gradient-to-r from-purple-500 to-purple-700 p-4 shadow-xl">
                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                        </svg>
                    </div>
                    <h3 className="mb-2 text-sm font-bold tracking-wider text-purple-700 uppercase dark:text-purple-300">Total Donado</h3>
                    <p className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-3xl font-bold text-transparent dark:from-purple-400 dark:to-purple-600">
                        {formatCurrency(stats.totalAmount)}
                    </p>
                </div>
            </div>

            {/* Tarjeta Total Donaciones */}
            <div className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] dark:bg-gray-800/95">
                <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-green-500/20 to-transparent"></div>
                <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-green-300/10 to-transparent"></div>
                <div className="relative text-center">
                    <div className="mx-auto mb-4 w-fit rounded-2xl bg-gradient-to-r from-green-500 to-green-700 p-4 shadow-xl">
                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="mb-2 text-sm font-bold tracking-wider text-green-700 uppercase dark:text-green-300">Total Donaciones</h3>
                    <p className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-3xl font-bold text-transparent dark:from-green-400 dark:to-green-600">
                        {stats.donationsCount}
                    </p>
                </div>
            </div>
        </div>

        <div className="mb-8">
            <DonationsTable donations={donations} userRole="cliente" />
        </div>

        <div className="text-center">
            <button
                onClick={onDonateClick}
                className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-500 to-purple-700 px-12 py-4 text-lg font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:from-purple-600 hover:to-purple-800"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                <span className="relative flex items-center gap-3">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                    Quiero donar
                </span>
            </button>
        </div>
    </>
);

const AllyAdminView = ({
    donations,
    stats,
    userRole,
}: {
    donations: DonationType[];
    stats: { totalAmount: number; donorsCount: number; donationsCount: number };
    userRole: string;
}) => (
    <>
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Tarjeta Total Recaudado */}
            <div className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] dark:bg-gray-800/95">
                <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-purple-500/20 to-transparent"></div>
                <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-purple-300/10 to-transparent"></div>
                <div className="relative text-center">
                    <div className="mx-auto mb-4 w-fit rounded-2xl bg-gradient-to-r from-purple-500 to-purple-700 p-4 shadow-xl">
                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                    </div>
                    <h3 className="mb-2 text-sm font-bold tracking-wider text-purple-700 uppercase dark:text-purple-300">Total Recaudado</h3>
                    <p className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-3xl font-bold text-transparent dark:from-purple-400 dark:to-purple-600">
                        {formatCurrency(stats.totalAmount)}
                    </p>
                </div>
            </div>

            {/* Tarjeta Total Donantes */}
            <div className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] dark:bg-gray-800/95">
                <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-green-500/20 to-transparent"></div>
                <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-green-300/10 to-transparent"></div>
                <div className="relative text-center">
                    <div className="mx-auto mb-4 w-fit rounded-2xl bg-gradient-to-r from-green-500 to-green-700 p-4 shadow-xl">
                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="mb-2 text-sm font-bold tracking-wider text-green-700 uppercase dark:text-green-300">Total Donantes</h3>
                    <p className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-3xl font-bold text-transparent dark:from-green-400 dark:to-green-600">
                        {stats.donorsCount}
                    </p>
                </div>
            </div>

            {/* Tarjeta Total Donaciones */}
            <div className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] dark:bg-gray-800/95">
                <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500/20 to-transparent"></div>
                <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-blue-300/10 to-transparent"></div>
                <div className="relative text-center">
                    <div className="mx-auto mb-4 w-fit rounded-2xl bg-gradient-to-r from-blue-500 to-blue-700 p-4 shadow-xl">
                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="mb-2 text-sm font-bold tracking-wider text-blue-700 uppercase dark:text-blue-300">
                        {userRole === 'aliado' ? 'Donaciones Recibidas' : 'Total Donaciones'}
                    </h3>
                    <p className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-3xl font-bold text-transparent dark:from-blue-400 dark:to-blue-600">
                        {stats.donationsCount}
                    </p>
                </div>
            </div>
        </div>

        <DonationsTable donations={donations} userRole={userRole} />
    </>
);

// --- COMPONENTE PRINCIPAL ---
export default function DonationsSummary() {
    const page = usePage();
    const props = page.props as unknown as {
        donations: DonationType[];
        shelters: unknown[];
        auth: { user: { role: string; shelter?: unknown } };
    };
    const { donations, shelters, auth } = props;
    const { user } = auth;
    const [showDonationFormModal, setShowDonationFormModal] = useState(false);

    const handleImportSuccess = () => {
        // Refrescar la página para mostrar las nuevas donaciones
        window.location.reload();
    };

    const stats = {
        totalAmount: donations.reduce((acc: number, curr: DonationType) => acc + parseFloat(curr.amount.toString()), 0),
        donorsCount: new Set(donations.map((d: DonationType) => (d as unknown as { donor_email: string }).donor_email)).size,
        donationsCount: donations.length,
    };

    const handleGenerateReport = () => {
        if (donations.length === 0) {
            return;
        }
        const reportDonations = donations as unknown as {
            id: number;
            donor_name: string;
            amount: string;
            created_at: string;
            shelter?: { name: string };
        }[];
        const reportUser = user as unknown as { name: string; role: string; shelter?: { name: string } };
        generateDonationsReport(reportDonations as never, reportUser as never);
    };

    const renderContentByRole = () => {
        if (user.role === 'aliado' && !user.shelter) {
            return <FormularioFundacion />;
        }
        if (user.role === 'cliente') {
            return <ClientView donations={donations} stats={stats} onDonateClick={() => setShowDonationFormModal(true)} />;
        }
        if (user.role === 'admin' || (user.role === 'aliado' && user.shelter)) {
            return <AllyAdminView donations={donations} stats={stats} userRole={user.role} />;
        }
        return <p>Vista no disponible.</p>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Donaciones" />
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
                    {!(user.role === 'aliado' && !user.shelter) && (
                        <div className="mb-8 text-center">
                            <h1 className="text-4xl font-bold tracking-tight drop-shadow-lg md:text-5xl lg:text-6xl">
                                <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Sistema de Donaciones</span>
                            </h1>
                            <p className="mt-4 text-xl leading-relaxed font-medium text-white/90">
                                {user.role === 'cliente' ? 'Apoya a las fundaciones de protección animal' : 'Gestiona las donaciones de tu fundación'}
                            </p>

                            {/* Línea decorativa */}
                            <div className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                        </div>
                    )}

                    {/* Botones de acción mejorados */}
                    {!(user.role === 'aliado' && !user.shelter) && (
                        <div className="mb-8 flex justify-center gap-4">
                            <button
                                onClick={handleGenerateReport}
                                className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-500 to-green-700 px-8 py-3 font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:from-green-600 hover:to-green-800"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                <span className="relative flex items-center gap-2">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    Generar reporte
                                </span>
                            </button>
                            {user.role === 'aliado' && Boolean(user.shelter) && <ExcelImportComponent onImportSuccess={handleImportSuccess} />}
                        </div>
                    )}

                    {/* Contenido específico por rol */}
                    <div className="space-y-8">{renderContentByRole()}</div>

                    {/* Modal de donación */}
                    {user.role === 'cliente' && (
                        <FormularioDonacion
                            showModal={showDonationFormModal}
                            onClose={() => setShowDonationFormModal(false)}
                            shelters={shelters as unknown as { id: number; name: string }[]}
                        />
                    )}
                </div>
            </main>

            <ThemeSwitcher hasChatbot={true} />
            <ChatbotWidget />
        </AppLayout>
    );
}
