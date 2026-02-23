import ChatbotWidget from '@/components/chatbot-widget';
import ParticlesComponent from '@/components/particles';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Logo from '../../../../public/Logo/Logo.png';
import LogoWhite from '../../../../public/Logo/LogoWhite.png';

export default function RegistroOpciones() {
    const [tarjetaActiva, setTarjetaActiva] = useState<number | null>(null);

    useEffect(() => {
        document.title = 'Opciones de Registro | AdoptaFácil';
    }, []);

    const opcionesRegistro = [
        {
            id: 1,
            titulo: 'Amigo AdoptaFácil',
            descripcion: 'Adopta, publica mascotas o apoya con recursos. Forma parte activa del bienestar animal.',
            icono: '🐾',
            color: 'from-blue-500 to-blue-700',
            rol: 'cliente',
        },
        {
            id: 2,
            titulo: 'Aliado AdoptaFácil',
            descripcion: 'Regístrate como refugio, veterinaria o tienda. Conecta tu servicio con quienes más lo necesitan.',
            icono: '🏢',
            color: 'from-green-500 to-green-700',
            rol: 'aliado',
        },
    ];

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 text-white dark:from-green-600 dark:via-blue-700 dark:to-purple-800">
            <ParticlesComponent />
            <Head title="Opciones de Registro" />

            {/* Elementos de fondo decorativos */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-white/5 blur-3xl"></div>
                <div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-blue-300/10 blur-2xl"></div>
                <div className="absolute top-1/2 right-1/3 h-32 w-32 rounded-full bg-purple-300/10 blur-xl"></div>
            </div>

            {/* Header con logo */}
            <div className="relative z-10 pt-12 pb-4 text-center">
                <Link href={route('index')} className="group inline-block">
                    <img
                        src={Logo}
                        alt="Logo AdoptaFácil"
                        className="mx-auto mb-6 h-28 w-44 drop-shadow-2xl transition-transform duration-300 group-hover:scale-105 dark:hidden"
                    />
                    <img
                        src={LogoWhite}
                        alt="Logo AdoptaFácil"
                        className="mx-auto mb-6 hidden h-28 w-44 drop-shadow-2xl transition-transform duration-300 group-hover:scale-105 dark:block"
                    />
                </Link>
                <h1 className="mt-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-3xl font-bold text-transparent drop-shadow-lg md:text-4xl lg:text-5xl">
                    Únete a AdoptaFácil
                </h1>
                <p className="mx-auto mt-4 max-w-xl px-4 text-lg leading-relaxed font-medium text-white/90">
                    Selecciona el tipo de cuenta que deseas crear
                </p>

                {/* Línea decorativa */}
                <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </div>

            {/* Tarjetas de opciones */}
            <div className="flex min-h-[45vh] items-center justify-center px-4">
                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:gap-10">
                    {opcionesRegistro.map((opcion) => (
                        <div
                            key={opcion.id}
                            onMouseEnter={() => setTarjetaActiva(opcion.id)}
                            onMouseLeave={() => setTarjetaActiva(null)}
                            className={`group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-white p-8 text-gray-800 shadow-2xl transition-all duration-500 dark:bg-gray-800 dark:text-white ${
                                tarjetaActiva === opcion.id ? 'scale-[1.02] ring-4 ring-white/50' : ''
                            }`}
                        >
                            {/* Decoración de fondo */}
                            <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br from-white/10 to-transparent"></div>
                            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-white/5 to-transparent"></div>

                            {/* Contenido */}
                            <div className="relative z-10">
                                <div
                                    className={`bg-gradient-to-r ${opcion.color} mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl text-4xl text-white shadow-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                                >
                                    {opcion.icono}
                                </div>

                                <h3 className="mb-4 text-center text-2xl font-bold tracking-tight">{opcion.titulo}</h3>
                                <p className="mb-8 text-center leading-relaxed text-gray-600 dark:text-gray-300">{opcion.descripcion}</p>

                                <div className="flex justify-center">
                                    <Link
                                        href={route('register', { role: opcion.rol })}
                                        className={`bg-gradient-to-r ${opcion.color} relative overflow-hidden rounded-xl px-8 py-4 text-center font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-blue-300/50 focus:outline-none`}
                                    >
                                        <span className="relative z-10">Registrarme Ahora</span>
                                        <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 hover:opacity-100"></div>
                                    </Link>
                                </div>
                            </div>

                            {/* Efecto de brillo en hover */}
                            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                                <div className="absolute inset-0 translate-x-[-100%] -skew-x-12 bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000 group-hover:translate-x-[200%]"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Botón de regreso al login */}
            <div className="mt-8 flex justify-center px-4">
                <Link
                    href={route('login')}
                    className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:shadow-xl focus:ring-4 focus:ring-white/30 focus:outline-none"
                >
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-2xl group-hover:animate-bounce">🐕</span>
                        <span className="text-lg font-semibold">¿Ya tienes cuenta? Inicia sesión</span>
                        <span className="text-2xl group-hover:animate-bounce" style={{ animationDelay: '0.1s' }}>
                            🐱
                        </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </Link>
            </div>

            {/* Elementos decorativos flotantes */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 h-2 w-2 animate-pulse rounded-full bg-white/20"></div>
                <div className="absolute top-1/3 right-1/4 h-1 w-1 animate-ping rounded-full bg-white/30"></div>
                <div className="absolute bottom-1/4 left-1/3 h-3 w-3 animate-pulse rounded-full bg-white/10"></div>
                <div className="absolute right-1/3 bottom-1/3 h-1.5 w-1.5 animate-ping rounded-full bg-white/25"></div>
            </div>

            {/* Espaciado inferior */}
            <div className="pb-12"></div>

            <ThemeSwitcher hasChatbot={true} />
            <ChatbotWidget />
        </div>
    );
}
