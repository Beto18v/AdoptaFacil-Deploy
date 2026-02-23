import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

// Fix para los iconos de Leaflet
delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationPickerProps {
    initialLat?: number;
    initialLng?: number;
    onLocationChange: (lat: number, lng: number) => void;
    className?: string;
}

export function LocationPicker({ 
    initialLat = 4.6097, 
    initialLng = -74.0817, 
    onLocationChange, 
    className = '' 
}: LocationPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const [coordinates, setCoordinates] = useState({ lat: initialLat, lng: initialLng });

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Crear el mapa
        const map = L.map(mapRef.current).setView([initialLat, initialLng], 13);

        // Agregar tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
        }).addTo(map);

        // Crear marcador inicial
        const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
        
        // Evento cuando se arrastra el marcador
        marker.on('dragend', function(e) {
            const position = e.target.getLatLng();
            setCoordinates({ lat: position.lat, lng: position.lng });
            onLocationChange(position.lat, position.lng);
        });

        // Evento cuando se hace click en el mapa
        map.on('click', function(e) {
            const { lat, lng } = e.latlng;
            marker.setLatLng([lat, lng]);
            setCoordinates({ lat, lng });
            onLocationChange(lat, lng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [initialLat, initialLng, onLocationChange]);

    // Función para buscar por dirección (geocodificación simple)
    const searchAddress = async (address: string) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Colombia')}&limit=1`
            );
            const data = await response.json();
            
            if (data.length > 0) {
                const { lat, lon } = data[0];
                const newLat = parseFloat(lat);
                const newLng = parseFloat(lon);
                
                if (mapInstanceRef.current && markerRef.current) {
                    mapInstanceRef.current.setView([newLat, newLng], 15);
                    markerRef.current.setLatLng([newLat, newLng]);
                    setCoordinates({ lat: newLat, lng: newLng });
                    onLocationChange(newLat, newLng);
                }
            }
        } catch (error) {
            console.error('Error buscando dirección:', error);
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Buscador de dirección */}
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Buscar dirección (ej: Calle 123, Bogotá)"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            searchAddress(e.currentTarget.value);
                        }
                    }}
                />
                <button
                    type="button"
                    onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        searchAddress(input.value);
                    }}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Buscar
                </button>
            </div>

            {/* Mapa */}
            <div 
                ref={mapRef} 
                className="h-64 w-full rounded-lg border border-gray-300 dark:border-gray-600"
            />

            {/* Coordenadas actuales */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>
                    <strong>Ubicación seleccionada:</strong> {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                </p>
                <p className="text-xs">
                    💡 Arrastra el marcador o haz click en el mapa para cambiar la ubicación
                </p>
            </div>
        </div>
    );
}