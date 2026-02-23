import InputError from '@/components/input-error';
import ParticlesComponent from '@/components/particles';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import Logo from '../../../../public/Logo/Logo.png';
import LogoWhite from '../../../../public/Logo/LogoWhite.png';

export default function ForgotPassword({ status }: { status?: string }) {
    const [data, setData] = useState({ email: '' });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<{ email?: string }>({});
    const [message, setMessage] = useState<string>('');

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setMessage('');

        router.post('/forgot-password', data, {
            onSuccess: () => {
                setMessage('Se ha enviado un enlace de recuperación si el correo existe.');
                setProcessing(false);
            },
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    // Lógica de traducción
    let statusMessage = status;
    if (status === 'A reset link will be sent if the account exists.') {
        statusMessage = '';
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 dark:from-green-600 dark:via-blue-700 dark:to-purple-800">
            <ParticlesComponent />

            <Head title="Recuperar contraseña" />

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
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-white">Recuperar contraseña</h2>
                        <p className="mt-4 text-base leading-relaxed text-gray-600 dark:text-gray-300">
                            Ingresa tu correo electrónico para recibir un código de recuperación
                        </p>
                    </div>
                    {/* Se muestra el mensaje traducido */}
                    {statusMessage && <div className="mb-6 text-center text-sm font-medium text-green-600 dark:text-green-400">{statusMessage}</div>}
                    {/* Mensaje de éxito del microservicio */}
                    {message && <div className="mb-6 text-center text-sm font-medium text-green-600 dark:text-green-400">{message}</div>}
                    <form className="flex flex-col gap-6" onSubmit={submit}>
                        <div className="grid gap-6">
                            <div className="mt-4 grid gap-2">
                                <Label htmlFor="email" className="text-start font-semibold text-gray-800 dark:text-white">
                                    Correo Electrónico
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    autoFocus
                                    onChange={(e) => setData({ ...data, email: e.target.value })}
                                    placeholder="email@example.com"
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 placeholder-gray-500 transition-all duration-300 focus:border-transparent focus:ring-4 focus:ring-blue-300/50 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                />
                                <InputError message={errors.email} />
                            </div>
                            <Button
                                type="submit"
                                className="group relative mt-6 w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-blue-300/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={processing}
                            >
                                <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Enviar código de recuperación
                                </span>
                            </Button>
                        </div>
                    </form>
                    <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
                        <span>O, vuelve a </span>
                        <Link
                            href={route('login')}
                            className="font-semibold text-blue-500 transition-colors duration-300 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            iniciar sesión
                        </Link>
                    </div>
                </div>
            </div>
            <ThemeSwitcher />
        </div>
    );
}
