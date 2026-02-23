import { ArcElement, Chart as ChartJS, Legend, Title, Tooltip } from 'chart.js';
import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';

// Registrar los elementos necesarios para un gráfico de anillosChartJS.register(ArcElement, Tooltip, Legend, Title);
ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface SpeciesDonutChartProps {
    gatos: number;
    perros: number;
}

export function SpeciesDonutChart({ gatos, perros }: SpeciesDonutChartProps) {
    const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    const data = {
        labels: ['Gatos', 'Perros'],
        datasets: [
            {
                label: 'Cantidad',
                data: [gatos, perros],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.7)', // azul para gatos
                    'rgba(16, 185, 129, 0.7)', // verde para perros
                ],
                borderColor: ['rgba(59, 130, 246, 1)', 'rgba(16, 185, 129, 1)'],
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: isDarkMode ? '#e2e8f0' : '#1a202c',
                },
            },
            title: {
                display: true,
                color: isDarkMode ? '#e2e8f0' : '#1a202c',
                font: { size: 18 },
            },
        },
    };

    return <Doughnut data={data} options={options} />;
}
