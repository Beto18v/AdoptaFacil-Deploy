import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

import { ThemeSwitcher } from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Eye, EyeOff, Key, Lock, Shield } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configuración de contraseña',
        href: '/settings/password',
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    // Estados para controlar la visibilidad de las contraseñas
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración de Contraseña" />

            <SettingsLayout>
                <div className="space-y-8">
                    {/* Header de sección con estilo distintivo */}
                    <div className="relative">
                        <div className="mb-6 flex items-center gap-4">
                            <div className="rounded-2xl border border-red-300/50 bg-gradient-to-br from-red-100 via-orange-100 to-amber-100 p-3 dark:border-red-500/40 dark:from-red-700/30 dark:via-orange-700/20 dark:to-amber-700/20">
                                <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Actualizar contraseña</h2>
                                <p className="text-slate-600 dark:text-slate-300">
                                    Asegúrate de usar una contraseña larga y segura para proteger tu cuenta
                                </p>
                            </div>
                        </div>

                        {/* Línea decorativa */}
                        <div className="through-orange-300/60 dark:through-orange-400/40 mb-6 h-px bg-gradient-to-r from-transparent via-red-300/60 to-amber-300/60 dark:via-red-400/40 dark:to-amber-400/40"></div>
                    </div>

                    <form onSubmit={updatePassword} className="space-y-8">
                        {/* Contraseña actual */}
                        {/* Contraseña actual */}
                        <div className="rounded-2xl border border-slate-300/50 bg-gradient-to-br from-slate-50 via-amber-50/60 to-orange-50/60 p-6 dark:border-slate-600/50 dark:from-slate-700/40 dark:via-amber-800/20 dark:to-orange-800/20">
                            <div className="mb-4 flex items-center gap-2">
                                <Key className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                <Label htmlFor="current_password" className="text-base font-semibold text-slate-700 dark:text-slate-200">
                                    Contraseña actual
                                </Label>
                            </div>

                            <div className="relative">
                                <Input
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    className={`h-12 border-slate-400/50 bg-white/80 pr-12 text-base text-slate-800 placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500/20 dark:border-slate-500/50 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-amber-400 dark:focus:ring-amber-400/20 ${errors.current_password ? 'border-red-500 focus:border-red-500' : ''}`}
                                    autoComplete="current-password"
                                    placeholder="Ingresa tu contraseña actual"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                    {showCurrentPassword ? (
                                        <EyeOff className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                                    )}
                                </button>
                            </div>

                            <InputError className="mt-3" message={errors.current_password} />
                        </div>

                        {/* Nueva contraseña */}
                        <div className="rounded-2xl border border-slate-300/50 bg-gradient-to-br from-slate-50 via-green-50/60 to-blue-50/60 p-6 dark:border-slate-600/50 dark:from-slate-700/40 dark:via-green-800/20 dark:to-blue-800/20">
                            <div className="mb-4 flex items-center gap-2">
                                <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
                                <Label htmlFor="password" className="text-base font-semibold text-slate-700 dark:text-slate-200">
                                    Nueva contraseña
                                </Label>
                            </div>

                            <div className="relative">
                                <Input
                                    id="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    type={showPassword ? 'text' : 'password'}
                                    className={`h-12 border-slate-400/50 bg-white/80 pr-12 text-base text-slate-800 placeholder:text-slate-500 focus:border-green-500 focus:ring-green-500/20 dark:border-slate-500/50 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-green-400 dark:focus:ring-green-400/20 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                                    autoComplete="new-password"
                                    placeholder="Nueva contraseña (Mín. 8 caracteres)"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                                    )}
                                </button>
                            </div>

                            <InputError className="mt-3" message={errors.password} />
                        </div>

                        {/* Confirmar contraseña */}
                        <div className="rounded-2xl border border-slate-300/50 bg-gradient-to-br from-slate-50 via-blue-50/60 to-purple-50/60 p-6 dark:border-slate-600/50 dark:from-slate-700/40 dark:via-blue-800/20 dark:to-purple-800/20">
                            <div className="mb-4 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <Label htmlFor="password_confirmation" className="text-base font-semibold text-slate-700 dark:text-slate-200">
                                    Confirmar nueva contraseña
                                </Label>
                            </div>

                            <div className="relative">
                                <Input
                                    id="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    type={showPasswordConfirmation ? 'text' : 'password'}
                                    className={`h-12 border-slate-400/50 bg-white/80 pr-12 text-base text-slate-800 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 dark:border-slate-500/50 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 ${errors.password_confirmation ? 'border-red-500 focus:border-red-500' : ''}`}
                                    autoComplete="new-password"
                                    placeholder="Confirma tu nueva contraseña"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                    {showPasswordConfirmation ? (
                                        <EyeOff className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                                    )}
                                </button>
                            </div>

                            <InputError className="mt-3" message={errors.password_confirmation} />
                        </div>

                        {/* Consejos de seguridad */}
                        <div className="rounded-2xl border border-purple-300/50 bg-gradient-to-br from-purple-100/80 via-indigo-100/60 to-blue-100/60 p-6 dark:border-purple-600/50 dark:from-purple-900/40 dark:via-indigo-800/30 dark:to-blue-800/30">
                            <div className="flex items-start gap-3">
                                <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                                <div>
                                    <h3 className="mb-2 font-semibold text-purple-800 dark:text-purple-300">Consejos para una contraseña segura:</h3>
                                    <ul className="space-y-1 text-sm leading-relaxed text-purple-700 dark:text-purple-200">
                                        <li>• Usa al menos 8 caracteres</li>
                                        <li>• Combina letras mayúsculas y minúsculas</li>
                                        <li>• Incluye números y símbolos especiales</li>
                                        <li>• Evita información personal obvia</li>
                                        <li>• No reutilices contraseñas de otras cuentas</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Botón de actualizar con diseño distintivo */}
                        <div className="flex items-center gap-6 pt-4">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="h-12 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 px-8 font-semibold text-white shadow-lg transition-all duration-300 hover:from-red-700 hover:via-orange-600 hover:to-amber-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 dark:from-red-700 dark:via-orange-600 dark:to-amber-600 dark:hover:from-red-800 dark:hover:via-orange-700 dark:hover:to-amber-700"
                            >
                                {processing ? 'Actualizando...' : 'Actualizar contraseña'}
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition-all ease-in-out duration-300"
                                enterFrom="opacity-0 translate-y-1"
                                enterTo="opacity-100 translate-y-0"
                                leave="transition-all ease-in-out duration-300"
                                leaveTo="opacity-0 translate-y-1"
                            >
                                <div className="flex items-center gap-2 rounded-xl border border-green-400/50 bg-gradient-to-r from-green-200/80 to-emerald-200/60 p-3 dark:border-green-600/50 dark:from-green-900/60 dark:to-emerald-900/50">
                                    <CheckCircle className="h-5 w-5 text-green-700 dark:text-green-400" />
                                    <span className="text-sm font-medium text-green-800 dark:text-green-300">
                                        Contraseña actualizada correctamente
                                    </span>
                                </div>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
            <ThemeSwitcher />
        </AppLayout>
    );
}
