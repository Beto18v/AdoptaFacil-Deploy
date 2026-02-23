// resources/js/Pages/Dashboard/Donaciones/components/FormularioFundacion.tsx
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocationPicker } from '@/components/ui/location-picker'; // Importa el componente de mapa interactivo
import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function FormularioFundacion() {
    const page = usePage();
    const auth = (page.props as unknown as { auth: { user?: { name?: string; email?: string } } }).auth;

    // Estado del formulario, ahora incluye latitude y longitude
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: auth?.user?.email || '',
        description: '',
        address: '',
        city: '',
        phone: '',
        bank_name: '',
        account_type: 'Ahorros', // Valor inicial por defecto
        account_number: '',
        latitude: 4.6097, // Valor inicial para Colombia
        longitude: -74.0817,
    });

    // Función para actualizar lat/lng desde el mapa interactivo
    const handleLocationChange = (lat: number, lng: number) => {
        setData('latitude', lat);
        setData('longitude', lng);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('shelter.store'), {
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        });
    };

    return (
        <div className="relative mx-auto max-w-4xl space-y-8 rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm dark:bg-gray-800/95">
            {/* Elementos decorativos */}
            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/20 to-transparent blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-tr from-green-500/15 to-transparent blur-lg"></div>

            <div className="relative text-center">
                <h1 className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-4xl font-bold text-transparent dark:from-blue-400 dark:to-green-400">
                    Registra tu Fundación
                </h1>
                <p className="mt-4 text-xl leading-relaxed text-gray-600 dark:text-gray-300">
                    Completa la siguiente información para que los donantes puedan conocerte y apoyarte.
                </p>
                {/* Línea decorativa */}
                <div className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
            </div>

            <form onSubmit={submit} className="relative space-y-10">
                {/* --- INFORMACIÓN GENERAL --- */}
                <fieldset className="relative space-y-8 overflow-hidden rounded-3xl border-2 border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-green-50/30 p-8 dark:border-blue-700/30 dark:from-blue-900/20 dark:to-green-900/20">
                    <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-gradient-to-br from-blue-300/30 to-transparent blur-lg"></div>
                    <legend className="relative px-4 text-2xl font-bold text-blue-700 dark:text-blue-300">
                        <span className="rounded-xl bg-white/90 px-3 py-1 shadow-lg dark:bg-gray-800/90">📋 Información General</span>
                    </legend>
                    <div className="relative">
                        <Label htmlFor="name" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                            🏛️ Nombre de la Fundación
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-800/30"
                            placeholder="Ej: Fundación Patitas Felices"
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>
                    <div className="relative">
                        <Label htmlFor="email" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                            📧 Correo Electrónico de Contacto
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
                            📝 Descripción o Misión
                        </Label>
                        <textarea
                            id="description"
                            name="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="w-full resize-none rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-800/30"
                            rows={5}
                            placeholder="Describe la misión y objetivos de tu fundación..."
                            required
                        ></textarea>
                        <InputError message={errors.description} className="mt-2" />
                    </div>
                </fieldset>

                {/* --- INFORMACIÓN DE CONTACTO --- */}
                <fieldset className="relative space-y-8 overflow-hidden rounded-3xl border-2 border-green-200/50 bg-gradient-to-br from-green-50/50 to-blue-50/30 p-8 dark:border-green-700/30 dark:from-green-900/20 dark:to-blue-900/20">
                    <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-gradient-to-br from-green-300/30 to-transparent blur-lg"></div>
                    <legend className="relative px-4 text-2xl font-bold text-green-700 dark:text-green-300">
                        <span className="rounded-xl bg-white/90 px-3 py-1 shadow-lg dark:bg-gray-800/90">📍 Información de Contacto</span>
                    </legend>
                    <div className="relative grid grid-cols-1 gap-8 md:grid-cols-2">
                        <div>
                            <Label htmlFor="address" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                🏠 Dirección
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
                                🌆 Ciudad
                            </Label>
                            <Input
                                id="city"
                                name="city"
                                value={data.city}
                                onChange={(e) => setData('city', e.target.value)}
                                className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-800/30"
                                placeholder="Ej: Bogotá"
                                required
                            />
                            <InputError message={errors.city} className="mt-2" />
                        </div>
                        <div className="md:col-span-2">
                            <Label htmlFor="phone" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                📱 Teléfono
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
                    {/* --- UBICACIÓN EN EL MAPA --- */}
                    <div className="relative mt-8">
                        <Label className="mb-4 block text-sm font-bold text-gray-700 dark:text-gray-300">🗺️ Ubicación en el Mapa</Label>
                        <div className="rounded-2xl border-2 border-gray-300/50 bg-gradient-to-br from-gray-50/50 to-white p-4 shadow-inner dark:border-gray-600/30 dark:from-gray-800/50 dark:to-gray-700/50">
                            {/* Mapa interactivo para seleccionar la ubicación */}
                            <LocationPicker initialLat={data.latitude} initialLng={data.longitude} onLocationChange={handleLocationChange} />
                        </div>
                        <div className="mt-3 rounded-xl bg-gray-100/70 p-3 text-center text-xs font-medium text-gray-600 dark:bg-gray-800/70 dark:text-gray-400">
                            📍 Coordenadas: {data.latitude.toFixed(6)}, {data.longitude.toFixed(6)}
                        </div>
                        <InputError message={errors.latitude} className="mt-2" />
                        <InputError message={errors.longitude} className="mt-2" />
                    </div>
                </fieldset>

                {/* --- INFORMACIÓN PARA DONACIONES --- */}
                <fieldset className="relative space-y-8 overflow-hidden rounded-3xl border-2 border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-pink-50/30 p-8 dark:border-purple-700/30 dark:from-purple-900/20 dark:to-pink-900/20">
                    <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-gradient-to-br from-purple-300/30 to-transparent blur-lg"></div>
                    <legend className="relative px-4 text-2xl font-bold text-purple-700 dark:text-purple-300">
                        <span className="rounded-xl bg-white/90 px-3 py-1 shadow-lg dark:bg-gray-800/90">💰 Información para Donaciones</span>
                    </legend>
                    <div className="relative grid grid-cols-1 gap-8 md:grid-cols-2">
                        <div>
                            <Label htmlFor="bank_name" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                🏦 Nombre del Banco
                            </Label>
                            <Input
                                id="bank_name"
                                name="bank_name"
                                value={data.bank_name}
                                onChange={(e) => setData('bank_name', e.target.value)}
                                className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-800/30"
                                placeholder="Ej: Banco de Bogotá"
                                required
                            />
                            <InputError message={errors.bank_name} className="mt-2" />
                        </div>

                        <div>
                            <Label className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">💳 Tipo de Cuenta</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <label
                                    className={`group flex cursor-pointer items-center justify-center rounded-2xl p-4 text-center text-sm font-bold shadow-lg transition-all duration-300 hover:scale-105 ${
                                        data.account_type === 'Ahorros'
                                            ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-2xl ring-4 ring-purple-300'
                                            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-purple-100 hover:to-purple-200 dark:from-gray-700 dark:to-gray-800 dark:text-gray-300 dark:hover:from-purple-900/50 dark:hover:to-purple-800/50'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="account_type"
                                        value="Ahorros"
                                        checked={data.account_type === 'Ahorros'}
                                        onChange={(e) => setData('account_type', e.target.value)}
                                        className="sr-only"
                                    />
                                    🏛️ Ahorros
                                </label>
                                <label
                                    className={`group flex cursor-pointer items-center justify-center rounded-2xl p-4 text-center text-sm font-bold shadow-lg transition-all duration-300 hover:scale-105 ${
                                        data.account_type === 'Corriente'
                                            ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-2xl ring-4 ring-purple-300'
                                            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-purple-100 hover:to-purple-200 dark:from-gray-700 dark:to-gray-800 dark:text-gray-300 dark:hover:from-purple-900/50 dark:hover:to-purple-800/50'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="account_type"
                                        value="Corriente"
                                        checked={data.account_type === 'Corriente'}
                                        onChange={(e) => setData('account_type', e.target.value)}
                                        className="sr-only"
                                    />
                                    💼 Corriente
                                </label>
                            </div>
                            <InputError message={errors.account_type} className="mt-2" />
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="account_number" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                🔢 Número de Cuenta
                            </Label>
                            <Input
                                id="account_number"
                                name="account_number"
                                value={data.account_number}
                                onChange={(e) => setData('account_number', e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-800/30"
                                placeholder="Ej: 1234567890"
                                required
                            />
                            <InputError message={errors.account_number} className="mt-2" />
                        </div>
                    </div>
                </fieldset>

                <div className="flex justify-center pt-8">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="group hover:shadow-3xl relative w-full overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 via-purple-600 to-green-500 px-12 py-4 text-lg font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:opacity-50 md:w-auto"
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
                                    Registrando fundación...
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
                                    Registrar mi Fundación
                                </>
                            )}
                        </span>
                    </Button>
                </div>
            </form>
        </div>
    );
}
