import ChatbotWidget from '@/components/chatbot-widget';
import { ExcelImportComponent, type ImportedDonationDraft } from '@/components/donations';
import { ThemeSwitcher } from '@/components/theme-switcher';
import AppLayout from '@/layouts/app-layout';
import { generateDonationsReport } from '@/lib/report-generator';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import FormularioDonacion from './components/formulario-donacion';
import FormularioFundacion from './components/formulario-fundacion';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Donaciones', href: route('donaciones.index') }];

const formatCurrency = (amount: string | number | bigint) => {
    const numericAmount = typeof amount === 'string' ? Number(amount) : amount;
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
    }).format(numericAmount);
};

type DonationStatus = 'pending' | 'completed' | 'cancelled' | 'failed';

type DonationType = {
    id: number;
    shelter?: { id: number; name?: string } | null;
    donor_name: string;
    donor_email?: string | null;
    amount: number;
    created_at: string;
    description?: string;
    status: DonationStatus;
    reference?: string | null;
};

type ShelterType = {
    id: number;
    name: string;
    description: string;
    address: string;
    city: string;
    phone: string;
    latitude: number;
    longitude: number;
};

type ShelterPaymentMethod = {
    id?: number;
    type: 'bank_account' | 'nequi' | 'daviplata';
    account_holder?: string | null;
    document_number?: string | null;
    bank_name?: string | null;
    account_type?: 'Ahorros' | 'Corriente' | null;
    account_number?: string | null;
    phone_number?: string | null;
};

type AuthUser = {
    name: string;
    role: string;
    shelter?: ShelterType | null;
};

const STATUS_LABELS: Record<DonationStatus, string> = {
    pending: 'Pendiente',
    completed: 'Completada',
    cancelled: 'Cancelada',
    failed: 'Fallida',
};

const STATUS_BADGES: Record<DonationStatus, string> = {
    pending: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
    completed: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
    cancelled: 'bg-gradient-to-r from-slate-500 to-slate-600 text-white',
    failed: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
};

const PAYMENT_METHOD_LABELS: Record<NonNullable<ShelterPaymentMethod['type']>, string> = {
    bank_account: 'Cuenta bancaria',
    nequi: 'Nequi',
    daviplata: 'Daviplata',
};

const getPaymentMethodPrimaryText = (paymentMethod: ShelterPaymentMethod | null) => {
    if (!paymentMethod) {
        return 'Aun no has registrado como recibe dinero tu refugio.';
    }

    if (paymentMethod.type === 'bank_account') {
        return `${paymentMethod.bank_name || 'Banco sin definir'} - ${paymentMethod.account_type || 'Cuenta'} ${paymentMethod.account_number || ''}`.trim();
    }

    return `Celular receptor: ${paymentMethod.phone_number || 'Sin numero registrado'}`;
};

const getPaymentMethodSecondaryText = (paymentMethod: ShelterPaymentMethod | null) => {
    if (!paymentMethod) {
        return 'Registra estos datos para dejar lista la recepcion futura del refugio.';
    }

    return [paymentMethod.account_holder, paymentMethod.document_number].filter(Boolean).join(' - ') || 'Sin titular ni documento registrados';
};

const buildImportedDonations = (items: ImportedDonationDraft[], shelter: ShelterType): DonationType[] => {
    const baseId = Date.now();

    return items.map((item, index) => ({
        id: -(baseId + index),
        donor_name: item.donor_name || 'Donante importado',
        donor_email: item.donor_email ?? null,
        amount: item.amount,
        created_at: `${item.created_at}T12:00:00.000Z`,
        description: item.description,
        status: 'completed',
        reference: null,
        shelter: {
            id: shelter.id,
            name: shelter.name,
        },
    }));
};

const DonationsTable = ({ donations, userRole }: { donations: DonationType[]; userRole: string }) => (
    <div className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-white/95 shadow-2xl backdrop-blur-sm transition-all duration-300 dark:bg-gray-800/95">
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 to-transparent"></div>
        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-tr from-purple-500/10 to-transparent"></div>

        <div className="relative p-6">
            <div className="overflow-hidden rounded-2xl border border-gray-200/50 bg-white/50 shadow-lg dark:border-gray-700/50 dark:bg-gray-800/50">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:border-gray-700/50 dark:from-gray-700/50 dark:to-gray-600/50">
                                <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                                    {userRole === 'cliente' ? 'Fundacion' : 'Donante'}
                                </th>
                                {userRole === 'admin' && (
                                    <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                                        Fundacion
                                    </th>
                                )}
                                <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                                    Monto
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                                    Estado
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                                    Fecha
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                                    Descripcion
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                            {donations.map((donation) => (
                                <tr
                                    key={donation.id}
                                    className="group transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 dark:hover:from-gray-700/30 dark:hover:to-gray-600/30"
                                >
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                                            {userRole === 'cliente' ? (donation.shelter?.name ?? 'N/A') : donation.donor_name}
                                        </div>
                                        {donation.reference && (
                                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Ref: {donation.reference}</div>
                                        )}
                                    </td>
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
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold shadow-lg ${STATUS_BADGES[donation.status]}`}>
                                            {STATUS_LABELS[donation.status]}
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
                                            <span className="text-sm text-gray-400 italic dark:text-gray-500">Sin descripcion</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

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
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aun no se han registrado donaciones en el sistema</p>
                </div>
            )}
        </div>
    </div>
);

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
                    <h3 className="mb-2 text-sm font-bold tracking-wider text-green-700 uppercase dark:text-green-300">Donaciones Exitosas</h3>
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
    paymentMethod,
    onEditPaymentMethod,
    onImportSuccess,
}: {
    donations: DonationType[];
    stats: { totalAmount: number; donorsCount: number; donationsCount: number };
    userRole: string;
    paymentMethod: ShelterPaymentMethod | null;
    onEditPaymentMethod: () => void;
    onImportSuccess: (importedDonations: ImportedDonationDraft[]) => void;
}) => (
    <>
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                    <h3 className="mb-2 text-sm font-bold tracking-wider text-green-700 uppercase dark:text-green-300">Donantes Exitosos</h3>
                    <p className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-3xl font-bold text-transparent dark:from-green-400 dark:to-green-600">
                        {stats.donorsCount}
                    </p>
                </div>
            </div>

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
                        {userRole === 'aliado' ? 'Donaciones Completadas' : 'Donaciones Exitosas'}
                    </h3>
                    <p className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-3xl font-bold text-transparent dark:from-blue-400 dark:to-blue-600">
                        {stats.donationsCount}
                    </p>
                </div>
            </div>
        </div>

        {userRole === 'aliado' && (
            <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_1fr]">
                <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-sm dark:bg-gray-800/95">
                    <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl"></div>
                    <div className="relative">
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-bold tracking-wider text-blue-700 uppercase dark:text-blue-300">Recepcion del refugio</p>
                                <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                                    {paymentMethod ? PAYMENT_METHOD_LABELS[paymentMethod.type] : 'Sin configurar'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={onEditPaymentMethod}
                                className="rounded-2xl bg-gradient-to-r from-blue-500 to-blue-700 px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:from-blue-600 hover:to-blue-800"
                            >
                                {paymentMethod ? 'Actualizar recepcion' : 'Registrar recepcion'}
                            </button>
                        </div>

                        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/40 dark:bg-blue-900/20">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{getPaymentMethodPrimaryText(paymentMethod)}</p>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{getPaymentMethodSecondaryText(paymentMethod)}</p>
                        </div>
                    </div>
                </div>

                <div className="relative rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-sm dark:bg-gray-800/95">
                    <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-green-500/10 blur-3xl"></div>
                    <div className="relative">
                        <p className="text-sm font-bold tracking-wider text-green-700 uppercase dark:text-green-300">Importacion historica</p>
                        <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Carga registros manuales</h3>
                        <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <p>Mapea monto y fecha como campos obligatorios.</p>
                            <p>Puedes mapear nombre, correo y descripcion para dejar la tabla mas completa.</p>
                            <p>Las filas importadas se agregan de inmediato a la tabla y al resumen.</p>
                        </div>
                        <div className="mt-5">
                            <ExcelImportComponent onImportSuccess={onImportSuccess} />
                        </div>
                    </div>
                </div>
            </div>
        )}

        <DonationsTable donations={donations} userRole={userRole} />
    </>
);

export default function DonationsSummary() {
    const page = usePage();
    const props = page.props as unknown as {
        donations: DonationType[];
        shelters: ShelterType[];
        shelterPaymentMethod?: ShelterPaymentMethod | null;
        auth: { user: AuthUser };
    };
    const { donations, shelters, shelterPaymentMethod, auth } = props;
    const { user } = auth;
    const [donationsState, setDonationsState] = useState(donations);
    const [shelterPaymentMethodState, setShelterPaymentMethodState] = useState<ShelterPaymentMethod | null>(shelterPaymentMethod ?? null);
    const [showDonationFormModal, setShowDonationFormModal] = useState(false);
    const [showShelterPaymentFormModal, setShowShelterPaymentFormModal] = useState(false);

    useEffect(() => {
        setDonationsState(donations);
    }, [donations]);

    useEffect(() => {
        setShelterPaymentMethodState(shelterPaymentMethod ?? null);
    }, [shelterPaymentMethod]);

    const handleImportSuccess = (importedDonations: ImportedDonationDraft[]) => {
        if (!user.shelter) {
            return;
        }

        setDonationsState((current) => [...buildImportedDonations(importedDonations, user.shelter as ShelterType), ...current]);
    };

    const handlePaymentMethodSaved = (paymentMethod: ShelterPaymentMethod) => {
        setShelterPaymentMethodState((current) => ({
            id: current?.id,
            ...paymentMethod,
        }));
    };

    const completedDonations = donationsState.filter((donation) => donation.status === 'completed');

    const stats = {
        totalAmount: completedDonations.reduce((acc, curr) => acc + parseFloat(curr.amount.toString()), 0),
        donorsCount: new Set(completedDonations.map((donation) => donation.donor_email?.trim() || donation.donor_name.trim()).filter(Boolean)).size,
        donationsCount: completedDonations.length,
    };

    const handleGenerateReport = () => {
        if (donationsState.length === 0) {
            return;
        }

        const reportDonations = donationsState.map((donation) => ({
            id: donation.id,
            donor_name: donation.donor_name,
            amount: donation.amount,
            created_at: donation.created_at,
            shelter: donation.shelter?.name ? { name: donation.shelter.name } : undefined,
        }));

        generateDonationsReport(reportDonations as never, user as never);
    };

    const renderContentByRole = () => {
        if (user.role === 'aliado' && !user.shelter) {
            return <FormularioFundacion />;
        }

        if (user.role === 'cliente') {
            return <ClientView donations={donationsState} stats={stats} onDonateClick={() => setShowDonationFormModal(true)} />;
        }

        if (user.role === 'admin' || (user.role === 'aliado' && user.shelter)) {
            return (
                <AllyAdminView
                    donations={donationsState}
                    stats={stats}
                    userRole={user.role}
                    paymentMethod={shelterPaymentMethodState}
                    onEditPaymentMethod={() => setShowShelterPaymentFormModal(true)}
                    onImportSuccess={handleImportSuccess}
                />
            );
        }

        return <p>Vista no disponible.</p>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Donaciones" />
            <main className="relative flex-1 overflow-y-auto bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-6 dark:from-green-600 dark:via-blue-700 dark:to-purple-800">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
                    <div className="absolute top-1/4 -right-32 h-80 w-80 rounded-full bg-blue-300/10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-purple-300/10 blur-3xl"></div>
                    <div className="absolute top-20 right-20 h-3 w-3 animate-pulse rounded-full bg-white/20 shadow-lg"></div>
                    <div className="absolute top-1/3 left-1/4 h-4 w-4 animate-ping rounded-full bg-white/30 shadow-lg"></div>
                    <div className="absolute right-1/3 bottom-32 h-2 w-2 animate-pulse rounded-full bg-white/25 shadow-md"></div>
                </div>

                <div className="relative z-10 container mx-auto">
                    {!(user.role === 'aliado' && !user.shelter) && (
                        <div className="mb-8 text-center">
                            <h1 className="text-4xl font-bold tracking-tight drop-shadow-lg md:text-5xl lg:text-6xl">
                                <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Sistema de Donaciones</span>
                            </h1>
                            <p className="mt-4 text-xl leading-relaxed font-medium text-white/90">
                                {user.role === 'cliente' ? 'Apoya a las fundaciones de proteccion animal' : 'Gestiona las donaciones de tu fundacion'}
                            </p>
                            <div className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                        </div>
                    )}

                    {!(user.role === 'aliado' && !user.shelter) && (
                        <div className="mb-8 flex flex-wrap justify-center gap-4">
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

                        </div>
                    )}

                    <div className="space-y-8">{renderContentByRole()}</div>

                    {user.role === 'cliente' && (
                        <FormularioDonacion
                            showModal={showDonationFormModal}
                            onClose={() => setShowDonationFormModal(false)}
                            shelters={shelters.map((shelter) => ({ id: shelter.id, name: shelter.name }))}
                        />
                    )}

                    {user.role === 'aliado' && user.shelter && showShelterPaymentFormModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8 backdrop-blur-sm">
                            <div className="max-h-[calc(100vh-4rem)] w-full max-w-4xl overflow-y-auto">
                                <FormularioFundacion
                                    shelter={user.shelter}
                                    paymentMethod={shelterPaymentMethodState ?? null}
                                    compact={true}
                                    onClose={() => setShowShelterPaymentFormModal(false)}
                                    onSaved={handlePaymentMethodSaved}
                                />
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
