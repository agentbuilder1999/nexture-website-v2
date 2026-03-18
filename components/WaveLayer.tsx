'use client'

/**
 * WaveLayer — Hero 三层金字塔中间波形层
 *
 * 等角透视匹配：CSS 3D perspective + rotateX(55deg)（水平放置，无 rotateZ）
 * 使 ShaderGradient 菱形在视觉上与 Neural_Sieve 背景图的等角平板完全对齐
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

  // 响应式尺寸：380px（desktop）→ 280px（tablet）→ 180px（mobile）
  const [size, setSize] = useState(380)

  useEffect(() => {
    import('shadergradient').then((m) => {
      setMod({
        ShaderGradientCanvas: m.ShaderGradientCanvas,
        ShaderGradient: m.ShaderGradient,
      })
    }).catch(() => {})

    const updateSize = () => {
      if (window.innerWidth < 480) setSize(180)
      else if (window.innerWidth < 768) setSize(280)
      else setSize(380)
    }
    updateSize()
    window.addEventListener('resize', updateSize, { passive: true })
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const baseTransform = 'translate(-50%, -50%) perspective(900px) rotateX(55deg)'

  return (
    <>
      <style>{`
        /* Wave animation disabled - static rendering */
      `}</style>

      <div
        className={className}
        style={{
          position: 'absolute',
          top: '38%',
          left: '50%',
          transform: `${baseTransform} translateZ(-12px)`,
          width: `${size}px`,
          height: `${size}px`,
          opacity: 0.88,
          willChange: 'transform',
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 55%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 55%, transparent 100%)',
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
              rotationX={0}
              rotationY={0}
              rotationZ={0}
              cPolarAngle={90}
              cDistance={22}
              uStrength={1.2}
              uDensity={1.4}
              uSpeed={0.2}
              color1="#5E4DB8"
              color2="#00CED1"
              color3="#0A0320"
              lightType="env"
              envPreset="city"
              brightness={1.0}
              grain="off"
            />
          </mod.ShaderGradientCanvas>
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at center, #5E4DB8 0%, #1A8C7A 40%, #0A0320 100%)',
              opacity: 0.6,
            }}
          />
        )}
      </div>
    </>
  )
}
