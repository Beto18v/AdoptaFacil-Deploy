import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { BadgeDollarSign, BellRing, BookHeart, ChartSpline, LayoutGrid, MapPinned, Store, Users } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    // Plantilla Única con TODOS los elementos de navegación
    const baseNavItems: NavItem[] = [
        {
            title: 'Menú',
            href: '/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Mapa',
            href: '/mapa',
            icon: MapPinned,
        },
        {
            title: 'Favoritos',
            href: '/favoritos',
            icon: BookHeart,
        },
        {
            title: 'Solicitudes',
            href: '/solicitudes',
            icon: BellRing,
        },
        {
            title: 'Estadísticas',
            href: '/estadisticas',
            icon: ChartSpline,
        },
        {
            title: 'Donaciones',
            href: '/donaciones',
            icon: BadgeDollarSign,
        },
        {
            title: 'Gestión de Usuarios',
            href: '/gestion-usuarios',
            icon: Users,
        },
        {
            title: 'Productos y Mascotas',
            href: route('productos.mascotas'),
            icon: Store,
        },
    ];

    // Lógica de filtrado centralizada
    let finalNavItems: NavItem[] = [];

    if (user.role === 'cliente') {
        // Rutas que SÍ debe ver el cliente (SIN productos y mascotas, SIN estadísticas, SIN gestión de usuarios)
        const allowedHrefs = ['/dashboard', '/favoritos', '/mapa', '/donaciones', '/solicitudes'];
        finalNavItems = baseNavItems.filter((item) => allowedHrefs.includes(item.href as string));
    } else if (user.role === 'aliado') {
        // Rutas que SÍ debe ver el aliado (SIN estadísticas, SIN gestión de usuarios)
        const allowedHrefs = ['/dashboard', '/favoritos', '/solicitudes', '/mapa', '/donaciones', route('productos.mascotas')];
        finalNavItems = baseNavItems.filter((item) => allowedHrefs.includes(item.href as string));
    } else {
        // Lógica para otros roles (El admin ve todo)
        finalNavItems = baseNavItems;
    }

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className={`border-0 bg-gradient-to-br from-white/95 via-blue-50/20 to-green-50/20 shadow-2xl shadow-blue-500/10 backdrop-blur-xl group-data-[collapsible=icon]:bg-gradient-to-b group-data-[collapsible=icon]:from-white/95 group-data-[collapsible=icon]:to-blue-50/30 dark:from-gray-950/95 dark:via-blue-950/20 dark:to-green-950/20 dark:shadow-blue-900/30 dark:group-data-[collapsible=icon]:from-gray-950/95 dark:group-data-[collapsible=icon]:to-blue-950/30`}
        >
            {/* Header adaptable al estado */}
            <SidebarHeader className="p-3 pb-2 group-data-[collapsible=icon]:p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className={`justify-center rounded-2xl border border-white/30 bg-gradient-to-br from-white/80 to-white/40 p-2 shadow-lg shadow-blue-500/15 backdrop-blur-sm transition-all duration-300 group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:p-1 hover:scale-105 hover:from-white/90 hover:to-white/60 hover:shadow-xl dark:border-gray-700/30 dark:from-gray-800/80 dark:to-gray-800/40 dark:shadow-blue-900/25 dark:hover:from-gray-700/90 dark:hover:to-gray-700/60`}
                            asChild
                        >
                            <AppLogo />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Content adaptable */}
            <SidebarContent className="flex-1 overflow-y-auto px-2 py-1 group-data-[collapsible=icon]:px-1">
                <NavMain items={finalNavItems} />
            </SidebarContent>

            {/* Footer adaptable */}
            <SidebarFooter className="mt-2 p-2 group-data-[collapsible=icon]:mt-1 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:py-2">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
