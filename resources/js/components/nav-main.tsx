import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();

    // Función para verificar si la ruta está activa - más robusta
    const isActive = (itemHref: string) => {
        // Si itemHref es una función route(), la convertimos a string
        const href = typeof itemHref === 'string' ? itemHref : itemHref;

        // Para rutas generadas por route(), comparamos con URL completa
        if (href.includes('/productos-mascotas') || href.includes('productos.mascotas')) {
            return page.url.includes('/productos-mascotas') || page.url.includes('productos.mascotas');
        }

        return page.url.startsWith(href);
    };

    return (
        <SidebarGroup className="px-0 py-0">
            <SidebarMenu className="space-y-2">
                {items.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={active}
                                tooltip={{ children: item.title }}
                                className={`group mx-1 h-11 rounded-xl border-0 transition-all duration-300 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:p-0 ${
                                    active
                                        ? `transform bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-xl shadow-blue-500/30 hover:scale-[1.02] hover:shadow-blue-500/40 dark:from-blue-600 dark:to-green-600 dark:shadow-blue-600/20`
                                        : `transform border border-white/30 bg-white/60 shadow-md shadow-blue-500/10 backdrop-blur-sm hover:scale-[1.01] hover:bg-white/80 hover:shadow-lg hover:shadow-blue-500/15 dark:border-gray-700/30 dark:bg-gray-800/60 dark:hover:bg-gray-700/80`
                                } `}
                            >
                                <Link
                                    href={item.href}
                                    prefetch
                                    className="flex w-full items-center gap-3 px-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                                >
                                    {item.icon && (
                                        <div
                                            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6 ${
                                                active
                                                    ? 'bg-white/25 text-white shadow-md backdrop-blur-sm group-data-[collapsible=icon]:bg-transparent'
                                                    : 'bg-gradient-to-br from-blue-500/15 to-green-500/15 text-blue-600 shadow-sm group-data-[collapsible=icon]:bg-transparent dark:text-blue-400'
                                            } `}
                                        >
                                            <item.icon className="h-4 w-4 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
                                        </div>
                                    )}
                                    <span
                                        className={`truncate text-sm font-medium transition-all duration-300 group-data-[collapsible=icon]:hidden ${
                                            active ? 'text-white drop-shadow-sm' : 'text-gray-700 dark:text-gray-300'
                                        } `}
                                    >
                                        {item.title}
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
