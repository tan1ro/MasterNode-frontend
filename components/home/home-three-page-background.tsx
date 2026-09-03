"use client"

import { useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import type { Group, Mesh, Points } from "three"

type Crystal = {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  color: string
  speed: number
}

function CrystalField() {
  const groupRef = useRef<Group>(null)
  const crystals = useMemo<Crystal[]>(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        position: [
          (Math.random() - 0.5) * 18,
          (Math.random() - 0.5) * 12,
          -1.5 - Math.random() * 9,
        ] as [number, number, number],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ] as [number, number, number],
        scale: 0.28 + Math.random() * 0.9,
        color:
          i % 4 === 0
            ? "#06b6d4"
            : i % 4 === 1
              ? "#f59e0b"
              : i % 4 === 2
                ? "#8b5cf6"
                : "#38bdf8",
        speed: 0.16 + Math.random() * 0.2,
      })),
    []
  )

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    groupRef.current.rotation.y = Math.sin(t * 0.08) * 0.08
    groupRef.current.rotation.x = Math.cos(t * 0.06) * 0.04
  })

  return (
    <group ref={groupRef}>
      {crystals.map((crystal, index) => (
        <FloatingCrystal key={index} crystal={crystal} timeOffset={index * 0.4} />
      ))}
    </group>
  )
}

function FloatingCrystal({ crystal, timeOffset }: { crystal: Crystal; timeOffset: number }) {
  const meshRef = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime + timeOffset
    meshRef.current.position.y = crystal.position[1] + Math.sin(t * crystal.speed) * 0.35
    meshRef.current.rotation.x += 0.0025
    meshRef.current.rotation.y += 0.003
  })

  return (
    <mesh
      ref={meshRef}
      position={crystal.position}
      rotation={crystal.rotation}
      scale={crystal.scale}
    >
      <octahedronGeometry args={[0.75, 0]} />
      <meshStandardMaterial
        color={crystal.color}
        emissive={crystal.color}
        emissiveIntensity={0.45}
        metalness={0.35}
        roughness={0.2}
        transparent
        opacity={0.32}
      />
    </mesh>
  )
}

function ParticleMist() {
  const pointsRef = useRef<Points>(null)
  const positions = useMemo(() => {
    const count = 220
    const array = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      array[i3] = (Math.random() - 0.5) * 24
      array[i3 + 1] = (Math.random() - 0.5) * 14
      array[i3 + 2] = -2 - Math.random() * 9
    }
    return array
  }, [])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const t = clock.elapsedTime
    pointsRef.current.rotation.y = -t * 0.005
    pointsRef.current.position.y = Math.sin(t * 0.05) * 0.2
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        sizeAttenuation
        transparent
        opacity={0.22}
        color="#e2e8f0"
        depthWrite={false}
      />
    </points>
  )
}

export function HomeThreePageBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 h-[100dvh] w-full overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(6,182,212,0.12),transparent_35%),radial-gradient(circle_at_82%_18%,rgba(245,158,11,0.1),transparent_36%),radial-gradient(circle_at_50%_85%,rgba(139,92,246,0.12),transparent_42%)] dark:bg-[radial-gradient(circle_at_15%_15%,rgba(6,182,212,0.14),transparent_35%),radial-gradient(circle_at_82%_18%,rgba(245,158,11,0.11),transparent_36%),radial-gradient(circle_at_50%_85%,rgba(139,92,246,0.14),transparent_42%),linear-gradient(180deg,rgba(2,6,23,0.12),rgba(2,6,23,0.35))]" />
      <div className="absolute inset-0">
        <Canvas
          className="!h-full !w-full"
          style={{ width: "100%", height: "100%" }}
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 9], fov: 56 }}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={0.35} />
          <pointLight position={[3, 2, 3]} intensity={0.5} color="#06b6d4" />
          <pointLight position={[-3, -1.5, 2]} intensity={0.42} color="#f59e0b" />
          <pointLight position={[0, -3, 3]} intensity={0.32} color="#8b5cf6" />
          <CrystalField />
          <ParticleMist />
        </Canvas>
      </div>
    </div>
  )
}
