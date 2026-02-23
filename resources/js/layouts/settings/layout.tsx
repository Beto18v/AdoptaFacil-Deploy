import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Lock, Settings, Shield, User } from 'lucide-react';
import { type PropsWithChildren } from 'react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Perfil',
        href: '/settings/profile',
        icon: User,
    },
    {
        title: 'Contraseña',
        href: '/settings/password',
        icon: Lock,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-blue-950 dark:to-green-950">
            {/* Efectos decorativos sutiles de fondo */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-1/4 h-32 w-32 rounded-full bg-gradient-to-br from-green-300/20 to-transparent blur-2xl dark:from-green-500/15"></div>
                <div className="absolute right-1/4 bottom-20 h-40 w-40 rounded-full bg-gradient-to-br from-blue-300/20 to-transparent blur-3xl dark:from-blue-500/15"></div>
                <div className="absolute top-1/2 right-1/3 h-24 w-24 rounded-full bg-gradient-to-br from-purple-300/15 to-transparent blur-xl dark:from-purple-500/10"></div>
                <div className="absolute bottom-1/3 left-1/3 h-28 w-28 rounded-full bg-gradient-to-br from-green-200/12 to-transparent blur-2xl dark:from-green-400/8"></div>
            </div>

            <div className="relative px-4 py-8 md:px-6">
                {/* Header con estilo distintivo */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-2xl bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 p-3 shadow-xl dark:from-green-700 dark:via-blue-700 dark:to-purple-700">
                            <Settings className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent dark:from-green-400 dark:via-blue-400 dark:to-purple-400">
                                Configuración
                            </h1>
                            <p className="font-medium text-slate-600 dark:text-slate-300">Administra tu perfil y la configuración de tu cuenta</p>
                        </div>
                    </div>

                    {/* Línea decorativa elegante */}
                    <div className="through-blue-300/60 dark:through-blue-400/30 h-px bg-gradient-to-r from-transparent via-green-300/60 to-purple-300/60 dark:via-green-400/30 dark:to-purple-400/30"></div>
                </div>

                <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
                    {/* Sidebar con estilo mejorado */}
                    <aside className="w-full max-w-xl lg:w-64">
                        <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-2xl backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/60">
                            <div className="mb-4 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                                <h3 className="font-semibold text-slate-700 dark:text-slate-200">Navegación</h3>
                            </div>
                            <nav className="flex flex-col space-y-2">
                                {sidebarNavItems.map((item, index) => {
                                    const Icon = item.icon;
                                    const isActive = currentPath === item.href;

                                    return (
                                        <Button
                                            key={`${item.href}-${index}`}
                                            size="default"
                                            variant="ghost"
                                            asChild
                                            className={cn(
                                                'h-auto w-full justify-start gap-3 rounded-xl px-4 py-3 transition-all duration-300',
                                                isActive
                                                    ? 'border border-green-300/50 bg-gradient-to-r from-green-100/80 via-blue-100/80 to-purple-100/80 text-green-700 shadow-lg dark:border-green-500/30 dark:from-green-600/25 dark:via-blue-600/25 dark:to-purple-600/25 dark:text-green-300'
                                                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-700 hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-700/50 dark:hover:text-slate-200',
                                            )}
                                        >
                                            <Link href={item.href} prefetch className="flex items-center gap-3">
                                                {Icon && (
                                                    <Icon
                                                        className={cn(
                                                            'h-5 w-5 transition-colors',
                                                            isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400',
                                                        )}
                                                    />
                                                )}
                                                <span className="font-medium">{item.title}</span>
                                            </Link>
                                        </Button>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>

                    <Separator className="through-blue-300/60 dark:through-blue-400/30 my-6 bg-gradient-to-r from-transparent via-green-300/60 to-purple-300/60 md:hidden dark:via-green-400/30 dark:to-purple-400/30" />

                    {/* Contenido principal con estilo mejorado */}
                    <div className="max-w-3xl flex-1">
                        <div className="relative rounded-2xl border border-slate-200/60 bg-white/90 p-8 shadow-2xl backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/50">
                            {/* Efecto decorativo sutil en el contenedor */}
                            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-green-50/50 via-blue-50/50 to-purple-50/50 dark:from-green-500/5 dark:via-blue-500/5 dark:to-purple-500/5"></div>

                            <div className="relative">{children}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
