import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { AlertCircle, Camera, CheckCircle, Mail, User, X } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configuración de perfil',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    email: string;
    avatar?: File | null;
};

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(auth.user.avatar ? `/storage/${auth.user.avatar}` : null);
    const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
    const [manualSuccess, setManualSuccess] = useState<boolean>(false);

    const { data, setData, errors, processing, recentlySuccessful, setError } = useForm<ProfileForm>({
        name: auth.user.name || '',
        email: auth.user.email || '',
        avatar: null,
    });

    // Detectar si hubo un cambio exitoso usando el status de Laravel y estado manual
    const wasSuccessful = recentlySuccessful || status === 'profile-updated' || manualSuccess;

    // Mostrar mensaje de éxito y ocultarlo después de 3 segundos
    useEffect(() => {
        if (wasSuccessful) {
            setShowSuccessMessage(true);
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000); // 3 segundos

            return () => clearTimeout(timer);
        } else {
            setShowSuccessMessage(false);
        }
    }, [wasSuccessful]);

    // Actualizar previewUrl cuando cambie el avatar del usuario (después de actualización)
    useEffect(() => {
        if (auth.user.avatar) {
            setPreviewUrl(`/storage/${auth.user.avatar}`);
        } else {
            setPreviewUrl(null);
        }
    }, [auth.user.avatar]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecciona un archivo de imagen válido.');
                return;
            }

            // Validar tamaño (máximo 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('El archivo es demasiado grande. El tamaño máximo es 2MB.');
                return;
            }

            setData('avatar', file);

            // Crear URL de preview
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleRemoveAvatar = () => {
        // Si hay un preview temporal, solo limpiarlo
        if (data.avatar) {
            setData('avatar', null);
            setPreviewUrl(auth.user.avatar ? `/storage/${auth.user.avatar}` : null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        // Si el usuario tenía un avatar guardado, enviar la actualización para eliminarlo
        if (auth.user.avatar) {
            router.post(
                route('profile.update'),
                {
                    name: data.name,
                    email: data.email,
                    avatar: null,
                    _method: 'PATCH',
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Activar el estado manual de éxito
                        setManualSuccess(true);
                        setTimeout(() => setManualSuccess(false), 500);
                    },
                    onError: () => {
                        // Activar el estado manual de éxito
                        setManualSuccess(false);
                        setShowSuccessMessage(false);
                    },
                },
            );
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (data.avatar) {
            // Cuando hay avatar, usar router.post con FormData
            router.post(
                route('profile.update'),
                {
                    name: data.name,
                    email: data.email,
                    avatar: data.avatar,
                    _method: 'PATCH',
                },
                {
                    preserveScroll: true,
                    forceFormData: true,
                    onSuccess: () => {
                        // Resetear solo el campo avatar del formulario
                        setData('avatar', null);

                        // Limpiar el input file
                        if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                        }

                        // Activar el estado manual de éxito
                        setManualSuccess(true);
                        setTimeout(() => setManualSuccess(false), 500);
                    },
                    onError: (errors) => {
                        // Sincronizar errores con el hook useForm
                        Object.keys(errors).forEach((key) => {
                            setError(key as keyof ProfileForm, errors[key] as string);
                        });
                        setManualSuccess(false);
                        setShowSuccessMessage(false);
                    },
                },
            );
        } else {
            // Sin avatar, usar router.post pero con datos específicos para mejor manejo de errores
            router.post(
                route('profile.update'),
                {
                    name: data.name,
                    email: data.email,
                    _method: 'PATCH',
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Activar el estado manual de éxito
                        setManualSuccess(true);
                        setTimeout(() => setManualSuccess(false), 500);
                    },
                    onError: (errors) => {
                        // Sincronizar errores con el hook useForm
                        Object.keys(errors).forEach((key) => {
                            setError(key as keyof ProfileForm, errors[key] as string);
                        });
                        setManualSuccess(false);
                        setShowSuccessMessage(false);
                    },
                },
            );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-8">
                    {/* Header de sección con estilo distintivo */}
                    <div className="relative">
                        <div className="mb-6 flex items-center gap-4">
                            <div className="rounded-2xl border border-green-300/50 bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 p-3 dark:border-green-500/30 dark:from-green-700/20 dark:via-blue-700/20 dark:to-purple-700/20">
                                <User className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Información de perfil</h2>
                                <p className="text-slate-600 dark:text-slate-300">Mantenga su información actualizada y segura</p>
                            </div>
                        </div>

                        {/* Línea decorativa */}
                        <div className="through-blue-300/60 dark:through-blue-400/40 mb-6 h-px bg-gradient-to-r from-transparent via-green-300/60 to-purple-300/60 dark:via-green-400/40 dark:to-purple-400/40"></div>
                    </div>

                    <form onSubmit={submit} className="space-y-8">
                        {/* Campo de foto de perfil con diseño mejorado */}
                        <div className="rounded-2xl border border-slate-300/50 bg-gradient-to-br from-slate-50 via-green-50/60 to-blue-50/60 p-6 dark:border-slate-600/50 dark:from-slate-700/40 dark:via-green-800/20 dark:to-blue-800/20">
                            <div className="mb-4 flex items-center gap-2">
                                <Camera className="h-5 w-5 text-green-600 dark:text-green-400" />
                                <Label className="text-base font-semibold text-slate-700 dark:text-slate-200">Foto de perfil</Label>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="group relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <Avatar className="h-24 w-24 ring-4 ring-green-300/50 transition-all duration-300 group-hover:scale-105 group-hover:brightness-75 dark:ring-green-400/30">
                                        <AvatarImage
                                            src={previewUrl || (auth.user.avatar ? `/storage/${auth.user.avatar}` : undefined)}
                                            alt={auth.user.name}
                                            className="h-full w-full object-cover"
                                        />
                                        <AvatarFallback className="bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 text-lg font-semibold text-white dark:from-green-600 dark:via-blue-600 dark:to-purple-600">
                                            {auth.user.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Overlay mejorado con gradiente */}
                                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-green-500/80 via-blue-500/80 to-purple-500/80 opacity-0 transition-all duration-300 group-hover:opacity-100 dark:from-green-600/80 dark:via-blue-600/80 dark:to-purple-600/80">
                                        <div className="text-center text-white">
                                            <Camera className="mx-auto mb-1 h-6 w-6" />
                                            <span className="text-sm font-medium">Cambiar</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="flex gap-3">
                                        {(previewUrl || auth.user.avatar) && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleRemoveAvatar}
                                                className="flex items-center gap-2 border-red-300/50 text-red-600 hover:border-red-400 hover:bg-red-50 hover:text-red-700 dark:border-red-500/50 dark:text-red-400 dark:hover:border-red-400 dark:hover:bg-red-900/20"
                                            >
                                                <X className="h-4 w-4" />
                                                Eliminar foto
                                            </Button>
                                        )}
                                    </div>

                                    <div className="rounded-xl border border-blue-300/40 bg-blue-100/60 p-4 dark:border-blue-600/30 dark:bg-blue-900/30">
                                        <p className="text-sm leading-relaxed text-blue-700 dark:text-blue-300">
                                            <span className="font-medium">Haz clic en la foto para cambiarla.</span>
                                            <br />
                                            Formatos: JPG, PNG o GIF • Tamaño máximo: 2MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                            <InputError className="mt-4" message={errors.avatar} />
                        </div>

                        {/* Campos de información con diseño mejorado */}
                        <div className="grid gap-6">
                            <div className="rounded-2xl border border-slate-300/50 bg-gradient-to-br from-slate-50 via-purple-50/60 to-blue-50/60 p-6 dark:border-slate-600/50 dark:from-slate-700/40 dark:via-purple-800/20 dark:to-blue-800/20">
                                <div className="mb-4 flex items-center gap-2">
                                    <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    <Label htmlFor="name" className="text-base font-semibold text-slate-700 dark:text-slate-200">
                                        Nombre completo
                                    </Label>
                                </div>

                                <Input
                                    id="name"
                                    className={`h-12 border-slate-400/50 bg-white/80 text-base text-slate-800 placeholder:text-slate-500 focus:border-green-500 focus:ring-green-500/20 dark:border-slate-500/50 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-green-400 dark:focus:ring-green-400/20 ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoComplete="name"
                                    placeholder="Ingresa tu nombre completo"
                                />

                                <InputError className="mt-3" message={errors.name} />
                            </div>

                            <div className="rounded-2xl border border-slate-300/50 bg-gradient-to-br from-slate-50 via-blue-50/60 to-green-50/60 p-6 dark:border-slate-600/50 dark:from-slate-700/40 dark:via-blue-800/20 dark:to-green-800/20">
                                <div className="mb-4 flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <Label htmlFor="email" className="text-base font-semibold text-slate-700 dark:text-slate-200">
                                        Correo electrónico
                                    </Label>
                                </div>

                                <Input
                                    id="email"
                                    type="email"
                                    className={`h-12 border-slate-400/50 bg-white/80 text-base text-slate-800 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 dark:border-slate-500/50 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoComplete="username"
                                    placeholder="tu@email.com"
                                />

                                <InputError className="mt-3" message={errors.email} />
                            </div>
                        </div>

                        {/* Verificación de email con diseño mejorado */}
                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div className="rounded-2xl border border-amber-300/50 bg-gradient-to-br from-amber-100/80 to-orange-100/60 p-6 dark:border-amber-600/50 dark:from-amber-900/40 dark:to-orange-800/30">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                                    <div>
                                        <p className="text-sm leading-relaxed text-amber-800 dark:text-amber-200">
                                            <span className="font-medium">Tu correo electrónico no está verificado.</span>{' '}
                                            <Link
                                                href={route('verification.send')}
                                                method="post"
                                                as="button"
                                                className="font-medium text-amber-700 underline decoration-amber-400 underline-offset-4 transition-colors duration-300 hover:decoration-current dark:text-amber-300 dark:decoration-amber-500"
                                            >
                                                Haz clic aquí para reenviar el correo electrónico de verificación.
                                            </Link>
                                        </p>

                                        {status === 'verification-link-sent' && (
                                            <div className="mt-3 rounded-lg border border-green-400/50 bg-green-200/60 p-3 dark:border-green-600/50 dark:bg-green-900/40">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4 text-green-700 dark:text-green-400" />
                                                    <span className="text-sm font-medium text-green-800 dark:text-green-300">
                                                        Se ha enviado un nuevo enlace de verificación a tu correo electrónico.
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Botón de guardar con diseño distintivo */}
                        <div className="flex items-center gap-6 pt-4">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="h-12 rounded-xl bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 px-8 font-semibold text-white shadow-lg transition-all duration-300 hover:from-green-600 hover:via-blue-600 hover:to-purple-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 dark:from-green-600 dark:via-blue-600 dark:to-purple-600 dark:hover:from-green-700 dark:hover:via-blue-700 dark:hover:to-purple-700"
                            >
                                {processing ? 'Guardando...' : 'Guardar cambios'}
                            </Button>

                            <Transition
                                show={showSuccessMessage}
                                enter="transition-all ease-in-out duration-300"
                                enterFrom="opacity-0 translate-y-1"
                                enterTo="opacity-100 translate-y-0"
                                leave="transition-all ease-in-out duration-300"
                                leaveTo="opacity-0 translate-y-1"
                            >
                                <div className="flex items-center gap-2 rounded-xl border border-green-400/50 bg-gradient-to-r from-green-200/80 to-emerald-200/60 p-3 dark:border-green-600/50 dark:from-green-900/60 dark:to-emerald-900/50">
                                    <CheckCircle className="h-5 w-5 text-green-700 dark:text-green-400" />
                                    <span className="text-sm font-medium text-green-800 dark:text-green-300">Cambios guardados correctamente</span>
                                </div>
                            </Transition>
                        </div>
                    </form>
                </div>

                {/* Componente de eliminación con espacio separado */}
                <div className="mt-12 border-t border-slate-300/50 pt-8 dark:border-slate-600/50">
                    <DeleteUser />
                </div>
            </SettingsLayout>
            <ThemeSwitcher />
        </AppLayout>
    );
}
