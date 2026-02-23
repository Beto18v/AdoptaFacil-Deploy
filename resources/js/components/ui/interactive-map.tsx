import L from 'leaflet';
import { useEffect, useRef } from 'react';

// Fix para los iconos de Leaflet en Webpack
delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Location {
    id: string;
    city: string;
    name?: string;
    count: number;
    shelters?: number;
    lat: number;
    lng: number;
    address?: string;
}

interface InteractiveMapProps {
    locations: Location[];
    className?: string;
}

export function InteractiveMap({ locations, className = '' }: InteractiveMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Crear el mapa centrado en Colombia
        const map = L.map(mapRef.current).setView([4.5709, -74.2973], 6);

        // Agregar tiles de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
        }).addTo(map);

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!mapInstanceRef.current || !locations.length) return;

        const map = mapInstanceRef.current;

        // Limpiar marcadores existentes
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        // Crear marcadores personalizados con diseño mejorado
        locations.forEach((location) => {
            // Crear icono personalizado basado en el número de mascotas con colores de la paleta
            const iconSize = Math.max(35, Math.min(60, 25 + location.count * 0.8));

            // Determinar color del marcador basado en la cantidad de mascotas
            let gradientColors = '#3b82f6, #1d4ed8'; // azul por defecto
            if (location.count > 50) {
                gradientColors = '#9333ea, #7c3aed'; // púrpura para muchas mascotas
            } else if (location.count > 20) {
                gradientColors = '#10b981, #059669'; // verde para cantidad media
            }

            const customIcon = L.divIcon({
                html: `
                    <div class="marker-content" style="
                        background: linear-gradient(135deg, ${gradientColors});
                        color: white;
                        border-radius: 50%;
                        width: ${iconSize}px;
                        height: ${iconSize}px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 900;
                        font-size: ${Math.max(12, iconSize * 0.35)}px;
                        border: 3px solid rgba(255,255,255,0.95);
                        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
                        opacity: 1;
                        z-index: 100;
                    ">
                        ${location.count}
                    </div>
                `,
                className: 'custom-marker',
                iconSize: [iconSize, iconSize],
                iconAnchor: [iconSize / 2, iconSize / 2],
            });

            // Crear marcador
            const marker = L.marker([location.lat, location.lng], { icon: customIcon }).addTo(map);

            // Popup con información mejorado y modo oscuro
            const popupContent = `
                <div class="popup-container p-4 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg border border-blue-100 dark:border-gray-600">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full flex items-center justify-center shadow-md">
                            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                        </div>
                        <div>
                            <h3 class="font-bold text-xl text-gray-800 dark:text-white leading-tight">${location.city}</h3>
                            <p class="text-xs text-blue-600 dark:text-blue-400 font-medium">Ciudad disponible</p>
                        </div>
                    </div>
                    
                    <div class="space-y-2">
                        <div class="flex items-center justify-between p-2 bg-blue-100/50 dark:bg-blue-900/30 rounded-lg">
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">🐾 Mascotas</span>
                            <span class="text-lg font-bold text-blue-600 dark:text-blue-400">${location.count}</span>
                        </div>
                        
                        ${
                            location.shelters
                                ? `
                            <div class="flex items-center justify-between p-2 bg-green-100/50 dark:bg-green-900/30 rounded-lg">
                                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">🏠 Refugios</span>
                                <span class="text-lg font-bold text-green-600 dark:text-green-400">${location.shelters}</span>
                            </div>
                        `
                                : ''
                        }
                    </div>
                    
                    <div class="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <button 
                            onclick="window.location.href='/refugios?ciudad=${encodeURIComponent(location.city)}'" 
                            class="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                        >
                            🔍 Ver refugios en ${location.city}
                        </button>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);

            // Efecto hover
            marker.on('mouseover', function (this: L.Marker) {
                this.openPopup();
            });
        });

        // Ajustar vista para mostrar todos los marcadores
        if (locations.length > 0) {
            const group = new L.FeatureGroup(locations.map((loc) => L.marker([loc.lat, loc.lng])));
            map.fitBounds(group.getBounds().pad(0.1));
        }
    }, [locations]);

    return (
        <div
            ref={mapRef}
            className={`h-96 w-full overflow-hidden rounded-2xl shadow-2xl ${className}`}
            style={{
                minHeight: '500px',
                border: '3px solid rgba(59, 130, 246, 0.1)',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(16, 185, 129, 0.05))',
                zIndex: 1,
            }}
        />
    );
}
