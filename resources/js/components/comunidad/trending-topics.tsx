// resources/js/components/comunidad/trending-topics.tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';
import { useEffect, useState } from 'react';

const trophyEmojis = ['🥇', '🥈', '🥉', '🏅', '🎖️'];

type Ally = {
    id: number;
    name: string;
    avatarUrl: string;
    mascotas: number;
    link: string;
};

export default function TrendingTopics() {
    const [allies, setAllies] = useState<Ally[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/top-shelters')
            .then((res) => res.json())
            .then((data) => {
                setAllies(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="sticky top-24 space-y-8">
            {/* Aliados Destacados */}
            <div className="rounded-xl border-2 border-orange-400 bg-white p-6 shadow-lg dark:border-orange-500 dark:bg-gray-900">
                <h3 className="mb-4 flex items-center text-lg font-bold text-gray-900 dark:text-white">
                    <Flame className="mr-2 h-5 w-5 text-red-600 dark:text-red-400" />
                    Aliados Destacados
                </h3>
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center text-gray-500">Cargando...</div>
                    ) : allies.length === 0 ? (
                        <div className="text-center text-gray-500">No hay aliados destacados.</div>
                    ) : (
                        allies.map((ally, idx) => (
                            <div key={ally.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl" title={`Puesto ${idx + 1}`}>
                                        {trophyEmojis[idx]}
                                    </span>
                                    <Avatar className="h-10 w-10 border-2 border-green-300 dark:border-yellow-600">
                                        <AvatarImage src={ally.avatarUrl} alt={ally.name} />
                                        <AvatarFallback>{ally.name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{ally.name}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{ally.mascotas} mascotas</span>
                                    </div>
                                </div>
                                <Button
                                    className="border-blue-500 text-blue-600 transition-all duration-300 hover:scale-105 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                    variant="outline"
                                    size="sm"
                                    asChild
                                >
                                    <a href={ally.link}>Ver</a>
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
