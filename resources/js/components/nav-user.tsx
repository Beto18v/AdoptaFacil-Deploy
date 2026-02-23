import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';

export function NavUser() {
    const { auth } = usePage<SharedData>().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className={`group mx-1 h-auto transform rounded-xl border border-white/30 bg-white/70 shadow-lg shadow-blue-500/15 backdrop-blur-sm transition-all duration-300 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2 hover:scale-[1.01] hover:bg-white/90 hover:shadow-xl data-[state=open]:scale-[1.01] data-[state=open]:bg-gradient-to-r data-[state=open]:from-blue-500 data-[state=open]:to-green-500 data-[state=open]:text-white data-[state=open]:shadow-xl data-[state=open]:shadow-blue-500/30 dark:border-gray-700/30 dark:bg-gray-800/70 dark:hover:bg-gray-700/90 dark:data-[state=open]:from-blue-600 dark:data-[state=open]:to-green-600 dark:data-[state=open]:shadow-blue-600/20`}
                        >
                            <div className="w-full group-data-[collapsible=icon]:hidden">
                                <UserInfo user={auth.user} showEmail={true} showRole={true} />
                            </div>
                            {/* Avatar solo para modo colapsado */}
                            <div className="hidden w-full items-center justify-center group-data-[collapsible=icon]:flex">
                                <div
                                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                        auth.user.role === 'cliente'
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                            : auth.user.role === 'aliado'
                                              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                              : auth.user.role === 'admin'
                                                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                                                : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                                    } `}
                                >
                                    {auth.user.name.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <ChevronsUpDown
                                className={`ml-auto size-4 flex-shrink-0 text-gray-500 transition-all duration-300 group-hover:text-blue-600 group-data-[collapsible=icon]:hidden group-data-[state=open]:rotate-180 group-data-[state=open]:text-white dark:text-gray-400 dark:group-hover:text-blue-400`}
                            />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className={`w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-2xl border-0 bg-white/95 shadow-xl ring-1 shadow-blue-500/20 ring-blue-200/30 backdrop-blur-xl dark:border-blue-800/30 dark:bg-gray-900/95 dark:shadow-blue-900/30`}
                        align="end"
                        side={isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'}
                    >
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
