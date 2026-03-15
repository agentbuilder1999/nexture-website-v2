'use client'

/**
 * WaveLayer — Hero 三层金字塔中间波形层（含响应式）
 * 
 * 完整版：含移动端尺寸适配
 */

import { useEffect, useState } from 'react'

interface WaveLayerProps {
  className?: string
}

export function WaveLayer({ className = '' }: WaveLayerProps) {
  const [mod, setMod] = useState<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ShaderGradientCanvas: React.ComponentType<any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ShaderGradient: React.ComponentType<any>
  } | null>(null)

  // 响应式尺寸：530px（desktop）→ 320px（mobile）
  const [size, setSize] = useState(530)

  useEffect(() => {
    // ShaderGradient 动态加载
    import('shadergradient').then((m) => {
      setMod({
        ShaderGradientCanvas: m.ShaderGradientCanvas,
        ShaderGradient: m.ShaderGradient,
      })
    }).catch(() => {})

    // 响应式尺寸
    const updateSize = () => {
      if (window.innerWidth < 480) setSize(260)
      else if (window.innerWidth < 768) setSize(360)
      else setSize(530)
    }
    updateSize()
    window.addEventListener('resize', updateSize, { passive: true })
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return (
    <>
      <style>{`
        @keyframes waveRise {
          0%   { transform: translate(-50%, -50%) rotateZ(45deg) translateY(5px); }
          100% { transform: translate(-50%, -50%) rotateZ(45deg) translateY(-5px); }
        }
        .wave-layer-anim {
          animation: waveRise 7s ease-in-out alternate infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .wave-layer-anim {
            animation: none;
            transform: translate(-50%, -50%) rotateZ(45deg);
          }
        }
      `}</style>

      <div
        className={`wave-layer-anim ${className}`}
        style={{
          position: 'absolute',
          top: '51%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotateZ(45deg) translateY(5px)',
          width: `${size}px`,
          height: `${size}px`,
          willChange: 'transform',
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          maskImage: 'radial-gradient(ellipse 92% 92% at 50% 50%, black 55%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 92% 92% at 50% 50%, black 55%, transparent 100%)',
          zIndex: 1,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        {mod ? (
          <mod.ShaderGradientCanvas
            style={{ position: 'absolute', inset: 0 }}
            pixelDensity={1}
            fov={45}
            gl={{ powerPreference: 'low-power' }}
          >
            <mod.ShaderGradient
              type="waterPlane"
              animate="on"
              rotationX={52}
              rotationY={0}
              rotationZ={0}
              cPolarAngle={105}
              cDistance={25}
              uStrength={1.4}
              uDensity={1.5}
              uSpeed={0.25}
              color1="#7456C8"
              color2="#2A9D8F"
              color3="#0C0524"
              lightType="env"
              envPreset="city"
              brightness={1.1}
              grain="off"
            />
          </mod.ShaderGradientCanvas>
        ) : (
          // 降级占位
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at center, #7456C8 0%, #2A9D8F 40%, #0C0524 100%)',
              opacity: 0.6,
            }}
          />
        )}
      </div>
    </>
  )
}
