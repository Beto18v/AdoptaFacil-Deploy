import { useCallback, useEffect, useState } from 'react';

interface UseCarouselProps {
    totalItems: number;
    initialIndex?: number;
    autoPlayInterval?: number;
    enableAutoPlay?: boolean;
}

export function useCarousel({ totalItems, initialIndex = 0, autoPlayInterval = 5000, enableAutoPlay = false }: UseCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isAutoPlaying, setIsAutoPlaying] = useState(enableAutoPlay);

    // Reset index when totalItems or initialIndex changes
    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex, totalItems]);

    // Auto play functionality
    useEffect(() => {
        if (!isAutoPlaying || totalItems <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % totalItems);
        }, autoPlayInterval);

        return () => clearInterval(interval);
    }, [isAutoPlaying, totalItems, autoPlayInterval]);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % totalItems);
    }, [totalItems]);

    const goToPrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
    }, [totalItems]);

    const goToIndex = useCallback(
        (index: number) => {
            if (index >= 0 && index < totalItems) {
                setCurrentIndex(index);
            }
        },
        [totalItems],
    );

    const toggleAutoPlay = useCallback(() => {
        setIsAutoPlaying((prev) => !prev);
    }, []);

    const pauseAutoPlay = useCallback(() => {
        setIsAutoPlaying(false);
    }, []);

    const resumeAutoPlay = useCallback(() => {
        setIsAutoPlaying(true);
    }, []);

    return {
        currentIndex,
        goToNext,
        goToPrevious,
        goToIndex,
        isAutoPlaying,
        toggleAutoPlay,
        pauseAutoPlay,
        resumeAutoPlay,
    };
}
