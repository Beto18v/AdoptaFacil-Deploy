import type { Container, Engine, ISourceOptions } from '@tsparticles/engine';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { useEffect, useMemo, useState } from 'react';

const ParticlesHero = () => {
    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine: Engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const particlesLoaded = (container?: Container): Promise<void> => {
        console.log(container);
        return Promise.resolve();
    };

    const options: ISourceOptions = useMemo(
        () => ({
            fpsLimit: 120,
            fullScreen: false,
            interactivity: {
                events: {
                    onHover: {
                        enable: true,
                        mode: 'repulse',
                    },
                },
                modes: {
                    push: {
                        quantity: 4,
                    },
                    repulse: {
                        distance: 200,
                        duration: 0.4,
                    },
                },
            },
            particles: {
                color: {
                    value: '#ffffff',
                },
                links: {
                    color: '#ffffff',
                    distance: 150,
                    enable: true,
                    opacity: 0.5,
                    width: 1,
                },
                move: {
                    direction: 'none',
                    enable: true,
                    outModes: {
                        default: 'bounce',
                    },
                    random: false,
                    speed: 6,
                    straight: false,
                },
                number: {
                    density: {
                        enable: true,
                    },
                    value: 100,
                },
                opacity: {
                    value: 0.5,
                },
                shape: {
                    type: 'circle',
                },
                size: {
                    value: { min: 1, max: 5 },
                },
            },
            detectRetina: true,
        }),
        [],
    );

    if (init) {
        return (
            <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden' }}>
                <Particles id="tsparticles" particlesLoaded={particlesLoaded} options={options} style={{ width: '100%', height: '100%' }} />
            </div>
        );
    }
    return null;
};

export default ParticlesHero;
