import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocationPicker } from '@/components/ui/location-picker';
import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type PaymentReceiverType = 'bank_account' | 'nequi' | 'daviplata';
type AccountType = 'Ahorros' | 'Corriente';

interface ShelterFormData {
    id: number;
    name: string;
    description: string;
    address: string;
    city: string;
    phone: string;
    latitude: number;
    longitude: number;
}

interface ShelterPaymentMethodData {
    type: PaymentReceiverType;
    account_holder?: string | null;
    document_number?: string | null;
    bank_name?: string | null;
    account_type?: AccountType | null;
    account_number?: string | null;
    phone_number?: string | null;
}

interface FormularioFundacionProps {
    shelter?: ShelterFormData | null;
    paymentMethod?: ShelterPaymentMethodData | null;
    compact?: boolean;
    onClose?: () => void;
    onSaved?: (paymentMethod: ShelterPaymentMethodData) => void;
}

export default function FormularioFundacion({
    shelter = null,
    paymentMethod = null,
    compact = false,
    onClose,
    onSaved,
}: FormularioFundacionProps = {}) {
    const page = usePage();
    const auth = (page.props as unknown as { auth: { user?: { email?: string } } }).auth;
    const isEditing = Boolean(shelter);

    const { data, setData, post, put, processing, errors } = useForm({
        name: shelter?.name ?? '',
        email: auth?.user?.email || '',
        description: shelter?.description ?? '',
        address: shelter?.address ?? '',
        city: shelter?.city ?? '',
        phone: shelter?.phone ?? '',
        latitude: shelter?.latitude ?? 4.6097,
        longitude: shelter?.longitude ?? -74.0817,
        payment_receiver_type: paymentMethod?.type ?? ('bank_account' as PaymentReceiverType),
        bank_name: paymentMethod?.bank_name ?? '',
        account_type: paymentMethod?.account_type ?? ('Ahorros' as AccountType),
        account_number: paymentMethod?.account_number ?? '',
        payment_receiver_phone: paymentMethod?.phone_number ?? '',
        account_holder: paymentMethod?.account_holder ?? shelter?.name ?? '',
        document_number: paymentMethod?.document_number ?? '',
    });

    const isBankAccount = data.payment_receiver_type === 'bank_account';
    const isDigitalWallet = data.payment_receiver_type === 'nequi' || data.payment_receiver_type === 'daviplata';

    const buildSavedPaymentMethod = (): ShelterPaymentMethodData => ({
        type: data.payment_receiver_type,
        account_holder: data.account_holder || null,
        document_number: data.document_number || null,
        bank_name: isBankAccount ? data.bank_name || null : null,
        account_type: isBankAccount ? data.account_type : null,
        account_number: isBankAccount ? data.account_number || null : null,
        phone_number: isDigitalWallet ? data.payment_receiver_phone || null : null,
    });

    const handleLocationChange = (lat: number, lng: number) => {
        setData('latitude', lat);
        setData('longitude', lng);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                onSaved?.(buildSavedPaymentMethod());
                onClose?.();
            },
        };

        if (isEditing && shelter) {
            put(route('shelter.update', shelter.id), options);
            return;
        }

        post(route('shelter.store'), options);
    };

    return (
        <div
            className={`relative mx-auto rounded-3xl bg-white/95 shadow-2xl backdrop-blur-sm dark:bg-gray-800/95 ${
                compact ? 'max-w-3xl space-y-6 border border-white/15 p-6' : 'max-w-4xl space-y-8 p-8'
            }`}
        >
            <div
                className={`absolute rounded-full bg-gradient-to-br from-blue-500/20 to-transparent blur-xl ${compact ? '-top-6 -right-6 h-24 w-24' : '-top-8 -right-8 h-32 w-32'}`}
            ></div>
            <div
                className={`absolute rounded-full bg-gradient-to-tr from-green-500/15 to-transparent blur-lg ${compact ? '-bottom-6 -left-6 h-20 w-20' : '-bottom-8 -left-8 h-24 w-24'}`}
            ></div>

            <div className={`relative ${compact ? 'border-b border-gray-200/70 pr-12 pb-4 text-left dark:border-gray-700/70' : 'text-center'}`}>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className={`absolute rounded-full p-2 text-gray-500 transition hover:bg-red-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 ${compact ? 'top-0 right-0' : 'top-0 right-0'}`}
                        aria-label="Cerrar"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                <h1
                    className={`bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text font-bold text-transparent dark:from-blue-400 dark:to-green-400 ${
                        compact ? 'text-2xl' : 'text-4xl'
                    }`}
                >
                    {isEditing ? 'Configura como recibe donaciones tu refugio' : 'Registra tu fundacion'}
                </h1>
                <p className={`leading-relaxed text-gray-600 dark:text-gray-300 ${compact ? 'mt-2 text-sm' : 'mt-4 text-xl'}`}>
                    {isEditing
                        ? 'Actualiza el medio de recepcion sin cambiar la experiencia actual del modulo.'
                        : 'Completa la informacion para que los donantes puedan encontrarte y apoyarte.'}
                </p>
                {!compact && <div className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>}
            </div>

            <form onSubmit={submit} className={`relative ${compact ? 'space-y-6' : 'space-y-10'}`}>
                {!compact && (
                    <>
                        <fieldset className="relative space-y-8 overflow-hidden rounded-3xl border-2 border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-green-50/30 p-8 dark:border-blue-700/30 dark:from-blue-900/20 dark:to-green-900/20">
                            <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-gradient-to-br from-blue-300/30 to-transparent blur-lg"></div>
                            <legend className="relative px-4 text-2xl font-bold text-blue-700 dark:text-blue-300">
                                <span className="rounded-xl bg-white/90 px-3 py-1 shadow-lg dark:bg-gray-800/90">Informacion general</span>
                            </legend>
                            <div className="relative">
                                <Label htmlFor="name" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Nombre de la fundacion
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-800/30"
                                    placeholder="Ej: Fundacion Patitas Felices"
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>
                            <div className="relative">
                                <Label htmlFor="email" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Correo electronico de contacto
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    value={data.email}
                                    readOnly
                                    className="w-full cursor-not-allowed rounded-xl border-2 border-gray-300 bg-gradient-to-r from-gray-100 to-gray-200 p-4 text-gray-600 shadow-inner dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-gray-400"
                                />
                            </div>
                            <div className="relative">
                                <Label htmlFor="description" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Descripcion o mision
                                </Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full resize-none rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-800/30"
                                    rows={5}
                                    placeholder="Describe la mision y objetivos de tu fundacion..."
                                    required
                                ></textarea>
                                <InputError message={errors.description} className="mt-2" />
                            </div>
                        </fieldset>

                        <fieldset className="relative space-y-8 overflow-hidden rounded-3xl border-2 border-green-200/50 bg-gradient-to-br from-green-50/50 to-blue-50/30 p-8 dark:border-green-700/30 dark:from-green-900/20 dark:to-blue-900/20">
                            <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-gradient-to-br from-green-300/30 to-transparent blur-lg"></div>
                            <legend className="relative px-4 text-2xl font-bold text-green-700 dark:text-green-300">
                                <span className="rounded-xl bg-white/90 px-3 py-1 shadow-lg dark:bg-gray-800/90">Informacion de contacto</span>
                            </legend>
                            <div className="relative grid grid-cols-1 gap-8 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="address" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Direccion
                                    </Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-800/30"
                                        placeholder="Ej: Calle 123 #45-67"
                                        required
                                    />
                                    <InputError message={errors.address} className="mt-2" />
                                </div>
                                <div>
                                    <Label htmlFor="city" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Ciudad
                                    </Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-800/30"
                                        placeholder="Ej: Bogota"
                                        required
                                    />
                                    <InputError message={errors.city} className="mt-2" />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="phone" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Telefono
                                    </Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-800/30"
                                        placeholder="Ej: +57 300 123 4567"
                                        required
                                    />
                                    <InputError message={errors.phone} className="mt-2" />
                                </div>
                            </div>
                            <div className="relative mt-8">
                                <Label className="mb-4 block text-sm font-bold text-gray-700 dark:text-gray-300">Ubicacion en el mapa</Label>
                                <div className="rounded-2xl border-2 border-gray-300/50 bg-gradient-to-br from-gray-50/50 to-white p-4 shadow-inner dark:border-gray-600/30 dark:from-gray-800/50 dark:to-gray-700/50">
                                    <LocationPicker initialLat={data.latitude} initialLng={data.longitude} onLocationChange={handleLocationChange} />
                                </div>
                                <div className="mt-3 rounded-xl bg-gray-100/70 p-3 text-center text-xs font-medium text-gray-600 dark:bg-gray-800/70 dark:text-gray-400">
                                    Coordenadas: {data.latitude.toFixed(6)}, {data.longitude.toFixed(6)}
                                </div>
                                <InputError message={errors.latitude} className="mt-2" />
                                <InputError message={errors.longitude} className="mt-2" />
                            </div>
                        </fieldset>
                    </>
                )}

                <fieldset
                    className={`relative overflow-hidden rounded-3xl border-2 border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-pink-50/30 dark:border-purple-700/30 dark:from-purple-900/20 dark:to-pink-900/20 ${
                        compact ? 'space-y-6 p-6' : 'space-y-8 p-8'
                    }`}
                >
                    <div
                        className={`absolute rounded-full bg-gradient-to-br from-purple-300/30 to-transparent blur-lg ${compact ? '-top-3 -right-3 h-16 w-16' : '-top-4 -right-4 h-20 w-20'}`}
                    ></div>
                    <legend className={`relative font-bold text-purple-700 dark:text-purple-300 ${compact ? 'px-2 text-lg' : 'px-4 text-2xl'}`}>
                        <span className={`bg-white/90 shadow-lg dark:bg-gray-800/90 ${compact ? 'rounded-lg px-2 py-1' : 'rounded-xl px-3 py-1'}`}>
                            Informacion para donaciones
                        </span>
                    </legend>

                    <div>
                        <Label className="mb-4 block text-sm font-bold text-gray-700 dark:text-gray-300">Como recibe dinero tu refugio</Label>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {[
                                { value: 'bank_account', label: 'Cuenta bancaria' },
                                { value: 'nequi', label: 'Nequi' },
                                { value: 'daviplata', label: 'Daviplata' },
                            ].map((option) => (
                                <label
                                    key={option.value}
                                    className={`group flex cursor-pointer items-center justify-center rounded-2xl p-4 text-center text-sm font-bold shadow-lg transition-all duration-300 hover:scale-105 ${
                                        data.payment_receiver_type === option.value
                                            ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-2xl ring-4 ring-purple-300'
                                            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-purple-100 hover:to-purple-200 dark:from-gray-700 dark:to-gray-800 dark:text-gray-300 dark:hover:from-purple-900/50 dark:hover:to-purple-800/50'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="payment_receiver_type"
                                        value={option.value}
                                        checked={data.payment_receiver_type === option.value}
                                        onChange={(e) => setData('payment_receiver_type', e.target.value as PaymentReceiverType)}
                                        className="sr-only"
                                    />
                                    {option.label}
                                </label>
                            ))}
                        </div>
                        <InputError message={errors.payment_receiver_type} className="mt-2" />
                    </div>

                    {isBankAccount && (
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <div>
                                <Label htmlFor="bank_name" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Banco
                                </Label>
                                <Input
                                    id="bank_name"
                                    name="bank_name"
                                    value={data.bank_name}
                                    onChange={(e) => setData('bank_name', e.target.value)}
                                    className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-800/30"
                                    placeholder="Ej: Banco de Bogota"
                                />
                                <InputError message={errors.bank_name} className="mt-2" />
                            </div>

                            <div>
                                <Label className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">Tipo de cuenta</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    {(['Ahorros', 'Corriente'] as AccountType[]).map((option) => (
                                        <label
                                            key={option}
                                            className={`group flex cursor-pointer items-center justify-center rounded-2xl p-4 text-center text-sm font-bold shadow-lg transition-all duration-300 hover:scale-105 ${
                                                data.account_type === option
                                                    ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-2xl ring-4 ring-purple-300'
                                                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-purple-100 hover:to-purple-200 dark:from-gray-700 dark:to-gray-800 dark:text-gray-300 dark:hover:from-purple-900/50 dark:hover:to-purple-800/50'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="account_type"
                                                value={option}
                                                checked={data.account_type === option}
                                                onChange={(e) => setData('account_type', e.target.value as AccountType)}
                                                className="sr-only"
                                            />
                                            {option}
                                        </label>
                                    ))}
                                </div>
                                <InputError message={errors.account_type} className="mt-2" />
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="account_number" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Numero de cuenta
                                </Label>
                                <Input
                                    id="account_number"
                                    name="account_number"
                                    value={data.account_number}
                                    onChange={(e) => setData('account_number', e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-800/30"
                                    placeholder="Ej: 1234567890"
                                />
                                <InputError message={errors.account_number} className="mt-2" />
                            </div>
                        </div>
                    )}

                    {isDigitalWallet && (
                        <div>
                            <Label htmlFor="payment_receiver_phone" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Celular receptor
                            </Label>
                            <Input
                                id="payment_receiver_phone"
                                name="payment_receiver_phone"
                                value={data.payment_receiver_phone}
                                onChange={(e) => setData('payment_receiver_phone', e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-800/30"
                                placeholder="Ej: 3001234567"
                            />
                            <InputError message={errors.payment_receiver_phone} className="mt-2" />
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        <div>
                            <Label htmlFor="account_holder" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Titular
                            </Label>
                            <Input
                                id="account_holder"
                                name="account_holder"
                                value={data.account_holder}
                                onChange={(e) => setData('account_holder', e.target.value)}
                                className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-800/30"
                                placeholder="Nombre del titular"
                            />
                            <InputError message={errors.account_holder} className="mt-2" />
                        </div>

                        <div>
                            <Label htmlFor="document_number" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Documento
                            </Label>
                            <Input
                                id="document_number"
                                name="document_number"
                                value={data.document_number}
                                onChange={(e) => setData('document_number', e.target.value)}
                                className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-800/30"
                                placeholder="Opcional"
                            />
                            <InputError message={errors.document_number} className="mt-2" />
                        </div>
                    </div>
                </fieldset>

                <div className={`flex ${compact ? 'justify-end pt-2' : 'justify-center pt-8'}`}>
                    <Button
                        type="submit"
                        disabled={processing}
                        className={`group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 via-purple-600 to-green-500 font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:opacity-50 ${
                            compact ? 'w-full px-8 py-3 text-base md:w-auto' : 'w-full px-12 py-4 text-lg md:w-auto'
                        }`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                        <span className="relative flex items-center justify-center gap-3">
                            {processing ? (
                                <>
                                    <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                                        <path
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            className="opacity-75"
                                        ></path>
                                    </svg>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                        />
                                    </svg>
                                    {isEditing ? 'Guardar metodo de recepcion' : 'Registrar mi fundacion'}
                                </>
                            )}
                        </span>
                    </Button>
                </div>
            </form>
        </div>
    );
}
