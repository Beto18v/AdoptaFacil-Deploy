import { DropdownMenuGroup, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Link, router } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <div className="p-2">
            {/* Header del usuario más compacto */}
            <div className="mb-2 rounded-xl bg-white/50 p-3 backdrop-blur-sm dark:bg-gray-800/50">
                <UserInfo user={user} showEmail={true} showRole={true} />
            </div>

            {/* Menú de acciones compacto */}
            <DropdownMenuGroup className="space-y-1">
                <DropdownMenuItem
                    asChild
                    className={`transform cursor-pointer rounded-xl border border-white/30 bg-white/70 p-0 shadow-sm shadow-blue-500/10 backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:bg-gradient-to-r hover:from-blue-100 hover:to-green-100 hover:shadow-lg dark:border-gray-700/30 dark:bg-gray-800/70 dark:hover:from-blue-950/70 dark:hover:to-green-950/70`}
                >
                    <Link
                        className="flex w-full items-center rounded-xl px-3 py-2"
                        href={route('profile.edit')}
                        as="button"
                        prefetch
                        onClick={cleanup}
                    >
                        <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 shadow-sm">
                            <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ajustes</span>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>

            {/* Separación más pequeña */}
            <div className="h-1" />

            {/* Logout button compacto */}
            <DropdownMenuItem
                asChild
                className={`transform cursor-pointer rounded-xl border border-white/30 bg-white/70 p-0 shadow-sm shadow-red-500/10 backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:bg-gradient-to-r hover:from-red-100 hover:to-orange-100 hover:shadow-lg dark:border-gray-700/30 dark:bg-gray-800/70 dark:hover:from-red-950/70 dark:hover:to-orange-950/70`}
            >
                <Link
                    className="flex w-full items-center rounded-xl px-3 py-2"
                    method="post"
                    href={route('logout')}
                    as="button"
                    onClick={handleLogout}
                >
                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/20 shadow-sm">
                        <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cerrar sesión</span>
                </Link>
            </DropdownMenuItem>
        </div>
    );
}
