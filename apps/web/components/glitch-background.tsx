'use client'

import { Canvas, useThree, useLoader, useFrame } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import * as THREE from 'three'

// Vertex shader — passes UV coordinates
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Fragment shader — wave glitch from top to bottom with layered textures
const fragmentShader = `
  uniform sampler2D uBgTexture;
  uniform sampler2D uFrTexture;
  uniform float uTime;
  uniform float uWaveY;   // normalised 0→1, current leading edge of the wave
  uniform float uWaveWidth; // thickness of the active glitch band
  uniform float uIntensity;
  varying vec2 vUv;

  float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 uv = vUv;

    // Distance from the wave front — top-to-bottom means uWaveY decreases from 1 to 0
    // We work in "inverted" UV space so the wave sweeps downward:
    float distFromWave = (1.0 - uv.y) - (1.0 - uWaveY); // positive inside the passed zone

    // Active band: just ahead of the wave front
    float bandTop = 1.0 - uWaveY;
    float bandBottom = bandTop + uWaveWidth;
    float inBand = step(bandTop, 1.0 - uv.y) * step(1.0 - uv.y, bandBottom);

    // Trailing distortion that fades as the wave moves past
    float trailFade = clamp(distFromWave / 0.4, 0.0, 1.0);
    float trailActive = step(0.0, distFromWave) * (1.0 - trailFade);

    // Combine: strong glitch in the band, fading trail behind it
    float glitchStrength = inBand * 1.0 + trailActive * 0.35;
    glitchStrength *= uIntensity;

    // Sample both textures
    vec4 bgCol = texture2D(uBgTexture, uv);
    vec4 frCol = texture2D(uFrTexture, uv);
    
    // Layer: bg-nature as base, fr-nature overlay on top
    vec4 baseColor = mix(bgCol, frCol, 0.7);

    if (glitchStrength > 0.001) {
      // Slice-based horizontal shift
      float sliceSize = 0.04 + rand(vec2(floor(uv.y / 0.04), uTime)) * 0.06;
      float sliceId  = floor(uv.y / sliceSize);
      float sliceRand = rand(vec2(sliceId, floor(uTime * 8.0)));

      float shift = 0.0;
      if (sliceRand > 0.5) {
        shift = (sliceRand - 0.5) * 0.12 * glitchStrength;
      }

      // RGB chromatic aberration offset
      float ca = 0.006 * glitchStrength;

      vec4 colR = mix(texture2D(uBgTexture, vec2(uv.x + shift + ca, uv.y)), texture2D(uFrTexture, vec2(uv.x + shift + ca, uv.y)), 0.7);
      vec4 colG = mix(texture2D(uBgTexture, vec2(uv.x + shift,      uv.y)), texture2D(uFrTexture, vec2(uv.x + shift,      uv.y)), 0.7);
      vec4 colB = mix(texture2D(uBgTexture, vec2(uv.x + shift - ca, uv.y)), texture2D(uFrTexture, vec2(uv.x + shift - ca, uv.y)), 0.7);

      // Occasional full-width scan-line tear
      float tearLine = step(0.98, rand(vec2(floor(uTime * 12.0), floor(uv.y / 0.002))));
      shift += tearLine * 0.08 * glitchStrength;

      gl_FragColor = vec4(colR.r, colG.g, colB.b, 1.0);
    } else {
      gl_FragColor = baseColor;
    }
  }
`

interface GlitchSceneProps {
  isHovered: boolean
}

const GlitchScene = ({ isHovered }: GlitchSceneProps) => {
  const { scene, size } = useThree()
  // The camera is a mutable three.js object owned by the R3F store, not React
  // state — read it imperatively so configuring it is not treated as mutating
  // a value returned from a hook.
  const getState = useThree((state) => state.get)
  const meshRef = useRef<THREE.Mesh | null>(null)
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)

  // Wave animation state:
  //   cooldown    — seconds until the next wave starts
  //   nextCooldown — placeholder; the frame loop draws the real value on the
  //                  first tick, before anything reads it
  //   speed       — units per second across the 0-1 UV range
  //   waveY       — wave front position, starts at the top (UV y = 1)
  const waveState = useRef({
    active: false,
    cooldown: 0,
    nextCooldown: 2,
    speed: 0.55,
    waveY: 1,
  })

  const defaultTexture = useLoader(
    THREE.TextureLoader,
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bg-nature-RN8PX1dGhZlLMsI4flnWQM6uInZYY1.png'
  )
  const hoverTexture = useLoader(
    THREE.TextureLoader,
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fr-nature-lWxWsWzCM2kVPeHafi3LHqb0fM4DPL.png'
  )

  // Build scene geometry once
  useEffect(() => {
    const camera = getState().camera as THREE.OrthographicCamera
    const imageAspect = defaultTexture.image.width / defaultTexture.image.height
    const screenAspect = size.width / size.height
    const frustumSize = 1

    camera.left = -frustumSize * screenAspect
    camera.right = frustumSize * screenAspect
    camera.top = frustumSize
    camera.bottom = -frustumSize
    camera.near = 0.1
    camera.far = 1000
    camera.updateProjectionMatrix()
    camera.position.z = 1

    const scale = Math.max(
      (2 * frustumSize * screenAspect) / (imageAspect * 2 * frustumSize),
      1
    )
    const planeWidth = imageAspect * 2 * frustumSize * scale
    const planeHeight = 2 * frustumSize * scale

    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight)
    const material = new THREE.ShaderMaterial({
      fragmentShader,
      uniforms: {
        uBgTexture: { value: defaultTexture },
        uFrTexture: { value: hoverTexture },
        uIntensity: { value: 0 },
        uTime: { value: 0 },
        uWaveWidth: { value: 0.07 },
        uWaveY: { value: 1 },
      },
      vertexShader,
    })

    materialRef.current = material
    const mesh = new THREE.Mesh(geometry, material)
    meshRef.current = mesh
    scene.add(mesh)

    return () => {
      scene.remove(mesh)
      geometry.dispose()
      material.dispose()
    }
  }, [defaultTexture, getState, hoverTexture, scene, size.height, size.width])

  // Keep textures in sync
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uBgTexture.value = defaultTexture
      materialRef.current.uniforms.uFrTexture.value = hoverTexture
    }
  })

  // Disable glitch when hovered
  useEffect(() => {
    if (isHovered && materialRef.current) {
      materialRef.current.uniforms.uIntensity.value = 0
      waveState.current.active = false
    }
  }, [isHovered])

  useFrame((state, delta) => {
    if (!materialRef.current || isHovered) {
      return
    }
    const mat = materialRef.current
    const ws = waveState.current

    mat.uniforms.uTime.value = state.clock.elapsedTime

    if (ws.active) {
      // Advance the wave downward
      ws.waveY -= ws.speed * delta

      mat.uniforms.uWaveY.value = ws.waveY
      mat.uniforms.uIntensity.value = 1

      if (ws.waveY < -0.15) {
        // Wave has exited the bottom — reset
        ws.active = false
        ws.cooldown = ws.nextCooldown
        mat.uniforms.uIntensity.value = 0
      }
    } else {
      ws.cooldown -= delta
      if (ws.cooldown <= 0) {
        // Trigger new wave from the top
        ws.active = true
        ws.waveY = 1
        ws.nextCooldown = 1.5 + Math.random() * 2.5
      }
    }
  })

  return null
}

interface GlitchBackgroundProps {
  isHovered: boolean
}

export const GlitchBackground = ({ isHovered }: GlitchBackgroundProps) => (
  <div className="absolute inset-0">
    <Canvas
      orthographic
      camera={{ position: [0, 0, 1], zoom: 1 }}
      gl={{ alpha: false, antialias: true }}
      style={{ height: '100%', width: '100%' }}
    >
      <GlitchScene isHovered={isHovered} />
    </Canvas>
    {/* Gradient noir du bas vers le haut */}
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          'linear-gradient(to top, black 0%, black 15%, transparent 60%)',
      }}
    />
  </div>
)
