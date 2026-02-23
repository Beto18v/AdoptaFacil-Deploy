import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAppearance } from '@/hooks/use-appearance';
import { Monitor, Moon, Paintbrush, Sun } from 'lucide-react';

interface ThemeSwitcherProps {
    hasChatbot?: boolean;
}

export function ThemeSwitcher({ hasChatbot = false }: ThemeSwitcherProps) {
    // Se desestructura updateAppearance en lugar de setTheme
    const { updateAppearance } = useAppearance();

    return (
        <div className={`fixed bottom-6 z-50 ${hasChatbot ? 'right-23' : 'right-6'}`}>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-14 w-14 rounded-full border-2 border-white/50 bg-gradient-to-br from-gray-200 to-gray-300 shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl dark:border-gray-600/50 dark:from-gray-700 dark:to-gray-800"
                    >
                        <Paintbrush className="h-6 w-6 text-gray-700 transition-all duration-300 hover:rotate-12 dark:text-gray-300" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-48 rounded-xl border border-gray-200/50 bg-white/95 p-2 shadow-2xl backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-800/95"
                >
                    {/* Corregido: Se llama a updateAppearance en los eventos onClick */}
                    <DropdownMenuItem
                        onClick={() => updateAppearance('light')}
                        className="cursor-pointer rounded-lg px-4 py-3 transition-all hover:bg-yellow-100 dark:hover:bg-yellow-900/50"
                    >
                        <Sun className="mr-3 h-5 w-5 text-yellow-500" />
                        <span className="font-medium">Claro</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => updateAppearance('dark')}
                        className="cursor-pointer rounded-lg px-4 py-3 transition-all hover:bg-blue-100 dark:hover:bg-blue-900/50"
                    >
                        <Moon className="mr-3 h-5 w-5 text-blue-500" />
                        <span className="font-medium">Oscuro</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => updateAppearance('system')}
                        className="cursor-pointer rounded-lg px-4 py-3 transition-all hover:bg-green-100 dark:hover:bg-green-900/50"
                    >
                        <Monitor className="mr-3 h-5 w-5 text-green-500" />
                        <span className="font-medium">Sistema</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
