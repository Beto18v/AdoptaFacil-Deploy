interface Activity {
    id: number;
    tipo: string;
    mascota: string;
    usuario: string;
    estado: string;
    fecha: string;
}

interface RecentTableProps {
    activities: Activity[];
}

export function RecentTable({ activities = [] }: RecentTableProps) {
    const getStatusBadge = (estado: string) => {
        const statusClasses = {
            aprobada: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            rechazada: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        };
        return statusClasses[estado as keyof typeof statusClasses] || statusClasses.pendiente;
    };

    const getTypeIcon = (tipo: string) => {
        const icons = {
            'Solicitud de adopción': (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                </svg>
            ),
        };
        return (
            icons[tipo as keyof typeof icons] || (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                </svg>
            )
        );
    };

    if (activities.length === 0) {
        return (
            <div className="py-8 text-center">
                <div className="text-gray-500 dark:text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                    </svg>
                    <p className="text-lg font-medium">No hay actividades recientes</p>
                    <p className="text-sm">Las actividades aparecerán aquí cuando se registren</p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                            Tipo
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                            Mascota
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                            Usuario
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                            Estado
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                            Fecha
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {activities.map((activity) => (
                        <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    {getTypeIcon(activity.tipo)}
                                    <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{activity.tipo}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.mascota}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-gray-100">{activity.usuario}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                    className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold capitalize ${getStatusBadge(activity.estado)}`}
                                >
                                    {activity.estado}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500 dark:text-gray-400">{activity.fecha}</div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
