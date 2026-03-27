/**
 * Modal de registro y edicion de mascotas.
 * Gestiona formulario, imagenes y ayudas de captura para aliados.
 */

// resources/js/pages/Dashboard/VerMascotasProductos/components/registrar-mascota.tsx
// Componente modal para registrar nuevas mascotas con sistema de múltiples imágenes (hasta 3)

import { buildImagePreviews, prepareImageSelection } from '@/lib/image-upload';
import { useForm } from '@inertiajs/react';
import { Plus, X } from 'lucide-react'; // Iconos para agregar y eliminar imágenes
import React, { useEffect, useRef, useState } from 'react';

/**
 * Interfaces TypeScript para garantizar tipo-seguridad
 */
interface MascotaData {
    id?: number;
    nombre: string;
    especie: string;
    raza: string;
    fecha_nacimiento: string;
    sexo: string;
    ciudad: string;
    descripcion: string;
    imagenes_existentes?: string[];
}

interface RegistrarMascotaProps {
    isOpen: boolean;
    onClose: () => void;
    setMensaje: (mensaje: string) => void;
    mascotaEditar?: MascotaData | null;
    modoEdicion?: boolean;
    onMascotaRegistrada?: () => void;
}

/**
 * Constantes para las razas de perros y gatos
 */
const RAZAS_PERROS = [
    'Labrador Retriever',
    'Golden Retriever',
    'Pastor Alemán',
    'Bulldog Francés',
    'Bulldog Inglés',
    'Beagle',
    'Poodle',
    'Rottweiler',
    'Yorkshire Terrier',
    'Dachshund',
    'Siberian Husky',
    'Shih Tzu',
    'Boston Terrier',
    'Pomerania',
    'Border Collie',
    'Cocker Spaniel',
    'Boxer',
    'Chihuahua',
    'Maltés',
    'Schnauzer',
    'Jack Russell Terrier',
    'Pitbull',
    'Akita',
    'Doberman',
    'San Bernardo',
    'Mestizo',
    'Otro',
];

const RAZAS_GATOS = [
    'Persa',
    'Siamés',
    'Maine Coon',
    'Británico de Pelo Corto',
    'Ragdoll',
    'Bengalí',
    'Abisinio',
    'Birmano',
    'Sphynx',
    'Scottish Fold',
    'Russian Blue',
    'Oriental',
    'Devon Rex',
    'Cornish Rex',
    'Manx',
    'Angora Turco',
    'Noruego del Bosque',
    'Exótico de Pelo Corto',
    'Bombay',
    'Mestizo',
    'Criollo',
    'Otro',
];

/**
 * Ciudades principales de Colombia organizadas por departamentos
 */
const CIUDADES_COLOMBIA = [
    // Antioquia
    'Medellín',
    'Bello',
    'Itagüí',
    'Envigado',
    'Apartadó',
    'Turbo',
    'Rionegro',
    'Sabaneta',
    'La Estrella',
    'Copacabana',

    // Atlántico
    'Barranquilla',
    'Soledad',
    'Malambo',
    'Sabanalarga',
    'Puerto Colombia',

    // Bogotá D.C.
    'Bogotá',

    // Bolívar
    'Cartagena',
    'Magangué',
    'Turbaco',
    'Arjona',

    // Boyacá
    'Tunja',
    'Duitama',
    'Sogamoso',
    'Chiquinquirá',

    // Caldas
    'Manizales',
    'La Dorada',
    'Chinchiná',
    'Villamaría',

    // Caquetá
    'Florencia',
    'San Vicente del Caguán',

    // Casanare
    'Yopal',
    'Aguazul',
    'Villanueva',

    // Cauca
    'Popayán',
    'Santander de Quilichao',
    'Puerto Tejada',

    // César
    'Valledupar',
    'Aguachica',
    'Codazzi',

    // Chocó
    'Quibdó',
    'Istmina',

    // Córdoba
    'Montería',
    'Lorica',
    'Cereté',
    'Sahagún',

    // Cundinamarca
    'Soacha',
    'Girardot',
    'Zipaquirá',
    'Facatativá',
    'Chía',
    'Mosquera',
    'Fusagasugá',
    'Madrid',
    'Funza',
    'Cajicá',

    // Huila
    'Neiva',
    'Pitalito',
    'Garzón',

    // La Guajira
    'Riohacha',
    'Maicao',
    'San Juan del Cesar',

    // Magdalena
    'Santa Marta',
    'Ciénaga',
    'Fundación',

    // Meta
    'Villavicencio',
    'Acacías',
    'Granada',

    // Nariño
    'Pasto',
    'Tumaco',
    'Ipiales',

    // Norte de Santander
    'Cúcuta',
    'Ocaña',
    'Villa del Rosario',
    'Los Patios',

    // Putumayo
    'Mocoa',
    'Puerto Asís',

    // Quindío
    'Armenia',
    'Calarcá',
    'La Tebaida',
    'Montenegro',

    // Risaralda
    'Pereira',
    'Dosquebradas',
    'Santa Rosa de Cabal',
    'La Virginia',

    // San Andrés y Providencia
    'San Andrés',
    'Providencia',

    // Santander
    'Bucaramanga',
    'Floridablanca',
    'Girón',
    'Piedecuesta',
    'Barrancabermeja',
    'San Gil',
    'Socorro',
    'Málaga',

    // Sucre
    'Sincelejo',
    'Corozal',

    // Tolima
    'Ibagué',
    'Espinal',
    'Melgar',
    'Honda',

    // Valle del Cauca
    'Cali',
    'Palmira',
    'Buenaventura',
    'Tulua',
    'Cartago',
    'Buga',
    'Jamundí',
    'Yumbo',

    // Vaupés
    'Mitú',

    // Vichada
    'Puerto Carreño',
];

/**
 * Componente principal con lógica optimizada de estado y efectos
 */
export default function RegistrarMascota({
    isOpen,
    onClose,
    setMensaje,
    mascotaEditar,
    modoEdicion = false,
    onMascotaRegistrada,
}: RegistrarMascotaProps) {
    /**
     * Form handler con tipado fuerte y configuración optimizada
     * Incluye array de imágenes y método HTTP para ediciones
     */
    // Form handler con todos los campos de mascota, incluyendo array de imágenes
    const { data, setData, post, processing, errors, reset } = useForm({
        nombre: '',
        especie: '',
        raza: '',
        fecha_nacimiento: '',
        sexo: '',
        ciudad: '',
        descripcion: '',
        imagenes: [] as File[], // Array para múltiples imágenes
        _method: '' as string, // Para el workaround de FormData con PUT
    });

    const modalRef = useRef<HTMLDivElement>(null);
    const multipleFileInputRef = useRef<HTMLInputElement>(null);
    // Estados para manejar las imágenes y sus previews
    const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [imagenesExistentes, setImagenesExistentes] = useState<string[]>([]);
    // Estado para mostrar edad calculada
    const [edadCalculada, setEdadCalculada] = useState<string>('');

    // Efecto para limpiar la raza cuando cambie la especie
    useEffect(() => {
        if (data.especie && data.raza) {
            // Verificar si la raza actual es válida para la nueva especie
            const razasDisponibles = data.especie === 'perro' ? RAZAS_PERROS : RAZAS_GATOS;
            if (!razasDisponibles.includes(data.raza)) {
                setData('raza', '');
            }
        }
    }, [data.especie, data.raza, setData]);

    // Función para calcular edad basada en fecha de nacimiento
    const calcularEdad = (fechaNacimiento: string) => {
        if (!fechaNacimiento) {
            setEdadCalculada('');
            return;
        }

        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);

        if (nacimiento > hoy) {
            setEdadCalculada('Fecha inválida');
            return;
        }

        // Calcular años, meses y días exactos
        let años = hoy.getFullYear() - nacimiento.getFullYear();
        let meses = hoy.getMonth() - nacimiento.getMonth();
        let días = hoy.getDate() - nacimiento.getDate();

        // Ajustar si los días son negativos
        if (días < 0) {
            meses--;
            // Obtener el último día del mes anterior
            const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
            días += ultimoDiaMesAnterior;
        }

        // Ajustar si los meses son negativos
        if (meses < 0) {
            años--;
            meses += 12;
        }

        // Construir el string de edad según los casos
        const partes = [];

        if (años > 0) {
            partes.push(años === 1 ? '1 año' : `${años} años`);
        }

        if (meses > 0) {
            partes.push(meses === 1 ? '1 mes' : `${meses} meses`);
        }

        if (días > 0) {
            partes.push(días === 1 ? '1 día' : `${días} días`);
        }

        // Si no hay años, meses ni días (mismo día de nacimiento)
        if (partes.length === 0) {
            setEdadCalculada('Recién nacido');
            return;
        }

        // Unir las partes con " y " para el último elemento y ", " para los demás
        let edadTexto = '';
        if (partes.length === 1) {
            edadTexto = partes[0];
        } else if (partes.length === 2) {
            edadTexto = partes.join(' y ');
        } else {
            edadTexto = partes.slice(0, -1).join(', ') + ' y ' + partes[partes.length - 1];
        }

        setEdadCalculada(edadTexto);
    };

    // Cierra el modal al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    /**
     * Maneja el envío del formulario de registro/edición de mascota
     * Valida los datos y envía la solicitud al backend según el modo
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const submitData = {
            ...data,
            imagenes_a_eliminar: modoEdicion ? [] : undefined, // Se puede agregar lógica para eliminar imágenes específicas
        };

        if (modoEdicion && mascotaEditar?.id) {
            // Actualizar mascota existente - usar POST con _method para FormData
            console.log('Enviando actualización con datos:', submitData);

            // Actualizar el formulario de Inertia con _method
            setData('_method', 'PUT');

            // Enviar usando POST con _method=PUT (workaround para FormData)
            setTimeout(() => {
                post(`/mascotas/${mascotaEditar.id}`, {
                    forceFormData: true,
                    onSuccess: () => {
                        reset();
                        setAdditionalFiles([]);
                        setImagePreviews([]);
                        setImagenesExistentes([]);
                        setEdadCalculada('');
                        setMensaje('¡Mascota actualizada exitosamente!');
                        // Llamar al callback del padre para cerrar modal y recargar datos
                        if (onMascotaRegistrada) {
                            onMascotaRegistrada();
                        } else {
                            onClose();
                        }
                    },
                    onError: () => {
                        setMensaje('Error al actualizar mascota. Revisa los datos e intenta nuevamente.');
                    },
                });
            }, 100);
        } else {
            // Crear nueva mascota
            post('/mascotas/store', {
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    setAdditionalFiles([]);
                    setImagePreviews([]);
                    setEdadCalculada('');
                    setMensaje('¡Mascota registrada exitosamente!');
                    // Llamar al callback del padre para cerrar modal y recargar datos
                    if (onMascotaRegistrada) {
                        onMascotaRegistrada();
                    } else {
                        onClose();
                    }
                },
                onError: () => {
                    setMensaje('Error al registrar mascota. Revisa los datos e intenta nuevamente.');
                    setTimeout(() => {
                        setData('imagenes', []);
                    }, 3000);
                },
            });
        }
    };

    // Resetea las imágenes y edad calculada al cerrar el modal
    useEffect(() => {
        if (!isOpen) {
            // Limpiar al cerrar
            setAdditionalFiles([]);
            setImagePreviews([]);
            setEdadCalculada('');
            setImagenesExistentes([]);
            reset();
        } else if (isOpen && modoEdicion && mascotaEditar) {
            // Cargar datos cuando se abre en modo edición

            // Resetear primero para limpiar cualquier estado previo
            reset();

            // Usar un setTimeout más largo para asegurar que el formulario se actualice después del render
            setTimeout(() => {
                // Crear un nuevo objeto con todos los datos
                const formData = {
                    nombre: mascotaEditar.nombre || '',
                    especie: mascotaEditar.especie || '',
                    raza: mascotaEditar.raza || '',
                    fecha_nacimiento: mascotaEditar.fecha_nacimiento || '',
                    sexo: mascotaEditar.sexo || '',
                    ciudad: mascotaEditar.ciudad || '',
                    descripcion: mascotaEditar.descripcion || '',
                    imagenes: [] as File[],
                };

                // Actualizar todo de una vez
                Object.entries(formData).forEach(([key, value]) => {
                    setData(key as keyof typeof formData, value);
                });

                // Cargar imágenes existentes
                setImagenesExistentes(mascotaEditar.imagenes_existentes || []);

                // Calcular edad si hay fecha
                if (mascotaEditar.fecha_nacimiento) {
                    calcularEdad(mascotaEditar.fecha_nacimiento);
                }

                console.log('Datos cargados en el formulario:', formData);
            }, 300); // Aumentamos el timeout
        } else if (isOpen && !modoEdicion) {
            // Limpiar al abrir en modo creación
            reset();
            setImagenesExistentes([]);
            setEdadCalculada('');
        }
    }, [isOpen, modoEdicion, mascotaEditar, reset, setData]);

    // Función para manejar múltiples imágenes (máximo 3)
    const handleAddImages = async (files: FileList | null) => {
        if (!files) return;

        const selection = await prepareImageSelection(additionalFiles, Array.from(files));

        if (selection.error) {
            setMensaje(`Error: ${selection.error}`);
        } else {
            const previews = await buildImagePreviews(selection.files);
            setAdditionalFiles(selection.files);
            setImagePreviews(previews);
            setData('imagenes', selection.files);

            // Genera previews para las nuevas imágenes
            if (selection.truncated) {
                setMensaje('Error: solo puedes cargar hasta 3 imagenes por mascota.');
            }
        }

        if (multipleFileInputRef.current) {
            multipleFileInputRef.current.value = '';
        }
    };

    // Elimina una imagen específica del array
    const removeImage = (indexToRemove: number) => {
        const updatedFiles = additionalFiles.filter((_, index) => index !== indexToRemove);
        const updatedPreviews = imagePreviews.filter((_, index) => index !== indexToRemove);

        setAdditionalFiles(updatedFiles);
        setImagePreviews(updatedPreviews);
        setData('imagenes', updatedFiles);

        // Reset del input para permitir reseleccionar archivos
        if (multipleFileInputRef.current) {
            multipleFileInputRef.current.value = '';
        }
    };

    // Elimina una imagen existente
    const removeExistingImage = (indexToRemove: number) => {
        const updatedExisting = imagenesExistentes.filter((_, index) => index !== indexToRemove);
        setImagenesExistentes(updatedExisting);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div ref={modalRef} className="w-full max-w-4xl rounded-3xl bg-white/95 p-0 shadow-2xl backdrop-blur-sm dark:bg-gray-800/95">
                {/* Elementos decorativos del modal */}
                <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-green-500/15 to-transparent"></div>
                <div className="pointer-events-none absolute top-1/3 -left-8 h-20 w-20 rounded-full bg-gradient-to-tr from-blue-500/10 to-transparent"></div>
                <div className="pointer-events-none absolute right-1/4 -bottom-6 h-24 w-24 rounded-full bg-gradient-to-tl from-purple-500/8 to-transparent"></div>

                <div className="relative max-h-[calc(100vh-4rem)] overflow-y-auto p-8">
                    <div className="relative mb-8 text-center">
                        <h2 className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-3xl font-bold text-transparent dark:from-blue-400 dark:to-green-400">
                            {modoEdicion ? '✏️ Editar Mascota' : '🐾 Registrar Nueva Mascota'}
                        </h2>
                        <p className="mt-3 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                            {modoEdicion ? 'Actualiza la información de tu mascota' : 'Completa la información para dar en adopción a tu mascota'}
                        </p>
                        {/* Línea decorativa */}
                        <div className="mx-auto mt-4 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="relative space-y-8">
                        {/* --- INFORMACIÓN BÁSICA --- */}
                        <fieldset className="relative space-y-6 overflow-hidden rounded-3xl border-2 border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-green-50/30 p-6 dark:border-blue-700/30 dark:from-blue-900/20 dark:to-green-900/20">
                            <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-gradient-to-br from-blue-300/30 to-transparent blur-lg"></div>
                            <legend className="relative px-4 text-lg font-bold text-blue-700 dark:text-blue-300">
                                <span className="rounded-xl bg-white/90 px-3 py-1 shadow-lg dark:bg-gray-800/90">🐾 Información Básica</span>
                            </legend>

                            {/* Campo Nombre */}
                            <div>
                                <label htmlFor="nombre" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Nombre de la mascota *
                                </label>
                                <input
                                    id="nombre"
                                    name="nombre"
                                    type="text"
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    placeholder="Ej: Max, Luna, Toby..."
                                    autoComplete="off"
                                    className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-800/30"
                                    required
                                />
                                {errors.nombre && <p className="mt-2 text-sm font-medium text-red-600">{errors.nombre}</p>}
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Campo Especie */}
                                <div>
                                    <label htmlFor="especie" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        🐾 Especie *
                                    </label>
                                    <select
                                        id="especie"
                                        name="especie"
                                        value={data.especie}
                                        onChange={(e) => setData('especie', e.target.value)}
                                        className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-800/30 [&>option]:bg-white [&>option]:text-gray-800 dark:[&>option]:bg-gray-700 dark:[&>option]:text-white"
                                        required
                                    >
                                        <option value="" disabled className="text-gray-500 dark:text-gray-400">
                                            Selecciona una especie
                                        </option>
                                        <option value="perro" className="py-2">
                                            🐕 Perro
                                        </option>
                                        <option value="gato" className="py-2">
                                            🐱 Gato
                                        </option>
                                    </select>
                                    {errors.especie && <p className="mt-2 text-sm font-medium text-red-600">{errors.especie}</p>}
                                </div>

                                {/* Campo Raza */}
                                <div>
                                    <label htmlFor="raza" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        🏷️ Raza *
                                    </label>
                                    <select
                                        id="raza"
                                        name="raza"
                                        value={data.raza}
                                        onChange={(e) => setData('raza', e.target.value)}
                                        disabled={!data.especie}
                                        className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100/50 disabled:text-gray-400 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-800/30 dark:disabled:bg-gray-600/50 [&>option]:bg-white [&>option]:text-gray-800 dark:[&>option]:bg-gray-700 dark:[&>option]:text-white"
                                        required
                                    >
                                        <option value="" disabled className="text-gray-500 dark:text-gray-400">
                                            {!data.especie ? 'Primero selecciona una especie' : 'Selecciona una raza'}
                                        </option>
                                        {data.especie === 'perro' &&
                                            RAZAS_PERROS.map((raza) => (
                                                <option key={raza} value={raza} className="py-2">
                                                    {raza}
                                                </option>
                                            ))}
                                        {data.especie === 'gato' &&
                                            RAZAS_GATOS.map((raza) => (
                                                <option key={raza} value={raza} className="py-2">
                                                    {raza}
                                                </option>
                                            ))}
                                    </select>
                                    {errors.raza && <p className="mt-2 text-sm font-medium text-red-600">{errors.raza}</p>}
                                </div>
                            </div>
                        </fieldset>

                        {/* --- DATOS PERSONALES --- */}
                        <fieldset className="relative space-y-6 overflow-hidden rounded-3xl border-2 border-green-200/50 bg-gradient-to-br from-green-50/50 to-blue-50/30 p-6 dark:border-green-700/30 dark:from-green-900/20 dark:to-blue-900/20">
                            <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-gradient-to-br from-green-300/30 to-transparent blur-lg"></div>
                            <legend className="relative px-4 text-lg font-bold text-green-700 dark:text-green-300">
                                <span className="rounded-xl bg-white/90 px-3 py-1 shadow-lg dark:bg-gray-800/90">📋 Datos Personales</span>
                            </legend>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Campo Fecha de Nacimiento */}
                                <div>
                                    <label htmlFor="fecha_nacimiento" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Fecha de Nacimiento *
                                    </label>
                                    <input
                                        id="fecha_nacimiento"
                                        name="fecha_nacimiento"
                                        type="date"
                                        value={data.fecha_nacimiento}
                                        onChange={(e) => {
                                            setData('fecha_nacimiento', e.target.value);
                                            calcularEdad(e.target.value);
                                        }}
                                        max={new Date().toISOString().split('T')[0]} // No permitir fechas futuras
                                        className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-800/30"
                                        required
                                    />
                                    {errors.fecha_nacimiento && <p className="mt-2 text-sm font-medium text-red-600">{errors.fecha_nacimiento}</p>}
                                </div>

                                {/* Campo Edad Calculada (solo lectura) */}
                                <div>
                                    <label htmlFor="edad_calculada" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        🎂 Edad Actual
                                    </label>
                                    <input
                                        id="edad_calculada"
                                        name="edad_calculada"
                                        type="text"
                                        value={edadCalculada}
                                        readOnly
                                        placeholder="Se calculará automáticamente"
                                        className="w-full cursor-not-allowed rounded-xl border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4 text-gray-600 shadow-lg dark:border-gray-600 dark:from-gray-600 dark:to-gray-700 dark:text-gray-300"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Campo Sexo */}
                                <div>
                                    <label htmlFor="sexo" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        ⚧️ Sexo *
                                    </label>
                                    <select
                                        id="sexo"
                                        name="sexo"
                                        value={data.sexo}
                                        onChange={(e) => setData('sexo', e.target.value)}
                                        className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-800/30 [&>option]:bg-white [&>option]:text-gray-800 dark:[&>option]:bg-gray-700 dark:[&>option]:text-white"
                                        required
                                    >
                                        <option value="" disabled className="text-gray-500 dark:text-gray-400">
                                            Selecciona el sexo
                                        </option>
                                        <option value="Macho" className="py-2">
                                            ♂️ Macho
                                        </option>
                                        <option value="Hembra" className="py-2">
                                            ♀️ Hembra
                                        </option>
                                    </select>
                                    {errors.sexo && <p className="mt-2 text-sm font-medium text-red-600">{errors.sexo}</p>}
                                </div>

                                {/* Campo Ciudad */}
                                <div>
                                    <label htmlFor="ciudad" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        🏙️ Ciudad *
                                    </label>
                                    <select
                                        id="ciudad"
                                        name="ciudad"
                                        value={data.ciudad}
                                        onChange={(e) => setData('ciudad', e.target.value)}
                                        className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-800/30 [&>option]:bg-white [&>option]:text-gray-800 dark:[&>option]:bg-gray-700 dark:[&>option]:text-white"
                                        required
                                    >
                                        <option value="" disabled className="text-gray-500 dark:text-gray-400">
                                            Selecciona una ciudad
                                        </option>
                                        {CIUDADES_COLOMBIA.map((ciudad) => (
                                            <option key={ciudad} value={ciudad} className="py-2">
                                                {ciudad}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.ciudad && <p className="mt-2 text-sm font-medium text-red-600">{errors.ciudad}</p>}
                                </div>
                            </div>
                        </fieldset>

                        {/* --- DESCRIPCIÓN --- */}
                        <fieldset className="relative space-y-6 overflow-hidden rounded-3xl border-2 border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-pink-50/30 p-6 dark:border-purple-700/30 dark:from-purple-900/20 dark:to-pink-900/20">
                            <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-gradient-to-br from-purple-300/30 to-transparent blur-lg"></div>
                            <legend className="relative px-4 text-lg font-bold text-purple-700 dark:text-purple-300">
                                <span className="rounded-xl bg-white/90 px-3 py-1 shadow-lg dark:bg-gray-800/90">📝 Descripción</span>
                            </legend>

                            <div>
                                <div className="relative">
                                    <label
                                        htmlFor="descripcion"
                                        className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300"
                                    >
                                        📝 Descripción y personalidad *
                                    </label>
                                    <textarea
                                        id="descripcion"
                                        name="descripcion"
                                        value={data.descripcion}
                                        onChange={(e) => setData('descripcion', e.target.value)}
                                        placeholder="Cuéntanos sobre la personalidad, comportamiento y características especiales de tu mascota..."
                                        rows={5}
                                        autoComplete="off"
                                        className="w-full resize-none rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-800/30"
                                        required
                                    />
                                    {errors.descripcion && <p className="mt-2 text-sm font-medium text-red-600">{errors.descripcion}</p>}
                                </div>
                            </div>
                        </fieldset>

                        {/* --- IMÁGENES --- */}
                        <fieldset className="relative space-y-6 overflow-hidden rounded-3xl border-2 border-orange-200/50 bg-gradient-to-br from-orange-50/50 to-yellow-50/30 p-6 dark:border-orange-700/30 dark:from-orange-900/20 dark:to-yellow-900/20">
                            <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-gradient-to-br from-orange-300/30 to-transparent blur-lg"></div>
                            <legend className="relative px-4 text-lg font-bold text-orange-700 dark:text-orange-300">
                                <span className="rounded-xl bg-white/90 px-3 py-1 shadow-lg dark:bg-gray-800/90">📸 Imágenes (hasta 3)</span>
                            </legend>

                            {/* Vista previa de imágenes existentes (solo en modo edición) */}
                            {modoEdicion && imagenesExistentes.length > 0 && (
                                <div className="space-y-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">📂 Imágenes actuales:</p>
                                    <div className="grid grid-cols-3 gap-4">
                                        {imagenesExistentes.map((imagen, index) => (
                                            <div
                                                key={`existing-${index}`}
                                                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-gray-800"
                                            >
                                                <img
                                                    src={`/storage/${imagen}`}
                                                    alt={`Imagen existente ${index + 1}`}
                                                    className="h-24 w-full rounded-xl object-cover transition-transform duration-200 group-hover:scale-105"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(index)}
                                                    className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 hover:scale-110 hover:bg-red-600"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Vista previa de imágenes nuevas seleccionadas */}
                            {imagePreviews.length > 0 && (
                                <div className="space-y-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {modoEdicion ? '🆕 Nuevas imágenes:' : '📸 Imágenes seleccionadas:'}
                                    </p>
                                    <div className="grid grid-cols-3 gap-4">
                                        {imagePreviews.map((preview, index) => (
                                            <div
                                                key={`new-${index}`}
                                                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-gray-800"
                                            >
                                                <img
                                                    src={preview}
                                                    alt={`Vista previa ${index + 1}`}
                                                    className="h-24 w-full rounded-xl object-cover transition-transform duration-200 group-hover:scale-105"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 hover:scale-110 hover:bg-red-600"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                                <div className="absolute right-0 bottom-0 left-0 truncate rounded-b-xl bg-black/70 p-2 text-xs text-white">
                                                    {additionalFiles[index]?.name}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Botón para agregar imágenes (solo si no se ha llegado al límite) */}
                            {imagenesExistentes.length + additionalFiles.length < 3 && (
                                <label
                                    htmlFor="imagenes-mascota"
                                    className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-orange-300/60 bg-gradient-to-r from-orange-50 to-yellow-50 p-8 text-center transition-all duration-300 hover:border-orange-400 hover:from-orange-100 hover:to-yellow-100 hover:shadow-lg dark:border-orange-600/50 dark:from-orange-900/30 dark:to-yellow-900/30 dark:hover:border-orange-500 dark:hover:from-orange-800/40 dark:hover:to-yellow-800/40"
                                >
                                    <Plus className="h-12 w-12 text-orange-400 transition-transform duration-300 group-hover:scale-110 dark:text-orange-300" />
                                    <span className="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {imagenesExistentes.length + additionalFiles.length === 0
                                            ? '📸 Seleccionar imágenes de tu mascota'
                                            : `➕ Agregar más imágenes (${3 - (imagenesExistentes.length + additionalFiles.length)} disponibles)`}
                                    </span>
                                    <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF • Máximo 2MB cada una</span>
                                </label>
                            )}

                            <input
                                id="imagenes-mascota"
                                name="imagenes-mascota"
                                ref={multipleFileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                autoComplete="off"
                                onChange={(e) => handleAddImages(e.target.files)}
                                className="hidden"
                            />

                            {errors.imagenes && <p className="mt-2 text-sm font-medium text-red-600">{errors.imagenes}</p>}
                        </fieldset>

                        {/* Botones de Acción */}
                        <div className="flex justify-center gap-4 pt-8">
                            <button
                                type="button"
                                onClick={onClose}
                                className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-400 to-gray-600 px-8 py-3 font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 dark:from-gray-600 dark:to-gray-800"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                <span className="relative">Cancelar</span>
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 to-green-600 px-8 py-3 font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                <span className="relative">
                                    {processing
                                        ? modoEdicion
                                            ? '🔄 Actualizando...'
                                            : '🔄 Registrando...'
                                        : modoEdicion
                                          ? '💾 Guardar cambios'
                                          : '🐾 Registrar Mascota'}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
