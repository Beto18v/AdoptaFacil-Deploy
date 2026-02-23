interface StatCardProps {
    title: string;
    value: string;
    icon: string;
    color: 'blue' | 'green' | 'purple' | 'orange';
    change: string;
}

export function StatCard({ title, value, icon, color, change }: StatCardProps) {
    const getColorClasses = (color: string) => {
        const colorMap = {
            blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
            green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
            purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
            orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300',
        };
        return colorMap[color as keyof typeof colorMap] || colorMap.blue;
    };

    const isPositive = change && change.startsWith('+');

    return (
        <div className="card rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="hidden text-lg font-medium text-gray-700 md:block dark:text-white">{title}</h3>
                <div className={`rounded-full p-3 ${getColorClasses(color)}`}>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
                    </svg>
                </div>
            </div>
            <div className="flex items-baseline">
                <span className="text-2xl font-bold text-gray-800 dark:text-white">{value}</span>
                {change && (
                    <span
                        className={`ml-2 text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                    >
                        {change}
                    </span>
                )}
            </div>
        </div>
    );
}
