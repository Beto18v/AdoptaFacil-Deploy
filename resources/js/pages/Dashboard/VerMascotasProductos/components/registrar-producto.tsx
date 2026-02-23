// Componente modal para registro de productos con sistema de múltiples imágenes
import { useForm } from '@inertiajs/react';
import { Plus, X } from 'lucide-react'; // Iconos para UI de imágenes
import React, { useEffect, useRef, useState } from 'react';

interface ProductoData {
    id?: number;
    nombre: string;
    descripcion: string;
    precio: string;
    cantidad: string;
    imagenes_existentes?: string[];
}

interface RegistrarProductoProps {
    isOpen: boolean;
    onClose: () => void;
    setMensaje: (mensaje: string) => void;
    productoEditar?: ProductoData | null;
    modoEdicion?: boolean;
}

export default function RegistrarProducto({ isOpen, onClose, setMensaje, productoEditar, modoEdicion = false }: RegistrarProductoProps) {
    // Form handler para productos con array de imágenes
    const { data, setData, post, processing, errors, reset } = useForm({
        nombre: '',
        descripcion: '',
        precio: '',
        cantidad: '',
        imagenes: [] as File[], // Array para hasta 3 imágenes
        _method: '' as string, // Para el workaround de FormData con PUT
    });

    const modalRef = useRef<HTMLDivElement>(null);
    const multipleFileInputRef = useRef<HTMLInputElement>(null);
    // Estados para gestión de archivos y previews
    const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [imagenesExistentes, setImagenesExistentes] = useState<string[]>([]);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (modoEdicion && productoEditar?.id) {
            // Actualizar producto existente - usar POST con _method para FormData
            console.log('Enviando actualización con datos:', data);

            // Actualizar el formulario de Inertia con _method
            setData('_method', 'PUT');

            // Enviar usando POST con _method=PUT (workaround para FormData)
            setTimeout(() => {
                post(`/productos/${productoEditar.id}`, {
                    forceFormData: true,
                    onSuccess: () => {
                        reset();
                        setAdditionalFiles([]);
                        setImagePreviews([]);
                        setImagenesExistentes([]);
                        onClose();
                        setMensaje('¡Producto actualizado exitosamente!');
                    },
                    onError: () => {
                        setMensaje('Error al actualizar producto. Revisa los datos e intenta nuevamente.');
                        setTimeout(() => {
                            setData('imagenes', []);
                        }, 3000);
                    },
                });
            }, 100);
        } else {
            // Crear nuevo producto
            post('/productos/store', {
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    setAdditionalFiles([]);
                    setImagePreviews([]);
                    onClose();
                    setMensaje('¡Producto registrado exitosamente!');
                },
                onError: () => {
                    setMensaje('Error al registrar producto. Revisa los datos e intenta nuevamente.');
                    setTimeout(() => {
                        setData('imagenes', []);
                    }, 3000);
                },
            });
        }
    };

    // Resetea las imágenes al cerrar el modal
    useEffect(() => {
        if (!isOpen) {
            // Limpiar al cerrar
            setAdditionalFiles([]);
            setImagePreviews([]);
            setImagenesExistentes([]);
            reset();
        } else if (isOpen && modoEdicion && productoEditar) {
            // Cargar datos cuando se abre en modo edición
            // Resetear primero para limpiar cualquier estado previo
            reset();

            // Crear un nuevo objeto con todos los datos
            const formData = {
                nombre: productoEditar.nombre || '',
                descripcion: productoEditar.descripcion || '',
                precio: productoEditar.precio || '',
                cantidad: productoEditar.cantidad || '',
                imagenes: [] as File[],
                _method: '',
            };

            // Actualizar todo de una vez
            Object.entries(formData).forEach(([key, value]) => {
                setData(key as keyof typeof formData, value);
            });

            // Cargar imágenes existentes
            setImagenesExistentes((productoEditar.imagenes_existentes || []).filter((img) => img && img !== 'undefined'));
            console.log('Datos de producto cargados en el formulario:', formData);
        } else if (isOpen && !modoEdicion) {
            // Limpiar al abrir en modo creación
            reset();
            setImagenesExistentes([]);
        }
    }, [isOpen, modoEdicion, productoEditar, reset, setData]);

    // Maneja la selección de múltiples imágenes (máximo 3)
    const handleAddImages = (files: FileList | null) => {
        if (!files) return;

        const newFiles = Array.from(files);
        const totalExistingImages = imagenesExistentes.length + additionalFiles.length;
        const availableSlots = 3 - totalExistingImages; // Espacios disponibles
        const filesToAdd = newFiles.slice(0, availableSlots);

        if (filesToAdd.length > 0) {
            const updatedFiles = [...additionalFiles, ...filesToAdd];
            setAdditionalFiles(updatedFiles);
            setData('imagenes', updatedFiles);

            // Genera previews para mostrar al usuario
            filesToAdd.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setImagePreviews((prev) => [...prev, e.target?.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    // Elimina imagen individual del array
    const removeImage = (indexToRemove: number) => {
        const updatedFiles = additionalFiles.filter((_, index) => index !== indexToRemove);
        const updatedPreviews = imagePreviews.filter((_, index) => index !== indexToRemove);

        setAdditionalFiles(updatedFiles);
        setImagePreviews(updatedPreviews);
        setData('imagenes', updatedFiles);

        // Reset input para permitir reselección
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
                <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-purple-500/15 to-transparent"></div>
                <div className="pointer-events-none absolute top-1/3 -left-8 h-20 w-20 rounded-full bg-gradient-to-tr from-green-500/10 to-transparent"></div>
                <div className="pointer-events-none absolute right-1/4 -bottom-6 h-24 w-24 rounded-full bg-gradient-to-tl from-blue-500/8 to-transparent"></div>

                <div className="relative max-h-[calc(100vh-4rem)] overflow-y-auto p-8">
                    <div className="relative mb-8 text-center">
                        <h2 className="bg-gradient-to-r from-purple-600 to-green-600 bg-clip-text text-3xl font-bold text-transparent dark:from-purple-400 dark:to-green-400">
                            {modoEdicion ? '✏️ Editar Producto' : '📦 Registrar Nuevo Producto'}
                        </h2>
                        <p className="mt-3 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                            {modoEdicion ? 'Actualiza la información de tu producto' : 'Completa la información del producto que deseas vender'}
                        </p>
                        {/* Línea decorativa */}
                        <div className="mx-auto mt-4 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="relative space-y-8">
                        {/* --- INFORMACIÓN DEL PRODUCTO --- */}
                        <fieldset className="relative space-y-6 overflow-hidden rounded-3xl border-2 border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-pink-50/30 p-6 dark:border-purple-700/30 dark:from-purple-900/20 dark:to-pink-900/20">
                            <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-gradient-to-br from-purple-300/30 to-transparent blur-lg"></div>
                            <legend className="relative px-4 text-lg font-bold text-purple-700 dark:text-purple-300">
                                <span className="rounded-xl bg-white/90 px-3 py-1 shadow-lg dark:bg-gray-800/90">📦 Información del Producto</span>
                            </legend>

                            {/* Campo Nombre */}
                            <div>
                                <label htmlFor="nombre" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Nombre del producto *
                                </label>
                                <input
                                    id="nombre"
                                    name="nombre"
                                    type="text"
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    placeholder="Ej: Correa para perros, Comida para gatos..."
                                    autoComplete="off"
                                    className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-800/30"
                                    required
                                />
                                {errors.nombre && <p className="mt-2 text-sm font-medium text-red-600">{errors.nombre}</p>}
                            </div>

                            {/* Campo Descripción */}
                            <div>
                                <label htmlFor="descripcion" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    📝 Descripción del producto *
                                </label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    value={data.descripcion}
                                    onChange={(e) => setData('descripcion', e.target.value)}
                                    placeholder="Describe las características, beneficios y detalles importantes del producto..."
                                    rows={4}
                                    autoComplete="off"
                                    className="w-full resize-none rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-800/30"
                                    required
                                />
                                {errors.descripcion && <p className="mt-2 text-sm font-medium text-red-600">{errors.descripcion}</p>}
                            </div>
                        </fieldset>

                        {/* --- PRECIO Y CANTIDAD --- */}
                        <fieldset className="relative space-y-6 overflow-hidden rounded-3xl border-2 border-green-200/50 bg-gradient-to-br from-green-50/50 to-emerald-50/30 p-6 dark:border-green-700/30 dark:from-green-900/20 dark:to-emerald-900/20">
                            <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-gradient-to-br from-green-300/30 to-transparent blur-lg"></div>
                            <legend className="relative px-4 text-lg font-bold text-green-700 dark:text-green-300">
                                <span className="rounded-xl bg-white/90 px-3 py-1 shadow-lg dark:bg-gray-800/90">💰 Precio y Disponibilidad</span>
                            </legend>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Campo Precio */}
                                <div>
                                    <label htmlFor="precio" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        💵 Precio (COP) *
                                    </label>
                                    <input
                                        id="precio"
                                        name="precio"
                                        type="number"
                                        min="0"
                                        step="100"
                                        value={data.precio}
                                        onChange={(e) => setData('precio', e.target.value)}
                                        placeholder="Ej: 25000"
                                        autoComplete="off"
                                        className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-800/30"
                                        required
                                    />
                                    {errors.precio && <p className="mt-2 text-sm font-medium text-red-600">{errors.precio}</p>}
                                </div>

                                {/* Campo Cantidad */}
                                <div>
                                    <label htmlFor="cantidad" className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        📦 Cantidad disponible *
                                    </label>
                                    <input
                                        id="cantidad"
                                        name="cantidad"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={data.cantidad}
                                        onChange={(e) => setData('cantidad', e.target.value)}
                                        placeholder="Ej: 10, 50, 100"
                                        autoComplete="off"
                                        className="w-full rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-4 text-gray-800 shadow-lg transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-200 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-800/30"
                                        required
                                    />
                                    {errors.cantidad && <p className="mt-2 text-sm font-medium text-red-600">{errors.cantidad}</p>}
                                </div>
                            </div>
                        </fieldset>

                        {/* --- IMÁGENES DEL PRODUCTO --- */}
                        <fieldset className="relative space-y-6 overflow-hidden rounded-3xl border-2 border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-6 dark:border-blue-700/30 dark:from-blue-900/20 dark:to-indigo-900/20">
                            <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-gradient-to-br from-blue-300/30 to-transparent blur-lg"></div>
                            <legend className="relative px-4 text-lg font-bold text-blue-700 dark:text-blue-300">
                                <span className="rounded-xl bg-white/90 px-3 py-1 shadow-lg dark:bg-gray-800/90">
                                    📸 Imágenes del Producto (hasta 3)
                                </span>
                            </legend>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Imágenes del producto (hasta 3)</label>

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
                                                    alt={`Imagen del producto ${index + 1}`}
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
                                    htmlFor="imagenes-producto"
                                    className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-blue-300/60 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 text-center transition-all duration-300 hover:border-blue-400 hover:from-blue-100 hover:to-indigo-100 hover:shadow-lg dark:border-blue-600/50 dark:from-blue-900/30 dark:to-indigo-900/30 dark:hover:border-blue-500 dark:hover:from-blue-800/40 dark:hover:to-indigo-800/40"
                                >
                                    <Plus className="h-12 w-12 text-blue-400 transition-transform duration-300 group-hover:scale-110 dark:text-blue-300" />
                                    <span className="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {imagenesExistentes.length + additionalFiles.length === 0
                                            ? '📸 Seleccionar imágenes del producto'
                                            : `➕ Agregar más imágenes (${3 - (imagenesExistentes.length + additionalFiles.length)} disponibles)`}
                                    </span>
                                    <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF • Máximo 2MB cada una</span>
                                </label>
                            )}

                            <input
                                id="imagenes-producto"
                                name="imagenes-producto"
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
                                className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-500 to-green-600 px-8 py-3 font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                <span className="relative">
                                    {processing
                                        ? modoEdicion
                                            ? '🔄 Actualizando...'
                                            : '🔄 Registrando...'
                                        : modoEdicion
                                          ? '💾 Guardar cambios'
                                          : '📦 Registrar Producto'}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
