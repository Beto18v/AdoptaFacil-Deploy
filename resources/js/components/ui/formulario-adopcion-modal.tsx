import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';

// Componentes de UI
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// --- Interfaces para Tipado ---
interface MascotaAdopcion {
    id: number;
    name?: string;
    nombre?: string;
    type?: 'pet' | 'product';
    tipo?: 'producto' | 'mascota';
}

interface AdopcionFormData {
    [key: string]: string | number | boolean;
    nombre_completo: string;
    cedula: string;
    email: string;
    telefono: string;
    direccion_ciudad: string;
    direccion_barrio: string;
    direccion_postal: string;
    tipo_vivienda: string;
    propiedad_vivienda: string;
    tiene_patio: string;
    permiten_mascotas_alquiler: string;
    cantidad_convivientes: number;
    hay_ninos: string;
    edades_ninos: string;
    todos_acuerdo_adopcion: string;
    tiene_otras_mascotas: string;
    otras_mascotas_detalles: string;
    tuvo_mascotas_antes: string;
    que_paso_mascotas_anteriores: string;
    mascota_id: number;
    porque_adopta: string;
    que_espera_convivencia: string;
    que_haria_problemas_comportamiento: string;
    acepta_visitas_seguimiento: string;
    acepta_proceso_evaluacion: boolean;
    acepta_cuidado_responsable: boolean;
    acepta_contrato_adopcion: boolean;
}

interface FormularioAdopcionModalProps {
    mascota: MascotaAdopcion;
    show: boolean;
    onClose: () => void;
}

// Componente de Sección reutilizable
const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
    // Función para obtener colores únicos por sección
    const getSectionColors = (title: string) => {
        if (title.includes('Personal')) {
            return {
                border: 'border-blue-200/50 dark:border-blue-700/30',
                bg: 'bg-gradient-to-br from-blue-50/50 to-green-50/30 dark:from-blue-900/20 dark:to-green-900/20',
                decoration: 'bg-gradient-to-br from-blue-300/30 to-transparent',
                legendBg: 'bg-white/90 dark:bg-gray-800/90',
                legendText: 'text-blue-700 dark:text-blue-300',
            };
        } else if (title.includes('Vivienda')) {
            return {
                border: 'border-green-200/50 dark:border-green-700/30',
                bg: 'bg-gradient-to-br from-green-50/50 to-blue-50/30 dark:from-green-900/20 dark:to-blue-900/20',
                decoration: 'bg-gradient-to-br from-green-300/30 to-transparent',
                legendBg: 'bg-white/90 dark:bg-gray-800/90',
                legendText: 'text-green-700 dark:text-green-300',
            };
        } else if (title.includes('Hogar')) {
            return {
                border: 'border-purple-200/50 dark:border-purple-700/30',
                bg: 'bg-gradient-to-br from-purple-50/50 to-pink-50/30 dark:from-purple-900/20 dark:to-pink-900/20',
                decoration: 'bg-gradient-to-br from-purple-300/30 to-transparent',
                legendBg: 'bg-white/90 dark:bg-gray-800/90',
                legendText: 'text-purple-700 dark:text-purple-300',
            };
        } else if (title.includes('Mascotas')) {
            return {
                border: 'border-orange-200/50 dark:border-orange-700/30',
                bg: 'bg-gradient-to-br from-orange-50/50 to-yellow-50/30 dark:from-orange-900/20 dark:to-yellow-900/20',
                decoration: 'bg-gradient-to-br from-orange-300/30 to-transparent',
                legendBg: 'bg-white/90 dark:bg-gray-800/90',
                legendText: 'text-orange-700 dark:text-orange-300',
            };
        } else if (title.includes('Motivación')) {
            return {
                border: 'border-pink-200/50 dark:border-pink-700/30',
                bg: 'bg-gradient-to-br from-pink-50/50 to-rose-50/30 dark:from-pink-900/20 dark:to-rose-900/20',
                decoration: 'bg-gradient-to-br from-pink-300/30 to-transparent',
                legendBg: 'bg-white/90 dark:bg-gray-800/90',
                legendText: 'text-pink-700 dark:text-pink-300',
            };
        } else {
            return {
                border: 'border-indigo-200/50 dark:border-indigo-700/30',
                bg: 'bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-indigo-900/20 dark:to-purple-900/20',
                decoration: 'bg-gradient-to-br from-indigo-300/30 to-transparent',
                legendBg: 'bg-white/90 dark:bg-gray-800/90',
                legendText: 'text-indigo-700 dark:text-indigo-300',
            };
        }
    };

    const colors = getSectionColors(title);

    return (
        <fieldset className={`relative space-y-6 overflow-hidden rounded-3xl border-2 p-6 ${colors.border} ${colors.bg}`}>
            <div className={`absolute -top-4 -right-4 h-20 w-20 rounded-full blur-lg ${colors.decoration}`}></div>
            <legend className={`relative px-4 text-lg font-bold ${colors.legendText}`}>
                <span className={`rounded-xl px-3 py-1 shadow-lg ${colors.legendBg}`}>{title}</span>
            </legend>
            <div className="relative grid grid-cols-1 gap-6 pt-4 md:grid-cols-2 lg:grid-cols-3">{children}</div>
        </fieldset>
    );
};

export default function FormularioAdopcionModal({ mascota, show, onClose }: FormularioAdopcionModalProps) {
    const page = usePage();
    const auth = (page.props as { auth?: { user?: { name?: string; email?: string } } }).auth;

    // Obtener el nombre de la mascota de forma flexible
    const nombreMascota = mascota.name || mascota.nombre || 'Mascota';

    const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm<AdopcionFormData>({
        nombre_completo: auth?.user?.name || '',
        cedula: '',
        email: auth?.user?.email || '',
        telefono: '',
        direccion_ciudad: '',
        direccion_barrio: '',
        direccion_postal: '',
        tipo_vivienda: 'casa',
        propiedad_vivienda: 'propia',
        tiene_patio: 'no',
        permiten_mascotas_alquiler: 'si',
        cantidad_convivientes: 1,
        hay_ninos: 'no',
        edades_ninos: '',
        todos_acuerdo_adopcion: 'si',
        tiene_otras_mascotas: 'no',
        otras_mascotas_detalles: '',
        tuvo_mascotas_antes: 'no',
        que_paso_mascotas_anteriores: '',
        mascota_id: mascota.id,
        porque_adopta: '',
        que_espera_convivencia: '',
        que_haria_problemas_comportamiento: '',
        acepta_visitas_seguimiento: 'si',
        acepta_proceso_evaluacion: false,
        acepta_cuidado_responsable: false,
        acepta_contrato_adopcion: false,
    });

    // Estados para campos condicionales
    const [viviendaAlquilada, setViviendaAlquilada] = useState(false);
    const [hayNinos, setHayNinos] = useState(false);
    const [tieneOtrasMascotas, setTieneOtrasMascotas] = useState(false);

    // Efectos para campos condicionales
    useEffect(() => {
        setViviendaAlquilada(data.propiedad_vivienda === 'alquilada');
    }, [data.propiedad_vivienda]);

    useEffect(() => {
        setHayNinos(data.hay_ninos === 'si');
    }, [data.hay_ninos]);

    useEffect(() => {
        setTieneOtrasMascotas(data.tiene_otras_mascotas === 'si');
    }, [data.tiene_otras_mascotas]);

    // Resetear formulario cuando cambie la mascota
    useEffect(() => {
        reset();
        setData('mascota_id', mascota.id);
    }, [mascota.id, reset, setData]);

    // Resetear formulario cuando se cierre
    useEffect(() => {
        if (wasSuccessful) {
            reset();
            onClose();
        }
    }, [wasSuccessful, reset, onClose]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('solicitudes.adopcion.store'), {
            preserveScroll: true,
        });
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative mx-4 my-8 max-h-[calc(100vh-4rem)] w-full max-w-5xl overflow-hidden rounded-3xl bg-white/95 shadow-2xl backdrop-blur-sm dark:bg-gray-800/95">
                {/* Elementos decorativos */}
                <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/20 to-transparent blur-xl"></div>
                <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-tr from-green-500/15 to-transparent blur-lg"></div>

                <button
                    onClick={onClose}
                    className="group absolute -top-2 -right-2 z-10 rounded-full p-2 text-gray-500 transition-all duration-200 hover:bg-red-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    aria-label="Cerrar formulario"
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

                <div className="relative max-h-[calc(100vh-4rem)] overflow-y-auto">
                    <div className="p-6 sm:p-8">
                        <div className="mb-8 text-center">
                            <h1 className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-3xl font-bold text-transparent dark:from-blue-400 dark:to-green-400">
                                Solicitud de Adopción para{' '}
                                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-pink-400">
                                    {nombreMascota}
                                </span>
                            </h1>
                            <p className="mt-4 text-xl leading-relaxed text-gray-600 dark:text-gray-300">
                                Gracias por tu interés en darle un hogar lleno de amor. Por favor, completa el siguiente formulario.
                            </p>
                            {/* Línea decorativa */}
                            <div className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            {/* Mostrar errores generales */}
                            {errors.mascota_id && (
                                <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error en la solicitud</h3>
                                            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                                <ul role="list" className="list-inside list-disc space-y-1">
                                                    {Array.isArray(errors.mascota_id) ? (
                                                        errors.mascota_id.map((error, index) => <li key={index}>{error}</li>)
                                                    ) : (
                                                        <li>{errors.mascota_id}</li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Información Personal */}
                            <FormSection title="📋 Información Personal">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre_completo" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        👤 Nombre Completo *
                                    </Label>
                                    <Input
                                        id="nombre_completo"
                                        type="text"
                                        value={data.nombre_completo}
                                        onChange={(e) => setData('nombre_completo', e.target.value)}
                                        className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-800/30"
                                        placeholder="Ej: Juan Carlos Pérez"
                                        required
                                    />
                                    <InputError message={errors.nombre_completo} className="mt-2" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cedula" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        🆔 Número de Cédula *
                                    </Label>
                                    <Input
                                        id="cedula"
                                        type="text"
                                        value={data.cedula}
                                        onChange={(e) => setData('cedula', e.target.value)}
                                        className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-800/30"
                                        placeholder="Ej: 12345678"
                                        required
                                    />
                                    <InputError message={errors.cedula} className="mt-2" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        📧 Correo Electrónico *
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-800/30"
                                        placeholder="ejemplo@correo.com"
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="telefono" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        📱 Teléfono *
                                    </Label>
                                    <Input
                                        id="telefono"
                                        type="tel"
                                        value={data.telefono}
                                        onChange={(e) => setData('telefono', e.target.value)}
                                        className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-800/30"
                                        placeholder="Ej: +57 300 123 4567"
                                        required
                                    />
                                    <InputError message={errors.telefono} className="mt-2" />
                                </div>
                            </FormSection>

                            {/* Información de Vivienda */}
                            <FormSection title="🏠 Información de Vivienda">
                                <div className="space-y-2">
                                    <Label htmlFor="direccion_ciudad" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        🏙️ Ciudad *
                                    </Label>
                                    <Input
                                        id="direccion_ciudad"
                                        type="text"
                                        value={data.direccion_ciudad}
                                        onChange={(e) => setData('direccion_ciudad', e.target.value)}
                                        className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-800/30"
                                        placeholder="Ej: Bogotá, Medellín, Cali"
                                        required
                                    />
                                    <InputError message={errors.direccion_ciudad} className="mt-2" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="direccion_barrio" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        🏘️ Barrio/Localidad *
                                    </Label>
                                    <Input
                                        id="direccion_barrio"
                                        type="text"
                                        value={data.direccion_barrio}
                                        onChange={(e) => setData('direccion_barrio', e.target.value)}
                                        className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-800/30"
                                        placeholder="Ej: Chapinero, Zona Rosa"
                                        required
                                    />
                                    <InputError message={errors.direccion_barrio} className="mt-2" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tipo_vivienda" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        🏠 Tipo de Vivienda *
                                    </Label>
                                    <Select value={data.tipo_vivienda} onValueChange={(value) => setData('tipo_vivienda', value)}>
                                        <SelectTrigger className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-800/30">
                                            <SelectValue placeholder="Selecciona el tipo de vivienda" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="casa">🏡 Casa</SelectItem>
                                            <SelectItem value="apartamento">🏢 Apartamento</SelectItem>
                                            <SelectItem value="finca">🌾 Finca/Casa de Campo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.tipo_vivienda} className="mt-2" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="propiedad_vivienda" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        📋 Propiedad de la Vivienda *
                                    </Label>
                                    <Select value={data.propiedad_vivienda} onValueChange={(value) => setData('propiedad_vivienda', value)}>
                                        <SelectTrigger className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-800/30">
                                            <SelectValue placeholder="¿La vivienda es...?" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="propia">🏠 Propia</SelectItem>
                                            <SelectItem value="alquilada">🏘️ Alquilada</SelectItem>
                                            <SelectItem value="familiar">👨‍👩‍👧‍👦 Familiar</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.propiedad_vivienda} className="mt-2" />
                                </div>

                                <div className="space-y-2">
                                    <Label className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        🌳 ¿Tiene patio o espacio exterior? *
                                    </Label>
                                    <RadioGroup
                                        value={data.tiene_patio}
                                        onValueChange={(value) => setData('tiene_patio', value)}
                                        className="flex gap-6"
                                    >
                                        <div className="flex items-center space-x-2 rounded-lg bg-green-50 p-3 transition-colors hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30">
                                            <RadioGroupItem value="si" id="patio_si" className="text-green-600 dark:text-green-400" />
                                            <Label htmlFor="patio_si" className="cursor-pointer font-medium text-green-700 dark:text-green-300">
                                                ✅ Sí
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30">
                                            <RadioGroupItem value="no" id="patio_no" className="text-red-600 dark:text-red-400" />
                                            <Label htmlFor="patio_no" className="cursor-pointer font-medium text-red-700 dark:text-red-300">
                                                ❌ No
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                    <InputError message={errors.tiene_patio} className="mt-2" />
                                </div>

                                {viviendaAlquilada && (
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                            🏘️ ¿El propietario permite mascotas? *
                                        </Label>
                                        <RadioGroup
                                            value={data.permiten_mascotas_alquiler}
                                            onValueChange={(value) => setData('permiten_mascotas_alquiler', value)}
                                            className="flex gap-6"
                                        >
                                            <div className="flex items-center space-x-2 rounded-lg bg-green-50 p-3 transition-colors hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30">
                                                <RadioGroupItem value="si" id="permite_si" className="text-green-600 dark:text-green-400" />
                                                <Label htmlFor="permite_si" className="cursor-pointer font-medium text-green-700 dark:text-green-300">
                                                    ✅ Sí
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30">
                                                <RadioGroupItem value="no" id="permite_no" className="text-red-600 dark:text-red-400" />
                                                <Label htmlFor="permite_no" className="cursor-pointer font-medium text-red-700 dark:text-red-300">
                                                    ❌ No
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                        <InputError message={errors.permiten_mascotas_alquiler} className="mt-2" />
                                    </div>
                                )}
                            </FormSection>

                            {/* Información del Hogar */}
                            <FormSection title="👨‍👩‍👧‍👦 Información del Hogar">
                                <div className="space-y-2">
                                    <Label htmlFor="cantidad_convivientes" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        👥 ¿Cuántas personas viven en casa? *
                                    </Label>
                                    <Input
                                        id="cantidad_convivientes"
                                        type="number"
                                        min="1"
                                        value={data.cantidad_convivientes}
                                        onChange={(e) => setData('cantidad_convivientes', parseInt(e.target.value) || 0)}
                                        className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-800/30"
                                        placeholder="Ej: 3, 4, 5 personas"
                                        required
                                    />
                                    <InputError message={errors.cantidad_convivientes} className="mt-2" />
                                </div>

                                <div className="space-y-2">
                                    <Label className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">👶 ¿Hay niños en casa? *</Label>
                                    <RadioGroup value={data.hay_ninos} onValueChange={(value) => setData('hay_ninos', value)} className="flex gap-6">
                                        <div className="flex items-center space-x-2 rounded-lg bg-green-50 p-3 transition-colors hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30">
                                            <RadioGroupItem value="si" id="ninos_si" className="text-green-600 dark:text-green-400" />
                                            <Label htmlFor="ninos_si" className="cursor-pointer font-medium text-green-700 dark:text-green-300">
                                                ✅ Sí
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30">
                                            <RadioGroupItem value="no" id="ninos_no" className="text-red-600 dark:text-red-400" />
                                            <Label htmlFor="ninos_no" className="cursor-pointer font-medium text-red-700 dark:text-red-300">
                                                ❌ No
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                    <InputError message={errors.hay_ninos} className="mt-2" />
                                </div>

                                {hayNinos && (
                                    <div className="space-y-2">
                                        <Label htmlFor="edades_ninos" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                            🎂 ¿Qué edades tienen? *
                                        </Label>
                                        <Input
                                            id="edades_ninos"
                                            type="text"
                                            placeholder="Ej: 5, 8, 12 años"
                                            value={data.edades_ninos}
                                            onChange={(e) => setData('edades_ninos', e.target.value)}
                                            className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-800/30"
                                        />
                                        <InputError message={errors.edades_ninos} className="mt-2" />
                                    </div>
                                )}

                                <div className="space-y-2 md:col-span-2">
                                    <Label className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        👪 ¿Todos en la familia están de acuerdo con la adopción? *
                                    </Label>
                                    <RadioGroup
                                        value={data.todos_acuerdo_adopcion}
                                        onValueChange={(value) => setData('todos_acuerdo_adopcion', value)}
                                        className="flex gap-6"
                                    >
                                        <div className="flex items-center space-x-2 rounded-lg bg-green-50 p-3 transition-colors hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30">
                                            <RadioGroupItem value="si" id="acuerdo_si" className="text-green-600 dark:text-green-400" />
                                            <Label htmlFor="acuerdo_si" className="cursor-pointer font-medium text-green-700 dark:text-green-300">
                                                ✅ Sí, todos están de acuerdo
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30">
                                            <RadioGroupItem value="no" id="acuerdo_no" className="text-red-600 dark:text-red-400" />
                                            <Label htmlFor="acuerdo_no" className="cursor-pointer font-medium text-red-700 dark:text-red-300">
                                                ❌ No, hay desacuerdo
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                    <InputError message={errors.todos_acuerdo_adopcion} className="mt-2" />
                                </div>
                            </FormSection>

                            {/* Experiencia con Mascotas */}
                            <FormSection title="🐾 Experiencia con Mascotas">
                                <div className="space-y-2">
                                    <Label className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        🐕 ¿Tiene otras mascotas actualmente? *
                                    </Label>
                                    <RadioGroup
                                        value={data.tiene_otras_mascotas}
                                        onValueChange={(value) => setData('tiene_otras_mascotas', value)}
                                        className="flex gap-6"
                                    >
                                        <div className="flex items-center space-x-2 rounded-lg bg-green-50 p-3 transition-colors hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30">
                                            <RadioGroupItem value="si" id="otras_si" className="text-green-600 dark:text-green-400" />
                                            <Label htmlFor="otras_si" className="cursor-pointer font-medium text-green-700 dark:text-green-300">
                                                ✅ Sí
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30">
                                            <RadioGroupItem value="no" id="otras_no" className="text-red-600 dark:text-red-400" />
                                            <Label htmlFor="otras_no" className="cursor-pointer font-medium text-red-700 dark:text-red-300">
                                                ❌ No
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                    <InputError message={errors.tiene_otras_mascotas} className="mt-2" />
                                </div>

                                {tieneOtrasMascotas && (
                                    <div className="space-y-2 md:col-span-2">
                                        <Label
                                            htmlFor="otras_mascotas_detalles"
                                            className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300"
                                        >
                                            📝 Describe tus otras mascotas *
                                        </Label>
                                        <Textarea
                                            id="otras_mascotas_detalles"
                                            placeholder="Ej: Perro labrador de 3 años, esterilizado, muy amigable. Gato siames de 2 años, vacunado..."
                                            value={data.otras_mascotas_detalles}
                                            onChange={(e) => setData('otras_mascotas_detalles', e.target.value)}
                                            className="w-full resize-none rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-orange-400 dark:focus:ring-orange-800/30"
                                            rows={4}
                                        />
                                        <InputError message={errors.otras_mascotas_detalles} className="mt-2" />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        🕰️ ¿Tuvo mascotas antes? *
                                    </Label>
                                    <RadioGroup
                                        value={data.tuvo_mascotas_antes}
                                        onValueChange={(value) => setData('tuvo_mascotas_antes', value)}
                                        className="flex gap-6"
                                    >
                                        <div className="flex items-center space-x-2 rounded-lg bg-green-50 p-3 transition-colors hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30">
                                            <RadioGroupItem value="si" id="tuvo_si" className="text-green-600 dark:text-green-400" />
                                            <Label htmlFor="tuvo_si" className="cursor-pointer font-medium text-green-700 dark:text-green-300">
                                                ✅ Sí
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30">
                                            <RadioGroupItem value="no" id="tuvo_no" className="text-red-600 dark:text-red-400" />
                                            <Label htmlFor="tuvo_no" className="cursor-pointer font-medium text-red-700 dark:text-red-300">
                                                ❌ No
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                    <InputError message={errors.tuvo_mascotas_antes} className="mt-2" />
                                </div>

                                {data.tuvo_mascotas_antes === 'si' && (
                                    <div className="space-y-2 md:col-span-2">
                                        <Label
                                            htmlFor="que_paso_mascotas_anteriores"
                                            className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300"
                                        >
                                            🕰️ ¿Qué pasó con las mascotas anteriores?
                                        </Label>
                                        <Textarea
                                            id="que_paso_mascotas_anteriores"
                                            placeholder="Cuéntanos qué ocurrió con tus mascotas anteriores (fallecimiento natural, se perdieron, las regalaste, etc.)"
                                            value={data.que_paso_mascotas_anteriores}
                                            onChange={(e) => setData('que_paso_mascotas_anteriores', e.target.value)}
                                            className="w-full resize-none rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-orange-400 dark:focus:ring-orange-800/30"
                                            rows={3}
                                        />
                                        <InputError message={errors.que_paso_mascotas_anteriores} className="mt-2" />
                                    </div>
                                )}
                            </FormSection>

                            {/* Motivación */}
                            <FormSection title="💭 Motivación para Adoptar">
                                <div className="space-y-2 md:col-span-3">
                                    <Label htmlFor="porque_adopta" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        💖 ¿Por qué quieres adoptar esta mascota? *
                                    </Label>
                                    <Textarea
                                        id="porque_adopta"
                                        placeholder="Comparte tus motivaciones profundas para adoptar. ¿Qué te inspiró a tomar esta decisión?"
                                        value={data.porque_adopta}
                                        onChange={(e) => setData('porque_adopta', e.target.value)}
                                        className="w-full resize-none rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 whitespace-pre-wrap text-gray-800 shadow-lg transition-all duration-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-pink-400 dark:focus:ring-pink-800/30"
                                        rows={4}
                                        required
                                    />
                                    <InputError message={errors.porque_adopta} className="mt-2" />
                                </div>

                                <div className="space-y-2 md:col-span-3">
                                    <Label htmlFor="que_espera_convivencia" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        🏠 ¿Qué esperas de la convivencia con la mascota? *
                                    </Label>
                                    <Textarea
                                        id="que_espera_convivencia"
                                        placeholder="Describe qué esperas de vivir con tu nueva mascota. ¿Cómo imaginas el día a día juntos?"
                                        value={data.que_espera_convivencia}
                                        onChange={(e) => setData('que_espera_convivencia', e.target.value)}
                                        className="w-full resize-none rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 whitespace-pre-wrap text-gray-800 shadow-lg transition-all duration-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-pink-400 dark:focus:ring-pink-800/30"
                                        rows={4}
                                        required
                                    />
                                    <InputError message={errors.que_espera_convivencia} className="mt-2" />
                                </div>

                                <div className="space-y-2 md:col-span-3">
                                    <Label
                                        htmlFor="que_haria_problemas_comportamiento"
                                        className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300"
                                    >
                                        🎯 ¿Qué harías ante problemas de comportamiento? *
                                    </Label>
                                    <Textarea
                                        id="que_haria_problemas_comportamiento"
                                        placeholder="Explica cómo manejarías situaciones como ladridos excesivos, daños en muebles, problemas de socialización, etc."
                                        value={data.que_haria_problemas_comportamiento}
                                        onChange={(e) => setData('que_haria_problemas_comportamiento', e.target.value)}
                                        className="w-full resize-none rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 whitespace-pre-wrap text-gray-800 shadow-lg transition-all duration-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-pink-400 dark:focus:ring-pink-800/30"
                                        rows={4}
                                        required
                                    />
                                    <InputError message={errors.que_haria_problemas_comportamiento} className="mt-2" />
                                </div>

                                <div className="space-y-2">
                                    <Label className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        🏠 ¿Aceptas visitas de seguimiento? *
                                    </Label>
                                    <RadioGroup
                                        value={data.acepta_visitas_seguimiento}
                                        onValueChange={(value) => setData('acepta_visitas_seguimiento', value)}
                                        className="flex gap-6"
                                    >
                                        <div className="flex items-center space-x-2 rounded-lg bg-green-50 p-3 transition-colors hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30">
                                            <RadioGroupItem value="si" id="visitas_si" className="text-green-600 dark:text-green-400" />
                                            <Label htmlFor="visitas_si" className="cursor-pointer font-medium text-green-700 dark:text-green-300">
                                                ✅ Sí, acepto
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30">
                                            <RadioGroupItem value="no" id="visitas_no" className="text-red-600 dark:text-red-400" />
                                            <Label htmlFor="visitas_no" className="cursor-pointer font-medium text-red-700 dark:text-red-300">
                                                ❌ No acepto
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                    <InputError message={errors.acepta_visitas_seguimiento} className="mt-2" />
                                </div>
                            </FormSection>

                            {/* Compromisos */}
                            <FormSection title="📝 Compromisos de Adopción">
                                <div className="space-y-6 md:col-span-3">
                                    <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-inner dark:from-blue-900/20 dark:to-indigo-900/20">
                                        <div className="flex items-start space-x-3">
                                            <Checkbox
                                                id="acepta_proceso_evaluacion"
                                                checked={data.acepta_proceso_evaluacion}
                                                onCheckedChange={(checked) => setData('acepta_proceso_evaluacion', checked as boolean)}
                                                className="mt-1 border-2 border-indigo-300 text-indigo-600 focus:ring-indigo-500 dark:border-indigo-600 dark:text-indigo-400"
                                            />
                                            <Label
                                                htmlFor="acepta_proceso_evaluacion"
                                                className="cursor-pointer text-sm leading-relaxed font-medium text-indigo-800 dark:text-indigo-200"
                                            >
                                                📋 Acepto someterme al proceso de evaluación y entrevista *
                                            </Label>
                                        </div>
                                        <InputError message={errors.acepta_proceso_evaluacion} className="mt-2 ml-7" />
                                    </div>

                                    <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 shadow-inner dark:from-green-900/20 dark:to-emerald-900/20">
                                        <div className="flex items-start space-x-3">
                                            <Checkbox
                                                id="acepta_cuidado_responsable"
                                                checked={data.acepta_cuidado_responsable}
                                                onCheckedChange={(checked) => setData('acepta_cuidado_responsable', checked as boolean)}
                                                className="mt-1 border-2 border-green-300 text-green-600 focus:ring-green-500 dark:border-green-600 dark:text-green-400"
                                            />
                                            <Label
                                                htmlFor="acepta_cuidado_responsable"
                                                className="cursor-pointer text-sm leading-relaxed font-medium text-green-800 dark:text-green-200"
                                            >
                                                💖 Me comprometo a brindar cuidado responsable, alimentación, atención veterinaria y amor *
                                            </Label>
                                        </div>
                                        <InputError message={errors.acepta_cuidado_responsable} className="mt-2 ml-7" />
                                    </div>

                                    <div className="rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 p-4 shadow-inner dark:from-purple-900/20 dark:to-violet-900/20">
                                        <div className="flex items-start space-x-3">
                                            <Checkbox
                                                id="acepta_contrato_adopcion"
                                                checked={data.acepta_contrato_adopcion}
                                                onCheckedChange={(checked) => setData('acepta_contrato_adopcion', checked as boolean)}
                                                className="mt-1 border-2 border-purple-300 text-purple-600 focus:ring-purple-500 dark:border-purple-600 dark:text-purple-400"
                                            />
                                            <Label
                                                htmlFor="acepta_contrato_adopcion"
                                                className="cursor-pointer text-sm leading-relaxed font-medium text-purple-800 dark:text-purple-200"
                                            >
                                                📄 Acepto firmar un contrato de adopción responsable *
                                            </Label>
                                        </div>
                                        <InputError message={errors.acepta_contrato_adopcion} className="mt-2 ml-7" />
                                    </div>
                                </div>
                            </FormSection>

                            {/* Botones */}
                            <div className="flex flex-col gap-4 pt-8 sm:flex-row sm:justify-center">
                                <Button
                                    type="button"
                                    onClick={onClose}
                                    className="group hover:shadow-3xl relative w-full overflow-hidden rounded-3xl bg-gradient-to-r from-gray-400 to-gray-600 px-8 py-4 font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 sm:w-auto dark:from-gray-600 dark:to-gray-800"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                    <span className="relative">Cancelar</span>
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="group hover:shadow-3xl relative w-full overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 via-green-600 to-blue-700 px-8 py-4 font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:opacity-50 sm:w-auto"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                    <span className="relative">
                                        {processing ? (
                                            <>
                                                <svg className="mr-2 inline h-5 w-5 animate-spin" viewBox="0 0 24 24">
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                        fill="none"
                                                    />
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    />
                                                </svg>
                                                Enviando Solicitud...
                                            </>
                                        ) : (
                                            '💕 Enviar Solicitud de Adopción'
                                        )}
                                    </span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
