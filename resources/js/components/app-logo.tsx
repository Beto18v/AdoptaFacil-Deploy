import { useSidebar } from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import { Home } from 'lucide-react';
import Logo from '../../../public/Logo/Logo.png';
import LogoWhite from '../../../public/Logo/LogoWhite.png';

export default function AppLogo() {
    const { state } = useSidebar();

    return (
        <Link href={route('index')} className="flex w-full transform items-center justify-center transition-all duration-300 hover:scale-105">
            {state === 'collapsed' ? (
                // Ícono cuando está colapsado - más grande y mejor centrado
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-green-600 shadow-xl shadow-blue-500/40 dark:from-blue-400 dark:to-green-400 dark:shadow-blue-600/30">
                    <Home className="h-5 w-5 text-white drop-shadow-md" />
                </div>
            ) : (
                // Logo completo cuando está expandido - más compacto
                <div className="flex items-center justify-center px-1">
                    <img
                        src={Logo}
                        alt="AdoptaFácil"
                        className="block h-12 w-auto max-w-[140px] brightness-110 drop-shadow-xl filter transition-all duration-300 dark:hidden"
                    />
                    <img
                        src={LogoWhite}
                        alt="AdoptaFácil"
                        className="hidden h-12 w-auto max-w-[140px] brightness-110 drop-shadow-xl filter transition-all duration-300 dark:block"
                    />
                </div>
            )}
        </Link>
    );
}
