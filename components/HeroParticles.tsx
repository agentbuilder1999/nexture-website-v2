'use client';
import { useCallback, useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import type { Container, ISourceOptions } from '@tsparticles/engine';

const options: ISourceOptions = {
  fullScreen: { enable: false },
  fpsLimit: 60,
  particles: {
    number: {
      value: 120,
      density: { enable: true, width: 900 },
    },
    color: {
      value: ['#A680FF', '#FF85B8', '#FFB070', '#7456C8'],
    },
    opacity: {
      value: { min: 0.24, max: 0.60 },
      animation: {
        enable: true,
        speed: 0.6,
        sync: false,
      },
    },
    size: {
      value: { min: 0.8, max: 2.4 },
      animation: {
        enable: true,
        speed: 1.2,
        sync: false,
      },
    },
    move: {
      enable: true,
      speed: { min: 0.3, max: 0.8 },
      direction: 'none',
      random: true,
      straight: false,
      outModes: { default: 'out' },
    },
    links: {
      enable: true,
      distance: 140,
      color: '#7456C8',
      opacity: 0.18,
      width: 0.7,
    },
  },
  interactivity: {
    events: {
      onHover: { enable: true, mode: 'grab' },
      resize: { enable: true },
    },
    modes: {
      grab: { distance: 160, links: { opacity: 0.4 } },
    },
  },
  detectRetina: true,
  background: { color: 'transparent' },
};

export default function HeroParticles() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      const { loadSlim } = await import('@tsparticles/slim');
      await loadSlim(engine);
    }).then(() => setReady(true));
  }, []);

  const onLoaded = useCallback(async (_container?: Container) => {
    // container ready
  }, []);

  if (!ready) return null;

  return (
    <Particles
      id="hero-particles"
      className="absolute inset-0 z-[3] pointer-events-none"
      options={options}
      particlesLoaded={onLoaded}
    />
  );
}
