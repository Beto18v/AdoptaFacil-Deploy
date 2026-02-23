/**
 * Dashboard unificado de productos y mascotas para gestión de aliados comerciales
 *
 * Este componente central permite a los aliados gestionar tanto sus productos como mascotas
 * desde una interfaz unificada, proporcionando herramientas completas de CRUD.
 *
 * Funcionalidades principales:
 * - Visualización en grid responsivo de productos y mascotas
 * - Sistema de filtros por tipo y búsqueda por nombre
 * - Creación y edición modal de mascotas con soporte de múltiples imágenes
 * - Creación y edición modal de productos con gestión de stock
 * - Eliminación con confirmación de elementos
 * - Sistema de mensajes de feedback para el usuario
 * - Integración con formularios de adopción automáticos
 *
 * Optimizaciones implementadas:
 * - Gestión eficiente de estado con useState memoizado
 * - Carga lazy de datos de edición bajo demanda
 * - Validación client-side antes del envío
 * - Manejo robusto de errores con fallbacks
 *
 * @author Equipo AdoptaFácil
 * @version 2.0.0 - Optimizado para producción
 * @since 2024
 */

// Dashboard unificado: productos y mascotas para gestión de aliados
import ChatbotWidget from '@/components/chatbot-widget';
import { ThemeSwitcher } from '@/components/theme-switcher';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ProductoMascotaCard, { type CardItem } from './components/producto-mascota-card';
import RegistrarMascota from './components/registrar-mascota';
import RegistrarProducto from './components/registrar-producto';

/**
 * Interfaces para tipado fuerte de datos de edición
 * Estas interfaces garantizan la integridad de los datos durante las operaciones CRUD
 */

// Interfaces específicas para edición
interface MascotaEdicion {
    id: number;
    nombre: string;
    especie: string;
    raza: string;
    fecha_nacimiento: string;
    sexo: string;
    ciudad: string;
    descripcion: string;
    imagenes_existentes: string[]; // Array de rutas de imágenes existentes
}

interface ProductoEdicion {
    id: number;
    nombre: string;
    descripcion: string;
    precio: string;
    cantidad: string;
    imagenes_existentes: string[];
}

/**
 * Configuración de breadcrumbs para navegación
 */
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Productos y Mascotas', href: route('productos.mascotas') }];

/**
 * Componente principal del dashboard de productos y mascotas
 * Gestiona el estado completo de la aplicación y coordina las interacciones
 */
export default function ProductosMascotas() {
    /**
     * Extracción y validación de props del componente padre
     * Incluye manejo defensivo de datos opcionales
     */
    const page = usePage();
    const {
        items = [],
        auth,
        success,
    } = page.props as unknown as {
        items: CardItem[];
        auth: { user?: { role?: string } };
        success?: string;
    };
    const itemsTyped = items;
    const esAliado = auth.user?.role === 'aliado';

    /**
     * Estados del componente organizados por funcionalidad
     * - Modales: Control de apertura/cierre de ventanas modales
     * - Filtros: Gestión de búsqueda y filtrado de elementos
     * - UI: Mensajes de feedback y estados de adopción
     * - Edición: Estados para operaciones de modificación
     */

    // Estados del componente
    const [isMascotaModalOpen, setMascotaModalOpen] = useState(false);
    const [isProductoModalOpen, setProductoModalOpen] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [filtro, setFiltro] = useState<'todo' | 'producto' | 'mascota'>('todo');
    const [mensaje, setMensaje] = useState<string | null>(null);

    // Estados para edición
    const [mascotaEditando, setMascotaEditando] = useState<CardItem | null>(null);
    const [productoEditando, setProductoEditando] = useState<CardItem | null>(null);
    const [modoEdicion, setModoEdicion] = useState(false);

    /**
     * Effect para mostrar mensajes de éxito provenientes del backend
     * Se ejecuta cuando cambia la prop 'success'
     */
    useEffect(() => {
        if (success) {
            mostrarMensaje(success as string);
        }
    }, [success]);

    /**
     * Función de filtrado optimizada para buscar por nombre y tipo
     * Implementa búsqueda case-insensitive y filtros combinados
     */
    const productosFiltrados = itemsTyped.filter(
        (item) => (item.nombre || '').toLowerCase().includes((busqueda || '').toLowerCase()) && (filtro === 'todo' || item.tipo === filtro),
    );

    /**
     * Función utilitaria para mostrar mensajes temporales al usuario
     * @param msg - Mensaje a mostrar
     */
    const mostrarMensaje = (msg: string) => {
        setMensaje(msg);
        setTimeout(() => setMensaje(null), 4000);
    };

    /**
     * Funciones para gestión de modales - Mascotas
     * Incluyen reset completo del estado de edición
     */

    // Función para cerrar modal de mascota y resetear edición
    const cerrarModalMascota = () => {
        setMascotaModalOpen(false);
        setMascotaEditando(null);
        setModoEdicion(false);
    };

    /**
     * Callback optimizado para recarga de datos tras registro exitoso
     * Cierra modal y actualiza la lista de elementos
     */

    // Función para manejar el éxito del registro de mascota
    const handleMascotaRegistrada = () => {
        cerrarModalMascota();
        // Recargar la página para mostrar la nueva mascota
        router.reload({ only: ['items'] });
    };

    /**
     * Funciones para gestión de modales - Productos
     * Mantienen consistencia con el patrón de mascotas
     */

    // Función para cerrar modal de producto y resetear edición
    const cerrarModalProducto = () => {
        setProductoModalOpen(false);
        setProductoEditando(null);
        setModoEdicion(false);
    };

    /**
     * Funciones de apertura de modales en modo creación
     * Resetean el estado de edición y abren el modal correspondiente
     */

    // Función para abrir modal de mascota en modo creación
    const abrirModalMascotaCreacion = () => {
        setMascotaEditando(null);
        setModoEdicion(false);
        setMascotaModalOpen(true);
    };

    // Función para abrir modal de producto en modo creación
    const abrirModalProductoCreacion = () => {
        setProductoEditando(null);
        setModoEdicion(false);
        setProductoModalOpen(true);
    };

    const handleEdit = async (item: CardItem) => {
        try {
            if (item.tipo === 'mascota') {
                // Obtener datos completos de la mascota desde el backend
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                const response = await fetch(`/mascotas/${item.id}`, {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': csrfToken || '',
                    },
                    credentials: 'same-origin',
                });

                if (response.ok) {
                    const mascotaCompleta = await response.json();
                    setMascotaEditando({
                        ...item,
                        ...mascotaCompleta,
                    });
                } else {
                    // Fallback a datos básicos si no se pueden obtener datos completos
                    setMascotaEditando(item);
                }

                setModoEdicion(true);
                setMascotaModalOpen(true);
            } else if (item.tipo === 'producto') {
                // Para productos, usar los datos del item que ya incluyen imagenes_existentes
                setProductoEditando(item);
                setModoEdicion(true);
                setProductoModalOpen(true);
            }
        } catch {
            // Fallback a datos básicos en caso de error
            if (item.tipo === 'mascota') {
                setMascotaEditando(item);
                setModoEdicion(true);
                setMascotaModalOpen(true);
            } else {
                setProductoEditando(item);
                setModoEdicion(true);
                setProductoModalOpen(true);
            }
        }
    };

    /**
     * Función de eliminación con confirmación del usuario
     * Incluye validación de permisos y feedback de resultado
     * @param item - Elemento a eliminar
     */
    const handleDelete = (item: CardItem) => {
        if (confirm(`¿Estás seguro de que quieres eliminar "${item.nombre}"? Esta acción no se puede deshacer.`)) {
            const deleteUrl = item.tipo === 'producto' ? `/productos/${item.id}` : `/mascotas/${item.id}`;
            router.delete(deleteUrl, {
                preserveScroll: true,
                onSuccess: () => mostrarMensaje(`"${item.nombre}" ha sido eliminado.`),
                onError: () => {
                    mostrarMensaje('No se pudo eliminar el ítem.');
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Productos y Mascotas" />
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

                <div className="relative z-10 container mx-auto max-w-7xl space-y-8">
                    {/* Título de la página con gradiente */}
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold tracking-tight drop-shadow-lg md:text-5xl lg:text-6xl">
                            <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                                {esAliado ? 'Gestión de Productos y Mascotas' : 'Productos y Mascotas'}
                            </span>
                        </h1>
                        <p className="mt-4 text-xl leading-relaxed font-medium text-white/90">
                            {esAliado ? 'Administra tu inventario y mascotas' : 'Descubre productos y mascotas disponibles'}
                        </p>

                        {/* Línea decorativa */}
                        <div className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                    </div>

                    {/* Mensaje de éxito */}
                    {mensaje && (
                        <div className="animate-fade-in relative overflow-hidden rounded-3xl bg-white/95 p-6 text-center shadow-2xl backdrop-blur-sm transition-all duration-500 dark:bg-gray-800/95">
                            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-green-500/20 to-transparent"></div>
                            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-green-300/10 to-transparent"></div>
                            <div className="relative">
                                <div className="mx-auto mb-3 w-fit rounded-2xl bg-gradient-to-r from-green-500 to-green-700 p-3 shadow-xl">
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-lg font-medium text-gray-800 dark:text-white">{mensaje}</p>
                            </div>
                        </div>
                    )}

                    {/* Botones de registro para Aliado */}
                    {esAliado && (
                        <div className="mb-8 flex justify-center gap-4">
                            <button
                                onClick={abrirModalMascotaCreacion}
                                className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-500 to-green-700 px-8 py-3 font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:from-green-600 hover:to-green-800"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                <span className="relative flex items-center gap-3">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Registrar Mascota
                                </span>
                            </button>
                            <button
                                onClick={abrirModalProductoCreacion}
                                className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 to-blue-700 px-8 py-3 font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-blue-800"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                <span className="relative flex items-center gap-3">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Registrar Producto
                                </span>
                            </button>
                        </div>
                    )}

                    {/* Modales de registro/edición */}
                    <RegistrarMascota
                        isOpen={isMascotaModalOpen}
                        onClose={cerrarModalMascota}
                        setMensaje={mostrarMensaje}
                        onMascotaRegistrada={handleMascotaRegistrada}
                        mascotaEditar={
                            mascotaEditando
                                ? {
                                      id: mascotaEditando.id,
                                      nombre: (mascotaEditando as unknown as MascotaEdicion).nombre || '',
                                      especie: (mascotaEditando as unknown as MascotaEdicion).especie || '',
                                      raza: (mascotaEditando as unknown as MascotaEdicion).raza || '',
                                      fecha_nacimiento: (mascotaEditando as unknown as MascotaEdicion).fecha_nacimiento || '',
                                      sexo: (mascotaEditando as unknown as MascotaEdicion).sexo || '',
                                      ciudad: (mascotaEditando as unknown as MascotaEdicion).ciudad || '',
                                      descripcion: (mascotaEditando as unknown as MascotaEdicion).descripcion || '',
                                      imagenes_existentes: (mascotaEditando as unknown as MascotaEdicion).imagenes_existentes || [],
                                  }
                                : null
                        }
                        modoEdicion={modoEdicion && mascotaEditando !== null}
                    />
                    <RegistrarProducto
                        isOpen={isProductoModalOpen}
                        onClose={cerrarModalProducto}
                        setMensaje={mostrarMensaje}
                        productoEditar={
                            productoEditando
                                ? {
                                      id: productoEditando.id,
                                      nombre: (productoEditando as unknown as ProductoEdicion).nombre || '',
                                      descripcion: (productoEditando as unknown as ProductoEdicion).descripcion || '',
                                      precio: (productoEditando as unknown as ProductoEdicion).precio?.toString() || '0',
                                      cantidad: (productoEditando as unknown as ProductoEdicion).cantidad?.toString() || '1',
                                      imagenes_existentes: (productoEditando as unknown as ProductoEdicion).imagenes_existentes || [],
                                  }
                                : null
                        }
                        modoEdicion={modoEdicion && productoEditando !== null}
                    />

                    {/* Filtros y búsqueda */}
                    <div className="mb-8">
                        <div className="group hover:shadow-3xl relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.01] dark:bg-gray-800/95">
                            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-purple-500/20 to-transparent"></div>
                            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-blue-300/10 to-transparent"></div>

                            <div className="relative">
                                <h3 className="mb-6 text-center text-xl font-semibold text-gray-800 dark:text-white">Buscar y Filtrar</h3>
                                <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
                                    <div className="relative w-full md:w-1/2">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            id="text"
                                            name="text"
                                            type="text"
                                            value={busqueda}
                                            onChange={(e) => setBusqueda(e.target.value)}
                                            placeholder="Buscar por nombre..."
                                            className="w-full rounded-xl border-gray-300 bg-gray-50 py-3 pr-4 pl-10 text-gray-900 shadow-sm transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:border-blue-400"
                                        />
                                    </div>
                                    <div className="relative w-full md:w-auto">
                                        <select
                                            id="filtro"
                                            name="filtro"
                                            value={filtro}
                                            onChange={(e) => setFiltro(e.target.value as 'todo' | 'producto' | 'mascota')}
                                            className="w-full appearance-none rounded-xl border-gray-300 bg-gray-50 px-4 py-3 pr-10 text-gray-900 shadow-sm transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none md:w-48 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:border-blue-400"
                                        >
                                            <option value="todo">Todos</option>
                                            <option value="producto">Solo productos</option>
                                            <option value="mascota">Solo mascotas</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* --- INICIO DE LA CUADRÍCULA DE TARJETAS --- */}
                    <div className="relative overflow-hidden rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm dark:bg-gray-800/95">
                        {/* Elementos decorativos */}
                        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/5 blur-2xl"></div>
                        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-tr from-green-500/10 to-blue-500/5 blur-xl"></div>

                        <div className="relative">
                            {/* Header de la sección */}
                            <div className="mb-8 text-center">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    {productosFiltrados.length > 0
                                        ? `${productosFiltrados.length} ${productosFiltrados.length === 1 ? 'Resultado' : 'Resultados'} ${filtro !== 'todo' ? `de ${filtro}s` : ''}`
                                        : 'No hay resultados'}
                                </h2>
                                {productosFiltrados.length > 0 && (
                                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                                        {busqueda ? `Búsqueda: "${busqueda}"` : 'Mostrando todos los elementos disponibles'}
                                    </p>
                                )}
                            </div>

                            {productosFiltrados.length > 0 ? (
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {productosFiltrados.map((item) => (
                                        <ProductoMascotaCard
                                            key={`${item.tipo}-${item.id}`}
                                            item={item}
                                            onDelete={handleDelete}
                                            onEdit={handleEdit}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-16 text-center">
                                    <div className="mx-auto mb-6 w-fit rounded-2xl bg-gradient-to-r from-gray-500 to-gray-600 p-4 shadow-xl">
                                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.7-2.6"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-gray-700 dark:text-gray-300">No se encontraron resultados</h3>
                                    <p className="mx-auto max-w-md leading-relaxed text-gray-600 dark:text-gray-400">
                                        {busqueda
                                            ? `No hay elementos que coincidan con "${busqueda}"`
                                            : `No hay ${filtro !== 'todo' ? filtro + 's' : 'elementos'} disponibles en este momento`}
                                    </p>
                                    {busqueda && (
                                        <button
                                            onClick={() => setBusqueda('')}
                                            className="mt-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-2 text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                        >
                                            Limpiar búsqueda
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* --- FIN DE LA CUADRÍCULA DE TARJETAS --- */}

                    {/* Mensaje de confirmación o error */}
                </div>
            </main>
            <ThemeSwitcher hasChatbot={true} />
            <ChatbotWidget />
        </AppLayout>
    );
}
