"use client"

import { useMemo, useRef, useEffect, useState } from "react"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { Text, RoundedBox, OrbitControls } from "@react-three/drei"
import * as THREE from "three"

// Factory Unit Component
interface FactoryUnitProps {
  position: [number, number, number]
  label: string
  color: string
  isActive?: boolean
  size?: number
  description?: string
  id?: string
  onHover?: (hovered: boolean, label: string, description?: string, id?: string) => void
}

// Flowing Particle in Pipe
function FlowingParticle({ 
  distance, 
  color, 
  delay = 0, 
  speed = 1 
}: { 
  distance: number
  color: string
  delay?: number
  speed?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      const time = (state.clock.elapsedTime * speed + delay) % 2
      // Move from -distance/2 to +distance/2
      meshRef.current.position.y = (time - 1) * distance
      meshRef.current.visible = time < 1.8
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.12, 8, 8]} />
          <meshPhongMaterial color={color} emissive={color} emissiveIntensity={1.0} shininess={120} specular={color} opacity={0.7} transparent={true} />
    </mesh>
  )
}

// Flowing Mail Icon on Conveyor
function FlowingMail({ 
  distance, 
  color, 
  delay = 0, 
  speed = 0.6 
}: { 
  distance: number
  color: string
  delay?: number
  speed?: number
}) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      const time = (state.clock.elapsedTime * speed + delay) % 2.5
      // Move along conveyor (z-axis for horizontal movement)
      groupRef.current.position.z = (time - 1.25) * distance
      groupRef.current.visible = time < 2.2
      // Gentle rotation
      groupRef.current.rotation.y = state.clock.elapsedTime * 1.5
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group ref={groupRef} position={[0, 0.05, 0]}>
      {/* Mail envelope */}
      <mesh>
        <boxGeometry args={[0.15, 0.12, 0.02]} />
          <meshPhongMaterial color={color} emissive={color} emissiveIntensity={1.0} shininess={120} specular={color} opacity={0.7} transparent={true} />
      </mesh>
      {/* Mail flap */}
      <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 6, 0, 0]}>
        <boxGeometry args={[0.15, 0.06, 0.01]} />
          <meshPhongMaterial color={color} emissive={color} emissiveIntensity={1.0} shininess={120} specular={color} opacity={0.7} transparent={true} />
      </mesh>
    </group>
  )
}

// Flowing Pie Chart Icon on Conveyor
function FlowingPieChart({ 
  distance, 
  color, 
  delay = 0, 
  speed = 0.5 
}: { 
  distance: number
  color: string
  delay?: number
  speed?: number
}) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      const time = (state.clock.elapsedTime * speed + delay) % 3.0
      // Move along conveyor
      groupRef.current.position.z = (time - 1.5) * distance
      groupRef.current.visible = time < 2.7
      // Rotation
      groupRef.current.rotation.y = state.clock.elapsedTime * 2
    }
  })

  return (
    <group ref={groupRef} position={[0, 0.05, 0]}>
      {/* Pie chart base */}
      <mesh>
        <cylinderGeometry args={[0.1, 0.1, 0.02, 16]} />
          <meshPhongMaterial color={color} emissive={color} emissiveIntensity={1.0} shininess={120} specular={color} opacity={0.7} transparent={true} />
      </mesh>
      {/* Pie chart segments */}
      {[0, 1, 2].map((i) => {
        const segmentColor = i === 0 ? color : (i === 1 ? "#3EA6E0" : "#2ECC84")
        return (
          <mesh key={i} position={[0, 0.01, 0]}>
            <boxGeometry args={[0.05, 0.05, 0.01]} />
            <meshPhongMaterial 
              color={segmentColor}
              emissive={segmentColor}
              emissiveIntensity={1.0}
              opacity={0.7}
              transparent={true} 
            />
          </mesh>
        )
      })}
    </group>
  )
}

// Flowing File/Chart in Pipe (keeping for backward compatibility)
function FlowingFile({ 
  distance, 
  color, 
  delay = 0, 
  speed = 0.8 
}: { 
  distance: number
  color: string
  delay?: number
  speed?: number
}) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      const time = (state.clock.elapsedTime * speed + delay) % 2.5
      // Move from -distance/2 to +distance/2
      groupRef.current.position.y = (time - 1.25) * distance
      groupRef.current.visible = time < 2.2
      // Rotation
      groupRef.current.rotation.y = state.clock.elapsedTime * 2
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2
    }
  })

  return (
    <group ref={groupRef}>
      {/* File/Chart icon */}
      <mesh>
        <boxGeometry args={[0.12, 0.16, 0.02]} />
          <meshPhongMaterial color={color} emissive={color} emissiveIntensity={1.0} shininess={120} specular={color} opacity={0.7} transparent={true} />
      </mesh>
      {/* Chart lines */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[0.08, 0.12]} />
        <meshBasicMaterial color="#DDE4F0" transparent opacity={1.0} />
      </mesh>
    </group>
  )
}

// Industrial Control Panel Component (for Master Agent)
function IndustrialControlPanel({ position, label, color, isActive = false, size = 1, description, id, onHover }: {
  position: [number, number, number]
  label: string
  color: string
  isActive: boolean
  size: number
  description?: string
  id?: string
  onHover?: (hovered: boolean, label: string, description?: string, id?: string) => void
}) {
  const panelRef = useRef<THREE.MeshPhongMaterial>(null)
  const screenRef = useRef<THREE.MeshPhongMaterial>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(() => {
    if (panelRef.current && screenRef.current) {
      const targetEmissive = color
      panelRef.current.emissive.lerp(new THREE.Color(targetEmissive), 0.1)
      panelRef.current.emissiveIntensity = 1.0
      
      screenRef.current.emissiveIntensity = 1.0
    }
  })

  const handlePointerEnter = (e: any) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
    setHovered(true)
    if (onHover) onHover(true, label, description, id)
  }

  const handlePointerLeave = (e: any) => {
    e.stopPropagation()
    document.body.style.cursor = 'auto'
    setHovered(false)
    if (onHover) onHover(false, label, description, id)
  }

  return (
    <group 
      position={position}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {/* Invisible larger hitbox */}
      <mesh position={[0, size * 0.75, 0]} visible={false}>
        <boxGeometry args={[size * 3, size * 3, size * 3]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Main Control Panel Base */}
      <RoundedBox
        args={[size * 2.2, size * 1.8, size * 1.2]}
        radius={size * 0.1}
        smoothness={4}
        position={[0, 0, 0]}
      >
        <meshPhongMaterial 
          ref={panelRef}
          color={color} 
          emissive={color}
          emissiveIntensity={1.0}
          shininess={100}
          specular={color}
          opacity={0.7}
          transparent={true}
        />
      </RoundedBox>

      {/* Control Panel Face */}
      <RoundedBox
        args={[size * 2, size * 1.6, size * 0.1]}
        radius={size * 0.05}
        smoothness={4}
        position={[0, 0, size * 0.66]}
      >
        <meshPhongMaterial color={color} emissive={color} emissiveIntensity={1.0} shininess={100} specular={color} opacity={0.7} transparent={true} />
      </RoundedBox>

      {/* Main Display Screen */}
      <RoundedBox
        args={[size * 1.2, size * 0.8, size * 0.05]}
        radius={size * 0.03}
        smoothness={4}
        position={[0, size * 0.3, size * 0.72]}
      >
        <meshPhongMaterial 
          ref={screenRef}
          color={color}
          emissive={color}
          emissiveIntensity={1.0}
          shininess={150}
          specular={color}
          opacity={0.7}
          transparent={true}
        />
      </RoundedBox>

      {/* Secondary Status Display */}
      <RoundedBox
        args={[size * 0.4, size * 0.3, size * 0.05]}
        radius={size * 0.02}
        smoothness={4}
        position={[-size * 0.6, size * 0.5, size * 0.72]}
      >
        <meshPhongMaterial 
          color={isActive ? "#2ECC84" : "#3EA6E0"}
          emissive={isActive ? "#2ECC84" : "#3EA6E0"}
          emissiveIntensity={1.0}
          shininess={120}
          specular={isActive ? "#2ECC84" : "#3EA6E0"}
          opacity={0.7}
          transparent={true}
        />
      </RoundedBox>

      {/* Control Buttons */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[size * 0.5 + (i % 2) * size * 0.4 - size * 0.2, -size * 0.3 + Math.floor(i / 2) * size * 0.3, size * 0.72]}
        >
          <cylinderGeometry args={[size * 0.08, size * 0.08, size * 0.05, 8]} />
          <meshPhongMaterial 
            color={hovered ? (i % 2 === 0 ? "#2ECC84" : color) : color}
            emissive={hovered ? (i % 2 === 0 ? "#2ECC84" : color) : color}
            emissiveIntensity={1.0}
          opacity={0.7}
          transparent={true}
        />
        </mesh>
      ))}

      {/* Rotary Knob */}
      <mesh position={[-size * 0.6, -size * 0.2, size * 0.72]}>
        <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.04, 16]} />
        <meshPhongMaterial 
          color="#3EA6E0"
          emissive="#3EA6E0"
          emissiveIntensity={1.0}
          opacity={0.7}
          transparent={true}
        />
      </mesh>

      {/* Indicator Lights */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[size * 0.7, size * 0.5 - i * size * 0.3, size * 0.72]}
        >
          <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.02, 8]} />
          <meshPhongMaterial
            color={isActive ? (i % 2 === 0 ? "#2ECC84" : color) : color}
            emissive={isActive ? (i % 2 === 0 ? "#2ECC84" : color) : color}
            emissiveIntensity={1.0}
            opacity={0.7}
            transparent={true}
          />
        </mesh>
      ))}

      {/* Processing Vessel/Tank on top */}
      <mesh position={[0, size * 1.1, 0]}>
        <cylinderGeometry args={[size * 0.4, size * 0.4, size * 0.6, 16]} />
        <meshPhongMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.7 : 0.4}
          opacity={0.7}
          transparent={true}
        />
      </mesh>

      {/* Vessel Top Cap */}
      <mesh position={[0, size * 1.4, 0]}>
        <cylinderGeometry args={[size * 0.42, size * 0.42, size * 0.1, 16]} />
        <meshPhongMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={1.0}
          opacity={0.7}
          transparent={true}
        />
      </mesh>

      {/* Vessel Pipes/Connections */}
      {[0, 1].map((i) => (
        <mesh
          key={i}
          position={[size * 0.3 * (i === 0 ? 1 : -1), size * 0.8, size * 0.2]}
        >
          <cylinderGeometry args={[size * 0.05, size * 0.05, size * 0.3, 8]} />
          <meshPhongMaterial 
            color={i === 0 ? "#2ECC84" : color}
            emissive={i === 0 ? "#2ECC84" : color}
            emissiveIntensity={1.0}
          opacity={0.7}
          transparent={true}
        />
        </mesh>
      ))}

      {/* Additional Control Panels */}
      {[0, 1].map((i) => (
        <RoundedBox
          key={i}
          args={[size * 0.3, size * 0.4, size * 0.08]}
          radius={size * 0.02}
          smoothness={4}
          position={[size * 0.85 * (i === 0 ? 1 : -1), size * 0.1, size * 0.66]}
        >
          <meshPhongMaterial color="#DDE4F0" emissive="#DDE4F0" emissiveIntensity={1.0} shininess={100} specular="#DDE4F0" opacity={0.7} transparent={true} />
        </RoundedBox>
      ))}

      {/* Pressure Gauges */}
      {[0, 1].map((i) => (
        <mesh key={i} position={[size * 0.75 * (i === 0 ? 1 : -1), size * 0.6, size * 0.72]}>
          <cylinderGeometry args={[size * 0.12, size * 0.12, size * 0.03, 16]} />
          <meshPhongMaterial color={color} emissive={color} emissiveIntensity={1.0} shininess={100} specular={color} opacity={0.7} transparent={true} />
        </mesh>
      ))}

      {/* Cooling Fins */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[size * 1.15, size * 0.2 - i * size * 0.15, 0]}>
          <boxGeometry args={[size * 0.05, size * 0.3, size * 1.0]} />
          <meshPhongMaterial color="#DDE4F0" emissive="#DDE4F0" emissiveIntensity={1.0} shininess={100} specular="#DDE4F0" opacity={0.7} transparent={true} />
        </mesh>
      ))}

      {/* Warning Lights Array */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[size * 0.9, size * 0.7 - i * size * 0.2, size * 0.72]}>
          <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.02, 8]} />
          <meshPhongMaterial
            color={isActive ? (i % 2 === 0 ? "#2ECC84" : "#3EA6E0") : color}
            emissive={isActive ? (i % 2 === 0 ? "#2ECC84" : "#3EA6E0") : color}
            emissiveIntensity={isActive ? 1.2 : 0.3}
            opacity={0.7}
            transparent={true}
          />
        </mesh>
      ))}

      {/* Data Ports */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-size * 0.9, size * 0.2 - i * size * 0.25, size * 0.72]}>
          <boxGeometry args={[size * 0.08, size * 0.06, size * 0.04]} />
          <meshPhongMaterial color="#22D0C8" emissive="#22D0C8" emissiveIntensity={1.0} shininess={130} specular="#22D0C8" opacity={0.7} transparent={true} />
        </mesh>
      ))}

      {/* Valve Controls */}
      {[0, 1].map((i) => (
        <group key={i} position={[size * 0.3 * (i === 0 ? 1 : -1), size * 0.65, size * 0.35]}>
          <mesh>
            <cylinderGeometry args={[size * 0.08, size * 0.08, size * 0.1, 8]} />
            <meshPhongMaterial color="#3EA6E0" emissive="#3EA6E0" emissiveIntensity={1.0} shininess={130} specular="#3EA6E0" opacity={0.7} transparent={true} />
          </mesh>
          <mesh position={[0, size * 0.05, 0]}>
            <boxGeometry args={[size * 0.15, size * 0.02, size * 0.02]} />
            <meshPhongMaterial color="#22D0C8" emissive="#22D0C8" emissiveIntensity={1.0} shininess={130} specular="#22D0C8" opacity={0.7} transparent={true} />
          </mesh>
        </group>
      ))}

      {/* Label */}
      <Text
        position={[0, -size * 1.2, 0]}
        fontSize={size * 0.3}
        color="#DDE4F0"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#07070E"
      >
        {label}
      </Text>

      {/* Base Platform */}
      <RoundedBox
        args={[size * 2.5, size * 0.1, size * 2.5]}
        radius={size * 0.05}
        smoothness={4}
        position={[0, -size * 0.9, 0]}
      >
        <meshPhongMaterial color="#DDE4F0" emissive="#DDE4F0" emissiveIntensity={1.0} shininess={100} specular="#DDE4F0" opacity={0.7} transparent={true} />
      </RoundedBox>

      {/* SUPER DETAILED ELEMENTS - Master Agent */}
      
      {/* Additional Digital Displays */}
      {[0, 1, 2].map((i) => (
        <RoundedBox
          key={`display-${i}`}
          args={[size * 0.25, size * 0.15, size * 0.03]}
          radius={size * 0.01}
          smoothness={4}
          position={[size * 0.4 - i * size * 0.3, size * 0.7, size * 0.72]}
        >
          <meshPhongMaterial color={isActive ? "#3EA6E0" : color} emissive={isActive ? "#3EA6E0" : color} emissiveIntensity={1.0} shininess={isActive ? 130 : 100} specular={isActive ? "#3EA6E0" : color} opacity={0.7} transparent={true} />
        </RoundedBox>
      ))}

      {/* Temperature Sensors */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={`temp-${i}`} position={[size * 0.9, size * 0.1 - i * size * 0.2, size * 0.72]}>
          <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.04, 8]} />
          <meshPhongMaterial color="#2ECC84" emissive="#2ECC84" emissiveIntensity={1.0} shininess={130} specular="#2ECC84" opacity={0.7} transparent={true} />
        </mesh>
      ))}

      {/* Hydraulic Lines */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={`hydraulic-${i}`} position={[size * 1.1, size * 0.3 - i * size * 0.15, 0]}>
          <cylinderGeometry args={[size * 0.03, size * 0.03, size * 1.2, 8]} />
          <meshPhongMaterial color={i % 2 === 0 ? "#22D0C8" : "#3EA6E0"} emissive={i % 2 === 0 ? "#22D0C8" : "#3EA6E0"} emissiveIntensity={1.0} shininess={130} specular={i % 2 === 0 ? "#22D0C8" : "#3EA6E0"} opacity={0.7} transparent={true} />
        </mesh>
      ))}

      {/* Circuit Boards */}
      {[0, 1].map((i) => (
        <RoundedBox
          key={`board-${i}`}
          args={[size * 0.3, size * 0.4, size * 0.02]}
          radius={size * 0.01}
          smoothness={4}
          position={[-size * 0.9, size * 0.1 - i * size * 0.5, size * 0.66]}
        >
          <meshPhongMaterial color={color} emissive={color} emissiveIntensity={1.0} shininess={100} specular={color} opacity={0.7} transparent={true} />
        </RoundedBox>
      ))}

      {/* Cable Management */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={`cable-${i}`} position={[size * 0.5, size * 0.4 - i * size * 0.2, -size * 0.6]}>
          <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.3, 8]} />
          <meshPhongMaterial color="#DDE4F0" emissive="#DDE4F0" emissiveIntensity={1.0} shininess={80} specular="#DDE4F0" opacity={0.7} transparent={true} />
        </mesh>
      ))}

      {/* Emergency Stop Buttons */}
      {[0, 1].map((i) => (
        <mesh key={`estop-${i}`} position={[size * 0.85 * (i === 0 ? 1 : -1), -size * 0.5, size * 0.72]}>
          <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.08, 16]} />
          <meshPhongMaterial color="#9B72E8" emissive="#9B72E8" emissiveIntensity={1.0} shininess={130} specular="#9B72E8" opacity={0.7} transparent={true} />
        </mesh>
      ))}

      {/* Ventilation Fans */}
      {[0, 1].map((i) => (
        <mesh key={`fan-${i}`} position={[size * 1.2, size * 0.6 - i * size * 0.4, 0]}>
          <cylinderGeometry args={[size * 0.15, size * 0.15, size * 0.05, 16]} />
          <meshPhongMaterial color="#DDE4F0" emissive="#DDE4F0" emissiveIntensity={1.0} shininess={80} specular="#DDE4F0" opacity={0.7} transparent={true} />
        </mesh>
      ))}

      {/* Power Distribution Units */}
      {[0, 1, 2].map((i) => (
        <RoundedBox
          key={`pdu-${i}`}
          args={[size * 0.2, size * 0.15, size * 0.1]}
          radius={size * 0.02}
          smoothness={4}
          position={[-size * 1.0, size * 0.3 - i * size * 0.3, size * 0.5]}
        >
          <meshPhongMaterial color="#DDE4F0" emissive={isActive ? "#2ECC84" : "#DDE4F0"} emissiveIntensity={1.0} opacity={0.7} transparent={true} />
        </RoundedBox>
      ))}

      {/* Flow Regulators */}
      {[0, 1, 2, 3].map((i) => (
        <group key={`regulator-${i}`} position={[size * 0.3 * (i % 2 === 0 ? 1 : -1), size * 0.5 - Math.floor(i / 2) * size * 0.3, size * 0.4]}>
          <mesh>
            <cylinderGeometry args={[size * 0.05, size * 0.05, size * 0.12, 8]} />
            <meshPhongMaterial color="#3EA6E0" emissive="#3EA6E0" emissiveIntensity={1.0} opacity={0.7} transparent={true} />
          </mesh>
          <mesh position={[0, size * 0.06, 0]}>
            <boxGeometry args={[size * 0.1, size * 0.02, size * 0.02]} />
            <meshPhongMaterial color="#22D0C8" emissive="#22D0C8" emissiveIntensity={1.0} opacity={0.7} transparent={true} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function FactoryUnit({ position, label, color, isActive = false, size = 1, description, id, onHover }: FactoryUnitProps) {
  // Illustration-style: toon shading with flat colors
  const darkerColor = new THREE.Color(color).multiplyScalar(0.8)
  const [hovered, setHovered] = useState(false)
  const mainMaterialRef = useRef<THREE.MeshPhongMaterial>(null)
  const topMaterialRef = useRef<THREE.MeshPhongMaterial>(null)

  useFrame(() => {
    if (mainMaterialRef.current && topMaterialRef.current) {
      // Glow effect on hover - new color scheme
      const targetEmissive = color
      mainMaterialRef.current.emissive.lerp(new THREE.Color(targetEmissive), 0.1)
      mainMaterialRef.current.emissiveIntensity = 1.0
      
      topMaterialRef.current.emissive.lerp(new THREE.Color(targetEmissive), 0.1)
      topMaterialRef.current.emissiveIntensity = 1.0
    }
  })

  const handlePointerEnter = (e: any) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
    setHovered(true)
    if (onHover) onHover(true, label, description, id)
  }

  const handlePointerLeave = (e: any) => {
    e.stopPropagation()
    document.body.style.cursor = 'auto'
    setHovered(false)
    if (onHover) onHover(false, label, description, id)
  }

  return (
    <group 
      position={position}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {/* Invisible larger hitbox for easier hovering */}
      <mesh position={[0, size * 0.75, 0]} visible={false}>
        <boxGeometry args={[size * 3, size * 3, size * 3]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      {/* Main Factory Building */}
      <RoundedBox
        args={[size * 2, size * 1.5, size * 2]}
        radius={size * 0.15}
        smoothness={4}
      >
        <meshPhongMaterial 
          ref={mainMaterialRef}
          color={color} 
          emissive={color}
          emissiveIntensity={1.0}
          shininess={100}
          specular={color}
          opacity={0.7}
          transparent={true}
        />
      </RoundedBox>

      {/* Top Structure */}
      <RoundedBox
        args={[size * 1.5, size * 0.3, size * 1.5]}
        radius={size * 0.1}
        smoothness={4}
        position={[0, size * 1.1, 0]}
      >
        <meshPhongMaterial 
          ref={topMaterialRef}
          color={color} 
          emissive={color}
          emissiveIntensity={1.0}
          shininess={100}
          specular={color}
          opacity={0.7}
          transparent={true}
        />
      </RoundedBox>

      {/* Chimney/Exhaust */}
      <mesh position={[size * 0.6, size * 1.3, size * 0.6]}>
        <cylinderGeometry args={[size * 0.15, size * 0.15, size * 0.5, 8]} />
        <meshPhongMaterial color={color} emissive={color} emissiveIntensity={1.0} shininess={120} specular={color} opacity={0.7} transparent={true} />
      </mesh>

      {/* Windows/Lights - Brighter on hover */}
      {[0, 1, 2].map((i) => (
        <RoundedBox
          key={i}
          args={[size * 0.3, size * 0.2, size * 0.05]}
          radius={size * 0.02}
          smoothness={4}
          position={[size * 0.8, size * 0.3 - i * size * 0.4, size * 1.01]}
        >
          <meshPhongMaterial
            color={color}
            emissive={hovered || isActive ? (i % 2 === 0 ? "#2ECC84" : color) : color}
            emissiveIntensity={1.0}
            shininess={hovered || isActive ? 130 : 100}
            specular={color}
          opacity={0.7}
          transparent={true}
        />
        </RoundedBox>
      ))}

      {/* Ventilation Grilles */}
      {[0, 1].map((i) => (
        <mesh key={`grille-${i}`} position={[size * 0.95, size * 0.1 - i * size * 0.5, 0]}>
          <boxGeometry args={[size * 0.05, size * 0.3, size * 1.5]} />
          <meshPhongMaterial color={color} emissive={color} emissiveIntensity={1.0} shininess={100} specular={color} opacity={0.7} transparent={true} />
        </mesh>
      ))}

      {/* Access Panels */}
      {[0, 1].map((i) => (
        <RoundedBox
          key={`panel-${i}`}
          args={[size * 0.4, size * 0.3, size * 0.02]}
          radius={size * 0.02}
          smoothness={4}
          position={[size * 0.6 * (i === 0 ? 1 : -1), size * 0.2, size * 1.01]}
        >
          <meshPhongMaterial color="#22D0C8" emissive="#22D0C8" emissiveIntensity={1.0} shininess={130} specular="#22D0C8" opacity={0.7} transparent={true} />
        </RoundedBox>
      ))}

      {/* Control Boxes on Sides */}
      {[0, 1].map((i) => (
        <RoundedBox
          key={`control-${i}`}
          args={[size * 0.3, size * 0.5, size * 0.15]}
          radius={size * 0.02}
          smoothness={4}
          position={[size * 1.15 * (i === 0 ? 1 : -1), size * 0.3, 0]}
        >
          <meshPhongMaterial color="#DDE4F0" emissive="#DDE4F0" emissiveIntensity={1.0} shininess={100} specular="#DDE4F0" opacity={0.7} transparent={true} />
        </RoundedBox>
      ))}

      {/* Status Lights on Top */}
      {[0, 1, 2].map((i) => (
        <mesh key={`top-light-${i}`} position={[size * 0.4 * (i - 1), size * 1.25, 0]}>
          <cylinderGeometry args={[size * 0.05, size * 0.05, size * 0.08, 8]} />
          <meshPhongMaterial
            color={isActive ? (i === 1 ? "#2ECC84" : color) : color}
            emissive={isActive ? (i === 1 ? "#2ECC84" : color) : color}
            emissiveIntensity={isActive ? 1.0 : 0.5}
            opacity={0.7}
            transparent={true}
          />
        </mesh>
      ))}


      {/* Label */}
      <Text
        position={[0, -size * 1.2, 0]}
        fontSize={size * 0.3}
        color="#DDE4F0"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#07070E"
      >
        {label}
      </Text>

      {/* Base Platform */}
      <RoundedBox
        args={[size * 2.5, size * 0.1, size * 2.5]}
        radius={size * 0.05}
        smoothness={4}
        position={[0, -size * 0.9, 0]}
      >
        <meshPhongMaterial 
          color="#DDE4F0" 
          emissive="#DDE4F0"
          emissiveIntensity={1.0}
          opacity={0.7}
          transparent={true}
        />
      </RoundedBox>
    </group>
  )
}

// Task Decomposer - Splitting/Distribution Unit
function TaskDecomposerUnit({ position, label, color, isActive = false, size = 1, description, id, onHover }: FactoryUnitProps) {
  const [hovered, setHovered] = useState(false)
  const mainRef = useRef<THREE.MeshPhongMaterial>(null)

  useFrame(() => {
    if (mainRef.current) {
      const targetEmissive = color
      mainRef.current.emissive.lerp(new THREE.Color(targetEmissive), 0.1)
      mainRef.current.emissiveIntensity = 1.0
    }
  })

  const handlePointerEnter = (e: any) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
    setHovered(true)
    if (onHover) onHover(true, label, description, id)
  }

  const handlePointerLeave = (e: any) => {
    e.stopPropagation()
    document.body.style.cursor = 'auto'
    setHovered(false)
    if (onHover) onHover(false, label, description, id)
  }

  return (
    <group 
      position={position}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <mesh position={[0, 0, 0]} visible={false}>
        <boxGeometry args={[size * 3, size * 3, size * 3]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Main Distribution Chamber */}
      <RoundedBox
        args={[size * 1.8, size * 1.4, size * 1.8]}
        radius={size * 0.12}
        smoothness={4}
      >
        <meshPhongMaterial 
          ref={mainRef}
          color={color} 
          emissive={color}
          emissiveIntensity={1.0}
          shininess={100}
          specular={color}
          opacity={0.7}
          transparent={true}
        />
      </RoundedBox>

      {/* Input Port */}
      <mesh position={[0, size * 0.5, -size * 1.0]}>
        <cylinderGeometry args={[size * 0.2, size * 0.2, size * 0.3, 16]} />
          <meshPhongMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={1.0}
          shininess={120}
          specular={color}
          opacity={0.7}
          transparent={true}
        />
      </mesh>

      {/* Output Ports (3 for parallel distribution) */}
      {[0, 1, 2].map((i) => {
        const angle = (i - 1) * 0.6
        return (
          <mesh key={i} position={[Math.sin(angle) * size * 0.8, -size * 0.3, Math.cos(angle) * size * 0.8]}>
            <cylinderGeometry args={[size * 0.15, size * 0.15, size * 0.25, 12]} />
            <meshPhongMaterial 
              color={i % 2 === 0 ? "#2ECC84" : color} 
              emissive={i % 2 === 0 ? "#2ECC84" : color}
              emissiveIntensity={1.0}
              shininess={120}
              specular={i % 2 === 0 ? "#2ECC84" : color}
              opacity={0.7}
              transparent={true}
            />
          </mesh>
        )
      })}

      {/* Internal Divider/Blades */}
      {[0, 1].map((i) => (
        <mesh key={i} position={[0, size * 0.1 - i * size * 0.4, 0]} rotation={[0, i * Math.PI / 3, 0]}>
          <boxGeometry args={[size * 1.6, size * 0.05, size * 0.3]} />
          <meshPhongMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={1.0}
          shininess={120}
          specular={color}
          opacity={0.7}
          transparent={true}
        />
        </mesh>
      ))}

      {/* Status Indicator */}
      <mesh position={[size * 0.7, size * 0.8, size * 0.7]}>
        <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.03, 8]} />
        <meshPhongMaterial
          color={isActive ? "#2ECC84" : color}
          emissive={isActive ? "#2ECC84" : color}
          emissiveIntensity={1.0}
          shininess={120}
          specular={isActive ? "#2ECC84" : color}
          opacity={0.7}
          transparent={true}
        />
      </mesh>

      {/* Flow Meters on Output Ports */}
      {[0, 1, 2].map((i) => {
        const angle = (i - 1) * 0.6
        return (
          <mesh key={`meter-${i}`} position={[Math.sin(angle) * size * 0.8, -size * 0.25, Math.cos(angle) * size * 0.8]}>
            <cylinderGeometry args={[size * 0.08, size * 0.08, size * 0.05, 12]} />
            <meshPhongMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1.0}
              shininess={120}
              specular={color}
          opacity={0.7}
          transparent={true}
        />
          </mesh>
        )
      })}

      {/* Internal Processing Blades (more detailed) */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={`blade-${i}`} position={[0, size * 0.1 - i * size * 0.25, 0]} rotation={[0, i * Math.PI / 4, 0]}>
          <boxGeometry args={[size * 1.4, size * 0.04, size * 0.25]} />
          <meshPhongMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.0}
            shininess={120}
            specular={color}
          opacity={0.7}
          transparent={true}
        />
        </mesh>
      ))}

      {/* Control Panel on Side */}
      <RoundedBox
        args={[size * 0.4, size * 0.6, size * 0.08]}
        radius={size * 0.02}
        smoothness={4}
        position={[size * 1.0, size * 0.2, 0]}
      >
        <meshPhongMaterial color="#DDE4F0" emissive="#DDE4F0" emissiveIntensity={1.0} shininess={100} specular="#DDE4F0" opacity={0.7} transparent={true} />
      </RoundedBox>

      {/* Pressure Relief Valves */}
      {[0, 1].map((i) => (
        <mesh key={`valve-${i}`} position={[size * 0.5 * (i === 0 ? 1 : -1), size * 0.7, size * 0.9]}>
          <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.1, 8]} />
          <meshPhongMaterial
            color="#3EA6E0"
            emissive="#3EA6E0"
            emissiveIntensity={1.0}
          opacity={0.7}
          transparent={true}
        />
        </mesh>
      ))}

      <Text position={[0, -size * 1.2, 0]} fontSize={size * 0.3} color="#DDE4F0" anchorX="center" anchorY="middle" outlineWidth={0.05} outlineColor="#07070E">
        {label}
      </Text>

      <RoundedBox args={[size * 2.5, size * 0.1, size * 2.5]} radius={size * 0.05} smoothness={4} position={[0, -size * 0.9, 0]}>
        <meshPhongMaterial color="#DDE4F0" emissive="#DDE4F0" emissiveIntensity={1.0} shininess={100} specular="#DDE4F0" opacity={0.7} transparent={true} />
      </RoundedBox>
    </group>
  )
}

// Parallel Agent - Processing Workstation
function ParallelAgentUnit({ position, label, color, isActive = false, size = 1, description, id, onHover }: FactoryUnitProps) {
  const [hovered, setHovered] = useState(false)
  const workRef = useRef<THREE.MeshPhongMaterial>(null)

  useFrame(() => {
    if (workRef.current) {
      const targetEmissive = color
      workRef.current.emissive.lerp(new THREE.Color(targetEmissive), 0.1)
      workRef.current.emissiveIntensity = 1.0
    }
  })

  const handlePointerEnter = (e: any) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
    setHovered(true)
    if (onHover) onHover(true, label, description, id)
  }

  const handlePointerLeave = (e: any) => {
    e.stopPropagation()
    document.body.style.cursor = 'auto'
    setHovered(false)
    if (onHover) onHover(false, label, description, id)
  }

  return (
    <group 
      position={position}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <mesh position={[0, 0, 0]} visible={false}>
        <boxGeometry args={[size * 3, size * 3, size * 3]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Workstation Base */}
      <RoundedBox args={[size * 1.6, size * 1.2, size * 1.6]} radius={size * 0.1} smoothness={4}>
        <meshPhongMaterial 
          ref={workRef}
          color={color} 
          emissive={color}
          emissiveIntensity={1.0}
          shininess={100}
          specular={color}
          opacity={0.7}
          transparent={true}
        />
      </RoundedBox>

      {/* Processing Chamber */}
      <RoundedBox args={[size * 1.2, size * 0.8, size * 1.2]} radius={size * 0.08} smoothness={4} position={[0, size * 0.6, 0]}>
          <meshPhongMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={1.0}
          shininess={120}
          specular={color}
          opacity={0.7}
          transparent={true}
        />
      </RoundedBox>

      {/* Input/Output Ports */}
      <mesh position={[-size * 0.8, size * 0.2, 0]}>
        <cylinderGeometry args={[size * 0.12, size * 0.12, size * 0.2, 12]} />
        <meshPhongMaterial color={color} emissive={color} emissiveIntensity={1.0} shininess={120} specular={color} opacity={0.7} transparent={true} />
      </mesh>
      <mesh position={[size * 0.8, size * 0.2, 0]}>
        <cylinderGeometry args={[size * 0.12, size * 0.12, size * 0.2, 12]} />
        <meshPhongMaterial color="#2ECC84" emissive="#2ECC84" emissiveIntensity={1.0}  opacity={0.7} transparent={true} />
      </mesh>

      {/* Activity Indicator */}
      <mesh position={[0, size * 1.1, 0]}>
        <cylinderGeometry args={[size * 0.08, size * 0.08, size * 0.15, 8]} />
        <meshPhongMaterial
          color={isActive ? "#2ECC84" : "#DDE4F0"}
          emissive={isActive ? "#2ECC84" : "#DDE4F0"}
          emissiveIntensity={1.0}
          shininess={120}
          specular={isActive ? "#2ECC84" : "#DDE4F0"}
          opacity={0.7}
          transparent={true}
        />
      </mesh>

      {/* Work Lights */}
      {[0, 1].map((i) => (
        <mesh key={`light-${i}`} position={[size * 0.7 * (i === 0 ? 1 : -1), size * 1.0, size * 0.7 * (i === 0 ? 1 : -1)]}>
          <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.08, 8]} />
          <meshPhongMaterial
            color={isActive ? "#3EA6E0" : color}
            emissive={isActive ? "#3EA6E0" : "#DDE4F0"}
            emissiveIntensity={isActive ? 1.2 : 0.5}
          opacity={0.7}
          transparent={true}
        />
        </mesh>
      ))}

      {/* Processing Status Display */}
      <RoundedBox
        args={[size * 0.5, size * 0.3, size * 0.05]}
        radius={size * 0.02}
        smoothness={4}
        position={[0, size * 0.9, size * 0.85]}
      >
        <meshPhongMaterial
          color={color}
          emissive={isActive ? color : "#DDE4F0"}
          emissiveIntensity={isActive ? 1.0 : 0.5}
          opacity={0.7}
          transparent={true}
        />
      </RoundedBox>

      {/* Cooling Vents */}
      {Array.from({ length: 3 }).map((_, i) => (
        <mesh key={`vent-${i}`} position={[size * 0.85, size * 0.1 - i * size * 0.2, 0]}>
          <boxGeometry args={[size * 0.04, size * 0.15, size * 0.8]} />
          <meshPhongMaterial color="#DDE4F0" emissive="#DDE4F0" emissiveIntensity={1.0} shininess={100} specular="#DDE4F0" opacity={0.7} transparent={true} />
        </mesh>
      ))}

      {/* Tool Holders */}
      {[0, 1].map((i) => (
        <mesh key={`tool-${i}`} position={[size * 0.6 * (i === 0 ? 1 : -1), size * 0.4, size * 0.85]}>
          <boxGeometry args={[size * 0.1, size * 0.2, size * 0.1]} />
          <meshPhongMaterial color="#22D0C8" emissive="#22D0C8" emissiveIntensity={1.0} shininess={130} specular="#22D0C8" opacity={0.7} transparent={true} />
        </mesh>
      ))}

      <Text position={[0, -size * 1.2, 0]} fontSize={size * 0.3} color="#DDE4F0" anchorX="center" anchorY="middle" outlineWidth={0.05} outlineColor="#07070E">
        {label}
      </Text>

      <RoundedBox args={[size * 2.2, size * 0.1, size * 2.2]} radius={size * 0.05} smoothness={4} position={[0, -size * 0.9, 0]}>
        <meshPhongMaterial color="#DDE4F0" emissive="#DDE4F0" emissiveIntensity={1.0} shininess={100} specular="#DDE4F0" opacity={0.7} transparent={true} />
      </RoundedBox>
    </group>
  )
}

// Aggregator - Collection/Mixing Vessel
function AggregatorUnit({ position, label, color, isActive = false, size = 1, description, id, onHover }: FactoryUnitProps) {
  const [hovered, setHovered] = useState(false)
  const vesselRef = useRef<THREE.MeshPhongMaterial>(null)

  useFrame(() => {
    if (vesselRef.current) {
      const targetEmissive = color
      const targetIntensity = hovered ? 0.8 : 0.6
      vesselRef.current.emissive.lerp(new THREE.Color(targetEmissive), 0.1)
      vesselRef.current.emissiveIntensity = vesselRef.current.emissiveIntensity + (targetIntensity - vesselRef.current.emissiveIntensity) * 0.1
    }
  })

  const handlePointerEnter = (e: any) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
    setHovered(true)
    if (onHover) onHover(true, label, description, id)
  }

  const handlePointerLeave = (e: any) => {
    e.stopPropagation()
    document.body.style.cursor = 'auto'
    setHovered(false)
    if (onHover) onHover(false, label, description, id)
  }

  return (
    <group 
      position={position}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <mesh position={[0, 0, 0]} visible={false}>
        <boxGeometry args={[size * 3, size * 3, size * 3]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Main Mixing Vessel */}
      <mesh position={[0, size * 0.3, 0]}>
        <cylinderGeometry args={[size * 0.7, size * 0.7, size * 1.2, 16]} />
        <meshPhongMaterial 
          ref={vesselRef}
          color={color} 
          emissive={color}
          emissiveIntensity={1.0}
          shininess={100}
          specular={color}
          opacity={0.7}
          transparent={true}
        />
      </mesh>

      {/* Vessel Top */}
      <mesh position={[0, size * 0.9, 0]}>
        <cylinderGeometry args={[size * 0.72, size * 0.72, size * 0.1, 16]} />
        <meshPhongMaterial color={color} emissive={color} emissiveIntensity={1.0} shininess={120} specular={color} opacity={0.7} transparent={true} />
      </mesh>

      {/* Input Ports (3 for parallel inputs) */}
      {[0, 1, 2].map((i) => {
        const angle = (i - 1) * 0.7
        return (
          <mesh key={i} position={[Math.sin(angle) * size * 0.6, size * 0.5, Math.cos(angle) * size * 0.6]}>
            <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.2, 12]} />
            <meshPhongMaterial 
              color={i % 2 === 0 ? "#2ECC84" : color} 
              emissive={i % 2 === 0 ? "#2ECC84" : color}
              emissiveIntensity={1.0}
              shininess={120}
              specular={i % 2 === 0 ? "#2ECC84" : color}
              opacity={0.7}
              transparent={true}
            />
          </mesh>
        )
      })}

      {/* Output Port */}
      <mesh position={[0, -size * 0.3, 0]}>
        <cylinderGeometry args={[size * 0.15, size * 0.15, size * 0.3, 12]} />
        <meshPhongMaterial color={color} emissive={color} emissiveIntensity={1.0} shininess={120} specular={color} opacity={0.7} transparent={true} />
      </mesh>

      {/* Mixing Blades */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, size * 0.3, 0]} rotation={[0, i * Math.PI / 3, 0]}>
          <boxGeometry args={[size * 0.5, size * 0.05, size * 0.1]} />
          <meshPhongMaterial color={color} emissive={color} emissiveIntensity={1.0} shininess={120} specular={color} opacity={0.7} transparent={true} />
        </mesh>
      ))}

      {/* Level Indicator */}
      <mesh position={[size * 0.75, size * 0.3, 0]}>
        <boxGeometry args={[size * 0.05, size * 1.0, size * 0.05]} />
        <meshPhongMaterial color="#DDE4F0" emissive="#DDE4F0" emissiveIntensity={1.0} shininess={100} specular="#DDE4F0" opacity={0.7} transparent={true} />
      </mesh>
      {/* Level Markers */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={`marker-${i}`} position={[size * 0.75, size * 0.3 - i * size * 0.25, 0]}>
          <boxGeometry args={[size * 0.08, size * 0.02, size * 0.05]} />
          <meshPhongMaterial
            color={hovered ? color : "#DDE4F0"}
            emissive={hovered ? color : "#DDE4F0"}
            emissiveIntensity={1.0}
            opacity={0.7}
            transparent={true}
          />
        </mesh>
      ))}

      {/* Pressure Gauge */}
      <mesh position={[-size * 0.75, size * 0.6, 0]}>
        <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.04, 16]} />
        <meshPhongMaterial color="#DDE4F0" emissive={hovered ? color : "#DDE4F0"} emissiveIntensity={hovered ? 0.7 : 0.5}  opacity={0.7} transparent={true} />
      </mesh>

      {/* Mixing Motor Housing */}
      <mesh position={[0, size * 1.0, 0]}>
        <cylinderGeometry args={[size * 0.15, size * 0.15, size * 0.2, 12]} />
        <meshPhongMaterial color="#22D0C8" emissive="#22D0C8" emissiveIntensity={1.0}  opacity={0.7} transparent={true} />
      </mesh>

      {/* Additional Input Valves */}
      {[0, 1, 2].map((i) => {
        const angle = (i - 1) * 0.7
        return (
          <group key={`valve-${i}`} position={[Math.sin(angle) * size * 0.6, size * 0.45, Math.cos(angle) * size * 0.6]}>
            <mesh>
              <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.08, 8]} />
              <meshPhongMaterial color="#3EA6E0" emissive="#3EA6E0" emissiveIntensity={1.0} shininess={130} specular="#3EA6E0" opacity={0.7} transparent={true} />
            </mesh>
            <mesh position={[0, size * 0.04, 0]}>
              <boxGeometry args={[size * 0.12, size * 0.02, size * 0.02]} />
              <meshPhongMaterial color="#22D0C8" emissive="#22D0C8" emissiveIntensity={1.0} shininess={130} specular="#22D0C8" opacity={0.7} transparent={true} />
            </mesh>
          </group>
        )
      })}

      <Text position={[0, -size * 1.2, 0]} fontSize={size * 0.3} color="#DDE4F0" anchorX="center" anchorY="middle" outlineWidth={0.05} outlineColor="#07070E">
        {label}
      </Text>

      <RoundedBox args={[size * 2.2, size * 0.1, size * 2.2]} radius={size * 0.05} smoothness={4} position={[0, -size * 0.9, 0]}>
        <meshPhongMaterial color="#DDE4F0" emissive="#DDE4F0" emissiveIntensity={1.0} shininess={100} specular="#DDE4F0" opacity={0.7} transparent={true} />
      </RoundedBox>
    </group>
  )
}

// Supervisor - Quality Control Station
function SupervisorUnit({ position, label, color, isActive = false, size = 1, description, id, onHover }: FactoryUnitProps) {
  const [hovered, setHovered] = useState(false)
  const stationRef = useRef<THREE.MeshPhongMaterial>(null)
  const screenRef = useRef<THREE.MeshPhongMaterial>(null)

  useFrame(() => {
    if (stationRef.current && screenRef.current) {
      const targetEmissive = color
      stationRef.current.emissive.lerp(new THREE.Color(targetEmissive), 0.1)
      stationRef.current.emissiveIntensity = 1.0
      screenRef.current.emissiveIntensity = 1.0
    }
  })

  const handlePointerEnter = (e: any) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
    setHovered(true)
    if (onHover) onHover(true, label, description, id)
  }

  const handlePointerLeave = (e: any) => {
    e.stopPropagation()
    document.body.style.cursor = 'auto'
    setHovered(false)
    if (onHover) onHover(false, label, description, id)
  }

  return (
    <group 
      position={position}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <mesh position={[0, 0, 0]} visible={false}>
        <boxGeometry args={[size * 3, size * 3, size * 3]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Quality Control Station Base */}
      <RoundedBox args={[size * 2, size * 1.6, size * 1.4]} radius={size * 0.1} smoothness={4}>
        <meshPhongMaterial 
          ref={stationRef}
          color={color} 
          emissive={color}
          emissiveIntensity={1.0}
          shininess={100}
          specular={color}
          opacity={0.7}
          transparent={true}
        />
      </RoundedBox>

      {/* Quality Check Display */}
      <RoundedBox args={[size * 1.4, size * 0.9, size * 0.08]} radius={size * 0.04} smoothness={4} position={[0, size * 0.5, size * 0.76]}>
        <meshPhongMaterial 
          ref={screenRef}
          color={color} 
          emissive={color}
          emissiveIntensity={1.0}
          shininess={150}
          specular={color}
          opacity={0.7}
          transparent={true}
        />
      </RoundedBox>

      {/* Validation Indicators */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[size * 0.6 - i * size * 0.4, size * 0.2, size * 0.76]}>
          <cylinderGeometry args={[size * 0.05, size * 0.05, size * 0.03, 8]} />
          <meshPhongMaterial
            color={isActive ? (i === 1 ? "#2ECC84" : color) : color}
            emissive={isActive ? (i === 1 ? "#2ECC84" : color) : color}
            emissiveIntensity={1.0}
          />
        </mesh>
      ))}

      {/* Input Port */}
      <mesh position={[0, -size * 0.4, -size * 0.8]}>
        <cylinderGeometry args={[size * 0.18, size * 0.18, size * 0.3, 12]} />
        <meshPhongMaterial color={color} emissive={color} emissiveIntensity={1.0} shininess={120} specular={color} opacity={0.7} transparent={true} />
      </mesh>

      {/* Output Port */}
      <mesh position={[0, -size * 0.4, size * 0.8]}>
        <cylinderGeometry args={[size * 0.18, size * 0.18, size * 0.3, 12]} />
        <meshPhongMaterial color="#2ECC84" emissive="#2ECC84" emissiveIntensity={1.0}  opacity={0.7} transparent={true} />
      </mesh>

      {/* Approval Stamp/Seal */}
      <mesh position={[0, size * 0.9, size * 0.76]}>
        <cylinderGeometry args={[size * 0.2, size * 0.2, size * 0.05, 16]} />
        <meshPhongMaterial color="#2ECC84" emissive="#2ECC84" emissiveIntensity={isActive ? 0.9 : 0.6}  opacity={0.7} transparent={true} />
      </mesh>

      {/* Inspection Cameras */}
      {[0, 1].map((i) => (
        <mesh key={`camera-${i}`} position={[size * 0.7 * (i === 0 ? 1 : -1), size * 0.7, size * 0.76]}>
          <boxGeometry args={[size * 0.12, size * 0.08, size * 0.06]} />
          <meshPhongMaterial
            color={isActive ? "#22D0C8" : color}
            emissive={isActive ? "#22D0C8" : "#DDE4F0"}
            emissiveIntensity={isActive ? 0.9 : 0.5}
          opacity={0.7}
          transparent={true}
        />
        </mesh>
      ))}

      {/* Quality Metrics Display */}
      {[0, 1, 2].map((i) => (
        <RoundedBox
          key={`metric-${i}`}
          args={[size * 0.25, size * 0.15, size * 0.04]}
          radius={size * 0.01}
          smoothness={4}
          position={[size * 0.5 - i * size * 0.4, size * 0.1, size * 0.76]}
        >
          <meshPhongMaterial
            color={isActive ? (i === 1 ? "#2ECC84" : color) : color}
            emissive={isActive ? (i === 1 ? "#2ECC84" : color) : color}
            emissiveIntensity={isActive ? 0.8 : 0.4}
          opacity={0.7}
          transparent={true}
        />
        </RoundedBox>
      ))}

      {/* Testing Equipment */}
      <mesh position={[0, size * 0.3, size * 0.76]}>
        <boxGeometry args={[size * 0.3, size * 0.2, size * 0.05]} />
        <meshPhongMaterial
          color={isActive ? "#3EA6E0" : "#DDE4F0"}
          emissive={isActive ? "#3EA6E0" : "#DDE4F0"}
          emissiveIntensity={isActive ? 0.9 : 0.5}
          opacity={0.7}
          transparent={true}
        />
      </mesh>

      {/* Rejection/Approval Indicators */}
      {[0, 1].map((i) => (
        <mesh key={`indicator-${i}`} position={[size * 0.4 * (i === 0 ? 1 : -1), size * 1.2, 0]}>
          <cylinderGeometry args={[size * 0.08, size * 0.08, size * 0.1, 8]} />
          <meshPhongMaterial
            color={isActive ? (i === 0 ? "#2ECC84" : "#9B72E8") : color}
            emissive={isActive ? (i === 0 ? "#2ECC84" : "#9B72E8") : "#DDE4F0"}
            emissiveIntensity={1.0}
          opacity={0.7}
          transparent={true}
        />
        </mesh>
      ))}

      {/* Data Logging Ports */}
      {[0, 1].map((i) => (
        <mesh key={`port-${i}`} position={[size * 0.9, size * 0.1 - i * size * 0.3, 0]}>
          <boxGeometry args={[size * 0.1, size * 0.06, size * 0.08]} />
          <meshPhongMaterial color="#22D0C8" emissive="#22D0C8" emissiveIntensity={1.0} shininess={130} specular="#22D0C8" opacity={0.7} transparent={true} />
        </mesh>
      ))}

      <Text position={[0, -size * 1.2, 0]} fontSize={size * 0.3} color="#DDE4F0" anchorX="center" anchorY="middle" outlineWidth={0.05} outlineColor="#07070E">
        {label}
      </Text>

      <RoundedBox args={[size * 2.5, size * 0.1, size * 2.5]} radius={size * 0.05} smoothness={4} position={[0, -size * 0.9, 0]}>
        <meshPhongMaterial color="#DDE4F0" emissive="#DDE4F0" emissiveIntensity={1.0} shininess={100} specular="#DDE4F0" opacity={0.7} transparent={true} />
      </RoundedBox>
    </group>
  )
}

// Conveyor System Component
interface ConveyorSystemProps {
  start: [number, number, number]
  end: [number, number, number]
  color: string
  isActive?: boolean
  isHovered?: boolean
}

function ConveyorSystem({ start, end, color, isActive = false, isHovered = false }: ConveyorSystemProps) {
  const beltRef = useRef<THREE.Group>(null)
  
  // Calculate conveyor position - align at unit base height
  const baseHeight = Math.min(start[1], end[1]) - 0.3
  const midpoint: [number, number, number] = [
    (start[0] + end[0]) / 2,
    baseHeight,
    (start[2] + end[2]) / 2,
  ]
  
  const distance = Math.sqrt(
    Math.pow(end[0] - start[0], 2) +
    Math.pow(end[1] - start[1], 2) +
    Math.pow(end[2] - start[2], 2)
  )
  
  // Calculate direction vector (horizontal projection for conveyor alignment)
  const direction = new THREE.Vector3(
    end[0] - start[0],
    0, // Keep conveyor horizontal
    end[2] - start[2]
  ).normalize()
  
  // Calculate angle for rotation around Y axis
  const angle = Math.atan2(direction.x, direction.z)
  
  // Create rotation quaternion
  const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle)

  // Animate belt movement (visual texture offset for belt pattern)
  useFrame((state) => {
    // Belt movement is handled by items flowing, belt itself is static
  })

  const rollerCount = Math.max(3, Math.floor(distance / 0.8))

  return (
    <group position={midpoint} quaternion={quaternion}>
      {/* Conveyor Frame/Base */}
      <mesh position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.4, distance, 0.08]} />
        <meshPhongMaterial color="#DDE4F0" emissive="#DDE4F0" emissiveIntensity={1.0} shininess={100} specular="#DDE4F0" opacity={0.7} transparent={true} />
      </mesh>

      {/* Conveyor Rollers */}
      {Array.from({ length: rollerCount }).map((_, i) => {
        const zPos = (i / (rollerCount - 1) - 0.5) * distance
        return (
          <mesh key={`roller-${i}`} position={[0, 0, zPos]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.4, 8]} />
            <meshPhongMaterial color="#DDE4F0" emissive="#DDE4F0" emissiveIntensity={1.0} shininess={100} specular="#DDE4F0" opacity={0.7} transparent={true} />
          </mesh>
        )
      })}

      {/* Conveyor Belt */}
      <group ref={beltRef}>
        <mesh 
          position={[0, 0.02, 0]} 
          rotation={[Math.PI / 2, 0, 0]}
          userData={{ isBelt: true }}
        >
          <boxGeometry args={[0.35, distance, 0.04]} />
          <meshPhongMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.0}
            shininess={100}
            specular={color}
          opacity={0.7}
          transparent={true}
        />
        </mesh>
      </group>

      {/* Mail and Pie Charts on Conveyor */}
      {(isActive || isHovered) && (
        <>
          {Array.from({ length: 3 }).map((_, i) => (
            <FlowingMail
              key={`mail-${i}`}
              distance={distance}
              color={color}
              delay={i * 0.6}
              speed={0.6}
            />
          ))}
          {Array.from({ length: 2 }).map((_, i) => (
            <FlowingPieChart
              key={`pie-${i}`}
              distance={distance}
              color={color}
              delay={i * 1.2}
              speed={0.5}
            />
          ))}
        </>
      )}

      {/* Conveyor End Rollers (larger) */}
      <mesh position={[0, 0, -distance / 2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.4, 12]} />
        <meshPhongMaterial color={color} emissive={color} emissiveIntensity={1.0} shininess={120} specular={color} opacity={0.7} transparent={true} />
      </mesh>
      <mesh position={[0, 0, distance / 2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.4, 12]} />
        <meshPhongMaterial color={color} emissive={color} emissiveIntensity={1.0} shininess={120} specular={color} opacity={0.7} transparent={true} />
      </mesh>
    </group>
  )
}


// Create gradient texture for toon shading
function createGradientTexture() {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  
  if (context) {
    const gradient = context.createLinearGradient(0, 0, size, size)
    gradient.addColorStop(0, '#DDE4F0')
    gradient.addColorStop(0.5, '#808080')
    gradient.addColorStop(1, '#000000')
    context.fillStyle = gradient
    context.fillRect(0, 0, size, size)
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

// Camera Controller for initial isometric view
function InitialCamera() {
  const { camera } = useThree()
  
  useEffect(() => {
    // Set initial isometric top-right view - user can then rotate
    camera.position.set(15, 18, 15)
    camera.lookAt(-6, 0, -3) // Look at center of scene where components are
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 45
      camera.updateProjectionMatrix()
    }
  }, [camera])
  
  return null
}

// Main Factory Scene
function FactoryScene({ onHover, hoveredUnitId }: { onHover?: (hovered: boolean, label: string, description?: string) => void, hoveredUnitId?: string }) {
  // Define factory unit positions - arranged for top-right isometric view
  const units = useMemo(() => [
    {
      id: "master",
      position: [-6, 0, 6] as [number, number, number],
      label: "Master Agent",
      color: "#F4A429", // Amber
      size: 1.2,
      description: "Initial task processing and analysis. Receives incoming tasks and determines execution strategy.",
    },
    {
      id: "decomposer",
      position: [-6, 0, 0] as [number, number, number],
      label: "Task Decomposer",
      color: "#3EA6E0", // Sky
      size: 1.1,
      description: "Breaks down complex tasks into smaller, independent subtasks that can be executed in parallel.",
    },
    {
      id: "parallel1",
      position: [-8, 0, -4] as [number, number, number],
      label: "Parallel Agent 1",
      color: "#2ECC84", // Bright Green
      size: 0.9,
      description: "Executes assigned subtasks concurrently with other parallel agents for maximum efficiency.",
    },
    {
      id: "parallel2",
      position: [-6, 0, -4] as [number, number, number],
      label: "Parallel Agent 2",
      color: "#2ECC84", // Bright Green
      size: 0.9,
      description: "Executes assigned subtasks concurrently with other parallel agents for maximum efficiency.",
    },
    {
      id: "parallel3",
      position: [-4, 0, -4] as [number, number, number],
      label: "Parallel Agent 3",
      color: "#2ECC84", // Bright Green
      size: 0.9,
      description: "Executes assigned subtasks concurrently with other parallel agents for maximum efficiency.",
    },
    {
      id: "aggregator",
      position: [-6, 0, -8] as [number, number, number],
      label: "Aggregator",
      color: "#9B72E8", // Violet
      size: 1.1,
      description: "Collects and merges results from all parallel agents into a cohesive response.",
    },
    {
      id: "supervisor",
      position: [-6, 0, -12] as [number, number, number],
      label: "Supervisor",
      color: "#22D0C8", // Cyan
      size: 1.2,
      description: "Final validation and quality control. Ensures the aggregated result meets all requirements.",
    },
  ], [])

  // Define conveyor connections
  const connections = useMemo(() => [
    {
      from: "master",
      to: "decomposer",
      color: "#F4A429",
    },
    {
      from: "decomposer",
      to: "parallel1",
      color: "#3EA6E0",
    },
    {
      from: "decomposer",
      to: "parallel2",
      color: "#3EA6E0",
    },
    {
      from: "decomposer",
      to: "parallel3",
      color: "#3EA6E0",
    },
    {
      from: "parallel1",
      to: "aggregator",
      color: "#2ECC84",
    },
    {
      from: "parallel2",
      to: "aggregator",
      color: "#2ECC84",
    },
    {
      from: "parallel3",
      to: "aggregator",
      color: "#2ECC84",
    },
    {
      from: "aggregator",
      to: "supervisor",
      color: "#9B72E8",
    },
  ], [])

  const getUnitPosition = (id: string): [number, number, number] => {
    const unit = units.find((u) => u.id === id)
    return unit?.position || [0, 0, 0]
  }

  return (
    <>
      {/* Multi-angle Phong lighting setup for proper component illumination */}
      <ambientLight intensity={0.6} />
      
      {/* Top lighting */}
      <pointLight position={[0, 20, 0]} intensity={1.2} color="#DDE4F0" />
      <directionalLight position={[0, 15, 0]} intensity={0.8} color="#DDE4F0" />
      
      {/* Front lighting */}
      <pointLight position={[0, 5, 15]} intensity={1.0} color="#DDE4F0" />
      <directionalLight position={[0, 5, 10]} intensity={0.6} color="#DDE4F0" />
      
      {/* Back lighting */}
      <pointLight position={[0, 5, -15]} intensity={0.8} color="#DDE4F0" />
      <directionalLight position={[0, 5, -10]} intensity={0.5} color="#DDE4F0" />
      
      {/* Left side lighting */}
      <pointLight position={[-15, 8, 0]} intensity={0.9} color="#DDE4F0" />
      <directionalLight position={[-10, 8, 0]} intensity={0.6} color="#DDE4F0" />
      
      {/* Right side lighting */}
      <pointLight position={[15, 8, 0]} intensity={0.9} color="#DDE4F0" />
      <directionalLight position={[10, 8, 0]} intensity={0.6} color="#DDE4F0" />
      
      {/* Accent colored lights for depth */}
      <pointLight position={[10, 10, 10]} intensity={0.4} color="#F4A429" />
      <pointLight position={[-10, 10, -10]} intensity={0.4} color="#22D0C8" />
      <pointLight position={[0, 12, -8]} intensity={0.3} color="#2ECC84" />

      {/* Factory Units */}
      {units.map((unit) => {
        // Use appropriate component for each unit type
        if (unit.id === "master") {
          return (
            <IndustrialControlPanel
              key={unit.id}
              id={unit.id}
              position={unit.position}
              label={unit.label}
              color={unit.color}
              isActive={true}
              size={unit.size}
              description={unit.description}
              onHover={onHover}
            />
          )
        } else if (unit.id === "decomposer") {
          return (
            <TaskDecomposerUnit
              key={unit.id}
              id={unit.id}
              position={unit.position}
              label={unit.label}
              color={unit.color}
              isActive={true}
              size={unit.size}
              description={unit.description}
              onHover={onHover}
            />
          )
        } else if (unit.id.startsWith("parallel")) {
          return (
            <ParallelAgentUnit
              key={unit.id}
              id={unit.id}
              position={unit.position}
              label={unit.label}
              color={unit.color}
              isActive={true}
              size={unit.size}
              description={unit.description}
              onHover={onHover}
            />
          )
        } else if (unit.id === "aggregator") {
          return (
            <AggregatorUnit
              key={unit.id}
              id={unit.id}
              position={unit.position}
              label={unit.label}
              color={unit.color}
              isActive={true}
              size={unit.size}
              description={unit.description}
              onHover={onHover}
            />
          )
        } else if (unit.id === "supervisor") {
          return (
            <SupervisorUnit
              key={unit.id}
              id={unit.id}
              position={unit.position}
              label={unit.label}
              color={unit.color}
              isActive={true}
              size={unit.size}
              description={unit.description}
              onHover={onHover}
            />
          )
        }
        return (
          <FactoryUnit
            key={unit.id}
            id={unit.id}
            position={unit.position}
            label={unit.label}
            color={unit.color}
            isActive={true}
            size={unit.size}
            description={unit.description}
            onHover={onHover}
          />
        )
      })}

      {/* Conveyor Systems */}
      {connections.map((conn, idx) => {
        // Activate conveyor if source or target is hovered
        const isHovered = hoveredUnitId === conn.from || hoveredUnitId === conn.to
        return (
          <ConveyorSystem
            key={`${conn.from}-${conn.to}-${idx}`}
            start={getUnitPosition(conn.from)}
            end={getUnitPosition(conn.to)}
            color={conn.color}
            isActive={true}
            isHovered={isHovered}
          />
        )
      })}
    </>
  )
}

// Main Component
export function FactoryVisualization() {
  const [hoveredInfo, setHoveredInfo] = useState<{ label: string; description: string } | null>(null)
  const [hoveredUnitId, setHoveredUnitId] = useState<string | undefined>(undefined)

  const handleHover = (hovered: boolean, label: string, description?: string, id?: string) => {
    if (hovered && description) {
      setHoveredInfo({ label, description })
      setHoveredUnitId(id)
    } else {
      setHoveredInfo(null)
      setHoveredUnitId(undefined)
    }
  }

  return (
    <div className="w-full h-[800px] rounded-lg overflow-hidden relative">
      <Canvas 
        camera={{ position: [15, 18, 15], fov: 45 }} 
        gl={{ 
          alpha: true,
          antialias: true,
          preserveDrawingBuffer: true
        }}
      >
        <color attach="background" args={['transparent']} />
        <InitialCamera />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={8}
          maxDistance={40}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.8}
          target={[-6, 0, -3]}
        />
        <FactoryScene onHover={handleHover} hoveredUnitId={hoveredUnitId} />
      </Canvas>
      
      {/* Info Overlay */}
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm text-card-foreground p-4 rounded-lg max-w-sm border border-border">
        <h3 className="text-lg font-bold mb-2">Agent Factory Flow</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Hover over components to see details. Rotate, zoom, and pan to explore.
        </p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#F4A429" }}></div>
            <span>Master Agent - Initial task processing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#3EA6E0" }}></div>
            <span>Task Decomposer - Breaks down tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#2ECC84" }}></div>
            <span>Parallel Agents - Concurrent execution</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#9B72E8" }}></div>
            <span>Aggregator - Merges results</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#22D0C8" }}></div>
            <span>Supervisor - Final validation</span>
          </div>
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredInfo && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-card/95 backdrop-blur-md text-card-foreground p-4 rounded-lg max-w-md border border-border shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 z-50">
          <h4 className="text-lg font-bold mb-2 text-center">{hoveredInfo.label}</h4>
          <p className="text-sm text-muted-foreground text-center">{hoveredInfo.description}</p>
        </div>
      )}
    </div>
  )
}
