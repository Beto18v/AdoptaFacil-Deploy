import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { useToastMessage } from '@/lib/toast';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { flash } = usePage<{
        flash?: {
            error?: string;
            info?: string;
            success?: string;
            warning?: string;
        };
    }>().props;

    useToastMessage(flash?.success, 'success');
    useToastMessage(flash?.error, 'error');
    useToastMessage(flash?.warning, 'warning');
    useToastMessage(flash?.info, 'info');

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden dark:bg-gray-800">
                <AppSidebarHeader />
                {children}
            </AppContent>
        </AppShell>
    );
}
