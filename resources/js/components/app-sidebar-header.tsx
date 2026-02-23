import { SidebarTrigger } from '@/components/ui/sidebar';
export function AppSidebarHeader() {
    // Ejemplo de novedades importantes. Puedes modificar este array o traerlo del DashboardController si lo deseas.
    const news = [
        '¡Nueva función! Ahora puedes filtrar mascotas por edad y tamaño.',
        'Recuerda completar tu perfil para mejorar tu experiencia.',
        'Próximo mantenimiento: 20 de noviembre, 2:00 AM - 4:00 AM.',
        '¿Tienes dudas? Consulta nuestro nuevo chatbot de ayuda.',
    ];

    return (
        <header className="flex h-10 shrink-0 items-center border-b border-sidebar-border/50 bg-gradient-to-r from-green-500 to-blue-600 px-0 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-8 md:px-0 dark:from-green-700 dark:to-blue-800">
            <div
                className="relative flex h-full flex-1 cursor-pointer items-center overflow-hidden rounded-none bg-white/80 px-0 text-sm font-medium text-primary select-none dark:bg-black/30"
                style={{ minWidth: 0 }}
            >
                <SidebarTrigger className="z-10 mr-2 ml-2" />
                <div
                    className="animate-marquee w-full whitespace-nowrap hover:[animation-play-state:paused]"
                    style={{
                        display: 'inline-block',
                        minWidth: '100%',
                        animation: 'marquee 18s linear infinite',
                    }}
                >
                    {news.map((item, idx) => (
                        <span key={idx} className="mx-2 inline-block">
                            {item}
                            {idx < news.length - 1 && <span className="mx-32 font-bold text-purple-400 select-none">|</span>}
                        </span>
                    ))}
                </div>
                {/* Animación marquee CSS */}
                <style>{`
                    @keyframes marquee {
                        0% { transform: translateX(100%); }
                        100% { transform: translateX(-100%); }
                    }
                `}</style>
            </div>
        </header>
    );
}
