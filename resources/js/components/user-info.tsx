import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { getAvatarUrl } from '@/lib/avatar-utils';
import { type User } from '@/types';

// Mapeo de roles a los nombres deseados
const roleDisplayNames = {
    cliente: 'Amigo',
    aliado: 'Aliado',
    admin: 'Admin',
};

export function UserInfo({ user, showEmail = false, showRole = false }: { user: User; showEmail?: boolean; showRole?: boolean }) {
    const getInitials = useInitials();

    // Colores del rol según la paleta AdoptaFácil
    const getRoleColors = (role: string) => {
        switch (role) {
            case 'cliente':
                return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
            case 'aliado':
                return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
            case 'admin':
                return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
            default:
                return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
        }
    };

    return (
        <>
            <Avatar className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full shadow-md ring-2 ring-white/20 dark:ring-blue-500/20">
                <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name} />
                <AvatarFallback className={`rounded-full text-sm font-semibold ${getRoleColors(user.role)} shadow-lg`}>
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 flex-1 text-left leading-tight">
                <span className="truncate text-sm font-semibold text-gray-800 dark:text-white">{user.name}</span>

                {/* Mostrar email si se solicita */}
                {showEmail && user.email && <span className="truncate text-xs font-medium text-gray-600 dark:text-gray-400">{user.email}</span>}

                {/* Mostrar rol si se solicita */}
                {showRole && user.role && (
                    <div className="mt-1 flex items-center justify-start">
                        <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                user.role === 'cliente'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                    : user.role === 'aliado'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                      : user.role === 'admin'
                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                            } `}
                        >
                            {roleDisplayNames[user.role] || user.role}
                        </span>
                    </div>
                )}
            </div>
        </>
    );
}
