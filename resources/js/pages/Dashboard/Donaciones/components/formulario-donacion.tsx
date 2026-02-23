// resources/js/pages/Dashboard/Donaciones/components/formulario-donacion.tsx
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';

interface Shelter {
    id: number;
    name: string;
}

interface FormularioDonacionProps {
    showModal: boolean;
    onClose: () => void;
    shelters: Shelter[];
}

type PaymentMethod = 'pse' | 'tarjeta';

export default function FormularioDonacion({ showModal, onClose, shelters }: FormularioDonacionProps) {
    const page = usePage();
    const auth = (page.props as unknown as { auth: { user: { name?: string; email?: string } } }).auth;

    const { data, setData, post, processing, errors, reset, wasSuccessful, clearErrors } = useForm({
        donor_name: auth.user.name || '',
        donor_email: auth.user.email || '',
        amount: '',
        shelter_id: shelters.length === 1 ? shelters[0].id.toString() : '',
        payment_method: null as PaymentMethod | null, // Se añade el método de pago al formulario
    });

    const [montoPersonalizado, setMontoPersonalizado] = useState('');
    const [mostrarAgradecimiento, setMostrarAgradecimiento] = useState(false);

    useEffect(() => {
        if (wasSuccessful) {
            setMostrarAgradecimiento(true);
        }
    }, [wasSuccessful]);

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

    const handlePaymentMethodSelect = (method: PaymentMethod) => {
        setData('payment_method', method);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        // Ahora, al enviar el formulario, el backend recibirá el 'payment_method' seleccionado
        // y podrá iniciar el proceso con la pasarela de pago correspondiente.
        post(route('donaciones.store'), {
            preserveScroll: true,
            onSuccess: () => {
                // La lógica de redirección a la pasarela de pago
                // debería ser manejada por la respuesta del backend.
            },
        });
    };

    const resetFormState = () => {
        reset();
        setMontoPersonalizado('');
        setMostrarAgradecimiento(false);
    };

    const handleClose = () => {
        resetFormState();
        clearErrors();
        onClose();
    };

    const handleOtraDonacion = () => {
        resetFormState();
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative mx-4 my-8 max-h-[calc(100vh-4rem)] w-full max-w-2xl overflow-hidden rounded-3xl bg-white/95 shadow-2xl backdrop-blur-sm dark:bg-gray-800/95">
                {/* Elementos decorativos */}
                <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br from-purple-500/20 to-transparent blur-xl"></div>
                <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-tr from-blue-500/15 to-transparent blur-lg"></div>

                <div className="relative max-h-[calc(100vh-4rem)] overflow-y-auto p-6 sm:p-8">
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex-1">
                            <h2 className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-3xl font-bold text-transparent dark:from-purple-400 dark:to-blue-400">
                                {mostrarAgradecimiento ? '¡Gracias por tu Donación!' : 'Realizar una Donación'}
                            </h2>
                            {!mostrarAgradecimiento && (
                                <p className="mt-2 text-gray-600 dark:text-gray-300">Tu generosidad marca la diferencia en la vida de las mascotas</p>
                            )}
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

                    {mostrarAgradecimiento ? (
                        <div className="flex min-h-[400px] flex-col items-center justify-center px-4 text-center">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-green-600 shadow-2xl">
                                <svg
                                    className="h-10 w-10 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <p className="mb-8 max-w-md text-xl leading-relaxed text-gray-700 dark:text-gray-300">
                                Tu generosa contribución ayudará a muchas mascotas. Hemos enviado un recibo a tu correo electrónico.
                            </p>
                            <div className="flex w-full max-w-md flex-col gap-4 sm:flex-row sm:justify-center">
                                <button
                                    onClick={handleOtraDonacion}
                                    className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 to-blue-700 px-8 py-3 font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                    <span className="relative">Realizar otra donación</span>
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-400 to-gray-600 px-8 py-3 font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 dark:from-gray-600 dark:to-gray-800"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                    <span className="relative">Cerrar</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <fieldset className="relative space-y-6 overflow-hidden rounded-3xl border-2 border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-blue-50/30 p-6 dark:border-purple-700/30 dark:from-purple-900/20 dark:to-blue-900/20">
                                <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-gradient-to-br from-purple-300/30 to-transparent blur-lg"></div>
                                <legend className="relative px-4 text-lg font-bold text-purple-700 dark:text-purple-300">
                                    <span className="rounded-lg bg-white/90 px-2 dark:bg-gray-800/90">👤 Tus Datos</span>
                                </legend>
                                <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="donor_name" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                            Nombre del Donante
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
                                            Correo Electrónico
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
                                    🏠 Selecciona una fundación
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
                                        style={{
                                            backgroundImage: 'none',
                                        }}
                                    >
                                        {shelters.length > 1 && (
                                            <option value="" className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                                -- Elige una fundación --
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
                                            <svg
                                                className="h-4 w-4 text-white transition-transform duration-200 group-focus-within:rotate-180"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <InputError message={errors.shelter_id} className="mt-2" />
                            </div>

                            <div>
                                <label className="mb-4 block text-sm font-bold text-gray-700 dark:text-gray-300">💰 Selecciona un monto (COP)</label>
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
                                    ✏️ O ingresa un monto personalizado
                                </label>
                                <Input
                                    id="custom-amount"
                                    type="number"
                                    value={montoPersonalizado}
                                    onChange={handleMontoPersonalizadoChange}
                                    placeholder="Ej: 10000 (mínimo)"
                                    className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-800/30"
                                />
                            </div>

                            <div>
                                <Label className="mb-4 block text-center text-sm font-bold text-gray-700 dark:text-gray-300">
                                    💳 Selecciona tu método de pago
                                </Label>
                                <div className="flex justify-center gap-6">
                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => handlePaymentMethodSelect('pse')}
                                            className={`group relative flex h-24 w-36 items-center justify-center overflow-hidden rounded-2xl border-3 p-4 transition-all duration-300 hover:scale-105 ${
                                                data.payment_method === 'pse'
                                                    ? 'border-blue-600 bg-gradient-to-br from-blue-100 to-blue-200 shadow-2xl ring-4 ring-blue-300 dark:from-blue-900/50 dark:to-blue-800/50'
                                                    : 'border-gray-300 bg-gradient-to-br from-white to-gray-100 shadow-lg hover:border-blue-400 hover:shadow-xl dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:hover:border-blue-500'
                                            }`}
                                        >
                                            <img
                                                src="https://d1ih8jugeo2m5m.cloudfront.net/2023/05/pse-1-300x300.png"
                                                alt="PSE"
                                                className="h-16 w-auto transition-transform group-hover:scale-110"
                                            />
                                        </button>
                                        {data.payment_method === 'pse' && (
                                            <p className="mt-3 animate-pulse text-sm font-bold text-blue-600 dark:text-blue-400">
                                                ✓ PSE Seleccionado
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => handlePaymentMethodSelect('tarjeta')}
                                            className={`group relative flex h-24 w-36 items-center justify-center overflow-hidden rounded-2xl border-3 p-4 transition-all duration-300 hover:scale-105 ${
                                                data.payment_method === 'tarjeta'
                                                    ? 'border-green-600 bg-gradient-to-br from-green-100 to-green-200 shadow-2xl ring-4 ring-green-300 dark:from-green-900/50 dark:to-green-800/50'
                                                    : 'border-gray-300 bg-gradient-to-br from-white to-gray-100 shadow-lg hover:border-green-400 hover:shadow-xl dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:hover:border-green-500'
                                            }`}
                                        >
                                            <img
                                                src="https://images.vexels.com/media/users/3/263269/isolated/preview/a461aa900b9a0fc2c3b1533899ed29d0-icono-de-tarjetas-de-visita-de-dinero.png"
                                                alt="Tarjeta"
                                                className="h-14 w-auto transition-transform group-hover:scale-110"
                                            />
                                        </button>
                                        {data.payment_method === 'tarjeta' && (
                                            <p className="mt-3 animate-pulse text-sm font-bold text-green-600 dark:text-green-400">
                                                ✓ Tarjeta Seleccionada
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 text-center">
                                <Button
                                    type="submit"
                                    disabled={processing || !data.amount || !data.shelter_id || !data.payment_method}
                                    className="group hover:shadow-3xl relative w-full overflow-hidden rounded-3xl bg-gradient-to-r from-purple-500 to-purple-700 px-8 py-4 text-lg font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:from-purple-600 hover:to-purple-800 disabled:scale-100 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-600 disabled:opacity-50"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                    <span className="relative flex items-center justify-center gap-3">
                                        {processing ? (
                                            <>
                                                <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                        className="opacity-25"
                                                    ></circle>
                                                    <path
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        className="opacity-75"
                                                    ></path>
                                                </svg>
                                                Procesando donación...
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
                                                {`Donar ${data.amount ? formatCurrency(data.amount) : ''}`}
                                            </>
                                        )}
                                    </span>
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
