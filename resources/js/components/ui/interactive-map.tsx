import L from 'leaflet';
import { useEffect, useRef } from 'react';

delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface ShelterDetail {
    id: string;
    name: string;
    address?: string | null;
}

interface Location {
    id: string;
    city: string;
    count: number;
    shelters?: number;
    lat: number;
    lng: number;
    address?: string | null;
    addresses?: string[];
    shelterDetails?: ShelterDetail[];
}

interface InteractiveMapProps {
    locations: Location[];
    className?: string;
}

const escapeHtml = (value: string) => {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

export function InteractiveMap({ locations, className = '' }: InteractiveMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const map = L.map(mapRef.current).setView([4.5709, -74.2973], 6);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'OpenStreetMap contributors',
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
        if (!mapInstanceRef.current) return;

        const map = mapInstanceRef.current;

        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        if (locations.length === 0) {
            return;
        }

        locations.forEach((location) => {
            const iconSize = Math.max(35, Math.min(60, 25 + location.count * 0.8));

            let gradientColors = '#3b82f6, #1d4ed8';
            if (location.count > 50) {
                gradientColors = '#9333ea, #7c3aed';
            } else if (location.count > 20) {
                gradientColors = '#10b981, #059669';
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

            const shelterDetails = (location.shelterDetails ?? []).slice(0, 3);
            const extraShelters = Math.max((location.shelterDetails?.length ?? 0) - shelterDetails.length, 0);
            const shelterDetailsHtml = shelterDetails
                .map((detail) => {
                    const name = escapeHtml(detail.name);
                    const address = detail.address ? escapeHtml(detail.address) : 'Sin direccion registrada';

                    return `
                        <div class="rounded-lg border border-gray-200 bg-white/80 p-2 dark:border-gray-700 dark:bg-gray-800/60">
                            <p class="text-sm font-semibold text-gray-800 dark:text-white">${name}</p>
                            <p class="text-xs text-gray-600 dark:text-gray-300">${address}</p>
                        </div>
                    `;
                })
                .join('');

            const popupContent = `
                <div class="popup-container rounded-xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-4 shadow-lg dark:border-gray-600 dark:from-gray-800 dark:to-gray-900">
                    <div class="mb-3 flex items-center gap-3">
                        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-md dark:from-blue-600 dark:to-blue-700">
                            <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                        </div>
                        <div>
                            <h3 class="leading-tight text-xl font-bold text-gray-800 dark:text-white">${escapeHtml(location.city)}</h3>
                            <p class="text-xs font-medium text-blue-600 dark:text-blue-400">Ciudad consolidada</p>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <div class="flex items-center justify-between rounded-lg bg-blue-100/50 p-2 dark:bg-blue-900/30">
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Mascotas</span>
                            <span class="text-lg font-bold text-blue-600 dark:text-blue-400">${location.count}</span>
                        </div>
                        ${
                            location.shelters
                                ? `
                            <div class="flex items-center justify-between rounded-lg bg-green-100/50 p-2 dark:bg-green-900/30">
                                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Refugios</span>
                                <span class="text-lg font-bold text-green-600 dark:text-green-400">${location.shelters}</span>
                            </div>
                        `
                                : ''
                        }
                    </div>

                    ${
                        shelterDetailsHtml
                            ? `
                        <div class="mt-3 space-y-2 border-t border-gray-200 pt-3 dark:border-gray-600">
                            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Direcciones registradas</p>
                            ${shelterDetailsHtml}
                            ${
                                extraShelters > 0
                                    ? `<p class="text-xs text-gray-500 dark:text-gray-400">+${extraShelters} refugio(s) mas en esta ciudad.</p>`
                                    : ''
                            }
                        </div>
                    `
                            : ''
                    }

                    <div class="mt-3 border-t border-gray-200 pt-2 dark:border-gray-600">
                        <button
                            onclick="window.location.href='/refugios?ciudad=${encodeURIComponent(location.city)}'"
                            class="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 font-semibold text-white transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800"
                        >
                            Ver refugios en ${escapeHtml(location.city)}
                        </button>
                    </div>
                </div>
            `;

            const marker = L.marker([location.lat, location.lng], { icon: customIcon }).addTo(map);
            marker.bindPopup(popupContent);

            marker.on('mouseover', function (this: L.Marker) {
                this.openPopup();
            });
        });

        if (locations.length === 1) {
            map.setView([locations[0].lat, locations[0].lng], 11);
            return;
        }

        const group = new L.FeatureGroup(locations.map((loc) => L.marker([loc.lat, loc.lng])));
        map.fitBounds(group.getBounds().pad(0.1));
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
