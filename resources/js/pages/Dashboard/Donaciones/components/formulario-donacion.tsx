import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { backendJson } from '@/lib/http';
import { showToast } from '@/lib/toast';
import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface Shelter {
    id: number;
    name: string;
}

interface FormularioDonacionProps {
    showModal: boolean;
    onClose: () => void;
    shelters: Shelter[];
}

type DonationForm = {
    donor_name: string;
    donor_email: string;
    amount: string;
    shelter_id: string;
};

type DonationResponse = {
    checkout_url?: string;
    message?: string;
    errors?: Partial<Record<keyof DonationForm, string[]>>;
};

export default function FormularioDonacion({ showModal, onClose, shelters }: FormularioDonacionProps) {
    const page = usePage();
    const auth = (page.props as unknown as { auth: { user: { name?: string; email?: string } } }).auth;

    const { data, setData, errors, setError, clearErrors, reset } = useForm<DonationForm>({
        donor_name: auth.user.name || '',
        donor_email: auth.user.email || '',
        amount: '',
        shelter_id: shelters.length === 1 ? shelters[0].id.toString() : '',
    });

    const [montoPersonalizado, setMontoPersonalizado] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatCurrency = (amount: string | number | bigint) => {
        const numericAmount = typeof amount === 'string' ? Number(amount) : amount;
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(numericAmount);
    };

    const handleMontoClick = (monto: string) => {
        setData('amount', monto);
        setMontoPersonalizado('');
    };

    const handleMontoPersonalizadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMontoPersonalizado(e.target.value);
        setData('amount', e.target.value);
    };

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        clearErrors();
        setIsSubmitting(true);

        try {
            const { response, data: responseData } = await backendJson<DonationResponse>(route('donaciones.store'), {
                method: 'POST',
                json: data,
            });

            if (response.ok && responseData?.checkout_url) {
                window.location.assign(responseData.checkout_url);
                return;
            }

            if (response.status === 422 && responseData?.errors) {
                Object.entries(responseData.errors).forEach(([field, messages]) => {
                    if (messages?.[0]) {
                        setError(field as keyof DonationForm, messages[0]);
                    }
                });

                return;
            }

            showToast(responseData?.message || 'No fue posible iniciar el pago con Wompi.', 'error');
        } catch (error) {
            console.error('Error al iniciar el checkout de Wompi:', error);
            showToast('Error de conexion al iniciar el checkout con Wompi.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetFormState = () => {
        reset();
        setMontoPersonalizado('');
        setData('donor_name', auth.user.name || '');
        setData('donor_email', auth.user.email || '');
        setData('shelter_id', shelters.length === 1 ? shelters[0].id.toString() : '');
    };

    const handleClose = () => {
        resetFormState();
        clearErrors();
        onClose();
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative mx-4 my-8 max-h-[calc(100vh-4rem)] w-full max-w-2xl overflow-hidden rounded-3xl bg-white/95 shadow-2xl backdrop-blur-sm dark:bg-gray-800/95">
                <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br from-purple-500/20 to-transparent blur-xl"></div>
                <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-tr from-blue-500/15 to-transparent blur-lg"></div>

                <div className="relative max-h-[calc(100vh-4rem)] overflow-y-auto p-6 sm:p-8">
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex-1">
                            <h2 className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-3xl font-bold text-transparent dark:from-purple-400 dark:to-blue-400">
                                Realizar una Donacion
                            </h2>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">
                                Completa los datos y te enviaremos al checkout seguro de Wompi.
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="group relative rounded-full p-2 text-gray-500 transition-all duration-200 hover:bg-red-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
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
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <fieldset className="relative space-y-6 overflow-hidden rounded-3xl border-2 border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-blue-50/30 p-6 dark:border-purple-700/30 dark:from-purple-900/20 dark:to-blue-900/20">
                            <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-gradient-to-br from-purple-300/30 to-transparent blur-lg"></div>
                            <legend className="relative px-4 text-lg font-bold text-purple-700 dark:text-purple-300">
                                <span className="rounded-lg bg-white/90 px-2 dark:bg-gray-800/90">Tus datos</span>
                            </legend>
                            <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="donor_name" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Nombre del donante
                                    </Label>
                                    <Input
                                        id="donor_name"
                                        value={data.donor_name}
                                        readOnly
                                        className="mt-2 cursor-not-allowed rounded-xl border-gray-300 bg-gradient-to-r from-gray-100 to-gray-200 shadow-inner dark:border-gray-600 dark:from-gray-700 dark:to-gray-800"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="donor_email" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Correo electronico
                                    </Label>
                                    <Input
                                        id="donor_email"
                                        type="email"
                                        value={data.donor_email}
                                        readOnly
                                        className="mt-2 cursor-not-allowed rounded-xl border-gray-300 bg-gradient-to-r from-gray-100 to-gray-200 shadow-inner dark:border-gray-600 dark:from-gray-700 dark:to-gray-800"
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <div className="relative">
                            <Label htmlFor="shelter_id" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Selecciona una fundacion
                            </Label>
                            <div className="group relative">
                                <select
                                    id="shelter_id"
                                    name="shelter_id"
                                    value={data.shelter_id}
                                    onChange={(e) => setData('shelter_id', e.target.value)}
                                    className="w-full appearance-none rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 pr-12 text-gray-800 shadow-lg transition-all duration-200 hover:border-purple-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none disabled:cursor-not-allowed disabled:from-gray-100 disabled:to-gray-200 disabled:opacity-50 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:hover:border-purple-500 dark:focus:border-purple-400 dark:focus:ring-purple-800/30 dark:disabled:from-gray-600 dark:disabled:to-gray-700"
                                    required
                                    disabled={shelters.length === 1}
                                >
                                    {shelters.length > 1 && (
                                        <option value="" className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                            -- Elige una fundacion --
                                        </option>
                                    )}
                                    {shelters.map((shelter) => (
                                        <option
                                            key={shelter.id}
                                            value={shelter.id}
                                            className="bg-white py-2 text-gray-800 dark:bg-gray-700 dark:text-white"
                                        >
                                            {shelter.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                                    <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 p-1 shadow-lg">
                                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <InputError message={errors.shelter_id} className="mt-2" />
                        </div>

                        <div>
                            <label className="mb-4 block text-sm font-bold text-gray-700 dark:text-gray-300">Selecciona un monto (COP)</label>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                {['20000', '50000', '100000', '200000'].map((monto) => (
                                    <button
                                        key={monto}
                                        type="button"
                                        onClick={() => handleMontoClick(monto)}
                                        className={`group relative overflow-hidden rounded-2xl p-4 text-center font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                                            data.amount === monto
                                                ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-2xl ring-4 ring-purple-300'
                                                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-purple-100 hover:to-purple-200 dark:from-gray-700 dark:to-gray-800 dark:text-gray-300 dark:hover:from-purple-900/50 dark:hover:to-purple-800/50'
                                        }`}
                                    >
                                        <div
                                            className={`absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 ${data.amount === monto ? 'group-hover:opacity-100' : ''}`}
                                        ></div>
                                        <span className="relative text-sm">{formatCurrency(monto)}</span>
                                    </button>
                                ))}
                            </div>
                            <InputError message={errors.amount} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="custom-amount" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                O ingresa un monto personalizado
                            </label>
                            <Input
                                id="custom-amount"
                                type="number"
                                value={montoPersonalizado}
                                onChange={handleMontoPersonalizadoChange}
                                placeholder="Ej: 10000 (minimo)"
                                className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-800/30"
                            />
                        </div>

                        <div className="mt-8 text-center">
                            <Button
                                type="submit"
                                disabled={isSubmitting || !data.amount || !data.shelter_id}
                                className="group hover:shadow-3xl relative w-full overflow-hidden rounded-3xl bg-gradient-to-r from-purple-500 to-purple-700 px-8 py-4 text-lg font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:from-purple-600 hover:to-purple-800 disabled:scale-100 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-600 disabled:opacity-50"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                <span className="relative flex items-center justify-center gap-3">
                                    {isSubmitting ? (
                                        <>
                                            <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                                                <path
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    className="opacity-75"
                                                ></path>
                                            </svg>
                                            Preparando pago...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                />
                                            </svg>
                                            {`Pagar con Wompi ${data.amount ? formatCurrency(data.amount) : ''}`}
                                        </>
                                    )}
                                </span>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
