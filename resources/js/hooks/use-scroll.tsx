import { useEffect, useState } from 'react';

/**
 * Hook personalizado que detecta si la página se ha desplazado verticalmente
 * más allá de un umbral específico.
 * @param {number} threshold - La cantidad de píxeles para activar el estado "scrolled". Por defecto es 10.
 * @returns {boolean} - Devuelve `true` si se ha superado el umbral, de lo contrario `false`.
 */
export function useScroll(threshold = 10) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > threshold) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        // Agrega el listener cuando el componente se monta
        window.addEventListener('scroll', handleScroll);

        // Limpia el listener cuando el componente se desmonta
        return () => window.removeEventListener('scroll', handleScroll);
    }, [threshold]); // El efecto se vuelve a ejecutar solo si el umbral cambia

    return scrolled;
}
