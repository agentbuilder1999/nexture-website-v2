'use client';
import { useEffect, useState } from 'react';

interface ShaderMod {
  ShaderGradientCanvas: React.ComponentType<React.HTMLAttributes<HTMLDivElement> & { pixelDensity?: number; fov?: number; gl?: object }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ShaderGradient: React.ComponentType<any>;
}

interface HeroBackgroundProps {
  type?: 'hero' | 'section';
  opacity?: number;
}

function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

function ShaderScene({ type, mod }: { type: 'hero' | 'section'; mod: ShaderMod }) {
  const { ShaderGradientCanvas, ShaderGradient } = mod;
  const isHero = type === 'hero';

  return (
    <ShaderGradientCanvas
      style={{ position: 'absolute', inset: 0, background: 'transparent' } as React.CSSProperties}
      pixelDensity={1}
      fov={45}
      gl={{ powerPreference: 'low-power', alpha: true }}
    >
      <ShaderGradient
        type={isHero ? 'waterPlane' : 'plane'}
        animate="on"
        color1={isHero ? '#7456C8' : '#9A81DF'}
        color2={isHero ? '#2A9D8F' : '#14083A'}
        color3="#0C0524"
        uSpeed={isHero ? 0.25 : 0.12}
        uStrength={isHero ? 1.8 : 0.8}
        uDensity={isHero ? 1.2 : 0.9}
        positionX={0} positionY={0} positionZ={0}
        rotationX={isHero ? 45 : 30} rotationY={0} rotationZ={0}
        lightType={isHero ? 'env' : '3d'}
        envPreset="city"
        grain={isHero ? 'off' : 'on'}
        brightness={isHero ? 1.0 : 0.85}
        cDistance={32} cPolarAngle={125}
      />
    </ShaderGradientCanvas>
  );
}

export default function HeroBackground({ type = 'hero', opacity = 0.55 }: HeroBackgroundProps) {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [mod, setMod] = useState<ShaderMod | null>(null);

  useEffect(() => {
    const supported = isWebGLSupported();
    setWebgl(supported);
    if (supported) {
      import('@shadergradient/react').then((m) => setMod(m as unknown as ShaderMod));
    }
  }, []);

  if (webgl === false) {
    return (
      <div
        className="absolute inset-0 z-0"
        style={{ backgroundImage: 'url(/assets/Purple-bfg.avif)', backgroundSize: 'cover', opacity: 0.5 }}
      />
    );
  }

  if (!mod) return null;

  return (
    <div
      className="absolute inset-0 z-0 hero-bg-reveal"
      style={{ opacity: 0, perspective: '1200px', '--hero-bg-opacity': opacity } as React.CSSProperties}
    >
      {type === 'hero' ? (
        <div
          style={{
            position: 'absolute',
            width: '700px',
            height: '700px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%) rotateX(-30deg)',
            transformOrigin: 'center center',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 35%, rgba(0,0,0,0.5) 60%, transparent 80%)',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 35%, rgba(0,0,0,0.5) 60%, transparent 80%)',
            /* Fix: set page background so wave backface shows theme color not black */
            background: 'var(--bg-page)',
          }}
        >
          {/* Fix: explicit background layer so wave back-face shows theme color */}
          <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-page)', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
            <ShaderScene type={type} mod={mod} />
          </div>
        </div>
      ) : (
        <ShaderScene type={type} mod={mod} />
      )}
      {type === 'hero' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(12,5,36,0.5) 55%, rgba(12,5,36,1) 100%)' }}
        />
      )}
    </div>
  );
}
