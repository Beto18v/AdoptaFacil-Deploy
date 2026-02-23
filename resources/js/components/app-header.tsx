import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/50 bg-gradient-to-r from-green-500 to-blue-600 p-6 px-6 transition-[width,height] ease-linear dark:from-green-700 dark:to-blue-800">
            <div className="flex items-center gap-2">
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
        </header>
    );
}
