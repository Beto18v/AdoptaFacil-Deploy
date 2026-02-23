import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react'; // Se importa router
import { useState } from 'react';
import Logo from '../../../../public/Logo/Logo.png';
import LogoWhite from '../../../../public/Logo/LogoWhite.png';

import { useScroll } from '@/hooks/use-scroll';
import { cn } from '@/lib/utils';

export default function Header() {
    const { props } = usePage<SharedData>();
    const auth = props.auth || { user: null };
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const scrolled = useScroll();

    // Función para manejar el cierre de sesión
    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <header
            className={cn(
                'fixed top-0 left-0 z-50 w-full transition-all duration-300 ease-in-out',
                scrolled || isMenuOpen ? 'bg-white/95 shadow-lg dark:bg-gray-800/95' : 'bg-white/10',
                'backdrop-blur-md',
            )}
        >
            <div className="container mx-auto flex items-center justify-between px-6 py-4">
                <Link href={route('index')} className="flex flex-shrink-0 items-center space-x-3">
                    <img
                        src={scrolled || isMenuOpen ? Logo : LogoWhite}
                        alt="Logo Adoptafácil"
                        className="h-12 w-auto drop-shadow-lg transition-all duration-300 hover:scale-105"
                    />
                    <h1
                        className={cn(
                            'hidden text-xl font-bold transition-colors md:block',
                            scrolled || isMenuOpen
                                ? 'bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-green-400'
                                : 'text-white drop-shadow-md',
                        )}
                    >
                        ADOPTAFÁCIL
                    </h1>
                </Link>

                <nav className="hidden space-x-8 md:flex">
                    <Link
                        href={route('productos')}
                        className={cn(
                            'font-semibold transition-all duration-300',
                            scrolled || isMenuOpen
                                ? 'text-gray-800 hover:text-green-600 dark:text-gray-200 dark:hover:text-green-400'
                                : 'text-white drop-shadow-md hover:text-green-200',
                        )}
                    >
                        PRODUCTOS
                    </Link>
                    <Link
                        href="/mascotas"
                        className={cn(
                            'font-semibold transition-all duration-300',
                            scrolled || isMenuOpen
                                ? 'text-gray-800 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400'
                                : 'text-white drop-shadow-md hover:text-blue-200',
                        )}
                    >
                        MASCOTAS
                    </Link>
                    <Link
                        href={route('refugios')}
                        className={cn(
                            'font-semibold transition-all duration-300',
                            scrolled || isMenuOpen
                                ? 'text-gray-800 hover:text-purple-600 dark:text-gray-200 dark:hover:text-purple-400'
                                : 'text-white drop-shadow-md hover:text-purple-200',
                        )}
                    >
                        REFUGIOS
                    </Link>
                    <Link
                        href={route('comunidad')}
                        className={cn(
                            'font-semibold transition-all duration-300',
                            scrolled || isMenuOpen
                                ? 'text-gray-800 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400'
                                : 'text-white drop-shadow-md hover:text-blue-200',
                        )}
                    >
                        COMUNIDAD
                    </Link>
                </nav>

                <div className="flex items-center">
                    {/* --- BOTONES DE ESCRITORIO ACTUALIZADOS --- */}
                    <div className="hidden items-center space-x-4 md:flex">
                        {auth?.user ? (
                            <>
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-blue-300/50 focus:outline-none"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="rounded-xl bg-gradient-to-r from-red-500 to-red-700 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-red-300/50 focus:outline-none"
                                >
                                    Cerrar sesión
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-blue-300/50 focus:outline-none"
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    href={route('register.options')}
                                    className="rounded-xl bg-gradient-to-r from-green-500 to-green-700 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-green-300/50 focus:outline-none"
                                >
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </div>
                    {/* --- FIN BOTONES ESCRITORIO --- */}

                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            type="button"
                            className={cn(
                                'inline-flex items-center justify-center rounded-xl p-3 shadow-md transition-all duration-300 hover:shadow-lg',
                                scrolled || isMenuOpen
                                    ? 'bg-white/80 text-gray-800 hover:bg-white dark:bg-gray-700/80 dark:text-gray-200 dark:hover:bg-gray-700'
                                    : 'bg-white/20 text-white hover:bg-white/30',
                            )}
                            aria-controls="mobile-menu"
                            aria-expanded={isMenuOpen}
                        >
                            <span className="sr-only">Abrir menú principal</span>
                            <svg
                                className={`h-6 w-6 transition-transform ${isMenuOpen ? 'hidden' : 'block'}`}
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                            <svg
                                className={`h-6 w-6 transition-transform ${isMenuOpen ? 'block' : 'hidden'}`}
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MENÚ MÓVIL ACTUALIZADO --- */}
            <div className={cn('md:hidden', isMenuOpen ? 'block' : 'hidden')} id="mobile-menu">
                <div className="space-y-2 bg-white/95 px-4 pt-4 pb-6 backdrop-blur-md dark:bg-gray-800/95">
                    <Link
                        href={route('productos')}
                        className="block rounded-xl px-4 py-3 text-base font-semibold text-gray-800 transition-all duration-300 hover:bg-green-100 hover:text-green-700 dark:text-gray-200 dark:hover:bg-green-900/50 dark:hover:text-green-300"
                    >
                        PRODUCTOS
                    </Link>
                    <Link
                        href="/mascotas"
                        className="block rounded-xl px-4 py-3 text-base font-semibold text-gray-800 transition-all duration-300 hover:bg-blue-100 hover:text-blue-700 dark:text-gray-200 dark:hover:bg-blue-900/50 dark:hover:text-blue-300"
                    >
                        MASCOTAS
                    </Link>
                    <Link
                        href={route('refugios')}
                        className="block rounded-xl px-4 py-3 text-base font-semibold text-gray-800 transition-all duration-300 hover:bg-purple-100 hover:text-purple-700 dark:text-gray-200 dark:hover:bg-purple-900/50 dark:hover:text-purple-300"
                    >
                        REFUGIOS
                    </Link>
                    <Link
                        href={route('comunidad')}
                        className="block rounded-xl px-4 py-3 text-base font-semibold text-gray-800 transition-all duration-300 hover:bg-blue-100 hover:text-blue-700 dark:text-gray-200 dark:hover:bg-blue-900/50 dark:hover:text-blue-300"
                    >
                        COMUNIDAD
                    </Link>

                    <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-600">
                        {auth?.user ? (
                            <div className="space-y-3">
                                <Link
                                    href={route('dashboard')}
                                    className="block w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-3 text-center text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full rounded-xl bg-gradient-to-r from-red-500 to-red-700 px-4 py-3 text-center text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                >
                                    Cerrar sesión
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Link
                                    href={route('login')}
                                    className="block w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-3 text-center text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    href={route('register.options')}
                                    className="block w-full rounded-xl bg-gradient-to-r from-green-500 to-green-700 px-4 py-3 text-center text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                >
                                    Registrarse
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
