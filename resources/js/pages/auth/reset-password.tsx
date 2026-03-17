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

type ResetPasswordProps = {
    email?: string;
    token: string;
};

type ResetPasswordForm = {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
};

export default function ResetPassword({ email, token }: ResetPasswordProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<ResetPasswordForm>({
        email: email ? decodeURIComponent(email) : '',
        token,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        await refreshCsrfToken();

        post(route('password.store'), {
            preserveScroll: true,
            onSuccess: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 px-4 dark:from-green-600 dark:via-blue-700 dark:to-purple-800">
            <ParticlesComponent />

            <div className="pointer-events-none absolute top-1/4 left-1/4 h-64 w-64 animate-pulse rounded-full bg-white/5 blur-3xl" />
            <div className="pointer-events-none absolute top-3/4 right-1/4 h-48 w-48 animate-ping rounded-full bg-blue-300/10 blur-2xl" />
            <div className="pointer-events-none absolute bottom-1/4 left-1/3 h-32 w-32 animate-pulse rounded-full bg-purple-300/10 blur-xl" />

            <div className="hover:shadow-3xl relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 text-center shadow-2xl transition-all duration-500 dark:bg-gray-800">
                <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-gradient-to-br from-blue-100/20 via-white/5 to-transparent blur-xl dark:from-blue-400/10" />
                <div className="pointer-events-none absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-gradient-to-tr from-green-100/15 via-white/3 to-transparent blur-lg dark:from-green-400/8" />

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

                <div className="relative z-10 mb-8 text-center">
                    <h1 className="mb-4 text-3xl font-bold tracking-tight text-purple-800 md:text-4xl dark:text-purple-500">
                        Restablecer contraseña
                    </h1>
                    <p className="text-lg leading-relaxed font-medium text-gray-600 dark:text-gray-300">
                        Define tu nueva contraseña para completar la recuperación de tu cuenta.
                    </p>
                    <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
                </div>

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
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="email@example.com"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Nueva Contraseña
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    autoComplete="new-password"
                                    value={data.password}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-800 transition-all duration-300 focus:border-transparent focus:ring-4 focus:ring-blue-300/50 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Ingresa tu nueva contraseña"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((current) => !current)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors duration-200 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Confirmar Contraseña
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password_confirmation"
                                    type={showPasswordConfirmation ? 'text' : 'password'}
                                    name="password_confirmation"
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-800 transition-all duration-300 focus:border-transparent focus:ring-4 focus:ring-blue-300/50 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Confirma tu nueva contraseña"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordConfirmation((current) => !current)}
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
                            className="group relative mt-8 w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-blue-300/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                            disabled={processing}
                        >
                            <div className="absolute inset-0 translate-x-[-100%] -skew-x-12 bg-white/20 opacity-0 transition-all duration-1000 group-hover:translate-x-[200%] group-hover:opacity-100" />
                            <div className="flex items-center justify-center gap-2">
                                {processing && <LoaderCircle className="h-5 w-5 animate-spin" />}
                                <span>Guardar nueva contraseña</span>
                            </div>
                        </Button>
                    </div>
                </form>

                <div className="relative z-10 mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                    <span>¿Recordaste tu contraseña? </span>
                    <Link
                        href={route('login')}
                        className="font-semibold text-blue-600 transition-colors duration-300 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        Iniciar sesión
                    </Link>
                </div>
            </div>

            <div className="fixed top-4 right-4 z-20">
                <ThemeSwitcher />
            </div>
        </div>
    );
}
