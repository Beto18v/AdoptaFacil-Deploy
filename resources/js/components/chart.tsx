import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';

// Registra los componentes necesarios
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface AdopcionMes {
    mes: string;
    adopciones: number;
}

interface ChartProps {
    data: AdopcionMes[];
}

export function Chart({ data = [] }: ChartProps) {
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

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: isDarkMode ? '#e2e8f0' : '#1a202c',
                },
            },
            title: {
                display: true,
                text: 'Adopciones por Mes',
                color: isDarkMode ? '#e2e8f0' : '#1a202c',
            },
        },
        scales: {
            y: {
                ticks: {
                    color: isDarkMode ? '#e2e8f0' : '#1a202c',
                },
                grid: {
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                },
            },
            x: {
                ticks: {
                    color: isDarkMode ? '#e2e8f0' : '#1a202c',
                },
                grid: {
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                },
            },
        },
    };

    // Usar datos reales si están disponibles, sino usar datos de ejemplo
    const labels = data.length > 0 ? data.map((item) => item.mes) : ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];
    const adopcionesData = data.length > 0 ? data.map((item) => item.adopciones) : [56, 55, 60, 70, 75, 80];

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Adopciones',
                data: adopcionesData,
                backgroundColor: 'rgba(37, 99, 235, 0.7)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    return <Bar options={options} data={chartData} />;
}
