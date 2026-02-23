import ParticlesComponent from '@/components/particles';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { refreshCsrfToken } from '../../app';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gradient-to-r from-green-400 to-blue-500 dark:from-green-600 dark:to-blue-700">
            <ParticlesComponent />
            {/* Contenedor principal */}
            <div className="container w-full max-w-md rounded-lg border border-white/20 bg-white/10 p-5 text-center shadow-lg backdrop-blur-md transition-transform duration-300 ease-in-out hover:scale-[1.005] hover:shadow-xl">
                {/* Logo */}
                <Link href={route('index')}>
                    <img src="/Logo/Logo.png" alt="Logo" className="mx-auto mb-8 h-36 w-56" />
                </Link>
                <Head title="Verificación de email" />

                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Verifica tu email</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Por favor verifica tu dirección de email haciendo clic en el enlace que te hemos enviado.
                    </p>
                </div>

                {status === 'verification-link-sent' && (
                    <div className="mb-4 text-center text-sm font-medium text-green-600 dark:text-green-400">
                        Se ha enviado un nuevo enlace de verificación a tu dirección de email.
                    </div>
                )}

                <form onSubmit={submit} className="flex flex-col gap-6 text-center">
                    <Button
                        type="submit"
                        className="focus:ring-opacity-50 w-full transform rounded-lg bg-blue-500 px-4 py-2 text-white transition-all duration-300 ease-in-out hover:scale-105 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-blue-700 dark:hover:bg-blue-800"
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Reenviar email de verificación
                    </Button>

                    <button
                        type="button"
                        className="text-sm text-blue-500 hover:underline dark:text-gray-100"
                        onClick={async () => {
                            router.post(
                                route('logout'),
                                {},
                                {
                                    onSuccess: async () => {
                                        await refreshCsrfToken();
                                    },
                                },
                            );
                        }}
                    >
                        Cerrar sesión
                    </button>
                </form>
            </div>
            <ThemeSwitcher />
        </div>
    );
}
