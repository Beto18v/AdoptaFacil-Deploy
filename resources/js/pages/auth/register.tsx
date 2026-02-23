import ChatbotWidget from '@/components/chatbot-widget';
import InputError from '@/components/input-error';
import ParticlesComponent from '@/components/particles';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import Logo from '../../../../public/Logo/Logo.png';
import LogoWhite from '../../../../public/Logo/LogoWhite.png';
import { refreshCsrfToken } from '../../app';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: string; // Añade role
};

export default function Register({ role }: { role: string }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: role, // Valor por defecto;
    });

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        await refreshCsrfToken();
        post(route('register'), {
            onSuccess: async () => {
                await refreshCsrfToken();
                window.location.href = route('dashboard');
            },
            onFinish: () => {
                reset('password', 'password_confirmation');
            },
        });
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 dark:from-green-600 dark:via-blue-700 dark:to-purple-800">
            <ParticlesComponent />
            {/* Elementos decorativos de fondo */}
            <div className="pointer-events-none absolute top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full bg-white/5 blur-3xl"></div>
            <div className="pointer-events-none absolute right-1/5 bottom-1/3 h-64 w-64 rounded-full bg-blue-300/10 blur-2xl"></div>
            <div className="pointer-events-none absolute top-1/2 right-1/3 h-32 w-32 animate-ping rounded-full bg-purple-300/10 blur-xl"></div>

            <div className="flex min-h-screen items-center justify-center px-4">
                {/* Contenedor principal */}
                <div className="hover:shadow-3xl relative z-10 w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl transition-all duration-500 hover:scale-[1.02] dark:bg-gray-800">
                    {/* Elementos decorativos internos */}
                    <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-xl"></div>
                    <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-gradient-to-tr from-white/5 to-transparent blur-lg"></div>
                    {/* Logo */}
                    <Link href={route('index')} className="mb-6 block">
                        <img
                            src={Logo}
                            alt="Logo AdoptaFácil"
                            className="mx-auto h-28 w-44 drop-shadow-2xl transition-transform duration-300 hover:scale-105 dark:hidden"
                        />
                        <img
                            src={LogoWhite}
                            alt="Logo AdoptaFácil"
                            className="mx-auto hidden h-28 w-44 drop-shadow-2xl transition-transform duration-300 hover:scale-105 dark:block"
                        />
                    </Link>

                    <Head title="Registro | Adoptafacil" />
                    <form className="flex flex-col gap-6" onSubmit={submit}>
                        {/* Añade un campo oculto para el rol */}
                        <input type="hidden" value={data.role} onChange={(e) => setData('role', e.target.value)} />
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-start font-semibold text-gray-800 dark:text-white">
                                    Nombre
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    disabled={processing}
                                    placeholder="Nombre completo"
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 placeholder-gray-500 transition-all duration-300 focus:border-transparent focus:ring-4 focus:ring-blue-300/50 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-start font-semibold text-gray-800 dark:text-white">
                                    Correo Electrónico
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    disabled={processing}
                                    placeholder="email@example.com"
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 placeholder-gray-500 transition-all duration-300 focus:border-transparent focus:ring-4 focus:ring-blue-300/50 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-start font-semibold text-gray-800 dark:text-white">
                                    Contraseña
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        disabled={processing}
                                        placeholder="Contraseña (Mínimo 8 caracteres)"
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-800 placeholder-gray-500 transition-all duration-300 focus:border-transparent focus:ring-4 focus:ring-blue-300/50 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors duration-200 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation" className="text-start font-semibold text-gray-800 dark:text-white">
                                    Confirmar Contraseña
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        type={showPasswordConfirmation ? 'text' : 'password'}
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        disabled={processing}
                                        placeholder="Confirmar contraseña"
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-800 placeholder-gray-500 transition-all duration-300 focus:border-transparent focus:ring-4 focus:ring-blue-300/50 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors duration-200 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                        tabIndex={-1}
                                    >
                                        {showPasswordConfirmation ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <Button
                                type="submit"
                                className="group relative mt-6 w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-blue-300/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                tabIndex={5}
                                disabled={processing}
                            >
                                <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Crear cuenta
                                </span>
                            </Button>
                        </div>

                        {/* Botón de Google */}
                        <a
                            href={route('auth.google')}
                            className="group relative mt-4 inline-block w-full overflow-hidden rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-center font-semibold text-gray-700 shadow-lg transition-all duration-300 hover:scale-105 hover:border-gray-400 hover:shadow-xl focus:ring-4 focus:ring-gray-300/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:border-gray-500"
                            tabIndex={5}
                        >
                            <div className="absolute inset-0 bg-gray-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-gray-600"></div>
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Registrarse con Google
                            </span>
                        </a>

                        <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                            ¿Ya tienes una cuenta?{' '}
                            <Link
                                href={route('login')}
                                className="font-semibold text-blue-500 transition-colors duration-300 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                                tabIndex={6}
                            >
                                Iniciar sesión
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
            <ThemeSwitcher hasChatbot={true} />
            <ChatbotWidget />
        </div>
    );
}
