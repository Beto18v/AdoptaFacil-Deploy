import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

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
    onResolutionChange?: (resolved: boolean) => void;
    searchQuery?: string;
    className?: string;
}

export function LocationPicker({
    initialLat = 4.6097,
    initialLng = -74.0817,
    onLocationChange,
    onResolutionChange,
    searchQuery = '',
    className = '',
}: LocationPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const onLocationChangeRef = useRef(onLocationChange);
    const onResolutionChangeRef = useRef(onResolutionChange);
    const initialCenterRef = useRef({ lat: initialLat, lng: initialLng });
    const hasInitializedSearchRef = useRef(false);
    const lastResolvedQueryRef = useRef('');
    const [coordinates, setCoordinates] = useState({ lat: initialLat, lng: initialLng });
    const [resolutionMessage, setResolutionMessage] = useState('La ubicacion se calculara automaticamente con la direccion registrada.');

    useEffect(() => {
        onLocationChangeRef.current = onLocationChange;
    }, [onLocationChange]);

    useEffect(() => {
        onResolutionChangeRef.current = onResolutionChange;
    }, [onResolutionChange]);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const { lat: initialMapLat, lng: initialMapLng } = initialCenterRef.current;

        const map = L.map(mapRef.current, {
            dragging: false,
            touchZoom: false,
            doubleClickZoom: false,
            scrollWheelZoom: false,
            boxZoom: false,
            keyboard: false,
            zoomControl: false,
        }).setView([initialMapLat, initialMapLng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'OpenStreetMap contributors',
            maxZoom: 18,
        }).addTo(map);

        const marker = L.marker([initialMapLat, initialMapLng], { draggable: false }).addTo(map);

        mapInstanceRef.current = map;
        markerRef.current = marker;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }

            markerRef.current = null;
        };
    }, []);

    useEffect(() => {
        setCoordinates({ lat: initialLat, lng: initialLng });

        if (!mapInstanceRef.current || !markerRef.current) {
            return;
        }

        markerRef.current.setLatLng([initialLat, initialLng]);
        mapInstanceRef.current.setView([initialLat, initialLng], mapInstanceRef.current.getZoom());
    }, [initialLat, initialLng]);

    const searchAddress = async (address: string) => {
        const normalizedAddress = address.trim();

        if (!normalizedAddress) {
            setResolutionMessage('Completa la direccion y la ciudad para ubicar automaticamente el refugio.');
            onResolutionChangeRef.current?.(false);
            return false;
        }

        try {
            setResolutionMessage('Validando direccion en el mapa...');
            onResolutionChangeRef.current?.(false);

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${normalizedAddress}, Colombia`)}&limit=1`,
            );
            const data = await response.json();

            if (!Array.isArray(data) || data.length === 0) {
                setResolutionMessage('No se encontro una coincidencia exacta. Revisa la direccion y la ciudad.');
                return false;
            }

            const { lat, lon } = data[0];
            const newLat = Number.parseFloat(lat);
            const newLng = Number.parseFloat(lon);

            if (Number.isNaN(newLat) || Number.isNaN(newLng)) {
                setResolutionMessage('No se pudo interpretar la direccion ingresada.');
                return false;
            }

            if (mapInstanceRef.current && markerRef.current) {
                mapInstanceRef.current.setView([newLat, newLng], 15);
                markerRef.current.setLatLng([newLat, newLng]);
            }

            setCoordinates({ lat: newLat, lng: newLng });
            onLocationChangeRef.current(newLat, newLng);
            lastResolvedQueryRef.current = normalizedAddress;
            setResolutionMessage('Direccion validada correctamente. El mapa solo muestra la ubicacion registrada.');
            onResolutionChangeRef.current?.(true);
            return true;
        } catch (error) {
            console.error('Error buscando direccion:', error);
            setResolutionMessage('No fue posible validar la direccion en este momento.');
            return false;
        }
    };

    useEffect(() => {
        const normalizedSearchQuery = searchQuery.trim();

        if (!hasInitializedSearchRef.current) {
            hasInitializedSearchRef.current = true;
            return;
        }

        if (normalizedSearchQuery.length < 5) {
            setResolutionMessage('Completa la direccion y la ciudad para ubicar automaticamente el refugio.');
            onResolutionChangeRef.current?.(false);
            return;
        }

        if (normalizedSearchQuery === lastResolvedQueryRef.current) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            void searchAddress(normalizedSearchQuery);
        }, 700);

        return () => window.clearTimeout(timeoutId);
    }, [searchQuery]);

    return (
        <div className={`space-y-4 ${className}`}>
            <div ref={mapRef} className="h-64 w-full rounded-lg border border-gray-300 dark:border-gray-600" />

            <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>
                    <strong>Ubicacion seleccionada:</strong> {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                </p>
                <p className="text-xs">{resolutionMessage}</p>
            </div>
        </div>
    );
}
