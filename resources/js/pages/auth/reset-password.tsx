import InputError from '@/components/input-error';
import ParticlesComponent from '@/components/particles';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import Logo from '../../../../public/Logo/Logo.png';
import LogoWhite from '../../../../public/Logo/LogoWhite.png';

type ResetPasswordForm = {
    email: string;
    token: string;
    newPassword: string;
    confirmPassword: string;
};

type ResetPasswordProps = {
    email?: string;
};

export default function ResetPassword({ email }: ResetPasswordProps) {
    const [data, setData] = useState<ResetPasswordForm>({
        email: email ? decodeURIComponent(email) : '',
        token: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [message, setMessage] = useState<string>('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setMessage('');

        // Validación básica
        if (data.newPassword !== data.confirmPassword) {
            setErrors({ confirmPassword: 'Las contraseñas no coinciden.' });
            setProcessing(false);
            return;
        }

        if (data.newPassword.length < 8) {
            setErrors({ newPassword: 'La contraseña debe tener al menos 8 caracteres.' });
            setProcessing(false);
            return;
        }

        try {
            const response = await fetch('/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    email: data.email,
                    token: data.token,
                    password: data.newPassword,
                    password_confirmation: data.confirmPassword,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage(result.status || 'Contraseña actualizada exitosamente.');
                setData({
                    email: '',
                    token: '',
                    newPassword: '',
                    confirmPassword: '',
                });
                setTimeout(() => {
                    router.visit(route('login'));
                }, 1500);
            } else {
                if (response.status === 422) {
                    setErrors(result.errors || { general: result.message });
                } else if (response.status === 429) {
                    setErrors({ general: 'Demasiados intentos. Por favor espera.' });
                } else {
                    setErrors({ general: result.message || 'Error al actualizar la contraseña.' });
                }
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            setErrors({ general: 'Error de conexión con el servidor.' });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 px-4 dark:from-green-600 dark:via-blue-700 dark:to-purple-800">
            <ParticlesComponent />
            {/* Elementos decorativos de fondo */}
            <div className="pointer-events-none absolute top-1/4 left-1/4 h-64 w-64 animate-pulse rounded-full bg-white/5 blur-3xl" />
            <div className="pointer-events-none absolute top-3/4 right-1/4 h-48 w-48 animate-ping rounded-full bg-blue-300/10 blur-2xl" />
            <div className="pointer-events-none absolute bottom-1/4 left-1/3 h-32 w-32 animate-pulse rounded-full bg-purple-300/10 blur-xl" />

            {/* Contenedor principal */}
            <div className="hover:shadow-3xl relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 text-center shadow-2xl transition-all duration-500 dark:bg-gray-800">
                {/* Elementos decorativos de la tarjeta - más sutiles */}
                <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-gradient-to-br from-blue-100/20 via-white/5 to-transparent blur-xl dark:from-blue-400/10" />
                <div className="pointer-events-none absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-gradient-to-tr from-green-100/15 via-white/3 to-transparent blur-lg dark:from-green-400/8" />

                {/* Logo responsive por modo */}
                <Link href={route('index')} className="relative z-10 block">
                    <img
                        src={Logo}
                        alt="Logo AdoptaFácil"
                        className="mx-auto mb-6 h-36 w-56 drop-shadow-2xl transition-transform duration-300 hover:scale-105 dark:hidden"
                    />
                    <img
                        src={LogoWhite}
                        alt="Logo AdoptaFácil"
                        className="mx-auto mb-6 hidden h-36 w-56 drop-shadow-2xl transition-transform duration-300 hover:scale-105 dark:block"
                    />
                </Link>
                <Head title="Restablecer contraseña" />

                {/* Título y descripción */}
                <div className="relative z-10 mb-8 text-center">
                    <h1 className="mb-4 text-3xl font-bold tracking-tight text-purple-800 md:text-4xl dark:text-purple-500">
                        Restablecer contraseña
                    </h1>
                    <p className="text-lg leading-relaxed font-medium text-gray-600 dark:text-gray-300">
                        Ingresa el código de 6 dígitos enviado a tu email y tu nueva contraseña.
                    </p>
                    {/* Línea decorativa */}
                    <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
                </div>

                {/* Mensajes de éxito o error */}
                {message && (
                    <div className="mb-6 rounded-xl border border-green-200 bg-green-100 p-4 text-center text-sm font-semibold text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300">
                        {message}
                    </div>
                )}
                {errors.general && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-100 p-4 text-center text-sm font-semibold text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
                        {errors.general}
                    </div>
                )}

                <form className="relative z-10 space-y-6" onSubmit={submit}>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Correo Electrónico
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={data.email}
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 transition-all duration-300 focus:border-transparent focus:ring-4 focus:ring-blue-300/50 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                onChange={(e) => setData({ ...data, email: e.target.value })}
                                placeholder="email@example.com"
                                disabled={!!email}
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="token" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Código de Recuperación
                            </Label>
                            <Input
                                id="token"
                                type="text"
                                name="token"
                                value={data.token}
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-center font-mono text-2xl tracking-wider text-gray-800 transition-all duration-300 focus:border-transparent focus:ring-4 focus:ring-blue-300/50 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                onChange={(e) => setData({ ...data, token: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                placeholder="123456"
                                maxLength={6}
                                autoFocus
                            />
                            <InputError message={errors.token} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Nueva Contraseña
                            </Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={showNewPassword ? 'text' : 'password'}
                                    name="newPassword"
                                    autoComplete="new-password"
                                    value={data.newPassword}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-800 transition-all duration-300 focus:border-transparent focus:ring-4 focus:ring-blue-300/50 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    onChange={(e) => setData({ ...data, newPassword: e.target.value })}
                                    placeholder="Ingresa tu nueva contraseña"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors duration-200 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                    tabIndex={-1}
                                >
                                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            <InputError message={errors.newPassword} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Confirmar Contraseña
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    autoComplete="new-password"
                                    value={data.confirmPassword}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-800 transition-all duration-300 focus:border-transparent focus:ring-4 focus:ring-blue-300/50 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
                                    placeholder="Confirma tu nueva contraseña"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors duration-200 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            <InputError message={errors.confirmPassword} />
                        </div>

                        <div className="relative mt-8">
                            <Button
                                type="submit"
                                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-blue-300/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                                disabled={processing}
                            >
                                {/* Efecto de brillo */}
                                <div className="absolute inset-0 translate-x-[-100%] -skew-x-12 bg-white/20 opacity-0 transition-all duration-1000 group-hover:translate-x-[200%] group-hover:opacity-100" />

                                <div className="flex items-center justify-center gap-2">
                                    {processing && <LoaderCircle className="h-5 w-5 animate-spin" />}
                                    <span>Restablecer contraseña</span>
                                </div>
                            </Button>
                        </div>
                    </div>
                </form>

                {/* Enlaces de navegación */}
                <div className="relative z-10 mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                    <span>¿Ya tienes tu nueva contraseña? </span>
                    <Link
                        href={route('login')}
                        className="font-semibold text-blue-600 transition-colors duration-300 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        Iniciar sesión
                    </Link>
                </div>
            </div>

            {/* Theme Switcher posicionado de forma absoluta */}
            <div className="fixed top-4 right-4 z-20">
                <ThemeSwitcher />
            </div>
        </div>
    );
}
